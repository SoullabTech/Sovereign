export type RetrievalLane = 'analytic' | 'associative';

export interface LaneCandidate {
  sourceRef: string;
  lane: RetrievalLane;
  rank: number;
  reasons: string[];
  useful: boolean;
  forbidden?: boolean;
  labels: Array<
    'must_retrieve' | 'helpful' | 'counterevidence' | 'bridge' |
    'redundant' | 'stale_or_superseded' | 'forbidden' | 'irrelevant'
  >;
}

export interface CoordinatedCandidate {
  sourceRef: string;
  lanes: RetrievalLane[];
  analyticRank: number | null;
  associativeRank: number | null;
  reasons: string[];
  labels: LaneCandidate['labels'];
  useful: boolean;
  forbidden: boolean;
}

export function coordinateLanes(
  analytic: LaneCandidate[],
  associative: LaneCandidate[],
): CoordinatedCandidate[] {
  const byRef = new Map<string, CoordinatedCandidate>();

  for (const candidate of [...analytic, ...associative]) {
    const current = byRef.get(candidate.sourceRef) ?? {
      sourceRef: candidate.sourceRef,
      lanes: [],
      analyticRank: null,
      associativeRank: null,
      reasons: [],
      labels: [],
      useful: false,
      forbidden: false,
    };

    if (!current.lanes.includes(candidate.lane)) current.lanes.push(candidate.lane);
    if (candidate.lane === 'analytic') current.analyticRank = candidate.rank;
    if (candidate.lane === 'associative') current.associativeRank = candidate.rank;
    current.reasons = [...new Set([...current.reasons, ...candidate.reasons])];
    current.labels = [...new Set([...current.labels, ...candidate.labels])];
    current.useful = current.useful || candidate.useful;
    current.forbidden = current.forbidden || candidate.forbidden === true ||
      candidate.labels.includes('forbidden');

    byRef.set(candidate.sourceRef, current);
  }

  return [...byRef.values()];
}

export interface CallosalMetrics {
  analyticUseful: number;
  associativeUseful: number;
  coordinatedUseful: number;
  analyticUniqueYield: number;
  associativeUniqueYield: number;
  sharedUseful: number;
  complementarityGain: number;
  forbiddenLeakage: number;
  counterevidencePresent: boolean;
  bridgePresent: boolean;
}

function usefulRefs(candidates: LaneCandidate[]): Set<string> {
  return new Set(candidates.filter(c => c.useful && !c.forbidden).map(c => c.sourceRef));
}

export function callosalMetrics(
  analytic: LaneCandidate[],
  associative: LaneCandidate[],
): CallosalMetrics {
  const a = usefulRefs(analytic);
  const b = usefulRefs(associative);
  const coordinated = coordinateLanes(analytic, associative);
  const coordinatedUsefulRefs = new Set(
    coordinated.filter(c => c.useful && !c.forbidden).map(c => c.sourceRef),
  );

  const analyticUnique = [...a].filter(ref => !b.has(ref)).length;
  const associativeUnique = [...b].filter(ref => !a.has(ref)).length;
  const shared = [...a].filter(ref => b.has(ref)).length;
  const bestSingle = Math.max(a.size, b.size);
  const gain = bestSingle === 0 ? (coordinatedUsefulRefs.size ? 1 : 0) :
    (coordinatedUsefulRefs.size - bestSingle) / bestSingle;

  return {
    analyticUseful: a.size,
    associativeUseful: b.size,
    coordinatedUseful: coordinatedUsefulRefs.size,
    analyticUniqueYield: analyticUnique,
    associativeUniqueYield: associativeUnique,
    sharedUseful: shared,
    complementarityGain: gain,
    forbiddenLeakage: coordinated.filter(c => c.forbidden).length,
    counterevidencePresent: coordinated.some(c => c.labels.includes('counterevidence') && !c.forbidden),
    bridgePresent: coordinated.some(c => c.labels.includes('bridge') && !c.forbidden),
  };
}
