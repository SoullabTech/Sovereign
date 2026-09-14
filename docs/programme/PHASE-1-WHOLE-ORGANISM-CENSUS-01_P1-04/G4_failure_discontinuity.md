# P1-04 · G4 · FAILURE / DISCONTINUITY — where the organism does not connect to itself

```text
GRAPH     G4 FAILURE / DISCONTINUITY
NODES     the subset of the 221 whose own STATUS records a discontinuity
EDGES     CONTESTED (E3, 4 fractures) · three separate provider-failure dispositions (E1)
ABSENCE   a node not appearing here is NOT thereby continuous — most statuses are
          WIRED-BUT-UNOBSERVED, which is not a discontinuity and not a continuity
```

## 1 · Discontinuity classes (E1, each from the node's own `STATUS` field)

```text
DORMANT               39     present, not reached on any traced path
NO STATUS WORD        21     the source record withheld one — ⛔ NOT defaulted here
ORPHANED              20     present with no importer or no mount located
PARTIAL               12     some paths only
DOCUMENTATION-ONLY     7     no code object
UNKNOWN                6     the record says unknown
BLOCKED                3     refused before execution on the traced path
OBSERVATION-ONLY       2     emits or records without participating
SUPERSEDED             2     replaced by a later object
```

**`DORMANT` by domain:** D 13 · E 9 · B 4 · F 4 · A 2 · C 2 · H 2 · I 2 · G 1.
**`ORPHANED` by domain:** D 7 · E 4 · B 3 · I 2 · A 1 · C 1 · F 1 · H 1.

⚠️ **`NO STATUS WORD` is 21 nodes and is the most important row in that table.** It is not a
status; it is the register declining to invent one. ⛔ It is not folded into `DORMANT`,
`UNKNOWN`, or anything else, here or later.

### ORPHANED (20)

