# Current State

## Main

- repository: `dupless54/discourse-crimson-channels`
- base branch: `main`
- main SHA: `6c6333c57f32ffb2c6a882d19c69ecdc7d65cd1a`
- latest landed phase: PR #44, native `TopicCell` + outlet-injected topic author avatar
- delivery gate: latest exact PR head Official Discourse Theme CI must be `completed / success`

## Active task packet

- Goal: Phase 6 premium categories, tags, and discovery surfaces on desktop, tablet, mobile,
  and narrow screens without replacing current Discourse structure.
- Branch: `codex/premium-discovery-phase6`
- Allowed paths: `common/common.scss`, `stylesheets/crimson-common.scss`,
  `stylesheets/crimson-premium-pages.scss`, `stylesheets/crimson-premium-mobile.scss`,
  `stylesheets/crimson-discovery.scss`, `spec/system/crimson_discovery_spec.rb`, this file.
- Acceptance: native category box/table/tag markup remains intact; no fixed translated pseudo-text;
  no topic-list/avatar-cosmetic regression; fluid layout at desktop, 820px tablet, and mobile.
- Validation: diff/path check, CSS/format/Ruby lint, targeted system specs, exact-head Official CI.
- Risk: CSS cascade and responsive overflow only; no backend, persistence, or cross-plugin contract.
- Effort tier: T1.
- Escalation: unexpected current-core markup mismatch, optional-plugin ownership, or repeated CI failure.

## Native-source audit — Phase 6

- Official guides consulted:
  - Developing Themes & Theme Components
  - Theme Developer Quick Reference
  - Structure of themes and theme components
  - Use Discourse Core Variables in your Theme
  - Minimizing Maintenance on Theme Customizations
  - Designing for Responsive Widths
  - Designing for Different Devices (Touch & Hover)
  - End-to-end system testing for themes
- Current core implementation consulted:
  - `frontend/discourse/app/components/discovery/layout.gjs`
  - `frontend/discourse/app/components/discovery/categories-display.gjs`
  - `frontend/discourse/app/components/categories-boxes.gjs`
  - `frontend/discourse/app/components/categories-boxes-with-topics.gjs`
  - `frontend/discourse/app/components/tag-list.gjs`
  - `app/assets/stylesheets/common/base/category-list.scss`
  - `app/assets/stylesheets/common/base/tagging.scss`
  - official Horizon `themes/horizon/scss/categories-view.scss` as a maintained design reference
- Core already owns:
  - responsive category auto-fit grids and mobile category modes;
  - category table semantics, category-color rail, descriptions, subcategories, and topic counts;
  - tag links/counts and tag metadata;
  - discovery routing, accessibility, and plugin outlets.
- Theme delta:
  - remove the legacy 500+ line XenForo category reconstruction that converted tables to custom
    grids and inserted hard-coded Turkish labels with pseudo-elements;
  - add one focused `crimson-discovery.scss` module that retints native variables/surfaces,
    polishes category cards and tables, and turns core tag boxes into a fluid CSS grid;
  - enable hover elevation only for `.discourse-no-touch`; touch layouts remain fully usable
    without hover;
  - use a mobile-first narrow-width adjustment at the current core `md` boundary (`48rem`);
  - add no `!important` declarations in the new module.

## Compatibility invariants

- The theme remains frontend-only and does not depend on Crimson Community endpoints.
- PR #44's native topic cell and `DUserLink` avatar connector remain untouched.
- Avatar cosmetic anchors (`[data-user-card]` + `img.avatar`) remain unchanged.
- Native routes, focus behavior, category links, tag links, and admin interface remain core-owned.
- Light/dark behavior continues through semantic Discourse CSS custom properties.

## Validation status

- Local dependency install: blocked by the workspace network policy; not counted as passing.
- Local Ruby toolchain: unavailable in this workspace; not counted as passing.
- `git diff --check`: pending final run.
- Official Discourse Theme CI: `NO_CI` until the branch is pushed and PR opened.

## Next action

1. Finalize the scoped diff and run all locally available checks.
2. Push the branch through the GitHub connector and open a PR.
3. Use exact-head Official Discourse Theme CI for lint, build, and responsive system tests.
4. Apply at most three smallest-root-cause remediation rounds; never weaken tests.
5. Squash merge only when the exact head is green and no blocker remains.

Rules: current source/tests beat this document; a new commit invalidates old CI evidence;
`NO_CI != GREEN`.
