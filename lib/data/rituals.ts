import type { Element } from '@/lib/types/oracle';

export interface Ritual {
  id: string;
  name: string;
  element: Element;
  petalNumber?: number;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  intention: string;
  steps: RitualStep[];
  tools?: string[];
  bestTime?: 'morning' | 'midday' | 'evening' | 'night' | 'any';
  moonPhase?: 'new' | 'waxing' | 'full' | 'waning' | 'any';
  voiceGuidance?: boolean;
}

export interface RitualStep {
  order: number;
  instruction: string;
  duration?: number; // in seconds
  breathCount?: number;
  visualization?: string;
  mantra?: string;
}

export const RITUALS: Ritual[] = [
  // AIR RITUALS
  {
    id: 'air-1-inspire',
    name: 'Morning Breath of Inspiration',
    element: 'air',
    petalNumber: 1,
    duration: 10,
    difficulty: 'beginner',
    description: 'Open channels of creative inspiration through conscious breathing',
    intention: 'To invite fresh perspectives and new ideas',
    tools: ['Journal', 'Incense (optional)'],
    bestTime: 'morning',
    voiceGuidance: true,
    steps: [
      {
        order: 1,
        instruction: 'Sit comfortably with spine straight, facing east if possible',
        duration: 30,
        visualization: 'See yourself surrounded by gentle, swirling winds'
      },
      {
        order: 2,
        instruction: 'Take 3 deep cleansing breaths, releasing all stagnant energy',
        duration: 60,
        breathCount: 3
      },
      {
        order: 3,
        instruction: 'Begin the Inspiration Breath: Inhale for 4, Hold for 4, Exhale for 6',
        duration: 280,
        breathCount: 20,
        mantra: 'I am open to divine inspiration'
      },
      {
        order: 4,
        instruction: 'Place hand on heart and speak your creative intention for the day',
        duration: 60
      },
      {
        order: 5,
        instruction: 'Journal any insights, images, or ideas that arose',
        duration: 180
      }
    ]
  },
  {
    id: 'air-2-collaborate',
    name: 'Sacred Circle Connection',
    element: 'air',
    petalNumber: 2,
    duration: 15,
    difficulty: 'intermediate',
    description: 'Energetically connect with your soul family and collaborators',
    intention: 'To strengthen bonds and invite synchronistic connections',
    bestTime: 'any',
    voiceGuidance: true,
    steps: [
      {
        order: 1,
        instruction: 'Create a circle with crystals or draw one with your finger in the air',
        duration: 60
      },
      {
        order: 2,
        instruction: 'Light a white candle in the center (or visualize one)',
        duration: 30
      },
      {
        order: 3,
        instruction: 'Call in the names or energies of those you wish to connect with',
        duration: 120,
        visualization: 'See threads of light connecting you to each person'
      },
      {
        order: 4,
        instruction: 'Send loving energy through each thread for 3 breaths per connection',
        duration: 300,
        breathCount: 15
      },
      {
        order: 5,
        instruction: 'Close by thanking all souls for their presence in your journey',
        duration: 60
      }
    ]
  },

  // FIRE RITUALS
  {
    id: 'fire-1-activate',
    name: 'Inner Fire Activation',
    element: 'fire',
    petalNumber: 1,
    duration: 12,
    difficulty: 'beginner',
    description: 'Awaken your inner flame and activate personal power',
    intention: 'To ignite passion, courage, and vital life force',
    tools: ['Red candle', 'Cinnamon or ginger (optional)'],
    bestTime: 'morning',
    moonPhase: 'waxing',
    voiceGuidance: true,
    steps: [
      {
        order: 1,
        instruction: 'Stand in a power stance, feet hip-width apart, hands on hips',
        duration: 30
      },
      {
        order: 2,
        instruction: 'Begin Fire Breath: Sharp exhales through nose, passive inhales',
        duration: 60,
        breathCount: 30,
        visualization: 'See a golden flame growing in your solar plexus'
      },
      {
        order: 3,
        instruction: 'Rub palms together vigorously until they feel hot',
        duration: 30
      },
      {
        order: 4,
        instruction: 'Place hot palms on solar plexus and feel the warmth spreading',
        duration: 60,
        mantra: 'I am powerful, I am alive, I am fire'
      },
      {
        order: 5,
        instruction: 'Make 3 bold declarations of what you will create today',
        duration: 90
      },
      {
        order: 6,
        instruction: 'Seal with a power gesture (fist pump, clap, or stomp)',
        duration: 30
      }
    ]
  },
  {
    id: 'fire-2-transform',
    name: 'Phoenix Transformation Ritual',
    element: 'fire',
    petalNumber: 2,
    duration: 20,
    difficulty: 'advanced',
    description: 'Burn away the old to make space for rebirth',
    intention: 'To release what no longer serves and embrace transformation',
    tools: ['Paper', 'Fire-safe bowl', 'Matches'],
    bestTime: 'evening',
    moonPhase: 'waning',
    voiceGuidance: true,
    steps: [
      {
        order: 1,
        instruction: 'Write what you are ready to release on small pieces of paper',
        duration: 180
      },
      {
        order: 2,
        instruction: 'Hold each paper, thank it for its lessons, feel the emotion fully',
        duration: 120
      },
      {
        order: 3,
        instruction: 'Safely burn each paper, watching it transform to ash',
        duration: 180,
        visualization: 'See yourself rising from the ashes, renewed'
      },
      {
        order: 4,
        instruction: 'As smoke rises, speak: "I release you with love and gratitude"',
        duration: 60,
        mantra: 'I am the phoenix, I rise, I transform'
      },
      {
        order: 5,
        instruction: 'Place hand on heart and declare what you are becoming',
        duration: 120
      },
      {
        order: 6,
        instruction: 'Scatter or bury the ashes, returning them to Earth',
        duration: 120
      }
    ]
  },

  // WATER RITUALS
  {
    id: 'water-1-flow',
    name: 'River of Allowing',
    element: 'water',
    petalNumber: 1,
    duration: 15,
    difficulty: 'beginner',
    description: 'Enter a state of flow and release resistance',
    intention: 'To move with life\'s currents rather than against them',
    tools: ['Bowl of water', 'Blue cloth or scarf'],
    bestTime: 'any',
    voiceGuidance: true,
    steps: [
      {
        order: 1,
        instruction: 'Fill a bowl with water, hold it at heart level',
        duration: 30
      },
      {
        order: 2,
        instruction: 'Gaze into the water, letting your eyes soften',
        duration: 120,
        visualization: 'See yourself as water, fluid and adaptable'
      },
      {
        order: 3,
        instruction: 'Begin swaying gently, like water in the bowl',
        duration: 180,
        mantra: 'I flow, I adapt, I am water'
      },
      {
        order: 4,
        instruction: 'Dip fingers in water, anoint forehead, heart, and belly',
        duration: 60
      },
      {
        order: 5,
        instruction: 'Pour the water onto earth or plants, completing the flow',
        duration: 60
      }
    ]
  },
  {
    id: 'water-3-reflect',
    name: 'Mirror of Truth',
    element: 'water',
    petalNumber: 3,
    duration: 18,
    difficulty: 'intermediate',
    description: 'Gaze into the mirror of your soul for deep insights',
    intention: 'To see yourself clearly and embrace all aspects of being',
    tools: ['Mirror', 'Candle', 'Journal'],
    bestTime: 'night',
    moonPhase: 'full',
    voiceGuidance: true,
    steps: [
      {
        order: 1,
        instruction: 'Sit before a mirror in candlelight, creating sacred space',
        duration: 60
      },
      {
        order: 2,
        instruction: 'Gaze softly into your own eyes without judgment',
        duration: 180,
        breathCount: 12
      },
      {
        order: 3,
        instruction: 'Speak to your reflection: "I see you, I love you, I honor you"',
        duration: 60,
        mantra: 'I am whole, I am truth, I am love'
      },
      {
        order: 4,
        instruction: 'Ask your reflection: "What do you need me to know?"',
        duration: 120,
        visualization: 'Let answers arise like bubbles from deep water'
      },
      {
        order: 5,
        instruction: 'Thank your reflection, blow out the candle',
        duration: 30
      },
      {
        order: 6,
        instruction: 'Journal any messages or insights received',
        duration: 240
      }
    ]
  },

  // EARTH RITUALS
  {
    id: 'earth-1-ground',
    name: 'Root & Ground Ceremony',
    element: 'earth',
    petalNumber: 1,
    duration: 15,
    difficulty: 'beginner',
    description: 'Deep grounding practice to connect with Earth\'s stability',
    intention: 'To feel rooted, stable, and supported by Mother Earth',
    tools: ['Barefoot access to earth (optional)', 'Stones or crystals'],
    bestTime: 'morning',
    voiceGuidance: true,
    steps: [
      {
        order: 1,
        instruction: 'Stand or sit with bare feet on earth (or visualize it)',
        duration: 60
      },
      {
        order: 2,
        instruction: 'Feel or imagine roots growing from your feet deep into Earth',
        duration: 120,
        visualization: 'See golden roots extending deep into Earth\'s core',
        breathCount: 8
      },
      {
        order: 3,
        instruction: 'With each inhale, draw Earth energy up through your roots',
        duration: 180,
        mantra: 'I am grounded, I am stable, I am Earth'
      },
      {
        order: 4,
        instruction: 'Place hands on earth (or hold stones) and give thanks',
        duration: 120
      },
      {
        order: 5,
        instruction: 'Seal by pressing forehead to earth or hands to heart',
        duration: 60
      }
    ]
  },
  {
    id: 'earth-2-nurture',
    name: 'Garden of Self-Care',
    element: 'earth',
    petalNumber: 2,
    duration: 25,
    difficulty: 'intermediate',
    description: 'Tend to your inner garden with loving care',
    intention: 'To nurture all aspects of self with patience and love',
    tools: ['Plant or seeds', 'Soil', 'Water'],
    bestTime: 'midday',
    voiceGuidance: true,
    steps: [
      {
        order: 1,
        instruction: 'Hold seeds or touch a plant, connecting with life force',
        duration: 60
      },
      {
        order: 2,
        instruction: 'As you plant or water, speak what you\'re nurturing in yourself',
        duration: 300
      },
      {
        order: 3,
        instruction: 'Place hands on heart and commit to daily self-nurturing',
        duration: 120,
        mantra: 'I tend my garden with love and patience'
      },
      {
        order: 4,
        instruction: 'Create 3 practical self-care commitments',
        duration: 180
      },
      {
        order: 5,
        instruction: 'Seal by eating something nourishing mindfully',
        duration: 300
      }
    ]
  },

  // AETHER RITUALS
  {
    id: 'aether-1-connect',
    name: 'Cosmic Bridge Meditation',
    element: 'aether',
    petalNumber: 1,
    duration: 20,
    difficulty: 'advanced',
    description: 'Bridge the earthly and cosmic realms within yourself',
    intention: 'To embody the connection between Earth and cosmos',
    tools: ['Purple candle', 'Amethyst or clear quartz (optional)'],
    bestTime: 'night',
    moonPhase: 'new',
    voiceGuidance: true,
    steps: [
      {
        order: 1,
        instruction: 'Sit in meditation posture, spine as a pillar of light',
        duration: 60
      },
      {
        order: 2,
        instruction: 'Visualize roots into Earth and crown opening to cosmos',
        duration: 180,
        visualization: 'You are the bridge between Earth and stars',
        breathCount: 12
      },
      {
        order: 3,
        instruction: 'Draw Earth energy up and cosmic energy down, meeting at heart',
        duration: 300,
        mantra: 'I am the bridge, I am the connection, I am One'
      },
      {
        order: 4,
        instruction: 'Let the energies merge and radiate from your heart center',
        duration: 240,
        visualization: 'Purple-white light radiating in all directions'
      },
      {
        order: 5,
        instruction: 'Slowly return, grounding the cosmic energy into Earth',
        duration: 120
      },
      {
        order: 6,
        instruction: 'Journal any downloads or cosmic insights received',
        duration: 180
      }
    ]
  }
];