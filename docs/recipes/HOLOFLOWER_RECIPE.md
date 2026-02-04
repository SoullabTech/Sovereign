# Holoflower Implementation Recipe

**Status:** Production-verified, visually locked
**Last verified:** 2026-02-03
**Location:** `components/OracleConversation.tsx` (lines 6460-6950)

---

## Visual Architecture

The holoflower consists of **5 layered elements**:

```
┌─────────────────────────────────────────────┐
│  Layer 5: Ultraviolet glow (voice-reactive) │  z-index: 8
├─────────────────────────────────────────────┤
│  Layer 4: White center dot                  │  z-index: 10
├─────────────────────────────────────────────┤
│  Layer 3: Inner holoflower (55.6% size)     │  z-index: 10
├─────────────────────────────────────────────┤
│  Layer 2: Outer holoflower (90% size)       │  z-index: 10
├─────────────────────────────────────────────┤
│  Layer 1: RhythmHoloflower (background)     │  z-index: default
└─────────────────────────────────────────────┘
```

---

## Required Assets

```
public/
├── holoflower.png        # Main holoflower image (112KB, semi-transparent)
├── logo_flower 2.png     # Colored holoflower for welcome screen (320KB)
├── holoflower-amber.png  # Amber variant (not used in main UI)
├── holoflower-v2.png     # V2 variant (not used in main UI)
└── holoflower.svg        # SVG version (not used in main UI)
```

---

## Component Stack

### 1. Welcome Screen Holoflower (Small, beside greeting)

**File:** `components/OracleConversation.tsx` (lines 6063-6080)

```tsx
{/* Holoflower Icon + Greeting */}
<div className="flex items-center gap-4">
  <motion.div
    animate={{
      scale: [1, 1.02, 1],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <img
      src="/logo_flower 2.png"
      alt="MAIA"
      className="w-14 h-14 md:w-16 md:h-16 object-contain"
    />
  </motion.div>
  {/* ... greeting text ... */}
</div>
```

**Key specs:**
- Image: `/logo_flower 2.png` (colored version)
- Size: 56px mobile, 64px desktop
- Animation: Gentle breathing (2% scale pulse over 4s)
- Position: Inline with greeting text

---

### 2. Main Interactive Holoflower (Center of screen)

**File:** `components/OracleConversation.tsx` (lines 6466-6553)

#### Container
```tsx
<div className="flex items-center justify-center"
     style={{
       width: holoflowerSize,
       height: holoflowerSize,
       background: 'transparent',
       overflow: 'visible',
       pointerEvents: 'none'
     }}>
```

#### Background Layer: RhythmHoloflower
```tsx
<RhythmHoloflower
  rhythmMetrics={rhythmMetrics}
  size={holoflowerSize}
  interactive={false}
  showLabels={false}
  motionState={currentMotionState}
  isListening={isListening}
  isProcessing={isProcessing}
  isResponding={isResponding}
  showBreakthrough={showBreakthrough}
  voiceAmplitude={voiceAmplitude}
  isMaiaSpeaking={isResponding || isAudioPlaying}
  dimmed={false}
/>
```

#### Ambient Glow (Barely visible)
```tsx
<motion.div
  className={`absolute flex items-center justify-center pointer-events-none ${
    showChatInterface || messages.filter(m => !m.id.startsWith('greeting-')).length > 0
      ? 'opacity-0'
      : 'opacity-10'
  }`}
  animate={{
    scale: [1, 1.1, 1],
    opacity: showChatInterface || messages.length > 0 ? 0 : [0.05, 0.1, 0.05]
  }}
  transition={{
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut"
  }}
>
  <div
    className="w-32 h-32 rounded-full"
    style={{
      background: 'radial-gradient(circle, rgba(212, 184, 150, 0.15) 0%, transparent 60%)',
      filter: 'blur(40px)',
    }}
  />
</motion.div>
```

#### Two-Layer Holoflower (Golden Ratio)
```tsx
<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
  {/* Outer layer - 90% of container */}
  <img
    src="/holoflower.png"
    alt="Holoflower outer layer"
    className="object-contain absolute"
    style={{
      width: `${holoflowerSize * 0.90}px`,
      height: `${holoflowerSize * 0.90}px`,
      opacity: 0.4,
    }}
  />

  {/* Inner layer - 90% / φ ≈ 55.6% of container */}
  <img
    src="/holoflower.png"
    alt="Holoflower inner layer"
    className="object-contain absolute"
    style={{
      width: `${holoflowerSize * 0.556}px`,
      height: `${holoflowerSize * 0.556}px`,
      opacity: 0.7,
    }}
  />

  {/* White center dot */}
  <div
    className="absolute rounded-full"
    style={{
      width: `${holoflowerSize * 0.12}px`,
      height: `${holoflowerSize * 0.12}px`,
      background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 60%, transparent 100%)',
    }}
  />
</div>
```

