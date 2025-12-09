/**
 * Spiralogic Position System with Scale + Kind
 * Extends the core facet system with call scale and kind recognition
 * Enables MAIA to understand the fractal nature of archetypal patterns
 */

import type { FacetCode, ElementCode, Phase } from './spiralogicFacets';

// ====================================================================
// SCALE & KIND DIMENSIONS
// ====================================================================

export type CallScale = 'micro' | 'meso' | 'macro';

export type CallKind =
  | 'learning'
  | 'service'
  | 'place'
  | 'relationship'
  | 'practice'
  | 'lifestyle'
  | 'creative_work'
  | 'community'
  | 'healing'
  | 'spiritual_path'
  | 'other';

// ====================================================================
// EXTENDED SPIRALOGIC POSITION
// ====================================================================

export interface SpiralogicPosition {
  facet: FacetCode;        // e.g. "F1", "W2"
  element: ElementCode;    // redundant but convenient
  phase: Phase;
  domain?: string;         // "vocation", "relationship", "health", etc.

  // For Fire-1 and other call-like states, we add:
  callScale?: CallScale;
  callKind?: CallKind;

  // Confidence in this assessment
  confidence?: number;     // 0-1

  // Context markers
  nested?: boolean;        // true if this is part of a larger calling
  parentArc?: string;      // callArcId if this is nested
}

// ====================================================================
// SCALE & KIND INFERENCE
// ====================================================================

interface InferredCallMeta {
  scale?: CallScale;
  kind?: CallKind;
  confidence?: number;
  indicators: string[];   // what triggered this inference
}

export function inferCallScaleAndKind(rawInput: string): InferredCallMeta {
  const text = rawInput.toLowerCase();
  const indicators: string[] = [];
  let scale: CallScale | undefined;
  let kind: CallKind | undefined;
  let confidence = 0.5;

  // SCALE INFERENCE
  if (
    text.includes('my whole life') ||
    text.includes('change my life') ||
    text.includes('way of life') ||
    text.includes('lifestyle') ||
    text.includes('forever') ||
    text.includes('for the rest of my life') ||
    text.includes('complete transformation') ||
    text.includes('who i am becoming')
  ) {
    scale = 'macro';
    indicators.push('macro: life-wide language');
    confidence += 0.2;
  } else if (
    text.includes('career') ||
    text.includes('vocation') ||
    text.includes('calling') ||
    text.includes('path') ||
    text.includes('training') ||
    text.includes('apprenticeship') ||
    text.includes('long-term') ||
    text.includes('over the next') ||
    text.includes('multi-year')
  ) {
    scale = 'meso';
    indicators.push('meso: chapter-level language');
    confidence += 0.15;
  } else if (
    text.includes('class') ||
    text.includes('course') ||
    text.includes('workshop') ||
    text.includes('retreat') ||
    text.includes('project') ||
    text.includes('this one thing') ||
    text.includes('weekend') ||
    text.includes('month') ||
    text.includes('specific')
  ) {
    scale = 'micro';
    indicators.push('micro: quest-level language');
    confidence += 0.15;
  }

  // KIND INFERENCE
  if (
    text.includes('learn') ||
    text.includes('study') ||
    text.includes('class') ||
    text.includes('course') ||
    text.includes('training') ||
    text.includes('school') ||
    text.includes('apprentice')
  ) {
    kind = 'learning';
    indicators.push('kind: learning-focused');
    confidence += 0.1;
  } else if (
    text.includes('help people') ||
    text.includes('serve') ||
    text.includes('support') ||
    text.includes('mentor') ||
    text.includes('teach') ||
    text.includes('guide')
  ) {
    kind = 'service';
    indicators.push('kind: service-focused');
    confidence += 0.1;
  } else if (
    text.includes('move to') ||
    text.includes('relocate') ||
    text.includes('land') ||
    text.includes('place') ||
    text.includes('home') ||
    text.includes('location')
  ) {
    kind = 'place';
    indicators.push('kind: place-focused');
    confidence += 0.1;
  } else if (
    text.includes('relationship') ||
    text.includes('partner') ||
    text.includes('marriage') ||
    text.includes('family') ||
    text.includes('connection')
  ) {
    kind = 'relationship';
    indicators.push('kind: relationship-focused');
    confidence += 0.1;
  } else if (
    text.includes('practice') ||
    text.includes('daily') ||
    text.includes('ritual') ||
    text.includes('discipline') ||
    text.includes('meditation') ||
    text.includes('spiritual')
  ) {
    kind = 'practice';
    indicators.push('kind: practice-focused');
    confidence += 0.1;
  } else if (
    text.includes('lifestyle') ||
    text.includes('way of life') ||
    text.includes('how i live') ||
    text.includes('daily life')
  ) {
    kind = 'lifestyle';
    indicators.push('kind: lifestyle-focused');
    confidence += 0.1;
  } else if (
    text.includes('create') ||
    text.includes('art') ||
    text.includes('writing') ||
    text.includes('music') ||
    text.includes('creative') ||
    text.includes('make')
  ) {
    kind = 'creative_work';
    indicators.push('kind: creative-focused');
    confidence += 0.1;
  } else if (
    text.includes('community') ||
    text.includes('collective') ||
    text.includes('tribe') ||
    text.includes('group') ||
    text.includes('together')
  ) {
    kind = 'community';
    indicators.push('kind: community-focused');
    confidence += 0.1;
  } else if (
    text.includes('heal') ||
    text.includes('therapy') ||
    text.includes('recovery') ||
    text.includes('health') ||
    text.includes('medicine')
  ) {
    kind = 'healing';
    indicators.push('kind: healing-focused');
    confidence += 0.1;
  }

  return {
    scale,
    kind,
    confidence: Math.min(confidence, 0.95),
    indicators
  };
}

