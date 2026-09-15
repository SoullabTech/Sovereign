# PHASE-1-WHOLE-ORGANISM-CENSUS-01 · P1-07 · FOUNDER PACKET · PARTS I · II · III

```text
STEP     P1-07 · founder-packet assembly (worker W1)
TYPE     ASSEMBLY and COMPRESSION of already-earned evidence
         ⛔ NOT a census · ⛔ NOT an adjudication · ⛔ NOT a design
BOUND BY P1-07 SCHEMA (frozen at d8525435, before any part was populated)
         P1-07 DISPATCH (cross-worker rule)
SOURCES  P1-00 custody · P1-01 slices + close · P1-02 domain records · P1-03 registers +
         ladders + close · P1-04 maps + close · P1-05 artifacts + close · P1-06 rows + ruling
```

> ⭐⭐ **This packet does not tell the founder what the system should become. It establishes what
> the census permits the founder to decide about what comes next.**

> **The packet may COMPRESS the evidence. ⛔ It may not INCREASE its claim strength.**
> **Compression may remove repetition. ⛔ It may not remove epistemic distinctions.**

```text
⛔ NOT DONE IN THIS ACT
   no source code read · no runtime evidence sought · no C5 or C6 resolved
   no AUTH-EXPOSURE-01 finding imported · nothing designed · no kernel rule written
   no governance repaired · no file edited but this one
⚠️ AUTHORITY IS PART IV'S. Contradictions and unknowns are PART V'S.
   Neither is previewed, summarized or pre-decided here.
```

---
---

# PART I — WHOLE-ORGANISM MAP

*The system as it actually exists, assembled from P1-04's four maps.*

## I.1 · What was examined

| Field | Value | Source |
|---|---|---|
| Repository | `SoullabTech/Sovereign`, branch `clean-main-no-secrets` | P1-00 §1 |
| Census subject | `1a5554300e855d3581085849301a39cbb10ab385` | P1-00 §1 |
| Divergence from canonical | **0 ahead · 0 behind** — subject and canonical are the same commit | P1-00 §1 |
| Governing sources classified | **151**, across 8 slices | P1-01 close |
| Named objects censused | **221 rows**, across 9 domains | P1-03 registers; P1-04 MAP 1 header |
| Runtime / database / production access | ⛔ **NONE** in the census container | P1-02 instrument §3 |

⭐ The last line is load-bearing for the whole packet. It is why Part II is the size it is.

## I.2 · The nine domains and the 221 rows

```text
A  CANONICAL COGNITION / MAIA          17    the member turn, the tiers, the prompt regimes, egress
B  MEMORY / ANAMNESIS                  31    retrieval, bundles, atoms, write-back, gates
C  DEVELOPMENTAL + RELATIONAL MEMORY   14    readings, spiral state, relationships, patterns
D  FIELD INTELLIGENCE                  46    field context, resonance, coherence, telemetry, named terms
E  SPIRALOGIC / ELEMENTAL              29    trackers, bridges, phase logic, modality registry
F  SYMBOLIC SYSTEMS                    36    I Ching, tarot, runes, astrology, archetypes, lenses
G  MODEL / PROVIDER / ORCHESTRATION    18    gateways, providers, allowlists, commit + deploy lanes
H  SENSORY / VOICE                     18    ear, mouth, transports, guards, seams
I  MEMBER / PRACTITIONER               12    studio, caseload, supervision, visibility channels
                                      ───
                                      221
```

⛔ **The nine domains are a census partition, not an architecture.** No record claims they are the
organism's own joints; several objects appear in two domains' prose and were deliberately **not**
merged (P1-04 MAP 1 §6 · N-06, N-07, N-08, N-09).

## I.3 · The cognition-family topology — what Domain A established

⚠️ Carried with **every** Domain A row: **`CANONICAL COGNITION BOUNDARY = UNKNOWN`** (P1-02
`A_canonical_cognition.md` §1). There is no ruled boundary at the subject.

### I.3a · At least six MAIA-claiming cognition families

Register 01 issued thirteen `F-*` restatement handles for the families its records traced
(P1-04 MAP 1 §3, VOCAB-1). The register's own warning travels with them: *"The source records issued
**no family labels of their own**… ⛔ not a new taxonomy and ⛔ they do not assert that any two are
the same mind."*

```text
FAMILY                     ROW THAT IS IT      WHAT THE RECORD SAYS
F-LIST-FAST                A-03                FAST prompt assembly on the canonical route
F-LIST-CORE                A-04                CORE prompt assembly (+ shared ADDENDA_SPECS)
F-LIST-DEEP-PRIMARY        A-05                DEEP — three statuses inside one seam,
F-LIST-DEEP-CONSULT        A-05                ⛔ not collapsed by the register
F-LIST-DEEP-REPAIR         A-05
F-RCN                      A-06                early-return cognition; ⛔ "returns before the switch"
F-WS-FOCUS                 A-07                Writers-Studio turn; ⛔ "bypasses the switch"
F-SHADOW                   A-08                CMT-01 shadow; "MEMBER-FACING EFFECT: none"
F-BETWEEN                  A-11                /api/between/chat, registry `live-secondary`
F-MAIA-SIBLING             A-12                dormant predecessor route
F-ORACLE                   A-13                ⚠️ SYN-3 status — see Part V, ⛔ not resolved here
F-VOICE-STREAM             A-14                own Claude service; ⛔ "CONVERGENCE: NONE"
F-PERIPHERAL               A-15                25 MAIA-claiming routes, censused AS A CLASS
```

