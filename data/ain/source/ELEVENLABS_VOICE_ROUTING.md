# 🎭 ElevenLabs Voice Routing Strategy
## Keeping Maya & Anthony's Canonical Voices

---

## 📍 Current State Analysis

### What We Have
- **SesameVoiceService** uses OpenAI TTS (`api.openai.com/v1/audio/speech`)
- Maya mapped to `nova` voice (OpenAI)
- Anthony mapped to `alloy` voice (OpenAI)
- No ElevenLabs integration currently active

### What We Need
- Route Maya → ElevenLabs voice (e.g., Aunt Annie)
- Route Anthony → ElevenLabs voice (e.g., Onyx/custom)
- Keep OpenAI as fallback
- Add DSP layer for mask modulation

---

## 🔧 Implementation: ElevenLabs Primary + OpenAI Fallback

### File: `/lib/services/SesameVoiceService.ts`

```typescript
// Add ElevenLabs integration
import { ElevenLabsClient } from 'elevenlabs';

export class SesameVoiceService extends EventEmitter {
  private elevenLabs: ElevenLabsClient;
  private openAIKey: string;

  constructor(config: Partial<SesameVoiceConfig> = {}) {
    super();

    // Initialize ElevenLabs
    this.elevenLabs = new ElevenLabsClient({
      apiKey: process.env.ELEVEN_LABS_API_KEY
    });

    this.openAIKey = process.env.OPENAI_API_KEY || '';

    // ... existing constructor code
  }

  async generateSpeech(request: VoiceGenerationRequest): Promise<{
    audioData?: Buffer;
    audioUrl?: string;
    duration?: number;
    metadata?: any;
    provider?: 'elevenlabs' | 'openai' | 'fallback';
  }> {
    try {
      // Route to ElevenLabs for Maya/Anthony canonical voices
      if (this.shouldUseElevenLabs(request)) {
        return await this.generateWithElevenLabs(request);
      }

      // Fallback to OpenAI TTS
      return await this.generateWithOpenAI(request);

    } catch (error) {
      console.error('Primary voice generation failed:', error);

      // Ultimate fallback to OpenAI with basic voice
      return await this.generateFallbackVoice(request);
    }
  }

  private shouldUseElevenLabs(request: VoiceGenerationRequest): boolean {
    const profile = request.voiceProfile || this.selectVoiceProfile(request);

    // Use ElevenLabs for main character voices
    const elevenLabsVoices = [
      'maya-default', 'maya-fire', 'maya-water', 'maya-earth', 'maya-air',
      'anthony-default', 'anthony-fire', 'anthony-water', 'anthony-earth', 'anthony-air'
    ];

    return elevenLabsVoices.includes(profile.id);
  }

  private async generateWithElevenLabs(request: VoiceGenerationRequest): Promise<any> {
    const voiceProfile = request.voiceProfile || this.selectVoiceProfile(request);

    // Map internal voice IDs to ElevenLabs voice IDs
    const voiceIdMap = {
      'maya-default': process.env.MAYA_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
      'anthony-default': process.env.ANTHONY_ELEVENLABS_VOICE_ID || 'yoZ06aMxZJJ28mfd3POQ',
      // Add elemental variations if different voices
      'maya-fire': process.env.MAYA_ELEVENLABS_VOICE_ID,
      'maya-water': process.env.MAYA_ELEVENLABS_VOICE_ID,
      'maya-earth': process.env.MAYA_ELEVENLABS_VOICE_ID,
      'maya-air': process.env.MAYA_ELEVENLABS_VOICE_ID,
      'anthony-fire': process.env.ANTHONY_ELEVENLABS_VOICE_ID,
      'anthony-water': process.env.ANTHONY_ELEVENLABS_VOICE_ID,
      'anthony-earth': process.env.ANTHONY_ELEVENLABS_VOICE_ID,
      'anthony-air': process.env.ANTHONY_ELEVENLABS_VOICE_ID
    };

    const elevenLabsVoiceId = voiceIdMap[voiceProfile.id] || voiceIdMap['maya-default'];

    // Apply emotional modulation
    const modulatedParams = this.applyEmotionalModulation(
      voiceProfile.parameters,
      request.emotionalContext
    );

    // Generate with ElevenLabs
    const audioStream = await this.elevenLabs.textToSpeech.convert(
      elevenLabsVoiceId,
      {
        text: request.text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: modulatedParams.consistency,
          similarity_boost: 0.9,
          style: modulatedParams.emotionalDepth,
          use_speaker_boost: true
        },
        output_format: 'mp3_44100_128'
      }
    );

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }
    const audioData = Buffer.concat(chunks);

    // Apply DSP mask modulation if needed
    const modulatedAudio = await this.applyMaskModulation(
      audioData,
      voiceProfile,
      request
    );

    // Cache if enabled
    if (this.config.cacheEnabled) {
      const cacheKey = this.getCacheKey(request);
      this.audioCache.set(cacheKey, modulatedAudio);
    }

    return {
      audioData: modulatedAudio,
      duration: this.estimateDuration(modulatedAudio),
      provider: 'elevenlabs',
      metadata: {
        voiceId: elevenLabsVoiceId,
        profile: voiceProfile.id,
        modulation: modulatedParams
      }
    };
  }

  private async applyMaskModulation(
    audioData: Buffer,
    profile: VoiceProfile,
    request: VoiceGenerationRequest
  ): Promise<Buffer> {
    // Skip modulation for base voices
    if (!request.element || request.element === 'aether') {
      return audioData;
    }

    // Apply elemental DSP filters
    const elementalFilters = {
      fire: {
        pitch: 1.05,     // Slightly higher
        tempo: 1.1,       // Faster pace
        brightness: 1.2,  // More high frequencies
        warmth: 0.9       // Less low-mid warmth
      },
      water: {
        pitch: 0.98,      // Slightly lower
        tempo: 0.95,      // Slower, flowing
        brightness: 0.8,  // Softer highs
        warmth: 1.2       // More low-mid warmth
      },
      earth: {
        pitch: 0.92,      // Deeper
        tempo: 0.9,       // Slow, grounded
        brightness: 0.7,  // Muted highs
        warmth: 1.3       // Maximum warmth
      },
      air: {
        pitch: 1.02,      // Slightly lifted
        tempo: 1.05,      // Light, quick
        brightness: 1.1,  // Clear highs
        warmth: 0.85      // Less body
      }
    };

    const filter = elementalFilters[request.element];
    if (!filter) return audioData;

    // Apply DSP processing (pseudo-code - needs actual DSP library)
    // This would use something like web-audio-api or tone.js
    return this.processDSP(audioData, filter);
  }

  private async processDSP(audioData: Buffer, filter: any): Promise<Buffer> {
    // Placeholder for actual DSP processing
    // Would integrate with a library like:
    // - sox-audio for server-side processing
    // - web-audio-api for real-time processing
    // - ffmpeg for format conversion + filters

    // For now, return unmodified
    return audioData;
  }

  private async generateWithOpenAI(request: VoiceGenerationRequest): Promise<any> {
    // Existing OpenAI implementation
    // ... current code ...

    return {
      audioData,
      provider: 'openai',
      // ... rest of response
    };
  }

  private async generateFallbackVoice(request: VoiceGenerationRequest): Promise<any> {
    // Ultimate fallback - basic OpenAI voice
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openAIKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: request.text,
        voice: 'nova',
        response_format: 'mp3',
        speed: 1.0
      })
    });

    const audioData = Buffer.from(await response.arrayBuffer());

    return {
      audioData,
      provider: 'fallback',
      metadata: { fallbackReason: 'All primary providers failed' }
    };
  }
}
```

