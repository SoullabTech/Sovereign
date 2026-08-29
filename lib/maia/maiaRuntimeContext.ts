/**
 * MAIA Runtime Context — required contract for all getMaiaResponse() callers.
 *
 * Every route calling getMaiaResponse() must pass through this wrapper before
 * the call. It:
 *   1. Validates routeId against the canonical registry (warns on unknown)
 *   2. Inspects provider configuration from environment
 *   3. Emits the canonical 8-field per-turn observability log
 *   4. Returns a MaiaRuntimeContext describing everything that was assembled
 *
 * This wrapper does NOT:
 *   - Block requests on unknown routeId (warn + passthrough until CI guard step)
 *   - Make network calls to verify provider health (that is assertProviderAvailable() — step 5)
 *   - Modify the meta passed to getMaiaResponse() — the caller does that
 *   - Write to any database
 *
 * Sequence position: step 3 of de-frag sequence.
 * assertProviderAvailable() hard guard is step 5 (deferred).
 * CI guard that promotes unknown-routeId warnings to errors is step 6 (deferred).
 *
 * See: docs/architecture/MAIA_ROUTE_AUTHORITY_MAP.md
 * See: memory/project_recurrence_prevention_architecture.md
 */

import type { MemoryHealth } from './memoryHealth';
import { randomUUID } from 'crypto';
import { recordRuntimeTurn } from './substrateObservability';

// ─── Route Registry ──────────────────────────────────────────────────────────

/**
 * Canonical registry of known routeIds.
 * Adding a routeId here is a deliberate act — it signals that the route has
 * been reviewed against the authority map and is known to the de-frag thread.
 *
 * The CI guard (step 6) will use this registry to error on routes classified
 * canonical-live or live-secondary that are not in this list.
 *
 * Variants documented here carry awareness even before they are live callers.
 */
/**
 * REGISTRY CONVENTION — read before adding an entry:
 *
 * Adding a routeId here is a deliberate architectural act. It must not be done
 * to silence a warning. Each entry requires:
 *   - status: from the authority map (MAIA_ROUTE_AUTHORITY_MAP.md)
 *   - reason: one sentence — why this route qualifies for registry membership
 *   - registeredAt: ISO date when the entry was added
 *   - registeredBy: which thread or session added it (de-frag / orientation / etc.)
 *
 * If you are adding an entry to make a console.warn go away, that is the
 * wrong action. The correct action is to either:
 *   (a) classify the route in the authority map and verify it meets the bar, or
 *   (b) fix the route so it passes the canonical routeId from the existing registry.
 *
 * The CI guard (step 7) will enforce: any route classified canonical-live or
 * live-secondary in the authority map that is NOT in this registry will fail CI.
 * Registry additions are the answer to that failure — not workarounds.
 */
export const MAIA_ROUTE_REGISTRY: Readonly<Record<string, RouteRegistryEntry>> = {
  // ── Registered 2026-05-23 | de-frag thread ──────────────────────────────
  // Status: canonical-live (authority map Tier 1)
  // Reason: sole production chat ingress; all continuity wiring (Cut 1) lives here;
  //         confirmed by frontend traffic audit — every production surface routes here.
  'sovereign/app/maia/list': {
    status: 'canonical-live',
    description: 'Primary sovereign chat ingress — all production surfaces',
    callsMaiaResponse: true,
    memoryHealthExpected: true,
    atomsExpected: true,
  },

  // ── Registered 2026-05-23 | de-frag thread ──────────────────────────────
  // Status: live-secondary (authority map Tier 2)
  // Reason: named variant for observability completeness; uses maiaOrchestrator
  //         not getMaiaResponse(), so it is not a live caller of this wrapper.
  //         Registered so the CI guard has an explicit record of its non-caller status.
  'between/chat': {
    status: 'live-secondary',
    description: 'Embedded oracle widget + dev chat-test (uses maiaOrchestrator, not getMaiaResponse)',
    callsMaiaResponse: false,
    memoryHealthExpected: true,
    atomsExpected: true,
  },

  // ── Registered 2026-05-23 | de-frag thread ──────────────────────────────
  // Status: dormant (authority map Tier 4 — reclassified from live-secondary)
  // Reason: route DOES call getMaiaResponse() in its code (lines 278, 410) and
  //         must be in the registry for the CI guard to pass. Registered as dormant
  //         because 48h traffic audit (2026-05-23) confirmed zero production hits;
  //         all traffic routes to sovereign/app/maia/list instead.
  //         callsMaiaResponse: true because the code calls it — even though no
  //         live traffic reaches those calls. Keeps the guard honest about what
  //         is in the codebase, not just what is reachable.
  'sovereign/app/maia': {
    status: 'dormant',
    description: 'Dormant predecessor to /list — superseded 2026-05-23; code still calls getMaiaResponse()',
    callsMaiaResponse: true,
    memoryHealthExpected: false,
    atomsExpected: false,
  },
} as const;

