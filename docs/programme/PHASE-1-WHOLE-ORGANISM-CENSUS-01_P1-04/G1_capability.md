# P1-04 · G1 · CAPABILITY — what the organism is made of

```text
GRAPH     G1 CAPABILITY
NODES     221 — one per P1-03 normalized row, identified by its P3 row id
EDGES     38 CO-LOCATION (E2 DERIVED) · 2 CONTESTED-IDENTITY (E3 TENSION)
ABSENCE   means neither yes nor no (instrument §2)
```

## 1 · Node set

One node per normalized row; ⛔ never one per word. The 221 nodes distribute exactly as the
register does: **A 17 · B 31 · C 14 · D 46 · E 29 · F 36 · G 18 · H 18 · I 12.** Node existence
is **E1 (OBSERVED)** in every case — the row exists and names the object.

**339 distinct artifact files** are named across the node set.

## 2 · Node attribute — STATUS (E1, from each row's own `STATUS` field)

A row may carry more than one status word where the record does; ⛔ none is reduced to a single
value here.

| STATUS token | rows | note |
|---|---|---|
| WIRED-BUT-UNOBSERVED | 124 | built and reachable; no dated in-repo runtime witness (`INF-1` bars reading this as LIVE) |
| DORMANT | 39 | present, not reached on any traced path |
| NO STATUS WORD | 21 | the source record withheld a status word; ⛔ not defaulted here |
| ORPHANED | 20 | present with no importer or no mount located |
| PARTIAL | 12 | some paths only, as the record states |
| DOCUMENTATION-ONLY | 7 | no code object |
| LIVE | 6 | see §3 — only one of these six is unqualified |
| UNKNOWN | 6 | record says unknown |
| BLOCKED | 3 | refused before execution on the traced path |
| OBSERVATION-ONLY | 2 | emits/records without participating |
| SUPERSEDED | 2 | replaced by a later object |

## 3 · ⭐⭐ The organism has exactly one node recorded LIVE without qualification

`LIVE` appears in the `STATUS` field of **6 of 221 rows**, and five of those six qualify it in
the same field:

```text
P3-A-01   LIVE                                        ← the only unqualified one
          Canonical member chat turn — POST /api/sovereign/app/maia/list
P3-B-03   LIVE (path, per calibration) · predicate UNKNOWN in production
P3-E-04   verbatim: "COMPUTED LOGGED NOT SURFACED"
P3-F-28   WIRED-BUT-UNOBSERVED — in the live turn
P3-H-06   WIRED-BUT-UNOBSERVED (under the LIVE calibration — H §7)
P3-I-07   WIRED-BUT-UNOBSERVED for D-1…D-6 (record states OBSERVED elsewhere)
```

⛔ This is **not** a claim that the rest of the organism is not live. It is the register's own
`LIVE` calibration applied without upgrade: `INF-1` requires a traced path **and** a dated
in-repo runtime witness, and 124 nodes are `WIRED-BUT-UNOBSERVED` precisely because the second
half was not found. *Built and reachable is the organism's dominant condition; observed is not.*

## 4 · Node attribute — ALTITUDE (E1, a set per the register, never a single value)

```text
EXISTS            213 of 221
WIRED             159
RUNTIME-GATED      53
CONFIG-SELECTED    24        INF-3: selection authorizes nothing
CI-GATED           22        INF-2: a build-time instrument is not a request-time gate
GOVERNED            9
OBSERVED            4
```

⭐ **`OBSERVED` 4 and `GOVERNED` 9, against `EXISTS` 213.** The altitude distribution is the same
shape as the status distribution, reached from a different field — which is why it is reported
and ⛔ not merged with §2 into one number.

## 5 · Edges — CO-LOCATION (E2 DERIVED, 38)

**Derivation, written:** two rows from different domains name the same artifact file in their own
`ARTIFACT` fields (two E1 facts) ⇒ the two named objects are co-located in one file. ⛔ The edge
asserts co-location and **nothing else** — not that either object calls the other, not that they
share a path at runtime, not that either governs the other.

Of 339 artifact files, 57 are named by more than one row and **38 by rows of more than one
domain**. Those 38 are the edge set:

