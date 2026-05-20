# Reconnection Scope — Route ↔ Vault-Backed Field Engine

**Date:** 2026-05-19
**Status:** Scope only. **No code changes proposed yet.** Diagnostic pass to answer 7 specific questions before any implementation.
**Sibling docs:** `maia-intelligence-architecture-synthesis.md` (ontology), `maia-sovereign-runtime-intelligence-audit.md` (current state), `maia-pai-classification-audit.md` (PAI comparison).

---

## Critical reframe

The earlier "two parallel Spiralogic implementations" framing was correct in *naming* but misleading in *function*. They are not duplicates competing for the route — they are **complementary layers serving different purposes**:

| Layer | File | Size | Purpose |
|---|---|---|---|
| Classifier (stateless reference) | `lib/consciousness/spiralogic-core.ts` | 89KB | Pure functions + type registries. Infers element/phase from message, selects frameworks, holds canonical questions per facet. No I/O, no per-user state. |
| Engine (stateful progression + vault) | `lib/spiralogic/core/spiralogic-engine.ts` | 20KB | Tracks per-user spiral state (Map<userId, UserSpiralState>), gates progression, detects integration patterns, calls `ObsidianVaultBridge.getElementalWisdom()`. |

The route uses the classifier correctly. The engine — and through it the vault — is unreachable from runtime. **Reconnection means inserting the engine alongside the classifier, not replacing the classifier with the engine.**

---

## The 7 diagnostic questions answered

### 1. What does `lib/consciousness/spiralogic-core` currently provide to the live route?

From `app/api/oracle/conversation/route.ts` imports (line 10-18):
- `inferSpiralogicCell(message, userId)` — async classifier, returns `SpiralogicCell { element, phase, context }`. Called at line 744.
- `chooseFrameworksForCell(spiralogicCell)` — pure function, returns active framework descriptors. Called at line 761.
- `SpiralogicCell` (type) — used pervasively as the data carrier for element/phase/context throughout the rest of the route.

Both calls are pure (no DB, no LLM, no bridge). They produce a typed structural classification of the message. The classifier also exposes registries (FIRE/WATER/EARTH/AIR facets, canonical questions, depth calibration scripts) that other modules consume directly.

### 2. What does `lib/spiralogic/core/spiralogic-engine` provide that the live route is missing?

From the engine's public surface (`SpiralogicEngine` class):

- `enterSpiral(userId, element)` → `SpiralProgression` — advances user's spiral position, gated by progression rules. **Stateful — modifies user state.**
- `getUserState(userId)` → `UserSpiralState | null` — read-only access to per-user state
- `checkUserIntegrations(userId)` → `string[]` — list of integration patterns the user has reached
- `getUserSpiralPosition(userId)` → `SpiralPosition | null` — current position

Internally (private) the engine also provides:
- `getSpiralogicContent(element, depth, state)` — **this is the vault-retrieval method**. Calls `obsidian.getElementalWisdom(element)`. Returns `{ quest, practices, vaultWisdom, integrationSuggestions, reflections }`.
- 6 hard-coded integration patterns (`steam-rising`, `grounded-fire`, `flowing-earth`, `sacred-breath`, `quintessence`, `great-work`) with elements, min-depth requirements, practices, unlocks.
- Per-element-per-depth spiral quest definitions ({ question, theme, focus })
- Per-element-per-depth practice catalog
- Progressive integration time (1h, 2h, 4h... by depth)
- Shadow gate logic (avg depth ≥ 2 requires shadow work)

**What's missing from the route:** vault-backed wisdom, integration pattern detection, spiral quests with theme/focus framing, depth-aware practice suggestions, spiral position tracking, and any contact with the ObsidianVaultBridge.

### 3. Are their return shapes compatible?

**No, not directly.** Different abstractions:

| Function | Returns | Shape |
|---|---|---|
| `inferSpiralogicCell()` | `SpiralogicCell` | `{ element, phase, context }` |
| `engine.enterSpiral()` | `SpiralProgression` | `{ success, element, depth, content { quest, practices, vaultWisdom, integrationSuggestions, reflections }, integrations, visualization, newUnlocks }` |

The classifier output (`element`, `phase`) is an **input** to the engine, not a substitute. The engine consumes element/phase and produces a richer progression event with vault wisdom attached.

**Implication:** the engine slots *after* the classifier, not in place of it. Both run on the same turn.

### 4. Can the engine be inserted as a pre-substrate field-context provider first?

**Yes, but with one important constraint: `enterSpiral()` is stateful and progression-gated.** Calling it every conversation turn would either:
- Trip the progression-time gate ("Integration time is required for spiral deepening. Return in 6 hours.") on most turns, returning a blocked result
- Or incorrectly advance the user's spiral position on every message

What's actually needed is **read-only access to vault wisdom + spiral context for the cell**, without state mutation. The engine has this logic internally (in `getSpiralogicContent`), but it is private and currently only reachable via `enterSpiral`.