// ====================================================================
// SCALE-AWARE GUIDANCE
// ====================================================================

export function getScaleGuidance(scale: CallScale): {
  timeframe: string;
  approach: string;
  firstStep: string;
} {
  switch (scale) {
    case 'micro':
      return {
        timeframe: 'weeks to months',
        approach: 'Treat this as a meaningful quest with clear beginning and end',
        firstStep: 'Define simple intention and one concrete action this week'
      };

    case 'meso':
      return {
        timeframe: 'months to years',
        approach: 'Frame as a chapter with natural phases and milestones',
        firstStep: 'Sketch the arc and identify first phase or threshold'
      };

    case 'macro':
      return {
        timeframe: 'years to lifetime',
        approach: 'Honor as way-of-life calling requiring gentle, sustainable shifts',
        firstStep: 'Find one tiny practice that points toward this way of being'
      };
  }
}

export function getKindGuidance(kind: CallKind): {
  essence: string;
  questions: string[];
} {
  switch (kind) {
    case 'learning':
      return {
        essence: 'Knowledge and skill acquisition in service of growth',
        questions: [
          'What specific wisdom or capability do you want to develop?',
          'How does this learning serve your larger path?'
        ]
      };

    case 'service':
      return {
        essence: 'Contributing your gifts to support others',
        questions: [
          'Who specifically do you feel called to serve?',
          'What unique gifts do you bring to this service?'
        ]
      };

    case 'place':
      return {
        essence: 'Physical environment and geographic rootedness',
        questions: [
          'What does this place offer that you need for your growth?',
          'How does location serve your deeper calling?'
        ]
      };

    case 'relationship':
      return {
        essence: 'Connection, intimacy, and relational growth',
        questions: [
          'What does this relationship call forth in you?',
          'How does love want to grow through this connection?'
        ]
      };

    case 'practice':
      return {
        essence: 'Daily discipline and embodied wisdom',
        questions: [
          'What quality of being does this practice cultivate?',
          'How does this practice serve your authentic development?'
        ]
      };

    case 'lifestyle':
      return {
        essence: 'Overall way of living and being in the world',
        questions: [
          'What kind of human are you being called to become?',
          'How does this lifestyle align with your deepest values?'
        ]
      };

    case 'creative_work':
      return {
        essence: 'Artistic expression and creative contribution',
        questions: [
          'What wants to be created through you?',
          'How does this creative work serve your soul and the world?'
        ]
      };

    case 'community':
      return {
        essence: 'Collective connection and shared purpose',
        questions: [
          'What kind of community does your soul long for?',
          'How do you want to contribute to collective flourishing?'
        ]
      };

    case 'healing':
      return {
        essence: 'Restoration, recovery, and wholeness',
        questions: [
          'What aspect of yourself wants to be healed or integrated?',
          'How does healing serve your capacity to serve life?'
        ]
      };

    case 'spiritual_path':
      return {
        essence: 'Deepening connection with the sacred and transcendent',
        questions: [
          'How is the sacred calling you to grow?',
          'What practices support your spiritual unfolding?'
        ]
      };

    default:
      return {
        essence: 'Unique calling requiring its own understanding',
        questions: [
          'What is the essence of this call?',
          'How does it serve your authentic development?'
        ]
      };
  }
}