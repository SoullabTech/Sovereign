/**
 * Nathan Platform Data
 *
 * The living state of the Soullab platform — builds, roadmap, decisions.
 * Updated as features ship and priorities shift.
 * This is what Nathan sees in his Operator dashboard.
 */

export type BuildStatus = 'live' | 'in-progress' | 'planned' | 'blocked';

export type PlatformBuild = {
  id: string;
  name: string;
  description: string;
  status: BuildStatus;
  category: 'core' | 'consciousness' | 'practitioner' | 'infrastructure' | 'mobile';
  shippedAt?: string;   // ISO date if live
  startedAt?: string;   // ISO date if in-progress
};

export type RoadmapItem = {
  id: string;
  name: string;
  description: string;
  why: string;           // why this matters
  status: BuildStatus;
  horizon: 'now' | 'next' | 'later';
  category: string;
};

export type OpenDecision = {
  id: string;
  question: string;
  context: string;
  constraint: string;    // what cannot change
  options: string[];
  blocking?: string;     // what this blocks
};

export type Innovation = {
  id: string;
  name: string;
  description: string;
  significance: string;  // why this is architecturally significant
  shippedAt: string;
};

// ============================================================================
// CURRENT BUILDS (what has shipped and what is live)
// ============================================================================

export const PLATFORM_BUILDS: PlatformBuild[] = [
  {
    id: 'sovereign-core',
    name: 'Sovereign AI Core',
    description:
      'Self-hosted Claude (Anthropic) integration with local Ollama fallback. No cloud lock-in. Data never leaves the stack.',
    status: 'live',
    category: 'core',
    shippedAt: '2025-12',
  },
  {
    id: 'spiralogic-engine',
    name: 'Spiralogic Consciousness Engine',
    description:
      'Elemental mapping layer (fire/water/earth/air/aether) with phase tracking, hysteresis, and 4-phase conversational sequencing. Moves users through mirror → bridge → next step → pause.',
    status: 'live',
    category: 'consciousness',
    shippedAt: '2026-01',
  },
  {
    id: 'sanctuary-mode',
    name: 'Sanctuary Mode',
    description:
      'Sessions that never enter memory. No content stored, no patterns formed. The architectural proof that the system serves the person, not the data model.',
    status: 'live',
    category: 'core',
    shippedAt: '2026-01',
  },
  {
    id: 'member-system',
    name: 'Members System',
    description:
      'Cross-device member recognition via PostgreSQL. Passkey + username/password auth. Onboarding flow, progress tracking, passkey recovery via email.',
    status: 'live',
    category: 'core',
    shippedAt: '2026-01',
  },
  {
    id: 'spiral-persistence',
    name: 'Spiral State Persistence',
    description:
      'Prevents MAIA from treating returning members like new people. Dominant element, phase, and relational maturity stage persist across sessions and server restarts.',
    status: 'live',
    category: 'consciousness',
    shippedAt: '2026-02',
  },
  {
    id: 'care-lenses',
    name: 'Therapeutic Framework Lenses',
    description:
      'Dynamic injection of therapeutic orientations into oracle responses. IFS, somatic, Jungian, and others as rendering filters on elemental streams — not identity swaps.',
    status: 'live',
    category: 'consciousness',
    shippedAt: '2026-03',
  },
  {
    id: 'practitioner-fields',
    name: 'Masters Fields',
    description:
      'Sovereign practice portals for master practitioners. Each field has its own subdomain, visual identity, MAIA persona, and portal structure. Live: Jondi Whitis, Kelly Nezat, Nathan.',
    status: 'live',
    category: 'practitioner',
    shippedAt: '2026-03',
  },
  {
    id: 'wisdom-fields',
    name: 'Wisdom Commons (Fields)',
    description:
      'Collective intelligence layer. Authenticated users join fields, thread reflections, and share insights. Currently in review for production deployment.',
    status: 'in-progress',
    category: 'core',
    startedAt: '2026-03',
  },
  {
    id: 'participatory-reality',
    name: 'Participatory Reality Framework',
    description:
      'Six-theme reflective layer: Field Awareness, Pattern Recurrence, Embodied Coherence, Adaptive Unfolding, Wise Acceptance, Ripeness. Themes detected in conversation language and stored as signals.',
    status: 'live',
    category: 'consciousness',
    shippedAt: '2026-03',
  },
  {
    id: 'canon-compliance',
    name: 'Canon Compliance Evaluator',
    description:
      'Heuristic telemetry layer that flags PERSUASION_DRIFT, AUTHORITY_CREEP, and CERTAINTY_MANUFACTURE in oracle responses. Observational only — no model feedback yet.',
    status: 'live',
    category: 'consciousness',
    shippedAt: '2026-03',
  },
  {
    id: 'ios-app',
    name: 'iOS App (Capacitor)',
    description:
      'Native iOS shell via Capacitor. Handles cookie limitations (x-member-id header pattern), static export pipeline, and WebView session management.',
    status: 'live',
    category: 'mobile',
    shippedAt: '2026-02',
  },
  {
    id: 'docker-caddy',
    name: 'Docker + Caddy Production Stack',
    description:
      'Self-hosted on Mac Studio. Docker Compose orchestrates 7 services. Caddy handles TLS and subdomain routing. No third party between users and their data.',
    status: 'live',
    category: 'infrastructure',
    shippedAt: '2025-12',
  },
];

