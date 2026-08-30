/**
 * WS2-04A — the TWO historical draft composers.
 *
 * A draft's section boundaries can only be recovered by comparing it against
 * the algorithm that actually composed it. There have been two, and comparing
 * against the wrong one made Elemental Alchemy look like a book full of edits
 * when it may contain none.
 *
 * Neither is reconstructed from evidence. Both are named functions read out of
 * the repository, and a draft either equals one byte-for-byte or it does not.
 */

import {
  assembleManuscriptMarkdown,
  type MemberBookSection,
} from '../../lib/manuscript/render/renderMemberBook';

export type SourceSection = MemberBookSection;

/**
 * CURRENT. Headings as plain lines, the author's words only.
 *
 * `composeDraftText` in app/api/sovereign/manuscripts/[id]/draft/route.ts,
 * introduced by 5f50f6790 (2026-08-05) — the persona-walk covenant fixes —
 * which removed the `# ` scaffolding after the walk found it sitting inside
 * the novelist's prose at the worktable.
 */
export function composeCurrent(sections: SourceSection[]): string {
  const parts: string[] = [];
  for (const s of sections) {
    const h = s.heading?.trim();
    if (h) { parts.push(h); parts.push(''); }
    parts.push(s.body);
    parts.push('');
  }
  return parts.join('\n');
}

/**
 * LEGACY. Headings prefixed `# `.
 *
 * This is not a guess at what the old composer did — it IS the old composer.
 * Before 5f50f6790 the draft route called `assembleManuscriptMarkdown`
 * directly; that commit stopped calling it and left the function itself
 * untouched, because pandoc's chapter splitting still depends on the `# `
 * form. So the render path's assembler is the historical draft composer,
 * still in the tree, imported here rather than copied.
 *
 * Its body has been byte-identical since be2927c2f (2026-07-26) — earlier than
 * any working draft founded on Jul 30, so what it emits today is what it
 * emitted then. A draft that matches it has not been edited since founding.
 */
export const composeLegacyHashHeadings = assembleManuscriptMarkdown;

export const COMPOSERS = [
  { name: 'current', compose: composeCurrent },
  { name: 'legacy(# headings)', compose: composeLegacyHashHeadings },
] as const;
