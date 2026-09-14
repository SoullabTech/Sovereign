# P1-04 · G2 · PARTICIPATION — what takes part, and at which rung

```text
GRAPH     G2 PARTICIPATION
EDGES     COVERS (E1, 103 rows → 15 named families) · RUNG (E1, 15) · CONTESTED-RUNG (E3, 1)
ABSENT    206 of 221 nodes carry NO rung — E4 UNKNOWN, ⛔ never "does not participate"
```

## 1 · ⭐⭐ The rung layer is the sparsest thing in the organism

**15 of 221 nodes carry a ladder rung the source record established.** Seven of those fifteen
are at `EXISTS` — which under the instrument's separations is *not* participation at all.

```text
HAS AUTHORITY    1        CONSIDERS        0
DECIDES          0        KNOWS            1
CONTRIBUTES      4        PARTICIPATES     2
                          EXISTS           7
                          ─────────────────────
                          established      15
                          NOT DETERMINED  206
```

⛔ **206 is not a finding that 206 objects do not participate.** It is `E4 (UNKNOWN)`: the domain
records did not establish a rung for them. The register says so in its own words on every one of
those rows — `NOT DETERMINED BY SOURCE RECORD` — and this graph renders that as absence plus an
explicit unknown entry, never as a negative edge.

⭐ **Zero nodes are established at `DECIDES` or `CONSIDERS`.** Both rungs are empty across the
whole organism. ⛔ That is emptiness of the *established* layer, not evidence that nothing decides.

## 2 · Edges — RUNG (E1, 15)

Each row's own `LADDER` field is the provenance; the gate and governing-source columns are that
same row's fields, carried so the rung is never read alone.

