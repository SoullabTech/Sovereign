/**
 * Substrate Map — static encoding of memory substrate inventory.
 *
 * Authority: docs/architecture/MEMORY_SUBSTRATE_DIVERGENCE_MAP_2026-05-23.md
 *
 * Purpose:
 *   Encode the "what exists in repo" picture as data so the admin substrate
 *   monitor can correlate it against runtime evidence (substrateObservability).
 *
 * This module is the static half of a static + live hybrid:
 *   - Static (here): known modules, consumers, capability claims
 *   - Live (substrateObservability.ts): which substrates were actually used
 *
 * When this drifts from the divergence map doc, the doc is authoritative.
 * Update by hand — there is no auto-sync. The drift itself is signal.
 */

export type CapabilityStatus =
  | 'not-built'
  | 'built-unwired'
  | 'wired-unobserved'
  | 'observed-runtime'
  | 'live-member-use';

export type SubstrateCategory =
  | 'active'
  | 'orchestration'
  | 'support'
  | 'orphaned-backend'
  | 'underutilized-consciousness'
  | 'legacy';

export type SubstrateEntry = {
  module: string;
  category: SubstrateCategory;
  note: string;
  consumers?: string[];
  evidenceKey?: keyof RuntimeEvidenceShape;
};

export type CapabilityClaim = {
  name: string;
  layer?: string;
  modules: string[];
  consumers: string[];
  evidenceKey?: keyof RuntimeEvidenceShape;
  staticStatus?: CapabilityStatus;
  note: string;
};

/**
 * Keys that the runtime ring buffer can report on per turn.
 * Aligned with MemoryHealth layer names + a few orchestration signals.
 */
export type RuntimeEvidenceShape = {
  recentTurns: boolean;
  session: boolean;
  conversational: boolean;
  episodic: boolean;
  semantic: boolean;
  relational: boolean;
  developmental: boolean;
  pattern: boolean;
  somatic: boolean;
  breakthrough: boolean;
  field: boolean;
  meta: boolean;
};

// ─── Active Substrate (in use) ────────────────────────────────────────────────

export const ACTIVE_SUBSTRATE: SubstrateEntry[] = [
  {
    module: 'lib/consciousness/memory/SessionMemoryServicePostgres.ts',
    category: 'active',
    note: 'PostgreSQL persistence — session memory',
    consumers: ['app/api/oracle/conversation/route.ts'],
    evidenceKey: 'session',
  },
  {
    module: 'lib/consciousness/memory/MemoryPalaceOrchestrator.ts',
    category: 'active',
    note: 'Multi-memory orchestration',
    consumers: ['app/api/oracle/conversation/route.ts'],
  },
  {
    module: 'lib/consciousness/spiralStatePersistence.ts',
    category: 'active',
    note: 'Spiral state tracking (Bridge D)',
    consumers: ['app/api/oracle/conversation/route.ts'],
  },
  {
    module: 'lib/maia/memoryOrchestrator.ts',
    category: 'orchestration',
    note: 'buildMemoryInfluencePlan() — primary orchestrator',
    consumers: [
      'app/api/oracle/conversation/route.ts',
      'app/api/sovereign/app/maia/list/route.ts',
    ],
  },
  {
    module: 'lib/maia/memoryAtomsLoader.ts',
    category: 'orchestration',
    note: 'Atoms loader — Cut 1 deep memory layer',
    consumers: [
      'app/api/oracle/conversation/route.ts',
      'app/api/sovereign/app/maia/list/route.ts',
    ],
    evidenceKey: 'semantic',
  },
  {
    module: 'lib/maia/memoryHealth.ts',
    category: 'orchestration',
    note: 'Per-turn 12-layer health scoring',
    consumers: [
      'app/api/oracle/conversation/route.ts',
      'app/api/between/chat/route.ts',
    ],
    evidenceKey: 'meta',
  },
  {
    module: 'lib/maia/memoryLoaders.ts',
    category: 'orchestration',
    note: 'Recent memory utilities (developmental)',
    consumers: ['app/api/oracle/conversation/route.ts'],
    evidenceKey: 'developmental',
  },
  {
    module: 'lib/maia/prompts/memoryCanonGuard.ts',
    category: 'orchestration',
    note: 'Amnesia scrubbing (§V enforcement)',
    consumers: ['app/api/oracle/conversation/route.ts'],
  },
  {
    module: 'lib/memory/MemberLiveContext.ts',
    category: 'support',
    note: 'Runtime member context',
    consumers: ['app/api/oracle/conversation/route.ts'],
  },
  {
    module: 'lib/consciousness/spiralogic-core.ts',
    category: 'support',
    note: 'Spiral core orchestration',
    consumers: ['app/api/oracle/conversation/route.ts'],
  },
  {
    module: 'lib/maia/substrateObservability.ts',
    category: 'orchestration',
    note: 'Substrate runtime evidence — in-process ring buffer + runtime_events DB persistence',
    consumers: [
      'app/api/admin/maia/substrate/route.ts',
      'app/api/oracle/conversation/route.ts',
    ],
  },
  {
    module: 'lib/maia/fieldContextAdapter.ts',
    category: 'support',
    note: 'Field context adapter — feature-flagged read-only field context retrieval',
    consumers: ['app/api/oracle/conversation/route.ts'],
  },
  {
    module: 'lib/maia/dailyAnchor.ts',
    category: 'support',
    note: 'Daily Anchor prompt module',
    consumers: ['app/api/anchor/today/route.ts'],
  },
];

