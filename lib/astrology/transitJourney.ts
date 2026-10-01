/**
 * Transit Journey semantics — interpretive layers above calculated transit geometry.
 *
 * Geometry stays in transitField.ts. This module is intentionally downstream:
 * it never decides whether an activation exists, whether it is applying, or
 * when it perfects. It only supplies clearly-labelled symbolic possibilities.
 */
import type { AspectName, TransitActivation, TransitingBody } from '@/lib/astrology/transitField';
import { synthesizeAspect, type AspectType } from '@/lib/astrology/aspectSynthesis';

export interface NatalAspectInput {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
}

export interface NatalWebLink {
  otherPoint: string;
  type: AspectName;
  orb: number;
  coreQuestion: string | null;
}

const TRANSIT_MOTIF: Record<TransitingBody, string> = {
  Sun: 'illumination, vitality and conscious emphasis',
  Moon: 'changing feeling, habit and bodily responsiveness',
  Mercury: 'thought, language, exchange and interpretation',
  Venus: 'attraction, value, reciprocity and aesthetic relation',
  Mars: 'heat, assertion, severing, effort and directed action',
  Jupiter: 'amplification, meaning, possibility and growth',
  Saturn: 'limit, structure, consequence and what can endure',
  Uranus: 'interruption, difference, freedom and unexpected change',
  Neptune: 'permeability, imagination, idealization and blurred boundaries',
  Pluto: 'intensity, underlying power and deep reorganization',
};

const NATAL_DOMAIN: Record<string, string> = {
  Sun: 'identity, vitality and self-expression',
  Moon: 'feeling, instinct and inner need',
  Mercury: 'perception, thought and communication',
  Venus: 'value, attraction and relationship',
  Mars: 'desire, assertion and action',
  Jupiter: 'meaning, faith and expansion',
  Saturn: 'structure, responsibility and mastery',
  Uranus: 'freedom, difference and awakening',
  Neptune: 'imagination, longing and permeability',
  Pluto: 'power, depth and transformation',
  Ascendant: 'embodied arrival, orientation and the way one meets the world',
  Midheaven: 'vocation, public direction and what one is oriented toward',
};

const ASPECT_TRADITION: Record<AspectName, string> = {
  conjunction: 'concentrates two principles into one symbolic field, making their distinction less obvious',
  sextile: 'describes an opening or workable exchange that usually asks for participation rather than guaranteeing an outcome',
  square: 'describes friction or incompatibility that can make adjustment, effort or action more visible',
  trine: 'describes continuity and ease, which can support expression but can also pass without being consciously used',
  opposition: 'places two principles across a polarity, often making difference visible through contrast, relationship or mirroring',
};

const ASPECT_EXPRESSION: Record<AspectName, string> = {
  conjunction: 'Experiences may feel concentrated: the moving principle and the natal function can be difficult to separate cleanly.',
  sextile: 'An opening may become noticeable, especially where a small act of participation allows the two functions to cooperate.',
  square: 'A mismatch, pressure point or need for adjustment may become more noticeable; friction is possible, not predetermined.',
  trine: 'Something may move with unusual ease or continuity; the question is whether that ease is recognized and consciously engaged.',
  opposition: 'The theme may appear through contrast or relationship, with each side clarifying the other without requiring one side to win.',
};

const VALID_ASPECTS = new Set<AspectName>(['conjunction', 'sextile', 'square', 'trine', 'opposition']);

export function transitTradition(a: TransitActivation): string {
  const moving = TRANSIT_MOTIF[a.transiting.body];
  const receiving = NATAL_DOMAIN[a.natal.point] ?? `the natal function symbolized by ${a.natal.point}`;
  return `In Western transit tradition, moving ${a.transiting.body} carries themes of ${moving}. A ${a.aspect.name} ${ASPECT_TRADITION[a.aspect.name]}. Here that moving principle meets natal ${a.natal.point}, associated with ${receiving}.`;
}

export function possibleHumanExpressions(a: TransitActivation): string[] {
  const receiving = NATAL_DOMAIN[a.natal.point] ?? `the natal function symbolized by ${a.natal.point}`;
  const moving = TRANSIT_MOTIF[a.transiting.body];
  const phase = a.deviation <= 1 / 60
    ? 'At the moment of exactness, the symbolic contact is at its geometric peak; experience need not peak on the same clock.'
    : a.motion === 'applying'
      ? 'Because the aspect is applying, its geometry is tightening; symbolically, the theme may feel as though it is gathering definition.'
      : 'Because the aspect is separating, its geometry is loosening; symbolically, attention may shift toward assimilation, aftermath or what remains.';
  const repeat = a.timing.passes.length > 1
    ? 'This activation has more than one pass in the searched window, so the traditional image is of revisiting or reworking rather than a single one-time event.'
    : null;

  return [
    `You might notice ${receiving} becoming more salient while themes of ${moving} are in the foreground.`,
    ASPECT_EXPRESSION[a.aspect.name],
    repeat ?? phase,
  ];
}

