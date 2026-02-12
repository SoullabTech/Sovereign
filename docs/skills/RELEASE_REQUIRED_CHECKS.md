# Release Required Checks

Every release must pass these before shipping. No exceptions.

## Gate

Mark each check with a status:

| Status | Meaning |
|---|---|
| Pass | No issues found |
| Warning | Risk identified, mitigation proposed |
| Block | Cannot ship until resolved |

## Checks

1. **Canon Compliance** — Does this change align with the oath and canon?
2. **Sovereignty Check** — Does this preserve user agency, consent, and reversibility?
3. **Field Signals prediction** — What friction or confusion is most likely? What should we watch for?
4. **Reversibility** — Can this be undone safely? What's the rollback path?
5. **Release Coordinator pass** — Full release preparation (scope, rollout, verification, rollback, comms)

### Reversibility criteria

- **Pass** — Feature flag, instant rollback, or no data mutation
- **Warning** — Partial rollback possible, data migration involved
- **Block** — Irreversible data change without tested recovery path

## Failsafe

If any required check returns Warning or Block: default to beta-only, feature-flag, or silent release. Never ship to full audience with unresolved warnings.

## Aftercare (post-release)

Within 48 hours of any user-facing release, answer:

1. **What actually happened?** — Any unexpected friction, confusion, or support signals?
2. **Field Signals accuracy** — Did the prediction match reality? What was missed?
3. **One-sentence learning** — What does this release teach us about the system or our users?

### Required decision

Aftercare must result in exactly one of:

- **No change** — prediction matched, no update needed
- **Update Field Signals pattern** — add or refine a known friction/trust/confusion pattern
- **Update Release Coordinator guidance** — adjust rollout defaults, scope criteria, or monitoring focus
- **Add a new risk pattern to the gate** — a new tripwire for future releases

Without a decision, aftercare is incomplete.

### Enforcement

If aftercare is not completed within 48 hours, the feature defaults to beta-only status until review is logged.

Log aftercare as a row in `docs/releases/RELEASE_LEDGER.md`. This is how Field Signals becomes institutional intelligence.
