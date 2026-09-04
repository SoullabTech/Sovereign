# MEMORY-PRODUCER-PARTITION-01 — truthful producer identity before attribution

**Standing:** prerequisite to P6 proper. **Not P6.**
**Governing document:** `docs/programme/JARVIS_MEMORY_FIELD_FLOW_v2.md` (canonical @ `34cc4cad9`)
**Opened from:** canonical head `34cc4cad9`
**Founder ruling:** 2026-09-04 — Option 3 selected; template PASS with two mandatory amendments.

```text
FIND              COMPLETE
UNDERSTAND        COMPLETE
DECIDE            APPROVED WITH BOUNDARIES

LEGACY ADDENDA    FROZEN · byte/shape unchanged
CANONICAL SHADOW  MAY evolve structurally
MIPA MULTIPLICITY OUT OF SCOPE
M3                UNAUTHORIZED
P6 FRAMING        UNAUTHORIZED
```

---

## 0. Why this is a prerequisite and not the first step of P6

> **If the participant identity is false, no downstream attribution framer can make it true.**

`member.atoms` and `retrieved.member_web` prove it. A block containing multiple authorships cannot be repaired by attaching a better label to the outside. Attribution over a false identity is worse than the present ambiguity, because it converts an unstated assumption into an asserted claim.

---

## 1. What FIND and UNDERSTAND established

### 1.1 The renderer discards provenance; the boundary is not yet cognition

`Participant` carries `authoredBy` × `participationClass` × `authority`. `renderTurnForCognition` emits `participants.map((p) => p.text)` — the axes reach the manifest and the log, never the prompt. And the renderer has **zero live callers**: on `/list`, `constructCanonicalTurn` runs in shadow (route `:1247`, diff `:1277`) while the legacy addenda chain produces every response. M3 is unauthorized.

Consequence recorded in Flow v2 §7's own terms: `/list` is canonical **in construction and evidence**, not canonical **in cognition**.

### 1.2 pdc-1 and Epistemic Tone are not a one-to-one taxonomy

`authority` is the **first** discriminator, not a sufficient one. The three pdc-1 axes are independent by design; Epistemic Tone (`docs/canon/MAIA_EPISTEMIC_TONE_SPEC_v1.0.md`) is a narrower behavioural spec about memory-reference conduct, organised as Curated / Archive / Pattern / Present.

`member.divination_intent` is `member · authored · situate`. That does **not** license CURATED: that register is about member-*marked* significance, and `placed` ≠ `marked` ≠ `authored`. Likewise an explicit relational hand-off is member-owned without being marked as significant.

```text
PDC-1            WHO/WHAT supplied this material, and with what authority
EPISTEMIC TONE   HOW MAIA may speak when certain memory/inference is invoked
```

Two layers. Keep them separate. The Tone canon is **not** expanded by this cut, and not by P6 without its own adjudication.

### 1.3 The registry's mixed-authorship flag is unreliable

`partitionPending` flags three producers. The live `/list` census found **four** mixed producers — two of them unflagged, disclosed only in registry prose:

| producer | flagged | how the mixing enters |
|---|---|---|
| `member.episodic_recall` | ✓ | — |
| `retrieved.conversational_recall` | ✓ | — |
| `member.atoms` | **✗** | reason string: *"member-placed portfolio atoms **+ witnessed practitioner observations** (Layer 5)"* |
| `retrieved.member_web` | **✗** | reason string: *"patterns + summaries + journals"* — `activePatterns` system-detected, `summary` from `sovereignSummarizer` (MAIA), `recentJournal` member-written |

**`partitionPending` must stop being treated as the detector of truth.** It may remain useful migration metadata.

### 1.4 Live `/list` producer census — 16 producers

```text
TRUTHFULLY FRAMABLE TODAY (register exists, single-source)          4 / 16
  inferred.memory_influence · computed.forward_readiness
  member.relational_context · member.divination_intent

MIXED — PARTITION REQUIRED                                          4 / 16
  member.episodic_recall · retrieved.conversational_recall
  member.atoms · retrieved.member_web

NO TRUTHFUL REGISTER EXISTS (single-source, outside the four)       8 / 16
  computed.wuxing_snapshot · computed.astrology · computed.divination_cast
  house.place · house.divination_interpretation
  practitioner.studio · practitioner.practice_field
  collective.knowledge_gate
```

The register set is member/MAIA-bipolar: it has no cell for a third human voice, house corpus text, collective weighting, or a non-inferential computed fact. **This is not repaired here.** Those participants already have truthful identities in pdc-1; a pdc-native provenance envelope is P6's concern, not the Tone canon's.

---

## 2. Where partitioned material lives — FOUNDER RULING

**Do not reshape `legacyAddenda` in this cut.** That is P6/M3 seam work.

