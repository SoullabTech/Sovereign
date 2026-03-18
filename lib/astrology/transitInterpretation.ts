/**
 * Transit Interpretation Engine — Phase 2
 *
 * Converts current transit positions + natal chart into structured TransitImpact objects:
 *   natal planet → forces acting on it → elemental synthesis → Spiralogic voice
 *
 * Design principles:
 *   1. Structured over freeform — every transit becomes a typed object
 *   2. Spiralogic elemental translation always present
 *   3. synthesizeAspect() provides depth when available; graceful fallback when not
 *   4. Somatic signatures surface the body layer MAIA can reference
 */

import { type BirthChart } from '@/lib/astrology/ephemerisCalculator';
import { synthesizeAspect, type AspectType } from '@/lib/astrology/aspectSynthesis';
import { type SpiralogicElement } from '@/lib/astrology/spiralogicMapping';
import { type AstroSource, type ConfidenceLevel } from '@/lib/astrology/astrologyPayload';

// Minimal interface — avoids circular import from service
export interface TransitPosition {
  planet: string;
  sign: string;
  degree: number;
  retrograde: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANET MAPS
// ─────────────────────────────────────────────────────────────────────────────

/** Planet → Spiralogic element (consistent with aspectSynthesis.ts elementalDynamic language) */
export const PLANET_ELEMENT_MAP: Record<string, SpiralogicElement> = {
  sun:       'fire',
  moon:      'water',
  mercury:   'air',
  venus:     'earth',
  mars:      'fire',
  jupiter:   'fire',
  saturn:    'earth',
  uranus:    'air',
  neptune:   'water',
  pluto:     'aether',
  chiron:    'water',
  northnode: 'aether',
  southnode: 'aether',
  ascendant: 'fire',   // threshold of emergence — first house, dawn point
};

/** Planet → human-readable domain */
export const PLANET_DOMAIN_MAP: Record<string, string> = {
  sun:       'identity / vitality / self-expression',
  moon:      'emotion / instinct / inner needs',
  mercury:   'mind / communication / perception',
  venus:     'values / love / relating',
  mars:      'drive / will / action',
  jupiter:   'expansion / faith / meaning',
  saturn:    'structure / discipline / mastery',
  uranus:    'awakening / liberation / sudden change',
  neptune:   'dissolution / spirituality / imagination',
  pluto:     'transformation / power / depth',
  chiron:    'core wound / healing gift',
  ascendant: 'embodied presence / first impression / how I enter the world',
};

/** Planet → somatic signatures */
export const PLANET_SOMATIC_MAP: Record<string, string[]> = {
  sun:       ['solar plexus', 'heart center'],
  moon:      ['belly', 'chest contraction', 'throat'],
  mercury:   ['shoulders', 'neck', 'mental chatter'],
  venus:     ['throat', 'heart warmth', 'lower back'],
  mars:      ['jaw', 'head pressure', 'heat in limbs'],
  jupiter:   ['expansiveness in chest', 'belly fullness'],
  saturn:    ['heaviness in shoulders', 'jaw', 'restriction'],
  uranus:    ['electric restlessness', 'buzzing in limbs'],
  neptune:   ['fatigue', 'fog', 'diffuse sensitivity'],
  pluto:     ['gut intensity', 'volcanic heat in belly'],
  chiron:    ['ache', 'held grief in chest'],
  ascendant: ['skin surface', 'face and eyes', 'posture and presence'],
};

/** Default effect strings when synthesizeAspect returns null */
const ASPECT_EFFECT_DEFAULTS: Record<string, Record<string, string>> = {
  saturn: {
    conjunction: 'consolidation / crystallization / weight',
    opposition:  'confrontation with structure / external testing',
    square:      'friction / discipline forced',
    trine:       'structural support / ease with form',
    sextile:     'practical opportunity / grounded opening',
    quincunx:    'structure that doesn\'t quite fit — adjustment needed',
  },
  neptune: {
    conjunction: 'dissolution / transcendence / merging',
    opposition:  'mirroring the unreal / fog from the outside',
    square:      'fog / sensitivity / direction lost',
    trine:       'spiritual flow / creative ease',
    sextile:     'soft opening / intuitive access',
    quincunx:    'subtle diffusion / something unnamed',
  },
  uranus: {
    conjunction: 'sudden awakening / disruption / lightning',
    opposition:  'electrifying tension / mirror of change',
    square:      'shock / breakthrough / instability',
    trine:       'inspired liberation / unexpected clarity',
    sextile:     'innovative opening',
    quincunx:    'unexpected friction / misaligned change',
  },
  pluto: {
    conjunction: 'complete transformation / death-rebirth intensity',
    opposition:  'power confrontation / depth surfacing',
    square:      'profound pressure / forced metamorphosis',
    trine:       'transformational flow / ease of power',
    sextile:     'subtle empowerment / depth becoming accessible',
    quincunx:    'subterranean adjustment',
  },
  jupiter: {
    conjunction: 'expansion / amplification / opportunity',
    opposition:  'excess tension / growth through resistance',
    square:      'overdoing / growth friction',
    trine:       'flow of abundance / ease of expansion',
    sextile:     'gentle fortunate opening',
    quincunx:    'misaligned growth',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface TransitForce {
  transitPlanet: string;
  transitElement: SpiralogicElement;
  aspectType: string;
  orb: number;
  effect: string;
  elementalInteraction: string;
  bodyAwareness?: string;
  applying: boolean;
  source: AstroSource;       // derived_interpretation | fallback
  confidence: ConfidenceLevel; // always 'derived' (aspect detection is calculated)
}

export interface TransitImpact {
  natalPlanet: string;
  domain: string;
  element: SpiralogicElement;
  forces: TransitForce[];
  synthesis: string;
  spiralogicVoice: string;
  somaticSignature?: string;
  source: AstroSource;       // derived_interpretation if any force has rich data, else fallback
  confidence: ConfidenceLevel; // always 'derived'
  traceId: string;           // deterministic: "natalPlanet:transitPlanet/aspectType+..."
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE ENGINE
// ─────────────────────────────────────────────────────────────────────────────

const ORB_THRESHOLD = 6; // degrees
const OUTER_PLANETS = ['saturn', 'uranus', 'neptune', 'pluto', 'jupiter'];
const PERSONAL_PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'chiron', 'ascendant'];

const ZODIAC_SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

function absoluteDegree(sign: string, degree: number): number {
  const idx = ZODIAC_SIGNS.indexOf(sign);
  return (idx < 0 ? 0 : idx) * 30 + degree;
}

function angularDiff(a: number, b: number): number {
  const raw = Math.abs(a - b);
  return raw > 180 ? 360 - raw : raw;
}

type ComputedAspect = {
  natalPlanet: string;
  transitPlanet: string;
  aspectType: AspectType;
  orb: number;
  applying: boolean;
};

function detectAspects(
  natalDeg: number,
  transitDeg: number,
  natalPlanet: string,
  transitPlanet: string
): ComputedAspect | null {
  const diff = angularDiff(natalDeg, transitDeg);

  const targets: { angle: number; type: AspectType }[] = [
    { angle: 0,   type: 'conjunction' },
    { angle: 180, type: 'opposition' },
    { angle: 90,  type: 'square' },
    { angle: 120, type: 'trine' },
    { angle: 60,  type: 'sextile' },
  ];

  for (const { angle, type } of targets) {
    const orb = Math.abs(diff - angle);
    if (orb <= ORB_THRESHOLD) {
      // applying = transiting planet approaching (getting closer to exact)
      // Simplified: if transit is ahead of natal in zodiac, it's applying for conjunction
      const applying = transitDeg < natalDeg || (natalDeg - transitDeg + 360) % 360 > 180;
      return { natalPlanet, transitPlanet, aspectType: type, orb: Math.round(orb * 10) / 10, applying };
    }
  }
  return null;
}

/**
 * Build structured TransitImpact objects from current transits + natal chart.
 * Only models outer planet transits to personal natal planets.
 */
export function buildTransitImpacts(
  birthChart: BirthChart,
  currentTransits: TransitPosition[]
): TransitImpact[] {
  if (!birthChart || !currentTransits || currentTransits.length === 0) return [];

  const natalPositions: Record<string, { sign: string; degree: number }> = {
    sun:       birthChart.sun,
    moon:      birthChart.moon,
    mercury:   birthChart.mercury,
    venus:     birthChart.venus,
    mars:      birthChart.mars,
    chiron:    birthChart.chiron,
    ascendant: birthChart.ascendant,
  };

  // Compute all aspects between transiting outer planets and natal personal planets
  const computedAspects: ComputedAspect[] = [];

  for (const transit of currentTransits) {
    const tPlanet = transit.planet.toLowerCase();
    if (!OUTER_PLANETS.includes(tPlanet)) continue;

    const tDeg = absoluteDegree(transit.sign, transit.degree);

    for (const [nPlanet, nPos] of Object.entries(natalPositions)) {
      if (!nPos?.sign) continue;
      const nDeg = absoluteDegree(nPos.sign, nPos.degree);
      const aspect = detectAspects(nDeg, tDeg, nPlanet, tPlanet);
      if (aspect) computedAspects.push(aspect);
    }
  }

  if (computedAspects.length === 0) return [];

  // Group by natal planet
  const byNatal: Record<string, ComputedAspect[]> = {};
  for (const asp of computedAspects) {
    if (!byNatal[asp.natalPlanet]) byNatal[asp.natalPlanet] = [];
    byNatal[asp.natalPlanet].push(asp);
  }

  const impacts: TransitImpact[] = [];

  for (const [natalPlanet, aspects] of Object.entries(byNatal)) {
    const natalElement = PLANET_ELEMENT_MAP[natalPlanet] || 'aether';
    const domain = PLANET_DOMAIN_MAP[natalPlanet] || natalPlanet;

    const forces: TransitForce[] = aspects.map(asp => {
      const transitElement = PLANET_ELEMENT_MAP[asp.transitPlanet] || 'aether';
      const rich = synthesizeAspect(natalPlanet, asp.transitPlanet, asp.aspectType);

      const effect = rich
        ? condenseSentence(rich.essence)
        : (ASPECT_EFFECT_DEFAULTS[asp.transitPlanet]?.[asp.aspectType] ?? `${asp.aspectType} influence`);

      const elementalInteraction = rich?.elementalDynamic
        ?? buildElementalInteraction(transitElement, natalElement, asp.aspectType);

      return {
        transitPlanet: asp.transitPlanet,
        transitElement,
        aspectType: asp.aspectType,
        orb: asp.orb,
        effect,
        elementalInteraction,
        bodyAwareness: rich?.bodyAwareness,
        applying: asp.applying,
        source: rich ? 'derived_interpretation' : 'fallback',
        confidence: 'derived',
      };
    });

    // Sort by tightest orb first
    forces.sort((a, b) => a.orb - b.orb);

    const synthesis = synthesizeCombinedEffect(natalElement, forces);
    const spiralogicVoice = buildSpiralogicVoice(natalPlanet, natalElement, forces);
    const somaticSignature = buildSomaticSignature(natalPlanet, forces);

    // traceId: deterministic key for debugging — which aspects produced this impact
    const traceId = `${natalPlanet}:${forces.map(f => `${f.transitPlanet}/${f.aspectType}`).join('+')}`;

    // Impact source = derived_interpretation if any force used the aspect library; else fallback
    const impactSource: AstroSource = forces.some(f => f.source === 'derived_interpretation')
      ? 'derived_interpretation' : 'fallback';

    impacts.push({
      natalPlanet, domain, element: natalElement,
      forces, synthesis, spiralogicVoice, somaticSignature,
      source: impactSource, confidence: 'derived', traceId,
    });
  }

  // Sort by personal planet order
  const order = ['sun', 'moon', 'mars', 'mercury', 'venus', 'chiron', 'ascendant'];
  return impacts.sort((a, b) => {
    const ia = order.indexOf(a.natalPlanet);
    const ib = order.indexOf(b.natalPlanet);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SYNTHESIS HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function condenseSentence(text: string): string {
  const s = text.split('.')[0] ?? text;
  return s.length > 90 ? s.slice(0, 87) + '…' : s;
}

function buildElementalInteraction(
  transitElement: SpiralogicElement,
  natalElement: SpiralogicElement,
  aspectType: string
): string {
  const verb = aspectVerbFor(aspectType);
  const te = cap(transitElement);
  const ne = cap(natalElement);
  if (transitElement === natalElement) return `${te} ${verb} ${ne} (amplification)`;
  return `${te} ${verb} ${ne}`;
}

function aspectVerbFor(type: string): string {
  const verbs: Record<string, string> = {
    conjunction: 'merging with', opposition: 'opposing', square: 'pressuring',
    trine: 'flowing into', sextile: 'opening to', quincunx: 'adjusting against',
  };
  return verbs[type] ?? 'in aspect to';
}

function synthesizeCombinedEffect(natalElement: SpiralogicElement, forces: TransitForce[]): string {
  if (forces.length === 0) return '';
  if (forces.length === 1) {
    const f = forces[0];
    return `${cap(f.transitElement)} ${aspectVerbFor(f.aspectType)} ${cap(natalElement)}`;
  }

  const elements = forces.map(f => f.transitElement);
  const hasEarth = elements.includes('earth');
  const hasWater = elements.includes('water');
  const hasFire  = elements.includes('fire');
  const hasAir   = elements.includes('air');
  const hasAether = elements.includes('aether');

  if (natalElement === 'fire') {
    if (hasEarth && hasWater) return 'High effort, low clarity — drive compressed and diffused simultaneously';
    if (hasEarth && hasAether) return 'Will tested and transformed — deep structural change forcing action to mature';
    if (hasEarth)  return 'Drive meets resistance — discipline and patience required';
    if (hasWater)  return 'Will dissolving — action loses clear direction';
    if (hasFire)   return 'Amplified fire — intensity elevated, direction critical';
    if (hasAether) return 'Transformational pressure on drive — deep change forced';
  }
  if (natalElement === 'water') {
    if (hasEarth)  return 'Emotion meeting form — feeling asked to structure itself';
    if (hasFire)   return 'Warmth and steam — feelings activated, boundaries tested';
    if (hasAir)    return 'Heart and mind in dialogue — emotional patterns becoming conscious';
    if (hasAether) return 'Emotional depth activated — old waters stirred';
  }
  if (natalElement === 'earth') {
    if (hasFire)   return 'Structure tested by initiative — old form may need to shift';
    if (hasWater)  return 'Groundedness softened — practical certainty dissolving';
    if (hasAir)    return 'Form meeting idea — practical reality being reconsidered';
  }
  if (natalElement === 'air') {
    if (hasEarth)  return 'Thought meeting weight — ideas asked to become real';
    if (hasWater)  return 'Mind meets feeling — perception becoming more intuitive';
    if (hasFire)   return 'Inspiration elevated — thinking accelerated';
  }

  const list = [...new Set(elements)].map(cap).join(' and ');
  return `${list} acting on ${cap(natalElement)}`;
}

function buildSpiralogicVoice(
  planet: string,
  element: SpiralogicElement,
  forces: TransitForce[]
): string {
  if (forces.length === 0) return '';
  const domainVerb = domainVerbFor(planet);
  const elName = cap(element);

  if (forces.length === 1) {
    const f = forces[0];
    const te = cap(f.transitElement);
    return `Your ${elName} is trying to ${domainVerb}, and ${te} is ${aspectVerbFor(f.aspectType)} it.`;
  }

  const phrases = forces.map(f => `${cap(f.transitElement)} is ${aspectVerbFor(f.aspectType)} it`);
  const last = phrases.pop()!;
  const joined = phrases.length > 0 ? phrases.join(', ') + ', and ' + last : last;
  return `Your ${elName} is trying to ${domainVerb}, but ${joined}.`;
}

function domainVerbFor(planet: string): string {
  const verbs: Record<string, string> = {
    sun: 'express and shine', moon: 'feel and respond', mercury: 'think and communicate',
    venus: 'connect and value', mars: 'act and initiate', jupiter: 'expand and grow',
    saturn: 'structure and hold', uranus: 'awaken and shift', neptune: 'dissolve and transcend',
    pluto: 'transform and deepen', chiron: 'heal and integrate', ascendant: 'show up and be seen',
  };
  return verbs[planet] ?? 'move';
}

function buildSomaticSignature(natalPlanet: string, forces: TransitForce[]): string {
  // Prefer rich body awareness from synthesizeAspect (it's more specific)
  const richBody = forces.find(f => f.bodyAwareness)?.bodyAwareness;
  if (richBody) return richBody;

  const natalSomatic = (PLANET_SOMATIC_MAP[natalPlanet] ?? []).slice(0, 2);
  const forceSomatic = forces.flatMap(f => (PLANET_SOMATIC_MAP[f.transitPlanet] ?? []).slice(0, 1));
  const combined = [...new Set([...natalSomatic, ...forceSomatic])];
  if (combined.length === 0) return '';
  return `May register as: ${combined.join(', ')}.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMATTING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format TransitImpact[] as a structured diagnostic section for MAIA's system prompt.
 */
export function formatTransitImpacts(impacts: TransitImpact[]): string {
  if (impacts.length === 0) return '';

  let out = '\n## Transit Activations (Structured)\n';
  out += '*Outer planetary forces organized by what they act on*\n\n';

  for (const impact of impacts) {
    out += `**${cap(impact.natalPlanet)} (${cap(impact.element)} / ${impact.domain})**\n`;

    for (const force of impact.forces) {
      const tag = force.applying ? '↗ applying' : '↘ separating';
      out += `- ${cap(force.transitPlanet)} ${force.aspectType} (${force.orb}° ${tag})\n`;
      out += `  → ${force.elementalInteraction}\n`;
      out += `  → ${force.effect}\n`;
    }

    out += `\n**Combined:** ${impact.synthesis}\n`;
    out += `**Spiralogic:** ${impact.spiralogicVoice}\n`;
    if (impact.somaticSignature) out += `**Body:** ${impact.somaticSignature}\n`;
    out += '\n';
  }

  return out;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
