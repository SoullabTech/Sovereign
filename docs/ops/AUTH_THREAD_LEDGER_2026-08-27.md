# Auth thread ledger — 2026-08-27

Custody statement for the units worked in this session. Written because
"implemented" and "established" were being collapsed, and the difference is the
whole point of a ledger.

```
AUTH-BIOMETRIC-01B
  MERGED               YES — df4029aec (PR #1131, 2026-08-28T10:47:26Z)
  DEPLOYED BY LINEAGE  YES — df4029aec is an ancestor of production-stamped 9865799e1
  PRODUCTION BEHAVIOR  NOT inferred from lineage alone

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

## Deployment status — corrected 2026-08-28

The earlier entry read "merged, not deployed". That was true when written and is
now stale. **B's code reached production by lineage**, and the ledger has to say
so — but only that.

Evidence, restated for the record:

```
production M      9865799e1
B merge SHA       df4029aec
ancestry          df4029aec → ancestor of 9865799e1   (verified)
runtime witness   GIT_COMMIT=9865799e1
                  DEPLOY_LANE=deploy-lane
```

**Lineage is not behaviour.** That the commit is contained in the deployed tree
establishes that the code is present. It does not establish that B's specific
behaviour — the biometric offer gated on enrollment rather than capability — has
been witnessed at runtime. No such witness was taken. Do not generalize this
into "production behavior verified"; that is a separate observation nobody has
made.

What has not changed: the eight members with `has_webauthn = true` and zero
credential rows are still offered a ceremony that cannot succeed. B reads the
flag, and the flag is what is wrong for them (§6.1 census). Deployment of B does
not reach that case; only A's derivation repair does.

**Standing hazard this correction demonstrates.** A status file in version
control goes stale silently — the deploy that made this entry wrong emitted no
signal to the document asserting otherwise. Anything written here as a
point-in-time claim needs a named re-check, or it becomes confident and wrong.

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
