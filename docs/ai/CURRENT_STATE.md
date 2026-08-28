# Current State

## Main
- state: bootstrap merged and Official Discourse Theme CI verified GREEN
- repository: `dupless54/discourse-crimson-channels`
- base branch: `main`
- main SHA after bootstrap merge: `61698e5cdf1b73567d5a2f04f3bc48ea47d0bbc8`
- last verified: 2026-08-29

## Active work
- branch: `fix/security-visual-audit`
- PR: #2 — `FIX: harden Crimson Channels security and responsive UI`
- scope: security/robustness, responsive/accessibility, theme-level SEO compatibility, and bounded runtime performance fixes
- runtime paths: `javascripts/discourse/api-initializers/crimson-channels.js`, `common/body_tag.html`, `common/common.scss`, `desktop/desktop.scss`, `mobile/mobile.scss`
- verification helper: `.github/workflows/apply-seo-performance-fixes.yml` is retired to manual, read-only lint verification only

## Security and visual fixes
- shell navigation settings are constrained to same-origin Discourse URLs
- user/community/profile-visit caches are bounded and transient profile-banner failures can retry
- mobile community drawer restores focus; RTL drawer/card positioning is direction-safe
- light-mode overscroll follows the active Discourse color scheme
- the member toggle is hidden in the 1000–1279px range where the desktop member rail is unavailable
- no raw HTML injection, `eval`, dynamic `Function`, or `javascript:` execution path was found in the audited theme runtime

## SEO compatibility audit
- no theme-owned canonical, robots, sitemap, meta-description, or JSON-LD override was found; these remain owned by Discourse core
- custom shell/community boilerplate is marked `data-nosnippet` so it cannot pollute Google result snippets
- featured category/topic/user links and fetches use Discourse `getURL()` routing and support subfolder installations without double-prefixing
- native topic/category/profile content remains in Discourse's normal outlet; the theme does not replace crawler/server-rendered content
- overall site indexing, Search Console state, site title/description, HTTP headers, and sitemap availability are server/admin concerns and are not provable from theme CI alone

## Performance and optimization fixes
- removed the broad `#main-outlet` MutationObserver that scheduled member re-renders on general SPA DOM churn
- remaining dynamic-surface observer is scoped to `#main-outlet` and reacts only to relevant collapsed-profile insertions
- removed the duplicate initial `requestAnimationFrame` initialization pass
- 15-second community refresh now runs only when the member rail/drawer is actually visible; opening/expanding the rail requests a fresh render
- featured-topic cache is bounded; `Intl.RelativeTimeFormat` is reused per locale
- dynamically-created featured/member avatars include intrinsic dimensions, lazy loading, and async decoding to reduce layout shift and main-thread decode pressure
- mobile disables fixed-background attachment to reduce scroll repaint cost

## Validation
- SEO/performance patch application: GREEN
- ESLint: GREEN
- Stylelint: GREEN
- Prettier: GREEN
- TypeScript/Glint types: GREEN
- final exact changed paths and Official reusable Discourse Theme CI must be re-verified after this state commit
- live Lighthouse/Core Web Vitals/Search Console/crawler smoke test is not available from GitHub CI alone

## Known blockers
- no known theme-code blocker
- PR merge remains blocked until latest exact PR head has Official Discourse Theme CI GREEN and receives explicit merge authorization

## Next action
- verify final PR #2 changed paths and latest exact-head Official Discourse Theme CI; keep the PR ready for explicit merge approval

Rules: no history dump; refresh stale SHA/CI claims; `NO_CI != GREEN`.