**Options:**
- **(A) Add a public read-only method** to the engine (e.g., `getFieldContext(userId, element)`) that does the wisdom retrieval without advancing state. Minimal engine change.
- **(B) Bypass the engine and call `ObsidianVaultBridge.getElementalWisdom()` directly from a route-side adapter.** Skips the engine's spiral-quest catalog and integration logic.
- **(C) Refactor `enterSpiral` to take a `{ dryRun: true }` option.** Reuses existing code path. Modest engine change.

**Recommended: (A).** Cleanest separation of concerns. The engine retains its stateful progression API; the new method provides the pre-substrate retrieval pathway. (B) loses spiral quests and integration awareness. (C) muddies the engine's main API.

### 5. Or does the route need a new adapter layer?

**Yes — even with (A), an adapter is the right shape.** An adapter:
- Hides engine instantiation (singleton)
- Handles graceful degradation if vault is absent or engine init fails
- Returns a route-shaped `FieldContext` object that's easy to merge into the existing prompt-building flow
- Keeps the engine's API stable while letting the route consume it cleanly

Proposed shape (no code change yet — this is just the shape):

```typescript
// lib/maia/fieldContextAdapter.ts (proposed location)

import type { SpiralogicCell } from '@/lib/consciousness/spiralogic-core';
import { SpiralogicEngine } from '@/lib/spiralogic/core/spiralogic-engine';

export interface FieldContext {
  available: boolean;          // false → vault/engine unavailable, graceful degradation
  vaultWisdom: {
    element: string;
    concepts: Array<{ title: string; definition: string }>;
    practices: Array<{ title: string; purpose: string }>;
    frameworks: Array<{ name: string; elementMapping: string }>;
  } | null;
  spiralQuest: { question: string; theme: string; focus: string } | null;
  depthPractices: string[];
  integrations: string[];      // user's already-attained integration patterns
}

let engine: SpiralogicEngine | null = null;
let initFailed = false;

async function getEngine(): Promise<SpiralogicEngine | null> {
  if (engine) return engine;
  if (initFailed) return null;
  try {
    const e = new SpiralogicEngine();
    await e.initialize();
    engine = e;
    return engine;
  } catch (err) {
    console.warn('[FieldContext] Engine init failed:', err);
    initFailed = true;
    return null;
  }
}

export async function getFieldContext(
  userId: string,
  cell: SpiralogicCell
): Promise<FieldContext> {
  const e = await getEngine();
  if (!e) return EMPTY_CONTEXT;

  try {
    // Requires engine to expose getFieldContext(userId, element) — see Q4 option (A)
    return await e.getFieldContext(userId, cell.element.toLowerCase());
  } catch (err) {
    console.warn('[FieldContext] Retrieval failed:', err);
    return EMPTY_CONTEXT;
  }
}

export function buildFieldContextPromptBlock(ctx: FieldContext): string {
  if (!ctx.available) return '';
  // Format vaultWisdom + spiralQuest + practices + integrations into prompt block
  // (specific formatting TBD)
}

const EMPTY_CONTEXT: FieldContext = {
  available: false,
  vaultWisdom: null,
  spiralQuest: null,
  depthPractices: [],
  integrations: []
};
```

**Insertion point in conversation route:** after line 761 (`chooseFrameworksForCell(spiralogicCell)`), before the substrate-bound prompt assembly. The resulting `FieldContext.available` flag lets the route gracefully proceed when the vault is unavailable.

### 6. What breaks if `OBSIDIAN_VAULT_PATH` is absent?

**Nothing breaks. Graceful degradation by design.**

Bridge behavior (`lib/bridges/obsidian-vault-bridge.ts`):
- Line 81-91: empty `vaultPath` → warns, sets `initialized = true`, returns. No error thrown.
- Line 87: vault path doesn't exist → same graceful degradation.
- Subsequent `query()` and `getElementalWisdom()` calls return empty arrays (the noteCache is empty).

Engine's `getSpiralogicContent` would receive empty `vaultContent` from `obsidian.getElementalWisdom(element)`, then continue building its result with its own in-engine spiral quests, practices, and reflections. The result's `vaultWisdom` field would just be `{ element, concepts: [], practices: [], frameworks: [] }`.

The adapter detects this via empty arrays and surfaces `available: false` (or `available: true` with empty `vaultWisdom`) depending on how strict the route wants to be.

**Implication:** the reconnection is robust to missing config. Setting `OBSIDIAN_VAULT_PATH=/Users/soullab/Documents/AIN/` is the *production* requirement; the *implementation* requirement is just the route-to-engine wiring.

### 7. What is the smallest non-member-facing reconnection test?

**Three test layers, each smaller than the next:**

#### Test 1 — Bridge standalone (smallest)

A Node script outside the app:

```typescript
// scripts/test-vault-bridge.ts
import { ObsidianVaultBridge } from '@/lib/bridges/obsidian-vault-bridge';

const bridge = new ObsidianVaultBridge({
  vaultPath: '/Users/soullab/Documents/AIN/'
});

await bridge.connect();

const result = await bridge.query({
  context: 'fire transformation',
  maxResults: 3,
  semanticSearch: false
});

console.log('Bridge query result:', {
  noteCount: result.knowledge.length,
  topTitles: result.knowledge.slice(0, 3).map(n => n.title),
  connections: result.connections.length,
  tags: result.tags.slice(0, 10)
});
```

Validates: bridge can connect, index, and query the actual vault. **No app code touched. No member impact.**

#### Test 2 — Engine standalone

```typescript
// scripts/test-spiralogic-engine.ts
import { SpiralogicEngine } from '@/lib/spiralogic/core/spiralogic-engine';

const engine = new SpiralogicEngine();
await engine.initialize();

const result = await engine.enterSpiral('test-user-001', 'fire');

console.log('Engine result:', {
  success: result.success,
  element: result.element,
  depth: result.depth,
  vaultWisdomReceived: !!result.content?.vaultWisdom,
  vaultConcepts: result.content?.vaultWisdom?.concepts?.length,
  integrations: result.integrations,
  newUnlocks: result.newUnlocks
});
```

Validates: engine → bridge → vault → wisdom retrieval works end-to-end. **No app code touched. No member impact.**

#### Test 3 — Adapter standalone (after engine has `getFieldContext`)

```typescript
// scripts/test-field-context-adapter.ts
import { inferSpiralogicCell } from '@/lib/consciousness/spiralogic-core';
import { getFieldContext } from '@/lib/maia/fieldContextAdapter';

const cell = await inferSpiralogicCell('I feel a fire rising in me', 'test-user-001');
const ctx = await getFieldContext('test-user-001', cell);

console.log('Field context:', {
  available: ctx.available,
  wisdomConcepts: ctx.vaultWisdom?.concepts?.length,
  quest: ctx.spiralQuest?.question,
  practices: ctx.depthPractices,
  integrations: ctx.integrations
});
```

Validates: end-to-end classifier → adapter → engine → bridge → vault flow as it would run in the route, but invoked standalone. **No member impact.** This is the smallest test that proves the reconnection works as designed before touching the live route.

---

## Recommended reconnection sequence

Per user's safe-sequence direction, plus what scope reveals:

1. **(already done)** Read both implementations — confirms layers are complementary, not duplicates
2. **(this document)** Comparison table + adapter shape — done
3. **Add `getFieldContext(userId, element)` public read-only method to `SpiralogicEngine`** — minimal engine change, exposes existing private wisdom-retrieval logic
4. **Set `OBSIDIAN_VAULT_PATH=/Users/soullab/Documents/AIN/`** in `.env.local` and `.env.production`
5. **Run Test 1** — bridge standalone against real vault
6. **Run Test 2** — engine standalone (will validate the new public method)
7. **Create `lib/maia/fieldContextAdapter.ts`** — singleton-cached engine, graceful degradation
8. **Run Test 3** — adapter standalone
9. **Only then** — touch `app/api/oracle/conversation/route.ts` to call `getFieldContext` after `chooseFrameworksForCell` and inject the resulting prompt block

Each step is observable in isolation. Each step is reversible. Steps 3-8 are non-member-facing.

---

## What this scope does NOT settle

- **Formatting of the field-context prompt block** — what does `buildFieldContextPromptBlock(ctx)` actually emit? Needs design pass once the adapter exists.
- **Whether to ALSO update the route to call `engine.enterSpiral` for actual progression** — separate question. Progression is stateful and would need member-facing UX (showing spiral position, integration unlocks, etc.). Field context retrieval is the first cut; spiral progression is downstream.
- **PAI's parallel ObsidianVaultBridge** — same dormancy pattern per the PAI audit. Whether to do the analogous reconnection in PAI is a separate decision, possibly after SOVEREIGN's reconnection is verified.
- **Vector embedding upgrade** — the bridge falls back to keyword search ("In production, this would use actual vector embeddings"). Implementation polish, not part of the reconnection itself.
- **`@ts-nocheck` removal on the bridge** — production-typing the prototype. Implementation polish.
- **Caching strategy for vault queries** — the bridge has a noteCache. Whether to extend to query-result caching at the adapter layer is a downstream optimization.
- **Whether `lib/orchestration/consciousness-orchestrator.ts` or `lib/consciousness/fractal-field-spiralogics.ts` should also wire in** — they also use the bridge but are similarly dormant. Reconnecting them is a separate (likely larger) scope.

---

## The line, restated

The architecture is not absent. It is stranded. The route imports the classifier from `lib/consciousness/` but not the engine from `lib/spiralogic/`. One additional adapter file + one new public method on the existing engine + one env var = vault becomes a live intelligence field again. The implementation work is small. The architectural restoration is large.
