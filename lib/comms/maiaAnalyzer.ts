/**
 * COMMS SPINE: MAIA Message Analyzer
 *
 * Analyzes client messages for:
 * - Message type classification (reflection, question, win, struggle, etc.)
 * - Urgency inference (normal, time_sensitive, safety_concern)
 * - Safety cue detection (self-harm language, crisis indicators)
 * - Sentiment analysis
 *
 * Current implementation: Conservative heuristic patterns.
 * Future: Swap in real MAIA model call (Claude/Ollama).
 *
 * @module lib/comms/maiaAnalyzer
 */

import { query, queryOne } from '@/lib/db';
import { emitMAIAClassified, emitSafetyFlagged } from './events';
import type { CommsSafetySeverity } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface MaiaClassification {
  inferred_type: string;
  inferred_urgency: 'normal' | 'time_sensitive' | 'safety_concern';
  confidence: number;
  safety_cues: string[];
  sentiment?: number; // -1 to 1
}

export interface MaiaSafetyResult {
  detected: boolean;
  severity?: CommsSafetySeverity;
  cues: string[];
  recommended_action?: string;
  confidence?: number;
}

export interface MaiaAnalysisResult {
  classification: MaiaClassification;
  safety: MaiaSafetyResult;
  analyzed_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PATTERN DEFINITIONS
// Conservative patterns - err on side of flagging
// ─────────────────────────────────────────────────────────────────────────────

const CRISIS_PATTERNS = [
  /\b(suicide|suicidal)\b/i,
  /\b(kill myself|end my life|end it all)\b/i,
  /\b(don'?t want to (live|be alive|exist))\b/i,
  /\b(better off dead)\b/i,
  /\b(planning to (die|hurt myself))\b/i,
  /\b(goodbye|final note)\b/i,
  /\b(no reason to (live|go on))\b/i,
];

const RED_PATTERNS = [
  /\b(self[- ]?harm|cutting|burn myself)\b/i,
  /\b(can'?t (go on|take it|do this))\b/i,
  /\b(want to (die|disappear))\b/i,
  /\b(hurt myself)\b/i,
  /\b(overdose|pills)\b/i,
  /\b(giving away|saying goodbye)\b/i,
  /\b(hopeless|no hope)\b/i,
  /\b(worthless|burden)\b/i,
];

const YELLOW_PATTERNS = [
  /\b(really struggling|barely coping)\b/i,
  /\b(haven'?t (eaten|slept|left))\b/i,
  /\b(drinking|using) (a lot|too much|every day)\b/i,
  /\b(panic attack|anxiety attack)\b/i,
  /\b(can'?t (sleep|eat|function))\b/i,
  /\b(dark (place|thoughts))\b/i,
  /\b(scared of myself)\b/i,
  /\b(feeling (empty|numb|dead inside))\b/i,
];

const TIME_SENSITIVE_PATTERNS = [
  /\b(urgent|emergency|asap|right now)\b/i,
  /\b(need (help|support|to talk) (now|today|immediately))\b/i,
  /\b(crisis|breaking down)\b/i,
  /\b(can'?t wait|time sensitive)\b/i,
];

const TYPE_PATTERNS: Record<string, RegExp[]> = {
  question: [
    /\?$/,
    /^(what|how|why|when|where|can|should|is|are|do|does|would|could)\b/i,
    /\b(wondering|curious|question|ask)\b/i,
  ],
  win: [
    /\b(breakthrough|success|accomplished|achieved|proud|progress|better)\b/i,
    /\b(finally|managed to|was able to)\b/i,
    /\b(excited|happy|grateful|thankful)\b/i,
  ],
  struggle: [
    /\b(struggling|difficult|hard time|tough|challenge)\b/i,
    /\b(anxious|depressed|sad|upset|frustrated)\b/i,
    /\b(can'?t seem to|having trouble)\b/i,
  ],
  logistics: [
    /\b(appointment|schedule|reschedule|cancel|session)\b/i,
    /\b(next week|tomorrow|today|time|date)\b/i,
    /\b(availability|booking|confirm)\b/i,
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ANALYSIS FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect safety concerns in message text.
 */
function detectSafety(text: string): MaiaSafetyResult {
  const cues: string[] = [];
  let severity: CommsSafetySeverity | undefined;
  let confidence = 0;

  // Check crisis patterns first (most severe)
  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(text)) {
      cues.push('crisis_language');
      severity = 'crisis';
      confidence = 0.95;
      break;
    }
  }

  // Check red patterns
  if (!severity) {
    for (const pattern of RED_PATTERNS) {
      if (pattern.test(text)) {
        cues.push('self_harm_language');
        severity = 'red';
        confidence = 0.85;
        break;
      }
    }
  }

  // Check yellow patterns
  if (!severity) {
    for (const pattern of YELLOW_PATTERNS) {
      if (pattern.test(text)) {
        cues.push('distress_indicators');
        severity = 'yellow';
        confidence = 0.70;
        break;
      }
    }
  }

  if (!severity) {
    return { detected: false, cues: [] };
  }

  // Build recommended action based on severity
  const actions: Record<CommsSafetySeverity, string> = {
    crisis: 'IMMEDIATE: Review now. If imminent risk, follow your crisis protocol. Consider contacting emergency services.',
    red: 'URGENT: Review within hours. Assess safety and consider reaching out directly.',
    yellow: 'Monitor: Review within 24 hours. Note for next session discussion.',
  };

  return {
    detected: true,
    severity,
    cues,
    recommended_action: actions[severity],
    confidence,
  };
}

/**
 * Classify message type based on content patterns.
 */
function classifyType(text: string): { type: string; confidence: number } {
  for (const [type, patterns] of Object.entries(TYPE_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return { type, confidence: 0.70 };
      }
    }
  }
  return { type: 'reflection', confidence: 0.50 }; // default
}

/**
 * Infer urgency from content.
 */
function inferUrgency(text: string, safety: MaiaSafetyResult): 'normal' | 'time_sensitive' | 'safety_concern' {
  if (safety.detected) {
    return 'safety_concern';
  }

  for (const pattern of TIME_SENSITIVE_PATTERNS) {
    if (pattern.test(text)) {
      return 'time_sensitive';
    }
  }

  return 'normal';
}

/**
 * Simple sentiment analysis (-1 to 1).
 * Very basic - counts positive vs negative words.
 */
function analyzeSentiment(text: string): number {
  const positiveWords = /\b(good|great|better|happy|grateful|thankful|excited|progress|success|love|hope|positive)\b/gi;
  const negativeWords = /\b(bad|worse|sad|angry|frustrated|anxious|scared|hopeless|hurt|pain|difficult|struggle)\b/gi;

  const positiveCount = (text.match(positiveWords) || []).length;
  const negativeCount = (text.match(negativeWords) || []).length;
  const total = positiveCount + negativeCount;

  if (total === 0) return 0;
  return (positiveCount - negativeCount) / total;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ANALYZER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Analyze a message and update the database with results.
 *
 * This is the main entry point called by the worker.
 * It reads the message, runs analysis, updates maia_analysis,
 * and creates safety flags if needed.
 *
 * @param messageId - The message ID to analyze
 */
export async function analyzeCommsMessage(messageId: string): Promise<MaiaAnalysisResult | null> {
  // Fetch the message
  const msg = await queryOne<{
    id: string;
    thread_id: string;
    body: string;
    sender_type: string;
    maia_analysis: MaiaAnalysisResult | null;
  }>(
    `SELECT id, thread_id, body, sender_type, maia_analysis
     FROM comms_messages
     WHERE id = $1`,
    [messageId]
  );

  if (!msg) {
    console.warn(`[MAIA Analyzer] Message not found: ${messageId}`);
    return null;
  }

  // Only analyze client messages
  if (msg.sender_type !== 'client') {
    console.log(`[MAIA Analyzer] Skipping non-client message: ${messageId}`);
    return null;
  }

  // Skip if already analyzed
  if (msg.maia_analysis) {
    console.log(`[MAIA Analyzer] Already analyzed: ${messageId}`);
    return msg.maia_analysis;
  }

  const text = msg.body || '';

  // Run analysis
  const safety = detectSafety(text);
  const { type: inferredType, confidence: typeConfidence } = classifyType(text);
  const urgency = inferUrgency(text, safety);
  const sentiment = analyzeSentiment(text);

  const classification: MaiaClassification = {
    inferred_type: safety.detected ? 'safety' : inferredType,
    inferred_urgency: urgency,
    confidence: safety.detected ? safety.confidence! : typeConfidence,
    safety_cues: safety.cues,
    sentiment,
  };

  const maiaAnalysis: MaiaAnalysisResult = {
    classification,
    safety,
    analyzed_at: new Date().toISOString(),
  };

  // Update the message with analysis results
  await query(
    `UPDATE comms_messages
     SET maia_analysis = $2, updated_at = NOW()
     WHERE id = $1`,
    [msg.id, JSON.stringify(maiaAnalysis)]
  );

  // Emit classification event
  await emitMAIAClassified(msg.thread_id, msg.id, {
    inferred_type: classification.inferred_type,
    inferred_urgency: classification.inferred_urgency,
    safety_cues: classification.safety_cues,
    sentiment: classification.sentiment ?? 0,
    confidence: classification.confidence,
  });

  // Create safety flag if detected
  if (safety.detected && safety.severity) {
    // Check if flag already exists
    const existingFlag = await queryOne(
      `SELECT id FROM comms_safety_flags WHERE message_id = $1`,
      [msg.id]
    );

    if (!existingFlag) {
      await query(
        `INSERT INTO comms_safety_flags (
          message_id, thread_id, severity, source, cues,
          detection_confidence, recommended_action, maia_rationale
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          msg.id,
          msg.thread_id,
          safety.severity,
          'maia_detected',
          safety.cues,
          safety.confidence ?? 0.5,
          safety.recommended_action ?? '',
          'MAIA analysis detected safety-related language in message content.',
        ]
      );

      // Emit safety flagged event
      await emitSafetyFlagged(msg.thread_id, msg.id, {
        severity: safety.severity,
        detected_by: 'maia_detected',
        confidence: safety.confidence,
        cues: safety.cues,
      });

      console.log(`[MAIA Analyzer] Safety flag created for message ${msg.id}: ${safety.severity}`);
    }
  }

  console.log(`[MAIA Analyzer] Analyzed message ${msg.id}: type=${classification.inferred_type}, urgency=${urgency}`);
  return maiaAnalysis;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export {
  detectSafety,
  classifyType,
  inferUrgency,
  analyzeSentiment,
  CRISIS_PATTERNS,
  RED_PATTERNS,
  YELLOW_PATTERNS,
};
