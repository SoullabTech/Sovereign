'use client';

/**
 * BirthDataStep — Onboarding wrapper for birth data collection
 *
 * Wraps BirthDataForm with:
 *   - Skip affordance (sovereignty: not required)
 *   - Fire-and-forget save to PUT /api/members/profile
 *   - Graceful degradation if save fails (onboarding continues)
 *
 * Birth data activates personalised astrology in MAIA conversations.
 * Members who skip can add it later from account settings.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BirthDataForm } from '@/components/astrology/BirthDataForm';
import { apiFetch } from '@/lib/http/apiBase';

interface BirthDataStepProps {
  userName?: string;
  onComplete: () => void;
}

export function BirthDataStep({ userName = 'Explorer', onComplete }: BirthDataStepProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function saveBirthData(data: {
    date: string;
    time: string;
    location: { name: string; lat: number; lng: number; timezone: string };
  }) {
    setSaving(true);
    setSaveError(null);

    try {
      const betaUser = localStorage.getItem('beta_user');
      const memberId = betaUser ? JSON.parse(betaUser)?.id : null;

      if (!memberId || memberId.startsWith('local_')) {
        console.warn('[BirthDataStep] No valid member ID — skipping server save');
        setSaved(true);
        setTimeout(onComplete, 800);
        return;
      }

      const res = await apiFetch('/api/members/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-member-id': memberId },
        body: JSON.stringify({
          birthData: {
            date: data.date,
            time: data.time,
            location: {
              lat: data.location.lat,
              lng: data.location.lng,
              name: data.location.name,
              timezone: data.location.timezone,
            },
          },
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      console.log('[BirthDataStep] Birth data saved for member', memberId);
      setSaved(true);
      setTimeout(onComplete, 800);
    } catch (err: any) {
      console.error('[BirthDataStep] Save failed:', err.message);
      // Non-fatal: show error, let them retry or skip
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'radial-gradient(ellipse at top, #1a0e06 0%, #0c0905 60%, #000 100%)' }}>

      {/* Intro copy — above the form */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6 max-w-lg"
      >
        <h2 className="text-xl font-serif mb-2" style={{ fontWeight: 300, color: '#D88A2D' }}>
          Your cosmic map
        </h2>
        <p className="text-sm italic" style={{ fontWeight: 300, color: '#a07040' }}>
          Birth data lets MAIA speak to your natal chart and transits. Optional — you can add it anytime.
        </p>
      </motion.div>

      {/* The form */}
      {!saved && (
        <div className="w-full max-w-2xl">
          <BirthDataForm
            onSubmit={saveBirthData}
            loading={saving}
          />
        </div>
      )}

      {/* Saved confirmation */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12"
        >
          <div className="text-4xl mb-4">✨</div>
          <p className="font-serif text-lg" style={{ fontWeight: 300, color: '#D88A2D' }}>
            Your cosmic blueprint is recorded.
          </p>
        </motion.div>
      )}

      {/* Save error — retry-focused, form values are preserved */}
      {saveError && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 px-4 py-3 border text-sm text-center max-w-md mx-auto"
          style={{ borderColor: '#7f1d1d', background: 'rgba(127,29,29,0.15)', color: '#fca5a5' }}
        >
          <span className="block mb-1">Couldn't save — your entries are still here.</span>
          <span className="block text-xs opacity-75">
            Scroll up and try submitting again, or skip and add birth data later in settings.
          </span>
        </motion.div>
      )}

      {/* Skip link — sovereignty first; becomes more prominent after a save error */}
      {!saved && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: saveError ? 1 : 0.7 }}
          transition={{ delay: saveError ? 0 : 1.2, duration: 0.5 }}
          onClick={onComplete}
          className="mt-6 text-sm underline-offset-4 hover:underline transition-opacity"
          style={{
            fontWeight: 300,
            color: saveError ? '#9a6030' : '#6b4020',
          }}
        >
          {saveError ? 'Skip and add later in settings' : 'Skip for now'}
        </motion.button>
      )}
    </div>
  );
}
