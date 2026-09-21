/**
 * JARVIS-KP-01 · I2 — append-only standing resolution.
 *
 * Standing is DERIVED from immutable acts, following the append-only succession
 * pattern already canonical in `scripts/research/structural-standing/claim-standing.ts`
 * (I1 §1.5). There is no mutable current-standing field anywhere in this module:
 * a claimed standing is a request that the evaluator may cap, never an authority.
 *
 * Pure. No clock, no randomness, no I/O. Ordering comes from the declared
 * succession chain, not from timestamps — which is also what keeps the result
 * deterministic for identical inputs.
 */

import {
  ELEVATION_LADDER,
  EpistemicJoinMalformed,
  TERMINAL_STANDINGS,
  type ActId,
  type ComponentId,
  type JoinId,
  type RelationStanding,
  type StandingAct,
} from './types';

/** Rank on the elevation ladder, or null for a terminal disposition. */
export function elevationRank(standing: RelationStanding): number | null {
  const index = ELEVATION_LADDER.indexOf(standing);
  return index === -1 ? null : index;
}

export function isTerminal(standing: RelationStanding): boolean {
  return TERMINAL_STANDINGS.includes(standing);
}

/**
 * The lower of two ladder standings. A terminal disposition is never raised by
 * a cap comparison: it is returned as itself, because DISCHARGED is a verdict,
 * not a rung below WARRANTED.
 */
export function capStanding(claimed: RelationStanding, ceiling: RelationStanding): RelationStanding {
  if (isTerminal(claimed)) return claimed;
  if (isTerminal(ceiling)) return 'CANDIDATE_UNESTABLISHED';
  const claimedRank = elevationRank(claimed);
  const ceilingRank = elevationRank(ceiling);
  if (claimedRank === null || ceilingRank === null) return 'NONE_UNASSERTED';
  return claimedRank <= ceilingRank ? claimed : ceiling;
}

/** True when `candidate` sits strictly above `reference` on the ladder. */
export function exceeds(candidate: RelationStanding, reference: RelationStanding): boolean {
  const a = elevationRank(candidate);
  const b = elevationRank(reference);
  if (a === null || b === null) return false;
  return a > b;
}

export interface ResolvedSubjectStanding {
  readonly joinId: JoinId;
  readonly componentId: ComponentId | null;
  /** Standing claimed by the leaf act of this subject's chain. */
  readonly claimedStanding: RelationStanding;
  readonly leafActId: ActId;
  /** Full chain root -> leaf. History is preserved, never pruned (INV-12). */
  readonly history: readonly StandingAct[];
}

export interface ResolvedStanding {
  /** Keyed by `joinId::componentId` with `*` for whole-join scope. */
  readonly bySubject: ReadonlyMap<string, ResolvedSubjectStanding>;
  readonly acts: readonly StandingAct[];
}

export function subjectKey(joinId: JoinId, componentId: ComponentId | null): string {
  return `${joinId}::${componentId ?? '*'}`;
}

const nonBlank = (value: string, where: string): void => {
  if (!value.trim()) throw new EpistemicJoinMalformed('blank_identifier', where);
};

/**
 * Resolve current claimed standing per subject from an append-only act chain.
 *
 * Refuses (as malformation, not as a verdict) the shapes that would make
 * "current standing" ambiguous: duplicate act ids, two acts claiming the same
 * predecessor, an unknown predecessor, a cross-subject succession, or two roots
 * for one subject. Ambiguous history is not a weaker standing; it is an input
 * this module cannot honestly read.
 */
export function resolveStanding(acts: readonly StandingAct[]): ResolvedStanding {
  const byActId = new Map<string, StandingAct>();
  for (const act of acts) {
    nonBlank(act.actId, 'standingAct.actId');
    nonBlank(act.joinId, 'standingAct.joinId');
    if (byActId.has(act.actId)) {
      throw new EpistemicJoinMalformed('duplicate_standing_act', act.actId);
    }
    byActId.set(act.actId, act);
  }

  const successorOf = new Map<string, string>();
  const rootsBySubject = new Map<string, string>();

  for (const act of acts) {
    const key = subjectKey(act.joinId, act.componentId);
    if (act.supersedesActId === null) {
      const existingRoot = rootsBySubject.get(key);
      if (existingRoot !== undefined) {
        throw new EpistemicJoinMalformed('multiple_standing_roots', key);
      }
      rootsBySubject.set(key, act.actId);
      continue;
    }

    const prior = byActId.get(act.supersedesActId);
    if (prior === undefined) {
      throw new EpistemicJoinMalformed('unknown_superseded_act', act.supersedesActId);
    }
    if (subjectKey(prior.joinId, prior.componentId) !== key) {
      throw new EpistemicJoinMalformed('cross_subject_supersession', `${act.actId}->${act.supersedesActId}`);
    }
    if (successorOf.has(act.supersedesActId)) {
      throw new EpistemicJoinMalformed('branched_standing_chain', act.supersedesActId);
    }
    successorOf.set(act.supersedesActId, act.actId);
  }

  const bySubject = new Map<string, ResolvedSubjectStanding>();
  for (const [key, rootActId] of rootsBySubject) {
    const history: StandingAct[] = [];
    const seen = new Set<string>();
    let cursor: string | undefined = rootActId;
    while (cursor !== undefined) {
      if (seen.has(cursor)) throw new EpistemicJoinMalformed('cyclic_standing_chain', cursor);
      seen.add(cursor);
      const act = byActId.get(cursor);
      if (act === undefined) throw new EpistemicJoinMalformed('unknown_act_in_chain', cursor);
      history.push(act);
      cursor = successorOf.get(cursor);
    }
    const leaf = history[history.length - 1];
    if (leaf === undefined) throw new EpistemicJoinMalformed('empty_standing_chain', key);
    bySubject.set(key, {
      joinId: leaf.joinId,
      componentId: leaf.componentId,
      claimedStanding: leaf.claimedStanding,
      leafActId: leaf.actId,
      history,
    });
  }

  // Every act must belong to a resolved chain. An orphan act would otherwise sit
  // in the record claiming a standing that no derivation ever reads.
  const reachable = new Set<string>();
  for (const resolved of bySubject.values()) {
    for (const act of resolved.history) reachable.add(act.actId);
  }
  for (const act of acts) {
    if (!reachable.has(act.actId)) {
      throw new EpistemicJoinMalformed('orphan_standing_act', act.actId);
    }
  }

  return { bySubject, acts };
}
