# 🌟 Ritual Layer System - Developer Guide

## Architecture Overview

The Ritual Layer System orchestrates three independent sensory layers:
- **Visual** (always on) - Sacred geometry, motion states
- **Haptic** (optional) - Embodied feedback via vibration
- **Audio** (optional) - Sacred frequencies and harmonic layers

Each layer operates independently but synchronizes through the `RitualLayerOrchestrator`.

## Quick Start

```typescript
import { createRitualContext } from '@/lib/ritual-layers/ritual-layer-system';

// Initialize orchestrator
const ritual = createRitualContext('listening');

// Update state (all layers sync automatically)
ritual.updateState({ 
  mode: 'processing',
  coherence: 0.7,
  element: 'water'
});

// Toggle layers
ritual.toggleLayer('audio', false); // Mute audio
ritual.toggleLayer('haptic', true); // Enable haptics

// Trigger special moments
if (coherence > 0.9) {
  ritual.triggerBreakthrough();
}

if (ritual.checkGrandBloom(coherence, petalCount)) {
  ritual.triggerGrandBloom();
}
```

## Integration Points

### 1. Sacred Portal Page

```typescript
// app/oracle-sacred/page.tsx
import { RitualLayerOrchestrator } from '@/lib/ritual-layers/ritual-layer-system';

export default function SacredPortal() {
  const [ritual] = useState(() => new RitualLayerOrchestrator({
    mode: 'listening',
    coherence: 0.5,
    element: 'fire',
    breathPhase: 'inhale',
    intensity: 0.5
  }));

  // Listen for voice input
  const processVoice = async (transcript: string) => {
    ritual.updateState({ mode: 'processing' });
    
    const response = await fetch('/api/oracle-sacred', ...);
    
    ritual.updateState({
      mode: response.breakthrough ? 'breakthrough' : 'responding',
      coherence: response.coherence,
      element: response.element
    });
  };

  return (
    <>
      <HoloflowerMotion />
      <LayerControls ritual={ritual} />
    </>
  );
}
```

### 2. Visual Layer Integration

```typescript
// components/HoloflowerMotion.tsx
useEffect(() => {
  const handleVisualUpdate = (e: CustomEvent) => {
    const config = e.detail;
    setBreathSpeed(config.breathSpeed);
    setGlowIntensity(config.glowIntensity);
    setParticles(config.particleDensity);
  };

  window.addEventListener('ritual-visual-update', handleVisualUpdate);
  return () => window.removeEventListener('ritual-visual-update', handleVisualUpdate);
}, []);
```

### 3. Layer Toggle UI

```typescript
// components/LayerControls.tsx
export function LayerControls({ ritual }: { ritual: RitualLayerOrchestrator }) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  return (
    <div className="absolute top-4 left-4 flex gap-2">
      <button
        onClick={() => {
          ritual.toggleLayer('audio', !audioEnabled);
          setAudioEnabled(!audioEnabled);
        }}
        className={`p-2 rounded ${audioEnabled ? 'bg-white/20' : 'bg-white/10'}`}
      >
        🎵 {audioEnabled ? 'On' : 'Off'}
      </button>
      
      <button
        onClick={() => {
          ritual.toggleLayer('haptic', !hapticEnabled);
          setHapticEnabled(!hapticEnabled);
        }}
        className={`p-2 rounded ${hapticEnabled ? 'bg-white/20' : 'bg-white/10'}`}
      >
        📳 {hapticEnabled ? 'On' : 'Off'}
      </button>
    </div>
  );
}
```

## State Flow Diagram

```
User Input → Oracle Processing → State Update → Layer Sync
     ↓              ↓                 ↓            ↓
  [Voice]      [API Call]      [Orchestrator]  [V/H/A]
                                                   ↓
                                            Visual Always
                                            Haptic if enabled
                                            Audio if enabled
```

## Ritual States Reference

| State | Visual | Haptic | Audio | Trigger |
|-------|--------|--------|-------|---------|
| **Listening** | Gentle breath, low glow | Soft pulse | 396Hz hum | User speaking |
| **Processing** | Spiral ripples | Medium wave | 417+528Hz | Oracle thinking |
| **Responding** | Active petals | Soft ripple | Element tone | Oracle speaks |
| **Breakthrough** | Golden burst | Strong ripple | Harmonic chord | Coherence >0.9 |
| **Grand Bloom** | All petals + rays | 12-point cascade | Full spectrum | 12 petals + >0.95 |

## Sacred Frequencies

```typescript
const SACRED_FREQUENCIES = {
  earth: 396,  // Liberation, grounding
  water: 417,  // Transmutation, flow  
  fire: 528,   // Love, transformation
  air: 741,    // Intuition, expression
  aether: 963  // Unity, transcendence
};
```

## Haptic Patterns

```typescript
const HAPTIC_PATTERNS = {
  pulse: [200],                                    // Simple beat
  wave: [100, 50, 100, 50, 100],                  // Rolling wave
  ripple: [50, 100, 150, 200, 250],               // Expanding ripple
  cascade: [100, 50, 150, 50, 200, 50, 250, 50]   // Complex cascade
};
```

## Performance Considerations

1. **Audio Context**: Create once, reuse throughout session
2. **Oscillators**: Clean up after use (5 second max duration)
3. **Haptics**: Check `navigator.vibrate` support
4. **Visual Events**: Use CustomEvent for loose coupling
5. **State Updates**: Batch when possible to avoid re-renders

## Testing

```typescript
// Test breakthrough trigger
ritual.updateState({ coherence: 0.95 });
ritual.triggerBreakthrough();

// Test grand bloom
const shouldBloom = ritual.checkGrandBloom(0.98, 12);
if (shouldBloom) ritual.triggerGrandBloom();

// Test layer toggling
ritual.toggleLayer('audio', false);
ritual.toggleLayer('haptic', true);
```

## Debugging

```typescript
// Get current configuration
const config = ritual.getConfig();
console.log('Visual:', config.visual);
console.log('Haptic:', config.haptic);
console.log('Audio:', config.audio);

// Monitor state changes
window.addEventListener('ritual-visual-update', (e) => {
  console.log('Visual update:', e.detail);
});
```

## Sacred UX Principles

1. **Subtlety First** - Start quiet (5% audio), soft haptics
2. **Rare = Sacred** - Grand Bloom is earned, not given
3. **Independent Layers** - If audio breaks, visual/haptic continue
4. **Embodied > Metrics** - Feel coherence, don't read it
5. **Simple Controls** - Single toggle per layer

## Common Patterns

### Voice to Ritual Flow
```
Voice Input → Coherence Detection → State Mapping → Layer Update
```

### Breakthrough Detection
```
if (coherence > 0.9 && shadowResolved && elementAligned) {
  ritual.triggerBreakthrough();
}
```

### Grand Bloom Conditions
```
All 12 petals active + Coherence > 0.95 + Aether present
```

---

This modular system keeps complexity low while enabling deep ritual experiences. Each layer can be developed, tested, and deployed independently while maintaining sacred coherence through the orchestrator.