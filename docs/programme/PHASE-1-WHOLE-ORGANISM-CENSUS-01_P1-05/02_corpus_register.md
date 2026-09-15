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
