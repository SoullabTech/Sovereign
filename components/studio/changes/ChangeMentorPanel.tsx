'use client';

/**
 * ChangeMentorPanel — Mentor Reflection for Change Navigation
 *
 * Template reflections (instant, posture-based) + optional AI depth.
 * Mirrors MentorPanel from decisions but for changes.
 * Includes sovereignty check, micro-practice, follow-up intention.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Save, Check, Leaf, MessageCircle } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { getChangeMentorTemplateForChange } from '@/lib/studio/changes/mentorTemplates';
import MentorChat from '@/components/studio/changes/MentorChat';
import type { ConsultationResult } from '@/lib/ain/types';
import type { ChangeMentorReflection } from '@/lib/studio/changes/types';

interface ChangeMentorPanelProps {
  changeId: string;
  council: ConsultationResult | null;
  changeType: string | null;
  urgency: string | null;
  emotionalState: string | null;
  hexagramNumber: number | null;
  mentorReflection: ChangeMentorReflection | null;
  followUpIntention: string | null;
  onReflectionGenerated: (reflection: ChangeMentorReflection) => void;
  onIntentionSaved: (intention: string) => void;
}

const POSTURE_LABELS: Record<string, string> = {
  frozen: 'Frozen',
  resisting: 'Resisting',
  overwhelmed: 'Overwhelmed',
  grieving: 'Grieving',
  grasping: 'Grasping',
  surrendered: 'Surrendered',
  emerging: 'Emerging',
};

export default function ChangeMentorPanel({
  changeId,
  council,
  changeType,
  urgency,
  emotionalState,
  hexagramNumber,
  mentorReflection,
  followUpIntention,
  onReflectionGenerated,
  onIntentionSaved,
}: ChangeMentorPanelProps) {
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [intention, setIntention] = useState(followUpIntention || '');
  const [savingIntention, setSavingIntention] = useState(false);
  const [intentionSaved, setIntentionSaved] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  if (!council) return null;

  const { template, posture } = getChangeMentorTemplateForChange(council, {
    changeType,
    urgency: urgency as any,
    emotionalState,
  });

  async function generateReflection() {
    setGenerating(true);
    setGenError(null);
    try {
      const res = await apiFetch(`/api/studio/changes/${changeId}/mentor`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        onReflectionGenerated(data.mentorReflection);
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        setGenError(err.error || 'Mentor reflection failed');
      }
    } catch {
      setGenError('Could not reach MAIA');
    } finally {
      setGenerating(false);
    }
  }

  async function saveIntention() {
    if (!intention.trim()) return;
    setSavingIntention(true);
    try {
      await apiFetch(`/api/studio/changes/${changeId}`, {
        method: 'PUT',
        body: JSON.stringify({ followUpIntention: intention.trim() }),
      });
      onIntentionSaved(intention.trim());
      setIntentionSaved(true);
      setTimeout(() => setIntentionSaved(false), 2000);
    } finally {
      setSavingIntention(false);
    }
  }

  async function saveInsightFromChat(text: string) {
    // Save the mentor's insight as follow-up intention
    setIntention(text.slice(0, 500));
    try {
      await apiFetch(`/api/studio/changes/${changeId}`, {
        method: 'PUT',
        body: JSON.stringify({ followUpIntention: text.slice(0, 500).trim() }),
      });
      onIntentionSaved(text.slice(0, 500).trim());
    } catch {
      // Silently fail — the local state is already updated
    }
  }

  return (
    <div className="rounded-xl border border-jade-sage/30 bg-gradient-to-br from-jade-shadow/40 via-jade-night/30 to-jade-dusk/40 overflow-hidden">
      {/* Jade accent bar */}
      <div className="h-1 bg-gradient-to-r from-jade-forest via-jade-malachite to-jade-forest" />

      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 bg-jade-sage/20 rounded-full" />
            <div className="absolute top-1 left-1 bottom-1 right-1 bg-jade-malachite/40 rounded-full" />
            <div className="absolute top-1.5 left-1.5 bottom-1.5 right-1.5 bg-jade-jade rounded-full" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-jade-jade tracking-wide">MAIA Mentor</h3>
            <p className="text-xs text-jade-mineral">
              Posture detected: <span className="text-jade-sage capitalize">{POSTURE_LABELS[posture] || posture}</span>
            </p>
          </div>
        </div>

        {/* Template Reflections (always visible) */}
        <div className="space-y-3">
          <p className="text-xs text-jade-mineral uppercase tracking-wider">Reflections</p>
          {template.reflections.map((reflection, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 bg-jade-forest/60 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-jade-sage/90 font-light leading-relaxed">{reflection}</p>
            </div>
          ))}
        </div>

        {/* Micro-practice */}
        <div className="bg-jade-forest/10 border border-jade-sage/20 rounded-lg p-3">
          <p className="text-xs text-jade-copper uppercase tracking-wider mb-1.5">Micro-Practice</p>
          <p className="text-sm text-jade-sage font-light leading-relaxed">{template.microPractice}</p>
        </div>

        {/* Sovereignty Check */}
        <div className="bg-jade-forest/10 border border-jade-sage/20 rounded-lg p-3">
          <p className="text-xs text-amber-400/80 uppercase tracking-wider mb-1.5">Sovereignty Check</p>
          <p className="text-sm text-jade-sage font-light leading-relaxed italic">{template.sovereigntyCheck}</p>
        </div>

        {/* Follow-up Intention */}
        <div>
          <label className="block text-xs text-jade-mineral uppercase tracking-wider mb-1.5">
            Follow-up Intention
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={intention}
              onChange={e => setIntention(e.target.value)}
              placeholder="What will you check in on? What will you watch for?"
              className="flex-1 px-3 py-1.5 text-sm bg-jade-shadow/60 border border-jade-sage/20 rounded-lg text-jade-sage placeholder-jade-mineral/50 focus:border-jade-malachite/50 focus:outline-none"
            />
            <button
              onClick={saveIntention}
              disabled={savingIntention || !intention.trim()}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors disabled:opacity-40 ${
                intentionSaved
                  ? 'bg-emerald-800/40 text-emerald-300 border border-emerald-700/40'
                  : 'bg-jade-forest/20 text-jade-sage border border-jade-sage/20 hover:border-jade-malachite/40'
              }`}
            >
              {intentionSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-jade-sage/30 to-transparent" />
        </div>

        {/* AI Reflection (opt-in) */}
        {mentorReflection ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-jade-malachite" />
              <p className="text-xs text-jade-malachite uppercase tracking-wider">Deeper Reflection</p>
            </div>

            {/* AI Questions */}
            <div className="space-y-2">
              {mentorReflection.questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-jade-malachite text-xs mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-jade-sage font-light leading-relaxed">{q}</p>
                </div>
              ))}
            </div>

            {/* Hexagram Wisdom */}
            {mentorReflection.hexagramWisdom && (
              <div className="bg-jade-forest/10 border border-jade-malachite/20 rounded-lg p-3">
                <p className="text-xs text-purple-400/80 uppercase tracking-wider mb-1">Hexagram Wisdom</p>
                <p className="text-sm text-jade-sage font-light italic">{mentorReflection.hexagramWisdom}</p>
              </div>
            )}

            {/* AI Sovereignty Check */}
            <div className="bg-jade-forest/10 border border-jade-malachite/20 rounded-lg p-3">
              <p className="text-xs text-amber-400/80 uppercase tracking-wider mb-1">Agency Check</p>
              <p className="text-sm text-jade-sage font-light italic">{mentorReflection.sovereigntyCheck}</p>
            </div>

            {/* AI Next Experiment */}
            <div className="bg-jade-forest/10 border border-jade-malachite/20 rounded-lg p-3">
              <p className="text-xs text-jade-copper uppercase tracking-wider mb-1">Next Experiment</p>
              <p className="text-sm text-jade-sage font-light">{mentorReflection.nextExperiment}</p>
            </div>

            {/* Regenerate */}
            <button
              onClick={generateReflection}
              disabled={generating}
              className="text-xs text-jade-mineral hover:text-jade-sage transition-colors flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </motion.div>
        ) : (
          <div>
            <button
              onClick={generateReflection}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-jade-forest/20 hover:bg-jade-forest/30 border border-jade-sage/20 hover:border-jade-malachite/40 text-jade-sage text-sm font-light rounded-lg transition-all disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  MAIA is reflecting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-jade-malachite" />
                  Go deeper with MAIA
                </>
              )}
            </button>
            {genError && (
              <p className="text-xs text-red-400 mt-1.5">{genError}</p>
            )}
          </div>
        )}

        {/* Talk to MAIA Mentor */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-jade-sage/30 to-transparent" />
        </div>

        <AnimatePresence mode="wait">
          {chatOpen ? (
            <MentorChat
              key="mentor-chat"
              changeId={changeId}
              onSaveInsight={saveInsightFromChat}
              onClose={() => setChatOpen(false)}
            />
          ) : (
            <motion.button
              key="mentor-chat-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-jade-forest/15 hover:bg-jade-forest/25 border border-jade-malachite/20 hover:border-jade-malachite/40 text-jade-sage text-sm font-light rounded-lg transition-all"
            >
              <MessageCircle className="w-4 h-4 text-jade-malachite" />
              Talk to MAIA Mentor
            </motion.button>
          )}
        </AnimatePresence>

        {/* Footer */}
        <p className="text-xs text-jade-mineral/50 text-center font-light">
          Sovereignty first. Take only what serves.
        </p>
      </div>
    </div>
  );
}
