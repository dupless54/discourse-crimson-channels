# Crimson Channels — Theme Testing Scoped Rules

Use this file for regression tests, browser/system behavior, responsive/theme-mode validation, and CI decisions.

## Test strategy
- Discourse supports client-side theme tests and Rails system tests. For end-to-end theme behavior, prefer the officially recommended Rails system-test path using RSpec + Capybara.
- Put system tests under `spec/system/` and name files `<description>_spec.rb`.
- Top-level specs must use system metadata (`system: true` / current core-equivalent syntax).
- Upload the theme in the test using Discourse's theme test helpers before asserting rendered behavior.
- Theme settings can be changed inside a system test with `theme.update_setting(...)` followed by save; use this to test enabled/disabled, limits, visibility, and object-setting behavior instead of creating separate implementation-only tests.
- Use Discourse fabricators for users/categories/topics and `sign_in` for anonymous/member/staff behavior when the feature depends on user state.

## Crimson regression matrix
Add or extend system coverage when a change can break any of these surfaces:
- desktop and mobile/narrow layouts
- light and dark/color-scheme behavior
- homepage/latest/categories/topic/profile/chat/server-list navigation
- sidebar/header navigation compatibility when relevant
- member rail open/collapse/mobile drawer + focus restoration
- user-card click/hover behavior
- featured-topic rendering and empty/failure states
- structured navigation and group-resolved visibility
- Crimson Community installed, unavailable, rate-limited, or returning an error: the theme shell must remain usable

## Navigation-mode checks
- When manually validating navigation-related styling, use Discourse's `?navigation_menu=sidebar` and `?navigation_menu=header_dropdown` preview modes when supported by the target core.
- The official guide historically documents `legacy` too, but its continued availability has been questioned in later discussion. Verify the current target core before treating `legacy` as an acceptance requirement.

## Running/debugging system tests
- Theme CLI supports `discourse_theme rspec` against a whole theme, `spec/system`, one spec file, or a file/line target.
- Use `--headful` and `pause_test` only for interactive debugging; committed tests must run unattended/headless.
- A skipped test/build step is not equivalent to a passing test. Record what actually ran.

## CI authority
- Repository delivery remains `Builder -> targeted validation -> PR -> exact-head Official Discourse Theme CI -> bounded remediation -> CI -> explicit merge authorization`.
- Latest exact PR-head CI is authoritative. Any new commit invalidates previous CI evidence.
- `NO_CI != GREEN`; skipped checks are not evidence for behavior they did not execute.
- Never weaken or delete a meaningful regression test to make CI green. Fix the smallest root cause or escalate after the bounded remediation limit.

## Official Discourse references — consult on demand
- Theme E2E/system tests: https://meta.discourse.org/t/-/281579?silent=true
- Theme development map: https://meta.discourse.org/t/-/93648?silent=true
- Quick reference: https://meta.discourse.org/t/-/110448?silent=true
- Theme CLI: https://meta.discourse.org/t/-/82950?silent=true
- Minimizing maintenance: https://meta.discourse.org/t/-/261388?silent=true
- Navigation menu preview: https://meta.discourse.org/t/-/258401?silent=true
