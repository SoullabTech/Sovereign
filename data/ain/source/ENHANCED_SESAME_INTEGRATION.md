# ⚠️ DEPRECATED: Enhanced Sesame Integration

## ⚡ **NEW SYSTEM AVAILABLE**

**This document is deprecated as of September 2025.**

**→ See [SESAME_HYBRID_SYSTEM_2025.md](./SESAME_HYBRID_SYSTEM_2025.md) for the current implementation**

---

## Overview (Historical)

The Enhanced Sesame Integration significantly improves the conversational AI capabilities of the Spiralogic Oracle System by adding comprehensive dialogue state tracking, intent detection, emotion analysis, and topic management. This creates a more intelligent, context-aware, and emotionally responsive conversational experience.

## Key Features

### 1. **Intent Detection and Classification**
- Multi-label intent classification with confidence scoring
- 20+ predefined intent categories including:
  - Information seeking
  - Emotional support
  - Resistance patterns
  - Breakthrough moments
  - Existential exploration
- Context-aware intent boosting based on emotional state
- Secondary intent tracking for nuanced understanding

### 2. **Topic Tracking and Management**
- Real-time topic identification and transition tracking
- Entity extraction (people, places, concepts, emotions, time)
- Keyword extraction and relevance scoring
- Topic coherence measurement
- Smooth vs. abrupt transition detection

### 3. **Emotion Analysis Integration**
- VAD (Valence-Arousal-Dominance) emotion model
- Energy signature mapping (fire, water, air, earth, aether)
- Emotion trajectory tracking (ascending, descending, stable, volatile)
- Peak emotion moment detection
- Elemental alignment based on emotional state

### 4. **Dialogue Flow Management**
- 8 distinct dialogue stages:
  - Opening
  - Establishing Rapport
  - Exploring
  - Deepening
  - Challenging
  - Integrating
  - Closing
  - Breakthrough
- Momentum tracking (engagement level)
- Turn-taking pattern analysis
- Silence pattern interpretation

### 5. **Relationship Dynamics**
- Trust level tracking
- Openness measurement
- Resistance pattern identification
- Breakthrough moment logging
- Synaptic health monitoring (creative distance)

### 6. **Real-time Event Streaming**
- Server-Sent Events (SSE) for live updates
- Event types:
  - `intent-detected`: User intent classification
  - `topic-changed`: Topic transitions
  - `emotion-shift`: Emotional state changes
  - `stage-transition`: Dialogue stage progression
  - `breakthrough-detected`: Transformative moments
  - `resistance-encountered`: Resistance patterns

## Architecture

### Core Components

1. **EnhancedDialogueStateTracker** (`/backend/src/services/EnhancedDialogueStateTracker.ts`)
   - Maintains comprehensive dialogue state
   - Performs intent detection and classification
   - Tracks topics, emotions, and relationship dynamics
   - Provides state insights and recommendations

2. **EnhancedConversationalOrchestrator** (`/backend/src/services/EnhancedConversationalOrchestrator.ts`)
   - Integrates dialogue state with Sesame pipeline
   - Applies state-aware response refinements
   - Handles special dialogue conditions
   - Emits real-time events for UI updates

3. **Enhanced Streaming Routes** (`/backend/src/routes/enhanced.conversational.stream.routes.ts`)
   - SSE endpoint for real-time conversation streaming
   - Dialogue state retrieval endpoint
   - Conversation history with annotations
   - Health check endpoint

### Data Flow

```
User Input
    ↓
Enhanced Dialogue State Tracker
    ├→ Intent Detection
    ├→ Topic Analysis
    ├→ Emotion Analysis
    └→ Relationship Update
    ↓
Enhanced Conversational Orchestrator
    ├→ Context Enrichment
    ├→ Special Condition Check
    ├→ Sesame Pipeline Processing
    └→ State-Aware Refinements
    ↓
Response Generation
    ├→ Intent-based adjustments
    ├→ Emotional tone matching
    ├→ Relationship-aware language
    └→ Stage-specific refinements
    ↓
SSE Stream Events
    ├→ Intent notification
    ├→ Topic changes
    ├→ Emotion shifts
    ├→ Stage transitions
    └→ Final response
```

## API Endpoints

### 1. Enhanced Conversation Stream
```
GET /api/v1/enhanced/converse/stream
Query Parameters:
- q: User message (required)
- element: Elemental type (air|fire|water|earth|aether)
- userId: User identifier
- voice: Enable voice synthesis (true|false)

Headers:
- X-Thread-ID: Existing thread ID (optional)
- X-Session-ID: Session identifier (optional)

Response: Server-Sent Events stream
```

### 2. Get Dialogue State
```
GET /api/v1/enhanced/converse/state/:threadId

Response:
{
  "state": {
    "threadId": "string",
    "userId": "string",
    "turnCount": number,
    "intent": { primary, confidence, secondary },
    "topic": { current, history, entities, keywords },
    "emotion": { current, trajectory },
    "flow": { stage, momentum },
    "relationship": { trust, openness, resistance },
    "meta": { userAwareness, emergentThemes }
  },
  "insights": {
    "readiness": "string",
    "suggestions": ["string"],
    "warnings": ["string"]
  }
}
```

