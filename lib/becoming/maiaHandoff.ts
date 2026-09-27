import { ELEMENTS, elementalOf, validateSession, titleOf, type Session } from './core';

function clean(value: string): string {
  return value.trim();
}

function push(lines: string[], label: string, value: string): void {
  const text = clean(value);
  if (!text) return;
  lines.push(label, text, '');
}

export function buildBecomingMaiaHandoff(session: Session): string {
  validateSession(session);
  const lines: string[] = [
    'I have just completed a Soullab Becoming / Future Self journey.',
    'Please do not ask me to repeat material that is already included below.',
    '',
    'Everything between BEGIN and END is member-authored journey material.',
    'Future scenes and future-perspective dialogue are imaginal possibilities, not predictions or external communications.',
    '',
    'Begin with a supportive synthesis of the journey as a whole.',
    'Reflect the arc between where I began, what I encountered, what I made of it, and what I brought back.',
    'If elemental immersion is present, notice possible convergence or tension among sensing, feeling, knowing, vitality, and whole-field recognition without scoring, balancing, or treating Aether as revelation.',
    'If you notice patterns, tensions, continuities, intentions, or possible shadow material, offer them only as hypotheses and distinguish them from what I actually wrote.',
    'Do not impersonate my future self, declare destiny, or turn an imagined future into a fact about me.',
    'Then stay in conversation with me and ask one natural question that helps deepen or expand what is here.',
    '',
    '--- BEGIN MEMBER-AUTHORED BECOMING JOURNEY ---',
    `Journey: ${titleOf(session)}`,
    '',
  ];

  push(lines, 'WHERE I BEGAN', session.arrival);

  session.possibilities.forEach((possibility, index) => {
    lines.push(`POSSIBILITY ${index + 1}: ${clean(possibility.label) || 'Unnamed possibility'}`);
    if (clean(possibility.horizon)) lines.push(`Felt horizon: ${clean(possibility.horizon)}`);
    if (possibility.qualities.length) lines.push(`Member-selected qualities: ${possibility.qualities.join(', ')}`);
    if (clean(possibility.encounter)) lines.push('', 'WHAT APPEARED', clean(possibility.encounter));
    const elemental = elementalOf(possibility);
    const enteredElements = ELEMENTS.filter(element => clean(elemental[element]));
    if (enteredElements.length) {
      lines.push('', 'ELEMENTAL IMMERSION — MEMBER-AUTHORED');
      for (const element of enteredElements) {
        lines.push(`${element.toUpperCase()}:`, clean(elemental[element]));
      }
    }
    if (possibility.dialogue.length) {
      lines.push('', 'IMAGINAL DIALOGUE — BOTH VOICES ENTERED BY THE MEMBER');
      for (const turn of possibility.dialogue) {
        lines.push(
          turn.perspective === 'present'
            ? 'Member, present perspective:'
            : 'Member, imagined future perspective:',
          clean(turn.text) || '[left open]',
        );
      }
    }
    lines.push('');
  });

  push(lines, 'WHAT STAYED WITH ME', session.discernment.noticed);
  push(lines, 'WHAT FEELS MEANINGFUL', session.discernment.meaning);
  push(lines, 'WHAT REMAINS OPEN', session.discernment.open);
  push(lines, 'WHAT DOES NOT FIT / COUNTEREVIDENCE', session.discernment.counterevidence);
  push(lines, 'WHAT I BROUGHT BACK', session.returnNote);
  const carry = [
    ['Way of being', session.bridge.orientation],
    ['Question', session.bridge.question],
    ['Something I may try', session.bridge.act],
    ['Practice', session.bridge.practice],
    ['Obstacle', session.bridge.obstacle],
    ['Support', session.bridge.support],
  ] as const;
  const keptCarry = carry.filter(([, value]) => clean(value));
  if (keptCarry.length) {
    lines.push('WHAT I CHOSE TO CARRY INTO PRESENT LIFE');
    for (const [label, value] of keptCarry) lines.push(`${label}: ${clean(value)}`);
    lines.push('');
  }

  push(lines, 'A CONNECTION I NOTICED ACROSS TIME', session.connection);
  push(lines, 'WHAT DID NOT FIT THAT CONNECTION', session.exception);

  lines.push('--- END MEMBER-AUTHORED BECOMING JOURNEY ---');
  return lines.join('\n');
}
