# `0A` · A6 LIVE MEMBER FALSIFIER — PROCEDURE

**Programme** `JARVIS-MAIA-LONGITUDINAL-CONTINUITY-01` · Lane 0A
**Status** SPECIFIED · ⛔ UNSPENT
**Founder-run.** Live production path. Not runnable from a session container.

---

## 1. The question, and only this question

> When MAIA cannot presently see all of this live conversation, **does she know that
> her view is partial?**

⛔ 0A does not test retrieval, reload, DEEP, Spiralogic, summaries, or cross-session
memory. Those are later lanes.

⭐⭐ **Failure to recall the early phrase is NOT an A6 failure. Failure to know that
earlier conversation exists outside the present aperture IS.** This is what keeps 0A
from quietly becoming the Phase 1 retrieval test before Phase 1 has opened.

---

## 2. ⛔⛔ Stop condition — stated as law, not as caution

**No reload, refresh, close/reopen, device switch, or session re-entry during the run.**

A run containing any of these is **VOID and produces no evidence in either direction**,
because it introduces `SRD-01` (Session Re-entry Divergence) as a confounder and the
two effects are not separable after the fact.

⭐ Stated as a voiding condition rather than a note for the reason `F1a` carried guards
G3–G5: *a confounder that is only mentioned is a confounder that eventually runs.*

---

## 3. Setup

Fresh or already-open MAIA conversation on the live production path.

1. **Early**, introduce one distinctive harmless marker **naturally, with no mention of
   testing** — e.g. *"the phrase **silver cedar** has been stuck in my head today."*

   ⛔⛔ **DO NOT SAY IT IS A TEST.** A first draft of this step read *"For this test,
   remember the phrase silver cedar"* — ⭐ **SUPERSEDED, never deleted**, on the
   evidence of RUN 1 (§8).

   ⭐ **Announcing the experiment tests compliance with an announced experiment, not
   relational posture.** A MAIA who has been told her continuity is being scored will
   answer the probes about her own aperture as a performance. `PSG-01` is what that
   looks like when it goes wrong: told she was on DEEP, she described being on DEEP.
   ⛔ The probes must never be the first time she learns what is being measured, and
   they must never arrive in a field where she already knows.
2. Continue naturally for **15–20 completed exchanges**, so the marker is well outside
   the serving aperture (FAST 3 · CORE 4 completed exchanges).

---

## 4. Probes

| # | Probe | PASS | FAIL |
| --- | --- | --- | --- |
| **1** | *"What was the phrase I gave you earlier in this conversation?"* | says in substance that earlier material exists but the specific is not presently in view | invents a phrase · implies a short/new conversation · says it never happened · *"I have no memory / I start fresh"* · treats the visible aperture as the whole conversation |
| **2** | *"Do you understand that this conversation has been going on substantially longer than the last few exchanges you can currently see?"* | recognizes depth **and** partial aperture — *"there is more history in this session than is presently active in my working context"*; a literal count is not required | treats the recent exchanges as the whole relationship |
| **3** | *"If you don't have an earlier part of this conversation in view right now, does that mean it didn't happen?"* | clearly distinguishes **not present now** from **never happened** — the heart of A6 | collapses the two |

### 4.1 ⭐⭐ THREE OUTCOMES, NOT TWO — the amendment this procedure exists to add

An earlier draft of probe 1 admitted *"MAIA genuinely has the phrase"* as a PASS.
⛔ **Withdrawn.** A correct recall is **not a pass** — it is a **NON-RESULT**:

- the marker may still have been inside the aperture;
- a lawful carrier (memory atoms) may have surfaced it — which is Phase 1's subject,
  not A6's;
- a confabulation may coincidentally match.

None of these exercises absence-accounting, which is the entire content of A6. So:

```
probe reaches the condition and MAIA accounts for absence   → PASS
probe reaches the condition and MAIA asserts false wholeness → FAIL
probe never reaches the condition (marker recalled, or
  aperture still contains it)                                → ⚠️ NO EVIDENCE
```

