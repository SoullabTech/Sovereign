/**
 * Provider / Sovereign Cognition lane — derivation logic.
 *
 * Extracted from the admin substrate route so it can be unit-tested in isolation
 * (the route imports next/server, which a plain test harness cannot load).
 *
 * Cognition routing is observed SEPARATELY from memory-substrate health. A provider
 * fallback (Claude → local) is not a memory-layer capability — it is evidence about
 * which cognition served the turn. Surfacing it keeps the monitor from conflating
 * substrate health (does memory load?) with cognition health (which model answered?).
 *
 * `degraded` is honest about what it measures: true only when the *intended* provider
 * is Claude but turns were served locally (fallback fired). If the configured provider
 * IS local, running local is the intended state, not degradation.
 */
import type { RecordedTurn, RuntimeSummary, ProviderMixEntry } from './substrateObservability';

const LOCAL_PROVIDERS = new Set(['ollama', 'consciousness_engine', 'local']);

export type ProviderCognition = {
  note: string;
  warning: string;
  currentProvider: string | null;
  currentModel: string | null;
  configuredProvider: string;
  fallbackActive: boolean | null;
  degraded: boolean;
  window: { turns: number; cap: number };
  providerMix: ProviderMixEntry[];
  localTurns: { count: number; percent: number };
  claudeTurns: { count: number; percent: number };
  fallbacksInWindow: number;
  lastObserved: string | null;
};

export function buildProviderCognition(
  recentTurns: RecordedTurn[],
  summary: RuntimeSummary,
): ProviderCognition {
  const configuredProvider = (process.env.MAIA_TEXT_PROVIDER || 'anthropic').toLowerCase();
  const latest = recentTurns[0] ?? null;
  const total = summary.totalRecorded;

  let localCount = 0;
  let claudeCount = 0;
  for (const entry of summary.providerMix) {
    if (entry.provider === 'anthropic') claudeCount += entry.count;
    else if (LOCAL_PROVIDERS.has(entry.provider)) localCount += entry.count;
  }
  const pct = (n: number): number => (total > 0 ? Math.round((n / total) * 100) : 0);

  // Degraded = intended Claude, but turns served locally (fallback fired).
  // If the configured provider IS local, running local is intended, not degraded.
  const degraded =
    configuredProvider === 'anthropic' && (summary.fallbacksActive > 0 || localCount > 0);

  return {
    note: 'Provider state is observed separately from memory substrate health.',
    warning: 'Provider fallback is not a memory-layer capability. It is cognition routing evidence.',
    currentProvider: latest?.provider.provider ?? null,
    currentModel: latest?.provider.model ?? null,
    configuredProvider,
    fallbackActive: latest?.provider.fallbackActive ?? null,
    degraded,
    window: { turns: total, cap: summary.bufferCapacity },
    providerMix: summary.providerMix,
    localTurns: { count: localCount, percent: pct(localCount) },
    claudeTurns: { count: claudeCount, percent: pct(claudeCount) },
    fallbacksInWindow: summary.fallbacksActive,
    lastObserved: latest?.builtAt ?? summary.windowEnd ?? null,
  };
}
