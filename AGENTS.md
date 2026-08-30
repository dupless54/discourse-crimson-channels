# Crimson Channels — Canonical Agent Instructions

## Context priority
Current source/tests > `docs/ai/CURRENT_STATE.md` > nearest applicable local `AGENTS.md` > current official Discourse docs > stable project docs > plans/history.

## Fast path
Non-trivial work için `.agents/skills/task-packet/SKILL.md` kullan.
Varsayılan okuma: root `AGENTS.md` -> `CURRENT_STATE.md` -> nearest scoped `AGENTS.md` -> gerekli source -> on-demand docs/skills.
Tercih: `symbol/search -> targeted range -> dependency`.

## Official Discourse documentation policy
- This project keeps condensed, task-routed rules from the official Discourse Meta developer guides in scoped `AGENTS.md` files so agents do not need to load the whole documentation corpus for every task.
- When a Discourse API, file layout, theme-setting type, modifier, testing helper, or navigation behavior could have changed, re-check the linked official Meta guide and/or current Discourse core before implementing from memory.
- Never blindly copy legacy forum snippets. Prefer the current filesystem-based theme structure, `.gjs`/Glimmer patterns, `apiInitializer`, supported Plugin API/outlets/transformers, `type: objects`, CSS custom properties, and current test helpers.
- If current Discourse core contradicts an older Meta example, current core + current tests win. Record compatibility assumptions when they materially constrain the implementation.
- Do not paste whole external guides into task context. Read the scoped summary first, then open only the exact official source needed for the task.

## Theme area router
- `about.json`, `settings.yml`, `locales/`, `migrations/settings/`, assets/metadata, color schemes, modifiers, themeable site settings -> `docs/ai/scopes/theme-config/AGENTS.md`.
- `common/`, `desktop/`, `mobile/`, `javascripts/`, `scss/`, frontend visual/runtime behavior -> `docs/ai/scopes/frontend/AGENTS.md`.
- `spec/system/`, regression/browser behavior, responsive/theme-mode validation -> `docs/ai/scopes/testing/AGENTS.md`.
- Git/CI -> `docs/ai/WORKFLOW.md` + `docs/ai/COMMANDS.md` only when needed.
- Cross-plugin/API behavior -> additionally read `docs/ai/DECISIONS.md` and the exact call sites.

## Project invariants
- This repository is a Discourse **theme**, not a backend plugin. Do not add server authorization/business logic here.
- Preserve native Discourse routing, accessibility, theme variables, light/dark behavior, mobile behavior, and safe upgrade paths.
- Prefer current supported Discourse theme APIs/primitives over DOM monkey-patching when an equivalent supported API exists.
- Crimson Community owns online-member/profile-visit server truth. This theme consumes its public JSON seams only and must fail gracefully when that plugin/endpoint is unavailable.
- Custom shell elements must never make core Discourse navigation or topic reading unusable.
- Keep AI context files outside runtime-compiled theme paths. Never place `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md` under `javascripts/`, `common/`, `desktop/`, `mobile/`, `stylesheets/`, `scss/`, or `assets/`.

## Adaptive context
Cross-plugin contracts, privacy, external requests, destructive operations, or broad Discourse API migrations require controlled context expansion. Correctness and safety beat token savings.

## Git/GitHub governance
- lock task scope and exact allowed paths
- verify exact changed paths
- run targeted checks first
- latest exact PR head CI is authoritative; new commits invalidate old CI evidence
- `NO_CI != GREEN`
- PR creation/update is not merge authorization
- merge only with explicit user approval, preferably squash + exact expected head SHA
- force/destructive Git actions need separate explicit authorization

## CI remediation
Fail -> first actionable root cause -> classify -> smallest justified repair -> targeted validation -> new exact head -> new exact-head CI.
Maximum 3 remediation rounds, then `NEEDS_HUMAN`. Never weaken tests or broaden architecture just to make CI green.

## Effort routing
Before broad reads on non-trivial work, classify with `docs/ai/EFFORT_ROUTER.md`.
- T0 mechanical -> low effort
- T1 routine theme/frontend work -> medium effort
- T2 cross-plugin contract/privacy/high-impact compatibility -> high effort
- T3 exceptional only when targeted T2 evidence is insufficient
