'use client';

import type { ReactNode } from 'react';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';
import type { CurrentManuscript } from '@/app/writers-studio/useCurrentManuscript';
import { manuscriptIdsOf, manuscriptsForWork } from '@/app/writers-studio/homeState';
import {
  DeletionNotice,
  DeletionSharedMaterial,
  DeletionUnconfirmed,
  REMOVE_MANY_WORK_COPY,
  RELOAD_HOME_LINE,
  deleteConfirmCopy,
  removeSharedWorkCopy,
  removedWorkNotice,
  type ActResult,
  type WorkDeleteKind,
} from '@/lib/writersStudio/deleteWork';
import { WritingDeleteConfirm } from './WritingDeleteConfirm';
import { WorkRemoveConfirm } from './WorkRemoveConfirm';

/**
 * What a Work's Delete door is, from what the Work holds. One writing and nothing else: the writing and the Work go. One writing
 * plus other parts: the writing goes and the Work stays. No writing: only the Work goes. Several writings: there is no Delete
 * (which writing would go is the member's choice, and no control for that choice exists on the card), so the door is Remove.
 */
export function workDeleteKind(
  work: LivingWork,
  manuscripts: readonly CurrentManuscript[],
): { readonly kind: WorkDeleteKind; readonly manuscriptId: string | null } {
  const choices = manuscriptsForWork(work, manuscripts);
  const ids = manuscriptIdsOf(work);
  if (choices.length > 1 || ids.length > 1) return { kind: 'many', manuscriptId: null };
  const manuscriptId = choices.length === 1 ? choices[0]!.id : (ids[0] ?? null);
  if (manuscriptId === null) return { kind: 'empty', manuscriptId: null };
  return {
    kind: work.expressions.every((expression) => expression.expressionType === 'manuscript') ? 'writing' : 'writing-keeps-work',
    manuscriptId,
  };
}

/**
 * What deleting THIS writing reaches, for the places that delete a writing without a Work card (loose writing on Home, History).
 * The same erase runs, so the same truth applies: a Work that held only this writing goes with it; a Work that holds more stays.
 */
export function writingDeleteKindFor(
  manuscriptId: string,
  works: readonly LivingWork[],
): 'loose' | 'writing' | 'writing-from-work' {
  const holders = works.filter((work) => manuscriptIdsOf(work).includes(manuscriptId));
  if (holders.length === 0) return 'loose';
  return holders.every((work) => manuscriptIdsOf(work).length === 1 && work.expressions.every((e) => e.expressionType === 'manuscript'))
    ? 'writing'
    : 'writing-from-work';
}

export type WorkDoorDialog = 'delete' | 'remove-shared' | 'remove-many';

/**
 * Everything one Work's door remembers. It lives in the PAGE, keyed by the Work's id, not in whichever card happens to show the Work:
 * a re-read can move a Work from the hero slot to a shelf (a different component) or hand the hero slot to a different Work, and
 * neither may lose the member's open question or carry it to the wrong Work.
 */
export interface DoorState {
  readonly confirming: boolean;
  readonly deleting: boolean;
  readonly deleteError: string | null;
  /** The server said the writing is shared (a 409), for a page that may not be able to see the other Work. */
  readonly shared: { readonly manuscriptId: string } | null;
  readonly removing: boolean;
  readonly removeError: string | null;
  /** The server removed this Work. Until the list is re-read (or if that read fails) the card says so and offers no door. */
  readonly settled: string | null;
}
export const INITIAL_DOOR: DoorState = {
  confirming: false, deleting: false, deleteError: null, shared: null, removing: false, removeError: null, settled: null,
};

/** Shown when the server says "shared" but this page cannot see the other Work: time-neutral, so it stays true if that Work goes. */
const SHARED_BUT_NOT_SHOWN =
  'The server says this writing is also in another of your Works. Nothing was deleted. If you have just removed that Work, press Delete again.';