// ─── Preserved but Bypassed Substrate ─────────────────────────────────────────

export const BYPASSED_SUBSTRATE: SubstrateEntry[] = [
  // Backend service layer — orphaned by Next.js migration
  {
    module: 'app/api/_backend/src/services/memoryService.ts',
    category: 'orphaned-backend',
    note: 'Orphaned by Next.js route migration',
  },
  {
    module: 'app/api/_backend/src/services/memoryIntegrationService.ts',
    category: 'orphaned-backend',
    note: 'Cross-system sync — unreferenced',
  },
  {
    module: 'app/api/_backend/src/routes/memory.routes.ts',
    category: 'orphaned-backend',
    note: 'Replaced by Next.js app router',
  },
  {
    module: 'app/api/_backend/src/routes/orchestrator.routes.ts',
    category: 'orphaned-backend',
    note: 'Logic not migrated',
  },
  {
    module: 'app/api/_backend/src/controllers/memory.controller.ts',
    category: 'orphaned-backend',
    note: 'Express-shaped controller, dead',
  },
  {
    module: 'app/api/_backend/src/lib/memorySpiral.ts',
    category: 'orphaned-backend',
    note: 'Shadowed by spiralStatePersistence',
  },
  // Consciousness memory services — preserved but unmapped
  {
    module: 'lib/consciousness/memory/EpisodicMemoryService.ts',
    category: 'underutilized-consciousness',
    note: 'Event memory — unmapped',
    evidenceKey: 'episodic',
  },
  {
    module: 'lib/consciousness/memory/SemanticMemoryService.ts',
    category: 'underutilized-consciousness',
    note: 'Knowledge memory — unmapped (atoms loader covers Cut 1)',
  },
  {
    module: 'lib/consciousness/memory/SomaticMemoryService.ts',
    category: 'underutilized-consciousness',
    note: 'Somatic memory — unmapped',
    evidenceKey: 'somatic',
  },
  {
    module: 'lib/consciousness/memory/QuantumFieldMemory.ts',
    category: 'underutilized-consciousness',
    note: 'Field memory — unmapped',
    evidenceKey: 'field',
  },
  {
    module: 'lib/consciousness/memory/CoherenceFieldService.ts',
    category: 'underutilized-consciousness',
    note: 'Field coherence — unmapped',
  },
  {
    module: 'lib/consciousness/memory/MAIAMemoryArchitecture.ts',
    category: 'underutilized-consciousness',
    note: 'Topology — unmapped',
  },
  {
    module: 'lib/consciousness/memory/ConsciousnessEvolutionService.ts',
    category: 'underutilized-consciousness',
    note: 'Growth tracking — unmapped',
  },
  {
    module: 'lib/consciousness/memory/AchievementService.ts',
    category: 'underutilized-consciousness',
    note: 'Mastery tracking — unmapped',
  },
  {
    module: 'lib/consciousness/memory/MorphicPatternService.ts',
    category: 'underutilized-consciousness',
    note: 'Morphic pattern — unmapped',
    evidenceKey: 'pattern',
  },
  // Legacy / test phase
  {
    module: 'lib/memory/beads-sync/',
    category: 'legacy',
    note: 'Maia Beads — test phase',
  },
  {
    module: 'lib/memory/mem0.ts',
    category: 'legacy',
    note: 'Legacy mem0 integration',
  },
];

