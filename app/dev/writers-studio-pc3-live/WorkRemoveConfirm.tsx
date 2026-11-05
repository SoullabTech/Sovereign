'use client';

import { REMOVE_SHARED_WORK_COPY } from '@/lib/writersStudio/deleteWork';

/**
 * The confirmation offered when Delete was refused because another of the member's Works also holds the writing.
 *
 * It REPLACES the card, as WritingDeleteConfirm does. It names a DIFFERENT act from Delete, so it can never be read as Delete
 * quietly meaning "detach": it says what goes (the Work and what was built around it) and what stays (the writing, in the other
 * Work), and the member has to press a button that names the act ("Remove this Work"). Cancel is the default focus.
 */
export function WorkRemoveConfirm({ title, busy, error, onConfirm, onCancel }: {
  title: string;
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="p4r1-home-delete" role="alertdialog" aria-label={REMOVE_SHARED_WORK_COPY.question(title)} data-removing-shared-work>
      <h3>{REMOVE_SHARED_WORK_COPY.question(title)}</h3>
      <p>{REMOVE_SHARED_WORK_COPY.body}</p>
      <div className="p4r1-home-delete-actions">
        <button type="button" className="p4r1-home-delete-confirm" disabled={busy} onClick={onConfirm}>
          {busy ? REMOVE_SHARED_WORK_COPY.working : REMOVE_SHARED_WORK_COPY.confirm}
        </button>
        <button type="button" disabled={busy} onClick={onCancel} autoFocus>{REMOVE_SHARED_WORK_COPY.cancel}</button>
      </div>
      {error ? <p role="alert" className="p4r1-home-delete-error">{error}</p> : null}
    </div>
  );
}
