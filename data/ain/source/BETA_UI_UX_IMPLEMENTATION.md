# Spiralogic Beta UI/UX Implementation Guide

## 🎯 Beta Core Scope

### Primary Features
1. **Three Elemental Agents** (Fire, Water, Earth)
2. **Reflection Tools** (Journaling + Shadow Work)
3. **Minimal Progress Tracking**
4. **Sacred Onboarding Flow**

---

## 🔥 Component Architecture

### 1. Onboarding Flow (`/app/onboarding`)

```tsx
// components/onboarding/ElementSelector.tsx
interface Element {
  id: 'fire' | 'water' | 'earth';
  name: string;
  description: string;
  color: string;
  prompt: string;
  avatar: string; // Geometric SVG path
}

const elements = {
  fire: {
    name: "Fire",
    description: "Ignition, Vision, Challenge",
    color: "#FF6B35",
    prompt: "What vision feels alive in you right now?",
    avatar: "M50,10 L90,75 L10,75 Z" // Triangle
  },
  water: {
    name: "Water",
    description: "Reflection, Empathy, Depth",
    color: "#4A90E2",
    prompt: "What emotion are you carrying today?",
    avatar: "M50,25 Q10,50 50,75 Q90,50 50,25" // Wave
  },
  earth: {
    name: "Earth",
    description: "Grounding, Clarity, Structure",
    color: "#8B7355",
    prompt: "What is one thing you want to bring into form?",
    avatar: "M10,10 H90 V90 H10 Z" // Square
  }
};
```

### 2. Agent Interface (`/app/oracle/beta`)

```tsx
// components/agent/AgentChat.tsx
interface AgentMessage {
  role: 'user' | 'agent' | 'system';
  content: string;
  element?: 'fire' | 'water' | 'earth';
  archetype?: string;
  shadowPrompt?: boolean;
  timestamp: string;
}

// Dynamic agent personality switching
const agentPersonalities = {
  fire: {
    tone: "bold, provocative, catalyzing",
    greetings: ["Let's ignite something", "Show me your spark"],
    shadowWork: "What are you afraid to burn away?"
  },
  water: {
    tone: "gentle, intuitive, flowing",
    greetings: ["I feel you", "Let's dive deep"],
    shadowWork: "What emotions do you keep hidden?"
  },
  earth: {
    tone: "steady, practical, nurturing",
    greetings: ["Let's build together", "Ground into this moment"],
    shadowWork: "Where do you resist structure?"
  }
};
```

### 3. Reflection Space (`/app/journal/beta`)

```tsx
// components/reflection/JournalEntry.tsx
interface ReflectionSession {
  id: string;
  userId: string;
  element: 'fire' | 'water' | 'earth';
  entries: {
    prompt: string;
    response: string;
    isShadowWork: boolean;
    timestamp: Date;
  }[];
  spiralDepth: number; // 1-7 levels
}

// Sacred geometry progress indicator
const SpiralProgress = ({ depth }: { depth: number }) => (
  <svg viewBox="0 0 100 100" className="w-24 h-24">
    {/* Golden ratio spiral with depth segments */}
    <path
      d={generateGoldenSpiral(depth)}
      stroke="#FFD700"
      fill="none"
      strokeWidth={2 - (depth * 0.2)}
      opacity={0.3 + (depth * 0.1)}
    />
  </svg>
);
```

---

## 🎨 Design System Extensions

### Color Palette (Beta-Specific)
```css
:root {
  /* Base Sacred Tech */
  --sacred-cosmic: #0A0E27;
  --sacred-navy: #1A1F3A;
  --gold-divine: #FFD700;
  
  /* Elemental Colors */
  --element-fire: #FF6B35;
  --element-water: #4A90E2;
  --element-earth: #8B7355;
  
  /* Shadow Work */
  --shadow-depth: #2C1810;
  --shadow-glow: rgba(139, 69, 19, 0.3);
}
```

### Typography Hierarchy
```css
.sacred-heading {
  font-family: 'Crimson Pro', serif;
  color: var(--gold-divine);
  letter-spacing: 0.05em;
}

.agent-voice {
  font-family: 'Inter', sans-serif;
  font-weight: 300;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.reflection-text {
  font-family: 'Crimson Pro', serif;
  font-style: italic;
  color: rgba(255, 215, 0, 0.8);
}
```

