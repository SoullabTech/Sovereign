/**
 * Spiralogic Consciousness Architecture Types
 * Enforces differentiation below, integration above
 */

export type Element = 'fire' | 'water' | 'earth' | 'air';

export interface SpiralogicContext {
  userId: string;
  moment: {
    text: string;
    affectHints?: string[];
  };
  currents: Array<{
    element: Element;
    intensity: number
  }>; // parallel processing
  separators: {
    callosalInhibition: true
  }; // enforces no cross-talk
  memoryPointers: string[]; // fractal echoes (20% weight)
  meta: {
    trustBreath: 'expanding' | 'contracting' | 'steady';
  };
}

export interface ElementalContribution {
  element: Element;
  insight: string;
  summary: string;
  resonance: number;
  tension?: string; // productive tension with other elements
}

export interface CrownSynthesis {
  lines: string[];                              // sacred reflection lines
  rationaleParallax: string[];                  // how differences created depth
  elementContrib: Record<Element, string>;      // what each contributed
  aetherTone: 'integrative' | 'spacious' | 'anchoring';
  productiveTensions: string[];                 // named tensions that create depth
}