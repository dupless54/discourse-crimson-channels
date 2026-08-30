import getURL from "discourse/lib/get-url";
import { setBoundedMap } from "discourse/lib/crimson/cache";
import {
  getBooleanSetting,
  getNumberSetting,
  getSetting,
  stripDiscourseBasePath,
} from "discourse/lib/crimson/settings";

const FEATURED_TOPIC_LIST_SELECTOR = [
  "#main-outlet .list-container .topic-list",
  "#main-outlet .topic-list-container .topic-list",
  "#main-outlet > .topic-list",
].join(", ");
const FEATURED_TOPICS_CLASS = "cn-featured-topics";
const MAX_FEATURED_CACHE_ENTRIES = 32;
const featuredTopicsCache = new Map();
let relativeTimeFormatter;
let relativeTimeFormatterLocale = "";

function normalizeFeaturedCategoryPath(value) {
  const candidate = String(value || "").trim();

  if (!candidate) {
    return "";
  }

  try {
    const url = new URL(candidate, window.location.origin);

    if (url.origin !== window.location.origin) {
      return "";
    }

    const path = stripDiscourseBasePath(
      url.pathname
        .replace(/\.json$/i, "")
        .replace(/\/l\/[^/]+$/i, "")
        .replace(/\/+$/, "")
    );

    return /^\/c\/(?:[^/]+\/)+\d+$/i.test(path) ? path : "";
  } catch {
    return "";
  }
}

function featuredCategoryPathFromIds(value) {
  const categoryId = Number(Array.isArray(value) ? value[0] : value);

  return Number.isInteger(categoryId) && categoryId > 0
    ? `/c/${categoryId}`
    : "";
}

function normalizeRoutePath(value) {
  try {
    const url = new URL(String(value || "/"), window.location.origin);

    if (url.origin !== window.location.origin) {
      return "/";
    }

    return stripDiscourseBasePath(url.pathname.replace(/\/+$/, "")) || "/";
  } catch {
    return "/";
  }
}

function isFeaturedTopicsHomeRoute() {
  const currentPath = normalizeRoutePath(window.location.pathname);
  const configuredHomePath = normalizeRoutePath(getSetting("home_url", "/"));

  if (currentPath === "/" || currentPath === configuredHomePath) {
    return true;
  }

  return configuredHomePath === "/" && currentPath === "/latest";
}

