/**
 * Tool Registry - Single Source of Truth for Lab Tools
 *
 * This config defines all available tools in the MAIA Lab.
 * Adding a new tool is a single PR - no database migration needed.
 *
 * Tools are NOT stored in the database. Only member preferences
 * (which tools they've enabled) live in PostgreSQL.
 *
 * === CONSCIOUSNESS DOMAIN MODEL ===
 *
 * Tools are organized into 8 primary domains of conscious experience,
 * grouped into three natural tiers:
 *
 * FOUNDATION (horizontal life):
 *   Somatic, Cognitive, Psychological, Relational
 *
 * MEANING LAYER:
 *   Mythic & Archetypal, Philosophical
 *
 * VERTICAL / TRANSPERSONAL:
 *   Spiritual, Metaphysical
 *
 * Non-consciousness tools (Library, Community, Settings, Developer, Admin)
 * live in a separate utility layer.
 *
 * Cross-cutting MODES (reflect, regulate, train, track, interpret, create,
 * connect, act) allow filtering across domains.
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

/** The 8 primary domains of conscious experience */
export type ConsciousnessDomain =
  | 'somatic'
  | 'cognitive'
  | 'psychological'
  | 'relational'
  | 'mythic'
  | 'philosophical'
  | 'spiritual'
  | 'metaphysical';

/** Utility categories (not consciousness domains) */
export type UtilityCategory =
  | 'library'
  | 'community'
  | 'settings'
  | 'developer'
  | 'admin';

/** All valid grouping categories — union of domains + utilities */
export type ToolCategory = ConsciousnessDomain | UtilityCategory;

/** Cross-cutting modes that apply across domains */
export type ToolMode =
  | 'reflect'
  | 'regulate'
  | 'train'
  | 'track'
  | 'interpret'
  | 'create'
  | 'connect'
  | 'act';

/**
 * Simple View modes — three experiential groups
 * that match how humans naturally think: Notice → Shift → Do
 */
export type SimpleMode = 'notice' | 'shift' | 'act-group';

/** The experiential groups that organize the 8 modes */
export type ModeGroup = 'awareness' | 'shift' | 'expression';

/** Mapping from simple mode to the detailed modes it contains */
export const SIMPLE_MODE_MAP: Record<SimpleMode, ToolMode[]> = {
  'notice':    ['reflect', 'track', 'interpret'],
  'shift':     ['regulate', 'train'],
  'act-group': ['create', 'act', 'connect'],
};

/** The three natural tiers of the consciousness map */
export type DomainTier = 'foundation' | 'meaning' | 'vertical';

export type Tier = 'free' | 'personal' | 'pro';

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

export interface DomainMeta extends CategoryMeta {
  /** User-facing alias (e.g., "Body" for somatic) */
  alias: string;
  /** Which tier this domain belongs to */
  tier: DomainTier;
  /** 1-2 sentence domain introduction for discovery UI */
  longDescription: string;
  /** 3-5 common intents (chips) for this domain */
  commonIntents: string[];
  /** The default mode to auto-activate when a user clicks this domain */
  defaultMode: SimpleMode;
}

export interface ModeMeta {
  /** Display label (human-facing, e.g., "Make Meaning" not "Interpret") */
  label: string;
  /** Emoji icon */
  emoji: string;
  /** Short description */
  description: string;
  /** Which experiential group this mode belongs to */
  group: ModeGroup;
}

export interface SimpleModeMeta {
  /** Display label */
  label: string;
  /** Emoji icon */
  emoji: string;
  /** Short description */
  description: string;
  /** The detailed modes this simple mode expands to */
  modes: ToolMode[];
}

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
  /** Category grouping (domain for consciousness tools, utility category otherwise) */
  category: ToolCategory;
  /** Consciousness domain (set for consciousness tools, undefined for utilities) */
  domain?: ConsciousnessDomain;
  /** Cross-cutting modes this tool supports */
  modes?: ToolMode[];
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

// =============================================================================
// DOMAIN DEFINITIONS (8 Consciousness Domains)
// =============================================================================

