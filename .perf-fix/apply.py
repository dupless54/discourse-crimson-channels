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
    """let memberRailRenderVersion = 0;\nconst MAX_USER_CACHE_ENTRIES = 128;\nlet mobileCommunityReturnFocus = null;\n""",
    """let memberRailRenderVersion = 0;\nconst MAX_USER_CACHE_ENTRIES = 128;\nconst MAX_FEATURED_CACHE_ENTRIES = 32;\nlet mobileCommunityReturnFocus = null;\nlet relativeTimeFormatter;\nlet relativeTimeFormatterLocale = \"\";\n""",
    "performance constants",
)

js = replace_once(
    js,
    """function normalizeFeaturedCategoryPath(value) {\n""",
    """function stripDiscourseBasePath(path) {\n  const normalizedPath = String(path || \"/\");\n  const basePath = getURL(\"/\").replace(/\\/+$/, \"\");\n\n  if (\n    basePath &&\n    basePath !== \"/\" &&\n    (normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`))\n  ) {\n    return normalizedPath.slice(basePath.length) || \"/\";\n  }\n\n  return normalizedPath;\n}\n\nfunction normalizeFeaturedCategoryPath(value) {\n""",
    "subfolder path helper",
)

js = replace_once(
    js,
    """    const path = url.pathname\n      .replace(/\\.json$/i, \"\")\n      .replace(/\\/l\\/[^/]+$/i, \"\")\n      .replace(/\\/+$/, \"\");\n\n    return /^\\/c\\/(?:[^/]+\\/)+\\d+$/i.test(path) ? path : \"\";\n""",
    """    const path = stripDiscourseBasePath(\n      url.pathname\n        .replace(/\\.json$/i, \"\")\n        .replace(/\\/l\\/[^/]+$/i, \"\")\n        .replace(/\\/+$/, \"\")\n    );\n\n    return /^\\/c\\/(?:[^/]+\\/)+\\d+$/i.test(path) ? path : \"\";\n""",
    "featured category subfolder normalization",
)

js = replace_once(
    js,
    """    return url.pathname.replace(/\\/+$/, \"\") || \"/\";\n""",
    """    return (\n      stripDiscourseBasePath(url.pathname.replace(/\\/+$/, \"\")) || \"/\"\n    );\n""",
    "route subfolder normalization",
)

js = replace_once(
    js,
    """function avatarUrlFromTemplate(template, size = 48) {\n  const value = String(template || \"\").replaceAll(\"{size}\", String(size));\n\n  if (value.startsWith(\"/\") || /^https?:\\/\\//i.test(value)) {\n    return value;\n  }\n\n  return \"\";\n}\n""",
    """function avatarUrlFromTemplate(template, size = 48) {\n  const value = String(template || \"\").replaceAll(\"{size}\", String(size));\n\n  if (value.startsWith(\"/\")) {\n    return getURL(stripDiscourseBasePath(value));\n  }\n\n  return /^https?:\\/\\//i.test(value) ? value : \"\";\n}\n""",
    "featured avatar subfolder normalization",
)

js = replace_once(
    js,
    """function formatRelativeActivity(value) {\n""",
    """function getRelativeTimeFormatter() {\n  const locale = document.documentElement.lang || \"tr\";\n\n  if (!relativeTimeFormatter || relativeTimeFormatterLocale !== locale) {\n    relativeTimeFormatter = new Intl.RelativeTimeFormat(locale, {\n      numeric: \"auto\",\n      style: \"short\",\n    });\n    relativeTimeFormatterLocale = locale;\n  }\n\n  return relativeTimeFormatter;\n}\n\nfunction formatRelativeActivity(value) {\n""",
    "relative time formatter cache helper",
)

js = replace_once(
    js,
    """      try {\n        return new Intl.RelativeTimeFormat(\n          document.documentElement.lang || \"tr\",\n          {\n            numeric: \"auto\",\n            style: \"short\",\n          }\n        ).format(Math.round(seconds / length), unit);\n      } catch {\n""",
    """      try {\n        return getRelativeTimeFormatter().format(\n          Math.round(seconds / length),\n          unit\n        );\n      } catch {\n""",
    "relative time formatter reuse",
)

