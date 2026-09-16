# MAIA Temporal Relational Memory Programme

**Date:** 2026-09-16  
**Status:** ⭐ PROGRAMME DIRECTION SELECTED · implementation remains lane-governed  
**Authority:** founder delegated architecture choice for the temporal-memory programme on 2026-09-16. This record chooses the architectural direction and sequence. It does **not** itself authorize migrations, merges, deploys, or behavioural changes.

**Inherits without revising:**
- `TEMPORAL_MEMORY_DIRECTION_2026-09-06.md` — FROZEN Cat 1
- `MAIA_RELATIONAL_MEMORY_ARCHITECTURE_DIRECTION_2026-08-04.md` — preserved founder direction
- `MAIA_CONVERSATION_CHAPTERS_DESIGN_2026-07-17.md`
- `MARK_TO_RESURFACING_TRACE_2026-07-29.md`
- the ratified laws and measured findings of `TEMPORAL-MEMORY-RECONCILIATION-01`

This programme is an additive convergence record. Where an inherited record is frozen, this document cites and sequences it; it does not edit it into agreement after the fact.

---

# 0. North star

> **History preserved. Present meaning derived. Continuity without captivity.**

MAIA is not being built to remember more things about a person. It is being built to **remain in relationship across time without taking ownership of the person's meaning.**

For members who return often, go deep, and remain in relationship with MAIA over months or years, continuity must become more skillful as history grows — not more deterministic.

The mature system should be able to hold, at the same time:

- what happened;
- who said or inferred it;
- when it happened;
- when a state was true;
- what the member later corrected, withdrew, confirmed, or replaced;
- what remains unresolved;
- which themes recur without being declared identities;
- which memories are relevant to this encounter;
- why something came forward;
- and what MAIA still does not know.

The governing paradox from the Relational Memory direction remains intact:

> **MAIA should become more specific about a person while becoming more humble about what she knows.**

---

# 1. The architectural choice

The selected direction is **Temporal Relational Memory (TRM)**.

It is not:
- a larger vector store;
- an endless transcript;
- a persona summary overwritten in place;
- a recency heuristic promoted to truth;
- a graph whose inferred edges silently become member facts;
- or a model-generated biography that becomes more authoritative as it accumulates.

TRM separates four things current memory systems often collapse:

```text
EVIDENCE       what was actually said / marked / observed
STATE          what was valid or current, under whose authority, and when
RELATION       how memories, events, assertions and encounters stand to one another
CONFIGURATION  what matters in this encounter, reconstructed now
```

The first three can have durable carriers. The fourth is generally encounter-dependent and should usually be reconstructed, not fossilized.

---

# 2. Temporal powers stay separate

The ratified temporal law is elevated here as programme architecture:

```text
VALIDITY      Is this assertion still valid/current?
AVAILABILITY  Can this valid memory reach cognition?
SALIENCE      How strongly should an available memory compete now?
```

No scalar owns more than one of those powers merely because it is numerically convenient.

Additional temporal distinctions are also first-class:

```text
occurred_at      when an event happened
recorded_at      when MAIA learned/recorded it
effective_at     when a ratified change became true
valid_from       when an assertion became valid
currentness      derived relation to the present, not a synonym for recency
review_age       how long since a state-like claim was confirmed
```

Where the existing Temporal Memory direction distinguishes episode time from assertion validity, TRM preserves that separation as a hard architectural boundary.

---

# 3. The durable substrate

## 3.1 Evidence ledger — history is not rewritten into agreement

Raw/member-grounded evidence is append-oriented and provenance-bearing.

Examples:
- conversation turns;
- member-marked episodic moments;
- member-kept atoms;
- explicit preference statements;
- correction / confirmation / withdrawal acts;
- practitioner observations with their distinct origin;
- system inferences, visibly marked as derived.

A later truth does not retroactively make an earlier historical utterance disappear. A member-directed deletion/removal request is different from supersession and remains sovereign.

## 3.2 Episodes — what happened

Episodes represent bounded happenings, encounters, or member-marked moments. Their core temporal question is **when did this occur?**

Conversation chapters organize encounters without dividing the relationship:

> A conversation may close. The relationship does not.

Episodes never inherit a validity interval merely because an assertion can be extracted from them.

