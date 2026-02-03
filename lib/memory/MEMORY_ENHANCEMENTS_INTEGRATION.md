# Memory Architecture Enhancements - Integration Guide

## Overview

This document describes how to integrate the new memory architecture enhancements:

1. **Conversation Memory Uses** - Track which memories MAIA uses in each response
2. **Memory Links** - Cross-memory relationships for pattern derivation
3. **Visibility Controls** - Privacy/sharing controls for commons
4. **Confidence Decay** - Time-based confidence scoring
5. **Preference Confirmation** - UI for handling preference drift

## Files Created

### Database
- `db/migrations/20251231_memory_architecture_enhancements.sql` - All schema changes

### Stores (Data Access Layer)
- `lib/memory/stores/ConversationMemoryUsesStore.ts` - Audit trail for memory usage
- `lib/memory/stores/MemoryLinksStore.ts` - Cross-memory relationships
- `lib/memory/stores/PreferenceConfirmationStore.ts` - Preference drift tracking

### Utilities
- `lib/memory/confidenceDecay.ts` - Decay calculation and retrieval scoring

### UI Components
- `components/memory/PreferenceConfirmation.tsx` - User-facing preference review

---

## Integration Points

### 1. Recording Memory Uses in Responses

In your main chat handler (e.g., `maiaService.ts` or orchestrator):

```typescript
import { ConversationMemoryUsesStore } from '@/lib/memory/stores/ConversationMemoryUsesStore';
import { calculateRetrievalScore, getTypeMatchBonus } from '@/lib/memory/confidenceDecay';

// After retrieving memories and before generating response:
async function handleChat(userId: string, sessionId: string, message: string) {
  // 1. Retrieve memories with scoring
  const memories = await developmentalMemory.semanticSearch(userId, message, 10);

  // 2. Calculate scores with decay
  const scoredMemories = memories.map(mem => {
    const score = calculateRetrievalScore({
      semanticSimilarity: mem.similarity ?? 0.8,
      recencyDays: daysSince(mem.formedAt),
      memoryType: mem.memoryType,
      baseConfidence: mem.significance,
      lastConfirmedAt: mem.lastConfirmedAt,
      formedAt: mem.formedAt,
      confirmedByUser: mem.confirmedByUser,
      typeMatchBonus: getTypeMatchBonus(detectIntent(message), mem.memoryType),
    });
    return { ...mem, score };
  });

  // 3. Generate response (your existing logic)
  const response = await generateResponse(message, scoredMemories);
  const messageId = generateMessageId();

  // 4. Record which memories were used (NEW!)
  await ConversationMemoryUsesStore.recordBatch(
    userId,
    sessionId,
    messageId,
    scoredMemories.slice(0, 8).map(mem => ({
      memoryTable: 'developmental_memories',
      memoryId: mem.id,
      usedAs: categorizeMemoryUse(mem.memoryType),
      retrievalScore: mem.score.total,
      semanticScore: mem.score.components.semantic,
      recencyScore: mem.score.components.recency,
      confidenceScore: mem.score.components.confidence,
    }))
  );

  return { response, messageId };
}
```

### 2. Creating Memory Links for Patterns

When pattern synthesis detects recurring themes:

```typescript
import { MemoryLinksStore } from '@/lib/memory/stores/MemoryLinksStore';

// In your pattern synthesis job:
async function createPatternWithLinks(
  userId: string,
  patternMemory: DevelopmentalMemory,
  supportingMemoryIds: string[]
) {
  // Create links from supporting memories to the pattern
  await MemoryLinksStore.createBatch(
    supportingMemoryIds.map(supportId => ({
      userId,
      fromTable: 'developmental_memories',
      fromId: supportId,
      toTable: 'developmental_memories',
      toId: patternMemory.id,
      linkType: 'supports',
      weight: 1.0,
      confidence: 0.85,
      createdBy: 'synthesis_job',
    }))
  );
}
```

