# Crimson Channels — Theme Configuration Scoped Rules

Use this file for `about.json`, `settings.yml`, `locales/`, `migrations/settings/`, theme assets/metadata, color schemes, modifiers, and themeable site settings.

## Source-of-truth policy
- Current repository source/tests and current Discourse core behavior beat examples from older documentation.
- The links below are official Discourse Meta developer guides. Re-check the relevant official page when behavior may have changed instead of relying on remembered syntax.
- Prefer supported current mechanisms over legacy snippets. In particular, prefer `type: objects` over `json_schema`.
- Keep configuration changes migration-safe and admin-editable; never silently discard a site owner's existing customized value.

## Theme settings
- Define theme settings in root `settings.yml`/`settings.yaml`. Give non-trivial settings an explicit `type`, bounded validation where appropriate, and localized admin descriptions.
- Supported top-level setting types currently include `integer`, `float`, `string`, `bool`, `list`, `enum`, `objects`, `upload`, and `icon`. `list`, `enum`, and `icon` require explicit type declaration.
- Theme JS reads theme settings from the theme `settings` object. Do not replace a theme setting with a hard-coded runtime constant when the value is intended to be site-admin configurable.
- For group-dependent features, never infer authorization/visibility from `currentUser.groups`; hidden groups may be absent. Use Discourse's `resolve_group_membership: true` support where applicable and consume the generated `user_in_*` boolean.

## `type: objects`
- Use `type: objects` for structured/repeatable admin-managed configuration. It is the supported replacement for `json_schema`.
- Define `type`, `default`, and `schema`; object properties may use `string`, `integer`, `float`, `boolean`, `upload`, `enum`, `categories`, `groups`, `tags`, `icon`, and nested `objects`.
- Properties are optional unless `required: true` is set. Use built-in validations (`min_length`/`max_length`/`url` for strings; `min`/`max` for numbers and collection counts) rather than duplicating preventable validation only in runtime JS.
- `type: icon` values are icon names and selected icons are automatically added to the Discourse icon sprite.
- For a `groups` property with `resolve_group_membership: true`, expect runtime objects to expose `user_in_<property>` rather than raw group IDs. This also works for nested objects and automatic groups.
- Nested `objects` are the preferred basis for section -> child-item configurations such as Crimson channel sections.
- Localize object-schema labels/descriptions under the setting's `theme_metadata.settings` locale structure rather than hard-coding admin text.

## Settings migrations
- Put migrations in `migrations/settings/XXXX-name.js`, starting at `0001` and increasing sequentially.
- Migration functions receive the modified-settings `Map`, mutate it with `get`/`has`/`set`/`delete`, and return it.
- Migrations run automatically on install/update and only once after success. Never edit an already-successful migration to repair data; add a new migration that corrects the state.
- A setting rename/type/shape change must update `settings.yml` and have a compatible migration when existing admin values would otherwise be lost or misread.
- Preserve defaults: migrate only values that actually need conversion; do not manufacture an override that freezes a user on an old default unnecessarily.

## Localisation
- Put translations in `locales/{locale}.yml` with exactly one top-level locale key. English is the fallback for incomplete non-English files.
- Runtime theme strings must use Discourse i18n rather than hard-coded user-facing text. Use `i18n(themePrefix("key"))`; never hard-code a theme ID.
- Put admin-facing descriptions under `theme_metadata`.
- Use MessageFormat only when the UI string genuinely needs plural/select logic. MessageFormat keys end in `_MF`; it is a client-side translation mechanism and must keep the language's valid plural forms, including `other`.

## `about.json` and compatibility
- `about.json` is required. Keep `name`, `component`, `authors`, `about_url`, `license_url`, `theme_version`, supported Discourse-version bounds, `assets`, `color_schemes`, `screenshots`, `modifiers`, and `theme_site_settings` accurate when those features are used.
- If a feature requires a newer Discourse primitive, set an honest `minimum_discourse_version` instead of shipping compatibility code that cannot work correctly on older versions.
- Theme components use `"component": true`; Crimson Channels itself remains a full theme.

