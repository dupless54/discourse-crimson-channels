# Delivery Workflow
`Builder -> targeted validation -> PR -> exact-head CI -> bounded remediation -> CI -> merge`

- Lock goal, allowed paths, acceptance, validation, risk.
- Cheap-first validation: syntax/static -> narrow specs -> plugin suite -> frontend build/QUnit -> broader/system only if justified.
- CI evidence must match latest exact head.
- Max 3 remediation rounds.
- No test weakening.
- Merge only after scope/path/validation gates and explicit user authorization.
