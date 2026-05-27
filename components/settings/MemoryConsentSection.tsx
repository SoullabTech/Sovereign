'use client';

/**
 * MemoryConsentSection — member-facing right-to-abstain surface for memory layers.
 *
 * Renders consent toggles for each memory layer's recall surface. Currently
 * exposes conversational recall (Phase 2). Future layers (episodic,
 * developmental, somatic) attach here as additional toggles without UI churn.
 *
 * Authority chain:
 *   - Wires to /api/members/recall-preferences (the consent endpoint;
 *     same allowlist of keys lives there as single source of truth)
 *   - Disclosure copy is the verbatim language directed by Kelly 2026-05-26
 *     — do not paraphrase without an explicit copy review
 *   - Constitutional inheritance: this is the "culturally defended" half of
 *     the four-condition abstention survival (memory:
 *     project_constitutional_defense_mechanisms). The toggle being
 *     discoverable + the disclosure being honest is what completes the
 *     fourth wall of the four-part requirement.
 *
 * What this component does NOT do:
 *   - Does NOT delete prior conversations (only suppresses recall surfacing)
 *   - Does NOT modify loader behavior (loader gate already lives in
 *     lib/maia/memoryLoaders.ts:getConversationalRecallEnabled)
 *   - Does NOT change suppression ordering (first-branch opt-out gate
 *     already in lib/maia/conversationalRecallBlock.ts)
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History } from 'lucide-react';
import { apiUrl } from '@/lib/http/apiBase';

type RecallPreferences = {
  conversational_recall_enabled: boolean;
};

export function MemoryConsentSection() {
  const [preferences, setPreferences] = useState<RecallPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl('/api/members/recall-preferences'), {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Failed to load preferences (${res.status})`);
        const data = (await res.json()) as RecallPreferences;
        if (!cancelled) {
          setPreferences(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleConversationalRecall = async () => {
    if (!preferences || saving) return;
    const next = !preferences.conversational_recall_enabled;
    // Optimistic update — reverts on PATCH failure below.
    setPreferences({ ...preferences, conversational_recall_enabled: next });
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(apiUrl('/api/members/recall-preferences'), {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversational_recall_enabled: next }),
      });
      if (!res.ok) throw new Error(`Failed to save (${res.status})`);
      const data = (await res.json()) as RecallPreferences;
      setPreferences(data);
    } catch (e) {
      // Revert optimistic update
      setPreferences((prev) =>
        prev ? { ...prev, conversational_recall_enabled: !next } : prev,
      );
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Memory &amp; Consent</h2>
        <p className="text-sm text-stone-400 mt-1">
          Control how MAIA may bring forward what it has recorded about your past sessions.
        </p>
      </div>

      {loading && (
        <div className="text-sm text-stone-400">Loading preferences…</div>
      )}

      {error && (
        <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          {error}
        </div>
      )}

      {preferences && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5 shrink-0">
                <History size={18} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-sm font-medium text-white">Conversational recall</div>
                <p className="text-sm text-stone-400">
                  Conversational recall lets MAIA bring forward prior exchanges when they may help the current conversation.
                </p>
                <p className="text-sm text-stone-400">
                  Turning this off means MAIA will not include prior exchanges in prompts, though your past conversations may still exist in your account history.
                </p>
                <p className="text-xs text-stone-500">
                  You can turn this back on anytime.
                </p>
              </div>
            </div>
            <button
              onClick={toggleConversationalRecall}
              disabled={saving}
              role="switch"
              aria-checked={preferences.conversational_recall_enabled}
              aria-label="Toggle conversational recall"
              className={`shrink-0 w-11 h-6 rounded-full p-0.5 transition-all duration-150
                active:scale-95 active:ring-2 active:ring-amber-400/50 disabled:opacity-50 ${
                  preferences.conversational_recall_enabled
                    ? 'bg-amber-500 active:bg-amber-400'
                    : 'bg-white/20 active:bg-white/30'
                }`}
            >
              <motion.div
                className="w-5 h-5 rounded-full bg-white shadow-md"
                animate={{ x: preferences.conversational_recall_enabled ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