## 3.3 Temporal assertions — what was/is true

State-like claims live separately from episodes.

An assertion carries:
- proposition / typed claim;
- provenance;
- origin / authorship / authority;
- `valid_from` or effective boundary where known;
- source episode(s) / turns;
- no authoritative predecessor mutation.

The authoritative succession direction is carried by the successor:

```text
successor.supersedes → predecessor
```

`superseded_by`, predecessor `valid_to`, and `current` are derived read-model relations.

## 3.4 Transitions — what changed

Temporal change is an event with authority, not an edit convenience.

Minimum dispositions inherited from the frozen direction:

```text
opened
replaced
ended
confirmed_still_true
```

A transition preserves `effective_at` separately from `recorded_at`, and preserves the member act that gives a state change authority.

## 3.5 Typed relations — difference is information

Relations are typed, not collapsed into one similarity score.

Candidate relation families, admitted only through their own governed acts:

```text
TEMPORAL       BEFORE · AFTER · OVERLAPS · SAME_EPISODE
REFERENCE      REFERS_TO · EVOKES · ANSWERS · CORRECTS
SUCCESSION     SUPERSEDES · ENDS · CONFIRMS
PROVENANCE     STATED_BY · INFERRED_BY · DERIVED_FROM · MARKED_BY
DEVELOPMENTAL  RECURS_IN · CONTRASTS_WITH · POSSIBLY_RELATED_TO
MEMBER ACT     WITHDRAWN_BY · ACCEPTED_BY · DECLINED_BY
```

This list is a programme map, **not a schema authorization**. Each durable relation must earn its admissibility. A nameable relation is not automatically a lawful stored relation.

Attentional relations such as `SALIENT`, `FOREGROUNDED`, `ACCESSIBLE`, and `COMPETING_REFERENT` describe the present encounter and should ordinarily be reconstructed at retrieval time rather than persisted as timeless facts.

## 3.6 Derived present-state projections — convenience without custody transfer

Current preference/profile/state views are projections over evidence + assertions + transitions.

They may be cached or materialized for performance, but:

> **If destroying and rebuilding a projection from sovereign sources loses information, the projection had already acquired authority.**

A projection never becomes the sole carrier of a member's history.

---

# 4. Encounter-time memory is a configuration problem

Long-horizon memory retrieval should eventually answer a different question from the current top-12 ranking:

> **What aspect of this person's unfolding is this moment inviting us to remember?**

But that question contains inference and must be governed by humility.

The eventual encounter configuration is therefore staged:

```text
sovereignty / Sanctuary / consent
        ↓
provenance + authority eligibility
        ↓
temporal state resolution
        ↓
reference / discourse accessibility
        ↓
episode + relational relevance
        ↓
semantic relevance
        ↓
bounded salience / temporal weighting
        ↓
compact memory participation
        ↓
MAIA — one voice
```

This is a programme target, **not authorization to replace the current scorer**. The current Cut-1 traceability lane comes first precisely so later behavioural change can be judged against durable historical evidence.

---

# 5. Memory influence must be governable

More memory is not always better memory.

A deeply personalized agent can become trapped by history: old patterns can overdetermine interpretation, and accumulated context can turn continuity into an echo chamber. MAIA's answer is not amnesia; it is **governed influence**.

Long-horizon design therefore preserves distinct member powers:

```text
KEEP / MARK          this matters; preserve it
WITHDRAW / REMOVE    I no longer consent to holding this
ARCHIVE              preserve, but remove from ordinary recall
SANCTUARY            do not persist this encounter
RETURN PREFERENCE    whether / how a kept memory may come back
FRESHNESS            present encounter may require less historical influence
```

`FRESHNESS` here is a programme concept, not a UI or schema decision. Its purpose is to prevent historical memory from becoming identity capture. Any future implementation must be member-legible and must not rewrite the underlying history merely because its influence is reduced.

---

# 6. Developmental continuity without identity capture

The inherited four-layer relational model remains useful:

```text
Biography  — what happened?                         source record
Pattern    — what tends to recur?                   MAIA may notice
Meaning    — what does it mean to this person?      member owns significance
Becoming   — what is emerging / changing?           invitation form only
```

