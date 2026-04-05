'use client';

/**
 * ParentUpdateDrawer — slide-over panel for generating and sending parent updates
 *
 * Flow:
 * 1. Auto-generates brief draft on open (if no saved draft)
 * 2. Practitioner edits blocks
 * 3. Practitioner selects recipient + confirms consent
 * 4. Send (requires human edit + consent)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  ChevronDown,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ParentUpdateBlocks {
  whatWeWorkedOn: string;
  whatINoticed: string;
  whatMayHelpThisWeek: string;
  whatToWatchFor: string | null;
}

type Tone = 'brief' | 'standard' | 'detailed';
type DrawerPhase = 'generating' | 'editing' | 'sending' | 'sent' | 'error';

interface ParentUpdateDrawerProps {
  sessionId: string;
  clientName: string | null;
  clientId?: string;
  isOpen: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ParentUpdateDrawer({
  sessionId,
  clientName,
  clientId,
  isOpen,
  onClose,
}: ParentUpdateDrawerProps) {
  const [phase, setPhase] = useState<DrawerPhase>('generating');
  const [blocks, setBlocks] = useState<ParentUpdateBlocks | null>(null);
  const [artifactId, setArtifactId] = useState<string | null>(null);
  const [tone, setTone] = useState<Tone>('brief');
  const [error, setError] = useState<string | null>(null);

  // Recipient
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');

  // Consent + edit tracking
  const [humanEdited, setHumanEdited] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  // Meta
  const [meta, setMeta] = useState<{ turnCount?: number; durationMinutes?: number } | null>(null);
  const hasGenerated = useRef(false);

  // Auto-generate on open
  useEffect(() => {
    if (isOpen && !hasGenerated.current) {
      hasGenerated.current = true;
      generateDraft(tone);
    }
  }, [isOpen]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      hasGenerated.current = false;
    }
  }, [isOpen]);

  const generateDraft = useCallback(async (selectedTone: Tone) => {
    setPhase('generating');
    setError(null);

    try {
      const resp = await apiFetch('/api/studio/session-followup/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          clientName: clientName || 'Client',
          clientId: clientId || null,
          tone: selectedTone,
        }),
      });

      const data = await resp.json();

      if (!data.ok) {
        setError(data.error || 'Failed to generate draft');
        setPhase('error');
        return;
      }

      setBlocks(data.artifact.blocks);
      setArtifactId(data.artifact.id);
      setMeta(data.artifact.meta);
      setHumanEdited(false);
      setPhase('editing');
    } catch (err) {
      console.error('[ParentUpdateDrawer] generate failed:', err);
      setError('Connection error. Please try again.');
      setPhase('error');
    }
  }, [sessionId, clientName, clientId]);

  const handleBlockChange = (key: keyof ParentUpdateBlocks, value: string) => {
    if (!blocks) return;
    setBlocks({ ...blocks, [key]: value || null });
    setHumanEdited(true);
  };

  const handleToneChange = (newTone: Tone) => {
    if (newTone === tone) return;
    if (humanEdited && !window.confirm('Changing tone will regenerate the draft. Your edits will be lost. Continue?')) {
      return;
    }
    setTone(newTone);
    generateDraft(newTone);
  };

  const handleSend = async () => {
    if (!blocks || !artifactId || !recipientEmail || !humanEdited || !consentConfirmed) return;

    setPhase('sending');
    setError(null);

    try {
      const resp = await apiFetch('/api/studio/session-followup/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artifactId,
          sessionId,
          clientId: clientId || null,
          recipientEmail,
          recipientName: recipientName || recipientEmail,
          practitionerName: 'Practitioner', // TODO: get from session/profile
          clientName: clientName || 'Client',
          draft: blocks,
          humanEdited: true as const,
          consentConfirmed: true as const,
          sendVia: 'email',
        }),
      });

      const data = await resp.json();

      if (!data.ok) {
        setError(data.error || 'Failed to send');
        setPhase('editing');
        return;
      }

      setPhase('sent');
    } catch (err) {
      console.error('[ParentUpdateDrawer] send failed:', err);
      setError('Connection error. Please try again.');
      setPhase('editing');
    }
  };

  const canSend = !!blocks && humanEdited && consentConfirmed && !!recipientEmail;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-full max-w-lg bg-[#12122a] border-l border-slate-800 h-full overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/50 sticky top-0 bg-[#12122a] z-10">
            <div>
              <h2 className="text-sm font-medium text-white">Send Parent Update</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {clientName || 'Client'} {meta?.durationMinutes ? `· ${meta.durationMinutes}m session` : ''}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Tone selector */}
            <div className="flex gap-2">
              {(['brief', 'standard', 'detailed'] as Tone[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleToneChange(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                    tone === t
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800/50 text-slate-500 border border-slate-700/30 hover:text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Generating state */}
            {phase === 'generating' && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mb-3" />
                <p className="text-sm text-slate-400">Preparing update...</p>
                <p className="text-xs text-slate-600 mt-1">Reading session content</p>
              </div>
            )}

            {/* Error state */}
            {phase === 'error' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-300 mb-3">{error}</p>
                <button
                  onClick={() => generateDraft(tone)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg hover:text-white transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Editing state */}
            {(phase === 'editing' || phase === 'sending') && blocks && (
              <>
                {/* Editable blocks */}
                <div className="space-y-4">
                  <EditableBlock
                    label="What we worked on"
                    value={blocks.whatWeWorkedOn}
                    onChange={(v) => handleBlockChange('whatWeWorkedOn', v)}
                    disabled={phase === 'sending'}
                  />
                  <EditableBlock
                    label="What I noticed"
                    value={blocks.whatINoticed}
                    onChange={(v) => handleBlockChange('whatINoticed', v)}
                    disabled={phase === 'sending'}
                  />
                  <EditableBlock
                    label="What may help this week"
                    value={blocks.whatMayHelpThisWeek}
                    onChange={(v) => handleBlockChange('whatMayHelpThisWeek', v)}
                    disabled={phase === 'sending'}
                  />
                  <EditableBlock
                    label="What to watch for"
                    value={blocks.whatToWatchFor ?? ''}
                    onChange={(v) => handleBlockChange('whatToWatchFor', v)}
                    optional
                    disabled={phase === 'sending'}
                  />
                </div>

                {/* Regenerate */}
                <button
                  onClick={() => generateDraft(tone)}
                  disabled={phase === 'sending'}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </button>

                {/* Recipient */}
                <div className="border-t border-slate-800/50 pt-4 space-y-3">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Recipient</p>
                  <input
                    type="text"
                    placeholder="Name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                    disabled={phase === 'sending'}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                    disabled={phase === 'sending'}
                  />
                </div>

                {/* Consent checkbox */}
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentConfirmed}
                    onChange={(e) => setConsentConfirmed(e.target.checked)}
                    className="mt-0.5 accent-emerald-500"
                    disabled={phase === 'sending'}
                  />
                  <span className="text-xs text-slate-400">
                    I confirm the recipient has consented to receive session updates.
                  </span>
                </label>

                {/* Edit indicator */}
                {!humanEdited && (
                  <p className="text-xs text-amber-500/80 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    Review and edit before sending
                  </p>
                )}

                {/* Error banner */}
                {error && phase === 'editing' && (
                  <p className="text-xs text-red-400">{error}</p>
                )}

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={!canSend || phase === 'sending'}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    canSend && phase !== 'sending'
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-slate-800/50 border border-slate-700/30 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {phase === 'sending' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Update
                    </>
                  )}
                </button>
              </>
            )}

            {/* Sent state */}
            {phase === 'sent' && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mb-3" />
                <p className="text-sm text-white mb-1">Update sent</p>
                <p className="text-xs text-slate-500 mb-4">
                  Delivered to {recipientName || recipientEmail}
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg hover:text-white transition-colors"
                >
                  Return to session
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Editable block sub-component
// ---------------------------------------------------------------------------

function EditableBlock({
  label,
  value,
  onChange,
  optional,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  optional?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-1.5">
        {label}
        {optional && <span className="text-slate-600">(optional)</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={3}
        className="w-full bg-slate-800/30 border border-slate-700/30 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-emerald-500/40 disabled:opacity-50"
      />
    </div>
  );
}
