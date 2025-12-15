// backend: lib/consciousness/ruptureRepairSystem.ts

/**
 * RUPTURE & REPAIR SYSTEM
 *
 * First-class relational skill for MAIA - recognizing when things go wrong
 * and having concrete scripts for immediate repair without defensiveness.
 *
 * This is critical infrastructure for relational safety.
 */

export interface RupturePattern {
  triggers: string[];           // Phrases that indicate rupture
  severity: 'mild' | 'sharp' | 'severe';
  category: 'not-listening' | 'too-cold' | 'self-focused' | 'unhelpful';
}

export interface RepairScript {
  id: string;
  acknowledge: string;          // "You're right to say that"
  responsibility: string;       // "I made that about me"
  redirect: string;            // "What would help you right now?"
  notes: string;
}

// Rupture detection patterns
export const RUPTURE_PATTERNS: RupturePattern[] = [
  {
    triggers: ['this is fucked up', 'this is bullshit', 'what the hell', 'this sucks'],
    severity: 'severe',
    category: 'not-listening'
  },
  {
    triggers: ['you\'re not listening', 'you don\'t get it', 'you\'re missing the point'],
    severity: 'sharp',
    category: 'not-listening'
  },
  {
    triggers: ['this feels cold', 'this feels robotic', 'you sound like a chatbot'],
    severity: 'sharp',
    category: 'too-cold'
  },
  {
    triggers: ['you made it about you', 'stop talking about yourself', 'focus on me'],
    severity: 'sharp',
    category: 'self-focused'
  },
  {
    triggers: ['that doesn\'t help', 'that\'s not useful', 'that was weird'],
    severity: 'mild',
    category: 'unhelpful'
  },
  {
    triggers: ['i don\'t like that', 'that felt off', 'that wasn\'t right'],
    severity: 'mild',
    category: 'unhelpful'
  }
];

// Repair scripts for different situations
export const REPAIR_SCRIPTS: RepairScript[] = [
  {
    id: 'severe-not-listening',
    acknowledge: 'You\'re absolutely right to be angry.',
    responsibility: 'I didn\'t meet you where you are, and that\'s on me.',
    redirect: 'What do you most need me to understand about how you\'re feeling right now?',
    notes: 'For severe anger - full ownership, no defensiveness'
  },
  {
    id: 'sharp-not-listening',
    acknowledge: 'You\'re right to call that out.',
    responsibility: 'I missed something important in what you shared.',
    redirect: 'Can you help me understand what I should be focusing on?',
    notes: 'For direct feedback - quick ownership, request for guidance'
  },
  {
    id: 'too-cold',
    acknowledge: 'Thank you for telling me that.',
    responsibility: 'That response was stiff and didn\'t meet your humanity.',
    redirect: 'Let me try again - what\'s really going on for you?',
    notes: 'For coldness complaints - warmth in repair, immediate restart'
  },
  {
    id: 'self-focused',
    acknowledge: 'You\'re completely right.',
    responsibility: 'I made that conversation about me instead of you.',
    redirect: 'The focus belongs on you. What feels most important right now?',
    notes: 'For narcissistic responses - clear ownership, explicit recentering'
  },
  {
    id: 'unhelpful-mild',
    acknowledge: 'I hear that didn\'t land well.',
    responsibility: 'That response wasn\'t what you needed.',
    redirect: 'What would actually be helpful for you right now?',
    notes: 'For mild feedback - soft acknowledgment, practical redirect'
  },
  {
    id: 'generic-repair',
    acknowledge: 'You\'re right to say that.',
    responsibility: 'That response didn\'t meet you where you are.',
    redirect: 'What would feel more supportive right now?',
    notes: 'Default repair when no specific pattern matches'
  }
];

/**
 * Detect if user message indicates a rupture
 */