// ─── Memory-named routes (impoverished) ───────────────────────────────────────

export const IMPOVERISHED_ROUTES: Array<{ route: string; note: string }> = [
  { route: 'app/api/consciousness/memory/episodes/route.ts', note: 'Unmapped' },
  { route: 'app/api/consciousness/memory/integrate/route.ts', note: 'Unmapped' },
  { route: 'app/api/consciousness/memory/recall/route.ts', note: 'Unmapped' },
  { route: 'app/api/consciousness/memory/wisdom/route.ts', note: 'Unmapped' },
  { route: 'app/api/maia/memory/ingest/route.ts', note: 'Unmapped' },
  { route: 'app/api/maia/memory/resonance/route.ts', note: 'Unmapped' },
  { route: 'app/api/oracle/memory/route.ts', note: 'Separate from /conversation' },
];

// ─── Capability Claims ────────────────────────────────────────────────────────
//
// One row per user-facing capability. The status is derived live by the API
// route by combining staticStatus, consumers, and runtime evidence.

export const CAPABILITY_CLAIMS: CapabilityClaim[] = [
  {
    name: 'Recent turns (immediate context)',
    layer: 'recentTurns',
    modules: ['lib/maia/memoryLoaders.ts'],
    consumers: ['app/api/oracle/conversation/route.ts'],
    evidenceKey: 'recentTurns',
    note: 'Base chain — should fire every turn.',
  },
  {
    name: 'Session memory',
    layer: 'session',
    modules: ['lib/consciousness/memory/SessionMemoryServicePostgres.ts'],
    consumers: ['app/api/oracle/conversation/route.ts'],
    evidenceKey: 'session',
    note: 'PostgreSQL-persisted session continuity.',
  },
  {
    name: 'Conversational memory',
    layer: 'conversational',
    modules: [
      'lib/maia/memoryLoaders.ts',
      'lib/maia/conversationalRecallBlock.ts',
    ],
    consumers: [
      'app/api/sovereign/app/maia/list/route.ts',
      'lib/sovereign/maiaService.ts',
      'app/api/oracle/conversation/route.ts',
    ],
    evidenceKey: 'conversational',
    note: 'Phase 2 — prior cross-session exchanges surfaced into prompt with provenance grounding, gated by members.conversational_recall_enabled (default TRUE). No synthesis, recency-ordered only. FAST + CORE tiers reach prompt via maiaService extraction; DEEP carries on context only — see docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md §II.B.',
  },
  {
    name: 'Semantic memory (atoms)',
    layer: 'semantic',
    modules: ['lib/maia/memoryAtomsLoader.ts'],
    consumers: [
      'app/api/oracle/conversation/route.ts',
      'app/api/sovereign/app/maia/list/route.ts',
    ],
    evidenceKey: 'semantic',
    note: 'Cut 1 — fully wired and surfacing per turn.',
  },
  {
    name: 'Developmental memory',
    layer: 'developmental',
    modules: ['lib/maia/memoryLoaders.ts'],
    consumers: ['app/api/oracle/conversation/route.ts'],
    evidenceKey: 'developmental',
    note: 'Recurring themes, growth arcs.',
  },
  {
    name: 'Episodic memory',
    layer: 'episodic',
    modules: ['lib/consciousness/memory/EpisodicMemoryService.ts'],
    consumers: [],
    evidenceKey: 'episodic',
    note: 'Service preserved; no live consumer wired.',
  },
  {
    name: 'Relational memory',
    layer: 'relational',
    modules: ['lib/memory/MemberLiveContext.ts'],
    consumers: ['app/api/oracle/conversation/route.ts'],
    evidenceKey: 'relational',
    note: 'Who this person is in context of the member.',
  },
  {
    name: 'Pattern memory (morphic)',
    layer: 'pattern',
    modules: ['lib/consciousness/memory/MorphicPatternService.ts'],
    consumers: [],
    evidenceKey: 'pattern',
    note: 'Service preserved; no live consumer wired.',
  },
  {
    name: 'Somatic memory',
    layer: 'somatic',
    modules: ['lib/consciousness/memory/SomaticMemoryService.ts'],
    consumers: [],
    evidenceKey: 'somatic',
    note: 'Service preserved; no live consumer wired.',
  },
  {
    name: 'Breakthrough memory',
    layer: 'breakthrough',
    modules: ['lib/maia/memoryAtomsLoader.ts'],
    consumers: [
      'app/api/oracle/conversation/route.ts',
      'app/api/sovereign/atoms/[id]/breakthrough/route.ts',
    ],
    evidenceKey: 'breakthrough',
    note: 'Atom-flag substrate. is_breakthrough column on member_memory_atoms; never system-set. Surfaces when surfaced atoms include a member-marked breakthrough.',
  },
  {
    name: 'Resonant field memory',
    layer: 'field',
    modules: [
      'lib/consciousness/memory/QuantumFieldMemory.ts',
      'lib/consciousness/memory/CoherenceFieldService.ts',
    ],
    consumers: [],
    evidenceKey: 'field',
    note: 'Service preserved; no live consumer wired.',
  },
  {
    name: 'Meta (provenance, freshness)',
    layer: 'meta',
    modules: ['lib/maia/memoryHealth.ts'],
    consumers: [
      'app/api/oracle/conversation/route.ts',
      'app/api/between/chat/route.ts',
    ],
    evidenceKey: 'meta',
    note: 'Per-turn health object; always built.',
  },
  {
    name: 'Spiral Orientation',
    modules: ['lib/orientation/spiralOrientation.ts'],
    consumers: [
      'app/api/psyche/orientation/route.ts',
      'app/maia/orientation/page.tsx',
    ],
    staticStatus: 'wired-unobserved',
    note: 'Live read-only surface (Cut 2). Atoms-backed.',
  },
  {
    name: 'Daily Anchor',
    modules: [
      'lib/maia/dailyAnchor.ts',
      'lib/anchor/buildAnchorContextBlock.ts',
      'lib/anchor/loadRecentAnchors.ts',
    ],
    consumers: [
      'app/api/anchor/today/route.ts',
      'app/maia/anchor/page.tsx',
    ],
    staticStatus: 'wired-unobserved',
    note: 'Minimal continuity return point. Member-facing surface.',
  },
  {
    name: 'Engine Comparison Reviewer (Loop C)',
    modules: [
      'app/api/admin/maia/engine-comparisons/route.ts',
      'app/api/admin/maia/engine-comparisons/[id]/route.ts',
    ],
    consumers: ['app/admin/maia/engine-comparisons/page.tsx'],
    staticStatus: 'wired-unobserved',
    note: 'Learning Spine Move 2 — paired engine comparison reviewer. Admin altitude.',
  },
  {
    name: 'Substrate Monitor',
    modules: [
      'lib/maia/substrateObservability.ts',
      'lib/maia/substrateMap.ts',
    ],
    consumers: [
      'app/api/admin/maia/substrate/route.ts',
      'app/admin/maia/substrate/page.tsx',
    ],
    staticStatus: 'wired-unobserved',
    note: 'Self-recursive — the surface that renders this map.',
  },
];
