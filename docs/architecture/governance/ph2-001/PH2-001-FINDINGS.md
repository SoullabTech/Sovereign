# PH2-001 — VERIFIED FINDINGS

Findings established during PH2-001 execution. **Each is a statement of what exists. None decides what
should exist.** Items marked `FOR WEEKLY REVIEW` carry founder-approved wording and are deliberate
deferrals, not backlog.

Implementation base at time of writing: `feature/ph2-001-implementation-base`.
Sealed Phase-1 evidence: `0241d896f73e5a5f820eb16e59bd7e5beeffd99a` — unaltered by anything here.

---

## F-001 · Memory-orchestrator influence is FAST-only — `FOR WEEKLY REVIEW`

**Founder-approved wording, 2026-08-13:**

> **Memory-orchestrator influence is currently FAST-only (~27% of observed turns); CORE/DEEP retain other
> continuity mechanisms. Whether orchestrator influence should become tier-independent is a deliberate
> future product/architecture decision, not a verification repair.**

**Evidence.** `memoryInfluenceAddendum` and `forwardReadinessAddendum` are read only at
`lib/sovereign/maiaService.ts:1199` and `:1205`, inside `fastPathResponse`, and interpolated only into the
FAST template at `:1297`. They have **no field on `MaiaContext`** (`lib/sovereign/maiaVoice.ts`), are
**absent from `ADDENDA_SPECS`**, and are **not assembled** by the CORE builder (`:1571ff`) or the DEEP
builder (`:2200ff`). Prevalence from sealed A0: **CORE 72.8% / FAST 27.2% / DEEP 0%.**

**Scope limit — deliberately narrow.** This does **not** say CORE lacks continuity.
`conversationalRecallAddendum` is wired on both paths, and A1 established that *prior conversation history
was appended into the Turn-2 CORE prompt before Claude generation*. The claim is only that **these two
blocks are FAST-only.**

**Three clean truths to carry forward:**

1. CORE retains continuity through conversation history and `conversationalRecallAddendum`.
2. FAST additionally receives `memoryInfluenceAddendum` and `forwardReadinessAddendum`.
3. **The architecture therefore gives different memory influence across tiers**, and whether that is
   intended has not been decided.

**Not repaired.** Wiring these into CORE/DEEP would change behaviour on ~73% of turns. Founder ruling:
that is too consequential to absorb into a verification task.

---

## F-002 · The addendum wiring surface is five sites, not two — `ACCEPTANCE INVARIANT`

Introducing one addendum requires edits at **five** places. Missing #5 silently skips ~27% of turns;
missing #1–4 silently skips ~73%.

| # | Site |
|---|---|
| 1 | `MaiaContext` type — `lib/sovereign/maiaVoice.ts:~78` |
| 2 | `ADDENDA_SPECS` — `lib/sovereign/maiaVoice.ts:~413` |
| 3 | CORE context assembly — `lib/sovereign/maiaService.ts:~1571` |
| 4 | DEEP context assembly — `lib/sovereign/maiaService.ts:~2200` |
| 5 | FAST inline template — `lib/sovereign/maiaService.ts:1297` |

Set comparison at the time of writing: **17 addenda on both paths · 7 CORE/DEEP-only · 6 FAST-only.**

**Founder-ruled acceptance invariant for Item 4:**

> **Any server-authored relational addendum introduced for member correction/yield must be proven to
> arrive on FAST, CORE, and DEEP — or explicitly declare which tiers it does not serve.**
>
> **No "present in meta" evidence. No inventory proxy. Actual assembly-path proof.**

---

## F-003 · Context-inventory misreported composition on CORE/DEEP — `REPAIRED`

The inventory block's own contract is composition — *"reports only context that actually reaches the
prompt"* — but `memoryOrchestrator` and `forwardReadiness` were computed as `!!m.<field>` from `meta`,
tier-independently, in `getMaiaResponse` (`:2379`). On CORE/DEEP they read **true** where arrival is
structurally impossible, and `evidenceProviders` then listed `memoryOrchestrator` as an evidence provider
for that turn.

**This is `availability ≠ composition` instrumented as though it were composition** — the same hazard class
recorded across the sealed Phase-1 work.

