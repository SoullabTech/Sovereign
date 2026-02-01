# iOS Safari PWA Voice/TTS Fix

**Date:** 2026-01-31
**Status:** RESOLVED - Golden Build
**Commit:** `3d0b1f93`

---

## Problem

MAIA's TTS (Text-to-Speech) was not playing audio on iPhone Safari PWA (Add to Home Screen), even though:
- Server was generating audio successfully (OpenAI TTS)
- Audio chunks were being sent via SSE stream
- Text responses were displaying correctly

### Symptoms
- Voice worked briefly, then stopped
- Voice worked in Safari browser but not PWA
- "Audio enabled" toast appeared but no audio played
- ReferenceError crashes in minified code

---

## Root Causes

### 1. iOS Safari Audio Autoplay Policy
iOS Safari (especially PWA mode) requires:
- Audio elements must be created during a user gesture
- The **same** Audio element must be reused (can't create new ones per chunk)
- AudioContext must be explicitly resumed from user interaction

### 2. Audio Element Being Destroyed
The `useStreamingVoice` hook was nulling out `currentAudioRef.current` in multiple places:
- `advance()` function after each chunk
- `sendMessage()` when starting new message
- `stop()` when stopping playback
- `forceRecoverFromFalseSpeaking()` on errors

This destroyed the "unlocked" state each time.

### 3. Minifier Hoisting Bug
The `pwaVoice` stub object was defined at line 1882, but referenced in callbacks defined earlier. The minifier hoisted the reference before the definition, causing:
```
ReferenceError: Cannot access 're' before initialization
```

---

## Solution

### Fix 1: Global Audio Unlock in Layout (layout.tsx)

```javascript
// In <head> script - runs on first tap anywhere
window.__maiaAudioUnlocked = false;
window.__maiaGlobalAudio = null;
window.__maiaAudioContext = null;

function unlockAudio() {
  // METHOD 1: Audio element - store IMMEDIATELY (not after promise)
  var audio = new Audio();
  audio.setAttribute('playsinline', '');
  audio.setAttribute('webkit-playsinline', '');
  audio.playsInline = true;
  audio.src = 'data:audio/mp3;base64,...'; // tiny silent MP3

  var playPromise = audio.play();
  window.__maiaGlobalAudio = audio; // Store BEFORE promise resolves

  // METHOD 2: AudioContext unlock
  var ctx = new (window.AudioContext || window.webkitAudioContext)();
  window.__maiaAudioContext = ctx;
  ctx.resume();
  // Silent oscillator to fully unlock
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  gain.gain.value = 0.001;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(0);
  osc.stop(ctx.currentTime + 0.1);
}

// touchend is most reliable for PWA
document.addEventListener('touchend', unlockAudio, true);
document.addEventListener('click', unlockAudio, true);
```

### Fix 2: Reuse Single Audio Element (useStreamingVoice.ts)

```typescript
// In playNextChunk():
let audio = currentAudioRef.current;
if (!audio) {
  // Try global unlocked element first
  if (window.__maiaGlobalAudio) {
    audio = window.__maiaGlobalAudio;
  } else {
    audio = new Audio();
    audio.setAttribute('playsinline', '');
    audio.setAttribute('webkit-playsinline', '');
  }
  currentAudioRef.current = audio;
}

// Update source (reuse element)
audio.src = audioSrc;
```

### Fix 3: Never Null Out Audio Element

```typescript
// WRONG - breaks iOS
const advance = () => {
  currentAudioRef.current = null; // ❌ Destroys unlock state
};

// CORRECT - preserve unlock
const advance = () => {
  // Don't null out - keep for reuse
  isPlayingRef.current = false;
};

// When clearing, only clear source
if (currentAudioRef.current) {
  currentAudioRef.current.pause();
  currentAudioRef.current.src = ''; // Clear source
  // currentAudioRef.current = null; // ❌ NEVER DO THIS
}
```

### Fix 4: Move pwaVoice Stub Earlier (OracleConversation.tsx)

```typescript
// Define stub IMMEDIATELY after the flag it depends on
const [isPwaVoice] = useState(false);

// 🎤 PWA VOICE STUB - must be here to prevent minifier hoisting issues
const pwaVoice = {
  state: 'IDLE' as const,
  isListening: false,
  // ... all stub methods
};

// Now hooks can safely reference pwaVoice
```

---

## Files Modified

| File | Changes |
|------|---------|
| `app/layout.tsx` | Global audio unlock script in `<head>` |
| `hooks/useStreamingVoice.ts` | Reuse audio element, never null it out |
| `components/OracleConversation.tsx` | Move pwaVoice stub before any references |

---

## Key Learnings

1. **iOS Safari PWA has stricter audio policies than Safari browser**
   - User gesture context is lost faster
   - Must unlock both Audio elements AND AudioContext

2. **Audio element identity matters**
   - The specific Audio instance that received `play()` during user gesture is "unlocked"
   - Creating a new Audio() loses that unlock

3. **Minification can reorder code**
   - Variable references can be hoisted before definitions
   - Always define objects before any callbacks that reference them

4. **Store state before async operations**
   - `audio.play()` returns a Promise
   - By the time it resolves, user gesture context may be lost
   - Store the element immediately, not in `.then()`

---

## Testing Checklist

- [ ] Fresh PWA install (delete and re-add to Home Screen)
- [ ] Clear Safari data (Settings → Safari → Clear History and Website Data)
- [ ] First tap shows "🔊 Audio enabled" toast
- [ ] Console shows "✅ [GLOBAL] Audio element unlocked!"
- [ ] Voice plays on first MAIA response
- [ ] Voice continues working across multiple exchanges
- [ ] Voice works after interrupting MAIA (tap while speaking)
- [ ] Voice works after silence/pause

---

## Related Issues

- PWA State Machine: Temporarily disabled (`isPwaVoice = false`) to isolate this issue
- iOS Native App: Separate signin JSON parse error (unrelated)

---

## Tags

#maia #ios #safari #pwa #tts #audio #voice #fix #golden-build
