# MAIA-UNIFIED-COGNITION-CONVERGENCE-01

```text
LANE       MAIA-UNIFIED-COGNITION-CONVERGENCE-01
BASE       clean-main-no-secrets @ d5741ce6c
BRANCH     claude/maia-unified-cognition-convergence-01
OPENED     2026-09-04 · founder authorization
PREREQ     MEMORY-PRODUCER-PARTITION-01 canonical ✅
           MAIA-WHOLE-ORGANISM-CENSUS-01 closed, Gate 2 MET, Gate 3 D → C′ ✅
STATE      DEFINITION RECORDED · NO CODE WRITTEN · FIRST CUT NOT YET AUTHORIZED
```

## 1. Governing law

> **Do not build another intelligence. Make the intelligences MAIA already computes
> participate through the convergence point she already has.**

## 2. Why this lane exists before P6

The census changed the dependency. Provenance cannot land on fragmented cognition.

```text
BEFORE   memory → truthful provenance → unified intelligence
AFTER    memory → SHARED PARTICIPATION SEAM → truthful provenance → unified intelligence
```

The two facts that make this lane small rather than large, both established at
`d5741ce6c` and recorded in `MAIA_WHOLE_ORGANISM_CENSUS_01.md`:

1. **The convergence point already exists.** `/list` and `/between/chat` both reach
   `getMaiaResponse()` — `/between` via `maiaOrchestrator.generateMaiaTurn`
   (`lib/consciousness/maiaOrchestrator.ts:480`).
2. **The orientation already exists and is dropped.** `computeFacetDecision`
   (`lib/consciousness/FacetDecisionLoop.ts:201`) produces `activeFacet`, `posture`,
   `integrityFlags`, `languageHints`, `handoff`, `regulation` — the *Spiralogic circulatory
   governor* — and hands it into `getMaiaResponse` at `maiaOrchestrator.ts:525`, where
   `facetDecision`, `activeFacet`, `integrityFlags` and `languageHints` are read **zero
   times** in `maiaService.ts` and `maiaVoice.ts`.

## 3. Gate 3 ruling this lane implements

```text
D   reuse the existing convergence point (getMaiaResponse)
    reuse FacetDecisionLoop
    reuse ranked MemoryBundle selection
    make existing structured orientation actually participate

C′  establish ONE shared participation contract across FAST / CORE / DEEP
    WITHOUT requiring one identical prompt builder
```

`FacetDecisionLoop` is not by itself MAIA's unified intelligence. Relational,
developmental, symbolic, provenance and eventually field intelligence still need a truthful
common participation contract. **A pile of addenda must not be replaced by one governor
owning everything.**

## 4. First cut — the smallest embodiment of D

```text
/list            produces the same structured orientation contract
/between         continues producing it
getMaiaResponse  actually consumes the contract
FAST/CORE/DEEP   receive the same governing orientation
                 while preserving legitimate tier-specific cognition
```

Then C′: shared participation membership across tiers — without P6 attribution framing and
without M3 authority.

## 5. Explicitly out of scope

```text
no new Elemental engine
no new Conductor
no Epistemic Tone redesign
no P6 attribution framing
no M3
no /between rewrite
no Resonant / Unified Field resurrection
no fixing every census defect
```

The census's thirteen findings (C-1 … C-13) are **a map, not a backlog**. A finding is
touched by this lane only if the first cut cannot be built without it, and then it is named
in this record before it is touched.

## 6. Standing constraints inherited

- **Runtime obligation returns here.** Gate 2 was met on source with runtime `UNWITNESSED`.
  That ceiling was acceptable for a map. This lane builds and will claim a live behavioural
  change, so it does **not** close on source evidence: it requires a production witness.
- **Sanctuary is absolute.** Any orientation contract must be empty on Sanctuary turns, and
  carry no content that a Sanctuary turn produced.
- **The witness privacy boundary holds unchanged**: passive shadow observation allowed;
  never enter another member's account, cause or request their turn, inspect atom content,
  retrieve content to verify shape, or target a member by identity. No member data is
  manufactured or modified to satisfy a witness.
- **Shadow before authority.** The census showed a shadow-first construction already works
  in this codebase (`lib/maia/canonical-turn/shadow.ts`). Consumption of the contract should
  be demonstrable as a no-op diff before it is permitted to change a response.
- **The three unresolved mixed producers** — `retrieved.member_web`,
  `retrieved.conversational_recall`, `member.episodic_recall` — remain excluded from any
  attribution-closure claim. This lane makes no attribution claim at all.

## 7. Open questions for the first cut, not decided here

1. Where does `/list` get a `FacetDecisionPacket` from — call `computeFacetDecision` in the
   route, or inside `getMaiaResponse` so both surfaces are served once?
2. Does the contract *replace* any existing addendum, or sit beside them in the first cut?
   (Census reading: beside, with zero-diff shadow, before anything is replaced.)
3. What does DEEP-primary do with the contract, given its local draft has no prompt seam by
   construction?
4. Does the ranked `MemoryBundle` reach CORE and DEEP in this cut, or is that a second cut?
   (Census: CORE and DEEP each carry an explicit annotation that they do not read it —
   changing that is a behavioural change, not a wiring fix.)

## 8. State

```text
DEFINITION       recorded
CODE             none written
FIRST CUT        NOT YET AUTHORIZED
P6               CLOSED until this prerequisite is built AND witnessed
```