### File: `.env.local`

```bash
# ElevenLabs Configuration
ELEVEN_LABS_API_KEY=your_elevenlabs_key_here
MAYA_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM     # Aunt Annie or your chosen voice
ANTHONY_ELEVENLABS_VOICE_ID=yoZ06aMxZJJ28mfd3POQ  # Onyx or your chosen voice

# OpenAI Configuration (fallback)
OPENAI_API_KEY=your_openai_key_here

# Voice Provider Priority
VOICE_PROVIDER_PRIORITY=elevenlabs,openai
VOICE_FALLBACK_ENABLED=true
```

---

## 🎭 Mask Modulation Architecture

### Concept
Voice masks are **DSP filters** applied to the base ElevenLabs audio, not separate voices:

```
Maya (ElevenLabs) → Fire Mask → Pitched up, faster, brighter
                 → Water Mask → Flowing, warm, gentle
                 → Earth Mask → Deep, grounded, slow
                 → Air Mask → Light, clear, lifted
```

### Benefits
- **Consistency**: Maya always sounds like Maya
- **Efficiency**: One ElevenLabs call + DSP is faster than multiple API calls
- **Flexibility**: DSP parameters can be adjusted in real-time
- **Cost**: Cheaper than multiple voice generations

---

## 🚀 Migration Path

### Phase 1: Direct Integration (Day 1)
- [ ] Add ElevenLabs client to SesameVoiceService
- [ ] Map Maya/Anthony to ElevenLabs voice IDs
- [ ] Test basic voice generation
- [ ] Verify fallback to OpenAI works

### Phase 2: Mask System (Day 2)
- [ ] Implement DSP processing function
- [ ] Create elemental filter presets
- [ ] Test mask modulation on base voices
- [ ] Fine-tune filter parameters

### Phase 3: Production (Day 3)
- [ ] Add streaming support for ElevenLabs
- [ ] Implement caching for common phrases
- [ ] Monitor provider health/fallback triggers
- [ ] Deploy with feature flags

---

## 🎯 Success Metrics

- **Voice Quality**: Maya/Anthony sound consistent and high-quality
- **Latency**: < 500ms first byte with streaming
- **Reliability**: 99.9% uptime with automatic fallback
- **Cost**: Reduced by 40% through caching + DSP masks

---

*"The voice is the soul's instrument. Let it sing through technology, not be replaced by it."*