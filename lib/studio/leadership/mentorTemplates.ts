/**
 * Mentor Template Engine — Sovereignty-Oriented Reflection for Decisions
 *
 * Templates are good enough that nobody *needs* the AI.
 * AI is for precision, not for making the page feel alive.
 *
 * The engine infers a "decision posture" from the council result,
 * then maps (situationType, posture) → template with reflections,
 * a micro-practice, and a sovereignty check.
 */

import type { ConsultationResult } from '@/lib/ain/types';
import type {
  DecisionPosture,
  MentorTemplate,
  TimePressure,
} from './types';
import type { SituationType } from './situationTypes';

// ─── Posture Detection ──────────────────────────────────────────

/**
 * Infer the practitioner's decision posture from council output + context.
 * This is heuristic, not diagnostic. Good enough for template routing.
 */
export function inferPosture(
  council: ConsultationResult | null,
  opts: {
    situationType?: string | null;
    timePressure?: TimePressure | null;
    emotionalState?: string | null;
  } = {}
): DecisionPosture {
  if (!council) return 'emerging';

  const { tensions = [], confidence = 0, recommendation = '' } = council;
  const tensionCount = tensions.length;
  const { situationType, timePressure, emotionalState } = opts;

  // High stakes: urgent pressure or explicit high-stakes signals
  if (timePressure === 'urgent' || timePressure === 'high') {
    return 'high_stakes';
  }

  // Stuck: low confidence + many tensions + weak recommendation
  if (confidence < 0.4 && tensionCount >= 3 && recommendation.length < 80) {
    return 'stuck';
  }

  // Polarized: strong opposing tensions with moderate confidence
  if (tensionCount >= 2 && confidence >= 0.3 && confidence <= 0.6) {
    return 'polarized';
  }

  // Avoidant: self-reflection type with withdrawal signals
  const avoidantSignals = ['avoidant', 'withdrawn', 'numb', 'frozen', 'disconnected', 'avoiding', 'stuck'];
  if (
    situationType === 'self' &&
    emotionalState &&
    avoidantSignals.some(s => emotionalState.toLowerCase().includes(s))
  ) {
    return 'avoidant';
  }

  // Overresponsible: leadership/group types with ownership-heavy language
  const overresponsibleSignals = ['responsible', 'burden', 'carrying', 'exhausted', 'too much', 'overwhelmed'];
  if (
    (situationType === 'leadership' || situationType === 'group') &&
    emotionalState &&
    overresponsibleSignals.some(s => emotionalState.toLowerCase().includes(s))
  ) {
    return 'overresponsible';
  }

  // Clear but afraid: high confidence but emotional signals hesitation
  const fearSignals = ['afraid', 'scared', 'anxious', 'fear', 'hesitant', 'uncertain', 'dread', 'worried'];
  if (
    confidence >= 0.7 &&
    emotionalState &&
    fearSignals.some(s => emotionalState.toLowerCase().includes(s))
  ) {
    return 'clear_but_afraid';
  }

  // Default: something is emerging
  return 'emerging';
}

// ─── Template Library ───────────────────────────────────────────

/**
 * Situation-typed template overrides.
 * Key format: `${situationType}:${posture}` or just `${posture}` for defaults.
 */
