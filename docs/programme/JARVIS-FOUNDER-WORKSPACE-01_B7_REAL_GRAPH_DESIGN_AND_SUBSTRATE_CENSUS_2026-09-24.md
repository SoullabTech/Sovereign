# JARVIS-FOUNDER-WORKSPACE-01 · B7
## Real Graph — evidence-relation design + substrate census only

**Date:** 2026-09-24
**Predecessor:** installed B6R1R1 candidate `6528475966e5588a795ec44adc61f896eedbf90a`
**Canonical observed:** `e886888416062c7fcbcf899040e3827bc8013835`
**Act:** **B7 — REAL GRAPH EVIDENCE-RELATION DESIGN + SUBSTRATE CENSUS ONLY**
**Standing:** **DOCUMENTARY DESIGN + CENSUS · NO GRAPH JOIN IMPLEMENTED · NO RENDERER CHANGE**

This act answers two questions before one live edge is drawn:

1. **What kinds of things in Kelly's world are already represented by durable evidence?**
2. **Which relationships can JARVIS lawfully draw because a source object actually asserts both ends?**

The governing product law is unchanged:

> **Graph is not a programme-name cloud. It is Kelly seeing how her actual world connects.**

The governing epistemic law is unchanged:

> **No evidence → no relationship.**

## 1 · Inherited law

B7 inherits the already-ratified Founder Workspace contract:

- Graph is a **new capability over existing records**, not a restyled dashboard.
- The live graph is an **evidenced join over B2/B4 sources**.
- Every edge must carry `evidence { kind, ref }`.
- An uncited relation is not drawn.
- Human meaning leads; technical identifiers are secondary.
- Graph opens scoped to the current work context rather than as a cold network.
- Relationship → evidence → return to the same work context must be traversable.
- Living Spiral jurisdiction remains in force: **no member node and no elemental vocabulary**.

B7 adds no authority to those laws.

## 2 · Current live census

The live Founder view-model at this act still reports:

```text
graph nodes     0
graph edges     0
```

That is correct. B7 has not been implemented.

The existing substrates available to a future join were observed as:

```text
programme rows                         173
programme association rows             539
unique canonical programme documents   539
  association role: record             515
  association role: supporting          24

programmes with founder-record change    5
Writer's Studio founder-record programmes 2

current W0.v2 Work Units                 7
Work Units declaring programme           7
Work Units with parent_work_unit          0
exact Work programme → B4 programme matches 0

session records                         173
session → branch declarations           173
unique session branch names             112
session → work-unit declarations        173
session → current W0.v2 matches           0

result records                           66
result → current W0.v2 matches            0

canonical execution-grant ledgers         6
grant event rows                          24
grant-event → current W0.v2 matches       24

runtime run records                       82
runs carrying work_unit_id                 0

Monitor rows                              16
live partner handoff receipts              1
  ChatGPT                                  1
  MAIA                                     0
  Claude Code                              0
```

The census therefore establishes a large amount of **relationship substrate**, but not a license to connect everything to everything.

## 3 · A field is a focus, not a second ontology

“Writer's Studio” should not become a duplicate synthetic node merely because Graph needs a center.

B7 therefore distinguishes:

```text
graph node     = a durable thing with an evidenced identity
current field  = the subject Kelly is currently looking through
```

If the current field resolves to the programme `WRITERS-STUDIO`, Graph centers the **programme node** and labels it **Writer's Studio**.

If the current field is a Work Unit, Graph centers the Work Unit node.

If the current field is a Monitor observation, Graph centers the exact observed subject only when that observation has an evidenced relationship into the graph population.

This prevents “field” from becoming another hidden truth store.

## 4 · Node kinds — admitted, conditional, or held

| Node kind | B7 design standing | Existing substrate | Rule |
|---|---|---|---|
| **programme** | ADMITTED | B4 `programme-state.v1` row | exact programme id; human label first |
| **record** | ADMITTED | canonical `docs/programme/*` association/source | one node per exact source path |
| **founder decision record** | ADMITTED AS RECORD ROLE | programme `last_change.authority='founder record'` + source | same record node, stronger relation label; no duplicate decision/document node |
| **work unit** | ADMITTED | B2 W0.v2 row | exact Work Unit identity |
| **grant** | ADMITTED IN PRINCIPLE | canonical grant-standing stores | consume the standing resolver; do not turn every JSONL transition into a separate conceptual grant |
| **session / handoff** | ADMITTED | B2 session records | exact session id |
| **branch** | ADMITTED AS RECORDED CUSTODY | session `branch` / other explicit custody record | means “recorded branch”, not “branch definitely exists now” |
| **result** | ADMITTED | B2 result records | exact result / work-unit identity |
| **runtime run** | CONDITIONAL | runtime run record | only when the run record itself carries a target relation such as `work_unit_id` |
| **partner handoff** | CONDITIONALLY ADMITTED | B6R1 `jarvis.partner-context.v1` receipt | orientation-only; evidence receipt must become traversable before live edge |
| **Monitor observation** | CONDITIONAL | B3 monitor row | only where another source explicitly relates the observation to a graph node |
| **person** | HELD | no Founder Workspace people/contact organ | do not infer a person from prose; Living Spiral law also forbids member nodes |
| **MAIA / ChatGPT / Claude Code full conversation** | HELD | no bounded conversation object in the view-model | only bounded handoff receipts are eligible in V1 |
| **element / archetype / psychological inference** | FORBIDDEN | none needed | Living Spiral R2/R4: no elemental vocabulary; no inferred member/person ontology |