export const DOMAIN_META: Record<ConsciousnessDomain, DomainMeta> = {
  // ---- FOUNDATION TIER (horizontal life) ----
  somatic: {
    label: 'Somatic',
    alias: 'Body',
    emoji: '🫀',
    description: 'Body awareness, breath, sensation, movement',
    longDescription:
      'The body as field. Nervous system, breath, sensation, movement, regulation, sleep, energy. Ground of experience — without this, nothing stabilizes.',
    tier: 'foundation',
    defaultOrder: 0,
    accentColor: 'from-rose-500/20 to-red-600/20',
    commonIntents: ['Breathwork', 'Body scan', 'Nervous system', 'Movement', 'Sleep'],
    defaultMode: 'shift',
  },
  cognitive: {
    label: 'Cognitive',
    alias: 'Mind',
    emoji: '🧠',
    description: 'Attention, thinking, decisions, learning',
    longDescription:
      'The mind as instrument. Attention, thinking, decision-making, learning, beliefs, mental models. Clarity and orientation.',
    tier: 'foundation',
    defaultOrder: 1,
    accentColor: 'from-blue-500/20 to-indigo-600/20',
    commonIntents: ['Journal', 'Capture', 'Analyze', 'Research', 'Decide'],
    defaultMode: 'notice',
  },
  psychological: {
    label: 'Psychological',
    alias: 'Self',
    emoji: '🪞',
    description: 'Identity, shadow, patterns, development',
    longDescription:
      'The self as pattern. Identity, attachment, shadow, trauma, parts, defenses, development. The personal unconscious and personality structure.',
    tier: 'foundation',
    defaultOrder: 2,
    accentColor: 'from-amber-500/20 to-orange-600/20',
    commonIntents: ['Shadow work', 'Parts work', 'Attachment', 'Identity', 'Integration'],
    defaultMode: 'notice',
  },
  relational: {
    label: 'Relational',
    alias: 'Relationships',
    emoji: '🤝',
    description: 'Connection, boundaries, repair, belonging',
    longDescription:
      'The self in connection. Boundaries, intimacy, conflict, repair, family systems, group dynamics, belonging. Most transformation actually happens here.',
    tier: 'foundation',
    defaultOrder: 3,
    accentColor: 'from-teal-500/20 to-cyan-600/20',
    commonIntents: ['Boundaries', 'Repair', 'Communication', 'Family', 'Belonging'],
    defaultMode: 'act-group',
  },

  // ---- MEANING LAYER ----
  mythic: {
    label: 'Mythic & Archetypal',
    alias: 'Story & Archetype',
    emoji: '🐉',
    description: 'Archetypes, dreams, symbols, life narrative',
    longDescription:
      'The psyche as story. Archetypes, dreams, symbols, life narratives, initiation, meaning-making through myth. The domain of soul-language.',
    tier: 'meaning',
    defaultOrder: 4,
    accentColor: 'from-violet-500/20 to-purple-600/20',
    commonIntents: ['Dream work', 'Archetypes', 'Story', 'Symbols', 'Initiation'],
    defaultMode: 'notice',
  },
  philosophical: {
    label: 'Philosophical',
    alias: 'Meaning & Values',
    emoji: '⚖️',
    description: 'Ethics, worldview, sovereignty, truth',
    longDescription:
      'The mind confronting reality. Values, ethics, worldview, sovereignty, truth, responsibility, meaning of life. Where maturity and coherence form.',
    tier: 'meaning',
    defaultOrder: 5,
    accentColor: 'from-emerald-500/20 to-green-600/20',
    commonIntents: ['Values', 'Ethics', 'Worldview', 'Sovereignty', 'Meaning'],
    defaultMode: 'notice',
  },

  // ---- VERTICAL / TRANSPERSONAL ----
  spiritual: {
    label: 'Spiritual',
    alias: 'Spirit',
    emoji: '🕊️',
    description: 'Presence, contemplation, devotion, mystery',
    longDescription:
      'The vertical dimension. Presence, prayer, contemplation, devotion, guidance, grace, mystery, transcendence. Direct encounter with the sacred.',
    tier: 'vertical',
    defaultOrder: 6,
    accentColor: 'from-sky-500/20 to-blue-600/20',
    commonIntents: ['Meditation', 'Prayer', 'Contemplation', 'Devotion', 'Presence'],
    defaultMode: 'notice',
  },
  metaphysical: {
    label: 'Metaphysical',
    alias: 'Cosmos & Patterns',
    emoji: '✦',
    description: 'Astrology, divination, synchronicity, ontology',
    longDescription:
      'The structure of reality itself. Time, synchronicity, astrology, divination systems, consciousness models, ontology. Where Spiralogic, I Ching, and field intelligence live.',
    tier: 'vertical',
    defaultOrder: 7,
    accentColor: 'from-fuchsia-500/20 to-purple-600/20',
    commonIntents: ['Astrology', 'Divination', 'Synchronicity', 'Cycles', 'Ontology'],
    defaultMode: 'notice',
  },
};

// =============================================================================
// UTILITY CATEGORY DEFINITIONS
// =============================================================================

export const UTILITY_META: Record<UtilityCategory, CategoryMeta> = {
  library: {
    label: 'Library',
    emoji: '📚',
    description: 'Your personal collection',
    defaultOrder: 100,
    accentColor: 'from-rose-500/20 to-pink-600/20',
  },
  community: {
    label: 'Community',
    emoji: '🌱',
    description: 'Shared spaces & connections',
    defaultOrder: 101,
    accentColor: 'from-teal-500/20 to-cyan-600/20',
  },
  settings: {
    label: 'Settings',
    emoji: '⚙️',
    description: 'Personalization & preferences',
    defaultOrder: 102,
    accentColor: 'from-slate-500/20 to-gray-600/20',
  },
  developer: {
    label: 'Developer',
    emoji: '💻',
    description: 'Technical tools & diagnostics',
    defaultOrder: 103,
    accentColor: 'from-zinc-500/20 to-neutral-600/20',
  },
  admin: {
    label: 'Admin',
    emoji: '🔐',
    description: 'System administration',
    defaultOrder: 104,
    accentColor: 'from-red-500/20 to-rose-600/20',
  },
};

// =============================================================================
// COMBINED CATEGORY META (domains + utilities, same shape all consumers expect)
// =============================================================================

export const CATEGORY_META: Record<ToolCategory, CategoryMeta> = {
  ...DOMAIN_META,
  ...UTILITY_META,
};

// =============================================================================
// MODE DEFINITIONS
// =============================================================================

export const MODE_META: Record<ToolMode, ModeMeta> = {
  // ---- AWARENESS GROUP (Notice → turn inward) ----
  reflect: {
    label: 'Reflect',
    emoji: '🪞',
    description: 'Turn inward, examine, review',
    group: 'awareness',
  },
  track: {
    label: 'Track Patterns',
    emoji: '📈',
    description: 'Record, measure, observe patterns',
    group: 'awareness',
  },
  interpret: {
    label: 'Make Meaning',
    emoji: '🔍',
    description: 'Decode symbols, find significance',
    group: 'awareness',
  },

  // ---- SHIFT GROUP (Shift → adjust state) ----
  regulate: {
    label: 'Regulate',
    emoji: '🌊',
    description: 'Calm, ground, restore balance',
    group: 'shift',
  },
  train: {
    label: 'Practice',
    emoji: '🏋️',
    description: 'Structured practice, build capacity',
    group: 'shift',
  },

  // ---- EXPRESSION GROUP (Act → move outward) ----
  create: {
    label: 'Create',
    emoji: '✨',
    description: 'Generate, express, imagine',
    group: 'expression',
  },
  act: {
    label: 'Take Action',
    emoji: '⚡',
    description: 'Decide, commit, move',
    group: 'expression',
  },
  connect: {
    label: 'Relate',
    emoji: '🤝',
    description: 'Relate, share, bridge',
    group: 'expression',
  },
};

// =============================================================================
// SIMPLE MODE DEFINITIONS (3 experiential groups for beginners)
// =============================================================================

