export type EvidenceLabel =
  | 'must_retrieve'
  | 'helpful'
  | 'counterevidence'
  | 'bridge'
  | 'redundant'
  | 'stale_or_superseded'
  | 'forbidden'
  | 'irrelevant';

export interface GoldSource {
  sourceRef: string;
  labels: EvidenceLabel[];
  sourceClass: string;
}

export interface BenchmarkQuery {
  id: string;
  query: string;
  family:
    | 'exact_lexical'
    | 'semantic_paraphrase'
    | 'cross_source'
    | 'graph_bridge'
    | 'temporal_supersession'
    | 'contradiction'
    | 'analogy'
    | 'global'
    | 'negative_control'
    | 'permission_control'
    | 'diversity'
    | 'ablation';
  gold: GoldSource[];
}

export interface RetrievedItem {
  sourceRef: string;
  sourceClass: string;
  rank: number;
  tokenEstimate: number;
}

export interface BenchmarkScore {
  mustRecall: number;
  helpfulRecall: number;
  counterevidenceRecall: number;
  bridgeRecall: number;
  forbiddenLeakage: number;
  irrelevantRate: number;
  staleCurrentRate: number;
  sourceClassDiversity: number;
  redundancyRate: number;
  usefulPerThousandTokens: number;
  hardFail: boolean;
}

function refsWithLabel(query: BenchmarkQuery, label: EvidenceLabel): Set<string> {
  return new Set(query.gold.filter(g => g.labels.includes(label)).map(g => g.sourceRef));
}

function recall(expected: Set<string>, actual: Set<string>): number {
  if (expected.size === 0) return 1;
  let found = 0;
  for (const ref of expected) if (actual.has(ref)) found += 1;
  return found / expected.size;
}

export function scoreRetrieval(
  query: BenchmarkQuery,
  retrieved: RetrievedItem[],
): BenchmarkScore {
  const actual = new Set(retrieved.map(r => r.sourceRef));
  const goldByRef = new Map(query.gold.map(g => [g.sourceRef, g]));
  const must = refsWithLabel(query, 'must_retrieve');
  const helpful = refsWithLabel(query, 'helpful');
  const counter = refsWithLabel(query, 'counterevidence');
  const bridge = refsWithLabel(query, 'bridge');
  const forbidden = refsWithLabel(query, 'forbidden');
  const stale = refsWithLabel(query, 'stale_or_superseded');
  const redundant = refsWithLabel(query, 'redundant');
  const irrelevant = refsWithLabel(query, 'irrelevant');

  const leakedForbidden = retrieved.filter(r => forbidden.has(r.sourceRef)).length;
  const retrievedIrrelevant = retrieved.filter(r =>
    irrelevant.has(r.sourceRef) || (!goldByRef.has(r.sourceRef))
  ).length;
  const staleCurrent = query.family === 'temporal_supersession'
    ? retrieved.filter(r => stale.has(r.sourceRef)).length
    : 0;
  const retrievedRedundant = retrieved.filter(r => redundant.has(r.sourceRef)).length;

  const usefulRefs = new Set<string>([
    ...must,
    ...helpful,
    ...counter,
    ...bridge,
  ]);
  const usefulRetrieved = retrieved.filter(r => usefulRefs.has(r.sourceRef)).length;
  const tokens = retrieved.reduce((sum, r) => sum + Math.max(0, r.tokenEstimate), 0);
  const classes = new Set(
    retrieved
      .filter(r => usefulRefs.has(r.sourceRef))
      .map(r => r.sourceClass),
  );

  return {
    mustRecall: recall(must, actual),
    helpfulRecall: recall(helpful, actual),
    counterevidenceRecall: recall(counter, actual),
    bridgeRecall: recall(bridge, actual),
    forbiddenLeakage: leakedForbidden,
    irrelevantRate: retrieved.length ? retrievedIrrelevant / retrieved.length : 0,
    staleCurrentRate: retrieved.length ? staleCurrent / retrieved.length : 0,
    sourceClassDiversity: classes.size,
    redundancyRate: retrieved.length ? retrievedRedundant / retrieved.length : 0,
    usefulPerThousandTokens: tokens ? usefulRetrieved / (tokens / 1000) : 0,
    hardFail: leakedForbidden > 0,
  };
}
