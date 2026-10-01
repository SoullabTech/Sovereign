# WRITERS-STUDIO-NEXT-01 / A2-7
## DURABLE RELATIONSHIP RETURN + CROSS-SESSION PLACE INTEGRATION

**Date:** 2026-09-26  
**Parent:** `7e62ccc4ab7c48d2054b87314aef17766b47ccad`  
**Branch:** `feature/ws-next-a2-7-durable-return-place-20260926`  
**Execution packet SHA-256:** `e144c81b5be4c9801a45b91d59a0c70ab2f601819875b0fd378e67af99838ac9`

## I. Result

A2-7 implements durable cross-session return while preserving the constitutional separation:

> **relationship identity answers “which relationship with MAIA?”**

> **place answers “where was I in my Work?”**

They are stored separately, restored separately, validated separately, and cleared separately.

No relationship state derives place. No place state derives relationship.
## II. Durable relationship return

New member-owned return state records one exact A2 relationship for one exact:
- member;
- Living Work;
- manuscript.

The durable relationship return is written only after an explicit member selection:
- Begin relationship with MAIA;
- Choose an existing exact relationship.

Leave this relationship clears only the durable relationship return.

No list order, latest row, first row, session, Editorial child, Review child, or place may select a relationship.

An explicit valid `relationship=` URL address wins over durable return.

A durable exact selection is restored only when no explicit relationship address exists.

Stale or mismatched durable selection is cleared rather than replaced by another relationship.
## III. Durable place return

Place is stored in a separate member-owned record for the same exact Work/manuscript scope.

A2-7 place V1 stores only:
- exact `manuscript_draft_sections.id`.

It does not store:
- relationship id;
- Editorial thread;
- Review finding;
- passage;
- caret;
- selection;
- pixel scroll;
- cognition state.

Deliberate exact manuscript movement persists place asynchronously.

Writes are serialized per Work/manuscript so an older A write cannot finish after a newer B write.

An explicit valid `s=` URL address wins over durable place.

Without explicit place, an exact durable section returns if it still exists in the current section-addressable draft.

Only after no valid durable place exists does the inherited first-section arrival floor apply.
## IV. Work-context gate

Return state is valid only when the manuscript has exactly one current member declaration into a Living Work and that Work is the requested scope.

Therefore:
- no Work declaration refuses scoped persistence;
- multiple current Work declarations refuse scoped persistence;
- foreign Work/manuscript/relationship/section refuses;
- a return record cannot manufacture a Work context.

The server derives member identity from authentication.

## V. Storage

Migration:
`database/migrations/20260926000004_writer_studio_return_state.sql`

Creates two independent mutable return-state tables:
- `writer_studio_relationship_returns`;
- `writer_studio_place_returns`.

The A2 parent relationship and its append-only episodes remain unchanged and immutable.

The new tables contain no manuscript prose or child cognition content.
## VI. Arrival precedence

Relationship:

```text
valid explicit relationship URL
        ↓
durable exact relationship return
        ↓
none selected
```

Place:

```text
valid explicit section URL
        ↓
durable exact place return
        ↓
first-section arrival floor
```

These precedence chains execute independently.

A late durable-place read cannot move the writer after a deliberate current-session movement; the client records that the place has been touched and ignores the late return.
## VII. Direct A2-7 evidence

Real PostgreSQL + Next.js + authenticated browser + new browser-session witness:

**14/14 PASS**

Proved:
1. Begin persists the exact explicitly selected relationship.
2. Deliberate section movement persists the exact place.
3. Place movement does not change relationship return.
4. New browser session restores exact relationship independently.
5. New browser session restores exact place independently.
6. Explicit section URL outranks different durable place.
7. Explicit section URL does not erase durable place.
8. Explicit relationship URL outranks different durable relationship.
9. Explicit relationship URL does not rewrite durable relationship.
10. A clean return still restores the durable relationship after explicit override.
11. Leave clears durable relationship return.
12. Leave preserves durable place.
13. Foreign relationship return write refuses.
14. Ambiguous Work context refuses durable place write.

Witness SHA-256:
`f63fae7eb2ec7bb2e9687941320c61be0f3bc9d8528e26d892b27872da2e96ad`
## VIII. Inherited A2-6 regression

The frozen A2-6 witness assumed:
- a fixed 250 ms wait after Begin another;
- immediate reload after clicking Leave.

A2-7 deliberately inserts durable persistence before selection completion and makes Leave fail-closed on durable deletion.

The frozen A2-6 witness was not modified.

