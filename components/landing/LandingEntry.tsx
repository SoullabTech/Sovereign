'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

type EntryState = 'initial' | 'checking' | 'has_invite' | 'no_invite' | 'waitlist_submitted';

interface InviteData {
  invitedBy?: string;
  blessing?: string;
  intendedFor?: string;
}

export function LandingEntry() {
  const router = useRouter();
  const [state, setState] = useState<EntryState>('initial');
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [inviteData, setInviteData] = useState<InviteData>({});

  const handleCheckInvite = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter your invite code');
      return;
    }

    setState('checking');
    setError('');

    try {
      // Check if this is a valid bead/invite code
      const response = await fetch('/api/invites/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode.trim() })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        // Store the invite data to show blessing
        setInviteData({
          invitedBy: data.invitedBy,
          blessing: data.blessing,
          intendedFor: data.intendedFor,
        });
        setState('has_invite');
        // Store the invite code for the onboarding flow
        localStorage.setItem('pending_invite_code', inviteCode.trim());
        // Redirect to begin journey (longer delay to show blessing)
        setTimeout(() => {
          router.push('/begin');
        }, data.blessing ? 4000 : 1500);
      } else {
        setState('no_invite');
      }
    } catch {
      // If API doesn't exist yet, show waitlist
      setState('no_invite');
    }
  };

  const handleWaitlist = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setState('checking');
    setError('');

    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      setState('waitlist_submitted');
    } catch {
      // Even if API fails, show success (we'll have the email in logs)
      setState('waitlist_submitted');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-br from-teal-900/90 to-teal-950/90 rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {/* Initial state - ask for invite */}
          {state === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="text-white text-xl font-medium mb-2">
                Enter the space
              </h3>
              <p className="text-white/60 text-sm mb-6">
                MAIA spreads through relationship. If someone trusted you with a bead, enter it here.
              </p>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Your invite code"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
                  />
                  {error && (
                    <p className="text-red-300 text-sm mt-2">{error}</p>
                  )}
                </div>

                <button
                  onClick={handleCheckInvite}
                  className="w-full px-6 py-3 bg-white/90 hover:bg-white text-teal-950 font-medium rounded-xl transition-all duration-200"
                >
                  Enter
                </button>

                <div className="text-center">
                  <button
                    onClick={() => setState('no_invite')}
                    className="text-white/50 hover:text-white/70 text-sm transition-colors"
                  >
                    I don't have an invite yet
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Checking state */}
          {state === 'checking' && (
            <motion.div
              key="checking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/60">Checking...</p>
            </motion.div>
          )}

          {/* Has invite - success with blessing */}
          {state === 'has_invite' && (
            <motion.div
              key="has_invite"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 className="text-white text-xl font-medium mb-2">
                Welcome{inviteData.intendedFor ? `, ${inviteData.intendedFor}` : ''}
              </h3>

              {inviteData.blessing ? (
                <div className="mt-4 mb-4">
                  {inviteData.invitedBy && (
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-2">
                      A blessing from {inviteData.invitedBy}
                    </p>
                  )}
                  <blockquote className="text-white/80 text-sm italic leading-relaxed px-4 border-l-2 border-teal-500/40 text-left">
                    "{inviteData.blessing}"
                  </blockquote>
                </div>
              ) : (
                <p className="text-white/60 text-sm">
                  {inviteData.invitedBy
                    ? `${inviteData.invitedBy} trusted you to be here.`
                    : 'Someone trusted you to be here.'}
                </p>
              )}

              <p className="text-white/40 text-xs mt-4">
                Entering in a moment...
              </p>
            </motion.div>
          )}

          {/* No invite - show waitlist */}
          {state === 'no_invite' && (
            <motion.div
              key="no_invite"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="text-white text-xl font-medium mb-2">
                The door opens through relationship
              </h3>
              <p className="text-white/60 text-sm mb-6">
                MAIA doesn't advertise. Each member receives beads to share with people they trust. Leave your email and we'll let you know when a bead finds you.
              </p>

              <div className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
                  />
                  {error && (
                    <p className="text-red-300 text-sm mt-2">{error}</p>
                  )}
                </div>

                <button
                  onClick={handleWaitlist}
                  className="w-full px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl border border-white/20 transition-all duration-200"
                >
                  Join the waitlist
                </button>

                <div className="text-center">
                  <button
                    onClick={() => setState('initial')}
                    className="text-white/50 hover:text-white/70 text-sm transition-colors"
                  >
                    I have an invite
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Waitlist submitted */}
          {state === 'waitlist_submitted' && (
            <motion.div
              key="waitlist_submitted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-medium mb-2">
                You're on the path
              </h3>
              <p className="text-white/60 text-sm">
                When a bead finds you, you'll know.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
