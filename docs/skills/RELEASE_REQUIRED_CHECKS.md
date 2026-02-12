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
4. **Release Coordinator pass** — Full release preparation (scope, rollout, verification, rollback, comms)

## Failsafe

If any required check returns Warning or Block: default to beta-only, feature-flag, or silent release. Never ship to full audience with unresolved warnings.