A new A2-7 regression copy replaces only those timing assumptions with observable state waits.

Result:

**14/14 PASS**

Regression witness SHA-256:
`94cb8f8de4b96ace74d0b174669e7847de61681186398876b23555ac981b0d19`

A2-6 semantic laws remain intact: no inferred latest/first relationship, explicit member choice, exact parent identity, and truthful Work-context blocking.
## IX. Unit and repository evidence

Combined focused Jest:
- 4 suites;
- **25/25 PASS**.

Includes inherited place/address/carriage tests plus the A2-7 ordered-place-write test.

TypeScript no-regression:
- 4,463 program files;
- 226 current errors;
- 239 baseline errors;
- 13 baseline errors fixed;
- **no regressions**.

Design canon:
**PASS** · one member-facing surface covered by an Experience Contract.

Provider / platform:
- no-Supabase PASS;
- provider governance PASS;
- `ci:sovereignty` PASS;
- vendor voice gate PASS;
- voice provenance PASS;
- member-identifier log gate: no new violations;
- voice identity **29/29 PASS**.

Focus diff:
**EMPTY**.
## X. Migration evidence and pre-existing tooling debt

The new A2-7 migration applied cleanly against fresh clones of the previously proven A2-6 witness schema.

A full blank-database migration run was also attempted.

That run stopped before reaching A2-7 at historical migration:

`20251231_memory_architecture_enhancements.sql`

because it references missing relation:

`developmental_memories`.

This is pre-existing migration-order/schema debt and is not caused by the A2-7 migration.

Separately, package script `check:sovereignty` points to missing file:
`scripts/check-maia-sovereignty.ts`.

No claim is made that this obsolete standalone command passed.

The repository's operational `ci:sovereignty` path passed completely.
## XI. Exact implementation identities

`app/writers-studio/rebuild/RebuildStudioClient.tsx`  
`83be0a2a0ea3514b84db8f1ce094c2ba565379e742648605c957d6bef141ebac`

`app/api/writers-studio/return/relationship/route.ts`  
`7fde1dcc3ec93e6e1685790bf273a54a1b8b9b86a9210ec70fb3673bdee06f85`

`app/api/writers-studio/return/place/route.ts`  
`5c57282e12bc1c61477e37f66ff8af7da5076706d70d48bf18cf86822f4b4fbd`

`database/migrations/20260926000004_writer_studio_return_state.sql`  
`be3d512e8342060e4056a8643aa77fd78dd576467804b6ee55483ef20f06d616`

`lib/writers-studio/returnState.ts`  
`566e169e27fa7af831a88b88c682217d2f8aed29688d8802817785a0269326e0`
`lib/writersStudio/rebuild/returnStateClient.ts`  
`9de86515bff43d1db2ae7a7200e807e8629c8e6d7baaf2c63c6bae047ae6ec43`

`lib/writersStudio/rebuild/__tests__/a2ReturnStateClient.test.ts`  
`53c9ade93a5e932f74946aa54ff908ed2773ad7f469c065b0293a96c6e3755f4`

`tests/constitutional/writers-studio/a2-7-return-place/live-witness.ts`  
`f63fae7eb2ec7bb2e9687941320c61be0f3bc9d8528e26d892b27872da2e96ad`

`tests/constitutional/writers-studio/a2-7-return-place/a2-6-regression-witness.ts`  
`94cb8f8de4b96ace74d0b174669e7847de61681186398876b23555ac981b0d19`

## XII. Explicit exclusions

A2-7 does not establish or authorize:
- cross-episode cognition;
- relationship transcript;
- child-content replay;
- Focus carriage;
- relationship-derived place;
- place-derived relationship;
- durable passage/caret/pixel scroll;
- chapter/whole-Work/sentence cognition;
- A3;
- deployment;
- production mutation or probe;
- canonical merge.
## XIII. Product standing

The Studio can now return a writer to two independent continuities after a new browser session:

- the exact relationship with MAIA they explicitly chose;
- the exact section of the Work they last deliberately occupied.

The Studio does not confuse those continuities.

Relationship is relational continuity.

Place is manuscript orientation.

Neither is cognition.

## XIV. Stop

> **FOUNDER ADJUDICATION — WRITERS-STUDIO-NEXT-01 / A2-7 DURABLE RELATIONSHIP RETURN + CROSS-SESSION PLACE INTEGRATION**

A2-7 stops here.

No cognition-bearing continuity successor, Focus work, A3 work, deployment, production mutation, or canonical admission has been opened.