## Assets and fonts
- Git-sourced themes must keep durable assets in the repository (`assets/`) and register them in `about.json`. Do not rely on uploads made only through the admin UI for a remotely installed Git theme; those can be cleared by updates.
- Access registered theme uploads in JS through `settings.theme_uploads.<name>` and through the generated SCSS asset variable in stylesheets.
- Custom fonts belong in repository assets with correct licensing and `@font-face`; prefer WOFF2 when available. Do not add a font merely to imitate a platform when system/core typography can meet the design goal.

## Color schemes and screenshots
- Share theme color schemes through `about.json` `color_schemes`; keep semantic Discourse color slots rather than inventing a parallel global palette system.
- Theme preview screenshots belong under `screenshots/`. Up to two screenshots can be declared. Prefer light + dark, 16:9, 2560x1440, under 1 MB each, WebP/PNG/JPEG.

## Theme modifiers
- Theme modifiers are predefined core hooks, not arbitrary backend access. Define them under `about.json` `modifiers` only when the exact current Discourse modifier exists.
- Verify the current Discourse core modifier schema before adding or changing one; the Meta list is explicitly not guaranteed to be exhaustive forever.
- A modifier may derive its value from a theme setting using `{ "type": "setting", "value": "setting_name" }` when site-admin control is appropriate.
- Do not use modifiers as a workaround for server authorization or business logic; those belong in plugins.

## Themeable site settings
- A full theme may set install-time values only for core site settings marked `themeable: true` in current Discourse core.
- Declare these under `about.json` `theme_site_settings`.
- Treat them as initial/theme-scoped configuration: later theme updates do not overwrite a database value already changed by the admin. Never build logic that assumes a theme update will force the value back.
- Theme components cannot use this mechanism as a substitute for a full theme.

## Tooling guidance
- Theme Creator and Theme CLI are supported development/preview tools. This repo's GitHub + Official Discourse Theme CI workflow remains canonical for delivery.
- Use `discourse_theme watch`/`download` only when a live Discourse test site or Theme Creator workflow is actually available; never make CI evidence depend on an unavailable local tool.
- If Theme CLI credentials are needed, follow current Discourse guidance and never commit API keys.
- Custom Highlight.JS languages can be added through the Discourse plugin/theme API when genuinely required; do not bundle language definitions without a concrete use case.

## Official Discourse references — consult on demand
- Theme development map: https://meta.discourse.org/t/-/93648?silent=true
- Quick reference: https://meta.discourse.org/t/-/110448?silent=true
- Designer guide: https://meta.discourse.org/t/-/152002?silent=true
- Theme Creator + CLI workflow: https://meta.discourse.org/t/-/108444?silent=true
- Theme CLI: https://meta.discourse.org/t/-/82950?silent=true
- Theme structure: https://meta.discourse.org/t/-/60848?silent=true
- Theme settings: https://meta.discourse.org/t/-/82557?silent=true
- Objects settings: https://meta.discourse.org/t/-/305009?silent=true
- Settings migrations: https://meta.discourse.org/t/-/287783?silent=true
- Theme metadata/screenshots: https://meta.discourse.org/t/-/119205?silent=true
- Localizable strings: https://meta.discourse.org/t/-/109867?silent=true
- MessageFormat: https://meta.discourse.org/t/-/7035?silent=true
- Theme modifiers: https://meta.discourse.org/t/-/150605?silent=true
- Theme assets: https://meta.discourse.org/t/-/62459?silent=true
- Font theme components: https://meta.discourse.org/t/-/62462?silent=true
- Highlight.JS language extension: https://meta.discourse.org/t/-/292480?silent=true
- Color schemes: https://meta.discourse.org/t/-/61196?silent=true
- Preview screenshots: https://meta.discourse.org/t/-/365083?silent=true
- Themeable site settings: https://meta.discourse.org/t/-/374376?silent=true
