/**
 * SEMANTIC-FIELD-01 · Design 1B — "take me there".
 *
 * Founder ruling 2026-11-02 (Design 1, "A now, then B"; v1 action set approved in
 * WRITERS-STUDIO-SEMANTIC-FIELD-01_DESIGN_1B_TAKE_ME_THERE_2026-11-02.md):
 * MAIA may OFFER a Studio control at the end of a reply; the writer clicks it.
 *
 * ⛔ MAIA never acts. A marker is text she wrote; its only meaning comes from
 * this closed allowlist. An unknown marker is stripped and becomes nothing.
 * ⛔ Every action only takes the writer somewhere. None sends a message, starts
 * a reading or pass, grants read permission, saves or applies text.
 * ⛔ "Go to section X" is deliberately absent: headings are not unique, so it
 * waits for section ids MAIA is given and cannot invent.
 *
 * ⭐ G4 AMENDMENT (founder, 2026-11-09, "Yes, start G4"): ONE action acts — `read-chapter`. MAIA may offer it; ONLY the writer's click
 * starts her reading of the chapter the writer is in (optionally through a lens: `[[studio:read-chapter:arc]]`). The reading records her
 * observations; nothing in the writing changes. Every other action stays navigation-only, exactly as ruled in Design 1B.
 *
 * ⭐ AMENDMENT 2 (founder, 2026-11-09, "i want it all" → "Yes, amend it"): everything in Develop should be askable through MAIA. FOUR
 * more actions MAIA may OFFER on the Work conversation; ONLY the writer's click performs each, and none is offered or performed in
 * Sanctuary (she is not told about the buttons there, and the click refuses):
 *   `grant-reading:chapter|work` — the click IS the writer's consent: it sets the read permission they chose (revocable any time).
 *   `make-plan`   — the click asks MAIA for a plan whose purpose is the writer's own latest question. A plan never changes the text.
 *   `note-settled`— the click opens a box with the writer's OWN latest words, editable; nothing is recorded until they press "Note it".
 *                   A settled decision is always writer-authored, never MAIA's words.
 *   `open-desk`   — navigation: Write's passage desk on the passage being discussed (exact, unique words only). The desk proposes;
 *                   the writer decides there.
 */

import { stripAnswerChoices } from '@/lib/writersStudio/answerChoices';
import { DEVELOPMENTAL_LENSES, type DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';

export type StudioActionId = 'develop-overview' | 'editorial-pass' | 'craftsmans-table' | 'new-conversation' | 'read-chapter'
  | 'grant-reading' | 'make-plan' | 'note-settled' | 'open-desk';
export type StudioActionSurface = 'passage-focus' | 'work-conversation';

export type StudioAction = {
  readonly id: StudioActionId;
  /** Button text; names the real control. */
  readonly label: string;
  /** What MAIA is told the button does. */
  readonly does: string;
  readonly surfaces: readonly StudioActionSurface[];
};

export const STUDIO_ACTIONS: readonly StudioAction[] = [
  { id: 'develop-overview', label: 'Go to “Read this chapter”', does: 'opens Develop → Overview, where the writer can press "Read this chapter"', surfaces: ['passage-focus', 'work-conversation'] },
  { id: 'editorial-pass', label: 'Go to “Start an editorial pass”', does: 'opens Develop → More ways to explore → Edit with MAIA, where the writer can press "Start an editorial pass"', surfaces: ['passage-focus', 'work-conversation'] },
  { id: 'craftsmans-table', label: 'Open Craftsman’s Table here', does: 'opens Craftsman\'s Table on the passage already in Focus', surfaces: ['passage-focus'] },
  { id: 'read-chapter', label: 'Read this chapter', does: 'when the writer clicks it, you read the whole chapter they are in (with a lens if you name one); your observations are kept for later conversations and nothing in their writing changes. Only their click starts it', surfaces: ['work-conversation'] },
  { id: 'grant-reading', label: 'Let MAIA read my saved work', does: 'when the writer clicks it, they give you permission to read the saved text of this chapter (write :chapter) or the whole Work (write :work) while you talk; they can stop it any time. Only their click grants it', surfaces: ['work-conversation'] },
  { id: 'make-plan', label: 'Make a plan from this', does: 'when the writer clicks it, you make a plan of grounded steps for the question they just asked; the plan is theirs to edit and never changes their writing. Only their click starts it', surfaces: ['work-conversation'] },
  { id: 'note-settled', label: 'Note this as settled', does: 'when the writer clicks it, a box opens with the writer\'s own latest words for them to edit and note as something they have settled about the book; nothing is recorded until they press Note it, and you never write the decision for them', surfaces: ['work-conversation'] },
  { id: 'open-desk', label: 'Open the passage desk', does: 'takes the writer to Write\'s passage desk on the passage you are discussing, where they can work on it; nothing changes until they decide there', surfaces: ['work-conversation'] },
  { id: 'new-conversation', label: 'Start a new conversation', does: 'sets this conversation aside (it stays saved) so the next question starts fresh', surfaces: ['passage-focus', 'work-conversation'] },
];

const MARKER = /\[\[studio:([^\]\n]{0,64})\]\]/g;

