import { ELEMENTS, elementalOf, validateSession, type Element, type Movement, type Session } from './core';

export interface JourneyGuideContext {
  session: Session;
  movement: Movement;
  activePossibilityId: string;
  element: Element | null;
  previousInvitation?: string;
}

function clean(value: string): string {
  return value.trim();
}

function add(lines: string[], label: string, value: string): void {
  const text = clean(value);
  if (!text) return;
  lines.push(label, text, '');
}
export function buildJourneyGuidePrompt(context: JourneyGuideContext): string {
  validateSession(context.session);
  if (context.element !== null && !ELEMENTS.includes(context.element)) throw new Error('INVALID_GUIDE_ELEMENT');
  const possibility = context.session.possibilities.find(item => item.id === context.activePossibilityId)
    ?? context.session.possibilities[0];
  if (!possibility) throw new Error('MISSING_GUIDE_POSSIBILITY');

  const lines = [
    'You are MAIA guiding one in-progress Soullab Becoming / Future Self journey.',
    '',
    'GUIDE LAW:',
    '- Use only the CURRENT JOURNEY MATERIAL below. Do not retrieve, mention, or infer from prior conversations, memories, profiles, or other Soullab fields.',
    '- Offer exactly ONE brief invitation at a time: one question or one experiential invitation, never a list.',
    '- Keep it to one or two short sentences. Do not summarize the journey unless the member is in Discern or Return and synthesis is directly useful.',
    '- Follow what is already arising. Do not force Earth → Water → Air → Fire → Aether as a sequence.',
    '- Earth, Water, Air, Fire, and Aether are available modes of perception, not scores, diagnoses, or personality types.',
    '- If an element is already active, deepen that element. If no element is active, you may gently notice an elemental doorway already present, but do not assign one as truth.',
    '- Aether gathers the whole field and may notice coherence or tension; it never pronounces revelation, destiny, or objective truth.',
    '- Never impersonate the future self. Never speak for the imagined future perspective. Future material remains imaginal, not predictive.',
    '- Do not prescribe major life decisions. Preserve uncertainty and member authorship.',
    '- During Return, orient toward present life and embodiment. Return remains the member’s explicit act.',
    '',
    `CURRENT MOVEMENT: ${context.movement.toUpperCase()}`,
    `ACTIVE ELEMENT: ${context.element ? context.element.toUpperCase() : 'NONE — FOLLOW WHAT IS ARISING'}`,
    '',
    '--- BEGIN CURRENT MEMBER-AUTHORED JOURNEY MATERIAL ---',
  ];

  add(lines, 'PRESENT-LIFE ARRIVAL', context.session.arrival);
  add(lines, 'POSSIBILITY NAME', possibility.label);
  add(lines, 'FELT HORIZON', possibility.horizon);
  add(lines, 'WHAT APPEARED', possibility.encounter);
  const elemental = elementalOf(possibility);
  const entered = ELEMENTS.filter(element => clean(elemental[element]));
  if (entered.length) {
    lines.push('ELEMENTAL PERCEPTION ALREADY ENTERED');
    for (const element of entered) lines.push(`${element.toUpperCase()}:`, clean(elemental[element]));
    lines.push('');
  }

  if (possibility.dialogue.length) {
    lines.push('MEMBER-ENTERED IMAGINAL DIALOGUE');
    for (const turn of possibility.dialogue) {
      lines.push(
        turn.perspective === 'present' ? 'Present self:' : 'Imagined future perspective — member-authored:',
        clean(turn.text) || '[left open]',
      );
    }
    lines.push('');
  }
  if (context.movement === 'discern' || context.movement === 'return' || context.movement === 'bridge') {
    add(lines, 'WHAT STAYED WITH THE MEMBER', context.session.discernment.noticed);
    add(lines, 'MEMBER MEANING', context.session.discernment.meaning);
    add(lines, 'WHAT REMAINS OPEN', context.session.discernment.open);
    add(lines, 'WHAT DOES NOT FIT', context.session.discernment.counterevidence);
  }
  if (context.movement === 'return' || context.movement === 'bridge') {
    add(lines, 'WHAT THE MEMBER WANTS TO BRING BACK', context.session.returnNote);
  }

  lines.push('--- END CURRENT MEMBER-AUTHORED JOURNEY MATERIAL ---');
  if (context.previousInvitation?.trim()) {
    lines.push('', 'YOUR PREVIOUS INVITATION IN THIS JOURNEY:', context.previousInvitation.trim());
    lines.push('Offer a different or deeper single invitation rather than repeating it.');
  }
  return lines.join('\n');
}