⛔ **"At least six" is the honest floor, not a count.** The thirteen handles are one register's
restatement; register 02 names **paths** instead (VOCAB-2) and register 03 names **three
descriptions** (VOCAB-3), and **no record equates any two vocabularies** — P1-04 declined the
equation twice, explicitly (MAP 1 §6 · N-01, N-02).

### I.3b · Ingress — several, not one

Member-facing entry points that produce MAIA-claiming text, enumerated at the subject
(`A_canonical_cognition.md` §A-01, §A-06, §A-07, §A-11, §A-15, §A-14):

```text
A-01  POST /api/sovereign/app/maia/list          the canonical member chat turn
A-06  RCN early return                            inside A-01, returns before the tier switch
A-07  POST /api/writers-studio/focus              feature-flagged; 404 when off, ⛔ not 403
A-11  POST /api/between/chat                      registry `live-secondary`
A-15  25 peripheral MAIA-claiming route handlers  ⛔ censused as a class, ⛔ INF-5
A-14  /api/voice/stream-conversation (SSE)        route exists; its consumer no longer invokes it
```

### I.3c · Convergence — three statements the census made, kept apart

```text
CONVERGES     A-11 → `generateMaiaTurn` → maiaOrchestrator.ts:506 → `getMaiaResponse`
              ⚠️ and the route registry says the opposite at maiaRuntimeContext.ts:81
              (`callsMaiaResponse: false`) — A §3 contradiction 1, ⛔ unreconciled
CONVERGES     A-07 → writersStudioCognition.ts:124 → `getMaiaResponse`, ⭐ while
              BYPASSING the FAST/CORE/DEEP switch entirely (A §A-07)
CONVERGES     A-01's tier families at `maiaService.ts:2704` (A §A-09 convergence point)
⛔ NONE       A-14 — "Zero references to getMaiaResponse, maiaService, buildMaiaWisePrompt
              or finalizeMemberFacingText (verified by grep)"
⛔ NONE       A-15 — "⛔ NONE with getMaiaResponse", as a class
```

### I.3d · Egress — resolved by the census, and resolved to plurality

> ⭐ **"P1-01's `UNKNOWN` on egress is RESOLVED to: SEVERAL, ENUMERATED BELOW — with no single
> chokepoint."** (`A_canonical_cognition.md` §A-10)

`list/route.ts:1966` (A-01) · `maiaService.ts:3241` (A-06) · `between/chat/route.ts:776` (A-11) ·
`writers-studio/focus/route.ts` (A-07) · the 25 routes of A-15 · `voice/stream-conversation` SSE
(A-14, uninvoked). `finalizeMemberFacingText` **governs only the `getMaiaResponse` family**.

⭐ Domain H reaches the same shape from the other side: the eleven Class C `await maiaSpeak(` sites
"bypass canonical egress finalization entirely", with **no model in the path** (P1-04 MAP 1 · H-09).

### I.3e · Identity source — distributed, not singular

```text
A-09   MAIA identity / system prompt      96 declaration sites
       ⭐ ONE named source reaches FAST + CORE + DEEP-REPAIR
       ⚠️ "The other 95 sources … family coverage is NOT DETERMINED"   (MAP 1 · A-09)
A-16   `generateText`, declared in-source "Main gateway for ALL text generation in MAIA"
       ⚠️ "THE GATEWAY CLAIM IS FALSE AT THE SUBJECT" — A-14, six A-15 routes with
       `new Anthropic()`, A-13's MultiLLMProvider and DEEP-primary's consciousnessWrapper
       all reach a model without passing it.  ⭐ Both sides preserved.   (A §A-16)
```

## I.4 · What the four maps established

### MAP 1 — participation topology

```text
221 row nodes + 16 family nodes · 61 edges (SYN-1 56 · SYN-2 1 · SYN-3 4 · SYN-4 0) · 22 declined
```

⭐ **An edge exists only where a record's own quoted text establishes the relation.** Twenty-two
relations that "looked natural" were declined and named, so the sparseness is auditable (MAP 1 §6).
⛔ `SYN-4` edges were omitted entirely — never dotted, never *probable*.

⭐⭐ **The map's own most important reading, carried unchanged:** *"the three halves of the corpus
are not describable in one vocabulary, and the census did not force them into one."* A
`PARTICIPATES` column empty in six domains and full in three records **three different reading
rules**, ⛔ not a topology of the organism (MAP 1 §7).

```text
PARTICIPATES  A·B·C  UNKNOWN · SYN-4   ⛔ no P1-02 record used the rung
PARTICIPATES  D·E    UNKNOWN · SYN-4   ⛔ the same gap
PARTICIPATES  F      2 rows  · SYN-1   F-07 · F-08 — the only two in 147 rows (A…F)
PARTICIPATES  G·H·I  41 of 48· SYN-1   under a reading rule slice 06 DECLARED
⛔⛔ THE 41 AND THE ZEROS ARE NOT COMPARABLE and must not be read as a density
   difference between halves of the organism.                            (MAP 1 §2)
```

### MAP 2 — causal altitude

```text
LAYER         A·B·C   D·E·F   G·H·I   TOTAL
EXISTS           11      31      48      90   ⚠️ THREE DIFFERENT BASES, ⛔ not merged
KNOWS            22       0      13      35
CONSIDERS        15       0       0      15
CONTRIBUTES      12      11      24      47
DECIDES          10       2      25      37
UNKNOWN (row)    12      65       0      77
```

