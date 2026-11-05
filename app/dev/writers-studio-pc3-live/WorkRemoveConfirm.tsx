'use client';

import { useId } from 'react';
import { REMOVE_SHARED_WORK_COPY } from '@/lib/writersStudio/deleteWork';

/** The words of a removal confirmation: the two bodies (shared writing, several writings) share this shape. */
export interface RemoveCopy {
  readonly question: (title: string) => string;
  readonly body: string;
  readonly confirm: string;
  readonly working: string;
  readonly cancel: string;
}

/**
 * The confirmation for removing a Work and keeping its writing(s): offered when Delete was refused because another Work holds the
 * writing, and for a Work that holds several writings (where Delete has no single writing to name).
 *
 * It REPLACES the card, as WritingDeleteConfirm does. It names a DIFFERENT act from Delete, so it can never be read as Delete
 * quietly meaning "detach": it says what goes (the Work and what was built inside it) and what stays (the writing), and the member
 * has to press a button that names the act ("Remove this Work"). Cancel is the default focus.
 */
export function WorkRemoveConfirm({ title, busy, error, onConfirm, onCancel, copy = REMOVE_SHARED_WORK_COPY }: {
  title: string;
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  copy?: RemoveCopy;
}) {
  // The body is what states what goes and what stays: a screen-reader user hears it with the dialog, not only the question.
  const bodyId = useId();
  return (
    <div className="p4r1-home-delete" role="alertdialog" aria-label={copy.question(title)} aria-describedby={bodyId} data-removing-shared-work>
      <h3>{copy.question(title)}</h3>
      <p id={bodyId}>{copy.body}</p>
      <div className="p4r1-home-delete-actions">
        <button type="button" className="p4r1-home-delete-confirm" disabled={busy} onClick={onConfirm}>
          {busy ? copy.working : copy.confirm}
        </button>
        <button type="button" disabled={busy} onClick={onCancel} autoFocus>{copy.cancel}</button>
      </div>
      {error ? <p role="alert" className="p4r1-home-delete-error">{error}</p> : null}
    </div>
  );
}
