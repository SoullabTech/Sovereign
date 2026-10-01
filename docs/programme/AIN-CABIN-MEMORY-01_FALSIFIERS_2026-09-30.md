# AIN-CABIN-MEMORY-01 — Falsifier Contract

**Status:** implementation target
**Base:** 439d9bd1c

## F1 — Acceptance durability

**Defeat candidate:** persist a member turn only after the assistant response exists.

**Death condition:** write a member turn alone, close the store, reopen it, and recover that turn.

The local turn substrate must therefore support the same acceptance semantics as `TurnsStore.addExchangeTurn`.

## F2 — Idempotency

**Defeat candidate:** repeated writes create duplicate turns.

**Death condition:** the same `exchange_id + seq` is submitted twice and exactly one row survives.

## F3 — Provenance and Sanctuary

**Defeat candidate:** local storage accepts a plain object pretending to be a resolved posture, or writes a Sanctuary turn.

**Death condition:** a missing/forged posture or Sanctuary posture produces no durable turn.

The local writer must use the existing `TurnPosture` and `Provenance` boundaries, not duplicate their semantics.

## F4 — Session boundary

**Defeat candidate:** current-session and cross-session recall become indistinguishable.

**Death condition:** local retrieval can return current-session turns separately from prior-session turns, with the current session excluded from cross-session recall.

## F5 — Member ownership

**Defeat candidate:** a caller can read another member's turns by supplying a foreign user id.

**Death condition:** every local turn read is scoped to the Cabin-authoritative member.

## F6 — Developmental derivation

**Defeat candidate:** raw transcript text is promoted wholesale into long-term memory.

**Death condition:** developmental storage accepts only the bounded canonical trajectory signal as `content_text`; raw exchange material remains in the provenance/trigger envelope.

## F7 — No cloud fallback

**Defeat candidate:** local memory read/write silently falls through to PostgreSQL.

**Death condition:** the local memory tests contain no PostgreSQL import and the offline route remains fail-closed until cognition is localized.

## F8 — One database

**Defeat candidate:** turns are stored in one local database and developmental memory in another.

**Death condition:** both canonical memory tables are created and exercised through the same `CabinLocalStore` database file.

## F9 — Restart

**Defeat candidate:** memory exists only for the lifetime of the Node process.

**Death condition:** close the store, reopen the same SQLite file, and recover turns and developmental memory.

## Boundary

This cut localizes **storage**, not MAIA cognition.

No response route is reopened yet. The Cabin continues to return `CABIN_COGNITION_NOT_LOCAL` until a later cognition cut proves the complete memory-health contract.

## Witness results

F1 — acceptance durability: **PASS**

A member turn survives store close/reopen even when no assistant turn exists.

F2 — idempotency: **PASS**

Repeated `exchange_id + seq` submission returns the original row; the turn count remains one.

F3 — provenance and Sanctuary: **PASS**

Both a missing posture and a Sanctuary posture refuse durable storage.

F4 — session boundary: **PASS**

Current-session retrieval and cross-session retrieval are separate APIs; the current session is excluded from prior-session recall.

F5 — member ownership: **PASS**

All local turn and developmental-memory reads require the Cabin member id and cannot cross the member boundary.

F6 — developmental derivation: **PASS**

Canonical trajectory signal is required; raw text cannot be substituted as `content_text`.

F7 — no cloud fallback: **PASS**

The local store imports neither PostgreSQL nor browser storage. Cabin cognition remains fail-closed.

F8 — one database: **PASS**

`conversation_turns` and `developmental_memories` are tables in the same SQLite file.

F9 — restart: **PASS**

Turn and Work persistence survive store/process restart; version-one Cabin files migrate forward without replacing member identity.

## Verification totals

Focused Cabin data/memory suite: **13/13**

Focused Cabin runtime + memory suite: **35/35**

Full Desktop suite: **393/393**

Production `next build`: **exit 0**

Repository type-health: **same pre-existing single diagnostic** at `lib/stripe/config.ts:23`; no Cabin diagnostic was introduced.

## Boundary still held

The memory substrate is now locally durable, but MAIA cognition is still not enabled in Cabin mode.

That is deliberate. The next cut is not “turn on chat.” It is the **memory-source/health seam**: prove that local turns and developmental memory can be presented to the existing memory orchestration contract with accurate per-layer health, before any model is allowed to speak from them.
