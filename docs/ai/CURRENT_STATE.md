# Current State

## Main
- repository: `dupless54/discourse-crimson-channels`
- base branch: `main`
- main SHA at start of current work: `816e034fd4b6a4e3530373a83c2b7bd903e508c3`
- delivery gate: latest exact PR head must have Official Discourse Theme CI `completed / success`

## Active work
- branch: `claude/crimson-channels-redesign-968c75`
- scope: multi-phase premium visual redesign requested end-to-end (design system, topic list,
  topic page, discovery, profile, composer, search, responsive/dark-light parity). This session
  delivers **Phase 1: the topic list** (explicitly the highest-priority surface in the request),
  desktop/tablet and mobile, light and dark. Remaining phases are follow-up work, not yet started.
- effort/risk: bounded frontend/CSS change; no server logic, no public-contract change

## What Phase 1 actually fixed
- `javascripts/discourse/api-initializers/crimson-topic-list-v2.js` +
  `javascripts/discourse/components/crimson-topic-cell.gjs` (a prior session's work) already
  replace the core desktop "topic" column with `CrimsonTopicCell`, but **no stylesheet anywhere
  targeted its markup** (`.cn-topic-cell`, `.link-top-line`, `.link-bottom-line`) — verified by
  grepping every `stylesheets/*.scss`, `desktop/desktop.scss`, `mobile/mobile.scss` for those
  classes before this change (zero matches). The desktop topic list was effectively unstyled by
  Crimson.
- `desktop/desktop.scss` also carried a large dead block (`.cn-topic-author` /
  `.cn-topic-author-header`) styling a `crimson-topic-author` column that
  `crimson-topic-list-v2.js` deletes — confirmed by reading current
  `discourse/discourse` core (`frontend/discourse/app/components/topic-list/item.gjs` and
  `item/topic-cell.gjs`, fetched via a local sparse read-only clone) to establish the real,
  current DOM. That dead block is removed; a small genuinely-breakpoint-specific rule
  (`.cn-topic-cell__author` avatar upsizing at `>=1440px`) replaces it.
- New `stylesheets/crimson-topic-list.scss` (imported from `common/common.scss` after
  `crimson-premium-pages`) styles: the `.cn-topic-cell` avatar+content layout, title/status row,
  category/tag/participant/likes row, pinned rail accent, unread/selected/bulk-selected states,
  keyboard focus ring on the title link, and a shared premium category-chip treatment
  (`.topic-list .badge-category__wrapper`) that colors itself from the topic's own category via
  the `--category-badge-color` / `--category-badge-text-color` custom properties Discourse core
  already sets inline (`frontend/discourse/app/helpers/category-variables.js`) — this is the
  concrete mechanism behind the "colorful compact category chip" requirement for both desktop
  cards and the native mobile row (`mobile/mobile.scss`'s existing `.pull-left` /
  `.topic-item-metadata` / `.topic-item-stats` markup was already correct and untouched; it only
  lacked color).
- Mobile's own hard-coded topic-list markup (core `item.gjs`'s `useMobileLayout` branch) was
  verified separately from the desktop `@columns` path and left as-is structurally.

## Compatibility strategy (carried over, unchanged by this session)
- `common/body_tag.html` no longer emits Community/member markup.
- `stylesheets/crimson-community-removal.scss` neutralizes old right-rail geometry; legacy
  `.cn-member-rail*` selectors intentionally remain (documented, inert) in
  `desktop/desktop.scss` — do not remove them casually; they are a separate, already-reviewed
  cleanup item, not part of this session's topic-list scope. Do not reintroduce the right rail.

## Regression coverage
- New `spec/system/crimson_topic_list_spec.rb`: asserts `.cn-topic-cell` + avatar render on
  `/latest`, the category chip carries the topic's actual `--category-badge-color`, the pinned
  rail accent is scoped to pinned rows only, and the mobile layout still renders the colored
  category chip through its own (non-`cn-topic-cell`) markup.
- Prior shell/navigation/community-removal coverage untouched.

## Validation
- `pnpm lint:css`, `pnpm lint:css:fix`, `pnpm lint:prettier`, `pnpm lint:js`: ran locally, clean.
- `spec/system/crimson_topic_list_spec.rb` and the rest of `spec/system/`: **NOT RUN** locally —
  this repo has no local Rails/Capybara harness (`Gemfile` only carries `rubocop-discourse` +
  `syntax_tree`); Ruby syntax was checked (`ruby -c`, OK). Official Discourse Theme CI on the
  exact PR head is the authoritative run.
- Exact changed-path review still required before PR per repo governance.

## Known blockers
- none for Phase 1; merge remains gated on latest-exact-head Official Discourse Theme CI GREEN.

## Next action
- Open the PR for Phase 1, get exact-head Official Discourse Theme CI GREEN, remediate if needed.
- Follow-up phases (not started): topic reading page, categories/tags/discovery, profile/user
  cards, composer/forms, search/menus/overlays, remaining dark/light + tablet parity audit across
  the rest of the surfaces listed in the original request.

Rules: source/tests beat this document; refresh stale SHA/CI claims; `NO_CI != GREEN`.