| # | artifact named by rows of ≥2 domains | domains | rows (provenance) |
|---|---|---|---|
| 1 | `lib/sovereign/maiaService.ts` | ADE | P3-A-02 · P3-A-03 · P3-A-04 · P3-A-05 · P3-A-06 · P3-A-10 · P3-D-01 · P3-D-02 · P3-D-05 · P3-D-06 · P3-D-07 · P3-D-33 · P3-D-34 · P3-E-02 · P3-E-03 · P3-E-04 · P3-E-12 · P3-E-15 · P3-E-23 · P3-E-25 |
| 2 | `maiaService.ts` | ABD | P3-A-07 · P3-A-17 · P3-B-01 · P3-B-02 · P3-B-03 · P3-B-04 · P3-B-05 · P3-B-06 · P3-B-07 · P3-B-12 · P3-B-13 · P3-B-14 · P3-B-15 · P3-B-17 · P3-B-22 · P3-D-08 |
| 3 | `app/api/oracle/conversation/route.ts` | ABCDEF | P3-A-13 · P3-B-21 · P3-B-24 · P3-C-03 · P3-C-04 · P3-D-09 · P3-D-10 · P3-E-05 · P3-E-10 · P3-E-16 · P3-F-24 |
| 4 | `components/OracleConversation.ts` | DFH | P3-D-37 · P3-F-24 · P3-H-04 · P3-H-05 · P3-H-06 · P3-H-09 · P3-H-10 · P3-H-11 · P3-H-12 |
| 5 | `app/api/sovereign/app/maia/list/route.ts` | ACEFI | P3-A-01 · P3-C-04 · P3-E-14 · P3-F-06 · P3-F-14 · P3-F-31 · P3-I-07 · P3-I-11 |
| 6 | `maiaVoice.ts` | AB | P3-A-05 · P3-A-17 · P3-B-03 · P3-B-04 · P3-B-05 · P3-B-13 · P3-B-14 |
| 7 | `lib/ai/modelService.ts` | AG | P3-A-16 · P3-G-01 · P3-G-02 · P3-G-06 · P3-G-07 · P3-G-08 |
| 8 | `list/route.ts` | ABC | P3-A-08 · P3-A-10 · P3-A-17 · P3-B-02 · P3-C-05 |
| 9 | `app/api/voice/stream-conversation/route.ts` | ABDH | P3-A-14 · P3-B-21 · P3-D-11 · P3-H-11 |
| 10 | `MemoryBundle.ts` | BC | P3-B-19 · P3-B-26 · P3-C-11 |
| 11 | `app/api/maia/living-field/[fieldKey]/encounter/route.ts` | AE | P3-A-09 · P3-A-15 · P3-E-06 |
| 12 | `lib/agents/PersonalOracleAgent.ts` | DEF | P3-D-14 · P3-E-19 · P3-F-23 |
| 13 | `lib/ai/sovereignRouter.ts` | AG | P3-A-16 · P3-G-02 · P3-G-14 |
| 14 | `lib/maia/fieldContextAdapter.ts` | DEG | P3-D-09 · P3-E-21 · P3-G-14 |
| 15 | `lib/memory/MemberLiveContext.ts` | BCE | P3-B-10 · P3-C-03 · P3-E-07 |
| 16 | `lib/sovereign/maiaVoice.ts` | ABE | P3-A-04 · P3-B-12 · P3-E-02 |
| 17 | `maiaRuntimeContext.ts` | AB | P3-A-11 · P3-A-12 · P3-B-20 |
| 18 | `/refine/route.ts` | AE | P3-A-15 · P3-E-06 |
| 19 | `/route.ts` | DI | P3-D-08 · P3-I-11 |
| 20 | `app/api/between/chat/route.ts` | AE | P3-A-11 · P3-E-13 |
| 21 | `app/api/maia/chat/route.ts` | AF | P3-A-15 · P3-F-23 |
| 22 | `app/api/members/spiral-state/route.ts` | CE | P3-C-03 · P3-E-08 |
| 23 | `app/api/sovereign/app/maia/route.ts` | AC | P3-A-12 · P3-C-05 |
| 24 | `app/api/sovereign/episodes/mark/route.ts` | BC | P3-B-05 · P3-C-10 |
| 25 | `app/oracle/iching/page.ts` | DF | P3-D-27 · P3-F-10 |
| 26 | `database/migrations/20260213200001_member_spiral_state.sql` | CE | P3-C-03 · P3-E-05 |
| 27 | `hooks/useStreamingVoice.ts` | AH | P3-A-14 · P3-H-11 |
| 28 | `lib/consciousness/MAIA_RUNTIME_PROMPT.ts` | AB | P3-A-09 · P3-B-21 |
| 29 | `lib/consciousness/maiaOrchestrator.ts` | AE | P3-A-11 · P3-E-13 |
| 30 | `lib/consciousness/spiralStatePersistence.ts` | CE | P3-C-03 · P3-E-05 |
| 31 | `lib/maia/living-field/encounterContext.ts` | CE | P3-C-03 · P3-E-06 |
| 32 | `lib/maia/living-field/indexAtom.ts` | CD | P3-C-08 · P3-D-30 |
| 33 | `lib/maia/memoryAtomsLoader.ts` | BI | P3-B-03 · P3-I-10 |
| 34 | `lib/multi-tenant/TenantMAIA.ts` | AF | P3-A-09 · P3-F-23 |
| 35 | `lib/relationship/__tests__/scope.test.ts` | CI | P3-C-13 · P3-I-08 |
| 36 | `lib/relationship/scope.ts` | CI | P3-C-13 · P3-I-08 |
| 37 | `lib/sovereignty/driftAlarm.ts` | DG | P3-D-09 · P3-G-14 |
| 38 | `route.ts` | FI | P3-F-28 · P3-I-12 |

