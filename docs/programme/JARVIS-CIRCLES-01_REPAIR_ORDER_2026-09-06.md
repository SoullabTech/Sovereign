# CIRCLE-04 · REPAIR — authorized order

**Opened by founder act, 2026-09-06, after the first production VERIFY run
(`17 passed · 5 failed`, `…_VERIFY_RUN_2026-09-06.md`).**
**Supersedes** the provisional order in `…_CLASS_B_REPAIR_ORDER_2026-09-06.md`, which was derived
from prediction. Retained as record.

## Per-repair protocol (founder)

```text
1  implement the smallest repair
2  run targeted tests
3  run the ENTIRE Circle verifier
4  record exact evidence
5  proceed only if the preceding repair did not weaken an already-passing boundary
```

> ⚠️ **Step 3 cannot be executed from a remote session** — no `DATABASE_URL`, no `node_modules`.
> Each repair therefore ends at a founder-run verification before the next begins. **Jarvis does
> not batch repairs to work around this.**

## Stop condition

```text
VERIFY    0 failed
B-01      CLOSED
COHORT    still NOT AUTHORIZED
```

⛔ Do not lift the founder UI gate · build discovery · invite members · build Constellations ·
add MAIA Field Witness.

---

## R1 · B-01 access containment — **FIRST**

Close the founder-gate / API mismatch. The member-facing posture says Circles are closed while
`/api/circles` remains available to authenticated free-tier members and `/commons/join` is public.

- **Preserve existing membership scoping** — it passed under runtime evidence and must not regress.
- **Do not redesign access.**
- Make the **authorization posture match the declared release posture** before any cohort.

> Not a verifier failure. An access-policy defect, and first because every later repair is exercised
> against a surface whose stated closure must be true.

## R2 · FR-05 removal contract — **one repair, not three**

C7 + C8 + T3 are **one repair family.** Implement removal as a single coherent contract:

```text
authorized removal writer            recorded remover
procedural authority check           recorded grounds
access removal                       revocation cascade identical to leaving
source material untouched            representation sufficient for later independent review
```

CA-10 (the review institution) stays open — FR-05 requires only that the representation support
review, not that the institution exist.

## R3 · FORMING / ACTIVE lifecycle representation

Implement **only the minimum distinction required by FR-03/FR-11.** Not the full lifecycle.

Required semantics:

- Circle creation begins **FORMING**;
- FORMING may contain one or two active memberships;
- transition to **ACTIVE** becomes possible **only when plurality exists**;
- ACTIVE may not persist with fewer than three active members **without an explicit lifecycle
  transition**;
- **no automatic deletion, no forced recruitment**;
- **no numerical maximum.**

⛔ **Never `CHECK(member_count >= 3)`.**

> **If more than one sound implementation exists, return the exact transition policy for founder
> adjudication rather than choosing.** The open question Jarvis expects to hit: what happens when an
> ACTIVE Circle drops below three — automatic return to FORMING (a system act on a relational
> field), or an explicit member/facilitator transition (consistent with *the system may notice and
> ask, only the Circle may decide*)? **That is a founder call, not an implementation detail.**

## R4 · Participation-count leak

Remove or contain `response_count` from **member-facing Circle behavior**.

> ⛔ **Do not infer that all operational counts are forbidden internally.** The constitutional
> prohibition concerns **Circle social surfaces and status mechanics** — not the system's own
> arithmetic.

## R5 · Remaining Class-B defects

**Re-run the Class-B census after R1–R4 before touching lower-severity items.** Some may disappear,
change status, or become better specified through the repairs above.

Currently: B-04 dangling containment-plan reference · B-05 non-withdrawable response *(CA-03)* ·
B-07 inert `visibility`/`invite_enabled` *(FR-06 discovery design)* · B-08 pulse defence-in-depth ·
B-09 `integrating` one-way door · B-10 nav→refusal screens.

---

## Verifier correction — **DONE**, ships with this record

`S4` no longer treats every stored Circle row as active. It now tests **representability first**:

```text
no lifecycle column  →  FAIL "FR-03/FR-11 lifecycle/plurality boundary is not representable"

with a lifecycle column:
  S4a  ACTIVE Circle          → active membership >= 3
  S4b  active membership < 3  → not represented as ACTIVE
```

⛔ S4 was **not** softened to PASS because the four existing records predate FR-11. Until R3 lands,
the verifier fails with the corrected name. **Expected next run: `17 passed · 5 failed`, with S4's
message changed and its cause correctly stated.**
