/**
 * Memory Health — canon §VII 12-layer health object.
 *
 * Authority: docs/canon/MAIA_MEMORY_CANON_v1.0.md §VII (Required Health Contract)
 * Implementation spec: docs/specs/CUT_1_SUBSTRATE_RESTORATION.md §II.C
 *
 * Purpose:
 *   Track which memory layers loaded successfully, which returned empty, and which
 *   errored, on every turn. Surface this object in telemetry and use it to condition
 *   the §VI fallback language in the prompt.
 *
 * Canon §VII rules implemented here:
 *   1. No silent errors — every layer reports ok / empty / error explicitly.
 *   2. Prompt conditioning — the route handler uses memoryHealth to decide when to
 *      amplify the §VI fallback block (when base chain has >1 error).
 *   3. Operator visibility — summarizeMemoryHealthForLog produces a compact payload
 *      for log lines; ops dashboard wiring is a separate concern.
 *   4. Base chain enforcement — isBaseChainDegraded() exposes the canon's specific
 *      degradation predicate.
 *
 * What this module does NOT do:
 *   - Does NOT load any memory layer. The route handler builds the health object
 *     based on what its own loaders returned.
 *   - Does NOT decide what to do about degradation. It exposes the signal; the
 *     handler decides (e.g., amplify §VI, log warning, page on-call).
 *   - Does NOT persist health. Per-turn observability only; no DB writes.
 *
 * Forward compatibility:
 *   Cut 1 wires only a subset of the 12 layers. Unwired layers report 'empty' until
 *   subsequent cuts populate them. The full shape is built now so telemetry is
 *   stable across cuts.
 */

// ════════════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════════════

export type LayerStatus = 'ok' | 'empty' | 'error';
export type ContinuityConfidence = 'high' | 'medium' | 'low';

/**
 * The canonical 12-layer health object from MAIA_MEMORY_CANON_v1.0.md §VII.
 *
 * Layer meanings (per Canon §II — The Continuity Stack):
 *   1. recentTurns — immediate conversation context (current exchange)
 *   2. session — current thread / session continuity
 *   3. conversational — prior related exchanges across sessions
 *   4. episodic — meaningful events, moments, client stories, named scenes
 *   5. semantic — enduring facts, roles, relationships, preferences
 *   6. relational — who this person is in context of the member
 *   7. developmental — ongoing themes, stages, recurring lessons, growth arcs
 *   8. pattern — repeated motifs, archetypes, dynamics
 *   9. somatic — embodied and emotional signatures over time
 *  10. breakthrough — pivotal shifts, realizations, threshold crossings
 *  11. field — wider symbolic and collective patterns
 *  12. meta — confidence, source, freshness, consent status, provenance
 *
 * continuityConfidence — derived from the base chain status (see deriveConfidence below)
 */
export interface MemoryHealth {
  recentTurns: LayerStatus;
  session: LayerStatus;
  conversational: LayerStatus;
  episodic: LayerStatus;
  semantic: LayerStatus;
  relational: LayerStatus;
  developmental: LayerStatus;
  pattern: LayerStatus;
  somatic: LayerStatus;
  breakthrough: LayerStatus;
  field: LayerStatus;
  meta: LayerStatus;
  continuityConfidence: ContinuityConfidence;
}

/**
 * Per-layer inputs that build the health object. Each is the result of the route
 * handler's loader for that layer.
 *
 * Conventions:
 *   - undefined or null inputs are treated as 'empty' (loader didn't run, or layer
 *     not wired in this cut)
 *   - a thrown loader error should be caught by the route handler and passed as
 *     the 'error' marker; loaders themselves should not throw
 *   - non-empty arrays / non-null objects → 'ok'
 *   - empty arrays / empty objects → 'empty'
 *
 * Forward-compatible: only the fields wired in the current cut need to be populated.
 * Unwired fields default to 'empty'.
 */
export interface MemoryHealthInputs {
  // Wired by Cut 1
  recentTurns?: { count: number; error?: boolean };
  session?: { present: boolean; error?: boolean };
  conversational?: { count: number; error?: boolean };
  developmental?: { count: number; error?: boolean };
  // Fed by the atoms loader ROW COUNT — no semantic retrieval exists on this
  // path. Telemetry emits this as `atoms:` + `semantic_retrieval: false`
  // (truth repair 2026-08-04); the field keeps its canon §VII layer name
  // pending a canon amendment.
  semantic?: { count: number; error?: boolean };
  relational?: { present: boolean; error?: boolean };
  pattern?: { count: number; error?: boolean }; // theme_signals feeds this

  // Not yet wired in Cut 1 — will report 'empty' until subsequent cuts populate
  episodic?: { count: number; error?: boolean };
  somatic?: { count: number; error?: boolean };
  breakthrough?: { count: number; error?: boolean };
  field?: { present: boolean; error?: boolean };
  meta?: { present: boolean; error?: boolean };
}

// ════════════════════════════════════════════════════════════════════════════
// Builder
// ════════════════════════════════════════════════════════════════════════════

