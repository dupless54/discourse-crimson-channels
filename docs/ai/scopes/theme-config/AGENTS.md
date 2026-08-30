# Crimson Channels — Theme Configuration Scoped Rules

Use this file for `about.json`, `settings.yml`, `locales/`, `migrations/settings/`, theme assets/metadata, color schemes, modifiers, and themeable site settings.

## Source-of-truth policy
- Current repository source/tests and current Discourse core behavior beat examples from older documentation.
- Start version-sensitive decisions from the live Developer Guides Index, then open only the task-relevant official topic.
- Prefer supported current mechanisms over legacy snippets. In particular, prefer `type: objects` over `json_schema`.
- Keep configuration changes migration-safe and admin-editable; never silently discard a site owner's existing customized value.

## Theme settings
- Define theme settings in root `settings.yml`/`settings.yaml`. Give non-trivial settings an explicit `type`, bounded validation where appropriate, and localized admin descriptions.
- Supported top-level setting types include `integer`, `float`, `string`, `bool`, `list`, `enum`, `objects`, `upload`, and `icon`; verify current core before relying on an uncommon type.
- Theme JS reads theme settings from the theme `settings` object. Do not replace an admin-configurable value with a hard-coded runtime constant.
- For group-dependent features, do not infer membership from `currentUser.groups`; hidden groups may be absent. Use `resolve_group_membership: true` where applicable and consume the generated `user_in_*` boolean.

## `type: objects`
- Use `type: objects` for structured/repeatable admin-managed configuration. It is the supported replacement for `json_schema`.
- Define `type`, `default`, and `schema`; object properties may use supported property types such as `string`, `integer`, `float`, `boolean`, `upload`, `enum`, `categories`, `groups`, `tags`, `icon`, and nested `objects`.
- Properties are optional unless `required: true` is set. Use built-in validations where possible rather than duplicating preventable validation only in runtime JS.
- `type: icon` values are icon names and selected icons are automatically added to the Discourse icon sprite.
- For a `groups` property with `resolve_group_membership: true`, runtime objects expose `user_in_<property>` for the current user instead of requiring raw group inspection. This also applies in nested objects where supported by current core.
- Nested `objects` are the preferred basis for section -> child-item configurations such as Crimson channel sections.
- Localize object-schema labels/descriptions under the setting's `theme_metadata.settings` locale structure rather than hard-coding admin text.

## Settings migrations
- Put migrations in `migrations/settings/XXXX-name.js`, starting at `0001` and increasing sequentially.
- Migration functions receive the modified-settings `Map`, mutate it with `get`/`has`/`set`/`delete`, and return it.
- Migrations run automatically on install/update and only once after success. Never edit an already-successful migration to repair data; add a new migration.
- A setting rename/type/shape change must update `settings.yml` and have a compatible migration when existing admin values would otherwise be lost or misread.
- Preserve defaults: migrate only values that actually need conversion; do not manufacture an override that freezes a site on an old default unnecessarily.

## Localisation
- Put translations in `locales/{locale}.yml` with one top-level locale key. English is the fallback for incomplete non-English files.
- Runtime theme strings must use Discourse i18n rather than hard-coded user-facing text. Use `i18n(themePrefix("key"))`; never hard-code a theme ID.
- Put admin-facing descriptions under `theme_metadata`.
- Use MessageFormat only when the UI string genuinely needs plural/select logic. MessageFormat keys end in `_MF`; keep valid language plural forms including `other`.

## `about.json` and compatibility
- `about.json` is required. Keep `name`, `component`, `authors`, `about_url`, `license_url`, `theme_version`, supported Discourse-version bounds, `assets`, `color_schemes`, `screenshots`, `modifiers`, and `theme_site_settings` accurate when those features are used.
- If a feature requires a newer Discourse primitive, set an honest `minimum_discourse_version` instead of shipping compatibility code that cannot work correctly on older versions.
- Theme components use `"component": true`; Crimson Channels itself remains a full theme.

## Assets and fonts
- Git-sourced themes must keep durable assets in the repository (`assets/`) and register them in `about.json`. Do not rely on uploads made only through the admin UI for a remotely installed Git theme.
- Access registered theme uploads through the supported generated theme asset/settings mechanisms.
- Custom fonts belong in repository assets with correct licensing and `@font-face`; prefer WOFF2 when available. Do not add a font merely to imitate a platform when core/system typography can meet the goal.

## Color schemes and screenshots
- Share theme color schemes through `about.json` `color_schemes`; keep semantic Discourse color slots rather than inventing a parallel global palette system.
- Theme preview screenshots belong under `screenshots/`. Current guidance recommends light/dark previews, 16:9, 2560x1440, under 1 MB each, WebP/PNG/JPEG.

## Theme modifiers
- Theme modifiers are predefined core hooks, not arbitrary backend access. Define them under `about.json` `modifiers` only when the exact current Discourse modifier exists.
- Verify the current Discourse core modifier schema before adding/changing one.
- A modifier may derive its value from a theme setting when the current modifier schema supports that pattern.
- Do not use modifiers as a workaround for server authorization or business logic; those belong in plugins.

## Themeable site settings
- A full theme may set install-time values only for core site settings marked `themeable: true` in current Discourse core.
- Declare these under `about.json` `theme_site_settings`.
- Later theme updates do not overwrite a database value already changed by the admin. Never build logic that assumes an update will force it back.
- Verify current core before adding a themeable site setting; theme components cannot use this mechanism as a backend substitute.

## Tooling guidance
- Theme Creator and Theme CLI are supported development/preview tools. This repo's GitHub + Official Discourse Theme CI workflow remains canonical for delivery.
- Use `discourse_theme watch`/`download` only when a live Discourse test site or Theme Creator workflow is actually available; never make CI evidence depend on an unavailable local tool.
- If Theme CLI credentials are needed, follow current Discourse guidance and never commit API keys.
- Custom Highlight.JS languages can be added through the supported theme/plugin API when genuinely required; keep language definitions isolated.

## Official Discourse references — consult on demand
- Developer guides index: https://meta.discourse.org/t/developer-guides-index/308036?tl=en
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
