# Crimson Channels Frontend Scoped Rules

Use this file for `common/`, `desktop/`, `mobile/`, `javascripts/`, `stylesheets/`, visual behavior, Glimmer/components/connectors, routing UI, icons, and responsive styling.

## Read order
1. Exact target file/symbol.
2. Its directly coupled styles/markup/settings.
3. `docs/ai/scopes/theme-config/AGENTS.md` only if settings/assets/i18n/about.json are involved.
4. `docs/ai/scopes/testing/AGENTS.md` when behavior needs regression coverage.
5. Only then adjacent theme code or current Discourse core/API definitions.

## Runtime map
- `common/body_tag.html`: persistent custom shell fallback markup (server rail + community member rail).
- `javascripts/discourse/api-initializers/crimson-channels.js`: shell/community orchestration; continue decomposing large responsibilities into `javascripts/discourse/lib/crimson/*` modules.
- `javascripts/discourse/lib/crimson/featured-topics.js`: featured-topic runtime isolated from the main initializer.
- `javascripts/discourse/lib/crimson/settings.js`: shared setting and same-origin URL helpers.
- `javascripts/discourse/lib/crimson/cache.js`: shared bounded-cache helper.
- `javascripts/discourse/api-initializers/crimson-navigation-settings.js`: structured navigation rendering/sync.
- `common/common.scss`: main shared CSS entrypoint; keep it small and import cohesive modules from `stylesheets/` rather than growing a monolith.
- `stylesheets/`: responsibility-focused shared stylesheet modules imported by theme entrypoints.
- `desktop/desktop.scss`: wide-screen rail/content geometry when a breakpoint-specific entrypoint is genuinely needed.
- `mobile/mobile.scss`: compact navigation, community drawer, and mobile-only overrides when common breakpoint styling is insufficient.

## Current Discourse frontend conventions
- Discourse theme JS can be split across `/javascripts` and follows the same file/folder conventions as current Discourse core/plugins. Prefer small responsibility-focused modules over one large initializer.
- Use `javascripts/discourse/api-initializers/*` with `apiInitializer` for Plugin API registration and boot-time integration.
- For substantial UI, prefer modern `.gjs` Glimmer components + supported plugin-outlet connectors. Prefer router/services/Plugin API hooks over DOM polling or broad monkey-patching.
- Theme JS is loaded after core/plugins and same-path files can override them. Treat overriding core/plugin files as a high-maintenance last resort, not a normal extension mechanism.
- Do not add server authorization/business logic to the theme. Theme modifiers are limited predefined hooks, not a backend escape hatch.

## Maintenance hierarchy
Use the lowest-maintenance supported seam that solves the requirement:
1. theme setting / Discourse CSS custom property / additive CSS
2. supported Plugin API method, transformer, outlet/connector, service, or Glimmer component
3. narrowly scoped DOM decoration/listener when no supported seam exists
4. core template/module override only as a documented last resort

When using level 3 or 4, record why supported seams were insufficient and keep selectors/failure behavior defensive.

## JavaScript behavior
- Preserve native Discourse SPA routing. Use Discourse URL helpers for internal links and maintain subfolder support.
- Avoid new global listeners, intervals, or MutationObservers unless a supported API cannot represent the behavior. Scope observers to the smallest stable root and relevant mutations.
- Register user-card/click behavior through the Plugin API when possible rather than synthesizing parallel card systems.
- Render untrusted user/community/topic data with DOM text properties, not raw HTML injection.
- Treat `/crimson-community/*` as an optional cross-plugin dependency: failures, 429s, missing plugin, or malformed payloads must degrade to empty/non-blocking UI and never break core forum navigation/reading.
- Any endpoint-path/payload assumption change is T2 and requires `docs/ai/DECISIONS.md` plus exact call-site review.

## SCSS/CSS organization
- Current Discourse theme CSS uses `common/common.scss` as the main entrypoint. For complex themes, put cohesive additional SCSS modules under root `stylesheets/` and import them from the appropriate common/desktop/mobile entrypoint (for example `@import "my-styles";`).
- Prefer breakpoint-based styling in common/shared modules when practical; current Discourse is moving away from unnecessary duplication across separate desktop/mobile stylesheets.
- Keep desktop/mobile files for genuinely viewport-specific geometry/overrides, not duplicate component definitions.
- Preserve stylesheet import/source order when splitting existing CSS because cascade order is behavior.
- If a styling primitive requires a newer core version, prefer a correct `minimum_discourse_version` over fragile backwards-compatibility hacks.

## Core variables, colors, and dark mode
- Use Discourse CSS custom properties such as `var(--primary)`, `var(--secondary)`, `var(--tertiary)`, `var(--header_background)`, `var(--highlight)`, `var(--danger)`, `var(--success)`, etc. Core SCSS color variables like `$primary` are deprecated for normal theme styling.
- Preserve semantic core colors so admin-selected/custom palettes continue to work.
- Put color values that genuinely need SCSS computation/light-dark selection into `common/color_definitions.scss`, expose them as CSS custom properties, then consume those variables from normal stylesheets.
- Use Discourse light/dark selection helpers where required. Do not base theme mode solely on `prefers-color-scheme`; Discourse users can override automatic dark mode independently of the OS preference.
- Prefer RGB companion custom properties when alpha compositing is required rather than freezing a hex color into CSS.

## Typography
- Respect Discourse's user-selectable text-size system. Prefer relative units and the core `--font-up-*`, `--font-0`, `--font-down-*` scale for component typography.
- If global base sizes are changed, preserve all user text-size tiers rather than changing only one static `html` pixel size.
- Avoid fixed pixel text sizes for general UI when that would defeat the user's interface text-size preference.

