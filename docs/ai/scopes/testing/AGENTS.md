# Crimson Channels — Theme Testing Scoped Rules

Use this file for regression tests, browser/system behavior, responsive/theme-mode validation, and CI decisions.

## Test strategy
- Discourse supports client-side theme tests and Rails system tests. For end-to-end theme behavior, prefer the officially recommended Rails system-test path using RSpec + Capybara.
- Put system tests under `spec/system/` and name files `<description>_spec.rb`.
- Top-level specs must use system-test metadata compatible with current Discourse (`system: true` in the official theme guide; verify current core examples when syntax-sensitive).
- Upload the theme in the test using `upload_theme` before asserting rendered behavior; use `upload_theme_component` for a component.
- Theme settings can be changed inside a system test with `theme.update_setting(...)` followed by `theme.save!`; use this to test enabled/disabled, limits, visibility, and object-setting behavior.
- Use Discourse fabricators for users/categories/topics and `sign_in` for anonymous/member/staff behavior when the feature depends on user state.
- Page Objects are appropriate when selectors/actions are reused across multiple system specs.

## Crimson regression matrix
Add or extend system coverage when a change can break any of these surfaces:
- desktop and mobile/narrow layouts
- light and dark/color-scheme behavior
- homepage/latest/categories/topic/profile/chat/server-list navigation
- sidebar/header navigation compatibility when relevant
- absence of the retired right Community/member rail, member toggle, and mobile Community drawer
- user-card click/hover behavior
- featured-topic rendering and empty/failure states
- structured navigation and group-resolved visibility
- optional companion plugins unavailable or removed: the theme shell must remain usable without them

## Navigation-mode checks
- When manually validating navigation-related styling, use Discourse's current `?navigation_menu=sidebar` and `?navigation_menu=header_dropdown` preview modes when supported by the target core.
- Verify current core before treating older documented navigation modes as acceptance requirements.

## Running/debugging system tests
- Theme CLI supports `discourse_theme rspec .`, `discourse_theme rspec spec/system`, one spec file, or a file/line target.
- Use `--headful` and `pause_test` only for interactive debugging; committed tests must run unattended/headless.
- A skipped test/build step is not equivalent to a passing test. Record what actually ran.

## CI authority
- Repository delivery remains `Builder -> targeted validation -> PR -> exact-head Official Discourse Theme CI -> bounded remediation -> CI -> merge`.
- Latest exact PR-head required Discourse/theme CI is authoritative. Any new commit invalidates previous exact-head CI evidence.
- Claude/Gemini/Codex approvals are not merge gates and must not be awaited.
- `NO_CI`, missing, skipped, pending, cancelled, stale-head, or failed required checks are not GREEN.
- When the latest exact head required CI is GREEN and no unresolved security/product/architecture blocker remains, current repository rules authorize merge without further confirmation.
- Never weaken or delete a meaningful regression test to make CI green. Fix the smallest root cause or escalate after the bounded remediation limit.

## Official Discourse references — consult on demand
- Developer guides index: https://meta.discourse.org/t/developer-guides-index/308036?tl=en
- Theme E2E/system tests: https://meta.discourse.org/t/-/281579?silent=true
- Theme development map: https://meta.discourse.org/t/-/93648?silent=true
- Quick reference: https://meta.discourse.org/t/-/110448?silent=true
- Theme CLI: https://meta.discourse.org/t/-/82950?silent=true
- Minimizing maintenance: https://meta.discourse.org/t/-/261388?silent=true
- Navigation menu preview: https://meta.discourse.org/t/-/258401?silent=true
