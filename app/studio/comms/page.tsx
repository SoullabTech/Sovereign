'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Phone, Send, Plus, X, Loader2, Check } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

/**
 * Studio → Comms
 *
 * Honest state: there is no inbound message store wired to this surface (a real
 * inbox exists separately on /stellium/comms). The only live capability here is
 * outbound SMS via /api/notifications/sms. We therefore show a truthful empty
 * state rather than fabricated message history, and keep the verified Compose SMS.
 * Sent messages are NOT shown as persisted history — content isn't stored
 * (sovereignty); we surface a transient "sent" confirmation instead.
 */
export default function CommsPage() {
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsTo, setSmsTo] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [sendingSms, setSendingSms] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);
  const [sentOk, setSentOk] = useState(false);

  const openCompose = () => {
    setSentOk(false);
    setSmsError(null);
    setShowSmsModal(true);
  };

  const sendSms = async () => {
    if (!smsTo.trim() || !smsMessage.trim()) {
      setSmsError('Phone number and message are required');
      return;
    }

    setSendingSms(true);
    setSmsError(null);

    try {
      const response = await apiFetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: smsTo.trim(),
          message: smsMessage.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowSmsModal(false);
        setSmsTo('');
        setSmsMessage('');
        setSentOk(true);
      } else {
        setSmsError(data.error || 'Failed to send SMS');
      }
    } catch {
      setSmsError('Failed to send SMS. Please try again.');
    } finally {
      setSendingSms(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          Comms
        </h1>
        <button
          onClick={openCompose}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors text-xs font-medium"
        >
          <Plus className="w-3 h-3" />
          Compose SMS
        </button>
      </div>

      {/* Transient sent confirmation — session-only, not persisted history */}
      {sentOk && (
        <div className="mx-4 mt-3 flex items-center justify-between gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" /> SMS sent.
          </span>
          <button
            onClick={() => setSentOk(false)}
            className="text-emerald-400/70 hover:text-emerald-300"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Honest empty state */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-7 h-7 text-slate-500" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">No messages yet</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            You can send an SMS with Compose. Incoming messages and email aren&apos;t
            connected to this view yet.
          </p>
          <button
            onClick={openCompose}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm font-medium"
          >
            <Phone className="w-4 h-4" />
            Compose SMS
          </button>
        </div>
      </div>

      {/* Compose SMS modal (verified outbound wire — unchanged behavior) */}
      <AnimatePresence>
        {showSmsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowSmsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  Compose SMS
                </h3>
                <button
                  onClick={() => setShowSmsModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {smsError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {smsError}
                  </div>
                )}

                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    To (Phone Number)
                  </label>
                  <input
                    type="tel"
                    value={smsTo}
                    onChange={(e) => setSmsTo(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">
                    Message
                  </label>
                  <textarea
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={4}
                    maxLength={160}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                  <div className="text-xs text-slate-500 mt-1 text-right">
                    {smsMessage.length}/160 characters
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700">
                <button
                  onClick={() => setShowSmsModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendSms}
                  disabled={sendingSms || !smsTo.trim() || !smsMessage.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-maia-navy-700 text-white rounded-lg hover:bg-maia-navy-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingSms ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send SMS
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
