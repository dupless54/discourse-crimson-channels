# Current State

## Main
- repository: `dupless54/discourse-crimson-channels`
- base branch: `main`
- main SHA at start of current work: `0e51b28b4faee6c22442d7c6d937f3c287e1fae8`
- Landed on `main`: PR #41 (Phase 1–2 audit polish), PR #40 (Phase 3–4 topic list v1, since
  superseded by this branch), PR #42 (Phase 5 v1 topic reading, since superseded by PR #43).
- **Open, not yet merged**: PR #43 — Discourse-native-first audit fix for PR #42's topic-reading
  CSS (reduces `crimson-topic-reading.scss` from ~120 lines/15+ `!important` to ~35 lines/0
  `!important`, retinting core's `--d-post-aside-*` tokens instead of resetting them). This
  branch is independent of PR #43 (disjoint files: `crimson-topic-list.scss` +
  `javascripts/discourse/{api-initializers,components,connectors}/*` here vs.
  `crimson-topic-reading.scss` there) and based on the same main tip, so either can merge first.
- delivery gate: latest exact PR head must have Official Discourse Theme CI `completed / success`

## Active work
- branch: `claude/crimson-topic-list-outlet-refactor`
- scope: the tracked PR #40 architecture audit (see prior revision of this file) concluded the
  outlet-based approach was plausible and worth spiking for real; this branch is that spike,
  implemented and pushed to let CI's `system_tests` (a real headless-browser run) verify it,
  the same way `system_tests` validated the Phase 5 quote/code markup assumptions.
- effort/risk: removes a copied core component; CSS layout mechanism changed (grid → float,
  see below) after catching a real risk during self-review, before push

## Discourse native-source audit — topic list (this branch)
- **Official guide consulted**: `docs/developer-guides/docs/03-code-internals/24-customizing-topic-list.md`
  (topic-list-columns transformer is for column changes; plugin outlets are preferred over
  taking ownership of structure; full component replacement is a last resort).
- **Core component consulted**: `frontend/discourse/app/components/topic-list/item.gjs` (row
  wrapper — mobile branch bypasses `@columns` entirely, confirmed the injected outlet also
  fires there and needs to stay inert) and `item/topic-cell.gjs` (native "topic" column;
  confirmed its outlets — `topic-list-before-link` fires as the first child of
  `<td class="main-link topic-list-data">`, before `.link-top-line`).
- **Core CSS consulted**: `app/assets/stylesheets/common/base/_topic-list.scss` (title color/
  weight tokens, `.link-bottom-line`/`.participant-group`/`.badge-posts`/`bulk-selected`
  already themed; `.topic-list-data` padding tokens; the deliberate focus-outline removal, per
  its own comment "we have a custom focus indicator via .selected"), `common/base/discourse.scss`
  (`--title-color`, `--topic-title-font-weight`, `.topic-statuses { float: left }` — this one
  mattered, see below).
