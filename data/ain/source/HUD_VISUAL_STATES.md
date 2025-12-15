# Holoflower HUD Visual States
## Game-Style Consciousness Indicator Flow

---

## 🎮 State Machine Overview

```
IDLE → HOVER → ACTIVE → WARNING → CRITICAL
  ↑                         ↓
  └──── POWERUP ←── SYNC ───┘
```

---

## 1️⃣ IDLE States (Background Awareness)

### Fresh (< 1 hour since check-in)
```
Visual: Gentle breathing animation
Glow: Soft purple aura (rgba(147, 51, 234, 0.2))
Petals: Stable positions
Particles: None
Sound: [ambient_hum.wav]
```

### Stable (1-12 hours)
```
Visual: Slower breathing cycle
Glow: Dimmer aura
Petals: Slight drift animation
Particles: Occasional sparkle
Sound: [gentle_chime.wav] every 30min
```

### Stale (12-24 hours)
```
Visual: Notification badge appears
Glow: Yellowing edges (warning color)
Petals: Visible desync starting
Particles: Dust motes falling
Sound: [attention_bell.wav]
```

---

## 2️⃣ INTERACTION States

### Hover
```
Transform: scale(1.1)
Reveal: Stats overlay slides in
Petals: Individual petal highlights on mouseover
Glow: Brightens by 30%
Particles: Attraction effect toward cursor
Duration: Instant
```

### Click Initiation
```
Effect: Ripple from click point
Scale: 0.95 → 1.05 → 1.0 (bounce)
Particles: Burst outward in ring
Sound: [portal_open.wav]
Transition: Fade to full holoflower view
```

### Long Press (Quick Insight)
```
0-500ms: Ring fills clockwise
500ms: Flash white
Display: Today's insight tooltip
Particles: Spiral inward
Release: Spring back animation
```

---

## 3️⃣ COHERENCE States

### High Coherence (> 70%)
```
Effect: Golden shimmer overlay
Animation:
  - Outer ring: Golden pulse every 3s
  - Center: Bright white core
  - Petals: Synchronized breathing
Particles: Golden motes rising
Frequency: All petals at harmonic intervals
```

### Expanding (Coherence increasing)
```
Effect: Green growth burst
Animation:
  - Petals: Extend outward 20%
  - Spiral: Clockwise expansion
  - Glow: Green → gold gradient
Particles: Outward burst, then orbit
Duration: 1 second burst, 2 second settle
```

### Contracting (Coherence decreasing)
```
Effect: Red warning pulse
Animation:
  - Petals: Pull inward 15%
  - Spiral: Counter-clockwise
  - Glow: Red edges creeping in
Particles: Falling, dissipating
Sound: [energy_drain.wav]
```

---

## 4️⃣ WARNING States

### Drift Detection
```
Visual: Red outline flickers
Frequency: 1Hz pulse
Petals: Jittering positions
Particles: Chaotic swirl
Badge: "!" appears
Message: "Pattern drift detected"
```

### Critical Imbalance
```
Visual: Entire HUD flashes red
Animation:
  - Scale: 1.0 → 1.1 → 1.0 (urgent pulse)
  - Rotation: Slight wobble
  - Petals: Severe asymmetry visible
Particles: Red storm effect
Sound: [critical_alert.wav]
Action: Auto-opens after 3 pulses
```

---

## 5️⃣ SPECIAL Events

### Daily Streak Reward
```
Trigger: 7+ days consecutive
Effect: Rainbow spiral
Particles: Confetti burst
Badge: Star icon appears
Sound: [achievement.wav]
```

### Perfect Coherence
```
Trigger: All petals 7-9, balanced
Effect: Crystalline formation
Visual:
  - Fractal patterns emerge
  - Sacred geometry overlay
  - White light burst from center
Duration: 3 seconds
```

### Synchronization with Agent
```
Trigger: User/Agent alignment > 85%
Effect: Dual ring formation
Visual:
  - Inner ring: User state
  - Outer ring: Agent state
  - Connection beams between aligned petals
Particles: Energy transfer effect
```

---

## 6️⃣ Transition Timings

| From State | To State | Duration | Easing |
|------------|----------|----------|---------|
| Idle | Hover | 200ms | ease-out |
| Hover | Click | 100ms | ease-in |
| Any | Warning | 0ms | immediate |
| Warning | Critical | 500ms | pulse |
| Critical | Sync | 1000ms | ease-in-out |
| Powerup | Idle | 2000ms | ease-out |

---

## 7️⃣ Particle System Rules

### Ambient Particles
- **Count**: 0-5 based on coherence
- **Speed**: 0.5-2px/frame
- **Life**: 60-120 frames
- **Gravity**: -0.1 (float upward)
- **Color**: Match dominant element

### Burst Particles
- **Count**: 12 (one per petal)
- **Speed**: 5-10px/frame initial
- **Life**: 30 frames
- **Spread**: 360° even distribution
- **Decay**: Exponential fadeout

### Warning Particles
- **Pattern**: Chaotic swirl
- **Speed**: Variable 1-5px/frame
- **Color**: Red with white core
- **Behavior**: Attracted to imbalanced petals

---

## 8️⃣ Mobile Optimizations

### Touch States
```
Tap: Same as click
Long Press: 750ms (longer for touch)
Swipe Up: Navigate to full view
Swipe Down: Dismiss notifications
```

### Performance
```
Reduced Particles: Max 10 on mobile
Simplified Shaders: No blur effects
Lower FPS: 30fps instead of 60fps
Battery Saver: Pause animations when backgrounded
```

---

## 9️⃣ Sound Design (Optional)

### Ambient Layer
- **idle_hum.wav**: Barely audible presence
- **coherent_harmony.wav**: Musical drone when balanced

### Feedback Layer
- **petal_adjust.wav**: Soft whoosh per drag
- **state_change.wav**: Crystalline chime
- **warning_bell.wav**: Tibetan bowl sound

### Achievement Layer
- **daily_complete.wav**: Harp glissando
- **streak_reward.wav**: Orchestral flourish
- **perfect_balance.wav**: Singing bowl resonance

---

## 🎯 Implementation Priority

1. **Core States**: Idle, Hover, Click (Week 1)
2. **Coherence Feedback**: Glow effects, particles (Week 2)
3. **Warning System**: Drift, Critical states (Week 3)
4. **Polish**: Achievements, Sound, Mobile (Week 4)

---

This HUD system makes consciousness visible as a living companion, not a static meter. Every glance tells a story, every interaction deepens the relationship.