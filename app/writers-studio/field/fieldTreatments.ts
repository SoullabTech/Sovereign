/**
 * THE DESIGN STUDY — three visual treatments of one room.
 *
 * Authorized as a small, deliberate study inside our own Writer's Studio, to
 * settle one question before the integration hardens:
 *
 *   How do Structure, Focus, navigation and MAIA indicate where attention is
 *   WITHOUT creating competing visual centres?
 *
 * ⛔ TREATMENTS CHANGE MARKS, NEVER BEHAVIOUR. Nothing in this file reads or
 * writes a manuscript, moves a scroll position, or reaches an API. A treatment
 * is a token set. If a treatment ever needs a behavioural difference to work,
 * that is a finding about the treatment, recorded — not a licence to branch the
 * engine three ways.
 *
 * ── THE THREE MEANINGS ─────────────────────────────────────────────────────
 *
 *   LOCATION   Where am I in the Work?
 *   FOCUS      What are we looking at together?
 *   THREAD     What are MAIA and I pursuing about it?
 *
 * ⭐ These are three different meanings, not three ways of saying one thing.
 * Structure says WHERE. Focus says HERE. MAIA says WHAT WE ARE EXPLORING ABOUT
 * HERE. A section marker is structural geography; a Focus Frame is an
 * intentional relational gesture; a thread is the conversation arising around
 * that gesture. The recovered D9 prototype already states this law in its own
 * source — "a thread is subordinate to the Focus … it never becomes a second
 * Focus and it never touches the Work" — so this study is not choosing a
 * direction. It is testing whether the separation survives contact with a
 * 262-section, variably sized Work.
 */

import { GOLD, INK, RULE, SPACE } from '../studioTheme';

/** The three meanings a mark in this room may carry. Exactly three. */
export const MEANINGS = ['location', 'focus', 'thread'] as const;
export type Meaning = (typeof MEANINGS)[number];

/**
 * WHERE a mark lives. Placement is part of a mark's identity because two marks
 * of the same colour and form still read as different things when one is in
 * the writer's prose and the other is in a panel beside it.
 */
export type Placement = 'rail' | 'work' | 'orbit';

/**
 * HOW a mark is drawn. Deliberately coarse: these are the distinctions a writer
 * makes at a glance, before reading anything. A vocabulary fine enough to
 * separate two marks that look the same to a reader would defeat the falsifier.
 */
export type Form = 'row' | 'edge' | 'frame' | 'wash' | 'inset';

/**
 * WHAT it is drawn in. `accent` is the Work's gold — the member's own emphasis,
 * bounded by GOLD_PERMITTED for the reason recorded in studioTheme: spend gold
 * on chrome and it stops being available to mean *this is yours*. `maia` is her
 * colour, and it is never the accent. `quiet` is the room.
 */
export type Tone = 'accent' | 'maia' | 'quiet';

export interface Mark {
  placement: Placement;
  form: Form;
  tone: Tone;
  /** Stroke or emphasis weight in px. 0 for marks that carry no stroke. */
  weight: number;
}

export interface Treatment {
  key: 'A' | 'B' | 'C';
  name: string;
  /** What this treatment is claiming, in one sentence, in the study's terms. */
  claim: string;
  marks: Record<Meaning, Mark>;
}

/**
 * A · FOCUS FRAME IS PRIMARY.
 * Section divisions stay extremely quiet. The rail says location. A visible box
 * appears only when the writer intentionally creates shared attention with MAIA.
 */
const A: Treatment = {
  key: 'A',
  name: 'Focus Frame primary',
  claim:
    'The only strong mark in the Work is the one the writer deliberately made. ' +
    'Location lives entirely in the rail; the prose carries no standing mark at all.',
  marks: {
    location: { placement: 'rail', form: 'row', tone: 'accent', weight: 0 },
    focus: { placement: 'work', form: 'frame', tone: 'accent', weight: 1 },
    thread: { placement: 'orbit', form: 'edge', tone: 'maia', weight: 2 },
  },
};

/**
 * B · SECTION IS PRIMARY.
 * The current section gets a subtle spatial treatment, and Focus becomes an
 * inset mark inside it.
 *
 * ⚠️ THE TREATMENT MOST AT RISK FROM ITS OWN PREMISE. Location and Focus are
 * both in the prose and both in the accent here, and only form and weight keep
 * them apart. That is exactly the ambiguity the study exists to detect, so B is
 * kept honest rather than tuned until it passes.
 */
const B: Treatment = {
  key: 'B',
  name: 'Section primary',
  claim:
    'Where you are is a place in the prose, not a row in a panel. Focus is a ' +
    'finer mark made inside that place.',
  marks: {
    location: { placement: 'work', form: 'wash', tone: 'accent', weight: 0 },
    focus: { placement: 'work', form: 'inset', tone: 'accent', weight: 3 },
    thread: { placement: 'orbit', form: 'edge', tone: 'maia', weight: 2 },
  },
};

