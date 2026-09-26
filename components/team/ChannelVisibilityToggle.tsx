'use client';

// SoulComms — Channel visibility toggle
//
// Self-gating component:
//   - Pings /visibility/preview on mount.
//   - If 403, renders nothing (caller is not owner/admin).
//   - If 200, renders a gear button → opens a confirmation modal.
//
// The same preview endpoint provides the participant count for the
// public→private path, so the modal can show consequences before action.

import { useState, useEffect, useCallback } from 'react';

interface ChannelVisibilityToggleProps {
  channelId: string;
  channelName: string;
  currentIsPrivate: boolean;
  onChanged: (newIsPrivate: boolean) => void;
}

interface PreviewData {
  participantCount: number;
}

type Phase = 'idle' | 'confirming' | 'saving' | 'error';

export function ChannelVisibilityToggle({
  channelId,
  channelName,
  currentIsPrivate,
  onChanged,
}: ChannelVisibilityToggleProps) {
  const [canManage, setCanManage] = useState<boolean | null>(null); // null = unknown
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [open, setOpen] = useState(false);

  // Self-gate: probe preview endpoint to discover whether user can manage.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/team/channels/${channelId}/visibility/preview`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.ok) {
          const d = await res.json();
          setPreview({ participantCount: d.participantCount ?? 0 });
          setCanManage(true);
        } else {
          setCanManage(false);
        }
      })
      .catch(() => {
        if (!cancelled) setCanManage(false);
      });
    return () => {
      cancelled = true;
    };
  }, [channelId, currentIsPrivate]);

  const refreshPreview = useCallback(async () => {
    try {
      const res = await fetch(`/api/team/channels/${channelId}/visibility/preview`);
      if (res.ok) {
        const d = await res.json();
        setPreview({ participantCount: d.participantCount ?? 0 });
      }
    } catch {
      /* ignore — modal will show stale count */
    }
  }, [channelId]);

  const openConfirm = () => {
    setPhase('confirming');
    setErrorMsg('');
    setOpen(true);
    refreshPreview();
  };

  const closeConfirm = () => {
    if (phase === 'saving') return;
    setOpen(false);
    setPhase('idle');
    setErrorMsg('');
  };

  const submit = async () => {
    setPhase('saving');
    setErrorMsg('');
    try {
      const res = await fetch(`/api/team/channels/${channelId}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrivate: !currentIsPrivate }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const code = d.error ?? 'unknown';
        setErrorMsg(
          code === 'system_channel'
            ? d.message ?? 'This channel cannot change visibility.'
            : code === 'already_in_target_state'
            ? 'Channel is already in that state.'
            : code === 'not_found'
            ? 'Channel not found.'
            : 'Could not change visibility. Try again.'
        );
        setPhase('error');
        return;
      }
      onChanged(!currentIsPrivate);
      setOpen(false);
      setPhase('idle');
    } catch {
      setErrorMsg('Network error. Try again.');
      setPhase('error');
    }
  };

  if (canManage !== true) return null;

  const targetIsPrivate = !currentIsPrivate;
  const participantCount = preview?.participantCount ?? 0;

  return (
    <>
      <button
        onClick={openConfirm}
        className="text-white/55 hover:text-white/90 transition-colors flex items-center gap-1"
        title={currentIsPrivate ? 'Make public' : 'Make private'}
        aria-label={currentIsPrivate ? 'Make channel public' : 'Make channel private'}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={closeConfirm}
        >
          <div
            className="bg-[#16162a] border border-white/12 rounded-xl shadow-2xl w-96 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-white/90 mb-3">
              Make #{channelName} {targetIsPrivate ? 'private' : 'public'}?
            </h3>

            {targetIsPrivate ? (
              <ul className="space-y-2 text-xs text-white/55 mb-4">
                <li className="flex gap-2">
                  <span className="text-amber-400/70 flex-shrink-0">•</span>
                  <span>
                    <strong className="text-white/80">{participantCount} active participant{participantCount === 1 ? '' : 's'} will keep access</strong>
                    {' '}(people who have posted here)
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-400/70 flex-shrink-0">•</span>
                  <span>People who are not members will lose access immediately</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-400/70 flex-shrink-0">•</span>
                  <span>You'll manage who joins from the Members panel</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-400/70 flex-shrink-0">•</span>
                  <span>Message history stays — nothing is deleted</span>
                </li>
              </ul>
            ) : (
              <ul className="space-y-2 text-xs text-white/55 mb-4">
                <li className="flex gap-2">
                  <span className="text-amber-400/70 flex-shrink-0">•</span>
                  <span>The channel becomes visible to everyone in the Co-lab</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-400/70 flex-shrink-0">•</span>
                  <span>Current member roles are preserved but no longer enforced</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-400/70 flex-shrink-0">•</span>
                  <span>Anyone signed in can read and post</span>
                </li>
              </ul>
            )}

            {errorMsg && (
              <p className="text-xs text-red-400/80 mb-3">{errorMsg}</p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={closeConfirm}
                disabled={phase === 'saving'}
                className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white/90 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={phase === 'saving'}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-semibold hover:bg-amber-400 transition-colors disabled:opacity-40"
              >
                {phase === 'saving'
                  ? 'Working…'
                  : targetIsPrivate
                  ? 'Make private'
                  : 'Make public'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
