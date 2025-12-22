# Phase 4.7-B: Voice/TTS Integration Plan

**Status:** 📋 Planning
**Date:** December 21, 2025
**Dependencies:** Phase 4.7 Meta-Dialogue (Complete)
**Type:** Voice Integration + Biomarker Extraction

---

## 🎯 Objective

Integrate voice capabilities into the Phase 4.7 Meta-Dialogue system with:
- **Switchable TTS providers** (OpenAI ↔ Local Sesame)
- **Voice biomarker extraction** during dialogue
- **Adaptive synthesis** based on vocal tone analysis
- **Sovereignty compliance** with explicit opt-in for cloud services

---

## 🏗️ Architecture

### Voice Provider Toggle System

```
User Query (text or voice)
    ↓
Voice Router (`VOICE_PROVIDER` env flag)
    ↓
┌─────────────────────────────────────┐
│ VOICE_PROVIDER=openai               │ VOICE_PROVIDER=sesame
│   → OpenAI TTS (gpt-4o-mini-tts)   │   → Local Sesame CSM
│   → High-fidelity neural voice      │   → Fully sovereign
│   → ~1-2s latency                   │   → ~2-4s latency
│   → Requires API key                │   → No external calls
└─────────────────────────────────────┘
    ↓
Audio Response (MP3/WAV/AIFF)
    ↓
Frontend Playback + Biomarker Extraction
```

---

## 📂 Implementation Plan

### Module A: Voice Provider Router

**Files to create/modify:**
- `backend/src/services/voice/VoiceRouter.ts` (modify existing)
- `backend/src/services/voice/providers/openaiTTS.ts` (new)
- `backend/src/services/voice/providers/sesameTTS.ts` (new - wrapper for existing)

**VoiceRouter.ts Integration:**
```typescript
import { synthesizeOpenAITTS } from './providers/openaiTTS';
import { synthesizeSesameTTS } from './providers/sesameTTS';

export async function routeVoiceSynthesis(
  text: string,
  opts: {
    voice?: string;
    format?: string;
    speed?: number;
    userId?: string;
  } = {}
): Promise<VoiceResponse> {
  const provider = process.env.VOICE_PROVIDER || 'sesame';

  logger.info(`[VoiceRouter] Using provider: ${provider}`);

  if (provider === 'openai') {
    return await synthesizeOpenAITTS(text, opts);
  } else {
    return await synthesizeSesameTTS(text, opts);
  }
}
```

**OpenAI TTS Provider:**
```typescript
// backend/src/services/voice/providers/openaiTTS.ts
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function synthesizeOpenAITTS(
  text: string,
  opts: {
    voice?: string;
    format?: string;
    speed?: number;
  } = {}
): Promise<VoiceResponse> {
  const voice = opts.voice || 'alloy';
  const format = opts.format || 'mp3';
  const speed = opts.speed || 1.0;

  const response = await client.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
    input: text,
    response_format: format as 'mp3' | 'opus' | 'aac' | 'flac',
    speed,
  });

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Convert to base64 data URL for frontend
  const base64 = buffer.toString('base64');
  const dataUrl = `data:audio/${format};base64,${base64}`;

  return {
    success: true,
    audioUrl: dataUrl,
    audioBuffer: buffer,
    engine: 'openai',
    model: 'gpt-4o-mini-tts',
    metadata: {
      voice,
      format,
      speed,
      provider: 'openai'
    }
  };
}
```

**Sesame TTS Provider Wrapper:**
```typescript
// backend/src/services/voice/providers/sesameTTS.ts
import { ttsOrchestrator } from '../../TTSOrchestrator';

export async function synthesizeSesameTTS(
  text: string,
  opts: {
    voice?: string;
    userId?: string;
    sessionId?: string;
  } = {}
): Promise<VoiceResponse> {
  // Delegate to existing TTSOrchestrator (Sesame → ElevenLabs fallback)
  return await ttsOrchestrator.generateSpeech(
    text,
    opts.voice || 'maya',
    {
      userId: opts.userId,
      sessionId: opts.sessionId
    }
  );
}
```

