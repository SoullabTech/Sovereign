/**
 * Mentor Template Engine — Change Navigation Reflection
 *
 * Templates are good enough that nobody *needs* the AI.
 * AI is for precision, not for making the page feel alive.
 *
 * The engine infers a "change posture" from the council result,
 * then maps (changeType, posture) → template with reflections,
 * a micro-practice, and a sovereignty check.
 *
 * Change postures differ from decision postures because
 * the relationship to change is different from the relationship
 * to choice. In change, we are often subject to forces
 * larger than our preferences.
 */

import type { ConsultationResult } from '@/lib/ain/types';
import type {
  ChangePosture,
  ChangeMentorTemplate,
  ChangeUrgency,
} from './types';

// ─── Posture Detection ─────────────────────────────────────────

/**
 * Infer the person's change posture from council output + context.
 * This is heuristic, not diagnostic. Good enough for template routing.
 */
export function inferChangePosture(
  council: ConsultationResult | null,
  opts: {
    changeType?: string | null;
    urgency?: ChangeUrgency | null;
    emotionalState?: string | null;
  } = {}
): ChangePosture {
  if (!council) return 'emerging';

  const { tensions = [], confidence = 0, recommendation = '' } = council;
  const tensionCount = tensions.length;
  const { changeType, urgency, emotionalState } = opts;
  const state = emotionalState?.toLowerCase() || '';

  // Frozen: low confidence, many tensions, short recommendation, crisis signals
  const frozenSignals = ['frozen', 'paralyzed', 'stuck', 'numb', 'can\'t move', 'shutdown', 'dissociated'];
  if (frozenSignals.some(s => state.includes(s))) {
    return 'frozen';
  }
  if (confidence < 0.3 && tensionCount >= 3 && recommendation.length < 80) {
    return 'frozen';
  }

  // Grieving: dissolution type or grief signals
  const griefSignals = ['grief', 'loss', 'mourning', 'sad', 'heartbroken', 'bereft', 'missing', 'gone'];
  if (griefSignals.some(s => state.includes(s))) {
    return 'grieving';
  }
  if (changeType === 'dissolution' && confidence < 0.5) {
    return 'grieving';
  }

  // Overwhelmed: high urgency or flood signals
  const overwhelmedSignals = ['overwhelmed', 'drowning', 'too much', 'can\'t cope', 'flooding', 'spinning'];
  if (overwhelmedSignals.some(s => state.includes(s))) {
    return 'overwhelmed';
  }
  if (urgency === 'acute' && tensionCount >= 3) {
    return 'overwhelmed';
  }

  // Resisting: fighting signals
  const resistingSignals = ['resisting', 'fighting', 'angry', 'refusing', 'denial', 'unfair', 'shouldn\'t'];
  if (resistingSignals.some(s => state.includes(s))) {
    return 'resisting';
  }

  // Grasping: control signals
  const graspingSignals = ['controlling', 'grasping', 'holding on', 'fixing', 'planning', 'need to know'];
  if (graspingSignals.some(s => state.includes(s))) {
    return 'grasping';
  }

  // Surrendered: release signals but unclear
  const surrenderedSignals = ['surrendered', 'let go', 'given up', 'don\'t know', 'empty', 'waiting', 'open'];
  if (surrenderedSignals.some(s => state.includes(s))) {
    return 'surrendered';
  }

  // Clear but afraid → maps to grasping in change context (trying to hold the outcome)
  if (confidence >= 0.7 && state && ['afraid', 'scared', 'anxious', 'fear'].some(s => state.includes(s))) {
    return 'grasping';
  }

  // Default: something is emerging
  return 'emerging';
}

// ─── Template Library ──────────────────────────────────────────

/**
 * Change-type-specific template overrides use key format:
 * `${changeType}:${posture}` or just `${posture}` for defaults.
 */