// ============================================================================
// ROADMAP (what is coming)
// ============================================================================

export const ROADMAP: RoadmapItem[] = [
  {
    id: 'virtual-self-training',
    name: 'Virtual Self Training (Stellium)',
    description:
      'Practitioners train their own MAIA persona through guided interview and essence capture. The trained Virtual Self becomes the primary oracle for their field — not the static system prompt.',
    why: 'Moves from static configuration to living practitioner presence. Enables genuine scaling of practitioner wisdom.',
    status: 'planned',
    horizon: 'next',
    category: 'practitioner',
  },
  {
    id: 'group-coherence',
    name: 'Group State Synchronization',
    description:
      'Real-time state tracking for group sessions. MAIA distinguishes individual from collective signal. Consent and Sanctuary mode enforceable per-individual within a shared field.',
    why: 'The platform works well one-to-one. Groups are the frontier — and where the hardest architectural problems live.',
    status: 'planned',
    horizon: 'next',
    category: 'consciousness',
  },
  {
    id: 'enterprise-isolation',
    name: 'Enterprise Multi-Tenant Architecture',
    description:
      'Data residency, tenant isolation, and audit trails for regulated enterprise environments. Path from single-tenant Mac Studio to multi-tenant deployment without breaking sovereignty guarantees.',
    why: 'The enterprise pathway — healthcare, education, organizational development — requires this before any serious pilot.',
    status: 'planned',
    horizon: 'later',
    category: 'infrastructure',
  },
  {
    id: 'instrumentation-layer',
    name: 'Instrumentation Without Surveillance',
    description:
      'Telemetry architecture that gives operators and practitioners what they need without creating behavioral profiles. Every instrumentation decision is also a surveillance decision — design them together.',
    why: 'Operators need to know if the system is working. The current state is either over-instrumented (raw logs) or under-instrumented (no visibility into what matters).',
    status: 'planned',
    horizon: 'next',
    category: 'infrastructure',
  },
  {
    id: 'session-booking',
    name: 'Session Booking + Calendar',
    description:
      'Practitioners can receive bookings via their field. Calendar integration, session prep companion, between-session check-ins.',
    why: 'The practitioner fields are presence portals but have no transaction layer. This is where revenue flows.',
    status: 'planned',
    horizon: 'next',
    category: 'practitioner',
  },
  {
    id: 'mentor-stance-ui',
    name: 'Practitioner Supervisory Stance (UI)',
    description:
      'Activates MAIA\'s mentor stance from the client side. Supervisory mode: MAIA offers at least two viable options, never a single prescribed path. Prevents authority creep.',
    why: 'The server-side implementation is complete (PR #158). The UI activation path is the missing piece.',
    status: 'in-progress',
    horizon: 'now',
    category: 'consciousness',
  },
];

// ============================================================================
// OPEN DECISIONS (where a systems thinker can apply leverage)
// ============================================================================

