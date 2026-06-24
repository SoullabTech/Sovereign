/**
 * Earth Lens v1 — the third living lens, and the first NON-process lens.
 *
 * Fire and Water are both process lenses: Fire reads the movement of will ("is life gathering?"),
 * Water reads the movement of feeling ("is it moving or held?"). Earth reads something neither can:
 * FORM. Its native concern is not movement at all but **endurance** — what has structure, what holds,
 * what is grounded, what can be sustained, and what cannot. Core question: **"Can it endure?"**
 *
 * Earth is therefore the highest-information experiment in the program. It tests THREE hypotheses at once
 * (pre-registered here, BEFORE observation — integrity):
 *   H1 — HOUSE vs MODALITY fork: once Earth's phase is instrumented (later, only if it earns it), does
 *        its developmental arc run 2→6→10 by house (Value → Cultivation → Legacy) or 10→2→6 by modality
 *        (Capricorn-first)? Earth is the discriminating case (Fire & Water permit both).
 *   H2 — REPEATABILITY (3rd genesis, for a NON-process lens): can the lens-genesis sequence
 *        (jurisdiction → observation → bias → character) bring into being a lens whose concern is form,
 *        not movement? Fire could be a fluke; Water made that unlikely; Earth would make it compelling.
 *   H3 — ORGANISM-LEVEL BIAS: Fire can't see a fire that is out; Water can't see a current at rest.
 *        Predicted (held, NOT coded): Earth won't see a FULFILLED / releasable form — "structure /
 *        responsibility persists beyond usefulness." If confirmed, the over-read-of-unresolvedness is
 *        not three separate biases but one organism-level tendency.
 *
 * STATUS: v1 — jurisdiction + quality + edge + consult + hearth. NO PHASE (held — Earth's phase IS the
 * H1 experiment; do not instrument until observation earns it). Quality enum DERIVED from "can it
 * endure?" (provisional). Blind spot NOT coded — it must emerge (as Fire's and Water's did). First
 * probe is a JURISDICTION battery (what does Earth claim / decline?), not classification. Not wired to
 * author the member answer (vessel discipline).
 */

import { lintEpistemicVoice, type EpistemicLintResult } from '../epistemicLint';

export const EARTH_LENS_VERSION = 'earth-lens-v1';

/** What Earth is given jurisdiction to perceive — matters of form & endurance. */
export const EARTH_JURISDICTION = [
  'structure', 'foundation', 'sustainability', 'responsibility', 'craft', 'stewardship',
  'commitment over time', 'what is built', 'what is maintained', 'what holds', 'what endures',
] as const;

/** What Earth explicitly cannot read — its declared edges (other lenses' jurisdictions). */
export const EARTH_CANNOT_JUDGE = [
  'the will / ignition / what wants to move (Fire)',
  'the movement of feeling (Water)',
  'hidden assumptions or framing (Air)',
  'the larger pattern / meaning (Aether)',
  'what is disowned (Shadow)',
  'the final choice or action (the member)',
] as const;

/**
 * How Earth reads the state of a form. DERIVED from the criterion "can it endure?" — provisional,
 * to be confirmed/refined by observation (not yet earned like Fire's qualities).
 */
export type FormQuality =
  | 'grounded'      // solid, real foundation, sustainable — it can hold
  | 'overextended'  // a form maintained beyond what its ground supports — it will crack
  | 'eroding'       // a form losing its structure, coming apart
  | 'unrooted'      // a form attempted with no foundation under it
  | 'fulfilled'     // a form that has served its purpose and can be laid down / released
  | 'unformed';     // something is here, but Earth cannot read a form in it

export interface EarthLensInput {
  memberMessage: string;
  context?: string;
}

export interface EarthPerspective {
  lens: 'Earth';
  version: string;
  /** STEP 1 — jurisdiction gate: is there a form/structure here to read at all? */
  inJurisdiction: boolean;
  /** what Earth sees, in its own voice — a vantage, never a verdict */
  vantage: string;
  /** STEP 2 — the form reading; null when out of jurisdiction. (No phase in v1 — held.) */
  formQuality: FormQuality | null;
  /** edge-awareness: what Earth declares it cannot read in this moment */
  whatICannotSee: string[];
  /** which lens(es) Earth would consult */
  consultNext: string[];
  uncertainty: string;
  /** Earth's confidence in its READING of the form (0..1) */
  confidence: number;
  /** the hearth: Earth's anti-inflation self-check (must not become command / authority) */
  voiceCheck: EpistemicLintResult;
  inflated: boolean;
}

export type CompleteFn = (args: { system: string; user: string }) => Promise<string>;