---

### Module B: Frontend Integration

**Files to modify:**
- `app/talk/page.tsx` - Add voice playback controls
- `app/components/TalkThread.tsx` - Add audio player to MAIA responses
- `lib/voice/VoiceSynthesisClient.ts` (new) - Client-side TTS wrapper

**TalkThread.tsx Enhancement:**
```typescript
function DialogueMessage({ exchange }: { exchange: DialogueExchange }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const isMaia = exchange.speaker === 'maia';

  async function handlePlayVoice() {
    if (audioUrl) {
      // Play existing audio
      const audio = new Audio(audioUrl);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    } else {
      // Generate audio
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: exchange.content,
          voice: 'maya'
        })
      });

      const data = await response.json();
      setAudioUrl(data.audioUrl);

      const audio = new Audio(data.audioUrl);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-lg px-4 py-3 ...`}>
        {/* Message content */}
        <div className="text-sm">{exchange.content}</div>

        {/* Voice playback button (MAIA only) */}
        {isMaia && (
          <button
            onClick={handlePlayVoice}
            className="mt-2 text-xs text-blue-500 hover:underline"
            disabled={isPlaying}
          >
            {isPlaying ? '🔊 Playing...' : '🎤 Play voice'}
          </button>
        )}
      </div>
    </div>
  );
}
```

**New API Route:**
```typescript
// app/api/voice/synthesize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { routeVoiceSynthesis } from '@/backend/src/services/voice/VoiceRouter';

export async function POST(request: NextRequest) {
  const { text, voice, format, speed } = await request.json();

  const result = await routeVoiceSynthesis(text, {
    voice,
    format,
    speed
  });

  return NextResponse.json(result);
}
```

---

### Module C: Voice Biomarker Extraction

**Purpose:** Extract prosodic features from user voice input to enhance consciousness trace analysis.

**Files to create:**
- `lib/voice/biomarkers/VoiceBiomarkerExtractor.ts` (new)
- `backend/src/services/voice/VoiceAnalyzer.ts` (new)

**Features to extract:**
1. **Pitch** (fundamental frequency, F0)
2. **Energy** (volume/intensity)
3. **Speech rate** (words per minute)
4. **Pause patterns** (silence duration/frequency)
5. **Jitter/Shimmer** (voice quality indicators)
6. **Formants** (F1, F2 for vowel quality)

**Implementation approach:**
- Use **Web Audio API** (client-side) for real-time extraction
- Use **Parselmouth/Praat** (Python backend) for advanced analysis
- Store biomarkers in `consciousness_traces` table (new JSON field: `voice_biomarkers`)

**Schema extension:**
```sql
ALTER TABLE consciousness_traces
ADD COLUMN voice_biomarkers JSONB DEFAULT '{}'::jsonb;

-- Example structure:
{
  "pitch_mean_hz": 185.3,
  "pitch_std_hz": 22.1,
  "energy_db": -18.5,
  "speech_rate_wpm": 142,
  "pause_count": 5,
  "mean_pause_ms": 680,
  "jitter_percent": 0.8,
  "shimmer_percent": 4.2,
  "formant_f1_hz": 720,
  "formant_f2_hz": 1220
}
```

**Correlation with facets:**
- High pitch + high energy → Fire activation (F1, F2)
- Low pitch + slow rate → Water/Earth grounding (W1, E1)
- Irregular jitter/shimmer → Stress indicators (correlate with HRV drop)

---

### Module D: Adaptive Synthesis

**Goal:** Adjust MAIA's voice characteristics based on user's vocal biomarkers.

**Adaptation rules:**
```typescript
function adaptVoiceToUser(userBiomarkers: VoiceBiomarkers): VoiceSettings {
  const settings: VoiceSettings = {
    voice: 'alloy', // default
    speed: 1.0,
    pitch: 0, // OpenAI doesn't support pitch directly, but we can select voice
  };

  // If user speaks slowly → MAIA slows down (mirroring/pacing)
  if (userBiomarkers.speech_rate_wpm < 100) {
    settings.speed = 0.9;
  }

  // If user has high energy → MAIA uses more energetic voice
  if (userBiomarkers.energy_db > -12) {
    settings.voice = 'nova'; // More energetic
  }

  // If user has low energy/stress → MAIA uses calmer voice
  if (userBiomarkers.energy_db < -20 || userBiomarkers.jitter_percent > 1.5) {
    settings.voice = 'echo'; // Calmer, more grounded
  }

  return settings;
}
```

**Integration point:**
- Extract biomarkers from user audio input
- Store in dialogue session context
- Apply adaptation on next MAIA response synthesis
- Log adaptation decisions in `meta_dialogues.synthesis_method`

---

## 🗄️ Database Schema Changes

### New Column: `voice_biomarkers`
```sql
-- Add to consciousness_traces
ALTER TABLE consciousness_traces
ADD COLUMN voice_biomarkers JSONB DEFAULT '{}'::jsonb;

