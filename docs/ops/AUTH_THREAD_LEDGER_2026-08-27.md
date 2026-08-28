# Auth thread ledger — 2026-08-27

Custody statement for the units worked in this session. Written because
"implemented" and "established" were being collapsed, and the difference is the
whole point of a ledger.

**Design and census work is complete through "specify A separately."
Integration is not.**

At the time of writing, canonical is `284ea4ace` (`clean-main-no-secrets`).
The work below lives on `claude/signin-form-field-order-c5h4u1`, tip
`fdd30a84d` — measured **54 ahead, 169 behind** canonical
(`git rev-list --left-right --count HEAD...origin/clean-main-no-secrets`).
A commit existing is not a change shipping.

```
RESEND
  RUNTIME RESOLVED
  email-code auth working; billing/quota fixed by enabling pay-as-you-go
  no code change was required

AUTH-BIOMETRIC-01B
  IMPLEMENTED + TESTED
  not yet established on current canonical

lookup-email minimization
  IMPLEMENTED
  not yet established on current canonical

AUTH-BIOMETRIC-01A
  SPEC OPEN
  implementation forbidden by its §6 gate

AUTH-BIOMETRY-01
  DEPENDENCY
  must resolve before native proof can authorize bootstrap issuance
  does NOT block continuing to specify A

SESSION CENSUS
  CLOSED
  no usable non-browser credentials outside the founder's own account
  one legitimate iOS member remains
  naming predicates proven insufficient; behavioural census is the standard
  record: e1093e33e
```

## Why this file exists

Three claims in this session ran ahead of their evidence: a record described as
updated before the edit was made, a set of expired sessions described as live
credentials, and this — design work described as "closed" when it had not
reached canonical. Same failure each time: reporting the intent of a step as its
outcome.

The distinctions that were being collapsed, in order of how easily they collapse:

```
specified   ≠  implemented
implemented ≠  merged
merged      ≠  deployed
deployed    ≠  verified in production
```

Nothing here has passed the second line.
