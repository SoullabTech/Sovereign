# Phase 4.3: Symbolic Router & Consciousness Trace Spine

**Completion Date**: 2025-12-21
**Branch**: `phase4.3-symbolic-router` → `clean-main-no-secrets`
**Commit**: `e25eba6aa`

---

## Overview

Phase 4.3 introduces a **Consciousness Trace Spine** and **S-Expression Rule Engine** for symbolic routing in the MAIA consciousness framework. This system enables declarative, fact-based agent routing using Lisp-like rule definitions, with full execution tracing for transparency and debugging.

---

## Key Components Implemented

### 1. S-Expression Rule Engine

**Files**:
- `backend/src/lib/sexpr/sexpr.ts` - Core parser with tokenization and AST generation
- `backend/src/lib/sexpr/ruleCompiler.ts` - Rule compilation from S-expressions to executable rules
- `backend/src/lib/sexpr/ruleEngine.ts` - Fact evaluation, pattern matching, and routing selection
- `backend/src/lib/sexpr/__tests__/ruleEngine.test.ts` - Unit tests

**Capabilities**:
- Lisp-like DSL for rule definition: `(rule name (when ...) (infer ...) (do ...))`
- Boolean logic: `and`, `or`, `not`
- Comparisons: `>`, `<`, `==`, `!=`, `>=`, `<=`
- Operations: `contains`, `in`, `exists`
- Priority-based rule execution
- Action types: `route`, `practice`, `tag`, `flag`, `set`

**Example Rule**:
```lisp
(rule water2-shadow-gate
  (priority 50)
  (when (and (> biomarkers.hrv_drop 15)
             (in symbolic.theme (list "betrayal" "abandonment"))
             (contains input.text "stuck")))
  (infer (facet water2) (mode shadow) (confidence 0.2))
  (do (route ShadowAgent)
      (practice "Containment + titration: name the feeling...")
      (tag "water2")
      (flag "gentle_depth")))
```

### 2. Consciousness Trace Spine

**Files**:
- `backend/src/types/consciousnessTrace.ts` - TypeScript type definitions
- `backend/src/services/traceService.ts` - Trace lifecycle management and PostgreSQL persistence

**Features**:
- Full request lifecycle tracking (input → cue extraction → evidence → inference → routing → response)
- Event timeline with millisecond precision
- Safety level tracking (`none`, `mild`, `elevated`, `high`)
- Memory reference tracking
- Rule firing history
- Latency metrics

**Trace Lifecycle**:
1. `createTraceSkeleton()` - Initialize trace at request start
2. `pushTraceEvent()` - Record events during processing
3. `setSafety()` - Update safety level as needed
4. `finalizeTrace()` - Calculate latencies before response
5. `persistTrace()` - Store to PostgreSQL (non-blocking)

### 3. Symbolic Router Service

**File**: `backend/src/services/symbolicRouter.ts`

**Functions**:
- `buildFacts()` - Constructs fact object from biomarkers, symbolic cues, and context
- `runSymbolicRouter()` - Evaluates rules and returns routing decision with inference

**Integration Pattern**:
```typescript
const facts = buildFacts({
  inputText: userText,
  biomarkers: derivedBiomarkers ?? {},
  symbolic: extractedSymbols ?? {},
  context: { tone: requestedTone ?? null },
});

const routing = runSymbolicRouter({ trace, facts });

// Apply routing
if (routing.route) {
  selectedAgent = routing.route;
}

// Apply inference
if (routing.infer) {
  trace.inference = { facet, mode, confidence, rationale };
}
```

### 4. Database Schema

**File**: `database/migrations/20251221_create_consciousness_traces_and_rules.sql`

**Tables**:
- `consciousness_traces` - Stores full execution traces with fast filters (facet, mode, confidence, safety_level, latency_ms)
- `consciousness_rules` - Stores S-expression rules with priority, enabled status, and metadata

**Sovereignty Compliance**:
- ✅ Uses local PostgreSQL (no Supabase client)
- ✅ No `auth.users` foreign keys
- ✅ No Row Level Security policies (managed at application layer)
- ✅ user_id as text type (not uuid with FK)

### 5. Default Consciousness Rules

**File**: `backend/src/rules/consciousnessRules.ts`

Includes 8 default rules covering:
- **Water2 Shadow Gate**: Deep emotional processing (betrayal, grief, abandonment)
- **Fire1 Quick Win**: Achievement, clarity, energy
- **Earth1 Foundation**: Grounding, stability, structure
- **Air2 Meta-Reflection**: Patterns, frameworks, systems thinking
- **Aether Entry**: Archetypal, numinous, transpersonal themes
- **High HRV Drop Safety**: Elevated safety level for physiological distress
- **Multiple Shadow Keywords**: Shadow work escalation
- **Default Somatic Grounding**: Fallback practice

### 6. Integration Guide

**File**: `backend/INTEGRATION_GUIDE.md`

Provides step-by-step instructions for integrating the Symbolic Router into `MainOracleAgent.ts`:
1. Add imports
2. Initialize trace skeleton
3. Build facts and run symbolic router
4. Apply routing inference
5. Finalize and persist trace

**Testing**: Unit tests verify rule matching, fact evaluation, and routing selection logic.

