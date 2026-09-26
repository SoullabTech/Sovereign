# WRITERS-STUDIO-NEXT-01 / A2-11
## PRIOR MAIA EDITORIAL TURN CARRY RUNTIME IMPLEMENTATION ONLY

**Date:** 2026-09-26
**Parent:** `29061babd7d8d0fd147a9f8449afb009d75ce9e4`
**Branch:** `feature/ws-next-a2-11-carry-runtime-20260926`

## I. Boundary provenance

A2-11 was opened directly from the founder-frozen boundary in the governing conversation:

> **WRITERS-STUDIO-NEXT-01 / A2-11 — PRIOR MAIA EDITORIAL TURN CARRY RUNTIME IMPLEMENTATION ONLY**

No separate A2-11 execution-packet file was created before implementation.

This record does not invent one retroactively.

The governing implementation contract is A2-10, accepted and closed at:
- candidate `29061babd7d8d0fd147a9f8449afb009d75ce9e4`;
- founder adjudication SHA-256 `d58820ac7616e05e875773214dac01b23f6eb081447d61403fe608478012d6d8`.

## II. Result

A2-11 implements exactly the first approved cognition-bearing A2 continuity:

> **PRIOR_MAIA_EDITORIAL_TURN → LATER_EDITORIAL_ACT**

The runtime now supports one explicitly selected prior MAIA Editorial response as context in one later Editorial act under the same A2 relationship.

No member-facing source-selection UI is added.

No broader relationship memory, transcript replay, Review continuation, Focus carry, summary carry, or schema widening is implemented.
## III. HTTP ingress implementation

The Editorial turn route now accepts one additional optional top-level field:

```ts
carry?: {
  kind: 'prior_maia_editorial_turn';
  sourceEpisodeSequence: number;
}
```

The route remains closed.

It refuses:
- carry without top-level `relationshipId`;
- unknown carry keys;
- any carry kind other than `prior_maia_editorial_turn`;
- non-integer or non-positive episode sequence;
- client-supplied source fields such as source body, thread, turn index, or scope.

The client still supplies only:
- the already-governed parent relationship id;
- the exact relationship-local source episode sequence.

All source facts remain server-derived.

## IV. Ordering implementation

Live route order now preserves the A2-10 contract:

```text
gate
→ identity
→ closed parse
→ posture
→ Sanctuary refusal
→ relationship / receiver preflight
→ carry source-read preflight
→ persist member Editorial act
→ run Editorial turn with server-resolved carry
→ canonical handoff
→ provider
→ persist outcome
```

The carry source is resolved before `persistMemberEditorialAct`.

Sanctuary refuses before relationship/carry retrieval.

A carry preflight refusal returns `persisted:false` and does not call Editorial runtime.
## V. Source-read runtime

New runtime function:

`resolvePriorMaiaEditorialCarry`

It accepts only:
- authenticated member id;
- exact relationship id;
- exact receiver Editorial thread id;
- exact source episode sequence.

It proves:
- relationship ownership;
- current Work/manuscript declaration;
- receiver Editorial thread ownership;
- receiver manuscript equality;
- measured receiver locus scope;
- exact source episode at relationship + sequence;
- source child kind = EDITORIAL_TURN;
- source temporal posture = CURRENT_FROZEN_LOCUS;
- source thread + MAIA turn index derived from custody;
- source thread still belongs to same member/manuscript;
- exact source ask_turn exists;
- source speaker = maia;
- source body remains available;
- source/receiver scope relation is lawful;
- source thread differs from receiver thread.

Accepted scope table:
- passage → passage: allow;
- passage → section: refuse;
- section → passage: allow;
- section → section: allow.

Unavailable or deleted source refuses.

A2 custody metadata never reconstructs missing prose.
## VI. Server-resolved carry

Successful source resolution mints:

`ResolvedPriorMaiaEditorialCarry`

It contains:
- relationship id;
- source episode sequence;
- custody-derived source thread;
- custody-derived MAIA turn index;
- exact source body;
- source temporal posture;
- source scope;
- receiver thread;
- receiver scope;
- fixed producer id.

The raw HTTP carry request never reaches `runEditorialTurn`.

The exact source body is read once during preflight and then carried forward in the immutable resolved object.

No second source-body read occurs after member persistence.

## VII. Producer registration

New canonical producer:

`system.writer_relationship_prior_editorial_turn`

