# Crimson Channels — Canonical Agent Instructions

## Context priority
Current source/tests > `docs/ai/CURRENT_STATE.md` > nearest applicable local `AGENTS.md` > stable docs > plans/history.

## Fast path
Non-trivial work için `.agents/skills/task-packet/SKILL.md` kullan.
Varsayılan okuma: root `AGENTS.md` -> `CURRENT_STATE.md` -> nearest scoped `AGENTS.md` -> gerekli source -> on-demand docs/skills.
Tercih: `symbol/search -> targeted range -> dependency`.

## Theme area router
- `about.json`, `settings.yml`, `locales/` -> root rules + targeted file only.
- `common/`, `desktop/`, `mobile/`, `javascripts/` -> `docs/ai/scopes/frontend/AGENTS.md`.
- Git/CI -> `docs/ai/WORKFLOW.md` + `docs/ai/COMMANDS.md` only when needed.
- Cross-plugin/API behavior -> additionally read `docs/ai/DECISIONS.md` and the exact call sites.

## Project invariants
- This repository is a Discourse **theme**, not a backend plugin. Do not add server authorization/business logic here.
- Preserve native Discourse routing, accessibility, theme variables, light/dark behavior, mobile behavior, and safe upgrade paths.
- Prefer current supported Discourse theme APIs/primitives over DOM monkey-patching when an equivalent supported API exists.
- Crimson Community owns online-member/profile-visit server truth. This theme consumes its public JSON seams only and must fail gracefully when that plugin/endpoint is unavailable.
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
- when latest exact head required CI is GREEN and no unresolved security/product/architecture blocker remains, the agent is authorized to merge without further user confirmation
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

For any Discourse-version-sensitive implementation, refactor, review, or compatibility decision:
- start at the live Developer Guides Index and open only the task-relevant official topic(s);
- this repository is a theme, so prioritize **Code & Internals + Themes & Components + Theme Developer Tutorial**; use plugin/environment/general guides only when the task actually crosses those boundaries;
- verify version-sensitive APIs and deprecations against current `discourse/discourse` core or the current official theme skeleton before coding when needed;
- current official docs/core beat remembered examples, old snippets, and copied local guidance unless the repo deliberately targets an older validated release via `.discourse-compatibility` / d-compat;
- do not preload the full index: read the nearest local rules and target theme source/tests first, then fetch only the upstream guide(s) needed for the current choice.
