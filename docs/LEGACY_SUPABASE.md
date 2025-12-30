# Legacy Supabase Files

These files contain Supabase dependencies that are pending migration to the Postgres-native implementation (`lib/db/postgres.ts`).

All files are marked with `@ts-nocheck` and excluded from strict type checking until migrated.

## Files Requiring Migration

| File | Purpose | Migration Priority |
|------|---------|-------------------|
| `lib/consciousness/RelationshipAnamnesis_Direct.ts` | Direct relationship storage | Low (use RelationshipAnamnesisStorage.ts) |
| `lib/field-protocol/FieldRecordsService.ts` | Field records persistence | Medium |
| `lib/memory/bardic/EmbeddingService.ts` | Vector embeddings (pgvector) | High |
| `lib/memory/bardic/LinkingService.ts` | Episode graph links | Medium |
| `lib/memory/bardic/ReentryService.ts` | Episode re-entry gating | Medium |
| `lib/memory/bardic/CueService.ts` | Sensory cue management | Medium |
| `lib/memory/bardic/RecallService.ts` | Episode recall with artifacts | Medium |
| `lib/memory/bardic/TeleologyService.ts` | Future-pull tracking | Medium |

## Migration Pattern

When migrating a file:

1. Import the Postgres pool from `lib/db/postgres.ts`:
   ```typescript
   import { query, transaction } from '@/lib/db/postgres';
   ```

2. Replace Supabase client calls with raw SQL:
   ```typescript
   // Before (Supabase)
   const { data, error } = await supabase.from('table').select('*').eq('id', id);

   // After (Postgres)
   const result = await query<Row>('SELECT * FROM table WHERE id = $1', [id]);
   ```

3. Remove `@ts-nocheck` directive and fix any type errors

4. Test with `npm run type-check` and `npm run build`

5. Remove this file from the list above

## Why Not Supabase?

Per CLAUDE.md project invariants:
- MAIA runs locally using local PostgreSQL
- Data sovereignty requires local-only storage
- No cloud dependencies for core functionality