⛔⛔ **No monotonic inference.** A row appears in a layer only where a slice recovered that position
for that row with a quote; the layers do not nest and the counts do not sum to 221 (MAP 2 §1, §2).

⚠️ **`EXISTS 48/48` in G·H·I is a slice-level shared basis, ⛔ not per-row and ⛔ not coverage** —
and in A·B·C and D·E·F `EXISTS` means the *opposite* thing: *established not to participate*
(MAP 2 §3a, §3b, §3c).

⭐⭐ **`CONSIDERS = 0` is two different kinds of zero, kept apart:** 47 rows where the question was
never posed (`SYN-4`), and **one row where it was posed and answered in the negative** — P3-G-03,
*"At the subject, `selectClaudeModel()` never reads an awareness level"* (`SYN-1`, an OBSERVED
NEGATIVE). ⛔ A single zero would erase the finding (MAP 2 §5b).

⭐⭐ **The ladder is not a staircase.** MAP 2 §9 carries the non-monotonic rows as positive evidence
— including `B-17` (CONSIDERS **without** KNOWS) and `G-03` (KNOWS **without** CONSIDERS), *"the two
halves of the same law, recovered by two different workers on two different slices."*

### MAP 3 — authority graph · ⚠️ PART IV'S

⛔ Not previewed here beyond naming that it exists and covers 183 of 221 rows (P1-04 close §3).

### MAP 4 — contradiction topology · ⚠️ PART V'S

⛔ Not previewed here beyond naming that it exists: 92 item blocks, 47 classed edges, and a `SYN-4`
class separating *"the sources conflict"* from *"we cannot tell whether they conflict"* (P1-04
close §3).

## I.5 · Four reading rules that travel with this map

1. ⭐ **Vocabulary collisions are evidence, not noise.** `field` names 7 objects (+2 in the memory
   corpus), `voice` 4, `mode` 3, `convergence` 3, `coherence` 3, `RFI` 2 — found independently in
   six of eight P1-01 slices. *"Any sentence of the form 'RFI is built' or 'RFI is not built' is
   **ambiguous until its referent is named**"* (P1-01 close §3a).
2. ⛔ **`NOT DETERMINED BY SOURCE RECORD` is not `NOT APPLICABLE`.** The registers wrote the second
   only where a record **affirmatively** established there was no seam (P1-03 register 01 header).
3. ⛔ **Directory membership was never treated as status**, and **no ancestry was reconstructed**
   (P1-01 close §1, disciplines 1 and 2).
4. ⭐ **The graph represents the evidence density of the organism, not the coherence we wish the
   organism had** (MAP 1 header).

---
---

# PART II — STRONGLY EVIDENCED LIVE ARCHITECTURE

## II.0 · The admission rule, unrelaxed

```text
ADMISSION REQUIRES   a traced call path at the census subject
                 AND a dated in-repo runtime / production witness record
                     ⭐ BOTH, or it is not LIVE

only wiring established  →  WIRED-BUT-UNOBSERVED  →  ⭐ PART III, ⛔ not Part II
```

This is the census's own binding calibration, declared in the P1-02 instrument §3 **before** any
domain was censused, and applied verbatim by every domain record.

⛔ **There is no "basically live", no "effectively live", no "live in practice".** No such category
was created here, and nothing was promoted into Part II to make it less short.

## II.1 · Admitted — two rows, of 221

### `P3-A-01` · Canonical member chat turn — `POST /api/sovereign/app/maia/list`

```text
STATUS IN THE REGISTER   LIVE
ALTITUDE                 EXISTS · WIRED · RUNTIME-GATED · OBSERVED
TRACED PATH              POST list/route.ts:285 → ensureSchemaReady (:298) →
                         resolveMemberIdentity (:329) → turn-acceptance write →
                         addenda assembly → buildMaiaRuntimeContext (:1219) →
                         assertProviderAvailable (:1362) → getMaiaResponse (:1365) →
                         response construction (:1790-1830) → jsonWithCors (:1966)
WITNESS                  app/api/sovereign/app/maia/route.ts:8-9 — an in-source record of a
                         2026-05-23 48-hour production-log audit: "99 hits to /list, 0 here"
SOURCE                   P1-02 A_canonical_cognition.md §A-01; P1-03 register 01 P3-A-01
```

⚠️ **The census's own two qualifications on this witness, carried unchanged and ⛔ not softened:**
it is *"~4 months older than the subject"*, and it is *"a **traffic** observation, not an
observation of this route's present behaviour."* The record's stated unresolved question is
*"whether the 2026-05-23 traffic audit still describes the subject."*

⚠️ Carried with it: `CANONICAL COGNITION BOUNDARY = UNKNOWN`, and the route's own outbound
`meta.endpoint` literal reports the **sibling** path (`list/route.ts:1390`), acknowledged in-source
as a pre-existing mislabel left untouched.

### `P3-B-03` · `loadMemberMemoryAtomsForPrompt` — `member_memory_atoms`

