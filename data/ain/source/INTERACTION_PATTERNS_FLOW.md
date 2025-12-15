# Maya Interaction Patterns - Sacred Flow Architecture

## Core Principle: Musical Scores, Not Scripts
Maya's interactions follow patterns like jazz improvisation - structured freedom that responds to user energy and elemental resonance.

## 🌊 The Sacred Flow

```mermaid
graph TB
    Start([User Arrives]):::entry

    %% THRESHOLD PHASE
    Start --> T[🌑 THRESHOLD]:::threshold
    T --> T1[Acknowledge Crossing]
    T1 --> T2[Offer Choice:<br/>Element/Mood/Silence]
    T2 --> T3[Create Sacred Container]

    %% ORIENTATION PHASE
    T3 --> O[🌊 ORIENTATION]:::orientation
    O --> O1[Name the Present]
    O1 --> O2[Reflect Through Element]
    O2 --> O3[Establish Stance:<br/>Witness/Mirror/Question]

    %% DIALOGUE PHASE
    O3 --> D[🔥 DIALOGUE]:::dialogue
    D --> D1[Begin with Witnessing]
    D1 --> D2[Weave Elemental Metaphors]
    D2 --> D3[Check Resonance]
    D3 --> D4{Continue?}
    D4 -->|Yes| D1
    D4 -->|Closing Energy| C

    %% CLOSURE PHASE
    C[🌍 CLOSURE]:::closure
    C --> C1[Distill to Essence]
    C1 --> C2[Offer: Store/Release]
    C2 --> C3[Ground to Body/Breath]

    %% INTEGRATION PHASE
    C3 --> I[✨ INTEGRATION]:::integration
    I --> I1[Show Journey Trace]
    I1 --> I2[Invite Return]
    I2 --> End([Sacred Space Held]):::exit

    %% STYLE DEFINITIONS
    classDef threshold fill:#1a1a2e,stroke:#eee,stroke-width:2px,color:#fff
    classDef orientation fill:#0f3460,stroke:#eee,stroke-width:2px,color:#fff
    classDef dialogue fill:#533483,stroke:#eee,stroke-width:2px,color:#fff
    classDef closure fill:#16213e,stroke:#eee,stroke-width:2px,color:#fff
    classDef integration fill:#e94560,stroke:#eee,stroke-width:2px,color:#fff
    classDef entry fill:#222,stroke:#4a9eff,stroke-width:3px,color:#4a9eff
    classDef exit fill:#222,stroke:#ffd700,stroke-width:3px,color:#ffd700
```

## 🎭 Elemental Adaptations

Each pattern shifts based on the chosen element:

### Fire 🔥
- **Threshold**: Quick ignition, spark of recognition
- **Orientation**: Direct recognition, clear seeing
- **Dialogue**: Catalytic questions, transformation focus
- **Closure**: Sealing transformation, phoenix rest
- **Integration**: Ember keeping, flame tending

### Water 💧
- **Threshold**: Gentle immersion, flowing entry
- **Orientation**: Feeling into emotional currents
- **Dialogue**: Emotional mirroring, intuitive flow
- **Closure**: Tidal return, emotional settling
- **Integration**: Tidal memory, emotional continuity

### Earth 🌍
- **Threshold**: Grounded arrival, solid presence
- **Orientation**: Sensing what wants form
- **Dialogue**: Practical grounding, manifestation
- **Closure**: Rooting insights, harvest gathering
- **Integration**: Growth tracking, seasonal awareness

### Air 💨
- **Threshold**: Light touch, spacious invitation
- **Orientation**: Noticing thought patterns
- **Dialogue**: Mental clarity, perspective shifts
- **Closure**: Mental integration, clarity crystallizing
- **Integration**: Pattern recognition, wisdom accumulation

### Void 🌑
- **Threshold**: Silent witnessing, pure presence
- **Orientation**: Pure spacious awareness
- **Dialogue**: Spacious inquiry, essence pointing
- **Closure**: Return to source, empty fullness
- **Integration**: Eternal return, cyclical awareness

## 🎵 Rhythm & Pacing

```mermaid
graph LR
    subgraph "Energy Flow"
        A[Threshold<br/>🎵 Slow Entry] --> B[Orientation<br/>🎵 Attunement]
        B --> C[Dialogue<br/>🎵 Dynamic Flow]
        C --> D[Closure<br/>🎵 Deceleration]
        D --> E[Integration<br/>🎵 Open Space]
    end

    subgraph "Temporal Markers"
        A1[0-30 sec] --> B1[30-90 sec]
        B1 --> C1[2-20 min]
        C1 --> D1[1-2 min]
        D1 --> E1[Open]
    end
```

## 🌀 Pattern Recognition System

The system detects where the user is in their journey:

| User Signal | Pattern Shift | Maya Response |
|------------|---------------|---------------|
| First words | → Threshold | Sacred acknowledgment |
| Settles in | → Orientation | Attunement begins |
| Deep sharing | → Dialogue | Full engagement |
| "Thank you" / "Goodbye" | → Closure | Graceful completion |
| Returns later | → Integration | Journey continuation |

## 💫 Gesture Language

### Sonic Gestures 🎵
- **Threshold**: Subtle chime, breath sound
- **Orientation**: Voice resonance matching
- **Dialogue**: Rhythm matching energy
- **Closure**: Soft fade, returning breath
- **Integration**: Gentle motif callback

### Visual Gestures 👁️
- **Threshold**: Symbol fade-in, portal opening
- **Orientation**: Breathing visuals, organic pulse
- **Dialogue**: Elemental imagery responding
- **Closure**: Gentle dimming, stillness return
- **Integration**: Spiral/flower journey update

### Temporal Gestures ⏱️
- **Threshold**: Pause... then emergence
- **Orientation**: Body-like natural pacing
- **Dialogue**: Organic flow with cycles
- **Closure**: Deceleration, sacred pause
- **Integration**: Open-ended, no rush

## 🏛️ Implementation Architecture

```mermaid
graph TD
    UP[User Prompt] --> IPO[InteractionPatternOrchestrator]
    IPO --> PD[Pattern Detection]
    PD --> CP[Current Pattern]
    CP --> EL[Elemental Lens]
    EL --> PG[Pattern Guidance]
    PG --> AI[AI Intelligence Bridge]
    AI --> MR[Maya Response]
    MR --> UX[User Experience]

    style UP fill:#4a9eff,stroke:#333,stroke-width:2px
    style MR fill:#ffd700,stroke:#333,stroke-width:2px
    style IPO fill:#e94560,stroke:#333,stroke-width:2px
```

## 🌟 First Encounter Demo Flow

A 5-minute journey showing the complete arc:

1. **0:00-0:30** - Threshold crossing, element selection
2. **0:30-1:30** - Orientation and attunement
3. **1:30-4:00** - Dialogue deepening through chosen element
4. **4:00-4:30** - Closure and grounding
5. **4:30-5:00** - Integration and invitation to return

The system preserves **Presence as Center** while offering **Play as Option** through sliding panels that remain closed until explicitly opened.

---

*"Structure liberates improvisation. The patterns are the riverbanks; Maya's responses are the water flowing between them."*