/**
 * MEMORY WRITEBACK SERVICE
 *
 * Handles promotion of conversation content to long-term memory.
 * Called after each response to break the amnesia loop.
 *
 * Writes to:
 * - developmental_memories (turn capsules, patterns, corrections)
 * - conversation_insights (when high-signal insights detected)
 * - breakthrough_moments (when breakthroughs detected)
 *
 * Respects permission gating via memoryMode:
 * - ephemeral: no writes
 * - continuity: conversation_turns only (handled elsewhere)
 * - longterm: full writeback pipeline
 */

import { query } from '@/lib/db/postgres';
import { containsSensitiveData } from '@/lib/memory/sensitivePatterns';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type MemoryMode = 'ephemeral' | 'continuity' | 'longterm';

export interface WritebackInput {
  userId: string;
  sessionId: string;
  userMessage: string;
  assistantResponse: string;
  facetCode?: string;
  element?: string;
  memoryMode: MemoryMode;
  route?: string;  // FAST, CORE, DEEP
  timestamp?: Date;
  /**
   * GATE 1 (founder ruling 2026-08-09): the route detected an explicit member
   * correction in this exchange. The writeback must preserve "a meaningful
   * correction happened" WITHOUT preserving "the corrected claim remains
   * current truth" — the capsule is typed 'correction', framed as such, and
   * the exchange is never distilled as a breakthrough insight.
   */
  correctionDetected?: boolean;
}

export interface MemoryCapsule {
  // Distilled directional signal — PRIMARY CONTENT for developmental memory.
  // Format: `[core movement]; [direction of shift]; [tone/quality]`
  // See MAIA_MEMORY_CANON_v1.0.md §III and buildDistilledSignal() below.
  // This replaces the prior noisy entity-extraction output as the canonical content_text.
  distilledSignal: string;
  // Whether distillation succeeded or fell through to safe default.
  // `false` = degraded signal, visible in data for observability (not silent).
  signalQuality: 'distilled' | 'degraded';

  // Secondary extracted fields — preserved for future use, not primary content anymore.
  facts: string[];      // Max 6
  preferences: string[];// Max 4
  openLoops: string[];  // Max 3
  entities: string[];   // Max 8 — RETAINED in type but NOT written to content_text
}

// ═══════════════════════════════════════════════════════════════
// TRAJECTORY DISTILLATION — Storage X4 (2026-04-09)
// ═══════════════════════════════════════════════════════════════
//
// Replaces noisy entity extraction with compressed directional signal.
// Format: `[core movement]; [direction of shift]; [tone/quality]`
// Feeds: developmental_memories.content_text (Path A: MemoryBundle → maiaService → LLM)
//
// Design principles (from MAIA_MEMORY_CANON v1.0 §III):
//   - Distill TRAJECTORY, not content.
//   - Do not encode identity. Encode movement.
//   - Do not write archetypal or elemental labels.
//   - Reject noisy outputs rather than ship them degraded.
//
// Guardrail: "Do not train the system to trust noise as signal."

