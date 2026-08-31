'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Phone,
  Send,
  Plus,
  X,
  Loader2,
  Check,
  AlertTriangle,
  Clock,
} from 'lucide-react';
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
 *
 * Delivery truth: a synchronous send only means Twilio ACCEPTED the message. The
 * carrier can still reject it (e.g. A2P 10DLC error 30034) and Twilio reports
 * that asynchronously via the StatusCallback webhook. So after a send we poll
 * /api/notifications/sms/delivery and surface the real outcome — delivered /
 * undelivered / failed + error code — instead of a permanently green "SMS sent".
 */

type DeliveryState = {
  status: string;
  errorCode: string | null;
  errorMessage: string | null;
};

const TERMINAL = ['delivered', 'undelivered', 'failed'];

export default function CommsPage() {
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsTo, setSmsTo] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [sendingSms, setSendingSms] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);

  // Outcome surface (transient, session-only).
  const [sentOk, setSentOk] = useState(false);
  const [deliverySid, setDeliverySid] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<DeliveryState | null>(null);
  const [deliveryTimedOut, setDeliveryTimedOut] = useState(false);

  const resetOutcome = () => {
    setSentOk(false);
    setDeliverySid(null);
    setDelivery(null);
    setDeliveryTimedOut(false);
  };

  const openCompose = () => {
    resetOutcome();
    setSmsError(null);
    setShowSmsModal(true);
  };

  // Poll the delivery-status read endpoint until a terminal state or timeout.
  // The webhook writes the terminal state async, so the first checks usually see
  // an in-flight ("accepted"/"queued") row or none yet.
  useEffect(() => {
    if (!deliverySid) return;

    const token = { cancelled: false };
    let attempts = 0;
    const maxAttempts = 12; // ~30s at 2.5s spacing
    const intervalMs = 2500;

    const poll = async () => {
      if (token.cancelled) return;
      attempts += 1;
      try {
        const res = await apiFetch(
          `/api/notifications/sms/delivery?sid=${encodeURIComponent(deliverySid)}`,
        );
        const data = await res.json();
        if (token.cancelled) return;
        if (data.found && data.status) {
          setDelivery({
            status: data.status,
            errorCode: data.errorCode ?? null,
            errorMessage: data.errorMessage ?? null,
          });
          if (data.terminal) return; // settled — stop polling
        }
      } catch {
        // transient (network / auth blip) — keep polling
      }
      if (attempts >= maxAttempts) {
        if (!token.cancelled) setDeliveryTimedOut(true);
        return;
      }
      if (!token.cancelled) setTimeout(poll, intervalMs);
    };

    // Small initial delay so the StatusCallback has a moment to land.
    const starter = setTimeout(poll, 1500);

    return () => {
      token.cancelled = true;
      clearTimeout(starter);
    };
  }, [deliverySid]);

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
        resetOutcome();
        setSentOk(true);
        // data.id is the Twilio message SID — present for real sends, absent in
        // dev mode. Only then can we track delivery.
        if (data.id) setDeliverySid(data.id);
      } else {
        setSmsError(data.error || 'Failed to send SMS');
      }
    } catch {
      setSmsError('Failed to send SMS. Please try again.');
    } finally {
      setSendingSms(false);
    }
  };

  const outcome = describeOutcome(deliverySid, delivery, deliveryTimedOut);

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

      {/* Transient outcome — reflects the REAL delivery state, not just "accepted" */}
      {sentOk && (
        <div
          className={`mx-4 mt-3 flex items-start justify-between gap-2 px-3 py-2 rounded-lg border text-sm ${outcome.className}`}
        >
          <span className="flex items-center gap-2">
            <outcome.Icon className={`w-4 h-4 shrink-0 ${outcome.iconClassName ?? ''}`} />
            <span>{outcome.text}</span>
          </span>
          <button
            onClick={resetOutcome}
            className="opacity-70 hover:opacity-100 shrink-0"
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

/**
 * Map the (sid, delivery, timeout) triple to a banner. The whole point is to
 * stop claiming success when the carrier rejected the message.
 */
function describeOutcome(
  deliverySid: string | null,
  delivery: DeliveryState | null,
  timedOut: boolean,
): { text: string; className: string; Icon: typeof Check; iconClassName?: string } {
  const status = delivery?.status;

  if (status === 'delivered') {
    return {
      text: 'Delivered.',
      className: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      Icon: Check,
    };
  }

  if (status === 'undelivered' || status === 'failed') {
    const code = delivery?.errorCode;
    const hint =
      code === '30034'
        ? 'The carrier rejected it — this account’s A2P 10DLC campaign isn’t registered. No SMS will reach real phones until that’s fixed in Twilio.'
        : `The carrier did not deliver it${code ? ` (error ${code})` : ''}.`;
    return {
      text: `Not delivered. ${hint}`,
      className: 'bg-red-500/10 border-red-500/30 text-red-300',
      Icon: AlertTriangle,
    };
  }

  if (timedOut) {
    return {
      text: 'Twilio accepted it, but delivery isn’t confirmed yet. Check back shortly.',
      className: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      Icon: Clock,
    };
  }

  // No SID means dev mode (no provider id) — nothing to track.
  if (!deliverySid) {
    return {
      text: 'SMS sent (delivery not tracked in this environment).',
      className: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      Icon: Check,
    };
  }

  // Real send, awaiting the carrier's verdict.
  return {
    text: 'Sent — confirming delivery…',
    className: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    Icon: Loader2,
    iconClassName: 'animate-spin',
  };
}
