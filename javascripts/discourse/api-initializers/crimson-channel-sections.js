import { apiInitializer } from "discourse/lib/api";
import getURL from "discourse/lib/get-url";
import Category from "discourse/models/category";
import { getSetting, stripDiscourseBasePath } from "../lib/crimson/settings";

const CATEGORY_CURRENT_WHEN =
  "discovery.unreadCategory discovery.hotCategory discovery.topCategory discovery.newCategory discovery.latestCategory discovery.category discovery.categoryNone discovery.categoryAll";
const TAG_CURRENT_WHEN =
  "tag.show tag.showNew tag.showUnread tag.showTop tag.showHot tag.showLatest";

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

function firstValue(value) {
  return Array.isArray(value) ? value[0] : undefined;
}

function resolveChannelTarget(channel) {
  const configuredType = String(channel?.target_type || "").trim();
  const targetType = configuredType || "url";

  if (targetType === "url") {
    const href = normalizeInternalHref(channel?.url);
    return href ? { href } : null;
  }

  if (targetType === "category") {
    const category = Category.findById(firstValue(channel?.category_ids));

    if (!category) {
      return null;
    }

    return {
      route: "discovery.category",
      model: `${Category.slugFor(category)}/${category.id}`,
      currentWhen: CATEGORY_CURRENT_WHEN,
      prefixColor: category.color,
    };
  }

  if (targetType === "tag") {
    const tagName = String(firstValue(channel?.tags) || "").trim();

    if (!tagName) {
      return null;
    }

    return {
      route: "tag.legacyRedirect",
      model: tagName,
      currentWhen: TAG_CURRENT_WHEN,
    };
  }

  return null;
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
          const target = resolveChannelTarget(channel);
          const icon = String(channel?.icon || "").trim();
          const badgeText = String(channel?.badge_text || "").trim();

          if (!label || !target || !icon) {
            return null;
          }

          return {
            name: `crimson-channel-${sectionIndex}-${channelIndex}`,
            label,
            target,
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
            href = channel.target.href;
            route = channel.target.route;
            model = channel.target.model;
            title = channel.label;
            text = channel.label;
            prefixType = "icon";
            prefixValue = channel.icon;
            prefixColor = channel.target.prefixColor;
            badgeText = channel.badgeText || undefined;

            get currentWhen() {
              return (
                channel.target.currentWhen || isActiveHref(channel.target.href)
              );
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
