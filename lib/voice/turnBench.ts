import type { TurnDecision } from './turnArbiter';

export type TurnBenchLabel = 'continue' | 'yield';
export type TurnBenchSample = {
  label: TurnBenchLabel;
  decision: TurnDecision;
  latencyMs?: number;
};

export type TurnBenchMetrics = {
  samples: number;
  continueSamples: number;
  yieldSamples: number;
  falseFloorSeizures: number;
  falseFloorSeizureRate: number;
  correctYields: number;
  yieldRecall: number;
  medianYieldLatencyMs: number | null;
};

const ratio = (n: number, d: number) => d > 0 ? n / d : 0;

export function evaluateTurnBench(samples: TurnBenchSample[]): TurnBenchMetrics {
  const continues = samples.filter((s) => s.label === 'continue');
  const yields = samples.filter((s) => s.label === 'yield');
  const falseFloorSeizures = continues.filter((s) => s.decision === 'yield_candidate').length;
  const correct = yields.filter((s) => s.decision === 'yield_candidate');
  const latencies = correct
    .map((s) => s.latencyMs)
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0)
    .sort((a, b) => a - b);
  const median = latencies.length === 0 ? null : latencies.length % 2
    ? latencies[(latencies.length - 1) / 2]
    : (latencies[latencies.length / 2 - 1] + latencies[latencies.length / 2]) / 2;

  return {
    samples: samples.length,
    continueSamples: continues.length,
    yieldSamples: yields.length,
    falseFloorSeizures,
    falseFloorSeizureRate: ratio(falseFloorSeizures, continues.length),
    correctYields: correct.length,
    yieldRecall: ratio(correct.length, yields.length),
    medianYieldLatencyMs: median,
  };
}


export function evaluateTurnBenchByClass<T extends { pauseClass: string }>(
  samples: Array<T & TurnBenchSample>,
): Record<string, TurnBenchMetrics> {
  const groups = new Map<string, Array<T & TurnBenchSample>>();
  for (const sample of samples) {
    const list = groups.get(sample.pauseClass) ?? [];
    list.push(sample);
    groups.set(sample.pauseClass, list);
  }
  return Object.fromEntries(
    [...groups.entries()].map(([pauseClass, rows]) => [pauseClass, evaluateTurnBench(rows)]),
  );
}
