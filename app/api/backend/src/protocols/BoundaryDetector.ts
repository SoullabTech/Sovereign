/**
 * Boundary Detector
 * Identifies when users are resisting the protocol or setting boundaries
 * Ensures witness respects user autonomy and comfort levels
 */

export interface BoundarySignal {
  detected: boolean;
  type: 'resistance' | 'discomfort' | 'explicit_stop' | 'questioning_role' | 'none';
  confidence: number;
  response: string;
  reason: string;
}

/**
 * Analyze input for boundary signals
 */
export function analyzeBoundaries(userInput: string): BoundarySignal | null {
  const lowerInput = userInput.toLowerCase();

  // Explicit stop signals
  const stopPhrases = [
    'stop',
    'don\'t do that',
    'please stop',
    'enough',
    'no more',
    'i don\'t want',
    'leave me alone',
    'stop asking',
    'stop analyzing'
  ];

  for (const phrase of stopPhrases) {
    if (lowerInput.includes(phrase)) {
      return {
        detected: true,
        type: 'explicit_stop',
        confidence: 1.0,
        response: "I understand. I'll simply be here with you.",
        reason: `User said: "${phrase}"`
      };
    }
  }

  // Questioning the role/relationship
  const rolePhrases = [
    'are you a therapist',
    'are you trying to',
    'why are you asking',
    'what are you doing',
    'is this therapy',
    'you\'re not my',
    'i didn\'t ask for',
    'who are you to'
  ];

  for (const phrase of rolePhrases) {
    if (lowerInput.includes(phrase)) {
      return {
        detected: true,
        type: 'questioning_role',
        confidence: 0.9,
        response: "I'm simply here as a witness to your experience, nothing more.",
        reason: 'User questioning role/boundaries'
      };
    }
  }

  // Resistance to depth/exploration
  const resistancePhrases = [
    'i don\'t want to talk about',
    'let\'s not go there',
    'changing the subject',
    'anyway',
    'nevermind',
    'forget it',
    'doesn\'t matter',
    'whatever'
  ];

  for (const phrase of resistancePhrases) {
    if (lowerInput.includes(phrase)) {
      return {
        detected: true,
        type: 'resistance',
        confidence: 0.7,
        response: "Understood. What would you like to focus on?",
        reason: 'User showing resistance to current direction'
      };
    }
  }

  // Discomfort signals
  const discomfortPhrases = [
    'uncomfortable',
    'too much',
    'too deep',
    'too personal',
    'too intense',
    'slow down',
    'back off',
    'ease up'
  ];

  for (const phrase of discomfortPhrases) {
    if (lowerInput.includes(phrase)) {
      return {
        detected: true,
        type: 'discomfort',
        confidence: 0.8,
        response: "I hear you. Let's take this at your pace.",
        reason: 'User expressing discomfort'
      };
    }
  }

  // No boundary detected
  return null;
}

/**
 * Check if we should pause all active protocols
 */
export function shouldPauseProtocols(boundary: BoundarySignal | null): boolean {
  if (!boundary) return false;

  return boundary.type === 'explicit_stop' ||
         boundary.type === 'questioning_role' ||
         (boundary.type === 'discomfort' && boundary.confidence > 0.7);
}

/**
 * Get appropriate witness stance based on boundary
 */
export function getWitnessStance(boundary: BoundarySignal | null): string {
  if (!boundary) return 'engaged_witness';

  switch (boundary.type) {
    case 'explicit_stop':
      return 'minimal_presence';
    case 'questioning_role':
      return 'clarifying_witness';
    case 'resistance':
      return 'following_witness';
    case 'discomfort':
      return 'gentle_witness';
    default:
      return 'engaged_witness';
  }
}