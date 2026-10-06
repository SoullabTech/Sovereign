# JARVIS-WS-RD-RECOVERY-01 · R8M — MAIA Editorial/Relational Model Qualification + Governed Council
## Founder-opened bounded recovery lane · 2026-10-06

**Founder direction:** use both strategies:
1. change the model when another model demonstrably fits the faculty better;
2. use a governed model council where independent review materially improves trust.

**Standing:** OPEN · R&D / QUALIFICATION ONLY
**Does not authorize:** broad Writer's Studio propagation, silent externalization, automatic external fallback, model-derived authority, or a multi-model chorus speaking directly to the writer.

## 1. Governing principle

> **MAIA is not a model. A model is a cognitive engine inside MAIA.**

MAIA's identity and authority come from:
- constitutional law;
- lawful context;
- relationship continuity;
- writer-established meaning;
- evidence provenance;
- intervention governance;
- memory and custody;
- the writer's own acts.

A model is admitted only for faculties it demonstrates.

If a model cannot meet the Writer's Studio bar, **the bar does not move**.

## 2. Qualification order

### M1 — Lawful context first

No model comparison is valid until every candidate receives the same lawful Chapter Conversation Context.

R8M context v1 separates:

- **current chapter reading** — frozen observations from the explicit chapter read;
- **book structure** — current authored structural facts;
- **prior book reading** — current chapter-scale Overview readings across the book;
- **writer-established context** — intention, preservation laws, ontology, voice, open questions;
- **conversation history** — writer clarifications and MAIA replies;
- **current locus** — where the writer is now.

The prompt must preserve the distinction:

```text
I know this from the chapter reading.
The authored structure shows this.
Earlier book readings suggest this.
The writer established this.
I do not currently know this.
```

No model may win by pretending it has read what the packet does not contain.

### M2 — Identical local qualification

Initial local candidates:

- `qwen3-coder:30b`
- `qwen3:32b`
- `gpt-oss:20b`
- `maia-content:latest`

Each receives:
- the same context packet;
- the same Witness / Intimate / Plain first turn;
- the same writer clarification on turn two;
- the same output budget and context ceiling.

Outputs are blinded for human adjudication before model identities are opened.

### M3 — Strong reference comparison

After the local blind round, the same fixed packet may be run through a strong reference model under existing provider/disclosure authority.

The reference is a calibration instrument, **not an automatic production dependency** and never a silent fallback.

### M4 — Faculty admission, not one global winner

Qualification evaluates at least:

1. whole-book gestalt;
2. chapter-role awareness;
3. relational attunement;
4. causal use of writer clarification;
5. Witness restraint;
6. Guide usefulness;
7. Collaborator generativity;
8. voice / ontology fidelity;
9. ceremonial-vs-redundant repetition discernment;
10. minimal-intervention judgment;
11. long-context retention;
12. epistemic honesty;
13. Plain register;
14. Expert / technical register;
15. latency and operational reliability.

Possible outcome:

```text
model A  → relational conversation
model B  → long-form editorial reading
model C  → structured extraction / schema work
model D  → independent challenger
```

No requirement says one model must win every faculty.

## 3. Governed model council

The council reuses the existing JARVIS routing constitution rather than creating a second routing law.

Inherited JARVIS principles:

- routing selects capability; it never widens authority;
- a retry is not an independent second opinion;
- model family is selected before transport;
- model agreement is evidence only;
- disagreement may not be resolved by a model awarding itself victory;
- external execution requires its own authority;
- every attempt retains provenance.

### 3.1 One speaking MAIA

The writer should experience **one coherent MAIA relationship**, not a panel of competing bots.

For a normal conversational turn:
- one qualified primary model speaks;
- relationship history stays continuous;
- no council is invoked merely because it exists.

### 3.2 Council only when the burden earns it

Council review is appropriate for cases such as:

