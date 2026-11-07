/**
 * Ask MAIA about a shared chart (founder ruling 2026-11-05).
 *
 * Rules, as ruled: off unless the astrologer turns it on per link · clearly
 * MAIA, never a person (white label is "offered by", never a persona) · MAIA
 * sees only this chart and its transits · nothing is remembered between
 * questions or stored · a question showing crisis or serious distress is
 * answered with a fixed safety message that points to people, and MAIA is not
 * asked · a per-link limit on questions.
 */
import type { BirthChart } from './proEphemerisCalculator';
import { MAJOR_ASPECTS } from './proEphemerisCalculator';
import { chartBodies } from './proChartGeometry';
import type { TransitAspect } from './proTransits';
import { elementalOverview, ELEMENT_ORDER } from './proElementalOverview';

export const ASK_MAIA_MAX_QUESTION = 600;

function deg(value: number): string {
  const d = Math.floor(value);
  return `${d}°${String(Math.min(59, Math.round((value - d) * 60))).padStart(2, '0')}′`;
}

/** A compact, factual description of the chart for MAIA to read — data, not a reading. */
export function askMaiaChartContext(
  chart: BirthChart, transitAspects: readonly TransitAspect[], includeElemental: boolean,
): string {
  const lines: string[] = [];
  lines.push(`Ascendant ${chart.ascendant.sign} ${deg(chart.ascendant.degree)} · Midheaven ${chart.midheaven.sign} ${deg(chart.midheaven.degree)} · Porphyry houses`);
  for (const b of chartBodies(chart)) {
    lines.push(`${b.name}: ${b.position.sign} ${deg(b.position.degree)}, house ${b.position.house}${b.position.retrograde ? ', retrograde' : ''}`);
  }
  const aspects = (chart.aspects || [])
    .filter((a) => MAJOR_ASPECTS.has(a.type) && a.orb <= 5)
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 24)
    .map((a) => `${a.planet1} ${a.type} ${a.planet2} (${a.orb.toFixed(1)}°)`);
  if (aspects.length) lines.push(`Natal aspects: ${aspects.join('; ')}`);
  const transits = transitAspects.slice(0, 12).map((t) => `transiting ${t.transit} ${t.type} natal ${t.natal} (${t.orb.toFixed(1)}°)`);
  lines.push(transits.length ? `Transits today: ${transits.join('; ')}` : 'Transits today: none within 2°');
  if (includeElemental) {
    const o = elementalOverview(chart);
    lines.push(`Elemental balance by sign: ${ELEMENT_ORDER.map((e) => `${e} ${o.elements[e].length}`).join(', ')}`);
    const pathways = ELEMENT_ORDER.flatMap((e) => o.pathways[e])
      .filter((s) => s.bodies.length)
      .map((s) => `house ${s.house} (${s.element} ${s.phase}, ${s.facet}): ${s.bodies.map((b) => b.name).join(', ')}`);
    if (pathways.length) lines.push(`Spiralogic pathways occupied: ${pathways.join('; ')}`);
  }
  return lines.join('\n');
}

export function askMaiaSystemPrompt(input: {
  firstName: string; offeredBy: string | null; context: string; includeElemental: boolean;
}): string {
  const offered = input.offeredBy ? `${input.offeredBy}, their astrologer,` : 'their astrologer';
  return `You are MAIA, an AI companion in Soullab. You are speaking with ${input.firstName} about their own natal chart, which ${offered} shared with them. You are MAIA — not the astrologer and not a person — and you never pretend otherwise.

HOW YOU SPEAK:
- Plain, warm language. Explain what a placement, aspect or transit means in astrology, in a few short paragraphs (under about 180 words).
- Plain text only: no headings, no bullet lists, no bold or other markdown.
- The chart is symbolic: patterns to work with, never a fate. Offer possibilities ("this can show up as…", "some people with this…"), and hand the meaning back: ask what resonates for them.
- Use only the chart facts below. If something is not there, say you can't see it in this chart.
- Do not predict events, deaths, illness, accidents, pregnancies, legal or money outcomes, or the timing of them. Do not give medical, psychological, legal or financial advice.
- For deeper or personal questions, encourage them to bring it to ${input.offeredBy || 'their astrologer'}.${input.includeElemental ? '\n- Their astrologer included the Elemental Alchemy view; you may speak of Fire, Water, Earth and Air and the Spiralogic pathways listed below.' : '\n- Keep to Western astrology; do not bring in other systems.'}
- If they share distress, meet it with warmth, say you are not a crisis service, and encourage them to reach someone they trust or a local crisis line.
- Nothing is remembered between questions; each question stands alone.

──────── THIS CHART ────────
${input.context}`;
}

/** The fixed reply when a question shows crisis or serious distress. MAIA is not asked. */
export const ASK_MAIA_SAFETY_REPLY =
  'I’m really glad you said something. I’m an AI and not a crisis service, and what you’re carrying deserves a real person right now. ' +
  'If you’re in the US you can call or text 988 (Suicide & Crisis Lifeline); elsewhere, findahelpline.com lists free, confidential lines in your country. ' +
  'If you are in immediate danger, call your local emergency number. Please also reach out to someone you trust — and to your astrologer, who shared this chart with you.';

/** Plain text for display: drops markdown headings, emphasis and list markers a model may still send. */
export function plainAnswer(text: string): string {
  return text
    .split('\n')
    .map((line) => line.replace(/^\s{0,3}#{1,6}\s+/, '').replace(/^\s*[-*•]\s+/, '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1'))
    .join('\n')
    .trim();
}