```text
STATUS IN THE REGISTER   LIVE (path, per calibration) · predicate UNKNOWN in production
ALTITUDE                 EXISTS · WIRED · RUNTIME-GATED · OBSERVED
TRACED PATH              lib/maia/memoryAtomsLoader.ts:230 (predicates :278-291, guard :185-186)
                         → route :994 → atomsAddendum :1006 → meta :1424 →
                         FAST maiaService.ts:1444/:1507 · CORE + DEEP-repair maiaVoice.ts:427
                         (ADDENDA_SPECS) · DEEP-consultation maiaService.ts:2388
                         ⛔ F-LIST-DEEP-PRIMARY has no memory prompt seam
WITNESS                  docs/ops/MAIA_MEMORY_SELECTION_REALITY_REPORT_2026-08-04.md:8 —
                         "4 `[MAIA/sovereign] atoms loaded` emissions in 48h, most recent
                         { count: 8, … } — the path fires under real member traffic and the
                         limit saturates." Deployed SHA 57b0324fd, container created
                         2026-08-04T15:27Z, verified via printenv GIT_COMMIT (:5-7)
SOURCE                   P1-02 B_memory.md §2.5; P1-03 register 01 P3-B-03
```

⚠️⚠️ **The distinction the census drew here is the one a compression would destroy, so it is
reproduced in the record's own words:**

> *"The witness is dated and its SHA is not the census subject… The **path** is the same; the
> **selection predicate has moved since the witness was taken**. `LIVE` is asserted for the path.
> It is **not** asserted that the current predicate has been observed in production."*

Specifically, the witness's quoted `WHERE` clause does not contain `PRACTITIONER_ATTRIBUTION_GUARD`
or the `member_response_status` predicate, both present at the subject
(`memoryAtomsLoader.ts:286-287`).

⭐ The register also records this as carrying *"the strongest memory-side gate found anywhere in the
domain"* — a `sacred_protected` absolute surfacing refusal at the SQL boundary. ⛔ That is a
description of a gate, ⛔ not an authority finding; authority is Part IV's.

## II.2 · Examined and ⛔ NOT admitted — with the reason in each case

| Candidate | Why it is not in Part II |
|---|---|
| `P3-F-06` divinationRecallLoader | ⭐⭐ **A dated founder-run production witness (2026-09-03) exists — and it recorded ABSENCE**: 5 rows all-time, newest 2026-06-11, the block *"would report `candidateCount: 0`"*. The register's ruling: *"a traced wire with a witness of zero output, ⛔ not LIVE"* (INF-1). ⛔ **A witness is not a witness *for* something merely by being dated.** (register 02 · P3-F-06) |
| `P3-A-07` Writers-Studio focus turn | A witness record exists in-repo (`FOCUS-WITNESS-01_RESULT_2026-09-10.md`) but *"was not read for runtime-production status in this slice"*, and the feature flag defaults off. → WIRED-BUT-UNOBSERVED (A §A-07). |
| `P3-A-08` CMT-01 canonical-turn shadow | Its own witness record states the live `zeroDiff:true` witness is **NOT yet obtained** (`CMT-01_M0-M2_WITNESS_2026-09-03.md:99`). → OBSERVATION-ONLY (A §A-08). |
| Every row in Domain D | *"**No dated runtime witness for any field object was located.** … In participation vocabulary: **0 LIVE**"* (`D_field.md` §0, §12). |
| Every row in Domain E | *"`LIVE` ⛔ NONE — no runtime or production witness available in this container"* (`E_spiralogic_elemental.md` §13). |
| Every row in Domain H | *"⚠️ **No in-repo dated runtime or production witness record was located for ANY** H capability"* — the named architecture document is *"a source-analysis record, not a runtime witness"* (`H_sensory_voice.md` §7, §10). |
| Every row in Domains C, F, G, I | No row in these registers carries `LIVE`. Two C-domain routes are explicitly *"neither side is confirmed"* for want of a witness (`C_developmental_relational.md` §8.4); G's representative statement is *"code present and reachable; no runtime witness in-repo"* (`G_orchestration.md`); I records *"No dated runtime or production witness exists in-repo"* (`I_member_practitioner.md`). |

## II.3 · ⚠️ Why Part II is two rows long

⭐ **This is an EARNED RESULT, ⛔ not a packet defect, and ⛔ not a finding that the system is
mostly dead.**

The census had **no runtime, no database and no production access**. Under its own binding
calibration, that makes `WIRED-BUT-UNOBSERVED` *"the honest default for most of this census"*
(P1-02 instrument §3) — a statement about **what could be observed from inside the container**, not
about what runs in production.

```text
✅ MAY SAY   "Two of 221 rows met the census's LIVE admission test, which required an
             in-repo dated witness the container could read."
⛔ MAY NOT   "Only two capabilities are live."
⛔ MAY NOT   "219 capabilities are not running."
```

⭐ And the reverse inflation is refused too: **the two admitted rows both carry a witness whose SHA
or subject differs from the census subject.** Neither is an observation of present behaviour. They
are admitted because the calibration admits them, with the qualifications attached — ⛔ not because
they are more certain than they are.

---
---

# PART III — PARTIAL / DORMANT / SHADOW ARCHITECTURE

⛔ **This heading is not a catch-all.** The census's own status enum was fixed in one instrument,
binding on all three registers (P1-02 instrument §3), and the categories below are that enum. Their
implications differ, and **the difference is the finding**.

## III.0 · The categories, counted

Counts are by each row's **leading status token** as written in the P1-03 registers. **27 rows carry
a status that is not a single enum value** — compound, split, or restated verbatim because the source
record assigned no enum word; those are §III.9 and are ⛔ not silently sorted into a neighbouring
category.

