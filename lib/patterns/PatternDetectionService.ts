/**
 * Pattern Detection Service — Wire 1
 *
 * Detects candidate patterns from oracle turns and upserts them
 * into the pattern_ledger as 'emerging'.
 *
 * Design principles:
 * - Structural detection only (no interpretation, no diagnosis)
 * - Fire-and-forget (never blocks oracle response)
 * - Evidence-bounded (max 8 evidence per pattern)
 * - Idempotent (same signal twice = increment, not duplicate)
 *
 * Philosophy: "Notice structure. Never name meaning."
 */

import { query } from '@/lib/db/postgres';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface PatternSignal {
  memberId: string;
  sessionId: string;
  turnIndex: number;
  userText: string;
  maiaText: string;
  element: string;
  phase: number;
  motion?: string | null;
  intensity?: number | null;
  insights: string[];
}

export interface PatternCandidate {
  signature: string;
  statement: string;
  scope: 'relationship' | 'work' | 'somatic' | 'spiritual' | 'recurring_trigger' | 'theme';
  confidence: number;
  elementBias?: string;
  evidenceExcerpt: string;
}

// ═══════════════════════════════════════════════════════════════
// Structural Pattern Signatures
// ═══════════════════════════════════════════════════════════════

/**
 * Structural pattern detectors. These look for behavioral loops,
 * NOT psychological interpretations. Each returns a PatternCandidate
 * or null.
 */