export const SIMPLE_MODE_META: Record<SimpleMode, SimpleModeMeta> = {
  'notice': {
    label: 'Notice',
    emoji: '👁️',
    description: 'I want to understand something',
    modes: ['reflect', 'track', 'interpret'],
  },
  'shift': {
    label: 'Shift',
    emoji: '🌊',
    description: 'I need to feel different',
    modes: ['regulate', 'train'],
  },
  'act-group': {
    label: 'Act',
    emoji: '⚡',
    description: 'I need to do something',
    modes: ['create', 'act', 'connect'],
  },
};

// =============================================================================
// LEGACY CATEGORY MAP (for backward compatibility with DB rows)
// =============================================================================

/** Maps old operational category strings to their new domain/utility equivalents */
export const LEGACY_CATEGORY_MAP: Record<string, ToolCategory> = {
  oracles: 'metaphysical',
  reflection: 'cognitive',
  training: 'spiritual',
  patterns: 'metaphysical',
  advanced: 'cognitive',
  // Utility categories map to themselves
  library: 'library',
  community: 'community',
  settings: 'settings',
  developer: 'developer',
  admin: 'admin',
};

// =============================================================================
// TOOL REGISTRY
// =============================================================================

export const TOOL_REGISTRY: LabTool[] = [
  // ---------------------------------------------------------------------------
  // METAPHYSICAL — Cosmos & Patterns
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
    category: 'metaphysical',
    domain: 'metaphysical',
    modes: ['interpret'],
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
    category: 'metaphysical',
    domain: 'metaphysical',
    modes: ['interpret', 'reflect'],
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
    category: 'metaphysical',
    domain: 'metaphysical',
    modes: ['interpret'],
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
    category: 'metaphysical',
    domain: 'metaphysical',
    modes: ['interpret'],
    minTier: 'personal',
    tags: ['divination', 'unified', 'all'],
    defaultEnabled: true,
    popularityRank: 3,
  },
  {
    id: 'astrology',
    label: 'Astrology',
    shortDescription: 'Birth chart & transits',
    longDescription:
      'Your natal chart and current transits. Western, Vedic, Chinese, and Mayan systems available.',
    emoji: '✦',
    icon: Sun,
    path: '/astrology',
    category: 'metaphysical',
    domain: 'metaphysical',
    modes: ['interpret'],
    minTier: 'personal',
    tags: ['astrology', 'chart', 'transits', 'planets', 'zodiac'],
    defaultEnabled: true,
    popularityRank: 4,
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
    category: 'metaphysical',
    domain: 'metaphysical',
    modes: ['interpret'],
    minTier: 'personal',
    tags: ['patterns', 'cycles', 'symbols', 'time'],
    defaultEnabled: true,
    popularityRank: 6,
  },

  // ---------------------------------------------------------------------------
  // COGNITIVE — Mind
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
    category: 'cognitive',
    domain: 'cognitive',
    modes: ['reflect'],
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
    path: '/reflections', // moved out of /labtools 2026-09-04 — one address
    category: 'cognitive',
    domain: 'cognitive',
    modes: ['reflect'],
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
    category: 'cognitive',
    domain: 'cognitive',
    modes: ['reflect', 'track'],
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
    category: 'cognitive',
    domain: 'cognitive',
    modes: ['reflect', 'track', 'connect'],
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
    category: 'cognitive',
    domain: 'cognitive',
    modes: ['create'],
    minTier: 'pro',
    tags: ['voice', 'record', 'transcribe', 'audio'],
    defaultEnabled: false,
    popularityRank: 10,
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
    category: 'cognitive',
    domain: 'cognitive',
    modes: ['track'],
    minTier: 'pro',
    tags: ['protocol', 'exploration', 'documentation', 'field'],
    defaultEnabled: false,
    popularityRank: 12,
  },
  {
    id: 'brain-trust',
    label: 'Brain Trust',
    shortDescription: 'Multi-model orchestration',
    longDescription:
      'Engage multiple AI perspectives on complex questions. Claude, DeepSeek, and others weigh in together.',
    emoji: '🧠',
    icon: Brain,
    path: '/labtools/brain-trust',
    category: 'cognitive',
    domain: 'cognitive',
    modes: ['create', 'connect'],
    minTier: 'pro',
    tags: ['ai', 'multi-model', 'orchestration', 'brain-trust'],
    defaultEnabled: false,
    popularityRank: 11,
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
    category: 'cognitive',
    domain: 'cognitive',
    modes: ['track'],
    minTier: 'personal',
    tags: ['analytics', 'metrics', 'patterns', 'data'],
    defaultEnabled: false,
    popularityRank: 9,
  },
  {
    id: 'belief-lens',
    label: 'Belief Lens',
    shortDescription: 'Surface the assumptions shaping your view',
    longDescription:
      'Gently surface the assumptions shaping how you see a situation. Not correction \u2014 inquiry. What must you believe for this to feel true?',
    emoji: '🔍',
    icon: Search,
    path: '/labtools/belief-lens',
    category: 'cognitive',
    domain: 'cognitive',
    modes: ['reflect', 'interpret'],
    minTier: 'personal',
    tags: ['beliefs', 'assumptions', 'inquiry', 'perspective', 'cognitive'],
    defaultEnabled: false,
    comingSoon: true,
    popularityRank: 10,
  },
  {
    id: 'decision-field',
    label: 'Decision Field',
    shortDescription: 'Explore paths and what each opens or closes',
    longDescription:
      'Map the paths in front of you and sense what each direction may open or close. Not to decide immediately \u2014 to see the landscape clearly.',
    emoji: '🔀',
    icon: Compass,
    path: '/labtools/decision-field',
    category: 'cognitive',
    domain: 'cognitive',
    modes: ['create', 'act'],
    minTier: 'personal',
    tags: ['decision', 'paths', 'tradeoffs', 'navigation', 'strategy'],
    defaultEnabled: false,
    comingSoon: true,
    popularityRank: 10,
  },
  {
    id: 'pattern-mapper',
    label: 'Pattern Mapper',
    shortDescription: 'Notice recurring themes across experiences',
    longDescription:
      'Step back and notice recurring themes across your experiences \u2014 journal, sessions, relationships \u2014 and how they connect.',
    emoji: '🕸️',
    icon: Activity,
    path: '/labtools/pattern-mapper',
    category: 'cognitive',
    domain: 'cognitive',
    modes: ['track', 'interpret'],
    minTier: 'personal',
    tags: ['patterns', 'recurrence', 'themes', 'cross-domain', 'synthesis'],
    defaultEnabled: false,
    comingSoon: true,
    popularityRank: 10,
  },

  // ---------------------------------------------------------------------------
  // MYTHIC & ARCHETYPAL — Story & Archetype
  // ---------------------------------------------------------------------------
  {
    id: 'dreams',
    label: 'Dream Journal',
    shortDescription: 'Track dream patterns',
    longDescription:
      'A dedicated space for recording dreams. Symbol tracking and pattern recognition over time.',
    emoji: '🌙',
    icon: Moon,
    path: '/labtools/dreams',
    category: 'mythic',
    domain: 'mythic',
    modes: ['track', 'interpret'],
    minTier: 'personal',
    tags: ['dreams', 'symbols', 'sleep', 'unconscious'],
    defaultEnabled: false,
    comingSoon: false,
    isNew: true,
    popularityRank: 3,
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
    category: 'mythic',
    domain: 'mythic',
    modes: ['track'],
    minTier: 'personal',
    tags: ['archetype', 'mapping', 'path', 'visualization'],
    defaultEnabled: false,
    popularityRank: 2,
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
    category: 'mythic',
    domain: 'mythic',
    modes: ['create', 'connect'],
    minTier: 'personal',
    tags: ['stories', 'mythology', 'narrative', 'traditions'],
    defaultEnabled: false,
    popularityRank: 1,
  },

  // ---------------------------------------------------------------------------
  // SPIRITUAL — Spirit
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
    category: 'spiritual',
    domain: 'spiritual',
    modes: ['train'],
    minTier: 'personal',
    tags: ['spiralogic', 'elements', 'practice', 'training'],
    defaultEnabled: true,
    popularityRank: 1,
  },

  // ---------------------------------------------------------------------------
  // SOMATIC — Body (Orient -> Regulate -> Sense)
  // ---------------------------------------------------------------------------
  {
    id: 'orienting',
    label: 'Orienting',
    shortDescription: 'Expand your field, return to the room',
    longDescription:
      'A 30-90s perceptual sequence that widens your sensory field through simple orientation prompts. Look, listen, touch, settle. The nervous system entry ramp.',
    emoji: '👁',
    icon: Eye,
    path: '/labtools/orienting',
    category: 'somatic',
    domain: 'somatic',
    modes: ['regulate'],
    minTier: 'free',
    tags: ['orient', 'grounding', 'somatic', 'nervous-system', 'safety', 'perception'],
    defaultEnabled: true,
    isNew: true,
    popularityRank: 1,
  },
  {
    id: 'regulation-minute',
    label: 'Regulation Minute',
    shortDescription: 'Quick nervous system reset',
    longDescription:
      'A 60-120 second guided downshift. Three protocols — Downshift, Energize, Stabilize — with breath-synced visuals, haptics, and subtle tones.',
    emoji: '🫁',
    icon: Wind,
    path: '/labtools/regulation-minute',
    category: 'somatic',
    domain: 'somatic',
    modes: ['regulate'],
    minTier: 'free',
    tags: ['breath', 'nervous-system', 'regulation', 'grounding', 'reset', 'downshift', 'somatic'],
    defaultEnabled: true,
    isNew: true,
    popularityRank: 2,
  },
  {
    id: 'breathwork',
    label: 'Breathwork',
    shortDescription: 'Breath protocols for deeper regulation',
    longDescription:
      'Expanded breath practice space. Box breathing, coherent breathing, extended exhale, alternate nostril — longer sessions for working with your state.',
    emoji: '🌬️',
    icon: Wind,
    path: '/labtools/breathwork',
    category: 'somatic',
    domain: 'somatic',
    modes: ['regulate'],
    minTier: 'free',
    tags: ['breath', 'breathwork', 'box-breathing', 'coherent', 'extended-exhale', 'alternate-nostril', 'somatic'],
    defaultEnabled: true,
    isNew: true,
    popularityRank: 3,
  },
  {
    id: 'body-scan',
    label: 'Body Scan',
    shortDescription: 'Guided body awareness',
    longDescription:
      'A sequential awareness scan through body regions. Feet to crown or crown to feet. Simple prompts, no interpretation — just contact with what is.',
    emoji: '🫂',
    icon: Activity,
    path: '/labtools/body-scan',
    category: 'somatic',
    domain: 'somatic',
    modes: ['regulate'],
    minTier: 'free',
    tags: ['body-scan', 'awareness', 'grounding', 'somatic', 'embodiment'],
    defaultEnabled: true,
    isNew: true,
    popularityRank: 4,
  },
  {
    id: 'coherence',
    label: 'Coherence',
    shortDescription: 'Measure and refine your state',
    longDescription:
      'Heart-focused breathing with pre/post state check-in. Quick Reset, Guided Coherence, or Emotional Coherence. Track what shifts.',
    emoji: '💚',
    icon: Heart,
    path: '/labtools/coherence',
    category: 'somatic',
    domain: 'somatic',
    modes: ['regulate', 'track'],
    minTier: 'free',
    tags: ['coherence', 'calibration', 'state', 'hrv', 'heart', 'somatic', 'biofeedback'],
    defaultEnabled: true,
    isNew: true,
    popularityRank: 5,
  },
  {
    id: 'vocal-toning',
    label: 'Vocal Toning',
    shortDescription: 'Humming and vagal stimulation',
    longDescription:
      'Direct vagal nerve activation through vocalization. Guided humming, toning, or free vocalization with optional reference tone.',
    emoji: '🔔',
    icon: Radio,
    path: '/labtools/vocal-toning',
    category: 'somatic',
    domain: 'somatic',
    modes: ['regulate'],
    minTier: 'free',
    tags: ['vocal', 'humming', 'toning', 'vagal', 'somatic', 'sound'],
    defaultEnabled: true,
    isNew: true,
    popularityRank: 6,
  },
  {
    id: 'somatic-discharge',
    label: 'Somatic Discharge',
    shortDescription: 'Shaking, movement, release',
    longDescription:
      'Body-based discharge for completing the stress response. Guided shaking, micro-movement, and settling. When breath alone is not enough.',
    emoji: '⚡',
    icon: Zap,
    path: '/labtools/somatic-discharge',
    category: 'somatic',
    domain: 'somatic',
    modes: ['regulate'],
    minTier: 'free',
    tags: ['shaking', 'discharge', 'movement', 'release', 'somatic', 'nervous-system'],
    defaultEnabled: true,
    isNew: true,
    popularityRank: 7,
  },

  // ---------------------------------------------------------------------------
  // SPIRITUAL — Inner Guide
  // ---------------------------------------------------------------------------
  {
    id: 'inner-guide-meditation',
    label: 'Inner Guide Meditation',
    shortDescription: 'Guided encounter with the Elemental Alchemy field',
    longDescription:
      'A structured meditation journey through the Inner Guide Field. Created by Kelly Nezat in honor of Edward Steinbrecher. Enter, encounter, and integrate — following the Elemental Alchemy cycle. Fire first.',
    emoji: '🔥',
    icon: Flame,
    path: '/labtools/inner-guide-meditation',
    category: 'spiritual',
    domain: 'spiritual',
    modes: ['reflect'],
    minTier: 'free',
    tags: ['meditation', 'inner-guide', 'elemental-alchemy', 'fire', 'encounter', 'steinbrecher'],
    defaultEnabled: true,
    isNew: true,
    popularityRank: 1,
  },

  // ---------------------------------------------------------------------------
  // PSYCHOLOGICAL — Self
  // ---------------------------------------------------------------------------
  {
    id: 'parts-check-in',
    label: 'Parts Check-In',
    shortDescription: 'Which part is up right now?',
    longDescription:
      'Three steps: Notice, Name, Need. A structured lens for seeing which part of you is active and what it wants. No advice, no interpretation \u2014 just a record.',
    emoji: '🎭',
    icon: Eye,
    path: '/labtools/parts-check-in',
    category: 'psychological',
    domain: 'psychological',
    modes: ['reflect'],
    minTier: 'free',
    tags: ['parts-work', 'ifs', 'shadow', 'self-awareness', 'inner-critic', 'noticing', 'psychological'],
    defaultEnabled: true,
    isNew: true,
    popularityRank: 1,
  },
  {
    id: 'parts-shadow',
    label: 'Parts & Shadow',
    shortDescription: 'Meet the parts that are active and what they carry',
    longDescription:
      'Meet the parts of you that are active right now, and explore what they carry or protect. Parts dialogue, shadow recognition, projection awareness \u2014 in one place.',
    emoji: '🪞',
    icon: Eye,
    path: '/labtools/parts-shadow',
    category: 'psychological',
    domain: 'psychological',
    modes: ['reflect', 'connect'],
    minTier: 'personal',
    tags: ['parts-work', 'shadow', 'projection', 'ifs', 'inner-system', 'dialogue', 'psychological'],
    defaultEnabled: false,
    comingSoon: true,
    popularityRank: 2,
  },
  {
    id: 'emotion-body-meaning',
    label: 'Emotion \u2192 Body \u2192 Meaning',
    shortDescription: 'Follow feeling into the body and what it points to',
    longDescription:
      'Follow what you\u2019re feeling into the body, and uncover what it may be pointing to. What is felt, where it lives, what it\u2019s connected to.',
    emoji: '💧',
    icon: Waves,
    path: '/labtools/emotion-body-meaning',
    category: 'psychological',
    domain: 'psychological',
    modes: ['reflect', 'interpret'],
    minTier: 'personal',
    tags: ['emotion', 'somatic', 'body', 'meaning', 'felt-sense', 'processing', 'psychological'],
    defaultEnabled: false,
    comingSoon: true,
    popularityRank: 3,
  },
  {
    id: 'narrative-threshold',
    label: 'Narrative / Threshold',
    shortDescription: 'Sense where you are in a larger process',
    longDescription:
      'Sense where you are in a larger process \u2014 what may be ending, emerging, or transforming. Connects directly to your Spiralogic phase.',
    emoji: '🚪',
    icon: Sparkles,
    path: '/labtools/narrative-threshold',
    category: 'psychological',
    domain: 'psychological',
    modes: ['reflect', 'track'],
    minTier: 'personal',
    tags: ['narrative', 'threshold', 'transition', 'identity', 'arc', 'transformation', 'psychological'],
    defaultEnabled: false,
    comingSoon: true,
    popularityRank: 4,
  },
  {
    id: 'integration-protocol',
    label: 'Integration Protocol',
    shortDescription: 'Translate insight into a grounded step',
    longDescription:
      'Translate insight into a small, grounded step you can actually take. The closure mechanism \u2014 micro-actions, ritual suggestions, reflection loops.',
    emoji: '🌱',
    icon: Zap,
    path: '/labtools/integration-protocol',
    category: 'psychological',
    domain: 'psychological',
    modes: ['act', 'create'],
    minTier: 'personal',
    tags: ['integration', 'action', 'ritual', 'embodiment', 'practice', 'cross-layer', 'closure'],
    defaultEnabled: false,
    comingSoon: true,
    popularityRank: 5,
  },

  // ---------------------------------------------------------------------------
  // RELATIONAL — Relationships
  // ---------------------------------------------------------------------------
  {
    id: 'repair-script',
    label: 'Repair Script',
    shortDescription: 'Build a clean repair message',
    longDescription:
      'Four steps: Impact, Ownership, Request, Invitation. Three tones: Gentle, Direct, Neutral. No AI \u2014 just a scaffold for saying what\u2019s true.',
    emoji: '🩹',
    icon: Heart,
    path: '/labtools/repair-script',
    category: 'relational',
    domain: 'relational',
    modes: ['act', 'create', 'connect'],
    minTier: 'free',
    tags: ['repair', 'conflict', 'communication', 'boundaries', 'relationship', 'relational'],
    defaultEnabled: true,
    isNew: true,
    popularityRank: 1,
  },
  {
    id: 'relational-field',
    label: 'Relational Field',
    shortDescription: 'Sense the tone and movement in a bond',
    longDescription:
      'See what\u2019s alive between you and someone \u2014 tone, unresolved threads, boundary clarity. Not analysis. Perception.',
    emoji: '🌊',
    icon: Waves,
    path: '/labtools/relational-field',
    category: 'relational',
    domain: 'relational',
    modes: ['reflect', 'track'],
    // [Relational Layer — Phase 4 activation] scaffold, zero AI cost, free by design
    minTier: 'free',
    tags: ['relationship', 'field', 'tone', 'boundaries', 'unresolved', 'perception', 'relational'],
    defaultEnabled: true,
    popularityRank: 2,
  },
  {
    id: 'dynamics-map',
    label: 'Dynamics Map',
    shortDescription: 'Notice the patterns between you and another',
    longDescription:
      'Recurring relational patterns \u2014 pursue/withdraw, over-function/under-function, projection loops. Emerges from observed recurrence, not labels.',
    emoji: '🔄',
    icon: Activity,
    path: '/labtools/dynamics-map',
    category: 'relational',
    domain: 'relational',
    modes: ['track', 'interpret'],
    // [Relational Layer — Phase 4 activation] scaffold, zero AI cost, free by design
    minTier: 'free',
    tags: ['dynamics', 'patterns', 'projection', 'power', 'attachment', 'relational'],
    defaultEnabled: true,
    popularityRank: 3,
  },
  {
    id: 'repair-path',
    label: 'Repair Path',
    shortDescription: 'Possible moves after rupture',
    longDescription:
      'When something has broken or stalled between you and someone \u2014 possible moves, not prescriptions. Surfaces only when rupture is present.',
    emoji: '🌿',
    icon: Wind,
    path: '/labtools/repair-path',
    category: 'relational',
    domain: 'relational',
    modes: ['act', 'reflect'],
    // [Relational Layer — Phase 4 activation] scaffold, zero AI cost, free by design
    minTier: 'free',
    tags: ['repair', 'rupture', 'resolution', 'moves', 'relational'],
    defaultEnabled: true,
    popularityRank: 4,
  },

  // ---------------------------------------------------------------------------
  // PHILOSOPHICAL — Meaning & Values
  // ---------------------------------------------------------------------------
  {
    id: 'values-compass',
    label: 'Values Compass',
    shortDescription: 'Clarify what matters in a dilemma',
    longDescription:
      'Present a dilemma and clarify the values at stake. Surfaces tradeoffs, proposes a coherent next step, and names the cost you accept.',
    emoji: '🧭',
    icon: Compass,
    path: '/labtools/values-compass',
    category: 'philosophical',
    domain: 'philosophical',
    modes: ['reflect', 'act'],
    minTier: 'personal',
    tags: ['values', 'ethics', 'dilemma', 'decision', 'integrity'],
    defaultEnabled: true,
    popularityRank: 1,
  },

  // ---------------------------------------------------------------------------
  // LIBRARY (utility)
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
  // COMMUNITY (utility)
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
  // SETTINGS — removed from LabTools (2026-04-03)
  // Profile, Voice, Data Sovereignty, and generic Settings are account-level
  // concerns, not LabTools instruments. They belong under /account or /maia.
  // A setting belongs in LabTools only if it changes how a LabTool behaves,
  // how its outputs are generated, or how its sessions are stored.
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // DEVELOPER (utility)
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
  {
    id: 'guidance-signals',
    label: 'Guidance Signals',
    shortDescription: 'Where members need guidance',
    longDescription:
      'Aggregate confusion signals by feature. Shows what content to create next based on real member behavior — no content captured, structural only.',
    emoji: '🔦',
    icon: Eye,
    path: '/labtools/guidance-signals',
    category: 'developer',
    minTier: 'pro',
    tags: ['guidance', 'signals', 'content', 'tooltips', 'confusion'],
    defaultEnabled: false,
    requiresRole: 'admin',
    popularityRank: 4,
  },

  // ---------------------------------------------------------------------------
  // ADMIN (utility)
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

