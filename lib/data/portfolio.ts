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

export type InnovationStatus = 'live' | 'built_not_wired' | 'prompt_shaped' | 'vision';
export type InnovationVisibility = 'homepage' | 'research' | 'internal';

export interface Innovation {
  title: string;
  description: string;
  category: 'core-intelligence' | 'relational-safety' | 'developmental-continuity' | 'knowledge-modality' | 'infrastructure';
  /**
   * Governance metadata (maturity) — from the runtime/wiring audit 2026-06-25.
   * Encoded as DATA, never in headings/prose, so the rendering layer decides what to surface.
   * Separation of governance from presentation: the truth lives here; visibility is a display choice.
   *   live            — wired; executes in the live request path
   *   built_not_wired — module exists, 0 importers on the live path (NOT the same as vision)
   *   prompt_shaped   — a system-prompt posture, not a distinct mechanism
   *   vision          — not yet built
   */
  status?: InnovationStatus;
  /** Pointer to the evidence justifying `status` (audit reference / kind). */
  evidence?: string;
  /**
   * Provenance — which audit/method earned this status. Makes status an EARNED property:
   * "why is this Live?" is answered here, not by re-auditing. To change a status, cite new evidence.
   */
  verifiedBy?: string;
  /** When the status was earned (ISO date). Status is earned, not declared. */
  earnedAt?: string;
  /**
   * Which surfaces may display this item — a presentation decision, not the truth:
   *   homepage — eligible for homepage (which shows only `live`) and research
   *   research — research page only, grouped under a maturity heading
   *   internal — governance metadata only; not shown as a public card
   * Not all statuses are exposed publicly; most visitors only care what they can use today.
   */
  publicVisibility?: InnovationVisibility;
}

// Maturity status per item is governance metadata from the taxonomy audit
// (docs/pitch/INNOVATIONS_TAXONOMY_AUDIT_2026-06-25.md). It is intentionally NOT
// yet consumed by the renderer — presentation changes are held for a single review.
export const INNOVATIONS: Innovation[] = [
  // — Core Intelligence —
  {
    title: 'Awareness-Level Routing',
    description: 'MAIA adapts its responses to the depth, complexity, and developmental level of the moment, meeting people where they are without flattening nuance or overreaching.',
    category: 'core-intelligence',
    status: 'live',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
    publicVisibility: 'homepage',
  },
  {
    title: 'Dialectical Scaffold',
    description: 'Rather than forcing premature certainty, MAIA can hold tension between perspectives and help insight emerge through structured contrast, paradox, and integrative reasoning.',
    category: 'core-intelligence',
    status: 'prompt_shaped',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
    publicVisibility: 'internal',
  },
  {
    title: '4-Phase Relational Sequencing',
    description: 'Conversations unfold through a relational sequence that helps MAIA recognize what kind of response is needed next — attunement, clarification, reflection, or forward movement.',
    category: 'core-intelligence',
    status: 'built_not_wired',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
    publicVisibility: 'research',
  },
  {
    title: 'AIN Relational Field Intelligence',
    description: 'The intelligence beneath relating — a field-level awareness that holds turns, sessions, and emerging spaces in coherent relation, prior to any specific feature or response. The condition that makes everything else possible.',
    category: 'core-intelligence',
    status: 'built_not_wired',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
    publicVisibility: 'research',
  },
  // — Relational Safety —
  {
    title: 'Relational Safeguards',
    description: 'MAIA is governed by explicit relational safeguards that protect consent, boundaries, privacy, and user sovereignty, especially in emotionally sensitive or developmentally important exchanges.',
    category: 'relational-safety',
    status: 'live',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
    publicVisibility: 'homepage',
  },
  {
    title: 'Sanctuary Mode',
    description: 'Sanctuary Mode creates a more protected conversational environment, reducing extraction and preserving the sense of privacy, trust, and psychological safety needed for deeper work.',
    category: 'relational-safety',
    status: 'live',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
    publicVisibility: 'homepage',
  },
  // — Developmental Continuity —
  {
    title: 'Spiral State Persistence',
    description: 'MAIA tracks developmental movement across time, allowing the system to remember where a person is in process and respond with continuity rather than treating every exchange as isolated.',
    category: 'developmental-continuity',
    status: 'live',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
    publicVisibility: 'homepage',
  },
  {
    title: 'Spiralogic Governor',
    description: 'A governing developmental framework helps MAIA stay oriented to process, pacing, and human complexity so responses remain coherent, grounded, and evolution-sensitive.',
    category: 'developmental-continuity',
    status: 'live',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
    publicVisibility: 'homepage',
  },
  {
    title: 'MAIA Mentor',
    description: 'MAIA walks members through the full arc of their work — idea, development, design, distribution — without becoming the author of it. Continuous mentorship across stages, not a one-shot assistant.',
    category: 'developmental-continuity',
    // live but partial scope: dev→distribution reflection wired; idea-generation not yet in scope
    status: 'live',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
    publicVisibility: 'homepage',
  },
  // — Knowledge & Modality —
  {
    title: 'Knowledge Field',
    description: 'Knowledge appears contextually as the conversation enters it. Rather than dumping information, MAIA surfaces the right domains, concepts, and cross-disciplinary bridges when they become relevant.',
    category: 'knowledge-modality',
    status: 'live',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
    publicVisibility: 'homepage',
  },
  {
    title: 'Care Lens System',
    description: 'MAIA can interpret the same moment through different care lenses — therapeutic, developmental, symbolic, practical, or spiritual — so the response matches the real need of the exchange.',
    category: 'knowledge-modality',
    // code present (CARE_MODE_CONTRACTS) but route.ts: careLensActive: false until wired
    status: 'built_not_wired',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
    publicVisibility: 'research',
  },
  {
    title: 'Relational Context Bridge',
    description: 'The lens you brought in the morning is still present in the evening. MAIA stabilizes a way of seeing across turns and across surfaces, so members don’t have to re-explain themselves to be understood.',
    category: 'knowledge-modality',
    // continuity core is live (overlaps Spiral State Persistence); "across surfaces" to verify
    status: 'live',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
    publicVisibility: 'homepage',
  },
  // — Infrastructure —
  {
    title: 'Sovereign Infrastructure',
    description: 'Built on a sovereignty-first architecture, MAIA is designed for privacy, consent, and controlled data boundaries rather than extractive engagement models.',
    category: 'infrastructure',
    status: 'live',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
    publicVisibility: 'homepage',
  },
  {
    title: 'White-Label Engine',
    description: 'The MAIA engine can be adapted for practitioners, organizations, and specialized environments, making it possible to deploy the architecture within distinct brands and relational contexts.',
    category: 'infrastructure',
    // absent in code: no multi-tenant / per-practitioner deployment path (design-only)
    status: 'vision',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
    publicVisibility: 'research',
  },
  {
    title: 'Multi-Modal Voice',
    description: 'MAIA is designed for voice as well as text, supporting more natural conversational flow, emotional nuance, and accessible interaction across different user settings.',
    category: 'infrastructure',
    status: 'live',
    evidence: 'taxonomy_audit_2026_06_25',
    verifiedBy: 'Audit 2026-06-25 (runtime + wiring trace)',
    earnedAt: '2026-06-25',
    publicVisibility: 'homepage',
  },
];