Two projections of the same already-loaded source records:

```text
same structured source records
        │
        ├── LEGACY PROJECTION            FROZEN for this cut
        │     exactly today's addendum string
        │     exactly today's meta key
        │     → getMaiaResponse → BYTE-IDENTICAL cognition
        │
        └── CANONICAL PARTITION PROJECTION
              truthful authored segments
              → CandidateBlocks → MIPA / manifest / shadow ONLY
```

```text
IN SCOPE
  canonical candidate construction
  registry producer identities
  shadow witness evolution to understand declared partitions

OUT OF SCOPE
  LegacyAddenda shape
  getMaiaResponse meta shape
  appendAllContextAddenda
  legacy cognition consuming partitioned blocks
```

---

## 3. MANDATORY AMENDMENT A — representability is part of the census

A structural discriminator is **not** the same as being losslessly partitionable under ct-1.

MIPA today keys candidates by producer:

```ts
const byId = new Map<ProducerId, CandidateBlock>();
for (const c of candidates) byId.set(c.producerId, c);
```

One CandidateBlock per `ProducerId`; a second replaces the first. MIPA and the future renderer both order participants by **registry order**, not by source-segment sequence.

So for each mixed producer, establish **three** things separately:

```text
1  AUTHORSHIP DISCRIMINATOR
   Can we know structurally whose material each part is?

2  LOSSLESS PARTITION
   Can those parts be emitted under truthful producer identities
   while preserving every byte and every ordering relation?

3  CT-1 REPRESENTABILITY
   Can current CandidateBlock/MIPA represent that partition without
   duplicate producer instances and without changing ordering semantics?
```

**Only all three YES → partition in this cut. Otherwise: `UNRESOLVED`. No forced solution.**

### Worked correction — conversational recall

Every exchange is already role-labelled (`conversationalRecallBlock.ts:139`, `ex.role === 'user' ? 'Member' : 'MAIA'`), and the block deliberately preserves recency order. Given interleaved `Member A · MAIA A · Member B · MAIA B`, a two-producer split forces either reordering into `Member A · Member B · MAIA A · MAIA B` (changes cognition order) or repeated producer instances (ct-1 cannot represent). Therefore:

```text
retrieved.conversational_recall
  HAS STRUCTURAL AUTHORSHIP DISCRIMINATOR       YES
  LOSSLESSLY PARTITIONABLE UNDER CURRENT CT-1   UNKNOWN / possibly NO
```

**Do not expand MIPA multiplicity inside this cut to make it fit.** That converts a provenance repair into canonical-turn architecture work.

The same question is owed to `member.atoms` — `sourceType` / `facilitatorId` / the practitioner-attribution guard are excellent discriminators, but whether member and practitioner rows already render in contiguous authorship sections decides whether they split without reordering. `member_web` may prove easier because its source families are field-separated. **Prove it; do not infer it.**

### Partition difficulty as found

```text
retrieved.conversational_recall  discriminator per exchange; ordering risk (above)
member.atoms                     discriminator per row; contiguity UNPROVEN
retrieved.member_web             three field-separated families; contiguity UNPROVEN
member.episodic_recall           NO discriminator — renders one verbatim_text field
                                 labelled "member-marked"; mixing is INSIDE the field
                                 (episodicRecallBlock.ts:144-153)
```

---

## 4. MANDATORY AMENDMENT B — the contract must be structural, not magical

Code cannot reliably discover multiple authorships by inspecting arbitrary prompt prose. **Mixedness must be representable in data.**

```text
producer source
  → SINGLE_AUTHOR       producer identity + material
  → PARTITIONED         ordered authored segments
  → UNRESOLVED_MIXED    cannot truthfully partition at this seam
```

Enforceable contract:

```text
PARTITIONED source        may not enter CandidateBlock as one producer
UNRESOLVED_MIXED source   may not masquerade as SINGLE_AUTHOR
SINGLE_AUTHOR source      must agree with registry axes
```

The TypeScript shape is an implementation choice; the contractual distinction is this ruling. `partitionPending` may remain migration metadata — it is no longer the detector.

---

## 5. F-PARITY — the witness evolves, it is not weakened

**Do not redefine `zeroDiff` globally.** Ordinary turns containing none of the partitioned producers must remain able to report `zeroDiff: true` truthfully.

```text
affected producer ABSENT
  → old zeroDiff:true remains perfectly healthy

affected producer PRESENT
  → structural delta REQUIRED
  → the DECLARED delta only
  → recomposed content BYTE-IDENTICAL to the original legacy addendum
  → no unexpected delta
```

Two truths exposed separately:

```text
STRUCTURAL PARITY   legacy one-block shape vs canonical participant shape
                    expected to DIFFER when a declared partition participates

CONTENT PARITY      canonical partition, recomposed in SOURCE ORDER,
                    == exact original legacy addendum bytes
```