## Assets
- Durable Git-theme images/fonts belong in repository `assets/` and are registered via `about.json`; use generated asset variables / `settings.theme_uploads` instead of unstable external/admin-only uploads.
- Never add/share binary font assets through agent context. Follow repository licensing and asset-size constraints.

## Icons
- For admin-selectable icons, prefer `type: icon` theme settings; Discourse automatically adds the selected icon to the sprite.
- For global replacement of existing Discourse icons, use `api.replaceIcon(...)` in an api-initializer. Understand that a global replacement can affect every location using that icon ID.
- For a custom icon set, use a registered SVG spritesheet under theme assets; use unique theme-prefixed symbol IDs, `currentColor`, and valid `viewBox` values.
- If extra built-in icons are needed outside `type: icon`, verify the current supported icon-subset/modifier mechanism instead of assuming an arbitrary icon is bundled.
- Alternative icon packs are preferably isolated as theme components unless the icon system is intrinsic to Crimson Channels.

## Homepage and structural content
- For route-aware custom homepage UI, prefer a Glimmer component rendered through a supported connector/outlet and inspect router state. Do not inject markup globally and hide it everywhere else with CSS.
- Be precise about what "homepage" means: Discourse's configured discovery homepage can map both `/` and a discovery route. If the requirement is root-only, validate current router behavior explicitly.

## Navigation compatibility
- Custom Crimson navigation must never make core Discourse navigation unusable.
- For manual theme checks, preview relevant current navigation modes with `?navigation_menu=sidebar` and `?navigation_menu=header_dropdown`. Verify current core before relying on historically documented options.
- Preserve active state, keyboard focus, `aria-current`, mobile controls, internal-route/subfolder safety, and anonymous/logged-in behavior.

## Post-content styling
- Prefer CSS hooks that Discourse intentionally preserves. For author-controlled special formatting, Discourse permits `data-*` attributes in cooked post content (for example `[wrap=...]` -> `data-wrap`). Style those attributes rather than parsing/replacing arbitrary cooked HTML.
- Wiki-only styling may target the `.wiki` context when the requirement is explicitly limited to wiki posts.
- Do not make post readability depend on unsupported HTML or scripts in cooked content.

## Pseudo-elements
- `::before`/`::after` are acceptable for decorative, non-essential visual content when a stable selector exists.
- Do not use pseudo-elements for required interactive controls, accessibility-critical labels, or data that must be selectable/translated/announced reliably.
- Prefer i18n/site text/component markup when the added text has semantic meaning. Remember pseudo-elements live inside the selected element's formatting box and do not work like siblings of replaced elements such as images.

## Accessibility/responsiveness invariants
- Preserve keyboard/focus behavior, visible focus, correct ARIA state, reduced-motion compatibility, RTL-safe placement where applicable, and usable narrow-screen layouts.
- Avoid fixed geometry that overflows at intermediate widths. Test content growth/long translations, not just ideal Turkish labels.
- Custom shell elements must not cover native composer, header actions, topic controls, or dialogs.

## Specialized/on-demand features
- Custom font component patterns: use only when introducing a licensed repository font is explicitly required.
- Custom Highlight.JS language registration: use the Plugin API hook only for an actual unsupported language requirement; keep language code isolated rather than growing the main initializer.
- Alternative/global/custom SVG icon guides are implementation references, not instructions to replace the whole core icon system by default.

## Official Discourse references — consult on demand
- Developer guides index: https://meta.discourse.org/t/developer-guides-index/308036?tl=en
- Theme development map: https://meta.discourse.org/t/-/93648?silent=true
- Quick reference: https://meta.discourse.org/t/-/110448?silent=true
- Designer guide: https://meta.discourse.org/t/-/152002?silent=true
- Theme structure: https://meta.discourse.org/t/-/60848?silent=true
- Split JS: https://meta.discourse.org/t/-/119369?silent=true
- Current CSS tutorial/source: https://github.com/discourse/discourse/blob/main/docs/developer-guides/docs/07-theme-developer-tutorial/03-css.md
- Core variables: https://meta.discourse.org/t/-/77551?silent=true
- Font sizes/scaling: https://meta.discourse.org/t/-/120927?silent=true
- Theme assets: https://meta.discourse.org/t/-/62459?silent=true
- Custom SVG icons: https://meta.discourse.org/t/-/115736?silent=true
- Automatic dark mode: https://meta.discourse.org/t/-/161595?silent=true
- Theme modifiers: https://meta.discourse.org/t/-/150605?silent=true
- CSS pseudo-elements: https://meta.discourse.org/t/-/99200?silent=true
- Font theme component: https://meta.discourse.org/t/-/62462?silent=true
- Highlight.JS language: https://meta.discourse.org/t/-/292480?silent=true
- Homepage-only content: https://meta.discourse.org/t/-/131415?silent=true
- Global icon replacement: https://meta.discourse.org/t/-/87751?silent=true
- Alternative icons: https://meta.discourse.org/t/-/206693?silent=true
- Wiki styling: https://meta.discourse.org/t/-/78881?silent=true
- Color schemes: https://meta.discourse.org/t/-/61196?silent=true
- Navigation menu preview: https://meta.discourse.org/t/-/258401?silent=true
- Post-content styling: https://meta.discourse.org/t/-/257738?silent=true
- Minimizing maintenance: https://meta.discourse.org/t/-/261388?silent=true
