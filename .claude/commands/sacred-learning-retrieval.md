---
description: "Build retrieval and API layer for sacred learning domain"
allowed-tools: "Read,Grep,Glob,Write,Edit,Bash"
---

# Sacred Learning Retrieval & API

You are building the retrieval logic and API endpoints for the Sacred Learning Domain.

## REQUIRED READING FIRST

Read these files:
- `docs/sacred-learning/ARCHITECTURE_BRIEF.md` (especially sections 7-9)
- `docs/sacred-learning/SACRED_SOURCE_INTEGRITY_POLICY.md` (especially sections 4, 8)
- `lib/sacred-learning/types.ts`

## RETRIEVAL ARCHITECTURE

### Source-Aware Ranking

Unlike memory resonance retrieval, sacred learning retrieval respects authority hierarchy:

1. Qur'an (Level 1) is always the primary element in any passage view
2. Commentary follows source — never freestanding
3. Poetry (Level 4) enriches but never leads
4. AI synthesis (Level 6) appears last, always labeled
5. Content without complete provenance is never served

### Response Assembly

For a daily encounter, assemble:
```
1. Source passage (Arabic + translation + reference)
2. Context note
3. Available commentary layers (tafsir, mystical, contemplative)
4. Contemplative question (AI-composed, labeled)
5. Practice invitation (AI-composed, labeled)
```

## API ENDPOINTS TO BUILD

### `GET /api/sacred-learning/daily`
- Returns today's encounter (passage + all layers)
- Selection logic Phase 1: sequential from curated theme
- Must include full provenance for every content block
- Must include authority_level for every content block

### `GET /api/sacred-learning/passage/[id]`
- Returns single passage with all commentary layers
- Response includes full provenance metadata

### `POST /api/sacred-learning/reflection`
- Saves member reflection linked to passage
- Respects Sanctuary Mode (check session flag — if sanctuary, do not store)
- Fire-and-forget bridge to episodic_memories (optional Phase 2)

### `GET /api/sacred-learning/saved`
- Returns member's saved passages with timestamps

### `POST /api/sacred-learning/save`
- Saves/unsaves a passage for the member

## EXISTING PATTERNS TO FOLLOW

- `app/api/oracle/conversation/route.ts` — for auth pattern (getCurrentSession)
- `lib/db/postgres.ts` — for query()
- `app/api/journal/quick/list/route.ts` — for simple list endpoint pattern
- Fire-and-forget writes: same pattern as spiralStatePersistence

## AI BEHAVIOR (for oracle lens, Phase 2)

When building the sacred learning oracle lens (`lib/sacred-learning/sacredLearningLens.ts`):
- Follow `lib/consciousness/therapeuticFrameworks.ts` pattern
- The lens adds a prompt block enforcing:
  - citation obligations
  - humility language
  - hierarchy preservation
  - no doctrinal claims
  - no synthesis presented as source

## NON-NEGOTIABLE

- Every API response includes `authorityLevel` and `provenance` per content block
- No content with `review_status !== 'approved'` is served
- Sanctuary Mode is checked before any reflection storage
- Arabic text is served as UTF-8, never transliterated
