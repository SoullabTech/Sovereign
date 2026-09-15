# PHASE-1-WHOLE-ORGANISM-CENSUS-01 · P1-05 · 02 · REMAINING CONTRADICTION CORPUS — ADJUDICATION REGISTER

```text
STEP     P1-05 · CONTRADICTION / GAP PASS — worker 02 (remaining corpus)
INPUT    P1-04 MAP4_contradiction.md (92 item blocks, 12 PARTs) · P1-05 INSTRUMENT · P1-04 AMENDMENT-4
         · P1-02 INSTRUMENT (D-P1-06 · D-P1-07 · D-P1-08) · P1-03 INSTRUMENT (INF-1…INF-5) · P1-04 INSTRUMENT (SYN-1…SYN-4 · INF-7)
SCOPE    every MAP 4 item EXCEPT the six owned by `01_named_objects`
TYPE     RECORD ONLY — ⛔ no repair · no design · ⛔ no organism re-tracing · ⛔ no runtime inspection
```

> ⭐⭐ **The purpose of adjudication is not to make the organism consistent. It is to determine
> precisely where the evidence permits consistency, contradiction, or uncertainty to be claimed.**

> **Adjudication may determine WHAT KIND of contradiction the existing evidence contains. ⛔ It may
> not manufacture new evidence to make the contradiction disappear.**

---

## 0 · Declared before use

### 0a · ⛔ Owned elsewhere — referenced by id, never adjudicated here

```text
X-DEF-1 · X-DEF-2 · X-DEF-3 · CONCLUDE COUNT · DEV-54/51 · the MAP 3 slice-05 tally discrepancy
                                                        → owned by 01_named_objects
```

Where an item below depends on one of those six, it says so and is listed again in §6.

### 0b · ⭐⭐ What a classification does NOT mean

```text
⛔ "RESOLVED BY SCOPE" / "RESOLVED BY ALTITUDE" ≠ reconciled · compliant · benign · repaired
✅ it names THE KIND OF DIVERGENCE THE EVIDENCE SUPPORTS, and nothing else
```

⛔ No item here is called legitimate or illegitimate. ⛔ `ABSENT` is not written. ⛔ `AUTH-EXPOSURE-01`
is neither cited, awaited nor answered. ⛔ No item is ranked by severity, likelihood or repair order.

### 0c · The two operating principles this worker applied, stated once

```text
P-A   DESCRIPTIVE ↔ DESCRIPTIVE       an in-source claim ABOUT WHAT THE CODE DOES, quoted by the
                                      corpus against the code that does otherwise, is C5 — a comment,
                                      a registry field or a header sentence is not a different
                                      altitude from the behaviour it describes
P-B   NORMATIVE ↔ DESCRIPTIVE         a rule · policy · ADR · canon clause · declared scope, against
                                      an implementation, is C2 — both hold (INF-4: IMPLEMENTED ↛
                                      GOVERNED, and its converse), and the divergence stands recorded
```

⭐ `C2` is used only where BOTH ALTITUDES ARE NAMED AND BOTH TEXTS QUOTED. ⭐ `C1` is used only where
the source records themselves distinguish the objects/paths/conditions — ⛔ never by assertion.
⛔ Where either requires a likelihood judgement, the outcome is `C6`.

### 0d · ⛔ Forbidden promotions, binding on every line below

```text
⛔ "GOVERNED ACT = 0"  →  "no acts are governed"        ✅ "no row in this census established GOVERNED ACT"
⛔ the 62 rows         →  "62 unauthorized capabilities" ✅ named findings, each keeping its row id
⛔ NONE LOCATED        →  ABSENT                         ⛔ UNKNOWN → NONE LOCATED
⭐⭐ Numerically equal states are not equivalent when their epistemic provenance differs.
```

### 0e · `C4` carries two sub-kinds and they are marked, ⛔ never pooled

```text
C4-CENSUS     a defect in the CENSUS's own record or bookkeeping   → artifact 2 material
C4-ORGREC     a defect in the ORGANISM's own records / identifiers, ⛔ not organism behaviour
```

---

## 1 · PART III-A · register 01 · domains A · B · C (20 items)

```text
ITEM      A-1 · Registry vs orchestrator
OUTCOME   C5 GENUINE CONTRADICTION
```
BASIS · 01_normalized_A_B_C: Side A `maiaRuntimeContext.ts:81` — "between/chat `callsMaiaResponse: false`,
reason 'uses maiaOrchestrator, not getMaiaResponse'"; Side B `maiaOrchestrator.ts:506` — "it does".
The registry field's own stated reason names the very function the other record shows it calls (P-A).
RESIDUE · The carried line — "a live lane reaches cognition outside the wrapper its own header
(`maiaRuntimeContext.ts:3-5`) declares mandatory" — is a further finding on the wrapper, ⛔ not adjudicated here.

```text
ITEM      A-2 · DEEP addenda, in one function
OUTCOME   C5 GENUINE CONTRADICTION
```
BASIS · 01_normalized_A_B_C: Side A `maiaService.ts:2519-2521` — "buildComprehensiveVoicePrompt … currently
does NOT iterate MaiaContext addenda"; Side B `maiaService.ts:2526-2535` + `maiaVoice.ts:972` — "it does.
Four lines apart." Same function, same file, same tense; the comment is descriptive, not normative (P-A).
RESIDUE · NONE. ⛔ No dated evidence of two states exists in the corpus, so no `C3` reading is available.

```text
ITEM      A-3 · Guardrail parity
OUTCOME   C1 RESOLVED BY SCOPE
```
BASIS · 01_normalized_A_B_C states the scoping itself: "The witness is true of `floor.ts:23-26`; it is not
true of `fastPathResponse`." Side A is `CMT-01_M0-M2_WITNESS_2026-09-03.md:82-84` ("FAST prompt opens with
the runtime prompt and closes with the three guardrails"); Side B is "`lib/sovereign/maiaService.ts`
contains none of the three identifiers". Two named objects, one true of each.
RESIDUE · Which object the witness's phrase "FAST prompt" denotes is not settled by the records; if it
denotes the served FAST path rather than `floor.ts`, the item reopens as `C5`. ⛔ Not decided here.

