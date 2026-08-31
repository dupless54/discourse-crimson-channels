# Crimson Channels — Canonical Agent Instructions

## Context priority
Current source/tests > `docs/ai/CURRENT_STATE.md` > nearest applicable local `AGENTS.md` > stable docs > plans/history.

## Fast path
Non-trivial work için `.agents/skills/task-packet/SKILL.md` kullan.
Varsayılan okuma: root `AGENTS.md` -> `CURRENT_STATE.md` -> nearest scoped `AGENTS.md` -> gerekli source -> on-demand docs/skills.
Tercih: `symbol/search -> targeted range -> dependency`.

## Theme area router
- `about.json`, `settings.yml`, `locales/`, `migrations/settings/`, theme assets/metadata -> `docs/ai/scopes/theme-config/AGENTS.md`.
- `common/`, `desktop/`, `mobile/`, `javascripts/`, `stylesheets/` -> `docs/ai/scopes/frontend/AGENTS.md`.
- `spec/system/`, theme regression/browser validation -> `docs/ai/scopes/testing/AGENTS.md`.
- Git/CI -> `docs/ai/WORKFLOW.md` + `docs/ai/COMMANDS.md`; add testing scope when CI is exercising theme tests.
- Cross-plugin/API behavior -> additionally read `docs/ai/DECISIONS.md` and the exact call sites.

## Project invariants
- This repository is a Discourse **theme**, not a backend plugin. Do not add server authorization/business logic here.
- Preserve native Discourse routing, accessibility, theme variables, light/dark behavior, mobile behavior, and safe upgrade paths.
- Prefer current supported Discourse theme APIs/primitives over DOM monkey-patching when an equivalent supported API exists.
- Crimson Community is an independent optional plugin. The Crimson Channels shell must not depend on or recreate its online-member/profile-visitor rail or poll `/crimson-community/*` endpoints unless a future task explicitly reintroduces a reviewed integration.
- Custom shell elements must never make core Discourse navigation or topic reading unusable.
- Keep AI context files outside runtime-compiled theme paths. Never place `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md` under `javascripts/`, `common/`, `desktop/`, `mobile/`, `stylesheets/`, or `assets/`.

## Adaptive context
Cross-plugin contracts, privacy, external requests, destructive operations, or broad Discourse API migrations require controlled context expansion. Correctness and safety beat token savings.

## CI-only Git/GitHub governance
- lock task scope and exact allowed paths
- verify exact changed paths
- run targeted checks first
- Claude/Gemini/Codex approvals are not merge gates and must not be awaited
- latest exact PR head required Discourse/theme CI is authoritative; new commits invalidate old CI evidence
- any additional required Discourse-owned check must also be GREEN
- `NO_CI`, missing, skipped, pending, cancelled, stale-head, or failed checks are not GREEN
- when latest exact PR head required CI is GREEN and no unresolved security/product/architecture blocker remains, the agent is authorized to merge without further user confirmation
- prefer squash + exact `expected_head_sha` when supported
- force/destructive Git actions still need separate explicit authorization

## CI remediation
Fail -> first actionable root cause -> classify -> smallest justified repair -> targeted validation -> new exact head -> new exact-head CI.
Maximum 3 remediation rounds, then `NEEDS_HUMAN`. Never weaken tests or broaden architecture just to make CI green.

## Effort routing
Before broad reads on non-trivial work, classify with `docs/ai/EFFORT_ROUTER.md`.
- T0 mechanical -> low effort
- T1 routine theme/frontend work -> medium effort
- T2 cross-plugin contract/privacy/high-impact compatibility -> high effort
- T3 exceptional only when targeted T2 evidence is insufficient

## Live Discourse developer source gate

Canonical live upstream index: https://meta.discourse.org/t/developer-guides-index/308036?tl=en
Project-owner supplied official index/reference collection: https://meta.discourse.org/t/developer-index/322723?u=erespawn

