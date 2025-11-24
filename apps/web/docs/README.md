# MAIA Voice & Discovery System - Complete Documentation

## Overview

This documentation package covers the complete implementation of MAIA's voice-first journaling system with progressive discovery, built with a mobile-first philosophy and human-centered design.

## Documentation Index

### Core Systems

1. **[Maya Voice System White Paper](./MAYA_VOICE_SYSTEM_WHITE_PAPER.md)**
   - Original architecture and design principles
   - Pause/resume commands and natural conversation flow
   - 1.5s silence detection and intelligent nudging
   - Privacy-first architecture

2. **[Sesame Hybrid Implementation](./SESAME_HYBRID_IMPLEMENTATION.md)**
   - 3-tier TTS fallback (Sesame → OpenAI → Web Speech)
   - 5 elemental voice profiles (Fire, Water, Earth, Air, Aether)
   - Voice cloning and caching strategies
   - Error handling and graceful degradation

3. **[Voice Journaling System](./VOICE_JOURNALING_SYSTEM.md)**
   - Session management and lifecycle
   - Real-time transcription and analysis
   - Symbol and archetype extraction
   - Integration with Soulprint database

4. **[Progressive Discovery System](./PROGRESSIVE_DISCOVERY_SYSTEM.md)** ⭐ NEW
   - "Reveal, Don't Overwhelm" principle
   - Milestone-based feature unlocking
   - Celebration animations and haptic feedback
   - Onboarding orchestration

5. **[AI Integration Guide](./AI_INTEGRATION.md)** 🧠 NEW
   - ClaudeBridge utility for journal analysis
   - Real Claude 3.5 Sonnet vs mock mode
   - Symbol/archetype extraction
   - Soulprint integration and memory system
   - **[Quick Summary](./AI_INTEGRATION_SUMMARY.md)** - What was built and how to use it

6. **[Analytics System](./ANALYTICS_SYSTEM.md)** 📊 NEW
   - Symbol frequency tracking and visualization
   - Archetype distribution analysis
   - Emotional pattern recognition
   - Transformation velocity metrics
   - Progressive unlock at 3 entries
   - Desktop and mobile dashboards

### Implementation Details

7. **[Complete System Summary](./COMPLETE_SYSTEM_SUMMARY.md)**
   - Full architecture overview
   - Component relationships
   - Data flow diagrams
   - API endpoints

## Quick Start

### For Users

**First-Time Experience:**
1. Visit `/journal` - Welcome modal appears
2. Click "🌀 Start Journaling" - Choose your mode
3. Write or speak your first entry
4. MAIA reflects back with symbols and insights
5. At 3 entries: Timeline unlocks 📊
6. At 5 entries: Semantic search unlocks 🔍

**Voice Journaling:**
1. Visit `/journal/voice` - Mobile-optimized interface
2. Select mode (Free, Dream, Emotional, Shadow, Direction)
3. Choose element (Fire, Water, Earth, Air, Aether)
4. Tap mic and speak naturally
5. Pause: "pause maya" or "give me a moment"
6. Resume: "okay maya" or "i'm ready"
7. Complete session - MAIA analyzes and reflects

### For Developers

**Installation:**
```bash
cd apps/web
npm install canvas-confetti  # For celebrations
```

**Basic Integration:**
```tsx
import SoulfulAppShell from '@/components/onboarding/SoulfulAppShell';
import FeatureDiscovery from '@/components/onboarding/FeatureDiscovery';
import { trackJournalEntry, trackVoiceUsage } from '@/components/onboarding/FeatureDiscovery';

export default function MyJournalApp() {
  return (
    <SoulfulAppShell userId="user-123">
      <FeatureDiscovery />

      {/* Your journal interface */}
      <JournalEditor onSave={() => trackJournalEntry()} />
    </SoulfulAppShell>
  );
}
```

**Voice Integration:**
```tsx
import { useMayaVoice } from '@/hooks/useMayaVoice';
import { trackVoiceUsage } from '@/components/onboarding/FeatureDiscovery';

const mayaVoice = useMayaVoice({
  userId: 'user-123',
  element: 'aether',
  enableNudges: false,
});

const handleStartRecording = async () => {
  await mayaVoice.start();
  trackVoiceUsage();  // Unlocks voice feature
};
```

## Key Components

### Onboarding & Discovery

| Component | Purpose | Location |
|-----------|---------|----------|
| `SoulfulAppShell` | Orchestrates onboarding flow | `/components/onboarding/SoulfulAppShell.tsx` |
| `FeatureDiscovery` | Celebrates milestone unlocks | `/components/onboarding/FeatureDiscovery.tsx` |
| `ContextualHelp` | On-demand help system | `/components/onboarding/ContextualHelp.tsx` |
| `DemoMode` | Pre-filled demo flows | `/components/onboarding/DemoMode.tsx` |
| `ProgressiveDiscovery` | Full-screen celebrations | `/components/discovery/ProgressiveDiscovery.tsx` |

