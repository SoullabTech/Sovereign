/**
 * Tool Registry - Single Source of Truth for Lab Tools
 *
 * This config defines all available tools in the MAIA Lab.
 * Adding a new tool is a single PR - no database migration needed.
 *
 * Tools are NOT stored in the database. Only member preferences
 * (which tools they've enabled) live in PostgreSQL.
 */

import {
  Compass,
  Sparkles,
  BookOpen,
  FileText,
  Mic,
  Library,
  Heart,
  Download,
  Upload,
  User,
  Globe,
  Shield,
  Gift,
  Brain,
  Eye,
  Radio,
  Star,
  Zap,
  Search,
  Activity,
  Settings,
  Users,
  Moon,
  Sun,
  Flame,
  Wind,
  Waves,
  Mountain,
  type LucideIcon,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export type ToolCategory =
  | 'oracles'
  | 'reflection'
  | 'training'
  | 'somatic'
  | 'library'
  | 'patterns'
  | 'settings'
  | 'community'
  | 'advanced'
  | 'developer'
  | 'admin';

export type Tier = 'free' | 'personal' | 'pro';

export interface LabTool {
  /** Unique identifier (kebab-case) */
  id: string;
  /** Display name */
  label: string;
  /** One-line promise (for dashboard cards) */
  shortDescription: string;
  /** Longer explanation (for discover page detail) */
  longDescription?: string;
  /** Emoji icon (primary) */
  emoji: string;
  /** Lucide icon (secondary, for consistency) */
  icon: LucideIcon;
  /** Route path */
  path: string;
  /** Category grouping */
  category: ToolCategory;
  /** Minimum tier required */
  minTier: Tier;
  /** Search/filter tags */
  tags: string[];
  /** Include in starter kit for new members */
  defaultEnabled: boolean;
  /** Rough popularity rank (lower = more popular) */
  popularityRank?: number;
  /** Is this tool new? (show badge) */
  isNew?: boolean;
  /** Is this tool in beta? */
  isBeta?: boolean;
  /** Coming soon (visible but not clickable) */
  comingSoon?: boolean;
  /** Requires specific role beyond tier */
  requiresRole?: 'admin' | 'practitioner' | 'curator';
}

export interface CategoryMeta {
  /** Display label */
  label: string;
  /** Emoji icon */
  emoji: string;
  /** Short description */
  description: string;
  /** Default sort order */
  defaultOrder: number;
  /** Color accent (Tailwind class) */
  accentColor: string;
}

// =============================================================================
// CATEGORY DEFINITIONS
// =============================================================================

export const CATEGORY_META: Record<ToolCategory, CategoryMeta> = {
  oracles: {
    label: 'Oracles',
    emoji: '🔮',
    description: 'Divination & wisdom systems',
    defaultOrder: 0,
    accentColor: 'from-violet-500/20 to-purple-600/20',
  },
  reflection: {
    label: 'Reflection',
    emoji: '✍️',
    description: 'Capture & process experience',
    defaultOrder: 1,
    accentColor: 'from-amber-500/20 to-orange-600/20',
  },
  training: {
    label: 'Training',
    emoji: '🧭',
    description: 'Structured practices & protocols',
    defaultOrder: 2,
    accentColor: 'from-emerald-500/20 to-green-600/20',
  },
  somatic: {
    label: 'Somatic',
    emoji: '🫁',
    description: 'Nervous system regulation & body intelligence',
    defaultOrder: 3,
    accentColor: 'from-teal-500/20 to-emerald-600/20',
  },
  patterns: {
    label: 'Patterns',
    emoji: '🌀',
    description: 'Symbolic systems & cycles',
    defaultOrder: 4,
    accentColor: 'from-blue-500/20 to-indigo-600/20',
  },
  library: {
    label: 'Library',
    emoji: '📚',
    description: 'Your personal collection',
    defaultOrder: 5,
    accentColor: 'from-rose-500/20 to-pink-600/20',
  },
  community: {
    label: 'Community',
    emoji: '🌱',
    description: 'Shared spaces & connections',
    defaultOrder: 6,
    accentColor: 'from-teal-500/20 to-cyan-600/20',
  },
  settings: {
    label: 'Settings',
    emoji: '⚙️',
    description: 'Personalization & preferences',
    defaultOrder: 7,
    accentColor: 'from-slate-500/20 to-gray-600/20',
  },
  advanced: {
    label: 'Advanced',
    emoji: '🧪',
    description: 'Power tools & experiments',
    defaultOrder: 8,
    accentColor: 'from-fuchsia-500/20 to-purple-600/20',
  },
  developer: {
    label: 'Developer',
    emoji: '💻',
    description: 'Technical tools & diagnostics',
    defaultOrder: 9,
    accentColor: 'from-zinc-500/20 to-neutral-600/20',
  },
  admin: {
    label: 'Admin',
    emoji: '🔐',
    description: 'System administration',
    defaultOrder: 10,
    accentColor: 'from-red-500/20 to-rose-600/20',
  },
};

// =============================================================================
// TOOL REGISTRY
// =============================================================================

export const TOOL_REGISTRY: LabTool[] = [
  // ---------------------------------------------------------------------------
  // ORACLES
  // ---------------------------------------------------------------------------
  {
    id: 'oracle-iching',
    label: 'I Ching',
    shortDescription: 'Hexagram consultation',
    longDescription:
      'The Book of Changes. Cast coins or yarrow stalks to receive ancient wisdom through 64 hexagrams, each a mirror for your situation.',
    emoji: '☯️',
    icon: Compass,
    path: '/oracle/iching',
    category: 'oracles',
    minTier: 'personal',
    tags: ['divination', 'wisdom', 'chinese', 'hexagram', 'coins'],
    defaultEnabled: true,
    popularityRank: 1,
  },
  {
    id: 'oracle-tarot',
    label: 'Tarot',
    shortDescription: 'Card-based reflection',
    longDescription:
      'Draw from the Major and Minor Arcana. Each card is a doorway into symbolic territory—not fortune-telling, but soul-telling.',
    emoji: '🎴',
    icon: Sparkles,
    path: '/oracle/tarot',
    category: 'oracles',
    minTier: 'personal',
    tags: ['divination', 'cards', 'arcana', 'spread', 'symbolism'],
    defaultEnabled: true,
    popularityRank: 2,
  },
  {
    id: 'oracle-runes',
    label: 'Runes',
    shortDescription: 'Elder Futhark casting',
    longDescription:
      'Ancient Norse letter-symbols. Cast runes to receive guidance from the Elder Futhark—24 symbols, each carrying ancestral wisdom.',
    emoji: 'ᛟ',
    icon: Compass,
    path: '/oracle/runes',
    category: 'oracles',
    minTier: 'personal',
    tags: ['divination', 'norse', 'futhark', 'casting', 'viking'],
    defaultEnabled: false,
    popularityRank: 5,
  },
  {
    id: 'oracle-unified',
    label: 'Oracle',
    shortDescription: 'All systems in one',
    longDescription:
      'The unified oracle interface. Choose your system or let MAIA suggest the right one for your question.',
    emoji: '🔮',
    icon: Compass,
    path: '/oracle',
    category: 'oracles',
    minTier: 'personal',
    tags: ['divination', 'unified', 'all'],
    defaultEnabled: true,
    popularityRank: 3,
  },

  // ---------------------------------------------------------------------------
  // REFLECTION
  // ---------------------------------------------------------------------------
  {
    id: 'journal',
    label: 'Journal',
    shortDescription: 'Capture thoughts & insights',
    longDescription:
      'Your private writing space. Voice or text entries that become part of your continuity with MAIA.',
    emoji: '📖',
    icon: BookOpen,
    path: '/labtools/journal',
    category: 'reflection',
    minTier: 'personal',
    tags: ['writing', 'daily', 'thoughts', 'voice', 'capture'],
    defaultEnabled: true,
    popularityRank: 1,
  },
  {
    id: 'reflections',
    label: 'Reflections',
    shortDescription: 'Distilled conversation moments',
    longDescription:
      'Key insights extracted from your conversations with MAIA. The signal without the noise.',
    emoji: '✨',
    icon: Sparkles,
    path: '/labtools/reflections',
    category: 'reflection',
    minTier: 'personal',
    tags: ['insights', 'highlights', 'conversation', 'distilled'],
    defaultEnabled: true,
    popularityRank: 2,
  },
  {
    id: 'lab-notes',
    label: 'Lab Notes',
    shortDescription: 'Research & discoveries',
    longDescription:
      'A space for longer-form exploration. Hypotheses, experiments, observations from your inner laboratory.',
    emoji: '🧪',
    icon: FileText,
    path: '/labtools/lab-notes',
    category: 'reflection',
    minTier: 'personal',
    tags: ['research', 'notes', 'exploration', 'experiments'],
    defaultEnabled: false,
    popularityRank: 6,
  },
  {
    id: 'capture',
    label: 'Capture',
    shortDescription: 'Session notes for export',
    longDescription:
      'Quick capture during sessions. Export to your notes app or Obsidian vault.',
    emoji: '📝',
    icon: Radio,
    path: '/capture',
    category: 'reflection',
    minTier: 'personal',
    tags: ['capture', 'export', 'quick', 'obsidian'],
    defaultEnabled: false,
    popularityRank: 8,
  },
  {
    id: 'scribe',
    label: 'Scribe',
    shortDescription: 'Record & transcribe',
    longDescription:
      'Voice recording with transcription. Capture sessions, meetings, or thoughts in audio form.',
    emoji: '🎙️',
    icon: Mic,
    path: '/labtools/scribe',
    category: 'reflection',
    minTier: 'pro',
    tags: ['voice', 'record', 'transcribe', 'audio'],
    defaultEnabled: false,
    popularityRank: 10,
  },
  {
    id: 'dreams',
    label: 'Dream Journal',
    shortDescription: 'Track dream patterns',
    longDescription:
      'A dedicated space for recording dreams. Symbol tracking and pattern recognition over time.',
    emoji: '🌙',
    icon: Moon,
    path: '/labtools/dreams',
    category: 'reflection',
    minTier: 'personal',
    tags: ['dreams', 'symbols', 'sleep', 'unconscious'],
    defaultEnabled: false,
    comingSoon: true,
    popularityRank: 15,
  },

  // ---------------------------------------------------------------------------
  // TRAINING
  // ---------------------------------------------------------------------------
  {
    id: 'navigator',
    label: 'Navigator',
    shortDescription: 'Spiralogic training',
    longDescription:
      'Structured practice with the Spiralogic framework. Track your position, work with elements, follow the spiral.',
    emoji: '🧭',
    icon: Compass,
    path: '/labtools/navigator',
    category: 'training',
    minTier: 'personal',
    tags: ['spiralogic', 'elements', 'practice', 'training'],
    defaultEnabled: true,
    popularityRank: 1,
  },
  {
    id: 'journey',
    label: 'Journey',
    shortDescription: 'Archetypal mapping',
    longDescription:
      'Visualize your path through archetypal territory. Where have you been? Where are you going?',
    emoji: '🗺️',
    icon: Compass,
    path: '/journey',
    category: 'training',
    minTier: 'personal',
    tags: ['archetype', 'mapping', 'path', 'visualization'],
    defaultEnabled: false,
    popularityRank: 4,
  },
  {
    id: 'story-creator',
    label: 'Story Creator',
    shortDescription: 'Narratives from 46+ traditions',
    longDescription:
      'Generate personalized stories drawing from world mythology, folklore, and wisdom traditions.',
    emoji: '📜',
    icon: Sparkles,
    path: '/labtools/story-creator',
    category: 'training',
    minTier: 'personal',
    tags: ['stories', 'mythology', 'narrative', 'traditions'],
    defaultEnabled: false,
    popularityRank: 7,
  },
  {
    id: 'field-protocol',
    label: 'Field Protocol',
    shortDescription: 'Document explorations',
    longDescription:
      'Structured protocols for consciousness exploration. Document your findings in a rigorous format.',
    emoji: '📋',
    icon: Radio,
    path: '/labtools/field-protocol',
    category: 'training',
    minTier: 'pro',
    tags: ['protocol', 'exploration', 'documentation', 'field'],
    defaultEnabled: false,
    popularityRank: 12,
  },
  // ---------------------------------------------------------------------------
  // SOMATIC
  // ---------------------------------------------------------------------------
  {
    id: 'regulation-minute',
    label: 'Regulation Minute',
    shortDescription: 'Nervous system downshift',
    longDescription:
      'A 60-120s guided regulation using breath patterns, sacred tones, and haptic feedback. Box breathing, deep calm, or natural rhythm — choose your downshift.',
    emoji: '🫁',
    icon: Wind,
    path: '/labtools/regulation-minute',
    category: 'somatic',
    minTier: 'free',
    tags: ['breath', 'regulation', 'somatic', 'nervous-system', 'calm', 'shift'],
    defaultEnabled: true,
    isNew: true,
    popularityRank: 1,
  },

  // ---------------------------------------------------------------------------
  // PATTERNS
  // ---------------------------------------------------------------------------
  {
    id: 'astrology',
    label: 'Astrology',
    shortDescription: 'Birth chart & transits',
    longDescription:
      'Your natal chart and current transits. Western, Vedic, Chinese, and Mayan systems available.',
    emoji: '✦',
    icon: Sun,
    path: '/astrology',
    category: 'patterns',
    minTier: 'personal',
    tags: ['astrology', 'chart', 'transits', 'planets', 'zodiac'],
    defaultEnabled: true,
    popularityRank: 1,
  },
  {
    id: 'patterns-home',
    label: 'Patterns',
    shortDescription: 'Symbolic systems & cycles',
    longDescription:
      'Explore different lens systems for understanding time, personality, and cosmic rhythm.',
    emoji: '🌀',
    icon: Sparkles,
    path: '/patterns',
    category: 'patterns',
    minTier: 'personal',
    tags: ['patterns', 'cycles', 'symbols', 'time'],
    defaultEnabled: false,
    popularityRank: 3,
  },

  // ---------------------------------------------------------------------------
  // LIBRARY
  // ---------------------------------------------------------------------------
  {
    id: 'library',
    label: 'Library',
    shortDescription: 'Your personal collection',
    longDescription:
      'Everything you have saved, bookmarked, or created. Your sovereign archive.',
    emoji: '📚',
    icon: Library,
    path: '/library',
    category: 'library',
    minTier: 'personal',
    tags: ['library', 'collection', 'saved', 'archive'],
    defaultEnabled: true,
    popularityRank: 1,
  },
  {
    id: 'favorites',
    label: 'Favorites',
    shortDescription: 'Saved items',
    longDescription: 'Quick access to your most valued content.',
    emoji: '❤️',
    icon: Heart,
    path: '/labtools/favorites',
    category: 'library',
    minTier: 'personal',
    tags: ['favorites', 'saved', 'starred'],
    defaultEnabled: true,
    popularityRank: 2,
  },
  {
    id: 'downloads',
    label: 'Downloads',
    shortDescription: 'Access your content',
    longDescription: 'Files and exports you have downloaded from MAIA.',
    emoji: '📥',
    icon: Download,
    path: '/labtools/downloads',
    category: 'library',
    minTier: 'personal',
    tags: ['downloads', 'files', 'export'],
    defaultEnabled: false,
    popularityRank: 5,
  },
  {
    id: 'upload',
    label: 'Upload',
    shortDescription: 'Share files with MAIA',
    longDescription:
      'Upload documents, images, or data for MAIA to work with.',
    emoji: '📤',
    icon: Upload,
    path: '/labtools/upload',
    category: 'library',
    minTier: 'personal',
    tags: ['upload', 'files', 'share'],
    defaultEnabled: false,
    popularityRank: 6,
  },

  // ---------------------------------------------------------------------------
  // COMMUNITY
  // ---------------------------------------------------------------------------
  {
    id: 'beads',
    label: 'Beads',
    shortDescription: 'Invite friends to MAIA',
    longDescription:
      'Share invitation beads with people you trust. Each bead carries your endorsement.',
    emoji: '📿',
    icon: Gift,
    path: '/labtools/beads',
    category: 'community',
    minTier: 'personal',
    tags: ['invite', 'friends', 'share', 'beads'],
    defaultEnabled: false,
    popularityRank: 1,
  },
  {
    id: 'pioneer-circle',
    label: 'Pioneer Circle',
    shortDescription: 'Beta testing program',
    longDescription:
      'Early access to new features. Help shape MAIA development.',
    emoji: '⭐',
    icon: Star,
    path: '/labtools/beta-testing',
    category: 'community',
    minTier: 'personal',
    tags: ['beta', 'testing', 'early-access', 'pioneer'],
    defaultEnabled: false,
    popularityRank: 3,
  },

  // ---------------------------------------------------------------------------
  // SETTINGS
  // ---------------------------------------------------------------------------
  {
    id: 'profile',
    label: 'Profile',
    shortDescription: 'Account & preferences',
    longDescription: 'Your identity settings, avatar, and account details.',
    emoji: '👤',
    icon: User,
    path: '/labtools/profile',
    category: 'settings',
    minTier: 'personal',
    tags: ['profile', 'account', 'identity'],
    defaultEnabled: true,
    popularityRank: 1,
  },
  {
    id: 'language',
    label: 'Language',
    shortDescription: 'MAIA speaks 30+ languages',
    longDescription: 'Choose your preferred language for MAIA interactions.',
    emoji: '🌐',
    icon: Globe,
    path: '/labtools/language',
    category: 'settings',
    minTier: 'personal',
    tags: ['language', 'translation', 'multilingual'],
    defaultEnabled: false,
    popularityRank: 3,
  },
  {
    id: 'voice',
    label: 'Voice',
    shortDescription: 'Voice synthesis & modes',
    longDescription:
      'Configure MAIA voice, speech speed, and audio preferences.',
    emoji: '🔊',
    icon: Mic,
    path: '/labtools/voice',
    category: 'settings',
    minTier: 'personal',
    tags: ['voice', 'audio', 'speech', 'tts'],
    defaultEnabled: true,
    popularityRank: 2,
  },
  {
    id: 'sovereignty',
    label: 'Data Sovereignty',
    shortDescription: 'Control over your data',
    longDescription:
      'Export, delete, or manage your data. Your sovereignty is not a feature—it is a right.',
    emoji: '🛡️',
    icon: Shield,
    path: '/labtools/sovereignty',
    category: 'settings',
    minTier: 'personal',
    tags: ['privacy', 'data', 'export', 'sovereignty', 'gdpr'],
    defaultEnabled: true,
    popularityRank: 4,
  },
  {
    id: 'settings',
    label: 'Settings',
    shortDescription: 'App preferences',
    longDescription: 'Theme, notifications, and general application settings.',
    emoji: '⚙️',
    icon: Settings,
    path: '/labtools/settings',
    category: 'settings',
    minTier: 'personal',
    tags: ['settings', 'preferences', 'config'],
    defaultEnabled: false,
    popularityRank: 5,
  },

  // ---------------------------------------------------------------------------
  // ADVANCED
  // ---------------------------------------------------------------------------
  {
    id: 'brain-trust',
    label: 'Brain Trust',
    shortDescription: 'Multi-model orchestration',
    longDescription:
      'Engage multiple AI perspectives on complex questions. Claude, DeepSeek, and others weigh in together.',
    emoji: '🧠',
    icon: Brain,
    path: '/labtools/brain-trust',
    category: 'advanced',
    minTier: 'pro',
    tags: ['ai', 'multi-model', 'orchestration', 'brain-trust'],
    defaultEnabled: false,
    popularityRank: 1,
  },
  {
    id: 'field-analytics',
    label: 'Field Analytics',
    shortDescription: 'Observation & metrics',
    longDescription:
      'Quantified insights into your patterns, usage, and consciousness metrics.',
    emoji: '📊',
    icon: Eye,
    path: '/labtools/field-analytics',
    category: 'advanced',
    minTier: 'personal',
    tags: ['analytics', 'metrics', 'patterns', 'data'],
    defaultEnabled: false,
    popularityRank: 3,
  },

  // ---------------------------------------------------------------------------
  // DEVELOPER
  // ---------------------------------------------------------------------------
  {
    id: 'claude-code',
    label: 'Claude Code',
    shortDescription: 'AI development tools',
    longDescription:
      'Direct access to Claude for coding assistance and technical work.',
    emoji: '⚡',
    icon: Zap,
    path: '/labtools/claude-code',
    category: 'developer',
    minTier: 'pro',
    tags: ['code', 'development', 'ai', 'claude'],
    defaultEnabled: false,
    requiresRole: 'admin',
    popularityRank: 1,
  },
  {
    id: 'rlm-navigator',
    label: 'RLM Navigator',
    shortDescription: 'Codebase exploration',
    longDescription: 'Navigate and explore the MAIA codebase structure.',
    emoji: '🔍',
    icon: Search,
    path: '/labtools/rlm',
    category: 'developer',
    minTier: 'pro',
    tags: ['code', 'navigation', 'rlm', 'codebase'],
    defaultEnabled: false,
    requiresRole: 'admin',
    popularityRank: 2,
  },
  {
    id: 'ain-telemetry',
    label: 'AIN Telemetry',
    shortDescription: 'Response structure analysis',
    longDescription:
      'Analyze the structure and patterns of MAIA responses.',
    emoji: '📡',
    icon: Activity,
    path: '/labtools/ain',
    category: 'developer',
    minTier: 'pro',
    tags: ['telemetry', 'analysis', 'ain', 'structure'],
    defaultEnabled: false,
    requiresRole: 'admin',
    popularityRank: 3,
  },

  // ---------------------------------------------------------------------------
  // ADMIN
  // ---------------------------------------------------------------------------
  {
    id: 'admin-system',
    label: 'System Settings',
    shortDescription: 'Feature flags & controls',
    longDescription: 'System-wide configuration and feature toggles.',
    emoji: '🎛️',
    icon: Settings,
    path: '/labtools/admin/system',
    category: 'admin',
    minTier: 'pro',
    tags: ['admin', 'system', 'flags', 'config'],
    defaultEnabled: false,
    requiresRole: 'admin',
    popularityRank: 1,
  },
  {
    id: 'admin-beta-testers',
    label: 'Beta Testers',
    shortDescription: 'Manage beta access',
    longDescription: 'Manage beta tester accounts and access.',
    emoji: '👥',
    icon: Users,
    path: '/labtools/admin/beta-testers',
    category: 'admin',
    minTier: 'pro',
    tags: ['admin', 'beta', 'testers', 'access'],
    defaultEnabled: false,
    requiresRole: 'admin',
    popularityRank: 2,
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all tools in a category
 */
export function getToolsByCategory(category: ToolCategory): LabTool[] {
  return TOOL_REGISTRY.filter((tool) => tool.category === category).sort(
    (a, b) => (a.popularityRank ?? 99) - (b.popularityRank ?? 99)
  );
}

/**
 * Get a tool by ID
 */
export function getToolById(id: string): LabTool | undefined {
  return TOOL_REGISTRY.find((tool) => tool.id === id);
}

/**
 * Get all categories in display order
 */
export function getCategoriesInOrder(): ToolCategory[] {
  return (Object.keys(CATEGORY_META) as ToolCategory[]).sort(
    (a, b) => CATEGORY_META[a].defaultOrder - CATEGORY_META[b].defaultOrder
  );
}

/**
 * Get default enabled tools (starter kit)
 */
export function getDefaultEnabledTools(): LabTool[] {
  return TOOL_REGISTRY.filter((tool) => tool.defaultEnabled);
}

/**
 * Get tools available for a given tier
 */
export function getToolsForTier(tier: Tier): LabTool[] {
  const tierRank: Record<Tier, number> = { free: 0, personal: 1, pro: 2 };
  const userRank = tierRank[tier];

  return TOOL_REGISTRY.filter((tool) => {
    const toolRank = tierRank[tool.minTier];
    return toolRank <= userRank;
  });
}

/**
 * Check if a tool is accessible for a given tier and role
 */
export function isToolAccessible(
  tool: LabTool,
  tier: Tier,
  role?: string
): boolean {
  const tierRank: Record<Tier, number> = { free: 0, personal: 1, pro: 2 };

  // Check tier
  if (tierRank[tier] < tierRank[tool.minTier]) {
    return false;
  }

  // Check role if required
  if (tool.requiresRole && tool.requiresRole !== role) {
    return false;
  }

  return true;
}

/**
 * Search tools by query
 */
export function searchTools(query: string): LabTool[] {
  const q = query.toLowerCase().trim();
  if (!q) return TOOL_REGISTRY;

  return TOOL_REGISTRY.filter((tool) => {
    return (
      tool.label.toLowerCase().includes(q) ||
      tool.shortDescription.toLowerCase().includes(q) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      tool.category.toLowerCase().includes(q)
    );
  });
}

/**
 * Get tool count by category
 */
export function getToolCountByCategory(): Record<ToolCategory, number> {
  const counts = {} as Record<ToolCategory, number>;

  for (const category of Object.keys(CATEGORY_META) as ToolCategory[]) {
    counts[category] = TOOL_REGISTRY.filter(
      (t) => t.category === category
    ).length;
  }

  return counts;
}
