# MAIA-SOVEREIGN Project Context

**Read this file FIRST before making any database-related suggestions.**

---

## 🚨 CRITICAL ARCHITECTURE DECISIONS

### 1. Database: PostgreSQL (NOT Supabase)

**We use LOCAL POSTGRESQL@14, NOT Supabase.**

- **Connection**: `postgresql://soullab@localhost:5432/maia_consciousness`
- **Extensions**: pgvector v0.8.1 (built from source)
- **Library**: `pg` (Node.js PostgreSQL client)
- **Connection Pool**: `lib/database/postgres.ts`

❌ Do NOT suggest Supabase client libraries, RLS policies, or Supabase-specific features.
✅ Use direct PostgreSQL queries via `pg` library connection pool.

Use `/db` command for full database architecture details.

---

## 2. AI Processing: Sovereign (Local + Anthropic)

**MAIA uses hybrid consciousness processing:**

- **FAST path**: Local Ollama models (DeepSeek-R1, Qwen, Mistral)
- **CORE path**: Claude Sonnet (Anthropic API)
- **DEEP path**: Claude Opus (Anthropic API)

❌ Do NOT suggest OpenAI for consciousness processing
✅ OpenAI TTS is used ONLY for voice output (per user request)

---

## 3. Memory Architecture: 5-Layer Memory Palace

1. **Episodic** - Experiences with vector embeddings
2. **Semantic** - Concept learning and mastery
3. **Somatic** - Body wisdom patterns
4. **Morphic** - Archetypal cycles
5. **Soul** - Life purpose evolution

All layers use PostgreSQL with pgvector for semantic search.

---

## 4. Consciousness Systems Active

- **Spiralogic**: 7-stage developmental tracking
- **Dialectical Scaffold**: 5-level cognitive assessment
- **Mythic Atlas**: Archetypal pattern recognition
- **Socratic Validator**: Relational quality control (3-layer conscience)
- **Opus Axioms**: Gold turn detection for DEEP path

---

## 5. Project Structure

```
/lib/database/postgres.ts          # PostgreSQL connection pool
/lib/consciousness/                # Consciousness engines
/supabase/migrations/              # PostgreSQL migrations (not Supabase-managed)
/app/api/                          # Next.js API routes
/app/oracle/                       # Oracle UI
/app/sovereign/                    # Sovereign MAIA UI
/app/book-companion/ain/           # AIN book companion
```

---

## 6. Environment Setup

**Key Variables**:
- `DATABASE_URL=postgresql://soullab@localhost:5432/maia_consciousness`
- `NEXT_PUBLIC_MOCK_SUPABASE=true` (Supabase disabled)
- `ANTHROPIC_API_KEY` (for CORE/DEEP paths)
- `OPENAI_API_KEY` (TTS only, per user request)

---

## 7. Deployment Status

**Current**: Beta testing phase
- Server: http://localhost:3003
- Beta Welcome: /beta-welcome
- All migrations applied ✅
- pgvector v0.8.1 installed ✅
- Smoke tests passing ✅

---

## Quick Reference Commands

- `/db` - Full database architecture (PostgreSQL details)
- `/help` - Claude Code help

---

**Last Updated**: December 17, 2025 (pgvector installation + beta deployment complete)