A run reporting `zeroDiff: true` on a turn carrying a partitioned producer is a **FAILURE** — the partition did not take effect. A run where cognition content changed is a **FAILURE** regardless of structure.

The Proof-8 / Proof-9 witnesses **remain historically valid**. They are not retroactively weakened. A partition-aware successor witness is introduced because the object being certified has intentionally become more truthful, and the supersession is declared explicitly here so a future reader cannot read the successor as a relaxation.

---

## 6. Execution template (Flow v2 §2 form)

```text
CURRENT MEMBER EXPERIENCE
  Nothing member-visible fails. Four live /list producers carry a single
  authorship label over material of multiple authorships. MAIA is handed
  practitioner observations and her own prior speech under a "member" identity.

FIRST BROKEN LINK
  None of the six. The chain is intact; the PARTICIPANT IDENTITY is false.
  The chain measures whether memory arrives, not whose it is — itself a finding.

LIVE SURFACE
  /api/sovereign/app/maia/list — authoritative primary (Surface Authority
  Census, canonical). All four producers are live there today.

EXISTING CAPABILITY
  role discriminator (conversational) · source_type + facilitator_id guard
  (atoms) · field-separated families (member_web) · NO discriminator (episodic)
  partitionPending EXISTS but is unreliable (§1.3)

SMALLEST REPAIR
  1. Census internal authorships of the four blocks against the three-part
     representability test (§3).
  2. Partition only those passing all three.
  3. Correct the registry to match; make mixedness structural (§4).
  4. Anything failing the test → UNRESOLVED, recorded, not forced.

SOVEREIGNTY BOUNDARY
  Practitioner observations must never reach cognition under a member label —
  a third human's words presented as the member's own is a sovereignty defect,
  not a formatting one. MAIA's own prior speech must never be returnable to the
  member as their own material. Existing consent gates (atoms return_preference,
  recall opt-outs, facilitator_id eligibility) preserved unchanged; this cut
  narrows identity claims, never widens admission.

NEGATIVE WITNESS
  - Legacy cognition content BYTE-IDENTICAL; LegacyAddenda shape unchanged.
  - No new material admitted; partition splits what is already admitted.
  - No attribution or framing language anywhere.
  - Epistemic Tone canon untouched. No appendAllContextAddenda change.
  - No /between work. No M3. No MIPA multiplicity expansion.
  - Sanctuary behaviour unchanged, INCLUDING practitioner.practice_field's
    notSanctuary:false — recorded as a separate open sovereignty finding,
    NOT adjudicated here.

POSITIVE WITNESS
  - Each partitioned CandidateBlock carries exactly one truthful authoredBy.
  - Canonical participant count rises by the DECLARED delta; the shadow line
    reports it as expected, not as drift.
  - Recomposed partition == original legacy addendum bytes.
  - A contract test fails when PARTITIONED or UNRESOLVED_MIXED source enters
    as a single producer — including the two cases unflagged today.
  - Registry corrections visible as registry diffs, not prose.

STOP CONDITION
  - Legacy cognition bytes or order change → STOP ENTIRE CUT.
  - A fifth mixed producer found → STOP, scope re-adjudication.
  - Partition requires interpreting content to decide authorship → that
    producer UNRESOLVED (interpretive displacement refused).
  - Partition requires duplicate ProducerId instances or changed ordering
    semantics → that producer UNRESOLVED; multiplicity is separate architecture.
```

---

## 7. Outcome space (founder-revised)

```text
1  Four losslessly partitioned under current ct-1
   → prerequisite CLOSED → P6 may reopen

2  Some partitioned; remainder truthfully UNRESOLVED
   → prerequisite may still CLOSE
   → P6 reopens with unresolved producers explicitly excluded

3  No mixed producer representable losslessly under current ct-1
   → no partition ships → record architectural blocker → P6 stays shut

4  Any legacy cognition byte/order change
   → STOP ENTIRE CUT

5  A fifth mixed producer found
   → STOP · scope re-adjudication

6  Partition requires interpreting content
   → that producer UNRESOLVED

7  Partition requires multiple instances of one ProducerId, or changed
   MIPA/renderer ordering semantics
   → that producer UNRESOLVED
   → canonical multiplicity is a separate architecture decision
```

**Outcome 2 can be success.** Every historical mixed block need not be repaired before P6 advances. What is required is that P6 never lies about the ones it cannot yet truthfully identify.

---

## 8. The deepest rule for this cut

> **Do not make the old conversation more orderly in order to make provenance easier.**
>
> Preserve exactly what MAIA currently receives. Make the shadow representation tell the truth about whose material it is wherever the existing canonical contract can express that truth. Where it cannot, say **UNRESOLVED**.
