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

---

## 9. Representability census — CLOSED · PASS · Outcome 2 (2026-09-04)

Read-only, run against the §3 three-part test. Founder froze the subset the same day.

### 9.1 Founder correction to the census summary — recorded

> The two unresolved recall blocks are **not** currently presenting MAIA's prior speech to cognition as though it were literally the member's speech. Conversational recall explicitly labels each line `Member` or `MAIA`; episodic recall says `member-marked`, which describes **the marking act**, not authorship.
>
> The defect is that the **canonical participant identity** collapses the whole mixed block to `authoredBy: member`.
>
> Therefore P6 must exclude them from **attribution closure**, not from cognition or recall.

### 9.2 Determinations

```text
member.atoms
  discriminator       YES
  lossless partition  YES
  ct-1 representable  YES
  verdict             PARTITIONABLE · BUILD IN THIS CUT

retrieved.member_web
  discriminator       YES
  lossless partition  NO   (empty-state placeholders — §9.4)
  ct-1 representable  NO   (house frame becomes discontiguous — §9.4)
  verdict             UNRESOLVED · DO NOT PARTITION
                      stop rule applied automatically per founder ruling

retrieved.conversational_recall
  discriminator       YES
  lossless partition  NO
  ct-1 representable  NO
  verdict             UNRESOLVED · DO NOT PARTITION
                      ct-1 ordering / multiplicity

member.episodic_recall
  discriminator       NO
  lossless partition  NO
  ct-1 representable  N/A
  verdict             UNRESOLVED · DO NOT PARTITION
                      no structural authorship discriminator
```

**No fifth mixed producer found.** The 12 non-mixed live `/list` producers were re-checked against their registry reason strings; none discloses hidden authorship. Scope re-adjudication not triggered.

### 9.3 `member.atoms` — evidence

`lib/maia/memoryAtomsLoader.ts:414-541`. The formatter already performs the partition and then concatenates it:

```ts
const memberAtoms       = atoms.filter(a => a.sourceType !== 'practitioner_observation');
const practitionerAtoms = atoms.filter(a => a.sourceType === 'practitioner_observation');
sections.push(memberSection)        // # MEMBER-PLACED PORTFOLIO
sections.push(practitionerSection)  // # PRACTITIONER OBSERVATIONS
return sections.join('\n');
```

Two contiguous sections, fixed order, no interleaving of member and practitioner **material**. Recomposition: present sections joined by `'\n'` — exact, including the single-section case. Loader eligibility (`source_type <> 'practitioner_observation' OR facilitator_id IS NOT NULL`) already refuses unattributed practitioner atoms, so the practitioner partition admits nothing the member label was hiding.

### 9.4 `retrieved.member_web` — the exact ordered segment table, and why it fails

`lib/memory/MemberLiveContext.ts:436-520`. Byte-exact structure (`cat -A` verified):

```text
S1  "🕸️ MEMBER WEB (Silent context — …):\n"                      house frame, opening
S2  "Active Patterns (recurring structures in their life):\n"
    "${patternsBlock}\n\n"                                        system · inferred
S3  "Recent Session Arcs (what we've been working on):\n"
    "${summariesBlock}\n\n"                                       MAIA (sovereignSummarizer)
S4  "Recent Journal:\n${journalsBlock}\n"                         member
S5  "${themesSection}"                                            system-noticed · conditional
S6  "${fieldConditionBlock}"                                      system-computed · conditional
S7  "\nInstruction: Before responding, silently check these
     threads. … Do not quote this block directly."                house frame, closing
```

S1‖S2‖S3‖S4‖S5‖S6‖S7 recomposes the original exactly, order is fixed, and each segment could take one producer id. **It still fails, on the empty state.**

```ts
: '  None recorded yet.';                                    // patternsBlock  (L452)
: '  No summaries yet — session history builds over time.';  // summariesBlock (L465)
: '  No journal entries yet.';                               // journalsBlock  (L476)
```

When a family is empty its slot holds **only house placeholder text**. Two consequences, either one disqualifying:

