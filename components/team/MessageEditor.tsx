'use client';

import { useState } from 'react';

interface MessageEditorProps {
  initialBody: string;
  /** Persist the edit. Throws on failure (the editor stays open so the draft isn't lost). */
  onSave: (newBody: string) => Promise<void>;
  onCancel: () => void;
}

/**
 * Inline message editor — a textarea + Save/Cancel, shared by channel messages
 * (MessageBubble), thread replies, and DMs. Enter saves, Shift+Enter newlines,
 * Escape cancels — mirroring MessageInput's convention. A no-op edit (unchanged
 * or empty) just closes without a network call.
 */
export function MessageEditor({ initialBody, onSave, onCancel }: MessageEditorProps) {
  const [draft, setDraft] = useState(initialBody);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (trimmed === initialBody.trim()) {
      onCancel();
      return;
    }
    setSaving(true);
    try {
      await onSave(trimmed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-1">
      <textarea
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void save();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
          }
        }}
        rows={Math.min(10, Math.max(1, draft.split('\n').length))}
        className="w-full bg-[#1a1a2e] border border-amber-500/40 rounded-lg px-3 py-2 text-sm text-white/90 resize-none focus:outline-none focus:border-amber-500/70"
      />
      <div className="flex items-center gap-2 mt-1.5 text-xs">
        <button
          onClick={() => void save()}
          disabled={!draft.trim() || saving}
          className="px-2.5 py-1 rounded-md bg-amber-500 text-black font-medium disabled:opacity-40 hover:bg-amber-400 transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={onCancel} className="text-white/40 hover:text-white/70">
          Cancel
        </button>
        <span className="text-white/25 hidden sm:inline">enter to save · esc to cancel</span>
      </div>
    </div>
  );
}
