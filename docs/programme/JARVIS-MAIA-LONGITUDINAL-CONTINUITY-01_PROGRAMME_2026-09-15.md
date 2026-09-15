# JARVIS · MAIA LONGITUDINAL CONTINUITY — `JARVIS-MAIA-LONGITUDINAL-CONTINUITY-01`

**Opened** 2026-09-15 by founder act, as an **orchestration programme**.
**Predecessor** `AIN-CONTEXT-01` — the constitutional and census predecessor, not a parent lane.

---

## 1. Subject

Convert MAIA from short-aperture conversational continuity into longitudinal
relational, developmental and process-centered continuity, while preserving source
sovereignty, epistemic standing, member freedom, correction, provenance and descent.

> A larger context window gives MAIA more past.
> Longitudinal continuity gives MAIA a relationship to the past.

The destination is not a system that remembers everything. It is a system capable of
recognizing a person through time without reducing them to who they have previously been.

---

## 2. ⭐⭐ First-order premise — there are TWO apertures, not one

```
MAIA'S COGNITIVE APERTURE     what MAIA presently sees
MEMBER'S RELATIONAL APERTURE  what the interface presents as the conversation
```

Both must remain truthful. **A soulful system may not privately possess the right
temporal context while presenting the human with the wrong relationship history.**
Continuity is a property of the shared field, not of MAIA's prompt.

⚠️ **A6 satisfies one half of this premise and not the other.** It made MAIA truthful
about her aperture and said nothing to the member about theirs. A6 is therefore not a
completed instance of the premise; it is the first half of one. ⛔ This is recorded at
the programme's opening rather than discovered at Phase 7.

---

## 2a. ⭐⭐ PROGRAMME PRINCIPLE — integration, not accumulation

> **Each lane must increase the FUNCTIONAL INTEGRATION of the memory organism, ⛔ not
> merely add another memory capability.**

⭐ MAIA already has extensive memory **anatomy**. What is uneven is **circulation**. That
is why the system can *possess* a memory and still fail to bring it forward when the
relationship needs it.

> ⭐⭐ The project is no longer *"build more memory."* It is
> **"turn MAIA's existing memory systems into a coordinated living memory organism."**

⚠️ **The characteristic danger is therefore NOT individual code difficulty.** It is a
local improvement silently contradicting another layer — exactly as Lane 1 could make
A6 lie (§4.3 of the Lane 1 record). ⛔ Every lane must prove it broke no other memory law.

### 2a.1 ⛔ Jarvis is not an organ

⛔ Jarvis must not become another memory layer. Its role is programme conduction:

```
census → establish contracts → open ONE bounded lane → RED → implement
      → verify → compose with the existing organism
      → prove no other memory law was broken → canonicalize → next lane
```

---

## 3. Authority — orchestration only

Jarvis MAY, under this programme:

- maintain the dependency graph;
- name proposed child lanes;
- track LIVE / DESIGNED / VISION / accepted / witnessed standing;
- preserve custody and evidence;
- enforce stop conditions;
- prevent downstream work from outrunning prerequisites.

⛔ Jarvis MAY NOT, merely by existence of this programme, authorize:

runtime changes · schema changes · migrations · retrieval · summaries · Spiralogic
persistence · prompt changes · DEEP changes · production deployment.

**Each child lane requires its own explicit opening authority.** Naming a lane here is
custody, never permission.

⛔ Jarvis does not decide the human-development ontology. The laws of continuity,
Spiralogic, freedom, correction, developmental process and relational meaning remain
MAIA/Soullab constitutional architecture. Jarvis asks only: *what is the next lawful
thing to prove, what evidence exists, what has standing, what may open next.*

---

## 4. Findings carried into the programme

### 4.1 ⚠️ Label withdrawal — `C4` is Significance

An earlier draft used `C4` for the reload-ordering finding. **Withdrawn.** `C4` remains
**Significance** — *"What must not be lost?"* — as defined in
`AIN-CONTEXT-01_ACT2_ARCHITECTURE_2026-09-15.md`. The reload finding is not in the
C1–C10 set at all and receives its own identity below.