**Golden Ratio Math:**
- Outer: `holoflowerSize * 0.90`
- Inner: `holoflowerSize * 0.556` (90% ÷ φ where φ ≈ 1.618)
- Center: `holoflowerSize * 0.12`

---

### 3. Ultraviolet Voice-Reactive Glow

**File:** `components/OracleConversation.tsx` (lines 6555-6700)

```tsx
{!isResponding && !isAudioPlaying && !isProcessing && (
  <motion.div
    className="absolute inset-0 flex items-center justify-center pointer-events-none z-8"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3 }}
  >
    {/* Outermost diffuse field */}
    <motion.div
      className="absolute rounded-full"
      style={{
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(124, 58, 237, 0.3) 30%, rgba(139, 92, 246, 0.15) 60%, transparent 100%)',
        filter: 'blur(40px)',
        transform: `scale(${1 + voiceAmplitude * 0.3})`,
        opacity: 0.7 + voiceAmplitude * 0.3,
        transition: 'transform 0.06s ease-out, opacity 0.06s ease-out',
      }}
      animate={{
        scale: voiceAmplitude > 0.1 ? undefined : [1, 1.05, 1],
        opacity: voiceAmplitude > 0.1 ? undefined : [0.7, 0.85, 0.7],
      }}
      transition={{
        duration: 2,
        repeat: voiceAmplitude > 0.1 ? 0 : Infinity,
        ease: "easeInOut"
      }}
    />
  </motion.div>
)}
```

**Voice reactivity:**
- Scale: `1 + voiceAmplitude * 0.3`
- Opacity: `0.7 + voiceAmplitude * 0.3`
- Transition: 60ms for snappy response

---

## Responsive Sizing

**File:** `components/OracleConversation.tsx` (lines 1120-1130, 2285-2295)

```tsx
const [holoflowerSize, setHoloflowerSize] = useState(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 768 ? 40 : 350;
  }
  return 350;
});

useEffect(() => {
  const handleResize = () => {
    const newSize = window.innerWidth <= 768 ? 40 : 350;
    setHoloflowerSize(newSize);
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

**Breakpoints:**
- Mobile (≤768px): 40px
- Desktop (>768px): 350px

---

## Component Dependencies

```
OracleConversation.tsx
├── RhythmHoloflower.tsx (components/liquid/)
│   └── SacredHoloflower.tsx (components/sacred/)
│       └── MotionOrchestrator.tsx (components/motion/)
└── framer-motion (animations)
```

---

## Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Ultraviolet glow | `rgba(139, 92, 246, 0.4)` | Voice-reactive field |
| Inner violet | `rgba(124, 58, 237, 0.3)` | Mid-range glow |
| Ambient warm | `rgba(212, 184, 150, 0.15)` | Background glow |
| Center dot | `rgba(255, 255, 255, 0.9)` | White center |

---

## State Machine

```
                    ┌──────────┐
                    │   IDLE   │
                    └────┬─────┘
                         │ tap holoflower
                         ▼
                    ┌──────────┐
              ┌─────│ LISTENING │◀────────┐
              │     └────┬─────┘          │
              │          │ user speaks    │
              │          ▼                │
              │     ┌──────────┐          │
              │     │ PROCESSING│          │
              │     └────┬─────┘          │
              │          │ MAIA responds  │
              │          ▼                │
              │     ┌──────────┐          │
              │     │ RESPONDING│──────────┘
              │     └──────────┘   done
              │
              │ tap holoflower (exit)
              ▼
         ┌──────────┐
         │   MUTED  │
         └──────────┘
```

---

## Critical Invariants

1. **Two-layer ratio is SACRED**: Inner = Outer / φ (golden ratio)
2. **Center dot covers dark area**: Must be 12% of container size
3. **Ultraviolet glow only when NOT responding**: Hides during MAIA speech
4. **Voice amplitude range**: 0.0 - 1.0, drives scale/opacity
5. **Mobile size is tiny (40px)**: Fits in corner, not center

---

## Testing Checklist

- [ ] Welcome screen shows colored holoflower (`/logo_flower 2.png`)
- [ ] Main holoflower uses translucent layers (`/holoflower.png`)
- [ ] Center dot is visible and white
- [ ] Voice amplitude pulses the ultraviolet glow
- [ ] Mobile shows 40px holoflower
- [ ] Desktop shows 350px holoflower
- [ ] "Tap holoflower to speak" text appears below
- [ ] Background holoflower (RhythmHoloflower) is barely visible

---

## Rollback Instructions

If holoflower breaks, restore from commit `01d8d4b0`:

```bash
git show 01d8d4b0:components/OracleConversation.tsx > components/OracleConversation.tsx
git show 01d8d4b0:components/liquid/RhythmHoloflower.tsx > components/liquid/RhythmHoloflower.tsx
git show 01d8d4b0:components/sacred/SacredHoloflower.tsx > components/sacred/SacredHoloflower.tsx
```

---

## Changelog

| Date | Change | Commit |
|------|--------|--------|
| 2026-02-03 | Recipe created, visual locked | `01d8d4b0` |
