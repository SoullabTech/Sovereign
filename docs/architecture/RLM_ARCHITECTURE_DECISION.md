# RLM Architecture Decision

**Date**: 2026-01-09
**Status**: Decided
**Decision**: TypeScript-native implementation (Option 2)

## Context

RLM (Retrieval-augmented Language Model) pattern needed for:
- **drn**: Corpus-as-Environment for Community Commons
- **bk2**: Codebase navigation prototype

Original options:
1. Python microservice - separate backend
2. TypeScript port - native TS implementation
3. Hybrid - Python worker + TS orchestration

## Decision

**TypeScript-native implementation.** No Python service needed.

## Rationale

### Existing Infrastructure Covers All Primitives

| Component | Already Have | Location |
|-----------|-------------|----------|
| Local Embeddings | ✓ | `lib/ai/localEmbeddingClient.ts` |
| Vector Storage | ✓ | `lib/db/pgvector.ts` + PostgreSQL |
| Semantic Retrieval | ✓ | `lib/ain/knowledge/RetrievalService.ts` |
| Local LLM | ✓ | `lib/ai/localModelClient.ts` (Ollama) |
| Retrieval Analytics | ✓ | `ain_knowledge_retrievals` table |

### Why Not Python?

1. **RLM is a pattern, not a library** - Just tool-use + iteration
2. **No service boundary** - Eliminates IPC latency
3. **Simpler deployment** - No sidecar container to manage
4. **Sovereignty intact** - All processing via local Ollama
5. **Team velocity** - No Python expertise required

### Pattern Implementation

```typescript
// lib/rlm/RLMOrchestrator.ts - pseudocode
interface RLMAction {
  type: 'search' | 'read' | 'answer';
  query?: string;
  chunkId?: string;
  answer?: string;
}

async function rlmQuery(
  question: string,
  options: { corpus: string; maxIterations?: number }
): Promise<string> {
  const { corpus, maxIterations = 5 } = options;
  let context: string[] = [];

  for (let i = 0; i < maxIterations; i++) {
    // 1. Ask model what action to take
    const action = await decideAction(question, context);

    // 2. Execute action
    switch (action.type) {
      case 'search':
        const chunks = await retrieveKnowledge(action.query!, {
          domains: [corpus],
          limit: 3,
        });
        context.push(...chunks.map(c => c.chunkText));
        break;

      case 'read':
        const chunk = await getChunkById(action.chunkId!);
        context.push(chunk.fullText);
        break;

      case 'answer':
        return action.answer!;
    }
  }

  // Fallback: synthesize from context
  return synthesizeAnswer(question, context);
}
```

## Implementation Plan

### Phase 1: RLM Orchestrator Core

New files:
- `lib/rlm/RLMOrchestrator.ts` - Main loop
- `lib/rlm/actions.ts` - Action parsing
- `lib/rlm/prompts.ts` - Decision prompts

### Phase 2: Corpus-as-Environment (drn)

Tables:
- Reuse `ain_knowledge_chunks` with `domain = 'commons'`
- Or create `community_commons_chunks` if separation preferred

Scripts:
- `scripts/embed-community-commons.ts` - Index manuals/guides

### Phase 3: Codebase Navigation (bk2)

No new tables - use existing file tools:
- `glob()` - find files by pattern
- `grep()` - search content
- `read()` - get file content

The LLM orchestrates which tools to call based on the question.

## Consequences

### Positive
- No new runtime dependencies
- No container orchestration complexity
- Latency stays low (no IPC)
- Single codebase to maintain

### Negative
- Can't use Python-native NLP libraries (spaCy, etc.)
- Must reimplement any Python-only algorithms
- Local Ollama required for full functionality

### Mitigations
- Ollama fallback to consciousness_engine already exists
- Can add Python sidecar later if specific libraries needed
- Most NLP tasks covered by embedding similarity

## References

- `lib/ain/knowledge/RetrievalService.ts` - Existing retrieval pattern
- `lib/ai/localModelClient.ts` - Local LLM interface
- `lib/db/pgvector.ts` - Vector storage helpers
