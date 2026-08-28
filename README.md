# Crimson Channels for Discourse

Discord-inspired full Discourse theme used as the visual shell for the senin.me community.

## Current experience

- Discord-like left server/navigation rail
- Native Discourse content/sidebar kept usable in the center
- Contextual online-member / recent-profile-visitor rail
- Desktop and mobile-specific layouts
- Compact mobile community drawer
- Custom Discord-style user-card treatment
- Featured topic sections configurable by category
- Light and dark Crimson color schemes
- Optional integration with `discourse-crimson-community` for live community/profile-visit data

## Install

After the GitHub repository is published, install it from **Admin → Customize → Themes → Install → From a Git repository** and use:

`https://github.com/dupless54/discourse-crimson-channels`

## Development policy

This repository includes **Minimum Token Context v3**, adapted for a Discourse theme. Start with `AGENTS.md`, then `docs/ai/CURRENT_STATE.md`, and only load the nearest scoped context needed for the task.

AI context never lives in Discourse runtime asset directories.

## Roadmap

1. Repository/bootstrap + Official Discourse CI
2. Split the large initializer by stable concern without behavior changes
3. Bring the left channel/sidebar experience closer to Discord while retaining native Discourse navigation
4. Refine topic/category surfaces, composer, notifications, and chat consistency
5. Accessibility, reduced-motion, performance, and mobile hardening
6. Cross-plugin contract tests for Crimson Community integrations
