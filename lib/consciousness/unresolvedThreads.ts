/**
 * Unresolved Thread Detection
 *
 * Derives "something here remains open" from existing relationship entries.
 * No new tables. No new API calls. Pure derivation from what's already loaded.
 *
 * Three detection heuristics:
 * 1. Rupture without repair — a rupture entry with no subsequent repair
 * 2. Repeating tension — tension/avoidance/resentment appear in 2+ of last 5 check-ins
 * 3. Charged then silent — last check-in had tense/contracted signals, and it was 7+ days ago
 */

interface EntryForDetection {
  kind: string;
  feltSignals: string[] | null;
  fieldToneSnapshot: string | null;
  createdAt: string;
}

export interface UnresolvedThread {
  type: 'rupture_without_repair' | 'repeating_tension' | 'charged_then_silent';
  description: string;
}

const TENSION_SIGNALS = ['tension', 'avoidance', 'resentment', 'pressure', 'distance'];
const CHARGED_TONES = ['tense', 'contracted', 'fragile'];

export function detectUnresolvedThreads(entries: EntryForDetection[]): UnresolvedThread[] {
  if (!entries || entries.length === 0) return [];

  const threads: UnresolvedThread[] = [];

  // Sort oldest first for sequence analysis
  const sorted = [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // 1. Rupture without repair
  let lastRuptureIndex = -1;
  let hasRepairAfter = false;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].kind === 'rupture') {
      lastRuptureIndex = i;
      hasRepairAfter = false;
    }
    if (sorted[i].kind === 'repair' && lastRuptureIndex >= 0) {
      hasRepairAfter = true;
    }
  }
  if (lastRuptureIndex >= 0 && !hasRepairAfter) {
    threads.push({
      type: 'rupture_without_repair',
      description: 'A rupture has not yet reached repair.',
    });
  }

  // 2. Repeating tension — check last 5 check-ins
  const recentCheckins = sorted
    .filter(e => e.kind === 'checkin' && e.feltSignals)
    .slice(-5);

  if (recentCheckins.length >= 2) {
    const tensionCount = recentCheckins.filter(e =>
      e.feltSignals!.some(s => TENSION_SIGNALS.includes(s))
    ).length;

    if (tensionCount >= 2) {
      threads.push({
        type: 'repeating_tension',
        description: 'Tension or avoidance has appeared in multiple recent check-ins.',
      });
    }
  }

  // 3. Charged then silent — last check-in was 7+ days ago with charged tone
  const lastCheckin = sorted.filter(e => e.kind === 'checkin').pop();
  if (lastCheckin) {
    const daysSince = (Date.now() - new Date(lastCheckin.createdAt).getTime()) / 86400000;
    const wasCharged = lastCheckin.fieldToneSnapshot &&
      CHARGED_TONES.includes(lastCheckin.fieldToneSnapshot);

    if (daysSince >= 7 && wasCharged) {
      threads.push({
        type: 'charged_then_silent',
        description: 'The field was charged, and it has been a while since you checked in.',
      });
    }
  }

  return threads;
}