| Status | A·B·C | D·E·F | G·H·I | Total | Where |
|---|---:|---:|---:|---:|---|
| **WIRED-BUT-UNOBSERVED** | 38 | 47 | 36 | **121** | §III.1 |
| **PARTIAL** | 6 | 6 | 0 | **12** | §III.2 |
| **DORMANT** | 6 | 22 | 4 | **32** | §III.3 |
| **ORPHANED** | 3 | 10 | 3 | **16** | §III.4 |
| **SUPERSEDED** | 0 | 0 | 2 | **2** | §III.5 |
| **BLOCKED** | 1 | 0 | 0 | **1** | §III.6 |
| **OBSERVATION-ONLY** | 1 | 0 | 0 | **1** | §III.7 |
| **DOCUMENTATION-ONLY** | 0 | 7 | 0 | **7** | §III.8 |
| **UNKNOWN / NOT DETERMINED / restated verbatim** | 5 | 19 | 3 | **27** | §III.9 |
| *(LIVE — Part II)* | 2 | 0 | 0 | *2* | Part II |
| | **62** | **111** | **48** | **221** | |

⚠️ **One comparability note, and only one.** The status enum and the `LIVE` calibration were
declared in a single instrument binding on all three registers, so these nine columns are the same
question asked of every row. That is **not** true of the ladder positions in Part I.4, where three
slices used three different reading rules (MAP 1 §2, MAP 2 §3c). ⛔ Do not carry the comparability
of this table across to that one.

## III.1 · `WIRED-BUT-UNOBSERVED` — 121 rows

**What it means (instrument §3):** *"a complete path is traced from a real entry point, but no
runtime observation exists."*

⭐⭐ **This is the largest category in the census and the least informative about the organism.** It
is where a capability lands when the tracing succeeded and the container could not watch it run. It
says *the wire is there and nobody in this census saw current flow* — ⛔ it does not say the
capability is idle, and ⛔ it does not say it works.

Representative rows, each with its own qualification intact:

```text
P3-A-02  tier decision (FAST/CORE/DEEP) — "no dated in-repo record of observed tier distribution"
P3-A-03  FAST prompt assembly · P3-A-04 CORE · P3-A-05 DEEP (three statuses in one seam)
P3-A-10  egress finalization — the guard set itself is WIRED-BUT-UNOBSERVED
P3-B-04  loadPriorCrossSessionExchanges — member-writable consent column present, default-on
P3-B-02  MemoryBundleService — ⚠️ COMPOUND: "WIRED-BUT-UNOBSERVED (FAST) · BLOCKED by
         construction on CORE/DEEP — both restated"  (⛔ counted once, at its leading token)
P3-F-06  divinationRecallLoader — ⭐ the one row in the corpus with a dated production witness
         that recorded ABSENCE; see Part II.2. ⛔ Its gates are TESTED rather than asserted —
         "the only symbolic system in F whose gates are tested"
P3-H-11  streaming voice — see §III.5
P3-G-*   28 rows; representative phrasing "code present and reachable; no runtime witness in-repo"
```

## III.2 · `PARTIAL` — 12 rows

**What it means:** the record established that part of the capability participates and part
demonstrably does not, and refused to average the two.

```text
P3-B-01  "LOADED on every eligible turn at every tier; SURFACED on FAST only"
P3-B-06  "PARTIAL · recall ORPHANED downstream · write WIRED-BUT-UNOBSERVED — all three restated"
P3-A-09  MAIA identity source: "One source is canonical for two of four live prompt regimes"
P3-A-15  "PARTIAL as a class; individual statuses NOT DETERMINED BY SOURCE RECORD"  ⛔ INF-5 —
         a status on a class is not a status on any of its 25 members
P3-A-16  the provider gateway: "PARTIAL. Detailed adjudication belongs to Domain G"
```

⭐ **`PARTIAL` is the category most easily destroyed by compression**, because every one of these
rows would read cleaner as either live or dead, and the record refused both.

## III.3 · `DORMANT` — 32 rows

**What it means (instrument §3):** *"the code exists; no reachable caller was found."*

```text
P3-D-12…D-28  the dormant/orphaned field cluster — "no reachable entry point on any
              MAIA-claiming cognition family"  (MAP 1 · Domain D)
P3-E-16       per-phase therapeutic-modality selection — §III.11c
P3-G-09       MODEL_REGISTRY / minimumBloomLevel — §III.11e
P3-H-15       lib/voice/*.DISABLED (3 files) — ⚠️ the remaining 119 lib/voice/ entries were
              NOT TRACED, "flagged for P1-04, ⛔ not guessed at"
P3-I-09       lib/coachField/* — "DORMANT (verification-script-reachable only)"
```

⛔ **Dormant is not safe by construction.** The census says so at the row where it matters most:
*"⛔ inertness is NOT a ruling that it is safe"* (P3-E-16).

## III.4 · `ORPHANED` — 16 rows

**What it means (instrument §3):** *"the code exists; its declared consumer does not."*

⭐ **The register kept `ORPHANED` and `DORMANT` apart deliberately**, and said why at `P3-I-08`:
*"⛔ **not** `DORMANT`, because P3-I-01 performs the very act this module models, and does so
without it."* ⛔ The difference — *unreached* versus *superseded in practice by something that does
the same job ungoverned* — is exactly what a merged category would erase.

