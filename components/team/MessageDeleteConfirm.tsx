'use client';

import { useState } from 'react';

interface MessageDeleteConfirmProps {
  /** Perform the delete. Throws on failure (the prompt stays so the user can retry). */
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

/**
 * Inline delete confirmation — a small red bar shown in place of the hover
 * action, shared by channel messages (MessageBubble) and DMs. Deliberately a
 * two-step gesture: deletion clears the message body and can't be undone.
 */
export function MessageDeleteConfirm({ onConfirm, onCancel }: MessageDeleteConfirmProps) {
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="mt-1 flex items-center gap-2 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
      <span className="text-red-200/90 flex-1">Delete this message? This can&apos;t be undone.</span>
      <button
        onClick={async () => { setDeleting(true); try { await onConfirm(); } finally { setDeleting(false); } }}
        disabled={deleting}
        className="px-2.5 py-1 rounded-md bg-red-500 text-white font-medium disabled:opacity-40 hover:bg-red-400 transition-colors"
      >
        {deleting ? 'Deleting…' : 'Delete'}
      </button>
      <button onClick={onCancel} className="text-white/40 hover:text-white/70">Cancel</button>
    </div>
  );
}