The target may eventually include people, conversations and richer external context. B7 does **not** manufacture those substrates to make the picture look complete.

## 5 · Edge admission contract

A live edge requires:

```text
source endpoint exists
target endpoint exists
relation is asserted by a durable source object
evidence ref names that source object
evidence is traversable from Desktop
```

If any one of those conditions is absent, the relation is held rather than drawn.

The first lawful relation families are:

| Relation | Source assertion | Evidence ref |
|---|---|---|
| **programme → has record → record** | B4 programme `association[]` | canonical programme document path |
| **programme → governed by founder decision → record** | `last_change.authority='founder record'` + `source` | exact founder record path |
| **work unit → belongs to programme → programme** | W0.v2 `identity.programme` **and** exact B4 target exists | Work Unit record |
| **work unit → child of → work unit** | W0.v2 `identity.parent_work_unit` and target unit exists | Work Unit record |
| **work unit → has execution grant → grant** | canonical grant-standing resolver | grant ledger ref |
| **session → recorded branch → branch** | session `branch` | session record |
| **session → for work unit → work unit** | session `work_unit` and exact target unit exists | session record |
| **result → for work unit → work unit** | result identity and exact target unit exists | result record |
| **run → for work unit → work unit** | run `work_unit_id` and exact target unit exists | run record |
| **partner handoff → orients → field node** | validated handoff `field` exact-matches an admitted node | exact handoff receipt |
| **programme → supersedes → programme** | explicit deterministic relation sentence naming both exact programme ids | canonical record + exact line |

Three things are explicitly **not** evidence of a relationship:

1. similar names or shared prefixes;
2. co-occurrence in prose without an explicit relation;
3. an AI model saying two things “seem related.”

This kills the programme-name-cloud failure by construction.

## 6 · Relation semantics must say only what the source says

The graph may distinguish historical from present-tense relations.

For example:

- a session record may establish **recorded branch**, not “branch exists now”;
- an old result may establish **result recorded for work unit**, not “this is the current result”;
- a partner receipt establishes **orients this field**, not “proves this repository fact”;
- a founder ratification record may establish **governs / supersedes** only where the record explicitly says so.

Graph labels may become more human, but they may never become stronger than the evidence.

## 7 · Writer's Studio worked census

The current turn resolver safely identifies the central programme:

```text
programme id     WRITERS-STUDIO
human label      Writer's Studio
evidence state   UNVERIFIED
canonical source docs  1
```

Its one directly associated canonical record is:

```text
docs/programme/WRITERS-STUDIO_HIGH_LEVEL_REVIEW_2026-09-21.md
association rule R-A1
role             record
```

Therefore the first mechanically justified Writer's Studio graph neighborhood is small:

```text
Writer's Studio
      │
      └── has record ── Writer's Studio — High-Level Review
                         ↳ canonical evidence
```

That sparsity is a **truthful result**, not a Graph failure.

### Other Writer's Studio evidence found

The census found multiple separately projected Writer's Studio programmes. Two presently carry founder-record changes:

```text
WRITERS-STUDIO-EDITORIAL-READING-01
  founder source:
  WRITERS-STUDIO-EDITORIAL-READING-01_A0_FOUNDER_RATIFICATION_2026-09-22.md

WRITERS-STUDIO-NEXT-01
  founder source:
  WRITERS-STUDIO-NEXT-01_A0_FOUNDER_RATIFICATION_2026-09-22.md
```

A canonical record also contains one explicit cross-programme relationship:

```text
WRITERS-STUDIO-NEXT-01
    supersedes sequencing authority of
WRITERS-STUDIO-CONVERGENCE-01
    steps 2–8
```

Source: `WRITERS-STUDIO-NEXT-01_A0_MANUSCRIPT_FIRST_EXPERIENCE_CONSTITUTION_2026-09-22.md:174`.

That edge is admissible because the sentence names both exact programme ids and the relation explicitly.

By contrast, the central high-level review uses `WS-CONVERGENCE-01` at lines 305 and 449. The projector currently knows `WRITERS-STUDIO-CONVERGENCE-01` as a separate exact id. B7 may **not** silently treat those strings as aliases merely because a person would recognize the resemblance.

### Local work / session substrate around Writer's Studio

Six local session records contain Writer's Studio / `ws-` work names:

```text
ws-author-agency-20260918
ws-passage-release-review
ws-passage-seam-ratification
ws-mode-place
ws-passage-conversation-20260918
```

Those sessions explicitly record branches, but their `work_unit` strings do not resolve to any of the seven current W0.v2 Work Units.

