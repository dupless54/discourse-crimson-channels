<p align="center">
  <a href="https://buymeacoffee.com/erespawn">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" width="217" height="60">
  </a>
</p>

# Crimson Channels for Discourse

A Discord-inspired full Discourse theme used as the visual shell for the senin.me community while preserving native Discourse routing, content, accessibility, and upgrade-safe behavior.

## Current Experience

- Discord-like left server/navigation rail.
- Native Discourse content and sidebar behavior preserved in the main content area.
- No theme-owned right member/community rail.
- No mobile Crimson Community drawer or member toggle.
- Desktop and mobile-specific layouts without reserving space for a right rail.
- Custom Discord-style user-card presentation.
- Featured topic sections configurable by category.
- Light and dark Crimson color schemes.
- Responsive layouts built around Discourse theme variables instead of a separate application shell.

## Crimson Community Separation

Crimson Channels no longer renders or polls a Crimson Community member rail. The theme shell does not need `/crimson-community/online.json` or profile-visitor data to render its navigation/content layout.

If `discourse-crimson-community` is installed for its own `/community` experience or other plugin features, it remains independent. Removing the theme rail does not delete or modify that plugin's backend routes, data, privacy rules, or persistence.

## Security and SEO Principles

Crimson Channels is a **theme**, not a backend authorization layer.

- User/topic text should continue to render through safe DOM/text APIs.
- The theme should not introduce `eval`, dynamic function execution, or `javascript:` navigation.
- Canonical URLs, robots behavior, sitemap generation, structured data, and crawler HTML remain Discourse core/server responsibilities unless a specifically reviewed integration requires otherwise.
- Optional companion plugins must never be required for core forum navigation or reading.

## Installation

Install the theme from **Admin → Customize → Themes → Install → From a Git repository** using:

```text
https://github.com/dupless54/discourse-crimson-channels
```

After installation, review the theme settings and enable the matching light/dark color schemes as appropriate for your forum.

## Development

This repository uses official Discourse theme tooling and CI. Start with [`AGENTS.md`](AGENTS.md), then load only the relevant scoped frontend/development context for the task.

AI context files intentionally remain outside runtime-compiled theme paths.

## Support

If you enjoy Crimson Channels, you can support continued development through the Buy Me a Coffee banner at the top of this README.