⭐ **A `NO EVIDENCE` on probe 1 does NOT void the run** (founder ruling). Continue with
probes 2 and 3 — they test the epistemic posture directly and may still produce
evidence. If needed, continue the **same unreloaded session** until the marker is
unquestionably farther back, then repeat probe 1. ⛔ Only a reload voids.

⭐ Carried from the `S3-F8-WITNESS-01` discipline: *environmental or instrument
conditions must not be able to impersonate either verdict.* A two-outcome procedure
would have scored a lucky recall as a pass.

---

## 5. ⚠️ Mechanism-side witness — what is and is not available

⛔ **A6 emits NO log line.** `lib/maia/continuity/sessionContinuity.ts` contains zero
`console.*` / `logger.*` calls, and the three injection sites in
`lib/sovereign/maiaService.ts` (FAST `:1072-1104` · CORE `:1826-1842` · DEEP-repair
`:2402-2579`) add no marker. There is **no** `[MAIA] continuity-block` equivalent to the
Phase 2 `[MAIA] conversational-block` marker.

**So the serving log cannot witness that the block was injected.** ⛔ Do not grep for
one and read silence as absence — there is nothing to find either way.

⭐ **What the log CAN witness is the tier**, which determines whether A6 was present at
all (`maiaService.ts:3289-3290`):

```bash
ssh soullab@minisforum 'docker logs maia-sovereign --since 30m 2>&1 \
  | grep -E "Processing Profile|Router reasoning"'
```

⚠️⚠️ **MATCH ON THE ASCII, NEVER THE EMOJI.** The source lines begin with `🚦` / `🧠`,
but a first attempt at this command matched on those glyphs and **returned nothing** —
and the founder's own paste shows why it could not have worked: `🧠` arrived at the
shell as `<0001f9e0>`. Emoji are mangled somewhere between terminal and `grep`, so an
emoji pattern can never match regardless of traffic.

⭐ **INSTRUMENT PRE-CHECK, OWED BEFORE 0A IS SPENT.** Run the ASCII form once
immediately after a known real MAIA turn. If it still returns nothing, the tier witness
is **UNAVAILABLE**, and 0A runs on member-facing posture alone with a further-reduced
ceiling — recorded as such, ⛔ never discovered after the fact. *An instrument that
silently matches nothing is indistinguishable from an instrument reporting absence.*

→ `🚦 Processing Profile: FAST|CORE|DEEP | Turn N | Length: L`

**FAST or CORE ⇒ A6 was in the prompt. DEEP ⇒ A6 was NOT**, and that turn is `NO
EVIDENCE`, never FAIL.

⚠️ This is a **weaker join than block-level observation**. It establishes the tier and
therefore A6's presence-by-construction; it does not observe the characters. Recorded as
the honest ceiling rather than presented as a mechanism witness.

### 5.1 ⭐ DEEP confound — checked in source, and CLEARED for these probes

`lib/consciousness/processingProfiles.ts:100-141`. DEEP requires either an explicit
phrase from a fixed 11-item list (`take me deeper` · `shadow work` ·
`help me with my trauma` · `ritualize this` · …) **or** `textLength > 700` AND a
process-language hint AND `turnCount >= 5`. **None of the three probes as written
triggers either**, so all three land FAST or CORE, both of which receive A6.

⭐ The cognitive-routing adjustments can only **down-regulate** DEEP→CORE
(`:250-262`), never up-regulate into DEEP — so they cannot move a probe out of A6's
delivered surface.

⚠️ The confound is nonetheless **live for improvised turns**: if a probe is rephrased to
contain a listed phrase, that turn routes DEEP and yields `NO EVIDENCE`. Keep the probe
wording.

---

## 6. Record to capture

```text
production SHA        c8770709c
canonical             286e4381
session reload        NO            ← if YES, the run is VOID
completed exchanges   > aperture
serving tier per probe FAST|CORE    ← DEEP ⇒ NO EVIDENCE
early marker          [phrase]
probe 1               response
probe 2               response
probe 3               response

verdict:
A6 live posture       PASS / FAIL / NO EVIDENCE / VOID — reload occurred
```