function parseFeaturedTopicObjects(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeFeaturedLimit(value, fallback = 5) {
  const number = Number(value);
  const normalized = Number.isFinite(number) ? number : fallback;

  return Math.min(20, Math.max(1, Math.round(normalized)));
}

function getFeaturedTopicConfigs() {
  const configuredObjects = parseFeaturedTopicObjects(
    getSetting("featured_topic_lists", [])
  );

  if (configuredObjects.length) {
    return configuredObjects
      .map((item, index) => {
        const categoryPath =
          featuredCategoryPathFromIds(item?.category_ids) ||
          normalizeFeaturedCategoryPath(item?.category_url);

        if (item?.enabled === false || !categoryPath) {
          return null;
        }

        return {
          key: `${index}-${categoryPath}`,
          categoryPath,
          title:
            String(item?.title || "SEÇİLİ KONULAR").trim() || "SEÇİLİ KONULAR",
          position: item?.position === "below" ? "below" : "above",
          limit: normalizeFeaturedLimit(item?.limit, 5),
        };
      })
      .filter(Boolean);
  }

  if (!getBooleanSetting("featured_topics_enabled", false)) {
    return [];
  }

  const categoryPath = normalizeFeaturedCategoryPath(
    getSetting("featured_category_url", "")
  );

  if (!categoryPath) {
    return [];
  }

  return [
    {
      key: `legacy-${categoryPath}`,
      categoryPath,
      title:
        String(getSetting("featured_topics_title", "SEÇİLİ KONULAR")).trim() ||
        "SEÇİLİ KONULAR",
      position:
        getSetting("featured_topics_position", "above") === "below"
          ? "below"
          : "above",
      limit: getNumberSetting("featured_topics_limit", 5, 1, 20),
    },
  ];
}

function findPrimaryTopicList() {
  for (const topicList of document.querySelectorAll(
    FEATURED_TOPIC_LIST_SELECTOR
  )) {
    if (
      !topicList.closest(
        `#topic, .more-topics__container, .${FEATURED_TOPICS_CLASS}`
      )
    ) {
      return topicList;
    }
  }

  return null;
}

function avatarUrlFromTemplate(template, size = 48) {
  const value = String(template || "").replaceAll("{size}", String(size));

  if (value.startsWith("/")) {
    return getURL(stripDiscourseBasePath(value));
  }

  return /^https?:\/\//i.test(value) ? value : "";
}

function getRelativeTimeFormatter() {
  const locale = document.documentElement.lang || "tr";

  if (!relativeTimeFormatter || relativeTimeFormatterLocale !== locale) {
    relativeTimeFormatter = new Intl.RelativeTimeFormat(locale, {
      numeric: "auto",
      style: "short",
    });
    relativeTimeFormatterLocale = locale;
  }

  return relativeTimeFormatter;
}

function formatRelativeActivity(value) {
  const time = new Date(value).getTime();

  if (!Number.isFinite(time)) {
    return "";
  }

  const seconds = Math.round((time - Date.now()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [unit, length] of units) {
    if (Math.abs(seconds) >= length) {
      try {
        return getRelativeTimeFormatter().format(
          Math.round(seconds / length),
          unit
        );
      } catch {
        break;
      }
    }
  }

  return "şimdi";
}

async function fetchFeaturedTopics(categoryPath) {
  const cached = featuredTopicsCache.get(categoryPath);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise;
  }

  const promise = fetch(getURL(`${categoryPath}/l/latest.json`), {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Topic list request failed: ${response.status}`);
    }

    return response.json();
  });

  setBoundedMap(
    featuredTopicsCache,
    categoryPath,
    {
      promise,
      expiresAt: Date.now() + 60_000,
    },
    MAX_FEATURED_CACHE_ENTRIES
  );

  try {
    return await promise;
  } catch (error) {
    featuredTopicsCache.delete(categoryPath);
    throw error;
  }
}

function createFeaturedTopicsSection(config) {
  const section = document.createElement("section");
  section.className = `${FEATURED_TOPICS_CLASS} ${FEATURED_TOPICS_CLASS}--${config.position}`;
  section.dataset.cnFeaturedSource = config.categoryPath;
  section.dataset.cnFeaturedKey = config.key;
  section.setAttribute("aria-label", `${config.title} konu listesi`);

  const header = document.createElement("header");
  header.className = "cn-featured-topics__header";

  const title = document.createElement("h2");
  title.className = "cn-featured-topics__title";
  title.textContent = config.title;

  const more = document.createElement("a");
  more.className = "cn-featured-topics__more";
  more.href = getURL(`${config.categoryPath}/l/latest`);
  more.textContent = "Tümünü gör";

  const status = document.createElement("p");
  status.className = "cn-featured-topics__status";
  status.textContent = "Konular yükleniyor…";

  header.append(title, more);
  section.append(header, status);

  return section;
}

function getFeaturedPoster(topic, usersById) {
  const posterId = topic?.posters?.[0]?.user_id;
  return usersById.get(posterId) || null;
}

function firstTopicTag(topic) {
  const tag = topic?.tags?.[0];
  return typeof tag === "string" ? tag : tag?.name || "";
}

function populateFeaturedTopics(section, payload, limit) {
  const usersById = new Map(
    (payload?.users || []).map((user) => [user.id, user])
  );
  const topics = (payload?.topic_list?.topics || []).slice(0, limit);

  if (!topics.length) {
    const status = section.querySelector(".cn-featured-topics__status");
    if (status) {
      status.textContent = "Bu kategoride gösterilecek konu bulunamadı.";
    }
    return;
  }

  const list = document.createElement("ul");
  list.className = "cn-featured-topics__list";

  for (const topic of topics) {
    const poster = getFeaturedPoster(topic, usersById);
    const username = String(poster?.username || "").trim();
    const item = document.createElement("li");
    item.className = "cn-featured-topic";

    const avatar = document.createElement(username ? "a" : "span");
    avatar.className = "cn-featured-topic__avatar trigger-user-card";

    if (username) {
      avatar.href = getURL(`/u/${encodeURIComponent(username)}`);
      avatar.setAttribute("data-user-card", username);
      avatar.setAttribute("aria-label", `${username} kullanıcı kartını aç`);
    }

    const avatarUrl = avatarUrlFromTemplate(poster?.avatar_template, 48);
    if (avatarUrl) {
      const image = document.createElement("img");
      image.className = "avatar";
      image.src = avatarUrl;
      image.alt = "";
      image.width = 48;
      image.height = 48;
      image.loading = "lazy";
      image.decoding = "async";
      avatar.appendChild(image);
    } else {
      const fallback = document.createElement("span");
      fallback.className = "cn-featured-topic__avatar-fallback";
      fallback.textContent = (username || "?").charAt(0).toUpperCase();
      avatar.appendChild(fallback);
    }

    const body = document.createElement("div");
    body.className = "cn-featured-topic__body";

    const link = document.createElement("a");
    link.className = "cn-featured-topic__link";
    link.href = getURL(
      `/t/${encodeURIComponent(topic.slug || "topic")}/${topic.id}`
    );
    link.textContent = String(topic.title || "Başlıksız konu");

    const meta = document.createElement("div");
    meta.className = "cn-featured-topic__meta";

    const author = document.createElement("span");
    author.textContent = poster?.name || username || "Topluluk";
    meta.appendChild(author);

    const tagName = firstTopicTag(topic);
    if (tagName) {
      const tag = document.createElement("span");
      tag.className = "cn-featured-topic__tag";
      tag.textContent = `#${tagName}`;
      meta.appendChild(tag);
    }

    body.append(link, meta);

    const stats = document.createElement("span");
    stats.className = "cn-featured-topic__stats";

    const replies = document.createElement("strong");
    replies.textContent = String(
      Math.max(0, Number(topic.posts_count || 1) - 1)
    );
    replies.setAttribute("aria-label", "Yanıt");

    const activity = document.createElement("span");
    activity.textContent = formatRelativeActivity(topic.bumped_at);

    stats.append(replies, activity);
    item.append(avatar, body, stats);
    list.appendChild(item);
  }

  section.querySelector(".cn-featured-topics__status")?.remove();
  section.appendChild(list);
}

export function createFeaturedTopicsController() {
  let featuredTimer;
  let featuredRenderVersion = 0;

  const removeFeaturedTopics = () => {
    for (const section of document.querySelectorAll(
      `.${FEATURED_TOPICS_CLASS}`
    )) {
      section.remove();
    }
  };

  const renderFeaturedTopics = async () => {
    const renderVersion = ++featuredRenderVersion;
    removeFeaturedTopics();

    if (!isFeaturedTopicsHomeRoute()) {
      return true;
    }

    const configs = getFeaturedTopicConfigs();

    if (!configs.length) {
      return true;
    }

    const topicList = findPrimaryTopicList();

    if (!topicList) {
      return false;
    }

    const entries = configs.map((config) => ({
      config,
      section: createFeaturedTopicsSection(config),
    }));
    const above = document.createDocumentFragment();
    const below = document.createDocumentFragment();

    for (const entry of entries) {
      (entry.config.position === "below" ? below : above).appendChild(
        entry.section
      );
    }

    if (above.childNodes.length) {
      topicList.before(above);
    }

    if (below.childNodes.length) {
      topicList.after(below);
    }

    await Promise.all(
      entries.map(async ({ config, section }) => {
        try {
          const payload = await fetchFeaturedTopics(config.categoryPath);

          if (
            renderVersion === featuredRenderVersion &&
            section.isConnected &&
            section.dataset.cnFeaturedKey === config.key
          ) {
            populateFeaturedTopics(section, payload, config.limit);
          }
        } catch {
          if (renderVersion === featuredRenderVersion && section.isConnected) {
            const status = section.querySelector(".cn-featured-topics__status");
            if (status) {
              status.textContent =
                "Konu listesi yüklenemedi. Kategori seçimini ve erişim iznini kontrol edin.";
            }
          }
        }
      })
    );

    return true;
  };

  const schedule = (attempt = 0) => {
    window.clearTimeout(featuredTimer);
    featuredTimer = window.setTimeout(
      async () => {
        const rendered = await renderFeaturedTopics();
        const outletCannotHostList = document.querySelector(
          "#topic, .user-main, .chat-full-page"
        );

        if (!rendered && !outletCannotHostList && attempt < 7) {
          schedule(attempt + 1);
        }
      },
      attempt === 0 ? 80 : 220
    );
  };

  return { schedule };
}
