# OpenAI Transcription Removal Summary

## Issue
The user clarified: **"we only use OpenAI for TTS! nothing else"**

The system was incorrectly using OpenAI Whisper API for speech-to-text transcription, which violates the architectural decision that OpenAI should ONLY be used for Text-to-Speech (TTS).

## Changes Made

### 1. `/app/api/voice/transcribe-simple/route.ts`
**Status:** ✅ DISABLED

- Removed all OpenAI Whisper transcription code
- Now returns HTTP 501 (Not Implemented) with clear error message
- Added documentation comments explaining alternatives

**Error Message:**
```
Server-side transcription is disabled. OpenAI is only used for TTS.
Please use Browser Web Speech API (ContinuousConversation) or configure
an alternative transcription service (Deepgram, local Whisper).
```

### 2. `/app/api/voice/transcribe/route.ts`
**Status:** ✅ DISABLED

- Voice journaling transcription endpoint
- Removed OpenAI Whisper usage
- Returns HTTP 501 with clear error message
- Preserved GET endpoint for retrieving existing transcripts

### 3. `/lib/voice/streamTranscribe.ts`
**Status:** ✅ UPDATED

- Changed `useWhisper` default to `false`
- Removed OpenAI API key initialization
- `transcribeWithWhisper()` now throws an error
- Only supports Deepgram (if `DEEPGRAM_API_KEY` is set)
- Added documentation comments

## Current Voice Input Architecture

### ❌ BROKEN: WhisperContinuousConversation
**Component:** `/components/voice/WhisperContinuousConversation.tsx`
**Used By:** `/components/OracleConversation.tsx` (line 9)

This component records audio and sends it to `/api/voice/transcribe-simple` endpoint, which is now disabled. **This will cause voice input to fail.**

### ✅ WORKING: ContinuousConversation (Browser Web Speech API)
**Component:** `/components/voice/ContinuousConversation.tsx`
**Status:** Currently commented out in OracleConversation.tsx

Uses browser's native Web Speech API (`window.webkitSpeechRecognition`):
- ✅ No API calls or server-side processing
- ✅ Free and fast (runs locally in browser)
- ✅ Good accuracy on Chrome/Safari
- ⚠️  May have reliability issues on iOS (reason for previous switch)

## Recommended Next Steps

### Option 1: Switch Back to Browser Web Speech API (RECOMMENDED)
**Pros:**
- Free (no API costs)
- Fast (no server round-trip)
- Already implemented and tested
- Aligns with "OpenAI only for TTS" architecture

**Cons:**
- May have iOS reliability issues (need to test and fix)
- Browser support varies

**Implementation:**
1. Update `/components/OracleConversation.tsx` line 9:
   ```typescript
   // FROM:
   import { WhisperContinuousConversation, WhisperContinuousConversationRef } from './voice/WhisperContinuousConversation';

   // TO:
   import { ContinuousConversation, ContinuousConversationRef } from './voice/ContinuousConversation';
   ```

2. Update line 344:
   ```typescript
   // FROM:
   const voiceMicRef = useRef<WhisperContinuousConversationRef>(null);

   // TO:
   const voiceMicRef = useRef<ContinuousConversationRef>(null);
   ```

3. Update line 3963:
   ```typescript
   // FROM:
   <WhisperContinuousConversation ...props />

   // TO:
   <ContinuousConversation ...props />
   ```

4. Test thoroughly on iOS devices
5. Fix any iOS-specific issues that arise

### Option 2: Implement Deepgram Transcription
**Pros:**
- Professional-grade accuracy
- Lower latency than OpenAI Whisper
- Better for production use
- Real-time streaming support

**Cons:**
- Requires `DEEPGRAM_API_KEY` environment variable
- Additional API cost
- More complex setup

**Implementation:**
1. Sign up for Deepgram account
2. Add `DEEPGRAM_API_KEY` to `.env.local`
3. Update `/app/api/voice/transcribe-simple/route.ts` to use Deepgram
4. Test with real audio

### Option 3: Run Local Whisper Model
**Pros:**
- No API costs
- Full privacy (no external API calls)
- High accuracy

**Cons:**
- Requires server-side setup
- Higher server resources (CPU/GPU)
- More complex deployment

## Files That Still Reference OpenAI Whisper

These files may need attention if they're actively used:

1. `/app/api/backend/api/whisper/transcribe.ts`
2. `/app/api/backend/src/services/VoiceJournalingService.ts`
3. `/app/api/backend/src/routes/voice/stream.routes.ts`
4. `/lib/voice/MaiaRealtimeWebRTC.ts`
5. `/lib/voice/MaiaRealtimeClientDirect.ts`

**Action:** Review these files to determine if they need updating based on their usage.

## Testing Checklist

- [ ] Voice input on Chrome/Safari desktop
- [ ] Voice input on iOS Safari
- [ ] Voice input on Android Chrome
- [ ] Verify OpenAI is ONLY used for TTS output
- [ ] Verify no OpenAI Whisper API calls in network tab
- [ ] Test conversation flow (user speaks → MAIA responds → user speaks again)
- [ ] Test voice feedback prevention (MAIA doesn't transcribe her own voice)

## Summary

All OpenAI Whisper transcription code has been disabled to align with the architectural principle: **"OpenAI is ONLY used for TTS, nothing else."**

The system now requires either:
1. Browser Web Speech API (free, already implemented)
2. Deepgram API (requires API key)
3. Local Whisper model (requires setup)

Recommend **Option 1** as the quickest path to restore voice functionality.
