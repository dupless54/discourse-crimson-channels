# Current State

## Main
- state: bootstrap merged and Official Discourse Theme CI verified GREEN
- repository: `dupless54/discourse-crimson-channels`
- base branch: `main`
- main SHA after bootstrap merge: `61698e5cdf1b73567d5a2f04f3bc48ea47d0bbc8`
- last verified: 2026-08-29

## Active work
- branch: `fix/security-visual-audit`
- scope: bounded security/robustness and responsive/accessibility fixes only
- changed runtime paths: `javascripts/discourse/api-initializers/crimson-channels.js`, `common/body_tag.html`, `common/common.scss`, `desktop/desktop.scss`, `mobile/mobile.scss`
- next development work after this audit: behavior-preserving JavaScript modularization

## Audit findings addressed
- shell navigation settings are constrained to same-origin Discourse URLs
- long-lived user/community/profile-visit caches are bounded to prevent unbounded SPA-session growth
- transient profile-banner request failures no longer poison the cache until reload
- community polling/render work is skipped while the document/shell/member rail is not visible and refreshes when visible again
- mobile community drawer restores keyboard focus, supports an explicit focus target, and closes cleanly
- RTL mobile drawer direction and desktop member-rail user-card positioning use direction-safe behavior
- light-mode root/overscroll background follows the active Discourse secondary color
- the desktop member toggle is hidden in the 1000–1279px range where the member rail is intentionally unavailable
- no `innerHTML`/raw HTML injection path was found in the audited initializer; dynamic user/topic strings are rendered through DOM text properties

## Validation
- one-time audited patch application: GREEN
- ESLint: GREEN
- Stylelint: GREEN
- Prettier: GREEN
- TypeScript/Glint types: GREEN
- exact changed-path comparison against `main`: only the five intended runtime files plus this state document
- Official reusable Discourse Theme CI: required on the latest exact PR head before merge
- live-instance visual/runtime smoke test: not available from GitHub CI alone

## Known blockers
- none in the bounded audit implementation
- merge remains blocked until the latest exact PR head has Official Discourse Theme CI GREEN and receives explicit merge authorization

## Next action
- Open the audit PR, verify latest exact-head Official Discourse Theme CI, then keep it ready for explicit merge approval.

Rules: no history dump; refresh stale SHA/CI claims; `NO_CI != GREEN`.
