/**
 * The bounded shadow witness — CMT-01, Step 3b.
 *
 * Authority: docs/architecture/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md §4.1
 *
 * ── OFF BY DEFAULT. TEMPORARY. NON-AUTHORITATIVE. ───────────────────────────
 *
 *     CMT shadow OFF by default
 *             ↓
 *     explicit bounded witness mode      (CMT_SHADOW_WITNESS=1 on minisforum)
 *             ↓
 *     controlled /list turns
 *             ↓
 *     paired legacy + canonical assembly
 *             ↓
 *     manifest / digest comparison, logged
 *             ↓
 *     shadow OFF again
 *
 * No percentage rollout. No permanent second architecture. This helper is
 * deleted at the migration point the spec names (§11, after step 5).
 *
 * ── WHAT IT MAY NOT DO ──────────────────────────────────────────────────────
 *
 * It runs AFTER the response has been produced and is never awaited on the
 * response path, so member-visible latency is unchanged. It never throws
 * outward. It writes nothing. It reads member state only through providers
 * proven read-only for this operation (see `SHADOW_PROVIDER_SIDE_EFFECTS`).
 *
 * ── THE SIDE-EFFECT CONSTRAINT ──────────────────────────────────────────────
 *
 * The empirical witness must not change the member's record simply because we
 * measured it. Every provider profile A invokes was audited from source:
 *
 *   atoms          lib/maia/memoryAtomsLoader.ts       0 INSERT/UPDATE/DELETE
 *   conversation   lib/maia/memoryLoaders.ts           0
 *   episodes       lib/maia/memoryLoaders.ts           0
 *   developmental  lib/maia/memoryLoaders.ts           0
 *   themes         lib/maia/memoryLoaders.ts           0
 *   member_web     lib/memory/MemberLiveContext.ts     0
 *   relationship   loadRelationshipMemory: no save call in its body (the module's
 *                  three INSERTs live in saveConversationTheme / saveBreakthroughMoment /
 *                  saveRelationshipPattern, which it does not call)
 *   session_recall MemoryOrchestrator.getSessionRecallContext: RelationshipContextStore.get
 *                  (SELECT), TurnsStore.getRecentTurns, BreakthroughStore reads — the
 *                  module's writes are in TurnsStore.add… / upsert, not on this path
 *
 * The declaration below is what the certification suite checks against; a
 * provider declared `writes` here is never invoked by the shadow.
 */

import { constructCanonicalTurn } from './constructCanonicalTurn';
import { digestFromCanonicalTurn, compareDigests, type ShadowComparison } from './shadowCompare';
import { legacyDigestFromListAssembly, type LegacyListAssembly } from './legacyDigest';
import type { TurnFrame, ProviderId } from './providers';
import { LEGACY_PROFILE_A } from './profiles';

export const SHADOW_WITNESS_ENV = 'CMT_SHADOW_WITNESS';
export const SHADOW_WITNESS_LOG = '[CMT-01] shadow-witness';

/** Source-audited for THIS operation. `writes` providers are never shadow-invoked. */
export const SHADOW_PROVIDER_SIDE_EFFECTS: Readonly<Record<ProviderId, 'read_only' | 'writes'>> = {
  atoms: 'read_only',
  conversation: 'read_only',
  episodes: 'read_only',
  developmental: 'read_only',
  themes: 'read_only',
  member_web: 'read_only',
  relationship: 'read_only',
  session_recall: 'read_only',
  // Not on profile A. Declared so a future profile change cannot invoke them in
  // shadow without the declaration being revisited:
  relationship_essence: 'read_only',
  anchors: 'read_only',
  significant_moments: 'read_only',
  selflet: 'writes',        // SelfletChain.buildContext may surface/deliver messages — not audited; treated as writing
  memory_bundle: 'writes',  // records conversation_memory_uses (retrieval audit trail)
  ain_knowledge: 'read_only',
};

export function shadowWitnessEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env[SHADOW_WITNESS_ENV] === '1';
}

/** Providers the shadow would invoke under profile A that are not proven read-only. Must be empty. */
export function shadowWriteRisk(): ProviderId[] {
  return (Object.keys(LEGACY_PROFILE_A.providers) as ProviderId[]).filter(
    (id) => SHADOW_PROVIDER_SIDE_EFFECTS[id] !== 'read_only',
  );
}

export interface ShadowWitnessInput {
  frame: TurnFrame;
  legacy: LegacyListAssembly;
}

export interface ShadowWitnessRecord {
  marker: typeof SHADOW_WITNESS_LOG;
  memberIdPrefix: string;
  sessionIdPrefix: string;
  profile: string;
  zeroDiff: boolean;
  unexpected: ShadowComparison['unexpected'];
  expected: ShadowComparison['expected'];
  fieldDigests: ShadowComparison['fieldDigests'];
  floorDigests: ShadowComparison['floorDigests'];
  unobservable: ProviderId[];
  providersInvoked: ProviderId[];
  providerErrors: Partial<Record<ProviderId, string>>;
  durationMs: number;
}

/**
 * Run the paired construction and comparison. Never throws; returns null when
 * disabled or on internal failure (which is logged, because a witness that
 * fails silently is not a witness).
 */
export async function runShadowWitness(
  input: ShadowWitnessInput,
  rawLog: (line: string, data: unknown) => void = (l, d) => console.log(l, d),
  env: NodeJS.ProcessEnv = process.env,
): Promise<ShadowWitnessRecord | null> {
  if (!shadowWitnessEnabled(env)) return null;
  // Even the logger may not become a path back to the member: a sink that
  // throws (closed stdout, a serialiser) is swallowed here, not propagated.
  const log: typeof rawLog = (l, d) => { try { rawLog(l, d); } catch { /* the witness never throws outward */ } };
  const risk = shadowWriteRisk();
  if (risk.length > 0) {
    log(`${SHADOW_WITNESS_LOG} REFUSED`, { reason: 'profile invokes a provider not proven read-only', providers: risk });
    return null;
  }
  const t0 = Date.now();
  try {
    const turn = await constructCanonicalTurn(input.frame);
    const canonical = digestFromCanonicalTurn(turn);
    const legacy = legacyDigestFromListAssembly(input.legacy);
    const cmp = compareDigests(legacy, canonical);
    const record: ShadowWitnessRecord = {
      marker: SHADOW_WITNESS_LOG,
      memberIdPrefix: turn.manifest.identity.memberIdPrefix,
      sessionIdPrefix: turn.manifest.encounter.sessionIdPrefix,
      profile: turn.manifest.profile,
      zeroDiff: cmp.zeroDiff,
      unexpected: cmp.unexpected,
      expected: cmp.expected,
      fieldDigests: cmp.fieldDigests,
      floorDigests: cmp.floorDigests,
      unobservable: cmp.unobservable,
      providersInvoked: turn.manifest.providers.filter((p) => p.invoked).map((p) => p.id),
      providerErrors: Object.fromEntries(turn.manifest.providers.filter((p) => p.error).map((p) => [p.id, p.error!])),
      durationMs: Date.now() - t0,
    };
    log(SHADOW_WITNESS_LOG, record);
    return record;
  } catch (err) {
    log(`${SHADOW_WITNESS_LOG} FAILED`, { error: err instanceof Error ? err.message : String(err), durationMs: Date.now() - t0 });
    return null;
  }
}