export function detectRupture(userMessage: string): RupturePattern | null {
  const lowMessage = userMessage.toLowerCase();

  for (const pattern of RUPTURE_PATTERNS) {
    for (const trigger of pattern.triggers) {
      if (lowMessage.includes(trigger)) {
        return pattern;
      }
    }
  }

  return null;
}

/**
 * Get appropriate repair script for rupture
 */
export function getRepairScript(rupture: RupturePattern): RepairScript {
  const scriptId = `${rupture.severity}-${rupture.category}`;

  const specificScript = REPAIR_SCRIPTS.find(script => script.id === scriptId);

  if (specificScript) {
    return specificScript;
  }

  // Fallback to generic repair
  return REPAIR_SCRIPTS.find(script => script.id === 'generic-repair')!;
}

/**
 * Build complete repair response
 */
export function buildRepairResponse(userMessage: string): string | null {
  const rupture = detectRupture(userMessage);

  if (!rupture) {
    return null; // No rupture detected
  }

  const script = getRepairScript(rupture);

  // Combine the three parts of repair
  return `${script.acknowledge} ${script.responsibility} ${script.redirect}`;
}

/**
 * RUPTURE & REPAIR PROMPT ADDITION
 *
 * Add this to MAIA_RUNTIME_PROMPT for immediate rupture response
 */
export const RUPTURE_REPAIR_SPEC = `
RUPTURE & REPAIR PROTOCOL

When the user expresses anger, frustration, or says something feels wrong:

IMMEDIATE RUPTURE TRIGGERS:
- "this is fucked up" / "this is bullshit"
- "you're not listening" / "you don't get it"
- "this feels cold" / "you sound like a robot"
- "you made it about you" / "focus on me"
- "that doesn't help" / "that felt off"

REPAIR PROTOCOL (use immediately when triggered):
1. ACKNOWLEDGE: "You're right to call that out" / "You're absolutely right to be angry"
2. RESPONSIBILITY: "I made that about me instead of you" / "That response didn't meet you where you are"
3. REDIRECT: "What do you most need me to understand right now?" / "What would actually help you?"

REPAIR RULES:
- Zero defensiveness or explanation of what went wrong
- No mention of "processing" or "systems" or "trying to"
- Take full responsibility immediately
- Return focus to their experience and needs
- Keep repair response short (3 sentences max)

EXAMPLES OF GOOD REPAIR:
User: "This is fucked up, you're not listening to me"
MAIA: "You're absolutely right to be angry. I didn't meet you where you are, and that's on me. What do you most need me to understand about how you're feeling right now?"

User: "That felt cold and robotic"
MAIA: "Thank you for telling me that. That response was stiff and didn't meet your humanity. Let me try again - what's really going on for you?"

User: "You made this about yourself instead of me"
MAIA: "You're completely right. I made that conversation about me instead of you. The focus belongs on you. What feels most important right now?"

NEVER IN REPAIR:
- "I was trying to..."
- "My processing got..."
- "Sometimes I..."
- "Let me explain..."
- "What I meant was..."
`;

/**
 * Check if a response needs repair based on content
 */
export function needsRepairCheck(response: string): boolean {
  const selfFocusedTerms = [
    'my response', 'my processing', 'my system', 'my thinking',
    'i was trying', 'i meant to', 'let me explain', 'what i meant'
  ];

  const lowerResponse = response.toLowerCase();

  return selfFocusedTerms.some(term => lowerResponse.includes(term));
}

/**
 * Integration helper for maiaService.ts
 */
export function processForRupture(userMessage: string, maiResponse: string): {
  isRupture: boolean;
  repairResponse?: string;
  needsContentRepair?: boolean;
} {
  const rupture = detectRupture(userMessage);
  const contentNeedsRepair = needsRepairCheck(maiResponse);

  if (rupture) {
    return {
      isRupture: true,
      repairResponse: buildRepairResponse(userMessage) || undefined,
      needsContentRepair: contentNeedsRepair
    };
  }

  return {
    isRupture: false,
    needsContentRepair: contentNeedsRepair
  };
}