1. **A false participant.** S2 would be ADMITTED as `system · inferred` while containing zero inferences — a participant asserting an authorship it does not carry. That is precisely the defect this cut exists to remove; introducing a new instance of it is not a partition.
2. **The house frame becomes discontiguous and turn-variable.** Folding an empty family's bytes into the frame makes the frame appear in a different number of non-adjacent runs depending on which families are empty on that turn. One producer id per segment cannot express that without either manufactured positional house identities (`house.member_web_frame_2`…), which are not derived from any source or consent semantics, or concatenating the runs, which reorders them.

The distinguishing principle, recorded so it is not re-litigated: **house instructional framing that wraps a producer's material is not "mixed authorship" in the pdc-1 sense** — otherwise every producer in the registry is mixed, since all 16 carry house discipline text. What disqualifies is *member / practitioner / MAIA material being conflated*, or a segment whose declared authorship is absent from its bytes. `member.atoms` passes because its two sections separate **material**; `member_web` fails because its empty states leave segments with a declared authorship and no material.

**One formatter change would make it PARTITIONABLE** — omit empty family sections so placeholders never occupy a family slot. That change alters legacy addendum bytes, which is a STOP condition here. Recorded for a future cut; **not attempted**.

### 9.5 pdc-1 derivation instruction — founder

> Do not classify new producers by authorship alone. A practitioner observation atom may reasonably be `practitioner · placed · situate` rather than `practitioner · authored · situate`, because the observation is practitioner-authored but reaches MAIA through the **member-controlled portfolio / return mechanism**. That exact triple must be **derived from the existing source/consent semantics before it is registered — not guessed from its prefix.**

Policy check: `sovereign_chat` allows field composition and pp-1 currently has no inference cap, so current policy will not independently block a truthful split on `/list`.

### 9.6 P6 consequence for the two unresolved producers

```text
retrieved.conversational_recall
member.episodic_recall

KEEP     existing retrieval · existing consent gates
         existing legacy cognition · existing prompt wording

DO NOT   wrap either whole block as MEMBER-SOURCED
         call either truthfully-attributed
         suppress either merely because P6 cannot yet partition it
```

> We do not improve epistemic truth by amputating continuity.

Later architecture, **not this cut**: conversational recall needs ordered multi-instance representation; episodic recall needs provenance-preserving storage that retains speaker structure.

### 9.7 Frozen build subset

```text
BUILD              member.atoms partition
                   structural SINGLE_AUTHOR / PARTITIONED / UNRESOLVED_MIXED contract
                   registry corrections
                   partition-aware shadow witness
                   byte-exact recomposition tests

RECORD UNRESOLVED  retrieved.member_web  (§9.4 — one formatter change away)
                   retrieved.conversational_recall
                   member.episodic_recall

FROZEN             LegacyAddenda shape + bytes · getMaiaResponse input
                   current cognition ordering/content · admission/consent rules

FORBIDDEN          attribution framing · Epistemic Tone changes
                   MIPA multiplicity · M3 · /between work
```

---

## 10. Build — member.atoms partition (2026-09-04)

### 10.1 The practitioner triple, DERIVED (not assumed)

Founder instruction: derive `authoredBy × participationClass × authority` from source and consent semantics before registering; `placed` is not descriptive — MIPA turns it into an assertion:

```ts
const admittedReason = spec.participationClass === 'placed' ? 'member_placed' : 'eligible';
```

Consent path traced:

| question | evidence | answer |
|---|---|---|
| Who created the observation? | `facilitator_id` required to surface (`PRACTITIONER_ATTRIBUTION_GUARD`) | a practitioner |
| What licenses its return? | `return_preference` **DEFAULT `'contextual_doorway'`** (migration `20260523000001`) | nothing member-initiated |
| Can the member affirmatively place it? | `member_response_status` DEFAULT NULL; *"The system NEVER sets"* it; `'confirmed'` is reserved with **no runtime writer** | no |
| What can the member do? | eligibility is `member_response_status IS DISTINCT FROM 'rejected'` | **decline** — opt-out |

