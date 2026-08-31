import { apiInitializer } from "discourse/lib/api";
import getURL from "discourse/lib/get-url";
import { setBoundedMap } from "../lib/crimson/cache";
import { createFeaturedTopicsController } from "../lib/crimson/featured-topics";
import {
  getBooleanSetting,
  getNumberSetting,
  getSetting,
  normalizeSameOriginUrl,
} from "../lib/crimson/settings";

const HIDDEN_ROUTE_PATTERN =
  /^\/(admin|wizard|login|signup|session|password-reset)(\/|$)/;

const LINK_SETTINGS = {
  home: ["home_url", "/"],
  categories: ["categories_url", "/categories"],
  latest: ["latest_url", "/latest"],
  servers: ["servers_url", "/servers"],
  chat: ["chat_url", "/chat"],
};

const MOBILE_COMMUNITY_MEDIA_QUERY = "(max-width: 999px)";
const userCardProfileBannerCache = new Map();
const communityRequestCache = new Map();
const communityRateLimitUntil = new Map();
let memberRailRenderVersion = 0;
const DEFAULT_COMMUNITY_BACKOFF_MS = 30_000;
const MAX_COMMUNITY_BACKOFF_MS = 5 * 60_000;
const ONLINE_MEMBER_CACHE_MS = 30_000;
const MEMBER_REFRESH_INTERVAL_MS = 60_000;
let mobileCommunityReturnFocus = null;

const MEMBER_CARD_HOVER_SELECTOR = [
  ".cn-member__avatar-wrap[data-user-card]",
  "[data-user-card]:not(:has(img.avatar))",
].join(", ");

const PROFILE_ROUTE_EXCLUSIONS = new Set([
  "account-created",
  "activate-account",
  "admin-login",
  "check-email",
  "confirm-new-email",
  "password-reset",
]);
const DEFAULT_MEMBER_FOOTER = "Canlı çevrimiçi durumu";
const RECENT_PROFILE_FOOTER = "Bu profili son ziyaret eden üyeler";

function normalizeUserImageUrl(value) {
  const candidate = String(value || "").trim();

  if (!candidate) {
    return "";
  }

  try {
    const url = new URL(candidate, window.location.origin);

    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : "";
  } catch {
    return "";
  }
}

