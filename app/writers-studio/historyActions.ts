import type { StudioAct } from './studioHistory';
import type { LivingWork } from './useLivingWorks';
import type { CurrentManuscript } from './useCurrentManuscript';
import { manuscriptIdsOf } from './homeState';

/**
 * What a member may DO from one History line.
 *
 * A History line is a record of an act; the act's subject may or may not still
 * be held. This says only what is true NOW of the subject:
 *
 *   - `none`        no held manuscript to point at (a Work begun, a deleted
 *                   writing, an act with no manuscript). The line is read-only.
 *   - `open`        the manuscript is held and can be opened. It is NOT
 *                   deletable from here because it sits in a Work that holds
 *                   more than one manuscript — deleting from a history line
 *                   must never be a way to take a sibling writing with it.
 *   - `open_delete` held, and the only manuscript of every Work that claims it
 *                   (or claimed by none): the member may delete the real
 *                   writing, through the same governed erase as Home.
 *
 * No "hide". Delete here means the writing is deleted.
 */
export type HistoryAction =
  | { readonly kind: 'none' }
  | { readonly kind: 'open'; readonly manuscriptId: string; readonly title: string }
  | { readonly kind: 'open_delete'; readonly manuscriptId: string; readonly title: string };

export function historyActionFor(
  act: StudioAct,
  manuscripts: readonly CurrentManuscript[],
  works: readonly LivingWork[],
): HistoryAction {
  if (!act.manuscriptId) return { kind: 'none' };
  const held = manuscripts.find((m) => m.id === act.manuscriptId);
  if (!held) return { kind: 'none' };
  const title = held.title?.trim() || act.manuscriptTitle?.trim() || 'Untitled writing';
  const claimedByMulti = works.some((w) => {
    const ids = manuscriptIdsOf(w);
    return ids.includes(held.id) && ids.length > 1;
  });
  return claimedByMulti
    ? { kind: 'open', manuscriptId: held.id, title }
    : { kind: 'open_delete', manuscriptId: held.id, title };
}