⭐ Declared rather than absorbed, following the `S3-F1…F10` / SEL-0 `F1–F7` precedent:
*a naming collision is resolved by declaration, never by quiet reuse.*

### 4.2 ⭐⭐ `SRD-01` — Session Re-entry Divergence

> In a sufficiently long session, reload can restore the member-facing transcript from
> the **oldest** durable material while MAIA continues reasoning from the **newest**
> server-side material, leaving member and MAIA situated in different temporal regions
> of the same conversation **without either being told.**

**Mechanism, traced in source:**

```
app/api/conversation/turns/route.ts:71-74   ORDER BY created_at ASC LIMIT 100
                                            → oldest 100; no OFFSET, no cursor,
                                              no total in the response, so the
                                              client cannot detect truncation

components/OracleConversation.tsx:3111      called on every mount
                             :3124          if (pgMessages.length > loadedMessages.length)
                                            → arbitration is by COUNT, not recency

localStorage                most recent 50  (messages.slice(-50))
PostgreSQL GET              oldest     100
                            100 > 50        → oldest wins
                             ↓
setMessages(loadedMessages)                 member's screen = turns 1–100
localStorage.setItem(…, pgMessages.slice(-50))
                                            cache overwritten = turns 51–100
```

⭐ **The ordering alone is not the defect.** The arbiter between sources is length, so
reload does not merely truncate — it **swaps recent material for ancient material and
then destroys the recent cache**, durably, on every mount.

⛔ **The cache overwrite is part of SRD-01, not a sibling finding.** It compounds the
divergence and does not constitute an independent problem.

⭐ **Scope, kept exact.** This does **NOT** corrupt MAIA's prompt. The prompt reads
server-side via `getConversationHistory(sessionId, 10)` → `ORDER BY created_at ASC`
with no SQL `LIMIT`, then `slice(-limit)` — **most recent**. The client's history is
prompt-inert (`AIN-CONTEXT-01` ACT 1 Finding 1). `conversation_turns` is intact:
**this is presentation and re-entry corruption, never transcript loss.**

The resulting defect is relational:

```
after reload, long session
member sees    turns 1–100        (the beginning)
MAIA reasons   last 10 exchanges  (the end)
```

Non-overlapping regions of the same conversation, and neither party is told.

**Evidence standing:**

```
source chain        ✅ traced
mechanism           ✅ ENTAILED  (source read and reasoned)
>100-turn reload    ⛔ NOT WITNESSED
production repair   ⛔ NONE
```

⛔ Entailment from source that has been read is honest evidence; calling it witness is
not. The witness is owed in Lane 0B.

### 4.3 ⭐ DEEP is a cross-programme carrier defect, not deferred polish

`ConsciousnessContext` carries no addenda channel (the pre-existing §II.C divergence in
`docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md`). A6 did not create it and
did not widen it. ⚠️ **But every later phase that injects into cognition meets the same
wall.** Left where it is, the programme ships `FAST ✅ CORE ✅ DEEP ⛔` nine times and
then owes nine separate convergence repairs.

---

## 4a. THE ORGAN CONTRACT — what every memory must carry into cognition

⛔ Nothing enters cognition bare. Every item travels as:

```
memory
+ provenance                  who authored it
+ standing                    confirmed · corrected · superseded · revoked · uncertain
+ temporal / process location WHEN, and WITHIN WHICH unfolding process
+ applicable guard            what it may and may not be used to claim
```

⭐ So MAIA can distinguish, and never conflate:

| | |
| --- | --- |
| *"the member literally said this"* | primary evidence |
| *"this was marked as significant"* | member act |
| *"MAIA inferred this"* | interpretation |
| *"this interpretation was later corrected"* | superseded standing |
| *"this is a recurring developmental pattern"* | derived, over time |
| *"this belongs to a particular spiral"* | process-located |
| *"this is symbolic material"* | ⛔ **never an identity claim** |

⚠️ Today `memory_type` is **always `'pattern'`**, so **none** of these distinctions
survives into cognition. The contract is the work of **L2**, and every later lane
depends on it.

---

## 4b. ⭐⭐ ONE FINAL COMPOSITION POINT — where the organism becomes coherent