// -- Type guards --

const CONSCIOUSNESS_DOMAINS = new Set<string>([
  'somatic', 'cognitive', 'psychological', 'relational',
  'mythic', 'philosophical', 'spiritual', 'metaphysical',
]);

const UTILITY_CATEGORIES = new Set<string>([
  'library', 'community', 'settings', 'developer', 'admin',
]);

/** Check if a category is a consciousness domain */
export function isConsciousnessDomain(cat: ToolCategory): cat is ConsciousnessDomain {
  return CONSCIOUSNESS_DOMAINS.has(cat);
}

/** Check if a category is a utility category */
export function isUtilityCategory(cat: ToolCategory): cat is UtilityCategory {
  return UTILITY_CATEGORIES.has(cat);
}

// -- Domain helpers --

/** Get all consciousness domains in display order */
export function getDomainsInOrder(): ConsciousnessDomain[] {
  return (Object.keys(DOMAIN_META) as ConsciousnessDomain[]).sort(
    (a, b) => DOMAIN_META[a].defaultOrder - DOMAIN_META[b].defaultOrder
  );
}

/** Get domains filtered by tier */
export function getDomainsByTier(tier: DomainTier): ConsciousnessDomain[] {
  return getDomainsInOrder().filter((d) => DOMAIN_META[d].tier === tier);
}