Registered semantics:
- authoredBy: system;
- participationClass: retrieved;
- authority: situate;
- verified identity required;
- Writers Studio only;
- route-scoped;
- non-mandatory;
- consent basis: member explicitly selected this prior MAIA Editorial response.

The Writer's Studio membrane classifies it as ambient relational continuity, not hidden editorial strategy.

It remains distinct from:
- same-thread system Editorial history;
- member Editorial history;
- pursued observations;
- general relationship memory;
- conversational recall.
## VIII. Editorial cognition implementation

The Editorial producer union is widened additively by exactly the new producer id.

New typed builder:

`priorRelationshipMaiaEditorialTurnCandidate`

The candidate:
- identifies itself as one earlier MAIA Editorial response;
- names the source episode sequence;
- preserves source passage/section standing;
- says explicitly that it is context, not instruction;
- says explicitly that it is not assumed current;
- grants no authority to reread the old Work;
- includes the exact prior MAIA turn body once.

`runEditorialTurn` accepts only the server-resolved carry type.

The carry candidate joins the ordinary Editorial candidate list before canonical-turn construction.

No generic `extraCandidates`, metadata bag, addendum, cast bypass, or second cognition path is introduced.

Existing same-thread Editorial history assembly remains unchanged.

## IX. Canonical handoff

The new producer is registered in the canonical producer registry before use.

MIPA admits it under:
- system authorship;
- retrieved participation;
- situate authority.

The existing `renderEditorialTurn` rule still requires every supplied producer to survive both MIPA and rendering.

If the carry producer is dropped, handoff refuses.

No provider call may silently continue without the selected carry.

The live handoff witness showed the producer admitted and the source body present in the rendered system prompt exactly once.
## X. Persistence standing

A2-11 creates no database migration and no new persistence schema.

It adds no carry fields to:
- writer_editorial_relationship_episodes;
- ask_turns;
- proposal objects;
- Directions.

A successful receiving Editorial act remains an ordinary existing EDITORIAL_TURN episode.

The first implementation therefore carries cognition context without creating a second semantic history store.

No member-facing carry selection state is persisted.

## XI. Refusal standing

Runtime source/carry refusals include:
- relationship_not_found;
- current_declaration_unavailable;
- receiver_thread_invalid;
- receiver_scope_unmeasured;
- source_episode_not_found;
- source_kind_not_editorial;
- source_thread_invalid;
- source_turn_not_found;
- source_turn_not_maia;
- source_unavailable;
- same_thread_source;
- scope_widening_forbidden.

Malformed carry and relationship-required failures remain HTTP 400.

Existing non-disclosure not-found conditions use 404.

Semantic conflicts use 409.

Carry preflight refusals return `persisted:false`.
## XII. Direct evidence

### Source resolver unit witness
**4/4 PASS**

Proved:
- exact custody source derivation;
- same-thread refusal;
- passage→section widening refusal;
- source speaker must be MAIA.

### Canonical carry handoff
**1/1 PASS**

Proved:
- new producer admitted by MIPA;
- producer survives canonical rendering;
- exact source body appears in rendered system prompt once;
- candidate labels context-not-instruction and not-current standing.

### Editorial ingress route contract
**5/5 PASS**

Proved:
- resolved carry occurs before member persistence;
- only server-resolved carry reaches runtime;
- malformed carry refuses before persistence;
- carry requires relationship id;
- Sanctuary refuses before relationship/carry reads and persistence;
- carry preflight refusal returns persisted:false and does not enter runtime.

### Real PostgreSQL source-read witness
**4/4 PASS**

Proved:
- exact A2 custody resolves exact stored MAIA turn;
- same-thread source refuses;
- episode sequence cannot cross relationship identity;
- deleted source turn refuses and is not reconstructed from custody metadata.

### Real HTTP zero-write witness
Against a real Next dev server and the disposable witness database:
- invalid source episode → 404 + `persisted:false`;
- client-smuggled `sourceBody` → 400;
- Sanctuary carry attempt → 409 + `persisted:false`;
- receiver `ask_turns` count remained **0 → 0**.
## XIII. Regression evidence

Focused Jest population:

**157/157 PASS across 7 suites**

Includes:
- A2-11 route;
- source resolver;
- canonical handoff;
- Editorial discourse contract;
- Writers Studio room producer policy;
- A2 relationship carriage;
- Sanctuary Editorial constitutional matrix.

