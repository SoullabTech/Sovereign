# Client Arrival — Baseline Walk (Larry invitation)

**Date:** 2026-08-03 · **Status:** ⛔ **WALK DEFINITION. NOT EXECUTED.**
**Not authorized to run** — see §2. A walk never run is a proposal.

---

## 0. ⚠️ Fourth near-collision, and the distinction that justifies this artifact

`docs/reviews/NOW_WHAT_CLIENT_HOME_LARRY_ACCEPTANCE_WALK.md` (2026-08-02) already contains
**Walk B — Client**, plus Gate 0 structural assertions, the confabulation guard, language acceptance,
and a result vocabulary. **That document is canonical and this one does not replace or restate it.**

The two are different instruments:

| | Existing acceptance walk | This baseline walk |
|---|---|---|
| **Asks** | *Would Slice 0, once built, be acceptable?* | *What does a client meet **today**?* |
| **Precondition** | Slice 0 exists | nothing — runnable now |
| **Expected result** | pass/fail on a built surface | **failure at a known step** |
| **Purpose** | acceptance | **evidence for a ratification question** |

**This walk is expected to fail, and that is its function.** It converts *"we believe the threshold is
wrong"* into *"here is the observed step at which a client is lost."* Without it, the threshold
ruling rests on project documentation rather than on observation — a distinction this lane enforces
everywhere else.

**Reuse, do not reinvent:** evidence classes, observation status, and the confabulation guard come
from `docs/specs/developmental-environment/FIELD_STUDY_METHOD_CANDIDATE_2026-07-29.md` via the
acceptance walk. This document adds steps and expectations only.

## 1. The question this walk answers

> **Does AIN OS need multiple thresholds?**

Standing expectation from the evidence so far, to be confirmed or refuted rather than assumed:
**yes — multiple doors, not multiple identities.** One house, one constitution, doors appropriate to
why a person arrived.

**Stated principle this walk tests (proposed, not ratified):**

> **A door may adapt to the relationship, but it must not reveal the relationship before the person
> enters.**

That selects among the three options previously left open: **neutral before authentication,
personalized after.**

## 2. Preconditions — why this is not executed here

| Requirement | Status |
|---|---|
| A real invitation from a practitioner record | ⛔ must be created by someone with that authority |
| A client identity to receive it | ⛔ **credentials must not be entered by Claude** — this walk needs a human operator |
| An environment that will not corrupt evidence | ⚠️ the shared dev DB breaks repeatability — use a **branch-owned DB**, or prod with a synthetic member and **⛔ no `DELETE … WHERE member_id` on prod** |
| Instrument capable of hit-testing | ⚠️ the Browser pane cannot hit-test (0×0). Tap targets and real clicks must be verified in Claude-in-Chrome |

**Claude can define this walk and record its results. Claude cannot run it.**

## 3. The walk

Each step records: **what happens · what would count as evidence · expected today.**