⛔ Today each memory system independently stuffs material into the prompt. Instead:

```
candidate memories from ALL relevant organs
        ↓
standing + provenance checks
        ↓
relevance / significance
        ↓
deduplication (by durable identity)
        ↓
conflict / correction handling
        ↓
FINAL COGNITIVE COMPOSITION
        ↓
A6 truthful self-location, derived HERE
        ↓
MAIA
```

⛔ **This is NOT one giant memory database.** The organs stay different, with different
epistemic roles. ⭐ It means there is **one place where they become a coherent present
awareness** — and one place where self-location is computed.

⭐ This **generalizes** the Lane 1 accounting law (§4.3 of the Lane 1 record) from A6
alone to every organ: *self-location is computed from the final composition, never
maintained by individual carriers.* ⭐ The same reasoning that stops Lane 1 making A6 lie
stops every later lane doing it.

---

## 5. Lane sequence

```
0A  A6 LIVE MEMBER FALSIFIER
    truthful self-location, member-facing
    ⛔ NO RELOAD DURING THIS TEST — a reload makes SRD-01 a confounder
         ↓  gate: does truthful aperture reach the member-facing path?

0B  SRD-01 · SESSION RE-ENTRY INTEGRITY
         ↓  gate: do member and MAIA inhabit the same temporal reality?
            defeated → close the finding
            confirmed → bounded repair act (separate authority)

0C  DEEP-CONTINUITY-CARRIER-01
         ↓  gate: one constitutional carrier across FAST / CORE / DEEP

1   CURRENT-SESSION RECOVERY
         ↓  gate: can displaced material return by relevance?

2   EPISTEMIC STANDING
         ↓  gate: Correction Test

3   PROTECTED SIGNIFICANCE
         ↓  gate: can important material survive recency pressure?

4   SPIRAL IDENTITY
         ↓  gate: Recurrence Test

5   ELEMENTAL MOVEMENT
         ↓  gate: anti-typing + Freedom Test

6   DERIVED CONTINUITY / SUMMARIES
         ↓  gate: Descent Test

7   RELATIONAL CONTINUITY
         ↓  gate: rupture / correction / shared-history fidelity

8   CROSS-SPIRAL DEVELOPMENTAL RECOGNITION
         ↓  final capability witness

    "We've been here before, but not quite like this."
```

### 5.1 Lane 0A — stop condition, stated as law

⛔⛔ **No reload may occur during the A6 member falsifier.** Stated as a stop condition
rather than a note, for the reason F1a carried guards G3–G5: *a confounder that is only
mentioned is a confounder that eventually runs.* A run containing a reload is void and
produces no evidence, in either direction.

### 5.2 Lane 0B — the witness captures four states, not the SQL

```
durable transcript                  conversation_turns for the session
member UI BEFORE reload
member UI AFTER reload
MAIA server-side working history    what getConversationHistory actually returned
```

⭐ Proving the `ORDER BY` is not the point — the ordering is already established by
reading. **The witness exists to turn the relational divergence into observed evidence
rather than an inferred chain**, which requires a session past 100 turns and an actual
reload.

### 5.3 `DEEP-CONTINUITY-CARRIER-01` — deliberately narrow

**Purpose:** establish a constitutionally equivalent carrier into **primary DEEP
cognition**, so future continuity representations do not require tier-specific
exceptions.

⛔ **It does not reopen A6.** A6 remains correctly accepted for FAST + CORE, because
that was the evidence available and the explicitly delivered surface.

**Acceptance test — LC-22 applied to tier architecture:**

```
given the same bounded continuity representation

FAST         receives  representation + provenance + standing + guard
CORE         receives  representation + provenance + standing + guard
DEEP primary receives  representation + provenance + standing + guard

and no tier silently loses any constitutional component.
```

⚠️ **The failure mode this test must resist:** the cheap way to pass it is to widen a
type until DEEP *can* receive four components, without proving any of them arrive. The
assertion must be on **what primary DEEP cognition actually received**, the way `F1c`
asserted through a real `getMaiaResponse` rather than through the context object.

---

## 5a. `MEMORY-ORGANISM-CENSUS-01` — read-only, precedes the lanes