/** Get utility categories in display order */
export function getUtilityCategoriesInOrder(): UtilityCategory[] {
  return (Object.keys(UTILITY_META) as UtilityCategory[]).sort(
    (a, b) => UTILITY_META[a].defaultOrder - UTILITY_META[b].defaultOrder
  );
}

// -- Tool queries --

/** Get all tools in a category */
export function getToolsByCategory(category: ToolCategory): LabTool[] {
  return TOOL_REGISTRY.filter((tool) => tool.category === category).sort(
    (a, b) => (a.popularityRank ?? 99) - (b.popularityRank ?? 99)
  );
}

/** Get all tools in a consciousness domain */
export function getToolsByDomain(domain: ConsciousnessDomain): LabTool[] {
  return TOOL_REGISTRY.filter((tool) => tool.domain === domain).sort(
    (a, b) => (a.popularityRank ?? 99) - (b.popularityRank ?? 99)
  );
}

/** Get all tools matching a mode */
export function getToolsByMode(mode: ToolMode): LabTool[] {
  return TOOL_REGISTRY.filter((tool) => tool.modes?.includes(mode)).sort(
    (a, b) => (a.popularityRank ?? 99) - (b.popularityRank ?? 99)
  );
}

/** Get a tool by ID */
export function getToolById(id: string): LabTool | undefined {
  return TOOL_REGISTRY.find((tool) => tool.id === id);
}

