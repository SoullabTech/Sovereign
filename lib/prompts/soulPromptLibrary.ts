/**
 * Soul Prompt Library
 *
 * Curated prompts organized by element, depth level, and session phase.
 * Designed to serve as entry points while honoring that MAIA's true gift
 * is surfacing patterns the person didn't know to ask about.
 */

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export type DepthLevel = 'seeker' | 'practitioner' | 'alchemist';
export type SessionPhase = 'opening' | 'exploration' | 'integration' | 'closure';

export interface SoulPrompt {
  id: string;
  text: string;
  element: Element;
  depth: DepthLevel;
  /** Which session phases this prompt is appropriate for */
  phases: SessionPhase[];
  /** Optional archetype association */
  archetype?: string;
  /** For community-connected prompts */
  communityLinked?: boolean;
}

// ============================================================================
// ELEMENT METADATA
// ============================================================================

export const elementMeta: Record<Element, {
  name: string;
  essence: string;
  color: string;
  gradient: string;
  icon: string;
  seekerLabel: string;
  practitionerLabel: string;
  alchemistLabel: string;
}> = {
  fire: {
    name: 'Fire',
    essence: 'Purpose, Drive & Transformation',
    color: 'orange-500',
    gradient: 'from-orange-500 to-red-500',
    icon: '🔥',
    seekerLabel: 'What wants to change?',
    practitionerLabel: 'Transformation work',
    alchemistLabel: 'The Rubedo'
  },
  water: {
    name: 'Water',
    essence: 'Emotion, Intuition & Flow',
    color: 'blue-500',
    gradient: 'from-blue-500 to-cyan-500',
    icon: '💧',
    seekerLabel: 'What am I feeling?',
    practitionerLabel: 'Emotional depths',
    alchemistLabel: 'The Dissolution'
  },
  earth: {
    name: 'Earth',
    essence: 'Body, Foundation & Practical Reality',
    color: 'emerald-500',
    gradient: 'from-green-500 to-emerald-500',
    icon: '🌍',
    seekerLabel: 'What needs grounding?',
    practitionerLabel: 'Embodiment work',
    alchemistLabel: 'The Calcination'
  },
  air: {
    name: 'Air',
    essence: 'Mind, Clarity & Perspective',
    color: 'amber-400',
    gradient: 'from-yellow-400 to-amber-400',
    icon: '💨',
    seekerLabel: 'What needs clarity?',
    practitionerLabel: 'Mental reframing',
    alchemistLabel: 'The Separation'
  },
  aether: {
    name: 'Aether',
    essence: 'Soul Pattern, Integration & Wholeness',
    color: 'violet-500',
    gradient: 'from-amber-500 to-indigo-500',
    icon: '✨',
    seekerLabel: 'What connects it all?',
    practitionerLabel: 'Soul pattern work',
    alchemistLabel: 'The Conjunction'
  }
};

// ============================================================================
// V1 STARTER SET (10 prompts for initial rollout)
// ============================================================================