/**
 * C · LOCATION AND FOCUS ARE DELIBERATELY DIFFERENT.
 *
 * ⭐ The founder's preference, and the recovered prototype's own law:
 *   LOCATION → rail + a quiet section boundary
 *   FOCUS    → the Focus Frame
 *   THREAD   → the MAIA orbit / Focus strip
 * Three meanings, three vocabularies, no overlap in tone OR placement.
 */
const C: Treatment = {
  key: 'C',
  name: 'Location, Focus and Thread deliberately different',
  claim:
    'Structure says where. Focus says here. MAIA says what we are exploring ' +
    'about here. No two of them are drawn in the same language.',
  marks: {
    location: { placement: 'rail', form: 'row', tone: 'quiet', weight: 0 },
    focus: { placement: 'work', form: 'frame', tone: 'accent', weight: 1 },
    thread: { placement: 'orbit', form: 'edge', tone: 'maia', weight: 2 },
  },
};

export const TREATMENTS: Record<Treatment['key'], Treatment> = { A, B, C };
export const TREATMENT_KEYS = ['A', 'B', 'C'] as const;

/** Absent or unrecognised means "not in the study" — the room renders as it does today. */
export function parseTreatment(raw: string | null | undefined): Treatment['key'] | null {
  if (!raw) return null;
  const k = raw.trim().toUpperCase();
  return k === 'A' || k === 'B' || k === 'C' ? k : null;
}

/**
 * ── THE FALSIFIER ──────────────────────────────────────────────────────────
 *
 * ⭐ At no moment should the writer have to ask whether a visual mark
 * represents LOCATION, ATTENTION, or CONVERSATION. If a treatment makes two of
 * those meanings look the same, reject it.
 *
 * Machine-checkable form: within one treatment, no two meanings may share a
 * mark signature. This cannot decide whether a treatment FEELS unambiguous —
 * only the walk can do that — but it can prove a treatment ambiguous without a
 * human ever looking at it, which is worth having before the walk is spent.
 */
export function signature(m: Mark): string {
  return `${m.placement}/${m.form}/${m.tone}/${m.weight}`;
}

export interface Collision {
  a: Meaning;
  b: Meaning;
  signature: string;
}

/** Every pair of meanings drawn identically. Empty is the passing state. */
export function collisions(t: Treatment): Collision[] {
  const found: Collision[] = [];
  for (let i = 0; i < MEANINGS.length; i++) {
    for (let j = i + 1; j < MEANINGS.length; j++) {
      const a = MEANINGS[i];
      const b = MEANINGS[j];
      const sa = signature(t.marks[a]);
      if (sa === signature(t.marks[b])) found.push({ a, b, signature: sa });
    }
  }
  return found;
}

export const FALSIFIER =
  'At no moment should the writer have to ask whether a visual mark represents ' +
  'location, attention, or conversation. If a treatment makes two of those ' +
  'meanings look the same, reject it.';

/**
 * ── THE WALK ───────────────────────────────────────────────────────────────
 *
 * The same eight acts, in the same order, in each treatment, on the real Work.
 *
 * ⛔ ACT 2 IS BLOCKED, NOT SCORED. "Jump to another section" is Product Finding
 * A, which lives in the substrate all three treatments share, so it fails
 * identically in all three and discriminates nothing. A study that scored it
 * would be scoring the engine while claiming to compare rooms. The remaining
 * seven acts are the study.
 */
export interface WalkAct {
  n: number;
  act: string;
  blocked?: 'FINDING_A';
}

export const WALK: WalkAct[] = [
  { n: 1, act: 'read normally' },
  { n: 2, act: 'jump to another section', blocked: 'FINDING_A' },
  { n: 3, act: 'select one sentence' },
  { n: 4, act: 'widen Focus to a passage' },
  { n: 5, act: 'Ask MAIA' },
  { n: 6, act: 'Work with one observation' },
  { n: 7, act: 'close MAIA' },
  { n: 8, act: 'continue writing' },
];

export const SCORED_ACTS = WALK.filter((a) => !a.blocked);

/**
 * The tokens a treatment resolves to. Kept in one place so a component never
 * decides for itself what a meaning looks like — the study would stop being a
 * comparison the moment two surfaces disagreed about what treatment B is.
 */
export interface ResolvedMark {
  color: string;
  weight: number;
  form: Form;
  placement: Placement;
}

export function resolve(t: Treatment, meaning: Meaning): ResolvedMark {
  const m = t.marks[meaning];
  const color =
    m.tone === 'accent' ? GOLD.DEFAULT
    : m.tone === 'maia' ? INK.secondary
    : INK.quiet;
  return { color, weight: m.weight, form: m.form, placement: m.placement };
}

/** The quiet section boundary treatment C asks for, and A deliberately omits. */
export function sectionBoundary(t: Treatment): { border: string } | null {
  if (t.key === 'A') return null;
  if (t.key === 'B') return { border: `${SPACE.hairline}px solid ${GOLD.edge}` };
  return { border: `1px solid ${RULE.quiet}` };
}