export interface WorkDeleteDoor {
  /** What the card says in place of itself when the server removed this Work. */
  readonly settled: string | null;
  /** The confirmation, when one is open. It REPLACES the card (a destructive question beside a still-clickable card can be walked past). */
  readonly dialog: ReactNode | null;
  readonly dialogKind: WorkDoorDialog | null;
  /** The quiet door shown on the card: Delete, or Remove where Delete has no single writing to name. */
  readonly door: ReactNode;
}

const RELOAD_LINE = ` ${RELOAD_HOME_LINE}`;

/**
 * The delete/remove door of ONE Work, shared by the shelf card and the hero Work so every Work on Home has the same way in and
 * out. The state machine lives here once:
 *   Delete  ->  (shared writing) the removal question, re-derived from the Works on screen on every render
 *           ->  (unconfirmed custody) a page notice, because this card is about to unmount
 *           ->  (an outcome the page was re-read for) a page notice, because that re-read may have removed this card
 *   Remove  ->  a "removed" card, and a page notice, until the list is re-read
 *
 * A card is replaced by a "deleted" or "removed" card ONLY when the server said the Work went (`workRemoved`). A Delete the server
 * answered without saying (the writing was already gone) or answered "the Work stays" leaves the card to the re-read and tells the
 * member on the page.
 */