Migration `20260702000002` states it plainly: *"the member's VERDICT on an observation made ABOUT them by a practitioner"*; *"declining a practitioner's claim is not a curation gesture — it is an authorship refusal."*

**Practitioner authorship + system eligibility alone bring it into context.** `placed` is therefore refused: it would make the manifest assert `member_placed` over material the member never placed — manufacturing the exact false consent claim this cut exists to remove.

```text
practitioner.atoms_observations   practitioner · authored · situate
consentBasis: member decline (member_response_status) — opt-out, NOT member placement
```

**The defect, sharpened:** `member.atoms` genuinely *is* `placed`. Practitioner rows ride the same table and the same default, inheriting member-placement semantics they never earned.

### 10.2 What was built

```text
lib/maia/memoryAtomsLoader.ts        projectAtomSections()  pure projector (the existing
                                     member/practitioner section split, exposed)
                                     joinAtomSections()     legacy projection
                                     formatAtomsForPrompt() = join(project(...)) — unchanged contract
                                     ATOM_SECTION_SEPARATOR = '\n'

lib/maia/canonical-turn/partition.ts SINGLE_AUTHOR / PARTITIONED / UNRESOLVED_MIXED
                                     assertUsablePartition() refuses: empty partition ·
                                     duplicate producer · empty segment · unregistered
                                     producer · registry-order violation · content-parity
                                     violation. Throws — never degrades to a weaker claim.
                                     UNRESOLVED_MIXED_PRODUCERS records the three as DATA.

lib/maia/canonical-turn/producerRegistry.ts
                                     + practitioner.atoms_observations, declared
                                       immediately after member.atoms so registry order
                                       equals source order
                                     ~ member.atoms reason corrected — it no longer claims
                                       the practitioner observations it no longer carries;
                                       provenance narrowed to .memberSection

lib/maia/canonical-turn/shadow.ts    candidatesFromLegacyAddenda(legacy, partitions?)
                                     compareLegacyToCanonical(legacy, turn, partitions?)
                                     + expectedPartitionDelta · contentParity · unexpectedDiff

app/api/sovereign/app/maia/list/route.ts
                                     one rendering, two projections. atomsAddendum
                                     byte-identical; declaredPartitions is shadow-only.
```

**`legacyAddenda` shape, `meta`, `getMaiaResponse` input, `appendAllContextAddenda`, the renderer, MIPA multiplicity: untouched.**

### 10.3 A defect the tests found in the witness itself

First run failed on the BOTH shape: `member.atoms` appeared in `unexpectedDiff`. The comparator treated every `digestMismatch` as unexplainable, but in the BOTH case `member.atoms` legitimately **narrows** — it owned the whole block, now owns only its section, so its digest must change.

Rule corrected, and kept deliberately narrow:

```ts
const narrowedByPartition = (id) => replacedLegacyProducers.has(id) && partitionProducts.has(id);
```

A digest change is excused **only** where the legacy producer is also one of its own segments. Every other digest change stays unexpected, and `contentParity` independently proves the segments recompose to the exact bytes cognition receives. A test pins the exemption's narrowness: an unrelated producer whose bytes change is still `unexpectedDiff`.

### 10.4 Local gates

```text
lib/maia/canonical-turn/ + lib/maia/__tests__/    196 passed · 10 suites
npm run typecheck                                 ✅ no regressions (231 vs baseline 239)
npm run check:no-supabase                         ✅ clean
```

Pre-existing failures on canonical, **not caused by this cut** — verified by stashing the diff and reproducing identically at `34cc4cad9`: `episodes/mark/sanctuaryGuard`, `manuscripts/[id]/draft/route`, `manuscripts/[id]/draft/revisions/route` (3 suites, 15 tests).

Local gates are not CI certification.

### 10.5 Not yet done

Production witness. The three shapes must be observed on live `/list` turns:

```text
MEMBER ONLY          zeroDiff:true still healthy · no expectedPartitionDelta
PRACTITIONER ONLY    canonicalCount stays 1 · identity moves member → practitioner
                     contentParity:true · unexpectedDiff:[]
BOTH                 canonicalCount rises by the declared delta
                     contentParity:true · unexpectedDiff:[]
```

