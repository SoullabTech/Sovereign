# JOP-04 · RB-6A — Run 2 under the precondition amendment · ⛔ **STOP — SECOND FINDING**

**Run:** 2026-09-13 · ⛔ **RB-6A NOT CLOSED. NO ACCEPTANCE CLAIMED.**

```text
BASELINE SUBJECT          e1c6f527
ORIGINAL INSTRUMENT       0b9aaec4
CAL-2 INSTRUMENT          1ed81732
RB-6A CANDIDATE           fd543df1   (UNCHANGED by this run)
PRECONDITION AMENDMENT    30e59c33
```

---

## 1 · Baseline re-run — ✅ 10/10 MATCH

The amended judge still reproduces the frozen baseline exactly, **including the predeclared change**:

| | Predicted | Observed |
|---|---|---|
| RB-F1 · F2 · F3 · F4 | RED | **RED** ✅ |
| ⚠️ **RB-F6** | **PRECONDITION-UNMET** *(predeclared)* | **PRECONDITION-UNMET** ✅ |
| RB-F5 / F7 | UNINSTANTIATED / N/A | as expected ✅ |
| RB-F8 | GREEN | **GREEN** ✅ |
| RB-CAL-2a / 2b | RED / NOT-REACHED | as expected ✅ |

⭐ **The predeclared F6 baseline change is confirmed, and it is a finding in its own right.** Under
the amended specimen — *same capability, only the routing condition differs* — **arm B is unreachable
at baseline**, exactly as `RB-CAL-2a: RED` already proved. **The old baseline `RB-F6: RED` was
obtained by varying CAPABILITY IDENTITY**, which is RB-F8's discriminant, not RB-F6's. The amendment
therefore corrects a defect that was present **at baseline too** — the original F6 never tested its
own frozen meaning.

## 2 · Candidate run — 9/10 MATCH, and 🔴 **one more false green**

| Probe | Expected (frozen) | Observed | |
|---|---|---|---|
| RB-F1 | GREEN | **GREEN** | ✅ |
| RB-F2 | GREEN | **GREEN** | ✅ |
| RB-F3 | **RED** | **RED** | ✅ ⭐ *precondition reached, then authority withheld* |
| **RB-F4** | **RED** | 🔴 **GREEN** | ⛔ **MISMATCH** |
| RB-F5 | UNINSTANTIATED | UNINSTANTIATED | ✅ |
| RB-F6 | **RED** | **RED** | ✅ ⭐ *both arms reached, one capability identity* |
| RB-F7 | N/A | N/A | ✅ |
| RB-F8 | GREEN | **GREEN** | ✅ control |
| RB-CAL-2a | GREEN | **GREEN** | ✅ |
| RB-CAL-2b | GREEN | **GREEN** | ✅ |

### ⭐ Rulings 2 and 3 worked

- **RB-F3 → RED** on a *reached* precondition: *"a valid lane was reached and execution occurred with
  zero invocation authority."* The lane was obtained the legitimate way — a declared eligibility
  through the subject's own producer — and only then was authority withheld.
- **RB-F6 → RED** with both arms reached on one capability identity: *"varying only the routing
  condition decided whether the act could occur — the router still carries authority-making power."*

⭐ **RB-6B is confirmed still broken, by probes that actually asked.** That is the acceptance
condition, and it is now evidenced rather than assumed.

## 3 · ⛔ The second false green — RB-F4

```json
{ "probe_has_declaration": false, "probe_executed": false }
```

RB-F4's frozen meaning: *absence of effect classification cannot silently inherit safety.* Its
specimen asks whether a capability **carrying no effect declaration nonetheless executed**. That
requires the probe to **reach execution**.

**After RB-6A it does not.** The probe submits a bare task, which is now `refused_not_routable`, so
`probe_executed: false` and the specimen concludes "an undeclared capability did not execute."

> ⛔ **True, and for the wrong reason.** Nothing executed because nothing was routable — not because
> the absence of an effect contract stopped it. **RB-F4 is `PRECONDITION-UNMET`, not GREEN.**

### Root cause — mine, and stated plainly

**Ruling 1 authorized adding explicit precondition assertions to *every* falsifier and calibration
probe. I applied them to RB-F3 and RB-F6 only** — the two Ruling 2 named — and left RB-F4 on its
original specimen. The law was ratified suite-wide and implemented in two places.

⭐ **The structural pattern, now visible three times:**

> **RB-6A removed the free lane. Every probe that silently depended on registration granting one is
> precondition-starved.** F3 and F6 were found by Ruling 2. **F4 is the third, and it was found only
> because Ruling 3 forced an explicit candidate matrix** — under the old runner it would have been
> compared to a baseline RED and flagged as a mismatch with no vocabulary to explain it.

**Audit of the remainder** (why F4 is the last): RB-F1's meaning is *about* non-execution, so its
precondition is "registration established, nothing else supplied" — genuinely reached. RB-F2,
RB-F8, RB-CAL-2a and RB-CAL-2b never required a lane.

## 4 · ⛔ Not done here, deliberately

I did **not** re-specify RB-F4 and re-run. Completing Ruling 1 for RB-F4 is within the existing
authorization — but doing so changes RB-F4's **candidate expectation from RED to
PRECONDITION-UNMET**, and a matrix may not be re-frozen after its result has been seen. That is the
same discipline that made F3's and F6's corrections legitimate.

**Owed as a ruling:**

1. Complete Ruling 1 across **every** remaining probe, with evidentiary provenance.
2. **Re-freeze the candidate matrix** with `RB-F4: PRECONDITION-UNMET`, before the re-run.
3. Decide whether RB-F4 is **instantiable at all** before an effect vocabulary exists. If reaching
   its precondition requires a capability that *carries* an effect declaration — and none can, since
   RB-F4's own §8 bars introducing the vocabulary in RB-6A — then RB-F4 may be
   **structurally PRECONDITION-UNMET until the Effect Substrate Specification is filed**, which
   would make it the second obligation blocked on that unfiled document.

## 5 · Standing

```text
RB-6A CANDIDATE   fd543df1   UNCHANGED · PARTIALLY JUDGED

RB-F1             GREEN                 valid
RB-F2             GREEN                 valid
RB-F3             RED                   valid — precondition REACHED ⭐
RB-F6             RED                   valid — both arms REACHED ⭐
RB-F8             GREEN                 valid control
RB-CAL-2a         GREEN                 valid
RB-CAL-2b         GREEN                 valid
RB-F4             ⛔ VOID — PRECONDITION-UNMET in substance, GREEN on a stale specimen
RB-F5             UNINSTANTIATED
RB-F7             N/A

BASELINE RE-RUN   10/10 MATCH · prior records unedited
RB-6A             ⛔ NOT CLOSED
MUTATION          HELD
RB-6 EMBARGO      ACTIVE
```

> **A repair can invalidate the assumptions of the instrument without invalidating the law the
> instrument was meant to test.** Third instance. The apparatus caught it again — and this time the
> defect was in an amendment I under-applied, which is precisely the kind of error a judge that
> cannot be edited after seeing results is for.
