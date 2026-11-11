/**
 * Where the writer was in Develop: the last chapter they chose, per signed-in writer and per
 * manuscript, remembered in this browser only (founder P0 direction 2026-11-11, item 4:
 * "On reopening Develop, restore the writer's selected View and chapter. Keep account
 * isolation strict.").
 *
 * - Presentation memory only: never sent to the server, never read by MAIA, never a reading.
 * - Keyed by member id, so a second writer on the same browser never lands in the first
 *   writer's chapter. No signed-in writer → nothing remembered, nothing written.
 * - Temporary observation focus is deliberately NOT remembered: a new visit opens the chapter,
 *   not an observation (founder's recommended default, same direction).
 */
import { getValidMemberId } from '@/lib/http/apiBase';

export const DEVELOP_PLACE_PREFIX = 'writers-studio:develop-place:v1';

let memberResolver: () => string | null = () => getValidMemberId();
/** Test seam only. */
export function __setDevelopPlaceMemberResolver(resolve: (() => string | null) | null): void {
  memberResolver = resolve ?? (() => getValidMemberId());
}
function member(): string | null {
  try { const id = memberResolver(); return id && id.trim() ? id : null; } catch { return null; }
}
export function developPlaceKey(memberId: string, manuscriptId: string): string {
  return `${DEVELOP_PLACE_PREFIX}:${memberId}:${manuscriptId}`;
}

export function readDevelopPlace(manuscriptId: string | null | undefined): string | null {
  if (typeof window === 'undefined' || !manuscriptId) return null;
  const m = member();
  if (!m) return null;
  try {
    const raw = window.localStorage.getItem(developPlaceKey(m, manuscriptId));
    const data: unknown = raw ? JSON.parse(raw) : null;
    const id = data && typeof data === 'object' ? (data as { sectionId?: unknown }).sectionId : null;
    return typeof id === 'string' && id ? id : null;
  } catch { return null; }
}

export function writeDevelopPlace(manuscriptId: string | null | undefined, sectionId: string | null | undefined): void {
  if (typeof window === 'undefined' || !manuscriptId || !sectionId) return;
  const m = member();
  if (!m) return;
  try { window.localStorage.setItem(developPlaceKey(m, manuscriptId), JSON.stringify({ sectionId })); }
  catch { /* a private window still works; the place is simply not remembered */ }
}

/** The chapter Develop opens on: the address first, then the remembered chapter if it still exists, then the first. */
export function resolveDevelopSection(
  sections: readonly { draftSectionId: string }[],
  requested: string | null,
  remembered: string | null,
): string | null {
  if (!sections.length) return null;
  const has = (id: string | null) => Boolean(id && sections.some((s) => s.draftSectionId === id));
  if (has(requested)) return requested;
  if (has(remembered)) return remembered;
  return sections[0]?.draftSectionId ?? null;
}
