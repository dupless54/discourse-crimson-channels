# Durable Decisions

- Crimson Channels remains a Discourse theme; backend/domain logic belongs in plugins.
- Native Discourse remains the primary forum/navigation system. Discord-like rails and surfaces are presentation/navigation enhancements, not replacements for core routes.
- Crimson Community owns online-member and profile-visit state. The theme consumes only its JSON contract and degrades gracefully if it is unavailable.
- Theme light/dark compatibility is driven primarily through Discourse CSS variables and theme color schemes, not fixed page-wide colors.
- Desktop uses a server rail + native content/sidebar canvas + contextual member rail; mobile collapses custom community UI into a drawer rather than shrinking desktop rails.
- The current consolidated initializer is intentionally preserved during repository bootstrap. Modularization is a separate scoped change so behavior can be validated independently.
- Official Discourse reusable GitHub Actions are the canonical CI path for this repository.
