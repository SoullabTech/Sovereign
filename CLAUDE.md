# Project Invariants (MUST FOLLOW)

## Database & Backend

- **We do NOT use Supabase.** Never introduce Supabase. Use local PostgreSQL via `lib/db/postgres.ts` only.
- **If you see Supabase in code, remove it; do not consolidate it.**
- Database: Local PostgreSQL at `postgresql://soullab@localhost:5432/maia_consciousness`
- Database client: `lib/db/postgres.ts` (uses `pg` npm package)
- Never add `@supabase/*` imports, RLS policies, or Supabase migrations
- Enforcement: `npm run check:no-supabase` blocks violations (runs in pre-commit hook)

## MAIA Sovereignty

- MAIA runs locally using Ollama (DeepSeek models)
- Never propose OpenAI, Anthropic, or other cloud AI providers as dependencies
- Voice: Local TTS/STT or browser APIs only
- Data: Local storage, never cloud services

## Architecture

- This is a Next.js 16 app using Turbopack
- Voice modes: Talk (dialogue), Care (counsel), Note (scribe)
- Processing paths: FAST (<2s), CORE (2-6s), DEEP (6-20s)
- Consciousness framework: Spiralogic (see `/lib/maia/spiralogicReference.ts`)

## Before Making Changes

1. Search codebase for existing implementations
2. Run `npm run check:no-supabase` to verify no Supabase violations
3. Run `npm run preflight` for full sovereignty check
4. Test with `npm run smoke` before committing

## Setup (New Clones)

After cloning this repo, run once:
```bash
./scripts/setup-githooks.sh
```

This configures versioned git hooks that enforce sovereignty on every commit.