---

## Sovereignty Compliance

### Initial Issue
First commit attempt **FAILED** with sovereignty check error:
```
🚨 SOVEREIGNTY FAIL: Supabase detected.
backend/src/services/rulesService.ts:3  [@supabase import]
backend/src/services/traceService.ts:4  [@supabase import]
```

### Resolution
All Supabase dependencies removed:
- ❌ `import type { SupabaseClient } from "@supabase/supabase-js"`
- ✅ `import { query } from "../../../lib/db/postgres"`
- ✅ Raw SQL with parameterized queries (`$1`, `$2` placeholders)
- ✅ Database migration updated to remove `auth.users` FK and RLS
- ✅ Pre-commit hook passed on amended commit

---

## Files Changed

### Created (11 files)
```
backend/
├── INTEGRATION_GUIDE.md
└── src/
    ├── lib/
    │   └── sexpr/
    │       ├── sexpr.ts
    │       ├── ruleCompiler.ts
    │       ├── ruleEngine.ts
    │       └── __tests__/
    │           └── ruleEngine.test.ts
    ├── types/
    │   └── consciousnessTrace.ts
    ├── services/
    │   ├── traceService.ts
    │   ├── symbolicRouter.ts
    │   └── rulesService.ts
    └── rules/
        └── consciousnessRules.ts

database/migrations/
└── 20251221_create_consciousness_traces_and_rules.sql
```

---

## Technical Achievements

1. **Declarative Routing**: Replaced imperative routing logic with data-driven rules
2. **Full Transparency**: Every routing decision is traceable with reasoning
3. **Extensibility**: New rules can be added to database without code changes
4. **Performance**: Rule evaluation is O(n) where n = number of enabled rules
5. **Sovereignty**: Zero cloud dependencies, local PostgreSQL only
6. **Type Safety**: Full TypeScript types for traces, rules, and facts
7. **Testing**: Comprehensive unit tests for rule engine logic

---

## Integration Status

- ✅ Backend modules implemented
- ✅ Database migration ready
- ✅ Unit tests passing
- ✅ Integration guide provided
- ⏳ Pending: MainOracleAgent integration
- ⏳ Pending: Database migration application
- ⏳ Pending: Production testing with live requests

---

## Next Steps (Phase 4.4 or later)

1. **Apply Database Migration**:
   ```bash
   psql -U soullab -d maia_consciousness \
     -f database/migrations/20251221_create_consciousness_traces_and_rules.sql
   ```

2. **Integrate into MainOracleAgent**:
   - Follow `backend/INTEGRATION_GUIDE.md`
   - Add trace initialization
   - Call symbolic router after biomarker extraction
   - Persist traces before response

3. **Seed Default Rules** (optional):
   ```sql
   INSERT INTO consciousness_rules (name, sexpr, priority, enabled)
   VALUES ('water2-shadow-gate', '<sexpr from consciousnessRules.ts>', 50, true);
   ```

4. **Monitor Traces**:
   ```sql
   SELECT facet, mode, confidence, agent, latency_ms
   FROM consciousness_traces
   ORDER BY created_at DESC
   LIMIT 20;
   ```

5. **Add Custom Rules**: Via database or update `DEFAULT_CONSCIOUSNESS_RULES`

6. **Analytics Dashboard**: Query traces for patterns, latencies, agent selection distribution

---

## Learnings & Patterns

### S-Expression Parser Design
- Tokenization first, then recursive descent parsing
- Type guards (`asSymbol`, `asList`) improve ergonomics
- String escaping with backslash sequences

### Rule Engine Architecture
- Separate compilation (parse) from evaluation (runtime)
- Fact object as single source of truth
- Priority-based action merging (highest priority wins for route)

### Trace Spine Pattern
- Create trace early, mutate in-place, persist last
- Events as append-only log
- Non-blocking persistence (try/catch, never throw)

### PostgreSQL Sovereignty
- Always use `lib/db/postgres.ts` for database access
- Parameterized queries (`$1`, `$2`) prevent SQL injection
- JSONB columns for flexible schema evolution

---

## Commit History

- `e25eba6aa` - feat(symbolic-router): implement Consciousness Trace spine and S-Expression rule engine
  - Amended commit after sovereignty fix
  - Merged to clean-main-no-secrets
  - All Supabase references removed

---

## Testing

### Run Unit Tests
```bash
npm test backend/src/lib/sexpr/__tests__/ruleEngine.test.ts
```

### Expected Output
```
✓ parses simple s-expressions
✓ compiles rules with when/infer/do
✓ evaluates and/or/not logic
✓ evaluates comparisons (>, <, ==)
✓ evaluates contains and in operators
✓ routes when conditions match
✓ does not route when conditions fail
✓ picks highest priority route
✓ merges practices and tags from all fired rules
```

---

## Conclusion

Phase 4.3 establishes a **symbolic consciousness routing foundation** for MAIA, enabling transparent, declarative agent selection based on biomarkers, symbolic cues, and contextual facts. The system is **fully sovereignty-compliant**, uses **local PostgreSQL**, and provides **complete execution tracing** for debugging and analysis.

**Status**: ✅ **COMPLETE AND MERGED**
**Ready for**: Integration into MainOracleAgent and production testing
