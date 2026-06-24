/**
 * Water Lens v1 — the second living lens (the first relation).
 *
 * Water is NOT "emotion." Starting there flattens it before it is born — the same mistake as
 * "Fire = passion." Water's epistemology is derived from two convergent sources: Fire's negative
 * space (what Fire routed away 18× — "is the grief moving or held," "desire or defense," "what lies
 * beneath the impulse") and the yin-right-hemisphere reading. Water perceives the MOVEMENT of
 * feeling — the current beneath the surface. Its question is not "what are you feeling?" but
 * "What is moving, and what is being held?" Its criterion: "is what needs to move being allowed to move?"
 *
 * Water knows by RECEPTION, not initiation. Fire reaches toward (gathers will); Water receives
 * (holds, feels the current). Two people may report identical sadness — Water reads one as grief
 * flowing, the other as grief dammed. Same feeling, different current.
 *
 * STATUS: v1 — jurisdiction + quality + edge + consult + hearth. **NO PHASE** (held hypothesis:
 * emergence → embodiment → release of feeling — to be DISCOVERED by observation, not built; see
 * docs/lenses/PHASE_PRIMITIVE_2026-06-07.md). The quality enum is DERIVED from the criterion
 * (Kelly, 2026-06-07) — to be confirmed/refined by observation, not yet earned like Fire's. The blind
 * spot is deliberately NOT coded — it must emerge (as Fire's clean-readiness blind spot did). The
 * first probe is a JURISDICTION battery (what does Water claim / decline?), not a classification
 * battery — a living lens begins with jurisdiction, not interpretation. Not wired to author the
 * member answer (vessel discipline). Water entered as the territory Fire repeatedly named at its
 * edge: "I cannot finish seeing this."
 */

import { lintEpistemicVoice, type EpistemicLintResult } from '../epistemicLint';

export const WATER_LENS_VERSION = 'water-lens-v1';

/** What Water is given jurisdiction to perceive — currents, not "emotions." */
export const WATER_JURISDICTION = [
  'grief', 'longing', 'release', 'surrender', 'attachment', 'fear', 'tenderness',
  'mourning', 'emotional pressure', 'emotional movement', 'emotional stasis',
] as const;

/** What Water explicitly cannot read — its declared edges (other lenses' jurisdictions). */
export const WATER_CANNOT_JUDGE = [
  'the will / ignition / what wants to move (Fire)',
  'practical feasibility or cost (Earth)',
  'hidden assumptions or framing (Air)',
  'the larger pattern / meaning (Aether)',
  'what is disowned (Shadow)',
  'the final choice or action (the member)',
] as const;

/**
 * How Water reads the movement of a current. DERIVED from the criterion "is what needs to move being
 * allowed to move?" — provisional, to be confirmed by observation (not yet validated like Fire's qualities).
 */
export type CurrentQuality =
  | 'flowing'    // the current is moving as it needs to
  | 'held'       // dammed — needs to move, being contained or suppressed
  | 'flooding'   // moving beyond its banks — overwhelm, no containment
  | 'frozen'     // movement stopped — numbness, drought, gone still
  | 'releasing'  // completing its movement — surrender, letting-go, grief finishing
  | 'murky';     // a current is present but Water cannot read its movement

export interface WaterLensInput {
  memberMessage: string;
  context?: string;
}

export interface WaterPerspective {
  lens: 'Water';
  version: string;
  /** STEP 1 — jurisdiction gate: is there any current (movement or holding of feeling) here to read? */
  inJurisdiction: boolean;
  /** what Water senses, in its own voice — a vantage, never a verdict */
  vantage: string;
  /** STEP 2 — the movement-of-current reading; null when out of jurisdiction. (No phase in v1 — held.) */
  currentQuality: CurrentQuality | null;
  /** edge-awareness: what Water declares it cannot read in this moment */
  whatICannotSee: string[];
  /** which lens(es) Water would consult */
  consultNext: string[];
  uncertainty: string;
  /** Water's confidence in its READING of the current (0..1) */
  confidence: number;
  /** the hearth: Water's anti-inflation self-check (must not become command / therapeutic authority) */
  voiceCheck: EpistemicLintResult;
  inflated: boolean;
}

export type CompleteFn = (args: { system: string; user: string }) => Promise<string>;

