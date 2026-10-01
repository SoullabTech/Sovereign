# AIN-CABIN-MEMORY-01 — Memory Authority Census

**Status:** census complete; build open
**Base:** 439d9bd1c

## Governing sentence

> Cabin memory must preserve the distinction between what was said, what the member marked as significant, and what MAIA may use as a derived continuity signal.

## Existing memory authorities

### 1. Conversation turns

`conversation_turns` is the canonical durable transcript substrate.

`TurnsStore` already enforces:
- Sanctuary posture at the write boundary;
- server-minted provenance;
- idempotent `exchange_id + seq`;
- member-turn durability before MAIA generation completes.

**Cabin decision:** localize this first, using the canonical table name and semantics.

### 2. Developmental memory

`developmental_memories` is the canonical derived long-term substrate.

Its canonical `content_text` is a bounded trajectory signal. `MemoryWriteback` retains a bounded raw exchange under `trigger_event.raw`; the prompt-facing loader uses only the distilled signal.

**Cabin decision:** localize after turns, using the production schema's meaning without importing PostgreSQL-specific vector machinery.

### 3. Episodic memory

`episodic_memories` is member-marked significance.

The governing migration makes the boundary explicit:
- `marked_by_member = TRUE` is required;
- `verbatim_text` is the member-authored channel;
- source turn/session are provenance pointers;
- interpretive significance fields are nullable rather than system-invented;
- recall is consent-gated by `episodic_recall_enabled`.

**Cabin decision:** later cut. Do not manufacture an episodic write path while localizing turns.

### 4. Conversational recall

Conversational recall already reads prior-session turns and excludes the current session. It is a retrieval policy over `conversation_turns`, not a second transcript store.

**Cabin decision:** derive it from the local turn table. No `cabin_conversational_memory` table.

### 5. Memory orchestration

`memoryOrchestrator.ts` is pure coordination. It does not own storage.

**Cabin decision:** keep it unchanged. Localize the storage/loader boundary beneath it.

### 6. Legacy candidates defeated

`SemanticMemoryService` is a legacy Supabase substrate and cannot become Cabin authority.

`UnifiedMemoryInterface` contains in-process prototype state and a competing memory ontology; it cannot become Cabin authority.

The generic `cabin_memory_items` table from DATA-01 remains non-authoritative compatibility substrate. It is not read by MAIA and will not be used for canonical memory.

## Implementation result

The canonical memory substrate now lives in the same Cabin SQLite authority as Identity, House, Work, and Manuscript.

### Local canonical tables

- `conversation_turns`
- `developmental_memories`

The earlier generic `cabin_memory_items` table remains present only as a non-authoritative compatibility substrate. No MAIA path reads it.

### Turn authority

The local turn writer reuses the existing `TurnPosture` and `Provenance` classes. Sanctuary and unresolved posture therefore fail closed under the same constitutional boundary as the server path.

The local turn table preserves:
- member ownership;
- session id;
- role;
- content;
- creation time;
- exchange id;
- sequence;
- visibility;
- posture at creation;
- immutable provenance JSON.

The exchange/sequence uniqueness rule is enforced in SQLite with a unique partial index; duplicate writes are ignored and the existing canonical row is returned. SQLite supports unique partial indexes for exactly this kind of conditional uniqueness. citeturn1view0

### Developmental authority

The local developmental table preserves the production schema's semantic fields while intentionally omitting PostgreSQL-only vector machinery.

The store rejects a long-term memory write unless `content_text` has the canonical three-clause bounded trajectory shape. Raw exchange material can remain in the bounded trigger envelope, but it is never substituted for the trajectory signal.

### Schema evolution

Cabin schema version advanced from 1 to 2.

Existing version-one Cabin files migrate in place: member identity, Works, manuscripts, declarations, and House state remain intact while the memory tables are added.

Node's built-in `node:sqlite` remains the local engine; `DatabaseSync` is file-backed and provides the synchronous SQLite connection used by the Cabin. citeturn3view0
