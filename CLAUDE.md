# CLAUDE.md — MAIA-Sovereign Development Guide

**What this repo is**: MAIA is a sovereign, local-first consciousness computing platform with symbolic routing, consciousness tracing, multi-agent orchestration, and the 12-facet Spiralogic ontology.

---

## 1. Sovereignty Invariants (NON-NEGOTIABLE)

### Database & Backend
- **We do NOT use Supabase.** Never introduce Supabase. Use local PostgreSQL via `lib/db/postgres.ts` only.
- **If you see Supabase in code, remove it; do not consolidate it.**
- Database: Local PostgreSQL at `postgresql://soullab@localhost:5432/maia_consciousness`
- Database client: `lib/db/postgres.ts` (uses `pg` npm package)
- Never add `@supabase/*` imports, RLS policies, or Supabase migrations
- Enforcement: `npm run check:no-supabase` blocks violations (runs in pre-commit hook)

### MAIA Sovereignty
- MAIA runs locally using **Ollama** (DeepSeek models)
- **Never propose OpenAI, Anthropic, or other cloud AI providers** as dependencies
- Voice: Local TTS/STT or browser APIs only
- Data: Local storage, never cloud services
- **No secrets in repo**: Never paste API keys/tokens into code, docs, commits
- **No surprise external dependencies**: Avoid adding cloud services without explicit user intent