```text
P3-A-14  /api/voice/stream-conversation — "route + hook exist; declared consumer no longer
         invokes them. ⛔ Not DORMANT-by-refusal: the route has no gate of its own;
         it is unreached, not closed"
P3-E-01  SPIRALOGIC_REFERENCE — §III.11d
P3-I-08  lib/relationship/scope.ts — §III.11b
P3-I-10  practitioner observation atoms — §III.11f
```

## III.5 · `SUPERSEDED` — 2 rows

```text
P3-H-11  streaming voice path — "SUPERSEDED (preserved as evidence, unreachable from the voice
         handler)". ⭐ It is "a **second cognition family** carrying its own Claude service",
         pinned by a CI AST walk asserting neither identifier appears inside handleVoiceTranscript.
         ⚠️ Its coverage of any current MAIA-claiming path: NOT DETERMINED BY SOURCE RECORD.
         ⛔ The in-source note says the implementation is "UNTOUCHED AND UNDELETED" deliberately,
         and the gate's own header says "FROZEN IS NOT BLESSED."
P3-I-12  app/api/_backend/** — "SUPERSEDED (Supabase-based; no Next route surface)"; the directory
         is `_`-prefixed and contains no Next route module.  ⚠️ Whether any deployment runs it
         is UNKNOWN (MAP 2 §8).
```

## III.6 · `BLOCKED` — 1 row

```text
P3-A-13  /api/oracle/conversation — "The 410 is the first executable statement of POST."
```

⚠️⚠️ **This row's status is itself contested and is Part V's, ⛔ not settled here.** MAP 1 carries it
as `F-ORACLE · SYN-3 AT ITS STATUS`, with nine dependent rows named
(`D-09 D-10 E-05 E-10 E-11 E-27 F-24 B-24 A-13`). ⛔ Nothing in Part III resolves it.

## III.7 · `OBSERVATION-ONLY` — 1 row

```text
P3-A-08  CMT-01 canonical-turn shadow — runs on the canonical route in shadow only;
         "MEMBER-FACING EFFECT: none"; its witness states the live zeroDiff is NOT yet obtained.
```

⭐ A category with exactly one member is still a category. ⛔ Folding it into
`WIRED-BUT-UNOBSERVED` would lose what it says: this one is *designed* not to reach a member.

## III.8 · `DOCUMENTATION-ONLY` — 7 rows

**What it means (instrument §3):** *"named in documents; no artifact found at the subject."*

```text
P3-D-41  RFI  — ⛔ NO CODE OBJECT. `grep -rn "\bRFI\b" lib/ app/ components/ database/` → no match
P3-D-42  UFI  — ⛔ NO CODE OBJECT. Exactly one hit repo-wide, a comment:
                lib/orientation/spiralOrientation.ts:31 "UFI = field assembly (not used here)"
P3-D-43  FIS Field State Primitive — the canon document itself declares it has
                "no runtime authority yet"; the nearest artifact does not match its shape
P3-D-45  maia-mcp · P3-F-35 "Symbolic Guidance Layer Doctrine" · and two further named terms
```

⚠️ **The RFI row must be read with P1-01's collision finding attached**: `RFI` names **two** objects
in the corpus — a not-built layer and an assembled environment — so *"any sentence of the form 'RFI
is built' or 'RFI is not built' is ambiguous until its referent is named"* (P1-01 close §3a). ⛔ This
row is a statement about the named term at the subject, ⛔ not a verdict on either referent.

## III.9 · `UNKNOWN` / `STATUS NOT DETERMINED BY SOURCE RECORD` / restated verbatim — 27 rows

⭐ **This is not a residue bucket. It is where the census refused to coerce.** The register's rule:
*"Where a source record's status cell is not one of the instrument's enum values, the cell is
restated verbatim and flagged; ⛔ it is not coerced into an enum value"* (register 01 header).

Three kinds sit here and are ⛔ not merged:

```text
(a) THE RECORD DECLINED TO CLASSIFY, AND SAID WHY
    P3-F-36  "⛔ F deliberately did not classify it ('classifying them here would be a
             cross-domain ruling')"
    P3-E-26  "(E: 'Preserved as a finding; ⛔ not adjudicated')"
    P3-D-29 · D-32 · D-33 · D-34 · D-37 · D-40  — D's own scope statements, quoted

(b) THE STATUS IS COMPOUND AND WAS RESTATED RATHER THAN AVERAGED
    P3-E-05  "WRITE PATH: DORMANT · READ PATH: WIRED-BUT-UNOBSERVED · ROWS: UNKNOWN"  (§III.11a)
    P3-E-04  verbatim: "COMPUTED · LOGGED · NOT SURFACED → recorded as DORMANT at the prompt
             boundary while remaining LIVE as an observation"
             ⚠️ THIS ROW IS INSIDE X-DEF-1 AND IS PART V'S — ⛔ its "LIVE" is a quoted source
             word inside a contested cell, ⛔ NOT a Part II admission
    P3-E-10  "PRESENT · CORRECTLY SCOPED TO ITS OWN CLAIM · ITS ONLY CALL SITE IS UNREACHABLE"
    P3-E-07 · E-19 · E-23 · D-30  — "WIRED · not surfaced" and its variants

(c) THE OBJECT IS ABSENT AND THE RECORD BOUNDED ITS OWN CLAIM
    P3-D-44  COLLECTIVE_FIELD_SERVICE_URL — "D determined the variable's absence,
             not the service's existence outside this repository"
    P3-D-45  "UNKNOWN (absent from this repository; D makes no claim about elsewhere)"
```