⚠️ **Rows 1 and 2 are a citation-form artifact, declared rather than silently merged.**
`lib/sovereign/maiaService.ts` (20 rows, domains A·D·E) and `maiaService.ts` (16 rows, domains
A·B·D) are, by basename and by the absence of any second `maiaService.ts` in the register, **E2
DERIVED to be the same file** — which would make it a single co-location cluster of 36 rows
across A·B·D·E, the largest object in the organism. ⛔ The two forms are kept as two edges
because merging them edits how the records cite, and the derivation is recorded here instead.

## 6 · Edges — CONTESTED-IDENTITY (E3 TENSION, 2)

⛔ Carried, ⛔ not decided. P1-05 is their adjudicative home.

```text
X-DEF-1 · one module, two incompatible representations
  A  domain D: the field-intelligence block reaches the canonical prompt at a named
     line range; rung CONTRIBUTES              (P3-D-01, LADDER + ARTIFACT)
  B  domain E: SURFACED WHERE: NOWHERE, citing the line where the same file states
     the block is intentionally not appended    (domain E record, per P1-03 slice 02)
  CLASS E3 · STANDING none established either way · rendered as ONE edge marked CONTESTED

X-DEF-2 · one route, three incompatible characterizations
  A  the second cognition path
  B  a route behind an unconditional 410      (P3-A-13, STATUS BLOCKED)
  C  a route with near-zero live traffic       (anchor prose, per D-P1-06 evidence not law)
  CLASS E3 · 11 register rows name this artifact; the register states six as dependent
  rows: P3-B-21 · P3-B-24 · P3-C-03 · P3-C-04 · P3-D-09 · P3-D-10 · P3-E-05 · P3-F-24
  ⚠️ that enumeration is EIGHT by artifact citation and SIX by the register's own count —
  ⛔ the discrepancy is carried, not resolved, and it is itself P1-05 material
```

## 7 · Unknowns left unknown (E4)

```text
21 nodes carry NO STATUS WORD — the source withheld one; ⛔ not defaulted to DORMANT
24 nodes have COVERAGE: NOT DETERMINED BY SOURCE RECORD as the whole field
 6 nodes carry STATUS: UNKNOWN in the record's own terms
```

⛔ None of these is rendered as a negative finding, a zero, or a refusal.

---
_G1 assembled from the P1-03 register only. No source code, runtime, test, sibling lane or
`AUTH-EXPOSURE-01` finding was consulted._
