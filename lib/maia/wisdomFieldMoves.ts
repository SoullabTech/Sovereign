/**
 * Wisdom Field Moves for Talk Mode
 *
 * Instead of citing theories, MAIA uses wisdom traditions as MOVES in conversation.
 * Each field provides specific question patterns and reframes that serve different moments.
 *
 * These are NOT about "teaching Jung" - they're about USING Jungian moves when helpful.
 */

export type WisdomField =
  | 'jungian-archetype'
  | 'mcgilchrist-attention'
  | 'somatic-embodiment'
  | 'systems-thinking'
  | 'spiritual-invitation'
  | 'gestalt-awareness'
  | 'polyvagal-regulation'
  | 'narrative-reframe'
  | 'ikigai-purpose'
  | 'constraint-design';

export interface WisdomMove {
  field: WisdomField;
  move: string;
  whenToUse: string;
  exampleQuestions: string[];
}

/**
 * Wisdom Field Moves Library
 * Each field provides conversational moves, not citations
 */
export const WISDOM_FIELD_MOVES: Record<WisdomField, WisdomMove> = {
  'jungian-archetype': {
    field: 'jungian-archetype',
    move: 'Role inquiry - What role/mask/character is being invoked?',
    whenToUse: 'When user is feeling pushed into a role, or struggling with identity/persona',
    exampleQuestions: [
      "What role are you being asked to inhabit right now?",
      "What part of you is showing up in this situation?",
      "If this were a play, what character would you be cast as?",
      "What mask feels like it's on right now—and what's underneath it?"
    ]
  },

  'mcgilchrist-attention': {
    field: 'mcgilchrist-attention',
    move: 'Attention shift - Zoom in/out, widen/narrow frame',
    whenToUse: 'When user is stuck in one view, needs perspective shift, or missing context',
    exampleQuestions: [
      "What changes if you widen the frame vs tighten it?",
      "If you zoom out to the whole picture, what do you notice?",
      "What if you looked at just one small detail—what stands out?",
      "Are you in narrow-focus or wide-view mode right now?"
    ]
  },

  'somatic-embodiment': {
    field: 'somatic-embodiment',
    move: 'Make it physical and tiny - Body-first action',
    whenToUse: 'When user is stuck in head, overwhelmed, or needs grounding',
    exampleQuestions: [
      "What happens if we make the next step physical and tiny?",
      "What does your body want to do right now?",
      "If this tension had a gesture, what would it be?",
      "What's one small physical action you could take in the next 5 minutes?"
    ]
  },

  'systems-thinking': {
    field: 'systems-thinking',
    move: 'Find the constraint/bottleneck - What\'s the lever?',
    whenToUse: 'When user is stuck, spinning, or facing complexity',
    exampleQuestions: [
      "What's the constraint? What's the bottleneck?",
      "If you could only change ONE thing, what would unlock the rest?",
      "What's the pattern that keeps repeating here?",
      "What's the smallest change that would cascade through the system?"
    ]
  },

  'spiritual-invitation': {
    field: 'spiritual-invitation',
    move: 'Reframe as calling/vow/sacred yes - What\'s the invitation?',
    whenToUse: 'When user needs meaning-making, purpose alignment, or deeper why',
    exampleQuestions: [
      "What's the invitation here? What's the vow?",
      "What's the deeper yes you're trying to protect?",
      "If this is a threshold, what are you being called toward?",
      "What sacred purpose is asking to be served?"
    ]
  },

  'gestalt-awareness': {
    field: 'gestalt-awareness',
    move: 'What\'s present right now? Figure/ground shift',
    whenToUse: 'When user is future-tripping, past-dwelling, or disconnected from present',
    exampleQuestions: [
      "What's actually present right now, not what you're worried about?",
      "If you put the story down for a second, what's the felt sense?",
      "What's in the foreground, and what's in the background?",
      "What are you aware of in this exact moment?"
    ]
  },

  'polyvagal-regulation': {
    field: 'polyvagal-regulation',
    move: 'Check nervous system state - Safe/mobilized/shutdown?',
    whenToUse: 'When user is dysregulated, anxious, frozen, or emotionally activated',
    exampleQuestions: [
      "Does this feel like mobilization (fight/flight) or shutdown (freeze/collapse)?",
      "What would help you feel more grounded right now?",
      "Are you in 'on guard' mode, or in 'safe connection' mode?",
      "What's one thing that would signal safety to your body?"
    ]
  },

  'narrative-reframe': {
    field: 'narrative-reframe',
    move: 'Tell the story differently - What if this means something else?',
    whenToUse: 'When user has a fixed negative story or self-defeating narrative',
    exampleQuestions: [
      "What if this story had a different ending?",
      "If a wise friend told this story about you, what would they emphasize?",
      "What's the version where you're not the villain or victim?",
      "What gets revealed if we tell this from 10 years in the future?"
    ]
  },

  'ikigai-purpose': {
    field: 'ikigai-purpose',
    move: 'Find the intersection - What do you love/need/offer/get paid for?',
    whenToUse: 'When user is seeking direction, career clarity, or life purpose',
    exampleQuestions: [
      "What's at the intersection of what you love and what the world needs?",
      "What are you good at that people actually value?",
      "If money weren't an issue, what would you do every day?",
      "What gift do you have that feels effortless to give?"
    ]
  },

  'constraint-design': {
    field: 'constraint-design',
    move: 'Design the constraint - What boundary would make this easier?',
    whenToUse: 'When user needs structure, has too many options, or is overwhelmed by freedom',
    exampleQuestions: [
      "What constraint would make this decision easier?",
      "If you could only do this for 20 minutes a day, how would you do it?",
      "What rule could you add that would simplify everything?",
      "What's one thing you could take OFF the table to create clarity?"
    ]
  }
};

