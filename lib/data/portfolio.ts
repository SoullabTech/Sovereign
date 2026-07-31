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
    name: "Author's Studio",
    slug: 'authors-studio',
    domain: 'https://soullab.life/press/manuscript',
    description:
      'Where a life becomes a book. Bring a manuscript in, keep the passages that matter, gather collections, and leave with a publication-quality PDF or EPUB that is unmistakably the author’s own. Authorship never moves.',
    status: 'beta',
    accent: '#C9A227',
    tags: ['Soullab Press', 'Authorship', 'Manuscripts'],
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

// Public honesty ledger buckets (Live / Designed / Research claim discipline).
// Assignments are governed by docs/canon/MARKETING_CLAIM_DISCIPLINE.md —
// a capability is 'available_today' only with production runtime evidence.
export type PublicBucket = 'available_today' | 'architected_for_release' | 'research';

export interface Innovation {
  title: string;
  description: string;
  category: 'core-intelligence' | 'relational-safety' | 'developmental-continuity' | 'knowledge-modality' | 'infrastructure';
  publicBucket: PublicBucket;
  statusLabel?: string;
}

export const INNOVATIONS: Innovation[] = [
  // — Core Intelligence —
  {
    title: 'Awareness-Level Routing',
    description: 'MAIA adapts its responses to the depth, complexity, and developmental level of the moment, meeting people where they are without flattening nuance or overreaching.',
    category: 'core-intelligence',
    publicBucket: 'available_today',
  },
  {
    title: 'Dialectical Scaffold',
    description: 'Rather than forcing premature certainty, MAIA can hold tension between perspectives and help insight emerge through structured contrast, paradox, and integrative reasoning.',
    category: 'core-intelligence',
    publicBucket: 'architected_for_release',
  },
  {
    title: '4-Phase Relational Sequencing',
    description: 'Conversations unfold through a relational sequence that helps MAIA recognize what kind of response is needed next — attunement, clarification, reflection, or forward movement.',
    category: 'core-intelligence',
    publicBucket: 'architected_for_release',
  },
  {
    title: 'AIN Relational Field Intelligence',
    description: 'The intelligence beneath relating — a field-level awareness that holds turns, sessions, and emerging spaces in coherent relation, prior to any specific feature or response. The condition that makes everything else possible.',
    category: 'core-intelligence',
    publicBucket: 'research',
  },
  // — Relational Safety —
  {
    title: 'Relational Safeguards',
    description: 'MAIA is governed by explicit relational safeguards that protect consent, boundaries, privacy, and user sovereignty, especially in emotionally sensitive or developmentally important exchanges.',
    category: 'relational-safety',
    publicBucket: 'available_today',
  },
  {
    title: 'Sanctuary Mode',
    description: 'Sanctuary Mode creates a more protected conversational environment, reducing extraction and preserving the sense of privacy, trust, and psychological safety needed for deeper work.',
    category: 'relational-safety',
    publicBucket: 'available_today',
  },
  // — Developmental Continuity —
  {
    title: 'Spiral State Persistence',
    description: 'MAIA tracks developmental movement across time, allowing the system to remember where a person is in process and respond with continuity rather than treating every exchange as isolated.',
    category: 'developmental-continuity',
    publicBucket: 'available_today',
  },
  {
    title: 'Spiralogic Governor',
    description: 'A governing developmental framework helps MAIA stay oriented to process, pacing, and human complexity so responses remain coherent, grounded, and evolution-sensitive.',
    category: 'developmental-continuity',
    publicBucket: 'available_today',
  },
  {
    title: 'MAIA Mentor',
    description: 'MAIA walks members through the full arc of their work — idea, development, design, distribution — without becoming the author of it. Continuous mentorship across stages, not a one-shot assistant.',
    category: 'developmental-continuity',
    publicBucket: 'architected_for_release',
  },
  // — Knowledge & Modality —
  {
    title: 'Knowledge Field',
    description: 'Knowledge appears contextually as the conversation enters it. Rather than dumping information, MAIA surfaces the right domains, concepts, and cross-disciplinary bridges when they become relevant.',
    category: 'knowledge-modality',
    publicBucket: 'architected_for_release',
  },
  {
    title: 'Care Lens System',
    description: 'MAIA can interpret the same moment through different care lenses — therapeutic, developmental, symbolic, practical, or spiritual — so the response matches the real need of the exchange.',
    category: 'knowledge-modality',
    publicBucket: 'architected_for_release',
  },
  {
    title: 'Relational Context Bridge',
    description: 'The lens you brought in the morning is still present in the evening. MAIA stabilizes a way of seeing across turns and across surfaces, so members don’t have to re-explain themselves to be understood.',
    category: 'knowledge-modality',
    publicBucket: 'architected_for_release',
  },
  // — Infrastructure —
  {
    title: 'Sovereign Infrastructure',
    description: 'Built on a sovereignty-first architecture, MAIA is designed for privacy, consent, and controlled data boundaries rather than extractive engagement models.',
    category: 'infrastructure',
    publicBucket: 'available_today',
  },
  {
    title: 'White-Label Engine',
    description: 'The MAIA engine can be adapted for practitioners, organizations, and specialized environments, making it possible to deploy the architecture within distinct brands and relational contexts.',
    category: 'infrastructure',
    publicBucket: 'architected_for_release',
  },
  {
    title: 'Multi-Modal Voice',
    description: 'MAIA is designed for voice as well as text, supporting more natural conversational flow, emotional nuance, and accessible interaction across different user settings.',
    category: 'infrastructure',
    publicBucket: 'available_today',
  },
];