Sanctuary Editorial:
- reference server 9/9;
- reference caller 4/4;
- all named server/caller defeats DEAD;
- live routes 9/9;
- live helpers 4/4;
- static safeguards PASS.

Inherited A2 contracts remain GREEN + lethal:
- A2-10: 30/30 PASS · 38/38 DEAD;
- A2-9: 20/20 PASS · 30/30 DEAD;
- A2-8: 29/29 PASS · 30/30 DEAD;
- A2-1: 24/24 PASS · 24/24 DEAD.

TypeScript no-regression:
- 4,462 program files;
- 226 current errors;
- 239 baseline errors;
- no regressions.

Repository gates:
- design canon PASS;
- no-Supabase PASS;
- provider governance PASS;
- `ci:sovereignty` PASS;
- vendor voice PASS;
- voice provenance PASS;
- member-id log gate: no new violations;
- voice identity 29/29 PASS;
- `git diff --check` PASS.
## XIV. Exact implementation identities

`app/api/writers-studio/editorial/turn/route.ts`
`21cf6e7716b91d9d4cd998842620b26df408908c775f30b5d9b814cee2d73ae5`

`lib/writers-studio/relationshipCarriage.ts`
`179e482c15cad6ffdae818087a8e52657611954a5368f50fb3868a6ac3127de8`

`lib/manuscript/editorialRuntime/turn.ts`
`cd5d06abee631198800a538ed6f9b7265dd21f6f6f5358b107ef16620cd9151c`

`lib/manuscript/editorialDiscourse/contract.ts`
`1a5bcae439a9cd247b84ac868f894a02efbce5b35ff7eeb9494b07c340030444`

`lib/maia/canonical-turn/producerRegistry.ts`
`55fb5805ea7a740ddb020b779720d3b25e26a1374482ff2cc56a838ef4128579`

`lib/writers-studio/membrane.ts`
`287875a61068ea2fe6218afd755e44e1a00bc457fd33f8d0f771c46d2c0e2f63`

`lib/manuscript/editorialDiscourse/__tests__/contract.test.ts`
`b04603ef060cab4fa32287949a1b216e719e5e033113dc0036e6d666d7385d94`

`lib/maia/canonical-turn/__tests__/writersStudioRoom.test.ts`
`466abbf0f8925e9f53e6081850aacd6221d9abba753effc75d7c7ff92ee7d5b6`

`app/api/writers-studio/editorial/turn/__tests__/a2CarryRoute.test.ts`
`cfb73224cf2e570313f3251fa34c8f06ec4af7f928b3ab149677ed9aa8c6d154`

`lib/writers-studio/__tests__/relationshipCarry.test.ts`
`28267b6210ca4e94cfafac186bf776ebe32c378cea45d5a9a2a2af2ffc80fcdf`

`lib/writers-studio/__tests__/a2CarryHandoff.test.ts`
`ce03de3ace91ab5d01d5a87d1833864873035042d4c39685128e8eacdf8fd66f`

`tests/constitutional/writers-studio/a2-11-carry-runtime/live-witness.ts`
`3cf03e61eb74ddf586e05f7d9e78600b043d187adde9cf670b83e72e3984dbcc`
## XV. Explicit exclusions

A2-11 does not add or authorize:
- member-facing source-selection UI;
- automatic latest/first carry;
- multiple source episodes;
- member-turn carry;
- whole transcript carry;
- summary carry;
- Review continuation;
- Focus carry;
- relationship-wide transcript memory;
- reread of source locus/surround;
- provider authority from relationship membership;
- Work mutation authority;
- carry provenance persistence;
- schema migration;
- A3;
- deployment;
- production mutation;
- canonical merge.

## XVI. Product standing

For the first time, A2 relationship continuity can lawfully affect a later cognition act.

But only in one narrow form:

> the writer may identify one earlier MAIA Editorial response from the same A2 relationship, and the server can carry that exact response into a later Editorial act as provenance-preserved context.

The runtime does not choose the source.

The runtime does not summarize the relationship.

The runtime does not infer relevance.

The runtime does not treat the earlier response as current truth or instruction.

Member-facing source selection remains unbuilt.

## XVII. Stop

> **FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A2-11 PRIOR MAIA EDITORIAL TURN CARRY RUNTIME IMPLEMENTATION**

A2-11 stops before:
- member-facing carry UI;
- broader cognition classes;
- deployment;
- production mutation;
- canonical merge.

No successor is opened by this record.
