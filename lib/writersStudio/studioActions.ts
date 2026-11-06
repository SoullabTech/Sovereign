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
 */

import { stripAnswerChoices } from '@/lib/writersStudio/answerChoices';

export type StudioActionId = 'develop-overview' | 'editorial-pass' | 'craftsmans-table' | 'new-conversation';
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
  { id: 'new-conversation', label: 'Start a new conversation', does: 'sets this conversation aside (it stays saved) so the next question starts fresh', surfaces: ['passage-focus', 'work-conversation'] },
];

const MARKER = /\[\[studio:([^\]\n]{0,64})\]\]/g;

export type ParsedReply = {
  /** The reply with every marker removed, known or not. */
  readonly text: string;
  /** At most one known action offered for this surface. */
  readonly action: StudioAction | null;
};

/** Strip every `[[studio:…]]` marker; keep the first one this surface allows. */
export function parseStudioActions(body: string, surface: StudioActionSurface): ParsedReply {
  let action: StudioAction | null = null;
  // Answer-choice markers are never shown as text anywhere (answerChoices.ts).
  const text = stripAnswerChoices(body).replace(MARKER, (_m, raw: string) => {
    const found = STUDIO_ACTIONS.find((a) => a.id === raw.trim());
    if (!action && found && found.surfaces.includes(surface)) action = found;
    return '';
  }).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return { text, action };
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
    'When pointing the writer to one of the controls below would genuinely help, you may end your reply with exactly one marker on its own line, and the Studio shows it as a button the writer can click. Use it only when you have just pointed to that control in your reply. Never more than one. Never invent a marker; anything not listed is removed and does nothing. The button only takes the writer there; it does not press anything.',
    ...allowed.map((a) => `- [[studio:${a.id}]] — ${a.does}.`),
  ].join('\n');
}
