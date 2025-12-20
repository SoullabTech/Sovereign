---
description: Database architecture - CRITICAL: We use PostgreSQL, NOT Supabase
---

# MAIA Database Architecture

## ⚠️ CRITICAL: NO SUPABASE

**This project uses LOCAL POSTGRESQL, NOT Supabase.**

### Database Configuration:

- **Database**: PostgreSQL@14 on localhost:5432
- **Name**: `maia_consciousness`
- **User**: `soullab` (no password for local dev)
- **Extensions**: pgvector v0.8.1 (built from source)
- **Connection**: `postgresql://soullab@localhost:5432/maia_consciousness`

### What This Means:

❌ **DO NOT**:
- Reference Supabase client libraries
- Use Supabase auth (auth.uid())
- Create RLS policies for `service_role` or `authenticated` roles
- Suggest Supabase-specific features
- Use `@supabase/supabase-js` for database operations

✅ **DO**:
- Use direct PostgreSQL connections via `pg` library
- Reference `lib/database/postgres.ts` for connection pooling
- Use standard PostgreSQL roles and permissions
- Write migrations as plain SQL in `supabase/migrations/`
- Use `DATABASE_URL` environment variable

### Migration Directory Structure:

```
supabase/migrations/          # Plain PostgreSQL migrations (not Supabase-managed)
├── 20241202000001_create_session_memory_tables.sql
├── 20251213_complete_memory_palace.sql
└── [other migrations]
```

**Note**: The `supabase/` directory name is historical. We use it for migrations but DO NOT use Supabase services.

### Environment Variables:

```bash
DATABASE_URL=postgresql://soullab@localhost:5432/maia_consciousness

# Supabase variables are DISABLED:
NEXT_PUBLIC_MOCK_SUPABASE=true
NEXT_PUBLIC_SUPABASE_URL=https://disabled-using-sovereign.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=disabled-using-sovereign-database
```

### Connection Code Pattern:

```typescript
// ✅ CORRECT - Direct PostgreSQL
import { getPool } from '@/lib/database/postgres';
const pool = getPool();
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

// ❌ WRONG - Do not use Supabase
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(...);
```

### Why PostgreSQL Instead of Supabase?

1. **Sovereignty**: Full control over data and infrastructure
2. **Vector Search**: pgvector built from source for PostgreSQL@14
3. **Local Development**: No external dependencies or API limits
4. **Performance**: Direct connection, no HTTP overhead
5. **Privacy**: Consciousness data stays local

---

**Remember**: If you see any code referencing Supabase client operations, it's legacy code that should be refactored to use direct PostgreSQL connections.
