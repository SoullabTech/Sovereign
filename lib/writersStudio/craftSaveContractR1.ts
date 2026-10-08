import type { CraftKeptSpan } from './craftFocusR1';
import { parseCraftKeptSpans } from './craftSettledChoicesR1';

/** Exact writer gesture. Saving never accepts or applies a manuscript change. */
export interface CraftSaveRequest {
  sectionId: string;
  range: { start: number; end: number };
  revisionNumber: number;
  threadId: string | null;
  supersedes: string | null;
  replacementText: string;
  sanctuary: boolean;
  kept?: readonly CraftKeptSpan[];
}
export interface CraftWorkingSaveDraft {
  held: { draftSectionId: string; start: number; end: number; text: string; revisionNumber: number };
  threadId: string | null;
  supersedes: string | null;
  text: string;
  kept?: readonly CraftKeptSpan[];
}
export interface SavedCraftVersionReference {
  threadId: string;
  versionId: string;
  sectionId: string;
  locusText: string;
  excerpt: string;
}

export function parseCraftSaveRequest(raw: unknown):
  { ok: true; value: CraftSaveRequest } | { ok: false; reason: string } {
  const fail = (reason: string) => ({ ok: false as const, reason });
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return fail('invalid_body');
  const b = raw as Record<string, unknown>;
  const allowed = ['sectionId', 'range', 'revisionNumber', 'threadId', 'supersedes', 'replacementText', 'sanctuary', 'kept'];
  if (Object.keys(b).some(k => !allowed.includes(k))) return fail('unknown_field');
  if (typeof b.sanctuary !== 'boolean') return fail('posture_required');
  if (b.sanctuary) return fail('sanctuary_unavailable');
  const id = (v: unknown) => typeof v === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(v);
  if (!id(b.sectionId) || !(b.threadId === null || id(b.threadId)) || !(b.supersedes === null || id(b.supersedes))) return fail('invalid_identity');
  if (b.threadId === null && b.supersedes !== null) return fail('invalid_predecessor');
  const r = b.range as Record<string, unknown> | undefined;
  if (!r || typeof r !== 'object' || Array.isArray(r) || Object.keys(r).some(k => k !== 'start' && k !== 'end')
    || !Number.isSafeInteger(r.start) || !Number.isSafeInteger(r.end)
    || Number(r.start) < 0 || Number(r.end) <= Number(r.start)) return fail('selection_invalid');
  if (!Number.isSafeInteger(b.revisionNumber) || Number(b.revisionNumber) < 0) return fail('selection_invalid');
  // Empty wording is a legitimate saved draft. Do not trim or normalize it.
  if (typeof b.replacementText !== 'string' || b.replacementText.length > 200_000) return fail('invalid_wording');
  if (b.kept !== undefined && !parseCraftKeptSpans(b.kept)) return fail('invalid_settled_choices');
  return { ok: true, value: b as unknown as CraftSaveRequest };
}