export const v1StarterPrompts: SoulPrompt[] = [
  // 2 per element, accessible depth
  {
    id: 'fire-v1-1',
    text: 'What are you ready to let go of to make room for what wants to emerge?',
    element: 'fire',
    depth: 'seeker',
    phases: ['opening', 'exploration']
  },
  {
    id: 'fire-v1-2',
    text: 'Where is your passion pointing you that your fear is blocking?',
    element: 'fire',
    depth: 'practitioner',
    phases: ['exploration']
  },
  {
    id: 'water-v1-1',
    text: 'What emotion keeps visiting you that you haven\'t fully welcomed?',
    element: 'water',
    depth: 'seeker',
    phases: ['opening', 'exploration']
  },
  {
    id: 'water-v1-2',
    text: 'What does your body know that your mind hasn\'t accepted yet?',
    element: 'water',
    depth: 'practitioner',
    phases: ['exploration']
  },
  {
    id: 'earth-v1-1',
    text: 'What practical step have you been avoiding that would change everything?',
    element: 'earth',
    depth: 'seeker',
    phases: ['exploration', 'integration']
  },
  {
    id: 'earth-v1-2',
    text: 'What foundation in your life needs repair before you can build higher?',
    element: 'earth',
    depth: 'practitioner',
    phases: ['exploration']
  },
  {
    id: 'air-v1-1',
    text: 'What story are you telling yourself that might not be the whole truth?',
    element: 'air',
    depth: 'seeker',
    phases: ['opening', 'exploration']
  },
  {
    id: 'air-v1-2',
    text: 'What belief served you once but has become a cage?',
    element: 'air',
    depth: 'practitioner',
    phases: ['exploration']
  },
  {
    id: 'aether-v1-1',
    text: 'What thread connects the most meaningful moments of your life?',
    element: 'aether',
    depth: 'seeker',
    phases: ['exploration', 'integration']
  },
  {
    id: 'aether-v1-2',
    text: 'Where are different parts of you in conflict? What do they each need?',
    element: 'aether',
    depth: 'practitioner',
    phases: ['exploration', 'integration']
  }
];

// ============================================================================
// FULL PROMPT LIBRARY (organized by element and depth)
// ============================================================================

