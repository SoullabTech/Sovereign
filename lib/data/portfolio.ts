export interface PortfolioProject {
  name: string;
  slug: string;
  domain: string;
  description: string;
  status: 'live' | 'beta' | 'development' | 'idea';
  accent: string;
  tags: string[];
  group?: 'sites' | 'helper-tools';
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    name: 'Old Head Plaster',
    slug: 'oldhead',
    domain: 'https://oldhead.soullab.life',
    description: 'Traditional Irish plastering craft. Full site with Virtual Daragh AI guide.',
    status: 'live',
    accent: '#D4A574',
    tags: ['Astro', 'AI Guide', 'Craft'],
    group: 'sites',
  },
  {
    name: 'Rudeboy Baking Co.',
    slug: 'rudeboy',
    domain: 'https://rudeboy.soullab.life',
    description: 'Artisan bakery with kitchen operations console and ordering system.',
    status: 'live',
    accent: '#FF8C42',
    tags: ['Astro', 'Operations', 'Food'],
    group: 'sites',
  },
  {
    name: 'JL Master Handyman',
    slug: 'jeremy',
    domain: 'https://jeremy.soullab.life',
    description: 'Professional handyman services. Clean, trust-building web presence.',
    status: 'live',
    accent: '#4A7BA7',
    tags: ['Astro', 'Services', 'Local'],
    group: 'sites',
  },
  {
    name: 'Loralee Starweaver',
    slug: 'loralee',
    domain: 'https://loralee.soullab.life',
    description: 'Stellium astrology portal with voice sessions, journaling, and practitioner tools.',
    status: 'live',
    accent: '#6A4C93',
    tags: ['Portal', 'Voice', 'Astrology'],
    group: 'sites',
  },
  {
    name: 'Elemental Alchemy — Audiobook',
    slug: 'elemental-alchemy',
    domain: 'https://elementalalchemy.soullab.life',
    description: 'Interactive audiobook experience with elemental navigation and immersive design.',
    status: 'live',
    accent: '#6A4C93',
    tags: ['Audiobook', 'Interactive', 'Education'],
    group: 'sites',
  },
  {
    name: 'White-Label Demo',
    slug: 'demo',
    domain: 'https://demo.soullab.life',
    description: 'Demonstration of the Soullab platform capabilities for potential partners.',
    status: 'live',
    accent: '#14b8a6',
    tags: ['Demo', 'Platform', 'White-Label'],
    group: 'sites',
  },
  {
    name: 'MAIA',
    slug: 'maia',
    domain: 'https://soullab.life/maia',
    description: 'MAIA is Soullab’s relational intelligence system — designed for voice, reflection, continuity, and deeper participation in one’s lived experience.',
    status: 'beta',
    accent: '#B8956F',
    tags: ['Relational Intelligence', 'Voice Presence', 'Reflective Systems'],
    group: 'helper-tools',
  },
  {
    name: 'Pro Studio',
    slug: 'studio',
    domain: 'https://soullab.life/studio',
    description: 'Practitioner workspace for sessions, reflections, continuity, and relational care — designed to support the real work of helping people without platform bloat or subscription exhaustion.',
    status: 'beta',
    accent: '#5C8B95',
    tags: ['Practitioner', 'Sessions', 'Continuity'],
    group: 'helper-tools',
  },
  {
    name: 'Book Studio',
    slug: 'book-studio',
    domain: 'https://soullab.life/book-studio/read',
    description: 'A sovereign publishing and reading studio for authors, teachers, and independent presses. Read Flow opens into living works like Elemental Alchemy; Canvas supports members publishing works fully their own.',
    status: 'development',
    accent: '#F0B95C',
    tags: ['Soullab Press', 'Reading', 'Publishing'],
    group: 'helper-tools',
  },
];

export interface UpcomingProject {
  name: string;
  description: string;
  status: 'in-progress' | 'coming-soon' | 'idea';
}

export const UPCOMING_PROJECTS: UpcomingProject[] = [
  {
    name: 'Community Commons',
    description: 'Shared knowledge space for practitioners, researchers, and builders.',
    status: 'in-progress',
  },
  {
    name: 'Partner Portals',
    description: 'White-label consciousness technology for institutions and collaborators.',
    status: 'coming-soon',
  },
  {
    name: 'Book Companion',
    description: 'Interactive reading experience bridging text and lived practice.',
    status: 'idea',
  },
];

