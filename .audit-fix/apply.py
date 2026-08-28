from pathlib import Path


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    return text.replace(old, new, 1)


js_path = Path("javascripts/discourse/api-initializers/crimson-channels.js")
js = js_path.read_text()

js = replace_once(
    js,
    "let memberRailRenderVersion = 0;\n",
    """let memberRailRenderVersion = 0;
const MAX_USER_CACHE_ENTRIES = 128;
let mobileCommunityReturnFocus = null;

function setBoundedMap(map, key, value, maxEntries = MAX_USER_CACHE_ENTRIES) {
  if (map.has(key)) {
    map.delete(key);
  }

  map.set(key, value);

  while (map.size > maxEntries) {
    const oldestKey = map.keys().next().value;

    if (oldestKey === undefined) {
      break;
    }

    map.delete(oldestKey);
  }
}
""",
    "bounded cache helper",
)

old_mobile = '''function setMobileCommunityOpen(open) {
  const shouldOpen =
    Boolean(open) &&
    isMobileCommunityViewport() &&
    !document.body?.classList.contains("cn-member-rail-disabled") &&
    !document.body?.classList.contains("cn-shell-hidden");

  document.body?.classList.toggle("cn-mobile-community-open", shouldOpen);

  const button = document.querySelector(".cn-mobile-community-toggle");
  const backdrop = document.querySelector(".cn-mobile-community-backdrop");
  const rail = document.querySelector(".cn-member-rail");

  button?.setAttribute("aria-expanded", String(shouldOpen));
  backdrop?.setAttribute("aria-hidden", String(!shouldOpen));
  backdrop?.setAttribute("tabindex", shouldOpen ? "0" : "-1");

  if (isMobileCommunityViewport()) {
    rail?.setAttribute("aria-hidden", String(!shouldOpen));
  } else {
    rail?.removeAttribute("aria-hidden");
  }
}
'''
new_mobile = '''function setMobileCommunityOpen(open) {
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
'''
js = replace_once(js, old_mobile, new_mobile, "mobile drawer focus")

js = replace_once(
    js,
    '''    .then((payload) => profileBannerUrlFromPayload(payload))
    .catch(() => "");

  userCardProfileBannerCache.set(key, request);
''',
    '''    .then((payload) => profileBannerUrlFromPayload(payload))
    .catch(() => {
      userCardProfileBannerCache.delete(key);
      return "";
    });

  setBoundedMap(userCardProfileBannerCache, key, request);
''',
    "profile banner cache",
)

js = replace_once(
    js,
    '''  communityRequestCache.set(path, {
    expiresAt: now + maxAgeMilliseconds,
    promise,
  });
''',
    '''  setBoundedMap(communityRequestCache, path, {
    expiresAt: now + maxAgeMilliseconds,
    promise,
  });
''',
    "community cache",
)

js = replace_once(
    js,
    "  recordedProfileVisits.set(key, now);\n",
    "  setBoundedMap(recordedProfileVisits, key, now);\n",
    "profile visit cache",
)

old_normalize = '''function normalizeUrl(value, fallback) {
  const candidate = String(value || "").trim();

  if (/^\\/(?!\\/)/.test(candidate) || /^https?:\\/\\//i.test(candidate)) {
    return candidate;
  }

  return fallback;
}
'''
new_normalize = '''function normalizeUrl(value, fallback) {
  const candidate = String(value || fallback).trim();

  try {
    const url = new URL(candidate, window.location.origin);

    if (url.origin !== window.location.origin) {
      return getURL(fallback);
    }

    return `${getURL(url.pathname)}${url.search}${url.hash}`;
  } catch {
    return getURL(fallback);
  }
}
'''
js = replace_once(js, old_normalize, new_normalize, "same-origin shell links")

js = replace_once(
    js,
    '''  if (!list || !count) {
    return;
  }

  const profileUsername = getProfileUsernameFromPath();
''',
    '''  if (!list || !count) {
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
''',
    "member rail hidden guard",
)

js = replace_once(
    js,
    '''    memberRefreshTimer = window.setInterval(() => {
      communityRequestCache.delete("/crimson-community/online.json");
      scheduleMemberRender();
    }, 15_000);
''',
    '''    memberRefreshTimer = window.setInterval(() => {
      if (
        document.visibilityState === "hidden" ||
        document.body?.classList.contains("cn-member-rail-disabled") ||
        document.body?.classList.contains("cn-shell-hidden")
      ) {
        return;
      }

      communityRequestCache.delete("/crimson-community/online.json");
      scheduleMemberRender();
    }, 15_000);
''',
    "polling visibility guard",
)

js = replace_once(
    js,
    '''  const scheduleMemberRender = () => {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(renderMemberRail, 180);
  };

  const bindOutletObserver = () => {
''',
    '''  const scheduleMemberRender = () => {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(renderMemberRail, 180);
  };

  if (document.body?.dataset.cnVisibilityBound !== "true") {
    document.body.dataset.cnVisibilityBound = "true";
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        scheduleMemberRender();
      }
    });
  }

  const bindOutletObserver = () => {
''',
    "visibility refresh",
)

js_path.write_text(js)

body_path = Path("common/body_tag.html")
body = body_path.read_text()
body = replace_once(
    body,
    '''  class="cn-member-rail"
  aria-label="Bu sayfadaki üyeler"
>''',
    '''  class="cn-member-rail"
  aria-label="Bu sayfadaki üyeler"
  tabindex="-1"
>''',
    "member rail focus target",
)
body_path.write_text(body)

common_path = Path("common/common.scss")
common = common_path.read_text()
common = replace_once(
    common,
    '''html {
  background: var(--cn-noir);
}''',
    '''html {
  background: var(--secondary);
}''',
    "light mode root background",
)
common_path.write_text(common)

desktop_path = Path("desktop/desktop.scss")
desktop = desktop_path.read_text()
desktop = replace_once(
    desktop,
    '''    inset: var(
        --cn-member-user-card-top,
        calc(var(--header-offset, 60px) + 10px)
      )
      calc(var(--cn-member-rail-width) + 12px) auto auto !important;
''',
    '''    inset-block-start: var(
      --cn-member-user-card-top,
      calc(var(--header-offset, 60px) + 10px)
    ) !important;
    inset-inline-end: calc(var(--cn-member-rail-width) + 12px) !important;
    inset-block-end: auto !important;
    inset-inline-start: auto !important;
''',
    "logical member card placement",
)
desktop += '''
@media (1000px <= width < 1280px) {
  .cn-server-button--members {
    display: none;
  }
}
'''
desktop_path.write_text(desktop)

mobile_path = Path("mobile/mobile.scss")
mobile = mobile_path.read_text()
anchor = '''body.cn-mobile-community-open .cn-member-rail {
  visibility: visible;
  opacity: 1;
  transform: translateX(0);
  transition-delay: 0s;
}
'''
replacement = anchor + '''
html[dir="rtl"] .cn-member-rail {
  transform: translateX(-105%);
}

html[dir="rtl"] body.cn-mobile-community-open .cn-member-rail {
  transform: translateX(0);
}
'''
mobile = replace_once(mobile, anchor, replacement, "rtl mobile drawer")
mobile_path.write_text(mobile)
