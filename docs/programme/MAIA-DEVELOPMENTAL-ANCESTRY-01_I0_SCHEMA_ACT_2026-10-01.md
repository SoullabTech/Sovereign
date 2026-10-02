# MAIA-DEVELOPMENTAL-ANCESTRY-01 — I0 SCHEMA ACT

**Date:** 2026-10-01
**Status:** I0 OPENED · schema/migration candidate only · runtime untouched
**Authority:** founder continuation authorizing the bounded schema act after R0–R2 adjudication.

## 1. Sole job

Create the smallest durable carrier needed for future developmental memories to retain the exact existing conversation-exchange identity from which they were derived.

I0 may:
- add one nullable UUID provenance column to `developmental_memories`;
- add one inspection index;
- document the source semantics and historical-null ceiling.

I0 may not:
- modify `MemoryWriteback.ts` or any runtime caller;
- backfill historical rows;
- infer lineage from text, timestamps, embeddings, session proximity, or similarity;
- alter memory content, ranking, retrieval, significance, prompt participation, or member-visible behavior;
- execute the migration against production;
- merge or deploy.

## 2. Binding identity ruling

The source object is the durable member-MAIA conversation **exchange**, not one half-row and not the numeric learning/logging turn id.

Canonical source identity:

`conversation_turns.exchange_id UUID`

The candidate carrier is therefore:

`developmental_memories.source_exchange_id UUID NULL`

NULL is meaningful: exact exchange ancestry was not durably recorded.

No foreign key is added. One `exchange_id` legitimately identifies two `conversation_turns` rows (`seq=0` member, `seq=1` MAIA), so a row-level FK would encode the wrong ontology.

## 3. Historical ceiling

Existing developmental memories are not backfilled.

A likely source is not a provenance source. Historical lineage may remain unknown indefinitely unless an already-authoritative custody record independently supplies it.

## 4. Inspection gates

Before any runtime wiring act may open, verify:

1. migration is additive only;
2. the new column is nullable and UUID-typed;
3. no UPDATE/backfill exists;
4. no runtime file is changed;
5. no FK collapses exchange identity into one turn row;
6. historical NULL is preserved as unknown, not treated as an error;
7. rollback can remove only the new index and column without affecting serving behavior.

## 5. Stop rule

After the migration candidate and this custody record exist, STOP.

Runtime propagation on `/list`, pre-generation exchange identity on `/between`, migration execution, merge, deploy, and production witness remain unauthorized.
