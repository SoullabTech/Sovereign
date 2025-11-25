// Motion Mapper - Maps audio states to visual chord effects

export interface ChordVisual {
  chord: boolean;
  elements: string[];
  visual: {
    glow: string[];
    ripple: string;
    pulseRate: number;
    bloom?: boolean;
    shimmer?: boolean;
  };
}

// Map chord states to visual effects
export function mapChordVisual(elements: string[]): ChordVisual {
  const isGrandBloom = elements.length >= 12;
  const isMajorChord = elements.length >= 6;
  
  return {
    chord: true,
    elements,
    visual: {
      glow: elements.map((el) => `${el}-glow`),
      ripple: isGrandBloom ? "grand-ripple" : 
               isMajorChord ? "major-ripple" : 
               "harmonic-ripple",
      pulseRate: isGrandBloom ? 2.5 : 
                 isMajorChord ? 1.8 : 
                 1 + elements.length * 0.15,
      bloom: isGrandBloom,
      shimmer: isMajorChord || isGrandBloom
    }
  };
}

// Map motion states to descriptions
export const motionStates = {
  listening: {
    description: "Gentle breathing",
    pulseRate: 0.8,
    opacity: 0.6,
    scale: 1.0
  },
  processing: {
    description: "Spiral glow, ripple",
    pulseRate: 1.2,
    opacity: 0.8,
    scale: 1.05,
    rotation: true
  },
  responding: {
    description: "Petals glow",
    pulseRate: 1.5,
    opacity: 1.0,
    scale: 1.1,
    glow: true
  },
  breakthrough: {
    description: "Golden starburst",
    pulseRate: 2.0,
    opacity: 1.0,
    scale: 1.3,
    starburst: true,
    color: "#FFD700"
  }
};

// Get animation properties for current state
export function getMotionAnimation(state: string, chord?: ChordVisual) {
  const baseState = motionStates[state as keyof typeof motionStates] || motionStates.listening;
  
  if (chord) {
    return {
      ...baseState,
      pulseRate: chord.visual.pulseRate,
      elements: chord.elements,
      ripple: chord.visual.ripple,
      bloom: chord.visual.bloom,
      shimmer: chord.visual.shimmer
    };
  }
  
  return baseState;
}

// Calculate stagger delay for harmonic effects
export function getStaggerDelay(index: number, total: number): number {
  if (total >= 12) {
    // Grand bloom - radial stagger
    return (index / total) * 0.5;
  } else if (total >= 6) {
    // Major chord - wave stagger
    return index * 0.1;
  } else {
    // Simple chord - sequential
    return index * 0.2;
  }
}

// Get color for element
export function getElementColor(element: string): string {
  const colors: Record<string, string> = {
    fire: "#FF6B6B",
    water: "#4ECDC4",
    earth: "#95E77E",
    air: "#FFE66D",
    aether: "#C77DFF",
    void: "#2D3436",
    light: "#FFFFFF",
    shadow: "#636E72",
    spirit: "#A29BFE",
    time: "#6C5CE7",
    space: "#0984E3",
    unity: "#FDCB6E"
  };
  
  return colors[element.toLowerCase()] || "#DDA0DD";
}