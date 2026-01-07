/**
 * Therapeutic Frameworks & Reflection Lenses
 *
 * IMPORTANT: Spiralogic is MAIA's native awareness — always present, never "selected."
 * These frameworks are additional lenses that shape HOW MAIA applies her awareness:
 *
 * - Counsel mode: Therapeutic frameworks guide the approach to inner work
 * - Scribe mode: Reflection lenses shape how sessions are analyzed
 *
 * When no framework is selected ("auto"), MAIA uses pure Spiralogic awareness.
 * When a framework IS selected, MAIA integrates that lens WITH her Spiralogic foundation.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type TherapeuticFramework =
  | 'auto'        // Pure MAIA/Spiralogic awareness (default)
  | 'jungian'     // Depth psychology, archetypes, shadow
  | 'cbt'         // Cognitive-behavioral, pattern interruption
  | 'somatic'     // Body-based, nervous system, felt sense
  | 'ifs'         // Internal Family Systems, parts work
  | 'relational'  // Attachment, rupture/repair, boundaries
  | 'humanistic'  // Person-centered, values, agency
  | 'existential' // Meaning, mortality, freedom, isolation

export type ReflectionLens =
  | 'auto'        // Pure MAIA/Spiralogic awareness (default)
  | 'jungian'     // Archetypal patterns, symbols, individuation
  | 'somatic'     // Body signals, nervous system states
  | 'relational'  // Attachment patterns, relational dynamics
  | 'narrative'   // Story arcs, themes, character development

// ─────────────────────────────────────────────────────────────────────────────
// Framework Definitions
// ─────────────────────────────────────────────────────────────────────────────

export interface FrameworkConfig {
  id: TherapeuticFramework | ReflectionLens;
  label: string;
  shortLabel: string;
  description: string;
  promise: string;      // What this lens offers
  boundary: string;     // What it won't do
  icon: string;         // Emoji for compact display
  color: string;        // Tailwind color class
}

export const THERAPEUTIC_FRAMEWORKS: Record<TherapeuticFramework, FrameworkConfig> = {
  auto: {
    id: 'auto',
    label: 'MAIA',
    shortLabel: 'MAIA',
    description: 'Pure Spiralogic awareness — MAIA\'s native intelligence integrating all approaches organically',
    promise: 'I\'ll meet you where you are, drawing from whatever serves this moment without forcing a single framework.',
    boundary: 'I won\'t rigidly apply any technique—I follow what\'s actually happening.',
    icon: '🌀',
    color: 'text-amber-400'
  },
  jungian: {
    id: 'jungian',
    label: 'Depth Psychology',
    shortLabel: 'Depth',
    description: 'Working with archetypes, shadow, dreams, and the symbolic life',
    promise: 'I\'ll stay close to your images—dreams, symbols, patterns—and help them unfold over time.',
    boundary: 'I won\'t give generic "symbol = X" definitions or flatten you into a typology.',
    icon: '🌑',
    color: 'text-indigo-400'
  },
  cbt: {
    id: 'cbt',
    label: 'Cognitive-Behavioral',
    shortLabel: 'CBT',
    description: 'Identifying thought patterns and experimenting with practical changes',
    promise: 'I\'ll help you name the loop, test a small change, and track what actually works.',
    boundary: 'I won\'t dismiss feelings or treat your inner world like a bug to logic away.',
    icon: '💡',
    color: 'text-sky-400'
  },
  somatic: {
    id: 'somatic',
    label: 'Somatic',
    shortLabel: 'Body',
    description: 'Listening to the body—sensation, pace, nervous system wisdom',
    promise: 'I\'ll help you listen to the body—pace, sensation, safety—one honest step at a time.',
    boundary: 'I won\'t push catharsis, intensity, or override your nervous system\'s timing.',
    icon: '🫀',
    color: 'text-emerald-400'
  },
  ifs: {
    id: 'ifs',
    label: 'Parts Work (IFS)',
    shortLabel: 'Parts',
    description: 'Working with inner parts, protectors, exiles, and Self-energy',
    promise: 'I\'ll help you get curious about your parts—what they protect, what they carry—without trying to fix them.',
    boundary: 'I won\'t pathologize your protectors or rush past their wisdom.',
    icon: '🪞',
    color: 'text-violet-400'
  },
  relational: {
    id: 'relational',
    label: 'Relational',
    shortLabel: 'Connection',
    description: 'Exploring attachment, boundaries, rupture and repair',
    promise: 'I\'ll focus on the field between you and others—needs, boundaries, rupture/repair, clean speech.',
    boundary: 'I won\'t take sides, reward blame stories, or coach manipulation.',
    icon: '🤝',
    color: 'text-blue-400'
  },
  humanistic: {
    id: 'humanistic',
    label: 'Person-Centered',
    shortLabel: 'Values',
    description: 'Centering your agency, values, and inner authority',
    promise: 'I\'ll center dignity and agency—values, meaning, choice—so you strengthen your inner authority.',
    boundary: 'I won\'t pathologize you or push you toward a life optimized for approval.',
    icon: '✨',
    color: 'text-rose-400'
  },
  existential: {
    id: 'existential',
    label: 'Existential',
    shortLabel: 'Meaning',
    description: 'Engaging with meaning, mortality, freedom, and authentic choice',
    promise: 'I\'ll sit with the big questions—meaning, death, freedom, aloneness—without rushing to comfort.',
    boundary: 'I won\'t offer easy answers or bypass the weight of genuine inquiry.',
    icon: '🌌',
    color: 'text-purple-400'
  }
};

export const REFLECTION_LENSES: Record<ReflectionLens, FrameworkConfig> = {
  auto: {
    id: 'auto',
    label: 'MAIA',
    shortLabel: 'MAIA',
    description: 'Pure Spiralogic reflection — surfacing developmental movement, elemental themes, and organic patterns',
    promise: 'I\'ll reflect what emerged through MAIA\'s native lens—spirals, elements, growth edges.',
    boundary: 'I won\'t force a single analytical framework onto your experience.',
    icon: '🌀',
    color: 'text-amber-400'
  },
  jungian: {
    id: 'jungian',
    label: 'Archetypal',
    shortLabel: 'Archetypes',
    description: 'Identify archetypal patterns, symbols, and individuation themes',
    promise: 'I\'ll name the archetypes at play—shadow material, anima/animus dynamics, individuation edges.',
    boundary: 'I won\'t over-interpret or force symbolic meaning onto concrete concerns.',
    icon: '🌑',
    color: 'text-indigo-400'
  },
  somatic: {
    id: 'somatic',
    label: 'Body Wisdom',
    shortLabel: 'Body',
    description: 'Track body signals, nervous system patterns, and embodied themes',
    promise: 'I\'ll highlight where body wisdom appeared—tension patterns, breath shifts, grounding moments.',
    boundary: 'I won\'t diagnose somatic states or override your own felt-sense authority.',
    icon: '🫀',
    color: 'text-emerald-400'
  },
  relational: {
    id: 'relational',
    label: 'Relational Patterns',
    shortLabel: 'Relational',
    description: 'Surface attachment dynamics, boundary themes, and connection patterns',
    promise: 'I\'ll trace the relational threads—attachment patterns, boundary work, repair opportunities.',
    boundary: 'I won\'t assign blame or reduce complex relationships to simple categories.',
    icon: '🤝',
    color: 'text-blue-400'
  },
  narrative: {
    id: 'narrative',
    label: 'Story Arc',
    shortLabel: 'Narrative',
    description: 'See the narrative structure—themes, turning points, character growth',
    promise: 'I\'ll reflect the story emerging—recurring themes, pivotal moments, the direction it\'s pointing.',
    boundary: 'I won\'t impose a narrative arc you don\'t recognize as your own.',
    icon: '📖',
    color: 'text-orange-400'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function getFrameworkConfig(id: TherapeuticFramework): FrameworkConfig {
  return THERAPEUTIC_FRAMEWORKS[id];
}

export function getLensConfig(id: ReflectionLens): FrameworkConfig {
  return REFLECTION_LENSES[id];
}

/**
 * Get prompt addendum for Counsel mode framework.
 * When 'auto', no extra addendum is needed — MAIA uses pure Spiralogic awareness.
 */