export type ParsedReply = {
  /** The reply with every marker removed, known or not. */
  readonly text: string;
  /** At most one known action offered for this surface. */
  readonly action: StudioAction | null;
  /** For `read-chapter`: the lens she named, only if it is a real reading lens (else the default overview). */
  readonly lens?: DevelopmentalLens;
  /** For `grant-reading`: what the writer would be permitting (default: the chapter). */
  readonly level?: 'chapter' | 'work';
};

/** Strip every `[[studio:…]]` marker; keep the first one this surface allows. */
export function parseStudioActions(body: string, surface: StudioActionSurface): ParsedReply {
  let action: StudioAction | null = null;
  let lens: DevelopmentalLens | undefined;
  let level: 'chapter' | 'work' | undefined;
  // Answer-choice markers are never shown as text anywhere (answerChoices.ts).
  const text = stripAnswerChoices(body).replace(MARKER, (_m, raw: string) => {
    const [id, param] = raw.trim().split(':', 2) as [string, string | undefined];
    const found = STUDIO_ACTIONS.find((a) => a.id === id && (param === undefined || a.id === 'read-chapter' || (a.id === 'grant-reading' && (param === 'chapter' || param === 'work'))));
    if (!action && found && found.surfaces.includes(surface)) {
      action = found;
      if (found.id === 'grant-reading') level = param === 'work' ? 'work' : 'chapter';
      if (found.id === 'read-chapter') lens = (DEVELOPMENTAL_LENSES as readonly string[]).includes(param ?? '') ? (param as DevelopmentalLens) : 'overview';
    }
    return '';
  }).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return { text, action, ...(lens ? { lens } : {}), ...(level ? { level } : {}) };
}

/** Strip markers only, for surfaces that show replies but offer no buttons. */
export function stripStudioActions(body: string): string {
  return stripAnswerChoices(body).replace(MARKER, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** The two Develop places a button can take the writer to. */
export type StudioPlace = 'develop-overview' | 'editorial-pass';

/** The hash Develop reads on arrival to reveal the control (it never presses it). */
export const STUDIO_PLACE_HASH: Readonly<Record<StudioPlace, string>> = {
  'develop-overview': 'read-this-chapter',
  'editorial-pass': 'editorial-pass',
};

/** Room state that belongs to where the writer was, not to Develop → Overview. */
const LEAVING_PARAMS = ['developField', 'r', 'attentionItem', 'insightReading', 'insightObservation',
  'insightAction', 'reviewRun', 'reviewFinding'];

/** Design 1B: the address of a Develop place, from any room, for the same Work. Navigation only. */
export function studioPlaceHref(pathname: string, search: string, place: StudioPlace): string {
  const next = new URLSearchParams(search);
  next.set('mode', 'develop');
  for (const key of LEAVING_PARAMS) next.delete(key);
  const query = next.toString();
  return `${pathname}${query ? `?${query}` : ''}#${STUDIO_PLACE_HASH[place]}`;
}

/** What MAIA is told about offering a control, on surfaces that show the button. */
export function studioActionsInstruction(surface: StudioActionSurface): string {
  const allowed = STUDIO_ACTIONS.filter((a) => a.surfaces.includes(surface));
  return [
    'OFFERING A STUDIO CONTROL',
    'When pointing the writer to one of the controls below would genuinely help, you may end your reply with exactly one marker on its own line, and the Studio shows it as a button the writer can click. Use it only when you have just pointed to that control in your reply. Never more than one. Never invent a marker; anything not listed is removed and does nothing. Unless its description below says otherwise, the button only takes the writer there; it does not press anything. Where a description says only their click does something, you never do it yourself.',
    ...allowed.map((a) => `- [[studio:${a.id}]] — ${a.does}.`),
    ...(allowed.some((a) => a.id === 'read-chapter') ? [
      `To offer a reading through a particular lens, write it after a colon: [[studio:read-chapter:arc]]. Lenses: ${DEVELOPMENTAL_LENSES.join(', ')}.`,
      'Offer [[studio:read-chapter]] when the writer asks you to read the chapter they are in, or when reading it whole would genuinely help and you have no reading of it. Ask; never assume the answer. You never start a reading yourself.',
    ] : []),
    ...(allowed.some((a) => a.id === 'grant-reading') ? [
      'Offer [[studio:grant-reading:chapter]] or [[studio:grant-reading:work]] only when the writer asks you to read more than you have been given, or asks to look across chapters, and you were not given that text. Ask; never press for it. Consent is theirs.',
      'Offer [[studio:make-plan]] when the writer asks for a plan, or asks how to get from here to what they want across several passages.',
      'Offer [[studio:note-settled]] when the writer states something they have decided about the book. The decision is in their words, never yours.',
      'Offer [[studio:open-desk]] when the writer wants to work on the exact passage you are discussing.',
    ] : []),
  ].join('\n');
}