```text
ITEM      A-4 · Oracle lane
OUTCOME   C2 RESOLVED BY ALTITUDE
```
BASIS · ALTITUDE 1 — session-anchor operational evidence: `CLAUDE.md` — "~zero live traffic"
(D-P1-06: "CLAUDE.md = operational / session instruction evidence"). ALTITUDE 2 — implementation:
`oracle/conversation/route.ts:452` — "hard 410 as the first executable statement of POST". Both hold; a
route refusing at its first statement and a record of ~zero served traffic are not mutually exclusive.
The record's own carried line: "Per D-P1-06 the anchor is evidence, not law; the code stands."
RESIDUE · Whether the route serves member traffic at all is UNKNOWN (X-3 · D-1 · C-F5), and register 01
declares "whether the 2026-05-23 traffic audit still describes the subject (A-01)" unanswered (UC-ABC-Q).
⛔ The altitude classification settles the KIND only; it establishes no traffic fact in either direction.

```text
ITEM      A-5 · Reported tier vs executed tier
OUTCOME   C2 RESOLVED BY ALTITUDE
```
BASIS · ALTITUDE 1 — client-facing report field: `maiaService.ts:3245` reports "`processingProfile: 'DEEP'`
**for client compatibility**" — the source itself declares the field a compatibility value. ALTITUDE 2 —
execution: "the turn is an RCN turn that 'ran no tier'". Both hold.
RESIDUE · The emitted value misdescribes the executed path; whether any consumer reads `processingProfile`
as a claim about execution is not established in the corpus. ⛔ Not traced.

```text
ITEM      A-6 · Sole-gateway claim
OUTCOME   C5 GENUINE CONTRADICTION
```
BASIS · Side A `modelService.ts:72` — "Main gateway for ALL text generation in MAIA"; Side B — "at least
four independent model reaches bypass it — getClaudeService (A-14), six `new Anthropic()` routes (A-15),
A-13's MultiLLMProvider, DEEP-primary's consciousnessWrapper". The corpus states the verdict in its own
words at the row: "A-16 … 'THE GATEWAY CLAIM IS FALSE AT THE SUBJECT'" (04_ladder INF-6 inventory, E-24).
A universal descriptive claim against four named counter-reaches (P-A).
RESIDUE · Shares its sentence with C-3 (G) (E-23), whose Side B is a different artifact (the import
allowlist). ⛔ The two items are not merged; each keeps its own basis.

```text
ITEM      A-7 · Egress mislabel
OUTCOME   C5 GENUINE CONTRADICTION
```
BASIS · Side A `list/route.ts:1390` emits "`endpoint: '/api/sovereign/app/maia'`"; Side B — "it is emitted
'from the /list handler'", and the source itself concedes it: "acknowledged in-source as a pre-existing
mislabel, left untouched". An emitted identifier and its emitter cannot both be as stated.
RESIDUE · What downstream telemetry keyed on that field attributes to which endpoint is not evaluated in
the corpus. ⛔ Not traced, ⛔ not repaired.