| P3 row | STATUS as recorded | named object |
|---|---|---|
| `P3-A-14` | ORPHANED | /api/voice/stream-conversation — the second mind, or |
| `P3-B-15` | PARTIAL · recall ORPHANED downstream · write WIRED-BUT-UNOBSERVED — all th | ConsciousnessMemoryLattice — resonance recall (and i |
| `P3-B-26` | ORPHANED (imported, never called) | lib/memory/confidenceDecay.ts (calculateDecayedConfi |
| `P3-B-27` | DORMANT / ORPHANED — both restated as the source record gives them | lib/anamnesis/* (AnamnesisField · DecentralizedMemor |
| `P3-C-12` | ORPHANED | trust_observations [Band VII] |
| `P3-D-19` | ORPHANED | D-OBJ-19 `ResonanceFieldOrchestrator` (A) lib/field |
| `P3-D-20` | ORPHANED | D-OBJ-20 `ResonanceFieldOrchestrator` (B) lib/oracle |
| `P3-D-24` | ORPHANED | D-OBJ-24 `FieldCoherenceTensor` + `fieldIntegrityVal |
| `P3-D-25` | ORPHANED | D-OBJ-25 `FieldAnalytics` |
| `P3-D-27` | PARTIAL — repo path WIRED-BUT-UNOBSERVED; service layer ORPHANED (0 import | D-OBJ-27 `FieldRecordsService` / `FieldRecordsRepo`  |
| `P3-D-28` | ORPHANED / DORMANT (as recorded, both terms kept) | D-OBJ-28 `neuropodEligibility`, `energyState` |
| `P3-D-39` | ORPHANED — ⚠️ 0 in-repo callers, "orphaned by its own header's determinati | D-OBJ-39 `/api/maia/field` — "field perception bundl |
| `P3-E-01` | ORPHANED (vocabulary) — zero importers at the subject | `SPIRALOGIC_REFERENCE` constant (E-1) |
| `P3-E-17` | ORPHANED — the declared datastore model does not exist (no `model Spiral*` | `spiralConstellationService` — the partial S-16 cros |
| `P3-E-18` | DORMANT / orphaned as recorded | `CrossSpiralPatternRecognizer` + `TriadicPhaseDetect |
| `P3-E-24` | ORPHANED (aether-facets) DORMANT (elemental-oracle blueprint) | `lib/aether-facets.ts` (and `lib/elemental-oracle/bl |
| `P3-F-19` | ORPHANED | F-19 `lib/archetypeEvolutionEngine.ts` |
| `P3-H-14` | ORPHANED | its own `handleVoiceTranscript` binding |
| `P3-I-08` | ORPHANED (the record is explicit: ⛔ not `DORMANT`, because P3-I-01 perform | `ReadScope` · `resolveReadScope` · `canRead` · `prac |
| `P3-I-10` | ORPHANED — schema, read guards, loader projection, refusal path and member | `member_memory_atoms.source_type = 'practitioner_obs |

### BLOCKED (3) · SUPERSEDED (2) · DOCUMENTATION-ONLY (7)

| P3 row | STATUS as recorded | named object |
|---|---|---|
| `P3-A-13` | BLOCKED | /api/oracle/conversation — blocked lane |
| `P3-B-02` | WIRED-BUT-UNOBSERVED (FAST) BLOCKED by construction on CORE/DEEP — both re | MemoryBundleService — the compressed cross-session b |
| `P3-D-02` | WIRED-BUT-UNOBSERVED (path b) BLOCKED (path a — source term "BLOCKED-BY-FL | D-OBJ-2 PFI mind state — `generatePFIMindState` |

| P3 row | STATUS as recorded | named object |
|---|---|---|
| `P3-H-11` | SUPERSEDED (preserved as evidence, unreachable from the voice handler) | `sendStreamingMessage` / `useStreamingVoice` / `app/ |
| `P3-I-12` | SUPERSEDED (Supabase-based; no Next route surface) | `src/routes/facilitatorDashboard.routes.ts` + `src/s |

| P3 row | STATUS as recorded | named object |
|---|---|---|
| `P3-D-41` | DOCUMENTATION-ONLY | `RFI` (named term) |
| `P3-D-42` | DOCUMENTATION-ONLY | `UFI` (named term) |
| `P3-D-43` | DOCUMENTATION-ONLY | `FIS Field State Primitive` |
| `P3-E-28` | DOCUMENTATION-ONLY | the S-16 12-phase document vocabulary — `dominantSpi |
| `P3-F-32` | DOCUMENTATION-ONLY | `safe_for_retrieval` |
| `P3-F-33` | DOCUMENTATION-ONLY | `facetToHexagram` seed map |
| `P3-F-34` | DOCUMENTATION-ONLY | Invariant 13 Tier-2 consequential-forecast refusal |

### NO STATUS WORD (21) — carried as its own class

| P3 row | named object |
|---|---|
| `P3-A-17` | Runtime governance instruments actually found on the canonical lane (the s |
| `P3-B-30` | memory_contracts table |
| `P3-B-31` | case_memories · case_memory_chunks · memory_links · vault_symbols · vault_ |
| `P3-C-11` | Confidence decay over formed memory — TS calculateDecayedConfidence + SQL  |
| `P3-D-29` | D-OBJ-29 "Fields" collaborative workspace (`field_ideas`, `field_kanban_ca |
| `P3-D-30` | D-OBJ-30 "Living Field" (`living_field_affinities`, `personal_living_field |
| `P3-D-32` | D-OBJ-32 `/field/*` — voice-first MAIA conversation surface |
| `P3-D-33` | D-OBJ-33 "Practice Field" (`practice_fields`, `practice_field_snapshots`) |
| `P3-D-34` | D-OBJ-34 "Wisdom Field" circles (`wisdom_fields`, `wisdom_field_circles`,  |
| `P3-D-37` | D-OBJ-37 `rhythmCoherence` debug overlay inside the member conversation co |
| `P3-D-40` | D-OBJ-40 `ResonanceEngine` + `resonanceHysteresis`, `resonance-map` |
| `P3-E-07` | reader 2 — `MemberLiveContext.spiralState` |
| `P3-E-10` | `admitPersistedStateForShaping` — Refusal R16 developmental-state admissio |
| `P3-E-19` | `PhaseDetector` / type `SpiralogicPhase` (⚠️ an ELEMENT name, not a phase) |
| `P3-E-23` | `lib/elemental-alchemy/` practices (`getAllPractices`, `assessmentQuestion |
| `P3-E-26` | Prisma `model ElementalState` + `model ElementalEvolution` |
| `P3-E-29` | `lib/spiralogic/registration/` — the chart-to-elemental grammar |
| `P3-F-36` | alchemical stage vocabulary — `nigredo` / `albedo` / `rubedo` |
| `P3-H-16` | `VoiceWithNotes` |
| `P3-H-17` | `onTranscript={(t) => setDreamContent(t)}` |
| `P3-H-18` | `onTranscript: (result: TranscriptResult) => …` |

## 2 · ⭐⭐ The four fractures, carried unadjudicated

⛔ None is resolved, ranked, or dropped here. Their adjudicative home is P1-05.

```text
X-DEF-1   one module, two domains, opposite findings
          D: reaches the canonical prompt at a named line range, rung CONTRIBUTES (P3-D-01)
          E: SURFACED WHERE: NOWHERE, citing the line where the same file says the block
             is intentionally not appended
          ⭐ RENDERED IN G2 §5 as one CONTESTED edge carrying both representations, so the
          fracture is visible in the assembled organism BEFORE P1-05 receives it.

X-DEF-2   one route, three incompatible characterizations
          second cognition path · unconditional 410 (P3-A-13, STATUS BLOCKED) ·
          near-zero live traffic (anchor prose; D-P1-06: evidence, not law)
          ⚠️ dependent rows: the register states SIX; artifact citation yields EIGHT
          (P3-B-21 · P3-B-24 · P3-C-03 · P3-C-04 · P3-D-09 · P3-D-10 · P3-E-05 · P3-F-24).
          ⛔ The discrepancy is carried, not reconciled — it is itself P1-05 material.

F-CONCLUDE   the concluding-capable count is NOT SETTLED
          three overlapping enumerations in domain F — a table marking six · a no-refusal
          list of six with different membership · a prose sentence saying six of which one
          refuses. All three reproduced verbatim in the register's CONCLUDE inventory.
          ⛔ No number is stated here. ⛔ And per the founder's constraint, concluding-capable
          stays distinct from: invoked · member-facing · persisted · used by cognition ·
          governed · authorized to conclude.

A-1 … A-6   slice 01's six carried contradictions, both sides intact — including the
          registry-vs-orchestrator case (a live lane reaching cognition outside the wrapper
          its own header declares mandatory), the DEEP-addenda contradiction stated FOUR
          LINES APART in one function, the guardrail-parity case, the reported-vs-executed
          tier, and the sole-gateway claim against at least four independent model reaches.
```

## 3 · ⭐ What the fractures have in common

Every one of the four was **invisible from inside a single domain record** and became visible
only when the records were placed in one schema. ⛔ That is an observation about the census
instrument, not a finding about the organism, and it is ⛔ not authority to resolve any of them.

## 4 · ⛔ Three provider-failure dispositions — three nodes, never one

Per Amendment 1 §4, provider-failure semantics are **plural in the implemented organism**.
⛔ **No synthetic `"MAIA fallback behavior"` node exists in this graph**, and ⛔ nothing here may
be simplified to *"MAIA falls back"* or *"MAIA refuses."*

```text
D-1  LOCAL FALLBACK              P3-G-06   modelService.ts:180-193 → localModelClient.ts
     reached when MAIA_INFERENCE_MODE is unset (and on an unrecognized TEXT_MODEL_PROVIDER)
     ⛔ emits NO drift event at all · under consciousness_engine returns model:'template-engine'
     — a fourth answer-producing path that is not a model
     COVERAGE  conversational text family only

D-2  DEGRADED FIRST-PERSON OUTPUT  P3-G-02   sovereignRouter.ts, four exits
     reached only when MAIA_INFERENCE_MODE is non-empty; returned as TextResult.text with
     provider:'unknown', model:'degraded' — INDISTINGUISHABLE IN TYPE from a generated answer;
     three of four exits emit no drift event
     ⭐ THE FINDING, EXACTLY AS RATIFIED: the emitting seam makes a persistence claim it does
     not itself discharge; end-to-end truth is caller-dependent and presently unresolved.
     ⛔ NOT "MAIA lies about saving" — that stronger statement has not been earned, and ⛔ no
     later domain may generalize it across callers without inspecting every caller.
     COVERAGE  conversational text family only

D-3  HARD REFUSAL                 P3-G-04   structured/router.ts:116-131
     { ok:false, refusal:'provider_unavailable' }; in-file rule: "THE FAILURE STOPS HERE."
     reached from the five Writer's-Studio reader callers, always
     COVERAGE  structured-reading family only
```

**Carried across all three, unresolved (E4):** ⭐ *which behaviour governs production is UNKNOWN
from repository evidence alone* — `MAIA_INFERENCE_MODE` appears in no tracked deployment config.
⛔ `INF-3`: an environment variable selecting the disposition **authorizes nothing**. ⚠️ And the
billing/auth fail-fast branch tests properties no code sets, on errors re-wrapped so they cannot
carry them.

## 5 · What G4 does **not** establish

```text
⛔ that any DORMANT or ORPHANED object is safe to remove     no repair proposal appears here
⛔ that any fracture has a correct side                      P1-05 adjudicates, ⛔ not P1-04
⛔ that a node absent from this graph is continuous          most nodes are WIRED-BUT-UNOBSERVED
⛔ that the organism has one failure behaviour               it has three, kept separate
```

---
_G4 assembled from the P1-03 register only. No code was read to settle a fracture; doing so would
re-run P1-02 and would be external evidence at this altitude._
