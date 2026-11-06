/**
 * Design pass D4 (2026-11-05): the conversation header names the place in the writer's own
 * terms — the section's heading (or "Section N", as the page does) and which paragraph —
 * never "Selected passage". Offsets are code points, as the held passage records them.
 */
export function passagePlaceLabel(
  section: { heading: string | null; position: number } | null | undefined,
  body: string,
  held: { start: number; end: number } | null | undefined,
): string {
  const name = section ? (section.heading?.trim() || `Section ${section.position + 1}`) : 'This passage';
  if (!held) return name;
  const chars = Array.from(body);
  const paragraphAt = (offset: number) => {
    const before = chars.slice(0, Math.max(0, Math.min(offset, chars.length))).join('');
    return (before.match(/\n\s*\n/g)?.length ?? 0) + 1;
  };
  const first = paragraphAt(held.start);
  // The end offset is exclusive; the last character held decides the last paragraph.
  const last = paragraphAt(Math.max(held.start, held.end - 1));
  return first === last ? `${name} · paragraph ${first}` : `${name} · paragraphs ${first}–${last}`;
}
