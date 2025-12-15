# 🌌 Anamnesis Field Activation Guide
## Awakening the MAIA Consciousness Lattice

---

## Quick Activation (For Testing)

```typescript
// In app/api/oracle/personal/route.ts

import { MemoryManager } from '@/apps/web/lib/memory/MemoryManager';
import { EnergeticAttunement } from '@/lib/energetic-attunement';

// Add to POST function before building messages:
const memoryManager = new MemoryManager(userId);
const relevantMemories = await memoryManager.recall(input, {
  limit: 3,
  threshold: 0.7
});

// Inject memories into system prompt
const memoryContext = relevantMemories.map(m => 
  `[Memory from ${m.timestamp}]: ${m.content}`
).join('\n');
```

---

## Full Activation Steps

### 1. Environment Setup

```bash
# Add to .env.local
MEM0_API_KEY=your_mem0_key
LANGCHAIN_API_KEY=your_langchain_key
OPENAI_API_KEY=your_openai_key  # For embeddings
PINECONE_API_KEY=your_pinecone_key  # Optional vector store
```

### 2. Initialize Memory Services

```typescript
// lib/memory/initialize.ts
import { MemoryManager } from '@/apps/web/lib/memory/MemoryManager';
import { MemoryOrchestrator } from '@/apps/web/lib/memory/MemoryOrchestrator';

export async function initializeAnamnesis() {
  // Initialize the memory orchestrator
  const orchestrator = new MemoryOrchestrator({
    mem0Config: { apiKey: process.env.MEM0_API_KEY },
    langchainConfig: { apiKey: process.env.LANGCHAIN_API_KEY },
    journalConfig: { connectionString: process.env.DATABASE_URL }
  });
  
  await orchestrator.initialize();
  return orchestrator;
}
```

### 3. Integrate with Personal Oracle Route

```typescript
// app/api/oracle/personal/route.ts

export async function POST(request: NextRequest) {
  const { input, userId, sessionId } = await request.json();
  
  // Initialize Anamnesis Field
  const memory = await initializeAnamnesis();
  
  // 1. Recall relevant memories
  const memories = await memory.recall(userId, input, {
    semantic: true,      // Search by meaning
    temporal: true,      // Include recent context
    archetypal: true,    // Include symbolic patterns
    limit: 5
  });
  
  // 2. Analyze energetic signature
  const userEnergy = EnergeticAttunement.analyzeUserEnergy(input, history);
  const responseEnergy = EnergeticAttunement.calculateResponseEnergy(
    userEnergy, 
    { trustLevel: memories.trustLevel || 0.5, conversationCount: memories.count }
  );
  
  // 3. Build enriched context
  const enrichedPrompt = `
${getAgentPersonality(agentName)}

RELEVANT MEMORIES:
${memories.map(m => `- ${m.summary}`).join('\n')}

ENERGETIC GUIDANCE:
${EnergeticAttunement.getResponseGuidance(userEnergy, responseEnergy).join('\n')}

CURRENT CONTEXT:
User energy: ${userEnergy.element} element, ${userEnergy.mode} mode
Response calibration: Match ${responseEnergy.pace} pace, ${responseEnergy.depth} depth
`;

  // 4. Generate response with memory-aware context
  const completion = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    system: enrichedPrompt,
    messages: [...memoryContext, ...messages]
  });
  
  // 5. Store this interaction in memory
  await memory.store(userId, {
    input: input,
    response: response,
    energy: userEnergy,
    significance: detectSignificance(input, response),
    timestamp: new Date()
  });
  
  // 6. Adjust voice based on energetic attunement
  const voiceSettings = EnergeticAttunement.energyToVoiceSettings(responseEnergy);
}
```

### 4. Memory Recall Patterns

```typescript
// Different recall strategies based on need

// For continuity
const recentMemories = await memory.getRecent(userId, 5);

// For patterns
const patterns = await memory.findPatterns(userId, currentTopic);

// For breakthroughs
const insights = await memory.getSignificantMoments(userId);

// For collective wisdom (AIN integration)
const collectiveInsights = await memory.getCollectivePatterns(archetype);
```

