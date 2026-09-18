/** Optional author-selected approaches, never findings or quality rankings. */
export const EDITORIAL_APPROACHES = [
  { id: 'deepen', label: 'Preserve and deepen',
    benefit: 'Let each return contribute a new experience, question, or discovery.',
    tradeoff: 'Keeping every appearance asks more of the reader; each needs a distinct purpose.',
    request: 'Explore preserving the recurring idea while giving this passage a distinct contribution. Ask where my intention is unclear. Do not assume repetition is a defect.' },
  { id: 'echo', label: 'One full telling, later echoes',
    benefit: 'Let a brief return recall an earlier story while the chapter moves forward.',
    tradeoff: 'A shorter echo may lose emotional immersion or context.',
    request: 'Explore a concise echo here, conditional on a fuller telling elsewhere. Do not choose which passage to cut without the relevant text and my intention.' },
  { id: 'form', label: 'Try another form',
    benefit: 'Let a scene, image, question, or optional practice carry the idea differently.',
    tradeoff: 'A new form can interrupt the narrative rhythm or explain what was better left open.',
    request: 'Explore another form for this passage that fits my genre and intention. Offer alternatives to a practice if instruction would not suit the work. Do not invent personal stories, client accounts, quotations, or sources.' },
] as const;
export type EditorialApproachId = typeof EDITORIAL_APPROACHES[number]['id'];
export function appendEditorialNote(existing: string, note: string): string {
  return [existing.trim(), note.trim()].filter(Boolean).join('\n\n');
}
export function approachNote(id: EditorialApproachId): string {
  const approach = EDITORIAL_APPROACHES.find(a => a.id === id)!;
  return 'Direction I want to explore: ' + approach.label + '\n' + approach.request
    + '\nExplain the possible reader benefit and what could be lost. Treat reader effects as hypotheses. Separate changes to meaning from changes to style. Use only supplied evidence; say what a wider reading would be needed to establish.';
}
export function voiceNote(preferences: string, example: string): string {
  return [preferences.trim() ? 'Voice and meaning I want to preserve:\n' + preferences.trim() : '',
    example.trim() ? 'My chosen voice example (reference only, not replacement text):\n' + example.trim() : '',
    preferences.trim() || example.trim() ? 'Do not treat this example as a fixed identity. Flag any proposed change in meaning; preserve intentional ambiguity and rhythm.' : '',
  ].filter(Boolean).join('\n\n');
}
export function intentionNote(intention: string, reader: string): string {
  return [intention.trim() ? 'My intention:\n' + intention.trim() : '',
    reader.trim() ? 'The reader’s experience I want:\n' + reader.trim() : ''].filter(Boolean).join('\n\n');
}
/** Browser selection offsets are UTF-16, as are textarea selectionStart/End. */
export function selectedProposalText(text: string, start: number, end: number): string | null {
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > text.length || end <= start) return null;
  const part = text.slice(start, end);
  return part.trim() ? part : null;
}

/** A purpose is editorial intent, not a quality score or author identity. */
export function alternativeLabel(version: { author: string; rationale: string | null }, index: number): string {
  const purpose = version.rationale?.match(/^Editorial purpose:\s*([^\n]+)/i)?.[1]?.trim();
  return (purpose ? purpose.split(/[.\n—]/)[0].trim().slice(0, 80) : version.author === 'member' ? 'Your revision' : 'Alternative') + ' · v' + (index + 1);
}
export function passageContext(body: string, expected: string): { before: string; after: string } | null {
  if (!expected) return null;
  const at = body.indexOf(expected);
  if (at < 0 || body.indexOf(expected, at + 1) >= 0) return null;
  return { before: body.slice(0, at), after: body.slice(at + expected.length) };
}
