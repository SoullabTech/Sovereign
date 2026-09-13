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

⛔ Every `NOT SURVEYED` row below stays `NOT SURVEYED` **even where U1 located a candidate test file** —
a located file is not `TEST PRESENT`. The candidates are named in survey §3 so the next pass starts
from them; ⛔ do not count them.

### Class A — turn record ⭐ (the non-negotiable class)

| # | Condition | Coverage |
| --- | --- | --- |
| A1 | A spoken turn and a typed turn converge before MAIA cognition begins; nothing stands between the log line and canonical cognition. | ⭐ **TEST PASSING** — `__tests__/voice-non-degradation.test.ts`, run on `36374edb`; ⛔ inverts *decisive* (its ⛔ cases mutate the source and assert rejection) |
| A2 | MAIA's turn is committed exactly once, from one seam, reached by every terminal path. | **TEST PASSING (narrowed)** — `__tests__/voice-transcript-commit.test.ts`, run on `36374edb`. ⛔ *one seam / one append* decisive; *reached by every terminal path* **not** decisive (literal presence ≠ path coverage) |
| A3 | A stalled or failed TTS delays MAIA's words; it never erases them. | **TEST PRESENT** — ⛔ not decisive: proves the watchdog is spelled in source, not that it arms or survives |
| A4 | Commit is independent of any render preference (`showVoiceText`), so no display setting can decide what MAIA remembers saying. | ⛔ **TEST PRESENT — ASSERTION NOT DECISIVE.** It bans one spelling (`isInVoiceMode && showVoiceText`); `showVoiceText && isInVoiceMode` or `if (showVoiceText)` passes while the boundary is violated. Recorded, ⛔ not repaired — survey §2 |
| A5 | The text emitted and the transcript persisted are the same guarded value. | **TEST PRESENT** — `__tests__/r2-voice-continuity-contract.test.ts`; decisive against deletion at two named sites only |
| A6 | Switching text ↔ voice mid-conversation produces one continuous conversation, not two. | **NOT SURVEYED** |
| A7 | A reconnect resumes the same conversation; it never splits it into a second one. | **NOT SURVEYED** |
| A8 | A message delivered in both channels appears once, not twice. | **NOT SURVEYED** |
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