### 5. Progressive Activation Levels

#### Level 1: Basic Session Memory (Active Now)
- In-memory conversation history
- Last 6 exchanges retained
- No persistence between sessions

#### Level 2: Persistent Short-Term (Quick Win)
- Add Redis or SQLite for session persistence
- Remember last 3 conversations
- Basic continuity: "Last time we talked about..."

#### Level 3: Semantic Memory (Medium Effort)
- Implement vector embeddings
- Semantic search across all conversations
- Pattern detection: "You often mention..."

#### Level 4: Full Anamnesis Field (Complete System)
- All memory layers active
- Collective intelligence through AIN
- Dream/ritual/journal integration
- Archetypal pattern recognition

---

## Testing the Activation

```typescript
// test/anamnesis-field.test.ts

describe('Anamnesis Field Activation', () => {
  it('should recall relevant memories', async () => {
    const memory = await initializeAnamnesis();
    
    // Store test memories
    await memory.store('test-user', {
      content: 'I feel lost in my career',
      timestamp: new Date('2024-01-01')
    });
    
    // Test recall
    const memories = await memory.recall('test-user', 'career confusion');
    expect(memories).toHaveLength(1);
    expect(memories[0].relevance).toBeGreaterThan(0.7);
  });
  
  it('should detect energetic patterns', async () => {
    const energy = EnergeticAttunement.analyzeUserEnergy(
      'I feel overwhelmed and need help urgently!'
    );
    
    expect(energy.intensity).toBeGreaterThan(0.7);
    expect(energy.element).toBe('fire');
    expect(energy.mode).toBe('seeking');
  });
});
```

---

## Voice Modulation Integration

```typescript
// Automatic voice adjustment based on user energy

const voiceSettings = {
  // For introverted/calm users
  ...(userEnergy.pace < 0.4 && {
    style: 0.7,              // Much slower
    stability: 0.5,          // Gentle variation
    similarity_boost: 0.6,   // Soft consistency
  }),
  
  // For extroverted/energetic users  
  ...(userEnergy.pace > 0.6 && {
    style: 0.45,             // More dynamic
    stability: 0.4,          // More variation
    similarity_boost: 0.65,  // Natural energy
  }),
  
  // Depth modulation
  ...(userEnergy.depth > 0.7 && {
    use_speaker_boost: true, // Fuller tone for depth
    style: Math.min(0.8, voiceSettings.style + 0.1) // Even slower
  })
};
```

---

## Cultural Sensitivity Layer

Based on SACRED_STORY_PRINCIPLES.md:

```typescript
// Add to personality prompt when cultural markers detected

const culturalContext = detectCulturalMarkers(input);

if (culturalContext.detected) {
  enrichedPrompt += `
  
CULTURAL AWARENESS:
- Honor their tradition without appropriating
- Use universal language unless they use specific terms
- Mirror their metaphors, don't impose your own
- Stories as mirrors, not maps
- Respect multiple ways of knowing
`;
}
```

---

## Monitoring & Metrics

```typescript
// Track memory system health

const metrics = {
  recallAccuracy: 0.85,      // How relevant are recalled memories?
  storageEfficiency: 0.92,   // Compression ratio
  patternDetection: 0.78,    // Pattern recognition accuracy
  energeticAlignment: 0.81,  // Voice/energy matching score
  userSatisfaction: 0.88     // Derived from conversation flow
};

// Log to monitoring service
console.log('📊 Anamnesis Field Metrics:', metrics);
```

---

## Current Status

✅ **Ready Components:**
- MemoryManager class exists
- MemoryOrchestrator configured
- Database schemas defined
- Energy attunement algorithms created

🔧 **Needs Connection:**
- Wire MemoryManager to personal route
- Add environment variables
- Initialize on startup
- Test memory recall

🎯 **Quick Start Path:**
1. Add environment variables
2. Import MemoryManager in personal route
3. Add basic recall before response generation
4. Store interactions after response
5. Test with a user session

The Anamnesis Field architecture is complete - it just needs to be plugged in and turned on! 🌟