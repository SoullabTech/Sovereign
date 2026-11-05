'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';
import type { CurrentManuscript } from '@/app/writers-studio/useCurrentManuscript';
import { manuscriptIdsOf, manuscriptsForWork } from '@/app/writers-studio/homeState';
import {
  DeletionSharedMaterial,
  DeletionUnconfirmed,
  REMOVE_MANY_WORK_COPY,
  deleteConfirmCopy,
  removeSharedWorkCopy,
  removedWorkNotice,
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
 * The same erase runs, so the same truth applies: a Work that held only this writing goes with it.
 */
export function writingDeleteKindFor(
  manuscriptId: string,
  works: readonly LivingWork[],
): 'loose' | 'writing' | 'writing-keeps-work' {
  const holders = works.filter((work) => manuscriptIdsOf(work).includes(manuscriptId));
  if (holders.length === 0) return 'loose';
  return holders.every((work) => manuscriptIdsOf(work).length === 1 && work.expressions.every((e) => e.expressionType === 'manuscript'))
    ? 'writing'
    : 'writing-keeps-work';
}

export type WorkDoorDialog = 'delete' | 'remove-shared' | 'remove-many';

export interface WorkDeleteDoor {
  /** The server removed this Work. Until the list is re-read (or if that read fails) the card says so and offers no door. */
  readonly settled: string | null;
  /** The confirmation, when one is open. It REPLACES the card (a destructive question beside a still-clickable card can be walked past). */
  readonly dialog: ReactNode | null;
  readonly dialogKind: WorkDoorDialog | null;
  /** The quiet door shown on the card: Delete, or Remove where Delete has no single writing to name. */
  readonly door: ReactNode;
}

/**
 * The delete/remove door of ONE Work, shared by the shelf card and the hero Work so every Work on Home has the same way in and
 * out. The state machine lives here once:
 *   Delete  ->  (shared writing) the removal question, re-derived from the Works on screen on every render
 *           ->  (unconfirmed custody) a page notice, because this card is about to unmount
 *   Remove  ->  a "removed" card, and a page notice, until the list is re-read
 *
 * A MESSAGE THE MEMBER HAS NOT YET SEEN is never lost with the card: whatever the dialog is showing as an error, if the card
 * unmounts while it is still showing (the re-read removed the Work: the act had in fact gone through), it is handed to the page.
 */
export function useWorkDeleteDoor(args: {
  work: LivingWork;
  title: string;
  manuscripts: readonly CurrentManuscript[];
  /** Every Work Home last read. Whether the writing is STILL shared is derived from this, never trusted from the 409. */
  allWorks: readonly LivingWork[];
  onDeleteWork: (workId: string, manuscriptId: string | null, options?: { readonly workStays?: boolean }) => Promise<void>;
  onRemoveWork: (workId: string) => Promise<void>;
  /** The card unmounts once the list is re-read, so a message the member must still see lives with the page. */
  onDeletionNotice: (message: string, urgent?: boolean) => void;
}): WorkDeleteDoor {
  const { work, title, manuscripts, allWorks, onDeleteWork, onRemoveWork, onDeletionNotice } = args;
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [shared, setShared] = useState<{ readonly manuscriptId: string; readonly message: string } | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [settled, setSettled] = useState<string | null>(null);

  // A message the dialog is showing and the member has not dismissed. If the card unmounts with one on show, the page keeps it.
  const unseen = useRef<string | null>(null);
  const handOver = useRef(onDeletionNotice);
  useEffect(() => { handOver.current = onDeletionNotice; });
  useEffect(() => () => {
    if (unseen.current) handOver.current(unseen.current, false);
  }, []);

  const { kind, manuscriptId } = workDeleteKind(work, manuscripts);
  // How many OTHER Works hold the writing the 409 named, as this page last read them.
  const othersHolding = shared === null
    ? 0
    : allWorks.filter((other) => other.id !== work.id && manuscriptIdsOf(other).includes(shared.manuscriptId)).length;
  const stillShared = othersHolding > 0;
  const removalMode: 'shared' | 'many' | null = kind === 'many' ? 'many' : (stillShared ? 'shared' : null);

  const cancel = () => {
    unseen.current = null;
    setConfirming(false);
    setShared(null);
    setDeleteError(null);
    setRemoveError(null);
  };

  let dialog: ReactNode | null = null;
  let dialogKind: WorkDoorDialog | null = null;
  if (confirming && removalMode) {
    dialogKind = removalMode === 'many' ? 'remove-many' : 'remove-shared';
    dialog = (
      <WorkRemoveConfirm
        title={title}
        copy={removalMode === 'many' ? REMOVE_MANY_WORK_COPY : removeSharedWorkCopy(othersHolding)}
        busy={removing}
        error={removeError}
        onCancel={() => { if (!removing) cancel(); }}
        onConfirm={async () => {
          setRemoving(true);
          setRemoveError(null);
          unseen.current = null;
          try {
            await onRemoveWork(work.id);
            setSettled(`“${title}” was removed.`);
            setConfirming(false);
            setShared(null);
            onDeletionNotice(removedWorkNotice(title, removalMode), false);
          } catch (err) {
            if (err instanceof DeletionUnconfirmed) {
              // The Work row is gone but something it owned is not yet confirmed destroyed: say so on the page, where it survives the card.
              setSettled(`“${title}” was removed from your studio.`);
              setConfirming(false);
              setShared(null);
              onDeletionNotice(`“${title}”: ${err.message}`);
            } else {
              const message = err instanceof Error ? err.message : 'That work could not be removed just now. Nothing changed. Please try again.';
              unseen.current = message;
              setRemoveError(message);
            }
          } finally {
            setRemoving(false);
          }
        }}
      />
    );
  } else if (confirming && kind !== 'many') {
    dialogKind = 'delete';
    const words = deleteConfirmCopy(kind, title);
    // The server said the writing is shared but this page cannot see the other Work (it was declared after the page loaded). The
    // server's answer is the authority at that moment: the card says so instead of doing nothing.
    const shownError = deleteError ?? (shared !== null ? shared.message : null);
    dialog = (
      <WritingDeleteConfirm
        title={title}
        question={words.question}
        body={words.body}
        busy={deleting}
        error={shownError}
        onCancel={() => { if (!deleting) cancel(); }}
        onConfirm={async () => {
          setDeleting(true);
          setDeleteError(null);
          setShared(null);
          unseen.current = null;
          try {
            await onDeleteWork(work.id, manuscriptId, { workStays: kind === 'writing-keeps-work' });
            setConfirming(false);
            if (kind === 'writing-keeps-work') {
              // The Work stays: its card must keep its other parts and its door, so no "deleted" card replaces it. The page says it.
              onDeletionNotice(`The writing in “${title}” was deleted. The Work stays, with what else it holds.`, false);
            } else {
              setSettled(`“${title}” was deleted.`);
            }
          } catch (err) {
            if (err instanceof DeletionUnconfirmed) {
              // The Work is gone from the list, so this card is about to unmount: say what could not be confirmed on the page.
              setSettled(`“${title}” was removed from your studio.`);
              setConfirming(false);
              onDeletionNotice(`“${title}”: ${err.message}`);
            } else if (err instanceof DeletionSharedMaterial && manuscriptId) {
              setShared({ manuscriptId, message: err.message });
            } else {
              const message = err instanceof Error ? err.message : 'That work could not be deleted just now. Nothing was removed. Please try again.';
              unseen.current = message;
              setDeleteError(message);
            }
          } finally {
            setDeleting(false);
          }
        }}
      />
    );
  }

  const door = (
    <button
      type="button"
      className="fr-home-quiet p4r1-home-delete-open"
      onClick={() => { unseen.current = null; setDeleteError(null); setRemoveError(null); setShared(null); setConfirming(true); }}
    >
      {kind === 'many' ? 'Remove' : 'Delete'}
    </button>
  );

  return { settled, dialog, dialogKind, door };
}
