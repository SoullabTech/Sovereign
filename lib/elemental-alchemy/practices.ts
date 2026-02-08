/**
 * ELEMENTAL ALCHEMY PRACTICES
 *
 * 43 interactive practices extracted from Kelly Nezat's
 * "Elemental Alchemy: The Ancient Art of Living a Phenomenal Life"
 *
 * Supports future audio guides via optional audioGuide field.
 */

import type { ElementKey } from './assessmentQuestions';

export type PracticeCategory =
  | 'meditation'
  | 'journaling'
  | 'movement'
  | 'creative'
  | 'nature'
  | 'shadow-work'
  | 'relational'
  | 'ritual';

export interface Practice {
  id: string;
  title: string;
  element: ElementKey | 'all';
  chapterNum: number;
  category: PracticeCategory;
  duration?: string;
  instructions: string[];
  reflectionPrompt?: string;
  shadowAwareness?: string;
  audioGuide?: string; // Future: path to guided audio
}

export const PRACTICES: Practice[] = [
  // ============================================
  // FIRE PRACTICES (Chapters 5-8)
  // ============================================
  {
    id: 'fire-candle-meditation',
    title: 'Candle Meditation',
    element: 'fire',
    chapterNum: 7,
    category: 'meditation',
    duration: '5-10 minutes',
    instructions: [
      'Find a quiet space and light a candle.',
      'Sit comfortably at a safe distance from the flame.',
      'Soften your gaze and allow the flame to draw your attention.',
      'Let the flickering light guide you into a state of deep presence.',
      'Notice thoughts arise and let them pass like smoke.',
      'Allow the flame to symbolize your inner fire—your passion and vision.',
      'When ready, close your eyes and carry the warmth within.'
    ],
    reflectionPrompt: 'What visions or inspirations arose during this meditation? What is your inner fire calling you toward?',
    shadowAwareness: 'Be mindful of the fire becoming scattered or consuming. Balance intensity with sustainable warmth.'
  },
  {
    id: 'fire-creative-visualization',
    title: 'Creative Visualization',
    element: 'fire',
    chapterNum: 7,
    category: 'meditation',
    duration: '10-15 minutes',
    instructions: [
      'Close your eyes and take several deep breaths.',
      'Visualize yourself surrounded by a healing, empowering flame.',
      'See this flame as golden-orange, warm and transformative.',
      'Imagine the flame burning away negative thoughts and feelings.',
      'Watch as old conditioning, fears, and limitations turn to ash.',
      'Feel yourself emerging renewed, clear, and strong.',
      'See yourself embodying your highest vision.',
      'Slowly return, carrying this renewed energy with you.'
    ],
    reflectionPrompt: 'What did the fire transform? What emerged from the ashes? How do you feel different?'
  },
  {
    id: 'fire-passion-journaling',
    title: 'Fire Journaling',
    element: 'fire',
    chapterNum: 7,
    category: 'journaling',
    duration: '15-20 minutes',
    instructions: [
      'Find a comfortable space with your journal.',
      'Recall a time when you felt passionate and inspired.',
      'Write freely about what sparked that fire within you.',
      'Describe how it felt in your body, heart, and mind.',
      'Explore: What conditions allowed that fire to burn?',
      'Consider: How can you bring more of this into your life now?',
      'List three actions that could reignite your passion.'
    ],
    reflectionPrompt: 'What patterns do you notice in what ignites your passion? What small step could you take today?'
  },
  {
    id: 'fire-physical-movement',
    title: 'Physical Movement Practice',
    element: 'fire',
    chapterNum: 7,
    category: 'movement',
    duration: '15-30 minutes',
    instructions: [
      'Choose a form of physical movement that calls to you.',
      'This could be dance, a brisk walk, yoga, or any exercise.',
      'Begin with intention: "I am fueling my inner fire."',
      'Move with full presence and engagement.',
      'Notice the heat building in your body.',
      'Let movement become an expression of your vital energy.',
      'Feel the transformation that comes through embodied action.'
    ],
    reflectionPrompt: 'How did movement affect your energy? What fire did you awaken through your body?',
    shadowAwareness: 'Avoid pushing to burnout. Sustainable fire knows when to rest.'
  },
  {
    id: 'fire-artistic-expression',
    title: 'Artistic Expression',
    element: 'fire',
    chapterNum: 7,
    category: 'creative',
    duration: '20-60 minutes',
    instructions: [
      'Find a space where you can create freely.',
      'Choose your medium: singing, playing music, drawing, sewing, dance, or any creative expression.',
      'Set aside perfectionism and judgment.',
      'Let your creative juices flow without censorship.',
      'Express what wants to come through you.',
      'Follow impulses and let the creation surprise you.',
      'Honor whatever emerges as a gift from your inner fire.'
    ],
    reflectionPrompt: 'What did creating reveal about your inner landscape? What wants to be expressed through you?'
  },
  {
    id: 'fire-connection',
    title: 'Connect with Fire',
    element: 'fire',
    chapterNum: 7,
    category: 'nature',
    duration: '30+ minutes',
    instructions: [
      'Spend time with fire in a safe setting.',
      'This could be a campfire, fire pit, or even watching flames in a video if needed.',
      'Sit in contemplation of the fire\'s nature.',
      'Watch how it dances, transforms, and consumes.',
      'Reflect on fire\'s role in human history and spirituality.',
      'Consider what fire teaches about transformation.',
      'Let the fire be a mirror for your own transformative power.'
    ],
    reflectionPrompt: 'What wisdom did the fire share with you? How does transformation appear in your life?'
  },

  // ============================================
  // WATER PRACTICES (Chapters 9-11)
  // ============================================
  {
    id: 'water-emotional-intelligence',
    title: 'Emotional Intelligence Practice',
    element: 'water',
    chapterNum: 10,
    category: 'shadow-work',
    duration: '15-20 minutes',
    instructions: [
      'Find a quiet space and turn inward.',
      'Scan your body for any emotional sensations.',
      'Name what you\'re feeling without judgment.',
      'Recognize: Where do you feel this emotion in your body?',
      'Allow the feeling to be present without trying to fix it.',
      'Ask: What is this emotion telling me?',
      'Practice articulating the meaning behind the feeling.',
      'Honor the wisdom your emotions carry.'
    ],
    reflectionPrompt: 'What emotions did you discover? What messages were they carrying for you?',
    shadowAwareness: 'Avoid drowning in emotion or intellectualizing feelings away. Find the balance.'
  },
  {
    id: 'water-empathetic-engagement',
    title: 'Empathetic Engagement',
    element: 'water',
    chapterNum: 10,
    category: 'relational',
    duration: '10-15 minutes',
    instructions: [
      'Think of someone in your life who is struggling.',
      'Imagine yourself in their situation.',
      'Feel into their emotional experience without losing yourself.',
      'Notice what arises in your heart.',
      'Consider how you might support them using their emotional language.',
      'Practice holding space without trying to fix.',
      'Send them compassion from your heart.'
    ],
    reflectionPrompt: 'How did it feel to empathize deeply? What did you learn about compassionate presence?'
  },
  {
    id: 'water-deep-immersion-journaling',
    title: 'Deep Immersion Journaling',
    element: 'water',
    chapterNum: 10,
    category: 'journaling',
    duration: '20-30 minutes',
    instructions: [
      'Create a peaceful environment for writing.',
      'Take a few breaths and turn your attention inward.',
      'Dive into your feelings, emotions, and inner senses.',
      'Write without editing or censorship.',
      'Explore your inner dreams and hidden values.',
      'Look for meanings beneath the surface.',
      'Let your writing take you to unexpected depths.',
      'Trust what emerges as your inner elixir.'
    ],
    reflectionPrompt: 'What did you discover in the depths? What hidden wisdom surfaced?'
  },
  {
    id: 'water-shadow-integration',
    title: 'Shadow Work Integration',
    element: 'water',
    chapterNum: 10,
    category: 'shadow-work',
    duration: '25-30 minutes',
    instructions: [
      'Identify something in the outer world that triggers strong reaction in you.',
      'Ask: What shadow of mine is this reflecting?',
      'Explore: Where does this pattern live within me?',
      'Trace this shadow to its earliest memory.',
      'Offer compassion to the part of you that developed this protection.',
      'Ask the shadow what it needs to become an ally.',
      'Visualize integrating this aspect with love.',
      'Thank it for becoming a conscious part of you.'
    ],
    reflectionPrompt: 'What shadow did you meet? How can it become a source of strength?',
    shadowAwareness: 'Shadow work requires gentleness. Don\'t force what isn\'t ready to emerge.'
  },
  {
    id: 'water-emotional-release',
    title: 'Emotional Release Practice',
    element: 'water',
    chapterNum: 10,
    category: 'meditation',
    duration: '15-20 minutes',
    instructions: [
      'Find a private, safe space.',
      'Set the intention to release what no longer serves you.',
      'Take deep breaths and scan for areas of emotional holding.',
      'Allow whatever wants to move to move—tears, sound, shaking.',
      'Trust your body\'s wisdom to release appropriately.',
      'Don\'t force or perform; simply allow.',
      'Afterward, rest in stillness and receive.',
      'Notice the spaciousness that emerges.'
    ],
    reflectionPrompt: 'What did you release? What new space opened within you?'
  },

  // ============================================
  // EARTH PRACTICES (Chapters 12-14)
  // ============================================
  {
    id: 'earth-mission-clarification',
    title: 'Mission Clarification',
    element: 'earth',
    chapterNum: 12,
    category: 'journaling',
    duration: '20-30 minutes',
    instructions: [
      'Settle into a grounded, comfortable position.',
      'Reflect on your deepest sense of purpose.',
      'Write about: What mission calls to you?',
      'Consider: How do you want to serve your community?',
      'Identify the gifts you have to offer.',
      'Envision the contribution you want to make.',
      'Distill this into a clear mission statement.',
      'Feel how this mission grounds and roots you.'
    ],
    reflectionPrompt: 'What is your mission in this life? How does naming it change your orientation?'
  },
  {
    id: 'earth-resource-planning',
    title: 'Resource Planning',
    element: 'earth',
    chapterNum: 12,
    category: 'ritual',
    duration: '30-45 minutes',
    instructions: [
      'Choose a goal or project you want to manifest.',
      'List all resources you currently have available.',
      'Identify resources you need to gather.',
      'Map out the practical steps required.',
      'Create a timeline with concrete milestones.',
      'Consider who might support this journey.',
      'Ground your vision in practical reality.',
      'Take one small action today.'
    ],
    reflectionPrompt: 'How does practical planning affect your relationship with your dreams?'
  },
  {
    id: 'earth-embodied-practice',
    title: 'Embodied Gardening Practice',
    element: 'earth',
    chapterNum: 13,
    category: 'nature',
    duration: '30-60 minutes',
    instructions: [
      'Engage with earth literally—garden, pot plants, or work with soil.',
      'Plant seeds with intention, naming what you want to grow.',
      'Notice the patience required for growth.',
      'Tend to what you\'ve planted with care.',
      'Observe how different conditions affect growth.',
      'Practice adaptability in your approach.',
      'Trust the timing of natural cycles.',
      'Let gardening teach you about manifestation.'
    ],
    reflectionPrompt: 'What did working with earth teach you about patience and growth?'
  },
  {
    id: 'earth-practical-skill',
    title: 'Practical Skill Building',
    element: 'earth',
    chapterNum: 13,
    category: 'creative',
    duration: '30+ minutes',
    instructions: [
      'Choose a practical skill you want to develop.',
      'This could be cooking, building, crafting, or any hands-on work.',
      'Approach it as a meditative practice.',
      'Focus on refining your technique with each repetition.',
      'Notice how mastery develops through patient practice.',
      'Celebrate small improvements.',
      'Let the physical work ground your awareness.',
      'Build discipline through consistent effort.'
    ],
    reflectionPrompt: 'How does developing practical skills affect your sense of capability and groundedness?',
    shadowAwareness: 'Avoid perfectionism or rigidity. Earth grows through flexible adaptation.'
  },

  // ============================================
  // AIR PRACTICES (Chapters 15-16)
  // ============================================
  {
    id: 'air-vision-meditation',
    title: 'Vision Meditation',
    element: 'air',
    chapterNum: 15,
    category: 'meditation',
    duration: '15-20 minutes',
    instructions: [
      'Find a comfortable seat with an open posture.',
      'Close your eyes and let your mind expand.',
      'Connect with your deepest dreams and aspirations.',
      'Allow visions to arise without forcing.',
      'Notice the quality of thoughts as they flow.',
      'Follow threads of inspiration.',
      'Let new perspectives and possibilities emerge.',
      'When complete, note any insights that arose.'
    ],
    reflectionPrompt: 'What visions emerged? What new perspectives did you gain?'
  },
  {
    id: 'air-intellectual-exploration',
    title: 'Intellectual Exploration',
    element: 'air',
    chapterNum: 15,
    category: 'journaling',
    duration: '30-45 minutes',
    instructions: [
      'Choose a topic that sparks your curiosity.',
      'Embark on a journey of learning and exploration.',
      'Read, research, or contemplate this topic.',
      'Take notes on what resonates and surprises you.',
      'Make connections to other areas of knowledge.',
      'Let your mind play with ideas freely.',
      'Synthesize what you\'ve learned into new understanding.',
      'Share or teach what you discovered.'
    ],
    reflectionPrompt: 'What did you learn? How does new knowledge change your perspective?',
    shadowAwareness: 'Balance intellectual pursuit with embodied application. Ideas need grounding.'
  },
  {
    id: 'air-intention-setting',
    title: 'Intention Setting Practice',
    element: 'air',
    chapterNum: 15,
    category: 'ritual',
    duration: '15-20 minutes',
    instructions: [
      'Create a clear, focused space for contemplation.',
      'Reflect on what you want to create or experience.',
      'Clarify your intention into a single, clear statement.',
      'Write your intention with precision and power.',
      'Speak it aloud to give it breath.',
      'Align your mental faculties with this goal.',
      'Visualize the intention manifesting.',
      'Release attachment to how it unfolds.'
    ],
    reflectionPrompt: 'How did clarifying your intention affect your focus and motivation?'
  },
  {
    id: 'air-shared-dialogue',
    title: 'Shared Dialogue Practice',
    element: 'air',
    chapterNum: 15,
    category: 'relational',
    duration: '30-60 minutes',
    instructions: [
      'Invite someone into meaningful conversation.',
      'Choose a topic that matters to both of you.',
      'Practice deep listening as they speak.',
      'Share your own perspective with clarity.',
      'Notice how ideas become luminous through exchange.',
      'Let the conversation take unexpected turns.',
      'Discover what emerges between you.',
      'Express gratitude for the connection.'
    ],
    reflectionPrompt: 'What emerged through dialogue that wouldn\'t have alone? How did expression clarify your thinking?'
  },
  {
    id: 'air-thought-leadership',
    title: 'Thought Leadership Journaling',
    element: 'air',
    chapterNum: 16,
    category: 'journaling',
    duration: '25-30 minutes',
    instructions: [
      'Choose a subject where you have insights to share.',
      'Write about your unique perspective on this topic.',
      'Organize your thoughts with clarity and structure.',
      'Practice expressing complex ideas simply.',
      'Consider how your insights might help others.',
      'Refine your language for maximum impact.',
      'Feel the power of articulate expression.',
      'Plan how you might share these ideas.'
    ],
    reflectionPrompt: 'What ideas are you meant to share with the world? How can you communicate them effectively?'
  },

  // ============================================
  // AETHER PRACTICES (Chapters 17-18)
  // ============================================
  {
    id: 'aether-inner-silence',
    title: 'Inner Silence Practice',
    element: 'aether',
    chapterNum: 17,
    category: 'meditation',
    duration: '15-30 minutes',
    instructions: [
      'Find a quiet, undisturbed space.',
      'Sit comfortably and close your eyes.',
      'Let go of any agenda or goal.',
      'Allow thoughts to settle naturally.',
      'Rest in the stillness beneath mental activity.',
      'Notice the spacious awareness that contains all experience.',
      'Let insights, urges, and visions arise naturally.',
      'Trust what emerges from this sacred stillness.'
    ],
    reflectionPrompt: 'What arose from the silence? What wisdom comes when you stop seeking?',
    shadowAwareness: 'Beware of escaping into transcendence. Aether integrates; it doesn\'t bypass.'
  },
  {
    id: 'aether-unity-meditation',
    title: 'Unity Meditation',
    element: 'aether',
    chapterNum: 17,
    category: 'meditation',
    duration: '20-30 minutes',
    instructions: [
      'Begin with several deep, centering breaths.',
      'Visualize your awareness expanding beyond your body.',
      'Sense your connection to everyone in your home.',
      'Expand to include your neighborhood, city, country.',
      'Feel your connection to all beings on Earth.',
      'Expand to include the cosmos itself.',
      'Rest in the awareness of universal unity.',
      'Slowly return, carrying this expanded awareness.'
    ],
    reflectionPrompt: 'How does experiencing unity change your relationship with separation and difference?'
  },
  {
    id: 'aether-integrated-reflection',
    title: 'Integrated Reflection',
    element: 'aether',
    chapterNum: 18,
    category: 'journaling',
    duration: '25-30 minutes',
    instructions: [
      'Review your experiences across all elements.',
      'Notice patterns that connect your fire, water, earth, and air.',
      'See how each element supports and balances the others.',
      'Identify where integration is needed.',
      'Celebrate areas of natural harmony.',
      'Set intentions for more balanced elemental expression.',
      'Feel yourself as a unified whole.',
      'Honor your unique elemental signature.'
    ],
    reflectionPrompt: 'How do the elements dance together in your life? Where is integration calling?'
  },

  // ============================================
  // CROSS-ELEMENTAL PRACTICES
  // ============================================
  {
    id: 'all-elemental-awareness-journey',
    title: 'Elemental Awareness Journey',
    element: 'all',
    chapterNum: 4,
    category: 'meditation',
    duration: '25-35 minutes',
    instructions: [
      'Step 1: Set Your Intention - What do you hope to gain from this journey?',
      'Step 2: Excite Your Imaginal Cells - Recall familiar places in nature or imagine ideal settings.',
      'Step 3: Engage Your Senses - Bring all embodied senses to awareness—sights, sounds, smells, tastes, sensations.',
      'Step 4: Drop Out of Your Analytical Mind - Let go of expectations, invite elements of awareness and play.',
      'Step 5: Travel through each element in turn—Fire, Water, Earth, Air, Aether.',
      'Step 6: Notice what each element offers you in this moment.',
      'Step 7: Return slowly, integrating what you received.',
      'Step 8: Reflect and Share - Integrate the insights into daily life.'
    ],
    reflectionPrompt: 'What did each element offer you? How can you integrate these gifts?'
  },
  {
    id: 'all-morning-ritual',
    title: 'Morning Ritual',
    element: 'all',
    chapterNum: 3,
    category: 'ritual',
    duration: '15-30 minutes',
    instructions: [
      'Upon waking, take a moment of stillness before moving.',
      'Set an intention for your day.',
      'Move your body gently—stretching, yoga, or dance (Fire/Earth).',
      'Take several conscious breaths (Air).',
      'Feel gratitude flowing through your heart (Water).',
      'Connect with something greater than yourself (Aether).',
      'Ground into your physical body and the day ahead (Earth).',
      'Carry the integration of all elements into your activities.'
    ],
    reflectionPrompt: 'How does starting your day with elemental awareness affect your experience?'
  },
  {
    id: 'all-nature-connection',
    title: 'Nature Connection Practice',
    element: 'all',
    chapterNum: 4,
    category: 'nature',
    duration: '30-60 minutes',
    instructions: [
      'Spend time in nature intentionally.',
      'Notice the fire element: sunlight, warmth, life energy.',
      'Feel the water element: moisture, fluidity, the flow of life.',
      'Connect with earth: ground beneath you, stability, support.',
      'Sense the air: breath, wind, the space between things.',
      'Perceive the aether: the unity that holds all elements together.',
      'Let nature teach you about elemental harmony.',
      'Bring this awareness back to your daily life.'
    ],
    reflectionPrompt: 'How do the elements express themselves in nature? What does this teach you about your own nature?'
  },
  {
    id: 'all-conscious-awareness-reflection',
    title: 'Conscious Awareness Reflection',
    element: 'all',
    chapterNum: 4,
    category: 'journaling',
    duration: '20-25 minutes',
    instructions: [
      'Recall a recent experience where you felt profound connection to nature.',
      'Journal about how each aspect of conscious awareness manifested:',
      '- Intuition: What did you sense beyond the physical?',
      '- Emotions: What feelings arose?',
      '- Senses: What did you perceive through your body?',
      '- Thoughts: What ideas or insights emerged?',
      '- Spirit: How did you feel connected to something greater?',
      'Notice how these aspects shaped your perception and experience.'
    ],
    reflectionPrompt: 'How do the different aspects of consciousness work together in your experience?'
  }
];