export const fullPromptLibrary: SoulPrompt[] = [
  // ---------------------------------------------------------------------------
  // FIRE PROMPTS
  // ---------------------------------------------------------------------------

  // Seeker level
  {
    id: 'fire-seeker-1',
    text: 'What are you ready to let go of to make room for what wants to emerge?',
    element: 'fire',
    depth: 'seeker',
    phases: ['opening', 'exploration'],
    archetype: 'Creator'
  },
  {
    id: 'fire-seeker-2',
    text: 'What would you do today if you weren\'t afraid of failing?',
    element: 'fire',
    depth: 'seeker',
    phases: ['opening', 'exploration'],
    archetype: 'Warrior'
  },
  {
    id: 'fire-seeker-3',
    text: 'What makes you feel most alive?',
    element: 'fire',
    depth: 'seeker',
    phases: ['opening'],
    archetype: 'Visionary'
  },
  {
    id: 'fire-seeker-4',
    text: 'What anger or frustration is pointing you toward something that matters?',
    element: 'fire',
    depth: 'seeker',
    phases: ['exploration'],
    archetype: 'Warrior'
  },

  // Practitioner level
  {
    id: 'fire-prac-1',
    text: 'Where is your passion pointing you that your fear is blocking?',
    element: 'fire',
    depth: 'practitioner',
    phases: ['exploration'],
    archetype: 'Creator'
  },
  {
    id: 'fire-prac-2',
    text: 'What transformation have you been resisting because it feels too big?',
    element: 'fire',
    depth: 'practitioner',
    phases: ['exploration'],
    archetype: 'Visionary'
  },
  {
    id: 'fire-prac-3',
    text: 'What part of your old self needs to die for your new self to be born?',
    element: 'fire',
    depth: 'practitioner',
    phases: ['exploration', 'integration'],
    archetype: 'Creator'
  },
  {
    id: 'fire-prac-4',
    text: 'Where are you playing small to avoid the responsibility of your full power?',
    element: 'fire',
    depth: 'practitioner',
    phases: ['exploration'],
    archetype: 'Warrior'
  },

  // Alchemist level
  {
    id: 'fire-alch-1',
    text: 'What is the sacred rage beneath your careful composure, and what is it protecting?',
    element: 'fire',
    depth: 'alchemist',
    phases: ['exploration'],
    archetype: 'Warrior'
  },
  {
    id: 'fire-alch-2',
    text: 'In the rubedo of your becoming, what gold is being forged from your trials?',
    element: 'fire',
    depth: 'alchemist',
    phases: ['exploration', 'integration'],
    archetype: 'Visionary'
  },
  {
    id: 'fire-alch-3',
    text: 'What creative force moves through you that you\'ve been calling "too much"?',
    element: 'fire',
    depth: 'alchemist',
    phases: ['exploration'],
    archetype: 'Creator'
  },

  // ---------------------------------------------------------------------------
  // WATER PROMPTS
  // ---------------------------------------------------------------------------

  // Seeker level
  {
    id: 'water-seeker-1',
    text: 'What emotion keeps visiting you that you haven\'t fully welcomed?',
    element: 'water',
    depth: 'seeker',
    phases: ['opening', 'exploration'],
    archetype: 'Healer'
  },
  {
    id: 'water-seeker-2',
    text: 'Where are you forcing when you could be flowing?',
    element: 'water',
    depth: 'seeker',
    phases: ['exploration'],
    archetype: 'Mystic'
  },
  {
    id: 'water-seeker-3',
    text: 'What grief or loss is still asking for your attention?',
    element: 'water',
    depth: 'seeker',
    phases: ['exploration'],
    archetype: 'Healer'
  },
  {
    id: 'water-seeker-4',
    text: 'When you quiet everything else, what does your intuition whisper?',
    element: 'water',
    depth: 'seeker',
    phases: ['opening', 'exploration'],
    archetype: 'Mystic'
  },

  // Practitioner level
  {
    id: 'water-prac-1',
    text: 'What does your body know that your mind hasn\'t accepted yet?',
    element: 'water',
    depth: 'practitioner',
    phases: ['exploration'],
    archetype: 'Lover'
  },
  {
    id: 'water-prac-2',
    text: 'What vulnerability are you protecting that, if shared, could deepen your connections?',
    element: 'water',
    depth: 'practitioner',
    phases: ['exploration'],
    archetype: 'Lover'
  },
  {
    id: 'water-prac-3',
    text: 'What old pain are you ready to let the waters of compassion dissolve?',
    element: 'water',
    depth: 'practitioner',
    phases: ['exploration', 'integration'],
    archetype: 'Healer'
  },
  {
    id: 'water-prac-4',
    text: 'What dream keeps returning that you\'ve dismissed as impractical?',
    element: 'water',
    depth: 'practitioner',
    phases: ['exploration'],
    archetype: 'Mystic'
  },

  // Alchemist level
  {
    id: 'water-alch-1',
    text: 'In the dissolution of your certainties, what deeper truth is revealed in the waters?',
    element: 'water',
    depth: 'alchemist',
    phases: ['exploration'],
    archetype: 'Mystic'
  },
  {
    id: 'water-alch-2',
    text: 'What ancestral grief are you carrying that isn\'t yours to hold alone?',
    element: 'water',
    depth: 'alchemist',
    phases: ['exploration'],
    archetype: 'Healer'
  },
  {
    id: 'water-alch-3',
    text: 'Where has your heart built walls that were once necessary, but now imprison?',
    element: 'water',
    depth: 'alchemist',
    phases: ['exploration', 'integration'],
    archetype: 'Lover'
  },

  // ---------------------------------------------------------------------------
  // EARTH PROMPTS
  // ---------------------------------------------------------------------------

  // Seeker level
  {
    id: 'earth-seeker-1',
    text: 'What practical step have you been avoiding that would change everything?',
    element: 'earth',
    depth: 'seeker',
    phases: ['exploration', 'integration'],
    archetype: 'Builder'
  },
  {
    id: 'earth-seeker-2',
    text: 'How is your body asking to be cared for differently?',
    element: 'earth',
    depth: 'seeker',
    phases: ['opening', 'exploration'],
    archetype: 'Guardian'
  },
  {
    id: 'earth-seeker-3',
    text: 'What resources do you have that you\'re not fully using?',
    element: 'earth',
    depth: 'seeker',
    phases: ['exploration'],
    archetype: 'Builder'
  },
  {
    id: 'earth-seeker-4',
    text: 'Where do you need more structure? Where do you need less?',
    element: 'earth',
    depth: 'seeker',
    phases: ['exploration'],
    archetype: 'Sage'
  },

  // Practitioner level
  {
    id: 'earth-prac-1',
    text: 'What foundation in your life needs repair before you can build higher?',
    element: 'earth',
    depth: 'practitioner',
    phases: ['exploration'],
    archetype: 'Builder'
  },
  {
    id: 'earth-prac-2',
    text: 'What boundary do you need to set that you\'ve been avoiding?',
    element: 'earth',
    depth: 'practitioner',
    phases: ['exploration', 'integration'],
    archetype: 'Guardian'
  },
  {
    id: 'earth-prac-3',
    text: 'What does your body remember that your conscious mind has forgotten?',
    element: 'earth',
    depth: 'practitioner',
    phases: ['exploration'],
    archetype: 'Sage'
  },
  {
    id: 'earth-prac-4',
    text: 'Where are you over-giving and depleting your reserves?',
    element: 'earth',
    depth: 'practitioner',
    phases: ['exploration'],
    archetype: 'Guardian'
  },

  // Alchemist level
  {
    id: 'earth-alch-1',
    text: 'In the calcination of the material, what essence remains when comfort is stripped away?',
    element: 'earth',
    depth: 'alchemist',
    phases: ['exploration'],
    archetype: 'Sage'
  },
  {
    id: 'earth-alch-2',
    text: 'What is your body\'s wisdom about the pace of your transformation?',
    element: 'earth',
    depth: 'alchemist',
    phases: ['exploration', 'integration'],
    archetype: 'Guardian'
  },
  {
    id: 'earth-alch-3',
    text: 'What sacred container needs building to hold what\'s trying to be born through you?',
    element: 'earth',
    depth: 'alchemist',
    phases: ['exploration', 'integration'],
    archetype: 'Builder'
  },

  // ---------------------------------------------------------------------------
  // AIR PROMPTS
  // ---------------------------------------------------------------------------

  // Seeker level
  {
    id: 'air-seeker-1',
    text: 'What story are you telling yourself that might not be the whole truth?',
    element: 'air',
    depth: 'seeker',
    phases: ['opening', 'exploration'],
    archetype: 'Scholar'
  },
  {
    id: 'air-seeker-2',
    text: 'If you could see your situation from 10,000 feet up, what would you notice?',
    element: 'air',
    depth: 'seeker',
    phases: ['exploration'],
    archetype: 'Messenger'
  },
  {
    id: 'air-seeker-3',
    text: 'What conversation are you avoiding that could unlock something important?',
    element: 'air',
    depth: 'seeker',
    phases: ['exploration'],
    archetype: 'Bridge'
  },
  {
    id: 'air-seeker-4',
    text: 'How would someone who loves you describe your current situation?',
    element: 'air',
    depth: 'seeker',
    phases: ['exploration'],
    archetype: 'Messenger'
  },

  // Practitioner level
  {
    id: 'air-prac-1',
    text: 'What belief served you once but has become a cage?',
    element: 'air',
    depth: 'practitioner',
    phases: ['exploration'],
    archetype: 'Scholar'
  },
  {
    id: 'air-prac-2',
    text: 'What truth are you hiding from yourself to maintain a comfortable illusion?',
    element: 'air',
    depth: 'practitioner',
    phases: ['exploration'],
    archetype: 'Scholar'
  },
  {
    id: 'air-prac-3',
    text: 'What would your wisest self say to your most anxious self right now?',
    element: 'air',
    depth: 'practitioner',
    phases: ['exploration', 'integration'],
    archetype: 'Bridge'
  },
  {
    id: 'air-prac-4',
    text: 'What question are you afraid to ask because you might know the answer?',
    element: 'air',
    depth: 'practitioner',
    phases: ['exploration'],
    archetype: 'Messenger'
  },

  // Alchemist level
  {
    id: 'air-alch-1',
    text: 'In the separation of the true from the false, what cherished belief must you release?',
    element: 'air',
    depth: 'alchemist',
    phases: ['exploration'],
    archetype: 'Scholar'
  },
  {
    id: 'air-alch-2',
    text: 'What mercury intelligence moves between your divided selves, seeking reconciliation?',
    element: 'air',
    depth: 'alchemist',
    phases: ['exploration', 'integration'],
    archetype: 'Bridge'
  },
  {
    id: 'air-alch-3',
    text: 'What message have you been chosen to carry that you\'ve been resisting?',
    element: 'air',
    depth: 'alchemist',
    phases: ['exploration'],
    archetype: 'Messenger'
  },

  // ---------------------------------------------------------------------------
  // AETHER PROMPTS
  // ---------------------------------------------------------------------------

  // Seeker level
  {
    id: 'aether-seeker-1',
    text: 'What thread connects the most meaningful moments of your life?',
    element: 'aether',
    depth: 'seeker',
    phases: ['exploration', 'integration'],
    archetype: 'Oracle'
  },
  {
    id: 'aether-seeker-2',
    text: 'What keeps showing up in your life that might be a pattern worth understanding?',
    element: 'aether',
    depth: 'seeker',
    phases: ['exploration'],
    archetype: 'Alchemist'
  },
  {
    id: 'aether-seeker-3',
    text: 'If your soul chose this particular life, what might it be learning?',
    element: 'aether',
    depth: 'seeker',
    phases: ['exploration'],
    archetype: 'Oracle'
  },
  {
    id: 'aether-seeker-4',
    text: 'What would integration look like for you right now?',
    element: 'aether',
    depth: 'seeker',
    phases: ['integration'],
    archetype: 'Unity'
  },

  // Practitioner level
  {
    id: 'aether-prac-1',
    text: 'Where are different parts of you in conflict? What do they each need?',
    element: 'aether',
    depth: 'practitioner',
    phases: ['exploration', 'integration'],
    archetype: 'Alchemist'
  },
  {
    id: 'aether-prac-2',
    text: 'What is the deeper pattern beneath the surface pattern you\'ve been working with?',
    element: 'aether',
    depth: 'practitioner',
    phases: ['exploration'],
    archetype: 'Oracle'
  },
  {
    id: 'aether-prac-3',
    text: 'What gift do you carry that you\'ve been treating as a burden?',
    element: 'aether',
    depth: 'practitioner',
    phases: ['exploration', 'integration'],
    archetype: 'Unity'
  },
  {
    id: 'aether-prac-4',
    text: 'How are your struggles preparing you to serve others who will face the same path?',
    element: 'aether',
    depth: 'practitioner',
    phases: ['integration'],
    archetype: 'Alchemist'
  },

  // Alchemist level
  {
    id: 'aether-alch-1',
    text: 'In the conjunction of opposites, what transcendent third is being born?',
    element: 'aether',
    depth: 'alchemist',
    phases: ['exploration', 'integration'],
    archetype: 'Alchemist'
  },
  {
    id: 'aether-alch-2',
    text: 'What is the golden thread of your soul pattern that connects all your incarnations of self?',
    element: 'aether',
    depth: 'alchemist',
    phases: ['exploration'],
    archetype: 'Oracle'
  },
  {
    id: 'aether-alch-3',
    text: 'Where is the philosopher\'s stone hidden in your wound?',
    element: 'aether',
    depth: 'alchemist',
    phases: ['exploration', 'integration'],
    archetype: 'Unity'
  },

  // ---------------------------------------------------------------------------
  // COMMUNITY-LINKED PROMPTS
  // ---------------------------------------------------------------------------
  {
    id: 'community-1',
    text: 'What pattern has someone else\'s share in the Commons illuminated in you?',
    element: 'aether',
    depth: 'practitioner',
    phases: ['opening', 'exploration'],
    communityLinked: true
  },
  {
    id: 'community-2',
    text: 'What breakthrough of your own might serve another soul on a similar path?',
    element: 'aether',
    depth: 'practitioner',
    phases: ['integration'],
    communityLinked: true
  },
  {
    id: 'community-3',
    text: 'Where do you see your own journey reflected in the collective field?',
    element: 'aether',
    depth: 'alchemist',
    phases: ['exploration'],
    communityLinked: true
  },

  // ---------------------------------------------------------------------------
  // SESSION PHASE-SPECIFIC PROMPTS
  // ---------------------------------------------------------------------------

  // Opening prompts (gentle entry)
  {
    id: 'phase-opening-1',
    text: 'What\'s alive in you right now?',
    element: 'water',
    depth: 'seeker',
    phases: ['opening']
  },
  {
    id: 'phase-opening-2',
    text: 'What brought you here today?',
    element: 'earth',
    depth: 'seeker',
    phases: ['opening']
  },

  // Closure prompts (integration)
  {
    id: 'phase-closure-1',
    text: 'What wants to be remembered from our conversation?',
    element: 'aether',
    depth: 'seeker',
    phases: ['closure']
  },
  {
    id: 'phase-closure-2',
    text: 'What one thing will you carry forward from this session?',
    element: 'earth',
    depth: 'seeker',
    phases: ['closure']
  },
  {
    id: 'phase-closure-3',
    text: 'What integration is asking to happen between now and next time?',
    element: 'aether',
    depth: 'practitioner',
    phases: ['closure']
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get prompts filtered by element, depth, and/or phase
 */
export function getPrompts(filters?: {
  element?: Element;
  depth?: DepthLevel;
  phase?: SessionPhase;
  communityLinked?: boolean;
}): SoulPrompt[] {
  let prompts = fullPromptLibrary;

  if (filters?.element) {
    prompts = prompts.filter(p => p.element === filters.element);
  }
  if (filters?.depth) {
    prompts = prompts.filter(p => p.depth === filters.depth);
  }
  if (filters?.phase) {
    const phase = filters.phase;
    prompts = prompts.filter(p => p.phases.includes(phase));
  }
  if (filters?.communityLinked !== undefined) {
    prompts = prompts.filter(p => p.communityLinked === filters.communityLinked);
  }

  return prompts;
}

/**
 * Get prompts appropriate for a user's consciousness level
 * Level 1-2: seeker prompts only
 * Level 3-4: seeker + practitioner
 * Level 5: all depths
 */
export function getPromptsForLevel(level: number): SoulPrompt[] {
  if (level <= 2) {
    return fullPromptLibrary.filter(p => p.depth === 'seeker');
  }
  if (level <= 4) {
    return fullPromptLibrary.filter(p => p.depth !== 'alchemist');
  }
  return fullPromptLibrary;
}

/**
 * Get a random prompt, optionally filtered
 */
export function getRandomPrompt(filters?: {
  element?: Element;
  depth?: DepthLevel;
  phase?: SessionPhase;
}): SoulPrompt | null {
  const prompts = getPrompts(filters);
  if (prompts.length === 0) return null;
  return prompts[Math.floor(Math.random() * prompts.length)];
}

/**
 * Get prompts grouped by element
 */
export function getPromptsByElement(): Record<Element, SoulPrompt[]> {
  return {
    fire: fullPromptLibrary.filter(p => p.element === 'fire'),
    water: fullPromptLibrary.filter(p => p.element === 'water'),
    earth: fullPromptLibrary.filter(p => p.element === 'earth'),
    air: fullPromptLibrary.filter(p => p.element === 'air'),
    aether: fullPromptLibrary.filter(p => p.element === 'aether')
  };
}

/**
 * Depth level descriptions for UI
 */
export const depthDescriptions: Record<DepthLevel, {
  label: string;
  description: string;
  icon: string;
}> = {
  seeker: {
    label: 'Seeker',
    description: 'Accessible entry points for reflection',
    icon: '🌱'
  },
  practitioner: {
    label: 'Practitioner',
    description: 'Deeper inquiry for those familiar with inner work',
    icon: '🌿'
  },
  alchemist: {
    label: 'Alchemist',
    description: 'Advanced work with shadow, transformation, and integration',
    icon: '🌳'
  }
};
