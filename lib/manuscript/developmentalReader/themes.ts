/**
 * D5C1 — pure Themes claim admission law.
 *
 * A Themes claim says something repeats across the Work. One direct textual
 * location is therefore insufficient. Structural/sequence refs may support a
 * claim but do not themselves prove textual presence.
 */
import type { EvidenceRef } from '@/lib/manuscript/development/evidenceRef';

const IMPORTANCE = /\b(key|central|strongest|important|significant|dominant|primary|major|emerging)\b/i;

export type ThemeClaimRefusal =
  | 'missing_label'
  | 'importance_label'
  | 'insufficient_repeated_evidence';

export function directThemeSectionIds(refs: readonly EvidenceRef[]): readonly string[] {
  const ids = new Set<string>();
  for (const ref of refs) {
    if (ref.kind === 'section' || ref.kind === 'passage') ids.add(ref.sectionId);
  }
  return [...ids];
}

export function validateThemeClaim(
  label: string | undefined,
  refs: readonly EvidenceRef[],
): { ok: true; sectionIds: readonly string[] } | { ok: false; refusal: ThemeClaimRefusal } {
  const cleaned = label?.trim() ?? '';
  if (cleaned.length < 1 || cleaned.length > 120) {
    return { ok: false, refusal: 'missing_label' };
  }
  if (IMPORTANCE.test(cleaned)) {
    return { ok: false, refusal: 'importance_label' };
  }
  const sectionIds = directThemeSectionIds(refs);
  if (sectionIds.length < 2) {
    return { ok: false, refusal: 'insufficient_repeated_evidence' };
  }
  return { ok: true, sectionIds };
}