// Return all practices (used by state vector practice router)
export function getAllPractices(): Practice[] {
  return PRACTICES;
}

// Helper functions for filtering and organizing practices
export function getPracticesByElement(element: ElementKey | 'all'): Practice[] {
  if (element === 'all') {
    return PRACTICES.filter(p => p.element === 'all');
  }
  return PRACTICES.filter(p => p.element === element || p.element === 'all');
}

export function getPracticesByCategory(category: PracticeCategory): Practice[] {
  return PRACTICES.filter(p => p.category === category);
}

export function getPracticeById(id: string): Practice | undefined {
  return PRACTICES.find(p => p.id === id);
}

export const CATEGORY_LABELS: Record<PracticeCategory, string> = {
  meditation: 'Meditation',
  journaling: 'Journaling',
  movement: 'Movement',
  creative: 'Creative Expression',
  nature: 'Nature Immersion',
  'shadow-work': 'Shadow Work',
  relational: 'Relational Practice',
  ritual: 'Ritual'
};

export const CATEGORY_ICONS: Record<PracticeCategory, string> = {
  meditation: 'brain',
  journaling: 'pen-line',
  movement: 'activity',
  creative: 'palette',
  nature: 'trees',
  'shadow-work': 'eye',
  relational: 'users',
  ritual: 'sparkles'
};
