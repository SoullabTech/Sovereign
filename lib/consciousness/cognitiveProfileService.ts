import {
  getUserCognitiveProgression,
  getAverageCognitiveLevel,
} from './cognitiveEventsService';

export type CognitiveStability = 'stable' | 'ascending' | 'descending' | 'volatile';

export interface CognitiveProfile {
  userId: string;

  // Current state (last turn)
  currentLevel: number;
  currentLabel: string;
  currentScore: number;
  lastUpdated: Date;

  // Rolling average (last N turns)
  rollingAverage: number;
  stability: CognitiveStability;

  // Bypassing patterns (0–1 = % of tracked turns)
  bypassingFrequency: {
    spiritual: number;
    intellectual: number;
  };

  // Eligibility & gates
  communityCommonsEligible: boolean;
  deepWorkRecommended: boolean;
  fieldWorkSafe: boolean;

  // Meta
  window: number;
  totalTurns: number;
  turnsWithCognitiveTracking: number;
}

interface CognitiveProfileOptions {
  window?: number; // number of recent turns to consider (default 20)
}

type CognitiveTurnRecord = {
  level?: number;
  numericLevel?: number;
  label?: string;
  score?: number;
  createdAt?: string | Date;
  created_at?: string | Date;
  bypassing?: {
    spiritual?: boolean;
    intellectual?: boolean;
  };
};

/**
 * Get a user's cognitive profile over a recent window of turns.
 */
export async function getCognitiveProfile(
  userId: string,
  options: CognitiveProfileOptions = {},
): Promise<CognitiveProfile | null> {
  const window = options.window ?? 20;

  try {
    const progression = (await getUserCognitiveProgression(
      userId,
      window,
    )) as CognitiveTurnRecord[];

    if (!progression || progression.length === 0) {
      return null;
    }

    // Assume progression[0] is most recent (as used elsewhere in the codebase)
    const latest = progression[0];

    const currentLevel = normalizeLevel(latest);
    const currentLabel = latest.label ?? bloomLabelForLevel(currentLevel);
    const currentScore = latest.score ?? currentLevel;

    const lastUpdated = extractTimestamp(latest) ?? new Date();

    const rollingAverage =
      (await getAverageCognitiveLevel(userId, window)) ?? currentLevel;

    const stability = computeStability(progression);

    const { spiritualFreq, intellectualFreq } =
      computeBypassingFrequencies(progression);

    // Simple gate rules (can be refined later)
    const communityCommonsEligible = rollingAverage >= 4.0;
    const deepWorkRecommended =
      rollingAverage >= 3.5 && spiritualFreq < 0.5 && intellectualFreq < 0.5;
    const fieldWorkSafe =
      rollingAverage >= 4.0 && spiritualFreq < 0.3 && intellectualFreq < 0.3;

    const turnsWithCognitiveTracking = progression.length;

    const profile: CognitiveProfile = {
      userId,
      currentLevel,
      currentLabel,
      currentScore,
      lastUpdated,

      rollingAverage,
      stability,

      bypassingFrequency: {
        spiritual: spiritualFreq,
        intellectual: intellectualFreq,
      },

      communityCommonsEligible,
      deepWorkRecommended,
      fieldWorkSafe,

      window,
      // NOTE: for now we treat tracked turns as total turns in window
      totalTurns: turnsWithCognitiveTracking,
      turnsWithCognitiveTracking,
    };

    console.log(
      `🧠 [Dialectical Scaffold] CognitiveProfile for ${userId.slice(
        0,
        8,
      )} | current=${currentLevel}, avg=${rollingAverage.toFixed(
        2,
      )}, stability=${stability}`,
    );

    return profile;
  } catch (error) {
    console.error('❌ [Dialectical Scaffold] Failed to build cognitive profile:', error);
    return null;
  }
}

/**
 * Compute coarse stability over the recent window.
 */
