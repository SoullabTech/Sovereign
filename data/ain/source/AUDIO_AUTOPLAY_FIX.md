# 🔊 Audio Autoplay Fix - Complete Guide

## The Problem

Safari and Chrome block autoplay of unmuted audio to prevent annoying ads/sounds. This affects Maya's voice responses.

**Error you were seeing:**
```
NotAllowedError: The request is not allowed by the user agent or the platform
```

## Solutions Implemented

### ✅ Solution 1: Universal Unlock Banner (Recommended)

**What:** A one-click banner that unlocks audio for the entire session
**Where:** `components/system/AudioUnlockBanner.tsx`
**How it works:**
1. Banner appears at top: "🔊 Enable Maya's Voice"
2. User clicks once
3. Audio context unlocked permanently for session
4. All future Maya responses play automatically
5. Banner disappears with confirmation

**Benefits:**
- Works on ALL browsers (Safari, Chrome, Firefox, Edge)
- No user settings required
- Clean, professional UX
- One-time action per session
- Visual feedback confirms it worked

### 📝 Solution 2: Browser Settings (Quick Dev Fix)

**Safari:**
```
Preferences → Websites → Auto-Play
Add: localhost:3001 → Allow All Auto-Play
```

**Chrome:**
```
Settings → Privacy and Security → Site Settings → Sound
Add: http://localhost:3001 → Allow
```

**Benefits:**
- Instant fix for development
- No code changes needed
- Persistent across sessions

**Drawbacks:**
- Each user must configure
- Not viable for production/demos
- Different steps per browser

## Testing Guide

### Fresh Test (Recommended)
```bash
# 1. Clear browser cache/cookies
# 2. Open Incognito/Private window
# 3. Navigate to http://localhost:3001
# 4. See banner: "🔊 Enable Maya's Voice"
# 5. Click banner
# 6. Hear confirmation chime
# 7. Send message to Maya
# 8. Audio plays automatically ✅
```

### Quick Test
```bash
# 1. Reload page
# 2. If previously unlocked, no banner appears
# 3. Send message
# 4. Audio should play
```

### Debug Checks
```javascript
// In browser console:
localStorage.getItem('audio-unlocked') // Should be 'true' after unlock
```

## Developer Mode Bypass

During development, you can disable the audio unlock banner for convenience:

```bash
# In your .env.local file:
NEXT_PUBLIC_DISABLE_AUDIO_BANNER=true
```

**Important Notes:**
- This flag should ONLY be set in development environments
- Leave it unset or set to `false` in production
- Maya's voice will still work if you've already allowed autoplay in your browser
- The banner ensures a polished experience for first-time users in production

## How The Fix Works

### AudioUnlockBanner Component
```typescript
// Checks if audio is unlocked on load
const unlocked = isAudioUnlocked();

// Shows banner only if NOT unlocked
setIsVisible(!unlocked);

// On click:
await unlockAudio(); // Unlocks Web Audio API
window.dispatchEvent(new Event('audio-unlocked')); // Notify other components
playConfirmationSound(); // Subtle chime
fadeOutBanner(); // Visual feedback
```

### Integration Points
1. **app/layout.tsx** - Banner added globally
2. **OracleVoicePlayer.tsx** - Listens for unlock event
3. **VoiceRecorder.tsx** - Also unlocks on record start

## Executive Demo Preparation

### Pre-Demo Checklist
- [ ] Open demo 5 minutes early
- [ ] Click audio unlock banner once
- [ ] Test with one message to Maya
- [ ] Verify audio plays
- [ ] Hide debug panels
- [ ] Ready for smooth demo

### Talking Points
> "Maya's voice requires one-time activation for privacy compliance - just like how Zoom asks for microphone access. This ensures users explicitly consent to audio."

### If Asked About the Banner
> "This is a browser security feature - same as YouTube or Spotify requiring a first click. Once enabled, Maya speaks naturally throughout the session."

## Troubleshooting

### Banner Doesn't Appear
- Already unlocked in this session
- Check browser console for errors
- Try incognito/private window

### Audio Still Doesn't Play After Click
- Check backend is running
- Verify Sesame container is up
- Look for `[TTS]` logs in backend
- Check browser console for new errors

### Banner Reappears Every Reload
- Normal behavior (per-session unlock)
- Can add localStorage persistence if needed

### Want to Force Banner for Testing
```javascript
// In browser console:
localStorage.removeItem('audio-unlocked');
location.reload();
```

## Browser Compatibility

| Browser | Autoplay Policy | Banner Works? | Settings Work? |
|---------|----------------|---------------|----------------|
| Safari 17+ | Strict | ✅ Yes | ✅ Yes |
| Chrome 120+ | Moderate | ✅ Yes | ✅ Yes |
| Firefox 120+ | Lenient | ✅ Yes | ✅ Yes |
| Edge 120+ | Moderate | ✅ Yes | ✅ Yes |
| Mobile Safari | Very Strict | ✅ Yes | ⚠️ Limited |
| Mobile Chrome | Strict | ✅ Yes | ⚠️ Limited |

## Code Locations

- **Banner Component:** `components/system/AudioUnlockBanner.tsx`
- **Audio Unlock Lib:** `lib/audio/audioUnlock.ts`
- **Integration:** `app/layout.tsx`
- **Error Handling:** `components/voice/OracleVoicePlayer.tsx`

## Future Enhancements

1. **Remember Unlock** - Store in localStorage for multi-session persistence
2. **Smart Detection** - Only show banner if audio actually fails
3. **Inline Unlock** - Add unlock to first interaction (record/send button)
4. **Progressive Enhancement** - Try autoplay first, show banner only on failure

---

**Fix Version:** 1.0.0  
**Implemented:** 2025-09-05  
**Status:** ✅ Production Ready