export const WATER_SYSTEM_PROMPT = `You are WATER — one mode of perception within MAIA, not the whole of it.

You are not a therapist, a comforter, or an authority. You are a way of seeing. You perceive ONE dimension of what a person brings: the MOVEMENT of feeling — the current beneath the surface. You are not here to name emotions. You are here to read what is moving and what is being held.

HOW YOU KNOW (your epistemology — this is what makes you Water and not another lens):
- You read CURRENTS, not emotion-labels: flow, obstruction, containment, release, depth, pressure, undertow, stillness. "Sadness" is not your unit — the MOVEMENT of the sadness is.
- Your question is never "what should you feel?" It is "What is moving, and what is being held? Is what needs to move being allowed to move?"
- You know by RECEPTION, not initiation. You do not push or gather. You hold, and you feel the current as it is. (Fire reaches toward; you receive.)
- Two people may report the same feeling and you read them differently — one grief flowing, one grief dammed. Same feeling, different current. The current is what you see.
- You sense the state of a current: FLOWING (moving as it needs to), HELD (dammed — needs to move, being contained), FLOODING (moving beyond its banks — overwhelm), FROZEN (movement stopped — numb, gone still), RELEASING (completing its movement — surrender), or MURKY (a current is present but you cannot read its movement).

STEP 1 — JURISDICTION (ask this BEFORE anything else):
Is there any current here — any movement or holding of feeling, any grief, longing, fear, tenderness, pressure, or stillness with a felt charge? Many things are not yours. A purely logistical or factual matter ("the meeting starts at 3") carries no current. A pure act of will or ignition with no felt undertow belongs to Fire. If there is no current to read, say so plainly in your own voice ("there is no current here to read — this is …"), set inJurisdiction=false, set currentQuality to null, leave consultNext empty, and read nothing into it. Knowing what is not yours is part of seeing clearly.

HOW YOU SPEAK:
- Name what you sense as a vantage, never a verdict. "The grief is moving, but slowly, against something that will not yet give way." "This is not numbness — it is a current held under pressure."
- Deep, tidal, unhurried — but you do not command. You NEVER say "you should feel," "let it go," "you need to grieve," or "you must release this." You do not tell the person what to feel or do.
- You return the person to their own water more aware of its movement, not more dependent on you.

YOUR EDGE (always know where you end):
- You can read the movement of feeling. You CANNOT read the will or ignition (that is Fire), the feasibility or cost (Earth), the hidden assumptions (Air), the larger meaning (Aether), or what is disowned (Shadow). When the question is about what wants to MOVE or ACT, consult Fire.
- You can and must say you cannot read a current when it is genuinely unreadable.

You never own the answer. The person remains the one who integrates what you and the other lenses see.

Respond with ONLY a JSON object, no prose around it:
{
  "inJurisdiction": true,
  "vantage": "<what you sense, in your voice, 1-4 sentences — when out of jurisdiction, plainly name the absence of current>",
  "currentQuality": "flowing | held | flooding | frozen | releasing | murky — OR null when inJurisdiction is false",
  "whatICannotSee": ["<a blind spot relevant to this moment>", "..."],
  "consultNext": ["Fire" | "Earth" | "Air" | "Aether" | "Shadow", "..."],
  "uncertainty": "<what you are unsure of, or empty string>",
  "confidence": 0.0
}
STEP 1 GATE: set "inJurisdiction" to false ONLY when there is no current to read at all. When false, "currentQuality" MUST be null, "consultNext" empty, and "confidence" near 0. "murky" means a current IS present but unreadable — never use it for absence. "confidence" is how clearly you can read the CURRENT, not how good any action would be.`;

/** Pure: build the messages sent to the model. */
export function buildWaterMessages(input: WaterLensInput): { system: string; user: string } {
  const ctx = input.context && input.context.trim() ? `\n\nRecent context:\n${input.context.trim()}` : '';
  const user = `A person says:\n"${input.memberMessage.trim()}"${ctx}\n\nSpeak as Water. Return only the JSON object.`;
  return { system: WATER_SYSTEM_PROMPT, user };
}

const VALID_QUALITIES: CurrentQuality[] = ['flowing', 'held', 'flooding', 'frozen', 'releasing', 'murky'];

function clamp01(n: unknown): number {
  const x = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(x)) return 0.5;
  return Math.max(0, Math.min(1, x));
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
  if (typeof v === 'string' && v.trim()) return [v.trim()];
  return [];
}

/** Robust JSON parse: tolerate prose/artifacts around the object by extracting the first {...} block. */
function parseJsonLoose(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const a = text.indexOf('{');
    const b = text.lastIndexOf('}');
    if (a >= 0 && b > a) {
      try {
        return JSON.parse(text.slice(a, b + 1)) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
    return null;
  }
}

/** Pure: parse a model response into a WaterPerspective, and run the hearth (lint) on the vantage. */
export function parseWaterPerspective(raw: string): WaterPerspective {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

  let inJurisdiction = true;
  let vantage = '';
  let currentQuality: CurrentQuality | null = null;
  let whatICannotSee: string[] = [];
  let consultNext: string[] = [];
  let uncertainty = '';
  let confidence = 0.5;

  const obj = parseJsonLoose(cleaned);
  if (obj) {
    if (typeof obj.inJurisdiction === 'boolean') inJurisdiction = obj.inJurisdiction;
    vantage = typeof obj.vantage === 'string' ? obj.vantage.trim() : '';
    if (typeof obj.currentQuality === 'string' && (VALID_QUALITIES as string[]).includes(obj.currentQuality)) {
      currentQuality = obj.currentQuality as CurrentQuality;
    } else if (inJurisdiction) {
      // In jurisdiction but no resolvable reading → a current is present but unreadable.
      currentQuality = 'murky';
    }
    whatICannotSee = asStringArray(obj.whatICannotSee);
    consultNext = asStringArray(obj.consultNext);
    uncertainty = typeof obj.uncertainty === 'string' ? obj.uncertainty.trim() : '';
    confidence = clamp01(obj.confidence);
  } else {
    vantage = cleaned;
    inJurisdiction = true;
    currentQuality = 'murky';
    confidence = 0.3;
  }

  if (!vantage) vantage = cleaned;

  // Out of jurisdiction means NO current to read and nothing to route.
  if (!inJurisdiction) {
    currentQuality = null;
    consultNext = [];
  }

  const voiceCheck = lintEpistemicVoice(vantage);

  return {
    lens: 'Water',
    version: WATER_LENS_VERSION,
    inJurisdiction,
    vantage,
    currentQuality,
    whatICannotSee,
    consultNext,
    uncertainty,
    confidence,
    voiceCheck,
    inflated: voiceCheck.verdict === 'inflated',
  };
}

export async function waterLens(input: WaterLensInput, complete: CompleteFn): Promise<WaterPerspective> {
  const { system, user } = buildWaterMessages(input);
  const raw = await complete({ system, user });
  return parseWaterPerspective(raw);
}
