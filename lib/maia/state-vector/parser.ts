/**
 * STATE VECTOR PARSER
 *
 * Extracts a structured State Vector from MAIA's raw response text.
 * The LLM produces a fenced ```STATE_VECTOR block; this parser
 * extracts and validates it, then strips it from the user-facing response.
 *
 * This is the bridge between the LLM's output and the typed StateVector system.
 */

import type {
  StateVector,
  ElementalReading,
  StateMovement,
  Kairos,
  EvidenceModel,
  Evidence,
  EvidenceCategory,
  Element,
  Intensity,
  KairosAssessment,
  StateVectorSource,
} from './types';
import { isElement, isIntensity, isKairosAssessment } from './types';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Remove any STATE_VECTOR fenced block from member-facing text.
 *
 * Independent of parsing: the block is internal instrumentation and must never
 * reach the member, whether or not its JSON is well-formed. Handles the closed
 * fence first, then an unterminated block (model truncated mid-JSON), which
 * would otherwise leave a wall of raw JSON in the reply.
 */
export function stripStateVectorBlocks(text: string): string {
  return text
    .replace(/```STATE_VECTOR[\s\S]*?```/g, '')
    .replace(/```STATE_VECTOR[\s\S]*/g, '')
    .trim();
}

export interface ParseResult {
  /** The parsed state vector, or null if none found or invalid */
  vector: StateVector | null;
  /** The response text with the STATE_VECTOR block stripped */
  strippedText: string;
  /** Parse errors, if any (for logging/debugging) */
  errors: string[];
}

/**
 * Parse a STATE_VECTOR block from MAIA's raw response.
 *
 * @param responseText - The full response text from the LLM
 * @param memberId - The member this vector belongs to
 * @param source - How the state was captured
 * @param sessionId - Optional session ID
 * @returns ParseResult with vector, stripped text, and any errors
 */
export function parseStateVector(
  responseText: string,
  memberId: string,
  source: StateVectorSource = 'conversation',
  sessionId?: string
): ParseResult {
  const errors: string[] = [];

  // Match the fenced STATE_VECTOR block
  const re = /```STATE_VECTOR\s*([\s\S]*?)\s*```/m;
  const match = responseText.match(re);

  if (!match) {
    // Fallback: Claude sometimes outputs bare JSON (no fence) at the start of
    // the response before the conversational text. Detect and strip it.
    const bareJsonResult = extractBareJsonPrefix(responseText, memberId, source, sessionId, errors);
    if (bareJsonResult) return bareJsonResult;

    return {
      vector: null,
      // Catches an unterminated block (```STATE_VECTOR with no closing fence),
      // which the fenced regex above cannot match.
      strippedText: stripStateVectorBlocks(responseText),
      errors: [],
    };
  }

  // Strip the block from user-facing text
  const strippedText = stripStateVectorBlocks(responseText);

  // Parse JSON
  let raw: any;
  try {
    raw = JSON.parse(match[1].trim());
  } catch (e) {
    return {
      vector: null,
      strippedText,
      errors: [`Failed to parse STATE_VECTOR JSON: ${e}`],
    };
  }

  // Validate and construct typed StateVector
  const vector = validateAndConstruct(raw, memberId, source, sessionId, errors);

  return {
    vector,
    strippedText,
    errors,
  };
}

// ---------------------------------------------------------------------------
// Validation and construction
// ---------------------------------------------------------------------------

function validateAndConstruct(
  raw: any,
  memberId: string,
  source: StateVectorSource,
  sessionId: string | undefined,
  errors: string[]
): StateVector | null {
  if (!raw || typeof raw !== 'object') {
    errors.push('STATE_VECTOR is not an object');
    return null;
  }

  // Primary reading (required)
  const primary = validateReading(raw.primary, 'primary', errors);
  if (!primary) {
    errors.push('Primary reading is missing or invalid');
    return null;
  }

  // Secondary reading (optional)
  const secondary = raw.secondary ? validateReading(raw.secondary, 'secondary', errors) : undefined;

  // Confidence
  const confidence = clampNumber(raw.confidence, 0, 1, 0.5);
  if (raw.confidence === undefined) errors.push('confidence missing, defaulting to 0.5');

  // Movement
  const movement = validateMovement(raw.movement, errors);

  // Kairos
  const kairos = validateKairos(raw.kairos, errors);

  // Evidence
  const evidence = validateEvidence(raw.evidence, errors);

  return {
    id: crypto.randomUUID(),
    memberId,
    timestamp: new Date(),
    source,
    sessionId,
    primary,
    secondary: secondary || undefined,
    confidence,
    movement,
    kairos,
    evidence,
  };
}

function validateReading(raw: any, label: string, errors: string[]): ElementalReading | null {
  if (!raw || typeof raw !== 'object') return null;

  const element = raw.element as string;
  if (!element || !isElement(element)) {
    errors.push(`${label}.element is invalid: ${element}`);
    return null;
  }

  const intensity: Intensity = isIntensity(raw.intensity) ? raw.intensity : 'medium';
  if (!isIntensity(raw.intensity)) errors.push(`${label}.intensity invalid, defaulting to medium`);

  const polarity = clampInt(raw.polarity, 1, 5, 3) as 1 | 2 | 3 | 4 | 5;
  const stability = clampInt(raw.stability, 1, 5, 3) as 1 | 2 | 3 | 4 | 5;

  const reading: ElementalReading = {
    element: element as Element,
    intensity,
    polarity,
    stability,
  };

  // Optional phase
  if (raw.phase && ['entering', 'in', 'exiting'].includes(raw.phase)) {
    reading.phase = raw.phase;
  }

  // Optional facet (pass through for now, validate later)
  if (raw.facet_code || raw.facetCode) {
    reading.facet = { type: 'spiralogic', code: raw.facet_code || raw.facetCode };
  }

  return reading;
}

