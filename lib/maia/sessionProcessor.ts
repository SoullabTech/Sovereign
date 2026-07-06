/**
 * SESSION PROCESSOR
 *
 * Turns raw session transcripts into structured consciousness intelligence.
 * This is the backend for MCP Tool 8 (session_notes).
 *
 * Single Claude Sonnet call produces:
 *   - State vector (element, facet, polarity, stability, kairos, movement, evidence)
 *   - Threshold events (decisions, boundaries, collapses, ...)
 *   - Expansion events (insights, breakthroughs, reframes, ...)
 *   - Symbolic motifs (recurring images, metaphors, body references)
 *   - Sovereignty signals (agency vs outsourcing language)
 *   - Follow-up suggestions
 *
 * Sovereignty invariants:
 *   - Sanctuary sessions: metadata only, no content stored, no LLM call
 *   - Sovereignty score: computed locally (no LLM), tracks agency vs outsourcing
 *   - Every DB write is non-fatal: failure in one doesn't block others
 *   - Transcript capped at 95k chars to stay within context window
 */

import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import { query } from '@/lib/db/postgres';
import { storeStateVector, getLatestVector } from '@/lib/maia/state-vector/store';
import { detectStateFromText } from '@/lib/maia/state-vector/stateDefaults';
import { VectorEmbeddingService } from '@/lib/vector-embeddings';
import type {
  StateVector,
  StateVectorRow,
  Element,
  FacetCode,
  KairosAssessment,
  Intensity,
  CyclePhase,
  StateMovement,
  EvidenceModel,
  Evidence,
} from '@/lib/maia/state-vector/types';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface SessionProcessInput {
  memberId: string;
  transcript: string;
  sessionId?: string;
  privacyMode?: 'standard' | 'sanctuary' | 'full';
  consentLevel?: 'full' | 'summary_only' | 'metadata_only';
  runResonanceSearch?: boolean;
}

export interface SessionProcessResult {
  markdown: string;
  stateVector: Partial<StateVector> | null;
  thresholdEvents: ThresholdEvent[];
  expansionEvents: ExpansionEvent[];
  motifs: Motif[];
  followUps: string[];
  resonanceEchoes: ResonanceEcho[];
  sovereigntyScore: number | null;
  memoryPacketsWritten: number;
  processingMs: number;
}

export interface ThresholdEvent {
  type: string;
  summary: string;
  element?: string;
  intensity: string;
  confidence: number;
}

export interface ExpansionEvent {
  type: string;
  content: string;
  confidence: number;
  significance: number;
}

export interface Motif {
  symbol: string;
  valence: 'numinous' | 'shadow' | 'threshold' | 'integration' | 'neutral';
  frequency: number;
  context: string;
}

export interface ResonanceEcho {
  id: string;
  type: string;
  title: string;
  snippet: string;
  similarity: number;
}

