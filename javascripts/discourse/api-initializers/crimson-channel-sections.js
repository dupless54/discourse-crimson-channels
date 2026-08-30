import { apiInitializer } from "discourse/lib/api";
import getURL from "discourse/lib/get-url";
import { getSetting, stripDiscourseBasePath } from "../lib/crimson/settings";

function objectSetting(name) {
  const value = getSetting(name, []);

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

function isVisible(item) {
  if (!item || item.enabled === false) {
    return false;
  }

  if (item.visibility === "groups") {
    return item.user_in_groups === true;
  }

  return true;
}

function normalizeInternalHref(value) {
  const candidate = String(value || "").trim();

  if (!candidate) {
    return "";
  }

  try {
    const url = new URL(candidate, window.location.origin);

    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.origin !== window.location.origin
    ) {
      return "";
    }

    return `${getURL(stripDiscourseBasePath(url.pathname))}${url.search}${url.hash}`;
  } catch {
    return "";
  }
}

function normalizedPath(value) {
  try {
    const url = new URL(value, window.location.origin);
    return stripDiscourseBasePath(url.pathname).replace(/\/+$/, "") || "/";
  } catch {
    return "/";
  }
}

function isActiveHref(href) {
  const currentPath = normalizedPath(window.location.pathname);
  const targetPath = normalizedPath(href);

  return targetPath === "/"
    ? currentPath === "/"
    : currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

function configuredSections() {
  return objectSetting("channel_sections")
    .map((section, sectionIndex) => {
      if (!isVisible(section)) {
        return null;
      }

      const title = String(section?.title || "").trim();

      if (!title) {
        return null;
      }

      const channels = Array.isArray(section?.channels) ? section.channels : [];
      const links = channels
        .map((channel, channelIndex) => {
          if (!isVisible(channel)) {
            return null;
          }

          const label = String(channel?.label || "").trim();
          const href = normalizeInternalHref(channel?.url);
          const icon = String(channel?.icon || "").trim();
          const badgeText = String(channel?.badge_text || "").trim();

          if (!label || !href || !icon) {
            return null;
          }

          return {
            name: `crimson-channel-${sectionIndex}-${channelIndex}`,
            label,
            href,
            icon,
            badgeText,
          };
        })
        .filter(Boolean);

      if (!links.length) {
        return null;
      }

      return {
        name: `crimson-channel-section-${sectionIndex}`,
        title,
        collapsedByDefault: section?.collapsed_by_default === true,
        links,
      };
    })
    .filter(Boolean);
}

export default apiInitializer((api) => {
  for (const section of configuredSections()) {
    api.addSidebarSection(
      (BaseCustomSidebarSection, BaseCustomSidebarSectionLink) => {
        const links = section.links.map((channel) => {
          return new (class extends BaseCustomSidebarSectionLink {
            name = channel.name;
            classNames = "cn-channel-section-link";
            href = channel.href;
            title = channel.label;
            text = channel.label;
            prefixType = "icon";
            prefixValue = channel.icon;
            badgeText = channel.badgeText || undefined;

            get currentWhen() {
              return isActiveHref(channel.href);
            }

            get keywords() {
              return { navigation: [channel.label] };
            }
          })();
        });

        return class extends BaseCustomSidebarSection {
          name = section.name;
          title = section.title;
          text = section.title;
          collapsedByDefault = section.collapsedByDefault;
          links = links;
        };
      }
    );
  }
});