export function natalWebLinks(targetPoint: string, aspects: NatalAspectInput[], limit = 4): NatalWebLink[] {
  const target = targetPoint.trim().toLowerCase();
  return aspects
    .filter((aspect) => {
      const type = aspect.type as AspectName;
      if (!VALID_ASPECTS.has(type) || !Number.isFinite(aspect.orb)) return false;
      return aspect.planet1.trim().toLowerCase() === target || aspect.planet2.trim().toLowerCase() === target;
    })
    .sort((a, b) => a.orb - b.orb)
    .slice(0, limit)
    .map((aspect) => {
      const firstIsTarget = aspect.planet1.trim().toLowerCase() === target;
      const otherPoint = firstIsTarget ? aspect.planet2 : aspect.planet1;
      const type = aspect.type as AspectName;
      const synthesis = synthesizeAspect(targetPoint, otherPoint, type as AspectType);
      return {
        otherPoint,
        type,
        orb: aspect.orb,
        coreQuestion: synthesis?.coreQuestion ?? null,
      };
    });
}

export function fieldContextLines(a: TransitActivation, activations: TransitActivation[]): string[] {
  const sameMover = activations.filter((other) => other.id !== a.id && other.transiting.body === a.transiting.body);
  const sameReceiver = activations.filter((other) => other.id !== a.id && other.natal.point === a.natal.point);
  const lines: string[] = [];

  if (sameMover.length) {
    const contacts = sameMover.slice(0, 3).map((other) => `${other.aspect.name} natal ${other.natal.point}`).join(', ');
    lines.push(`The same transiting ${a.transiting.body} is also contacting ${contacts}. This activation is therefore one strand of a wider movement in the current field.`);
  }
  if (sameReceiver.length) {
    const contacts = sameReceiver.slice(0, 3).map((other) => `${other.transiting.body} ${other.aspect.name}`).join(', ');
    lines.push(`Natal ${a.natal.point} is also being contacted by ${contacts}. More than one current movement is converging on the same natal function.`);
  }
  return lines;
}

export interface DisplayedTransitAspect {
  natalPlanet: string;
  aspectType: string;
  orb: number;
}

/**
 * Resolve a wheel click back to the activation the wheel is actually showing.
 * When the wheel is not focused to one aspect, fall back to the tightest
 * verified activation for that transiting body.
 */
export function chooseTransitActivation(
  activations: TransitActivation[],
  planet: string,
  displayedAspects: DisplayedTransitAspect[],
): TransitActivation | null {
  const candidates = activations.filter((item) => item.transiting.body === planet);
  const displayed = displayedAspects
    .map((aspect) => candidates.find((item) =>
      item.natal.point === aspect.natalPlanet &&
      item.aspect.name === aspect.aspectType &&
      Math.abs(item.deviation - aspect.orb) < 1e-6
    ))
    .filter((item): item is TransitActivation => Boolean(item))
    .sort((a, b) => a.deviation - b.deviation);

  return displayed[0] ?? [...candidates].sort((a, b) => a.deviation - b.deviation)[0] ?? null;
}

export interface FieldTimelineRange {
  start: number;
  end: number;
  clippedStart: boolean;
  clippedEnd: boolean;
}
export function fieldTimelineRange(
  activations: TransitActivation[],
  nowMs: number,
  maxDaysEachSide = 240,
): FieldTimelineRange {
  const day = 86_400_000;
  const raw: number[] = [nowMs];
  for (const a of activations) {
    if (a.timing.windowStart) raw.push(Date.parse(a.timing.windowStart));
    if (a.timing.windowEnd) raw.push(Date.parse(a.timing.windowEnd));
    for (const pass of a.timing.passes) raw.push(Date.parse(pass.at));
  }
  const finite = raw.filter(Number.isFinite);
  const rawStart = Math.min(...finite);
  const rawEnd = Math.max(...finite);
  const floor = nowMs - maxDaysEachSide * day;
  const ceil = nowMs + maxDaysEachSide * day;
  let start = Math.max(rawStart, floor);
  let end = Math.min(rawEnd, ceil);
  const minSpan = 30 * day;
  if (end - start < minSpan) {
    start = nowMs - minSpan / 2;
    end = nowMs + minSpan / 2;
  }
  return {
    start,
    end,
    clippedStart: rawStart < start || activations.some((a) => a.timing.openStart),
    clippedEnd: rawEnd > end || activations.some((a) => a.timing.openEnd),
  };
}
