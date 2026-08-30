import { apiInitializer } from "discourse/lib/api";

/* global settings */

const DEFAULT_ACCENT = "#5865f2";
const DEFAULT_SECONDARY_ACCENT = "#7c3aed";
const LEGACY_DEFAULT_ACCENTS = new Set(["#c50337", "c50337"]);
const SURFACE_STYLES = new Set(["balanced", "flat", "glass"]);
const CORNER_STYLES = new Set(["compact", "soft", "rounded"]);

const CORNER_PRESETS = {
  compact: {
    xs: 4,
    sm: 7,
    md: 10,
    lg: 14,
  },
  soft: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
  },
  rounded: {
    xs: 8,
    sm: 13,
    md: 18,
    lg: 24,
  },
};

const SURFACE_PRESETS = {
  balanced: {
    surfaceSecondary: 96,
    surfacePrimary: 4,
    raisedSecondary: 91,
    raisedPrimary: 9,
    controlSecondary: 93,
    controlPrimary: 7,
    separatorPrimary: 10,
    neutralBorderScale: 0.28,
    baseShadowOpacity: 0.24,
  },
  flat: {
    surfaceSecondary: 98,
    surfacePrimary: 2,
    raisedSecondary: 95,
    raisedPrimary: 5,
    controlSecondary: 96,
    controlPrimary: 4,
    separatorPrimary: 12,
    neutralBorderScale: 0.34,
    baseShadowOpacity: 0.14,
  },
  glass: {
    surfaceSecondary: 93,
    surfacePrimary: 7,
    raisedSecondary: 88,
    raisedPrimary: 12,
    controlSecondary: 90,
    controlPrimary: 10,
    separatorPrimary: 12,
    neutralBorderScale: 0.24,
    baseShadowOpacity: 0.28,
  },
};

function getSetting(name, fallback) {
  const value = settings?.[name];
  return value === undefined || value === null ? fallback : value;
}

function getNumberSetting(name, fallback, min, max) {
  const value = Number(getSetting(name, fallback));
  const normalized = Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, normalized));
}

function getEnumSetting(name, fallback, allowedValues) {
  const value = String(getSetting(name, fallback)).trim().toLowerCase();
  return allowedValues.has(value) ? value : fallback;
}

function normalizeHexColor(value, fallback) {
  const candidate = String(value || "").trim();
  const match = candidate.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);

  if (!match) {
    return fallback;
  }

  let hex = match[1].toLowerCase();

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((character) => character.repeat(2))
      .join("");
  }

  return `#${hex}`;
}

function srgbChannelToLinear(channel) {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex) {
  const red = Number.parseInt(hex.slice(1, 3), 16);
  const green = Number.parseInt(hex.slice(3, 5), 16);
  const blue = Number.parseInt(hex.slice(5, 7), 16);

  return (
    0.2126 * srgbChannelToLinear(red) +
    0.7152 * srgbChannelToLinear(green) +
    0.0722 * srgbChannelToLinear(blue)
  );
}

function hasReadableWhiteText(hex) {
  const contrastRatio = 1.05 / (relativeLuminance(hex) + 0.05);
  return contrastRatio >= 4.5;
}

function getAccessibleAccent(settingName, fallback, legacyValues = new Set()) {
  const rawValue = String(getSetting(settingName, fallback)).trim().toLowerCase();
  const migratedValue = legacyValues.has(rawValue) ? fallback : rawValue;
  const accent = normalizeHexColor(migratedValue, fallback);

  return hasReadableWhiteText(accent) ? accent : fallback;
}

function setCornerVariables(root, cornerStyle) {
  const preset = CORNER_PRESETS[cornerStyle];

  for (const [size, radius] of Object.entries(preset)) {
    root.style.setProperty(`--cn-radius-${size}`, `${radius}px`);
  }
}

function setAccentVariables(root) {
  const primaryAccent = getAccessibleAccent(
    "visual_accent_color",
    DEFAULT_ACCENT,
    LEGACY_DEFAULT_ACCENTS
  );
  const secondaryAccent = getAccessibleAccent(
    "visual_secondary_accent_color",
    DEFAULT_SECONDARY_ACCENT
  );

  root.style.setProperty("--cn-crimson", primaryAccent);
  root.style.setProperty("--cn-violet", secondaryAccent);
  root.style.setProperty(
    "--cn-accent-mix",
    "color-mix(in srgb, var(--cn-crimson) 58%, var(--cn-violet) 42%)"
  );
  root.style.setProperty("--cn-accent-start", primaryAccent);
  root.style.setProperty("--cn-accent-end", secondaryAccent);
  root.style.setProperty("--cn-on-accent", "#fff");
  root.style.setProperty(
    "--cn-action-gradient",
    "linear-gradient(135deg, var(--cn-crimson), var(--cn-accent-mix) 52%, var(--cn-violet))"
  );
  root.style.setProperty(
    "--cn-action-gradient-hover",
    "linear-gradient(135deg, color-mix(in srgb, var(--cn-crimson) 90%, var(--primary) 10%), var(--cn-accent-mix) 52%, color-mix(in srgb, var(--cn-violet) 90%, var(--primary) 10%))"
  );
}