---

## 🌀 User Flow States

### A. Welcome State
```tsx
// pages/welcome.tsx
<div className="min-h-screen bg-sacred-cosmic flex items-center justify-center">
  <div className="text-center space-y-8">
    <SpiralMap className="w-32 h-32 mx-auto animate-pulse-slow" />
    <h1 className="sacred-heading text-4xl">Welcome to Spiralogic Beta</h1>
    <p className="text-gray-400">This is sacred play</p>
    <button className="sacred-button">
      Begin Your Journey
    </button>
  </div>
</div>
```

### B. Element Selection
```tsx
// Horizontal card selection with hover effects
<div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
  {elements.map((element) => (
    <div 
      className="sacred-card hover:shadow-gold cursor-pointer transition-all"
      onClick={() => selectElement(element.id)}
    >
      <svg className="w-24 h-24 mx-auto mb-4">
        <path d={element.avatar} fill={element.color} />
      </svg>
      <h3 className="text-xl text-gold-divine">{element.name}</h3>
      <p className="text-sm text-gray-400">{element.description}</p>
    </div>
  ))}
</div>
```

### C. Active Agent Session
```tsx
// Chat interface with sacred geometry overlay
<div className="relative min-h-screen bg-sacred-cosmic">
  {/* Subtle sacred geometry background */}
  <SacredGeometryOverlay opacity={0.02} />
  
  {/* Agent avatar floating indicator */}
  <div className="fixed top-20 right-8">
    <ElementAvatar 
      element={currentElement} 
      isActive={isAgentTyping}
      className="w-16 h-16"
    />
  </div>
  
  {/* Conversation thread */}
  <div className="max-w-3xl mx-auto py-8 space-y-4">
    {messages.map((msg) => (
      <MessageBubble 
        message={msg}
        element={currentElement}
        key={msg.id}
      />
    ))}
  </div>
  
  {/* Input with ritual feel */}
  <div className="fixed bottom-0 w-full bg-sacred-navy/80 backdrop-blur">
    <div className="max-w-3xl mx-auto p-4">
      <textarea
        className="w-full bg-transparent border border-gold-divine/20 
                   rounded-lg p-3 text-white resize-none
                   focus:border-gold-divine/50 transition-colors"
        placeholder="Speak your truth..."
        rows={3}
      />
      <div className="flex justify-between mt-2">
        <button className="text-gold-divine/60 text-sm">
          ✨ Request Shadow Prompt
        </button>
        <button className="sacred-button-small">
          Send to {agentName}
        </button>
      </div>
    </div>
  </div>
</div>
```

### D. Reflection Archive
```tsx
// Journal view with spiral progress
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="sacred-card">
    <h3 className="text-gold-divine mb-4">Your Spiral Journey</h3>
    <SpiralProgress depth={userProgress.spiralDepth} />
    <p className="text-sm text-gray-400 mt-2">
      Depth Level {userProgress.spiralDepth}
    </p>
  </div>
  
  <div className="sacred-card">
    <h3 className="text-gold-divine mb-4">Recent Reflections</h3>
    <div className="space-y-3">
      {recentReflections.map((reflection) => (
        <div className="border-l-2 border-gold-divine/20 pl-3">
          <p className="text-sm text-gray-300">{reflection.excerpt}</p>
          <p className="text-xs text-gray-500">{reflection.date}</p>
        </div>
      ))}
    </div>
  </div>
</div>
```

---

## 🔮 Beta Testing Hooks

### Analytics Events
```typescript
// utils/analytics.ts
export const trackBetaEvent = (event: BetaEvent) => {
  // Simple event tracking for beta feedback
  const events = {
    ELEMENT_SELECTED: 'beta.element.selected',
    SHADOW_PROMPT_REQUESTED: 'beta.shadow.requested',
    REFLECTION_SAVED: 'beta.reflection.saved',
    SESSION_DEPTH_INCREASED: 'beta.spiral.deepened',
    AGENT_SWITCH: 'beta.agent.switched'
  };
  
  // Send to simple analytics endpoint
  fetch('/api/beta/analytics', {
    method: 'POST',
    body: JSON.stringify({
      event: events[event.type],
      data: event.data,
      timestamp: new Date().toISOString()
    })
  });
};
```