function backgroundImageUrlFromElement(element) {
  if (!(element instanceof Element)) {
    return "";
  }

  const imageSource = normalizeUserImageUrl(
    element.currentSrc || element.getAttribute?.("src")
  );

  if (imageSource) {
    return imageSource;
  }

  const backgroundImage =
    element.style.backgroundImage ||
    window.getComputedStyle(element).backgroundImage ||
    "";
  const match = backgroundImage.match(/url\((['"]?)(.*?)\1\)/i);

  return normalizeUserImageUrl(match?.[2]);
}

function visibleProfileBannerUrl(username) {
  const routeUsername = getProfileUsernameFromPath().toLowerCase();

  if (!routeUsername || routeUsername !== String(username).toLowerCase()) {
    return "";
  }

  return backgroundImageUrlFromElement(
    document.querySelector(
      ".user-main .about .user-profile-image img, " +
        ".user-main .about img.user-profile-image, " +
        ".user-main .about .user-profile-image"
    )
  );
}

function profileBannerUrlFromPayload(payload) {
  const user = payload?.user || payload;

  return normalizeUserImageUrl(
    user?.crimson_profile_background_url ||
      user?.get?.("crimson_profile_background_url") ||
      user?.profile_background_upload_url ||
      user?.get?.("profile_background_upload_url") ||
      user?.profileBackgroundUploadUrl ||
      user?.get?.("profileBackgroundUploadUrl") ||
      user?.profile_background_url ||
      user?.get?.("profile_background_url") ||
      user?.profileBackgroundUrl ||
      user?.get?.("profileBackgroundUrl") ||
      payload?.crimson_profile_background_url ||
      payload?.profile_background_upload_url ||
      payload?.profileBackgroundUploadUrl
  );
}

function fetchUserProfileBanner(username) {
  const key = String(username || "")
    .trim()
    .toLowerCase();

  if (!key) {
    return Promise.resolve("");
  }

  if (userCardProfileBannerCache.has(key)) {
    return userCardProfileBannerCache.get(key);
  }

  const request = fetch(getURL(`/u/${encodeURIComponent(key)}.json`), {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((payload) => profileBannerUrlFromPayload(payload))
    .catch(() => {
      userCardProfileBannerCache.delete(key);
      return "";
    });

  setBoundedMap(userCardProfileBannerCache, key, request);
  return request;
}

function renderUserCardProfileBanner(user) {
  const username = String(
    user?.username_lower || user?.username || user?.get?.("username") || ""
  )
    .trim()
    .toLowerCase();
  const card = document.querySelector("#user-card.user-card");

  if (!username || !card) {
    return;
  }

  let banner = card.querySelector(":scope > .cn-user-card-profile-banner");

  if (!banner) {
    banner = document.createElement("div");
    banner.className = "cn-user-card-profile-banner";
    banner.setAttribute("aria-hidden", "true");
    card.prepend(banner);
  }

  card.dataset.cnProfileBannerUsername = username;
  banner.style.removeProperty("background-image");
  banner.classList.remove("cn-user-card-profile-banner--custom");

  const directUrl =
    profileBannerUrlFromPayload(user) || visibleProfileBannerUrl(username);
  const bannerRequest = directUrl
    ? Promise.resolve(directUrl)
    : fetchUserProfileBanner(username);

  bannerRequest.then((bannerUrl) => {
    if (
      !card.isConnected ||
      card.dataset.cnProfileBannerUsername !== username
    ) {
      return;
    }

    banner.classList.toggle(
      "cn-user-card-profile-banner--custom",
      Boolean(bannerUrl)
    );

    if (bannerUrl) {
      banner.style.backgroundImage = `url(${JSON.stringify(bannerUrl)})`;
    } else {
      banner.style.removeProperty("background-image");
    }
  });
}

function isMobileCommunityViewport() {
  return window.matchMedia(MOBILE_COMMUNITY_MEDIA_QUERY).matches;
}

function setMobileCommunityOpen(open) {
  const wasOpen =
    document.body?.classList.contains("cn-mobile-community-open") === true;
  const shouldOpen =
    Boolean(open) &&
    isMobileCommunityViewport() &&
    !document.body?.classList.contains("cn-member-rail-disabled") &&
    !document.body?.classList.contains("cn-shell-hidden");
  const button = document.querySelector(".cn-mobile-community-toggle");
  const backdrop = document.querySelector(".cn-mobile-community-backdrop");
  const rail = document.querySelector(".cn-member-rail");

  if (shouldOpen && !wasOpen) {
    mobileCommunityReturnFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : button;
  }

  document.body?.classList.toggle("cn-mobile-community-open", shouldOpen);
  button?.setAttribute("aria-expanded", String(shouldOpen));
  backdrop?.setAttribute("aria-hidden", String(!shouldOpen));
  backdrop?.setAttribute("tabindex", shouldOpen ? "0" : "-1");

  if (isMobileCommunityViewport()) {
    rail?.setAttribute("aria-hidden", String(!shouldOpen));
    rail?.setAttribute("tabindex", "-1");
  } else {
    rail?.removeAttribute("aria-hidden");
    rail?.removeAttribute("tabindex");
  }

  if (shouldOpen && !wasOpen) {
    window.requestAnimationFrame(() => rail?.focus({ preventScroll: true }));
  } else if (!shouldOpen && wasOpen) {
    const returnFocus = mobileCommunityReturnFocus;
    mobileCommunityReturnFocus = null;
    window.requestAnimationFrame(() => {
      if (returnFocus?.isConnected) {
        returnFocus.focus({ preventScroll: true });
      }
    });
  }
}

function createMobileCommunityIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");

  const group = document.createElementNS("http://www.w3.org/2000/svg", "path");
  group.setAttribute(
    "d",
    "M4 19c.5-3.2 2.2-4.8 5-4.8s4.5 1.6 5 4.8M9 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM14.7 13.8c3.2-.5 5.2 1.2 5.7 4.2M15.8 5.8a2.7 2.7 0 1 1-1 5.2"
  );
  svg.appendChild(group);

  return svg;
}

function createMobileServersIcon() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");

  for (const y of [4, 14]) {
    const rack = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rack.setAttribute("x", "4");
    rack.setAttribute("y", String(y));
    rack.setAttribute("width", "16");
    rack.setAttribute("height", "6");
    rack.setAttribute("rx", "2");
    svg.appendChild(rack);
  }

  const detail = document.createElementNS("http://www.w3.org/2000/svg", "path");
  detail.setAttribute("d", "M8 7h.01M8 17h.01M12 7h5M12 17h5");
  svg.appendChild(detail);

  return svg;
}

function ensureMobileServersLink() {
  const iconList = document.querySelector(".d-header-icons");

  if (!iconList) {
    return null;
  }

  let item = iconList.querySelector(".cn-mobile-servers-link-item");

  if (!item) {
    item = document.createElement("li");
    item.className = "cn-mobile-servers-link-item";

    const link = document.createElement("a");
    link.className = "icon btn-flat cn-mobile-servers-link";
    link.dataset.cnLink = "servers";
    link.href = normalizeSameOriginUrl(
      getSetting("servers_url", "/servers"),
      "/servers"
    );
    link.setAttribute("aria-label", "Private server top listesi");
    link.appendChild(createMobileServersIcon());
    item.appendChild(link);

    const hamburger = iconList.querySelector(
      ".hamburger-dropdown, .header-sidebar-toggle"
    );
    iconList.insertBefore(item, hamburger?.closest("li") || null);
  }

  return item.querySelector(".cn-mobile-servers-link");
}

function ensureMobileCommunityToggle() {
  const iconList = document.querySelector(".d-header-icons");

  if (!iconList) {
    return null;
  }

  let item = iconList.querySelector(".cn-mobile-community-toggle-item");

  if (!item) {
    item = document.createElement("li");
    item.className = "cn-mobile-community-toggle-item";

    const button = document.createElement("button");
    button.className = "icon btn-flat cn-mobile-community-toggle";
    button.type = "button";
    button.setAttribute("aria-label", "Topluluk panelini aç veya kapat");
    button.setAttribute("aria-controls", "cn-community-panel");
    button.setAttribute("aria-expanded", "false");
    button.appendChild(createMobileCommunityIcon());
    item.appendChild(button);

    const hamburger = iconList.querySelector(
      ".hamburger-dropdown, .header-sidebar-toggle"
    );
    const referenceItem = hamburger?.closest("li");

    iconList.insertBefore(item, referenceItem || null);
  }

  return item.querySelector(".cn-mobile-community-toggle");
}

function getProfileUsernameFromPath(pathname = window.location.pathname) {
  const match = String(pathname || "").match(
    /(?:^|\/)u\/([^/]+)(?:\/([^/]+))?/i
  );

  if (!match || String(match[2] || "").toLowerCase() === "preferences") {
    return "";
  }

  let username;

  try {
    username = decodeURIComponent(match[1]).replace(/^@/, "").trim();
  } catch {
    return "";
  }

  if (
    !username ||
    PROFILE_ROUTE_EXCLUSIONS.has(username.toLowerCase()) ||
    /[\s/\\?#]/.test(username)
  ) {
    return "";
  }

  return username;
}

function normalizeAvatarUrl(value) {
  const candidate = String(value || "").trim();

  if (
    candidate.startsWith("/") ||
    /^https?:\/\//i.test(candidate) ||
    candidate.startsWith("//")
  ) {
    return candidate;
  }

  return "";
}

function getRecentProfileLimit() {
  return getNumberSetting("recent_profiles_limit", 12, 4, 24);
}

function avatarTemplateUrl(template, size = 64) {
  const candidate = String(template || "").replace("{size}", String(size));

  if (candidate.startsWith("/")) {
    return getURL(candidate);
  }

  return normalizeAvatarUrl(candidate);
}

function normalizeCommunityMember(user) {
  const username = String(user?.username || "")
    .replace(/^@/, "")
    .trim();

  if (!username || /[\s/\\?#]/.test(username)) {
    return null;
  }

  const name = String(user?.name || username)
    .trim()
    .slice(0, 120);

  return {
    username,
    name: name || username,
    avatarUrl:
      avatarTemplateUrl(user?.avatar_template, 64) ||
      normalizeAvatarUrl(user?.avatar_url),
    profileUrl: getURL(`/u/${encodeURIComponent(username)}`),
    lastSeenAt: user?.last_seen_at || "",
    lastVisitedAt: user?.last_visited_at || "",
  };
}

function getCommunityRetryAfterMilliseconds(response) {
  const retryAfter = response.headers.get("Retry-After");

  if (!retryAfter) {
    return DEFAULT_COMMUNITY_BACKOFF_MS;
  }

  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(
      MAX_COMMUNITY_BACKOFF_MS,
      Math.max(1_000, Math.ceil(seconds * 1_000))
    );
  }

  const retryAt = Date.parse(retryAfter);
  if (Number.isFinite(retryAt)) {
    return Math.min(
      MAX_COMMUNITY_BACKOFF_MS,
      Math.max(1_000, retryAt - Date.now())
    );
  }

  return DEFAULT_COMMUNITY_BACKOFF_MS;
}

function fetchCommunityPayload(path, maxAgeMilliseconds = 15_000) {
  const now = Date.now();
  const rateLimitUntil = communityRateLimitUntil.get(path) || 0;

  if (rateLimitUntil > now) {
    return Promise.reject(
      new Error("Community request is temporarily rate limited")
    );
  }

  if (rateLimitUntil) {
    communityRateLimitUntil.delete(path);
  }

  const cached = communityRequestCache.get(path);

  if (cached && cached.expiresAt > now) {
    return cached.promise;
  }

  const promise = fetch(getURL(path), {
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  })
    .then((response) => {
      if (!response.ok) {
        if (response.status === 429) {
          setBoundedMap(
            communityRateLimitUntil,
            path,
            Date.now() + getCommunityRetryAfterMilliseconds(response)
          );
        }

        throw new Error(`Community request failed (${response.status})`);
      }

      communityRateLimitUntil.delete(path);
      return response.json();
    })
    .catch((error) => {
      communityRequestCache.delete(path);
      throw error;
    });

  setBoundedMap(communityRequestCache, path, {
    expiresAt: now + maxAgeMilliseconds,
    promise,
  });

  return promise;
}

async function loadCommunityMembers(profileUsername) {
  if (profileUsername) {
    const path = `/crimson-community/profile-visits/${encodeURIComponent(
      profileUsername
    )}.json`;
    const payload = await fetchCommunityPayload(path, 60_000);

    return {
      members: (payload?.users || [])
        .map(normalizeCommunityMember)
        .filter(Boolean),
      footer:
        Number(payload?.retention_days) > 0
          ? `Son ${payload.retention_days} günlük profil ziyaretleri`
          : RECENT_PROFILE_FOOTER,
    };
  }

  const payload = await fetchCommunityPayload(
    "/crimson-community/online.json",
    ONLINE_MEMBER_CACHE_MS
  );

  return {
    members: (payload?.users || [])
      .map(normalizeCommunityMember)
      .filter(Boolean),
    footer:
      Number(payload?.window_minutes) > 0
        ? `Canlı durum • ${payload.window_minutes} dk zaman aşımı`
        : DEFAULT_MEMBER_FOOTER,
  };
}

function getStoredPanelState() {
  try {
    return window.localStorage.getItem("cn-member-rail-collapsed") === "1";
  } catch {
    return false;
  }
}

function storePanelState(collapsed) {
  try {
    window.localStorage.setItem(
      "cn-member-rail-collapsed",
      collapsed ? "1" : "0"
    );
  } catch {
    // The visual toggle still works when browser storage is unavailable.
  }
}

function setPanelCollapsed(collapsed) {
  document.body?.classList.toggle("cn-member-rail-collapsed", collapsed);

  const button = document.querySelector('[data-cn-action="toggle-members"]');
  button?.setAttribute("aria-expanded", String(!collapsed));
}

function syncThemeSettings() {
  document.documentElement.style.setProperty(
    "--cn-forum-width",
    `${getNumberSetting("forum_width_percent", 100, 40, 100)}%`
  );

  const brand = document.querySelector("[data-cn-brand-initial]");
  const title = document.querySelector("[data-cn-member-title]");

  if (brand) {
    const brandText = String(getSetting("brand_initial", "S")).trim() || "S";
    brand.textContent = brandText.slice(0, 3);
  }

  if (title) {
    title.textContent = String(getSetting("member_panel_title", "ÇEVRİMİÇİ"));
  }

  for (const [key, [settingName, fallback]] of Object.entries(LINK_SETTINGS)) {
    for (const link of document.querySelectorAll(`[data-cn-link="${key}"]`)) {
      link.setAttribute(
        "href",
        normalizeSameOriginUrl(getSetting(settingName, fallback), fallback)
      );
    }
  }

  document.body?.classList.toggle(
    "cn-member-rail-disabled",
    !getBooleanSetting("member_rail_enabled", true)
  );
}

function syncRouteState() {
  const currentPath = window.location.pathname || "/";
  document.body?.classList.toggle(
    "cn-shell-hidden",
    HIDDEN_ROUTE_PATTERN.test(currentPath)
  );

  for (const link of document.querySelectorAll("[data-cn-link]")) {
    let targetPath = "/";

    try {
      targetPath = new URL(link.href, window.location.origin).pathname;
    } catch {
      // Keep the default path when a custom setting cannot be parsed.
    }

    const isHome = link.dataset.cnLink === "home";
    const isActive = isHome
      ? currentPath === targetPath
      : currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);

    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

function createMemberElement(member) {
  const item = document.createElement("a");
  item.className = "cn-member trigger-user-card";
  item.href = member.profileUrl;
  item.setAttribute("data-user-card", member.username);
  item.setAttribute("aria-label", `${member.name} kullanıcı kartını aç`);

  const avatarWrap = document.createElement("span");
  avatarWrap.className = "cn-member__avatar-wrap trigger-user-card";
  avatarWrap.setAttribute("data-user-card", member.username);

  if (member.avatarUrl) {
    const avatar = document.createElement("img");
    avatar.className = "avatar cn-member__avatar";
    avatar.src = member.avatarUrl;
    avatar.alt = "";
    avatar.width = 34;
    avatar.height = 34;
    avatar.loading = "lazy";
    avatar.decoding = "async";
    avatarWrap.appendChild(avatar);
  } else {
    const fallback = document.createElement("span");
    fallback.className = "cn-member__avatar cn-member__avatar--fallback";
    fallback.textContent = member.username.charAt(0).toUpperCase();

    const avatarProbe = document.createElement("img");
    avatarProbe.className = "avatar cn-member__avatar-probe";
    avatarProbe.alt = "";
    avatarProbe.setAttribute("aria-hidden", "true");

    avatarWrap.append(fallback, avatarProbe);
  }

  const presence = document.createElement("span");
  presence.className = "cn-member__presence";
  presence.setAttribute("aria-hidden", "true");
  avatarWrap.appendChild(presence);

  const meta = document.createElement("span");
  meta.className = "cn-member__meta cn-member__nameplate-layer";
  meta.setAttribute("data-user-card", member.username);

  const name = document.createElement("strong");
  name.className = "cn-member__name";
  name.textContent = member.name;

  const username = document.createElement("small");
  username.textContent = `@${member.username}`;

  meta.append(name, username);
  item.append(avatarWrap, meta);

  return item;
}

function decorateCollapsedProfileNameplate() {
  const primary = document.querySelector(
    ".user-main .about.collapsed-info .details > .primary"
  );
  const username = getProfileUsernameFromPath();

  if (!primary || !username) {
    return;
  }

  let layer = primary.querySelector(":scope > .cn-profile-nameplate-layer");

  if (!layer) {
    layer = document.createElement("span");
    layer.className = "cn-profile-nameplate-layer";
    layer.setAttribute("aria-hidden", "true");
    primary.prepend(layer);
  }

  layer.setAttribute("data-user-card", username);
  primary.classList.add("cn-profile-nameplate-host");
}

function decorateDynamicSurfaces() {
  decorateCollapsedProfileNameplate();
}

async function renderMemberRail() {
  const renderVersion = ++memberRailRenderVersion;
  const list = document.querySelector("[data-cn-member-list]");
  const count = document.querySelector("[data-cn-member-count]");
  const title = document.querySelector("[data-cn-member-title]");
  const footer = document.querySelector("[data-cn-member-footer]");
  const rail = document.querySelector(".cn-member-rail");

  if (!list || !count) {
    return;
  }

  if (
    document.visibilityState === "hidden" ||
    document.body?.classList.contains("cn-member-rail-disabled") ||
    document.body?.classList.contains("cn-shell-hidden")
  ) {
    list.removeAttribute("aria-busy");
    return;
  }

  const profileUsername = getProfileUsernameFromPath();
  const showProfileVisitors =
    Boolean(profileUsername) &&
    getBooleanSetting("recent_profiles_enabled", true);
  let members;
  let serviceUnavailable = false;
  let footerText = showProfileVisitors
    ? RECENT_PROFILE_FOOTER
    : DEFAULT_MEMBER_FOOTER;

  list.setAttribute("aria-busy", "true");

  try {
    const community = await loadCommunityMembers(
      showProfileVisitors ? profileUsername : ""
    );
    members = community.members;
    footerText = community.footer;
  } catch {
    members = [];
    serviceUnavailable = true;
    footerText = showProfileVisitors
      ? "Profil ziyaretçisi servisine ulaşılamadı"
      : "Canlı çevrimiçi servisine ulaşılamadı";
  }

  if (renderVersion !== memberRailRenderVersion || !list.isConnected) {
    return;
  }

  const limit = showProfileVisitors
    ? getRecentProfileLimit()
    : getNumberSetting("member_rail_limit", 12, 4, 24);
  members = members.slice(0, limit);

  rail?.classList.toggle(
    "cn-member-rail--recent-profiles",
    showProfileVisitors
  );
  rail?.setAttribute(
    "aria-label",
    showProfileVisitors
      ? "Bu profili son ziyaret eden üyeler"
      : "Çevrimiçi üyeler"
  );

  if (title) {
    title.textContent = showProfileVisitors
      ? String(getSetting("recent_profiles_title", "SON PROFİL ZİYARETÇİLERİ"))
      : String(getSetting("member_panel_title", "ÇEVRİMİÇİ"));
  }

  if (footer) {
    footer.textContent = footerText;
  }

  list.replaceChildren();
  list.removeAttribute("aria-busy");
  count.textContent = String(members.length);

  if (members.length === 0) {
    const empty = document.createElement("p");
    empty.className = "cn-member-list__empty";
    empty.textContent = serviceUnavailable
      ? footerText
      : showProfileVisitors
        ? "Bu profil için henüz kayıtlı bir ziyaretçi yok."
        : "Şu anda çevrimiçi görünen bir üye yok.";
    list.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const member of members) {
    fragment.appendChild(createMemberElement(member));
  }
  list.appendChild(fragment);
}

export default apiInitializer((api) => {
  let surfaceObserver;
  let renderTimer;
  let surfaceTimer;
  let memberRefreshTimer;
  let communityControlTimer;
  let memberHoverTimer;
  let memberHoverTarget;
  let memberRailCardPending = false;
  let memberRailCardTop = "";
  const appEvents = api.container.lookup("service:app-events");
  const featuredTopics = createFeaturedTopicsController();

  const scheduleDynamicSurfaceDecoration = () => {
    window.clearTimeout(surfaceTimer);
    surfaceTimer = window.setTimeout(() => decorateDynamicSurfaces(), 40);
  };

  const bindDynamicSurfaceObserver = () => {
    surfaceObserver?.disconnect();

    const surfaceRoot = document.querySelector("#main-outlet");

    if (!surfaceRoot) {
      return;
    }

    surfaceObserver = new MutationObserver((mutations) => {
      const relevantMutation = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some(
          (node) =>
            node instanceof Element &&
            (node.matches(".about.collapsed-info") ||
              node.querySelector(".about.collapsed-info"))
        )
      );

      if (relevantMutation) {
        scheduleDynamicSurfaceDecoration();
      }
    });
    surfaceObserver.observe(surfaceRoot, { childList: true, subtree: true });
  };

  const memberRailCanRefresh = () => {
    if (
      document.visibilityState === "hidden" ||
      document.body?.classList.contains("cn-member-rail-disabled") ||
      document.body?.classList.contains("cn-shell-hidden")
    ) {
      return false;
    }

    if (isMobileCommunityViewport()) {
      return document.body.classList.contains("cn-mobile-community-open");
    }

    return (
      window.matchMedia("(min-width: 1280px)").matches &&
      !document.body.classList.contains("cn-member-rail-collapsed")
    );
  };

  const startMemberRefresh = () => {
    window.clearInterval(memberRefreshTimer);
    memberRefreshTimer = window.setInterval(() => {
      if (!memberRailCanRefresh()) {
        return;
      }

      // Let the normal bounded request cache coalesce route/visibility/timer
      // renders instead of force-invalidating the same endpoint every cycle.
      scheduleMemberRender();
    }, MEMBER_REFRESH_INTERVAL_MS);
  };

  const clearMemberRailCardPlacement = () => {
    document.body?.classList.remove("cn-user-card-from-member-rail");
    document.documentElement.style.removeProperty("--cn-member-user-card-top");
  };

  const applyMemberRailCardPlacement = () => {
    if (!memberRailCardPending || !memberRailCardTop) {
      clearMemberRailCardPlacement();
      memberRailCardPending = false;
      memberRailCardTop = "";
      return;
    }

    document.documentElement.style.setProperty(
      "--cn-member-user-card-top",
      memberRailCardTop
    );
    document.body?.classList.add("cn-user-card-from-member-rail");
    memberRailCardPending = false;
    memberRailCardTop = "";
  };

  const markUserCardTriggerOrigin = (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const trigger = event.target.closest("[data-user-card], a.mention");

    if (!trigger) {
      return;
    }

    const memberRail = trigger.closest(".cn-member-rail");
    const desktopRailIsVisible = window.matchMedia(
      "(min-width: 1280px)"
    ).matches;

    if (!memberRail || !desktopRailIsVisible) {
      memberRailCardPending = false;
      memberRailCardTop = "";
      clearMemberRailCardPlacement();
      return;
    }

    const row = trigger.closest(".cn-member[data-user-card]") || trigger;
    const rowRect = row.getBoundingClientRect();
    const headerBottom =
      document.querySelector(".d-header")?.getBoundingClientRect().bottom || 0;
    const safeCardHeight = Math.min(444, Math.max(0, window.innerHeight - 20));
    const minimumTop = Math.max(10, Math.ceil(headerBottom + 10));
    const maximumTop = Math.max(
      minimumTop,
      Math.floor(window.innerHeight - safeCardHeight - 10)
    );
    const preferredTop = Math.round(rowRect.top - 10);

    memberRailCardTop = `${Math.min(
      maximumTop,
      Math.max(minimumTop, preferredTop)
    )}px`;
    memberRailCardPending = true;
  };

  if (document.body?.dataset.cnMemberCardPlacementBound !== "true") {
    document.body.dataset.cnMemberCardPlacementBound = "true";
    document.addEventListener("click", markUserCardTriggerOrigin, true);
  }

  api.addCardClickListenerSelector(".cn-member-rail");
  api.addCardClickListenerSelector(".cn-featured-topics");
  appEvents.on("user-card:show", applyMemberRailCardPlacement);
  appEvents.on("card:hide", clearMemberRailCardPlacement);
  appEvents.on("user-card:after-show", ({ user }) => {
    renderUserCardProfileBanner(user);
  });

  const bindMobileCommunityControls = () => {
    ensureMobileServersLink();
    const button = ensureMobileCommunityToggle();
    const backdrop = document.querySelector(
      '[data-cn-action="close-mobile-community"]'
    );

    if (button && button.dataset.cnCommunityBound !== "true") {
      button.dataset.cnCommunityBound = "true";
      button.addEventListener("click", () => {
        const shouldOpen = !document.body.classList.contains(
          "cn-mobile-community-open"
        );
        setMobileCommunityOpen(shouldOpen);

        if (shouldOpen) {
          scheduleMemberRender();
        }
      });
    }

    if (backdrop && backdrop.dataset.cnCommunityBound !== "true") {
      backdrop.dataset.cnCommunityBound = "true";
      backdrop.addEventListener("click", () => setMobileCommunityOpen(false));
    }

    if (document.body.dataset.cnCommunityGlobalBound !== "true") {
      document.body.dataset.cnCommunityGlobalBound = "true";

      document.addEventListener("keydown", (event) => {
        if (
          event.key === "Escape" &&
          document.body.classList.contains("cn-mobile-community-open")
        ) {
          setMobileCommunityOpen(false);
        }
      });

      window
        .matchMedia(MOBILE_COMMUNITY_MEDIA_QUERY)
        .addEventListener("change", () => setMobileCommunityOpen(false));
    }

    button?.setAttribute(
      "aria-expanded",
      String(document.body.classList.contains("cn-mobile-community-open"))
    );

    return Boolean(button);
  };

  const scheduleMobileCommunityControls = (attempt = 0) => {
    window.clearTimeout(communityControlTimer);
    communityControlTimer = window.setTimeout(
      () => {
        const bound = bindMobileCommunityControls();

        if (!bound && attempt < 7) {
          scheduleMobileCommunityControls(attempt + 1);
        }
      },
      attempt === 0 ? 0 : 150
    );
  };

  const clearMemberHoverTimer = () => {
    if (memberHoverTimer) {
      window.clearTimeout(memberHoverTimer);
    }

    memberHoverTimer = undefined;
    memberHoverTarget = undefined;
  };

  const findMemberHoverTarget = (eventTarget, container) => {
    if (!(eventTarget instanceof Element)) {
      return null;
    }

    const customMember = eventTarget.closest(".cn-member[data-user-card]");
    if (customMember && container.contains(customMember)) {
      return customMember;
    }

    const directTarget = eventTarget.closest(MEMBER_CARD_HOVER_SELECTOR);
    if (directTarget && container.contains(directTarget)) {
      return directTarget;
    }

    const avatarTarget = eventTarget
      .closest("img.avatar")
      ?.closest("[data-user-card]");

    return avatarTarget && container.contains(avatarTarget)
      ? avatarTarget
      : null;
  };

  const scheduleMemberHoverCard = (event) => {
    const container = event.currentTarget;
    const trigger = findMemberHoverTarget(event.target, container);

    if (!trigger) {
      return;
    }

    if (event.relatedTarget && trigger.contains(event.relatedTarget)) {
      return;
    }

    clearMemberHoverTimer();

    if (!getBooleanSetting("member_hover_card_enabled", true)) {
      return;
    }

    memberHoverTarget = trigger;
    const delay =
      getNumberSetting("member_hover_card_delay_seconds", 3, 1, 10) * 1000;

    memberHoverTimer = window.setTimeout(() => {
      const currentTarget = memberHoverTarget;
      memberHoverTimer = undefined;
      memberHoverTarget = undefined;

      if (!currentTarget?.isConnected || !currentTarget.matches(":hover")) {
        return;
      }

      currentTarget.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );
    }, delay);
  };

  const cancelMemberHoverCard = (event) => {
    const trigger = findMemberHoverTarget(event.target, event.currentTarget);

    if (!trigger) {
      return;
    }

    if (event.relatedTarget && trigger.contains(event.relatedTarget)) {
      return;
    }

    if (memberHoverTarget === trigger) {
      clearMemberHoverTimer();
    }
  };

  const bindMemberHoverCard = () => {
    for (const container of document.querySelectorAll(
      ".cn-member-rail, #main-outlet"
    )) {
      if (container.dataset.cnHoverCardBound === "true") {
        continue;
      }

      container.dataset.cnHoverCardBound = "true";
      container.addEventListener("mouseover", scheduleMemberHoverCard);
      container.addEventListener("mouseout", cancelMemberHoverCard);
      container.addEventListener("click", clearMemberHoverTimer);
      container.addEventListener("mouseleave", clearMemberHoverTimer);
    }
  };

  const scheduleMemberRender = () => {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(renderMemberRail, 180);
  };

  if (document.body?.dataset.cnVisibilityBound !== "true") {
    document.body.dataset.cnVisibilityBound = "true";
    document.addEventListener("visibilitychange", () => {
      if (memberRailCanRefresh()) {
        scheduleMemberRender();
      }
    });
  }

  const bindToggleButton = () => {
    const toggleButton = document.querySelector(
      '[data-cn-action="toggle-members"]'
    );

    if (!toggleButton || toggleButton.dataset.cnBound === "true") {
      return;
    }

    toggleButton.dataset.cnBound = "true";
    toggleButton.addEventListener("click", () => {
      const collapsed = !document.body.classList.contains(
        "cn-member-rail-collapsed"
      );
      setPanelCollapsed(collapsed);
      storePanelState(collapsed);

      if (!collapsed) {
        scheduleMemberRender();
      }
    });
  };

  syncThemeSettings();
  setMobileCommunityOpen(false);
  bindToggleButton();
  scheduleMobileCommunityControls();
  bindMemberHoverCard();
  setPanelCollapsed(getStoredPanelState());
  syncRouteState();
  bindDynamicSurfaceObserver();
  scheduleDynamicSurfaceDecoration();
  startMemberRefresh();
  scheduleMemberRender();
  featuredTopics.schedule();

  api.onPageChange(() => {
    memberRailCardPending = false;
    memberRailCardTop = "";
    clearMemberRailCardPlacement();
    setMobileCommunityOpen(false);
    syncThemeSettings();
    bindToggleButton();
    scheduleMobileCommunityControls();
    bindMemberHoverCard();
    syncRouteState();
    bindDynamicSurfaceObserver();
    scheduleDynamicSurfaceDecoration();
    scheduleMemberRender();
    featuredTopics.schedule();
  });
});
