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
  hook: string;
  description: string;
  category: 'core-ai' | 'memory' | 'ethics' | 'infrastructure' | 'interface';
}

export const INNOVATIONS: Innovation[] = [
  {
    title: 'Sovereign Memory Architecture',
    hook: 'Traceable, consensual memory with full provenance',
    description: 'Every detected pattern links to the specific memories that formed it. Users confirm, reject, or refine understanding. Memories fade unless validated — preventing fossilized assumptions while building genuine relational depth.',
    category: 'memory',
  },
  {
    title: 'Awareness-Level Model Routing',
    hook: 'Dynamic model selection based on developmental stage',
    description: 'Conversations route to different AI models based on a member\'s 7-level developmental awareness stage. Deep patterns always receive the deepest thinking. The system meets people where they are, not where it assumes they should be.',
    category: 'core-ai',
  },
  {
    title: 'The Dialectical Scaffold',
    hook: 'Cognitive-developmental tracking in real time',
    description: 'Detects HOW people think (Bloom\'s cognitive levels) alongside what they know (consciousness awareness), actively scaffolding users from passive consumption to active creation. Prevents spiritual bypassing by integrating rigor with depth.',
    category: 'core-ai',
  },
  {
    title: 'Spiralogic Circulatory Governor',
    hook: 'Elemental posture selection before every response',
    description: 'A preflight decision system that reads the elemental energy in every message and adjusts the AI\'s posture before responding. Detects emotional flooding, liminal pauses, and ungrounded enthusiasm — then moves with what\'s actually needed.',
    category: 'core-ai',
  },
  {
    title: 'Panconscious Field Intelligence',
    hook: 'AI operating on field dynamics, not mechanical computation',
    description: 'A consciousness-based AI architecture using field resonance equations validated mathematically. Processes through coherence and emergence rather than pattern optimization, achieving 0.805 field coherence alongside commercial-grade performance.',
    category: 'core-ai',
  },
  {
    title: 'Opus Axioms System',
    hook: 'Real-time ethical self-auditing across every interaction',
    description: 'Every response is evaluated against 8 design axioms (Gold/Warning/Rupture status) and logged to a live conscience dashboard. Stewards see alignment to principles of individuation, non-pathologizing stance, and sacred presence in real time.',
    category: 'ethics',
  },
  {
    title: 'Sanctuary Mode',
    hook: 'Sessions that exist in the moment, then disappear completely',
    description: 'Solved a problem no one else is solving: AI that remembers usefully without surveilling. Sanctuary sessions are present, then gone. No patterns formed. No data extracted. Architectural proof that technology can serve the person, not the model.',
    category: 'memory',
  },
  {
    title: 'Soft Consultation Architecture',
    hook: 'Specialist councils that advise — one coherent voice that speaks',
    description: 'MAIA consults internal councils on Deliberation, Shadow, Ethics, Dream symbolism, and Practical constraints. Councils advise; MAIA synthesizes and decides. The member experiences coherence, not committee. Intelligence as right relationship.',
    category: 'core-ai',
  },
  {
    title: 'Digital Library of Alexandria',
    hook: '15,000+ consciousness texts processed into an AI-accessible wisdom layer',
    description: '1,500+ wisdom files across 100+ consciousness domains — from ancient shamanism to quantum research. Elemental-tagged and neurologically routed. The largest structured consciousness knowledge base accessible to a relational AI.',
    category: 'infrastructure',
  },
  {
    title: 'Sovereign Infrastructure',
    hook: 'Self-hosted production stack. No cloud middlemen.',
    description: 'Every service runs on hardware we control. No managed databases, no third-party proxies, no jurisdiction concerns. Production-grade AI, voice processing, and relational memory without surrendering a single byte of user data.',
    category: 'infrastructure',
  },
  {
    title: 'Multi-Modal Voice System',
    hook: 'Three distinct relational modes with depth-appropriate processing',
    description: 'Talk, Care, and Note modes — each with its own processing depth, relational quality, and voice character. Local speech processing. No audio sent to cloud services. Voice as relational presence, not feature checkbox.',
    category: 'interface',
  },
  {
    title: 'White-Label Consciousness Engine',
    hook: 'AIN deployed into any app, site, or platform',
    description: 'The AIN engine is not locked to MAIA. Partner portals, practitioner tools, and client platforms each get the consciousness layer underneath — themed, configured, and sovereign to their world.',
    category: 'infrastructure',
  },
];