`contentParity:false` or a non-empty `unexpectedDiff` on any live turn STOPS the cut for classification — never normalize it.

---

## 11. Pre-witness corrections (2026-09-04)

### 11.1 Contract hole closed — adjacency, not merely order

`assertUsablePartition()` checked that segment producers occur in **increasing** registry order but not that they are **adjacent**. Safe for atoms today only because `practitioner.atoms_observations` was deliberately declared immediately after `member.atoms` — the generic contract was weaker than the ruling it claims to enforce.

A future partition could pass with positions `10, 12` while an unrelated producer sits at `11`. Canonical renders in registry order, so that producer would be inserted **between** two halves of one source block — the exact representability failure the census ruled out for interleaved sources.

```ts
if (positions[i] !== positions[i - 1] + 1) {
  throw new PartitionRefused('registry_adjacency_violation', …);  // names what sits between
}
```

Two tests added: a non-adjacent-but-increasing partition is refused, and the atoms partition itself is pinned adjacent (`index(practitioner.atoms_observations) === index(member.atoms) + 1`). No behaviour change to the atoms result.

### 11.2 Canonical rebind — REQUIRED before witness

`4c6ba725f` descended from `34cc4cad9`; canonical had moved to `cf6ce3cef`. Deploying the old tip would have put production on a tree missing the intervening canonical work.

```text
merge-base        34cc4cad9
canonical         cf6ce3cef  (PRs #1192, #1195, WS2-07C/07D lane records)
file overlap      NONE — canonical movement touches no file in this lane
merge             clean, zero conflicts, nothing resolved by assumption
```

Gates rerun **after** the merge, not before:

```text
lib/maia/canonical-turn/ + lib/maia/__tests__/    198 passed · 10 suites
npm run typecheck                                 ✅ no regressions
npm run check:no-supabase                         ✅ clean
```

`4c6ba725f` is superseded and **must not be deployed**.

### 11.3 OPEN CONSENT-COPY DEFECT — recorded, not repaired here

The consent trace in §10.1 exposes a **pre-existing member-facing wording defect** in the practitioner block:

```text
current text     "approved for inclusion in MAIA context"
                 (lib/maia/memoryAtomsLoader.ts, PRACTITIONER OBSERVATIONS section)

known mechanism  return_preference DEFAULTs to 'contextual_doorway';
                 member_response_status is an opt-OUT verdict the system never sets,
                 with no runtime writer for 'confirmed'
                 → default eligible unless rejected

status           the copy asserts an affirmative member approval path that
                 DOES NOT EXIST in the consent mechanism

repair           separate bounded cognition-copy cut
```

**Not repaired in this cut** — the legacy-byte freeze correctly forbids touching it, since that text is inside the string cognition receives. It does not invalidate the shadow partition, which changes identity and not copy. Recorded so it cannot quietly disappear.

This is the second finding of the same shape as the partition itself: the system describing a member act that the consent path does not provide.

### 11.4 Production witness — the read-only census that must precede it

Before deploying, census live eligible atoms for whether the three shapes exist at all:

```text
MEMBER ONLY · PRACTITIONER ONLY · BOTH
```

**Do not manufacture or modify member data to satisfy the witness** without separate authorization. A shape that does not occur naturally is recorded as unobserved, not produced.

Expected on the governed deploy:

```text
MEMBER ONLY        zeroDiff true · expectedPartitionDelta [] · contentParity null
                   unexpectedDiff []

PRACTITIONER ONLY  zeroDiff false · canonicalCount == legacyCount
                   identity member.atoms → practitioner.atoms_observations
                   contentParity true · unexpectedDiff []

BOTH               zeroDiff false · canonicalCount == legacyCount + 1
                   member.atoms legitimately narrowed · practitioner producer added
                   contentParity true · unexpectedDiff []
```

Any `contentParity:false` or non-empty `unexpectedDiff` is a **hard stop** for classification — never normalized, never fixed around.