### Voice System

| Component | Purpose | Location |
|-----------|---------|----------|
| `SesameVoiceService` | TTS with 3-tier fallback | `/lib/services/SesameVoiceService.ts` |
| `MayaHybridVoiceSystem` | Voice state machine | `/lib/voice/MayaHybridVoiceSystem.ts` |
| `useMayaVoice` | React hook for voice | `/hooks/useMayaVoice.ts` |
| `MayaVoiceIndicator` | Visual feedback | `/components/voice/MayaVoiceIndicator.tsx` |

### Voice Journaling

| Component | Purpose | Location |
|-----------|---------|----------|
| `VoiceJournalingService` | Session management | `/lib/journaling/VoiceJournalingService.ts` |
| `MobileVoiceJournal` | Mobile-first journal | `/components/voice/MobileVoiceJournal.tsx` |
| `MobileVoiceHistory` | Timeline with filters | `/components/voice/MobileVoiceHistory.tsx` |
| `MayaVoiceJournal` | Desktop voice journal | `/components/voice/MayaVoiceJournal.tsx` |
| `VoiceJournalHistory` | Desktop timeline | `/components/voice/VoiceJournalHistory.tsx` |

### Supporting Systems

| Component | Purpose | Location |
|-----------|---------|----------|
| `MaiaCopy` | Warm, human-centered copy | `/lib/copy/MaiaCopy.ts` |
| `JournalingPrompts` | Mode-specific prompts | `/lib/journaling/JournalingPrompts.ts` |
| `MaiaReflector` | Reflection display | `/components/journaling/MaiaReflector.tsx` |

## Design Principles

### 1. Reveal, Don't Overwhelm
Progressive feature unlocking based on natural usage patterns. New users see only what they need; power features emerge over time.

### 2. Mobile-First, Always
- Minimum 48px tap targets
- One-handed thumb-friendly layouts
- Haptic feedback on all interactions
- Bottom sheets for modals
- Safe area insets for notched phones

### 3. Warm & Human-Centered
- Conversational, encouraging copy
- No clinical or technical jargon
- Celebrates every milestone
- Respects user sovereignty ("maybe later" always available)

### 4. Privacy & Data Sovereignty
- LocalStorage backup before API calls
- Export to Obsidian markdown
- No tracking without consent
- User data always portable

### 5. Accessible & Inclusive
- Works without JavaScript (progressive enhancement)
- Screen reader friendly
- Keyboard navigation
- Respects prefers-reduced-motion

## Milestones & Feature Unlocks

| Entries | Milestone | Features Unlocked | Celebration |
|---------|-----------|-------------------|-------------|
| 1 | First Entry | Symbolic tracking begins | ✨ Gentle welcome |
| 3 | Timeline | Timeline view, filters, patterns | 📊 Confetti + haptic |
| 5 | Search | Semantic search, advanced queries | 🔍 Confetti + haptic |
| 10 | Power User | All features, full customization | 🎉 Big celebration |
| Voice | Voice Unlock | Voice journaling mode | 🎙️ Confetti + haptic |
| Shadow | Shadow Work | Depth exploration mode | 🌓 Gentle recognition |

## Mobile Optimizations

### Haptic Feedback Patterns

```typescript
// Button tap
navigator.vibrate(50);

// Feature unlock
navigator.vibrate([100, 50, 100, 50, 200]);

// Session complete
navigator.vibrate([200, 100, 200]);

// Error
navigator.vibrate([100, 50, 100]);
```

### Touch Targets

- Primary actions: **64px × 64px** (thumbs)
- Secondary actions: **48px × 48px** (fingers)
- Tertiary actions: **40px × 40px** (precise taps)

### Swipe Gestures

- **Swipe up**: Dismiss bottom sheets
- **Swipe down**: Pull to refresh (planned)
- **Swipe left/right**: Navigate timeline (planned)

## API Endpoints

### Journal Analysis

```http
POST /api/journal/analyze
Content-Type: application/json

{
  "entry": "string",
  "mode": "free" | "dream" | "emotional" | "shadow" | "direction",
  "userId": "string"
}

Response: {
  "success": boolean,
  "reflection": {
    "symbols": string[],
    "archetypes": string[],
    "emotionalTone": string,
    "reflection": string,
    "prompt": string,
    "closing": string,
    "transformationScore": number
  }
}
```

### Journal Export

```http
POST /api/journal/export
Content-Type: application/json

{
  "entry": "string",
  "mode": "string",
  "reflection": object,
  "userId": "string",
  "element": "string"
}

Response: {
  "success": boolean,
  "filePath": string
}
```

### Voice TTS (Sesame)

```http
POST /api/voice/generate
Content-Type: application/json

{
  "text": "string",
  "voiceId": "maya-default" | "maya-fire" | "maya-water" | "maya-earth" | "maya-air",
  "format": "mp3" | "wav"
}

Response: {
  "success": boolean,
  "audioUrl": string,
  "duration": number
}
```

