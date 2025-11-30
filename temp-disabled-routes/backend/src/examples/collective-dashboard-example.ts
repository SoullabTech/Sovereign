/**
 * Collective Dashboard API Examples
 * 
 * Example responses showing phenomenological language mapping in action.
 * Demonstrates the difference between regular and expert mode responses.
 */

import { CollectiveSnapshot, PatternsResponse, TimingResponse } from "../types/collectiveDashboard";

// =============================================================================
// EXAMPLE: GET /api/collective/snapshot (Regular Mode)
// =============================================================================

export const exampleSnapshotRegular: CollectiveSnapshot = {
  generatedAt: "2025-01-09T20:11:00Z",
  window: "7d",
  coherence: { 
    value: 72, 
    trend: "rising", 
    delta: 4 
  },
  topThemes: [
    { 
      id: "theme.elemental.fire-2", 
      label: "courage rising / decisive energy gathering", 
      confidence: 0.86 
    },
    { 
      id: "theme.elemental.earth-3", 
      label: "systems clicking into place / dependable rhythm", 
      confidence: 0.78 
    },
    { 
      id: "theme.elemental.water-2", 
      label: "deep emotional churn / rebirth work", 
      confidence: 0.73 
    }
  ],
  emerging: [
    { 
      id: "theme.elemental.air-2", 
      label: "clear thinking returning / honest dialogue", 
      confidence: 0.64 
    },
    { 
      id: "theme.elemental.aether-2", 
      label: "liminal sensing / meaning opening", 
      confidence: 0.58 
    }
  ],
  shadowSignals: [
    {
      id: "shadow.deflection",
      label: "gentle avoidance showing up",
      intensity: 0.41,
      suggestion: "naming one small truth out loud tends to restore momentum."
    }
  ],
  timingHint: {
    label: "good window for courageous starts",
    horizon: "days",
    confidence: 0.72
  }
};

// =============================================================================
// EXAMPLE: GET /api/collective/snapshot?expert=true (Expert Mode)
// =============================================================================

export const exampleSnapshotExpert: CollectiveSnapshot = {
  generatedAt: "2025-01-09T20:11:00Z",
  window: "7d",
  coherence: { 
    value: 72, 
    trend: "rising", 
    delta: 4 
  },
  topThemes: [
    { 
      id: "theme.elemental.fire-2", 
      label: "courage rising / decisive energy gathering", 
      confidence: 0.86,
      internal: { code: "Fire-2" }
    },
    { 
      id: "theme.elemental.earth-3", 
      label: "systems clicking into place / dependable rhythm", 
      confidence: 0.78,
      internal: { code: "Earth-3" }
    },
    { 
      id: "theme.elemental.water-2", 
      label: "deep emotional churn / rebirth work", 
      confidence: 0.73,
      internal: { code: "Water-2" }
    }
  ],
  emerging: [
    { 
      id: "theme.elemental.air-2", 
      label: "clear thinking returning / honest dialogue", 
      confidence: 0.64,
      internal: { code: "Air-2" }
    },
    { 
      id: "theme.elemental.aether-2", 
      label: "liminal sensing / meaning opening", 
      confidence: 0.58,
      internal: { code: "Aether-2" }
    }
  ],
  shadowSignals: [
    {
      id: "shadow.deflection",
      label: "gentle avoidance showing up",
      intensity: 0.41,
      suggestion: "naming one small truth out loud tends to restore momentum.",
      internal: { code: "deflection" }
    }
  ],
  timingHint: {
    label: "good window for courageous starts (Fire-2, Earth-3)",
    horizon: "days",
    confidence: 0.72
  }
};

// =============================================================================
// EXAMPLE: GET /api/collective/patterns
// =============================================================================

export const examplePatterns: PatternsResponse = {
  generatedAt: "2025-01-09T20:11:00Z",
  window: "7d",
  items: [
    {
      id: "elemental_wave_fire_1736456712000",
      kind: "elementalWave",
      label: "Fire wave continues to peak and transform. Expect creative breakthroughs.",
      confidence: 0.86,
      momentum: "rising",
      startedAt: "2025-01-08T14:30:00Z"
    },
    {
      id: "archetypal_shift_trickster_1736456713000",
      kind: "archetype", 
      label: "Transformation through major disruption. Breakthrough patterns shift.",
      confidence: 0.71,
      momentum: "stable",
      startedAt: "2025-01-07T09:15:00Z"
    },
    {
      id: "shadow_surfacing_perfectionism_1736456714000",
      kind: "shadow",
      label: "Perfectionism pattern surfaces for integration. Building acceptance is key.",
      confidence: 0.63,
      momentum: "rising",
      startedAt: "2025-01-09T11:22:00Z"
    },
    {
      id: "consciousness_leap_1736456715000",
      kind: "theme",
      label: "Collective consciousness elevation continues. Integration phase likely to follow.",
      confidence: 0.79,
      momentum: "stable",
      startedAt: "2025-01-06T16:45:00Z"
    }
  ]
};