type RouteRegistryEntry = {
  status: 'canonical-live' | 'live-secondary' | 'dormant' | 'reference';
  description: string;
  callsMaiaResponse: boolean;
  memoryHealthExpected: boolean;
  atomsExpected: boolean;
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type ProviderConfig = {
  /** Which provider is currently configured */
  provider: 'anthropic' | 'local' | 'unknown';
  /** Primary model name from env (may be undefined if unconfigured) */
  model: string | undefined;
  /** Whether the provider appears to be configured (env vars present) */
  configured: boolean;
  /** Whether this turn will use the fallback provider */
  fallbackActive: boolean;
};

export type PromptBlockSummary = {
  /** Total approximate character count across all addenda */
  chars: number;
  /** Which addenda are present */
  layers: {
    memoryInfluence: boolean;
    forwardReadiness: boolean;
    atoms: boolean;
    /**
     * Relational Context Bridge — the member-handed-off relationship block
     * (explicit act: "Take this to MAIA" on /relationships/[id]). Never ambient.
     */
    relationalContext: boolean;
    memberWeb: boolean;
    astrology: boolean;
    studio: boolean;
    knowledgeGate: boolean;
    wuxing: boolean;
    /** Phase 2 conversational recall block (cross-session continuity, system-retrieved). */
    conversational: boolean;
    /** Phase 2 episodic recall block (member-marked significant moments). */
    episodic: boolean;
  };
};

export type MemberContextSummary = {
  userId: string | null;
  sessionId: string;
  isSanctuary: boolean;
  allowCrossSessionMemory: boolean;
};

export type MaiaRuntimeContext = {
  /** The route that built this context. Free string — checked against registry. */
  routeId: string;
  /** Whether routeId is in the canonical registry */
  routeKnown: boolean;
  /** Registry entry if known */
  registryEntry: RouteRegistryEntry | null;
  /** Member and session identity */
  member: MemberContextSummary;
  /** Provider configuration (env-derived, no network check) */
  provider: ProviderConfig;
  /**
   * Identity for this turn's runtime_events row, minted here at context-build
   * time. The row is inserted BEFORE generation (this builder is an observer,
   * not an orchestrator), so the constitutional verdict — which only exists
   * after generation — is attached later by recordConstitutionalVerdict()
   * addressing this id. Without it the verdict and the substrate provenance
   * could not be joined onto one turn-level evidence record.
   */
  turnId: string;
  /** Summary of assembled prompt context blocks */
  promptBlock: PromptBlockSummary;
  /** Memory health as built by buildMemoryHealth() */
  memoryHealth: MemoryHealth;
  /** ISO timestamp when context was built */
  builtAt: string;
};

// ─── Inputs ──────────────────────────────────────────────────────────────────

export type MaiaRuntimeContextInputs = {
  routeId: string;
  member: MemberContextSummary;
  memoryHealth: MemoryHealth;
  /** Assembled addenda strings — pass undefined if not loaded */
  addenda: {
    memoryInfluence?: string;
    forwardReadiness?: string;
    atoms?: string;
    /**
     * Relational Context Bridge — the member-handed-off relationship block
     * (explicit act: "Take this to MAIA" on /relationships/[id]). Never ambient.
     * Emission detail lives in the [MAIA/sovereign] relational-context log line,
     * which also carries the relationshipId; only presence + size are inventoried here.
     */
    relationalContext?: string;
    memberWeb?: string;
    astrology?: string;
    studio?: string;
    knowledgeGate?: string;
    wuxing?: string;
    /** Phase 2 conversational recall block (cross-session continuity, system-retrieved). */
    conversational?: string;
    /** Phase 2 episodic recall block (member-marked significant moments). */
    episodic?: string;
  };
};

// ─── Main Function ────────────────────────────────────────────────────────────

/**
 * Build the MAIA runtime context and emit the canonical per-turn observability log.
 *
 * Non-blocking: unknown routeId = logged warning, not thrown error.
 * Provider health: env-derived only (no network calls at this step).
 *
 * Call this after memoryHealth is built, before getMaiaResponse().
 */
export function buildMaiaRuntimeContext(
  inputs: MaiaRuntimeContextInputs,
): MaiaRuntimeContext {
  const { routeId, member, memoryHealth, addenda } = inputs;

  // ── Registry check ────────────────────────────────────────────────────────
  const registryEntry = MAIA_ROUTE_REGISTRY[routeId] ?? null;
  const routeKnown = registryEntry !== null;

  // ── Provider config ───────────────────────────────────────────────────────
  const provider = resolveProviderConfig();

  // ── Prompt block summary ──────────────────────────────────────────────────
  const promptBlock = summarizePromptBlock(addenda);

  // ── Assemble context ──────────────────────────────────────────────────────
  const context: MaiaRuntimeContext = {
    routeId,
    routeKnown,
    registryEntry,
    member,
    provider,
    turnId: randomUUID(),
    promptBlock,
    memoryHealth,
    builtAt: new Date().toISOString(),
  };

  // ── Emit canonical 8-field observability log ──────────────────────────────
  emitObservabilityLog(context);

  // ── Push onto in-process ring buffer for admin substrate monitor ─────────
  // Fire-and-forget: recordRuntimeTurn never throws. See substrateObservability.ts.
  recordRuntimeTurn(context);

  return context;
}

// ─── Provider Resolution ──────────────────────────────────────────────────────

function resolveProviderConfig(): ProviderConfig {
  const textProvider = process.env.MAIA_TEXT_PROVIDER ?? 'anthropic';
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const ollamaUrl = process.env.OLLAMA_BASE_URL;
  const ollamaModel = process.env.OLLAMA_MODEL;

  if (textProvider === 'local') {
    return {
      provider: 'local',
      model: ollamaModel,
      configured: !!(ollamaUrl && ollamaModel),
      fallbackActive: false,
    };
  }

  if (textProvider === 'anthropic' || !textProvider) {
    const configured = !!anthropicKey;
    // Fallback active: anthropic configured as primary but Ollama also present
    // (this means the system may fall through to Ollama on failure)
    const fallbackActive = configured && !!(ollamaUrl && ollamaModel);
    return {
      provider: 'anthropic',
      model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5',
      configured,
      fallbackActive,
    };
  }

  return {
    provider: 'unknown',
    model: undefined,
    configured: false,
    fallbackActive: false,
  };
}

// ─── Prompt Block Summary ─────────────────────────────────────────────────────

function summarizePromptBlock(
  addenda: MaiaRuntimeContextInputs['addenda'],
): PromptBlockSummary {
  const chars =
    (addenda.memoryInfluence?.length ?? 0) +
    (addenda.forwardReadiness?.length ?? 0) +
    (addenda.atoms?.length ?? 0) +
    (addenda.relationalContext?.length ?? 0) +
    (addenda.memberWeb?.length ?? 0) +
    (addenda.astrology?.length ?? 0) +
    (addenda.studio?.length ?? 0) +
    (addenda.knowledgeGate?.length ?? 0) +
    (addenda.wuxing?.length ?? 0) +
    (addenda.conversational?.length ?? 0) +
    (addenda.episodic?.length ?? 0);

  return {
    chars,
    layers: {
      memoryInfluence: !!addenda.memoryInfluence,
      forwardReadiness: !!addenda.forwardReadiness,
      atoms: !!addenda.atoms,
      relationalContext: !!addenda.relationalContext,
      memberWeb: !!addenda.memberWeb,
      astrology: !!addenda.astrology,
      studio: !!addenda.studio,
      knowledgeGate: !!addenda.knowledgeGate,
      wuxing: !!addenda.wuxing,
      conversational: !!addenda.conversational,
      episodic: !!addenda.episodic,
    },
  };
}

// ─── Observability Log ────────────────────────────────────────────────────────

/**
 * Canonical 8-field per-turn observability log.
 * Format defined in the recurrence-prevention architecture (8-point system, §8).
 *
 * MAIA_ROUTE=   — which route served this turn
 * MEMORY_HEALTH= — continuity confidence + degraded layers
 * PROVIDER=     — which provider is configured
 * MODEL=        — model name
 * PROMPT_BLOCK_CHARS= — total addenda character count
 * FALLBACK=     — whether fallback is active
 * ROUTE_KNOWN=  — whether routeId is in the canonical registry
 * SANCTUARY=    — whether this is a sanctuary (non-retained) turn
 */
function emitObservabilityLog(ctx: MaiaRuntimeContext): void {
  const { routeId, routeKnown, member, provider, promptBlock, memoryHealth } = ctx;

  const routeLabel = routeKnown ? routeId : `${routeId}|UNREGISTERED`;

  // Unknown routeId = warning. All other fields = info.
  const logFn = routeKnown ? console.log : console.warn;

  if (!routeKnown) {
    console.warn(
      `[MAIA/runtime] Unknown routeId — not in canonical registry. ` +
      `Add "${routeId}" to MAIA_ROUTE_REGISTRY in lib/maia/maiaRuntimeContext.ts ` +
      `after reviewing docs/architecture/MAIA_ROUTE_AUTHORITY_MAP.md.`
    );
  }

  logFn('[MAIA/runtime]', {
    MAIA_ROUTE: routeLabel,
    MEMORY_HEALTH: (memoryHealth as any).continuityConfidence ?? 'unknown',
    PROVIDER: provider.provider,
    MODEL: provider.model ?? 'unset',
    PROMPT_BLOCK_CHARS: promptBlock.chars,
    FALLBACK: provider.fallbackActive,
    ROUTE_KNOWN: routeKnown,
    SANCTUARY: member.isSanctuary,
  });
}

// ─── Format for Response ──────────────────────────────────────────────────────

/**
 * Compact version of the runtime context for inclusion in API responseData.
 * Strips the full memoryHealth object (already included separately) to avoid
 * duplication in the response payload.
 */
export function formatRuntimeContextForResponse(ctx: MaiaRuntimeContext): object {
  return {
    routeId: ctx.routeId,
    routeKnown: ctx.routeKnown,
    provider: ctx.provider.provider,
    model: ctx.provider.model,
    providerConfigured: ctx.provider.configured,
    fallbackActive: ctx.provider.fallbackActive,
    promptBlockChars: ctx.promptBlock.chars,
    promptLayers: ctx.promptBlock.layers,
    // ── Recognition signal (2026-08-24, iOS memory-context divergence) ──────
    // Whether THIS request resolved to a verified member, and whether that made
    // it eligible for cross-session memory. Booleans only — never the member
    // UUID, never content (client-exposed UUIDs are what made the bare
    // `x-member-id` claim impersonable in the first place).
    //
    // Why it is in the response and not only in the server log: when identity
    // fails to resolve, this route does not error — it answers normally as an
    // anonymous caller. That degradation was previously invisible to the
    // client, so a device could present a recognized member while conversing
    // as a stranger, and the only witness was an ssh session into production.
    // A member (or a tester) can now tell "MAIA has nothing to recall" apart
    // from "MAIA was never told who I am" from the device itself.
    memberRecognized: ctx.member.userId !== null,
    crossSessionMemory: ctx.member.allowCrossSessionMemory,
    sanctuary: ctx.member.isSanctuary,
    builtAt: ctx.builtAt,
  };
}
