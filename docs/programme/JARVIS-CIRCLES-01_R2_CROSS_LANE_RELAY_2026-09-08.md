# R2 — CROSS-LANE RELEASE ORDER RELAY
**Founder-authorized 2026-09-08 · JARVIS Circles programme lane
(`claude/jarvis-circles-programme-reouzc`)**

⚠️ **This document changes nothing.** It does not touch canonical, production, or the deploy lock.
It carries an already-ratified sequencing constraint to the lane that currently controls release.

---

## THE RELAY — deliver verbatim

> **CROSS-LANE RELEASE ORDER — FOUNDER RULING**
>
> The current `COHORT PRE-WITNESS HOLD` remains yours until the cohort witness is complete. **Do not
> release it early and do not alter the witness environment.**
>
> When that witness completes:
>
> 1. Release the deploy lock normally.
> 2. **Do not deploy Writer's Studio work as part of that release.**
> 3. The next authorized production movement is the already-qualified I0.5 Circle release:
>    `e535e6246 → 891b33ee0`
> 4. I0.5 will complete its production SHA/schema/state witness and close.
> 5. Only after I0.5 closure may Writer's Studio deploy a separately qualified descendant that
>    contains `891b33ee0`.
>
> This order prevents a later deployment of `891b33ee0` from rolling back the post-891 Writer's
> Studio governed-erasure work.
>
> **Please acknowledge this sequencing constraint in the Writer's Studio lane before releasing the
> hold.**
>
> Independent fail-safe remains mandatory: immediately before I0.5 deployment, production must still
> equal `e535e6246`, and `git merge-base --is-ancestor "$RUNNING" "$TARGET"` must return exactly `0`.
> Exit `1` or `>1` means **STOP** and return for founder adjudication.

---

## Why this ordering exists (supporting evidence, verified 2026-09-08)

```text
production        e535e6246
qualified I0.5    891b33ee0     (ancestor of canonical — VERIFIED)
canonical tip     b4831d2ab

e535e6246 ancestor of 891b33ee0                     VERIFIED
891b33ee0 ancestor of b4831d2ab                     VERIFIED
```

`891b33ee0..b4831d2ab` = **12 commits**, including:

```text
3027ceaff  Merge PR #1259 — chore/ws-delete-01-governed-erasure
9a94e84b5  WS-DELETE-01: bind vault-erasure reconciliation to maia-media-worker
d57c26c59  WS-DELETE-01: constrain how autonomous invocation may be satisfied
805dae18f  WS-DELETE-01: add governed erasure and recovery witness
```

⛔ **The dangerous sequence:**

```text
e535e6246 -> b4831d2ab -> 891b33ee0
                          ^ ANCESTOR DEPLOY = REGRESSION
                            silently removes WS-DELETE-01 governed erasure
```

✅ **The ruled sequence:**

```text
e535e6246 -> 891b33ee0 -> later separately qualified Writer's Studio descendant
```

## Delivery targets

**PRIMARY — the lane holding the deploy lock (must acknowledge before releasing):**

```text
session_01NTmBZGP2sAHS1TtJKBYK3T
"Writer's Studio onboarding productization"
branch  claude/writers-studio-onboarding-ek7p06
```

**SECONDARY — the author of the post-891 work that R2/R4 protect (informational):**

```text
session_019h91p4JYCrr9bbt9MmfX3o
"Add a delete affordance for Works in Writer's Studio"
branch  chore/ws-delete-01-governed-erasure
```

⚠️ **Lock holder identification is INFERRED from session metadata** (title, branch, and live
activity consistent with a production witness against `e535e6246`), **not read from the lock
itself.** The definitive check is the lock's recorded PID / entry point / asserted target on
minisforum (`fuser -v ~/MAIA-SOVEREIGN/.deploy.lock`), which requires SSH this lane does not have.
⛔ If the holder turns out to be a different session, the relay goes there instead — the ruling binds
**whoever holds the lock**, not a particular session id.

## Delivery status

```text
R2 doctrine recorded     YES  (ADDENDUM II, 261e0af4a)
R2 relay authorized      YES  (founder, 2026-09-08)
R2 relay DELIVERED       NO
R2 acknowledgment        NOT RECEIVED — REQUIRED BEFORE HOLD RELEASE
R3 ancestry fail-safe    MANDATORY, unaffected by delivery status
```

⚠️ **Attempted and refused:** cross-session send from this lane. `ListAgents` reports no reachable
peer, and an addressed send returned *"No agent named … is reachable."* The Writer's Studio lanes run
in separate cloud containers and are **not addressable from this session**. ⛔ No workaround was
attempted — spawning a new session would not reach the existing lane and would add an unrelated
actor to a held release.

**Delivery is therefore a founder act:** paste the relay block above into the primary session (and
optionally the secondary).

> ⭐ **R3 is why this degrades safely.** If the relay never lands and Writer's Studio deploys first,
> the pre-deploy ancestry gate returns exit `1` and I0.5 **stops** — a silent regression becomes an
> explicit halt, and the target is then re-decided by founder act rather than substituted at deploy
> time. ⛔ It degrades into *blocked*, not into *fine*.
