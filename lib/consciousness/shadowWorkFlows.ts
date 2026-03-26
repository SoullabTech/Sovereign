/**
 * Shadow Work Flows
 *
 * Guided multi-step journeys for shadow integration.
 * Not therapy - consciousness exploration with archetypal awareness.
 *
 * Based on Jungian shadow work principles:
 * - Recognition (seeing the pattern)
 * - Embodiment (feeling it in the body)
 * - Dialogue (listening to the shadow)
 * - Gold extraction (finding the gift)
 * - Integration (welcoming home)
 */

import { HOUSE_NEURAL_MAPPING } from '@/lib/astrology/neuroArchetypalMapping';

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

export type ShadowFlowType =
  | 'basic_recognition'      // Entry-level shadow awareness
  | 'projection_retrieval'   // Retrieving projected aspects
  | 'inner_critic'           // Working with the critic
  | 'wounded_child'          // Inner child work
  | 'elemental_shadow'       // Element-specific shadow
  | 'house_shadow';          // Astrological house shadow

export interface ShadowFlowStep {
  id: string;
  title: string;
  instruction: string;
  prompt: string;
  /** Optional body awareness prompt */
  bodyPrompt?: string;
  /** Time suggestion in seconds */
  suggestedTime?: number;
  /** Element association */
  element?: string;
}

export interface ShadowFlow {
  id: string;
  type: ShadowFlowType;
  title: string;
  description: string;
  /** Estimated duration in minutes */
  duration: number;
  steps: ShadowFlowStep[];
  /** Closing integration practice */
  integrationPractice: string;
  /** Safety note */
  safetyNote: string;
}