/**
 * Capability maturity — the four-state taxonomy ratified 2026-06-26.
 *   live            — wired; executes in the live request path; member can experience today
 *   built_not_wired — substrate built, 0 importers on the live path or unverified surfacing
 *   designed        — architectural design; no built substrate yet; claim requires marker verb
 *   research        — active investigation; hypothesis not yet proven; may never ship as designed
 *
 * Old values `prompt_shaped` and `vision` are retired. Prompt-shaped postures that have no
 * distinct wired mechanism are `built_not_wired`; vision-only items are `designed` or `research`.
 */
export type InnovationStatus = 'live' | 'built_not_wired' | 'designed' | 'research';

/** Public rendering bucket — derived from status + steward decision; governs section placement. */
export type PublicBucket = 'available_today' | 'architected_for_release' | 'research';

export interface Innovation {
  title: string;
  description: string;
  category: 'core-intelligence' | 'relational-safety' | 'developmental-continuity' | 'knowledge-modality' | 'infrastructure';
  /**
   * Governance metadata (maturity). Encoded as DATA so the rendering layer decides presentation.
   * Separation of governance from presentation: the truth lives here; the renderer reads it.
   * To change a status, cite new evidence in `verifiedBy`. Status is earned, not declared.
   */
  status: InnovationStatus;
  /**
   * Which public section this item renders in.
   * available_today      → "Available Today" bucket
   * architected_for_release → "Architected for Release" bucket
   * research             → "Research" bucket
   */
  publicBucket: PublicBucket;
  /**
   * Short label rendered after the item name in the card heading.
   * Omit for `live` items. Set to 'Architected' for designed/built_not_wired; 'Research' for research.
   * Rendered as: "<title> (<statusLabel>)" — keeps the name clean in the data.
   */
  statusLabel?: 'Architected' | 'Research';
  /** Pointer to the evidence or audit that justifies `status`. */
  evidence?: string;
  /** Which audit/method earned this status. Makes status an earned property. */
  verifiedBy?: string;
  /** When the status was earned (ISO date). */
  earnedAt?: string;
}

