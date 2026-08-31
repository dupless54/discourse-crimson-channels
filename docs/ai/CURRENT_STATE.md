# Current State

## Main
- repository: `dupless54/discourse-crimson-channels`
- base branch: `main`
- main SHA at start of current work: `d3b01059a5e2a79481b0cbf16e611e1332701802`
- Landed on `main`: PR #41 (Phase 1–2 audit polish), PR #40 (Phase 3–4 topic list v1, since
  superseded by this branch), PR #42 (Phase 5 v1 topic reading, superseded by PR #43), PR #43
  (Discourse-native-first audit fix for topic-reading CSS — `crimson-topic-reading.scss` down to
  ~35 lines / 0 `!important`, retinting core's `--d-post-aside-*` tokens instead of resetting
  them; full rule-by-rule table in PR #43's own commit message / GitHub description).
- delivery gate: latest exact PR head must have Official Discourse Theme CI `completed / success`

## Workflow correction (applies to every phase from here on)
Mid-session, the user corrected the implementation strategy: prior phases (this repo's own
`crimson-topic-cell.gjs` from before this session, and PR #42) treated "Crimson Channels has no
selector for X" as proof X was unstyled, then rebuilt it with new selectors and `!important`.
That's backwards — current Discourse **core** CSS is the baseline and is often already
well-themed via semantic custom properties. The corrected order for every surface, from now on:
1. Inspect the current `discourse/discourse` component implementation for that surface.
2. Inspect the current core SCSS for that same surface
   (`app/assets/stylesheets/common/base/*`, `common/components/*`, etc.).
3. Inspect the relevant current official developer guide
   (`docs/developer-guides/docs/` in core, since `meta.discourse.org` is blocked here).
4. Determine what core already provides — a semantic token to retint is very different from
   "nothing exists."
5. Reuse native markup/outlets/transformers/variables wherever possible.
6. Add Crimson CSS or markup only for the exact missing premium behavior, as the smallest
   semantic-property delta, not a background/border/shadow reset-and-rebuild.
A phase is not complete without a "Discourse native-source audit" documented.

## Active work
- branch: `claude/crimson-topic-list-outlet-refactor` (PR #44)
- scope: the tracked PR #40 architecture audit concluded the outlet-based approach was plausible
  and worth spiking for real; this branch is that spike. CI's `system_tests` job (a real
  headless-browser render) already validated it green on this branch's pre-merge-conflict head —
  the merge-conflict-resolution commit below is a docs-only conflict (both this branch and PR #43
  touched this file), no code change, so that CI evidence still applies to the substance of the
  change; re-validating the new exact head regardless, per governance.
- effort/risk: removes a copied core component; CSS layout mechanism changed (grid → float, see
  below) after catching a real risk during self-review, before the original push

## Discourse native-source audit — topic list (PR #44)
- **Official guide consulted**: `docs/developer-guides/docs/03-code-internals/24-customizing-topic-list.md`
  (topic-list-columns transformer is for column changes; plugin outlets are preferred over
  taking ownership of structure; full component replacement is a last resort).
- **Core component consulted**: `frontend/discourse/app/components/topic-list/item.gjs` (row
  wrapper — mobile branch bypasses `@columns` entirely, confirmed the injected outlet also fires
  there and needs to stay inert) and `item/topic-cell.gjs` (native "topic" column; confirmed its
  outlets — `topic-list-before-link` fires as the first child of `<td class="main-link
  topic-list-data">`, before `.link-top-line`).
- **Core CSS consulted**: `app/assets/stylesheets/common/base/_topic-list.scss` (title color/
  weight tokens, `.link-bottom-line`/`.participant-group`/`.badge-posts`/`bulk-selected` already
  themed; `.topic-list-data` padding tokens; the deliberate focus-outline removal, per its own
  comment "we have a custom focus indicator via .selected"), `common/base/discourse.scss`
  (`--title-color`, `--topic-title-font-weight`, `.topic-statuses { float: left }` — this one
  mattered, see below).
- **What changed and why**:
  - **Removed core-component ownership.** `crimson-topic-cell.gjs` (a ~160-line near-copy of
    core's `item/topic-cell.gjs`, existing since before this session) is deleted.
    `crimson-topic-list-v2.js` no longer replaces the "topic" column — it only deletes `posters`
    (now redundant with the injected avatar), which the customization guide explicitly sanctions
    as column-transformer use. The native `TopicCell` renders completely unmodified.
  - **New connector**, not a component replacement:
    `javascripts/discourse/connectors/topic-list-before-link/crimson-topic-avatar.gjs` renders
    only the avatar (`<DUserLink class="cn-topic-cell__author">`), 34 lines, no core markup
    duplicated. Guards on `@service site` `mobileView` so it stays inert on mobile, where core's
    `item.gjs` mobile branch (confirmed by re-reading it) also fires `topic-list-before-link` —
    without the guard this would have rendered a second, duplicate avatar next to mobile's
    existing native `.pull-left` one.
  - **Layout mechanism: float, not grid** (self-caught during review, before the original push).
    The first draft set `display: grid` directly on the native `<td>` to position the injected
    avatar and native content. Table-cell elements have special box-generation rules; setting
    `display: grid`/`flex` directly on a `<td>` risks the browser no longer treating it as a
    table-cell for the row's layout algorithm (column widths, row-height alignment with sibling
    `<td>`s) — unverifiable without a real browser render, which this sandbox doesn't have, so
    shipping it on a guess was too risky for a table structure. Replaced with `float:
    inline-start` on the injected avatar: `.link-top-line` is a native `<span>` (inline, wraps
    beside a float trivially) and `.link-bottom-line` is a native `<div>` (block-level, wraps
    beside/below a float exactly like core's own onebox image handling — `onebox.scss` already
    floats preview images the same way). This changes nothing about the `<td>`'s own `display`,
    so its table-cell box generation is untouched — zero layout risk to the row. **Confirmed
    working**: PR #44's `system_tests` job passed on this exact CSS.
  - **Retinted, not rebuilt**: `--title-color`, `--topic-title-font-weight` (core tokens, used by
    every visited/anon/read-state selector already, so overriding them keeps all of that behavior
    working) instead of a new `.title` color/font-weight rule.
  - **Removed as exact duplicates of core** (see `_topic-list.scss`): `.link-bottom-line`
    flex/gap, `.participant-group` chip styling, `.badge-posts` font-weight/color/display,
    `.topic-list-data.num` vertical-align, `.topic-list-item.bulk-selected` background (core:
    `background: var(--tertiary-low)` already, on the row itself).
  - **Removed as a risk, not just duplication**: `.topic-statuses { display: inline-flex; gap;
    color }`. Core sets `float: left` on `.topic-statuses` deliberately ("avoid adding
    margin/padding on this parent; sometimes it appears as an empty container") — overriding to
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
  targeting a custom component's classes to ~90 lines targeting only native core classes plus the
  injected avatar. `javascripts/` loses a 162-line copied component and gains a 34-line connector.
  `spec/system/crimson_topic_list_spec.rb` updated to assert against the native `<td
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
- Topic-reading coverage (`spec/system/crimson_topic_reading_spec.rb`, from PR #42/#43) is
  unaffected by this branch — disjoint files.

## Validation
- `pnpm lint:css`, `lint:css:fix`, `lint:prettier`, `lint:js`: ran locally, clean.
- `bundle exec rubocop .` and `bundle exec stree check …` (both with `LANG=en_US.UTF-8
  LC_ALL=en_US.UTF-8 RUBYOPT="-E UTF-8"` — this sandbox's default locale is US-ASCII, unlike CI;
  without it stree misreads UTF-8 source in unrelated tracked files), explicitly naming the
  changed spec file (stree resolves its list via `git ls-files`, which misses unstaged new files
  — the exact mistake that broke CI on PR #42; staged files before checking this time): both
  clean.
- `git diff --stat origin/main...HEAD`: exactly the 6 expected files (5 code/spec + this file).
- Official Discourse Theme CI, including `system_tests` (a real headless-browser render — the
  actual verification for the float-based layout, and the reason this was pushed as a real PR
  rather than left as a documented-only plan): all green on the pre-conflict head. Re-validating
  the new exact head after the merge-conflict-resolution commit (docs-only) per governance.

## Known blockers
- none; merge gated on latest-exact-head Official Discourse Theme CI GREEN, same as every PR.

## Next action
- Push the merge-conflict-resolution commit, verify exact-head CI GREEN again, squash merge #44.
- Continue the roadmap: Phase 6 (categories/tags/discovery pages) onward, applying this same
  native-first audit method, each phase its own PR. Revisit the deferred reactions/solved-plugin
  styling and the Phase 10 tablet gap (documented in earlier revisions of this file / PR #41)
  when those phases come up.

Rules: source/tests beat this document; refresh stale SHA/CI claims; `NO_CI != GREEN`.