const TEMPLATES: Record<string, ChangeMentorTemplate> = {
  // ── Defaults (any change type) ─────────────────────────────

  frozen: {
    posture: 'frozen',
    reflections: [
      'Stillness in the face of change can be wisdom or self-protection. Which is this?',
      'What is the smallest movement you could make without needing to know where it leads?',
      'Name what you are afraid will happen if you allow this change to move through you.',
    ],
    microPractice:
      'Place one hand on your chest. Breathe three times. Ask: what do I need right now? Not what do I need to do — what do I need?',
    sovereigntyCheck:
      'Are you frozen because the way is unclear, or because you already know and the knowing frightens you?',
  },

  resisting: {
    posture: 'resisting',
    reflections: [
      'Resistance is information. What exactly are you protecting by refusing this change?',
      'If this change were happening to someone you love, what would you want them to hear?',
      'Name what is true about this change that you wish were not true.',
    ],
    microPractice:
      'Write two sentences: "I am resisting because..." and "What I am protecting is..." Read them aloud.',
    sovereigntyCheck:
      'Is your resistance protecting something worth protecting, or is it protecting you from a truth that has already arrived?',
  },

  overwhelmed: {
    posture: 'overwhelmed',
    reflections: [
      'When everything is moving, find one still point. What in your life has not changed?',
      'You do not have to understand this change to survive it. What do you need right now — not next week, right now?',
      'Name the three most urgent things. Now cross out two of them. What remains?',
    ],
    microPractice:
      'Stand or sit. Feel your feet on the ground. Name five things you can see. This is your ground right now.',
    sovereigntyCheck:
      'Overwhelm often means you are trying to process the whole change at once. What is the smallest piece you can hold?',
  },

  grieving: {
    posture: 'grieving',
    reflections: [
      'Grief is the price of having loved something real. What did this thing that is ending mean to you?',
      'There is no schedule for grief. Where does your body hold the loss right now?',
      'What would it mean to honor what is ending without trying to fix the feeling?',
    ],
    microPractice:
      'Light a candle or hold something meaningful. Sit with it for five minutes. You do not have to say anything.',
    sovereigntyCheck:
      'Are you grieving what is actually lost, or are you grieving what you fear might be lost next?',
  },

  grasping: {
    posture: 'grasping',
    reflections: [
      'The tighter you hold, the less you can feel. What would your hands sense if you opened them?',
      'Control is often a response to fear. Name the fear underneath the need to manage this change.',
      'What would it look like to participate in this change rather than direct it?',
    ],
    microPractice:
      'Clench your fists as tight as you can for 10 seconds. Then release. Notice what your hands feel. That release is available.',
    sovereigntyCheck:
      'Are you steering toward a genuine destination, or gripping the wheel because letting go feels like dying?',
  },

  surrendered: {
    posture: 'surrendered',
    reflections: [
      'Surrender is not defeat. It is the precondition for seeing what wants to happen next.',
      'In the openness of not-knowing, what do you notice? What is present when you stop trying?',
      'You have released your grip. Now — what is reaching toward you?',
    ],
    microPractice:
      'Sit somewhere quiet. Ask the change: what do you want me to know? Write whatever comes without editing.',
    sovereigntyCheck:
      'Have you truly surrendered, or have you collapsed? Surrender is alert. Collapse is checked out. Which is this?',
  },

  emerging: {
    posture: 'emerging',
    reflections: [
      'Something is taking shape. What is the next smallest move that would test it?',
      'What would count as evidence that the change is moving in a direction you can trust?',
      'Where does this change want to go? Not where you think it should — where it wants to.',
    ],
    microPractice:
      'Name one experiment you could try this week that would teach you something new about where this change is headed.',
    sovereigntyCheck:
      'Are you following what is emerging, or trying to shape it into something familiar? Both are possible — know which.',
  },

  // ── Change-type-specific overrides ─────────────────────────

  'dissolution:grieving': {
    posture: 'grieving',
    reflections: [
      'What is dissolving carried something real. Name what it gave you before it began to end.',
      'Dissolution makes space. You do not have to fill the space yet. Can you stay with the emptiness?',
      'The I Ching teaches that winter makes spring possible. What season are you in?',
    ],
    microPractice:
      'Write a letter to what is ending. Thank it for what it gave. You do not have to send it.',
    sovereigntyCheck:
      'Are you mourning the thing itself, or mourning the version of yourself that existed with it?',
  },

  'dissolution:frozen': {
    posture: 'frozen',
    reflections: [
      'When something dissolves, the ground beneath seems to dissolve too. But you are still here.',
      'Freezing in dissolution is the body saying: I need time to realize this is real.',
      'What is one small acknowledgment you could make — not acceptance, just acknowledgment?',
    ],
    microPractice:
      'Say out loud: "This is happening." Then breathe. That is enough for now.',
    sovereigntyCheck:
      'Your freeze is protective. But protection can become a prison. What would one degree of thaw feel like?',
  },

  'upheaval:overwhelmed': {
    posture: 'overwhelmed',
    reflections: [
      'Upheaval strips away the non-essential. In the wreckage, what is still standing?',
      'You did not choose this disruption. You do get to choose your next response. What is the smallest one?',
      'External chaos does not require internal chaos. Where inside you is it still quiet?',
    ],
    microPractice:
      'Draw a circle. Inside it, write only what you can actually influence today. Everything else goes outside.',
    sovereigntyCheck:
      'Are you overwhelmed by the change itself, or by the story you are telling about what it means?',
  },

  'upheaval:frozen': {
    posture: 'frozen',
    reflections: [
      'Shock freezes. This is biology, not failure. Your system is protecting you while it recalibrates.',
      'What is one thing — even very small — that you could do today that is not about the upheaval?',
      'The ground shifted. But you are still breathing. Start there.',
    ],
    microPractice:
      'Move your body for 60 seconds — walk, stretch, shake your hands. Sensation thaws what the mind cannot.',
    sovereigntyCheck:
      'Your freeze is a reasonable response to an unreasonable situation. But staying frozen is a choice. What would motion look like?',
  },

  'emergence:grasping': {
    posture: 'grasping',
    reflections: [
      'What is emerging needs room to take its own shape. Are you making room or making plans?',
      'Premature definition kills emergence. Can you name what is forming without pinning it down?',
      'The I Ching warns: the seedling that is pulled up to check its roots does not grow.',
    ],
    microPractice:
      'Write three possible names for what is emerging. Then cross them all out. Sit with the unnamed.',
    sovereigntyCheck:
      'Are you nurturing what is emerging, or trying to make it into something you already understand?',
  },

  'threshold:resisting': {
    posture: 'resisting',
    reflections: [
      'You stand at the threshold and push back. What would you have to become on the other side?',
      'Resistance at the threshold often means you know exactly what crossing costs.',
      'What are you saying goodbye to by crossing? Name it specifically.',
    ],
    microPractice:
      'Stand in a doorway. Feel both sides. Ask: what am I leaving? What am I entering? Step through when ready.',
    sovereigntyCheck:
      'Is your resistance telling you this is the wrong threshold, or that this is the right one and it terrifies you?',
  },

  'ripening:resisting': {
    posture: 'resisting',
    reflections: [
      'Something has been ripening and you have been pretending not to notice. What do you already know?',
      'Resistance to ripeness often means the fruit will fall whether or not you pick it.',
      'What would change if you simply acknowledged that the time has come?',
    ],
    microPractice:
      'Complete this sentence five times: "I have known for a while that..." Read them back.',
    sovereigntyCheck:
      'Are you resisting the change itself, or resisting the responsibility that comes with recognizing its readiness?',
  },

  'integration:grasping': {
    posture: 'grasping',
    reflections: [
      'Integration cannot be forced. The parts come together when the conditions are right, not when you demand it.',
      'What if the pieces do not need to fit the way you imagined? What new shape might they form?',
      'You are trying to put yourself back together. But perhaps the task is to let a new arrangement emerge.',
    ],
    microPractice:
      'Hold two objects, one in each hand. Feel them separately. Now bring your hands together slowly. Notice when they want to meet.',
    sovereigntyCheck:
      'Are you integrating what is actually here, or trying to reconstruct what was?',
  },
};

// ─── Template Resolution ───────────────────────────────────────

/**
 * Get the best matching mentor template for a change.
 * Tries change-type-specific override first, falls back to posture default.
 */
export function getChangeMentorTemplate(
  posture: ChangePosture,
  changeType?: string | null
): ChangeMentorTemplate {
  // Try change-type-specific override
  if (changeType) {
    const key = `${changeType}:${posture}`;
    if (key in TEMPLATES) {
      return TEMPLATES[key];
    }
  }

  // Fall back to posture default
  return TEMPLATES[posture] || TEMPLATES.emerging;
}

/**
 * Get the full mentor template for a change, auto-detecting posture.
 */
export function getChangeMentorTemplateForChange(
  council: ConsultationResult | null,
  opts: {
    changeType?: string | null;
    urgency?: ChangeUrgency | null;
    emotionalState?: string | null;
  } = {}
): { template: ChangeMentorTemplate; posture: ChangePosture } {
  const posture = inferChangePosture(council, opts);
  const template = getChangeMentorTemplate(posture, opts.changeType);
  return { template, posture };
}