export function getFrameworkPromptAddendum(framework: TherapeuticFramework): string | null {
  if (framework === 'auto') return null; // Pure MAIA — no extra framing needed

  const config = THERAPEUTIC_FRAMEWORKS[framework];

  return `
## Additional Therapeutic Lens: ${config.label}

While maintaining your core Spiralogic awareness, integrate a ${config.label.toLowerCase()} approach for this Counsel session.

**This lens emphasizes:** ${config.description}

**Your promise with this lens:** ${config.promise}

**Your boundary:** ${config.boundary}

Let this lens inform what you notice and how you respond, while staying grounded in your native MAIA awareness. Don't announce the framework unless the person asks—let it show through how you listen.
`.trim();
}

/**
 * Get prompt addendum for Scribe mode reflection lens.
 * When 'auto', no extra addendum is needed — MAIA uses pure Spiralogic reflection.
 */
export function getReflectionLensAddendum(lens: ReflectionLens): string | null {
  if (lens === 'auto') return null; // Pure MAIA — no extra framing needed

  const config = REFLECTION_LENSES[lens];

  return `
## Reflection Lens: ${config.label}

While using your native Spiralogic awareness, also apply a ${config.label.toLowerCase()} lens to this Scribe session.

**What this lens looks for:** ${config.description}

**Your offering:** ${config.promise}

**Your boundary:** ${config.boundary}

Surface insights through this lens where it fits naturally. Don't force the framework onto content that doesn't call for it.
`.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Storage
// ─────────────────────────────────────────────────────────────────────────────

const COUNSEL_FRAMEWORK_KEY = 'maia_counsel_framework';
const SCRIBE_LENS_KEY = 'maia_scribe_lens';

export function getCounselFramework(): TherapeuticFramework {
  if (typeof window === 'undefined') return 'auto';
  const stored = localStorage.getItem(COUNSEL_FRAMEWORK_KEY);
  if (stored && stored in THERAPEUTIC_FRAMEWORKS) {
    return stored as TherapeuticFramework;
  }
  return 'auto';
}

export function setCounselFramework(framework: TherapeuticFramework): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COUNSEL_FRAMEWORK_KEY, framework);
  window.dispatchEvent(new CustomEvent('maia-counsel-framework-changed', {
    detail: { framework }
  }));
}

export function getScribeLens(): ReflectionLens {
  if (typeof window === 'undefined') return 'auto';
  const stored = localStorage.getItem(SCRIBE_LENS_KEY);
  if (stored && stored in REFLECTION_LENSES) {
    return stored as ReflectionLens;
  }
  return 'auto';
}

export function setScribeLens(lens: ReflectionLens): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SCRIBE_LENS_KEY, lens);
  window.dispatchEvent(new CustomEvent('maia-scribe-lens-changed', {
    detail: { lens }
  }));
}