/** Get all categories in display order (domains first, then utilities) */
export function getCategoriesInOrder(): ToolCategory[] {
  return [
    ...getDomainsInOrder(),
    ...getUtilityCategoriesInOrder(),
  ];
}

/** Get default enabled tools (starter kit) */
export function getDefaultEnabledTools(): LabTool[] {
  return TOOL_REGISTRY.filter((tool) => tool.defaultEnabled);
}

/** Get tools available for a given tier */
export function getToolsForTier(tier: Tier): LabTool[] {
  const tierRank: Record<Tier, number> = { free: 0, personal: 1, pro: 2 };
  const userRank = tierRank[tier];

  return TOOL_REGISTRY.filter((tool) => {
    const toolRank = tierRank[tool.minTier];
    return toolRank <= userRank;
  });
}

/** Check if a tool is accessible for a given tier and role */
export function isToolAccessible(
  tool: LabTool,
  tier: Tier,
  role?: string
): boolean {
  const tierRank: Record<Tier, number> = { free: 0, personal: 1, pro: 2 };

  if (tierRank[tier] < tierRank[tool.minTier]) {
    return false;
  }

  if (tool.requiresRole && tool.requiresRole !== role) {
    return false;
  }

  return true;
}

/** Get the simple mode groups in display order */
export function getSimpleModesInOrder(): SimpleMode[] {
  return ['notice', 'shift', 'act-group'];
}

