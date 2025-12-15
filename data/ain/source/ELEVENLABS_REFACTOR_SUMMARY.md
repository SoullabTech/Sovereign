# ElevenLabs Refactoring Summary

## What Was Refactored

### 1. Voice Routing Implementation

- Modified `personalOracle.routes.ts` to use `voiceRouter` instead of direct `synthesizeVoice` calls
- Oracle agents now route through the voice router which determines whether to use Sesame or ElevenLabs

### 2. Created Dedicated Narration Route

- New route: `/api/narration/synthesize` for static narration content
- Always uses ElevenLabs for meditation, ceremony, and teaching content
- Provides clear separation between dynamic agent voices and static narrations

### 3. Agent Role Mapping

Created `agentRoleMapping.ts` to standardize how agents are categorized:

- **Oracle Role**: MainOracleAgent, PersonalOracleAgent, etc. → Use Sesame when enabled
- **Elemental Role**: FireAgent, WaterAgent, etc. → Use Sesame when enabled
- **Narrator Role**: Static content, meditations, ceremonies → Always use ElevenLabs

### 4. Voice Service Architecture

```
┌─────────────────┐
│   User Query    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Agent Process  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  Voice Router   │────▶│ Agent Role Check │
└────────┬────────┘     └──────────────────┘
         │                       │
         ▼                       ▼
   ┌─────────────┐         ┌──────────┐
   │   Sesame    │         │ElevenLabs│
   │(Oracle/Elem)│         │(Narrator)│
   └─────────────┘         └──────────┘
```

## Changes Made

### 1. Modified Files

- `src/routes/oracle/personalOracle.routes.ts` - Uses voiceRouter with agentRole
- `src/routes/index.ts` - Added narration routes

### 2. New Files

- `src/routes/narration.routes.ts` - Dedicated narration endpoints
- `src/utils/agentRoleMapping.ts` - Agent role determination logic
- `__tests__/voice-routing-integration.test.ts` - Integration tests

### 3. Unchanged (Still Direct ElevenLabs)

- `src/server/services/voiceService.ts` - Core ElevenLabs integration
- `src/server/services/guideService.ts` - Voice configuration service

## Usage Examples

### Dynamic Agent Voice (Routes to Sesame when enabled)

```typescript
// In an oracle agent response handler
const audioUrl = await routeVoice({
  text: response.content,
  voiceId: voiceConfig.voiceId,
  agentRole: "oracle", // or 'elemental'
});
```

### Static Narration (Always ElevenLabs)

```typescript
// For meditation or ceremony content
const response = await fetch("/api/narration/synthesize", {
  method: "POST",
  body: JSON.stringify({
    text: meditationScript,
    type: "meditation",
    voiceProfile: "emily",
  }),
});
```

## Environment Configuration

```env
# Enable Sesame for dynamic agents
USE_SESAME=true

# ElevenLabs for narrations
ELEVENLABS_API_KEY=your-api-key
DEFAULT_VOICE_ID=emily-voice-id
ORALIA_VOICE_ID=oralia-voice-id
```

## Next Steps

1. **Update All Agent Handlers**: Search for any remaining direct `synthesizeVoice` calls and update them to use `routeVoice`

2. **Migrate Meditation Content**: Move any hardcoded meditation/ceremony scripts to use the narration endpoint

3. **Voice Profile Management**: Consider creating a voice profile system that maps agents to specific voice characteristics

4. **Performance Optimization**: Cache voice synthesis results for frequently used narrations

## Testing

Run the integration tests:

```bash
npm test -- __tests__/voice-routing-integration.test.ts
```

The test suite validates:

- Correct agent role mapping
- Proper routing based on USE_SESAME flag
- Narration content detection
- Mock agent response handling