### LLM Provider Routing (ENFORCED)
- **ALWAYS use `lib/ai/providerRouter.ts`** for LLM calls
- **NEVER instantiate Anthropic directly** with `new Anthropic()`
- Channel-based routing:
  - `getLLM('chat')` → Claude allowed (MAIA's "mouth"), respects `ALLOW_ANTHROPIC_CHAT`
  - `getLLM('consciousness')` → Always local (MAIA's "mind"), never Claude
- Pre-commit hook blocks direct Anthropic usage (except in providerRouter.ts itself)
- Example replacement:
  ```typescript
  // ❌ WRONG - bypasses sovereignty
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  await anthropic.messages.create({...});

  // ✅ CORRECT - respects sovereignty flags
  import { getLLM } from '@/lib/ai/providerRouter';
  const llm = getLLM('chat');
  await llm.generateText(prompt, { system, maxTokens });
  ```

### Privacy & Security
- Preserve privacy: do not introduce telemetry or third-party tracking
- No automatic data sharing or analytics
- All consciousness data stays local

---

## 2. Architecture Overview

### Core Stack
- **Framework**: Next.js 16 with Turbopack
- **Database**: PostgreSQL (local, via `pg` client)
- **AI Runtime**: Ollama with DeepSeek models
- **Voice modes**: Talk (dialogue), Care (counsel), Note (scribe)
- **Processing paths**: FAST (<2s), CORE (2-6s), DEEP (6-20s)

### Key Systems
- **Symbolic Router**: S-expression DSL rules in `consciousness_rules` table
- **Consciousness Tracing**: PostgreSQL persistence (`consciousness_traces` table)
- **12-Facet Ontology**: W1–W3, F1–F3, E1–E3, A1–A3, Æ1–Æ3 (see `lib/consciousness/spiralogic-facet-mapping.ts`)
- **Multi-Agent Orchestration**: MainOracleAgent + specialized agents

---

## 3. Development Workflow (The Contract)

### When Making Changes

**Always state**:
1. Target file path(s) before edits
2. Plan (brief, 2-4 sentences)
3. Files to change (exact paths)
4. Patch or exact snippets with placement
5. Commands to run to verify
6. What "done" looks like

**Principles**:
- Make small, mergeable changes with minimal blast radius
- Prefer adding/adjusting tests alongside behavior changes
- If you change schema/types/enums: update all dependent layers (DB ↔ TS ↔ docs)
- If uncertain: locate the canonical source (schema, types, registry), confirm by searching, propose smallest safe change

**DO NOT**:
- Guess when uncertain
- Make destructive DB changes without explicit intent
- Skip verification steps
- Introduce breaking changes without user approval

---

## 4. Quality Gates (Run Before "Done")

### Pre-Commit Checks
```bash
npm run check:no-supabase  # Sovereignty enforcement
npm run preflight          # Full sovereignty check
npm run smoke              # Basic functionality
```

### Full Verification
```bash
npm run typecheck          # TypeScript compilation
npm run lint               # Code standards
npm run test               # Unit/integration tests
```

### Database Migrations
- Verify migrations apply cleanly
- Test rollback if applicable
- Update dependent queries/types

### App Verification
- App boots without runtime errors
- Relevant feature flow works manually
- Traces persist correctly (if consciousness features changed)

---

## 5. Git Worktree Pattern (Recommended for Parallel Work)

Use worktrees for experiments so branches don't collide:

```bash
# Create worktree for feature branch
git worktree add ../maia-exp-w2-shadow -b exp/w2-shadow-gate

# Work inside ../maia-exp-w2-shadow
cd ../maia-exp-w2-shadow
# ... make changes, commit ...

# When done, clean up
git worktree remove ../maia-exp-w2-shadow
git branch -D exp/w2-shadow-gate  # (if not merging)
```

**Rules**:
- One feature/experiment per worktree
- Commit locally in that worktree
- Open PR / merge only after checks pass
- Delete worktrees when finished

---

## 6. Background Agents (Claude "Cluster")

**Best for**:
- Research / doc review / repo scans that would bloat main context
- Parallel reviews (security, perf, refactor, duplication)
- "Shootouts" (two alternative implementations in isolation)

**DO NOT background**:
- Tasks requiring user input mid-stream
- Tasks needing approvals while running
- Interdependent tasks that will conflict

**Workflow**:
1. Assign a scoped task to a sub-agent
2. Background it (spawn with Task tool)
3. Keep main thread moving
4. Check status (`/tasks` or tool results)
5. Merge results carefully back into main decisions

**Naming**: Use descriptive task names: `audit-security-router`, `worktree-theme-a`, `perf-check-traces`

---

## 7. Symbolic Router Rules (S-Expression DSL)

**Principles**:
- Keep rules deterministic and auditable
- Facts must be explicit (biomarkers/context/symbolic cues)
- Rule evaluation should remain traceable: every decision persists in traces
- Maintain priority discipline: **safety > stabilization > shadow > growth > insight**

**When adding rules**:
- Add tests and sample traces
- Document rule intent in comments
- Update rule registry if applicable
- Verify no conflicts with existing rules

**Files**:
- Rules stored in: `consciousness_rules` table (PostgreSQL)
- Fetched via: `backend/src/services/rulesService.ts`
- Applied in: Symbolic router logic

---

## 8. 12-Facet Spiralogic Ontology

**Canonical source**: `lib/consciousness/spiralogic-facet-mapping.ts`

### Facet Codes

**Water** (4-6):
- W1: Spring / Safety-Containment
- W2: River / Shadow Gate
- W3: Ocean / Compassion-Flow

**Fire** (1-3):
- F1: Spark / Activation-Desire
- F2: Flame / Challenge-Will
- F3: Forge / Vision-Overheat

**Earth** (7-9):
- E1: Seed / Grounding-Embodiment
- E2: Root / Integration-Structure
- E3: Harvest / Abundance-Service

**Air** (10-12):
- A1: Breath / Awareness-Inquiry
- A2: Voice / Rumination-Reframe
- A3: Wisdom / Meta-Perspective

**Aether** (13-15):
- Æ1: Intuition / Signal
- Æ2: Union / Numinous
- Æ3: Emergence / Creative

### When Modifying Ontology

Update all layers:
1. Facet registry/manifest (`spiralogic-facet-mapping.ts`)
2. TypeScript enums/types (`FacetCode`)
3. DB reference tables (`consciousness_rules`)
4. Analytics views/queries
5. Documentation

---

## 9. Database & Migrations

**Principles**:
- Prefer **additive migrations**; avoid destructive changes unless explicitly intended
- Keep schema aligned with trace persistence needs (analytics depends on it)
- If you change DB fields used in traces: update ingestion + queries + tests

**Migration workflow**:
```bash
# Create migration
createdb maia_consciousness  # (first time only)

# Apply migration
psql postgresql://soullab@localhost:5432/maia_consciousness \
  -f database/migrations/YYYYMMDD_migration_name.sql

# Verify
psql postgresql://soullab@localhost:5432/maia_consciousness \
  -c "SELECT * FROM consciousness_rules LIMIT 5;"
```

**Files**:
- Migrations: `database/migrations/`
- Schema docs: `database/schema/`
- Client: `lib/db/postgres.ts`

---

## 10. Documentation Expectations

**If you ship a new capability**:
- Add or update the relevant doc page
- Include "how to verify" steps
- Include examples (inputs → expected routing / traces)
- Update architectural diagrams if structure changed

**Locations**:
- Feature docs: `docs/features/`
- API docs: `docs/api/`
- Architecture: `docs/architecture/`
- Artifacts/summaries: `artifacts/`

---

## 11. Setup (New Clones)

After cloning this repo, run once:
```bash
./scripts/setup-githooks.sh
```

This configures versioned git hooks that enforce sovereignty on every commit.

---

## 12. Phase Workflow (Current: Phase 4.4-A)

**Branch naming**: `phase4.{track}{subtask}-{description}`
- Example: `phase4.4a-12facet-expansion`

**Commits**: Include phase number in commit message
- Example: `feat(consciousness): Phase 4.4-A 12-facet expansion complete`

**Artifacts**: Document phase completion in `artifacts/PHASE_X_Y_RESULTS.md`

**Testing**: Verify phase completion checklist before declaring done

---

## 13. If You're Stuck

**DO NOT guess.**

1. Locate the canonical source (schema, types, or registry)
2. Confirm by searching the repo (`Grep` or `Glob` tools)
3. Propose the smallest safe change and a verification step
4. Ask clarifying questions if requirements are ambiguous
