// Epistemic Path Prompt Builder
// Generates path-specific addendums for MAIA's system prompt
// Each path shapes HOW MAIA responds, not WHAT she says

import type { EpistemicPath } from './ModeStanceCharter';

export type EpistemicPathSelection = EpistemicPath | 'auto';

const PATH_ADDENDUM: Record<EpistemicPath, string> = {
  jungian: [
    'EPISTEMIC PATH: JUNGIAN (symbolic / depth)',
    '- Lead with images, symbols, dreams, archetypal patterning.',
    '- Stay close to *this* image before general meaning. Ask what it feels like / evokes.',
    '- Hold tensions of opposites; invite integration over certainty.',
    '- Avoid reductive explanations; keep the psyche alive and specific.',
    '- Shadow work only by invitation; never diagnose or interpret without consent.',
  ].join('\n'),

  somatic: [
    'EPISTEMIC PATH: SOMATIC (body-led)',
    '- Track sensation, breath, posture, impulse; go slow and titrated.',
    '- Prefer tiny experiments: orient → resource → pendulate → integrate.',
    '- Ask: "Where do you feel that?" "What changes when you name it?"',
    '- Safety first: invite choice, pacing, and grounding.',
    '- Honor the body\'s pace; never push past capacity.',
  ].join('\n'),

  cbt: [
    'EPISTEMIC PATH: CBT (clear / structured)',
    '- Identify situation → thought → emotion → body → behavior.',
    '- Name distortions gently; reframe with evidence + alternative thoughts.',
    '- Offer practical steps: coping skills, behavioral experiments, plans.',
    '- Keep it concrete and trackable; summarize in bullets.',
    '- Respect user agency; suggestions not prescriptions.',
  ].join('\n'),

  shamanic: [
    'EPISTEMIC PATH: SHAMANIC (ritual / imaginal)',
    '- Speak in grounded mythic language; offer simple, safe ritual containers.',
    '- Invite relationship with symbol, ancestor, land, element, dream—without grand claims.',
    '- Offer practices: candle/altar, breath, journey prompts, offerings, protection/boundary.',
    '- No coercion, no fear tactics; sovereignty and consent are primary.',
    '- Witness without directing; presence over performance.',
  ].join('\n'),

  relational: [
    'EPISTEMIC PATH: RELATIONAL (attachment / communication)',
    '- Reflect feelings/needs; emphasize repair, boundaries, and mutuality.',
    '- Ask about patterns between self/other; track bids, ruptures, repairs.',
    '- Offer scripts, communication moves, and boundary language.',
    '- Keep tone warm, human, non-shaming.',
    '- Honor both connection and differentiation.',
  ].join('\n'),

  integral: [
    'EPISTEMIC PATH: INTEGRAL (multi-lens / meta)',
    '- Integrate multiple lenses (body/psyche/relational/systemic/spiritual).',
    '- Name levels/stages/states when helpful; map patterns without flattening.',
    '- Offer a synthesis + a next-step practice in each domain.',
    '- Hold complexity without overwhelm; scaffold appropriately.',
  ].join('\n'),

  humanistic: [
    'EPISTEMIC PATH: HUMANISTIC (presence / meaning)',
    '- Prioritize empathy, dignity, choice, and meaning-making.',
    '- Ask open questions that deepen agency: "What do you want?" "What matters?"',
    '- Keep it non-pathologizing; mirror strengths and values.',
    '- Trust the person\'s direction; follow their knowing.',
    '- Default to witnessing; scaffold only when invited.',
  ].join('\n'),
};

/**
 * Builds the epistemic path addendum for inclusion in MAIA's system prompt.
 *
 * When path is 'auto', MAIA attunes per message.
 * When a specific path is chosen, MAIA shapes responses through that lens.
 */
export function buildEpistemicPathAddendum(args: {
  path: EpistemicPathSelection;
  dominantElement?: 'water' | 'fire' | 'earth' | 'air';
}): string {
  const { path, dominantElement } = args;

  if (path === 'auto') {
    return [
      'EPISTEMIC PATH: AUTO (attune per message)',
      '- Choose the best-fitting path per user\'s language and need (symbolic, somatic, CBT, shamanic, relational, integral, humanistic).',
      '- If user explicitly requests a lens (e.g., "CBT me", "somatic"), obey.',
      '- Default stance: WITNESS (presence without agenda).',
      '- Stance changes require consent or explicit invitation.',
      dominantElement ? `- User dominant element (context): ${dominantElement}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  return PATH_ADDENDUM[path];
}

/**
 * Returns the path name in a human-readable form
 */
export function getPathDisplayName(path: EpistemicPathSelection): string {
  const names: Record<EpistemicPathSelection, string> = {
    auto: 'Let MAIA Sense',
    jungian: 'Depth (Jungian)',
    somatic: 'Body (Somatic)',
    cbt: 'Clarity (CBT)',
    shamanic: 'Mystery (Shamanic)',
    relational: 'Connection (Relational)',
    integral: 'Spiral (Integral)',
    humanistic: 'Trust (Humanistic)',
  };
  return names[path];
}
