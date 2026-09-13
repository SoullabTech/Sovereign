# UARE-01 — MAIA Voice Acceptance Matrix — CANDIDATE

**Date:** 2026-09-13
**Lane:** `UARE-01` · **Status:** ⛔ **CANDIDATE INSTRUMENT. NOT RATIFIED. NOT A GATE.** Confirmed as a candidate, founder
ruling 2026-09-13 — confirmation of the *instrument's standing as a candidate*, not of its rows.
**Derived from:** Uare's published mobile release notes [D] (first-pass study §6), reclassified against
MAIA's own voice canon. It is **not** a copy of a competitor's QA list.

---

## What this is, and what it is not

**Is:** a proposed acceptance surface for MAIA voice — the set of conditions under which "voice works"
would be a falsifiable statement rather than an impression.

**Is not:** authority. It does not gate anything today. It does not bind any lane. Adopting it —
whole, in part, or not at all — is a founder act. **Nothing here may be cited as a requirement until
that act occurs.**

**Why a competitor's defect log is legitimate input.** Every row below is **sensory infrastructure or
session transport**. Under `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`, STT/TTS
and capture paths may change freely — *voice may have a different capture path; it may not have a
different mind.* So these rows carry no doctrinal risk: they describe conditions MAIA must survive,
never what MAIA should think. The one class that is **not** infrastructure — the turn-record rows,
marked ⭐ — is included precisely because it is where the gate already lives.

**The corroboration, at the exact strength of the evidence** (repaired per founder ruling 2026-09-13):
**MAIA directly exhibited this defect family** (2026-09-07 — the transcript append inside the TTS
success branch). **Uare's published release notes [D] independently document fixes belonging to the
same family.** ⛔ We have observed none of theirs; vendor release notes are documentation, not our
observation. From that asymmetric pair the inference is **[I]**: *coupling the turn to the audio path
is a recurring structural attractor in conversational voice systems.* That is why this surface is
worth naming — and it is enough as stated.

---

## Coverage column — the U1 evidence ladder

**Founder ruling 2026-09-13.** The coverage column is where this lane's canary (charter §0.1) is most
likely to fire, in its epistemic form: *an implementation that looks right, read as a boundary that is
enforced.* The grammar below exists to make that promotion impossible to perform quietly.

```text
CODE PRESENT  ≠  GATE PRESENT  ≠  GATE ASSERTED  ≠  GATE WITNESSED
```

A file can contain all the right nouns, branches and refusal logic and still prove only that **an
implementation exists**. It does not prove the boundary is enforced.

> **U1 discipline.** Implementation inspection may establish **CODE PRESENT**. ⛔ **It may never
> establish GATED.** `GATED` requires a named test whose assertion actually crosses the relevant
> boundary and distinguishes admission from refusal.

| State | What it means | What establishes it |
| --- | --- | --- |
| **NOT SURVEYED** | No claim either way. | — |
| **CODE PRESENT** | Source implementing the condition exists. | Inspection. **Stops here.** |
| **TEST PRESENT** | A named test directly asserts the boundary. | The assertion is read and *does* distinguish admission from refusal. |
| **TEST PASSING** | That test has run successfully **on a stated SHA**. | An executed run, SHA named. |
| **OBSERVED `[O]`** | Witnessed in the running product under the lane's method. | ⛔ U2 only. Not reachable at U1. |

**`TEST PRESENT` ≠ `TEST PASSING` ≠ `[O]`.** This guards the subtler variant: *there is a test file,
therefore the gate is proven* — when the test either does not assert the decisive thing, or has never
run against the build under study.

**The assertion must fit the claim, not a fixed shape.** Demanding a read assertion universally would
couple the rule to one implementation form. Instead: a **read** gate proves the read cannot occur
without the condition; a **write** gate proves the mutation is refused; a **visibility** property
proves presence or absence under the relevant state.

### The U1 trap, in its pure form

```text
weak state      "This code appears to check X."
                        ↓   nothing external happens
strong state    "X is gated."
```

That is **occurrence 3** if a U1 finding ever records it. The required crossing:

```text
implementation inspection → named test → decisive assertion at the boundary → successful execution on identified code
```

**No crossing, no promotion.**

⛔ **The occurrence register stays at 2/3.** Anticipating a failure is not committing it. The row fills
only if an actual U1 finding promotes implementation appearance into stronger standing without the
crossing.

⭐ **DECISIVENESS IS A CONDITION, NOT AN AXIS** (founder, 2026-09-13): *a test cannot discharge a
behavioral row merely because it executes real modules* — **would it fail if the handling were replaced
with a no-op, or the boundary inverted?** Behavioral tests are then **no-op compatible** · **wrong
grain** · **decisive**; only the last supports a row.