const STRUCTURAL_DETECTORS: Array<{
  signature: string;
  scope: PatternCandidate['scope'];
  statement: string;
  detect: (signal: PatternSignal) => boolean;
}> = [
  // --- Behavioral loops ---
  {
    signature: 'avoidance_after_intensity',
    scope: 'recurring_trigger',
    statement: 'Withdrawal or avoidance appearing after moments of intensity',
    detect: (s) => {
      const user = s.userText.toLowerCase();
      const hasIntensity = (s.intensity ?? 0) > 0.7;
      const avoidanceMarkers = /\b(pull(?:ed|ing)?\s+(?:back|away)|withdraw|retreat|shut\s*down|go\s+quiet|disappear|numb|check\s+out)\b/i;
      return hasIntensity && avoidanceMarkers.test(user);
    },
  },
  {
    signature: 'overcommit_under_pressure',
    scope: 'work',
    statement: 'Saying yes or taking on more when under pressure',
    detect: (s) => {
      const user = s.userText.toLowerCase();
      return /\b(said\s+yes|took\s+on|agreed\s+to|couldn'?t\s+say\s+no|can'?t\s+say\s+no|overcommit|too\s+much\s+on)\b/.test(user) &&
        /\b(overwhelm|stress|pressure|busy|exhausted|too\s+much)\b/.test(user);
    },
  },
  {
    signature: 'self_doubt_before_action',
    scope: 'recurring_trigger',
    statement: 'Self-doubt or hesitation appearing before significant action',
    detect: (s) => {
      const user = s.userText.toLowerCase();
      return /\b(not\s+(?:ready|good\s+enough|qualified)|who\s+am\s+i\s+to|imposter|doubt|hesitat|second[\s-]?guess)\b/.test(user) &&
        /\b(want\s+to|about\s+to|trying\s+to|going\s+to|planning\s+to|need\s+to)\b/.test(user);
    },
  },
  {
    signature: 'freeze_at_conflict',
    scope: 'relationship',
    statement: 'Freezing or going silent when conflict arises',
    detect: (s) => {
      const user = s.userText.toLowerCase();
      return /\b(froze|freeze|frozen|couldn'?t\s+speak|went\s+silent|shut\s+down|blank)\b/.test(user) &&
        /\b(argument|conflict|confrontat|disagree|fight|tension|angry|upset\s+with)\b/.test(user);
    },
  },
  {
    signature: 'caretaking_over_self',
    scope: 'relationship',
    statement: 'Prioritizing others\' needs while neglecting own',
    detect: (s) => {
      const user = s.userText.toLowerCase();
      return /\b(everyone\s+else|their\s+needs|taking\s+care\s+of|put\s+(?:them|others|everyone)\s+first|forgot\s+about\s+(?:me|myself))\b/.test(user) &&
        /\b(exhaust|drain|resent|tired|empty|neglect|forgot|ignor)\b/.test(user);
    },
  },

  // --- Elemental loops ---
  {
    signature: 'fire_burn_cycle',
    scope: 'theme',
    statement: 'A cycle of intense drive followed by burnout',
    detect: (s) => {
      const user = s.userText.toLowerCase();
      return s.element === 'fire' &&
        /\b(burn\s*out|crash|exhaust|collapse|can'?t\s+keep|pushing\s+too|drove\s+(?:myself|me))\b/.test(user);
    },
  },
  {
    signature: 'water_flooding',
    scope: 'somatic',
    statement: 'Emotional overwhelm that feels like flooding or drowning',
    detect: (s) => {
      const user = s.userText.toLowerCase();
      return s.element === 'water' &&
        /\b(flood|drown|overwhelm|wave|swallow|can'?t\s+stop\s+(?:crying|feeling)|too\s+much\s+(?:feeling|emotion))\b/.test(user);
    },
  },
  {
    signature: 'earth_rigidity',
    scope: 'theme',
    statement: 'Holding on tightly when something needs to change',
    detect: (s) => {
      const user = s.userText.toLowerCase();
      return s.element === 'earth' &&
        /\b(stuck|rigid|can'?t\s+let\s+go|holding\s+on|cling|control|won'?t\s+(?:budge|change|move))\b/.test(user);
    },
  },
  {
    signature: 'air_overthinking_spiral',
    scope: 'recurring_trigger',
    statement: 'Thinking in circles without reaching ground',
    detect: (s) => {
      const user = s.userText.toLowerCase();
      return s.element === 'air' &&
        /\b(overthink|spiral|ruminate|can'?t\s+stop\s+thinking|round\s+and\s+round|loop|going\s+in\s+circles)\b/.test(user);
    },
  },

  // --- Growth-edge patterns ---
  {
    signature: 'boundary_emergence',
    scope: 'relationship',
    statement: 'Working to set or hold a boundary',
    detect: (s) => {
      const user = s.userText.toLowerCase();
      return /\b(boundar|said\s+no|stood\s+(?:my|up)|drew\s+(?:a\s+)?line|protect(?:ing)?\s+(?:my|myself)|learning\s+to\s+say\s+no)\b/.test(user);
    },
  },
  {
    signature: 'meaning_search',
    scope: 'spiritual',
    statement: 'Searching for meaning or purpose in what\'s happening',
    detect: (s) => {
      const user = s.userText.toLowerCase();
      return /\b(what(?:'s|\s+is)\s+(?:the\s+)?(?:point|purpose|meaning)|why\s+(?:am\s+i|is\s+this)|feel\s+(?:lost|meaningless|empty|purposeless))\b/.test(user);
    },
  },

  // --- User self-recognition (highest signal) ---
  {
    signature: 'self_pattern_recognition',
    scope: 'theme',
    statement: 'Recognizing their own recurring pattern',
    detect: (s) => {
      const user = s.userText.toLowerCase();
      return /\b(i\s+(?:always|keep|tend\s+to)|this\s+(?:always|keeps)\s+happen|i\s+notice(?:d)?\s+(?:a\s+)?pattern|every\s+time\s+i|whenever\s+i)\b/.test(user);
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// Core Detection
// ═══════════════════════════════════════════════════════════════

/**
 * Run all structural detectors against a signal.
 * Returns matched candidates (0 or more).
 */
export function detectPatterns(signal: PatternSignal): PatternCandidate[] {
  const candidates: PatternCandidate[] = [];

  for (const detector of STRUCTURAL_DETECTORS) {
    try {
      if (detector.detect(signal)) {
        // Extract a short evidence excerpt (max 120 chars, from user text)
        const excerpt = signal.userText.length > 120
          ? signal.userText.substring(0, 117) + '...'
          : signal.userText;

        candidates.push({
          signature: detector.signature,
          statement: detector.statement,
          scope: detector.scope,
          confidence: computeConfidence(detector.signature, signal),
          elementBias: signal.element,
          evidenceExcerpt: excerpt,
        });
      }
    } catch (err) {
      // Never let a single detector failure break the pipeline
      console.warn(`[pattern-detection] Detector '${detector.signature}' threw:`, err);
    }
  }

  return candidates;
}

/**
 * Compute confidence based on signal strength.
 * Starts low (0.35) and increases with corroborating signals.
 */
function computeConfidence(signature: string, signal: PatternSignal): number {
  let base = 0.35;

  // User's own pattern recognition = higher starting confidence
  if (signature === 'self_pattern_recognition') {
    base = 0.55;
  }

  // Higher intensity = slightly more confidence
  if (signal.intensity && signal.intensity > 0.6) {
    base += 0.05;
  }

  // Deeper conversation = more context = slightly more confidence
  if (signal.turnIndex > 5) {
    base += 0.05;
  }

  // Insight extraction corroboration
  const relevantInsights = signal.insights.filter(i =>
    i.toLowerCase().includes('pattern') || i.toLowerCase().includes('recurring')
  );
  if (relevantInsights.length > 0) {
    base += 0.1;
  }

  return Math.min(base, 0.85); // Never start above 0.85
}

// ═══════════════════════════════════════════════════════════════
// Database Upsert
// ═══════════════════════════════════════════════════════════════

const MAX_EVIDENCE_PER_PATTERN = 8;

/**
 * Upsert a detected pattern candidate into the pattern_ledger.
 * Fire-and-forget: errors are logged, never thrown.
 *
 * If the pattern (member_id + signature) already exists:
 *   - Increment confidence slightly (capped at 0.9)
 *   - Update last_evidence_at
 *   - Add new evidence to pattern_evidence (bounded)
 *
 * If new:
 *   - Insert as 'emerging'
 */
export function upsertPatternCandidate(
  memberId: string,
  sessionId: string,
  candidate: PatternCandidate
): void {
  // Fire-and-forget (like Bridge D pattern)
  _upsertPatternCandidateAsync(memberId, sessionId, candidate).catch((error) => {
    console.warn('[pattern-detection] Failed to upsert pattern:', {
      memberId: memberId.substring(0, 8) + '...',
      signature: candidate.signature,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}

async function _upsertPatternCandidateAsync(
  memberId: string,
  sessionId: string,
  candidate: PatternCandidate
): Promise<void> {
  // Check if pattern already exists for this member+signature
  const existing = await query(
    `SELECT id, confidence, status
     FROM pattern_ledger
     WHERE member_id = $1
       AND statement = $2
       AND status NOT IN ('rejected', 'retired')
     LIMIT 1`,
    [memberId, candidate.statement]
  );

  let patternId: string;

  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    patternId = row.id;

    // Don't touch confirmed patterns — they belong to the member now
    if (row.status === 'confirmed') {
      return;
    }

    // Increment confidence slightly (capped at 0.9)
    const newConfidence = Math.min(
      Number(row.confidence) + 0.05,
      0.9
    );

    await query(
      `UPDATE pattern_ledger
       SET confidence = $1,
           last_evidence_at = NOW()
       WHERE id = $2`,
      [newConfidence, patternId]
    );
  } else {
    // Insert new emerging pattern
    const result = await query(
      `INSERT INTO pattern_ledger (member_id, statement, evidence_refs, scope, confidence, status)
       VALUES ($1, $2, '[]'::jsonb, $3, $4, 'emerging')
       RETURNING id`,
      [memberId, candidate.statement, candidate.scope, candidate.confidence]
    );
    patternId = result.rows[0].id;
  }

  // Add evidence (bounded)
  const evidenceCount = await query(
    `SELECT COUNT(*)::int as count FROM pattern_evidence WHERE pattern_id = $1`,
    [patternId]
  );

  if (Number(evidenceCount.rows[0].count) < MAX_EVIDENCE_PER_PATTERN) {
    await query(
      `INSERT INTO pattern_evidence (pattern_id, source_type, source_id, excerpt)
       VALUES ($1, 'conversation_turn', $2, $3)
       ON CONFLICT (pattern_id, source_type, source_id) DO NOTHING`,
      [patternId, sessionId, candidate.evidenceExcerpt]
    ).catch(() => {
      // Duplicate evidence is fine — idempotent
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// Entry Point (called from oracle route)
// ═══════════════════════════════════════════════════════════════

/**
 * Process an oracle turn for pattern detection.
 * Fire-and-forget: call without await.
 *
 * @example
 * // In oracle conversation route, after response is generated:
 * processPatternSignal({
 *   memberId: userId,
 *   sessionId,
 *   turnIndex: conversationDepth,
 *   userText: message,
 *   maiaText: maiaResponse.coreMessage,
 *   element: spiralogicCell.element,
 *   phase: spiralogicCell.phase,
 *   motion: voiceHint.motion,
 *   intensity: voiceHint.intensity,
 *   insights: extractedInsights,
 * });
 */
export function processPatternSignal(signal: PatternSignal): void {
  try {
    const candidates = detectPatterns(signal);

    if (candidates.length === 0) return;

    console.log(`[pattern-detection] ${candidates.length} candidate(s) detected:`,
      candidates.map(c => c.signature).join(', ')
    );

    // Upsert each candidate (all fire-and-forget)
    for (const candidate of candidates) {
      upsertPatternCandidate(signal.memberId, signal.sessionId, candidate);
    }
  } catch (error) {
    // Top-level safety — pattern detection must never break oracle
    console.warn('[pattern-detection] processPatternSignal failed:', error);
  }
}
