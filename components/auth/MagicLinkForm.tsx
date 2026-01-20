/**
 * Magic Link Form
 *
 * Email-based passwordless sign-in option.
 */
'use client';

import { useState } from 'react';

export function MagicLinkForm() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function sendLink() {
    if (!email) return;

    setLoading(true);
    setSent(false);

    try {
      const response = await fetch('/api/members/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // Always show "sent" regardless of whether email exists (security)
      setSent(true);
    } catch {
      // Still show sent to avoid email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left text-sm text-white/80 hover:text-white"
      >
        {open ? 'Hide magic link' : 'Email me a link'}
      </button>

      {open ? (
        <div className="mt-3 flex gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            type="email"
            className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-white/25"
          />
          <button
            onClick={sendLink}
            disabled={loading || !email}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm hover:bg-white/15 disabled:opacity-50"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      ) : null}

      {sent ? (
        <div className="mt-2 text-xs text-white/60">
          If that email exists, a link is on the way.
        </div>
      ) : null}
    </div>
  );
}
