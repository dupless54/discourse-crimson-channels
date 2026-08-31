# Current State

## Main

- repository: `dupless54/discourse-crimson-channels`
- base branch: `main`
- latest landed phase: PR #45, core-native premium category, tag, and discovery surfaces
- delivery gate: the latest exact PR head must pass the required Official Discourse Theme CI

## Active work

- no open implementation PR
- no known product, security, architecture, or compatibility blocker

## Current implementation

- The premium shell, topic list, topic-reading surfaces, category directory, and tag directory are
  delivered as focused modules over current Discourse structure.
- Topic rows use native `TopicCell`; the author avatar is outlet-injected through `DUserLink` and
  keeps the `[data-user-card]` + `img.avatar` anchors used by avatar cosmetics.
- Category tables, category boxes, tags, routes, accessibility, and plugin outlets remain
  core-owned. The theme adds semantic-variable retinting and responsive surface polish only.
- The retired category reconstruction and its fixed pseudo-labels are removed.
- Discovery layouts cover desktop, 820px tablet, mobile, and narrow screens without document-level
  horizontal overflow.
- Hover elevation is limited to `.discourse-no-touch`; reduced-motion behavior remains available.
- The theme remains frontend-only and does not depend on Crimson Community endpoints.

## Validation evidence

- PR #45 exact head `5ef6244786c6d19cdada0508cfd187e37bd2f3fc`:
  - `ci / linting`: success
  - `ci / check_for_tests`: success
  - `ci / backend_tests`: success
  - `ci / system_tests`: success
- Discovery system coverage includes native category cards, 820px tablet overflow, fluid tags, and
  mobile category cards.
- Existing core-feature, shell, topic-list/avatar, and topic-reading system coverage also passed on
  the same exact head.

## Next action

1. Audit remaining profile, search, composer, chat, and server-list surfaces against current core.
2. Keep only evidenced visual deltas; remove legacy selector overrides before adding new polish.
3. Add route-level responsive coverage for any changed surface.
4. Deliver the next bounded phase through PR and fresh exact-head CI.

Rules: current source/tests beat this document; a new implementation commit invalidates old CI
evidence; `NO_CI != GREEN`.