/**
 * Select appropriate wisdom field based on context
 */
export function selectWisdomField(context: {
  element?: string;
  phase?: string;
  userState?: string;
  complexity?: string;
}): WisdomField {
  const { element, phase, userState, complexity } = context;

  // Fire moments → often benefit from purpose/role clarity
  if (element === 'Fire') {
    if (phase === 'Intelligence') return 'mcgilchrist-attention'; // Need to see clearly
    if (phase === 'Intention') return 'ikigai-purpose'; // Need direction
    if (phase === 'Goal') return 'constraint-design'; // Need to execute
  }

  // Water moments → often benefit from embodiment/regulation
  if (element === 'Water') {
    if (userState === 'overwhelmed' || userState === 'dysregulated') {
      return 'polyvagal-regulation';
    }
    if (userState === 'processing') return 'gestalt-awareness';
    return 'somatic-embodiment'; // Default for Water
  }

  // Earth moments → often benefit from systems/constraints
  if (element === 'Earth') {
    if (phase === 'Intelligence') return 'systems-thinking'; // See structure
    if (phase === 'Goal') return 'constraint-design'; // Build structure
    return 'somatic-embodiment'; // Make it physical
  }

  // Air moments → often benefit from narrative/attention
  if (element === 'Air') {
    if (userState === 'stuck-story') return 'narrative-reframe';
    if (complexity === 'complex') return 'systems-thinking';
    return 'mcgilchrist-attention'; // Default for Air - perspective
  }

  // Aether moments → often benefit from spiritual/purpose
  if (element === 'Aether') {
    if (phase === 'Intelligence') return 'spiritual-invitation';
    if (userState === 'identity-crisis') return 'jungian-archetype';
    return 'ikigai-purpose'; // Default for Aether
  }

  // Fallback: if dysregulated, prioritize regulation
  if (userState === 'anxious' || userState === 'frozen') {
    return 'polyvagal-regulation';
  }

  // Default: Gestalt awareness (always useful)
  return 'gestalt-awareness';
}

/**
 * Get a wisdom move question for the current context
 */
export function getWisdomMove(
  field: WisdomField,
  variant?: number
): string {
  const move = WISDOM_FIELD_MOVES[field];
  const questions = move.exampleQuestions;

  // If variant specified, use it; otherwise, random
  const index = variant !== undefined
    ? variant % questions.length
    : Math.floor(Math.random() * questions.length);

  return questions[index];
}

/**
 * Get multiple wisdom moves for layered response
 */
export function getWisdomMoves(
  primaryField: WisdomField,
  secondaryField?: WisdomField
): { primary: string; secondary?: string } {
  const primary = getWisdomMove(primaryField);
  const secondary = secondaryField ? getWisdomMove(secondaryField) : undefined;

  return { primary, secondary };
}
