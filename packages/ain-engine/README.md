# AIN Engine

**AIN (Agentic Intelligence Networks)** is the deliberative computation engine that powers MAIA.

## Architecture Invariant

```
╔════════════════════════════════════════════════════════════════╗
║                   MAIA-First Hierarchy                         ║
╠════════════════════════════════════════════════════════════════╣
║  MAIA = Platform/Product (temple, interface, relationship)    ║
║  AIN  = Engine (deliberative core, computation primitives)    ║
║                                                                ║
║  RULE: AIN is a DEPENDENCY called by MAIA, never the reverse. ║
║  RULE: AIN cannot import from MAIA or any app code.           ║
║  RULE: AIN has no public API routes. If exposed, must be      ║
║        namespaced under MAIA: /v1/maia/ain/*                   ║
╚════════════════════════════════════════════════════════════════╝
```

## What AIN Does

AIN provides the computational primitives for:

1. **Committee Deliberation** - Multi-agent reasoning and consensus
2. **Shape Telemetry** - Response quality monitoring
3. **Knowledge Processing** - Context and memory management
4. **Activation Patterns** - When and how to engage different capabilities

## What AIN Does NOT Do

AIN does not:

- Manage user sessions or authentication
- Handle HTTP requests directly
- Store or retrieve user data
- Make product decisions
- Define UX patterns

These are MAIA's responsibilities.

## Import Rules

```typescript
// ALLOWED: MAIA importing AIN
import { deliberate } from '@maia/ain-engine';

// FORBIDDEN: AIN importing MAIA
import { something } from '@maia/api';  // ❌ NEVER
import { something } from '../apps/';   // ❌ NEVER
```

## Usage in MAIA API

```typescript
// apps/api/src/routes/maia/ain.ts

import { Router } from 'express';
import { deliberate, getShapeTelemetry } from '@maia/ain-engine';

const router = Router();

// AIN endpoints namespaced under MAIA
router.post('/deliberate', async (req, res) => {
  const result = await deliberate(req.body.prompt);
  res.json({ success: true, data: result });
});

router.get('/telemetry', async (req, res) => {
  const metrics = await getShapeTelemetry();
  res.json({ success: true, data: metrics });
});

export default router;
```

## Package Structure

```
packages/ain-engine/
├── src/
│   ├── index.ts           # Main exports
│   ├── deliberation/      # Committee deliberation
│   ├── telemetry/         # Shape telemetry
│   ├── knowledge/         # Knowledge processing
│   └── types/             # AIN-specific types
├── package.json
├── tsconfig.json
└── README.md              # This file
```

## CI Guard

The following CI check ensures AIN never imports MAIA:

```bash
# .github/workflows/guards.yml
- name: Guard AIN imports
  run: |
    if grep -r "from '@maia/api'" packages/ain-engine/; then
      echo "ERROR: AIN cannot import from MAIA"
      exit 1
    fi
```

## Philosophy

AIN is the "how" — the computational machinery.
MAIA is the "what" and "why" — the relationship and experience.

The engine serves the temple. Never the reverse.
