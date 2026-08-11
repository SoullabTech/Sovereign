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
  /**
   * The member's own recorded moment this rests on.
   *
   * WHY THIS EXISTS. Every relationship that had ever held a rupture received
   * the identical sentence — "A rupture has not yet reached repair." — in flat
   * declarative fact-voice, in a bordered box of its own. The one line on the
   * page claiming to perceive something about THIS relationship said the same
   * thing about every relationship. A template is not perception.
   *
   * Carrying the anchor lets the room name WHEN the member wrote the thing
   * this was derived from, so the sentence is particular to their record and
   * visibly derived FROM it rather than pronounced OVER it. Constitution
   * Article III: MAIA may help the member perceive, never convert perception
   * into certainty. Article II: an observation may never read as a member's
   * own declaration.
   */
  anchoredAt: string | null;
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
      // Points at the member's own act — the moment THEY marked as broken —
      // rather than asserting a state of the relationship. The room renders
      // the date, which is what makes it this relationship's and no other's.
      description: 'you marked something as broken here, and nothing since is marked as mended',
      anchoredAt: sorted[lastRuptureIndex].createdAt,
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
        description: `you named tension or avoidance in ${tensionCount} of your last ${recentCheckins.length} check-ins`,
        anchoredAt: recentCheckins[recentCheckins.length - 1].createdAt,
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
        description: `you last checked in feeling ${lastCheckin.fieldToneSnapshot!.replace(/_/g, ' ')}`,
        anchoredAt: lastCheckin.createdAt,
      });
    }
  }

  return threads;
}
