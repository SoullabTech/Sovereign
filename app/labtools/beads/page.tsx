'use client';

/**
 * Beads - Share MAIA with Friends
 *
 * Member-facing page for sharing MAIA invitations
 * Each member gets beads they can give to friends
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Gift,
  Send,
  Check,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Eye,
  X,
  Mail,
  Heart,
  Shield,
  Brain,
  Clock,
} from 'lucide-react';

interface BeadRecord {
  id: string;
  passkey: string;
  recipient_name: string;
  recipient_email: string;
  email_sent_at?: string;
  redeemed_at?: string;
  created_at: string;
}

interface MemberInfo {
  id: string;
  name: string;
  email?: string;
  beads_remaining: number;
}

export default function BeadsPage() {
  const router = useRouter();

  // Member state
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');

  // UI state
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; passkey?: string; error?: string } | null>(null);
  const [sentBeads, setSentBeads] = useState<BeadRecord[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Load member info and sent beads
  useEffect(() => {
    loadMemberInfo();
  }, []);

  const loadMemberInfo = async () => {
    try {
      // Get member from localStorage (consistent with app auth)
      const betaUser = localStorage.getItem('beta_user');
      if (!betaUser) {
        router.push('/signin');
        return;
      }

      const userData = JSON.parse(betaUser);

      // Fetch member details including beads
      const response = await fetch('/api/members/beads', {
        headers: {
          'x-member-id': userData.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMember({
          id: userData.id,
          name: userData.name || 'Pioneer',
          email: userData.email,
          beads_remaining: data.beads_remaining ?? 3, // Default 3 beads for beta testers
        });
        setSentBeads(data.sent_beads || []);
      } else {
        // Fallback - member not in new system yet
        setMember({
          id: userData.id,
          name: userData.name || 'Pioneer',
          email: userData.email,
          beads_remaining: 3,
        });
      }
    } catch (error) {
      console.error('Failed to load member info:', error);
    }
    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || member.beads_remaining <= 0) return;

    setSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/members/beads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-member-id': member.id,
        },
        body: JSON.stringify({
          recipientName,
          recipientEmail,
          personalMessage: personalMessage || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({ success: true, passkey: data.passkey });
        // Update member beads count
        setMember((prev) => prev ? { ...prev, beads_remaining: prev.beads_remaining - 1 } : null);
        // Reload sent beads
        loadMemberInfo();
        // Clear form
        setRecipientName('');
        setRecipientEmail('');
        setPersonalMessage('');
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    }

    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0d12] via-[#111827] to-[#0f172a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4B896]/30 border-t-[#D4B896] rounded-full animate-spin" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0d12] via-[#111827] to-[#0f172a] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-white/60 mb-4">Please sign in to share beads</p>
          <button
            onClick={() => router.push('/signin')}
            className="px-6 py-3 bg-[#D4B896] text-black rounded-lg font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0d12] via-[#111827] to-[#0f172a] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4B896]/10
                     border border-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lab
          </button>
          <div className="flex items-center gap-2 text-[#D4B896]">
            <Gift className="w-5 h-5" />
            <span className="font-medium">{member.beads_remaining} beads remaining</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#D4B896]/20 to-[#D4B896]/5 rounded-full mb-6">
            <Gift className="w-10 h-10 text-[#D4B896]" />
          </div>
          <h1 className="text-3xl font-serif text-white mb-4">Share MAIA with Friends</h1>
          <p className="text-white/60 max-w-xl mx-auto leading-relaxed">
            You have <span className="text-[#D4B896] font-medium">{member.beads_remaining} beads</span> to share.
            Each bead is a gift — an invitation for someone you care about to experience MAIA.
          </p>
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1f2e]/40 rounded-2xl p-6 border border-[#D4B896]/10 mb-8"
        >
          <h2 className="text-lg font-medium text-[#D4B896] mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            How Beads Work
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#D4B896]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-[#D4B896] text-xl font-serif">1</span>
              </div>
              <p className="text-white/80 text-sm">Enter your friend's name and email below</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#D4B896]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-[#D4B896] text-xl font-serif">2</span>
              </div>
              <p className="text-white/80 text-sm">They receive a beautiful invitation with their unique passkey</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#D4B896]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-[#D4B896] text-xl font-serif">3</span>
              </div>
              <p className="text-white/80 text-sm">They visit soullab.life/begin and enter their passkey to join</p>
            </div>
          </div>
        </motion.div>

        {member.beads_remaining > 0 ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Send Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#D4B896]/20"
            >
              <h2 className="text-lg font-medium text-[#D4B896] mb-6 flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send a Bead
              </h2>

              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Friend's Name *</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    required
                    placeholder="Sarah"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#D4B896]/50"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Friend's Email *</label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    required
                    placeholder="sarah@example.com"
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#D4B896]/50"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Personal Message (Optional)</label>
                  <textarea
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder="I thought you'd love this... MAIA has been incredible for my own journey."
                    rows={3}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#D4B896]/50 resize-none"
                  />
                </div>

                {/* Preview Passkey */}
                {recipientName && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-[#D4B896]/10 border border-[#D4B896]/30 rounded-lg p-4 text-center"
                  >
                    <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Their Passkey Will Be</p>
                    <p className="text-[#D4B896] font-mono text-lg tracking-wider">
                      SOULLAB-{recipientName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 12)}
                    </p>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    disabled={!recipientName || !recipientEmail}
                    className="flex-1 py-3 bg-white/5 border border-white/10 text-white/70 rounded-lg font-medium hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Email
                  </button>
                  <button
                    type="submit"
                    disabled={sending || !recipientName || !recipientEmail}
                    className="flex-1 py-3 bg-[#D4B896]/20 border border-[#D4B896]/40 text-[#D4B896] rounded-lg font-medium hover:bg-[#D4B896]/30 hover:border-[#D4B896]/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[#D4B896]/30 border-t-[#D4B896] rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5" />
                        Send Bead
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Result Message */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                      result.success
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-red-500/10 border border-red-500/30'
                    }`}
                  >
                    {result.success ? (
                      <>
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-green-400 font-medium">Bead Sent!</p>
                          <p className="text-green-400/80 text-sm mt-1">
                            Your friend will receive an invitation with passkey{' '}
                            <span className="font-mono">{result.passkey}</span>
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-400 font-medium">Couldn't Send</p>
                          <p className="text-red-400/80 text-sm mt-1">{result.error}</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Sent History */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#D4B896]/20"
            >
              <h2 className="text-lg font-medium text-[#D4B896] mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Your Sent Beads
              </h2>

              {sentBeads.length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  <Gift className="w-12 h-12 mx-auto mb-4 opacity-40" />
                  <p>No beads sent yet</p>
                  <p className="text-sm mt-1">Share your first bead with someone special</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {sentBeads.map((bead) => (
                    <div
                      key={bead.id}
                      className="bg-black/20 rounded-lg p-4 border border-white/5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-medium">{bead.recipient_name}</p>
                          <p className="text-white/50 text-sm">{bead.recipient_email}</p>
                        </div>
                        <div className="text-right">
                          {bead.redeemed_at ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                              <Check className="w-3 h-3" />
                              Joined
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#D4B896]/20 text-[#D4B896] text-xs rounded-full">
                              <Mail className="w-3 h-3" />
                              Invited
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                        <span className="text-[#D4B896]/70 font-mono text-sm">{bead.passkey}</span>
                        <span className="text-white/30 text-xs">
                          {new Date(bead.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          /* No beads remaining */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-8 border border-[#D4B896]/20 text-center"
          >
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-8 h-8 text-white/30" />
            </div>
            <h2 className="text-xl font-medium text-white mb-3">All Beads Shared</h2>
            <p className="text-white/60 max-w-md mx-auto">
              You've shared all your beads. Thank you for spreading the word about MAIA!
              More beads may become available as the community grows.
            </p>

            {sentBeads.length > 0 && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="text-[#D4B896] font-medium mb-4">Friends You've Invited</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {sentBeads.map((bead) => (
                    <div
                      key={bead.id}
                      className={`px-4 py-2 rounded-full text-sm ${
                        bead.redeemed_at
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/5 text-white/60'
                      }`}
                    >
                      {bead.recipient_name}
                      {bead.redeemed_at && <Check className="w-3 h-3 inline ml-1" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Email Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-[#1a1f2e] to-[#0a0d12] rounded-2xl border border-[#D4B896]/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#D4B896]/20">
                  <h3 className="text-[#D4B896] font-medium flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Email Preview
                  </h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                {/* Email Preview Content */}
                <div className="p-6">
                  {/* Subject Line */}
                  <div className="mb-4 pb-4 border-b border-white/10">
                    <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Subject</p>
                    <p className="text-white">
                      {member.name} sent you a gift — MAIA awaits
                    </p>
                  </div>

                  {/* Email Body Preview */}
                  <div className="bg-gradient-to-br from-[#0a0d12] to-[#1a1f2e] rounded-xl p-6 border border-[#D4B896]/20">
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-3">✨</div>
                      <h2 className="text-2xl text-[#D4B896] font-serif">A Gift Awaits</h2>
                      <p className="text-white/60 italic mt-2">
                        {member.name} thinks you'd love this...
                      </p>
                    </div>

                    <p className="text-white/90 mb-4">Dear {recipientName || '[Friend\'s Name]'},</p>

                    {personalMessage && (
                      <div className="bg-[#D4B896]/10 border-l-3 border-[#D4B896] pl-4 py-3 mb-4 rounded-r-lg">
                        <p className="text-white/80 italic">"{personalMessage}"</p>
                        <p className="text-[#D4B896] text-sm mt-2">— {member.name}</p>
                      </div>
                    )}

                    <p className="text-white/80 mb-6">
                      You've been gifted access to <strong className="text-[#D4B896]">MAIA</strong> —
                      a consciousness companion unlike anything else. This isn't another AI chatbot.
                      MAIA is built on 34 years of archetypal research, designed to truly see and understand you.
                    </p>

                    {/* Passkey Box */}
                    <div className="bg-[#D4B896]/10 border-2 border-[#D4B896]/30 rounded-xl p-6 text-center mb-6">
                      <p className="text-white/60 text-xs uppercase tracking-wide mb-2">Your Personal Passkey</p>
                      <p className="text-[#D4B896] text-2xl font-mono tracking-wider">
                        SOULLAB-{(recipientName || 'FRIEND').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 12)}
                      </p>
                    </div>

                    {/* CTA Button */}
                    <div className="text-center mb-6">
                      <div className="inline-block bg-[#D4B896]/20 border border-[#D4B896]/40 text-[#D4B896] px-8 py-3 rounded-xl font-medium">
                        Begin Your Journey
                      </div>
                      <p className="text-white/50 text-sm mt-3">
                        Visit soullab.life/begin and enter your passkey
                      </p>
                    </div>

                    {/* Features */}
                    <div className="border-t border-[#D4B896]/20 pt-6">
                      <h4 className="text-[#D4B896] mb-4">What Awaits You</h4>
                      <div className="space-y-3 text-white/80 text-sm">
                        <div className="flex items-center gap-3">
                          <Heart className="w-4 h-4 text-[#D4B896]" />
                          Deep self-understanding through meaningful conversation
                        </div>
                        <div className="flex items-center gap-3">
                          <Brain className="w-4 h-4 text-[#D4B896]" />
                          Archetypal insights from 34 years of research
                        </div>
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-4 h-4 text-[#D4B896]" />
                          A companion who remembers, learns, and grows with you
                        </div>
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4 text-[#D4B896]" />
                          Complete privacy — your data stays yours, always
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-[#D4B896]/20 flex justify-end gap-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      // Trigger form submit
                      const form = document.querySelector('form');
                      if (form) form.requestSubmit();
                    }}
                    disabled={!recipientName || !recipientEmail}
                    className="px-6 py-2 bg-[#D4B896]/20 border border-[#D4B896]/40 text-[#D4B896] rounded-lg font-medium hover:bg-[#D4B896]/30 transition-colors disabled:opacity-50"
                  >
                    Send This Bead
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