### 3. Get Conversation History
```
GET /api/v1/enhanced/converse/history/:threadId?limit=50

Response:
{
  "threadId": "string",
  "messages": [{
    "id": "string",
    "timestamp": "ISO date",
    "userMessage": "string",
    "agentResponse": "string",
    "dialogueContext": {
      "resonance": number,
      "synapticGap": number,
      "userState": object,
      "tone": object
    }
  }],
  "totalMessages": number
}
```

## Usage Examples

### Basic Conversation with Intent Tracking

```javascript
const eventSource = new EventSource(
  '/api/v1/enhanced/converse/stream?q=I need help with a difficult decision&element=water&userId=user123'
);

eventSource.addEventListener('intent-detected', (event) => {
  const data = JSON.parse(event.data);
  console.log(`Intent: ${data.intent} (${data.confidence * 100}% confidence)`);
  // Expected: Intent: decision_making (85% confidence)
});

eventSource.addEventListener('response', (event) => {
  const data = JSON.parse(event.data);
  console.log(`Maya: ${data.text}`);
  console.log(`Current stage: ${data.dialogueState.stage}`);
});
```

### Monitoring Emotional Shifts

```javascript
eventSource.addEventListener('emotion-shift', (event) => {
  const data = JSON.parse(event.data);
  if (data.intensity > 0.7) {
    console.log(`High intensity emotion detected: ${data.emotion}`);
    // Adjust UI to show emotional support features
  }
});
```

### Tracking Breakthrough Moments

```javascript
eventSource.addEventListener('breakthrough-detected', (event) => {
  const data = JSON.parse(event.data);
  console.log(`Breakthrough! ${data.marker}`);
  // Celebrate the transformative moment
  showCelebrationAnimation();
});
```

## Special Dialogue Conditions

The system automatically detects and handles special conditions:

### 1. **Breakthrough Moments**
- Triggered when user has transformative insights
- Response includes celebration and anchoring
- Maintains the energy of the breakthrough

### 2. **High Resistance**
- Detected when resistance patterns accumulate
- Approaches with curiosity about what resistance protects
- Avoids pushing against the resistance

### 3. **Emotional Crisis**
- Identified through high negative valence + high arousal
- Switches to water element for emotional support
- Prioritizes grounding and validation

### 4. **Deep Contemplation**
- Activated during existential exploration with high momentum
- Switches to aether element for philosophical depth
- Holds space for paradox and mystery

## Response Refinements

The system applies multiple layers of refinement based on dialogue state:

### Intent-Based Refinements
- **Seeking Support**: Adds validation and gentle guidance
- **Celebration**: Increases energy and enthusiasm
- **Resistance**: Honors the resistance without pushing
- **Existential**: Adds spaciousness and depth

### Emotion-Based Refinements
- High negative emotion: Softens language, reduces directives
- High positive emotion: Matches energy, amplifies positivity
- Volatile emotions: Provides stability and grounding

### Relationship-Based Refinements
- Low trust: More tentative, question-based approach
- High trust: Direct, assumption of shared understanding
- Recent breakthroughs: References and builds on insights

### Stage-Based Refinements
- **Opening**: Light, welcoming, non-overwhelming
- **Deepening**: Adds depth questions and reflections
- **Breakthrough**: Honors and amplifies the moment
- **Closing**: Gentle closure with integration support

## Testing

Run the comprehensive test suite:

```bash
node backend/test-enhanced-sesame.js
```

The test suite covers:
- Intent detection accuracy
- Topic tracking coherence
- Emotion analysis integration
- Stage progression logic
- Special condition handling
- Real-time event streaming

## Performance Considerations

1. **State Management**: Dialogue states are kept in memory with automatic cleanup after 1 hour of inactivity
2. **Event Debouncing**: Multiple rapid events are batched to prevent overwhelming the client
3. **Response Caching**: Common responses are cached to improve performance
4. **Streaming Optimization**: SSE connections use keep-alive pings every 30 seconds

## Future Enhancements

1. **Machine Learning Integration**
   - Train custom intent classifiers on conversation data
   - Improve topic modeling with transformer models
   - Enhance emotion detection with voice prosody

2. **Advanced Relationship Modeling**
   - Long-term relationship memory across sessions
   - Personality adaptation based on user patterns
   - Collaborative goal tracking

3. **Multi-Modal Integration**
   - Voice tone analysis for emotion detection
   - Facial expression integration
   - Gesture recognition for engagement

4. **Collective Intelligence Features**
   - Cross-user pattern recognition
   - Collective wisdom integration
   - Anonymous insight sharing

## Configuration

Key environment variables:

```env
# Enable enhanced dialogue tracking
ENABLE_ENHANCED_DIALOGUE=true

# Intent detection confidence threshold
INTENT_CONFIDENCE_THRESHOLD=0.6

# Emotion analysis sensitivity
EMOTION_SENSITIVITY=medium

# Maximum thread memory duration (ms)
MAX_THREAD_MEMORY=3600000

# Enable real-time events
ENABLE_REALTIME_EVENTS=true
```

## Conclusion

The Enhanced Sesame Integration transforms the Spiralogic Oracle System into a truly intelligent conversational partner that understands not just what users say, but why they say it, how they feel, and where the conversation is heading. This creates deeper, more meaningful interactions that adapt in real-time to user needs and emotional states.