- **What changed and why**:
  - **Removed core-component ownership.** `crimson-topic-cell.gjs` (a ~160-line near-copy of
    core's `item/topic-cell.gjs`, existing since before this session) is deleted.
    `crimson-topic-list-v2.js` no longer replaces the "topic" column — it only deletes
    `posters` (now redundant with the injected avatar), which the customization guide
    explicitly sanctions as column-transformer use. The native `TopicCell` renders completely
    unmodified.
  - **New connector**, not a component replacement:
    `javascripts/discourse/connectors/topic-list-before-link/crimson-topic-avatar.gjs` renders
    only the avatar (`<DUserLink class="cn-topic-cell__author">`), 30 lines, no core markup
    duplicated. Guards on `@service site` `mobileView` so it stays inert on mobile, where core's
    `item.gjs` mobile branch (confirmed by re-reading it) also fires `topic-list-before-link` —
    without the guard this would have rendered a second, duplicate avatar next to mobile's
    existing native `.pull-left` one.
  - **Layout mechanism: float, not grid** (self-caught during review, before push). The first
    draft set `display: grid` directly on the native `<td>` to position the injected avatar and
    native content. Table-cell elements have special box-generation rules; setting `display:
    grid`/`flex` directly on a `<td>` risks the browser no longer treating it as a table-cell for
    the row's layout algorithm (column widths, row-height alignment with sibling `<td>`s) —
    unverifiable without a real browser render, which this sandbox doesn't have, so shipping it
    on a guess was too risky for a table structure. Replaced with `float: inline-start` on the
    injected avatar: `.link-top-line` is a native `<span>` (inline, wraps beside a float
    trivially) and `.link-bottom-line` is a native `<div>` (block-level, wraps beside/below a
    float exactly like core's own onebox image handling — `onebox.scss` already floats preview
    images the same way). This changes nothing about the `<td>`'s own `display`, so its table-cell
    box generation is untouched — zero layout risk to the row.
  - **Retinted, not rebuilt**: `--title-color`, `--topic-title-font-weight` (core tokens, used by
    every visited/anon/read-state selector already, so overriding them keeps all of that
    behavior working) instead of a new `.title` color/font-weight rule.
  - **Removed as exact duplicates of core** (see `_topic-list.scss`): `.link-bottom-line` flex/
    gap, `.participant-group` chip styling, `.badge-posts` font-weight/color/display,
    `.topic-list-data.num` vertical-align, `.topic-list-item.bulk-selected` background (core:
    `background: var(--tertiary-low)` already, on the row itself).
  - **Removed as a risk, not just duplication**: `.topic-statuses { display: inline-flex; gap;
    color }`. Core sets `float: left` on `.topic-statuses` deliberately ("avoid adding margin/
    padding on this parent; sometimes it appears as an empty container") — overriding to
    `display: flex` fights that float-based inline-flow design for no real benefit, since every
    `.topic-status` icon already gets a sensible `color: var(--primary-medium)` from core.
  - **Kept as genuine deltas**: pinned-topic accent (now a `::before` pseudo-element on the
    `<td>`, no extra markup, since core doesn't give pinned/bookmarked status icons a brand
    color); `.topic-status.--pinned`/`.--bookmarked` color; a documented focus-visible outline
    exception (core intentionally drops the native outline in favor of `.selected`/
    `:focus-within`, which alone doesn't read as a clearly visible keyboard-focus indicator);
    `.badge-posts` chip background (core already bolds/sizes it, just adds the pill); the
    category-chip color system (core doesn't theme `.badge-category` color at all — confirmed in
    the Phase 3–4 audit and unchanged here); `.discourse-tags` list-style reset (confirmed no
    generic `ul, li { list-style: none }` exists in core base CSS).
  - **Core selectors reused**: `.link-top-line`, `.link-bottom-line`, `.raw-topic-link.title`,
    `.topic-status`, `.badge-posts`, `.topic-list-data`, `--title-color`,
    `--topic-title-font-weight` (all native, unmodified).
  - **`!important` count**: 2, both in the mobile-only category-chip block (unchanged from
    Phase 3–4, targeting `.discourse-tag`, which core styles with higher specificity in a
    breakpoint-scoped rule not read in this pass — left as-is since it's outside this branch's
    diff).
- **Net result**: `stylesheets/crimson-topic-list.scss`'s desktop section drops from ~150 lines
  targeting a custom component's classes to ~90 lines targeting only native core classes plus
  the injected avatar. `javascripts/` loses a 162-line copied component and gains a 34-line
  connector. `spec/system/crimson_topic_list_spec.rb` updated to assert against the native `<td
  class="main-link topic-list-data">` instead of the removed `.cn-topic-cell`, and the pinned
  accent (now a pseudo-element, not a selectable child) via `page.evaluate_script` computed-style
  checks instead of `have_css`.

## Compatibility strategy (carried over, unchanged by this session)
- `common/body_tag.html` no longer emits Community/member markup; do not reintroduce the right
  rail, member drawer, or `/crimson-community/*` polling.
- `stylesheets/crimson-community-removal.scss` neutralizes old right-rail geometry; legacy
  `.cn-member-rail*` selectors intentionally remain (documented, inert) in `desktop/desktop.scss`.

## Regression coverage
- `spec/system/crimson_topic_list_spec.rb` updated (not newly added): avatar renders via the
  outlet inside the native cell, title/category-chip color still correct, pinned accent present
  only on pinned rows (via computed `::before` background-color, since it's no longer a
  selectable element), and the avatar connector renders nothing on mobile (no duplicate avatar).

## Validation
- `pnpm lint:css`, `lint:css:fix`, `lint:prettier`, `lint:js`: ran locally, clean.
- `bundle exec rubocop .` and `bundle exec stree check …` (both with
  `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 RUBYOPT="-E UTF-8"` — this sandbox's default locale is
  US-ASCII, unlike CI; without it stree misreads UTF-8 source in unrelated tracked files),
  explicitly naming the changed spec file (stree resolves its list via `git ls-files`, which
  misses unstaged new files — the exact mistake that broke CI on PR #42; staged this file before
  checking this time): both clean.
- `git diff --stat origin/main...HEAD`: exactly the 5 expected files.
- Full `spec/system/` suite: **NOT RUN** locally (no Rails/Capybara harness). Official Discourse
  Theme CI's `system_tests` job — which actually renders in a browser — is the real verification
  for the float-based layout; that's the explicit reason this was pushed as a real PR rather than
  left as a documented-only plan.

## Known blockers
- none; merge gated on latest-exact-head Official Discourse Theme CI GREEN, same as every PR.

## Next action
- Open the PR, verify exact-head CI GREEN (paying particular attention to `system_tests`, since
  that's what actually proves the float layout renders correctly), squash merge.
- PR #43 (topic-reading audit fix) is still open in parallel; merge whichever goes green first,
  no ordering dependency.
- Continue the roadmap: Phase 6 (categories/tags/discovery pages) onward, applying this same
  native-first audit method, each phase its own PR.

Rules: source/tests beat this document; refresh stale SHA/CI claims; `NO_CI != GREEN`.
