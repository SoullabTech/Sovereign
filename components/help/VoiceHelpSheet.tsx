'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Settings, RefreshCw, Bluetooth, MessageCircle,
  Send, Copy, Check, Loader2, AlertCircle,
} from 'lucide-react';
import { VOICE_HELP_STEPS, VOICE_HELP_SUPPORT_TEMPLATE } from '@/lib/help/voiceHelpContent';
import { useBetaSession } from '@/lib/auth/betaSession';

interface VoiceHelpSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type SubmitState = 'idle' | 'sending' | 'sent' | 'error';

export default function VoiceHelpSheet({ isOpen, onClose }: VoiceHelpSheetProps) {
  const icons = [Settings, RefreshCw, Bluetooth];
  const { user } = useBetaSession();

  const [whatHappened, setWhatHappened] = useState('');
  const [whatExpected, setWhatExpected] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [copiedDetails, setCopiedDetails] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const memberName = user?.name || user?.username || '';
  const memberId = user?.id || '';
  const deviceLabel = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  // Build structured support details for copy/mailto/submit
  const buildSupportBody = useCallback((forEmail = false) => {
    const lines = [
      `Member: ${memberName || 'Unknown'}`,
      `Member ID: ${memberId || 'Unknown'}`,
      `Device: ${deviceLabel || 'Unknown'}`,
      `Time: ${new Date().toLocaleString()}`,
      `Route: ${typeof window !== 'undefined' ? window.location.pathname : 'Unknown'}`,
      '',
      `What happened: ${whatHappened || '(not provided)'}`,
      `What expected: ${whatExpected || '(not provided)'}`,
    ];
    return forEmail ? lines.join('\n') : lines.join('\n');
  }, [memberName, memberId, deviceLabel, whatHappened, whatExpected]);

  // mailto href
  const supportMailtoHref = useMemo(() => {
    const email = VOICE_HELP_SUPPORT_TEMPLATE.supportEmail;
    const subject = encodeURIComponent(
      `Voice Support Request${memberName ? ` — ${memberName}` : ''}`
    );
    const body = encodeURIComponent(
      [
        'Please describe the voice issue below.',
        '',
        `Member: ${memberName || 'Unknown'}`,
        `Device: ${deviceLabel || 'Unknown'}`,
        `Time of issue: ${new Date().toLocaleString()}`,
        '',
        '--- Please fill in ---',
        'iPhone model + iOS version: ',
        'MAIA build # (TestFlight): ',
        'Mic ON? / Speech Recognition ON?: ',
        'Bluetooth ON?: ',
        '',
        'What happened?',
        '',
        '',
        'What did you expect to happen?',
        '',
        '',
      ].join('\n')
    );
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }, [memberName, deviceLabel]);

  // Submit report via backend
  const handleSubmitReport = useCallback(async () => {
    if (submitState === 'sending' || submitState === 'sent') return;
    setSubmitState('sending');

    try {
      const message = buildSupportBody();
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'problem',
          message,
          userName: memberName || undefined,
          userId: memberId || undefined,
          userAgent: deviceLabel || undefined,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      });

      if (!res.ok) throw new Error('Failed to send');

      setSubmitState('sent');
      setTimeout(() => setSubmitState('idle'), 3000);
    } catch {
      setSubmitState('error');
      setTimeout(() => setSubmitState('idle'), 4000);
    }
  }, [submitState, buildSupportBody, memberName, memberId, deviceLabel]);

  // Clipboard helpers (pattern from GenerateInviteButton)
  const copyToClipboard = useCallback(async (text: string, setter: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setter(true);
      setTimeout(() => setter(false), 2000);
    }
  }, []);

  const handleCopyDetails = useCallback(() => {
    copyToClipboard(buildSupportBody(), setCopiedDetails);
  }, [copyToClipboard, buildSupportBody]);

  const handleCopyEmail = useCallback(() => {
    copyToClipboard(VOICE_HELP_SUPPORT_TEMPLATE.supportEmail, setCopiedEmail);
  }, [copyToClipboard]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[101] max-h-[85vh] overflow-y-auto
                       bg-gradient-to-b from-[#1a1512] to-[#0d0a08]
                       border-t border-amber-500/20 rounded-t-3xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-amber-500/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4">
              <h2 className="text-xl font-semibold text-amber-400">
                Voice Help
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-8 space-y-6">
              <p className="text-white/70 text-sm">
                If MAIA says &ldquo;Listening&hellip;&rdquo; but doesn&apos;t hear you:
              </p>

              {/* Steps */}
              {VOICE_HELP_STEPS.map((step, index) => {
                const Icon = icons[index];
                return (
                  <div
                    key={index}
                    className="bg-white/5 rounded-2xl p-4 border border-white/10"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/20">
                        <Icon className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-1">
                          {index + 1}) {step.title}
                        </h3>
                        <p className="text-white/60 text-sm mb-2">
                          {step.description}
                        </p>
                        {'items' in step && step.items && (
                          <ul className="space-y-1 mb-2">
                            {step.items.map((item, i) => (
                              <li key={i} className="text-amber-400/80 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                        {step.note && (
                          <p className="text-white/50 text-xs italic">
                            {step.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Support Section */}
              <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white mb-2">
                      Still not working? Report the issue:
                    </h3>

                    {/* Issue description fields */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="block text-white/50 text-xs mb-1">
                          What happened?
                        </label>
                        <textarea
                          value={whatHappened}
                          onChange={(e) => setWhatHappened(e.target.value)}
                          placeholder="e.g. I tapped Talk but MAIA shows Listening and nothing happens"
                          rows={2}
                          className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white/80 placeholder:text-white/30 focus:border-amber-500/40 focus:outline-none resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-white/50 text-xs mb-1">
                          What did you expect?
                        </label>
                        <textarea
                          value={whatExpected}
                          onChange={(e) => setWhatExpected(e.target.value)}
                          placeholder="e.g. MAIA should hear my voice and respond"
                          rows={2}
                          className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white/80 placeholder:text-white/30 focus:border-amber-500/40 focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    <p className="text-white/40 text-xs mb-3">
                      Your device info, member name, and timestamp are included automatically.
                    </p>

                    {/* Three-layer actions */}
                    <div className="space-y-2">
                      {/* Primary: Submit Report */}
                      <button
                        onClick={handleSubmitReport}
                        disabled={submitState === 'sending' || submitState === 'sent'}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          submitState === 'sent'
                            ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                            : submitState === 'error'
                              ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                              : 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400'
                        }`}
                      >
                        {submitState === 'sending' && <Loader2 className="w-4 h-4 animate-spin" />}
                        {submitState === 'sent' && <Check className="w-4 h-4" />}
                        {submitState === 'error' && <AlertCircle className="w-4 h-4" />}
                        {submitState === 'idle' && <Send className="w-4 h-4" />}
                        {submitState === 'sending' ? 'Sending...'
                          : submitState === 'sent' ? 'Report Sent'
                          : submitState === 'error' ? 'Could not send — try copying details'
                          : 'Submit Report'}
                      </button>

                      {/* Secondary: mailto */}
                      <a
                        href={supportMailtoHref}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm font-medium transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send to Support via Email
                      </a>

                      {/* Tertiary: copy actions */}
                      <div className="flex items-center justify-center gap-4 pt-1">
                        <button
                          onClick={handleCopyDetails}
                          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
                        >
                          {copiedDetails ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedDetails ? 'Copied' : 'Copy details'}
                        </button>
                        <span className="text-white/20">|</span>
                        <button
                          onClick={handleCopyEmail}
                          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
                        >
                          {copiedEmail ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedEmail ? 'Copied' : 'Copy email'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