```text
ITEM      B-1 · "unmapped" vs wired to a prompt
OUTCOME   C2 RESOLVED BY ALTITUDE
```
BASIS · ALTITUDE 1 — registry classification: `substrateMap.ts:204-251` classifies eight services
"`underutilized-consciousness`", notes "unmapped", and for Morphic "declared service, no producer, no
runtime slot" — predicates about producer-registry membership. ALTITUDE 2 — import graph:
`MemoryPalaceOrchestrator.ts:8-15` "imports all eight", ":21-88 retrieves from seven, :175-233 writes to
four", and `oracle/conversation/route.ts:902,:1499,:2787` "consumes and prompt-injects". Both hold.
RESIDUE · Whether `substrateMap`'s classification was intended as a reachability claim is not established;
if it was, the item reopens as `C5`. Route liveness is UNKNOWN (carried: "Whether that route serves traffic
is `UNKNOWN`"). ⛔ The enumeration limb "`consumers: []`" is a different quote and is adjudicated at CONTRA-2.

```text
ITEM      B-2 · memoryHealth.pattern
OUTCOME   C5 GENUINE CONTRADICTION
```
BASIS · Side A `memoryHealth.ts:103` — "`pattern?: { count } // theme_signals feeds this`", under
"Wired by Cut 1"; Side B `route :1178-1209` "supplies no `pattern` input, so `layerStatus(undefined) =
'empty'` on every turn — while route :947 loads theme signals and :991 routes them into the FAST prompt".
Both are descriptive claims about the same field's feed (P-A).
RESIDUE · The theme-signal load at :947 is real and reaches the FAST prompt by another path; ⛔ that does not
rescue the `pattern` field's stated feed, and the two paths are not merged (see X-1).

```text
ITEM      B-3 · memoryHealth.semantic
OUTCOME   C5 GENUINE CONTRADICTION
```
BASIS · Side A `memoryHealth.ts:63` declares `semantic`, documented at :49 as "enduring facts, roles,
relationships, preferences"; Side B `memoryHealth.ts:97-100` + `route :1182-1186` — what feeds it "is an
atoms row count" and "no semantic retrieval exists on this path"; and
`MAIA_MEMORY_INTEGRITY_GAP_MAP_2026-08-04.md:38` — "a self-report that misstates the memory state MAIA is
in… occurring in the observability layer itself". Same field, declared denotation against its actual feed.
RESIDUE · The gap map is a third source agreeing with Side B; ⛔ its governing standing is not established
and is not needed for the classification.

```text
ITEM      B-4 · Two definitions of decay
OUTCOME   C1 RESOLVED BY SCOPE
```
BASIS · Two distinct named objects: `confidenceDecay.ts` exporting `calculateDecayedConfidence`
(TS, "imported at `MemoryBundle.ts:16`") and the SQL `calculate_decayed_confidence` ("`MemoryBundle.ts:266`
applies the SQL … the TS function is never called in that file").
RESIDUE · "there is no single authoritative definition of decay today" — ⛔ NONE LOCATED, not ABSENT. The
semantic divergence between the two (what member confirmation does) is C-2 (§8.2); the anchor's "0.0225"
claim has no located referent (CONTRA-6 · UC-ABC-Q · E-31).

```text
ITEM      B-5 · The influence plan's tier scope
OUTCOME   C2 RESOLVED BY ALTITUDE
```
BASIS · ALTITUDE 1 — computation and telemetry: "route :991 computes `memoryInfluenceAddendum` on every
eligible turn at every tier; route :1229 reports it in `buildMaiaRuntimeContext.addenda`". ALTITUDE 2 —
prompt assembly: "`maiaService.ts:3291-3308` establishes it cannot reach a CORE or DEEP prompt, against a
recorded prevalence of 'CORE 72.8% / FAST 27.2%'". The corpus states the reconciliation itself: "The
telemetry was repaired; the behaviour was deliberately left, named a 'deliberate product decision,
deferred by founder ruling 2026-08-13.'"
RESIDUE · A reported addendum that cannot reach the prompt on the majority-tier turns; the gap is deferred
by a dated ruling, ⛔ not closed. ⛔ The ruling is recorded as evidence, not adjudicated.

```text
ITEM      B-6 · Episodic consent
OUTCOME   C1 RESOLVED BY SCOPE
```
BASIS · Different named objects: read path — "`memoryLoaders.ts:332` reads `episodic_recall_enabled`;
`producerRegistry.ts:133` names it `consentBasis`"; member-facing preference route —
"`recall-preferences/route.ts:43-45` admits one column and names episodic only in a comment (:20) as
future work". Both true of their own object.
RESIDUE · ⭐ The column the registry names as the CONSENT BASIS has no located member-facing write surface;
the column's default and any other writer are ⛔ NOT LOCATED in the permitted evidence — owed read, §5.

```text
ITEM      B-7 · `lattice` recalls and discards
OUTCOME   C2 RESOLVED BY ALTITUDE
```
BASIS · ALTITUDE 1 — implementation: "`maiaService.ts:3057` performs a real resonance recall, mode-gated
:3049-3053, truncated per mode :3069-3085". ALTITUDE 2 — consumption at runtime: "nothing consumes it
(:3102 `memoryField = null`)". Both hold; neither refutes the other.
RESIDUE · The item's contradiction character rests on the corpus's intent reading — "the shape of code
written to be used" — and ⛔ no source states that the recall is expected to reach the prompt. ⛔ Not resolved
into a defect claim.

```text
ITEM      B-8 · Six enumerations of the memory arenas
OUTCOME   C1 RESOLVED BY SCOPE
```
BASIS · Six differently-named objects of different kinds: "`MemoryHealth` (12) · `MemoryHealthInputs` (11)
· `MemoryHealth` as populated (8) · `MemorySource` (9) · `ADDENDA_SPECS` (27) · `substrateMap` (30) — none
a subset of another", with "⛔ No code enumeration nominated as authoritative." The records name each object
separately and state no common inclusion rule.
RESIDUE · ⭐ Any sentence of the form "MAIA has N memory arenas" is unevaluable until the enumeration is
named — the same discipline the VC-* items carry. Inside one object, declared 12 against populated 8 is a
declaration/population gap, ⛔ not a second enumeration. ⛔ No winner chosen (also VC-memory-corpus).

```text
ITEM      C-1 (§8.1) · `member_patterns` ownership     ⚠️ source-label collision: register 01's C-1, ⛔ not C-1 (G)
OUTCOME   C2 RESOLVED BY ALTITUDE
```
BASIS · ALTITUDE 1 — ownership/governance document: `docs/DATA_BOUNDARIES_AND_OWNERSHIP.md:28` places the
table in MAIA Core, "Inner Patterns | MAIA's memory of themes, growth edges", "in a domain whose declared
Owner is 'The member' (doc:9)". ALTITUDE 2 — implementation: "the schema is `practitioner_id UUID NOT NULL
REFERENCES practitioners(id)`; rows are created by a practitioner lane; `getMemberPatterns.ts:55` withholds
`emerging` rows from the member as 'practitioner-internal'". Both hold (INF-4).
RESIDUE · Whether that document is ratified — i.e. whether altitude 1 is governance at all — is ⛔ not
established in the permitted evidence; if it is not, the item reopens as `C6`. P1-GOV-ACCESS-01 stands
adjacent. ⚠️ E-29 leaves undetermined whether Side B's `practitioner_id` co-refers with C-I-7's token.

```text
ITEM      C-2 (§8.2) · Confidence decay, two live impls    ⚠️ register 01's C-2, ⛔ not C-2 (G)
OUTCOME   C1 RESOLVED BY SCOPE
```
BASIS · Two named implementations: Side A "TS `halfLifeDays * 1.5` on member confirmation"; Side B "SQL
reference-date shift (`COALESCE(last_confirmed, formed_at)`) plus a `GREATEST(0.3, …)` floor".
RESIDUE · ⭐ The corpus's own sentence is the residue and is not dissolved by the classification: "The two
are not two spellings of one rule; they express different semantics for what member confirmation does."
Which is reached on which path is stated only for retrieval (CONTRA-6 Side A: "the SQL function is what runs
in retrieval"); no artifact nominates either authoritative. ⛔ NONE LOCATED, not ABSENT.

```text
ITEM      C-3 (§8.3) · R16 guard scope vs wiring     (source class: TENSION)
OUTCOME   C2 RESOLVED BY ALTITUDE
```
BASIS · ALTITUDE 1 — declared rule: "the guard declares a class-level rule binding 'any response-shaping
subsystem' and is written to fire for future fields". ALTITUDE 2 — wiring: "it is invoked at exactly one
site; two other loaders of the same table exist and do not pass through it". Both hold.
RESIDUE · The corpus expressly declines the defect characterization — "⛔ Not characterised as a defect" —
and that refusal is carried, ⛔ not overridden. Whether the two unguarded loaders are reached is not established.

```text
ITEM      C-4 (§8.4) · route liveness vs guard placement
OUTCOME   C6 UNKNOWN
```
BASIS · The corpus withholds the fact the adjudication needs: "⚠️ No runtime witness for either route was
located in-repo, so neither side is confirmed under the LIVE calibration." Side A `CLAUDE.md` "~zero live
traffic" + "names the list route as live"; Side B "the R16 guard's sole call site is in
`oracle/conversation/route.ts`". Under INF-1 (WIRED ↛ LIVE) neither side is evaluable.
RESIDUE · OWED READ (§5): a dated in-repo runtime witness for either route under the LIVE calibration.
⛔ Not performed. Depends on X-DEF-2 (owned by `01_named_objects`).

```text
ITEM      C-5 (§8.5) · Practitioner access
OUTCOME   C2 RESOLVED BY ALTITUDE
```
BASIS · ALTITUDE 1 — written scope model that does not run: "`practitionerProjection.ts` and
`relationship/scope.ts` state strict, non-merging, server-derived scope rules — **and are dormant**".
ALTITUDE 2 — the live read: "`studio/clients/[id]/patterns/route.ts:33-44` gates on an authenticated
practitioner plus a `practitioner_clients` linkage row 'carrying no consent or scope column'". Both hold.
RESIDUE · ⭐ The written model does not govern the live path (INF-1 · INF-4); P1-GOV-ACCESS-01 —
"PRACTITIONER / MEMBER VISIBILITY GOVERNANCE ABSENT" — is the standing finding, ⛔ and no verdict of
legitimacy is drawn here. Twinned with C-I-3 (E-28).

---

## 2 · PART III-B · register 02 · domains D · E · F (20 items)

```text
ITEM      CONTRA-1 · default-OFF flag one caller does not consult
OUTCOME   C1 RESOLVED BY SCOPE
```
BASIS · The records name the two reaches separately: gated — "`isPFIMindEnabled()` at :247, consulted at
`maiaService.ts:2916`", with "`MAIA_PFI_MIND=true`: Enable PFI mind **entrypoint** (default: OFF)";
ungated — "`fieldOrchestrator.ts:161-165` sets `pfi: true` unconditionally … reached from
`maiaService.ts:1521` and :1946 with no flag check". The flag's own text scopes itself to an entrypoint.
RESIDUE · ⭐ The flag's declared default is true of the entrypoint it names and ⛔ not of the capability;
INF-3 — a flag selecting behaviour authorizes nothing, in either direction. Whether the ungated reaches run
on member turns is ⛔ not re-traced here.

```text
ITEM      CONTRA-2 · "no live consumer" vs the import graph
OUTCOME   C5 GENUINE CONTRADICTION
```
BASIS · Side A `substrateMap.ts:383-391` — "Resonant field memory … **consumers: []** … Service preserved;
no live consumer wired"; Side B — "`CoherenceFieldService` is imported at `MemoryPalaceOrchestrator.ts:14`,
called at :75,:188,:249". An empty consumer enumeration against three located call sites on the same named
class (P-A).
RESIDUE · ⚠️ The second limb — "no **live** consumer wired" — is ⛔ NOT adjudicated as contradicted: under
INF-1 an import is not liveness, and the only traced onward route's liveness is UNKNOWN. ⭐ The `C5` attaches
to `consumers: []`, ⛔ not to the word "live". Carried: "(For QuantumFieldMemory, side A holds.)"

```text
ITEM      CONTRA-3 · "DORMANT" on an object on the canonical path
OUTCOME   C6 UNKNOWN
```
BASIS · Side A names one token — `fieldMonitorTelemetry.ts:165` "Field Intelligence (activates DORMANT
**talkModeFieldIntelligence** …)"; Side B names another — "**analyzeFieldIntelligence** is dynamically
imported and used at `maiaService.ts:1082-1112`". ⛔ No sentence in the permitted evidence states that the
two tokens name one object, and the hard vocabulary rule forbids merging them on similarity. Reading
"DORMANT" as contradicted therefore requires a likelihood judgement.
RESIDUE · OWED READ (§5): the referent of `talkModeFieldIntelligence` at `fieldMonitorTelemetry.ts:165`.
⛔ Not performed. Side B's onward claim ("producing a prompt block on the canonical member path") is the
disputed side of X-DEF-1 (owned) — §6.

```text
ITEM      CONTRA-4 · "The ONLY file that knows how the field engines connect"
OUTCOME   C5 GENUINE CONTRADICTION
```
BASIS · Side A `fieldOrchestrator.ts:3` "asserts sole-seam status"; Side B — "at least four other seams
connect field engines into cognition — `maiaService.ts:1082`, `maiaService.ts:2838`,
`oracle/conversation/route.ts:853`, `:902`, `voice/stream-conversation/route.ts:82`". A universal
descriptive claim against named counter-seams (P-A).
RESIDUE · Two of the named counter-seams sit on a route whose liveness is UNKNOWN, and one (`:1082`) is the
block disputed at X-DEF-1 (owned); ⛔ the sole-seam claim is not rescued by either, since
`maiaService.ts:2838` (`enforceFieldSafety`) is undisputed in the corpus.

```text
ITEM      CONTRA-5 · `persistentFieldStates` is not persistent
OUTCOME   C5 GENUINE CONTRADICTION
```
BASIS · Side A `QuantumFieldMemory.ts:2-6` — "maintaining persistent field states"; Side B — "`:91` is
`new Map()`; the file's only import is `crypto`; no `query`/`INSERT`/`SELECT` in 810 lines". The `C5`
attaches to the header SENTENCE, a descriptive claim (P-A).
RESIDUE · ⛔ Per the vocabulary rule no finding attaches to the identifier `persistentFieldStates` itself;
that limb is carried at VC-names-asserting-what-they-do-not-carry (E-34).

```text
ITEM      CONTRA-6 · two SQL decay definitions and one TS helper
OUTCOME   C1 RESOLVED BY SCOPE
```
BASIS · Named objects, and the record states which runs where: Side A — "SQL, both copies identical:
baseline:711-737 and `20251231_memory_architecture_enhancements.sql:178-214` — no confirmed-memory bonus of
any kind; **the SQL function is what runs in retrieval**"; Side B — "`lib/memory/confidenceDecay.ts:78-79`
— `effectiveHalfLife = confirmedByUser ? halfLifeDays * 1.5 : halfLifeDays`".
RESIDUE · ⭐ Side C is a separate, unresolved limb: the anchor's "the SQL confirmation term caps at 0.0225"
is "NOT confirmed — no confirmation term of any form exists in either SQL copy", while register 01 records
"the referent of 'the SQL confirmation term caps at 0.0225' (C §10, **NOT FOUND at the subject**)". With the
referent NOT LOCATED, whether the anchor's claim conflicts with the quoted SQL is ⛔ undetermined — owed read, §5.

```text
ITEM      C-E1 · Phase is 1–3, and phase is 1–12
OUTCOME   C1 RESOLVED BY SCOPE
```
BASIS · Two named objects, and the record states the conversion between them: "`spiralogic-core.ts:17` —
`export type Phase = 1 | 2 | 3`, a 12-cell grid of 4 elements × 3 phases"; "`20260213200001_member_spiral_state.sql:19`
— `phase INTEGER CHECK BETWEEN 1 AND 12`; `conductor.ts:24-28` normalizes to 1..12. **The conductor writes
the former into the latter.**"
RESIDUE · ⛔ The corpus does not establish that a 1..12 grid coordinate and a 1..12 scalar are the same
quantity, nor that the normalization is invertible. VC-phase carries the wider collision.

```text
ITEM      C-E2 · And phase is `Intelligence | Intention | Goal`
OUTCOME   C1 RESOLVED BY SCOPE
```
BASIS · A third named vocabulary at a named site: "`maiaService.ts:1134-1137` — a third vocabulary on the
canonical lane, computed and deliberately not appended. Both stand alongside C-E1."
RESIDUE · ⭐ "MAIA assigns a phase" remains unevaluable until the referent is named (VC-phase). The
"deliberately not appended" limb is a separate fact about surfacing, ⛔ not adjudicated here.

```text
ITEM      C-E3 · the route both has no phase and injects one
OUTCOME   C6 UNKNOWN
```
BASIS · "`maiaService.ts:1727/:1737/:2275` state in code that the route has no phase and default to 1"
against "`maiaService.ts:1098` computes `Phase detected: …` for the same route's prompt", carried as "made
by the same file about the same turn". ⛔ But the corpus also declares, at VC-phase, that it "cannot evaluate
'MAIA assigns a phase' until the referent is named", and it names ⛔ no referent for either site. Whether the
two statements concern one phase vocabulary or two therefore requires a likelihood judgement.
RESIDUE · OWED READ (§5): the phase vocabulary in force at `:1727/:1737/:2275` and at `:1098`. ⛔ Not
performed. Depends on VC-phase.

```text
ITEM      C-E4 · "8 voices" vs the code
OUTCOME   C5 GENUINE CONTRADICTION
```
BASIS · Side A `CLAUDE.md` — "MythicAtlas + MaiaVoice + ShadowAgent + Fire/Water/Earth/Air/Aether";
Side B code — "MythicAtlas + MaiaVoice + **WisdomRouter** + up to six elemental rows in which `shadow` is an
ELEMENT VALUE, not a separate ShadowAgent". Both are descriptive enumerations of one composition (P-A).
RESIDUE · ⭐ D-P1-06 constrains the reading, ⛔ not the class: the anchor "is not permitted to override a
ratified or otherwise stronger governing source merely because every session reads it first", and the
conflict is PRESERVED + REPORTED. ⛔ No repair. ⛔ No dated evidence of an earlier composition exists, so no
`C3` reading is available.

```text
ITEM      C-E5 · "imported only by soulPortrait/schema" vs zero importers
OUTCOME   C5 GENUINE CONTRADICTION
```
BASIS · Side A "the cited import"; Side B "at the subject `lib/soulPortrait/schema.ts:19` is a **comment,
not an import**". Carried: "The subject reading governs E's record; both preserved."
RESIDUE · The artifact that carries the citation is ⛔ not identified in the permitted evidence, so no
provenance or dating of the claim is available and no `C3` reading can be tested.

```text
ITEM      C-E6 · continuity substrate with no writer
OUTCOME   C6 UNKNOWN
```
BASIS · Side A "migration :1-5 'prevents treating returning members like new people'; `CLAUDE.md` documents
a live wire into `oracle/conversation/route.ts`"; Side B "that route refuses at `:446-453`". Side B is
exactly the characterization X-DEF-2 holds open — the same route is recorded there as a live cognition
path, as unconditionally refused, and as ~zero traffic, with the corpus refusing to let any settle it.
RESIDUE · Depends on X-DEF-2 (owned by `01_named_objects`) — §6. OWED READ (§5): a dated runtime witness for
the route. ⛔ Not performed. ⛔ "no reachable writer" is NOT LOCATED, not ABSENT.

```text
ITEM      C-E7 · R16 strips; the member API returns unstripped
OUTCOME   C1 RESOLVED BY SCOPE
```
BASIS · The corpus names the scoping itself: "**Two different boundaries, one field class.**" Side A
`developmentalStateAdmission.ts:31-39,:61` (prompt-shaping admission); Side B
`app/api/members/spiral-state/route.ts:28-29` (member-facing read). Both true of their own boundary.
RESIDUE · Whether one field class ought to cross both boundaries is a governance question with ⛔ no located
source; P1-GOV-ACCESS-01 stands adjacent. ⛔ Not adjudicated (the corpus's own words).

```text
ITEM      C-E8 · S-16 shape against a nonexistent Prisma model
OUTCOME   C2 RESOLVED BY ALTITUDE
```
BASIS · ALTITUDE 1 — implementation: "code present and route-exposed". ALTITUDE 2 — data-model declaration:
"`prisma.spiralProcess` has no declared model among 53". Both hold; a route may exist while the model it
names is undeclared.
RESIDUE · What happens if the path is reached is ⛔ not established — no runtime witness, and reachability is
not traced. ⛔ No inference drawn from the absence of a model to the behaviour of the route.

```text
ITEM      C-F1 · I Ching prompt vs the symbolic lens boundary
OUTCOME   C2 RESOLVED BY ALTITUDE
```
BASIS · ALTITUDE 1 — ratified canon: `MAIA_SOVEREIGNTY_INVARIANTS.md:245`, "Tier 1 names I Ching: only
'this tradition associates…'". ALTITUDE 2 — deployed implementation:
`app/api/changes/[id]/interpret/route.ts:21,40` (+ identical studio route) — "Do not explain the I Ching
tradition — speak from within it." / "Speak as if the hexagram itself is addressing the person." The corpus
states the altitude difference itself: "⛔ Side B is canon-bound; Side A is deployed on a
member-authenticated, persisting route."
RESIDUE · ⭐ A same-altitude limb remains: two deployed prompts differ from each other —
`maia/list/route.ts:283` "frame it explicitly as a traditional association" against `interpret/route.ts:21`.
Two routes are two objects (`C1`), yet one canon clause is quoted over both. ⛔ Preserved, ⛔ not repaired,
⛔ no verdict of legitimacy.

```text
ITEM      C-F2 · `safe_for_retrieval`
OUTCOME   C2 RESOLVED BY ALTITUDE
```
BASIS · ALTITUDE 1 — protocol document: `CORPUS_DISCIPLINE_PROTOCOL_v1.0.md:104` — "indexed but never
retrieved". ALTITUDE 2 — implementation: "zero occurrences in code or SQL". The corpus itself refuses the
truth-contest framing: "not resolved by deciding which is 'really' true."
RESIDUE · ⭐ The protocol's mechanism is NONE LOCATED in code, ⛔ not ABSENT; whether the discipline is
achieved by some other located mechanism is ⛔ not established.

```text
ITEM      C-F3 · P1-01 slice 05 versus the code on tarot
OUTCOME   C4 RECORD DEFECT  (C4-CENSUS)
```
BASIS · Side A `P1-01` — "tarot named in three canon docs, **zero files**"; Side B the subject re-read —
"1,901 ln across 5 files plus a live route". Carried: "The re-read governs F's record; both recorded." The
disagreement is between two census passes, ⛔ not between two organism behaviours.
RESIDUE · ⛔ The P1-01 record is NOT corrected here and is NOT described as needing correction; both
readings stand side by side, as the close record requires of census self-catches. Artifact 2 material.

```text
ITEM      C-F4 · SYMBOLIC_LENS_BOUNDARY scope vs wiring     (source class: TENSION)
OUTCOME   C2 RESOLVED BY ALTITUDE
```
BASIS · ALTITUDE 1 — declared scope: "declared over six families at `:282`". ALTITUDE 2 — wiring: "applied
at two call sites (`:646`, `:732`). Archetypes, cycles, and the I Ching / Tarot that Invariant 13 adds are
not reached." Both hold.
RESIDUE · Carried and ⛔ not converted into a defect claim: the wrapper is "a model-compliance instruction,
not a structural refusal. Nothing measures obedience; no test, falsifier or post-generation check found"
(E-18), and Invariant 13's Tier-2 refusal "has ⛔ no implementing code anywhere in Domain F" (E-19).

```text
ITEM      C-F5 · the oracle/conversation route's traffic
OUTCOME   C6 UNKNOWN
```
BASIS · Side A `CLAUDE.md` — "receives ~zero live traffic"; Side B "`oracle/conversation/route.ts:30`
imports `evaluateEncounter`; `OracleConversation.tsx:9723` renders `SacredPassageBlock`". The corpus
forecloses the only available resolution: "⛔ the anchor may not settle this by assertion", and an import
plus a render are not traffic (INF-1).
RESIDUE · OWED READ (§5): a dated in-repo runtime witness for the route under the LIVE calibration.
⛔ Not performed. This item is X-DEF-2's SIDE C — depends on X-DEF-2 (owned), §6.

```text
ITEM      C-F6 · Two objects named `PersonalOracleAgent`
OUTCOME   C1 RESOLVED BY SCOPE
```
BASIS · The records distinguish the objects by path: "`lib/agents/PersonalOracleAgent.ts` — consumes
`lib/knowledge`, unreached from `app/`" against "`app/api/_backend/src/agents/PersonalOracleAgent` —
reached from two routes; declared sovereignty-violating and retired at `app/api/maia/chat/route.ts:7,26`".
Carried: "⛔ Not merged."
RESIDUE · ⭐ A `C6` sub-question rides inside and is ⛔ not dissolved by the classification: "⛔ which of the
two objects those citations mean is NOT DETERMINED BY SOURCE RECORD" for P3-D-14 · P3-E-19 (E-36, itself
classed SYN-4) — owed read, §5.

---

## 3 · PART III-C · register 03 / slice 06 · domains G · H · I (19 items)

⚠️ The declared ID collision is kept: `C-1 (G)` … `C-6 (G)` are register 03's labels, ⛔ not register 01's
`C-1 (§8.1)` … `C-5 (§8.5)`. ⛔ Neither was renamed.

```text
ITEM      C-1 (G) · provider failure
OUTCOME   C1 RESOLVED BY SCOPE
```
BASIS · The corpus names the seams and forecloses the altitude reading itself: "**This is not a
document-versus-code conflict. Both behaviours are implemented, on different seams**, at the same subject."
DEGRADE — `lib/ai/sovereignRouter.ts:15-17,50-61` returns `DEGRADED_TEXT` "as an ordinary TextResult on four
failure branches"; REFUSE — `lib/ai/structured/router.ts:116-131` returns
"`{ ok:false, refusal:'provider_unavailable' }`" with "THE FAILURE STOPS HERE"; SIDE C — "with
`MAIA_INFERENCE_MODE` unset, `modelService.ts:180-193` falls back to a local Ollama text model with no drift
event". PART V records the two coverage families: CONVERSATIONAL TEXT vs STRUCTURED-READING.
RESIDUE · ⭐ "Which governs production: UNKNOWN" — owed read (§5), and the value lies outside the permitted
evidence entirely. ⛔ INF-3: an environment variable selecting the disposition authorizes nothing.

```text
ITEM      C-2 (G) · CLAUDE.md vs the tree on cloud providers    (also PART IV, one of the two anchor-level divergences)
OUTCOME   C6 UNKNOWN
```
BASIS · Side A `CLAUDE.md` — "Never use OpenAI or other cloud AI providers." Side B `provider-policy.json`
"tiers OpenAI as `lab` / `removal_in_progress` with a 32-file allowlist — **a governed migration debt, not a
prohibition**", with "30 live-tree files import the SDK or call api.openai.com", `Dockerfile:57`
`OPENAI_API_KEY=dummy-build-key`, and "`docs/adr/012` is Open / Deferred". ⛔ The item cannot be classed by
altitude because the corpus declares one altitude undetermined: "**Authority standing UNKNOWN.**" Per the
instrument, an altitude that cannot be established is `C6`.
RESIDUE · ⭐ The norm-vs-tree limb ALONE would be `C2` — a prohibition quoted at governance altitude against
30 named importing files at implementation altitude (INF-4) — and the SECOND LIMB likewise: "'or other cloud
AI providers' is contradicted by Moonshot, in the tree, reachable by a per-request `meta` flag, in no tier
and no guard." ⛔ Neither limb is promoted to the item's class. D-P1-06 binds: the anchor may not override a
stronger governing source by assertion, the divergence is PRESERVED + REPORTED, ⛔ repair unauthorized.
OWED READ (§5): whether `provider-policy.json` and ADR-012 are ratified governing sources.

```text
ITEM      C-3 (G) · "Main gateway for ALL text generation"
OUTCOME   C5 GENUINE CONTRADICTION
```
BASIS · Side A `lib/ai/modelService.ts:71-73`; Side B `scripts/anthropic-import-allowlist.json` "(2 + 1 +
57)". Carried: "**Both are the project's own text.**" A universal descriptive claim against the project's
own enumeration of direct importers (P-A).
RESIDUE · ⚠️ The allowlist is a CI instrument — INF-2, CI-GATED ↛ RUNTIME GOVERNED — so it evidences
importers, ⛔ not governance. Shares its Side A sentence with A-6 (E-23); ⛔ the two items are not merged.

```text
ITEM      C-4 (G) · ADR-001 (Accepted) vs `selectClaudeModel`
OUTCOME   C2 RESOLVED BY ALTITUDE
```
BASIS · ALTITUDE 1 — governance: ADR-001 "prescribes 7-level awareness → Opus/Sonnet routing 'in
`lib/ai/claudeClient.ts`'" and "says all routing decisions **MUST** follow it". ALTITUDE 2 —
implementation: "`claudeClient.ts:50-86` routes on `reasoningMode` and force flags and defaults to Sonnet,
awareness level surviving only in a log string". Both hold (INF-4).
RESIDUE · ⭐ The code asserts a "NEW PHILOSOPHY (Jan 2026)" while "**No superseding ADR or ruling was
located**" — NONE LOCATED, ⛔ not ABSENT, and ⛔ an in-code assertion is not a governing act. OWED READ (§5):
a governing-source search for a superseding ADR or ruling. ⛔ Not performed.

```text
ITEM      C-5 (G) · the degraded string's claim vs the seam
OUTCOME   C6 UNKNOWN
```
BASIS · Side A `sovereignRouter.ts:16` — "I've saved your message."; Side B — "The router performs no
persistence." The corpus withholds the fact that would settle the end-to-end claim: "**Whether a caller
persists the turn is caller-dependent and is not resolved.**"
RESIDUE · ⭐ The ratified wording is carried exactly and ⛔ not strengthened: "The emitting seam makes a
persistence claim it does not itself discharge; end-to-end truth of that claim is caller-dependent and
presently unresolved." ⛔ NOT "MAIA lies about saving" — "That stronger statement has not been earned."
OWED READ (§5): whether the callers of `sovereignRouter` persist the turn on the four degraded exits.

```text
ITEM      C-6 (G) · declared scope of Kimi vs its trigger
OUTCOME   C6 UNKNOWN
```
BASIS · Side A `modelService.ts:126` — "Never used for live chat - only when explicitly requested";
Side B `:127` "`req.meta?.useKimi`, where `meta` is `Record<string, unknown>` with **no validation and no
provenance**". ⛔ With the flag's provenance undetermined by the corpus's own words, whether a live-chat
request can set it — and therefore whether Side A is contradicted — requires a likelihood judgement.
RESIDUE · OWED READ (§5): the provenance of `req.meta` at the live-chat entrypoints — who may set it.
⛔ Not performed. ⛔ INF-3: a request flag selecting a provider authorizes nothing.

```text
ITEM      C1 (H) · MAIA'S DEFAULT VOICE PROVIDER
OUTCOME   C6 UNKNOWN
```
BASIS · Two sources each claiming canon status over the same default: Side A `lib/tts/cloudVoicePolicy.ts:1-40`
("VOICE-SOVEREIGNTY-01, Founder canon ruling, 2026-08-27") — "⛔ THE DEFAULT IS THE CANON. Cloud voice is
forbidden unless `MAIA_ALLOW_CLOUD_VOICE=1` is set explicitly"; Side B `app/api/voice/openai-tts/route.ts:115,128-131`
— "MAIA vow: default voice is always maia_core (OpenAI Alloy)", with "unset or unknown archetype resolve to
OpenAI". The corpus declares the adjudicating facts missing: "**Both sides call themselves the vow**"; "the
archetype branch returns before the qualification, canon and consent gates are reached"; "the env var each
depends on is set for one side and absent for the other in the production compose file"; "**UNKNOWN.**"
RESIDUE · OWED READ (§5): which path serves a production voice turn (runtime witness), and the standing of
the in-route "MAIA vow" sentence as a governing source. ⛔ Not performed. ⛔ `MAIA_VOICE_OVERRIDE`'s absence
from the production compose is NONE LOCATED, not ABSENT.

```text
ITEM      C3 (H) · non-degradation gate reads green
OUTCOME   C2 RESOLVED BY ALTITUDE
```
BASIS · ALTITUDE 1 — CI instrument: "the gate asserts convergence — one cognition call, reached once".
ALTITUDE 2 — runtime egress: "convergence says nothing about EGRESS. The 2026-09-07 defect … left this gate
GREEN throughout." Both hold — INF-2, CI-GATED ↛ RUNTIME GOVERNED.
RESIDUE · Carried whole: "The repair exists and the gap is structurally closed — but by a **SECOND,
SEPARATE gate**, and the non-degradation gate is still green independently of it." ⛔ Whether any instrument
now asserts egress as a gate condition is not restated in the permitted evidence.

```text
ITEM      C4 (H) · sovereignty of the ear
OUTCOME   C1 RESOLVED BY SCOPE
```
BASIS · The corpus names the scoping itself: "**Both sentences are true of different transports**; neither
is qualified in the other's presence." Side A `transcribe-simple/route.ts:11-14` and `transcribe/route.ts:27`
— "inbound member audio never leaves the host", "never OpenAI cloud"; Side B — "the DEFAULT transport for
Chrome and Safari members is `web-speech`, where recognition is performed by the browser vendor off-device;
Desktop alone is refused Web Speech, by shell classification".
RESIDUE · ⭐ The qualification that makes both true exists ONLY in this census — the source sentences are
unqualified where they sit, on the routes, while the default member transport is the other one. ⛔ No repair.
Related to C2 (H), which is adjudicated separately and differently.

```text
ITEM      C5 (H) · Sanctuary and the voice path
OUTCOME   C2 RESOLVED BY ALTITUDE
```
BASIS · ALTITUDE 1 — declared invariant: `CLAUDE.md` Sanctuary invariant 1 ("No content retention") and
invariant 6 ("Absolute boundary"). ALTITUDE 2 — implementation: "four `saveConversationMemory` call sites,
none gated on `isSanctuary`; `lib/services/memoryService.ts` contains no occurrence of 'sanctuary' in any
case". Both hold (INF-4).
RESIDUE · ⭐⭐ The altitude is weaker than it looks and the weakness is carried, ⛔ not hidden: "the six
Sanctuary invariants live in `CLAUDE.md`, which D-P1-06 classes as **evidence, ⛔ not a governing source**"
(B-23, E-27). So this is an unlocated-governance finding as much as a divergence: ⛔ NONE LOCATED, not
ABSENT. Carried: "⚠️ MODALITY-SYMMETRIC — the typed path is identical; routed out, not repaired."
⛔ No verdict of legitimacy, ⛔ no exposure claim.

```text
ITEM      C6 (H) · citation coordinates
OUTCOME   C4 RECORD DEFECT  (C4-ORGREC)
```
BASIS · "Canon names the convergence at `:7268`; it is at `:7397`." · "The exit map and the test header both
name the crisis script at `:6712`; it is at `:6854`." · "The stale comment the canon flags at `:7266` is
still present at `:7395`". Coordinates in documents and test headers are bookkeeping about records,
⛔ not organism behaviour.
RESIDUE · ⚠️ Two characterizations are carried and ⛔ neither is chosen: slice 06 says "⛔ Recorded as
staleness, ⛔ not divergence", while the register classes it DIVERGENCE. ⭐ This `C4` is a defect in the
ORGANISM's records, ⛔ NOT in the census's — it is not artifact-2 material. The stale comment still reads
"Browser STT → /api/between/chat → Browser TTS"; ⛔ no repair.

```text
ITEM      C-I-1 · "Deferred, held FALSE, no path" vs a live path
OUTCOME   C5 GENUINE CONTRADICTION
```
BASIS · Side A `20260626000001_member_field_note_threads.sql:8,40,96` "states the capability DEFERRED and the
column '**held FALSE, no path**'"; Side B `app/api/maia/vision-studio/field-note/route.ts:107-130` "binds it
to a client-supplied value" and `app/studio/fields/[memberId]/page.tsx:69` "reads it". "No path" is a
descriptive claim about the column, against a located path (P-A).
RESIDUE · Whether the route is reached is ⛔ not established (INF-1) — and ⛔ it need not be: the `C5`
attaches to "no path", which a located binding refutes. The deferral's authority is ⛔ not established (INF-4).

```text
ITEM      C-I-2 · "the consented facilitator view" vs a role-only gate
OUTCOME   C5 GENUINE CONTRADICTION
```
BASIS · Side A `page.tsx:9-11` "asserts consent"; Side B the same file at `:104-107` checks "only that the
viewer is *some* active practitioner", and `:79-85` applies "**no predicate at all** to `members.name` /
`members.username`". One file's header sentence against its own located gate (P-A).
RESIDUE · No consent predicate is located anywhere on this page — NONE LOCATED, ⛔ not ABSENT.
P1-GOV-ACCESS-01 stands adjacent. ⛔ No verdict of legitimacy; ⛔ no exposure claim — that is not this
census's territory and `AUTH-EXPOSURE-01` is neither cited nor awaited.