⭐ **THE MATRIX DOES NOT DESCEND TO MEET THE TESTS.** ⛔ Never reword a row to the property its test
happens to decide — that lets the instrument quietly redefine the product obligation until existing
tests cover it. **Row claim stable · narrower property recorded beneath · coverage stays incomplete.**

⭐ **GUARD KIND is a second axis** (charter §5.1): a **lexical/source** guard fails on source drift; a
**behavioral** guard fails on wrong behaviour. ⛔ **A lexical guard can never discharge a behavioral
row.** Every row below carries its kind where established.

⭐ **U1 FIRST PASS RUN 2026-09-13 on `36374edb`** — 3 suites, 35 tests, all passing; bodies inspected
against the inversion criterion. Result and every caveat: `UARE-01_U1_COVERAGE_SURVEY_2026-09-13.md`.
⛔ **A green run is not `GATED`** — and none of A1–A5 executes the voice path; all assert over source
text, so the A-block detects **source drift, not runtime regression.**

### Re-statement of A1–A5 under the new grammar

⚠️ A1–A5 were labelled **GATED** on 2026-09-13 under the previous legend, which defined that word as
*"a named test asserts it; the assertion names were read."* The method was disclosed and the term was
defined at the strength of the evidence, so this is **not** a fourth instance of the canary — it is a
term whose definition has since been tightened, and the rows are re-stated in the new vocabulary
rather than left carrying a word that now means more than was established.

**What was actually done:** assertion *names* were read from the test files. **What was not done:** the
assertion *bodies* were not audited, and no test was executed against a stated SHA. So A1–A5 are
**TEST PRESENT (by name)** — and closing the name-versus-body gap, then running them, is U1 work.

---

## The matrix

⭐ **U1 SECOND PASS RUN on `7f52f587`** — `lib/voice/__tests__/` — **6 suites · 125 tests · all passing ·
ZERO promotions.** Those suites are **behavioral** (they import and execute real modules) and decide
real values, but each decides a **narrower property than the row claims**; under *never widen a test's
claim from its name*, the rows do not move. ⛔ **The grain mismatch is NOT resolved by restating the
rows** — fitting a claim to the instrument found is the canary's mechanism running backwards. Survey §10.

⛔ Every `NOT SURVEYED` row below stays `NOT SURVEYED` **even where U1 located a candidate test file** —
a located file is not `TEST PRESENT`. The candidates are named in survey §3 so the next pass starts
from them; ⛔ do not count them.

### Class A — turn record ⭐ (the non-negotiable class)

| # | Condition | Coverage |
| --- | --- | --- |
| A1 | A spoken turn and a typed turn converge before MAIA cognition begins; nothing stands between the log line and canonical cognition. | ⭐ **TEST PASSING** — `__tests__/voice-non-degradation.test.ts`, run on `36374edb`; ⛔ inverts *decisive* (its ⛔ cases mutate the source and assert rejection) |
| A2 | MAIA's turn is committed exactly once, from one seam, reached by every terminal path. | **TEST PASSING (narrowed)** — `__tests__/voice-transcript-commit.test.ts`, run on `36374edb`. ⛔ *one seam / one append* decisive; *reached by every terminal path* **not** decisive (literal presence ≠ path coverage) |
| A3 | A stalled or failed TTS delays MAIA's words; it never erases them. | **TEST PRESENT** — ⛔ not decisive: proves the watchdog is spelled in source, not that it arms or survives |
| A4 | Commit is independent of any render preference (`showVoiceText`), so no display setting can decide what MAIA remembers saying. | 🔴 **TEST PASSING — LEXICAL GUARD ONLY · BEHAVIORAL BOUNDARY NOT ESTABLISHED.** The test ran and passed; ⛔ it does **not** establish the boundary it is named for. It bans one spelling (`isInVoiceMode && showVoiceText`); `showVoiceText && isInVoiceMode`, `if (showVoiceText)` or any derived boolean passes while the dependency returns. ⛔ Not repaired — **handed to the owning voice lane**: `UARE-01_A4_VOICE_LANE_HANDOFF_2026-09-13.md` |
| A5 | The text emitted and the transcript persisted are the same guarded value. | **TEST PRESENT** — `__tests__/r2-voice-continuity-contract.test.ts`; decisive against deletion at two named sites only |
| A6 | Switching text ↔ voice mid-conversation produces one continuous conversation, not two. | **NOT SURVEYED** |
| A7 | A reconnect resumes the same conversation; it never splits it into a second one. | **NOT SURVEYED** |
| A8 | A message delivered in both channels appears once, not twice. | **NOT SURVEYED** — ⚠️ its earlier candidate (`webSpeechLifecycle`) is **withdrawn**: zero `dedup`/`duplicate` matches in test or module; the keyword sweep had matched `idempot` from listener attachment. ⛔ **No candidate located.** Keep separate: *duplicate detected* ≠ *duplicate prevented* ≠ *exactly-once transition* |
| A9 | The second turn works. Replies do not stop after the first. | **NOT SURVEYED** |

