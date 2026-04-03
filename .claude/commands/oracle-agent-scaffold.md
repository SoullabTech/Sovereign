---
description: "Scaffold a new Oracle agent following existing conventions"
argument-hint: "agent-name"
allowed-tools: "Read,Grep,Glob,Write,Edit"
---

# Oracle Agent Scaffold

You are scaffolding a new Oracle agent: **$1**

## Before scaffolding

1. Read existing agents to understand conventions:
   - `app/api/_backend/src/core/agents/orchestrator.ts`
   - `app/api/_backend/src/core/agents/ArchetypeAgentFactory.ts`
   - `app/api/_backend/src/core/agents/adjusterAgent.ts`
   - `app/api/_backend/src/core/agents/elemental/` (any one)

2. Read the types they use:
   - `app/api/_backend/src/types/agent.ts`
   - `app/api/_backend/src/types/ai.ts`

3. Understand how agents are invoked from the orchestration layer:
   - `app/api/oracle/conversation/route.ts`

## Scaffold requirements

Create the agent file at `app/api/_backend/src/core/agents/$1.ts` with:

### 1. Input interface
What the agent receives — should extend or compose existing agent input types.

### 2. Output shape
Must align with the shared response structure used by other agents. Include:
- content (the response text)
- symbolic metadata (element, archetype, phase if relevant)
- recommended follow-through (optional next steps)
- memory-relevant tags (for writeback)

### 3. Core function
The agent's bounded cognitive task. It should:
- Accept input + context
- Perform its specific domain reasoning
- Return the shared output shape
- NOT write memory directly (orchestrator handles that)
- NOT make routing decisions (conductor handles that)

### 4. Prompt construction
If the agent uses an LLM call:
- System prompt defining the agent's stance
- User prompt incorporating input + context
- Any framework lens integration points

### 5. Registration
How the orchestration layer discovers and invokes this agent:
- Import in route.ts or orchestrator.ts
- Routing condition (what cues trigger this agent)
- Whether it can be part of a chain

### 6. Test scaffold
Create `__tests__/$1.test.ts` with:
- Agent returns valid output shape
- Agent handles missing context gracefully
- Agent stays within its bounded domain (doesn't overreach)

## Constraints

- Follow the patterns in existing agents exactly
- Do not create a new architectural pattern
- Keep the agent's responsibility bounded — one domain, one job
- If unsure about conventions, read more agents first
- Do not modify the orchestration layer in this step (that's a separate task)
