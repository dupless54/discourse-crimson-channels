---
name: project-ci-repair
description: Bounded first-actionable-error CI repair.
---
# CI Repair
Failing job -> first actionable error -> classify -> smallest fix -> targeted check -> new exact head -> new exact-head CI. Max 3 rounds, then `NEEDS_HUMAN`. Never weaken tests just for green.
