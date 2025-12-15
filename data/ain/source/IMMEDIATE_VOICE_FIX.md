# Immediate Voice Integration Fix

## Problem Statement
Voice chat is not functional. The SimplifiedOrganicVoice component exists but isn't connected to Maya's consciousness system.

## Current Architecture Gaps

```
Current (Broken):
User speaks → SimplifiedOrganicVoice → ❌ Nothing happens

Required:
User speaks → SimplifiedOrganicVoice → API Route → MayaOrchestrator
→ OpenAI TTS → Audio playback → User hears Maya
```

## Step-by-Step Fix

### Step 1: Create Maya Voice API Route
Create `/api/maya-voice/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { MayaOrchestrator } from '@/lib/oracle/MayaOrchestrator';

const orchestrator = new MayaOrchestrator();

export async function POST(request: NextRequest) {
  try {
    const { transcript, userId = 'voice-user' } = await request.json();

    // Process through Maya
    const response = await orchestrator.speak(transcript, userId);

    // Return response for TTS
    return NextResponse.json({
      message: response.message,
      element: response.element,
      voiceConfig: {
        voice: 'alloy',
        speed: response.element === 'fire' ? 1.1 : 1.0,
        ...response.voiceCharacteristics
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process' },
      { status: 500 }
    );
  }
}
```

### Step 2: Create TTS Integration
Create `/lib/voice/maya-voice-handler.ts`:

```typescript
export class MayaVoiceHandler {
  private audioQueue: HTMLAudioElement[] = [];
  private isPlaying = false;

  async speakResponse(text: string, voiceConfig: any) {
    try {
      // Call OpenAI TTS
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: voiceConfig.voice || 'alloy',
          speed: voiceConfig.speed || 1.0
        })
      });

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play audio
      const audio = new Audio(audioUrl);
      await this.playAudio(audio);

      return audio;
    } catch (error) {
      console.error('TTS failed:', error);
      throw error;
    }
  }

  private async playAudio(audio: HTMLAudioElement) {
    this.audioQueue.push(audio);

    if (!this.isPlaying) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audio = this.audioQueue.shift()!;

    audio.play();
    audio.onended = () => {
      URL.revokeObjectURL(audio.src);
      this.processQueue();
    };
  }

  stopAll() {
    this.audioQueue.forEach(audio => {
      audio.pause();
      URL.revokeObjectURL(audio.src);
    });
    this.audioQueue = [];
    this.isPlaying = false;
  }
}
```

### Step 3: Create TTS API Route
Create `/api/tts/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'alloy', speed = 1.0 } = await request.json();

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice as any,
      input: text,
      speed: speed
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'TTS generation failed' },
      { status: 500 }
    );
  }
}
```

### Step 4: Update SimplifiedOrganicVoice Component
Update the component to integrate with Maya:

```typescript
// In SimplifiedOrganicVoice.tsx, add:

import { MayaVoiceHandler } from '@/lib/voice/maya-voice-handler';

// Inside component:
const voiceHandler = useRef(new MayaVoiceHandler());
const [isMayaSpeaking, setIsMayaSpeaking] = useState(false);

const processSpeech = useCallback(async (transcript: string) => {
  try {
    setIsProcessing(true);
    setIsMayaSpeaking(true);

    // Send to Maya
    const response = await fetch('/api/maya-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript })
    });

    const data = await response.json();

    // Speak Maya's response
    await voiceHandler.current.speakResponse(
      data.message,
      data.voiceConfig
    );

  } catch (error) {
    console.error('Processing failed:', error);
  } finally {
    setIsProcessing(false);
    setIsMayaSpeaking(false);
  }
}, []);

// Update the speech recognition handler:
recognitionRef.current.onresult = (event: any) => {
  const current = event.resultIndex;
  const transcript = event.results[current][0].transcript;

  if (event.results[current].isFinal) {
    processSpeech(transcript);
  }
};
```

### Step 5: Create Unified Maya Page
Create `/app/maya/page.tsx`:

```typescript
'use client';

import { SimplifiedOrganicVoice } from '@/components/ui/SimplifiedOrganicVoice';
import { useState } from 'react';

export default function MayaPage() {
  const [conversation, setConversation] = useState<Array<{
    speaker: 'user' | 'maya';
    text: string;
  }>>([]);

  const handleTranscript = (text: string) => {
    setConversation(prev => [...prev, { speaker: 'user', text }]);
  };

  const handleMayaResponse = (text: string) => {
    setConversation(prev => [...prev, { speaker: 'maya', text }]);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full p-8">
        <h1 className="text-4xl font-light text-white mb-8 text-center">
          Maya
        </h1>

        <SimplifiedOrganicVoice
          onTranscript={handleTranscript}
          enabled={true}
        />

        {/* Conversation history */}
        <div className="mt-8 space-y-4 max-h-96 overflow-y-auto">
          {conversation.map((msg, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg ${
                msg.speaker === 'user'
                  ? 'bg-blue-900/20 text-blue-200'
                  : 'bg-purple-900/20 text-purple-200'
              }`}
            >
              <span className="text-xs opacity-60">
                {msg.speaker === 'user' ? 'You' : 'Maya'}
              </span>
              <p className="mt-1">{msg.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Testing Steps

1. **Test Voice Recognition**:
   ```bash
   # Open browser console
   # Navigate to /maya
   # Click mic, say "Hello Maya"
   # Check console for transcript
   ```

2. **Test Maya Processing**:
   ```bash
   # Check network tab for /api/maya-voice call
   # Verify response contains message and voiceConfig
   ```

3. **Test TTS Playback**:
   ```bash
   # Check network tab for /api/tts call
   # Verify audio plays
   # Check no errors in console
   ```

## Common Issues & Fixes

### Issue: Mic permission denied
**Fix**: Check HTTPS, grant permission in browser settings

### Issue: No audio playback
**Fix**: Check OpenAI API key, verify audio context not blocked

### Issue: Recognition not working
**Fix**: Check for webkitSpeechRecognition fallback

### Issue: Maya not responding
**Fix**: Check MayaOrchestrator import, verify API route

## Environment Variables Required

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Quick Test Commands

```bash
# Test Maya Orchestrator directly
npm run test:maya

# Test voice pipeline
npm run dev
# Open http://localhost:3000/maya
# Say "Hey Maya, how are you?"

# Test TTS directly
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, I am Maya", "voice": "alloy"}' \
  --output test.mp3
```

## Success Criteria

✅ User can speak to Maya
✅ Maya processes input through consciousness system
✅ Maya responds with voice
✅ Conversation flows naturally
✅ No crashes during 5-minute conversation

---

**Priority**: 🔴 CRITICAL - Must fix before any beta testing
**Estimated Time**: 4-6 hours of focused development
**Dependencies**: OpenAI API key, existing MayaOrchestrator