⛔ **NAMED, NOT OPENED.** ⭐ **Read-only census / orchestration act**, ⛔ never an
implementation act. For every memory carrier, establish:

```
what does it store?           what is its epistemic role?
who writes it?                who reads it?
LIVE / PARTIAL / DORMANT / UNREACHABLE?
what TRIGGERS retrieval?      does it reach FAST / CORE / DEEP?
what PROVENANCE survives?     what STANDING survives?
```

⛔ No implementation.

⭐⭐ **This census answers a blind spot the programme has already hit.** ACT 2 censused
**continuity CLASSES** and marked C1 evidentiary *"sound as-is"* — and the Lane 1 defect
lives inside C1, because the class was sound while its displaced region had no carrier
(Lane 1 record §3a.2). ⭐ **A class census cannot see a carrier gap.** This census is
carrier-first, which is the missing pass.

### 5a.1 ⛔⛔ THE ORGANISM IS A PROGRAMME LAYER, NEVER AN IMPLEMENTATION LANE

```
JARVIS-MAIA-LONGITUDINAL-CONTINUITY-01
        ↓
memory-organism integration principle  (§2a)   ← programme layer
        ↓
0B · 0C · L1 · L2 · L3 · L4 · L5 · L6 · L7 · L8  ← where implementation happens
```

⭐ **New programme-level integration + census: YES.**
⛔⛔ **New broad implementation lane called "memory organism": NO.**

⛔ Do not open a lane that codes across everything. It would be too broad and would
**blur precisely the boundaries this programme exists to preserve.** Implementation
happens through the **bounded existing lanes, one organ or circulation problem at a
time.**

⭐ The principle (§2a), the organ contract (§4a) and the composition point (§4b) are
**constraints every lane inherits** — ⛔ they are not work items of their own.

---

## 6a. ⭐ ORGANISM-LEVEL ACCEPTANCE — beyond per-lane tests

⚠️ Per-lane falsifiers prove a lane. ⛔ They do not prove the organism. A final suite
must exercise the organs **together**:

> The member says *"silver cedar"* today. **Six weeks later** they discuss rootedness
> **without naming it.** MAIA can recover the earlier episode · know it was **the
> member's language, not hers** · recognize the developmental relationship **without
> declaring a fixed trait** · distinguish any later corrections · and bring it forward
> **only if it is relevant now.**

⭐ Every clause is a different organ, and the test fails if any one of them is missing —
which is what makes it an organism test rather than a longer lane test.

---

## 6. The four acceptance tests

Governing every phase:

| Test | Question |
| --- | --- |
| **Correction** | Can the member's later correction alter the standing of an earlier interpretation? |
| **Descent** | Can MAIA move from an abstraction back toward the primary evidence that produced it? |
| **Recurrence** | Can she distinguish *this happened again* from *we returned to the same territory differently*? |
| **Freedom** | Can present evidence genuinely overturn accumulated history? |

> A spiral may reveal where someone has been. It may never decide where they are
> allowed to go.

Two governing rules that follow:

- ⭐ **A corrected interpretation reaches cognition with its correction, or not at all.**
  This is what prevents better memory from making old mistakes more persistent.
- ⭐ The retrieval unit is **representation + source/provenance + current standing +
  applicable guard** — never raw text, never a free-floating "memory".
- ⭐ Summaries are **indexes into history, never replacements for history**, and must
  always be capable of descent toward source.

---

## 7. Standing

