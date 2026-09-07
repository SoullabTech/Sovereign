# CIRCLE-03 · VERIFY — first production run (evidence of record)

**Script:** `scripts/verify-constitution-circles.ts` at `8a531777`
**Executed by:** founder, against the live production database and code.
**Runtime:** `GIT_COMMIT=bcc371094`
**Epistemic kind: OBSERVED — RUNTIME EVIDENCE.** This supersedes the static prediction in
`…_VERIFY_EVIDENCE_2026-09-06.md` §3, which is retained as historical record.

```text
17 passed · 5 failed · 0 warned · 0 skipped
exit 1
```

> **VERIFY status: FAIL — 5 failures.** ⛔ This is not a partial pass, and the passing assertions
> below **must not be collapsed into a claim that the Circle system is secure or verified.**

---

## 1. Failures — exactly as reported

| | Failure | Ruling |
|---|---|---|
| **C6** | `response_count` returned to the client | FR-08.7 |
| **C7** | FR-05 removal has no implementation | FR-05 |
| **C8** | removal grounds / actor cannot presently be recorded | FR-05 |
| **S4** | four existing Circle records have fewer than three active members | FR-03 |
| **T3** | removal does not cascade revocation of shared artifacts | FR-05 |

## 2. Passing boundary evidence

**Cross-Circle membrane — the assertions that matter most:**

```text
member A cannot read Circle B                  PASS
member A cannot read Circle B feed             PASS
member A cannot share into Circle B            PASS
```

**Constitutional properties:**

```text
inquiry contribute-before-see                  PASS   FR-04
ordinary witnessing without posting            PASS   FR-04
inferred-theme exclusion                       PASS   FR-08.2
ambient MAIA-memory exclusion                  PASS   FR-08.3
representational crossing                      PASS   FR-08.8
source survives revocation                     PASS   FR-01
revoked material leaves Circle                 PASS   FR-01
membership never transfers implicitly          PASS   FR-08.5
```

> **The existing membership membrane is substantially sound.** That is a real finding, and it is
> the correct scope of the claim — no more.

## 3. Containment after the run — confirmed

| Check | Result |
|---|---|
| Temporary verifier file on the container | gone |
| Production runtime | unchanged, `GIT_COMMIT=bcc371094` |
| circles · active memberships | 4 · 4 |
| shared artifacts · inquiries · responses | 0 · 0 · 0 |

**The rolled-back fixtures left no production rows behind.** The Group T transaction contract held
under real execution.

## 4. Prediction vs. reality

The static prediction was **17 / 5**, and the five predicted failures were exactly the five
observed. Recorded for calibration only — **the prediction did not license anything; the run did.**
Under `CLAIM_STATE_AUTHORITY.md`, evidence licenses the claim state; a prediction never does, and a
correct prediction retroactively licenses nothing.

## 5. What the failures are, structurally

**Three of five are one repair family.** C7 + C8 + T3 are all **FR-05 removal** — a ruling ratified
the same day with no implementation anywhere in the substrate. They are not three unrelated
defects and must not be repaired as three.

**One is a leak of a participation signal.** C6.

**One was misnamed by the verifier, and the founder has corrected it.** S4 — see §6.

## 6. ⭐ FR-11 · FR-03 lifecycle clarification — FOUNDER RULING

> **FR-03 describes an ACTIVE Circle, not every instant of Circle formation.**

```text
PROPOSED / FORMING CIRCLE
  1 person   → initiator / seed
  2 persons  → forming relational field (geometry is dyadic, per FR-03)

ACTIVE CIRCLE
  3+ persons → plurality exists; active-Circle relational semantics may be exercised
```

**A one-person Circle record is not intrinsically unconstitutional.** A two-person forming Circle
is not yet an active Circle. The Constitution distinguishes **administrative existence** from
**relational constitution**.

⛔ This is **not** "three is the minimum database row count," and it must **never** be encoded as
`CHECK(member_count >= 3)`. Membership count is dynamic and relational state does not belong in a
row constraint.

⛔ No maximum membership count is ratified.

### The conceptual result

> **Creation is not constitution.**
> You can create a Circle alone. You cannot constitute a Circle alone.
>
> At one person there is **intention**. At two there is **relationship** — but by the ratified
> ontology that relationship has **dyadic geometry**. At three, a genuinely **plural field** becomes
> possible.

**The software can instantiate a container; the relational field only comes into being through
actual relationship.** This distinction is expected to generalize beyond Circles.

### S4 restated

**S4 found a real substrate gap and named it incorrectly.**

| ⛔ Not this | ✅ This |
|---|---|
| *"Four illegal Circles exist."* | **The substrate has no lifecycle representation distinguishing FORMING from ACTIVE, so it cannot enforce FR-03's plurality condition at the appropriate lifecycle boundary.** |

**S4 remains a real VERIFY failure** until that distinction is represented and falsifiable.
⛔ **It is not softened to PASS because the four existing records predate the ruling.**

### Consequence for CA-04

**CA-04 (lifecycle) is no longer wholly optional.** The full lifecycle — maturation, rest, birth,
completion — need not be ratified before REPAIR. **The minimum distinction `FORMING | ACTIVE` is
now required**, and everything beyond it stays experimental.

## 7. Verifier correction owed (CIRCLE-04 R3 dependency)

S4 must test **lifecycle semantics**, not treat every stored Circle row as active:

```text
ACTIVE Circle             → active membership >= 3
active membership < 3     → not represented as ACTIVE
```

**Until lifecycle representation exists, S4 fails as:**

> `FR-03 lifecycle/plurality boundary is not representable`

**not** as *"sub-plural Circles are unconstitutional."*
