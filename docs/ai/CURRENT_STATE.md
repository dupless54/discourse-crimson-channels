# Current State

## Main
- repository: `dupless54/discourse-crimson-channels`
- base branch: `main`
- main SHA at start of current work: `816e034fd4b6a4e3530373a83c2b7bd903e508c3`
- delivery gate: latest exact PR head must have Official Discourse Theme CI `completed / success`

## Active work
- branch: `claude/crimson-phase1-2-audit-polish`
- scope: the multi-phase premium redesign explicitly requires auditing the existing "Premium
  Graphite" design-token/header/sidebar/left-rail/dark-light foundation (Phase 1–2) before
  starting Phase 5 (topic reading page), rather than assuming it's already correct. This branch
  is that audit's output: a small, controlled polish PR, not a rewrite — the foundation itself
  was judged adequate.
- effort/risk: bounded CSS-only change; no markup/class-name change, no JS touched, no visible
  behavior change except one intentional color fix (see below)
- runs in parallel with `claude/crimson-channels-redesign-968c75` (Phase 3–4, PR #40, topic
  list) — both are based on the same `main` SHA and touch disjoint files
  (`stylesheets/crimson-common.scss` here vs. `crimson-topic-list.scss` +
  `desktop/desktop.scss` there), so either can merge first without conflicting.

## What the audit found and fixed
- `stylesheets/crimson-common.scss`'s `:root` block duplicated ~19 color/radius/surface/shadow
  tokens (`--cn-crimson`, `--cn-radius-*`, `--cn-panel*`, `--cn-surface*`, `--cn-control*`,
  `--cn-muted`, `--cn-border`, `--cn-separator`, `--cn-hover`, `--cn-active`, `--cn-shadow`)
  that `stylesheets/crimson-palette-foundation.scss` (imported *after* it in
  `common/common.scss`) already redefines with different values. Same specificity + later
  source order means palette-foundation's values always won in practice, so the duplicates in
  crimson-common.scss were dead — but confusing and risky to maintain (editing a token there
  silently did nothing). Removed; kept only the 5 layout tokens
  (`--cn-server-rail-width` etc.) that nothing else defines. Verified every removed variable
  name still has exactly one live definition in `crimson-palette-foundation.scss`, so the
  rendered cascade is unchanged.
- Same file's plain `body { background: <radial+linear gradient> !important; }` was the old
  "glow-heavy" background that `crimson-palette-foundation.scss`'s own header comment says it
  replaced with a calm flat `var(--secondary)` — but the old gradient rule was never deleted,
  just shadowed (same reasoning: equal specificity, both `!important`, later import wins).
  Removed; `min-height: 100vh` is all `body` still needed here.
- The default user-card profile banner gradient (shown before a cosmetic plugin overrides it)
  hardcoded Discord's literal brand blurple `#5865f2`, directly against the brief's "avoid
  obvious Discord copy" direction. Replaced with an on-brand gradient built from
  `var(--cn-noir)` / `var(--cn-crimson)` (same visual structure: radial highlight + diagonal
  gradient, different source colors).
- Checked and found **not** a bug (left alone): the unscoped-looking global `.btn` /
  `.btn-primary` / input/select rules in `crimson-common.scss` — `crimson-common.scss` around
  line ~2394 has a dedicated `body.admin-interface` section that deliberately keeps the brand
  primary/danger buttons but neutralizes border/shadow noise elsewhere in admin; this is an
  intentional, working strategy, not an oversight. Left untouched.
- Checked hover/focus pairing on the left rail (`.cn-server-button`), touch target sizing
  (44–46px, meets the 44px minimum), and `prefers-color-scheme` usage (none — the theme
  correctly relies on Discourse's own color-scheme custom properties) — no issues found.

## Known gap deferred to Phase 10 (not fixed here — out of this PR's controlled scope)
- Crimson's desktop shell (left rail, channel sidebar width, content gutter) only activates at
  `@media (width >= 1000px)` in `desktop/desktop.scss`. Discourse's own mobile/desktop boundary
  is lower (~768px). Between ~768px and 999px the page currently gets neither the mobile-tuned
  layout nor the Crimson desktop shell — a real tablet gap matching the brief's explicit 768/
  820/1024 tablet requirement. This needs deliberate tablet-specific shell rules, which is
  Phase 10 (Responsive desktop/tablet/mobile polish) scope, not a one-line fix; flagging it now
  so it isn't silently missed.

## Regression coverage
- No new system spec: this change is a pure token/dead-code cleanup plus one hardcoded-color
  swap, with no markup, class name, or JS change — nothing new to assert structurally.
  `pnpm lint:css` / `lint:css:fix` / `lint:prettier` confirm the SCSS still compiles/parses and
  every removed variable resolves elsewhere.
- Existing shell/navigation/community-removal/topic-list specs are unaffected (no shared
  selectors touched).

## Validation
- `pnpm lint:css`, `pnpm lint:prettier`: ran locally, clean.
- Manually confirmed (via `grep -c`) that all 19 removed `--cn-*` variable names still have
  exactly one live definition in `crimson-palette-foundation.scss`.
- `spec/system/`: **NOT RUN** locally — no local Rails/Capybara harness in this theme-only repo
  (`Gemfile` only carries `rubocop-discourse` + `syntax_tree`). Official Discourse Theme CI on
  the exact PR head is authoritative.

## Known blockers
- none; merge gated on latest-exact-head Official Discourse Theme CI GREEN, same as every PR in
  this repo.

## Next action
- Open the PR, get exact-head Official Discourse Theme CI GREEN, squash merge.
- Then continue the roadmap: Phase 5 (topic reading page) onward, each phase its own PR.

Rules: source/tests beat this document; refresh stale SHA/CI claims; `NO_CI != GREEN`.