function layerStatus(input?: {
  count?: number;
  present?: boolean;
  error?: boolean;
}): LayerStatus {
  if (!input) return 'empty';
  if (input.error) return 'error';
  if (typeof input.count === 'number') {
    return input.count > 0 ? 'ok' : 'empty';
  }
  if (typeof input.present === 'boolean') {
    return input.present ? 'ok' : 'empty';
  }
  return 'empty';
}

/**
 * The non-negotiable base chain per Canon §VII.4:
 *   recent + episodic + semantic + relational + developmental
 *
 * If >1 of these are in 'error' state for an authenticated member, the response
 * must use the degraded-continuity fallback language from §VI (not the amnesia
 * language from §V — which is forbidden absolutely).
 */
const BASE_CHAIN: Array<keyof MemoryHealth> = [
  'recentTurns',
  'episodic',
  'semantic',
  'relational',
  'developmental',
];

/**
 * Derive overall continuity confidence from the base chain.
 *
 * - high: all base-chain layers ok
 * - medium: at most 1 base-chain layer is empty or errored
 * - low: 2+ base-chain layers empty or errored, OR any base-chain error
 */
function deriveConfidence(h: Omit<MemoryHealth, 'continuityConfidence'>): ContinuityConfidence {
  let degradedCount = 0;
  let hasError = false;
  for (const layer of BASE_CHAIN) {
    const status = h[layer];
    if (status === 'error') {
      hasError = true;
      degradedCount += 1;
    } else if (status === 'empty') {
      degradedCount += 1;
    }
  }
  if (hasError && degradedCount >= 2) return 'low';
  if (degradedCount === 0) return 'high';
  if (degradedCount === 1) return 'medium';
  return 'low';
}

/**
 * Build the 12-layer health object from the route handler's loader results.
 */
export function buildMemoryHealth(inputs: MemoryHealthInputs): MemoryHealth {
  const base: Omit<MemoryHealth, 'continuityConfidence'> = {
    recentTurns: layerStatus(inputs.recentTurns),
    session: layerStatus(inputs.session),
    conversational: layerStatus(inputs.conversational),
    episodic: layerStatus(inputs.episodic),
    semantic: layerStatus(inputs.semantic),
    relational: layerStatus(inputs.relational),
    developmental: layerStatus(inputs.developmental),
    pattern: layerStatus(inputs.pattern),
    somatic: layerStatus(inputs.somatic),
    breakthrough: layerStatus(inputs.breakthrough),
    field: layerStatus(inputs.field),
    meta: layerStatus(inputs.meta),
  };

  return {
    ...base,
    continuityConfidence: deriveConfidence(base),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// Canon §VII.4 predicates
// ════════════════════════════════════════════════════════════════════════════

/**
 * Canon §VII.4 — base chain degradation predicate.
 *
 * If the base chain has more than one layer in 'error' state for an authenticated
 * member, the response must amplify the §VI fallback block in the prompt.
 *
 * The handler uses this to decide whether to inject extra §VI emphasis.
 */
export function isBaseChainDegraded(h: MemoryHealth): boolean {
  let errorCount = 0;
  for (const layer of BASE_CHAIN) {
    if (h[layer] === 'error') errorCount += 1;
  }
  return errorCount > 1;
}

/**
 * Does ANY layer have loaded context? Used by the §V scrubber to decide
 * which replacement phrase to use (with-context vs without-context).
 */
export function hasAnyLoadedContext(h: MemoryHealth): boolean {
  const layers: Array<keyof MemoryHealth> = [
    'recentTurns',
    'session',
    'conversational',
    'episodic',
    'semantic',
    'relational',
    'developmental',
    'pattern',
  ];
  return layers.some((l) => h[l] === 'ok');
}

// ════════════════════════════════════════════════════════════════════════════
// Telemetry
// ════════════════════════════════════════════════════════════════════════════

/**
 * Compact log payload — designed to fit on one log line in production.
 * Includes confidence + per-layer status; suitable for grep-based dashboards.
 */
export function summarizeMemoryHealthForLog(h: MemoryHealth): Record<string, unknown> {
  return {
    conf: h.continuityConfidence,
    rt: h.recentTurns,
    sess: h.session,
    conv: h.conversational,
    ep: h.episodic,
    // Truth repair (Sprint 1, 2026-08-04): this layer is fed by the member-kept
    // atoms loader ROW COUNT. No semantic retrieval exists on this path — the
    // old `sem:` key let a row count masquerade as semantic capability (see
    // docs/ops/MAIA_MEMORY_INTEGRITY_GAP_MAP_2026-08-04.md §III). The canonical
    // layer NAME (MemoryHealth.semantic, canon §VII / runtime_events.memory_layers)
    // is unchanged pending a canon amendment; the log now says what is measured.
    // Principle: never give a capability a name before the capability exists.
    atoms: h.semantic,
    semantic_retrieval: false,
    rel: h.relational,
    dev: h.developmental,
    pat: h.pattern,
    som: h.somatic,
    br: h.breakthrough,
    field: h.field,
    meta: h.meta,
    base_degraded: isBaseChainDegraded(h),
  };
}
