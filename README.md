<p align="center">
  <a href="https://buymeacoffee.com/erespawn">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" width="217" height="60">
  </a>
</p>

# Crimson Channels for Discourse

A Discord-inspired full Discourse theme used as the visual shell for the senin.me community while preserving native Discourse routing, content, accessibility, and upgrade-safe behavior.

## Main Branch Status

The repository bootstrap has been merged to `main`. The current baseline includes the imported Crimson Channels theme, Minimum Token Context v3 development guidance, and official Discourse theme tooling/CI.

## Current Experience

- Discord-like left server/navigation rail.
- Native Discourse content and sidebar behavior preserved in the main content area.
- Contextual online-member and recent-profile-visitor rail.
- Desktop and mobile-specific layouts.
- Compact mobile community drawer.
- Custom Discord-style user-card presentation.
- Featured topic sections configurable by category.
- Light and dark Crimson color schemes.
- Optional integration with [`discourse-crimson-community`](https://github.com/dupless54/discourse-crimson-community) for authenticated live community/profile-visitor data.
- Responsive layouts built around Discourse theme variables instead of a separate application shell.

## In Progress — Not Yet on `main`

PR #2, **Crimson Channels security, SEO and performance hardening**, is currently open.

Its current scope includes:

- keeping configured shell navigation on same-origin Discourse routes;
- bounding long-lived community/profile and featured-topic caches;
- retrying transient profile-banner failures;
- improved mobile community-drawer focus handling, RTL behavior, light-mode overscroll, and narrow-width controls;
- subfolder-safe internal routes/fetches through Discourse URL helpers;
- preserving Discourse core ownership of canonical tags, metadata, JSON-LD, sitemaps, and crawler HTML instead of adding competing SEO output in the theme;
- excluding dynamic community-rail boilerplate from search-result snippets with `data-nosnippet` while leaving native content indexable;
- reducing unnecessary main-outlet mutation work and refreshing community data only while the rail is visible;
- avatar intrinsic dimensions/async decoding and mobile repaint-cost reductions.

These changes are not considered shipped until PR #2 is merged.

## Security and SEO Principles

Crimson Channels is a **theme**, not a backend authorization layer.

- User/topic text should continue to render through safe DOM/text APIs.
- The theme should not introduce `eval`, dynamic function execution, or `javascript:` navigation.
- Community/profile APIs remain same-origin and server-authorized by their owning plugins.
- Canonical URLs, robots behavior, sitemap generation, structured data, and crawler HTML remain Discourse core/server responsibilities unless a specifically reviewed integration requires otherwise.
- The theme must remain usable when optional companion endpoints are unavailable.

## Crimson Community Integration

The theme can consume public/authenticated contracts from `discourse-crimson-community` for:

- online-member information;
- recent profile visitors;
- profile-background presentation data.

Crimson Community owns that server truth. Crimson Channels should fail gracefully instead of inventing presence or visitor data in the browser.

## Installation

Install the theme from **Admin → Customize → Themes → Install → From a Git repository** using:

```text
https://github.com/dupless54/discourse-crimson-channels
```

After installation, review the theme settings and enable the matching light/dark color schemes as appropriate for your forum.

For the full community rail/profile-visitor experience, install the companion plugin:

```text
https://github.com/dupless54/discourse-crimson-community
```

## Development

This repository uses official Discourse theme tooling and CI. Start with [`AGENTS.md`](AGENTS.md), then load only the relevant scoped frontend/development context for the task.

AI context files intentionally remain outside runtime-compiled theme paths.

## Support

If you enjoy Crimson Channels, you can support continued development through the Buy Me a Coffee banner at the top of this README.