-- Index for voice biomarker queries
CREATE INDEX idx_traces_voice_biomarkers
ON consciousness_traces USING GIN (voice_biomarkers);
```

### New Column: `voice_settings`
```sql
-- Add to meta_dialogues
ALTER TABLE meta_dialogues
ADD COLUMN voice_settings JSONB DEFAULT NULL;

-- Example:
{
  "voice": "nova",
  "speed": 0.9,
  "adapted": true,
  "adaptation_reason": "user_low_energy"
}
```

---

## 🧪 Testing Plan

### Test 1: Provider Toggle
```bash
# Test OpenAI TTS
export VOICE_PROVIDER=openai
export OPENAI_API_KEY=sk-...

curl -X POST http://localhost:3000/api/voice/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"Testing OpenAI voice synthesis","voice":"alloy"}' \
  --output test-openai.mp3

# Test Local Sesame TTS
export VOICE_PROVIDER=sesame

curl -X POST http://localhost:3000/api/voice/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"Testing local Sesame voice synthesis","voice":"maya"}' \
  --output test-sesame.mp3
```

### Test 2: Frontend Playback
```bash
npm run dev
open http://localhost:3000/talk

# Send message → verify MAIA response has "🎤 Play voice" button
# Click button → verify audio plays
# Verify audioUrl is cached (second click plays immediately)
```

### Test 3: Voice Biomarker Extraction
```typescript
// Create test script: scripts/test-voice-biomarkers.ts
import { extractVoiceBiomarkers } from '@/lib/voice/biomarkers/VoiceBiomarkerExtractor';

async function testBiomarkerExtraction() {
  const audioFile = './test-audio/user-sample.wav';
  const biomarkers = await extractVoiceBiomarkers(audioFile);

  console.log('Extracted biomarkers:', biomarkers);

  // Expected output:
  // {
  //   pitch_mean_hz: 185.3,
  //   energy_db: -18.5,
  //   speech_rate_wpm: 142,
  //   ...
  // }
}
```

### Test 4: Adaptive Synthesis
```bash
# Record user audio with low energy
# Verify MAIA responds with 'echo' voice + slower speed
# Verify adaptation logged in meta_dialogues.voice_settings
```

---

## 📊 Performance Metrics

**Target latencies:**
- OpenAI TTS: 1-2s (network call)
- Local Sesame TTS: 2-4s (local inference)
- Biomarker extraction: <500ms (client-side Web Audio API)
- Total dialogue cycle (text → voice response): 3-6s

**Quality metrics:**
- Voice naturalness: 4.5+/5 (user rating)
- Adaptation accuracy: 80%+ (voice matches user state)
- Biomarker correlation: r > 0.6 with HRV/facet patterns

---

## 🛡️ Sovereignty Compliance

### Environment Flag Documentation

**In `.env.local` or deployment environment:**
```bash
# Voice Provider Selection
VOICE_PROVIDER=openai   # Options: openai | sesame
OPENAI_API_KEY=sk-...   # Required if VOICE_PROVIDER=openai

