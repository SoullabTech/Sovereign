# Progressive Discovery System

## Overview

The Progressive Discovery System implements the "Reveal, Don't Overwhelm" principle, guiding users through MAIA's features gradually as they engage with the platform. This creates a welcoming, non-intimidating onboarding experience while celebrating user milestones.

## Core Principle

**"Reveal, Don't Overwhelm"**

Rather than presenting all features at once, the system:
- Reveals features as users naturally progress
- Celebrates milestones with gentle animations
- Provides contextual help at the right moments
- Creates a sense of accomplishment and discovery

## Architecture

### Components

#### 1. `SoulfulAppShell` (`/components/onboarding/SoulfulAppShell.tsx`)

**Purpose**: High-level orchestration component that manages the step-by-step user journey.

**Onboarding Steps**:
```typescript
type OnboardingStep =
  | 'welcome'           // Initial welcome screen
  | 'first-entry'       // Awaiting first journal entry
  | 'active'            // 1-2 entries completed
  | 'timeline-unlocked' // 3+ entries, timeline available
  | 'search-unlocked'   // 5+ entries, search available
```

**Key Features**:
- Welcome modal with warm, inviting copy
- Step tracking based on user progress
- LocalStorage persistence per user
- Wraps entire journaling experience

**Usage**:
```tsx
<SoulfulAppShell userId="user-123">
  <YourJournalingComponent />
</SoulfulAppShell>
```

**Hooks**:
```typescript
// Get current onboarding step
const step = useOnboardingStep(userId);

// Check if feature should be shown
const showTimeline = shouldShowFeature('timeline', userId);
const showSearch = shouldShowFeature('search', userId);
const showVoice = shouldShowFeature('voice', userId);
```

#### 2. `FeatureDiscovery` (`/components/onboarding/FeatureDiscovery.tsx`)

**Purpose**: Displays celebratory notifications when users unlock new features.

**Enhanced with**:
- 🎉 Confetti animations (canvas-confetti)
- 📳 Haptic feedback on mobile
- ⏱️ Auto-dismiss after 10 seconds
- 🎨 Gradient progress bar
- 🔘 Action buttons for immediate feature access

**Feature Unlocks**:

| Milestone | Condition | Feature | CTA |
|-----------|-----------|---------|-----|
| First Entry | 1 entry | Symbolic tracking begins | None |
| Timeline | 3 entries | Timeline view with filters | View Timeline |
| Voice Journaling | Voice used | Voice transcription & analysis | Try Voice Mode |
| Semantic Search | 5 entries | Natural language search | Try Search |
| Shadow Work | Shadow mode used | Depth mode unlocked | None |

**Tracking Functions**:
```typescript
import { trackJournalEntry, trackVoiceUsage, trackShadowWork } from '@/components/onboarding/FeatureDiscovery';

// Call after saving journal entry
trackJournalEntry();

// Call when voice journaling is first used
trackVoiceUsage();

// Call when shadow work mode is used
trackShadowWork();
```

**LocalStorage Keys**:
- `journal_entry_count` - Number of completed entries
- `voice_used` - Boolean flag for voice usage
- `shadow_work_unlocked` - Boolean flag for shadow work
- `unlocked_features` - Array of feature IDs unlocked
- `dismissed_features` - Array of dismissed notifications

#### 3. `ContextualHelp` (`/components/onboarding/ContextualHelp.tsx`)

**Purpose**: Provides on-demand help accessed via floating button (bottom-left).

**Help Topics**:
1. What is Sacred Journaling?
2. The 5 Journaling Modes
3. Understanding Symbols & Archetypes
4. Using Voice Journaling
5. Timeline & Patterns
6. Semantic Search
7. Export to Obsidian

**Features**:
- Modal interface with topic selection
- Detailed explanations with warm, human-centered copy
- Back navigation between topics
- Support contact link

#### 4. `DemoMode` (`/components/onboarding/DemoMode.tsx`)

**Purpose**: Provides pre-filled demo flows for testing and showcasing features.

**Activation**:
- URL parameter: `?demo=true`
- Or localStorage: `demo_mode=true`

**Demo Flows**:
- Shadow Work Example
- Dream Integration
- Emotional Processing
- Free Expression
- Life Direction

Each demo includes:
- Pre-written entry
- Expected reflection with symbols/archetypes
- Realistic emotional tone
- Full MAIA response