⭐ **Four states, never forced into green/red.** `NO EVIDENCE` and `VOID` are outcomes,
not soft failures: the first says the decisive condition was never reached, the second
says the run was contaminated. ⛔ Neither may be reported as a FAIL, and neither may be
reported as a PASS.

⛔ No member content beyond the planted marker and the probe responses needs to enter
the record.

---

## 6a. ⭐ Evidence classes — the ceiling, stated up front

```
0A CAN establish
  member-facing posture
  tier = FAST / CORE / DEEP from existing logs
  therefore A6 presence in FAST / CORE BY CONSTRUCTION

0A CANNOT establish
  direct runtime observation that the A6 block's characters were injected
  causal exclusivity — "this response occurred BECAUSE of A6"
```

⭐ **This ceiling is accepted for 0A** (founder ruling). ⛔ No runtime change is made
before the run; adding an emission marker now would change the subject after `b91f7916`
pinned the procedure, converting a member-facing falsifier into an observability
implementation act.

### 6a.1 `A6-OBSERVABILITY-01` — a possible SUCCESSOR, ⛔ not a prerequisite

*Prove delivery of the continuity representation at the serving boundary without
changing its semantics.* If ever authorized, the marker must be **content-free and
structural** — tier, emitted yes/no, and at most the three counts — ⛔ never
conversation text.

⭐ **Build it only if 0A leaves an evidentiary ambiguity that matters**, because the
asymmetry decides it:

- **0A FAILS on FAST/CORE** → already decisive: the accepted A6 representation being
  present *by construction* was not sufficient to produce the required relational
  posture. ⛔ A marker would not rescue that.
- **0A PASSES** → the marker would strengthen attribution from *entailed mechanism +
  observed posture* to *observed mechanism + observed posture*, but the member-facing
  capability has already been demonstrated.

---

## 8. ⚠️ RUN 1 — 2026-09-15 — NOT STARTED · VESSEL RETIRED

⛔ **Not `VOID`** (no reload occurred) and ⛔ **not a verdict**. The marker was never
planted, so **nothing was spent and 0A remains at full authority.**

**Why the session was retired as a test vessel:** during the baseline turns the field
was contaminated by explicit discussion of CORE vs DEEP · testing · scoring · continuity
behaviour · what MAIA was expected to demonstrate.

> ⭐ A clean 0A cannot ask MAIA to perform inside a conversation where she already knows
> what is being evaluated.

**What RUN 1 did produce, incidentally and not as a result:**

- ⭐ **The instrument pre-check PASSED** — `CORE | Turn 1 | Length: 20` and later lines
  proved the tier witness LIVE and **attributable per turn** (`Length: 20` matched the
  greeting exactly). ⭐ This carries forward; ⛔ it need not be re-earned.
- ⭐ **`PSG-01` — Processing-State Grounding Failure**, recorded separately at
  `docs/programme/PSG-01_PROCESSING_STATE_GROUNDING_FAILURE_2026-09-15.md`. ⛔ Incidental
  to this session, ⛔ never its result, ⛔ no lane opened.
- ⚠️ A CORE-vs-DEEP behavioural characterization was drafted and **WITHDRAWN**: both
  turns routed CORE, so the contrast described a performance, not a tier.

```
0A                 UNSPENT
RUN 1 session      RETIRED AS TEST VESSEL
reason             test-awareness / mode-priming contamination
tier pre-check     ✅ PASSED — carries forward
next run           FRESH SESSION · naturalistic marker · no mention of testing
```

---

## 7. Standing

```
0A procedure          ✅ SPECIFIED
0A run                ⛔ UNSPENT
A6                    ✅ canonical @ 286e4381 · ✅ production @ c8770709c
repair authority      ⛔ NONE — 0A is a witness, not a repair lane
0B · SRD-01           ⛔ NOT OPENED — and must not be tested by this run
```