```
PROGRAMME                          ✅ AUTHORIZED (orchestration only)
first durable record               ✅ THIS FILE

AIN-CONTEXT-01                     predecessor · census + constitution
A6                                 ✅ ACCEPTED (FAST + CORE) · ✅ CANONICAL @ 286e4381
A6 DEEP primary                    ⛔ NOT DELIVERED · measured · routed out

MEMORY-ORGANISM-CENSUS-01          ⛔ NAMED, NOT OPENED (read-only act)
broad "memory organism" impl lane  ⛔⛔ REFUSED BY CONSTRUCTION — §5a.1
organ contract                     ⛔ NOT ESTABLISHED (L2's work)
single composition point           ⛔ NOT BUILT
organism-level acceptance suite    ⛔ NOT AUTHORED

0A  A6 member falsifier            ⛔ NOT RUN  (founder-run; no reload)
0B  SRD-01 witness                 ⛔ NOT RUN  · finding ENTAILED, not witnessed
0C  DEEP carrier                   ⛔ NOT OPENED
L1  current-session recovery       ⛔ NOT OPENED · falsifiers pinned
L2–L8                              ⛔ NOT OPENED

runtime changes                    ⛔ NOT AUTHORIZED
schema / migrations                ⛔ NOT AUTHORIZED
retrieval / summaries              ⛔ NOT AUTHORIZED
Spiralogic persistence             ⛔ NOT AUTHORIZED
prompt changes                     ⛔ NOT AUTHORIZED
DEEP changes                       ⛔ NOT AUTHORIZED
production deployment              ⛔ NOT AUTHORIZED
```

### 7.0 ⭐ RESUMPTION ORDER — where to pick up

```
1.  FRESH 0A RUN
    close the member witness on what is already shipped
    ⭐ cheapest act; ⛔ should not hang while new architecture opens

2.  MEMORY-ORGANISM-CENSUS-01        read-only · carrier-first
    find every OTHER place where a sound class has unreachable territory,
    dormant readers, wrong temporal scope, or tier-specific disappearance

3.  L1 · CURRENT-SESSION-RECOVERY-01
    ⛔ not because L1 needs redesign — the defect and falsifiers are sharp
    ⭐ because its opening custody should INHERIT whatever the census finds
       about composition, provenance or reachability
```

> ⭐⭐ **Finish the proof of the thing already shipped; then inspect carrier
> reachability across the organism before changing it.**

⛔ **Do not open L1 and the census simultaneously.** The census is cheap and may prevent
L1 from solving one visible hole while reproducing an unseen one beside it.

### 7.0.1 ⛔⛔ THE SEQUENCING TRAP — L1 LOOKS READY AND IS NOT NEXT

⚠️ **0B and 0C precede L1 in the roadmap (§5).** L1 carries four falsifiers, a design
sketch and six prohibitions; 0B and 0C carry far less. ⛔ **A session resuming cold will
read that asymmetry as readiness and start L1.**

⭐ **Opening L1 ahead of 0B and 0C is a SEQUENCING RULING — a founder act — never an
inference from how complete the records look.** ⛔ Specification depth is not priority.

⭐ The census (step 2) is **sequence-neutral**: it disturbs neither 0B nor 0C and can run
without any ruling on what follows it.

---

### 7.1 ⚠️ Owed, and deliberately not folded into this record

> ✅ **DISCHARGED 2026-09-15 (evening)** by founder-authorized record-only act — see
> `AIN-CONTEXT-01_CHARTER_2026-09-15.md` **§A · DATED STATUS CORRECTION**. The three stale
> standing lines are marked `⛔ SUPERSEDED` **in place**, never rewritten, and the
> DEPLOY / CANONICAL / VALIDITY distinction below is carried verbatim into §A.3.

The `AIN-CONTEXT-01` charter still carries `production A6 ⛔ NOT PRESENT`, which is now
false. Its correction is a **separate record-only act**, because the fact it must state
is a distinction this programme depends on and must not blur:

```
DEPLOY EVENT      branch SHA c8770709c → production
CANONICAL EVENT   b22945ac + accepted subject 9ac0730d → canonical 286e4381
VALIDITY BRIDGE   four A6 runtime blobs verified byte-identical
```

⭐ **Deployment provenance and canonical provenance are independent.** `c8770709c`
reached production directly from the A6 branch, **before** the accepted subject was
landed in canonical. ⛔ The later canonical landing does not retroactively become the
authority for that deploy. The live member falsifier is valid because the four runtime
blobs were independently verified byte-identical — **not** because the two events are
treated as one.

⚠️ And the bridge holds only at the strength it claims: byte-identity of the **four A6
runtime files** is WITNESSED; equivalence of the **serving path around them** is
ENTAILED. Production sits on an older base than `9ac0730d` (33 commits, none touching
A6's files). ⛔ Do not widen this to *"production runs the accepted subject."*
