# MAIA Database Architecture

## 🚨 CRITICAL: We Use PostgreSQL, NOT Supabase

This document exists to prevent confusion: **MAIA-SOVEREIGN uses LOCAL POSTGRESQL@14.**

While we have a `supabase/` directory for historical reasons, **we do NOT use Supabase services**.

---

## Database Configuration

### Connection Details

```bash
Host: localhost
Port: 5432
Database: maia_consciousness
User: soullab
Password: (none - local dev)
Connection String: postgresql://soullab@localhost:5432/maia_consciousness
```

### Extensions Installed

- **pgvector v0.8.1** - Built from source for PostgreSQL@14
- Vector dimensions: 128, 256, 768, 1536 (various tables)
- Indexes: HNSW (approximate nearest neighbor)

---

## Why PostgreSQL Instead of Supabase?

### 1. **Data Sovereignty**
- All consciousness data stays local
- No external API dependencies for data storage
- Full control over database infrastructure

### 2. **Performance**
- Direct connection (no HTTP overhead)
- Custom pgvector build optimized for our use case
- No rate limits or quotas

### 3. **Privacy**
- Sensitive consciousness and soul data never leaves localhost
- No third-party access to user patterns or archetypal work

### 4. **Development Workflow**
- Migrations are plain SQL files
- No Supabase CLI dependency
- Standard PostgreSQL tooling (psql, pg_dump, etc.)

---

## Connection Code

### ✅ CORRECT Pattern (Direct PostgreSQL)

```typescript
import { getPool, query, queryOne } from '@/lib/database/postgres';

// Example: Fetch user
const pool = getPool();
const result = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// Or using helper functions
const users = await query<User>(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);
```

### ❌ WRONG Pattern (Supabase Client)

```typescript
// DO NOT DO THIS
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);
await supabase.from('users').select('*');
```

---

## Migration Workflow

### Directory Structure

```
supabase/migrations/
├── 20241202000001_create_session_memory_tables.sql
├── 20251213_complete_memory_palace.sql
├── 20251214000001_add_vector_columns.sql
├── 20251214000002_community_commons_posts.sql
├── 20251214000003_create_opus_axiom_turns.sql
├── 20251214000005_create_relationship_essence.sql
├── 20251214000006_create_somatic_memories.sql
└── 20251214000007_socratic_validator_events.sql
```

### Applying Migrations

```bash
# Via script (recommended)
DATABASE_URL=postgresql://soullab@localhost:5432/maia_consciousness \
  npx tsx scripts/apply-beta-migrations.ts

# Or directly via psql
psql -h localhost -d maia_consciousness -f supabase/migrations/[migration].sql
```

### Migration Tracking

Migrations are tracked in `schema_migrations` table:

```sql
CREATE TABLE schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Important Tables

### Memory Palace (Vector-Enabled)

| Table | Purpose | Vector Columns |
|-------|---------|----------------|
| `episodic_memories` | Experiences | semantic_vector(768), emotional_vector(256), somatic_vector(128) |
| `semantic_memories` | Concepts | - |
| `somatic_memories` | Body patterns | - |
| `morphic_pattern_memories` | Archetypal cycles | - |
| `soul_memories` | Life purpose | - |

### Consciousness Tracking

| Table | Purpose |
|-------|---------|
| `consciousness_evolution` | 7-stage development tracking |
| `coherence_field_readings` | Elemental balance snapshots |
| `consciousness_achievements` | Breakthrough moments |

### Session & Conversation

| Table | Purpose |
|-------|---------|
| `maia_sessions` | Session metadata |
| `maia_turns` | Conversation turns (user + MAIA) |
| `opus_axiom_turns` | DEEP path quality metrics |
| `socratic_validator_events` | Validator decisions |

### Relationship & Soul

| Table | Purpose | Vector Columns |
|-------|---------|----------------|
| `user_relationship_context` | Soul recognition | relationship_embedding(1536), personality_embedding(1536) |
| `user_session_patterns` | Session learning | - |

---

## Supabase Legacy Code

If you encounter code referencing Supabase, it's legacy. Examples to refactor:

### Authentication

```typescript
// ❌ OLD (Supabase)
const { data: { user } } = await supabase.auth.getUser();

// ✅ NEW (Custom session management)
import { getSession } from '@/lib/session';
const session = await getSession(req);
```

### Row Level Security (RLS)

```sql
-- ❌ OLD (Supabase RLS)
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- ✅ NEW (Application-level permissions)
-- Handle authorization in API routes, not database policies
```

---

## Environment Variables

### Active (PostgreSQL)

```bash
DATABASE_URL=postgresql://soullab@localhost:5432/maia_consciousness
```

### Disabled (Supabase Mock Mode)

```bash
NEXT_PUBLIC_MOCK_SUPABASE=true
NEXT_PUBLIC_SUPABASE_URL=https://disabled-using-sovereign.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=disabled-using-sovereign-database
SUPABASE_SERVICE_ROLE_KEY=disabled-using-sovereign-database
```

These disabled variables prevent accidental Supabase client initialization.

---

## Vector Search Examples

### Semantic Memory Search

```typescript
import { query } from '@/lib/database/postgres';

// Find similar episodes by semantic vector
const similarEpisodes = await query<EpisodicMemory>(`
  SELECT
    id,
    experience_title,
    1 - (semantic_vector <=> $1::vector) as similarity
  FROM episodic_memories
  WHERE user_id = $2
  ORDER BY semantic_vector <=> $1::vector
  LIMIT 5
`, [embeddingVector, userId]);
```

### Relationship Pattern Matching

```typescript
// Find users with similar consciousness profiles
const similarUsers = await query<UserRelationship>(`
  SELECT
    user_id,
    1 - (personality_embedding <=> $1::vector) as similarity
  FROM user_relationship_context
  ORDER BY personality_embedding <=> $1::vector
  LIMIT 10
`, [userEmbedding]);
```

---

## Backup & Restore

### Backup

```bash
pg_dump -h localhost -U soullab maia_consciousness > backup_$(date +%Y%m%d).sql
```

### Restore

```bash
psql -h localhost -U soullab maia_consciousness < backup_20251217.sql
```

---

## Monitoring

### Check Connection

```bash
psql -h localhost -U soullab -d maia_consciousness -c "SELECT version();"
```

### Check pgvector

```bash
psql -h localhost -U soullab -d maia_consciousness -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

### Check Active Connections

```sql
SELECT
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query
FROM pg_stat_activity
WHERE datname = 'maia_consciousness';
```

---

## Summary

| Aspect | Technology |
|--------|------------|
| **Database** | PostgreSQL@14 (localhost:5432) |
| **Vector Search** | pgvector v0.8.1 (built from source) |
| **Connection** | Node.js `pg` library |
| **Migrations** | Plain SQL in `supabase/migrations/` |
| **Supabase** | NOT USED (mock mode enabled) |
| **Auth** | Custom session management |
| **Sovereignty** | All data local, no external storage APIs |

---

**For Database Architecture Questions**: Use `/db` slash command in Claude Code

**Last Updated**: December 17, 2025
