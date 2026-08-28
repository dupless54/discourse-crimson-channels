# Repository Map

Navigation hint only; runtime source is authority.

- `about.json` — theme metadata and color schemes.
- `settings.yml` — admin-configurable theme settings.
- `locales/` — theme/admin setting translations.
- `common/body_tag.html` — persistent Discord-like server/member rail markup.
- `common/common.scss` — shared visual system and component styling.
- `desktop/desktop.scss` — desktop rail/content geometry.
- `mobile/mobile.scss` — mobile layout/drawer/navigation behavior.
- `javascripts/discourse/api-initializers/crimson-channels.js` — current consolidated runtime behavior (~1.6k LOC); split by concern in a dedicated future PR.
- `.github/workflows/` — Official Discourse theme CI + d-compat automation.
- `docs/ai/scopes/frontend/` — frontend AI context; never runtime source.

Cross-plugin seam currently used by the theme:
- `GET /crimson-community/online.json`
- `GET /crimson-community/profile-visits/:username.json`
- `POST /crimson-community/profile-visits/:username.json`
