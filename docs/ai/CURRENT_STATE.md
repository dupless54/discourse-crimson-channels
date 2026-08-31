# Current State

## Main
- repository: `dupless54/discourse-crimson-channels`
- base branch: `main`
- main SHA at start of current work: `816e034fd4b6a4e3530373a83c2b7bd903e508c3`
- Phase 1–2 audit polish (PR #41, squash commit `1f0c912`) merged into `main` since: dedupes
  design tokens between `crimson-common.scss` and `crimson-palette-foundation.scss`, drops the
  dead glow-heavy `body` background, replaces a hardcoded Discord-blurple color in the default
  profile banner. Verdict of that audit: the token/header/sidebar/left-rail/dark-light
  foundation is sound — no rewrite needed.
- delivery gate: latest exact PR head must have Official Discourse Theme CI `completed / success`

## Active work
- branch: `claude/crimson-channels-redesign-968c75` (PR #40)
- scope: multi-phase premium visual redesign requested end-to-end (design system, topic list,
  topic page, discovery, profile, composer, search, responsive/dark-light parity). This branch
  delivers **Phase 3–4: the topic list** (explicitly the highest-priority surface in the
  request), desktop/tablet and mobile, light and dark.
- effort/risk: bounded frontend/CSS change; no server logic, no public-contract change
- this branch was merged against updated `main` after PR #41 landed, to resolve a conflict in
  this file (both PRs touched `docs/ai/CURRENT_STATE.md`); no other file conflicted
  (`stylesheets/crimson-topic-list.scss`, `desktop/desktop.scss` here vs.
  `stylesheets/crimson-common.scss` there — disjoint).

## What Phase 3–4 actually fixed
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
- `spec/system/crimson_topic_list_spec.rb`: asserts `.cn-topic-cell` + avatar render on
  `/latest`, the category chip carries the topic's actual `--category-badge-color`, the pinned
  rail accent is scoped to pinned rows only, and the mobile layout still renders the colored
  category chip through its own (non-`cn-topic-cell`) markup.
- Prior shell/navigation/community-removal coverage untouched.

## Validation
- `pnpm lint:css`, `pnpm lint:css:fix`, `pnpm lint:prettier`, `pnpm lint:js`: ran locally, clean.
- CI (`ci / linting`) caught one real issue this session didn't catch locally: RuboCop's
  `RSpec/ContextWording` rejected `context "on mobile", mobile: true` in the new spec (must
  start with when/with/without/for/while/if/as/after/in). Fixed by rewording to
  `"when viewed on mobile"`; re-verified locally afterward with the exact rubocop invocation CI
  uses (`bundle exec rubocop .`, 6 files, no offenses) plus stree/eslint/stylelint/prettier.
- Official Discourse Theme CI (`ci / check_for_tests`, `ci / linting`, `ci / backend_tests`,
  `ci / system_tests`) all green on head `ced78ac` before the merge-conflict-resolution commit
  described above; re-validate on the new exact head after that commit per governance (a new
  commit invalidates prior CI evidence).

## Known blockers
- none; merge gated on latest-exact-head Official Discourse Theme CI GREEN.

## Next action
- Push the merge-conflict-resolution commit, get exact-head Official Discourse Theme CI GREEN
  again, squash merge PR #40.
- Then continue the roadmap: Phase 5 (topic reading page) onward, each phase its own PR.

Rules: source/tests beat this document; refresh stale SHA/CI claims; `NO_CI != GREEN`.
