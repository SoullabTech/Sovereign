// lib/metrics/toneMetrics.ts

type ToneMetric = {
  element: string;
  phase: string;
  count: number;
  history: { ts: number; count: number }[];
};

const toneCounters: Record<string, ToneMetric> = {};

/**
 * Increment counter for element+phase combo
 */
export function recordToneMetric(element: string, phase: string) {
  const key = `${element}-${phase}`;
  if (!toneCounters[key]) {
    toneCounters[key] = { element, phase, count: 0, history: [] };
  }
  toneCounters[key].count += 1;
  toneCounters[key].history.push({ ts: Date.now(), count: toneCounters[key].count });

  if (process.env.NODE_ENV === "development") {
    console.debug("[ToneMetric]", toneCounters[key]);
  }
}

/**
 * Get current stats (could be exposed via API route)
 */
export function getToneMetrics(): ToneMetric[] {
  return Object.values(toneCounters);
}