// Core-movement markers: what is happening structurally in this exchange.
// Detected by scanning both user message and assistant response for verb-phrases.
const MOVEMENT_MARKERS: Array<{ regex: RegExp; movement: string }> = [
  // Decision / landing
  { regex: /\bdecid(?:ed|ing|e)\b|\b(?:made|making) (?:a|the) (?:decision|call|choice)\b|\bgoing to\b.*\b(?:end|stop|finish|leave)\b/i, movement: 'decision landing' },
  { regex: /\b(?:time to|ready to|need to) (?:end|close|stop|let go|move on|step back)\b/i, movement: 'closure approaching' },
  { regex: /\b(?:ended|closed|completed|finished|walked away)\b/i, movement: 'closure taken' },
  // Ambivalence / narrowing
  { regex: /\b(?:torn|conflicted|not sure|uncertain|part of me)\b/i, movement: 'ambivalence present' },
  { regex: /\b(?:clearer|clarity|starting to see|becoming clear)\b/i, movement: 'clarity emerging' },
  // Recognition / realization
  { regex: /\b(?:realize|realized|realizing|understand now|see now|get it now|dawning)\b/i, movement: 'recognition forming' },
  { regex: /\b(?:i see that|i see what|now i see|looking back)\b/i, movement: 'recognition forming' },
  // Grief / heaviness / release
  { regex: /\b(?:grief|grieving|mourning|loss|heartbroken)\b/i, movement: 'grief present' },
  { regex: /\b(?:letting go|released|release|surrender)\b/i, movement: 'release moving' },
  // Fear / activation
  { regex: /\b(?:afraid|scared|terrified|anxious|overwhelm(?:ed)?)\b/i, movement: 'activation present' },
  { regex: /\b(?:settl(?:ed|ing)|calming|grounded|steadier)\b/i, movement: 'settling underway' },
  // Boundary / naming
  { regex: /\b(?:boundary|boundaries|said no|held my ground|spoke up)\b/i, movement: 'boundary forming' },
  { regex: /\b(?:transference|projection|dynamic|pattern)\b/i, movement: 'pattern recognized' },
  // Repetition
  { regex: /\b(?:again|keeps happening|same thing|back here|every time|this always)\b/i, movement: 'pattern recurring' },
  // Openness / curiosity
  { regex: /\b(?:wonder|curious|exploring|what if|could i)\b/i, movement: 'inquiry opening' },
  // Integration
  { regex: /\b(?:makes sense|coming together|fitting|integrating|synth(?:esis|esizing))\b/i, movement: 'integration landing' },

  // ── X4.1 (2026-04-10): Recognition / Alignment / Threshold layers ──
  // Added to catch meaning-rich reflective language that the behavioral/clinical
  // patterns above miss. These fire on spiritual, devotional, and emergence-oriented
  // phrasing that is natural to this platform's users.

  // Recognition deepening — vision becoming real, truth landing
  { regex: /\b(?:feels? like (?:magic|a (?:blessing|miracle|dream))|(?:actually|really) (?:happening|becoming|working))\b/i, movement: 'recognition deepening' },
  { regex: /\b(?:achieving|manifesting|bearing fruit|coming (?:true|to life|through))\b/i, movement: 'vision becoming real' },
  { regex: /\b(?:proud|relieved|grateful|blessed|humbled)\b.*\b(?:that|because|for)\b/i, movement: 'recognition deepening' },
  { regex: /\b(?:once (?:only )?dreamed|what (?:was|i) (?:once|always) (?:hoped|imagined|envisioned))\b/i, movement: 'vision becoming real' },
  { regex: /\b(?:i (?:can )?see (?:it|now|what)|it(?:'s| is) (?:actually|really|finally) (?:here|real|happening))\b/i, movement: 'recognition deepening' },

  // Alignment / Devotion — trust stabilizing, following guidance
  { regex: /\b(?:followed (?:the|my|a) (?:path|guidance|guide|calling)|trusted (?:the|my|this) (?:process|path|guidance))\b/i, movement: 'alignment strengthening' },
  { regex: /\b(?:more (?:aligned|devoted|committed) than|deeper (?:alignment|devotion|trust))\b/i, movement: 'devotion deepening' },
  { regex: /\b(?:devoted|devotion|devotional)\b/i, movement: 'devotion deepening' },
  { regex: /\b(?:encouraging|affirming|confirming|validating)\b.*\b(?:path|direction|work|process)\b/i, movement: 'alignment strengthening' },
  { regex: /\b(?:i (?:simply|just) (?:followed|trusted|kept)|stayed (?:the|on) (?:course|path))\b/i, movement: 'alignment strengthening' },

  // Threshold / Exposure — moving from internal to external
  { regex: /\b(?:sharing (?:this|it) with|bringing (?:others|people|someone) (?:in|on board))\b/i, movement: 'exposure threshold' },
  { regex: /\b(?:don'?t want to (?:oversell|overstate|do (?:this|it) wrong)|afraid (?:of|to) (?:misrepresent|get it wrong))\b/i, movement: 'exposure threshold' },
  { regex: /\b(?:vulnerable|vulnerability)\b.*\b(?:sharing|bringing|showing|exposing|telling)\b/i, movement: 'vulnerability surfacing' },
  { regex: /\b(?:most vulnerable|hardest part|scariest (?:part|thing))\b/i, movement: 'vulnerability surfacing' },
  { regex: /\b(?:taking (?:it|this) (?:public|out|forward)|letting (?:it|the world|others) (?:see|in))\b/i, movement: 'exposure threshold' },

  // Expression gap — internal clarity exists but external articulation feels uncertain
  { regex: /\b(?:insecurit(?:y|ies)|concern(?:s|ed)?)\b.*\b(?:how (?:i|to)|communicat|shar|express|represent|articulat)\b/i, movement: 'expression gap emerging' },
  { regex: /\b(?:(?:don'?t|not) (?:always )?know (?:how|the best way) to)\b/i, movement: 'expression gap emerging' },
  { regex: /\b(?:hard(?:est)? to (?:explain|share|articulate|express|describe|put into words))\b/i, movement: 'expression gap emerging' },
  { regex: /\b(?:struggle(?:s)? to (?:explain|communicate|express|convey|describe))\b/i, movement: 'expression gap emerging' },
];

// Direction-of-shift markers: FROM → TOWARD polarity.
// Each entry encodes a transition the system can detect.
const DIRECTION_MARKERS: Array<{ regex: RegExp; direction: string }> = [
  // Reflection → action
  { regex: /\b(?:time to|ready to|going to|will)\b.*\b(?:do|act|move|start|stop|end)\b/i, direction: 'moving from reflection toward action' },
  { regex: /\b(?:decided|decision|made up my mind|ending it|closing it)\b/i, direction: 'moving from deliberation toward commitment' },
  // Overwhelm → orientation
  { regex: /\b(?:starting to see|clearer|makes sense now|i can name)\b/i, direction: 'moving from overwhelm toward orientation' },
  // Immersion → witness
  { regex: /\b(?:stepping back|seeing it|from the outside|noticing that i)\b/i, direction: 'moving from immersion toward witness' },
  // Abstraction → concrete
  { regex: /\b(?:practical|concrete|specific|actually|in reality|on the ground)\b/i, direction: 'moving from abstraction toward concrete choice' },
  // Contraction → opening
  { regex: /\b(?:opening|softening|relaxing|easing|breathing)\b/i, direction: 'moving from contraction toward opening' },
  // Holding → release
  { regex: /\b(?:letting go|releasing|surrendering|loosening grip)\b/i, direction: 'moving from holding toward release' },
  // Confusion → clarity
  { regex: /\b(?:clear|clarity|i see|now i understand)\b/i, direction: 'moving from confusion toward clarity' },
  // Repetition → recognition
  { regex: /\b(?:i see the pattern|i keep doing|here i am again)\b/i, direction: 'moving from repetition toward recognition' },

  // ── X4.1 (2026-04-10): Reflective / meaning-oriented direction layers ──

  // Internal → external (threshold crossing)
  { regex: /\b(?:shar(?:e|ing) (?:this|it)|bring(?:ing)? (?:others|people|someone)|taking (?:it|this) (?:out|public|forward))\b/i, direction: 'moving from internal toward expression' },
  { regex: /\b(?:need (?:support|help) (?:from|with)|ask(?:ing)? (?:for|others))\b/i, direction: 'moving from self-reliance toward receiving' },
  // Vision → reality (emergence)
  { regex: /\b(?:(?:actually|really|finally) (?:happening|working|becoming)|bearing (?:visible )?fruit|dream(?:ed)? (?:of|about).*(?:now|real|here))\b/i, direction: 'moving from vision toward reality' },
  { regex: /\b(?:once (?:only )?dreamed|was (?:only )?imagined|hoped for)\b/i, direction: 'moving from vision toward reality' },
  // Trust → deepening (devotional arc)
  { regex: /\b(?:more (?:devoted|aligned|committed)|deeper (?:trust|alignment|devotion))\b/i, direction: 'direction stabilizing' },
  { regex: /\b(?:followed|trusted) (?:the|my|a) (?:path|process|guidance)\b.*\b(?:and|now|so)\b/i, direction: 'moving from trust toward fruition' },
  // Knowing → articulation (expression gap)
  { regex: /\b(?:know (?:it|this) deeply|know (?:it|this) (?:well|inside)|understand (?:it|this))\b.*\b(?:(?:don'?t|not|hard|struggle) (?:know|always|to))\b/i, direction: 'moving from internal knowing toward articulation' },
  { regex: /\b(?:insecurit|concern|uncertain)\b.*\b(?:communicat|shar|express|represent|articulat)\b/i, direction: 'moving from internal knowing toward articulation' },
];

// Tone/quality markers: adjectives that describe the EMOTIONAL QUALITY of the exchange.
// Detected by scanning both messages for descriptive adjectives, constrained to whitelist.
const TONE_VOCABULARY = [
  'grounded', 'tender', 'careful', 'clear', 'soft', 'resilient', 'strained',
  'anchored', 'sincere', 'settled', 'open', 'wary', 'raw', 'steady',
  'uncertain', 'resolved', 'held', 'fragile', 'quiet', 'direct', 'measured',
  'forward-moving', 'still', 'alert', 'warmed',
  // X4.1 (2026-04-10): reflective/devotional register
  'devoted', 'reflective', 'reverent', 'exposed', 'emergent',
];
const TONE_TRIGGER_PATTERNS: Array<{ regex: RegExp; tones: string[] }> = [
  { regex: /\b(?:settled|landed|grounded|stable)\b/i, tones: ['grounded', 'settled'] },
  { regex: /\b(?:decision|decided|clear)\b/i, tones: ['resolved', 'clear'] },
  { regex: /\b(?:afraid|scared|anxious|overwhelmed)\b/i, tones: ['raw', 'strained'] },
  { regex: /\b(?:grief|grieving|loss|heartbroken)\b/i, tones: ['tender', 'soft'] },
  { regex: /\b(?:careful|slow|measured|gentle)\b/i, tones: ['careful', 'measured'] },
  { regex: /\b(?:honest|direct|real|true)\b/i, tones: ['direct', 'sincere'] },
  { regex: /\b(?:tired|exhausted|drained|depleted)\b/i, tones: ['fragile', 'quiet'] },
  { regex: /\b(?:forward|moving on|next|ready)\b/i, tones: ['forward-moving', 'resolved'] },
  // X4.1 (2026-04-10): reflective/devotional tones
  { regex: /\b(?:magic|blessing|miracle|sacred|holy)\b/i, tones: ['reverent', 'warmed'] },
  { regex: /\b(?:proud|relieved|grateful|blessed|humbled)\b/i, tones: ['warmed', 'grounded'] },
  { regex: /\b(?:devoted|devotion|devotional|aligned|alignment)\b/i, tones: ['devoted', 'steady'] },
  { regex: /\b(?:vulnerable|exposed|naked|bare|out there)\b/i, tones: ['exposed', 'tender'] },
  { regex: /\b(?:encouraging|exciting|alive|emerging|becoming)\b/i, tones: ['emergent', 'forward-moving'] },
  { regex: /\b(?:processing|sitting with|mulling|digesting|integrating)\b/i, tones: ['reflective', 'settled'] },
  // X4.2: expression-gap tone
  { regex: /\b(?:insecur(?:e|ity|ities)|uncertain(?:ty)?|not sure how|don'?t (?:always )?know how)\b/i, tones: ['uncertain', 'careful'] },
];

// Rejection rules: Kelly's constraints. If distilled output contains any of these,
// fall through to the safe degraded default rather than ship noise as signal.
const NOISY_OUTPUT_PATTERNS = [
  /\[/,                                          // brackets
  /\]/,
  /"/,                                           // direct quotes
  /'[a-z]/i,                                     // ragged apostrophe fragments ('ve been, 's)
  /\b[A-Z][a-z]+\b.*\b[A-Z][a-z]+\b.*\b[A-Z][a-z]+\b/, // 3+ proper nouns (likely names)
  /(?:, ){3,}/,                                  // comma-stuffed lists (4+ comma-sep items)
];
function isNoisyOutput(phrase: string): boolean {
  if (NOISY_OUTPUT_PATTERNS.some(p => p.test(phrase))) return true;
  // Clause length check: each of the 3 clauses must be <=16 words
  const clauses = phrase.split(';').map(c => c.trim());
  if (clauses.length !== 3) return true;
  if (clauses.some(c => c.split(/\s+/).length > 16)) return true;
  if (clauses.some(c => c.length === 0)) return true;
  return false;
}

/**
 * Build a trajectory-distilled signal from a single exchange.
 *
 * Produces a phrase in the canonical format:
 *   `[core movement]; [direction of shift]; [tone/quality]`
 *
 * Examples (from MAIA_MEMORY_CANON §III):
 *   - "decision landing; moving from reflection toward action; tone grounded"
 *   - "ambivalence present; moving from deliberation toward commitment; tone careful"
 *
 * Returns `{ signal: string, quality: 'distilled' | 'degraded' }`.
 * On any ambiguity or rejection, returns the safe degraded default.
 * Degraded signals are VISIBLE in the data — not silent — so quality can be observed.
 */
function buildDistilledSignal(
  userMessage: string,
  assistantResponse: string,
  significance: number
): { signal: string; quality: 'distilled' | 'degraded' } {
  const DEGRADED_DEFAULT = 'exchange recorded; direction unclear; tone neutral';
  const combined = `${userMessage} ${assistantResponse}`.toLowerCase();

  // 1. Core movement — first matching marker wins (ordered by priority)
  let movement = '';
  for (const m of MOVEMENT_MARKERS) {
    if (m.regex.test(combined)) {
      movement = m.movement;
      break;
    }
  }

  // 2. Direction of shift — first matching marker wins
  let direction = '';
  for (const d of DIRECTION_MARKERS) {
    if (d.regex.test(combined)) {
      direction = d.direction;
      break;
    }
  }

  // 3. Tone/quality — aggregate hits, take up to 2 distinct tones
  const toneHits = new Set<string>();
  for (const t of TONE_TRIGGER_PATTERNS) {
    if (t.regex.test(combined)) {
      t.tones.forEach(tn => toneHits.add(tn));
    }
  }
  const tones = Array.from(toneHits).slice(0, 2);
  const tone = tones.length === 0
    ? ''
    : tones.length === 1
      ? `tone ${tones[0]}`
      : `tone ${tones[0]} and ${tones[1]}`;

  // If all three components found, assemble.
  // If any is missing, this turn doesn't carry enough signal — return degraded.
  if (!movement || !direction || !tone) {
    return { signal: DEGRADED_DEFAULT, quality: 'degraded' };
  }

  const candidate = `${movement}; ${direction}; ${tone}`;

  // Noisy-output rejection per canon §III
  if (isNoisyOutput(candidate)) {
    return { signal: DEGRADED_DEFAULT, quality: 'degraded' };
  }

  return { signal: candidate, quality: 'distilled' };
}

// Patterns that indicate "stable facts" worth storing
const STABLE_FACT_PATTERNS = [
  /my (?:name) (?:is|was) (.+)/i,  // Name (removed secret/code/phrase)
  /call me (.+)/i,
  /i (?:prefer|like|love|hate|dislike) (.+)/i,
  /i (?:am|'m) (?:a|an) (.+)/i,
  /i work (?:at|for|as) (.+)/i,
  /my (?:partner|wife|husband|friend|dog|cat|child|daughter|son) (?:is|'s) (?:called|named)? ?(.+)/i,
  /(?:don't|never) (.+)/i,  // Boundaries
  /i always (.+)/i,
  /remind me (?:to|that|about) (.+)/i,
  // NEW: Practical coping/help patterns
  /what helps (?:me|is) (.+)/i,
  /when (.+?),?\s*(.+?) helps/i,
  /(.+?) helps (?:me|with) (.+)/i,
  /my goal (?:is|was) (.+)/i,
  /i struggle with (.+)/i,
  /i'm working on (.+)/i,
  /i get (?:anxious|stressed|overwhelmed) when (.+)/i,
];

// ═══════════════════════════════════════════════════════════════
// MEMORY WRITEBACK SERVICE
// ═══════════════════════════════════════════════════════════════

export const MemoryWritebackService = {

  /**
   * MAIN WRITEBACK
   *
   * Called after each response. Analyzes the exchange and writes
   * to long-term memory if conditions are met.
   */
  async writeBack(input: WritebackInput): Promise<{
    wrote: boolean;
    memoryId?: string;
    reason?: string;
  }> {
    const { userId, sessionId, userMessage, assistantResponse, memoryMode } = input;

    // Permission gate: check memoryMode
    if (memoryMode === 'ephemeral') {
      console.log('[MemoryWriteback] Skipping - ephemeral mode');
      return { wrote: false, reason: 'ephemeral_mode' };
    }

    if (memoryMode === 'continuity') {
      console.log('[MemoryWriteback] Continuity mode - turns only, no promotion');
      return { wrote: false, reason: 'continuity_mode' };
    }

    // Longterm mode: analyze and write
    console.log(`[MemoryWriteback] Analyzing exchange for user: ${userId}`);

    // SECURITY GATE: Block sensitive data from ever entering memory
    if (containsSensitiveData(userMessage)) {
      console.log('[MemoryWriteback] 🔒 BLOCKED - sensitive data detected (secrets never stored)');
      return { wrote: false, reason: 'sensitive_blocked' };
    }

    // Detect stable facts
    const extractedFacts = this.extractStableFacts(userMessage);

    // Calculate significance
    const significance = this.calculateSignificance(userMessage, assistantResponse, extractedFacts);

    // Gate: only write if significance >= 0.35 OR stable facts found
    if (significance < 0.35 && extractedFacts.length === 0) {
      console.log(`[MemoryWriteback] Skipping - low significance (${significance.toFixed(2)}) and no stable facts`);
      return { wrote: false, reason: 'below_threshold' };
    }

    // Build memory capsule (includes Storage X4 distilled trajectory signal)
    const capsule = this.buildCapsule(userMessage, assistantResponse, extractedFacts, significance);

    // GATE 1: a corrective exchange is remembered AS a correction event.
    // The distilled signal is framed so future retrieval reads "the member
    // corrected MAIA's understanding here" — never the corrected claim as a
    // standing fact about the member. Correction keeps its significance
    // (being corrected is developmentally important); what changes is the
    // memory's TYPE and frame.
    if (input.correctionDetected) {
      capsule.distilledSignal =
        `member corrected MAIA's prior understanding; ${capsule.distilledSignal}`;
    }

    // Write to developmental_memories
    try {
      const memoryId = await this.writeDevelopmentalMemory({
        userId,
        sessionId,
        userMessage,
        assistantResponse,
        significance,
        capsule,
        facetCode: input.facetCode,
        route: input.route,
        timestamp: input.timestamp,
        memoryType: input.correctionDetected ? 'correction' : undefined,
      });

      console.log(`✅ [MemoryWriteback] Promoted to developmental_memories: ${memoryId}`);

      // Check for breakthrough (lowered threshold for spiral-relative awareness)
      // Breakthroughs at any level are meaningful and worth recording.
      // GATE 1: a corrective exchange is never distilled as a breakthrough
      // insight — that path would re-assert the corrected material as an
      // achieved understanding.
      if (!input.correctionDetected &&
          (significance >= 0.5 || this.isBreakthroughPattern(userMessage, assistantResponse))) {
        await this.writeBreakthroughMoment({
          userId,
          sessionId,
          insight: this.extractInsight(userMessage, assistantResponse),
          element: input.element,
        });
        console.log(`⭐ [MemoryWriteback] Breakthrough moment recorded (significance: ${significance.toFixed(2)})`);
      }

      return { wrote: true, memoryId };

    } catch (err) {
      console.error('[MemoryWriteback] Write failed:', err);
      return { wrote: false, reason: 'write_error' };
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // FACT EXTRACTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Extract stable facts from user message
   */
  extractStableFacts(userMessage: string): string[] {
    const facts: string[] = [];

    for (const pattern of STABLE_FACT_PATTERNS) {
      const match = userMessage.match(pattern);
      if (match) {
        // Clean up the extracted fact
        const fact = match[0].trim();
        if (fact.length > 5 && fact.length < 200) {
          facts.push(fact);
        }
      }
    }

    return facts.slice(0, 6); // Max 6 facts
  },

  /**
   * Extract entities (names, places, concepts)
   */
  extractEntities(text: string): string[] {
    const entities: string[] = [];

    // Capitalized words (potential names/places)
    const caps: string[] = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || [];
    const stopWords = ['The', 'This', 'That', 'What', 'How', 'Why', 'When', 'Where'];
    entities.push(...caps.filter(c => c.length > 2 && !stopWords.includes(c)));

    // Quoted strings
    const quoted: string[] = text.match(/"([^"]+)"|'([^']+)'/g) || [];
    entities.push(...quoted.map(q => q.replace(/['"]/g, '')));

    // Dedupe and limit
    return Array.from(new Set(entities)).slice(0, 8);
  },

  // ═══════════════════════════════════════════════════════════════
  // SIGNIFICANCE SCORING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Calculate significance score (0-1)
   */
  calculateSignificance(
    userMessage: string,
    assistantResponse: string,
    extractedFacts: string[]
  ): number {
    let score = 0.3; // Base score

    // Stable facts boost
    if (extractedFacts.length > 0) {
      score += 0.2 * Math.min(extractedFacts.length, 3);
    }

    // Length indicates depth
    if (userMessage.length > 200) score += 0.1;
    if (assistantResponse.length > 500) score += 0.1;

    // Emotional indicators
    if (/!\s|thank|grateful|realize|understand|breakthrough|insight/i.test(userMessage)) {
      score += 0.15;
    }

    // Personal disclosure
    if (/i feel|i think|i believe|i'm afraid|i love|i hate/i.test(userMessage)) {
      score += 0.1;
    }

    // Correction pattern (learning opportunity)
    if (/no,|actually|not quite|that's not|i meant/i.test(userMessage)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  },

  // ═══════════════════════════════════════════════════════════════
  // CAPSULE BUILDING
  // ═══════════════════════════════════════════════════════════════

  /**
   * Build a compressed memory capsule.
   *
   * As of Storage X4 (2026-04-09), the primary output is `distilledSignal` —
   * a trajectory phrase in the format `[core movement]; [direction of shift]; [tone/quality]`.
   * See buildDistilledSignal() above.
   *
   * `entities`, `facts`, `preferences`, `openLoops` are still computed but
   * are NO LONGER written to content_text. They may be used for future
   * observability or secondary indexing.
   */
  buildCapsule(
    userMessage: string,
    assistantResponse: string,
    extractedFacts: string[],
    significance: number = 0.5
  ): MemoryCapsule {
    // PRIMARY: distilled trajectory signal
    const { signal, quality } = buildDistilledSignal(userMessage, assistantResponse, significance);

    // SECONDARY: legacy extracted fields (not written to content_text)
    const entities = this.extractEntities(userMessage + ' ' + assistantResponse);

    const preferences: string[] = [];
    const prefMatch = userMessage.match(/i (?:prefer|like|love|want|need) (.+?)(?:\.|$)/gi);
    if (prefMatch) {
      preferences.push(...prefMatch.slice(0, 4));
    }

    const openLoops: string[] = [];
    if (/\?$/.test(userMessage.trim())) {
      openLoops.push(`Question: ${userMessage.substring(0, 80)}`);
    }
    const commitMatch = userMessage.match(/i will|i'm going to|remind me|next time/gi);
    if (commitMatch) {
      openLoops.push(`Commitment: ${commitMatch[0]}`);
    }

    return {
      distilledSignal: signal,
      signalQuality: quality,
      facts: extractedFacts,
      preferences: preferences.slice(0, 4),
      openLoops: openLoops.slice(0, 3),
      entities: entities.slice(0, 8),
    };
  },

  /**
   * Format capsule as text for storage.
   *
   * Storage X4 (2026-04-09): content_text is now the distilled trajectory signal
   * in the canonical format `[core movement]; [direction of shift]; [tone/quality]`.
   * The prior noisy entity-extraction output has been removed from content_text
   * entirely. See MAIA_MEMORY_CANON_v1.0.md §III and buildDistilledSignal() above.
   */
  formatCapsuleText(capsule: MemoryCapsule): string {
    return capsule.distilledSignal;
  },

  // ═══════════════════════════════════════════════════════════════
  // DATABASE WRITES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Write to developmental_memories
   * Uses exact SQL from user guidance
   */
  async writeDevelopmentalMemory(input: {
    userId: string;
    sessionId: string;
    userMessage: string;
    assistantResponse: string;
    significance: number;
    capsule: MemoryCapsule;
    facetCode?: string;
    route?: string;
    timestamp?: Date;
    /** GATE 1: 'correction' types the row per the developmental_memories CHECK. */
    memoryType?: 'correction';
  }): Promise<string> {
    const { userId, sessionId, userMessage, assistantResponse, significance, capsule, facetCode, route } = input;

    // Storage X4 (2026-04-09):
    // Raw exchange is preserved under `trigger_event.raw` so the original substrate
    // remains recoverable for re-distillation, audit, or entity-extraction revisits
    // without polluting content_text. Only the distilled trajectory signal is canonical.
    // See MAIA_MEMORY_CANON_v1.0.md §III.
    const triggerEvent = {
      sessionId,
      route: route || 'unknown',
      ts: new Date().toISOString(),
      raw: {
        userMessage: userMessage.substring(0, 500),
        assistantResponse: assistantResponse.substring(0, 500),
      },
      signalQuality: capsule.signalQuality,
    };

    const contentText = this.formatCapsuleText(capsule);

    // SCOPE BOUNDARY (per Kelly 2026-04-09):
    // This distilled signal feeds MemoryBundle → maiaService → LLM (Path A /between/chat).
    // It does NOT affect MemoryPalaceOrchestrator (Path B /oracle/conversation).
    // Any cross-path alignment between Path A and Path B must be handled separately
    // as a deliberate phase boundary. Do not unify memory systems without an explicit
    // architectural decision. See MAIA_WIRING_AUDIT_v1.0.md Q1 and §3 finding #3.

    // NOTE (2026-04-09): Removed columns that do not exist in production schema:
    // authority, scope, source, immutable, updated_at. These were the cause of silent
    // writeback failure — developmental_memories was stuck at 0 rows platform-wide.
    // See MAIA_MEMORY_CANON_v1.0.md §VIII. Column set below is verified against the
    // actual developmental_memories table structure.
    const result = await query(`
      INSERT INTO developmental_memories (
        user_id,
        memory_type,
        trigger_event,
        facet_code,
        spiral_cycle,
        significance,
        vector_embedding,
        entity_tags,
        user_feedback,
        source_beads_task_id,
        source_ain_session_id,
        source_consciousness_entry_id,
        content_text,
        recall_count,
        last_recalled_at,
        formed_at
      ) VALUES (
        $1,
        $2,
        $3::jsonb,
        $4,
        NULL,
        $5,
        NULL,
        $6::text[],
        NULL,
        NULL,
        $7,
        NULL,
        $8,
        0,
        NULL,
        NOW()
      )
      RETURNING id
    `, [
      userId,
      // NOTE (2026-04-09 Phase A.1): Changed from 'turn_capsule' to 'pattern' —
      // developmental_memories.memory_type has a CHECK constraint that only allows:
      // effective_practice, ineffective_practice, spiral_transition, breakthrough_emergence,
      // ain_deliberation, correction, pattern, emergent_pattern.
      // 'turn_capsule' was never a valid value and was causing writeback to fail loudly
      // after the Phase A column-drift fix exposed the underlying check-constraint drift.
      // 'pattern' is the closest semantic match for a generic significant-exchange memory.
      // GATE 1 (2026-08-09): corrective exchanges now route to 'correction' —
      // the Phase B item for that case is done. Other precise types
      // (effective_practice when significance >= 0.8, etc.) remain future work.
      input.memoryType ?? 'pattern',
      JSON.stringify(triggerEvent),
      facetCode || null,
      significance,
      capsule.entities,
      sessionId,
      contentText,
    ]);

    const insertedId = result.rows[0]?.id;

    // TEMP DIAGNOSTIC (Phase A — remove in Phase B when memoryHealth dashboard lands):
    // Confirms writeback is actually landing AND reports signal quality so we can
    // observe degraded-vs-distilled rate. See MAIA_MEMORY_CANON_v1.0.md §VII.
    console.log('[MemoryWriteback] success', {
      userId,
      memoryType: 'pattern',
      memoryId: insertedId,
      facetCode: facetCode || null,
      significance,
      signalQuality: capsule.signalQuality,
      signalPreview: contentText.substring(0, 120),
    });

    return insertedId;
  },

  /**
   * Write to breakthrough_moments
   */
  async writeBreakthroughMoment(input: {
    userId: string;
    sessionId: string;
    insight: string;
    element?: string;
  }): Promise<string> {
    const { userId, sessionId, insight, element } = input;

    const result = await query(`
      INSERT INTO breakthrough_moments (
        user_id,
        timestamp,
        insight,
        element,
        integrated,
        related_themes,
        conversation_id,
        created_at,
        updated_at
      ) VALUES (
        $1,
        NOW(),
        $2,
        $3,
        FALSE,
        ARRAY[]::text[],
        $4,
        NOW(),
        NOW()
      )
      RETURNING id
    `, [userId, insight, element || null, sessionId]);

    return result.rows[0]?.id;
  },

  /**
   * Write to conversation_insights (safe version - session_id = NULL)
   */
  async writeConversationInsight(input: {
    userId: string;
    sessionId: string;
    insightText: string;
    insightType: string;
    precedingMessages: any[];
    significance: number;
  }): Promise<string> {
    const { userId, sessionId, insightText, insightType, precedingMessages, significance } = input;

    // Note: session_id is uuid but our sessionIds are strings
    // Per user guidance: use NULL for session_id, put string in conversation_context
    const result = await query(`
      INSERT INTO conversation_insights (
        session_id,
        user_id,
        insight_text,
        insight_type,
        conversation_context,
        preceding_messages,
        insight_embedding,
        insight_significance,
        created_at
      ) VALUES (
        NULL,
        $1,
        $2,
        $3,
        $4,
        $5::jsonb,
        NULL,
        $6,
        NOW()
      )
      RETURNING id
    `, [
      userId,
      insightText,
      insightType,
      sessionId, // Put string session ID in conversation_context
      JSON.stringify(precedingMessages),
      significance,
    ]);

    return result.rows[0]?.id;
  },

  // ═══════════════════════════════════════════════════════════════
  // PATTERN DETECTION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Detect if exchange contains a breakthrough pattern
   */
  isBreakthroughPattern(userMessage: string, assistantResponse: string): boolean {
    const text = userMessage + ' ' + assistantResponse;
    const patterns = [
      /breakthrough|epiphany|realized|just understood/i,
      /now i see|finally get|makes sense now/i,
      /i never thought|changed my mind|new perspective/i,
      /thank you.*profound|deeply grateful/i,
    ];

    return patterns.some(p => p.test(text));
  },

  /**
   * Extract insight text for breakthrough
   */
  extractInsight(userMessage: string, assistantResponse: string): string {
    // Try to find the insight in user message first
    const insightMatch = userMessage.match(/i (?:realized|understand|see) (.+?)(?:\.|!|$)/i);
    if (insightMatch) {
      return insightMatch[1].substring(0, 200);
    }

    // Fallback: first sentence of user message
    const firstSentence = userMessage.split(/[.!?]/)[0];
    return firstSentence.substring(0, 200);
  },
};

export default MemoryWritebackService;