## III.10 · `IMPLEMENTED-BUT-UNREACHED` — ⛔ no members, and that is deliberate

The P1-07 schema names this status. **The census's own enum does not contain it.** The condition it
describes was expressed by the census as `DORMANT` (*no reachable caller*) or `ORPHANED` (*declared
consumer does not exist*) — two states the registers were careful to keep apart (§III.4).

⛔ **Re-cutting 48 rows into a category the census never used would be a re-adjudication, not a
compression.** The heading is preserved and left empty, so the absence is visible rather than
silently filled.

## III.11 · The striking specifics, each with its status intact

### III.11a · A capability whose only writer sits below an unconditional 410, while four readers stay reachable

```text
ROW      P3-E-05 · member_spiral_state substrate + upsertSpiralState
STATUS   WRITE PATH: DORMANT (no reachable writer) · READ PATH: WIRED-BUT-UNOBSERVED ·
         ROWS: UNKNOWN
ARTIFACT sole writer call site app/api/oracle/conversation/route.ts:1611, below the
         unconditional 410 at :446-453, in the block labelled "// Unreachable below" (:455)
⭐ THE REGISTER'S OWN SENTENCE: "stored rows are still read, and one reader renders them
  into a prompt."
```

**The four readers, each with its own status — ⛔ not one status shared between them:**

```text
P3-E-06  reader 1 — Living Field encounter/refine prompt   WIRED-BUT-UNOBSERVED · prompt-affecting
         renders "Spiral state: element=…, phase=…, motion=…" (encounterContext.ts:196-198)
         ⛔ NOT the canonical getMaiaResponse lane
P3-E-07  reader 2 — MemberLiveContext.spiralState          WIRED · not surfaced
         "loaded, not rendered" — formatMemberWebForPrompt contains no spiral reference
P3-E-08  reader 3 — GET /api/members/spiral-state          WIRED-BUT-UNOBSERVED · member-facing
         returns currentElement, phase, motion, ⚠️ relationalPhase, ⚠️ autonomyStreak
P3-E-09  reader 4 — research metric aggregates             WIRED-BUT-UNOBSERVED
```

⚠️ `ROWS: UNKNOWN` is the third clause and is not decorative: whether any row exists to be read was
**not** established. ⛔ The shape is *"a write path with no reachable writer and four live read
paths"* — ⛔ it is **not** *"MAIA is reading stale spiral state."*

⚠️ E-05 also sits inside `X-DEF-2`, which depends on the contested `F-ORACLE` 410 status. **Part V
owns that.**

### III.11b · Two written access models, unreachable from any route — and ⛔ with different statuses

```text
P3-I-08  lib/relationship/scope.ts                          STATUS  ORPHANED
         ReadScope · resolveReadScope · canRead · practitionerMay · admitsToCommitment ·
         maySystemDraw · wisdomMayCiteMemberMaterial (returns `never`) · ScopeViolation · Unruled
         COVERAGE  NONE — "it governs no live read; every hit outside the module is in its
                   own test file"
         ⭐⭐ "all notional"  ·  ⭐ the record is explicit that this is ORPHANED and ⛔ NOT
         DORMANT, "because P3-I-01 performs the very act this module models, and does so
         without it"

P3-I-09  lib/coachField/{identity,practitionerProjection,bringForward,invitation}
         STATUS  DORMANT (verification-script-reachable only)
         COVERAGE  NONE — no route imports it. ⚠️ "The practitioner_clients substrate it reads
                   **is** live (P3-I-05/06); the projection over it is not."
         ⭐⭐ "The member gesture the coach-field model is built around has no surface."
```

⛔ **The two are not one finding.** One is bypassed by a live act; the other has no live act at all.
MAP 2 §9 carries both as non-monotonic rows sitting at `EXISTS` and nothing above it. MAP 1 §6 · N-13
records that the reverse edge was **explicitly refused**: *"CAP-I-01 does not know about the module."*

### III.11c · Per-phase therapeutic-modality selection — fully specified, structurally inert

```text
ROW      P3-E-16 · FRAMEWORK_REGISTRY + chooseFrameworksForCell
STATUS   DORMANT — "fully specified, structurally unreachable in its applied tier
         (`enabledApplied` defaults to `[]`)"
ARTIFACT lib/consciousness/spiralogic-core.ts — IPP :1392 · CBT :1407 · JUNGIAN :1422 ·
         SHAMANIC :1437 · SOMATIC :1449 · IFS :1464 · MINDFULNESS :1479;
         two call sites (oracle/conversation/route.ts:846 below the 410, and
         app/api/maia/spiralogic/route.ts:89), BOTH without opts
COVERAGE NOT APPLICABLE at the subject — no applied modality can be selected on any family
GATE     ⭐ NONE FOUND — "no consent gate, no disclosure, no refusal surface on modality
         selection; the empty default is a code default, ⛔ not a gate"
```

⛔⛔ **The register's own warning, which must not be dropped in compression:** *"⛔ inertness is NOT
a ruling that it is safe."* ⚠️ P1-01 named this the **highest-consequence unlocated governing gap**
(UG-E1). ⛔ Naming it here is not a repair authorization; the governance half is Part IV's.

### III.11d · A reference file with zero importers

