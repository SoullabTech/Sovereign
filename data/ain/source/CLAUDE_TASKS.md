# **CLAUDE_TASKS.md**

**Spiralogic Oracle – Refactor Implementation Tasks & File Mapping**
**Author:** SoullabTech
**Date:** 2025-08-09

---

## **Purpose**

This document provides a **step-by-step refactor plan** with **inline starter code** and a **file structure mapping** to guide developers and AI collaborators (Claude, GPT-5) in addressing architectural weak spots while preserving metaphysical integrity, elemental/archetypal logic, and sacred minimalism.

---

## **Weak Spots Identified**

- Tight coupling between `HierarchyOrchestrator`, `MainOracleAgent`, and `ElementalAgents`.
- Internal agents exposed directly via inconsistent API responses.
- Heavy synchronous processing (archetype analysis, voice synthesis).
- PostgreSQL schema lacks caching, sharding, and indexing.
- No multi-tenant isolation, API versioning, or JWT-based role access.

---

## **TASK 1 – Dependency Injection & Decoupling**

**Objective:** Remove circular dependencies between `HierarchyOrchestrator`, `MainOracleAgent`, and `ElementalAgents`.

**Instructions for Claude:**

1. Create `IAgentFactory` and `AgentRegistry`.
2. Replace `new MainOracleAgent()` calls with injected dependencies.

**Starter Code — `backend/src/core/interfaces/IAgentFactory.ts`**

```ts
export interface IAgentFactory {
  createAgent(type: string): BaseAgent;
}
```

**Starter Code — `backend/src/core/registry/AgentRegistry.ts`**

```ts
import { IAgentFactory } from "../interfaces/IAgentFactory";
import {
  FireAgent,
  WaterAgent,
  EarthAgent,
  AirAgent,
  AetherAgent,
} from "../agents";

export class AgentRegistry implements IAgentFactory {
  createAgent(type: string) {
    switch (type) {
      case "fire":
        return new FireAgent();
      case "water":
        return new WaterAgent();
      case "earth":
        return new EarthAgent();
      case "air":
        return new AirAgent();
      case "aether":
        return new AetherAgent();
      default:
        throw new Error(`Unknown agent type: ${type}`);
    }
  }
}
```

---

## **TASK 2 – API Gateway & Unified Schema**

**Objective:** Abstract internal agents behind a single REST entry point.

**Instructions for Claude:**

1. Create `/api/v1/oracle` endpoint.
2. Use unified request/response schema.

**Starter Code — `backend/src/routes/oracleRouter.ts`**

```ts
import { Router } from "express";
import { AgentRegistry } from "../core/registry/AgentRegistry";

const router = Router();
const registry = new AgentRegistry();

interface OracleRequest {
  userId: string;
  query: string;
  targetElement: string;
}

interface OracleResponse {
  element: string;
  archetype: string;
  message: string;
  metadata: Record<string, any>;
}

router.post("/api/v1/oracle", async (req, res) => {
  const { userId, query, targetElement }: OracleRequest = req.body;
  const agent = registry.createAgent(targetElement);

  const message = await agent.processQuery(query, userId);

  const response: OracleResponse = {
    element: targetElement,
    archetype: agent.getArchetype(),
    message,
    metadata: { timestamp: new Date().toISOString() },
  };

  res.json(response);
});

export default router;
```

---

## **TASK 3 – Async Processing & Caching**

**Objective:** Improve performance for heavy operations.

**Instructions for Claude:**

1. Parallelize elemental processing.
2. Add Redis caching layer.

**Starter Code — `backend/src/services/CachedOracleService.ts`**

```ts
import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL);

export async function getCachedPattern(
  userId: string,
  element: string,
  computeFn: () => Promise<any>,
) {
  const key = `pattern:${userId}:${element}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const result = await computeFn();
  await redis.set(key, JSON.stringify(result), "EX", 3600);
  return result;
}

export async function processElementsInParallel(
  userId: string,
  query: string,
  elements: string[],
) {
  const registry = new AgentRegistry();

  const promises = elements.map(async (element) => {
    return getCachedPattern(userId, element, async () => {
      const agent = registry.createAgent(element);
      return await agent.processQuery(query, userId);
    });
  });

  return await Promise.all(promises);
}
```

---

## **TASK 4 – CQRS & Event Sourcing**

**Objective:** Track all state changes for replay and audit.

**Instructions for Claude:**

1. Create event log table.
2. Separate command/query services.

**Starter Code — `backend/migrations/001_event_log.sql`**

```sql
CREATE TABLE event_log (
  id SERIAL PRIMARY KEY,
  userId TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  eventType TEXT NOT NULL,
  payload JSONB NOT NULL
);

CREATE INDEX idx_user_events ON event_log (userId, timestamp);
CREATE INDEX idx_event_type ON event_log (eventType);
```

**Starter Code — `backend/src/services/EventService.ts`**

```ts
import { Pool } from "pg";

export class EventService {
  constructor(private db: Pool) {}

  async recordEvent(userId: string, eventType: string, payload: any) {
    await this.db.query(
      "INSERT INTO event_log (userId, eventType, payload) VALUES ($1, $2, $3)",
      [userId, eventType, JSON.stringify(payload)],
    );
  }

  async getEvents(userId: string, eventType?: string) {
    const query = eventType
      ? "SELECT * FROM event_log WHERE userId = $1 AND eventType = $2 ORDER BY timestamp DESC"
      : "SELECT * FROM event_log WHERE userId = $1 ORDER BY timestamp DESC";

    const params = eventType ? [userId, eventType] : [userId];
    const result = await this.db.query(query, params);
    return result.rows;
  }
}
```

---

## **TASK 5 – Database Optimization**

**Objective:** Improve query performance and scale.

**Instructions for Claude:**

1. Add composite indexes.
2. Optimize JSONB queries.

**Starter Code — `backend/migrations/002_performance_indexes.sql`**

```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_user_element_time ON interactions (userId, element, timestamp);
CREATE INDEX idx_archetypal_patterns ON interactions (archetype, timestamp) WHERE archetype IS NOT NULL;

