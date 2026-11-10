/**
 * WS-DEVELOP-STUDIO — the declared Work kind, browser-safe half: the type, the list and the starters. No database here, so client
 * components may import it (importing `workKind.ts` from a client pulled `pg` into the browser bundle and broke the production build).
 */
export type WorkKind = 'fiction' | 'nonfiction' | 'practitioner';
export const WORK_KINDS: readonly WorkKind[] = ['fiction', 'nonfiction', 'practitioner'];

/** Plain-language ways in, in the writer's own register, by DECLARED kind. They fill the composer; they never send. */
export function startersFor(kind: WorkKind | null, label: string, nextLabel: string | null): string[] {
  const end = nextLabel ? `How does ${label} lead into ${nextLabel}?` : `How does ${label} end?`;
  switch (kind) {
    case 'fiction': return [`What is ${label} doing in the story?`, `Where does ${label} lose you?`, end];
    case 'nonfiction': return [`What is ${label} claiming?`, `Where does the argument in ${label} lose you?`, end];
    case 'practitioner': return [`Which idea is ${label} teaching?`, `Where would a reader need more before ${label}?`, `Which story in ${label} earns its point?`];
    default: return [`What is ${label} doing in the book?`, `Where does ${label} lose you?`, end];
  }
}