### Class B — capture and transport

| # | Condition | Coverage |
| --- | --- | --- |
| B1 | MAIA does not hear her own voice; output never re-enters capture as input. | **CODE PRESENT, UNGATED** — `lib/voice/voice-feedback-prevention.ts` |
| B2 | The member can interrupt MAIA while she is speaking, and the interruption is honoured. | **NOT SURVEYED** — candidates: `lib/voice/VoiceBus.ts`, `lib/voice/MaiaRealtimeWebRTC.ts` |
| B3 | The end of member speech is not truncated; trailing words survive endpointing. | **NOT SURVEYED** — candidates: `lib/voice/ConversationalTiming.ts`, `lib/voice/captureForensics.ts` |
| B4 | A network drop recovers without member action and without losing the turn in flight. | **NOT SURVEYED** |
| B5 | Backgrounding the app does not silently kill an active session. | **NOT SURVEYED** — iOS/Capacitor path |
| B6 | Synthesis quality after resume matches synthesis quality before suspend. | **NOT SURVEYED** |

### Class C — device and interruption (mobile; deferred, not dismissed)

| # | Condition | Coverage |
| --- | --- | --- |
| C1 | Audio routes to the connected device (car, headset), not the handset speaker. | **NOT SURVEYED** |
| — | *(C-class note)* `lib/voice/__tests__/mobile.robustness.test.ts` covers incoming call · Bluetooth handoff · resume · iOS background audio, executes real modules, and **passes**. 🔴 **Three** of its named tests do not decide: *"pause on incoming call"* ends at `expect(session).toBeDefined()` (**the assertion cannot discriminate the named behavior** — it can still fail on a throw, so not *"cannot fail"*); *"Bluetooth handoff"* is **no-op compatible**; *"iOS audio background mode"* asserts over a literal array defined three lines above and **would pass in an empty repository**. ⚠️ Per-describe-block, not per-file: *Battery Management* and *Wake Word False Positives* **do** discriminate. ⛔ **NOT `TEST PRESENT`** — survey §9, §15; handed over: `UARE-01_MOBILE_ROBUSTNESS_VOICE_LANE_HANDOFF_2026-09-13.md` | |
| C2 | Headphone disconnect is handled without dumping audio to speaker mid-turn. | **NOT SURVEYED** |
| C3 | An incoming phone call suspends cleanly. | **NOT SURVEYED** |
| C4 | The session resumes correctly after the call ends. | **NOT SURVEYED** |

### Class D — surface truthfulness

| # | Condition | Coverage |
| --- | --- | --- |
| D1 | The UI never shows a live state for a dead session. Stale connection is visible as stale. | **NOT SURVEYED** |
| D2 | The live interim transcript shows that MAIA is still hearing — bounded, tail-pinned, never frozen behind an ellipsis. | **CODE PRESENT, UNGATED** — repaired 2026-09-07; no named test found |
| D3 | Where MAIA answers from a member's material, the source is reachable without intruding on the conversation. | **NOT SURVEYED** — design input, study §5.3; Cat 1, held |

---

## Sovereignty check on the matrix itself

Required by the Anchor for anything touching voice or user-facing behaviour. Answered, not passed:

- **Agency** — increases. Every row returns control the member had already assumed they had
  (interrupting, switching modality, leaving and returning, seeing whether they are still heard).
- **Life outward** — neutral. This is infrastructure reliability; it neither pushes life outward nor
  inward, and must not be described as if it did.
- **Reduces psychological centrality over time** — neutral-to-positive. A voice surface that fails
  ambiguously *increases* centrality: the member attends to the system's state instead of their own.
  Failing legibly costs less attention than failing silently.
- **Cultural sovereignty (Invariant 14)** — no framework is imposed; no member meaning is translated.
- **Growth obligation** — this matrix adds **no capability**. It adds falsifiability to a capability
  already shipped. It introduces no new uncertainty, requires no new provenance boundary, and creates
  one responsibility: *a condition listed here and left `NOT SURVEYED` is a known unknown on the
  record, and may not be cited as covered.*

## What adoption would require

1. **U1** — replace every `NOT SURVEYED` with a real finding, each carrying a state from the ladder
   above. Audit the A1–A5 assertion bodies and run them on a named SHA. Some rows will already be
   covered; ⛔ none may reach `GATED` from inspection alone.
2. Founder ruling on which classes are **blocking** for a voice release and which are recorded debt.
   **[I]** Class A is the only class that plausibly blocks; it is the only class where failure costs
   MAIA's own record of what she said.
3. Only then does any row become a gate, and only then may `docs/ops/` reference it.

⛔ Until then: a candidate list of conditions, and an argument that the list is real.

---

*Another production team already paid for this failure surface. Taking the map is free. Taking their
conclusions is not, and is not proposed here.*