function setSurfaceVariables(root, surfaceStyle) {
  const preset = SURFACE_PRESETS[surfaceStyle];
  const panelOpacity =
    getNumberSetting("visual_panel_opacity_percent", 94, 72, 100) / 100;
  const strongPanelOpacity = Math.min(1, panelOpacity + 0.04);
  const borderIntensity = getNumberSetting(
    "visual_border_intensity_percent",
    28,
    20,
    70
  );
  const glowIntensity = getNumberSetting(
    "visual_glow_intensity_percent",
    12,
    0,
    100
  );

  root.style.setProperty(
    "--cn-panel",
    `rgb(var(--secondary-rgb), ${panelOpacity.toFixed(2)})`
  );
  root.style.setProperty(
    "--cn-panel-strong",
    `rgb(var(--secondary-rgb), ${strongPanelOpacity.toFixed(2)})`
  );
  root.style.setProperty(
    "--cn-surface",
    `color-mix(in srgb, var(--secondary) ${preset.surfaceSecondary}%, var(--primary) ${preset.surfacePrimary}%)`
  );
  root.style.setProperty(
    "--cn-surface-raised",
    `color-mix(in srgb, var(--secondary) ${preset.raisedSecondary}%, var(--primary) ${preset.raisedPrimary}%)`
  );
  root.style.setProperty(
    "--cn-control",
    `color-mix(in srgb, var(--secondary) ${preset.controlSecondary}%, var(--primary) ${preset.controlPrimary}%)`
  );
  root.style.setProperty(
    "--cn-separator",
    `color-mix(in srgb, var(--primary) ${preset.separatorPrimary}%, transparent)`
  );

  if (surfaceStyle === "flat") {
    const neutralBorderIntensity = Math.max(
      8,
      Math.round(borderIntensity * preset.neutralBorderScale)
    );
    root.style.setProperty(
      "--cn-border",
      `color-mix(in srgb, var(--primary) ${neutralBorderIntensity}%, transparent)`
    );
  } else {
    root.style.setProperty(
      "--cn-border",
      `color-mix(in srgb, var(--cn-accent-mix) ${borderIntensity}%, transparent)`
    );
  }

  const outlineIntensity = Math.max(9, Math.round(borderIntensity * 0.25));
  const outlineHoverIntensity = Math.max(
    15,
    Math.round(borderIntensity * 0.42)
  );
  const hoverIntensity = Math.max(6, Math.round(borderIntensity * 0.24));
  const activeIntensity = Math.max(10, Math.round(borderIntensity * 0.38));

  root.style.setProperty(
    "--cn-control-outline",
    `color-mix(in srgb, var(--primary) ${outlineIntensity}%, transparent)`
  );
  root.style.setProperty(
    "--cn-control-outline-hover",
    `color-mix(in srgb, var(--cn-accent-mix) ${outlineHoverIntensity}%, transparent)`
  );
  root.style.setProperty(
    "--cn-hover",
    `color-mix(in srgb, var(--cn-accent-mix) ${hoverIntensity}%, transparent)`
  );
  root.style.setProperty(
    "--cn-active",
    `color-mix(in srgb, var(--cn-accent-mix) ${activeIntensity}%, transparent)`
  );

  const glowMix = Math.round(glowIntensity * 0.22);
  const shadowLayers = [
    `0 14px 34px rgb(2 6 14 / ${preset.baseShadowOpacity})`,
    "inset 0 1px 0 color-mix(in srgb, var(--primary) 7%, transparent)",
  ];

  if (glowMix > 0) {
    shadowLayers.splice(
      1,
      0,
      `0 0 22px color-mix(in srgb, var(--cn-accent-mix) ${glowMix}%, transparent)`
    );
  }

  root.style.setProperty("--cn-shadow", shadowLayers.join(", "));
}

function syncVisualFoundation() {
  const root = document.documentElement;
  const surfaceStyle = getEnumSetting(
    "visual_surface_style",
    "balanced",
    SURFACE_STYLES
  );
  const cornerStyle = getEnumSetting(
    "visual_corner_style",
    "soft",
    CORNER_STYLES
  );

  setAccentVariables(root);
  root.dataset.cnSurfaceStyle = surfaceStyle;
  root.dataset.cnCornerStyle = cornerStyle;

  setCornerVariables(root, cornerStyle);
  setSurfaceVariables(root, surfaceStyle);
}

export default apiInitializer(() => {
  syncVisualFoundation();
});
