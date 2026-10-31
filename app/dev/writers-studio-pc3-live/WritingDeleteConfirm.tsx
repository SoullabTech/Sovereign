'use client';

import { DELETE_WORK_COPY } from '@/lib/writersStudio/deleteWork';

/**
 * The confirmation that REPLACES a writing card (a destructive question floating over a still-clickable card is one the
 * author can walk past by accident). It names the writing and says exactly what deletion reaches, in the product's own
 * words (WS-DELETE-01): permanent, no archive, nothing kept. A failure is stated as a failure, never as success.
 */
export function WritingDeleteConfirm({ title, busy, error, onConfirm, onCancel }: {
  title: string;
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="p4r1-home-delete" role="alertdialog" aria-label={DELETE_WORK_COPY.question(title)}>
      <h3>{DELETE_WORK_COPY.question(title)}</h3>
      <p>{DELETE_WORK_COPY.body}</p>
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