# If using OpenAI:
# - User explicitly opts in by setting VOICE_PROVIDER=openai
# - Audio data sent to OpenAI API (no voice data stored by OpenAI per TOS)
# - Text-to-speech only (no voice recognition/training)
# - Can switch to sesame anytime by changing VOICE_PROVIDER

# If using Sesame (default):
# - 100% local processing
# - No external API calls
# - Full data sovereignty
```

### Documentation Update

**Add to Community Commons:**
```markdown
## Voice Provider Options

MAIA supports two TTS modes:

### 🌐 OpenAI TTS (Opt-in Cloud)
- **Quality:** Highest fidelity neural voices
- **Privacy:** Audio synthesis only, no data retention by OpenAI
- **Setup:** Set `VOICE_PROVIDER=openai` + `OPENAI_API_KEY`
- **Use case:** Production demos, high-quality output

### 🔒 Sesame TTS (Sovereign Default)
- **Quality:** High-quality local synthesis
- **Privacy:** 100% local, zero external calls
- **Setup:** Set `VOICE_PROVIDER=sesame` (default)
- **Use case:** Full sovereignty, offline operation
```

---

## 🚀 Implementation Timeline

### Current Week: OpenAI TTS Production Use
**Status:** ✅ **ACTIVE** - Using OpenAI TTS (Alloy, Nova, and other voices)

**Setup:**
```bash
# In .env.local (local only, not committed):
OPENAI_API_KEY=sk-...
```

**Active endpoint:** `/api/voice/openai-tts/route.ts`

**Voices in use:**
- `nova` - Energetic, expressive (primary MAIA voice)
- `alloy` - Neutral, balanced (fallback)
- `echo`, `fable`, `onyx`, `shimmer` - Context-specific

**Integration:**
- Frontend components call `/api/voice/openai-tts` directly
- Fallback to macOS TTS (Samantha) if no API key
- Used in: OracleConversation, MaiaSettingsPanel, TalkThread (when implemented)

---

### Next Phase: Custom MAIA Voice Development

### Week 1: Module A (Voice Router)
- Day 1-2: Create provider abstraction
- Day 3-4: Implement custom MAIA voice provider
- Day 5: Test provider toggle (OpenAI ↔ Custom)

### Week 2: Module B (Frontend Integration)
- Day 1-2: Add voice playback UI to TalkThread
- Day 3-4: Create unified /api/voice/synthesize endpoint
- Day 5: Test end-to-end playback with both providers

### Week 3: Module C (Biomarker Extraction)
- Day 1-3: Implement Web Audio API extraction
- Day 4-5: Store biomarkers in consciousness_traces

### Week 4: Module D (Adaptive Synthesis)
- Day 1-2: Build adaptation logic
- Day 3-4: Integrate with dialogue flow
- Day 5: Test adaptation accuracy

---

## 📖 Documentation Deliverables

1. **Technical Guide:** `artifacts/PHASE_4_7B_VOICE_TTS_COMPLETE.md`
2. **Quick Start:** `Community-Commons/09-Technical/VOICE_TTS_SETUP_GUIDE.md`
3. **Sovereignty Note:** Update `CLAUDE.md` with voice provider policy
4. **API Reference:** Document `/api/voice/synthesize` endpoint

---

## ✅ Definition of Done

- [ ] Voice provider toggle working (OpenAI ↔ Sesame)
- [ ] Frontend playback functional in `/talk` interface
- [ ] Voice biomarkers extracting and storing in traces
- [ ] Adaptive synthesis adjusting MAIA voice based on user biomarkers
- [ ] Database migrations applied (voice_biomarkers, voice_settings columns)
- [ ] Tests passing (provider toggle, playback, biomarker extraction)
- [ ] Documentation complete (technical guide, quick start, sovereignty note)
- [ ] Community Commons announcement published

---

**Next Phase Preview:** Phase 4.8 - Developmental Trajectories (long-term pattern analysis across weeks/months)

---

*This plan maintains sovereignty by making cloud TTS an explicit opt-in while defaulting to fully local processing. Voice biomarker integration creates a feedback loop: user voice → MAIA adaptation → enhanced therapeutic rapport.*
