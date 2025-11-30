/**
 * Urgency Detector
 * Identifies time pressure and urgency in user communication
 * Adjusts response depth and complexity accordingly
 */

export interface UrgencySignal {
  detected: boolean;
  level: number;        // 0-1 urgency scale
  type: 'time_constraint' | 'emotional_urgency' | 'decision_pressure' | 'crisis_adjacent' | 'none';
  response: string;
  reason: string;
  suggestedDepth: 'brief' | 'moderate' | 'full';
}

/**
 * Analyze input for urgency signals
 */
export function analyzeUrgency(userInput: string): UrgencySignal | null {
  const lowerInput = userInput.toLowerCase();
  let urgencyLevel = 0;
  let urgencyType: UrgencySignal['type'] = 'none';
  let reason = '';

  // Time constraint signals
  const timePhrases = [
    'only have a minute',
    'quick question',
    'real quick',
    'short on time',
    'in a hurry',
    'gotta go',
    'before i forget',
    'really quickly',
    'just briefly'
  ];

  for (const phrase of timePhrases) {
    if (lowerInput.includes(phrase)) {
      urgencyLevel = Math.max(urgencyLevel, 0.8);
      urgencyType = 'time_constraint';
      reason = 'User has time constraints';
      break;
    }
  }

  // Decision pressure signals
  const decisionPhrases = [
    'need to decide',
    'have to choose',
    'what should i do',
    'help me decide',
    'need an answer',
    'yes or no',
    'should i or shouldn\'t i',
    'deadline',
    'by tomorrow',
    'by today'
  ];

  for (const phrase of decisionPhrases) {
    if (lowerInput.includes(phrase)) {
      urgencyLevel = Math.max(urgencyLevel, 0.7);
      if (urgencyType === 'none') {
        urgencyType = 'decision_pressure';
        reason = 'User facing decision pressure';
      }
    }
  }

  // Emotional urgency (but not crisis)
  const emotionalPhrases = [
    'can\'t take it',
    'need help now',
    'urgent',
    'asap',
    'immediately',
    'right now',
    'freaking out',
    'losing it',
    'desperate'
  ];

  for (const phrase of emotionalPhrases) {
    if (lowerInput.includes(phrase)) {
      urgencyLevel = Math.max(urgencyLevel, 0.9);
      urgencyType = 'emotional_urgency';
      reason = 'User expressing emotional urgency';
      break;
    }
  }

  // Crisis-adjacent (not full crisis but heightened state)
  const crisisAdjacentPhrases = [
    'emergency',
    'crisis',
    'falling apart',
    'can\'t cope',
    'breaking down'
  ];

  for (const phrase of crisisAdjacentPhrases) {
    if (lowerInput.includes(phrase)) {
      urgencyLevel = 1.0;
      urgencyType = 'crisis_adjacent';
      reason = 'User in heightened state (crisis-adjacent)';
      break;
    }
  }

  // Check for question marks and exclamation points
  const questionMarks = (lowerInput.match(/\?/g) || []).length;
  const exclamationMarks = (lowerInput.match(/!/g) || []).length;

  if (questionMarks > 1 || exclamationMarks > 1) {
    urgencyLevel = Math.min(urgencyLevel + 0.2, 1.0);
    if (reason === '') {
      reason = 'Multiple punctuation marks suggest urgency';
    }
  }

  // No significant urgency detected
  if (urgencyLevel < 0.3) {
    return null;
  }

  // Determine suggested depth based on urgency
  let suggestedDepth: UrgencySignal['suggestedDepth'] = 'full';
  if (urgencyLevel > 0.7) {
    suggestedDepth = 'brief';
  } else if (urgencyLevel > 0.5) {
    suggestedDepth = 'moderate';
  }

  // Generate appropriate response based on urgency type
  let response = "I hear the urgency. ";
  switch (urgencyType) {
    case 'time_constraint':
      response = "I'll keep this brief and direct.";
      break;
    case 'emotional_urgency':
      response = "I'm here with you right now. Let's focus on what's most immediate.";
      break;
    case 'decision_pressure':
      response = "I hear you need clarity quickly. Let me reflect what I'm noticing.";
      break;
    case 'crisis_adjacent':
      response = "I'm fully present with you. What needs attention right now?";
      break;
    default:
      response = "I'll be concise and focused.";
  }

  return {
    detected: true,
    level: urgencyLevel,
    type: urgencyType,
    response,
    reason,
    suggestedDepth
  };
}

/**
 * Check if urgency overrides other protocols
 */
export function shouldOverrideProtocols(urgency: UrgencySignal | null): boolean {
  if (!urgency) return false;

  // High urgency overrides exploration protocols
  return urgency.level > 0.7 ||
         urgency.type === 'crisis_adjacent' ||
         urgency.type === 'emotional_urgency';
}

/**
 * Adjust response length based on urgency
 */
export function getResponseLength(urgency: UrgencySignal | null): 'brief' | 'moderate' | 'full' {
  if (!urgency) return 'moderate';

  if (urgency.level > 0.8) return 'brief';
  if (urgency.level > 0.5) return 'moderate';
  return 'full';
}

/**
 * Get urgency-appropriate witness mode
 */
export function getUrgencyMode(urgency: UrgencySignal | null): string {
  if (!urgency) return 'exploratory_witness';

  switch (urgency.type) {
    case 'time_constraint':
      return 'efficient_witness';
    case 'emotional_urgency':
      return 'stabilizing_witness';
    case 'decision_pressure':
      return 'clarifying_witness';
    case 'crisis_adjacent':
      return 'grounding_witness';
    default:
      return 'focused_witness';
  }
}