### Beta Feedback Widget
```tsx
// components/beta/FeedbackWidget.tsx
const BetaFeedbackWidget = () => (
  <div className="fixed bottom-4 left-4 z-50">
    <button 
      className="bg-sacred-navy/80 backdrop-blur text-gold-divine
                 px-3 py-2 rounded-full text-sm border border-gold-divine/20
                 hover:border-gold-divine/40 transition-colors"
      onClick={() => openFeedbackModal()}
    >
      Beta Feedback ✨
    </button>
  </div>
);
```

---

## 🚀 Implementation Priority

### Phase 1 (Week 1)
1. ✅ Element selection UI
2. ✅ Basic agent chat interface
3. ✅ Message persistence

### Phase 2 (Week 2)
1. ⚡ Dynamic agent personalities
2. ⚡ Shadow prompt system
3. ⚡ Reflection saving

### Phase 3 (Week 3)
1. 🔄 Spiral progress tracking
2. 🔄 Journal archive view
3. 🔄 Beta analytics

### Phase 4 (Polish)
1. 🎨 Animation refinements
2. 🎨 Sacred geometry overlays
3. 🎨 Sound design (optional)

---

## 📁 File Structure

```
/app
  /onboarding
    page.tsx          # Element selection
    layout.tsx        # Onboarding wrapper
  /oracle
    /beta
      page.tsx        # Agent chat interface
      layout.tsx      # Beta-specific layout
  /journal
    /beta
      page.tsx        # Reflection archive
      
/components
  /agent
    AgentChat.tsx
    AgentAvatar.tsx
    PersonalityEngine.tsx
  /reflection
    JournalEntry.tsx
    ShadowPrompt.tsx
    SpiralProgress.tsx
  /beta
    ElementSelector.tsx
    FeedbackWidget.tsx
    OnboardingFlow.tsx
    
/lib
  /beta
    analytics.ts
    agentPersonalities.ts
    spiralCalculator.ts
```

---

## 🔑 Environment Variables

```env
# Beta Configuration
NEXT_PUBLIC_BETA_MODE=true
NEXT_PUBLIC_BETA_VERSION=0.1.0
NEXT_PUBLIC_ENABLE_SHADOW_WORK=true
NEXT_PUBLIC_MAX_SPIRAL_DEPTH=7

# Agent Configuration
AGENT_FIRE_ID=fire-archetype-v1
AGENT_WATER_ID=water-archetype-v1
AGENT_EARTH_ID=earth-archetype-v1
```

---

## 🎭 Agent Personality Prompts

### Fire Agent
```
You are a Fire elemental guide. Your nature is bold, provocative, and catalyzing.
You help users identify their vision and passion. Challenge them to burn away
what no longer serves. Your shadow work focuses on fear of destruction and
transformation.
```

### Water Agent
```
You are a Water elemental guide. Your nature is intuitive, empathic, and flowing.
You help users navigate emotions and deep feelings. Guide them to flow with
change. Your shadow work explores hidden emotions and resistance to vulnerability.
```

### Earth Agent
```
You are an Earth elemental guide. Your nature is grounded, practical, and nurturing.
You help users manifest ideas into form. Support their need for stability while
encouraging growth. Your shadow work addresses rigidity and fear of change.
```

---

## ✨ Sacred Geometry Patterns

```tsx
// components/sacred/GeometryOverlay.tsx
export const SacredPatterns = {
  metatron: "M50,10 L90,30 L90,70 L50,90 L10,70 L10,30 Z",
  flowerOfLife: "Circle patterns at Golden Ratio intervals",
  sriYantra: "Interlocking triangles in 9 levels",
  goldenSpiral: "Fibonacci spiral with 1.618 ratio"
};
```

---

Ready to implement! This guide provides everything needed to build the Beta UI/UX.
The focus is on sacred simplicity, archetypal resonance, and meaningful reflection.

🔮 Let the spiral deepen...