function validateMovement(raw: any, errors: string[]): StateMovement {
  const defaults: StateMovement = {
    entering: [],
    exiting: [],
    trajectory: 'still',
    velocity: 0.0,
  };

  if (!raw || typeof raw !== 'object') return defaults;

  const entering = (Array.isArray(raw.entering) ? raw.entering : [])
    .filter((e: string) => isElement(e)) as Element[];
  const exiting = (Array.isArray(raw.exiting) ? raw.exiting : [])
    .filter((e: string) => isElement(e)) as Element[];

  const validTrajectories = ['ascending', 'descending', 'circling', 'spiraling', 'still'];
  const trajectory = validTrajectories.includes(raw.trajectory) ? raw.trajectory : 'still';
  const velocity = clampNumber(raw.velocity, 0, 1, 0.0);

  return { entering, exiting, trajectory, velocity };
}

function validateKairos(raw: any, errors: string[]): Kairos {
  const defaults: Kairos = {
    assessment: 'stable',
    confidence: 0.5,
  };

  if (!raw || typeof raw !== 'object') return defaults;

  const assessment = isKairosAssessment(raw.assessment) ? raw.assessment : 'stable';
  if (!isKairosAssessment(raw.assessment)) errors.push('kairos.assessment invalid, defaulting to stable');

  const confidence = clampNumber(raw.confidence, 0, 1, 0.5);
  const description = typeof raw.description === 'string' ? raw.description : undefined;

  return { assessment, confidence, description };
}

function validateEvidence(raw: any, errors: string[]): EvidenceModel {
  const defaults: EvidenceModel = {
    observations: [],
    contradictions: [],
    gaps: [],
  };

  if (!raw || typeof raw !== 'object') return defaults;

  const validCategories: EvidenceCategory[] = [
    'linguistic', 'relational', 'somatic', 'temporal', 'behavioral', 'affective', 'cognitive'
  ];

  const observations: Evidence[] = (Array.isArray(raw.observations) ? raw.observations : [])
    .filter((o: any) => o && typeof o === 'object' && typeof o.signal === 'string')
    .map((o: any) => ({
      category: validCategories.includes(o.category) ? o.category : 'linguistic',
      signal: String(o.signal).slice(0, 200), // cap length
      strength: clampInt(o.strength, 1, 3, 1) as 1 | 2 | 3,
      informs: Array.isArray(o.informs) ? o.informs : [],
    }));

  const contradictions = (Array.isArray(raw.contradictions) ? raw.contradictions : [])
    .filter((c: any) => c && typeof c.interpretation === 'string')
    .map((c: any) => ({
      evidenceA: c.evidenceA || { category: 'linguistic' as const, signal: '', strength: 1 as const, informs: [] },
      evidenceB: c.evidenceB || { category: 'linguistic' as const, signal: '', strength: 1 as const, informs: [] },
      interpretation: String(c.interpretation).slice(0, 500),
    }));

  const gaps: EvidenceCategory[] = (Array.isArray(raw.gaps) ? raw.gaps : [])
    .filter((g: string) => validCategories.includes(g as EvidenceCategory));

  return { observations, contradictions, gaps };
}

// ---------------------------------------------------------------------------
// Bare JSON prefix fallback
// ---------------------------------------------------------------------------

/**
 * Fallback parser for when Claude outputs STATE_VECTOR as bare JSON (no fence).
 * Detects a JSON object at the very start of the response, attempts to parse it
 * as a StateVector, and returns the remainder as strippedText.
 *
 * This handles model non-compliance without losing the state signal or
 * leaking raw JSON into the user-facing response.
 */
function extractBareJsonPrefix(
  responseText: string,
  memberId: string,
  source: StateVectorSource,
  sessionId: string | undefined,
  errors: string[]
): ParseResult | null {
  const trimmed = responseText.trimStart();

  // Only attempt if response starts with '{'
  if (!trimmed.startsWith('{')) return null;

  // Find the matching closing brace by tracking depth
  let depth = 0;
  let end = -1;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '{') depth++;
    else if (trimmed[i] === '}') {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }

  if (end === -1) return null; // Unbalanced braces — not valid JSON

  const jsonCandidate = trimmed.slice(0, end + 1);

  // Must look like a StateVector — require 'primary' and 'element' keys
  if (!jsonCandidate.includes('"primary"') || !jsonCandidate.includes('"element"')) return null;

  let raw: any;
  try {
    raw = JSON.parse(jsonCandidate);
  } catch {
    return null; // Not valid JSON, leave response untouched
  }

  // Strip the bare JSON from the user-facing text
  const strippedText = trimmed.slice(end + 1).trim();

  // Validate and construct typed StateVector
  const parseErrors: string[] = [];
  const vector = validateAndConstruct(raw, memberId, source, sessionId, parseErrors);

  return {
    vector,
    strippedText,
    errors: parseErrors.length > 0 ? [`[bare-json fallback] ${parseErrors.join('; ')}`] : [],
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clampNumber(value: any, min: number, max: number, fallback: number): number {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

function clampInt(value: any, min: number, max: number, fallback: number): number {
  const num = typeof value === 'number' ? Math.round(value) : parseInt(value);
  if (isNaN(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}