#### 5. `ProgressiveDiscovery` (`/components/discovery/ProgressiveDiscovery.tsx`)

**Purpose**: Alternative full-screen celebration component with more dramatic animations.

**Features**:
- Full-screen modal backdrop
- Larger confetti animation
- Feature unlock cards with descriptions
- Milestone-specific icons and messages
- Event-driven architecture

**Event System**:
```typescript
// Trigger milestone check
window.dispatchEvent(new Event('journal:created'));
window.dispatchEvent(new Event('voice:used'));
```

**Hook**:
```typescript
const timelineUnlocked = useFeatureUnlock(userId, 'timeline');
const searchUnlocked = useFeatureUnlock(userId, 'search');
```

## Implementation Guide

### Step 1: Wrap Your App

```tsx
import SoulfulAppShell from '@/components/onboarding/SoulfulAppShell';

export default function JournalingPortal() {
  return (
    <SoulfulAppShell userId="user-123">
      <FeatureDiscovery />
      <ContextualHelp />
      <DemoMode />

      {/* Your journaling interface */}
    </SoulfulAppShell>
  );
}
```

### Step 2: Track User Actions

```tsx
import { trackJournalEntry, trackVoiceUsage } from '@/components/onboarding/FeatureDiscovery';

const handleJournalSave = async () => {
  await saveJournalEntry(entry);

  // Track progress
  trackJournalEntry();

  if (mode === 'shadow') {
    trackShadowWork();
  }
};

const handleVoiceStart = async () => {
  await startVoiceRecording();

  // Track voice usage
  trackVoiceUsage();
};
```

### Step 3: Conditionally Show Features

```tsx
import { shouldShowFeature } from '@/components/onboarding/SoulfulAppShell';

export default function Navigation({ userId }: { userId: string }) {
  const showTimeline = shouldShowFeature('timeline', userId);
  const showSearch = shouldShowFeature('search', userId);

  return (
    <nav>
      <Link href="/journal">Journal</Link>

      {showTimeline && (
        <Link href="/journal/timeline">Timeline</Link>
      )}

      {showSearch && (
        <Link href="/journal/search">Search</Link>
      )}
    </nav>
  );
}
```

### Step 4: Monitor Progress

```tsx
import { useOnboardingStep } from '@/components/onboarding/SoulfulAppShell';

export default function Dashboard({ userId }: { userId: string }) {
  const step = useOnboardingStep(userId);

  return (
    <div>
      {step === 'welcome' && <WelcomePrompt />}
      {step === 'first-entry' && <FirstEntryPrompt />}
      {step === 'active' && <KeepGoingPrompt />}
      {step === 'timeline-unlocked' && <ExploreTimelinePrompt />}
      {step === 'search-unlocked' && <PowerUserPrompt />}
    </div>
  );
}
```

## Mobile Integration

The Progressive Discovery System is fully integrated with mobile-first components:

### `MobileVoiceJournal`
- Wrapped in `SoulfulAppShell`
- Tracks voice usage on recording start
- Tracks journal entries on session completion
- Shows welcome modal on first visit
- Haptic feedback on all interactions

### `MobileVoiceHistory`
- Conditionally shows filters based on entry count
- Timeline available after 3+ entries
- Search available after 5+ entries

## Copy System

All user-facing text comes from the centralized `Copy` object in `/lib/copy/MaiaCopy.ts`:

```typescript
import { Copy } from '@/lib/copy/MaiaCopy';

// Welcome screen
Copy.welcome // "Welcome to Soulful Journaling"
Copy.introPrompt // "What's been on your mind lately?"

// Buttons
Copy.buttons.startJournaling // "🌀 Start Journaling"
Copy.buttons.maybeLater // "Maybe later"

// Milestones
Copy.milestones.firstEntry // "🌀 You've started your journey."
Copy.milestones.threeEntries // "📊 Timeline view unlocked."
```

This ensures:
- Consistent warm, human-centered language
- Easy localization in future
- Single source of truth for all copy

## Celebration Animations

### Confetti

Uses `canvas-confetti` library with custom colors:

```typescript
const colors = ['#FFD700', '#FFA500', '#FF8C00', '#FFB800'];

confetti({
  particleCount: 3,
  angle: 60,
  spread: 55,
  origin: { x: 0 },
  colors,
});
```

Fires from both sides (left and right) for 2 seconds.

### Haptic Feedback

Mobile haptic patterns:

```typescript
// Feature unlock
navigator.vibrate([100, 50, 100, 50, 200]);

// Button tap
navigator.vibrate(50);

// Success
navigator.vibrate([200, 100, 200]);

// Error
navigator.vibrate([100, 50, 100]);
```

## Milestones & Thresholds

| Entry Count | Milestone | Features Unlocked |
|------------|-----------|-------------------|
| 0 | Welcome | Show onboarding modal |
| 1 | First Entry | Symbolic tracking begins |
| 3 | Timeline Unlocked | Timeline view, filters, patterns |
| 5 | Search Unlocked | Semantic search, advanced queries |
| 10 | Power User | Full feature set |

Voice usage unlocks voice journaling mode immediately, regardless of entry count.

## Data Persistence

All progress is stored in localStorage:

```typescript
// Per-user keys
`onboarding_complete_${userId}` // Boolean
`maia_progress_${userId}` // JSON object

// Global keys
journal_entry_count // Number
voice_used // Boolean
shadow_work_unlocked // Boolean
unlocked_features // Array<string>
dismissed_features // Array<string>
```

## Testing

### Enable Demo Mode

```typescript
import { enableDemoMode } from '@/components/onboarding/DemoMode';

// Enable demo flows
enableDemoMode();

// Or via URL
window.location.href = '/journal?demo=true';
```

### Reset Progress

```typescript
// Clear all progress
localStorage.removeItem('onboarding_complete_user-123');
localStorage.removeItem('journal_entry_count');
localStorage.removeItem('unlocked_features');
localStorage.removeItem('dismissed_features');
localStorage.removeItem('voice_used');

// Reload to see welcome screen
window.location.reload();
```

### Simulate Milestones

```typescript
// Trigger timeline unlock (3 entries)
localStorage.setItem('journal_entry_count', '3');

// Trigger search unlock (5 entries)
localStorage.setItem('journal_entry_count', '5');

// Trigger voice unlock
localStorage.setItem('voice_used', 'true');
```

## Best Practices

### 1. Don't Block Users
Never prevent users from accessing features—only hide UI elements. Power users should be able to access everything via URLs.

### 2. Celebrate Every Win
Small milestones matter. First entry, third entry, first voice session—celebrate them all.

### 3. Provide Escape Hatches
Always offer "Maybe later" or "Dismiss" options. Never force engagement.

### 4. Keep Copy Warm
Use conversational, encouraging language. Avoid clinical or technical terms.

### 5. Test the Journey
Regularly test the full onboarding flow from welcome → first entry → milestones.

## Future Enhancements

### Planned Features
- [ ] Custom celebration messages based on journal mode
- [ ] Weekly/monthly progress reports
- [ ] Personalized milestone suggestions
- [ ] Social sharing for milestones (opt-in)
- [ ] Achievement badges in profile
- [ ] Export milestone history

### Potential Integrations
- Email notifications for milestones
- Push notifications (web push)
- Analytics tracking for drop-off points
- A/B testing different celebration styles
- Localization for international users

## Troubleshooting

### Milestones Not Triggering

Check:
1. `trackJournalEntry()` is called after save
2. `trackVoiceUsage()` is called on voice start
3. LocalStorage is available (not in incognito mode)
4. No JavaScript errors in console

### Confetti Not Showing

Check:
1. `canvas-confetti` is installed: `npm install canvas-confetti`
2. Import is correct: `import confetti from 'canvas-confetti';`
3. No CSP (Content Security Policy) blocking canvas

### Haptic Not Working

Check:
1. Device supports vibration API
2. Browser allows vibration (HTTPS required)
3. User hasn't disabled vibration in device settings

## Summary

The Progressive Discovery System creates a delightful, non-overwhelming onboarding experience by:

1. **Welcoming** users with warm, inviting copy
2. **Guiding** them through their first journal entry
3. **Celebrating** milestones with confetti and haptic feedback
4. **Revealing** new features as they engage naturally
5. **Supporting** them with contextual help when needed
6. **Respecting** their sovereignty with "maybe later" options

This approach reduces cognitive load, increases engagement, and creates a sense of accomplishment as users discover MAIA's full capabilities over time.

---

For implementation details, see:
- `/components/onboarding/SoulfulAppShell.tsx`
- `/components/onboarding/FeatureDiscovery.tsx`
- `/components/onboarding/ContextualHelp.tsx`
- `/components/onboarding/DemoMode.tsx`
- `/lib/copy/MaiaCopy.ts`