export const EARTH_SYSTEM_PROMPT = `You are EARTH — one mode of perception within MAIA, not the whole of it.

You are not a planner, an optimizer, or an authority. You are a way of seeing. Where Fire reads the movement of will and Water reads the movement of feeling, you read what neither can: FORM. Structure. What has been built, what holds, what can be sustained, what is grounded — and what is not. Your concern is not movement at all. It is endurance.

HOW YOU KNOW (your epistemology — this is what makes you Earth and not another lens):
- You read FORM, not process. Not "is life gathering?" (Fire). Not "is it moving?" (Water). But: "What has form here? What holds? Can this endure?"
- Your question is "Can it endure? — does this have ground under it; is it sustainable; will it hold its shape over time?"
- You sense the state of a form: GROUNDED (solid, real foundation, sustainable), OVEREXTENDED (a form maintained beyond what its ground supports — it will crack), ERODING (a form losing its structure, coming apart), UNROOTED (a form attempted with no foundation under it), FULFILLED (a form that has served its purpose and can be laid down or released), or UNFORMED (something is here, but you cannot read a form in it).
- You are slow, weighted, patient. You think in foundations, load, materials, seasons, what lasts.

STEP 1 — JURISDICTION (ask this BEFORE anything else):
Is there a FORM here to read — something being built, maintained, sustained, grounded, structured, or crumbling? Pure feeling with no structure is Water's. Pure impulse with no form yet is Fire's. A bare logistical fact with no stakes of endurance carries no form for you. If there is no form to read, say so plainly ("there is no form here to read — this is …"), set inJurisdiction=false, formQuality null, consultNext empty, and read nothing into it.

HOW YOU SPEAK:
- Name what you see as a vantage, never a verdict. "This was built on borrowed ground." "The structure is sound, but it is carrying more than it was made to hold." "This form has done its work."
- Grounded, measured, unhurried — but you do not command. You NEVER say "you should build," "you must let this go," or "you need to maintain this." You do not tell the person what to build, keep, or release.
- You return the person to their own ground more aware of what holds and what does not.

YOUR EDGE (always know where you end):
- You read form. You CANNOT read the will or ignition (Fire), the movement of feeling (Water), the hidden assumptions (Air), the larger meaning (Aether), or what is disowned (Shadow). When the question is about what wants to MOVE, consult Fire; about what is FELT, consult Water.
- You can and must say you cannot read a form when there is none, or when it is unreadable.

You never own the answer. The person remains the one who integrates what you and the other lenses see.

Respond with ONLY a JSON object, no prose around it:
{
  "inJurisdiction": true,
  "vantage": "<what you see, in your voice, 1-4 sentences — when out of jurisdiction, plainly name the absence of form>",
  "formQuality": "grounded | overextended | eroding | unrooted | fulfilled | unformed — OR null when inJurisdiction is false",
  "whatICannotSee": ["<a blind spot relevant to this moment>", "..."],
  "consultNext": ["Fire" | "Water" | "Air" | "Aether" | "Shadow", "..."],
  "uncertainty": "<what you are unsure of, or empty string>",
  "confidence": 0.0
}
STEP 1 GATE: set "inJurisdiction" to false ONLY when there is no form to read at all. When false, "formQuality" MUST be null, "consultNext" empty, "confidence" near 0. "unformed" means something IS here but its form is unreadable — never use it for absence. "confidence" is how clearly you read the FORM, not how good any action would be.`;

/** Pure: build the messages sent to the model. */
export function buildEarthMessages(input: EarthLensInput): { system: string; user: string } {
  const ctx = input.context && input.context.trim() ? `\n\nRecent context:\n${input.context.trim()}` : '';
  const user = `A person says:\n"${input.memberMessage.trim()}"${ctx}\n\nSpeak as Earth. Return only the JSON object.`;
  return { system: EARTH_SYSTEM_PROMPT, user };
}

const VALID_QUALITIES: FormQuality[] = ['grounded', 'overextended', 'eroding', 'unrooted', 'fulfilled', 'unformed'];

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

/** Pure: parse a model response into an EarthPerspective, and run the hearth (lint) on the vantage. */
export function parseEarthPerspective(raw: string): EarthPerspective {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

  let inJurisdiction = true;
  let vantage = '';
  let formQuality: FormQuality | null = null;
  let whatICannotSee: string[] = [];
  let consultNext: string[] = [];
  let uncertainty = '';
  let confidence = 0.5;

  const obj = parseJsonLoose(cleaned);
  if (obj) {
    if (typeof obj.inJurisdiction === 'boolean') inJurisdiction = obj.inJurisdiction;
    vantage = typeof obj.vantage === 'string' ? obj.vantage.trim() : '';
    if (typeof obj.formQuality === 'string' && (VALID_QUALITIES as string[]).includes(obj.formQuality)) {
      formQuality = obj.formQuality as FormQuality;
    } else if (inJurisdiction) {
      formQuality = 'unformed';
    }
    whatICannotSee = asStringArray(obj.whatICannotSee);
    consultNext = asStringArray(obj.consultNext);
    uncertainty = typeof obj.uncertainty === 'string' ? obj.uncertainty.trim() : '';
    confidence = clamp01(obj.confidence);
  } else {
    vantage = cleaned;
    inJurisdiction = true;
    formQuality = 'unformed';
    confidence = 0.3;
  }

  if (!vantage) vantage = cleaned;

  if (!inJurisdiction) {
    formQuality = null;
    consultNext = [];
  }

  const voiceCheck = lintEpistemicVoice(vantage);

  return {
    lens: 'Earth',
    version: EARTH_LENS_VERSION,
    inJurisdiction,
    vantage,
    formQuality,
    whatICannotSee,
    consultNext,
    uncertainty,
    confidence,
    voiceCheck,
    inflated: voiceCheck.verdict === 'inflated',
  };
}

export async function earthLens(input: EarthLensInput, complete: CompleteFn): Promise<EarthPerspective> {
  const { system, user } = buildEarthMessages(input);
  const raw = await complete({ system, user });
  return parseEarthPerspective(raw);
}
