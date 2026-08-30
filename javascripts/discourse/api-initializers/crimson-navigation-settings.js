import { apiInitializer } from "discourse/lib/api";
import getURL from "discourse/lib/get-url";
import { iconElement } from "discourse/lib/icon-library";

/* global settings */

const NAVIGATION_SETTING = "navigation_items";
const MOBILE_SHORTCUT_SELECTOR = ".cn-mobile-servers-link";
const SERVER_RAIL_SELECTOR = ".cn-server-rail";

function parseNavigationItems(value) {
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

function stripDiscourseBasePath(path) {
  const normalizedPath = String(path || "/");
  const basePath = getURL("/").replace(/\/+$/, "");

  if (
    basePath &&
    basePath !== "/" &&
    (normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`))
  ) {
    return normalizedPath.slice(basePath.length) || "/";
  }

  return normalizedPath;
}

function normalizeNavigationUrl(value, fallback = "/") {
  const candidate = String(value || fallback).trim();

  try {
    const url = new URL(candidate, window.location.origin);

    if (url.origin !== window.location.origin) {
      return getURL(fallback);
    }

    return `${getURL(stripDiscourseBasePath(url.pathname))}${url.search}${url.hash}`;
  } catch {
    return getURL(fallback);
  }
}

function visibleNavigationItems() {
  return parseNavigationItems(settings?.[NAVIGATION_SETTING]).filter((item) => {
    if (!item || item.enabled === false) {
      return false;
    }

    if (item.visibility === "groups") {
      return item.user_in_groups === true;
    }

    return true;
  });
}

function navigationKey(item, index) {
  const key = String(item?.key || "").trim();
  return key ? `object-${key}` : `object-${index}`;
}

function createNavigationLink(item, index) {
  const link = document.createElement("a");
  const label = String(item?.label || "").trim() || "Bağlantı";
  const isBrand = index === 0 && item?.style === "brand";

  link.className = "cn-server-button";
  link.dataset.cnLink = navigationKey(item, index);
  link.dataset.cnObjectNavigation = "true";
  link.href = normalizeNavigationUrl(item?.url, "/");
  link.setAttribute("aria-label", label);
  link.dataset.label = label;

  if (isBrand) {
    const brand = document.createElement("span");
    const brandText = String(settings?.brand_initial || "S").trim() || "S";

    link.classList.add("cn-server-button--brand");
    brand.dataset.cnBrandInitial = "";
    brand.textContent = brandText.slice(0, 3);
    link.appendChild(brand);
  } else {
    const icon = iconElement(String(item?.icon || "circle"));

    if (icon) {
      link.appendChild(icon);
    }
  }

  return link;
}

function syncNavigationActiveState() {
  const currentPath = window.location.pathname || "/";

  for (const link of document.querySelectorAll(
    `${SERVER_RAIL_SELECTOR} [data-cn-object-navigation="true"]`
  )) {
    let targetPath = "/";

    try {
      targetPath = new URL(link.href, window.location.origin).pathname;
    } catch {
      // Keep the safe root fallback.
    }

    const isActive =
      targetPath === "/"
        ? currentPath === targetPath
        : currentPath === targetPath ||
          currentPath.startsWith(`${targetPath}/`);

    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  }
}

function renderNavigationRail() {
  const rail = document.querySelector(SERVER_RAIL_SELECTOR);
  const spacer = rail?.querySelector(".cn-server-rail__spacer");
  const separator = rail?.querySelector(".cn-server-rail__separator");
  const items = visibleNavigationItems();

  if (!rail || !spacer || !items.length) {
    return false;
  }

  for (const link of rail.querySelectorAll("a.cn-server-button")) {
    link.remove();
  }

  separator?.remove();

  const fragment = document.createDocumentFragment();
  const firstIsBrand = items[0]?.style === "brand";

  items.forEach((item, index) => {
    fragment.appendChild(createNavigationLink(item, index));

    if (firstIsBrand && index === 0 && items.length > 1) {
      const divider = separator || document.createElement("span");
      divider.className = "cn-server-rail__separator";
      divider.setAttribute("aria-hidden", "true");
      fragment.appendChild(divider);
    }
  });

  rail.insertBefore(fragment, spacer);
  syncNavigationActiveState();
  return true;
}

function syncMobileShortcut(items, attempt = 0) {
  const shortcutItem = items.find((item) => item.mobile_shortcut === true);
  const link = document.querySelector(MOBILE_SHORTCUT_SELECTOR);

  if (!link) {
    if (attempt < 7) {
      window.setTimeout(() => syncMobileShortcut(items, attempt + 1), 150);
    }
    return;
  }

  const listItem = link.closest("li");

  if (!shortcutItem) {
    listItem?.setAttribute("hidden", "");
    return;
  }

  listItem?.removeAttribute("hidden");

  const label = String(shortcutItem.label || "").trim() || "Kısayol";
  link.href = normalizeNavigationUrl(shortcutItem.url, "/");
  link.setAttribute("aria-label", label);

  const icon = iconElement(String(shortcutItem.icon || "circle"));
  if (icon) {
    link.replaceChildren(icon);
  }
}

export default apiInitializer((api) => {
  let renderTimer;

  const render = (attempt = 0) => {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(
      () => {
        const items = visibleNavigationItems();
        const rendered = renderNavigationRail();

        if (!rendered && attempt < 7) {
          render(attempt + 1);
          return;
        }

        syncNavigationActiveState();
        syncMobileShortcut(items);
      },
      attempt === 0 ? 0 : 150
    );
  };

  render();

  api.onPageChange(() => {
    render();
  });
});