| P3 row | rung established by the record | GOVERNANCE GATE | GOVERNING SOURCE | named object |
|---|---|---|---|---|
| `P3-D-06` | **HAS AUTHORITY** | PARTIAL | NONE LOCATED | D-OBJ-6 `enforceFieldSafety` → `FieldSafetyDecision` (+ `fieldSa |
| `P3-A-07` | **CONTRIBUTES** | PRESENT | NONE LOCATED | Writers-Studio canonical turn — POST /api/writers-studio/focus |
| `P3-D-01` | **CONTRIBUTES** | NONE FOUND | NONE LOCATED | D-OBJ-1 `FieldContext` seam — `buildFieldContext` / `formatField |
| `P3-D-07` | **CONTRIBUTES** | NONE FOUND | NONE LOCATED | D-OBJ-7 `analyzeFieldIntelligence` (Talk Mode field intelligence |
| `P3-D-10` | **CONTRIBUTES** | NONE FOUND | NONE LOCATED | D-OBJ-10 `coherenceFieldService` + table `coherence_field_readin |
| `P3-B-15` | **KNOWS** | PARTIAL | NONE LOCATED | ConsciousnessMemoryLattice — resonance recall (and its separate  |
| `P3-F-07` | **PARTICIPATES** | NONE FOUND | NONE LOCATED | F-07 `POST /api/changes/[id]/interpret` — member-facing I Ching  |
| `P3-F-08` | **PARTICIPATES** | NONE FOUND | NONE LOCATED | F-08 `POST /api/studio/changes/[id]/interpret` — practitioner-fa |
| `P3-G-09` | **EXISTS** | NONE FOUND | NONE LOCATED | `MODEL_REGISTRY` / `selectOptimalModel` / `getModelFallbackChain |
| `P3-H-13` | **EXISTS** | NOT DETERMINED | NONE LOCATED | `handleTranscript` (body is a single comment) |
| `P3-H-14` | **EXISTS** | NOT DETERMINED | NONE LOCATED | its own `handleVoiceTranscript` binding |
| `P3-H-15` | **EXISTS** | NOT DETERMINED | NONE LOCATED | `MaiaRealtimeWebRTC` · `RealtimeSpiralogicBraid` · `RealtimeVoic |
| `P3-I-08` | **EXISTS** | NONE FOUND | NONE LOCATED | `ReadScope` · `resolveReadScope` · `canRead` · `practitionerMay` |
| `P3-I-09` | **EXISTS** | NONE FOUND | NONE LOCATED | `identity.ts` (incl. `authorizePractitionerClientRelationship()` |
| `P3-I-12` | **EXISTS** | NONE FOUND | NONE LOCATED | `src/routes/facilitatorDashboard.routes.ts` + `src/services/{cal |

## 3 · ⭐⭐ The E2 finding this graph exists to expose

**DERIVED (E2), derivation written:** for each of the 15 rung-bearing rows, compare that row's
`LADDER` field (E1) with that same row's `GOVERNING SOURCE` field (E1). Result:

```text
rung-bearing nodes                                    15
    of which GOVERNING SOURCE = NONE LOCATED          15
    of which GOVERNING SOURCE = LOCATED                0
```

⭐ **Every object whose participation the census managed to establish has no located governing
source.** Contributing rows: `P3-A-07 · P3-B-15 · P3-D-01 · P3-D-06 · P3-D-07 · P3-D-10 ·
P3-F-07 · P3-F-08 · P3-G-09 · P3-H-13 · P3-H-14 · P3-H-15 · P3-I-08 · P3-I-09 · P3-I-12`.

⛔ **What this is not.** Not a claim that these objects are ungoverned — `NONE LOCATED` records a
search that did not find a governing source, which is a fact about the search (instrument §2).
Not a claim that governance is absent organism-wide — 27 nodes do carry a located source (G3 §3),
and none of them is a rung-bearing node. Not a repair proposal. ⛔ And emphatically not authority:
`CONTRIBUTES ≠ HAS AUTHORITY`, and a missing governing source promotes nothing.

## 4 · Edges — COVERS (E1, 103 rows → 15 named families)

`INF-5` is what makes this layer honest: every row carries a coverage field, so no row silently
reads as *"the system."*

```text
NOT APPLICABLE                            94 rows   (no cognition-family question to answer)
FAMILY named, no remainder clause          69
FAMILY + stated undetermined remainder     34
NOT DETERMINED (whole field)               24
                                         ─────
                                          221
```

| cognition family, as COVERAGE names it | rows | provenance (P3 rows) |
|---|---|---|
| `F-LIST-FAST` | 21 | P3-A-01 · P3-A-02 · P3-A-03 · P3-A-09 · P3-A-16 · P3-B-01 · P3-B-02 · P3-B-03 · P3-B-04 · P3-B-05 · P3-B-06 · P3-B-07 · P3-B-08 · P3-B-10 · P3-B-12 · P3-B-13 · P3-B-14 · P3-B-17 · P3-B-26 · P3-C-09 · P3-C-11 |
| `F-LIST-CORE` | 16 | P3-A-01 · P3-A-02 · P3-A-04 · P3-A-09 · P3-A-16 · P3-A-17 · P3-B-03 · P3-B-04 · P3-B-05 · P3-B-07 · P3-B-08 · P3-B-10 · P3-B-12 · P3-B-13 · P3-B-14 · P3-B-17 |
| `F-LIST-DEEP-REPAIR` | 14 | P3-A-01 · P3-A-02 · P3-A-04 · P3-A-05 · P3-A-09 · P3-A-16 · P3-A-17 · P3-B-03 · P3-B-04 · P3-B-05 · P3-B-08 · P3-B-10 · P3-B-13 · P3-B-14 |
| `F-LIST-DEEP-PRIMARY` | 12 | P3-A-01 · P3-A-02 · P3-A-05 · P3-A-09 · P3-A-16 · P3-B-03 · P3-B-04 · P3-B-05 · P3-B-08 · P3-B-10 · P3-B-13 · P3-B-14 |
| `F-LIST-DEEP-CONSULT` | 8 | P3-A-01 · P3-A-05 · P3-B-03 · P3-B-04 · P3-B-05 · P3-B-08 · P3-B-13 · P3-B-14 |
| `F-ORACLE` | 6 | P3-A-13 · P3-A-16 · P3-B-21 · P3-B-24 · P3-C-03 · P3-C-04 |
| `F-WS-FOCUS` | 5 | P3-A-02 · P3-A-07 · P3-A-10 · P3-A-16 · P3-A-17 |
| `F-PERIPHERAL` | 4 | P3-A-10 · P3-A-15 · P3-A-16 · P3-C-08 |
| `F-RCN` | 4 | P3-A-01 · P3-A-02 · P3-A-06 · P3-A-10 |
| `F-VOICE-STREAM` | 4 | P3-A-10 · P3-A-14 · P3-A-16 · P3-B-21 |
| `F-LIST-DEEP` *(abbreviated reference)* | 3 | P3-B-07 · P3-B-12 · P3-B-17 |
| `F-SHADOW` | 3 | P3-A-01 · P3-A-08 · P3-A-17 |
| `F-BETWEEN` | 2 | P3-A-10 · P3-A-11 |
| `F-LIST` *(abbreviated reference)* | 2 | P3-B-24 · P3-C-08 |
| `F-MAIA-SIBLING` | 1 | P3-A-12 |

⚠️ **One declared filter, ⛔ not a silent one.** The token pattern `F-nn` also matches domain-F
row labels (`F-06` ×2 · `F-07` ×2 · `F-11` · `F-12` · `F-14` ×2). Those seven occurrences are
domain-F object identifiers, not cognition families, and are excluded — declared here because an
undeclared filter is an undeclared inference. `F-LIST-DEEP` and `F-LIST` are marked as
abbreviated references to the families spelled out above them; ⛔ they are not merged into them.

## 5 · ⭐ Edge — CONTESTED-RUNG (E3 TENSION, 1) · X-DEF-1 made visible *here*

This is the edge the founder's ruling required to be visible in the assembly before it becomes a
P1-05 contradiction. Rendered as **one edge, marked CONTESTED, carrying both representations**:

```text
EDGE        field-intelligence block  ──participates-in──▶  canonical prompt
STATE       CONTESTED
CLASS       E3 (TENSION)

  REPRESENTATION A     rung CONTRIBUTES; the block arrives at a named line range
                       PROVENANCE  P3-D-01 · LADDER field ("CONTRIBUTES (D §6 ans.4,
                                   paths (a)+(b))") + ARTIFACT field
  REPRESENTATION B     SURFACED WHERE: NOWHERE, citing the line where the same file
                       states the block is intentionally not appended
                       PROVENANCE  domain E record, carried in P1-03 slice 02's
                                   contradictions section

STANDING    NONE ESTABLISHED on either side
ADJUDICATIVE HOME   P1-05
```

⛔ **Not rendered as two edges** — that would read as two different relations rather than one
disputed one. ⛔ **Not rendered as one uncontested edge** — that picks a winner by rendering.
⛔ **Not omitted** — that hides the fracture. ⛔ No code was read to settle it; doing so would
re-run P1-02 and would be external evidence at this altitude (instrument §7).

⭐ *Note what the contest is about: whether a capability the register places at `CONTRIBUTES`
reaches the member's prompt at all. The organism cannot presently say, from its own records,
whether one of its four `CONTRIBUTES` nodes contributes.*

## 6 · Unknowns left unknown (E4)

```text
206  nodes with no established rung
 24  nodes with COVERAGE entirely NOT DETERMINED
 34  nodes naming a family while stating the undetermined remainder — the remainder stays open
```

---
_G2 assembled from the P1-03 register only. No rung was promoted from a neighbouring rung, and
no edge was completed from outside the record set._
