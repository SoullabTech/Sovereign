'use client';

/**
 * InviteFriendButton — Generates a token-based invite link for a Field Room.
 *
 * Drop into any room page: <InviteFriendButton roomId={roomId} />
 *
 * Calls /api/field-invites/create with role + expiry presets.
 * Returns a shareable link that resolves via /invite/[token].
 */

import { useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

export function InviteFriendButton({ roomId }: { roomId: string }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<'witness' | 'participant' | 'quiet'>('witness');
  const [expiresIn, setExpiresIn] = useState<'1h' | '24h' | '7d'>('24h');
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function onCreate() {
    setLoading(true);
    setErr(null);
    setInviteUrl(null);
    try {
      const res = await apiFetch('/api/field-invites/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'field_room',
          targetId: roomId,
          role,
          expiresIn,
          maxUses: 1,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr((j as Record<string, string>)?.error || 'Could not create invite.');
        setLoading(false);
        return;
      }
      setInviteUrl((j as { inviteUrl: string }).inviteUrl);
      setLoading(false);
    } catch {
      setErr('Could not create invite.');
      setLoading(false);
    }
  }

  async function onCopy() {
    if (!inviteUrl) return;
    const full = `${window.location.origin}${inviteUrl}`;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function onClose() {
    setOpen(false);
    setInviteUrl(null);
    setErr(null);
    setCopied(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-slate-600 bg-[#101022] px-3 py-2 text-sm text-slate-200 hover:border-slate-500"
      >
        Invite a friend
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#141428] p-6">
            <div className="text-lg font-semibold text-slate-100">Invite a friend into this space</div>
            <div className="mt-2 text-sm text-slate-300">
              A private link. No urgency. No replies required.
            </div>

            <div className="mt-5">
              <label className="text-xs text-slate-400">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'witness' | 'participant' | 'quiet')}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-[#101022] p-2 text-slate-200"
              >
                <option value="witness">Witness</option>
                <option value="participant">Participant</option>
                <option value="quiet">Quiet</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="text-xs text-slate-400">Expires</label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value as '1h' | '24h' | '7d')}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-[#101022] p-2 text-slate-200"
              >
                <option value="1h">1 hour</option>
                <option value="24h">24 hours</option>
                <option value="7d">7 days</option>
              </select>
            </div>

            {err && <div className="mt-4 text-sm text-amber-200">{err}</div>}

            {inviteUrl ? (
              <div className="mt-5 rounded-xl border border-slate-700 bg-[#101022] p-3">
                <div className="text-xs text-slate-400">Invite link</div>
                <div className="mt-1 break-all text-sm text-slate-200">
                  {`${typeof window !== 'undefined' ? window.location.origin : ''}${inviteUrl}`}
                </div>
                <button
                  onClick={onCopy}
                  className="mt-3 w-full rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-black"
                >
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            ) : (
              <button
                onClick={onCreate}
                disabled={loading}
                className="mt-5 w-full rounded-xl bg-amber-500 px-4 py-3 font-medium text-black disabled:opacity-50"
              >
                {loading ? 'Creating\u2026' : 'Create invite link'}
              </button>
            )}

            <button
              onClick={onClose}
              className="mt-4 w-full rounded-xl border border-slate-700 bg-transparent px-4 py-2 text-sm text-slate-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