Therefore B7 may show the session → recorded-branch relationship if that session is independently in scope, but it may **not** draw session → current Work Unit or session → Writer's Studio from name resemblance alone.

### AI partner context

Exactly one B6R1 partner receipt currently matches Writer's Studio:

```text
source      ChatGPT
handoff     chatgpt-writers-studio-20260924
authority   orientation_only
field       Writer's Studio
```

No MAIA receipt and no Claude Code receipt exist yet.

The ChatGPT relation is semantically admissible but **not yet live-drawable** under the Founder evidence-traversal law because `~/.jarvis/context-handoffs` is outside the evidence preview's presently admitted roots (bound repo + local AIN home).

B7 implementation must solve that traversal gap without adding a general filesystem reader.

## 8 · Founder experience contract for the real Graph

The default Graph experience is **focused traversal**, not a full-repository hairball.

When Kelly enters Graph from a field:

1. the current field is the center;
2. only directly evidenced one-hop relationships are shown first;
3. relationships are grouped by human category — **Work · Decisions · Records · Sessions · Results · Partner context · System evidence**;
4. technical ids, SHAs and raw paths remain secondary;
5. selecting a related node may expand the next evidenced neighborhood;
6. selecting a relationship opens the source object that proves it;
7. closing evidence returns Kelly to the same graph and work context.

The layout should be deterministic enough that the same field does not visually rearrange itself every time Kelly opens it.

No AI-generated “relevance score” orders the graph.

No hidden confidence score exists.

An absent relationship is not rendered as weak, grey, probable, maybe, or inferred. It is absent.

Partner orientation must be visually distinguishable from canonical or local execution evidence.

## 9 · What the first live implementation must consume

The next implementation act should remain inside the existing Founder Workspace architecture:

```text
B2 read organs
B4 programme-state projector
B6R1 bounded partner receipts
        ↓
pure evidenced graph join
        ↓
founder-workspace-viewmodel.v1.graph
        ↓
existing workspace-viewmodel IPC
        ↓
Graph renderer
```

The renderer still reads **only the view-model**.

No second graph truth store is authorized.

No graph database is required for the first implementation.

No new model call is required to determine edges.

No new IPC channel should be necessary.

### Required implementation repairs

A live B7 implementation will owe:

- a pure join module that creates nodes/edges only from admitted sources;
- exact node-id namespacing so ids from different organs cannot collide;
- human-first labels with technical identity underneath;
- deterministic handling of explicit programme relation statements such as `supersedes`;
- use of current grant-standing resolvers rather than raw grant-event spam;
- a bounded read organ for partner-handoff receipts so their evidence becomes directly traversable without exposing arbitrary filesystem paths;
- Graph renderer traversal from relation → evidence → return to same context;
- validation through existing VM-3: every live edge has `evidence {kind, ref}` and both endpoints exist.

## 10 · Defeat candidates frozen before implementation

The following must be lethal:

- **DG-1 Name match:** `WS-*` and `WRITERS-STUDIO-*` share a prefix → edge drawn. **FAIL.**
- **DG-2 Co-mention:** two programme ids occur in the same paragraph without a relation verb → edge drawn. **FAIL.**
- **DG-3 Missing target:** a session names a Work Unit absent from the admitted node population → dangling edge drawn. **FAIL.**
- **DG-4 Current-tense inflation:** historical session branch is rendered as “current branch.” **FAIL.**
- **DG-5 Partner inflation:** ChatGPT orientation becomes canonical evidence. **FAIL.**
- **DG-6 Unopenable evidence:** edge exists but its evidence cannot be traversed in Desktop. **FAIL.**
- **DG-7 Member/person inference:** a member or person is turned into a graph node from prose mention. **FAIL.**
- **DG-8 Elemental overlay:** Fire / Water / Earth / Air / Aether become graph vocabulary. **FAIL.**
- **DG-9 Hairball default:** Graph opens with the entire 173-programme / 539-record population rather than the current field neighborhood. **FAIL.**
- **DG-10 Synthetic field node:** Graph invents a second “Writer's Studio field” node beside the evidenced `WRITERS-STUDIO` programme solely for presentation. **FAIL.**

## 11 · Exact containment of this act

This B7 act changed no:

```text
jarvis-desktop runtime
Founder Workspace view-model
graph nodes / graph edges
IPC
preload
provider
authority
repository mutation path
production read
production write
merge
deployment
```

The live Graph remains at:

```text
nodes 0
edges 0
```

That is intentional.

## 12 · Exact successor if Founder accepts this design

> **`JARVIS-FOUNDER-WORKSPACE-01 / B7R1 — PURE EVIDENCED GRAPH JOIN + TRAVERSABLE PARTNER-HANDOFF READ ORGAN ONLY`**

B7R1 may implement only the frozen node/edge law above, populate the live view-model graph, make each edge's evidence traversable, and render the current-field neighborhood.

It may not add people inference, a graph database, semantic edge inference, member nodes, elemental vocabulary, new provider calls, new execution authority, merge, deploy, or production mutation.

**STOP here for Founder adjudication before B7R1 implementation.**
