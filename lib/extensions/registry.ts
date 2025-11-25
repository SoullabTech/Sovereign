/**
 * Extension Registry System
 *
 * Core architecture:
 * - Spiralogic Core: Always active, defines the framework
 * - Extensions: Toggleable systems that enrich the work (Astrology, I-Ching, etc.)
 * - Each extension provides content to directional panels (→ ← ↑ ↓)
 */

export type DirectionalPanel = 'right' | 'left' | 'up' | 'down';

export interface ExtensionMetadata {
  id: string;
  name: string;
  description: string;
  icon: string;
  version: string;
  core: boolean; // If true, cannot be disabled
  category: 'divination' | 'practice' | 'tracking' | 'integration';
  author?: string;
  installable?: boolean; // For community extensions
}

export interface ExtensionPanelContent {
  panel: DirectionalPanel;
  weight: number; // Sort order within panel (0-100)
  component: string; // Component path to render
  title: string;
  description?: string;
}

export interface Extension {
  metadata: ExtensionMetadata;
  enabled: boolean;

  // What content does this extension provide to each directional panel?
  panels: ExtensionPanelContent[];

  // Lazy load the extension code
  loader: () => Promise<any>;

  // Settings schema for this extension
  settings?: {
    schema: Record<string, any>;
    defaults: Record<string, any>;
  };
}

/**
 * Extension Registry
 * Maps extension IDs to their configuration
 */
export const EXTENSION_REGISTRY: Record<string, Extension> = {
  // ========================================
  // ASTROLOGY EXTENSION
  // ========================================
  astrology: {
    metadata: {
      id: 'astrology',
      name: 'Astrology',
      description: 'Planetary archetypes & weather patterns',
      icon: '⭐',
      version: '1.0.0',
      core: false,
      category: 'divination',
    },
    enabled: true, // Default enabled for now

    panels: [
      {
        panel: 'right', // Analytical panel
        weight: 10,
        component: '@/components/extensions/astrology/WeatherReport',
        title: 'Current Weather',
        description: 'Active archetypal patterns from planetary transits',
      },
      {
        panel: 'right',
        weight: 20,
        component: '@/components/extensions/astrology/BirthChartSummary',
        title: 'Your Chart',
        description: 'Natal blueprint & house positions',
      },
      {
        panel: 'left', // Imaginal panel
        weight: 30,
        component: '@/components/extensions/astrology/ArchetypalVoices',
        title: 'Archetypal Voices',
        description: 'Planetary principles speaking',
      },
    ],

    loader: async () => ({}), // TODO: implement extension

    settings: {
      schema: {
        houseSystem: {
          type: 'select',
          options: ['porphyry', 'whole-sign', 'placidus'],
          label: 'House System',
        },
        showTransits: {
          type: 'boolean',
          label: 'Show Current Transits',
        },
      },
      defaults: {
        houseSystem: 'porphyry',
        showTransits: true,
      },
    },
  },

  // ========================================
  // I-CHING EXTENSION
  // ========================================
  iching: {
    metadata: {
      id: 'iching',
      name: 'I-Ching',
      description: 'Hexagrams & change patterns',
      icon: '☰',
      version: '1.0.0',
      core: false,
      category: 'divination',
    },
    enabled: false, // Disabled by default

    panels: [
      {
        panel: 'down', // Transcendent panel
        weight: 10,
        component: '@/components/extensions/iching/DailyHexagram',
        title: "Today's Hexagram",
        description: 'Guidance from the Book of Changes',
      },
      {
        panel: 'up', // Depths panel
        weight: 20,
        component: '@/components/extensions/iching/ShadowHexagram',
        title: 'Shadow Pattern',
        description: 'Opposite hexagram revealing unconscious dynamics',
      },
    ],

    loader: async () => ({}), // TODO: implement extension

    settings: {
      schema: {
        castingMethod: {
          type: 'select',
          options: ['coin', 'yarrow', 'digital'],
          label: 'Casting Method',
        },
        dailyAutoCast: {
          type: 'boolean',
          label: 'Auto-cast daily hexagram',
        },
      },
      defaults: {
        castingMethod: 'coin',
        dailyAutoCast: true,
      },
    },
  },

  // ========================================
  // TAROT EXTENSION
  // ========================================
  tarot: {
    metadata: {
      id: 'tarot',
      name: 'Tarot',
      description: 'Archetypal images & card guidance',
      icon: '🃏',
      version: '1.0.0',
      core: false,
      category: 'divination',
    },
    enabled: false,

    panels: [
      {
        panel: 'left', // Imaginal panel
        weight: 10,
        component: '@/components/extensions/tarot/DailyCard',
        title: 'Daily Card',
        description: 'Archetypal image for contemplation',
      },
      {
        panel: 'down', // Transcendent panel
        weight: 30,
        component: '@/components/extensions/tarot/SpreadReading',
        title: 'Card Spread',
        description: 'Multi-card readings for deeper inquiry',
      },
    ],

    loader: async () => ({}), // TODO: implement extension

    settings: {
      schema: {
        deck: {
          type: 'select',
          options: ['rider-waite', 'thoth', 'wild-unknown', 'marseille'],
          label: 'Tarot Deck',
        },
        dailyDraw: {
          type: 'boolean',
          label: 'Auto-draw daily card',
        },
      },
      defaults: {
        deck: 'rider-waite',
        dailyDraw: true,
      },
    },
  },

  // ========================================
  // DREAM WORK EXTENSION
  // ========================================
  dreamwork: {
    metadata: {
      id: 'dreamwork',
      name: 'Dream Work',
      description: 'Dream journaling & image amplification',
      icon: '🌙',
      version: '1.0.0',
      core: false,
      category: 'practice',
    },
    enabled: false,

    panels: [
      {
        panel: 'up', // Depths panel
        weight: 10,
        component: '@/components/extensions/dreamwork/DreamJournal',
        title: 'Dream Journal',
        description: 'Record & explore dreams',
      },
      {
        panel: 'up',
        weight: 20,
        component: '@/components/extensions/dreamwork/RecurringImages',
        title: 'Recurring Images',
        description: 'Patterns emerging from the unconscious',
      },
      {
        panel: 'left', // Imaginal panel
        weight: 40,
        component: '@/components/extensions/dreamwork/ImageAmplification',
        title: 'Image Amplification',
        description: 'Mythological connections to dream images',
      },
    ],

    loader: async () => ({}), // TODO: implement extension

    settings: {
      schema: {
        morningReminder: {
          type: 'boolean',
          label: 'Morning journal reminder',
        },
        trackRecurring: {
          type: 'boolean',
          label: 'Auto-detect recurring symbols',
        },
      },
      defaults: {
        morningReminder: true,
        trackRecurring: true,
      },
    },
  },

  // ========================================
  // SOMATIC PRACTICES EXTENSION
  // ========================================
  somatic: {
    metadata: {
      id: 'somatic',
      name: 'Somatic Practices',
      description: 'Body awareness & embodiment',
      icon: '🧘',
      version: '1.0.0',
      core: false,
      category: 'practice',
    },
    enabled: false,

    panels: [
      {
        panel: 'up', // Depths panel
        weight: 5,
        component: '@/components/extensions/somatic/BodyScan',
        title: 'Body Scan',
        description: 'Where is tension, holding, aliveness?',
      },
      {
        panel: 'down', // Transcendent panel
        weight: 40,
        component: '@/components/extensions/somatic/BreathPractices',
        title: 'Breath Practices',
        description: 'Practices for current weather & phase',
      },
    ],

    loader: async () => ({}), // TODO: implement extension

    settings: {
      schema: {
        practiceReminders: {
          type: 'boolean',
          label: 'Daily practice reminders',
        },
        trackTension: {
          type: 'boolean',
          label: 'Track tension patterns',
        },
      },
      defaults: {
        practiceReminders: false,
        trackTension: true,
      },
    },
  },

  // ========================================
  // MYTHOLOGY EXTENSION
  // ========================================
  mythology: {
    metadata: {
      id: 'mythology',
      name: 'Mythology',
      description: 'Stories, archetypes & ritual',
      icon: '📖',
      version: '1.0.0',
      core: false,
      category: 'integration',
    },
    enabled: false,

    panels: [
      {
        panel: 'left', // Imaginal panel
        weight: 20,
        component: '@/components/extensions/mythology/ResonantMyth',
        title: 'Resonant Myth',
        description: 'Stories reflecting your current journey',
      },
      {
        panel: 'down', // Transcendent panel
        weight: 50,
        component: '@/components/extensions/mythology/RitualSuggestions',
        title: 'Ritual Suggestions',
        description: 'Mark transitions & thresholds',
      },
    ],

    loader: async () => ({}), // TODO: implement extension

    settings: {
      schema: {
        traditions: {
          type: 'multiselect',
          options: ['greek', 'norse', 'indigenous', 'celtic', 'egyptian', 'hindu'],
          label: 'Mythological Traditions',
        },
      },
      defaults: {
        traditions: ['greek'],
      },
    },
  },
};