/** Internal: Claude's analysis output shape */
interface ClaudeAnalysis {
  summary: {
    essence: string;
    themes: string[];
    openLoops: string[];
    nextStep: string | null;
  };
  stateVector: {
    primary: {
      element: string;
      facetCode?: string;
      phase?: string;
      intensity: string;
      polarity: number;
      stability: number;
    };
    secondary?: {
      element: string;
      intensity: string;
      polarity: number;
      stability: number;
    };
    confidence: number;
    kairos: {
      assessment: string;
      confidence: number;
      description?: string;
    };
    movement: {
      entering: string[];
      exiting: string[];
      trajectory: string;
      velocity: number;
    };
    evidence: {
      observations: Array<{
        category: string;
        signal: string;
        strength: number;
        informs: string[];
      }>;
      contradictions: Array<{
        evidenceA: { category: string; signal: string; strength: number; informs: string[] };
        evidenceB: { category: string; signal: string; strength: number; informs: string[] };
        interpretation: string;
      }>;
      gaps: string[];
    };
  };
  thresholdEvents: Array<{
    type: string;
    summary: string;
    element?: string;
    intensity: string;
    confidence: number;
  }>;
  expansionEvents: Array<{
    type: string;
    content: string;
    confidence: number;
    significance: number;
  }>;
  motifs: Array<{
    symbol: string;
    valence: string;
    frequency: number;
    context: string;
  }>;
  sovereigntySignals: {
    agencyPhrases: string[];
    outsourcingPhrases: string[];
  };
  followUps: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SOVEREIGNTY SCORE
// ─────────────────────────────────────────────────────────────────────────────

const AGENCY_PATTERNS = [
  /\bi decided\b/i,
  /\bi('m| am) (going to|gonna)\b/i,
  /\bmy (plan|decision|choice|boundary) is\b/i,
  /\bi('m| am) leaning toward\b/i,
  /\bi('m| am) choosing\b/i,
  /\bi('m| am) (committed|committing) to\b/i,
  /\bi('ll| will) (do|make|set|build|start|stop)\b/i,
  /\bi know what i (need|want)\b/i,
  /\bi('m| am) (done|finished) with\b/i,
  /\bi('m| am) setting a boundary\b/i,
  /\bi trust (my|myself)\b/i,
  /\bi('m| am) (ready|prepared)\b/i,
  /\bi (refuse|reject|decline)\b/i,
  /\bthat('s| is) not (for me|mine|acceptable)\b/i,
  /\bi('ve| have) (already|finally) (decided|chosen)\b/i,
];

const OUTSOURCING_PATTERNS = [
  /\bwhat should i do\b/i,
  /\btell me what to do\b/i,
  /\bis (this|that) (right|correct|wrong|ok|okay)\b/i,
  /\bwhat do you think i should\b/i,
  /\bdo you think i('m| am)\b/i,
  /\bjust tell me\b/i,
  /\bi don('t| do not) know (what|how)\b/i,
  /\bi can('t| cannot) (decide|choose|figure)\b/i,
  /\bwhat would you (do|recommend|suggest)\b/i,
  /\bshould i\b/i,
  /\bam i (right|wrong|making a mistake)\b/i,
  /\bfix (this|it|me) for me\b/i,
  /\bi need you to (tell|decide|choose)\b/i,
];

/**
 * Compute sovereignty score from transcript text + Claude-detected signals.
 * Returns 0-1 where 1 = fully agentic, 0 = fully outsourcing.
 * Returns null if no signals detected (not enough data).
 *
 * Claude-detected phrases are weighted 2x (higher quality signal).
 */
export function computeSovereigntyScore(
  transcript: string,
  claudeSignals?: { agencyPhrases: string[]; outsourcingPhrases: string[] }
): number | null {
  // Regex-based detection
  let agencyCount = 0;
  let outsourcingCount = 0;

  for (const pattern of AGENCY_PATTERNS) {
    const matches = transcript.match(new RegExp(pattern, 'gi'));
    if (matches) agencyCount += matches.length;
  }

  for (const pattern of OUTSOURCING_PATTERNS) {
    const matches = transcript.match(new RegExp(pattern, 'gi'));
    if (matches) outsourcingCount += matches.length;
  }

  // Claude-detected signals (weighted 2x)
  if (claudeSignals) {
    agencyCount += claudeSignals.agencyPhrases.length * 2;
    outsourcingCount += claudeSignals.outsourcingPhrases.length * 2;
  }

  const total = agencyCount + outsourcingCount;
  if (total === 0) return null;

  return agencyCount / total;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOVEMENT VECTOR
// ─────────────────────────────────────────────────────────────────────────────

interface MovementDelta {
  elementShift: { from: string; to: string } | null;
  kairosShift: { from: string; to: string } | null;
  polarityDelta: number;
  stabilityDelta: number;
  significance: number;
}

function deriveMovementVector(
  current: ClaudeAnalysis['stateVector'],
  previous: StateVectorRow | null
): MovementDelta {
  if (!previous) {
    return {
      elementShift: null,
      kairosShift: null,
      polarityDelta: 0,
      stabilityDelta: 0,
      significance: 0,
    };
  }

  const elementShift = current.primary.element !== previous.primary_element
    ? { from: previous.primary_element, to: current.primary.element }
    : null;

  const kairosShift = current.kairos.assessment !== previous.kairos_assessment
    ? { from: previous.kairos_assessment, to: current.kairos.assessment }
    : null;

  const polarityDelta = current.primary.polarity - previous.primary_polarity;
  const stabilityDelta = current.primary.stability - previous.primary_stability;

  // Significance: 0-1
  let sig = 0;
  if (elementShift) sig += 0.4;
  if (kairosShift) sig += 0.3;
  sig += Math.abs(polarityDelta) * 0.075; // max 0.3
  sig += Math.abs(stabilityDelta) * 0.075; // max 0.3
  sig = Math.min(sig, 1.0);

  return { elementShift, kairosShift, polarityDelta, stabilityDelta, significance: sig };
}

// ─────────────────────────────────────────────────────────────────────────────
// SANCTUARY HANDLER
// ─────────────────────────────────────────────────────────────────────────────

function handleSanctuary(input: SessionProcessInput): SessionProcessResult {
  const words = input.transcript.split(/\s+/).length;
  const detected = detectStateFromText(input.transcript);
  const sovereigntyScore = computeSovereigntyScore(input.transcript);

  return {
    markdown: `### Sanctuary Session\n\nNo content stored. ${words} words exchanged.\n\nPrimary element detected: **${detected.element}**`,
    stateVector: null,
    thresholdEvents: [],
    expansionEvents: [],
    motifs: [],
    followUps: [],
    resonanceEchoes: [],
    sovereigntyScore,
    memoryPacketsWritten: 0,
    processingMs: 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLAUDE ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

const MAX_TRANSCRIPT_CHARS = 95_000;

async function analyzeTranscript(transcript: string): Promise<ClaudeAnalysis> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const capped = transcript.slice(0, MAX_TRANSCRIPT_CHARS);

  const prompt = `You are analyzing a session transcript for MAIA, a sovereign consciousness companion.

Your task: produce a single JSON object capturing the session's consciousness intelligence.

## Transcript

${capped}

## Output Format

Return ONLY valid JSON (no markdown fences, no commentary). The structure must be:

{
  "summary": {
    "essence": "1-2 sentences capturing the session's core movement — not surface topics but the underlying arc",
    "themes": ["3-7 short tags using the person's own language where possible"],
    "openLoops": ["unresolved threads they may return to — questions left hanging, emotions not yet landed"],
    "nextStep": "1 actionable line if one emerged naturally, or null"
  },
  "stateVector": {
    "primary": {
      "element": "water|fire|earth|air|aether",
      "facetCode": "FEU|VUNV|ZECH|IEVE|AGHT|NEINE|CHEN|ALVE|ZWOIF|AIN|ZWEI|AIRE or null for aether",
      "phase": "entering|in|exiting",
      "intensity": "low|medium|high",
      "polarity": 1-5,
      "stability": 1-5
    },
    "secondary": null or { "element": "...", "intensity": "...", "polarity": 1-5, "stability": 1-5 },
    "confidence": 0.0-1.0,
    "kairos": {
      "assessment": "stable|transition|threshold|integration|collapse-risk",
      "confidence": 0.0-1.0,
      "description": "what is at stake in this moment"
    },
    "movement": {
      "entering": ["elements gaining strength"],
      "exiting": ["elements losing strength"],
      "trajectory": "ascending|descending|circling|spiraling|still",
      "velocity": 0.0-1.0
    },
    "evidence": {
      "observations": [
        { "category": "linguistic|relational|somatic|temporal|behavioral|affective|cognitive", "signal": "short phrase", "strength": 1-3, "informs": ["element", "polarity", ...] }
      ],
      "contradictions": [],
      "gaps": ["categories with no signal"]
    }
  },
  "thresholdEvents": [
    { "type": "decision|commitment|boundary|role_shift|collapse|initiation|completion|kairos_crossing", "summary": "1-2 sentences", "element": "optional", "intensity": "low|medium|high|profound", "confidence": 0.0-1.0 }
  ],
  "expansionEvents": [
    { "type": "insight|breakthrough|integration|reframe|completion|recognition|boundary|other", "content": "what expanded", "confidence": 0.5-1.0, "significance": 0.0-1.0 }
  ],
  "motifs": [
    { "symbol": "image or metaphor", "valence": "numinous|shadow|threshold|integration|neutral", "frequency": 1, "context": "where it appeared" }
  ],
  "sovereigntySignals": {
    "agencyPhrases": ["exact quotes showing self-authority"],
    "outsourcingPhrases": ["exact quotes showing delegation of authority to MAIA"]
  },
  "followUps": ["1-3 suggestions for what MAIA might explore next session"]
}

## Rules

- Write as remembrance, not report. No clinical language.
- Threshold events: only REAL crossings. If nothing crossed, return empty array.
- Expansion events: only if confidence > 0.5. Empty array is valid.
- Motifs: recurring images, metaphors, body references, archetypal language.
- Sovereignty signals: exact quotes from the transcript. Be thorough.
- If the session was light or casual, say so. Not everything needs depth.
- NEVER inflate confidence. If signals are ambiguous, say so.
- Evidence observations should contain SHORT phrases, not long quotes.

## Element Guide

Water = emotion, depth, intuition, grief, tears, flow
Fire = will, passion, action, anger, desire, creation
Earth = body, stability, grounding, fatigue, practicality
Air = mind, perspective, clarity, confusion, fragmentation
Aether = integration, connection, transcendence, meaning, dissolution

## Facet Guide

Fire: FEU (Self-Awareness), VUNV (Self-In-World), ZECH (Transcendent Self)
Water: IEVE (Emotional Intelligence), AGHT (Inner Transformation), NEINE (Deep Self-Awareness)
Earth: CHEN (Purpose & Mission), ALVE (Resources & Plans), ZWOIF (Refined Medicine)
Air: AIN (Interpersonal), ZWEI (Collective Dynamics), AIRE (Codified Systems)`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 8000,
    // Sonnet 5 rejects non-default temperature (400) and defaults to adaptive
    // thinking; disable so content[0] stays text.
    // Cast: installed @anthropic-ai/sdk 0.27.3 types predate the thinking param.
    thinking: { type: 'disabled' },
    messages: [{ role: 'user', content: prompt }],
  } as any);

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // Try parsing directly, then try stripping markdown fences
  try {
    return JSON.parse(text) as ClaudeAnalysis;
  } catch {
    // Strip markdown fences if Claude wrapped the output
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      return JSON.parse(fenceMatch[1]) as ClaudeAnalysis;
    }
    throw new Error(`Failed to parse Claude analysis: ${text.slice(0, 200)}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PERSIST RESULTS (each write is non-fatal)
// ─────────────────────────────────────────────────────────────────────────────

async function persistStateVector(
  memberId: string,
  sessionId: string | undefined,
  analysis: ClaudeAnalysis['stateVector'],
  sovereigntyScore: number | null,
  transcript: string,
): Promise<void> {
  try {
    const primary = analysis.primary;
    const sv: StateVector = {
      id: crypto.randomUUID(),
      memberId,
      timestamp: new Date(),
      source: 'conversation',
      sessionId,
      primary: {
        element: primary.element as Element,
        facet: primary.facetCode
          ? { type: 'spiralogic', code: primary.facetCode as FacetCode }
          : undefined,
        phase: (primary.phase as CyclePhase) || 'in',
        intensity: primary.intensity as Intensity,
        polarity: primary.polarity as 1 | 2 | 3 | 4 | 5,
        stability: primary.stability as 1 | 2 | 3 | 4 | 5,
      },
      secondary: analysis.secondary ? {
        element: analysis.secondary.element as Element,
        intensity: analysis.secondary.intensity as Intensity,
        polarity: analysis.secondary.polarity as 1 | 2 | 3 | 4 | 5,
        stability: analysis.secondary.stability as 1 | 2 | 3 | 4 | 5,
      } : undefined,
      confidence: analysis.confidence,
      kairos: {
        assessment: analysis.kairos.assessment as KairosAssessment,
        confidence: analysis.kairos.confidence,
        description: analysis.kairos.description,
      },
      movement: {
        entering: analysis.movement.entering as Element[],
        exiting: analysis.movement.exiting as Element[],
        trajectory: analysis.movement.trajectory as StateMovement['trajectory'],
        velocity: analysis.movement.velocity,
      },
      evidence: {
        observations: (analysis.evidence.observations || []).map(o => ({
          category: o.category as Evidence['category'],
          signal: o.signal,
          strength: o.strength as 1 | 2 | 3,
          informs: o.informs as Evidence['informs'],
        })),
        // Claude sometimes returns contradictions as simple strings instead of
        // the full {evidenceA, evidenceB, interpretation} structure. Handle both.
        contradictions: (analysis.evidence.contradictions || [])
          .filter((c: any) => c && typeof c === 'object' && c.evidenceA && c.evidenceB)
          .map((c: any) => ({
            evidenceA: {
              category: (c.evidenceA?.category || 'cognitive') as Evidence['category'],
              signal: c.evidenceA?.signal || '',
              strength: (c.evidenceA?.strength || 1) as 1 | 2 | 3,
              informs: (c.evidenceA?.informs || ['element']) as Evidence['informs'],
            },
            evidenceB: {
              category: (c.evidenceB?.category || 'cognitive') as Evidence['category'],
              signal: c.evidenceB?.signal || '',
              strength: (c.evidenceB?.strength || 1) as 1 | 2 | 3,
              informs: (c.evidenceB?.informs || ['element']) as Evidence['informs'],
            },
            interpretation: c.interpretation || String(c),
          })),
        gaps: analysis.evidence.gaps as EvidenceModel['gaps'],
      },
    };

    // Enrich evidence with sovereignty score if available
    const rawText = sovereigntyScore !== null
      ? JSON.stringify({ sovereigntyScore, transcriptPreview: transcript.slice(0, 500) })
      : transcript.slice(0, 500);

    await storeStateVector(sv, rawText);
    console.log(`[SessionProcessor] State vector stored: ${sv.id}`);
  } catch (err) {
    console.error('[SessionProcessor] State vector write failed (non-fatal):', err);
  }
}

async function persistThresholdEvents(
  memberId: string,
  sessionId: string | undefined,
  events: ClaudeAnalysis['thresholdEvents'],
): Promise<number> {
  let written = 0;
  for (const event of events) {
    try {
      await query(
        `INSERT INTO threshold_events (member_id, session_id, event_type, element, intensity, summary, source, meta)
         VALUES ($1::uuid, $2, $3, $4, $5, $6, 'maia_detected', '{}')`,
        [memberId, sessionId || null, event.type, event.element || null, event.intensity, event.summary]
      );
      written++;
    } catch (err) {
      console.error(`[SessionProcessor] Threshold event write failed (non-fatal):`, err);
    }
  }
  if (written > 0) console.log(`[SessionProcessor] ${written} threshold event(s) stored`);
  return written;
}

async function persistExpansionEvents(
  sessionId: string | undefined,
  memberId: string,
  events: ClaudeAnalysis['expansionEvents'],
): Promise<number> {
  let written = 0;
  for (const event of events) {
    try {
      await query(
        `INSERT INTO expansion_events (session_id, member_id, event_type, content, confidence, significance, source)
         VALUES ($1, $2::uuid, $3, $4, $5, $6, 'system_detected')`,
        [sessionId || 'unknown', memberId, event.type, event.content, event.confidence, event.significance]
      );
      written++;
    } catch (err) {
      console.error(`[SessionProcessor] Expansion event write failed (non-fatal):`, err);
    }
  }
  if (written > 0) console.log(`[SessionProcessor] ${written} expansion event(s) stored`);
  return written;
}

async function persistEpisodicMemory(
  memberId: string,
  sessionId: string | undefined,
  summary: ClaudeAnalysis['summary'],
  motifs: ClaudeAnalysis['motifs'],
): Promise<number> {
  try {
    const episodeId = `session-process-${crypto.randomUUID()}`;
    const title = `Session note: ${summary.essence.slice(0, 80)}`;
    const parts = [summary.essence];
    if (summary.openLoops.length > 0) {
      parts.push(`Open threads: ${summary.openLoops.join('. ')}`);
    }
    if (summary.nextStep) {
      parts.push(`Next: ${summary.nextStep}`);
    }
    const description = parts.join('\n\n');

    const sig = Math.min(
      5 + (summary.openLoops.length > 0 ? 2 : 0) + (summary.nextStep ? 1 : 0),
      10
    );

    // Generate embedding
    let semanticVector: number[] | null = null;
    try {
      const embedder = new VectorEmbeddingService({
        openaiApiKey: process.env.OPENAI_API_KEY,
        dimension: 768,
      });
      semanticVector = await embedder.getEmbedding(`${title} ${description}`);
    } catch {
      // Non-fatal: text fallback still works
    }

    await query(
      `INSERT INTO episodic_memories
        (user_id, episode_id, experience_title, experience_description,
         experience_context, significance, emotional_intensity,
         semantic_vector, archetypal_resonances, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, NOW())`,
      [
        memberId,
        episodeId,
        title,
        description,
        `session_process:${sessionId || 'unknown'}`,
        sig,
        0.5,
        semanticVector ? JSON.stringify(semanticVector) : '[]',
        JSON.stringify(summary.themes.slice(0, 5)),
      ]
    );

    console.log(`[SessionProcessor] Episodic memory stored: ${episodeId}`);
    return 1;
  } catch (err) {
    console.error('[SessionProcessor] Episodic memory write failed (non-fatal):', err);
    return 0;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RESONANCE SEARCH
// ─────────────────────────────────────────────────────────────────────────────

async function searchResonance(
  memberId: string,
  motifs: Motif[],
): Promise<ResonanceEcho[]> {
  if (motifs.length === 0) return [];

  try {
    const searchQuery = motifs.map(m => m.symbol).join(' ');

    // Generate embedding for motif search
    const embedder = new VectorEmbeddingService({
      openaiApiKey: process.env.OPENAI_API_KEY,
      dimension: 768,
    });
    const queryVector = await embedder.getEmbedding(searchQuery);

    // semantic_vector is JSONB — cast through text to pgvector for distance ops
    const result = await query<{
      id: string;
      experience_title: string;
      experience_description: string;
      experience_context: string;
      similarity: number;
    }>(
      `SELECT
        id,
        experience_title,
        experience_description,
        experience_context,
        1 - ((semantic_vector::text)::vector(768) <=> $2::vector(768)) as similarity
       FROM episodic_memories
       WHERE user_id = $1
         AND semantic_vector IS NOT NULL
         AND jsonb_array_length(semantic_vector) > 0
       ORDER BY (semantic_vector::text)::vector(768) <=> $2::vector(768)
       LIMIT 5`,
      [memberId, `[${queryVector.join(',')}]`]
    );

    return (result.rows || [])
      .filter(r => r.similarity > 0.3)
      .map(r => {
        // Infer type from context/title
        const title = (r.experience_title || '').toLowerCase();
        let type = 'insight';
        if (title.includes('dream')) type = 'dream';
        else if (title.includes('journal')) type = 'journal';
        else if (title.includes('session')) type = 'session_note';
        else if (title.includes('vision')) type = 'vision';

        return {
          id: r.id,
          type,
          title: r.experience_title || 'Untitled',
          snippet: (r.experience_description || '').slice(0, 200),
          similarity: Math.round(r.similarity * 100) / 100,
        };
      });
  } catch (err) {
    console.error('[SessionProcessor] Resonance search failed (non-fatal):', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKDOWN ASSEMBLY
// ─────────────────────────────────────────────────────────────────────────────

function assembleMarkdown(
  analysis: ClaudeAnalysis,
  movement: MovementDelta,
  sovereigntyScore: number | null,
  resonanceEchoes: ResonanceEcho[],
  memoryPacketsWritten: number,
): string {
  const lines: string[] = [];

  // Essence
  lines.push(`### Session Essence\n`);
  lines.push(analysis.summary.essence);
  lines.push('');

  // State
  const sv = analysis.stateVector;
  lines.push(`### State Reading\n`);
  lines.push(`**Element:** ${sv.primary.element}${sv.secondary ? ` / ${sv.secondary.element}` : ''}`);
  lines.push(`**Polarity:** ${sv.primary.polarity}/5 | **Stability:** ${sv.primary.stability}/5`);
  lines.push(`**Kairos:** ${sv.kairos.assessment} (${Math.round(sv.kairos.confidence * 100)}% confidence)`);
  if (sv.kairos.description) lines.push(`> ${sv.kairos.description}`);
  lines.push('');

  // Movement
  if (movement.significance > 0) {
    lines.push(`### Movement\n`);
    if (movement.elementShift) {
      lines.push(`Element shift: ${movement.elementShift.from} -> ${movement.elementShift.to}`);
    }
    if (movement.kairosShift) {
      lines.push(`Kairos shift: ${movement.kairosShift.from} -> ${movement.kairosShift.to}`);
    }
    if (movement.polarityDelta !== 0) {
      lines.push(`Polarity delta: ${movement.polarityDelta > 0 ? '+' : ''}${movement.polarityDelta}`);
    }
    lines.push(`Significance: ${Math.round(movement.significance * 100)}%`);
    lines.push('');
  }

  // Themes
  if (analysis.summary.themes.length > 0) {
    lines.push(`### Themes\n`);
    lines.push(analysis.summary.themes.map(t => `\`${t}\``).join(' '));
    lines.push('');
  }

  // Threshold events
  if (analysis.thresholdEvents.length > 0) {
    lines.push(`### Threshold Crossings\n`);
    for (const evt of analysis.thresholdEvents) {
      lines.push(`- **${evt.type}** (${evt.intensity}): ${evt.summary}`);
    }
    lines.push('');
  }

  // Expansion events
  if (analysis.expansionEvents.length > 0) {
    lines.push(`### Expansions\n`);
    for (const evt of analysis.expansionEvents) {
      lines.push(`- **${evt.type}**: ${evt.content}`);
    }
    lines.push('');
  }

  // Motifs
  if (analysis.motifs.length > 0) {
    lines.push(`### Symbolic Motifs\n`);
    for (const m of analysis.motifs) {
      lines.push(`- **${m.symbol}** (${m.valence}): ${m.context}`);
    }
    lines.push('');
  }

  // Open loops
  if (analysis.summary.openLoops.length > 0) {
    lines.push(`### Open Loops\n`);
    for (const loop of analysis.summary.openLoops) {
      lines.push(`- ${loop}`);
    }
    lines.push('');
  }

  // Sovereignty
  if (sovereigntyScore !== null) {
    lines.push(`### Sovereignty Score\n`);
    const pct = Math.round(sovereigntyScore * 100);
    let label = 'balanced';
    if (sovereigntyScore >= 0.8) label = 'strong agency';
    else if (sovereigntyScore >= 0.6) label = 'healthy';
    else if (sovereigntyScore >= 0.4) label = 'balanced';
    else if (sovereigntyScore >= 0.2) label = 'outsourcing tendency';
    else label = 'high outsourcing';
    lines.push(`${pct}% (${label})`);
    lines.push('');
  }

  // Resonance
  if (resonanceEchoes.length > 0) {
    lines.push(`### Resonance Echoes\n`);
    for (const echo of resonanceEchoes) {
      lines.push(`- [${echo.type}] "${echo.title}" (${Math.round(echo.similarity * 100)}% match)`);
    }
    lines.push('');
  }

  // Follow-ups
  if (analysis.followUps.length > 0) {
    lines.push(`### Suggested Follow-ups\n`);
    for (const f of analysis.followUps) {
      lines.push(`- ${f}`);
    }
    lines.push('');
  }

  // Footer
  lines.push(`---\n*${memoryPacketsWritten} memory packet(s) written*`);

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

export async function processSession(input: SessionProcessInput): Promise<SessionProcessResult> {
  const start = Date.now();

  // ── Sanctuary: metadata only ──────────────────────────────────────────
  if (input.privacyMode === 'sanctuary' || input.consentLevel === 'metadata_only') {
    const result = handleSanctuary(input);
    result.processingMs = Date.now() - start;
    return result;
  }

  // ── Validate ──────────────────────────────────────────────────────────
  if (!input.transcript || input.transcript.trim().length < 50) {
    return {
      markdown: '### Insufficient Content\n\nTranscript too short for meaningful analysis.',
      stateVector: null,
      thresholdEvents: [],
      expansionEvents: [],
      motifs: [],
      followUps: [],
      resonanceEchoes: [],
      sovereigntyScore: null,
      memoryPacketsWritten: 0,
      processingMs: Date.now() - start,
    };
  }

  // ── 1. Fetch previous state vector ────────────────────────────────────
  let previousVector: StateVectorRow | null = null;
  try {
    previousVector = await getLatestVector(input.memberId);
  } catch (err) {
    console.error('[SessionProcessor] getLatestVector failed (non-fatal):', err);
  }

  // ── 2. Claude analysis ────────────────────────────────────────────────
  let analysis: ClaudeAnalysis;
  let usedFallback = false;
  try {
    analysis = await analyzeTranscript(input.transcript);
  } catch (err) {
    console.error('[SessionProcessor] Claude analysis failed, falling back to local:', err);
    usedFallback = true;

    // Local fallback: lightweight state detection, no threshold/expansion/motifs
    const detected = detectStateFromText(input.transcript);
    analysis = {
      summary: {
        essence: 'Session processed with local fallback (Claude unavailable).',
        themes: [detected.element],
        openLoops: [],
        nextStep: null,
      },
      stateVector: {
        primary: {
          element: detected.element,
          facetCode: detected.facet,
          phase: 'in',
          intensity: detected.intensity,
          polarity: 3,
          stability: detected.kairos === 'collapse-risk' ? 4 : 2,
        },
        confidence: detected.confidence,
        kairos: {
          assessment: detected.kairos,
          confidence: detected.confidence,
          description: detected.matchedKeywords.length > 0
            ? `Inferred from: ${detected.matchedKeywords.join(', ')}`
            : 'Local detection baseline',
        },
        movement: {
          entering: [detected.element],
          exiting: [],
          trajectory: 'still',
          velocity: 0.3,
        },
        evidence: {
          observations: detected.matchedKeywords.map(kw => ({
            category: 'linguistic',
            signal: kw,
            strength: 1,
            informs: ['element'],
          })),
          contradictions: [],
          gaps: ['somatic', 'behavioral', 'affective'],
        },
      },
      thresholdEvents: [],
      expansionEvents: [],
      motifs: [],
      sovereigntySignals: { agencyPhrases: [], outsourcingPhrases: [] },
      followUps: [],
    };
  }

  // ── 3. Sovereignty score ──────────────────────────────────────────────
  const sovereigntyScore = computeSovereigntyScore(
    input.transcript,
    analysis.sovereigntySignals,
  );

  // ── 4. Movement vector ────────────────────────────────────────────────
  const movement = deriveMovementVector(analysis.stateVector, previousVector);

  // ── 5. Database writes (all non-fatal) ────────────────────────────────
  let memoryPacketsWritten = 0;

  // State vector
  await persistStateVector(
    input.memberId,
    input.sessionId,
    analysis.stateVector,
    sovereigntyScore,
    input.transcript,
  );
  memoryPacketsWritten++;

  // Threshold events
  memoryPacketsWritten += await persistThresholdEvents(
    input.memberId,
    input.sessionId,
    analysis.thresholdEvents,
  );

  // Expansion events
  memoryPacketsWritten += await persistExpansionEvents(
    input.sessionId,
    input.memberId,
    analysis.expansionEvents,
  );

  // Episodic memory (only for standard/full modes)
  if (input.consentLevel !== 'summary_only') {
    memoryPacketsWritten += await persistEpisodicMemory(
      input.memberId,
      input.sessionId,
      analysis.summary,
      analysis.motifs,
    );
  }

  // ── 6. Resonance search ───────────────────────────────────────────────
  let resonanceEchoes: ResonanceEcho[] = [];
  const validMotifs = (analysis.motifs || []).map(m => ({
    symbol: m.symbol,
    valence: (['numinous', 'shadow', 'threshold', 'integration', 'neutral'].includes(m.valence)
      ? m.valence
      : 'neutral') as Motif['valence'],
    frequency: m.frequency,
    context: m.context,
  }));

  if (input.runResonanceSearch !== false && validMotifs.length > 0) {
    resonanceEchoes = await searchResonance(input.memberId, validMotifs);
  }

  // ── 7. Assemble response ──────────────────────────────────────────────
  const markdown = assembleMarkdown(
    analysis,
    movement,
    sovereigntyScore,
    resonanceEchoes,
    memoryPacketsWritten,
  );

  return {
    markdown,
    stateVector: {
      id: `sv-session-${input.sessionId || 'unknown'}`,
      memberId: input.memberId,
      timestamp: new Date(),
      source: 'conversation',
      sessionId: input.sessionId,
      primary: {
        element: analysis.stateVector.primary.element as Element,
        intensity: analysis.stateVector.primary.intensity as Intensity,
        polarity: analysis.stateVector.primary.polarity as 1 | 2 | 3 | 4 | 5,
        stability: analysis.stateVector.primary.stability as 1 | 2 | 3 | 4 | 5,
      },
      confidence: analysis.stateVector.confidence,
      kairos: {
        assessment: analysis.stateVector.kairos.assessment as KairosAssessment,
        confidence: analysis.stateVector.kairos.confidence,
        description: analysis.stateVector.kairos.description,
      },
      movement: {
        entering: analysis.stateVector.movement.entering as Element[],
        exiting: analysis.stateVector.movement.exiting as Element[],
        trajectory: analysis.stateVector.movement.trajectory as StateMovement['trajectory'],
        velocity: analysis.stateVector.movement.velocity,
      },
      evidence: analysis.stateVector.evidence as any,
    } as Partial<StateVector>,
    thresholdEvents: analysis.thresholdEvents.map(e => ({
      type: e.type,
      summary: e.summary,
      element: e.element,
      intensity: e.intensity,
      confidence: e.confidence,
    })),
    expansionEvents: analysis.expansionEvents.map(e => ({
      type: e.type,
      content: e.content,
      confidence: e.confidence,
      significance: e.significance,
    })),
    motifs: validMotifs,
    followUps: analysis.followUps || [],
    resonanceEchoes,
    sovereigntyScore,
    memoryPacketsWritten,
    processingMs: Date.now() - start,
  };
}