TRM adds the temporal discipline those layers need.

A recurring pattern is not a trait merely because it appears repeatedly. A historical state is not current merely because it was once explicit. A correction does not erase the earlier state. A present invitation must not harden into a profile without member authority.

The desired developmental memory is therefore not:

```text
past observations → increasingly confident persona
```

It is:

```text
past evidence
  + temporal succession
  + recurrence / counterevidence
  + member responses
  + current encounter
  → a provisional, explainable relational configuration
```

The better the continuity becomes, the more visible uncertainty and change should become too.

---

# 7. Consolidation is derived and reversible

Long relationships need compression. Raw history cannot be injected forever.

Consolidation is permitted only as a **derived layer** with source support and counterevidence still reachable.

A consolidated pattern or developmental thread must be able to answer:

```text
what evidence supports this?
what evidence contradicts it?
when did it first appear?
when was it last supported?
has the member accepted / corrected / declined this framing?
is it current, historical, unresolved, or unmeasured?
```

No consolidation process may silently mutate source evidence into a stronger authority class.

---

# 8. Memory decision accountability

A future MAIA that can remember deeply must also know **what it did with memory**.

The target observability ladder is:

```text
available
retrieved
eligible
held / offered / admitted / excluded
selected
injected
used / not used
member corrected / accepted / declined
```

Not every state belongs in one table and not every state is durable. But every consequential boundary should be explainable from authoritative evidence.

`TEMPORAL-MEMORY-CUT1-TRACEABILITY-01` is the first narrow implementation of this principle at the live temporal availability boundary.

---

# 9. The build sequence

This programme deliberately does **not** authorize a monolithic memory rewrite.

## T0 — Cut-1 historical traceability — NOW

Lane: `TEMPORAL-MEMORY-CUT1-TRACEABILITY-01`

Goal: establish durable, per-turn evidence of decay-caused Cut-1 exclusion with zero behavioural change.

Why first: no future ranking or availability reconciliation is measurable without it.

## T1 — Referential / discourse relation evidence — parallel research, separate authority

Inputs: `ANTECEDENT-IDENTITY-01` and later `RELATIONAL-DISCOURSE-MEMORY-01`.

Goal: establish what lawful evidence supports relations such as `REFERS_TO` when lexical identity is absent. This programme does not reopen or absorb those lanes.

## T2 — Temporal assertion + transition substrate

Inherits the frozen Temporal Memory Decisions 1–3.

Goal: separate episodes from state-like assertions; introduce append-oriented, authority-bearing transitions; derive current/superseded/unmeasured without predecessor mutation.

Gate: schema/spec authority and production witnesses. No inference may close validity on its own.

## T3 — Episode / chapter / source binding

Goal: strengthen the links among conversation chapters, marked moments, turns, and assertion provenance so long-horizon continuity can navigate *where a memory came from*, not merely retrieve its text.

Existing chapter and mark records are inputs; they are not rewritten as if designed for TRM.

## T4 — Encounter-time relational retrieval

Only after T0–T3 supply traceability and lawful temporal/reference structure.

Goal: let present-message relevance, discourse accessibility, episode relation, semantic relevance and bounded temporal salience participate without collapsing validity or authority into ranking.

This is where the current Cut-1 scorer may eventually be reconciled. It stays unopened until traceability exists in production.

## T5 — Developmental consolidation

Goal: compress recurring evidence into provisional patterns/threads with provenance, counterevidence, temporal support, and member authority visible.

No personality capture; no irreversible persona synthesis.

## T6 — Member control over memory influence

Goal: member-legible controls for retention, return, archival, deletion, and bounded historical influence without falsifying the record.

## T7 — Long-horizon continuity evaluation

The system is not accepted because retrieval metrics improve. It must survive longitudinal relational tests.

---

# 10. Acceptance programme — what “best temporal memory” must prove

A long-horizon MAIA should be evaluated against at least these classes:

### Historical fidelity
Can MAIA accurately recover what was said / marked / believed at an earlier time without rewriting it through present knowledge?

### State succession
Can MAIA distinguish what used to be true, what replaced it, what ended without replacement, and what is simply unmeasured now?

### First-ask reference
Can MAIA recover a relevant prior referent through lawful relational evidence when the member does not restate the original words?