For any Discourse-version-sensitive implementation, refactor, review, or compatibility decision:
- start at the live Developer Guides Index and open only the task-relevant official topic(s);
- this repository is a theme, so prioritize **Code & Internals + Themes & Components + Theme Developer Tutorial**; use plugin/environment/general guides only when the task actually crosses those boundaries;
- verify version-sensitive APIs and deprecations against current `discourse/discourse` core or the current official theme skeleton before coding when needed;
- current official docs/core beat remembered examples, old snippets, and copied local guidance unless the repo deliberately targets an older validated release via `.discourse-compatibility` / d-compat;
- do not preload the full index: read the nearest local rules and target theme source/tests first, then fetch only the upstream guide(s) needed for the current choice.

### Official theme reference set
Use these official Discourse guides as the default source set when editing Crimson Channels. Open only the guides relevant to the current task.

**Theme structure and authoring**
- Developing Themes & Theme Components: https://meta.discourse.org/t/-/93648?silent=true
- Theme Developer Quick Reference: https://meta.discourse.org/t/-/110448?silent=true
- Designer's Guide: https://meta.discourse.org/t/-/152002?silent=true
- Theme structure: https://meta.discourse.org/t/-/60848?silent=true
- Split theme JavaScript: https://meta.discourse.org/t/-/119369?silent=true
- Split theme SCSS: https://meta.discourse.org/t/-/115126?silent=true
- Theme settings: https://meta.discourse.org/t/-/82557?silent=true
- Theme setting objects: https://meta.discourse.org/t/-/305009?silent=true
- Theme setting migrations: https://meta.discourse.org/t/-/287783?silent=true
- Core variables in themes: https://meta.discourse.org/t/-/77551?silent=true
- Localizable theme strings: https://meta.discourse.org/t/-/109867?silent=true
- Dark-mode support: https://meta.discourse.org/t/-/161595?silent=true
- Minimize theme maintenance: https://meta.discourse.org/t/-/261388?silent=true

**Supported client customization APIs**
- Discourse JS API: https://meta.discourse.org/t/-/41281?silent=true
- Plugin outlets from themes/plugins: https://meta.discourse.org/t/-/32727?silent=true
- Transformers: https://meta.discourse.org/t/-/349954?silent=true
- Topic list customization: https://meta.discourse.org/t/-/350411?silent=true
- AppEvents triggers: https://meta.discourse.org/t/-/338465?silent=true

**CSS, responsive design, and accessibility-adjacent UI behavior**
- BEM CSS class guidelines: https://meta.discourse.org/t/-/361851?silent=true
- Designing for touch & hover: https://meta.discourse.org/t/-/367810?silent=true
- Responsive widths / breakpoints / viewport / containers: https://meta.discourse.org/t/-/409279?silent=true
- JavaScript type hinting & validation: https://meta.discourse.org/t/-/395136?silent=true

**Testing and upgrade safety**
- Theme end-to-end system tests: https://meta.discourse.org/t/-/281579?silent=true
- Discourse UI system specs: https://meta.discourse.org/t/-/325937?silent=true
- Run core/plugin/theme QUnit suites: https://meta.discourse.org/t/-/66857?silent=true
- GitHub Actions CI: https://meta.discourse.org/t/-/240150?silent=true
- d-compat/version pinning: https://meta.discourse.org/t/-/272665?silent=true

**Theme tutorial sequence**
- Introduction: https://meta.discourse.org/t/-/357796?silent=true
- Remote theme: https://meta.discourse.org/t/-/357797?silent=true
- CSS in themes: https://meta.discourse.org/t/-/357798?silent=true
- Outlets: https://meta.discourse.org/t/-/357799?silent=true
- Components: https://meta.discourse.org/t/-/357800?silent=true
- JS API: https://meta.discourse.org/t/-/357801?silent=true
- Conclusion: https://meta.discourse.org/t/-/357802?silent=true

### Source hygiene
- Treat guides explicitly marked **outdated**, **deprecated**, or **not recommended** as historical/context-only unless the current task specifically requires them.
- Do not copy old Ember/DOM patterns merely because an old Meta topic demonstrates them; check the live guide and current core first.
- Prefer outlets, supported JS APIs, transformers, theme settings, core variables, viewport/container helpers, and tested components before selector-heavy DOM rewrites.
- For every version-sensitive theme change, the implementation should be explainable by a current official guide and/or current `discourse/discourse` core behavior.
