/**
 * CC-A — Per-turn memory provenance telemetry.
 *
 * PURPOSE
 *   Make observable, for a single served MAIA turn, which memory/context sources were
 *   consulted, which supplied material, which route requested them, and whether any
 *   fallback retrieval path was invoked.
 *
 * AUTHORITY (load-bearing — do not relax without a founder ruling)
 *   This module is OBSERVATIONAL ONLY. It must never:
 *     - write back into member memory
 *     - alter memory authority or retrieval behavior
 *     - become a retrieval source itself
 *     - be read as proof that retrieved material is true
 *   A trace establishes only that a turn's memory provenance was observable. It does not
 *   establish memory correctness, continuity correctness, containment, relational safety,
 *   or equivalence across MAIA surfaces.
 *
 * PRIVACY
 *   No member memory content, transcript content, relational inference, PHI, or prompt
 *   body may enter a record. Only identifiers, source classes, counts, booleans, versions
 *   and hashes. `digest()` exists so two contexts can be compared without either being read.
 *
 * NOT A STORE
 *   Emission is a structured log line under a discoverable marker, deliberately not a
 *   table. A durable provenance table would be a new memory-adjacent store and would
 *   require custody review it does not have.
 */

import { createHash } from 'crypto';

/** Bump when the record shape changes in a way a reader must notice. */
export const MEMORY_PROVENANCE_CONTRACT_VERSION = 'mpv-1';

/** Discoverable log marker. Grep this. */
export const MEMORY_PROVENANCE_MARKER = '[MAIA/memprov]';

/**
 * State of the canonical memory bundle as handed to the tier by the serving route.
 *
 * The absent/present-but-empty distinction is the point of this unit. `absent` means the
 * route never supplied a bundle — that is the condition under which a second retrieval
 * path can acquire authority. `present_empty` means the canonical path ran and legitimately
 * returned nothing. Today both collapse into one falsy check at the fork, so the two are
 * indistinguishable in the logs; they are radically different failures.
 */
export type MemoryBundleState =
  | 'absent'
  | 'present_empty'
  | 'present_nonempty'
  | 'suppressed_sanctuary';

/** Why a fallback retrieval path did or did not run. Descriptive, never prescriptive. */
export type FallbackReason =
  | 'not_attempted'
  | 'bundle_absent'
  | 'bundle_present_empty'
  | 'suppressed_sanctuary'
  | 'no_member_identity';

/** Outcome of consulting one memory source class. */
export interface MemorySourceOutcome {
  /** Stable class name, e.g. 'memory_bundle', 'memory_orchestrator_recall'. Never content. */
  sourceClass: string;
  /** Was this source asked for material on this turn? */
  requested: boolean;
  /** Did it return material that reached context assembly? */
  returnedMaterial: boolean;
  /** Count of items returned, where the source has a natural item count. */
  itemCount?: number;
  /** Set when the source was asked and failed. Error class only — never the message. */
  errorClass?: string;
}

export interface TurnMemoryProvenance {
  contractVersion: string;
  /** Serving route, e.g. 'api/sovereign/app/maia/list'. */
  route: string;
  /** Processing tier, where the fork lives. */
  tier: 'FAST' | 'CORE' | 'DEEP' | 'unknown';
  /** Opaque identities. Callers must pass prefixes or hashes, never raw member ids. */
  turnId?: string;
  sessionRef?: string;
  memberRef?: string;
  /** Build provenance — which code produced this trace. */
  buildSha: string;
  /** Was this turn under Sanctuary? Memory suppression is expected, not a defect. */
  sanctuary: boolean;
  /** Canonical bundle state as received from the route. */
  bundleState: MemoryBundleState;
  /**
   * Did this tier consult the canonical bundle at all? CORE and DEEP do not read
   * meta.memoryContext, so `false` here is a real architectural fact, not an error.
   */
  bundleConsulted: boolean;
  /** Did a fallback retrieval path run on this turn? */
  fallbackInvoked: boolean;
  fallbackReason: FallbackReason;
  /** Did the fallback specifically reach MemoryOrchestrator directly? */
  memoryOrchestratorDirect: boolean;
  /** Which source ultimately supplied the memory context used for assembly. */
  contextOrigin: 'canonical_bundle' | 'fallback' | 'none';
  sources: MemorySourceOutcome[];
  /** Hash of the assembled memory context. Comparison handle, never content. */
  contextDigest?: string;
  contextChars: number;
  /** Stable identifier for this provenance record. */
  provenanceId: string;
}

/** Truncated SHA-256. Used so contexts can be compared without being read. */
export function digest(value: string | undefined | null, length = 12): string | undefined {
  if (value === undefined || value === null) return undefined;
  return createHash('sha256').update(value).digest('hex').slice(0, length);
}

/**
 * Classify the canonical bundle as handed over by the route.
 *
 * Deliberately does NOT mirror the production fork's `!memoryContext` test: that test
 * cannot separate `undefined` from `''`, which is exactly the distinction being measured.
 * Whitespace-only counts as empty — a bundle of blank lines is not material.
 */
export function classifyBundleState(
  routeMemoryContext: string | undefined | null,
  opts: { sanctuary?: boolean } = {}
): MemoryBundleState {
  if (opts.sanctuary) return 'suppressed_sanctuary';
  if (routeMemoryContext === undefined || routeMemoryContext === null) return 'absent';
  return routeMemoryContext.trim().length === 0 ? 'present_empty' : 'present_nonempty';
}

/** Map a bundle state to the reason a fallback would be attributed. */
export function fallbackReasonFor(
  state: MemoryBundleState,
  opts: { hasMemberIdentity: boolean }
): FallbackReason {
  if (state === 'suppressed_sanctuary') return 'suppressed_sanctuary';
  if (!opts.hasMemberIdentity) return 'no_member_identity';
  if (state === 'absent') return 'bundle_absent';
  if (state === 'present_empty') return 'bundle_present_empty';
  return 'not_attempted';
}

function stableProvenanceId(record: Omit<TurnMemoryProvenance, 'provenanceId'>): string {
  const material = [
    record.contractVersion,
    record.route,
    record.tier,
    record.buildSha,
    record.turnId ?? '',
    record.bundleState,
    String(record.bundleConsulted),
    String(record.fallbackInvoked),
    record.fallbackReason,
    record.contextOrigin,
    record.contextDigest ?? '',
    record.sources.map((s) => `${s.sourceClass}:${s.requested ? 1 : 0}${s.returnedMaterial ? 1 : 0}`).join(','),
  ].join('|');
  return createHash('sha256').update(material).digest('hex').slice(0, 16);
}

export function buildTurnMemoryProvenance(
  input: Omit<TurnMemoryProvenance, 'contractVersion' | 'provenanceId' | 'buildSha'> & {
    buildSha?: string;
  }
): TurnMemoryProvenance {
  const withoutId = {
    ...input,
    contractVersion: MEMORY_PROVENANCE_CONTRACT_VERSION,
    buildSha: input.buildSha ?? process.env.GIT_COMMIT ?? 'unknown',
  };
  return { ...withoutId, provenanceId: stableProvenanceId(withoutId) };
}

/**
 * Emit one provenance record.
 *
 * Fire-and-forget and non-throwing by contract: telemetry must never be able to fail a
 * served turn. Returns the record so tests can assert on it without reading stdout.
 */
export function emitTurnMemoryProvenance(record: TurnMemoryProvenance): TurnMemoryProvenance {
  try {
    console.log(`${MEMORY_PROVENANCE_MARKER} ${JSON.stringify(record)}`);
  } catch {
    // Telemetry failure is never a turn failure.
  }
  return record;
}
