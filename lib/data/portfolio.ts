export interface PortfolioProject {
  name: string;
  slug: string;
  domain: string;
  description: string;
  status: 'live' | 'development' | 'idea';
  accent: string;
  tags: string[];
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
  },
  {
    name: 'Rudeboy Baking Co.',
    slug: 'rudeboy',
    domain: 'https://rudeboy.soullab.life',
    description: 'Artisan bakery with kitchen operations console and ordering system.',
    status: 'live',
    accent: '#FF8C42',
    tags: ['Astro', 'Operations', 'Food'],
  },
  {
    name: 'JL Master Handyman',
    slug: 'jeremy',
    domain: 'https://jeremy.soullab.life',
    description: 'Professional handyman services. Clean, trust-building web presence.',
    status: 'live',
    accent: '#4A7BA7',
    tags: ['Astro', 'Services', 'Local'],
  },
  {
    name: 'Loralee Starweaver',
    slug: 'loralee',
    domain: 'https://loralee.soullab.life',
    description: 'Stellium astrology portal with voice sessions, journaling, and practitioner tools.',
    status: 'live',
    accent: '#6A4C93',
    tags: ['Portal', 'Voice', 'Astrology'],
  },
  {
    name: 'Elemental Alchemy',
    slug: 'elemental-alchemy',
    domain: 'https://elementalalchemy.soullab.life',
    description: 'Interactive audiobook experience with elemental navigation and immersive design.',
    status: 'live',
    accent: '#6A4C93',
    tags: ['Audiobook', 'Interactive', 'Education'],
  },
  {
    name: 'White-Label Demo',
    slug: 'demo',
    domain: 'https://demo.soullab.life',
    description: 'Demonstration of the Soullab platform capabilities for potential partners.',
    status: 'live',
    accent: '#14b8a6',
    tags: ['Demo', 'Platform', 'White-Label'],
  },
];

export interface UpcomingProject {
  name: string;
  description: string;
  status: 'in-progress' | 'coming-soon' | 'idea';
}

export const UPCOMING_PROJECTS: UpcomingProject[] = [
  {
    name: 'MAIA iOS App',
    description: 'Native iOS companion via TestFlight. Voice-first, sovereignty-intact.',
    status: 'in-progress',
  },
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

export interface Innovation {
  title: string;
  description: string;
  category: 'core-intelligence' | 'relational-safety' | 'developmental-continuity' | 'knowledge-modality' | 'infrastructure';
}

export const INNOVATIONS: Innovation[] = [
  // — Core Intelligence —
  {
    title: 'Awareness-Level Routing',
    description: 'MAIA adapts its responses to the depth, complexity, and developmental level of the moment, meeting people where they are without flattening nuance or overreaching.',
    category: 'core-intelligence',
  },
  {
    title: 'Dialectical Scaffold',
    description: 'Rather than forcing premature certainty, MAIA can hold tension between perspectives and help insight emerge through structured contrast, paradox, and integrative reasoning.',
    category: 'core-intelligence',
  },
  {
    title: '4-Phase Relational Sequencing',
    description: 'Conversations unfold through a relational sequence that helps MAIA recognize what kind of response is needed next — attunement, clarification, reflection, or forward movement.',
    category: 'core-intelligence',
  },
  // — Relational Safety —
  {
    title: 'Relational Safeguards',
    description: 'MAIA is governed by explicit relational safeguards that protect consent, boundaries, privacy, and user sovereignty, especially in emotionally sensitive or developmentally important exchanges.',
    category: 'relational-safety',
  },
  {
    title: 'Sanctuary Mode',
    description: 'Sanctuary Mode creates a more protected conversational environment, reducing extraction and preserving the sense of privacy, trust, and psychological safety needed for deeper work.',
    category: 'relational-safety',
  },
  // — Developmental Continuity —
  {
    title: 'Spiral State Persistence',
    description: 'MAIA tracks developmental movement across time, allowing the system to remember where a person is in process and respond with continuity rather than treating every exchange as isolated.',
    category: 'developmental-continuity',
  },
  {
    title: 'Spiralogic Governor',
    description: 'A governing developmental framework helps MAIA stay oriented to process, pacing, and human complexity so responses remain coherent, grounded, and evolution-sensitive.',
    category: 'developmental-continuity',
  },
  // — Knowledge & Modality —
  {
    title: 'Knowledge Field',
    description: 'Knowledge appears contextually as the conversation enters it. Rather than dumping information, MAIA surfaces the right domains, concepts, and cross-disciplinary bridges when they become relevant.',
    category: 'knowledge-modality',
  },
  {
    title: 'Care Lens System',
    description: 'MAIA can interpret the same moment through different care lenses — therapeutic, developmental, symbolic, practical, or spiritual — so the response matches the real need of the exchange.',
    category: 'knowledge-modality',
  },
  // — Infrastructure —
  {
    title: 'Sovereign Infrastructure',
    description: 'Built on a sovereignty-first architecture, MAIA is designed for privacy, consent, and controlled data boundaries rather than extractive engagement models.',
    category: 'infrastructure',
  },
  {
    title: 'White-Label Engine',
    description: 'The MAIA engine can be adapted for practitioners, organizations, and specialized environments, making it possible to deploy the architecture within distinct brands and relational contexts.',
    category: 'infrastructure',
  },
  {
    title: 'Multi-Modal Voice',
    description: 'MAIA is designed for voice as well as text, supporting more natural conversational flow, emotional nuance, and accessible interaction across different user settings.',
    category: 'infrastructure',
  },
];
