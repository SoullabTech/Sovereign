---
description: "Wire memory persistence for an Oracle feature"
argument-hint: "feature-name"
allowed-tools: "Read,Grep,Glob,Write,Edit"
---

# Oracle Memory Integration

You are wiring memory persistence for: **$1**

## Architecture context

Memory in MAIA follows the **Bridge D pattern** established in `lib/consciousness/spiralStatePersistence.ts`:

### Design principles
1. **Fire-and-forget writes** — never await, never block the oracle response
2. **Graceful fallback on read** — if load fails, conversation continues normally
3. **No conversation content** — only structural position (element/phase/motion/intensity)
4. **Upsert-safe** — first insert creates, subsequent calls update
5. **Server restart resilient** — state seeds from DB if in-memory buffer is empty

### Existing memory layers
- `lib/consciousness/spiralStatePersistence.ts` — element/phase/motion/intensity per member
- `lib/consciousness/participatoryRealityHelper.ts` — theme signals (fire-and-forget INSERT)
- `lib/db/postgres.ts` — pg Pool, the only database client
- Oracle route (~line 415): loads spiral state early
- Oracle route (~line 1067): upserts spiral state late (fire-and-forget)

### The pattern to follow

```typescript
// READ — early in the request, graceful fallback
const state = await loadFeatureState(memberId).catch(() => null);

// WRITE — late in the request, fire-and-forget
void upsertFeatureState(memberId, { ...newState }).catch(err =>
  console.error('[Feature] state write failed:', err.message)
);
```

## Your task

### 1. Identify the single best write point
- Where in the orchestration flow does this feature's state become known?
- Write ONCE, at that point — do not scatter writes across agents
- The write point should be AFTER synthesis, BEFORE response return

### 2. Identify the read point
- Where does this feature's state need to be available?
- Load EARLY, before the state is needed
- Always provide a fallback (null or default) if the read fails

### 3. Database schema (if new table needed)
- Migration file: `database/migrations/YYYYMMDDHHMMSS_$1.sql`
- Include `IF NOT EXISTS` guards
- Include relevant indexes
- Keep the table minimal — store structure, not content

### 4. Persistence module
- File: `lib/consciousness/$1Persistence.ts` (or extend existing module)
- Export: `load$1State(memberId)` and `upsert$1State(memberId, update)`
- Follow spiralStatePersistence.ts conventions exactly

### 5. Wiring in oracle route
- Import the load/upsert functions
- Add load call near other state loads (~line 415)
- Add upsert call near other state writes (~line 1067)
- Both should be non-blocking

### 6. Verification
- [ ] Migration applies cleanly
- [ ] Migration registered in `schema_migrations`
- [ ] Load returns null gracefully when no row exists
- [ ] Write succeeds (check via `docker exec maia-postgres psql ...`)
- [ ] Write failure does not break the oracle response
- [ ] No Supabase imports introduced

## Constraints

- NEVER use Supabase — `lib/db/postgres.ts` only
- NEVER store conversation content — only structural metadata
- NEVER await memory writes in the response path
- NEVER duplicate writes across multiple layers
- Follow the naming convention: `member_[feature]_state` for tables
- Keep persistence modules under 100 lines
- Test from inside the Docker container, not from the host (port 3000 is internal)
