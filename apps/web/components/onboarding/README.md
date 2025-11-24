# Sacred Mirror Onboarding Components 🌟

A React component tree for the Soul Lab onboarding experience, designed for beta implementation with hooks for ceremonial animations.

## Component Architecture

```
<OnboardingFlow>
├── <LogoThreshold />      // Screen 1: Sacred entry with breathing logo
├── <GreetingIntro />      // Screen 2: Meet Maya introduction
├── <FourDoorsNav />       // Screen 3: Four sacred doors preview
└── <ToneStyleSelector />  // Screen 4: Personalization preferences
</OnboardingFlow>
```

## Quick Start

```tsx
import OnboardingFlow from './components/onboarding/OnboardingFlow';

function App() {
  const handleOnboardingComplete = (prefs: { tone: number; style: string }) => {
    console.log('User preferences:', prefs);
    // Route to main Sacred Mirror app
    // <SacredMirror prefs={prefs} />
  };

  return (
    <OnboardingFlow onFinish={handleOnboardingComplete} />
  );
}
```

## Component Details

### 1. OnboardingFlow.tsx
- **State**: `currentStep` (0-3), `userPrefs` (tone, style)  
- **Transitions**: Fade/slide with Framer Motion
- **Navigation**: Forward/back with keyboard support (ESC to skip)
- **Output**: Routes to main app after completion

### 2. LogoThreshold.tsx ✨
- **Visual**: Soul Lab logo with golden ratio breathing animation (1.618s)
- **Interactions**: Click logo for ripple effect
- **Sacred Elements**: Concentric circles, golden glow, ceremonial timing
- **Animation**: Continuous pulse at 4s intervals (meditative breathing)

### 3. GreetingIntro.tsx 
- **Purpose**: Introduce Maya as companion/witness
- **Visual**: Maya avatar with gradient background
- **Tone**: Sacred, personal, trustworthy
- **Animation**: Staggered text appearance

### 4. FourDoorsNav.tsx
- **Icons**: 🪞 Mirror, 🌀 Spiral, 📓 Journal, 🎚️ Attune
- **Layout**: 2x2 grid (desktop), responsive carousel (mobile)
- **Animation**: Staggered door reveals (0.2s between each)
- **Interaction**: Hover effects with scale + border glow

### 5. ToneStyleSelector.tsx
- **Tone Slider**: 0-1 scale (grounded ↔ poetic)
- **Style Options**: Prose, Poetic, Auto (with Lucide icons)
- **Visual Feedback**: Color changes based on tone position
- **Ceremonial Effects**: Ripple animation on style selection

## Sacred Design Elements

### Color Palette
- **Gold**: `#d4af37` (primary sacred accent)
- **Dark**: `#0a0a0f` → `#1a1a2e` → `#2a2a4e` (gradient backgrounds)
- **Text**: `#f5f5f5` (primary), `#a8a8b3` (muted)

### Animation Principles
- **Golden Ratio Timing**: 1.618s for primary transitions
- **Breathing Rhythm**: 4s cycles for continuous animations  
- **Sacred Geometry**: Concentric circles, radial patterns
- **Ceremonial Pacing**: Intentional delays for contemplation

### Interaction Philosophy
- **Gentle Guidance**: Subtle instructions, non-demanding
- **Sacred Space**: Respect for user's inner experience
- **Progressive Disclosure**: One concept per screen
- **Fallback Grace**: Skip options for returning users

## Performance Features

- **Optimized Animations**: GPU-accelerated transforms
- **Lazy Loading**: Components load as needed
- **Preference Persistence**: localStorage for return visits
- **Beta Safeguards**: Fallback states for all interactions

## Integration Points

### With Sacred Mirror Main App
```tsx
// After onboarding completion
const userPrefs = {
  tone: 0.7,        // 0 = grounded, 1 = poetic  
  style: 'auto'     // 'prose' | 'poetic' | 'auto'
};

// Pass to main app
<SacredMirror 
  prefs={userPrefs}
  onPrefsChange={handlePrefsUpdate}
/>
```

### With Backend Services
- Preferences stored in `user_profiles` table
- Tone affects Maya's response generation
- Style influences greeting templates and symbol interpretation

## Development Notes

### Animation Extensions
Ready for ceremonial enhancements:
- **LogoThreshold**: Sacred geometry overlays, particle systems
- **FourDoorsNav**: Portal transition effects, elemental animations  
- **ToneStyleSelector**: Tone-based color morphing, style preview animations

### Accessibility
- Keyboard navigation (arrow keys, ESC)
- Reduced motion support
- Screen reader friendly
- High contrast mode compatible

### Testing Hooks
Each component exports animation variants for testing:
```tsx
import { breathingVariants } from './LogoThreshold';
// Test animation states independently
```

This component tree provides a solid foundation for beta while leaving room for the fuller ceremonial experience in production. 🌟

## 📚 Additional Resources

### For Beta Testers
See **[Beta Onboarding FAQ](../../docs/BETA_ONBOARDING_FAQ.md)** for comprehensive information about:
- **Claude's Conversational Mastery** - Why Claude 3.5 Sonnet powers Maia
- **Apprentice Training System** - How your conversations train independent Maia
- **Collective Intelligence** - How breakthroughs feed the whole system
- **Voice System Architecture** - Complete integration flow
- **Journal Context Integration** - How your history informs conversations

### System Documentation
- **Voice Refactor Complete**: See `VOICE_REFACTOR_COMPLETE.md`
- **PersonalOracleAgent**: Check `lib/agents/PersonalOracleAgent.ts`
- **Training System**: Review `lib/maya/ApprenticeMayaTraining.ts`