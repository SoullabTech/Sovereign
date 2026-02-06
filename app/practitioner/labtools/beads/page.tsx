'use client';

/**
 * Practitioner Beads Share Page
 * Share MAIA invitations with friends, partners, and collaborators
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';

interface BeadRecord {
  id: string;
  passkey: string;
  recipient_name: string;
  recipient_email: string;
  email_sent_at: string | null;
  redeemed_at: string | null;
  created_at: string;
}

interface MemberInfo {
  id: string;
  name: string;
  email?: string;
  beads_remaining: number;
}

function BeadsContent() {
  const router = useRouter();

  const [member, setMember] = useState<MemberInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ passkey: string; name: string } | null>(null);
  const [sentBeads, setSentBeads] = useState<BeadRecord[]>([]);

  // Form state
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        // Get member from localStorage
        const betaUser = localStorage.getItem('beta_user');
        if (!betaUser) {
          router.push('/signin');
          return;
        }

        const userData = JSON.parse(betaUser);

        // Fetch member beads info using apiFetch
        const response = await apiFetch('/api/members/beads');

        if (response.ok) {
          const data = await response.json();
          setMember({
            id: userData.id,
            name: userData.name || 'Pioneer',
            email: userData.email,
            beads_remaining: data.beads_remaining ?? 10,
          });
          setSentBeads(data.sent_beads || []);
        } else {
          // Fallback
          setMember({
            id: userData.id,
            name: userData.name || 'Pioneer',
            email: userData.email,
            beads_remaining: 10,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || member.beads_remaining <= 0) return;

    setIsSending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiFetch('/api/members/beads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName,
          recipientEmail,
          personalMessage: personalMessage || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess({ passkey: data.passkey, name: recipientName });
        setMember(prev => prev ? { ...prev, beads_remaining: prev.beads_remaining - 1 } : null);

        // Reload sent beads
        const reloadRes = await apiFetch('/api/members/beads');
        if (reloadRes.ok) {
          const reloadData = await reloadRes.json();
          setSentBeads(reloadData.sent_beads || []);
        }

        // Clear form
        setRecipientName('');
        setRecipientEmail('');
        setPersonalMessage('');
      } else {
        setError(data.error || 'Failed to send bead');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-48" />
          <div className="h-64 bg-gray-800 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">Please sign in to share beads</p>
        </div>
      </div>
    );
  }

  const previewPasskey = recipientName
    ? `SOULLAB-${recipientName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 12)}`
    : '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-medium text-white">Share MAIA</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gift invitations to friends, partners, and collaborators
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <span className="text-amber-300 font-medium">{member.beads_remaining} beads remaining</span>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
        <h3 className="text-sm font-medium text-amber-400 mb-4">How Beads Work</h3>
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-amber-400 font-medium">1</span>
            </div>
            <p className="text-sm text-gray-400">Enter your friend's name and email</p>
          </div>
          <div>
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-amber-400 font-medium">2</span>
            </div>
            <p className="text-sm text-gray-400">They receive a beautiful invitation with their passkey</p>
          </div>
          <div>
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-amber-400 font-medium">3</span>
            </div>
            <p className="text-sm text-gray-400">They visit soullab.life/begin to join</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Send Form */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Send a Bead</h3>

          {member.beads_remaining > 0 ? (
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Friend's Name *</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g., Sarah"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Friend's Email *</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="e.g., sarah@example.com"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Personal Message (Optional)</label>
                <textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="I thought you'd love this..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>

              {/* Passkey Preview */}
              {previewPasskey && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Their Passkey Will Be</p>
                  <p className="text-amber-400 font-mono text-lg tracking-wider">{previewPasskey}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSending || !recipientName || !recipientEmail}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                    Send Bead
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <p className="text-white font-medium mb-2">All Beads Shared</p>
              <p className="text-sm text-gray-500">
                Thank you for spreading the word about MAIA!
              </p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="text-green-400 font-medium">Bead Sent!</p>
                  <p className="text-green-400/80 text-sm mt-1">
                    {success.name} will receive an invitation with passkey{' '}
                    <span className="font-mono">{success.passkey}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-red-400 font-medium">Couldn't Send</p>
                  <p className="text-red-400/80 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sent History */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Sent Beads</h3>

          {sentBeads.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <p className="text-gray-500">No beads sent yet</p>
              <p className="text-sm text-gray-600 mt-1">Share your first bead with someone special</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {sentBeads.map(bead => (
                <div
                  key={bead.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium">{bead.recipient_name}</p>
                      <p className="text-sm text-gray-500">{bead.recipient_email}</p>
                    </div>
                    {bead.redeemed_at ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Joined
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Invited
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                    <span className="text-amber-400/70 font-mono text-sm">{bead.passkey}</span>
                    <span className="text-gray-600 text-xs">
                      {new Date(bead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BeadsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-48" />
          <div className="h-64 bg-gray-800 rounded-lg" />
        </div>
      </div>
    }>
      <BeadsContent />
    </Suspense>
  );
}