### Correction integrity
Can a member correct MAIA once, with the correction affecting present state while the prior historical evidence remains accurately attributable?

### Counterevidence
Can recurring-pattern memory preserve contradiction and novelty instead of training MAIA into an echo chamber?

### Relationship trajectory
Can MAIA recognize recurrence, change, return, rupture/repair, commitments, unresolved questions, and long arcs without diagnosing or fixing identity?

### Memory restraint
Can MAIA refrain from surfacing a true memory when it is irrelevant, overdetermining, outside consent, Sanctuary-bound, or likely to anchor the encounter unnecessarily?

### Transparency
Can the system answer why a memory came forward, what source supported it, what temporal state it held, and what uncertainty remains?

### Forgetting / withdrawal
Can member-directed removal truly remove authority/possession where promised, without confusing deletion with supersession or salience reduction?

### Long-term humility
Does increased history make MAIA more precise **and** less likely to overclaim who the member is?

---

# 11. Relationship to current research

Current long-horizon memory research increasingly supports several structural choices already present in MAIA's direction:

- append-only temporal history plus query-time resolution of evolving information;
- event/relationship structure rather than flat isolated memories;
- temporal hierarchy and consolidation for long histories;
- distinguishing occurrence time from dialogue/recording time;
- explicit concern about memory anchoring and over-reliance in personalized agents.

Relevant primary references reviewed for this programme include:

- Banerjee et al., **APEX-MEM: Agentic Semi-Structured Memory with Temporal Reasoning for Long-Term Conversational AI**, ACL 2026.
- Xu et al., **StructMem: Structured Memory for Long-Horizon Behavior in LLMs**, ACL 2026.
- Li et al., **TiMem: Temporal-Hierarchical Memory Consolidation for Long-Horizon Conversational Agents**, Findings of ACL 2026.
- Su et al., **Beyond Dialogue Time: Temporal Semantic Memory for Personalized LLM Agents**, 2026.
- Rasmussen et al., **Zep: A Temporal Knowledge Graph Architecture for Agent Memory**, 2025.
- Huang et al., **Controllable Memory Usage: Balancing Anchoring and Innovation in Long-Term Human–Agent Interaction**, ACL 2026.
- Chao et al., **STALE: Can LLM Agents Know When Their Memories Are No Longer Valid?**, 2026.

These sources are **prior art and pressure tests, not authority over MAIA**. MAIA's stronger requirements around member authority, provenance, Sanctuary, refusal, and single-voice relational presence remain programme constraints even where external systems optimize for different goals.

---

# 12. What is deliberately not decided here

This programme does not choose:
- a graph database;
- a vector database replacement;
- a universal relation ontology;
- an LLM-generated automatic truth updater;
- a new scorer;
- a migration for the temporal assertion layer;
- a member UI for memory influence;
- a model provider;
- or an automatic psychological/developmental taxonomy.

Those decisions are downstream of evidence and receive their own authority.

---

# 13. Standing

```text
architecture direction ............... ⭐ TEMPORAL RELATIONAL MEMORY SELECTED
frozen Temporal Memory direction ..... ✅ INHERITED · NOT REVISED
founder Relational Memory direction .. ✅ INHERITED · NOT REVISED
history preservation ................. ✅ GOVERNING
present state ......................... DERIVED, NOT HISTORICALLY OVERWRITTEN
validity / availability / salience .... ✅ SEPARATE POWERS
member meaning authority .............. ✅ GOVERNING
single MAIA voice ..................... ✅ GOVERNING
memory influence / anchoring .......... ⭐ PROGRAMME REQUIREMENT
T0 Cut-1 traceability ................. ⭐ ACTIVE
T1 discourse/reference research ....... SEPARATE EXISTING LANES
T2+ behavioural/schema work ........... ⛔ REQUIRES ITS OWN AUTHORITY
scorer redesign ....................... ⛔ UNOPENED
production ............................ UNTOUCHED BY THIS RECORD
```

## Programme sentence

> **The goal is not that MAIA remembers more of a person's past. The goal is that, across a long relationship, MAIA can hold history, change, uncertainty, consent and present relevance together well enough to accompany the person without imprisoning them inside what she remembers.**
