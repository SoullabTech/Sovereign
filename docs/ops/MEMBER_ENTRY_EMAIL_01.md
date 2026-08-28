# MEMBER-ENTRY-EMAIL-01 — production runtime witness

Record-only. No code, no schema, no repair.

Kept as its own file rather than folded into `AUTH_THREAD_LEDGER_2026-08-27.md`:
this is a dated runtime observation with its own validity boundary, and it
should be falsifiable — and expire — independently of the programme ledger.

```
MEMBER-ENTRY-EMAIL-01

date        2026-08-28
production  9865799e1

SIGNUP      PASS — runtime witnessed
SIGNIN      PASS — runtime witnessed

witness:
fresh email on production
email code requested
email code actually received
code entered
authentication completed successfully

scope:
one account
email-code authentication path
one device/browser context

claim:
The production email-code member-entry path was demonstrated end-to-end
at 9865799e1 for the witnessed scope above.

not established:
cross-browser behaviour
cross-device behaviour
population-wide reliability
biometric/passkey offer behaviour
resolution of the eight stale member flags
```

## Validity boundary

This is a dated runtime witness attached to production commit `9865799e1`. It
must not be carried forward as evidence for a later production lineage if the
member-entry / authentication path materially changes without a new runtime
witness.

A witness expires when the thing it witnessed changes. Nothing in this
repository will notice that on its own, so the boundary is written next to the
claim rather than assumed.

## Why this is a witness and not an inference

Every other claim in this thread about the auth surface was reached by reading
code, querying state, or tracing commit lineage. This one was reached by a
person completing the act on production and observing the result. That is the
strongest evidence class available here, and the reason to record it precisely
rather than expansively: an over-broad witness is worth less than a narrow one,
because the next reader cannot tell which part was actually seen.

The acceptance criterion it satisfies was set before the attempt, not after:

> use a fresh email on production, request a signup/sign-in code, actually
> receive it, enter it, and complete authentication.

## Still open, unchanged by this record

```
MEMBER-FLAGS-STALE-01       OPEN — eight stale flags / data defect
BIOMETRIC-OFFER-RUNTIME-01  OPEN — production runtime witness required
```

Neither is implicated by a working email-code path. `MEMBER-FLAGS-STALE-01` is
the eight member accounts carrying `has_webauthn = true` with zero credential
rows (AUTH-BIOMETRIC-01A §6.2); those members are not locked out — email code
and password both work for them — but may still be offered a biometric path
that cannot succeed. `BIOMETRIC-OFFER-RUNTIME-01` is the missing production
observation for AUTH-BIOMETRIC-01B, which is present in the deployed tree by
lineage and has never been watched behave.
