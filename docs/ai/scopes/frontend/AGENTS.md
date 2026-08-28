# Crimson Channels Frontend Scoped Rules

## Read order
1. Exact target file/symbol.
2. Its directly coupled styles/markup/settings.
3. Only then adjacent theme code.

## Runtime map
- `common/body_tag.html`: persistent custom shell markup (server rail + community member rail).
- `javascripts/discourse/api-initializers/crimson-channels.js`: shell behavior, route sync, featured topics, community data, user-card integration, mobile controls.
- `common/common.scss`: shared visual system and most Discord-like component styling.
- `desktop/desktop.scss`: wide-screen rail/content geometry.
- `mobile/mobile.scss`: compact navigation, community drawer, mobile overrides.

## Rules
- Follow current Discourse theme/Glimmer/Ember conventions.
- Prefer `apiInitializer` and supported theme APIs; avoid new global listeners/observers unless no supported seam exists.
- Render untrusted user data with DOM text properties, never raw HTML injection.
- Preserve keyboard/focus behavior, reduced-motion compatibility, and usable narrow-screen layouts.
- Preserve Discourse CSS variables so light/dark/custom color schemes continue to work.
- Treat `/crimson-community/*` as an optional cross-plugin dependency: failures must degrade to empty/non-blocking UI, never break the forum shell.
- Any change to endpoint paths/payload assumptions is T2 and requires `docs/ai/DECISIONS.md` plus targeted call-site review.
- Keep AI metadata out of runtime source directories.