// =============================================================================
// EXAMPLE: GET /api/collective/timing
// =============================================================================

export const exampleTiming: TimingResponse = {
  generatedAt: "2025-01-09T20:11:00Z",
  horizon: "7d",
  windows: [
    {
      id: "favorable_window_1",
      label: "favorable window for honest conversations",
      opensAt: "2025-01-09T22:11:00Z",
      closesAt: "2025-01-12T20:11:00Z",
      confidence: 0.75,
      suggestions: [
        "speak one difficult truth gently",
        "ask for what you actually need",
        "have the conversation you've been avoiding"
      ]
    },
    {
      id: "creative_window_1", 
      label: "creative fire energy peaks",
      opensAt: "2025-01-10T06:00:00Z",
      closesAt: "2025-01-11T18:00:00Z",
      confidence: 0.68,
      suggestions: [
        "start the project you've been planning",
        "take one bold creative risk",
        "express something authentic"
      ]
    }
  ]
};

// =============================================================================
// MAYA-STYLE COPY EXAMPLES
// =============================================================================

export const mayaCopyExamples = {
  headerReflection: "Today has a steady feel. I'm seeing courage rising, with systems clicking into place. If you've been waiting to start, this is a supportive window.",
  
  shadowNudge: "I notice a subtle tendency to delay the hard sentence. Try naming one small truth aloud—it usually brings relief.",
  
  timingHint: "The next few days favor honest conversations and clean starts. Keep it simple and kind.",
  
  expertAside: "(The pattern aligns with a Fire-2 → Earth-3 transition.)",
  
  lowCoherence: "Today feels tender and uncertain. Focus on one small, grounding practice. Trust that clarity will return.",
  
  highCoherence: "There's beautiful alignment in the field right now. This is fertile ground for meaningful conversations and courageous starts.",
  
  emergingPattern: "I'm sensing something new trying to emerge around creative expression. Pay attention to what wants to be made or shared."
};

// =============================================================================
// PRACTICE SUGGESTIONS BY THEME
// =============================================================================

export const practicesByTheme = {
  "courage rising": [
    "take one small brave step",
    "speak your truth in one sentence", 
    "do the thing you've been avoiding"
  ],
  
  "clear thinking returning": [
    "write down what's actually true",
    "have the honest conversation",
    "make the decision you've been delaying"
  ],
  
  "deep emotional churn": [
    "let yourself feel for 60 seconds",
    "journal without editing",
    "call someone who understands"
  ],
  
  "systems clicking into place": [
    "organize one small area completely",
    "follow through on one commitment",
    "create one reliable routine"
  ],
  
  "liminal sensing": [
    "pause and sense what matters most",
    "spend 5 minutes in silence",
    "notice what wants your attention"
  ]
};

// =============================================================================
// TESTING HELPER FUNCTIONS
// =============================================================================

export function logExampleResponse(type: 'snapshot' | 'patterns' | 'timing', expertMode: boolean = false) {
  console.log(`\n=== EXAMPLE ${type.toUpperCase()} RESPONSE ${expertMode ? '(EXPERT MODE)' : '(REGULAR)'} ===\n`);
  
  switch (type) {
    case 'snapshot':
      console.log(JSON.stringify(expertMode ? exampleSnapshotExpert : exampleSnapshotRegular, null, 2));
      break;
    case 'patterns':
      console.log(JSON.stringify(examplePatterns, null, 2));
      break;
    case 'timing':
      console.log(JSON.stringify(exampleTiming, null, 2));
      break;
  }
}

export function demonstrateLanguageMapping() {
  console.log('\n=== LANGUAGE MAPPING EXAMPLES ===\n');
  
  console.log('Internal Code → Phenomenological Language:');
  console.log('Water-2 → "deep emotional churn / rebirth work"');
  console.log('Fire-2 → "courage rising / decisive energy gathering"');
  console.log('deflection → "gentle avoidance showing up"');
  console.log('trickster → "creative chaos / breakthrough disruption"');
  
  console.log('\nMaya-style suggestions:');
  console.log('• naming one small truth out loud tends to restore momentum');
  console.log('• try asking "what\'s one small thing I can influence right now?"');
  console.log('• experiment with "good enough for now" and see what opens');
}