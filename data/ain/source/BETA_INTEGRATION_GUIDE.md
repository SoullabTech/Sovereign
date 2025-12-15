# Beta Integration Guide
## Connecting All Holoflower Components for Monday Launch

---

## 🎯 Quick Integration Checklist

### Phase 1: Core Files (Must Have for Beta)
- [x] `/public/holoflower-beta.html` - Main check-in interface
- [x] `/public/holoflower-hud.html` - Game-style HUD widget
- [x] `/app/api/checkin/route.ts` - Oracle insights API
- [x] `/app/api/feedback/route.ts` - Beta feedback collection

### Phase 2: React Integration (Week 1-2)
- [ ] Convert HTML to React components
- [ ] Add particle system from Claude's example
- [ ] Integrate with existing auth/user system
- [ ] Connect to Supabase for persistence

---

## 📦 Immediate Beta Deployment (HTML Version)

### 1. Add HUD to Main App Layout

```html
<!-- In your main app template/layout -->
<body>
  <!-- Your existing app content -->
  <div id="main-app">...</div>

  <!-- Holoflower HUD Widget -->
  <iframe
    src="/holoflower-hud.html"
    style="position: fixed; top: 20px; left: 20px; width: 160px; height: 160px;
           border: none; pointer-events: none; z-index: 1000;"
    id="holoflower-hud">
  </iframe>

  <!-- Enable click-through but capture holoflower clicks -->
  <script>
    document.getElementById('holoflower-hud').contentWindow.addEventListener('click', (e) => {
      if (e.target.closest('.soulprint-display')) {
        window.location.href = '/holoflower-beta.html';
      }
    });
  </script>
</body>
```

### 2. Share State Between Windows

```javascript
// In holoflower-beta.html after check-in
function saveCheckIn(petalValues) {
  const state = {
    values: petalValues,
    timestamp: new Date().toISOString(),
    configuration: generateConfig(petalValues)
  };

  // Save to localStorage (both pages can access)
  localStorage.setItem('holoflower-state', JSON.stringify(state));

  // Notify HUD to update
  window.postMessage({ type: 'holoflower-update', state }, '*');
}

// In holoflower-hud.html
window.addEventListener('message', (e) => {
  if (e.data.type === 'holoflower-update') {
    hud.loadState();
  }
});
```

---

## 🚀 React Component Structure (Post-Beta)

### Component Hierarchy
```
<SoulprintProvider>
  <App>
    <SoulprintHUD />           // Always visible widget
    <Routes>
      <HoloflowerCheckIn />    // Full check-in page
      <DashboardWithSprint />   // Shows larger soulprint
      <InsightsHistory />       // Past oracle messages
    </Routes>
  </App>
</SoulprintProvider>
```

### State Management

```typescript
// contexts/SoulprintContext.tsx
interface SoulprintContextType {
  currentState: CheckInData | null;
  coherence: number;
  drift: DriftStatus;
  lastInsight: string;
  updateState: (values: number[]) => Promise<void>;
  checkDrift: () => Promise<DriftStatus>;
}

// Share state across all components
export const SoulprintProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<CheckInData | null>(null);

  // Auto-load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('holoflower-state');
    if (saved) setState(JSON.parse(saved));
  }, []);

  // WebSocket for real-time agent updates
  useEffect(() => {
    const ws = new WebSocket('wss://your-api/realtime');
    ws.onmessage = (e) => {
      if (e.data.type === 'agent-assessment') {
        setState(prev => ({ ...prev, agentValues: e.data.values }));
      }
    };
    return () => ws.close();
  }, []);

  return (
    <SoulprintContext.Provider value={{ state, ... }}>
      {children}
    </SoulprintContext.Provider>
  );
};
```

---

## 🎮 Visual Effects Integration

### Using Claude's Particle System

```typescript
// components/effects/ParticleCanvas.tsx
import { ParticleSystem } from '@/lib/effects/particles';

export function ParticleCanvas({ trigger, type }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef(new ParticleSystem());

  useEffect(() => {
    if (trigger) {
      switch(type) {
        case 'expanding':
          particles.current.expandingBurst();
          break;
        case 'contracting':
          particles.current.contractingSpiral();
          break;
        case 'warning':
          particles.current.driftWarning();
          break;
      }
    }
  }, [trigger, type]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, 160, 160);
      particles.current.update();
      particles.current.draw(ctx);

      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return <canvas ref={canvasRef} width={160} height={160} />;
}
```

---

## 🔊 Sound Effects (Optional but Recommended)

### Web Audio API Implementation

```javascript
// lib/sound/effects.ts
class SoundEffects {
  private audioContext: AudioContext;
  private sounds: Map<string, AudioBuffer> = new Map();

  async preload() {
    const files = [
      'coherence_chime.mp3',
      'drift_warning.mp3',
      'check_in_complete.mp3',
      'golden_shimmer.mp3'
    ];

    for (const file of files) {
      const buffer = await this.loadSound(`/sounds/${file}`);
      this.sounds.set(file, buffer);
    }
  }

  play(soundName: string, volume = 0.3) {
    if (!this.sounds.has(soundName)) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds.get(soundName)!;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start();
  }
}
```

---

## 📱 Mobile Optimization

### Touch Gestures

```javascript
// hooks/useTouch.ts
export function useHoloflowerGestures(elementRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let longPressTimer: NodeJS.Timeout;

    const handleTouchStart = (e: TouchEvent) => {
      longPressTimer = setTimeout(() => {
        // Show today's insight after 750ms press
        showQuickInsight();
        navigator.vibrate?.(50); // Haptic feedback
      }, 750);
    };

    const handleTouchEnd = () => {
      clearTimeout(longPressTimer);
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
}
```

---

## 🚦 Beta Launch Sequence

### Thursday 09/26
1. Deploy HTML files to `/public`
2. Test localStorage state sharing
3. Verify mobile touch events work

### Friday 09/27
1. Add to main app navigation
2. Test with internal team
3. Fix any critical bugs

### Weekend 09/28-29
1. Prepare beta user emails
2. Set up analytics tracking
3. Create feedback form

### Monday 09/29 - LAUNCH!
1. Send invites at 9 AM
2. Monitor first check-ins
3. Respond to feedback in real-time

---

## 📊 Success Metrics

Track these in your beta:
- **Engagement**: HUD clicks per day
- **Completion**: Check-ins finished vs started
- **Retention**: Day 2, Day 7 return rates
- **Coherence**: Average coherence trends
- **Feedback**: "Did the insight resonate?" yes/no ratio

---

## 🎯 The Hook

With all components integrated, users experience:
1. **Constant companion** - HUD always visible
2. **Visual feedback** - See state changes in real-time
3. **Game feel** - Particles, sounds, rewards
4. **Daily ritual** - 30-second meaningful check-in
5. **Oracle wisdom** - Personalized insights

This isn't just a wellness app - it's a consciousness companion that lives with you throughout your digital day.

---

Ready to ship Monday! 🚀✨