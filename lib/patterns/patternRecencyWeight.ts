/**
 * Recency weight for pattern scoring in getTopHypotheses.
 * Decays over time so stale patterns rank lower.
 */
export function patternRecencyWeight(lastSeenAt: Date | string): number {
  const ms = Date.now() - new Date(lastSeenAt).getTime();
  const days = ms / (1000 * 60 * 60 * 24);

  if (days <= 7)  return 1.0;
  if (days <= 30) return 0.8;
  if (days <= 90) return 0.55;
  return 0.3;
}