const TEMPLATES: Record<string, MentorTemplate> = {
  // ── Defaults (any situation type) ──────────────────────────

  stuck: {
    posture: 'stuck',
    reflections: [
      'When nothing moves, the question might be wrong. What is this decision actually about?',
      'What would you tell a colleague facing this same situation?',
      'Name the one thing you are most afraid to say out loud about this.',
    ],
    microPractice: 'Write the two worst-case outcomes. Then sit with which one you could live with.',
    sovereigntyCheck: 'Are you waiting for certainty that will never come, or is there information you genuinely still need?',
  },

  polarized: {
    posture: 'polarized',
    reflections: [
      'Both sides may be true. What would it mean to hold both without choosing yet?',
      'Whose voice is loudest in the tension? Who is being silenced?',
      'What would a third option look like — one neither pole has imagined?',
    ],
    microPractice: 'Speak each position aloud as if you fully believe it. Notice which one your body resists.',
    sovereigntyCheck: 'Are you being loyal to a position, or to the truth of the situation?',
  },

  high_stakes: {
    posture: 'high_stakes',
    reflections: [
      'High stakes amplify everything. What is actually at risk versus what feels at risk?',
      'If this decision were reversible, what would you do? That reveals your real preference.',
      'Name who else is affected. Their reality may clarify yours.',
    ],
    microPractice: 'Write the decision as a one-sentence headline. If you wince reading it, investigate why.',
    sovereigntyCheck: 'Is urgency driving this decision, or is urgency being used to avoid sitting with complexity?',
  },

  avoidant: {
    posture: 'avoidant',
    reflections: [
      'Avoidance is data. What are you protecting by not looking?',
      'What is the smallest true thing you could name right now?',
      'Where in your body do you feel the withdrawal? Stay with it for three breaths.',
    ],
    microPractice: 'Set a 5-minute timer. Write without stopping about what you do not want to face. Then close it.',
    sovereigntyCheck: 'Are you preserving your energy or are you hiding? Only you can tell the difference.',
  },

  overresponsible: {
    posture: 'overresponsible',
    reflections: [
      'Whose decision is this, actually? Not every problem with your name on it belongs to you.',
      'What would happen if you did 40% less on this? Who or what would step up?',
      'Name one thing in this situation that is genuinely not yours to carry.',
    ],
    microPractice: 'Draw a circle. Write inside it only what is truly yours to decide. Everything else goes outside.',
    sovereigntyCheck: 'Overfunction often masks a belief that others cannot handle reality. Is that true here?',
  },

  clear_but_afraid: {
    posture: 'clear_but_afraid',
    reflections: [
      'You already know. What would it take to trust what you know?',
      'Name the cost of acting on your clarity. Now name the cost of not acting.',
      'What would the version of you who already did this say to you now?',
    ],
    microPractice: 'Write: "I know that ___." Complete it three times. Read them back to yourself.',
    sovereigntyCheck: 'Fear is not evidence against a decision. It is evidence that the decision matters.',
  },

  emerging: {
    posture: 'emerging',
    reflections: [
      'Something is taking shape. What is the next smallest move that would test it?',
      'What would count as evidence that you are on the right track?',
      'Where does this decision want to go next? Not where you think it should — where it wants to.',
    ],
    microPractice: 'Name one experiment you could run this week that would teach you something new about this.',
    sovereigntyCheck: 'Are you driving this process, or is it driving you? Both can be right — but know which.',
  },

  // ── Situation-specific overrides ───────────────────────────

  'self:avoidant': {
    posture: 'avoidant',
    reflections: [
      'The shadow you are avoiding may hold the exact medicine this situation needs.',
      'What part of yourself are you trying not to see in this client or situation?',
      'Countertransference is not failure. It is information. What is it telling you?',
    ],
    microPractice: 'Journal for 5 minutes: "The part of me I do not want to bring to this work is..."',
    sovereigntyCheck: 'Your avoidance is yours. Your client deserves a practitioner who has looked.',
  },

  'self:stuck': {
    posture: 'stuck',
    reflections: [
      'When the practitioner is stuck, the work is often stuck too. Where is the parallel?',
      'What would your own mentor say to you right now about this?',
      'Name the thing you are not willing to risk in your own practice.',
    ],
    microPractice: 'Imagine you have already made this decision. How does next week feel?',
    sovereigntyCheck: 'Are you thinking yourself in circles, or is this a genuine need for more supervision?',
  },

  'leadership:high_stakes': {
    posture: 'high_stakes',
    reflections: [
      'Under pressure, leaders often default to control. What would delegation look like here?',
      'Whose counsel have you not sought because it would complicate your preferred answer?',
      'The stakeholders see different risks than you. Name the risk you have been dismissing.',
    ],
    microPractice: 'Write the decision memo as if you had to defend it to a board in 6 months.',
    sovereigntyCheck: 'Are you leading this decision, or are you performing decisiveness?',
  },

  'leadership:overresponsible': {
    posture: 'overresponsible',
    reflections: [
      'The system needs you to lead, not to carry everything. What can be delegated?',
      'If you were unavailable for a week, what would happen to this decision? That tells you something.',
      'Name one person who could own a piece of this. What stops you from handing it to them?',
    ],
    microPractice: 'List 3 things only you can decide. Let everything else be someone else\'s this week.',
    sovereigntyCheck: 'Overresponsibility in leadership often hides a distrust of your team. Is that the real issue?',
  },

  'relational:polarized': {
    posture: 'polarized',
    reflections: [
      'In relational polarization, each side carries a truth the other needs. What truth are you holding for someone else?',
      'What would repair look like? Not resolution — repair.',
      'Name the projection. What are you putting on the other that may belong to you?',
    ],
    microPractice: 'Write the other person\'s perspective as if you were their advocate. Notice what shifts.',
    sovereigntyCheck: 'Are you trying to be right, or are you trying to understand? They lead to different places.',
  },

  'group:stuck': {
    posture: 'stuck',
    reflections: [
      'When a group is stuck, someone is usually holding an unspoken truth. Who?',
      'What norm in this group prevents the real conversation from happening?',
      'If you could change one rule in how this group operates, what would it be?',
    ],
    microPractice: 'Map the group: who speaks, who stays silent, who deflects. The pattern is the diagnosis.',
    sovereigntyCheck: 'Are you trying to unstick the group, or are you trying to control the outcome?',
  },

  'individual:clear_but_afraid': {
    posture: 'clear_but_afraid',
    reflections: [
      'Your client may know what to do but need you to hold the space while they do it.',
      'What would it mean to trust their clarity instead of protecting them from their own answer?',
      'The fear is real. The fear is not the whole picture. What else is present?',
    ],
    microPractice: 'In your next session, ask: "What do you already know about this?" Then wait.',
    sovereigntyCheck: 'Are you intervening because they need it, or because their fear activates yours?',
  },
};

// ─── Template Resolution ────────────────────────────────────────

/**
 * Get the best matching mentor template for a decision.
 * Tries situation-specific override first, falls back to posture default.
 */
export function getMentorTemplate(
  posture: DecisionPosture,
  situationType?: string | null
): MentorTemplate {
  // Try situation-specific override
  if (situationType) {
    const key = `${situationType}:${posture}`;
    if (key in TEMPLATES) {
      return TEMPLATES[key];
    }
  }

  // Fall back to posture default
  return TEMPLATES[posture] || TEMPLATES.emerging;
}

/**
 * Get the full mentor template for a decision, auto-detecting posture.
 */
export function getMentorTemplateForDecision(
  council: ConsultationResult | null,
  opts: {
    situationType?: string | null;
    timePressure?: TimePressure | null;
    emotionalState?: string | null;
  } = {}
): { template: MentorTemplate; posture: DecisionPosture } {
  const posture = inferPosture(council, opts);
  const template = getMentorTemplate(posture, opts.situationType);
  return { template, posture };
}
