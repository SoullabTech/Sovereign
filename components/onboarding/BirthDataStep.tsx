'use client';

/**
 * BirthDataStep — Onboarding opt-in for birth data / astrology
 *
 * Sovereignty design:
 *   Genuine choice screen before any form appears. Both options carry equal
 *   visual weight. The form only appears after explicit opt-in.
 *
 *   Not everyone uses or believes in astrology. MAIA does not assume it is
 *   desirable. When the user declines, that preference is stored and the step
 *   is skipped on any future onboarding run.
 *
 * Consent states (stored in beta_user.astrologyConsent):
 *   'unknown'  → show choice screen (default for new members)
 *   'opted_in' → skip directly to next step
 *   'declined' → skip directly to next step
 *
 * TODO: persist astrologyConsent in members table (column: astrology_consent)
 *       so it survives localStorage clears and cross-device sign-ins.
 *
 * Flow:
 *   unknown  → choice → (opted_in) → form → save → complete
 *                      → (declined) → complete immediately
 *   opted_in → complete immediately (step skipped)
 *   declined → complete immediately (step skipped)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BirthDataForm } from '@/components/astrology/BirthDataForm';
import { apiFetch } from '@/lib/http/apiBase';

type Phase = 'choice' | 'form' | 'saved';
type AstrologyConsent = 'unknown' | 'opted_in' | 'declined';

interface BirthDataStepProps {
  userName?: string;
  onComplete: () => void;
}

function readAstrologyConsent(): AstrologyConsent {
  try {
    const raw = localStorage.getItem('beta_user');
    if (!raw) return 'unknown';
    const user = JSON.parse(raw);
    return (user.astrologyConsent as AstrologyConsent) ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

function storeAstrologyConsent(consent: 'opted_in' | 'declined') {
  try {
    const raw = localStorage.getItem('beta_user');
    if (!raw) return;
    const user = JSON.parse(raw);
    user.astrologyConsent = consent;
    localStorage.setItem('beta_user', JSON.stringify(user));
  } catch {
    // Non-fatal
  }
}

export function BirthDataStep({ userName = 'Explorer', onComplete }: BirthDataStepProps) {
  const [phase, setPhase] = useState<Phase>('choice');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Skip step entirely if consent is already known
  useEffect(() => {
    const consent = readAstrologyConsent();
    if (consent !== 'unknown') {
      onComplete();
    }
  }, [onComplete]);

  function handleDecline() {
    storeAstrologyConsent('declined');
    onComplete();
  }

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
        storeAstrologyConsent('opted_in');
        setPhase('saved');
        setTimeout(onComplete, 900);
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
      storeAstrologyConsent('opted_in');
      setPhase('saved');
      setTimeout(onComplete, 900);
    } catch (err: any) {
      console.error('[BirthDataStep] Save failed:', err.message);
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'radial-gradient(ellipse at top, #1a0e06 0%, #0c0905 60%, #000 100%)' }}
    >
      <AnimatePresence mode="wait">

        {/* ── Choice screen ────────────────────────────────────────────── */}
        {phase === 'choice' && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6 }}
            className="max-w-md w-full text-center"
          >
            <h2
              className="text-2xl font-serif mb-4"
              style={{ fontWeight: 300, color: '#D88A2D' }}
            >
              Personalisation (optional)
            </h2>

            <p
              className="text-sm mb-3 leading-relaxed"
              style={{ fontWeight: 300, color: '#a07040' }}
            >
              You can add your birth date, time, and location if you want MAIA
              to include astrological context in your experience. You can still
              use everything without it.
            </p>

            <p
              className="text-xs mb-3 italic"
              style={{ fontWeight: 300, color: '#7a5535' }}
            >
              Some people use astrology as symbolic language for reflection.
              Others prefer not to. Either choice is fine.
            </p>

            <p
              className="text-xs mb-8"
              style={{ fontWeight: 300, color: '#5a3f25' }}
            >
              This information is stored in your profile and can be edited or
              removed anytime in Settings.
            </p>

            {/* Equal-weight options — no visual hierarchy between them */}
            <div className="flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setPhase('form')}
                className="w-full py-4 border font-serif text-base transition-all duration-200"
                style={{
                  fontWeight: 300,
                  color: '#fed7aa',
                  borderColor: '#7a5535',
                  background: 'rgba(122,85,53,0.15)',
                }}
              >
                Add birth data
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleDecline}
                className="w-full py-4 border font-serif text-base transition-all duration-200"
                style={{
                  fontWeight: 300,
                  color: '#fed7aa',
                  borderColor: '#7a5535',
                  background: 'rgba(122,85,53,0.15)',
                }}
              >
                Continue without birth data
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Form (only shown after opt-in) ───────────────────────────── */}
        {phase === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl flex flex-col items-center"
          >
            {/* Neutral header overrides BirthDataForm's persuasive defaults */}
            <BirthDataForm
              onSubmit={saveBirthData}
              loading={saving}
              title="Birth data (optional)"
              subtitle="Used only to add astrological context. You can change or remove this anytime."
            />

            {/* Save error — retry-focused; values preserved in BirthDataForm state */}
            {saveError && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 px-4 py-3 border text-sm text-center w-full max-w-md"
                style={{
                  borderColor: '#7f1d1d',
                  background: 'rgba(127,29,29,0.15)',
                  color: '#fca5a5',
                }}
              >
                <span className="block mb-1">Couldn't save — your entries are still here.</span>
                <span className="block text-xs opacity-75">
                  Try submitting again, or continue without birth data and add it later in Settings.
                </span>
              </motion.div>
            )}

            {/* Skip — becomes more prominent after a save error */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: saveError ? 1 : 0.55 }}
              transition={{ delay: saveError ? 0 : 1.0, duration: 0.4 }}
              onClick={handleDecline}
              className="mt-5 text-sm transition-opacity"
              style={{ fontWeight: 300, color: saveError ? '#9a6030' : '#6b4020' }}
            >
              {saveError ? 'Continue without birth data' : 'Skip and continue'}
            </motion.button>
          </motion.div>
        )}

        {/* ── Saved confirmation ────────────────────────────────────────── */}
        {phase === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="text-4xl mb-4">✨</div>
            <p className="font-serif text-lg" style={{ fontWeight: 300, color: '#D88A2D' }}>
              Birth data recorded.
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