export async function getCognitiveStability(
  userId: string,
  window: number = 20,
): Promise<CognitiveStability> {
  try {
    const progression = (await getUserCognitiveProgression(
      userId,
      window,
    )) as CognitiveTurnRecord[];

    if (!progression || progression.length < 3) {
      return 'stable';
    }

    return computeStability(progression);
  } catch (error) {
    console.error(
      '❌ [Dialectical Scaffold] Failed to compute cognitive stability:',
      error,
    );
    return 'stable';
  }
}

/**
 * Return a simple numeric trajectory of levels over the recent window.
 * Newest first (to match other uses of progression in the system).
 */
export async function getCognitiveTrajectory(
  userId: string,
  window: number = 20,
): Promise<number[]> {
  try {
    const progression = (await getUserCognitiveProgression(
      userId,
      window,
    )) as CognitiveTurnRecord[];

    if (!progression || progression.length === 0) {
      return [];
    }

    return progression.map((turn) => normalizeLevel(turn));
  } catch (error) {
    console.error(
      '❌ [Dialectical Scaffold] Failed to get cognitive trajectory:',
      error,
    );
    return [];
  }
}

/* ───────────────────────────── Helpers ───────────────────────────── */

function normalizeLevel(turn: CognitiveTurnRecord | null | undefined): number {
  if (!turn) return 0;
  if (typeof turn.numericLevel === 'number') return turn.numericLevel;
  if (typeof turn.level === 'number') return turn.level;
  if (typeof turn.score === 'number') return turn.score;
  return 0;
}

function extractTimestamp(turn: CognitiveTurnRecord): Date | null {
  if (turn.created_at) {
    return new Date(turn.created_at);
  }
  if (turn.createdAt) {
    return new Date(turn.createdAt);
  }
  return null;
}

function bloomLabelForLevel(level: number): string {
  if (level >= 6) return 'CREATE';
  if (level >= 5) return 'EVALUATE';
  if (level >= 4) return 'ANALYZE';
  if (level >= 3) return 'APPLY';
  if (level >= 2) return 'UNDERSTAND';
  if (level >= 1) return 'REMEMBER';
  return 'UNKNOWN';
}

function computeStability(progression: CognitiveTurnRecord[]): CognitiveStability {
  if (!progression || progression.length < 3) return 'stable';

  const levels = progression.map((t) => normalizeLevel(t)).filter((l) => l > 0);
  if (levels.length < 3) return 'stable';

  // Assume progression[0] is most recent, last is oldest
  const recent = levels[0];
  const oldest = levels[levels.length - 1];
  const diff = recent - oldest;

  // Simple net-change heuristic
  const absDiff = Math.abs(diff);

  if (absDiff < 0.25) {
    // Little net change → either stable or volatile; use variance to decide
    const variance = computeVariance(levels);
    return variance < 0.4 ? 'stable' : 'volatile';
  }

  if (diff > 0.5) return 'ascending';
  if (diff < -0.5) return 'descending';

  return 'volatile';
}

function computeVariance(values: number[]): number {
  if (!values.length) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const sqDiff = values.map((v) => (v - mean) ** 2);
  return sqDiff.reduce((sum, v) => sum + v, 0) / values.length;
}

function computeBypassingFrequencies(progression: CognitiveTurnRecord[]): {
  spiritualFreq: number;
  intellectualFreq: number;
} {
  if (!progression || progression.length === 0) {
    return { spiritualFreq: 0, intellectualFreq: 0 };
  }

  let spiritualCount = 0;
  let intellectualCount = 0;

  for (const turn of progression) {
    if (turn.bypassing?.spiritual) spiritualCount += 1;
    if (turn.bypassing?.intellectual) intellectualCount += 1;
  }

  const total = progression.length;
  return {
    spiritualFreq: total > 0 ? spiritualCount / total : 0,
    intellectualFreq: total > 0 ? intellectualCount / total : 0,
  };
}