js = replace_once(
    js,
    """  const promise = fetch(`${categoryPath}/l/latest.json`, {\n""",
    """  const promise = fetch(getURL(`${categoryPath}/l/latest.json`), {\n""",
    "featured fetch getURL",
)

js = replace_once(
    js,
    """  featuredTopicsCache.set(categoryPath, {\n    promise,\n    expiresAt: Date.now() + 60_000,\n  });\n""",
    """  setBoundedMap(\n    featuredTopicsCache,\n    categoryPath,\n    {\n      promise,\n      expiresAt: Date.now() + 60_000,\n    },\n    MAX_FEATURED_CACHE_ENTRIES\n  );\n""",
    "bounded featured cache",
)

js = replace_once(
    js,
    """  more.href = `${config.categoryPath}/l/latest`;\n""",
    """  more.href = getURL(`${config.categoryPath}/l/latest`);\n""",
    "featured more link getURL",
)

js = replace_once(
    js,
    """      avatar.href = `/u/${encodeURIComponent(username)}`;\n""",
    """      avatar.href = getURL(`/u/${encodeURIComponent(username)}`);\n""",
    "featured user link getURL",
)

js = replace_once(
    js,
    """      image.src = avatarUrl;\n      image.alt = \"\";\n      image.loading = \"lazy\";\n""",
    """      image.src = avatarUrl;\n      image.alt = \"\";\n      image.width = 48;\n      image.height = 48;\n      image.loading = \"lazy\";\n      image.decoding = \"async\";\n""",
    "featured avatar dimensions",
)

js = replace_once(
    js,
    """    link.href = `/t/${encodeURIComponent(topic.slug || \"topic\")}/${topic.id}`;\n""",
    """    link.href = getURL(\n      `/t/${encodeURIComponent(topic.slug || \"topic\")}/${topic.id}`\n    );\n""",
    "featured topic link getURL",
)

js = replace_once(
    js,
    """    return `${getURL(url.pathname)}${url.search}${url.hash}`;\n""",
    """    return `${getURL(stripDiscourseBasePath(url.pathname))}${url.search}${url.hash}`;\n""",
    "shell link subfolder normalization",
)

js = replace_once(
    js,
    """    avatar.src = member.avatarUrl;\n    avatar.alt = \"\";\n    avatar.loading = \"lazy\";\n""",
    """    avatar.src = member.avatarUrl;\n    avatar.alt = \"\";\n    avatar.width = 34;\n    avatar.height = 34;\n    avatar.loading = \"lazy\";\n    avatar.decoding = \"async\";\n""",
    "member avatar dimensions",
)

js = replace_once(js, """  let observer;\n  let surfaceObserver;\n""", """  let surfaceObserver;\n""", "remove broad observer variable")

js = replace_once(
    js,
    """    if (!document.body) {\n      return;\n    }\n\n    surfaceObserver = new MutationObserver((mutations) => {\n""",
    """    const surfaceRoot = document.querySelector(\"#main-outlet\");\n\n    if (!surfaceRoot) {\n      return;\n    }\n\n    surfaceObserver = new MutationObserver((mutations) => {\n""",
    "scope dynamic observer root",
)

js = replace_once(
    js,
    """    surfaceObserver.observe(document.body, { childList: true, subtree: true });\n  };\n\n  const startMemberRefresh = () => {\n""",
    """    surfaceObserver.observe(surfaceRoot, { childList: true, subtree: true });\n  };\n\n  const memberRailCanRefresh = () => {\n    if (\n      document.visibilityState === \"hidden\" ||\n      document.body?.classList.contains(\"cn-member-rail-disabled\") ||\n      document.body?.classList.contains(\"cn-shell-hidden\")\n    ) {\n      return false;\n    }\n\n    if (isMobileCommunityViewport()) {\n      return document.body.classList.contains(\"cn-mobile-community-open\");\n    }\n\n    return (\n      window.matchMedia(\"(min-width: 1280px)\").matches &&\n      !document.body.classList.contains(\"cn-member-rail-collapsed\")\n    );\n  };\n\n  const startMemberRefresh = () => {\n""",
    "visible member rail refresh helper",
)

