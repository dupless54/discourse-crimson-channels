import getURL from "discourse/lib/get-url";

/* global settings */

export function getSetting(name, fallback) {
  const value = settings?.[name];
  return value === undefined || value === null ? fallback : value;
}

export function getBooleanSetting(name, fallback = true) {
  const value = getSetting(name, fallback);
  return value !== false && value !== "false" && value !== 0 && value !== "0";
}

export function getNumberSetting(name, fallback, min, max) {
  const value = Number(getSetting(name, fallback));
  const normalized = Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, normalized));
}

export function stripDiscourseBasePath(path) {
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

export function normalizeSameOriginUrl(value, fallback = "/") {
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
