// backend
// /app/api/_backend/src/services/DepthScoreService.ts

export type MaiaIntentNative = 'RECALL' | 'RESEARCH' | 'ACTION' | 'CARE' | 'MEANING';

export type DepthBand = 'SWIFT' | 'GUIDED' | 'DEEP';

export type DepthInputs = {
  // Conversation / retrieval context
  numTurns?: number; // total turns in current conversation
  memoryHitsCount?: number; // number of memory hits returned (top-k size)
  retrievedSourceTypes?: string[]; // e.g. ['memory', 'library', 'transcript']
  // Query text
  query: string;
  // Intent
  intent: MaiaIntentNative;
};

export type DepthScoreResult = {
  score: number; // 0..100
  band: DepthBand;
  components: {
    contextLoad: number; // 0..30
    synthesis: number; // 0..25
    precision: number; // 0..20
    careWeight: number; // 0..25
  };
  flags: {
    precisionMode: boolean;
    referBack: boolean;
    hasCodeTokens: boolean;
    opsTokens: boolean;
    distressTokens: boolean;
    multiQuestion: boolean;
    multiSource: boolean;
  };
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function includesAny(text: string, tokens: string[]) {
  const t = text.toLowerCase();
  return tokens.some((x) => t.includes(x));
}

function countQuestionClauses(text: string) {
  const t = text.toLowerCase();
  // crude but effective: multiple questions or multiple conjunctions
  const qMarks = (text.match(/\?/g) || []).length;
  const conj = (t.match(/\b(and|also|plus|then|next)\b/g) || []).length;
  return qMarks + conj;
}

export class DepthScoreService {
  // Thresholds for band classification and flags
  private static readonly THRESHOLDS = {
    deepMin: 65,
    guidedMin: 35,
    precisionMin: 8,
  };

  // Version tag for scoring algorithm (bump when weights/heuristics change)
  private static readonly VERSION = 'depthscore_v1';

  /**
   * Expose thresholds for trace logging (makes traces self-documenting)
   */
  static thresholds() {
    return this.THRESHOLDS;
  }

  /**
   * Scoring version for trace comparability across builds
   */
  static version() {
    return this.VERSION;
  }

  static compute(inputs: DepthInputs): DepthScoreResult {
    const query = inputs.query ?? '';
    const q = query.toLowerCase();

    // ---- signal dictionaries (keep these small + stable)
    const REFER_BACK = [
      'earlier',
      'last time',
      'remember',
      'we decided',
      'as we said',
      'previous',
      'prior',
      'you said',
      'we said'
    ];

    const CODE_TOKENS = [
      '.ts',
      '.tsx',
      '.js',
      '.sql',
      '.md',
      'docker',
      'psql',
      'postgres',
      'migration',
      'endpoint',
      'route.ts',
      'alter table',
      'create index',
      'select ',
      'insert ',
      'update ',
      'delete ',
      'rls'
    ];

    const OPS_TOKENS = [
      'deploy',
      'production',
      'prod',
      'restore',
      'backup',
      'upgrade',
      'auth',
      'login',
      'sign in',
      'token',
      'ssl',
      'dns',
      'port',
      'caddy',
      'render',
      'vercel'
    ];

    const DISTRESS_TOKENS = [
      'worn out',
      'overwhelmed',
      'anxious',
      'panic',
      "can't",
      'exhausted',
      'i am done',
      'too much',
      'stuck'
    ];

    const DATE_TOKENS = ['latest', 'most recent', 'today', 'current version', 'as of'];

    // ---- boolean signals
    const referBack = includesAny(q, REFER_BACK);
    const hasCodeTokens = includesAny(q, CODE_TOKENS) || /`[^`]+`/.test(query);
    const opsTokens = includesAny(q, OPS_TOKENS);
    const distressTokens = includesAny(q, DISTRESS_TOKENS);

    const multiQuestion = countQuestionClauses(query) >= 2;
    const sourceTypes = inputs.retrievedSourceTypes ?? [];
    const multiSource = new Set(sourceTypes).size >= 2;

    // ---- intent factor
    const intentFactor: Record<MaiaIntentNative, number> = {
      RECALL: 0.2,
      ACTION: 0.6,
      RESEARCH: 0.8,
      MEANING: 0.8,
      CARE: 0.7
    };

    // ---- A) Context Load (0..30)
    const turns = inputs.numTurns ?? 0;
    const turnsFactor = clamp(turns, 0, 10) / 10;

    const memHits = inputs.memoryHitsCount ?? 0;
    const memoryFactor = clamp(memHits / 8, 0, 1);

    const referBackFactor = referBack ? 1 : 0;

    const contextLoad =
      30 * (0.5 * turnsFactor + 0.4 * memoryFactor + 0.1 * referBackFactor);

    // ---- B) Synthesis Complexity (0..25)
    const multiSourceFactor = clamp(new Set(sourceTypes).size / 3, 0, 1);
    const multiQuestionFactor = multiQuestion ? 1 : 0;

    const synthesis =
      25 *
      (0.6 * intentFactor[inputs.intent] +
        0.3 * multiSourceFactor +
        0.1 * multiQuestionFactor);

    // ---- C) Precision Requirement (0..20)
    const codeFactor = hasCodeTokens ? 1 : 0;
    const opsFactor = opsTokens ? 1 : 0;
    const dateFactor = includesAny(q, DATE_TOKENS) ? 1 : 0;

    const precision = 20 * clamp(0.5 * codeFactor + 0.4 * opsFactor + 0.1 * dateFactor, 0, 1);

    // ---- D) Care / Emotional Weight (0..25)
    const careIntent = inputs.intent === 'CARE' ? 1 : 0;
    const stakesSignal = includesAny(q, ['urgent', 'breaking', 'on fire', 'critical']) ? 1 : 0;

    const careWeight = 25 * clamp(0.6 * careIntent + 0.3 * (distressTokens ? 1 : 0) + 0.1 * stakesSignal, 0, 1);

    const raw = contextLoad + synthesis + precision + careWeight;
    const score = clamp(Math.round(raw), 0, 100);

    const band: DepthBand =
      score >= this.THRESHOLDS.deepMin ? 'DEEP' :
      score >= this.THRESHOLDS.guidedMin ? 'GUIDED' : 'SWIFT';

    // precision mode: separate switch (can be true even in SWIFT)
    const precisionMode = precision >= this.THRESHOLDS.precisionMin;

    return {
      score,
      band,
      components: {
        contextLoad: Math.round(contextLoad),
        synthesis: Math.round(synthesis),
        precision: Math.round(precision),
        careWeight: Math.round(careWeight)
      },
      flags: {
        precisionMode,
        referBack,
        hasCodeTokens,
        opsTokens,
        distressTokens,
        multiQuestion,
        multiSource
      }
    };
  }
}