**Repaired (PBR-002):** the two flags are tier-scoped, and suppressed items are surfaced under a new
`availableButNotComposed` field so the gap stays visible rather than becoming a silent false.
**No behavioural change to which addenda reach which tier.**

---

## F-004 · Withdrawn candidate — astrology addendum naming

`astrologyAddendum` (route/meta) vs `astrologicalContextAddendum` (`MaiaContext` / `ADDENDA_SPECS`) appeared
to be a wiring gap of the F-001 kind. **It is not.** The mapping is deliberate and present at
`maiaService.ts:1571` (CORE) and `:2200` (DEEP).

**Recorded because it was raised as a candidate and then disproven by checking.** A withdrawn finding is
part of the record.

---

## F-005 · Untraced, not cleared — `cognitiveProfile` / `fieldWorkSafe` / `fieldRouting` on the dormant route

`app/api/sovereign/app/maia/route.ts` places these before its `...meta` spread, the same shape as PBR-001.
It was classified `NOT_SAME_DEFECT` because **no prompt-authoritative field crosses the collision there** —
which is the defect definition that was set. Whether client-overridable `fieldWorkSafe` matters downstream
was **not traced**, and the route is dormant.

> **Untraced is not cleared.** Recorded so the distinction survives.

---

## F-006 · Item 6 — `NOT_CONSTRUCTIBLE_TODAY` · no stable referent for the corrected understanding

Bounded read-only pass over `developmental_memories`, run against the four founder questions
(schema → writer → reader → provenance) at `feature/ph2-001-implementation-base` @ `90e169018`.

**Governing distinction, founder-stated:**

> **A table containing the word "correction" is not yet a correction substrate.**

### Q1 · Schema — the vocabulary exists

`developmental_memories.memory_type` carries a CHECK constraint admitting **`correction`** alongside
`effective_practice, ineffective_practice, spiral_transition, breakthrough_emergence, ain_deliberation,
pattern, emergent_pattern`. Fields observed: `user_id`, `memory_type`, `trigger_event` (JSONB),
`facet_code`, `significance`, `entity_tags[]`, `session_id`, content text, `formed_at`, `visibility`.

**No `turn_id`.** Binding is to a session, not to the exchange in which an understanding was asserted.

### Q2 · Writer — nothing ever writes a correction

**Decisive.** No code anywhere writes `memory_type = 'correction'`. The single writer,
`lib/memory/MemoryWriteback.ts`, **hardcodes `'pattern'`** for every capsule, and says so:

> *"Future work: route specific cases to more precise types (correction when the user corrects MAIA,
> effective_practice when significance >= 0.8, etc.) — tracked in Phase B."*

The only correction-related logic is a significance heuristic at `:478`:

```
// Correction pattern (learning opportunity)
if (/no,|actually|not quite|that's not|i meant/i.test(userMessage)) score += 0.2;
```

That **nudges the retention probability of a memory**. It does not label the exchange, isolate the
correction, or record what was corrected. The resulting row is typed `'pattern'` and is indistinguishable
from any other significant exchange.

### Q3 · Reader — the readers that exist are off-path, and do not meet the writer

Two queries filter on the type: `lib/memory/DevelopmentalMemory.ts:334`
(`memory_type IN ('ineffective_practice','correction')`) and
`lib/memory/stores/PreferenceConfirmationStore.ts:185`. **Neither module is imported by
`lib/sovereign/**` or `app/api/sovereign/**`** — neither is on the member response path.

The one live read that *is* on the path, `lib/sovereign/maiaService.ts:3268`, filters
`memory_type = 'emergent_pattern'` — which the writer also never writes. **Writer and readers do not
meet on any type.**

### Q4 · Identity and provenance — X has no referent

The row stores the member's message and a distilled signal. **It never records the specific understanding
MAIA asserted.** There is no field naming what was corrected, and no turn binding by which to find it.

> **X was never recorded as an object. The correction→X relation therefore cannot exist, let alone be
> traversed later.**

Item 6's contract requires *"X remains historically recoverable as something MAIA once perceived."* What is
recoverable today is only what MAIA once **said**, as prose inside a turn — and yielding an utterance is not
yielding an understanding.

