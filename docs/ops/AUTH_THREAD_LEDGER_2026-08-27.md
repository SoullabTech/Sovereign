# Auth thread ledger — 2026-08-27

Custody statement for the units worked in this session. Written because
"implemented" and "established" were being collapsed, and the difference is the
whole point of a ledger.

```
AUTH-BIOMETRIC-01B
  MERGED to canonical at df4029aec (PR #1131, 2026-08-28T10:47:26Z)
  head 988572daf · base 284ea4ace · 5 files · CI all green
  DEPLOYED             no
  VERIFIED IN PROD     no

lookup-email minimization
  MERGED in the same PR
  DEPLOYED             no

AUTH-BIOMETRIC-01A
  SPEC OPEN · §6.1 census COMPLETE (below)
  implementation forbidden by its §6 gate

AUTH-BIOMETRY-01
  DEPENDENCY — native-trust strength
  blocks the point where native proof may authorize bootstrap issuance
  does NOT block continuing to specify A

AUTH-AUDIT-01
  DEPENDENCY — discovered during the §6.1 census
  `audit_logs` does not exist in current production; no repository migration
  creates the base table; ten `logAuthEvent` callers therefore lack durable
  substrate. A's Invariant 10 cannot presently be demonstrated.

RESEND
  RUNTIME RESOLVED — pay-as-you-go enabled; email-code auth working
  no code change was required

SESSION CENSUS
  CLOSED — no usable non-browser credentials outside the founder's own account
```

## Deployment status

**B is merged and not deployed.** Production runs the image live on minisforum,
which predates the merge. Until a deploy, a member with `has_webauthn = true`
and no credential is still offered a ceremony that cannot succeed — and see the
§6.1 census: B would not help those eight in any case, because B reads the flag
and the flag is what is wrong for them.

## Why this file exists

Several claims in this session ran ahead of their evidence. The pattern was
always the same shape — reporting the intent of a step as its outcome, or an
absence of evidence as evidence of absence:

- a record described as updated before the edit was made;
- expired sessions described as live credentials (`revoked = FALSE` read as
  usable, omitting the `expires_at > NOW()` half the auth code enforces);
- design work described as "closed" when it had not reached canonical;
- eight member rows described as "real people" before personhood was checked
  (later established, but asserted first);
- "no third writer in code" stated as "set from outside the application";
- "`audit_logs` has never existed in production" from a current-state read.

The distinctions being collapsed, in order of how easily they collapse:

```
specified   ≠  implemented
implemented ≠  merged
merged      ≠  deployed
deployed    ≠  verified in production

read failed        ≠  read returned zero rows
not in current tree ≠  never existed
not present now     ≠  never present
```

The last three are the ones that cost the most, because both sides look
identical downstream unless the reading step records which it was.

## Census-method rules earned here

1. **Reproduce the predicate the code enforces; do not approximate it.** An
   inflated security number spends attention a real one needs.
2. **Predicates on nullable columns take `coalesce` by default.**
   `NULL NOT ILIKE 'x%'` is NULL, not TRUE, and silently drops rows.
3. **Behavioural census beats syntactic census** — its blind spots are not the
   conventions you happen to know. It still needs a second discriminator before
   anything is acted on. No census in this thread was ever safe to act from
   directly.
4. **A failed read is not a zero.** Record `OBSERVED` / `OBSERVED EMPTY` /
   `NOT OBSERVED` as three states, decided at the reading step.