js = replace_once(
    js,
    """      if (\n        document.visibilityState === \"hidden\" ||\n        document.body?.classList.contains(\"cn-member-rail-disabled\") ||\n        document.body?.classList.contains(\"cn-shell-hidden\")\n      ) {\n        return;\n      }\n\n      communityRequestCache.delete(\"/crimson-community/online.json\");\n""",
    """      if (!memberRailCanRefresh()) {\n        return;\n      }\n\n      communityRequestCache.delete(\"/crimson-community/online.json\");\n""",
    "visible-only polling",
)

js = replace_once(
    js,
    """      button.addEventListener(\"click\", () => {\n        setMobileCommunityOpen(\n          !document.body.classList.contains(\"cn-mobile-community-open\")\n        );\n      });\n""",
    """      button.addEventListener(\"click\", () => {\n        const shouldOpen = !document.body.classList.contains(\n          \"cn-mobile-community-open\"\n        );\n        setMobileCommunityOpen(shouldOpen);\n\n        if (shouldOpen) {\n          scheduleMemberRender();\n        }\n      });\n""",
    "refresh mobile rail on open",
)

js = replace_once(
    js,
    """    document.addEventListener(\"visibilitychange\", () => {\n      if (document.visibilityState === \"visible\") {\n        scheduleMemberRender();\n      }\n    });\n""",
    """    document.addEventListener(\"visibilitychange\", () => {\n      if (memberRailCanRefresh()) {\n        scheduleMemberRender();\n      }\n    });\n""",
    "visibility refresh guard",
)

old_observer = '''  const bindOutletObserver = () => {\n    observer?.disconnect();\n    const outlet = document.querySelector("#main-outlet");\n\n    if (outlet) {\n      observer = new MutationObserver(() => {\n        scheduleMemberRender();\n        scheduleDynamicSurfaceDecoration();\n      });\n      observer.observe(outlet, {\n        attributes: true,\n        attributeFilter: ["class"],\n        childList: true,\n        subtree: true,\n      });\n    }\n  };\n\n'''
js = replace_once(js, old_observer, "", "remove broad outlet observer")

js = replace_once(
    js,
    """      setPanelCollapsed(collapsed);\n      storePanelState(collapsed);\n""",
    """      setPanelCollapsed(collapsed);\n      storePanelState(collapsed);\n\n      if (!collapsed) {\n        scheduleMemberRender();\n      }\n""",
    "refresh desktop rail on expand",
)

js = js.replace("  bindOutletObserver();\n", "")
if "bindOutletObserver" in js:
    raise SystemExit("broad observer call remained")

old_raf = '''\n  window.requestAnimationFrame(() => {\n    syncThemeSettings();\n    bindToggleButton();\n    scheduleMobileCommunityControls();\n    bindMemberHoverCard();\n    syncRouteState();\n    bindDynamicSurfaceObserver();\n    scheduleDynamicSurfaceDecoration();\n    scheduleMemberRender();\n    scheduleFeaturedTopics();\n  });\n'''
js = replace_once(js, old_raf, "\n", "remove duplicate initializer pass")

js_path.write_text(js)

body_path = Path("common/body_tag.html")
body = body_path.read_text()
body = replace_once(
    body,
    '''  class="cn-member-rail"\n  aria-label="Bu sayfadaki üyeler"\n  tabindex="-1"\n>''',
    '''  class="cn-member-rail"\n  aria-label="Bu sayfadaki üyeler"\n  data-nosnippet\n  tabindex="-1"\n>''',
    "member rail snippet suppression",
)
body_path.write_text(body)

mobile_path = Path("mobile/mobile.scss")
mobile = mobile_path.read_text()
mobile = replace_once(
    mobile,
    '''/* Header community toggle */\n.d-header .wrap {''',
    '''/* Avoid fixed-background repaint cost on touch/mobile scrolling. */\nbody {\n  background-attachment: scroll !important;\n}\n\n/* Header community toggle */\n.d-header .wrap {''',
    "mobile fixed background optimization",
)
mobile_path.write_text(mobile)