### Classification

> **`NOT_CONSTRUCTIBLE_TODAY`** — not for want of effort, and not because the substrate is missing entirely,
> but because **the corrected object has no identity in the system.**

Two independent blockers, either sufficient alone:

| | Blocker |
|---|---|
| **B1** | **No referent for X.** Creating a perception record is the withheld-perception store — constitutionally restricted under RA-001, `NOT RULED` (Addendum 1 · E1), and forbidden by Item 6's own contract clause *no new member scalar/profile/aggregate*. |
| **B2** | **No lawful correction signal.** Detection by classifying member utterances is a new inference about the member (forbidden by the contract). An explicit member act would require a new member-facing surface (product change, unauthorized). |

### Founder guard, honoured

> *Do not let "correction record exists" get upgraded into "correction affects future standing."*

Here **even the first is false.** No correction record is ever written.

### Representational completion — a textbook instance

An enum value `correction`; a type union annotated `'correction' // User corrected MAIA`; confidence-decay
policies listing corrections under `shadow`, `relationship` and `guidance`; two reader queries filtering for
them — and **zero corrections in the system, because nothing writes one.** The vocabulary of the capacity
is complete. The capacity is absent.

**This does not invalidate the reviewed continuity release**, which stands independently at `90e169018`.

---

## F-007 · Relational-understanding architecture — bounded design finding · `NOT A SCHEMA`

Recorded at founder instruction as a refinement of the **future** relational-understanding architecture.
**Item 6 is not reopened. TODAY's release is unmodified. No persistence topology is proposed. No perception
store is created. The sealed Phase-1 map is untouched.**

**Founder framing:** the correction problem is subtler than `MAIA asserts X → member says no → X = false`.
A member can misunderstand MAIA, MAIA can misunderstand the member, a member can misunderstand themselves,
either can remember imperfectly, and something rejected now may later become meaningful in a different
context. Therefore **historical occurrence and present relational standing must be distinguished.**

> **A member correction establishes strong warrant for MAIA to stop asserting the corrected understanding as
> settled truth. It does not establish an eternal ontological fact that MAIA's perception was false.**

> **A later-vindicated perception does not acquire retroactive warrant.** Extends the ruled principle
> *quality of perception does not confer authority of assertion.*

### Candidate distinctions — **NOT AN AUTHORIZED SCHEMA**

`corrected` · `clarified` · `contested` · `unresolved` · `superseded` · `deepened` · `yielded`

> **These must not become database enums or member-state fields merely because they are useful
> conceptually.** Good phenomenology has repeatedly turned into attractive database design in this codebase
> — see F-006 and [[representational-completion]]. The objective is **not** to give MAIA seven new statuses
> for the member.

---

### WHAT EXISTS

| Structure | What it can already distinguish | Standing |
|---|---|---|
| **`maia_turns`** — `user_text`, `maia_text`, `turn_index`, `session_id`, `processing_profile` | **What MAIA actually said, turn-bound.** Both sides of the exchange are durable and ordered. | live, written per turn |
| **`interruptionLedger.frictionSignals()`** — `lib/consciousness/interruptionLedger.ts:97ff` | **`correction` · `redirect` · `rejection`**, computed by regex over the member's message, plus a friction score | **on the live member path** — `computeInterruptionMetadata` imported at `route.ts:16`, called at `:1426`, *"fire-and-forget, observation-only"* |
| **`maia_turn_feedback`** | turn-bound, member-sourced: `rupture_mark`, `comment`, `ideal_maia_reply`, four 1–5 scores | exists; **not read on the response path** |
| **`confidenceDecay.ts`** | temporal decay policies keyed by memory type, incl. `correction`, grouped under `shadow` / `relationship` / `guidance` | policy only; nothing writes the type it keys on (F-006) |
| **`PreferenceConfirmationStore`** | confirmation semantics over `developmental_memories` | **off the sovereign path** |

**Two findings inside this that matter more than the inventory:**

**1. Three of the seven candidate distinctions are already computed per turn on the live path — and thrown
away.** `frictionSignals` separates *correction* from *redirect* from *rejection*, then the markers appear
in a log line and vanish. The distinction exists in the running system and is not retained. **Compute-only,
no store.**