-- JSONB optimization
CREATE INDEX idx_payload_gin ON event_log USING gin (payload jsonb_path_ops);

-- Partitioning for time-series data (monthly partitions)
CREATE TABLE interactions_y2025m08 PARTITION OF interactions
FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
```

---

## **TASK 6 – Enterprise Features**

**Objective:** Prepare system for B2B2C deployment.

**Instructions for Claude:**

1. Add JWT authentication middleware.
2. Implement multi-tenant isolation.

**Starter Code — `backend/src/middleware/authMiddleware.ts`**

```ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    role: string;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

export function requireRole(role: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}
```

**Starter Code — `backend/migrations/003_multi_tenant.sql`**

```sql
-- Add tenant isolation
ALTER TABLE interactions ADD COLUMN tenantId TEXT NOT NULL DEFAULT 'default';
ALTER TABLE event_log ADD COLUMN tenantId TEXT NOT NULL DEFAULT 'default';

-- Row-level security
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON interactions FOR ALL USING (tenantId = current_setting('app.tenant_id'));
```

---

## **Side-by-Side File Mapping**

| Current Location                | Refactored Location                           | Notes / Action                          |
| ------------------------------- | --------------------------------------------- | --------------------------------------- |
| `core/HierarchyOrchestrator.ts` | `core/orchestration/HierarchyOrchestrator.ts` | Inject `IAgentFactory`.                 |
| `core/MainOracleAgent.ts`       | `core/agents/MainOracleAgent.ts`              | Constructor injection for dependencies. |
| `core/ElementalAgents/*.ts`     | `core/agents/elemental/*.ts`                  | Keep methods, update factory usage.     |
| _(none)_                        | `core/factories/IAgentFactory.ts`             | New file.                               |
| _(none)_                        | `core/factories/AgentRegistry.ts`             | New file.                               |
| `api/routes/*`                  | `api/routes/oracleRouter.ts`                  | New unified API gateway.                |
| _(none)_                        | `services/CachedOracleService.ts`             | New Redis service.                      |
| `services/SoulMemoryService.ts` | `services/soulMemory/CommandService.ts`       | CQRS command side.                      |
| _(none)_                        | `services/soulMemory/QueryService.ts`         | CQRS query side.                        |
| _(none)_                        | `services/events/EventService.ts`             | Event sourcing.                         |
| _(none)_                        | `migrations/eventLog.sql`                     | New table.                              |
| _(none)_                        | `migrations/dbOptimization.sql`               | Index & partition.                      |
| `middleware/auth.ts`            | `middleware/authMiddleware.ts`                | JWT + roles.                            |
| _(none)_                        | `config/redis.ts`                             | Redis config.                           |
| _(none)_                        | `config/jwt.ts`                               | JWT config.                             |

---

## **Execution Sequence for Claude**

1. **Move/create files** according to mapping.
2. **Integrate starter code** into proper modules.
3. **Replace hard-coded agent instantiations** with `AgentRegistry`.
4. **Create `/api/v1/oracle` route** and connect it.
5. **Add Redis caching layer** and wire into heavy compute calls.
6. **Implement CQRS/event sourcing** with migration scripts.
7. **Apply database optimizations**.
8. **Add multi-tenant isolation** and JWT-based role access.
9. **Run full test suite** after each stage.
10. **Update `CHANGELOG.md`** after every completed phase.

---

## **CRITICAL PRESERVATION REQUIREMENTS**

- **DO NOT** alter metaphysical/archetypal logic in elemental agents
- **DO NOT** change sacred symbolism or spiritual integrity
- **DO NOT** modify UI sacred minimalism principles
- **PRESERVE** all existing API endpoints for backward compatibility
- **MAINTAIN** production-grade code quality and scale-awareness

---

## **SUCCESS CRITERIA**

- [ ] Zero circular dependencies between core components
- [ ] Single unified API gateway with consistent response schema
- [ ] Redis caching implemented with 90%+ cache hit rate
- [ ] Event sourcing captures all state changes
- [ ] Database queries optimized with proper indexing
- [ ] JWT authentication and multi-tenant isolation working
- [ ] All existing tests passing
- [ ] Performance improved by 3x minimum

---

## **Technical Debt Prevention**

**⚠️ CRITICAL**: This refactor has high risk of introducing technical debt. Follow these guardrails:

### **Before Starting**

- [ ] Create comprehensive test suite for existing functionality
- [ ] Document current API contracts and behavior
- [ ] Backup current working state
- [ ] Set up CI/CD pipeline with automated testing

### **During Implementation**

- [ ] Implement incrementally - one task at a time
- [ ] Maintain backward compatibility throughout
- [ ] Test each change thoroughly before proceeding
- [ ] Document all architectural decisions and trade-offs
- [ ] Avoid over-engineering - start with simplest viable implementation

### **Quality Gates**

- [ ] Each task must pass existing tests
- [ ] Performance must not degrade
- [ ] All existing endpoints must continue working
- [ ] Code coverage must not decrease
- [ ] Memory usage should not increase significantly

### **Rollback Plan**

- [ ] Each commit should be atomic and revertible
- [ ] Tag stable versions before major changes
- [ ] Keep feature flags for new functionality
- [ ] Document rollback procedures for each major change

---

## **Notes**

Do you want me to also make a **companion diagram** showing the **new architecture flow** so your developer and Claude can visually understand the new system shape before touching code? That would lock in the design.