/**
 * Get all enabled extensions for a user
 */
export function getEnabledExtensions(userConfig?: Record<string, boolean>): Extension[] {
  return Object.values(EXTENSION_REGISTRY).filter(ext => {
    // Core extensions are always enabled
    if (ext.metadata.core) return true;

    // Check user config if provided
    if (userConfig) {
      return userConfig[ext.metadata.id] ?? ext.enabled;
    }

    // Fall back to default enabled state
    return ext.enabled;
  });
}

/**
 * Get all panel content for a specific direction
 * Returns sorted by weight (ascending)
 */
export function getPanelContent(
  panel: DirectionalPanel,
  userConfig?: Record<string, boolean>
): ExtensionPanelContent[] {
  const enabledExtensions = getEnabledExtensions(userConfig);

  const content = enabledExtensions.flatMap(ext =>
    ext.panels.filter(p => p.panel === panel)
  );

  return content.sort((a, b) => a.weight - b.weight);
}

/**
 * Panel descriptions for user orientation
 */
export const PANEL_METADATA = {
  right: {
    title: 'Analytical Framework',
    subtitle: 'Left Hemisphere',
    description: 'Data, metrics, charts - things you can measure & track',
    icon: '→',
  },
  left: {
    title: 'Imaginal Realm',
    subtitle: 'Right Hemisphere',
    description: 'Poetry, myth, beauty - things you can feel & sense',
    icon: '←',
  },
  down: {
    title: 'Transcendent Practices',
    subtitle: 'Higher Self',
    description: 'Integration, meditation, guidance from Source',
    icon: '↓',
  },
  up: {
    title: 'Depths & Shadow',
    subtitle: 'Subconscious',
    description: 'Body, dreams, shadow - what\'s below consciousness',
    icon: '↑',
  },
} as const;