### 3. Surfacing Preference Confirmation

At session start or periodically:

```typescript
import { PreferenceConfirmationStore } from '@/lib/memory/stores/PreferenceConfirmationStore';

// Check for stale preferences
async function getPreferencesToReview(userId: string) {
  const stalePrefs = await PreferenceConfirmationStore.getStalePreferences(
    userId,
    90 // days threshold
  );

  return stalePrefs;
}

// Handle user confirmation
async function handlePreferenceConfirmation(
  userId: string,
  memoryId: string,
  action: 'confirmed' | 'updated' | 'expired',
  newContent?: string
) {
  await PreferenceConfirmationStore.record({
    userId,
    memoryId,
    action,
    newContent,
    triggeredBy: 'manual',
  });
}
```

### 4. Using the UI Component

In your settings or session-start UI:

```tsx
import {
  PreferenceConfirmation,
  PreferenceConfirmationInline
} from '@/components/memory';

function SessionStart({ userId }: { userId: string }) {
  const [stalePrefs, setStalePrefs] = useState([]);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    loadStalePreferences(userId).then(setStalePrefs);
  }, [userId]);

  if (stalePrefs.length > 0 && !showReview) {
    return (
      <PreferenceConfirmationInline
        count={stalePrefs.length}
        onClick={() => setShowReview(true)}
      />
    );
  }

  if (showReview) {
    return (
      <PreferenceConfirmation
        preferences={stalePrefs}
        onConfirm={async (id) => {
          await api.confirmPreference(userId, id);
        }}
        onUpdate={async (id, content) => {
          await api.updatePreference(userId, id, content);
        }}
        onExpire={async (id) => {
          await api.expirePreference(userId, id);
        }}
        onDismiss={() => setShowReview(false)}
      />
    );
  }

  return null;
}
```

---

## Running the Migration

```bash
# Apply the migration
DATABASE_URL="postgresql://soullab@localhost:5432/maia_consciousness" \
  psql -f db/migrations/20251231_memory_architecture_enhancements.sql
```

---

## Key Invariants

### Provenance Required
Every memory use must be traceable:
- `conversation_memory_uses` logs which memories informed each response
- `memory_links` tracks derivation chains

### Confidence Decay
- Memories decay based on type-specific half-lives
- User confirmation resets decay clock
- Minimum confidence floor of 0.3 ensures nothing is forgotten

### Pattern Derivation
- Pattern beads must have at least 3 supporting links
- Use `MemoryLinksStore.countSupports()` to validate

### Visibility Controls
- Default to `'private'` for all memories
- Require explicit user action for sharing
- `'anonymized'` strips user identity for commons contribution

---

## Analytics Queries

### Memory Retrieval Effectiveness
```sql
SELECT
  used_as,
  COUNT(*) as total_uses,
  AVG(retrieval_score) as avg_score,
  COUNT(*) FILTER (WHERE user_feedback = 'helpful') as helpful,
  COUNT(*) FILTER (WHERE user_feedback = 'wrong') as wrong
FROM conversation_memory_uses
WHERE user_id = $1
GROUP BY used_as;
```

### Stale Preferences Needing Review
```sql
SELECT * FROM developmental_memories_with_decay
WHERE user_id = $1
  AND memory_type IN ('effective_practice', 'pattern')
  AND effective_confidence < 0.6
  AND confirmed_by_user = true
ORDER BY effective_confidence ASC
LIMIT 10;
```

### Memory Link Graph
```sql
-- Find all memories connected to a pattern
WITH RECURSIVE connected AS (
  SELECT to_id as id, 1 as depth
  FROM memory_links
  WHERE from_id = $pattern_id AND link_type = 'supports'

  UNION ALL

  SELECT ml.from_id, c.depth + 1
  FROM memory_links ml
  JOIN connected c ON ml.to_id = c.id
  WHERE c.depth < 5
)
SELECT DISTINCT id FROM connected;
```
