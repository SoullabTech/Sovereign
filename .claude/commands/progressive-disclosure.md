---
description: "Implement progressive disclosure for scalable features"
argument-hint: "feature-name"
allowed-tools: "Read,Write,Edit"
---

# Progressive Disclosure & Future-Proofing Pattern

You're implementing progressive disclosure for: **$1**

## DESIGN PRINCIPLE

Delay loading until needed. Structure data in 3 layers:
1. **Metadata** (always available, <1KB per item)
2. **Definition** (load on-demand, <10KB per item)
3. **Execution** (load on use, prompts/tools/data)

---

## IMPLEMENTATION

### Layer 1: Metadata File

Create `$1/item-name/meta.json`:

```json
{
  "id": "item-name",
  "version": "0.1.0",
  "tier": "FAST|CORE|DEEP",
  "kind": "prompt|code|hybrid",
  "category": "foundational|lineage|emergent",
  "enabled": true,
  "trustLevel": 3,
  "title": "Short descriptive title",
  "description": "One sentence explaining what this does",
  "triggers": ["keyword1", "keyword2", "phrase to match"],
  "elements": ["water", "earth", "fire", "air", "aether"],
  "realms": ["UNDERWORLD", "MIDDLEWORLD", "UPPERWORLD_SYMBOLIC"]
}
```

**Fields:**
- `tier`: FAST (<2s), CORE (2-6s), DEEP (6-20s)
- `kind`: prompt (LLM), code (deterministic), hybrid (both)
- `category`: foundational (always safe), lineage (gates), emergent (unlock required)
- `trustLevel`: 1 (experimental) to 5 (production)

### Layer 2: Definition File

Create `$1/item-name/definition.json`:

```json
{
  "eligibility": {
    "minCognitiveLevel": 3,
    "maxBypassingScore": 0.5,
    "requiredStability": "stable|developing|volatile|unstable",
    "allowedNervousSystemStates": ["window"],
    "requiresUnlock": false
  },
  "contraindications": {
    "nervousSystemStates": ["dorsal"],
    "shadowRiskFlags": ["spiritual_bypassing", "dissociation"],
    "hardRefusalMessageKey": "REFUSAL_KEY_NAME"
  },
  "promptTemplates": {
    "system": "prompts/system.md",
    "user": "prompts/user.md"
  },
  "nextHints": ["follow-up-item-1", "follow-up-item-2"]
}
```

### Layer 3: Execution Files

Create `$1/item-name/prompts/system.md`:

```markdown
You are MAIA's **$1** capability.

## Purpose
[What this accomplishes]

## Strategy
1. [First step]
2. [Second step]
3. [Third step]

## Voice
[How to communicate]

## What NOT to do
- Don't give advice
- Don't bypass user's process

## Context Available
- Element: {{ELEMENT}}
- Realm: {{REALM}}
- Tier: {{TIER}}
- Cognitive Level: {{COGNITIVE_LEVEL}}
- Nervous System: {{NERVOUS_SYSTEM_STATE}}
```

Create `$1/item-name/prompts/user.md`:

```markdown
**User's query:**
{{QUERY}}

**Context:**
- Current element: {{ELEMENT}}
- Developmental realm: {{REALM}}
- Processing tier: {{TIER}}
- Cognitive level: {{COGNITIVE_LEVEL}}
- Nervous system state: {{NERVOUS_SYSTEM_STATE}}

---

Respond using the $1 strategy from the system prompt.
```

---

## RUNTIME LOADER

Create `lib/$1/runtime.ts`:

```typescript
import { readdirSync, readFileSync } from 'fs';
import path from 'path';

interface $1Meta {
  id: string;
  tier: string;
  category: string;
  triggers: string[];
}

interface $1Definition extends $1Meta {
  eligibility: {...};
  contraindications: {...};
  promptTemplates: {...};
}

// Boot time: Load all metadata (~1KB each)
export function loadAllMetadata($1Root: string): $1Meta[] {
  const dirs = readdirSync($1Root);
  return dirs.map(dir => {
    const metaPath = path.join($1Root, dir, 'meta.json');
    const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
    return meta as $1Meta;
  });
}

// Selection time: Load definition for shortlisted items
export function loadDefinition(
  $1Root: string,
  itemId: string
): $1Definition {
  const defPath = path.join($1Root, itemId, 'definition.json');
  const metaPath = path.join($1Root, itemId, 'meta.json');

  const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
  const def = JSON.parse(readFileSync(defPath, 'utf-8'));

  return { ...meta, ...def };
}

// Execution time: Load prompts
export function loadPrompts(
  $1Root: string,
  itemId: string
): { system: string; user: string } {
  const sysPath = path.join($1Root, itemId, 'prompts/system.md');
  const usrPath = path.join($1Root, itemId, 'prompts/user.md');

  return {
    system: readFileSync(sysPath, 'utf-8'),
    user: readFileSync(usrPath, 'utf-8')
  };
}
```

---

## ROLLOUT SEQUENCE

### Phase 1: Silent Mode
```bash
$1_ENABLED=0  # Code exists, doesn't run
```

### Phase 2: Shadow Mode
```bash
$1_ENABLED=1
$1_SHADOW_MODE=1  # Logs without changing behavior
```

### Phase 3: Gradual Rollout
```bash
$1_ENABLED=1
$1_ROLLOUT_PERCENTAGE=10  # Start with 10%
```
**Progression:** 10% → 25% → 50% → 100%

### Phase 4: Full Deployment
```bash
$1_ENABLED=1  # 100% of users
```

---

## BACKWARDS COMPATIBILITY

```typescript
// In integration code:
export async function processRequest(ctx: Context) {
  // Check feature flag
  if (process.env.$1_ENABLED !== '1') {
    return defaultBehavior(ctx);
  }

  // Shadow mode: run but don't use results
  if (process.env.$1_SHADOW_MODE === '1') {
    const result = await run$1(ctx);
    logToTelemetry('$1-shadow', result);
    return defaultBehavior(ctx);
  }

  // Full mode: use results
  const result = await run$1(ctx);
  if (result.outcome === 'success') {
    return result.responseText;
  }

  // Fall through to default
  return defaultBehavior(ctx);
}

// Alias old function names if renaming
export const oldFunctionName = newFunctionName;
```

---

## SUCCESS CRITERIA

- [ ] Metadata loads in <100ms (for 100 items)
- [ ] Definition loading adds <50ms per item
- [ ] Prompt loading adds <10ms per item
- [ ] Feature flag toggles without code deploy
- [ ] Shadow mode logs without changing behavior
- [ ] Gradual rollout works (10% see new, 90% see old)
- [ ] Backwards compatibility: old code still works

---

**Now implement the 3-tier structure, then create the runtime loader.**