// Maturity status and public bucket per item — steward-ratified 2026-06-26.
// Status is governance DATA; publicBucket is the rendering decision derived from it.
// To change a status, cite new evidence in verifiedBy. Status is earned, not declared.
export const INNOVATIONS: Innovation[] = [
  // — Core Intelligence —
  {
    title: 'Awareness-Level Routing',
    description: 'MAIA adapts its responses to the depth, complexity, and developmental level of the moment, meeting people where they are without flattening nuance or overreaching.',
    category: 'core-intelligence',
    status: 'live',
    publicBucket: 'available_today',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
  },
  {
    title: 'Dialectical Scaffold',
    description: 'A multi-perspective processing architecture designed to hold tension between viewpoints and help insight emerge through contrast and integrative reasoning, rather than forcing premature resolution.',
    category: 'core-intelligence',
    status: 'built_not_wired',
    publicBucket: 'architected_for_release',
    statusLabel: 'Architected',
    evidence: 'taxonomy_audit_2026_06_26',
    verifiedBy: 'Audit 2026-06-26 — Corpus Callosum substrate exists; member-facing effect unmeasured',
    earnedAt: '2026-06-26',
  },
  {
    title: '4-Phase Relational Sequencing',
    description: 'A designed interaction model that will progressively govern how conversations mature over time — through attunement, clarification, reflection, or forward movement.',
    category: 'core-intelligence',
    status: 'designed',
    publicBucket: 'architected_for_release',
    statusLabel: 'Architected',
    evidence: 'taxonomy_audit_2026_06_26',
    verifiedBy: 'Audit 2026-06-26 — relational_phase schema exists; behavioral signal retired (ADR-003)',
    earnedAt: '2026-06-26',
  },
  {
    title: 'AIN Relational Field Intelligence',
    description: 'The relational foundation being architected for future platform releases — a field-level awareness designed to hold turns, sessions, and emerging meaning in coherent relation, prior to any specific feature or response.',
    category: 'core-intelligence',
    status: 'research',
    publicBucket: 'research',
    statusLabel: 'Research',
    evidence: 'taxonomy_audit_2026_06_26',
    verifiedBy: 'Audit 2026-06-26 — Cat 1 (preserved direction); 0 live callers in any production route',
    earnedAt: '2026-06-26',
  },
  // — Relational Safety —
  {
    title: 'Relational Safeguards',
    description: 'Architectural gates protect consent, boundaries, privacy, and user sovereignty — especially in emotionally sensitive or developmentally important exchanges.',
    category: 'relational-safety',
    status: 'live',
    publicBucket: 'available_today',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace); client representation governance verified 2026-06-26',
    earnedAt: '2026-06-25',
  },
  {
    title: 'Sanctuary Mode',
    description: 'A protected conversational environment where nothing is retained — reducing extraction and preserving the psychological safety needed for deeper work.',
    category: 'relational-safety',
    status: 'live',
    publicBucket: 'available_today',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
  },
  // — Developmental Continuity —
  {
    title: 'Spiral State Persistence',
    description: 'MAIA tracks developmental movement across time, allowing the system to remember where a person is in process and respond with continuity rather than treating every exchange as isolated.',
    category: 'developmental-continuity',
    status: 'live',
    publicBucket: 'available_today',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
  },
  {
    title: 'Spiralogic Governor',
    description: 'A governing developmental framework that keeps MAIA oriented to process, pacing, and human complexity so responses remain coherent, grounded, and evolution-sensitive.',
    category: 'developmental-continuity',
    status: 'live',
    publicBucket: 'available_today',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
  },
  {
    title: 'MAIA Mentor',
    description: 'A guided developmental companion designed to walk members through the full arc of their work — idea, development, design, distribution — without becoming the author of it. Currently being integrated into the platform.',
    category: 'developmental-continuity',
    status: 'designed',
    publicBucket: 'architected_for_release',
    statusLabel: 'Architected',
    evidence: 'taxonomy_audit_2026_06_26',
    verifiedBy: 'Audit 2026-06-26 — no distinctly wired feature; architectural property of voice design',
    earnedAt: '2026-06-26',
  },
  // — Knowledge & Modality —
  {
    title: 'Knowledge Field',
    description: 'Knowledge appears contextually as the conversation enters it. MAIA draws on relevant domains, concepts, and connections when they become alive in the exchange — not on demand.',
    category: 'knowledge-modality',
    status: 'live',
    publicBucket: 'available_today',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
  },
  {
    title: 'Care Lens System',
    description: 'A lens-based framework allowing the same moment to be interpreted through different care orientations — therapeutic, developmental, symbolic, practical, or reflective. Built in the Studio layer; being extended across the platform.',
    category: 'knowledge-modality',
    status: 'built_not_wired',
    publicBucket: 'architected_for_release',
    statusLabel: 'Architected',
    evidence: 'taxonomy_audit_2026_06_26',
    verifiedBy: 'Audit 2026-06-26 — Studio review lenses built; broader conversational lens-switching not wired',
    earnedAt: '2026-06-26',
  },
  {
    title: 'Relational Context Bridge',
    description: 'Cross-session continuity that carries the lens, the thread, and the context of prior work forward — so members do not have to re-establish themselves to be understood. Substrate built; deployment in progress.',
    category: 'knowledge-modality',
    status: 'built_not_wired',
    publicBucket: 'architected_for_release',
    statusLabel: 'Architected',
    evidence: 'taxonomy_audit_2026_06_26',
    verifiedBy: 'Audit 2026-06-26 — conversational Phase 2 built on branch; not yet deployed to production',
    earnedAt: '2026-06-26',
  },
  // — Infrastructure —
  {
    title: 'Sovereign Infrastructure',
    description: 'Built on a sovereignty-first architecture for privacy, consent, and controlled data boundaries — self-hosted and private rather than extractive by design.',
    category: 'infrastructure',
    status: 'live',
    publicBucket: 'available_today',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
  },
  {
    title: 'White-Label Architecture',
    description: 'Designed to support practitioner and organizational deployments. The MAIA architecture is built to adapt for distinct brands, practice contexts, and professional environments without redesigning itself.',
    category: 'infrastructure',
    status: 'designed',
    publicBucket: 'architected_for_release',
    statusLabel: 'Architected',
    evidence: 'taxonomy_audit_2026_06_26',
    verifiedBy: 'Audit 2026-06-26 — architectural design; 0 third-party deployments; Larry = first constitutionally falsifiable test',
    earnedAt: '2026-06-26',
  },
  {
    title: 'Multi-Modal Voice',
    description: 'MAIA is designed for voice as well as text, supporting more natural conversational flow, emotional nuance, and accessible interaction across different user settings.',
    category: 'infrastructure',
    status: 'live',
    publicBucket: 'available_today',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
  },
];