## Testing

### Enable Demo Mode

```bash
# Via URL
http://localhost:3000/journal?demo=true

# Via localStorage
localStorage.setItem('demo_mode', 'true');
```

### Reset Progress

```javascript
// Clear all onboarding state
localStorage.removeItem('onboarding_complete_user-123');
localStorage.removeItem('journal_entry_count');
localStorage.removeItem('unlocked_features');
localStorage.removeItem('dismissed_features');
localStorage.removeItem('voice_used');
localStorage.removeItem('shadow_work_unlocked');

// Reload
window.location.reload();
```

### Simulate Milestones

```javascript
// Timeline unlock (3 entries)
localStorage.setItem('journal_entry_count', '3');

// Search unlock (5 entries)
localStorage.setItem('journal_entry_count', '5');

// Voice unlock
localStorage.setItem('voice_used', 'true');

// Shadow work unlock
localStorage.setItem('shadow_work_unlocked', 'true');

// Reload to trigger celebrations
window.location.reload();
```

## Troubleshooting

### Common Issues

**Confetti not showing**
- Check `canvas-confetti` is installed
- Ensure no CSP blocking canvas elements
- Verify JavaScript is enabled

**Haptic not working**
- Device must support Vibration API
- HTTPS required (not localhost)
- User may have disabled vibration in settings

**Voice not speaking**
- Check browser supports Web Speech API
- Verify microphone permissions granted
- Try with headphones (audio routing)
- Check Sesame API key is set

**Milestones not triggering**
- Verify `trackJournalEntry()` is called
- Check localStorage is available
- Look for JavaScript errors in console
- Try resetting progress

### Debug Mode

Enable verbose logging:

```javascript
// In browser console
localStorage.setItem('debug_discovery', 'true');
localStorage.setItem('debug_voice', 'true');

// Reload
window.location.reload();
```

## Performance

### Optimizations

- **Voice caching**: Audio cached in IndexedDB
- **Lazy loading**: Components load on-demand
- **Debouncing**: Transcript updates debounced 300ms
- **LocalStorage first**: Saves locally before API
- **Code splitting**: Route-based splitting

### Metrics

- **First Paint**: < 1s
- **Time to Interactive**: < 2s
- **Voice Latency**: < 500ms (cached), < 2s (uncached)
- **Transcription Delay**: < 300ms
- **Analysis Time**: 2-4s (GPT-4)

## Deployment

### Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional
SESAME_API_KEY=sesame_...  # For voice cloning
RESEND_API_KEY=re_...      # For email notifications
NEXT_PUBLIC_MOCK_SUPABASE=false  # Set true for local dev
```

### Build

```bash
cd apps/web
npm run build
npm run start
```

### Vercel Deployment

```bash
vercel --prod
```

## Roadmap

### Phase 1: Foundation ✅ COMPLETE
- [x] Sesame Hybrid TTS with 3-tier fallback
- [x] Maya voice system with pause/resume
- [x] Voice journaling with session management
- [x] Timeline with advanced filtering
- [x] Mobile-first interfaces
- [x] Progressive discovery system
- [x] Celebration animations

### Phase 2: Enhancement 🚧 IN PROGRESS
- [ ] Semantic search implementation
- [ ] Obsidian export automation
- [ ] Weekly/monthly progress reports
- [ ] Custom celebration messages
- [ ] Achievement badges

### Phase 3: Growth 📋 PLANNED
- [ ] Multi-language support (i18n)
- [ ] Voice profile customization
- [ ] Social sharing (opt-in)
- [ ] Mobile native apps (iOS/Android)
- [ ] Offline mode with sync

## Contributing

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Component documentation
- Unit tests for critical paths

### Pull Request Guidelines

1. Feature branch from `main`
2. Clear PR description with context
3. Screenshots for UI changes
4. Tests pass locally
5. No console errors or warnings

## Support

### Documentation
- Read the docs: `/docs/`
- API reference: `/docs/COMPLETE_SYSTEM_SUMMARY.md`
- Troubleshooting: This README

### Contact
- Email: support@spiralogic.com
- GitHub Issues: [Report bug](https://github.com/your-org/repo/issues)

## License

Proprietary - Spiralogic Systems
© 2025 All rights reserved

---

## Summary

This system provides:

✨ **Progressive Discovery** - Features reveal naturally as users engage
🎙️ **Voice-First Journaling** - Speak your reflections with 5 elemental profiles
📱 **Mobile-Optimized** - Large tap targets, haptic feedback, bottom sheets
🎉 **Celebrations** - Confetti and recognition for every milestone
🔍 **Smart Filtering** - Search by symbols, archetypes, emotions, and more
💾 **Data Sovereignty** - Export to Obsidian, your data is always yours
🤗 **Warm & Human** - Encouraging copy, never clinical or robotic

**Start your journey:**
```bash
npm install
npm run dev
# Visit http://localhost:3000/journal
```

Happy journaling! 🌀