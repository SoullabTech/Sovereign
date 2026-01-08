'use client';

/**
 * Gift Passkey Creator
 *
 * Admin tool for creating and sending beautiful gift passkeys
 * Enables organic growth through personal invitations
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Send, Check, AlertCircle, Sparkles, Users, Mail, Clock } from 'lucide-react';

interface GiftRecord {
  id: string;
  passkey: string;
  recipient_name: string;
  recipient_email: string;
  gifter_name?: string;
  email_sent_at?: string;
  redeemed_at?: string;
  created_at: string;
}

export default function GiftCreatorPage() {
  const [adminSecret, setAdminSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  // Form state
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [gifterName, setGifterName] = useState('');
  const [gifterEmail, setGifterEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; passkey?: string; error?: string } | null>(null);
  const [gifts, setGifts] = useState<GiftRecord[]>([]);
  const [loadingGifts, setLoadingGifts] = useState(false);

  // Check for saved secret
  useEffect(() => {
    const saved = localStorage.getItem('labtools_secret');
    if (saved) {
      setAdminSecret(saved);
      setAuthenticated(true);
      loadGifts(saved);
    }
  }, []);

  const loadGifts = async (secret: string) => {
    setLoadingGifts(true);
    try {
      const response = await fetch(`/api/labtools/gifts?adminSecret=${encodeURIComponent(secret)}`);
      const data = await response.json();
      if (data.success) {
        setGifts(data.gifts);
      }
    } catch (error) {
      console.error('Failed to load gifts:', error);
    }
    setLoadingGifts(false);
  };

  const handleAuth = () => {
    localStorage.setItem('labtools_secret', adminSecret);
    setAuthenticated(true);
    loadGifts(adminSecret);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/labtools/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName,
          recipientEmail,
          gifterName: gifterName || undefined,
          gifterEmail: gifterEmail || undefined,
          personalMessage: personalMessage || undefined,
          adminSecret
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult({ success: true, passkey: data.passkey });
        // Clear form
        setRecipientName('');
        setRecipientEmail('');
        setGifterName('');
        setGifterEmail('');
        setPersonalMessage('');
        // Reload gifts list
        loadGifts(adminSecret);
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    }

    setLoading(false);
  };

  // Auth screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0d12] via-[#111827] to-[#0f172a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1f2e]/80 backdrop-blur-sm rounded-2xl p-8 border border-[#D4B896]/20 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <Gift className="w-12 h-12 text-[#D4B896] mx-auto mb-4" />
            <h1 className="text-2xl font-serif text-white mb-2">Gift Creator</h1>
            <p className="text-white/60 text-sm">Enter admin secret to continue</p>
          </div>
          <input
            type="password"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            placeholder="Admin secret..."
            className="w-full px-4 py-3 bg-black/30 border border-[#D4B896]/30 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#D4B896]/60 mb-4"
          />
          <button
            onClick={handleAuth}
            className="w-full py-3 bg-[#D4B896] text-black rounded-lg font-medium hover:bg-[#E5C9A7] transition-colors"
          >
            Enter Lab
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0d12] via-[#111827] to-[#0f172a] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-[#D4B896]" />
            <div>
              <h1 className="text-2xl font-serif text-white">Gift Passkeys</h1>
              <p className="text-white/60 text-sm">Create beautiful invitations for your favorite people</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Users className="w-4 h-4" />
            <span>{gifts.length} gifts created</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Creation Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#D4B896]/20"
          >
            <h2 className="text-lg font-medium text-[#D4B896] mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Create New Gift
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Recipient Section */}
              <div className="space-y-4">
                <p className="text-white/60 text-sm font-medium uppercase tracking-wide">Recipient</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Name *</label>
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
                    <label className="block text-white/70 text-sm mb-2">Email *</label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      required
                      placeholder="sarah@example.com"
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#D4B896]/50"
                    />
                  </div>
                </div>
              </div>

              {/* Gifter Section (Optional) */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm font-medium uppercase tracking-wide">From (Optional)</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Gifter Name</label>
                    <input
                      type="text"
                      value={gifterName}
                      onChange={(e) => setGifterName(e.target.value)}
                      placeholder="Kelly"
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#D4B896]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Gifter Email</label>
                    <input
                      type="email"
                      value={gifterEmail}
                      onChange={(e) => setGifterEmail(e.target.value)}
                      placeholder="kelly@soullab.life"
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#D4B896]/50"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Message */}
              <div className="pt-4 border-t border-white/10">
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
                  <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Passkey Preview</p>
                  <p className="text-[#D4B896] font-mono text-lg tracking-wider">
                    SOULLAB-{recipientName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 12)}
                  </p>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !recipientName || !recipientEmail}
                className="w-full py-4 bg-gradient-to-r from-[#D4B896] to-[#B8956E] text-black rounded-lg font-medium hover:from-[#E5C9A7] hover:to-[#C9A67F] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Creating Gift...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Create & Send Gift
                  </>
                )}
              </button>
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
                        <p className="text-green-400 font-medium">Gift Created!</p>
                        <p className="text-green-400/80 text-sm mt-1">
                          Passkey <span className="font-mono">{result.passkey}</span> sent to recipient
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 font-medium">Error</p>
                        <p className="text-red-400/80 text-sm mt-1">{result.error}</p>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Gift History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#1a1f2e]/60 backdrop-blur-sm rounded-2xl p-6 border border-[#D4B896]/20"
          >
            <h2 className="text-lg font-medium text-[#D4B896] mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Gifts
            </h2>

            {loadingGifts ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-[#D4B896]/30 border-t-[#D4B896] rounded-full animate-spin" />
              </div>
            ) : gifts.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <Gift className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p>No gifts created yet</p>
                <p className="text-sm mt-1">Create your first gift above</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {gifts.map((gift) => (
                  <div
                    key={gift.id}
                    className="bg-black/20 rounded-lg p-4 border border-white/5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-medium">{gift.recipient_name}</p>
                        <p className="text-white/50 text-sm">{gift.recipient_email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#D4B896] font-mono text-sm">{gift.passkey}</p>
                        <p className="text-white/30 text-xs mt-1">
                          {new Date(gift.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                      {gift.gifter_name && (
                        <span className="text-white/40 text-xs">
                          From: {gift.gifter_name}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-xs">
                        {gift.email_sent_at ? (
                          <span className="text-green-400/80 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> Sent
                          </span>
                        ) : (
                          <span className="text-yellow-400/80">Pending</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {gift.redeemed_at ? (
                          <span className="text-purple-400/80 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Redeemed
                          </span>
                        ) : (
                          <span className="text-white/30">Not used</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
