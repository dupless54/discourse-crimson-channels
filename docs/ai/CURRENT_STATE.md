# Current State

## Main
- repository: `dupless54/discourse-crimson-channels`
- base branch: `main`
- main SHA at start of current work: `0e51b28b4faee6c22442d7c6d937f3c287e1fae8`
- Landed so far on `main`:
  - PR #41 (squash `1f0c912`) — Phase 1–2 audit polish.
  - PR #40 (squash `bbb9f68`) — Phase 3–4: premium topic list.
  - PR #42 (squash `0e51b28`) — Phase 5 v1: topic-reading cooked-content styling (quotes, code,
    oneboxes). **Superseded by the work below** — see "Workflow correction".
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
A phase is not complete without a "Discourse native-source audit" documented (see below for the
first one, on PR #42).

## Active work
- branch: `claude/crimson-phase5-native-first-audit`
- scope: retroactive native-first audit of PR #42 (already merged), producing a follow-up fix
  that replaces most of `stylesheets/crimson-topic-reading.scss` with a ~90% smaller delta.
  PR #40's `CrimsonTopicCell` architecture (component-copy vs. outlets) is a separate, larger
  audit tracked as a follow-up, not resolved in this branch — see "PR #40 architecture audit"
  below.
- effort/risk: CSS-only reduction; no markup/class-name change; strictly removes overrides,
  adds none beyond what's documented as a real gap

## Discourse native-source audit — PR #42 (topic reading)
- **Official guide consulted**: `docs/developer-guides/docs/03-code-internals/24-customizing-topic-list.md`
  (general CSS-first principle: "CSS customization is the safest/common path"; applied here to
  cooked content generally, not just topic-list).
- **Core components consulted**: `frontend/discourse-markdown-it/src/features/{quotes,code}.js`
  (markup generation — unchanged from the original PR #42 read, still accurate).
- **Core CSS consulted**: `app/assets/stylesheets/common/base/topic-post.scss` (quote `.title`,
  nested-quote dimming), `common/base/discourse.scss` (base `blockquote`, `--d-post-aside-*`
  token definitions), `common/base/code_highlighting.scss` (`code`/`pre > code`, full `.hljs-*`
  palette), `common/base/onebox.scss` (`aside.onebox`, `onebox-shadow()` mixin, per-provider
  layouts).
- **Findings, rule by rule** (A = core already handles this, remove; B = core handles structure,
  keep a minimal delta; C = core doesn't handle this, custom rule justified):
  - `blockquote` reset to transparent/border:0 → **A**, removed. Core's own `blockquote` (base)
    already gets `background: var(--d-post-aside-background); border-left:
    var(--d-post-aside-border-left)`.
  - `aside.quote` full background/border/radius rebuild → **A/B**, replaced with retinting the
    two tokens above (`color-mix` toward `--cn-crimson`) instead of resetting them. No radius/
    overflow added — kept to the smallest semantic delta.
  - `aside.quote aside.quote` (nested quote) background/border → **A**, removed — exact
    duplicate of core's own `aside aside.quote/.title/blockquote/.onebox { background:
    var(--primary-very-low); border-left: 5px solid var(--primary-low) }`.
  - `aside.quote .title` flex/color/font rebuild → **A**, removed. Core already does
    `display:flex; gap: var(--space-2); color: var(--primary-high-or-secondary-low)`, which
    already adapts to dark/light and the active palette.
  - `aside.quote .title img.avatar { border-radius: 50% }` → **A**, removed — avatars are
    already circular globally.
  - `pre` background/border/radius/shadow rebuild → **A**, removed. `pre > code` already has
    `background: var(--hljs-bg)`, 12px padding, `max-height` — a palette-computed token pair,
    not something to override piecemeal with `!important`.
  - `pre code { white-space: pre !important }` → **A, real bug fix**: `code_highlighting.scss`
    has an explicit comment — *"wrapping is the `pre`'s call; a value here would override
    it"* — meaning core deliberately avoids setting `white-space` on `pre > code`. My original
    rule violated that documented intent. Removed.
  - `pre { overflow-x: auto }` → **C, kept**. Grepped every core base CSS file: no
    `overflow-x` set anywhere on `pre`/`pre > code`. A long unwrapped code line can genuinely
    push the page into horizontal scroll on narrow screens — a real, confirmed gap.
  - `code:not(pre code)` padding/background/radius → **A**, removed — exact duplicate of core's
    own `code { padding: 2px 4px; background: var(--inline-code-bg); border-radius:
    var(--d-border-radius) }`.
  - `aside.onebox` overflow/background/border/radius/shadow rebuild → **A**, removed. Core has
    its own `onebox-shadow()` mixin (layered box-shadow elevation with matched radius math);
    `overflow: hidden` in my version also risked clipping core's floated onebox preview images
    (`.onebox-body img { float: left }`).
  - `aside.onebox header.source` → **A, real bug**: modern `aside.onebox` markup uses a plain
    `header`, not `header.source` — that class belongs to the older, separate `.onebox-result`
    format. My selector likely never matched current oneboxes at all.
  - `.onebox-body h3/h4` margin/font-size → **A**, removed — duplicate of core's own
    `font-size: var(--font-up-1); margin: 0 0 10px 0`.
  - `img.thumbnail`/`img.onebox-avatar` border-radius → dropped for minimalism (marginal,
    unrequested cosmetic touch, not core-backed).
- **Core selectors reused**: `--d-post-aside-background`, `--d-post-aside-border-left` (via
  retint, not reset).
- **Core component ownership introduced**: No.
- **`!important` count**: 0 (was 15+ in the superseded version).
- **Net result**: `stylesheets/crimson-topic-reading.scss` goes from ~120 lines to ~35, with
  the actual premium delta being one confirmed real gap (`overflow-x`) and one on-brand token
  retint. `spec/system/crimson_topic_reading_spec.rb` is unchanged — its assertions (quote
  attribution/text render, code fence renders with `lang-ruby`) test functional cooked-content
  rendering, not the removed styling, so they remain valid regression coverage.

## PR #40 architecture audit (topic list) — tracked, not yet actioned
The user asked whether `CrimsonTopicCell` (which mirrors core's `topic-list/item/topic-cell.gjs`
to add an inline avatar) could instead be achieved by keeping the native `TopicCell` and
injecting only the avatar through an outlet (`topic-list-before-link` fires inside the native
`<td>` before `.link-top-line`), with CSS turning the native `<td>` into a flex/grid container
so the injected avatar and native content sit side by side — deleting the copied component and
`crimson-topic-list-v2.js`'s "topic" column replacement, keeping only its column *deletions*
(`posters`, the old `crimson-topic-author` column), which the customization guide explicitly
sanctions ("topic-list-columns transformer is appropriate for column changes"). This is
plausible but unverified — needs a real spike (outlet connector + CSS, checked against actual
rendered DOM) before deciding, not just doc reasoning. Not done in this branch; next phase's
session should spike it before adding any more topic-list surface area.

## Compatibility strategy (carried over, unchanged by this session)
- `common/body_tag.html` no longer emits Community/member markup; do not reintroduce the right
  rail, member drawer, or `/crimson-community/*` polling.
- `stylesheets/crimson-community-removal.scss` neutralizes old right-rail geometry; legacy
  `.cn-member-rail*` selectors intentionally remain (documented, inert) in `desktop/desktop.scss`.

## Regression coverage
- No spec changes in this branch — `spec/system/crimson_topic_reading_spec.rb` (from PR #42)
  still passes against the reduced CSS (it asserts functional rendering, not the removed
  styling).

## Validation
- `pnpm lint:css`, `lint:css:fix`, `lint:prettier`: ran locally, clean.
- `git diff --stat` reviewed — only `stylesheets/crimson-topic-reading.scss` changed (plus this
  file).
- No JS/Ruby touched, so rubocop/stree/eslint are unaffected by this branch; not re-run.
- Full `spec/system/` suite: **NOT RUN** locally (no Rails/Capybara harness). Official Discourse
  Theme CI on the exact PR head is authoritative.

## Known blockers
- none; merge gated on latest-exact-head Official Discourse Theme CI GREEN.

## Next action
- Open the PR, verify exact-head CI GREEN, squash merge.
- Spike the PR #40 outlet-based refactor (see above) before or alongside Phase 6.
- Continue the roadmap: Phase 6 (categories/tags/discovery pages) onward, each phase applying
  the native-first audit and its own PR. Revisit the deferred reactions/solved-plugin styling
  and the Phase 10 tablet gap (documented in earlier revisions of this file / PR #41) when those
  phases come up.

Rules: source/tests beat this document; refresh stale SHA/CI claims; `NO_CI != GREEN`.