/** Get the detailed modes for a simple mode */
export function getModesForSimpleMode(simpleMode: SimpleMode): ToolMode[] {
  return SIMPLE_MODE_MAP[simpleMode];
}

/** Get the default simple mode for a domain */
export function getDefaultModeForDomain(domain: ConsciousnessDomain): SimpleMode {
  return DOMAIN_META[domain].defaultMode;
}

/** Get tools matching a simple mode (any of its constituent detailed modes) */
export function getToolsBySimpleMode(simpleMode: SimpleMode): LabTool[] {
  const modes = SIMPLE_MODE_MAP[simpleMode];
  return TOOL_REGISTRY.filter(
    (tool) => tool.modes?.some((m) => modes.includes(m))
  ).sort((a, b) => (a.popularityRank ?? 99) - (b.popularityRank ?? 99));
}

/** Search tools by query (searches label, description, tags, domain, and modes) */
export function searchTools(query: string): LabTool[] {
  const q = query.toLowerCase().trim();
  if (!q) return TOOL_REGISTRY;

  return TOOL_REGISTRY.filter((tool) => {
    return (
      tool.label.toLowerCase().includes(q) ||
      tool.shortDescription.toLowerCase().includes(q) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      tool.category.toLowerCase().includes(q) ||
      (tool.domain && tool.domain.toLowerCase().includes(q)) ||
      (tool.modes && tool.modes.some((m) => m.toLowerCase().includes(q)))
    );
  });
}

/** Get tool count by category */
export function getToolCountByCategory(): Record<ToolCategory, number> {
  const counts = {} as Record<ToolCategory, number>;

  for (const category of Object.keys(CATEGORY_META) as ToolCategory[]) {
    counts[category] = TOOL_REGISTRY.filter(
      (t) => t.category === category
    ).length;
  }

  return counts;
}

// =============================================================================
// REGISTRY INVARIANT VALIDATION (dev-time safety net)
// =============================================================================

/**
 * Validates the tool registry for structural integrity.
 * Call this in dev/test to catch misconfigurations early.
 *
 * Invariants:
 * - Every consciousness tool has a `domain` field
 * - Every consciousness tool has at least one `mode`
 * - Every tool's `category` resolves to a key in CATEGORY_META
 * - No duplicate tool IDs
 * - Domain tools have category === domain
 */