| # | Step | Admissible evidence | Expected today |
|---|---|---|---|
| 1 | Client receives the invitation | the actual message as sent — not a description of it | ◐ `createPendingRelationship` exists; the *message* is unverified |
| 2 | Opens the link | landing URL captured, unauthenticated | ✅ runnable |
| 3 | Lands unauthenticated | screenshot + page text | 🔴 **observed 2026-08-03:** *"invited you to a new **field** … set up a **key** … how the **room** knows whose **field** to hold."* Names no person, names three system concepts |
| 4 | Signs in | reaches an authenticated state | ◐ runnable by a human operator |
| 5 | **First authenticated screen** | screenshot; does it name Larry? | 🔴 **the decisive step.** Documented flow sends new members to `/begin → /intro-maia → /intro-daimon → /test-elemental → /faq → /onboarding` with explicit *"no shortcuts"* |
| 6 | Finds Home | can they reach *"your work with Larry"* unaided? | ⛔ **no Home exists** |
| 7 | Finds Program | stage and journey visible | ⛔ not built (substrate ✅) |
| 8 | Finds Session | next conversation visible | ⛔ not built; 🔴 blocked on `sessions.team_id` (#899) |
| 9 | Finds Reflect | a space that is theirs | ◐ member surfaces exist; **not named as a room** |

⭐ **Steps 1–5 are the walk that matters right now.** They are runnable today, they need nothing
built, and they produce the entire evidentiary basis for the threshold ruling. **6–9 will fail for a
known and uninteresting reason** — the rooms do not exist — and should be recorded as *not reached*,
never as *failed*.

> **`blocked` ≠ `failed` ≠ `not reached`.** Record which, and name the precondition.

## 4. Acceptance questions

Judged by the human operator, not inferred from logs:

1. Did they know **why they were here**?
2. Did they find Larry's work **without being taught the system**?
3. Did MAIA appear **naturally**, rather than dominate?
4. Did they understand **privacy without reading policy**?
5. Did they feel **supported rather than managed**?

**Asymmetry, carried from the entry architecture and load-bearing here:** 1–2 must be *answerable*;
3–5 must be *felt*. If a walker can only answer 3–5 after having something explained, that is a
failure, not a partial pass.

⚠️ **Confabulation guard.** Do not ask *"did you feel supported?"* — walkers agree with the frame they
are handed. Design a probe: ask what they thought would happen next, ask them to say in their own
words who can see what they just wrote, and record the words they use unprompted. **The vocabulary a
walker reaches for is the finding**; their agreement is not.

## 4a. ⚠️ Observer discipline — the second contamination path

The confabulation guard protects against **the participant being led**. There is a second and
opposite risk: **the observer importing the conclusion.**

> **The baseline walk records what *is*, not what is *permitted*.**

⛔ The observer must not ask, or think in terms of, *"does this violate Article X?"* while walking.
That question belongs to the analysis, after the record exists. Asked during the walk, it decides the
finding before the evidence arrives — and it is especially tempting here, because the constitution
that would judge this surface was written this week by the same people who would be observing.

**The six questions the baseline walk actually asks:**

1. What happens?
2. What does the person believe is happening?
3. What do they expect next?
4. What do they think belongs to **them**?
5. What do they think belongs to **MAIA**?
6. What do they think belongs to **Larry**?

Questions 4–6 are the whole relational instrument, and note what they are not: they do not ask
whether the boundaries are *correct*. They ask what the person *believes the boundaries are*. **The
gap between belief and reality is the finding** — in either direction. A person who thinks Larry sees
less than he does is in as much trouble as one who thinks he sees more.

> **The key finding is not whether they liked it. It is whether the interface created recognition or
> required explanation.**

## 4a-ii. The third contamination path — documentation

Two guards above cover the participant and the observer. There is a third: **mistaking the documented
system for the lived system.**

Documentation says *the client journey is relationship-first.* The walk finds *the first screen
introduces the AI architecture.* **Neither statement need be false.** They describe different
realities — one the system as designed and recorded, one the system as encountered.

⚠️ **This walk exists because that contamination already occurred here.** The Journey-1 finding —
*the new client meets the Daimon before they meet Larry* — was produced by reading a documented
invariant and inferring an experience. It is a confident, specific, and possibly correct claim that
**no one has observed.** That is precisely the failure mode, and naming it concretely is more useful
than naming it abstractly: the guard is not a principle to admire, it is the reason this document is
a walk definition rather than a finding.

> **The baseline walk records what *is*. Not what is *permitted*, and not what is *documented*.**

## 4a-iii. Three error states in the belief/reality gap

Questions 4–6 measure a gap, and the gap has three states, not two:

| | Client believes | Reality | Result |
|---|---|---|---|
| **Error 1** | Larry sees everything | he sees what was shared | **self-censorship** — the person withholds, and the work shrinks |
| **Error 2** | Larry sees less than he does | he sees more | **false safety** — the person discloses on a wrong premise |
| **Accurate** | matches | matches | **trust through clarity** — the goal |

⚠️ **Error 2 is silent.** It generates no complaint, no confusion, no hesitation — nothing an observer
would notice. It surfaces only if the walk asks directly what the person thinks is visible, and
compares that to what is. **A walk that does not probe for Error 2 will report its absence
regardless of whether it is there.**

Error 1 is the one that looks like a UX problem. Error 2 is the one that is a harm.

## 4b. Outcomes, pre-committed

Naming what each result means *before* the walk is itself a bias control — it removes the room to
interpret a result into the answer already preferred.

| | Observation | Finding |
|---|---|---|
| **A** | The documented universal flow is accurate — the invited client walks `/begin → … → /onboarding` | **The threshold needs redesign.** The Journey-1 finding is confirmed and the ratification question is live. |
| **B** | Invitation flows already diverge | **The documentation was stale.** No threshold redesign needed there; correct the finding, and check what else was inferred from that document. |
| **C** | The flow technically works but produces confusion | **The architecture may be right and the translation wrong.** A vocabulary and sequencing problem, not a structural one — much cheaper to fix, and a different ruling. |

All three are useful. **There is no result of this walk that wastes the run**, which is the sign it is
scoped correctly.

## 5. What a run of this walk produces

- **The observed step at which a client is lost** — the fact the threshold ruling needs.
- **The client's own vocabulary** at the door — whether *field*, *key*, and *room* are met with
  recognition or confusion.
- **Whether an invitation path already diverges** from the documented universal flow. If it does, the
  Journey-1 finding is wrong and must be corrected. That possibility is exactly why this is a walk
  and not a conclusion.

## 6. What it cannot produce

Whether the *designed* environment works — nothing is built. Whether Larry's clients will adopt it.
Any evidence about rooms 6–9. And it does not authorize the threshold change it informs: **the walk
supplies the fact; the ruling remains a founder act.**

## 7. The artifact that follows — named, deliberately not started

**Arrival Evidence Packet:** the baseline walk result · the authenticated arrival walk once a
threshold exists · and the comparison — *what changed · what remained invariant · what was learned.*

⛔ **Not started, and not startable.** A packet built before there is evidence is an empty container
that will attract speculation into the shape of a finding — the same failure as a harness never run,
in a different costume. It becomes real the moment §3 has a result.

## 8. Status

**Defined, not executed.** No result may be recorded against this document until a human operator
runs it. Until then the Journey-1 onboarding finding remains *verified against project
documentation only* — which is a candidate, not evidence.
