# Current State

## Main
- repository: `dupless54/discourse-crimson-channels`
- base branch: `main`
- main SHA at start of current work: `a2b7d8735d5b31861e73a25c8b17695bdbb6bc33`
- delivery gate: latest exact PR head must have Official Discourse Theme CI `completed / success`

## Active work
- branch: `refactor/remove-community-rail`
- scope: remove the Crimson Community right member rail from the theme shell and make the theme independent from Community presence/profile-visitor data
- effort/risk: bounded frontend/config/test refactor; cross-plugin behavior is being removed rather than expanded

## Intended shipped behavior
- keep the Discord-like left quick-navigation/server rail
- keep native Discourse sidebar/content/header behavior
- remove `#cn-community-panel` and the desktop right member rail
- remove the server-rail member toggle
- remove the mobile Community drawer/backdrop/header toggle
- reserve zero desktop width for the retired member rail
- remove Community-rail-specific theme settings and locale descriptions
- do not require `/crimson-community/online.json` or profile-visitor payloads for the theme shell
- leave `discourse-crimson-community` itself untouched and independent if installed
- keep unrelated profile-card/banner, navigation, featured-topic, and visual features

## Compatibility strategy
- `common/body_tag.html` no longer emits Community/member markup.
- `stylesheets/crimson-community-removal.scss` is loaded last and neutralizes old rail geometry while legacy selectors remain in older shared/desktop/mobile stylesheets.
- `javascripts/discourse/api-initializers/zz-crimson-community-removal.js` keeps old dynamically-created Community controls inert and maintains `cn-member-rail-disabled`; this prevents the legacy initializer from polling Community endpoints while its unrelated responsibilities are still present.
- The older monolithic `crimson-channels.js` should be decomposed in a later dedicated cleanup rather than risk deleting unrelated user-card/profile/navigation behavior in this removal task.

## Regression coverage
- system shell spec asserts the right Community panel, member button, mobile toggle, and backdrop are absent
- structured navigation, brand setting, empty navigation configuration, and group-restricted navigation remain covered

## Validation
- exact changed-path review required before PR
- Official Discourse Theme CI required on the latest exact PR head
- lint/build/system-test failures must be fixed at their first actionable root cause; do not weaken regression coverage

## Known blockers
- no product blocker: the user explicitly requested removal of the theme right bar and Crimson Community shell section
- merge remains blocked until latest exact-head Official Discourse Theme CI is GREEN

## Next action
- verify branch diff, open PR, run exact-head Official Discourse Theme CI, remediate if needed, then squash merge with `expected_head_sha`

Rules: source/tests beat this document; refresh stale SHA/CI claims; `NO_CI != GREEN`.