export function useWorkDeleteDoor(args: {
  work: LivingWork;
  title: string;
  manuscripts: readonly CurrentManuscript[];
  /** Every Work Home last read. Whether the writing is STILL shared is derived from this, never trusted from the 409. */
  allWorks: readonly LivingWork[];
  /** This Work's remembered state, and how to change it (both held by the page; see DoorState). */
  state: DoorState;
  update: (patch: Partial<DoorState>) => void;
  onDeleteWork: (workId: string, manuscriptId: string | null) => Promise<ActResult | void>;
  onRemoveWork: (workId: string) => Promise<ActResult | void>;
  /** The card unmounts once the list is re-read, so a message the member must still see lives with the page. */
  onDeletionNotice: (message: string, urgent?: boolean) => void;
}): WorkDeleteDoor {
  const { work, title, manuscripts, allWorks, state, update, onDeleteWork, onRemoveWork, onDeletionNotice } = args;

  const { kind, manuscriptId } = workDeleteKind(work, manuscripts);
  // How many OTHER Works hold the writing the 409 named, as this page last read them.
  const shared = state.shared;
  const othersHolding = shared === null
    ? 0
    : allWorks.filter((other) => other.id !== work.id && manuscriptIdsOf(other).includes(shared.manuscriptId)).length;
  const stillShared = othersHolding > 0;
  const removalMode: 'shared' | 'many' | null = kind === 'many' ? 'many' : (stillShared ? 'shared' : null);

  // Leaving a question clears what it was showing. (What the NEXT question starts from is reset where it is opened, below.)
  const cancel = () => update({ confirming: false, deleteError: null, removeError: null });

  let dialog: ReactNode | null = null;
  let dialogKind: WorkDoorDialog | null = null;
  if (state.confirming && removalMode) {
    dialogKind = removalMode === 'many' ? 'remove-many' : 'remove-shared';
    dialog = (
      <WorkRemoveConfirm
        title={title}
        copy={removalMode === 'many' ? REMOVE_MANY_WORK_COPY : removeSharedWorkCopy(othersHolding)}
        busy={state.removing}
        error={state.removeError}
        onCancel={() => { if (!state.removing) cancel(); }}
        onConfirm={async () => {
          update({ removing: true, removeError: null });
          try {
            const result = await onRemoveWork(work.id);
            update({ settled: `“${title}” was removed.`, confirming: false, shared: null });
            onDeletionNotice(removedWorkNotice(title, removalMode) + (result && !result.refreshed ? RELOAD_LINE : ''), false);
          } catch (err) {
            if (err instanceof DeletionUnconfirmed) {
              // The Work row is gone but something it owned is not yet confirmed destroyed: say so on the page, where it survives the card.
              update({ settled: `“${title}” was removed from your studio.`, confirming: false, shared: null });
              onDeletionNotice(`“${title}”: ${err.message}`);
            } else if (err instanceof DeletionNotice) {
              // The page was re-read for this, and the re-read may have removed this card: the page carries the message.
              update({ confirming: false });
              onDeletionNotice(`“${title}”: ${err.message}`, false);
            } else {
              update({ removeError: err instanceof Error ? err.message : 'That work could not be removed just now. Nothing changed. Please try again.' });
            }
          } finally {
            update({ removing: false });
          }
        }}
      />
    );
  } else if (state.confirming && kind !== 'many') {
    dialogKind = 'delete';
    const words = deleteConfirmCopy(kind, title);
    // The server said the writing is shared but this page cannot see the other Work (it was declared after the page loaded). The
    // server's answer is the authority at that moment: the card says so instead of doing nothing.
    const shownError = state.deleteError ?? (shared !== null ? SHARED_BUT_NOT_SHOWN : null);
    dialog = (
      <WritingDeleteConfirm
        title={title}
        question={words.question}
        body={words.body}
        busy={state.deleting}
        error={shownError}
        onCancel={() => { if (!state.deleting) cancel(); }}
        onConfirm={async () => {
          update({ deleting: true, deleteError: null, shared: null });
          try {
            const result = await onDeleteWork(work.id, manuscriptId);
            const reload = result && !result.refreshed ? RELOAD_LINE : '';
            update({ confirming: false });
            // What became of the Work is the SERVER's word (`workRemoved`), never a guess from what this card last showed: a card whose
            // picture was stale must not be turned into a "deleted" card for a Work the server kept.
            if (result?.workRemoved === true) {
              // The Work went with its writing. If the re-read worked this card is already gone; if it did not, the card says so.
              update({ settled: `“${title}” was deleted.` });
              if (reload) onDeletionNotice(`“${title}” was deleted.${reload}`, false);
            } else if (result?.workRemoved === false) {
              // The Work stays (it holds something else): its card keeps its door, so no "deleted" card replaces it. The page says it.
              onDeletionNotice(`The writing in “${title}” was deleted. The Work stays, with what else it holds.${reload}`, false);
            } else {
              // The server did not say what became of the Work (the writing was already gone): say only that, and what Home now shows.
              onDeletionNotice(`“${title}”: that writing was already gone.${result?.refreshed ? ' Home now shows what is current.' : reload}`, false);
            }
          } catch (err) {
            if (err instanceof DeletionUnconfirmed) {
              // The writing is gone and its custody is unconfirmed. Whether this card goes is the server's word: if the Work went too,
              // the card says so (and is about to unmount); if the Work stays, its card stays. Either way the page carries the message.
              update(err.workRemoved === true ? { settled: `“${title}” was removed from your studio.`, confirming: false } : { confirming: false });
              onDeletionNotice(`“${title}”: ${err.message}`);
            } else if (err instanceof DeletionNotice) {
              update({ confirming: false });
              onDeletionNotice(`“${title}”: ${err.message}`, false);
            } else if (err instanceof DeletionSharedMaterial && manuscriptId) {
              update({ shared: { manuscriptId } });
            } else {
              update({ deleteError: err instanceof Error ? err.message : 'That work could not be deleted just now. Nothing was removed. Please try again.' });
            }
          } finally {
            update({ deleting: false });
          }
        }}
      />
    );
  }

  const door = (
    <button
      type="button"
      className="fr-home-quiet p4r1-home-delete-open"
      onClick={() => update({ confirming: true, deleteError: null, removeError: null, shared: null })}
    >
      {kind === 'many' ? 'Remove' : 'Delete'}
    </button>
  );

  return { settled: state.settled, dialog, dialogKind, door };
}
