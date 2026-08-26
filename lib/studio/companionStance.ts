/**
 * WS-VISIBLE-01 — MAIA's stance in the writing room.
 *
 * Pure: given what is actually on the table, produce the room state, the
 * opening line, and the system prompt. No I/O, no framework — so the stance
 * (the part that carries the product doctrine) is unit-testable without a
 * network or a database.
 *
 * Doctrine this file encodes (Build Charter §8):
 *   · MAIA may Reflect, Question, Notice, Connect, Discover, Gather, Shape,
 *     Develop. MAIA edits or drafts ONLY on the writer's explicit request.
 *   · Materials stay distinguishable from the Work; sources stay
 *     distinguishable from interpretations; the member's declaration stays
 *     distinguishable from MAIA's observation.
 *   · Nothing becomes authoritative because MAIA inferred it.
 *
 * The room state is read from FACTS ONLY — what exists, not what MAIA thinks
 * the writer is going through. There is no inferred readiness, no stage
 * advancement, no scoring.
 */

export type RoomState = 'discover' | 'gather' | 'working';

/** Below this the draft is not yet writing — it is a page that has been opened. */
const EARLY_DRAFT_CHARS = 400;

export interface RoomFacts {
  /** The member's own title for the Work, or null. Never generated. */
  workTitle: string | null;
  /** The member's stated intention, in their words, or null. */
  workPurpose: string | null;
  /** The member's own word for the form ("Book"). Never a taxonomy. */
  workForm: string | null;
  /** Where the member says they are. The system never sets this. */
  workStage: string | null;
  /** What the member declared feeds this Work. */
  materials: { label: string; kind: string; sentence: string | null }[];
  /** The manuscript on the table, if one is. */
  manuscriptTitle: string | null;
  draftChars: number;
  /** The opening of the draft — context, never the whole book. */
  draftExcerpt: string;
}

export function roomState(facts: Pick<RoomFacts, 'materials' | 'draftChars'>): RoomState {
  if (facts.draftChars >= EARLY_DRAFT_CHARS) return 'working';
  if (facts.materials.length > 0) return 'gather';
  return 'discover';
}

/**
 * The first thing MAIA says in the room, before the writer has said anything.
 *
 * Authored, not generated: an opening question must not cost a model call, and
 * must not vary between reloads of the same untouched room.
 */
export function openingLine(state: RoomState, facts: Pick<RoomFacts, 'materials'>): string {
  switch (state) {
    case 'discover':
      return 'What are you making?';
    case 'gather':
      return facts.materials.length === 1
        ? 'You brought one thing in. What made it belong here?'
        : `You brought ${facts.materials.length} things in. Want to look at them together?`;
    case 'working':
      return 'What feels alive here?';
  }
}

/** Four gestures the writer can hand MAIA without composing a sentence. */
export const INVITATIONS = [
  { id: 'reflect', label: 'Reflect', ask: 'Reflect back what you see in what I have here.' },
  { id: 'question', label: 'Question', ask: 'Ask me a question that would move this forward.' },
  { id: 'notice', label: 'Notice', ask: 'What do you notice recurring in what I have brought in?' },
  { id: 'connect', label: 'Connect', ask: 'Where do these materials and this draft touch each other?' },
] as const;

export type InvitationId = (typeof INVITATIONS)[number]['id'];

export function invitationAsk(id: string): string | null {
  return INVITATIONS.find((i) => i.id === id)?.ask ?? null;
}

const STANCE = `You are MAIA, in a writer's studio — a room organized around one living Work.

You are not a chat assistant and not a co-author. The writer is the author. You are the intelligence in the room who has been paying attention.

WHAT YOU DO
- Reflect what is actually present, in the writer's own terms.
- Ask the one question that would move the work, not five.
- Notice recurrence, tension, and what keeps circling back.
- Connect materials to the draft where they genuinely touch.
- Help name what is emerging, without deciding what it is.

WHAT YOU DO NOT DO
- Do not write or rewrite the work. Do not produce replacement prose, chapter drafts, outlines-as-deliverables, or "here is how I would say it" — unless the writer explicitly asks you to edit or draft, in this message.
- Do not praise. Do not encourage. Do not tell the writer they are doing great.
- Do not pronounce what the work IS, what genre it belongs to, or what it is becoming. You may say what you notice; the writer decides what it means.
- Do not summarize the materials back as if summary were insight.
- Do not invent material. If something is not in what you were given, say you cannot see it.

HOW YOU SPEAK
- Short. Two or three sentences is usually right. A single question is often better.
- Plain, literary, unhurried. No bullet lists unless the writer asked for a list.
- No headers, no bold, no emoji, no "Great question".
- Speak to the writer, not about them.

PROVENANCE
- What the writer declared is theirs; say "you said", "you brought this in".
- What you noticed is yours; say "I notice", "this looks like" — never state an observation as a fact about the work.
- Never blur the two.`;

/** Context block: only facts, each labelled with where it came from. */
export function contextBlock(facts: RoomFacts, state: RoomState): string {
  const lines: string[] = [];
  lines.push(`ROOM STATE (from what exists, not inferred): ${state}`);
  lines.push(
    facts.workTitle
      ? `THE WORK (named by the writer): ${facts.workTitle}`
      : 'THE WORK: the writer has not named it yet.',
  );
  if (facts.workForm) lines.push(`FORM (the writer's own word): ${facts.workForm}`);
  if (facts.workStage) lines.push(`WHERE THE WRITER SAYS THEY ARE: ${facts.workStage}`);
  if (facts.workPurpose) lines.push(`WHY, IN THE WRITER'S WORDS: ${facts.workPurpose}`);

  if (facts.materials.length === 0) {
    lines.push('MATERIALS: nothing has been brought in yet.');
  } else {
    lines.push('MATERIALS the writer declared belong to this Work:');
    for (const m of facts.materials) {
      lines.push(
        `  - [${m.kind}] ${m.label}${m.sentence ? ` — the writer wrote: "${m.sentence}"` : ' (no sentence written; that is a correct state, not a gap)'}`,
      );
    }
  }

  if (facts.draftChars === 0) {
    lines.push('THE DRAFT: empty.');
  } else {
    lines.push(
      `THE DRAFT${facts.manuscriptTitle ? ` (${facts.manuscriptTitle})` : ''}: ${facts.draftChars} characters. Its opening follows between the markers. This is an EXCERPT — do not assume it is the whole work.`,
    );
    lines.push('<<<DRAFT');
    lines.push(facts.draftExcerpt);
    lines.push('DRAFT>>>');
  }
  return lines.join('\n');
}

export function buildSystemPrompt(facts: RoomFacts, state: RoomState): string {
  return `${STANCE}\n\nWHAT IS ACTUALLY IN THE ROOM RIGHT NOW\n${contextBlock(facts, state)}`;
}

/** The draft opening MAIA is given. Bounded so a 200-page book stays sendable. */
export const DRAFT_EXCERPT_CHARS = 6000;

export function draftExcerpt(content: string): string {
  return content.length <= DRAFT_EXCERPT_CHARS ? content : `${content.slice(0, DRAFT_EXCERPT_CHARS)}…`;
}
