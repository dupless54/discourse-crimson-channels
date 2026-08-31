# Current State

## Main
- repository: `dupless54/discourse-crimson-channels`
- base branch: `main`
- main SHA at start of current work: `bbb9f68958b989de150bea0ebd92cd4e308d4925`
- Landed so far on `main`:
  - PR #41 (squash `1f0c912`) — Phase 1–2 audit polish: deduped design tokens, dropped a dead
    glow-heavy background, replaced a hardcoded Discord-blurple color. Verdict: the token/
    header/sidebar/left-rail/dark-light foundation is sound, no rewrite needed.
  - PR #40 (squash `bbb9f68`) — Phase 3–4: premium topic list, desktop `.cn-topic-cell` cards
    and a shared colorful category chip covering both desktop and the native mobile row.
- delivery gate: latest exact PR head must have Official Discourse Theme CI `completed / success`

## Active work
- branch: `claude/crimson-phase5-topic-reading`
- scope: Phase 5 of the redesign roadmap — the topic reading page (`#topic`), specifically the
  cooked-content hooks Discourse intentionally preserves for theming: quote blocks, code
  blocks, and oneboxes. These three had zero Crimson styling before this branch (grepped every
  stylesheet — no `aside.quote`, `pre code`, or `aside.onebox` selectors existed anywhere).
- effort/risk: bounded CSS-only change; no JS, no markup change, no public-contract change

## What Phase 5 actually fixed
- Verified the exact cooked-content markup against current `discourse/discourse` core rather
  than assuming it (`frontend/discourse-markdown-it/src/features/quotes.js` and `code.js`, via
  the same local sparse read-only clone used in Phase 3–4):
  - Quotes render as `<aside class="quote no-group|group-X"><div class="title">…</div>
    <blockquote>…</blockquote></aside>`.
  - Code fences render as `<pre data-code-*><code class="lang-xxx">…</code></pre>` (syntax
    token colors are a separate highlight.js theme concern, intentionally left alone; this PR
    only styles the container).
- New `stylesheets/crimson-topic-reading.scss` (imported from `common/common.scss` after
  `crimson-topic-list`), scoped to `#topic .cooked` (covers both the classic post stream and
  nested/threaded replies without duplicating selectors for each):
  - Quote blocks: tinted panel with an accent left border, a muted attribution line, and a
    slightly dimmer treatment for nested quote-in-quote.
  - Code blocks: dark panel container with `overflow-x: auto` — the classic source of
    page-level horizontal overflow on narrow screens if left unscoped, so this also closes a
    real responsive-acceptance gap (brief section 32), not just a visual one.
  - Oneboxes (link previews): card treatment consistent with the rest of the theme's panel
    language (`--cn-panel`, `--cn-border`, `--cn-radius-md`).
- Deliberately **not** touched (plugin-dependent, out of this controlled PR's scope, flagged
  for whoever picks up plugin-compatibility work): discourse-reactions like/reaction UI,
  discourse-solved accepted-answer marker. Both are optional plugins with their own class
  contracts; styling them here would couple this theme to plugins that may not be installed,
  against the frontend scope rules ("theme shell must remain usable without them" /
  "optional companion plugins unavailable or removed").

## Compatibility strategy (carried over, unchanged by this session)
- `common/body_tag.html` no longer emits Community/member markup; do not reintroduce the right
  rail, member drawer, or `/crimson-community/*` polling.
- `stylesheets/crimson-community-removal.scss` neutralizes old right-rail geometry; legacy
  `.cn-member-rail*` selectors intentionally remain (documented, inert) in `desktop/desktop.scss`.

## Regression coverage
- New `spec/system/crimson_topic_reading_spec.rb`: fabricates a post whose raw markdown
  contains a `[quote="Jane"]` and a fenced ```ruby``` code block, visits the topic, and asserts
  `#topic .cooked aside.quote .title` shows the attribution, the quoted text renders inside
  `blockquote`, and the fence renders as `pre code.lang-ruby` with its content.
- Prior shell/navigation/community-removal/topic-list coverage untouched (disjoint selectors).

## Validation
- `pnpm lint:css`, `lint:css:fix`, `lint:prettier`, `lint:js`: ran locally, clean.
- `bundle exec rubocop .` (same invocation CI uses): 7 files, no offenses — learned from the
  Phase 3–4 CI failure to check this locally before pushing this time.
- `bundle exec stree check …`: clean (run with `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8
  RUBYOPT="-E UTF-8"` — this sandbox's default locale is US-ASCII, which makes stree choke on
  UTF-8 source in unrelated files; CI itself doesn't have this problem).
- `ruby -c` on the new spec: syntax OK.
- Full `spec/system/` suite: **NOT RUN** locally — no Rails/Capybara harness in this theme-only
  repo. Official Discourse Theme CI on the exact PR head is authoritative.
- `git diff --stat origin/main...HEAD` reviewed before commit — only the 4 intended files.

## Known blockers
- none; merge gated on latest-exact-head Official Discourse Theme CI GREEN.

## Next action
- Open the PR, verify exact-head CI GREEN, squash merge.
- Then continue the roadmap: Phase 6 (categories/tags/discovery pages) onward, each phase its
  own PR. Revisit the deferred reactions/solved-plugin styling and the Phase 10 tablet gap
  (documented in this file's prior revisions / PR #41) when those phases come up.

Rules: source/tests beat this document; refresh stale SHA/CI claims; `NO_CI != GREEN`.