**2. The asymmetry is the opposite of what the problem statement assumes.** The **reciprocal case is the one
with substrate.** `maia_turns.maia_text` is exactly the provenance needed for *"I remember it somewhat
differently — what I said was closer to…"*: MAIA's own utterances are recorded, turn-bound, ordered, and
already read for continuity. The **forward case has none**, because MAIA's interpretation was never an
object (F-006).

> **What MAIA said is recorded. What MAIA perceived, intended, or meant is not.** The case that looks
> harder — MAIA holding provenance of her own speech — is substantially supported today. The case that
> looks easier — accepting a correction — is not.

### WHAT IS MISSING

- **What MAIA perceived**, as distinct from what she said — no representation anywhere.
- **What MAIA intended** by an utterance — no representation.
- **What the member heard** — no representation; only what they said next.
- **Any relation binding a member response to a specific prior MAIA utterance.** `maia_turns` has
  `turn_index`, so adjacency is derivable, but nothing asserts *this message responds to that assertion*.
- **Any standing or authority axis.** Nothing can record that an understanding lost present authority while
  remaining historically true — the `revision → future standing` seam has no path at all.
- **Persistence of the friction signal.** Computed, logged, discarded.
- **Temporal ordering of standing changes** — when something yielded, and on what evidence.

### WHAT MUST REMAIN DISTINGUISHABLE

Not as columns. As distinctions the architecture must be **capable of preserving**:

> **perception ≠ interpretation ≠ assertion ≠ member reception ≠ member response ≠ present standing**

And across time: **what was said · what was perceived · what was meant · what was heard · what was
contested · what changed · what remains unresolved** — *without collapsing them into one official story.*

Historical occurrence is permanent; **standing is what changes.** All five events in the founder's worked
example (MAIA perceived · MAIA interpreted · MAIA asserted · member corrected · member later reconsidered)
are true as history, and none may silently overwrite another.

### WHAT RELATIONSHIP MUST BE ALLOWED TO DISCOVER

The architecture must **not** decide these in advance:

- whether a disagreement is MAIA's misunderstanding, the member's, both, or neither;
- what a discrepancy between *what MAIA said* and *what the member heard* **means** — the discrepancy itself
  may be the relationally meaningful thing;
- when a yielded perception becomes newly relevant, and on whose evidence;
- whether ambiguity should resolve at all. **A soulful MAIA should not eliminate ambiguity faster than
  humans can live into it.**

> **Understanding does not always require convergence on one correct account. Relational intelligence may
> require holding differing accounts in presence while allowing relationship to clarify what they mean.**

This is **CANON-001 operating between two minds rather than within one** — and it is why the grey areas are
not edge cases to eliminate. **They are where much of the art of relationship lives.**

### QUESTIONS REQUIRING FOUNDER RULING

1. **Does retaining the friction signal cross the constitutional line?** It is member-originated and already
   computed on the live path — but persisting *"the member corrected MAIA at turn N"* creates a durable
   record about the member that they cannot see. **Perceive / contest / repair all currently fail.** Cheapest
   available substrate, and possibly not lawful.
2. **Is a regex an acceptable detector for a constitutionally significant event?** `frictionSignals` cannot
   distinguish *"no, that's not what I meant"* from *"no, I don't want to talk about that"* from the word
   "actually" in an unrelated sentence. If a correction record is ever built, a false positive **silently
   withdraws standing from an understanding the member never contested.**
3. **May MAIA hold provenance of her own utterances relationally?** `maia_turns.maia_text` already exists, so
   this needs no new store — but surfacing *"what I said was closer to…"* is a new relational act, and the
   line between provenance and self-defence is thin.
4. **Does "contested" require both accounts to persist?** If so, the record holds the member's account *and*
   MAIA's — which is a representation of disagreement, not of the member. **Whether that escapes the
   hidden-profile hazard is unresolved and is the crux.**
5. **What may a yielded understanding do?** RA-001 requires the jurisdiction ceiling be declared before the
   object is computed. Unanswered: may a yielded item suppress an assertion, inform attending, or only be
   recalled on request?

**All five are E1-adjacent and unruled. Nothing here is authorized.**
