const LEGACY_DEFAULTS = {
  home_url: "/",
  categories_url: "/categories",
  latest_url: "/latest",
  servers_url: "/servers",
  chat_url: "/chat",
};

function legacyValue(settings, key) {
  return settings.has(key) ? settings.get(key) : LEGACY_DEFAULTS[key];
}

export default function migrate(settings) {
  if (settings.has("navigation_items")) {
    return settings;
  }

  const hasLegacyOverrides = Object.keys(LEGACY_DEFAULTS).some((key) =>
    settings.has(key)
  );

  if (!hasLegacyOverrides) {
    return settings;
  }

  const items = [
    {
      key: "home",
      enabled: true,
      label: "Ana sayfa",
      url: legacyValue(settings, "home_url"),
      icon: "house",
      style: "brand",
      visibility: "everyone",
      mobile_shortcut: false,
    },
    {
      key: "categories",
      enabled: true,
      label: "Kategoriler",
      url: legacyValue(settings, "categories_url"),
      icon: "list",
      style: "standard",
      visibility: "everyone",
      mobile_shortcut: false,
    },
    {
      key: "latest",
      enabled: true,
      label: "Son konular",
      url: legacyValue(settings, "latest_url"),
      icon: "clock",
      style: "standard",
      visibility: "everyone",
      mobile_shortcut: false,
    },
    {
      key: "servers",
      enabled: true,
      label: "Private Serverlar",
      url: legacyValue(settings, "servers_url"),
      icon: "server",
      style: "standard",
      visibility: "everyone",
      mobile_shortcut: true,
    },
    {
      key: "chat",
      enabled: true,
      label: "Sohbet",
      url: legacyValue(settings, "chat_url"),
      icon: "comments",
      style: "standard",
      visibility: "everyone",
      mobile_shortcut: false,
    },
  ];

  settings.set("navigation_items", items);
  return settings;
}
