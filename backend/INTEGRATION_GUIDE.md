# Phase 4.3: Symbolic Router Integration Guide

## Overview

This document provides step-by-step instructions for integrating the Consciousness Trace Spine and S-Expression Rule Engine into `MainOracleAgent.ts` (or equivalent routing agent).

## Prerequisites

- Phase 4.3 backend modules installed
- Database migration `20251221_consciousness_traces_rules` applied
- Local PostgreSQL database configured (`lib/db/postgres.ts`)

---

## Step 1: Add Imports

Add these imports at the top of your `MainOracleAgent.ts` file:

```typescript
import { createTraceSkeleton, finalizeTrace, persistTrace, pushTraceEvent } from "../services/traceService";
import { buildFacts, runSymbolicRouter } from "../services/symbolicRouter";
```

---

## Step 2: Initialize Trace (Early in Request Handler)

Near the start of your main request handling function, create the trace skeleton:

```typescript
const trace = createTraceSkeleton({
  userId,
  sessionId,
  requestId,
  agent: "MainOracleAgent",
  model: selectedModel,
  input: { text: userText },
});

pushTraceEvent(trace, { kind: "cue_extraction", label: "pre_router" });
```

---

## Step 3: Build Facts and Run Symbolic Router

After extracting biomarkers and symbolic cues, but before final agent selection:

```typescript
const facts = buildFacts({
  inputText: userText,
  biomarkers: derivedBiomarkers ?? {},
  symbolic: extractedSymbols ?? {},
  context: { tone: requestedTone ?? null },
});

const routing = runSymbolicRouter({ trace, facts });

// Apply routing inference to trace
if (routing.infer) {
  trace.inference = {
    facet: (routing.infer.facet as string) ?? trace.inference?.facet,
    mode: (routing.infer.mode as string) ?? trace.inference?.mode,
    confidence: typeof routing.infer.confidence === "number" ? (routing.infer.confidence as number) : trace.inference?.confidence,
    rationale: (routing.flags ?? []).map(String),
  };
}

// Apply routing decision
if (routing.route) {
  trace.routing = { route: routing.route, reason: ["symbolic_router"] };
  selectedAgent = routing.route; // Update your existing agent selection variable
}

// Store practices as plan steps
trace.plan = {
  steps: (routing.practices ?? []).map((p) => ({ kind: "practice", detail: p })),
};
```

---

## Step 4: Finalize and Persist Trace (Before Returning Response)

Right before you return the final response to the user:

```typescript
finalizeTrace(trace);

try {
  await persistTrace({ trace });
} catch (e) {
  // Never block the response on trace persistence failure
  pushTraceEvent(trace, { kind: "error", label: "persistTrace_failed", data: { message: (e as Error)?.message } });
}
```

---

## Integration Checklist

- [ ] Imports added to MainOracleAgent.ts
- [ ] Trace skeleton created at request start
- [ ] Facts built from biomarkers + symbolic extraction
- [ ] Symbolic router called with trace context
- [ ] Routing inference applied to trace object
- [ ] Agent selection updated based on routing.route
- [ ] Trace finalized before response
- [ ] Trace persisted to database (with error handling)
- [ ] Database migration applied to local PostgreSQL

---

## Database Setup

Apply the migration to your local PostgreSQL database:

```bash
psql -U soullab -d maia_consciousness -f database/migrations/20251221_create_consciousness_traces_and_rules.sql
```

Verify tables were created:

```bash
psql -U soullab -d maia_consciousness -c "\dt consciousness_*"
```

Expected output:
```
                     List of relations
 Schema |         Name          | Type  |   Owner
--------+-----------------------+-------+-----------
 public | consciousness_rules   | table | soullab
 public | consciousness_traces  | table | soullab
```

---

## Testing

Run the unit tests to verify the rule engine:

```bash
npm test backend/src/lib/sexpr/__tests__/ruleEngine.test.ts
```

---

## Next Steps

1. Apply database migration to local PostgreSQL (see Database Setup above)
2. Integrate trace lifecycle into MainOracleAgent following steps above
3. Test with sample inputs matching rule conditions
4. Monitor `consciousness_traces` table for persisted data
5. Add custom rules to `consciousness_rules` table or update `DEFAULT_CONSCIOUSNESS_RULES`

---

## Architecture Notes

**Local-First Sovereignty:**
- All data stored in local PostgreSQL (`postgresql://soullab@localhost:5432/maia_consciousness`)
- No cloud dependencies (Supabase removed)
- Uses `lib/db/postgres.ts` for all database operations
- No RLS policies (local-only access control)