```text
ROW      P3-E-01 · SPIRALOGIC_REFERENCE constant
STATUS   ORPHANED (vocabulary) — zero importers at the subject
ARTIFACT lib/maia/spiralogicReference.ts:2 — an 8-line file with one export;
         lib/soulPortrait/schema.ts:19 names the path in a COMMENT only
COVERAGE NOT APPLICABLE — never loaded, never surfaced, no cognition family
```

⚠️ This is the file the session anchor names as the Spiralogic reference. ⛔ What that divergence
means is Part V's (P1-01 close §3b names anchor-versus-canon divergences; MAP 4 Part IV carries
them). Part III records only the status.

### III.11e · A declared gate that decides nothing

```text
ROW      P3-G-09 · MODEL_REGISTRY / selectOptimalModel / minimumBloomLevel
STATUS   DORMANT     LADDER  EXISTS and nothing above it  (MAP 2 §3c, §9)
ARTIFACT lib/ai/modelRegistry.ts:1 (`// @ts-nocheck`), :6, :31, :40, :202, :254
COVERAGE NONE — "no importer outside the file (one prose comment in
         lib/types/interpretive-ledger.ts:25), so it holds for no MAIA-claiming family"
⭐⭐ MAP 2's phrasing: "a model gate keyed to a developmental attribute of a person, declared
   as a type field" · "no evaluator and no importer found."
```

⚠️ **Whether `minimumBloomLevel` was ever evaluated is one of the 17 named sub-question unknowns**
(MAP 2 §8). ⛔ Zero whole-row `UNKNOWN`s in G·H·I is **not** zero unknowns.

### III.11f · A read path, a refusal path and a member disposal path — for material whose producer does not exist

```text
ROW      P3-I-10 · member_memory_atoms.source_type = 'practitioner_observation'
STATUS   ORPHANED — "schema, read guards, loader projection, refusal path and member-side
         disposal all exist; ⛔ **the declared producer does not**"
COVERAGE the atoms are projected into a MAIA prompt section (`# PRACTITIONER OBSERVATIONS`,
         split from `# MEMBER-PLACED PORTFOLIO`) — ⛔ WHICH MAIA-claiming cognition family
         consumes memoryAtomsLoader is NOT DETERMINED BY SOURCE RECORD
⛔ MAP 1 · N-20: no edge drawn to any live practitioner-observation row —
   "⛔ NO WRITER WAS LOCATED." Whether any row exists to traverse it is UNKNOWN.
```

### III.11g · The largest governance artifact in Domain A does not run at request time

```text
Refusal registry · tests/constitutional/refusal-registry/ (31 checks)
⭐ "The refusal registry is the largest governance artifact in this domain and it does not run
   at request time. It is a source-scanning suite."
⛔ "Recording that is not a claim that it should run at request time."   (A §2 instrument table)
```

⭐ Carried here as a **status** fact about an artifact — ⛔ its authority standing is Part IV's.

### III.11h · Two more that the census earned and a summary would lose

```text
P3-E-12  Corpus Callosum trace — reached from getMaiaResponse on ALL tiers, and
         ⛔ ZERO read-back: "NOT participating in cognition"     (MAP 1 · Domain E)
P3-E-15  VoiceDistinctionScorer — runs on the canonical lane AFTER the answer exists;
         "⛔ zero influence by its own declaration"
P3-H-09  the eleven Class C `await maiaSpeak(` sites — member-facing utterance with
         ⛔ NO MODEL IN THE PATH, bypassing canonical egress finalization entirely
P3-H-12  X1…X6 pre-cognition / failure paths — member-facing text where
         "⛔ no model authored X1–X3's words"
P3-G-02  generateTextWithSovereignty / DEGRADED_TEXT — "The degraded string is returned as
         MAIA's turn, not as an error"; ⛔ PERSISTENCE UNKNOWN — it "makes a persistence claim
         it does not itself discharge"
P3-G-06  localModelClient — ⭐ "a fourth answer-producing path that is not a model at all"
```

## III.12 · What Part III is not

```text
⛔ NOT a defect backlog. Several categories here are epistemic limits of a census run without
   runtime access (§III.1 above all), ⛔ not things awaiting technical repair.
⛔ NOT a ranking. The order of §III.1–§III.9 is by count, and count is not severity.
   MAP 4 disclaims ordering as priority or severity in terms; the same disclaimer holds here.
⛔ NOT an authority reading. Every "no gate found" quoted above is a status observation.
   ⭐ GOVERNANCE ABSENCE SURVIVES IMPLEMENTATION DISCOVERY, and its converse holds too:
   finding no gate in a status cell is not a finding that an act is unauthorized. PART IV.
⛔ NOT a resolution of any contradiction. P3-A-13, P3-E-04, P3-E-05 and the other SYN-3 rows
   appear here with their statuses AS THE REGISTERS LEFT THEM. PART V owns them.
```

---

```text
PARTS I · II · III · COMPLETE
221 rows accounted · Part II admitted 2 · Part III preserves 9 named status categories
⛔ NOTHING ADJUDICATED · ⛔ NOTHING PROMOTED · ⛔ NO CLAIM STRENGTHENED BY COMPRESSION
⛔ NO SOURCE READ · ⛔ NO RUNTIME SOUGHT · ⛔ NO C5 OR C6 RESOLVED
⚠️ PARTS IV–VIII ARE OTHER WORKERS' AND ARE NOT PREVIEWED HERE
```
