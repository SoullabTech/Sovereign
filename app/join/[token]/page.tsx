'use client';

/**
 * /join/[token] — Client invitation acceptance
 *
 * Sarah clicks Jondi's invitation link and arrives here.
 * She is accepting Jondi's invitation — not signing up for software.
 *
 * Flow:
 *   1. Validate token → show who invited them
 *   2. Sign in with an existing member account
 *   3. Link to relationship_space → redirect to threshold
 *
 * Sign-in only (founder ruling 2026-10-01). The former create-account branch
 * posted to /api/members/register without a passkey, which passkey admission
 * (lib/auth/passkeyAdmission.ts) always refuses — a dead path. Any future
 * account-creation path here must carry a passkey and the 18+ confirmation
 * (lib/members/adultConfirmation.ts); none is built.
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';

type Stage = 'loading' | 'invalid' | 'sign_in' | 'linking';

interface InviteInfo {
  space_id: string;
  practitioner_name: string;
  welcome_message?: string | null;
  already_member: boolean;
}

export default function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [stage, setStage] = useState<Stage>('loading');
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  // Sign in fields
  const [siUsername, setSiUsername] = useState('');
  const [siPassword, setSiPassword] = useState('');

  useEffect(() => {
    validateToken();
  }, [token]);

  async function validateToken() {
    try {
      const res = await fetch(`/api/join/${token}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setStage('invalid');
        setError(data.error || 'This invitation is no longer valid.');
        return;
      }
      setInvite(data);
      setStage('sign_in');
    } catch {
      setStage('invalid');
      setError('Unable to verify invitation. Please try again.');
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setWorking(true);
    setError(null);
    try {
      await signInAndLink(siUsername, siPassword);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  }

  async function signInAndLink(username: string, password: string) {
    const signinRes = await fetch('/api/members/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const signinData = await signinRes.json();
    if (!signinRes.ok) throw new Error(signinData.error || 'Sign in failed');

    // Store session token for apiFetch
    if (signinData.sessionToken) {
      localStorage.setItem('maia_session_token', signinData.sessionToken);
      if (signinData.member) localStorage.setItem('beta_user', JSON.stringify(signinData.member));
    }

    setStage('linking');

    // Link member to the relationship space via the token
    const linkRes = await apiFetch(`/api/join/${token}/accept`, { method: 'POST' });
    const linkData = await linkRes.json();
    if (!linkRes.ok) throw new Error(linkData.error || 'Failed to link invitation');

    // Redirect to threshold screen
    router.push(`/relationship/${invite!.space_id}/threshold`);
  }

  if (stage === 'loading') {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-500 text-sm font-light">Verifying your invitation…</p>
      </div>
    );
  }

  if (stage === 'invalid') {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-6">
        <div className="max-w-sm text-center space-y-4">
          <p className="text-stone-400 text-sm font-light">{error || 'This invitation is no longer valid.'}</p>
          <p className="text-stone-600 text-xs">If you believe this is an error, please contact the person who invited you.</p>
        </div>
      </div>
    );
  }

  if (stage === 'linking') {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-500 text-sm font-light">Opening your shared space…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-10">

        {/* Header */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-stone-500">Private Invitation</p>
          <h1 className="text-stone-200 text-xl font-light">
            {invite?.practitioner_name} has invited you into a shared space.
          </h1>
          <p className="text-stone-400 text-sm font-light leading-relaxed">
            I'm MAIA. I'll support the work the two of you do together between sessions.
          </p>
        </div>

        {/* Welcome message from practitioner */}
        {invite?.welcome_message && (
          <div className="border-l-2 border-stone-700 pl-4 space-y-1">
            <p className="text-stone-400 text-sm font-light leading-relaxed italic">
              {invite.welcome_message}
            </p>
            <p className="text-stone-600 text-xs">— {invite.practitioner_name}</p>
          </div>
        )}

        {/* Sign in form */}
        {stage === 'sign_in' && (
          <form onSubmit={handleSignIn} className="space-y-5">
            <p className="text-stone-500 text-sm font-light">Sign in to accept the invitation.</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-stone-500 uppercase tracking-wider block mb-1">Username</label>
                <input
                  type="text" value={siUsername} onChange={e => setSiUsername(e.target.value)}
                  required autoFocus
                  className="w-full bg-stone-900 border border-stone-700 text-stone-200 px-4 py-3 text-sm font-light focus:outline-none focus:border-stone-500 rounded"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 uppercase tracking-wider block mb-1">Password</label>
                <input
                  type="password" value={siPassword} onChange={e => setSiPassword(e.target.value)}
                  required
                  className="w-full bg-stone-900 border border-stone-700 text-stone-200 px-4 py-3 text-sm font-light focus:outline-none focus:border-stone-500 rounded"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="submit" disabled={working}
              className="w-full bg-stone-200 text-stone-900 py-3 text-sm font-medium tracking-wide hover:bg-white transition-colors disabled:opacity-50"
            >
              {working ? 'Signing in…' : 'Sign In & Continue'}
            </button>

            <p className="text-center text-stone-600 text-xs">
              Accepting needs an existing Soullab account. If you don't have one yet, let {invite?.practitioner_name} know.
            </p>
          </form>
        )}

      </div>
    </div>
  );
}