export const OPEN_DECISIONS: OpenDecision[] = [
  {
    id: 'multitenancy-strategy',
    question: 'What is the right multi-tenant isolation strategy for enterprise deployment?',
    context:
      'The current stack is single-tenant on a Mac Studio. Enterprise pilots require data residency guarantees. Three patterns are on the table: sidecar isolation (separate containers per tenant), schema-per-tenant in the same PostgreSQL instance, or database-per-tenant.',
    constraint: 'No managed databases. No cloud lock-in. Sovereignty guarantees must hold at the architectural level, not just by policy.',
    options: [
      'Sidecar containers: cleanest isolation, highest operational complexity',
      'Schema-per-tenant: simpler operations, isolation depends on PostgreSQL row-level security',
      'Database-per-tenant: strongest isolation, requires separate connection pools per tenant',
    ],
    blocking: 'Any enterprise pilot conversation',
  },
  {
    id: 'group-state-model',
    question: 'What is the right state model for group-aware AI companionship?',
    context:
      'Wisdom Fields supports threaded discussion but has no real-time group state. MAIA cannot currently distinguish individual from collective signal in a group session. The architecture needs a way to track emergent group coherence without a central authority.',
    constraint: 'Consent-first. Sanctuary mode must remain enforceable per-individual even within a shared group field. No central authority holds the definitive group state.',
    options: [
      'Event-sourced group state: each participant emits events, aggregate computed on read',
      'Coordinator pattern: ephemeral session coordinator holds transient state, no persistence',
      'Vector consensus: each participant\'s elemental signal contributes to a collective vector, no single arbiter',
    ],
    blocking: 'Group session features, real-time collective intelligence layer',
  },
  {
    id: 'instrumentation-boundary',
    question: 'Where exactly is the boundary between useful telemetry and surveillance?',
    context:
      'The canon compliance evaluator logs flags per oracle turn. Theme signals track language patterns. The Spiralogic layer tracks element and phase. At what point does this cross from "understanding the system" to "profiling the user"?',
    constraint: 'Sanctuary sessions: zero content logging, always. Non-sanctuary: the boundary is less clear. Need a principled line, not just a case-by-case judgment.',
    options: [
      'Structural only: log system state (element, phase, mode) but never language content',
      'Aggregate only: log distributions and counts but never per-turn data',
      'Consent-tiered: default to structural-only, explicit consent to unlock richer signals',
    ],
    blocking: 'Instrumentation layer design, practitioner visibility features',
  },
];

// ============================================================================
// RECENT INNOVATIONS (architecturally significant shipped features)
// ============================================================================

export const RECENT_INNOVATIONS: Innovation[] = [
  {
    id: '4-phase-sequencing',
    name: '4-Phase Conversational Sequencing',
    description:
      'Conversation pipeline that moves through mirror → bridge → next_step → pause phases. Prevents MAIA from staying in reflection indefinitely and pushes toward integration.',
    significance:
      'Moved next_step phase from 1% of turns to 30.7%. This is not a cosmetic change — it is the difference between a reflection tool and a coherence engine.',
    shippedAt: '2026-03',
  },
  {
    id: 'fire-and-forget-writes',
    name: 'Fire-and-Forget Write Pattern',
    description:
      'All state persistence (spiral state, theme signals, canon flags) is async and non-blocking. The oracle never waits for a write to complete.',
    significance:
      'Eliminates a class of latency bugs where persistence operations were blocking the conversation pipeline. Pattern is now used consistently across 4+ subsystems.',
    shippedAt: '2026-02',
  },
  {
    id: 'participatory-markers',
    name: 'Participatory Language Markers',
    description:
      '60+ natural-language variants across 6 themes, detected in real-time conversation to surface participatory reality signals without requiring users to explicitly label their experience.',
    significance:
      'First step toward a meaning layer that sits above the conversational surface. The system can now detect what frame a person is operating in without asking them directly.',
    shippedAt: '2026-03',
  },
  {
    id: 'subdomain-field-routing',
    name: 'Subdomain Field Routing',
    description:
      'Middleware-level routing that maps practitioner subdomains (jondi.soullab.life, kelly.soullab.life, nathan.soullab.life) to their respective field contexts without exposing the routing mechanism.',
    significance:
      'Each field is architecturally sovereign — it feels like a standalone environment even though it runs on shared infrastructure. This is the right abstraction for the practitioner model.',
    shippedAt: '2026-03',
  },
];