export function validateRegistry(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const validModes = new Set<string>(Object.keys(MODE_META));

  for (const tool of TOOL_REGISTRY) {
    // Duplicate ID check
    if (seenIds.has(tool.id)) {
      errors.push(`Duplicate tool ID: "${tool.id}"`);
    }
    seenIds.add(tool.id);

    // Category must exist in CATEGORY_META
    if (!(tool.category in CATEGORY_META)) {
      errors.push(`Tool "${tool.id}" has unknown category: "${tool.category}"`);
    }

    // Mode typo check: every mode must be a valid ToolMode key
    if (tool.modes) {
      for (const mode of tool.modes) {
        if (!validModes.has(mode)) {
          errors.push(`Tool "${tool.id}" has unknown mode: "${mode}"`);
        }
      }
    }

    // Consciousness tools must have domain and modes
    if (isConsciousnessDomain(tool.category)) {
      if (!tool.domain) {
        errors.push(`Tool "${tool.id}" is in domain category "${tool.category}" but missing \`domain\` field`);
      }
      if (tool.domain && tool.domain !== tool.category) {
        errors.push(`Tool "${tool.id}" has mismatched category="${tool.category}" and domain="${tool.domain}"`);
      }
      if (!tool.modes || tool.modes.length === 0) {
        errors.push(`Tool "${tool.id}" is a consciousness tool but has no \`modes\``);
      }
    }

    // Utility tools should NOT have domain
    if (isUtilityCategory(tool.category) && tool.domain) {
      errors.push(`Tool "${tool.id}" is a utility tool but has a \`domain\` field`);
    }
  }

  // CATEGORY_META completeness: every domain must have all required DomainMeta fields
  for (const domain of Object.keys(DOMAIN_META) as ConsciousnessDomain[]) {
    const meta = DOMAIN_META[domain];
    if (!meta.alias) errors.push(`Domain "${domain}" missing \`alias\``);
    if (!meta.tier) errors.push(`Domain "${domain}" missing \`tier\``);
    if (!meta.longDescription) errors.push(`Domain "${domain}" missing \`longDescription\``);
    if (!meta.commonIntents || meta.commonIntents.length === 0) {
      errors.push(`Domain "${domain}" missing or empty \`commonIntents\``);
    }
    if (!meta.defaultMode) errors.push(`Domain "${domain}" missing \`defaultMode\``);
  }

  // Simple mode map completeness: every mode must appear in exactly one simple mode
  const mappedModes = new Set<string>();
  for (const [simpleMode, modes] of Object.entries(SIMPLE_MODE_MAP)) {
    for (const mode of modes) {
      if (!validModes.has(mode)) {
        errors.push(`SIMPLE_MODE_MAP["${simpleMode}"] references unknown mode: "${mode}"`);
      }
      if (mappedModes.has(mode)) {
        errors.push(`Mode "${mode}" appears in multiple simple mode groups`);
      }
      mappedModes.add(mode);
    }
  }
  for (const mode of validModes) {
    if (!mappedModes.has(mode)) {
      errors.push(`Mode "${mode}" is not mapped to any simple mode group`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// =============================================================================
// DEV-ONLY HEATMAP DIAGNOSTIC
// =============================================================================

/**
 * Print a Domain x Mode heatmap to the console.
 * Shows where the consciousness map is rich vs empty.
 *
 * Output format:
 *   Domain       | Reflect | Track.. | Make M. | Regul. | Pract. | Create | Act    | Relate | TOTAL
 *   -------------|---------|---------|--------|--------|--------|--------|--------|--------|------
 *   somatic      |    0    |    0    |    0   |    1   |    0   |    0   |    0   |    0   |   1
 *   ...
 *   -------------|---------|---------|--------|--------|--------|--------|--------|--------|------
 *   TOTAL        |    X    |    X    |    X   |    X   |    X   |    X   |    X   |    X   |  XX
 *
 * Call from browser console: `window.__registryHeatmap()`
 */
export function printRegistryHeatmap(): void {
  const domains = getDomainsInOrder();
  const modes = Object.keys(MODE_META) as ToolMode[];

  // Build count matrix
  const matrix: Record<string, Record<string, number>> = {};
  const modeTotals: Record<string, number> = {};
  for (const mode of modes) modeTotals[mode] = 0;

  for (const domain of domains) {
    matrix[domain] = {};
    for (const mode of modes) {
      const count = TOOL_REGISTRY.filter(
        (t) => t.domain === domain && t.modes?.includes(mode)
      ).length;
      matrix[domain][mode] = count;
      modeTotals[mode] += count;
    }
  }

  // Format for console
  const modeLabels = modes.map((m) => MODE_META[m].label.slice(0, 7).padEnd(7));
  const divider = '-'.repeat(14) + '|' + modeLabels.map(() => '---------').join('|') + '|-------';

  console.log('\n[ToolRegistry] Domain x Mode Heatmap\n');
  console.log(
    '  ' + 'Domain'.padEnd(13) + '| ' + modeLabels.join(' | ') + ' | TOTAL'
  );
  console.log('  ' + divider);

  for (const domain of domains) {
    const alias = DOMAIN_META[domain].alias.slice(0, 12).padEnd(13);
    const tier = DOMAIN_META[domain].tier;
    const cells = modes.map((m) => {
      const count = matrix[domain][m];
      return (count === 0 ? '  ·  ' : `  ${count}  `).padEnd(7);
    });
    const total = modes.reduce((sum, m) => sum + matrix[domain][m], 0);
    const tierMark = tier === 'foundation' ? '' : tier === 'meaning' ? ' ~' : ' ^';
    console.log(
      '  ' + alias + '| ' + cells.join(' | ') + ' |  ' + String(total).padEnd(3) + tierMark
    );
  }

  console.log('  ' + divider);
  const totalCells = modes.map((m) => (`  ${modeTotals[m]}  `).padEnd(7));
  const grandTotal = Object.values(modeTotals).reduce((a, b) => a + b, 0);
  console.log(
    '  ' + 'TOTAL'.padEnd(13) + '| ' + totalCells.join(' | ') + ' |  ' + grandTotal
  );

  // Summary
  const emptyDomains = domains.filter(
    (d) => modes.every((m) => matrix[d][m] === 0)
  );
  const emptyModes = modes.filter((m) => modeTotals[m] === 0);
  const comingSoonCount = TOOL_REGISTRY.filter((t) => t.comingSoon).length;
  const liveCount = TOOL_REGISTRY.filter((t) => t.domain && !t.comingSoon).length;

  console.log('\n  Legend: · = empty  ~ = meaning tier  ^ = vertical tier');
  console.log(`  Live tools: ${liveCount}  |  Coming soon: ${comingSoonCount}`);
  if (emptyDomains.length > 0) {
    console.log(`  Empty domains: ${emptyDomains.map((d) => DOMAIN_META[d].alias).join(', ')}`);
  }
  if (emptyModes.length > 0) {
    console.log(`  Empty modes: ${emptyModes.map((m) => MODE_META[m].label).join(', ')}`);
  }
  console.log('');
}

// Run validation and heatmap in development
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  const result = validateRegistry();
  if (!result.valid) {
    console.warn('[ToolRegistry] Invariant violations:', result.errors);
  }
}

// Expose heatmap on window for browser console access
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__registryHeatmap = printRegistryHeatmap;
}
