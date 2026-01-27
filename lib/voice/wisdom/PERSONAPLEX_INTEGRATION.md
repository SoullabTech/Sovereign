# PersonaPlex Integration Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      MAIA-SOVEREIGN                              │
│                     (Orchestrator)                               │
├─────────────────────────────────────────────────────────────────┤
│  /api/voice/stream-conversation                                  │
│    │                                                             │
│    ├─► Relational Stack (silence/backchannel decisions)         │
│    │                                                             │
│    ├─► MaiaWisdomProvider.buildVoiceContext()                   │
│    │     │                                                       │
│    │     ├─ SANCTUARY CHECK (hard wall)                          │
│    │     │   └─ If sanctuary: NO retrieval, return minimal ctx   │
│    │     │                                                       │
│    │     ├─ MemoryBundleService.build()                          │
│    │     │   └─ Recent turns, semantic memories, breakthroughs   │
│    │     │                                                       │
│    │     └─ SpiralStateService.getActiveSpiralsForInjection()   │
│    │         └─ Active spiral states with element/phase/facet   │
│    │                                                             │
│    ├─► MaiaWisdomProvider.formatForPersonaPlex()                │
│    │     └─ Builds persona directive string                      │
│    │                                                             │
│    └─► PersonaPlex MAIAVoiceService.generate_response()         │
│          └─ Receives pre-built context, renders voice            │
└─────────────────────────────────────────────────────────────────┘
```

## Key Principle

> **PersonaPlex should not own wisdom. It should consume already-built MAIA context.**

MAIA-SOVEREIGN orchestrates:
- Session identity
- Memory retrieval (or sanctuary blocking)
- Spiral state
- Mode-aware persona composition

PersonaPlex renders:
- Voice generation from pre-built context
- Prosodic governance (pace, pause, turn-taking)
- Full-duplex audio streaming

## VoiceContextPayload

The `MaiaWisdomProvider.buildVoiceContext()` returns:

```typescript
interface VoiceContextPayload {
  // Identity & mode
  mode: 'talk' | 'care' | 'note';
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether' | null;
  sanctuary: boolean;

  // Pre-built context strings
  memoryDirective: string | null;     // Compressed memory for prompt
  spiralDirective: string | null;     // Current spiral state summary
  relationshipBrief: string | null;   // Brief relationship context

  // Conversation history (always allowed)
  conversationHistory: Array<{ role: string; content: string }>;

  // Metadata (NO content in sanctuary)
  metadata: {
    retrievalStats?: {
      memoryBulletsUsed: number;
      spiralsActive: number;
      encounterCount: number;
    };
    sanctuaryActive: boolean;
  };
}
```

## PersonaPlex Integration Points

### 1. Replace `synthesizeSentence()` with PersonaPlex

Currently the endpoint uses OpenAI TTS:
```typescript
const audioResult = await synthesizeSentence(text, voice, relationalSpeed);
```

Replace with PersonaPlex:
```typescript
import { renderWithPersonaPlex } from '@/lib/voice/personaplex/personaPlexClient';

// Build wisdom directive only if payload exists (optional)
const wisdomDirective = wisdomPayload
  ? MaiaWisdomProvider.formatForPersonaPlex(wisdomPayload)
  : undefined;

// Render with PersonaPlex (safe even if wisdomPayload is null)
// wisdomDirective is optional - PersonaPlex uses legacy mode when absent
for await (const chunk of renderWithPersonaPlex({
  text: chunkText,
  wisdomDirective,                           // undefined if no wisdom (not empty string)
  mode: wisdomPayload?.mode ?? mode,         // Fall back to request mode
  element: wisdomPayload?.element ?? element,
  sanctuary: wisdomPayload?.sanctuary ?? sanctuary,
  speed: relationalSpeed,
})) {
  emit('audio', {
    index: chunkIndex,
    audio: chunk.audioB64,
    format: 'pcm-f32',
    text: chunkText,
    timestamp: Date.now(),
  });
}
```

### 2. Full-Duplex WebSocket Upgrade

For true full-duplex (user speaks while MAIA responds):

```typescript
// New endpoint: /api/voice/duplex
// WebSocket handler

ws.on('audio', async (userPcm) => {
  // Encode user audio with Mimi
  const userTokens = mimi.encode_step(userPcm);

  // PersonaPlex generates response tokens
  const responseTokens = voiceService.step(userTokens);

  // Decode to PCM
  const responsePcm = mimi.decode_step(responseTokens);

  // Stream back
  ws.send(responsePcm);
});
```

### 3. Sanctuary Enforcement

Sanctuary is enforced at multiple layers:

1. **MaiaWisdomProvider**: Returns null for memory/spiral directives
2. **Stream endpoint**: Sets `context.sanctuary = true`
3. **PersonaPlex service**: Must NOT:
   - Log user content
   - Store conversation history to disk
   - Call memory retrieval APIs

## Testing the Integration

```bash
# Test PersonaPlex directly (sync mode)
curl -sS -X POST "http://localhost:8765/render/sync" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, I am MAIA.","voice_mode":"talk","sanctuary":false}' \
  | python3 -m json.tool

# Test PersonaPlex health
curl -sS "http://localhost:8765/health" | python3 -m json.tool

# Test wisdom retrieval via MAIA-SOVEREIGN (non-sanctuary)
curl -sS -X POST "http://localhost:3000/api/voice/stream-conversation" \
  -H "Content-Type: application/json" \
  -d '{"message":"I feel overwhelmed today","userId":"test-user","sessionId":"test-session","mode":"care","element":"water","sanctuary":false}'

# Test sanctuary mode via MAIA-SOVEREIGN
curl -sS -X POST "http://localhost:3000/api/voice/stream-conversation" \
  -H "Content-Type: application/json" \
  -d '{"message":"This is private","userId":"test-user","sessionId":"test-session","mode":"talk","sanctuary":true}'
```

## Mode → Prosody Mapping

| MAIA Voice Mode | PersonaPlex Prosody | Behavior |
|-----------------|---------------------|----------|
| talk | Navigator | Fast, energetic, peer dialogue |
| care | Regulator | Slow, settling, therapeutic |
| note | Mythopoet | Contemplative, witnessing |

## Files Modified

- `lib/voice/wisdom/MaiaWisdomProvider.ts` - New wisdom adapter
- `app/api/voice/stream-conversation/route.ts` - Wisdom retrieval integrated
- `personaplex-mlx/src/personaplex_mlx/service.py` - Receives context (next step)