export interface ShadowWorkSession {
  flowId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  currentStep: number;
  responses: Record<string, string>;
  insights?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// Shadow Flows
// ═══════════════════════════════════════════════════════════════════════════════

export const SHADOW_FLOWS: Record<string, ShadowFlow> = {
  basic_recognition: {
    id: 'basic_recognition',
    type: 'basic_recognition',
    title: 'Meeting Your Shadow',
    description:
      'A gentle introduction to recognizing shadow patterns in your life. ' +
      'Perfect for first-time shadow exploration.',
    duration: 15,
    safetyNote:
      'This is exploration, not therapy. If strong emotions arise, ' +
      'you can pause at any time. Honor your pace.',
    steps: [
      {
        id: 'notice',
        title: 'Notice the Pattern',
        instruction:
          'Think of a recent moment when you felt triggered, irritated, or ' +
          'had a disproportionate emotional reaction to someone or something.',
        prompt:
          'What happened? Describe the situation briefly without judgment.',
        suggestedTime: 120,
        element: 'air',
      },
      {
        id: 'feel',
        title: 'Feel Into It',
        instruction:
          'Close your eyes and recall that moment. Let yourself feel the ' +
          'sensations that arise.',
        prompt: 'What do you notice in your body? Where do you feel it?',
        bodyPrompt:
          'Place a hand where you feel the sensation. Breathe into that space.',
        suggestedTime: 90,
        element: 'water',
      },
      {
        id: 'voice',
        title: 'Hear the Voice',
        instruction:
          'This reaction has a voice - a part of you speaking through it. ' +
          'What is that part trying to say?',
        prompt:
          'If this reaction could speak, what would it say? ' +
          'What does it want you to know?',
        suggestedTime: 120,
        element: 'fire',
      },
      {
        id: 'origin',
        title: 'Trace the Thread',
        instruction:
          'This pattern likely started somewhere. Without forcing, ' +
          'let a memory or knowing arise.',
        prompt:
          'When have you felt this way before? ' +
          'What early experience might this connect to?',
        suggestedTime: 120,
        element: 'earth',
      },
      {
        id: 'gift',
        title: 'Find the Gold',
        instruction:
          'Every shadow holds a gift - a quality that got exiled but wants ' +
          'to return in healthy form.',
        prompt:
          'What positive quality might be hidden in this shadow? ' +
          'What was this pattern originally trying to protect?',
        suggestedTime: 120,
        element: 'fire',
      },
      {
        id: 'welcome',
        title: 'Welcome Home',
        instruction:
          'Imagine meeting this part of yourself with compassion rather than ' +
          'rejection. It has been working hard to help you, even if clumsily.',
        prompt:
          'What would you like to say to this part of yourself? ' +
          'How might you acknowledge its efforts while inviting it to evolve?',
        suggestedTime: 120,
        element: 'water',
      },
    ],
    integrationPractice:
      'Over the next few days, when you notice this pattern arising, ' +
      'pause and place your hand where you felt the sensation. ' +
      'Silently say: "I see you. I understand. We can do this differently now."',
  },

  projection_retrieval: {
    id: 'projection_retrieval',
    type: 'projection_retrieval',
    title: 'Retrieving Your Projection',
    description:
      'When someone bothers you intensely, they may be carrying a piece of ' +
      'you that wants to come home. This flow helps retrieve projected aspects.',
    duration: 20,
    safetyNote:
      'Projections protect us until we\'re ready to own these parts. ' +
      'There\'s no rush. Take what resonates, leave what doesn\'t.',
    steps: [
      {
        id: 'identify',
        title: 'Identify the Mirror',
        instruction:
          'Think of someone who really bothers you - their behavior, ' +
          'their way of being. Not someone who hurt you, but someone who ' +
          'irritates or triggers you.',
        prompt:
          'Who is this person? What specifically about them bothers you most?',
        suggestedTime: 90,
        element: 'air',
      },
      {
        id: 'quality',
        title: 'Name the Quality',
        instruction:
          'Distill it down to a quality or trait. Not "they\'re annoying" ' +
          'but what specifically: arrogance? weakness? selfishness?',
        prompt:
          'What is the specific quality you reject in them? Name it clearly.',
        suggestedTime: 60,
        element: 'air',
      },
      {
        id: 'body_check',
        title: 'Body Check',
        instruction:
          'Say that quality out loud. Notice what happens in your body.',
        prompt:
          'What sensations arise when you name this quality? ' +
          'What\'s the feeling underneath the judgment?',
        bodyPrompt: 'Notice any tightening, heat, or contraction.',
        suggestedTime: 90,
        element: 'water',
      },
      {
        id: 'own_it',
        title: 'The Mirror Question',
        instruction:
          'Here\'s the uncomfortable question. Take your time with it.',
        prompt:
          'Where might this quality live in you - even in small ways, ' +
          'hidden forms, or the opposite extreme? How might you disown ' +
          'this part of yourself?',
        suggestedTime: 180,
        element: 'earth',
      },
      {
        id: 'root',
        title: 'The Root',
        instruction:
          'Why did this part of you go into shadow? What happened that ' +
          'made this quality unwelcome?',
        prompt:
          'When did you learn this quality was "bad"? ' +
          'What would have happened if you expressed it?',
        suggestedTime: 120,
        element: 'water',
      },
      {
        id: 'reclaim',
        title: 'Reclaim the Gold',
        instruction:
          'Every shadow quality has a golden core - a healthy version ' +
          'that got exiled along with the unhealthy expression.',
        prompt:
          'What is the healthy version of this quality? ' +
          'How might you express it in a way that serves your wholeness?',
        suggestedTime: 120,
        element: 'fire',
      },
    ],
    integrationPractice:
      'This week, catch yourself when this person (or type of person) ' +
      'triggers you. Pause and ask: "What part of me is asking to come home?" ' +
      'Notice if your irritation softens as you own more of yourself.',
  },

  inner_critic: {
    id: 'inner_critic',
    type: 'inner_critic',
    title: 'Dialoguing with the Inner Critic',
    description:
      'The inner critic started as a protector. This flow helps you ' +
      'understand its origin and transform its harsh voice into wise guidance.',
    duration: 20,
    safetyNote:
      'The inner critic can feel very real and harsh. Remember: it\'s a ' +
      'part of you, not the whole of you. You are larger than any inner voice.',
    steps: [
      {
        id: 'hear',
        title: 'Hear the Critic',
        instruction:
          'Let your inner critic speak. What does it usually say to you? ' +
          'Don\'t filter or soften it.',
        prompt:
          'Write down the critic\'s messages exactly as you hear them. ' +
          'What does it say when you fail, try something new, or show up?',
        suggestedTime: 120,
        element: 'air',
      },
      {
        id: 'voice',
        title: 'Recognize the Voice',
        instruction:
          'This voice sounds like yours, but it was learned. Listen for ' +
          'echoes of other voices.',
        prompt:
          'Whose voice is this really? Who originally said these things ' +
          'to you? Or who modeled this way of self-talk?',
        suggestedTime: 120,
        element: 'water',
      },
      {
        id: 'intention',
        title: 'Find the Protection',
        instruction:
          'The critic is trying to help - it\'s using painful methods to ' +
          'achieve something it thinks is good for you.',
        prompt:
          'What is the critic trying to protect you from? ' +
          'What does it fear would happen if it stopped criticizing?',
        suggestedTime: 120,
        element: 'earth',
      },
      {
        id: 'young',
        title: 'See the Younger You',
        instruction:
          'When did you first need this protection? See the younger you ' +
          'who developed this voice as a survival strategy.',
        prompt:
          'How old were you when this critic formed? ' +
          'What was that young person trying to cope with?',
        suggestedTime: 120,
        element: 'water',
      },
      {
        id: 'gratitude',
        title: 'Thank the Protector',
        instruction:
          'Before we can transform the critic, we need to acknowledge its ' +
          'service. It\'s been working hard for a long time.',
        prompt:
          'What would you like to say to thank your inner critic for ' +
          'trying to keep you safe all these years?',
        suggestedTime: 90,
        element: 'fire',
      },
      {
        id: 'upgrade',
        title: 'Offer an Upgrade',
        instruction:
          'The critic\'s intention is good but its methods are outdated. ' +
          'You can offer it a new job.',
        prompt:
          'How might this voice transform into an inner mentor or guide? ' +
          'What would a supportive version of this voice say instead?',
        suggestedTime: 120,
        element: 'fire',
      },
    ],
    integrationPractice:
      'When you hear the critic this week, try this: "Thank you for trying ' +
      'to help. I know you\'re scared. But I\'ve got this now. What would ' +
      'my inner mentor say instead?" Notice the critic\'s voice softening over time.',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// House-Based Shadow Flows
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a shadow work flow based on a specific house's pathological expressions
 */
export function generateHouseShadowFlow(house: number): ShadowFlow | null {
  const houseData = HOUSE_NEURAL_MAPPING[house];
  if (!houseData) return null;

  const pathological = houseData.pathologicalExpressions;
  const integrated = houseData.integratedExpressions;

  return {
    id: `house_${house}_shadow`,
    type: 'house_shadow',
    title: `House ${house} Shadow Work: ${houseData.archetypeTitle}`,
    description:
      `Explore the shadow side of your ${houseData.archetypeTitle} energy. ` +
      `${houseData.developmentalStage}.`,
    duration: 20,
    safetyNote:
      'This is about understanding patterns, not pathologizing yourself. ' +
      'Every shadow expression was once an adaptive response.',
    steps: [
      {
        id: 'recognize',
        title: 'Recognize the Pattern',
        instruction:
          `The ${houseData.archetypeTitle} shadow can manifest as: ` +
          pathological.join(', ') + '.',
        prompt:
          'Which of these patterns do you recognize in yourself? ' +
          'When do they tend to show up?',
        suggestedTime: 120,
        element: String(houseData.element),
      },
      {
        id: 'trigger',
        title: 'Map the Triggers',
        instruction:
          'Shadow patterns don\'t appear randomly. They have triggers.',
        prompt:
          'What situations, people, or circumstances tend to activate ' +
          'this pattern in you?',
        suggestedTime: 120,
        element: 'air',
      },
      {
        id: 'body',
        title: 'Body Wisdom',
        instruction:
          'Your body holds the key to early warning and transformation.',
        prompt:
          'What do you feel in your body when this pattern is activated? ' +
          'What sensation tells you it\'s coming?',
        bodyPrompt: 'Scan your body now. Where does this pattern live?',
        suggestedTime: 90,
        element: 'water',
      },
      {
        id: 'origin',
        title: 'Original Adaptation',
        instruction:
          'This pattern was once necessary. It helped you survive or cope.',
        prompt:
          'When did this pattern first serve you? What was it protecting ' +
          'you from? How was it adaptive at the time?',
        suggestedTime: 120,
        element: 'earth',
      },
      {
        id: 'integrated',
        title: 'The Integrated Form',
        instruction:
          `The integrated expression of ${houseData.archetypeTitle} energy includes: ` +
          integrated.join(', ') + '.',
        prompt:
          'Which integrated expression calls to you most? ' +
          'What would it look like to embody this instead?',
        suggestedTime: 120,
        element: 'fire',
      },
      {
        id: 'practice',
        title: 'Integration Practice',
        instruction:
          'Choose one small way to practice the integrated expression.',
        prompt:
          'What\'s one specific thing you can do this week to practice ' +
          'the integrated form of this energy?',
        suggestedTime: 90,
        element: 'earth',
      },
    ],
    integrationPractice: houseData.spiritualInvitation,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get all available shadow flows
 */
export function getAvailableShadowFlows(): ShadowFlow[] {
  return Object.values(SHADOW_FLOWS);
}

/**
 * Get a shadow flow by ID
 */
export function getShadowFlow(id: string): ShadowFlow | null {
  // Check predefined flows
  if (SHADOW_FLOWS[id]) {
    return SHADOW_FLOWS[id];
  }

  // Check for house shadow flow
  const houseMatch = id.match(/^house_(\d+)_shadow$/);
  if (houseMatch) {
    const house = parseInt(houseMatch[1]);
    return generateHouseShadowFlow(house);
  }

  return null;
}

/**
 * Get suggested shadow flow based on user context
 */
export function suggestShadowFlow(context: {
  dominantElement?: string;
  recentPatterns?: string[];
  awarenessLevel?: number;
}): ShadowFlow {
  const { awarenessLevel = 2 } = context;

  // For lower awareness, suggest the gentler basic recognition flow
  if (awarenessLevel <= 2) {
    return SHADOW_FLOWS.basic_recognition;
  }

  // For higher awareness, can go into projection or critic work
  if (awarenessLevel >= 4) {
    return SHADOW_FLOWS.projection_retrieval;
  }

  // Default to basic
  return SHADOW_FLOWS.basic_recognition;
}
