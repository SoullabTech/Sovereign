import { sameCraftKeptSpans, verifiedCraftKeptSpans } from './craftSettledChoicesR1';
import { apiFetch } from '@/lib/http/apiBase';
import { readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';
import { readBoundEditorialThread, type RebuildEditorialThread, type RebuildEditorialVersion } from './rebuild/editorialCollaboration';
import { craftTargetKey, type CraftTableSnapshot } from './craftFocusR1';
import type { CraftWorkingSaveDraft, SavedCraftVersionReference } from './craftSaveContractR1';

export type CraftSaveOutcome =
  | { ok: true; thread: RebuildEditorialThread; version: RebuildEditorialVersion }
  | { ok: false; message: string; threadId?: string };

/** Success requires a fresh owned read of the exact writer version. No model,
 * no implicit Apply, no retry, no rebase onto an unseen predecessor. */
export async function saveCraftWorkingCopy(draft: CraftWorkingSaveDraft,
  stillCurrent: () => boolean = () => true): Promise<CraftSaveOutcome> {
  const posture = readCurrentSanctuaryPosture();
  if (!posture.resolved || posture.sanctuary) return { ok: false,
    message: 'Choose Ordinary before saving a persistent working version. Your wording remains here.' };
  if (!stillCurrent()) return { ok: false, message: 'The focus changed before Save. Your wording remains here.' };
  let threadId: string | undefined;
  try {
    const response = await apiFetch('/api/writers-studio/rebuild/editorial/version', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sectionId: draft.held.draftSectionId,
        range: { start: draft.held.start, end: draft.held.end }, revisionNumber: draft.held.revisionNumber,
        threadId: draft.threadId, supersedes: draft.supersedes, replacementText: draft.text, sanctuary: false, kept: draft.kept ?? [] }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) return { ok: false, message: response.status === 409
      ? 'The source or saved version changed. Your wording remains here; nothing was applied.'
      : 'The save could not be confirmed. Your wording remains here. Check saved versions before trying again.' };
    threadId = typeof body?.threadId === 'string' ? body.threadId : undefined;
    if (!threadId || typeof body?.versionId !== 'string') throw new Error('unconfirmed');
    const reread = await readBoundEditorialThread(threadId, draft.held.draftSectionId);
    if (!reread.ok || reread.thread.threadId !== threadId || reread.thread.locusText !== draft.held.text) throw new Error('unverified');
    const version = reread.thread.versions.find(v => v.id === body.versionId);
    if (!version || version.author !== 'member' || version.wording !== draft.text || version.supersedes !== draft.supersedes
      || !sameCraftKeptSpans(version.craftKept, draft.kept)) throw new Error('unverified');
    if (!stillCurrent()) return { ok: false, threadId,
      message: 'Your version was saved for the earlier passage. The current working copy was not replaced.' };
    return { ok: true, thread: reread.thread, version };
  } catch {
    return { ok: false, threadId, message: 'The save could not be verified. Your wording remains here. Check saved versions before trying again.' };
  }
}

export async function listSavedCraftVersions(manuscriptId: string): Promise<
  { ok: true; versions: SavedCraftVersionReference[] } | { ok: false }
> {
  try {
    const response = await apiFetch('/api/writers-studio/rebuild/editorial/version?manuscriptId=' + encodeURIComponent(manuscriptId));
    const body = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(body?.versions)) return { ok: false };
    if (!body.versions.every((v: SavedCraftVersionReference) => v && ['threadId', 'versionId', 'sectionId', 'locusText', 'excerpt']
      .every(k => typeof (v as unknown as Record<string, unknown>)[k] === 'string'))) return { ok: false };
    return { ok: true, versions: body.versions };
  } catch { return { ok: false }; }
}

/** Only a freshly read member version can seed an explicit saved-draft return. */
export function savedCraftSnapshot(held: CraftWorkingSaveDraft['held'], version: RebuildEditorialVersion): CraftTableSnapshot {
  if (version.author !== 'member') throw new Error('Not a writer-saved version');
  const kept = verifiedCraftKeptSpans(held.text, version.wording, version.craftKept ?? []);
  if (!kept) throw new Error('Saved choices do not match this version');
  return { key: craftTargetKey({ sectionId: held.draftSectionId, ...held }), candidateVersion: version,
    decisions: [], manualText: version.wording, manualFromVersionId: version.id,
    directDraft: '', directEditing: false, customDraft: '', customEditId: null,
    writerHasActed: true, activeEditId: null, view: 'preview', notation: 'guided', kept,
    workingText: version.wording, original: held.text };
}

export function hasUnsavedCraftWork(s: CraftTableSnapshot): boolean {
  if (s.directEditing || s.customEditId !== null) return true;
  if (s.candidateVersion?.author === 'member' && s.candidateVersion.wording === s.workingText
    && sameCraftKeptSpans(s.candidateVersion.craftKept, s.kept)) return false;
  return s.workingText !== s.original || !sameCraftKeptSpans(s.candidateVersion?.craftKept, s.kept);
}
