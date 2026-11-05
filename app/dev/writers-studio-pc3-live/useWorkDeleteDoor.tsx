'use client';

import { useState, type ReactNode } from 'react';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';
import type { CurrentManuscript } from '@/app/writers-studio/useCurrentManuscript';
import { manuscriptIdsOf, manuscriptsForWork } from '@/app/writers-studio/homeState';
import {
  DeletionSharedMaterial,
  DeletionUnconfirmed,
  REMOVE_MANY_WORK_COPY,
  REMOVE_SHARED_WORK_COPY,
  deleteConfirmCopy,
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
 */
export function useWorkDeleteDoor(args: {
  work: LivingWork;
  title: string;
  manuscripts: readonly CurrentManuscript[];
  /** Every Work Home last read. Whether the writing is STILL shared is derived from this, never trusted from the 409. */
  allWorks: readonly LivingWork[];
  onDeleteWork: (workId: string, manuscriptId: string | null) => Promise<void>;
  onRemoveWork: (workId: string) => Promise<void>;
  /** The card unmounts once the list is re-read, so a message the member must still see lives with the page. */
  onDeletionNotice: (message: string, urgent?: boolean) => void;
}): WorkDeleteDoor {
  const { work, title, manuscripts, allWorks, onDeleteWork, onRemoveWork, onDeletionNotice } = args;
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [sharedWith, setSharedWith] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [settled, setSettled] = useState<string | null>(null);

  const { kind, manuscriptId } = workDeleteKind(work, manuscripts);
  const stillShared = sharedWith !== null
    && allWorks.some((other) => other.id !== work.id && manuscriptIdsOf(other).includes(sharedWith));
  const removalMode: 'shared' | 'many' | null = kind === 'many' ? 'many' : (stillShared ? 'shared' : null);

  const cancel = () => {
    setConfirming(false);
    setSharedWith(null);
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
        copy={removalMode === 'many' ? REMOVE_MANY_WORK_COPY : REMOVE_SHARED_WORK_COPY}
        busy={removing}
        error={removeError}
        onCancel={() => { if (!removing) cancel(); }}
        onConfirm={async () => {
          setRemoving(true);
          setRemoveError(null);
          try {
            await onRemoveWork(work.id);
            setSettled(`“${title}” was removed.`);
            setConfirming(false);
            setSharedWith(null);
            onDeletionNotice(removedWorkNotice(title, removalMode), false);
          } catch (err) {
            setRemoveError(err instanceof Error ? err.message : 'That work could not be removed just now. Nothing changed. Please try again.');
          } finally {
            setRemoving(false);
          }
        }}
      />
    );
  } else if (confirming && kind !== 'many') {
    dialogKind = 'delete';
    const words = deleteConfirmCopy(kind, title);
    dialog = (
      <WritingDeleteConfirm
        title={title}
        question={words.question}
        body={words.body}
        busy={deleting}
        error={deleteError}
        onCancel={() => { if (!deleting) cancel(); }}
        onConfirm={async () => {
          setDeleting(true);
          setDeleteError(null);
          try {
            await onDeleteWork(work.id, manuscriptId);
            setSettled(kind === 'writing-keeps-work' ? `The writing in “${title}” was deleted.` : `“${title}” was deleted.`);
            setConfirming(false);
          } catch (err) {
            if (err instanceof DeletionUnconfirmed) {
              // The Work is gone from the list, so this card is about to unmount: say what could not be confirmed on the page.
              setSettled(`“${title}” was removed from your studio.`);
              setConfirming(false);
              onDeletionNotice(`“${title}”: ${err.message}`);
            } else if (err instanceof DeletionSharedMaterial && manuscriptId) {
              setSharedWith(manuscriptId);
            } else {
              setDeleteError(err instanceof Error ? err.message : 'That work could not be deleted just now. Nothing was removed. Please try again.');
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
      onClick={() => { setDeleteError(null); setRemoveError(null); setConfirming(true); }}
    >
      {kind === 'many' ? 'Remove' : 'Delete'}
    </button>
  );

  return { settled, dialog, dialogKind, door };
}
