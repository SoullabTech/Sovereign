'use client';

/**
 * Optional birth data and astrology consent.
 * The verified member profile is the source of truth on every mount.
 * Browser storage is only a cache of a confirmed server result; it never skips
 * verification or turns an unsuccessful save into completed onboarding.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BirthDataForm } from '@/components/astrology/BirthDataForm';
import { apiFetch } from '@/lib/http/apiBase';

type Phase = 'checking' | 'choice' | 'form' | 'saved';
type AstrologyConsent = 'unknown' | 'opted_in' | 'declined';

interface BirthDataStepProps {
  userName?: string;
  onComplete: () => void;
}

function storeAstrologyConsent(consent: 'opted_in' | 'declined', memberId: string) {
  try {
    const raw = localStorage.getItem('beta_user');
    if (!raw) return true;
    const user = JSON.parse(raw);
    // A changed member cache is a reason to refuse a late completion, never
    // authority to choose the server-side member.
    if (typeof user.id === 'string' && !user.id.startsWith('local_') && user.id !== memberId) return false;
    if (user.id !== memberId) return true;
    user.astrologyConsent = consent;
    localStorage.setItem('beta_user', JSON.stringify(user));
    return true;
  } catch {
    // A cache failure does not undo a confirmed server save.
    return true;
  }
}

class ProfileConsentError extends Error {}

function cacheConfirmedConsent(consent: 'opted_in' | 'declined', memberId: string) {
  if (!storeAstrologyConsent(consent, memberId)) {
    throw new ProfileConsentError('Your sign-in changed. Please try your choice again.');
  }
}

async function readProfileResponse(options: RequestInit): Promise<unknown> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async () => {
        const response = await apiFetch('/api/members/profile', {
          ...options,
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new ProfileConsentError(response.status === 401
            ? 'Please sign in again to save your preference.'
            : 'We could not save your preference. Please try again.');
        }
        return response.json();
      })(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          controller.abort();
          reject(new ProfileConsentError('We could not confirm your preference. Please try again.'));
        }, 30_000);
      }),
    ]);
  } finally {
    if (timeout !== undefined) clearTimeout(timeout);
  }
}

async function saveProfileConsent(
  consent: 'opted_in' | 'declined',
  birthData?: Record<string, unknown>,
): Promise<string> {
  const result = await readProfileResponse({
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ astrologyConsent: consent, ...(birthData ? { birthData } : {}) }),
  });
  const body = result as { success?: unknown; profile?: { id?: unknown; astrology_consent?: unknown } } | null;
  if (body?.success !== true || typeof body.profile?.id !== 'string' || !body.profile.id ||
      body.profile.astrology_consent !== consent) {
    throw new ProfileConsentError('We could not confirm your preference. Please try again.');
  }
  return body.profile.id;
}

export function BirthDataStep({ userName = 'Explorer', onComplete }: BirthDataStepProps) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const savingRef = useRef(false);
  const mountedRef = useRef(false);
  const completeRef = useRef(onComplete);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { completeRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    let active = true;
    mountedRef.current = true;
    // Always read the verified profile, including when a legacy local cache
    // says declined/opted_in. Earlier local-only saves are not durable proof.
    readProfileResponse({ method: 'GET' })
      .then((result) => {
        if (!active) return;
        const profile = result as { id?: unknown; astrologyConsent?: unknown } | null;
        if (typeof profile?.id !== 'string' || !profile.id ||
            (typeof profile.astrologyConsent !== 'string' ||
             !['unknown', 'opted_in', 'declined'].includes(profile.astrologyConsent))) {
          throw new Error('Profile response was not confirmed');
        }
        const consent = profile.astrologyConsent as AstrologyConsent;
        if (consent === 'opted_in' || consent === 'declined') {
          cacheConfirmedConsent(consent, profile.id);
          completeRef.current();
        } else {
          setPhase('choice');
        }
      })
      .catch(() => {
        if (!active) return;
        setSaveError('We could not check your saved preference. Please try your choice again.');
        setPhase('choice');
      });
    return () => {
      active = false;
      mountedRef.current = false;
      if (completionTimer.current !== null) clearTimeout(completionTimer.current);
    };
  }, []);

  async function handleDecline() {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      const memberId = await saveProfileConsent('declined');
      if (!mountedRef.current) return;
      cacheConfirmedConsent('declined', memberId);
      completeRef.current();
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof ProfileConsentError
        ? error.message : 'We could not save your preference. Please try again.');
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  }

  async function saveBirthData(data: {
    date: string;
    time: string;
    location: { name: string; lat: number; lng: number; timezone: string };
  }) {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      const memberId = await saveProfileConsent('opted_in', {
        date: data.date,
        time: data.time,
        location: {
          lat: data.location.lat,
          lng: data.location.lng,
          name: data.location.name,
          timezone: data.location.timezone,
        },
      });
      if (!mountedRef.current) return;
      cacheConfirmedConsent('opted_in', memberId);
      setPhase('saved');
      completionTimer.current = setTimeout(() => {
        if (mountedRef.current) completeRef.current();
      }, 900);
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof ProfileConsentError
        ? error.message : 'We could not save your preference. Please try again.');
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  }

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: 'radial-gradient(ellipse at top, #1a0e06 0%, #0c0905 60%, #000 100%)' }}
    >
      <AnimatePresence mode="wait">

        {/* ── Checking (mount consent verification) ──────────────────────── */}
        {phase === 'checking' && (
          <motion.div
            key="checking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-8 h-8"
            aria-hidden="true"
          >
            {/* Invisible placeholder — no spinner, no flash of content */}
          </motion.div>
        )}

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

            {saveError && (
              <p role="alert" className="mb-4 text-sm" style={{ color: '#fca5a5' }}>
                {saveError}
              </p>
            )}
            {saving && <p role="status" className="mb-4 text-sm">Saving your preference…</p>}

            {/* Equal-weight options — no visual hierarchy between them */}
            <div className="flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => { setSaveError(null); setPhase('form'); }}
                disabled={saving}
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
                disabled={saving}
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
                role="alert"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 px-4 py-3 border text-sm text-center w-full max-w-md"
                style={{
                  borderColor: '#7f1d1d',
                  background: 'rgba(127,29,29,0.15)',
                  color: '#fca5a5',
                }}
              >
                <span className="block mb-1">{saveError}</span>
                <span className="block text-xs opacity-75">
                  Your entries are still here. Try again, or choose to continue without birth data.
                </span>
              </motion.div>
            )}

            {/* Skip — becomes more prominent after a save error */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: saveError ? 1 : 0.55 }}
              transition={{ delay: saveError ? 0 : 1.0, duration: 0.4 }}
              onClick={handleDecline}
              disabled={saving}
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