- whole-book developmental conclusions;
- major structural change;
- substantial recast / intervention;
- ambiguous voice-preservation tradeoffs;
- quotation / lineage / factual risk;
- high-value uncertain editorial claims;
- explicit writer request for another reading;
- qualification / R&D.

Council is ordinarily unnecessary for:
- simple reflection;
- ordinary clarification;
- low-risk local copy edit;
- one small reversible wording option.

### 3.3 Primary + independent challenger

A council act uses:
- one **primary** qualified for the faculty;
- one genuinely independent **challenger** qualified for that faculty.

The challenger sees the same bounded evidence packet.

A second call to the same model is a retry, not a council.

### 3.4 Disagreement

If primary and challenger disagree materially:

- the system records the disagreement;
- MAIA does not silently average them;
- no model chooses the semantic winner;
- the writer may be shown the real tradeoff in humane language;
- where writer authority is required, the writer decides.

### 3.5 Council output is not a second personality

The council produces governed evidence for MAIA.

It does not create:
- four voices in the sidebar;
- automatic consensus prose;
- a majority vote over the writer;
- hidden model competition on every turn.

## 4. R8M qualification fixture

**Work:** Elemental Alchemy
**Subject:** Chapter 10 — The Living Spiral
**Current structural fact:** final numbered chapter before Conclusion
**Writer-established law:** intentional spiral return is to be preserved; repetition should be challenged only where it fails to earn a deeper return.

### Turn 1 — Witness / Intimate / Plain

The candidate must:
- recognize what is carrying the chapter;
- use actual book position/context;
- ask one genuine unresolved question;
- avoid asking whether already-declared intentional repetition was intentional;
- avoid a report/checklist;
- avoid prescribing change.

### Turn 2 — causal clarification

Writer clarification:

> The recurrence is intentional. I want the elements to return as living movements, almost ceremonially, because a spiral returns without returning to exactly the same place. What I care about is not eliminating repetition. I want to know where the return deepens the reader's experience and where it merely repeats explanation.

The candidate must:
- visibly update its working understanding;
- distinguish ceremonial return from redundant explanation;
- not repeat the original concern unchanged;
- stay within Witness unless further intervention is invited.

## 5. Admission states

Each candidate/faculty receives one standing:

- **ADMITTED** — demonstrated and founder/human witnessed;
- **ADMITTED_WITH_CHALLENGER** — usable, but high-value acts require independent review;
- **SPECIALIST_ONLY** — useful for bounded faculties, not relational/editorial primary;
- **HOLD** — promising but insufficient evidence;
- **REJECTED_FOR_FACULTY** — does not meet the bar.

These are capability standings, not statements about the model's general intelligence.

## 6. Existing implementation evidence

The current failure on localhost does **not** count against Qwen's faculty standing because the product explicitly restricted that turn to one frozen observation and told the model it did not have the manuscript.

That failure is assigned to context architecture.

Qwen's Writer's Studio relational/editorial standing therefore remains:

> **UNQUALIFIED — NOT FAILED, NOT ADMITTED.**

## 7. Current instruments

Read-only context builder:

`scripts/writers-studio/r8m-build-chapter-context.ts`

Context contract:

`lib/writersStudio/qualification/chapterConversationContext.ts`

Local blind qualification harness:

`scripts/writers-studio/r8m-qualify-local-models.ts`

Default output:

`/tmp/r8m-model-qualification/`

The model mapping is written separately from the blind outputs.

## 8. Stop law

Do not wire a new Writer's Studio primary model merely because one blind response looks good.

Before production/model-routing change:

1. complete the blind local round;
2. adjudicate outputs against the R8M rubric;
3. run a strong reference calibration where lawful;
4. record faculty standings;
5. design the bounded council route from those standings;
6. rerun the live Chapter 10 golden journey;
7. obtain founder experiential PASS.

Only then may the relational/editorial primary change or the governed council enter Writer's Studio runtime.
