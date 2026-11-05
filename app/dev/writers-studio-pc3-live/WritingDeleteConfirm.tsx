'use client';

import { useId } from 'react';
import { DELETE_WORK_COPY } from '@/lib/writersStudio/deleteWork';

/**
 * The confirmation that REPLACES a writing card (a destructive question floating over a still-clickable card is one the
 * author can walk past by accident). It names the writing and says exactly what deletion reaches, in the product's own
 * words (WS-DELETE-01): permanent, no archive, and honest that earlier backups retire on their own schedule. A failure is stated as a failure, never as success.
 */
export function WritingDeleteConfirm({ title, busy, error, onConfirm, onCancel, question, body }: {
  title: string;
  /** What this deletion actually reaches, when it is not a loose writing (a Work card says what is true of THAT Work). */
  question?: string;
  body?: string;
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // The body is what states what will be lost: a screen-reader user hears it with the dialog, not only the question.
  const bodyId = useId();
  return (
    <div className="p4r1-home-delete" role="alertdialog" aria-label={question ?? DELETE_WORK_COPY.question(title)} aria-describedby={bodyId}>
      <h3>{question ?? DELETE_WORK_COPY.question(title)}</h3>
      <p id={bodyId}>{body ?? DELETE_WORK_COPY.body}</p>
      <div className="p4r1-home-delete-actions">
        <button type="button" className="p4r1-home-delete-confirm" disabled={busy} onClick={onConfirm}>
          {busy ? DELETE_WORK_COPY.working : DELETE_WORK_COPY.confirm}
        </button>
        <button type="button" disabled={busy} onClick={onCancel} autoFocus>{DELETE_WORK_COPY.cancel}</button>
      </div>
      {error ? <p role="alert" className="p4r1-home-delete-error">{error}</p> : null}
    </div>
  );
}
