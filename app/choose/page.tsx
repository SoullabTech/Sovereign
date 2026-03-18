'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Compass, Briefcase, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { apiFetch } from '@/lib/http/apiBase';
import { getLocalMemberId } from '@/lib/auth/getLocalMemberId';

/**
 * /choose — Post-onboarding fork
 *
 * After completing onboarding, members choose their orientation:
 *   "For Me"          → personal mode → Field (decisions, changes, vault, MAIA)
 *   "For My Practice" → practice mode → Studio create flow (practitioner setup)
 *
 * If the member already has a studio_mode set (returning user), redirect immediately.
 */
export default function ChoosePage() {
  const router = useRouter();
  const [choosing, setChoosing] = useState<'personal' | 'practice' | null>(null);
  const [checking, setChecking] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Get user name for greeting
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const userData = JSON.parse(betaUser);
        setUserName(userData.name || userData.username || '');

        // If not onboarded yet, redirect back to onboarding
        if (!userData.onboarded) {
          setChecking(false);
          router.replace('/onboarding');
          return;
        }
      } catch {
        // continue
      }
    }

    // Check if member already has a practitioner record
    const memberId = getLocalMemberId();
    if (!memberId) {
      setChecking(false);
      router.replace('/signin');
      return;
    }

    async function checkExisting() {
      try {
        const res = await apiFetch('/api/studio/whoami');
        if (res.ok) {
          const data = await res.json();
          if (data.isPractitioner) {
            // Already has a practitioner record — go to studio
            const mode = data.identity?.studioMode ?? 'practice';
            if (mode === 'personal') {
              router.replace('/studio/field');
            } else {
              router.replace('/studio');
            }
            return;
          }
        }
      } catch {
        // Not a practitioner yet — show the choice
      } finally {
        setChecking(false);
      }
    }

    checkExisting();
  }, [router]);

  async function handleChoice(choice: 'personal' | 'practice') {
    setChoosing(choice);

    if (choice === 'personal') {
      try {
        // Create personal practitioner adapter + set mode
        const res = await apiFetch('/api/studio/personal/enter', {
          method: 'POST',
        });

        if (res.ok) {
          router.push('/studio/field');
        } else {
          console.error('[Choose] Failed to enter personal mode');
          setChoosing(null);
        }
      } catch (err) {
        console.error('[Choose] Error:', err);
        setChoosing(null);
      }
    } else {
      // Practice mode — go to studio create flow
      router.push('/studio/create');
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0b0f1c] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1c] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="w-12 h-12 mx-auto mb-4">
          <Image
            src="/logo_flower 2.png"
            alt="Soullab"
            width={48}
            height={48}
            className="w-full h-full object-contain"
          />
        </div>
        {userName && (
          <p className="text-slate-500 text-sm text-center">
            Welcome, <span className="text-slate-300">{userName}</span>
          </p>
        )}
      </motion.div>

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="text-center mb-12 max-w-lg"
      >
        <h1 className="text-3xl sm:text-4xl font-light text-white mb-3">
          How will you use Studio?
        </h1>
        <p className="text-slate-500 text-sm">
          You can always switch later in Settings.
        </p>
      </motion.div>

      {/* Choice cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
        {/* Personal / Field */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onClick={() => handleChoice('personal')}
          disabled={choosing !== null}
          className={`
            flex-1 group relative rounded-2xl border p-8 text-left transition-all duration-300
            ${choosing === 'personal'
              ? 'border-amber-500/50 bg-amber-500/10'
              : choosing === 'practice'
                ? 'border-slate-800/50 bg-slate-900/30 opacity-50'
                : 'border-slate-700/50 bg-slate-900/50 hover:border-amber-500/30 hover:bg-amber-500/[0.04]'}
          `}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Compass className="w-6 h-6 text-amber-400" />
            </div>
            {choosing === 'personal' && (
              <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
            )}
          </div>

          <h2 className="text-xl font-medium text-white mb-2">For Me</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Personal Field — daily reflection, decision tracking, and your private studio.
            MAIA as your sovereign companion.
          </p>
          <p className="text-slate-500 text-xs mb-6">No clients, no scheduling — just you and what matters.</p>

          <div className="flex items-center gap-2 text-amber-400/70 text-sm">
            <span>Decisions, Changes, Vault, MAIA</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>

        {/* Practice / Operations */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onClick={() => handleChoice('practice')}
          disabled={choosing !== null}
          className={`
            flex-1 group relative rounded-2xl border p-8 text-left transition-all duration-300
            ${choosing === 'practice'
              ? 'border-blue-500/50 bg-blue-500/10'
              : choosing === 'personal'
                ? 'border-slate-800/50 bg-slate-900/30 opacity-50'
                : 'border-slate-700/50 bg-slate-900/50 hover:border-blue-500/30 hover:bg-blue-500/[0.04]'}
          `}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-400" />
            </div>
            {choosing === 'practice' && (
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            )}
          </div>

          <h2 className="text-xl font-medium text-white mb-2">For My Practice</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Practitioner portal — clients, sessions, scheduling, and operations.
            The full studio for running your practice.
          </p>
          <p className="text-slate-500 text-xs mb-6">Caseload, calendar, comms, marketing — the works.</p>

          <div className="flex items-center gap-2 text-blue-400/70 text-sm">
            <span>Clients, Sessions, Calendar, Caseload</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>
      </div>

      {/* Skip link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-10"
      >
        <button
          onClick={() => router.push('/maia')}
          className="text-slate-600 hover:text-slate-400 text-sm transition-colors"
        >
          Skip for now — go to MAIA
        </button>
      </motion.div>
    </div>
  );
}
