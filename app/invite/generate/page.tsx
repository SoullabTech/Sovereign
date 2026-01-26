'use client';

/**
 * Invite Generation Page
 *
 * Allows authenticated users to create and share invite QR codes.
 * Perfect for practitioners to invite clients.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Gift, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Holoflower } from '@/components/ui/Holoflower';
import { InviteQRCode } from '@/components/auth/InviteQRCode';
import { apiUrl, getValidMemberId } from '@/lib/http/apiBase';
import { Capacitor } from '@capacitor/core';
import type { InviteQrData } from '@/lib/qr/inviteQrService';

type PageState = 'form' | 'loading' | 'success' | 'error';

export default function InviteGeneratePage() {
  const router = useRouter();

  const [state, setState] = useState<PageState>('form');
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<InviteQrData | null>(null);

  // Form fields
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');

  // Check authentication
  useEffect(() => {
    const memberId = getValidMemberId();
    if (!memberId) {
      router.push('/signin?next=/invite/generate');
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!recipientName.trim()) {
      setError('Please enter the recipient\'s name');
      return;
    }

    if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!personalMessage.trim() || personalMessage.trim().length < 10) {
      setError('Please share why you\'re inviting them — it helps them understand why you thought of them');
      return;
    }

    setError(null);
    setState('loading');

    try {
      const memberId = getValidMemberId();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };

      if (Capacitor.isNativePlatform() && memberId) {
        headers['x-member-id'] = memberId;
      }

      const response = await fetch(apiUrl('/api/invites/generate'), {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          recipientEmail: recipientEmail.trim().toLowerCase(),
          blessingText: personalMessage.trim()
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate invite');
      }

      const data = await response.json();

      if (data.success && data.invite) {
        setQrData(data.invite);
        setState('success');
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate invite');
      setState('error');
    }
  }

  function handleReset() {
    setRecipientName('');
    setRecipientEmail('');
    setPersonalMessage('');
    setQrData(null);
    setError(null);
    setState('form');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-md mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-teal-800/70 hover:text-teal-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
      </div>

      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8 flex flex-col items-center"
      >
        <h1 className="text-4xl font-extralight text-teal-900/70 tracking-[0.12em] mb-3">
          Soullab
        </h1>
        <div className="w-20 h-20">
          <Holoflower size="lg" glowIntensity="medium" animate={true} />
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 max-w-md w-full"
        style={{
          background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.25))',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
        }}
      >
        {/* Form State */}
        {state === 'form' && (
          <>
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-teal-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-teal-900">Invite Someone</h2>
              <p className="text-sm text-teal-700/70 mt-1">
                Create a personal QR code invite
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-100/40 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-teal-800 mb-1">
                  Recipient&apos;s Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g., Sarah"
                  className="w-full rounded-xl bg-white/50 border border-teal-200/40 px-4 py-3 text-teal-900 placeholder:text-teal-600/50 outline-none focus:border-teal-400/60 focus:bg-white/60 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-teal-800 mb-1">
                  Recipient&apos;s Email
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="w-full rounded-xl bg-white/50 border border-teal-200/40 px-4 py-3 text-teal-900 placeholder:text-teal-600/50 outline-none focus:border-teal-400/60 focus:bg-white/60 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-teal-800 mb-1">
                  Why are you inviting them?
                </label>
                <textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Share why you thought of them..."
                  rows={3}
                  className="w-full rounded-xl bg-white/50 border border-teal-200/40 px-4 py-3 text-teal-900 placeholder:text-teal-600/50 outline-none focus:border-teal-400/60 focus:bg-white/60 transition-all resize-none"
                />
                <p className="text-xs text-teal-600/60 mt-1">This will be shown to them when they receive your invitation.</p>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-teal-600 hover:bg-teal-500 text-white px-4 py-3 font-medium transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <Gift className="w-5 h-5" />
                Generate Invite
              </button>
            </form>
          </>
        )}

        {/* Loading State */}
        {state === 'loading' && (
          <div className="py-12 flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-4" />
            <p className="text-teal-700">Creating invite...</p>
          </div>
        )}

        {/* Success State */}
        {state === 'success' && qrData && (
          <div className="py-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-teal-900">Invite Created!</h2>
              <p className="text-sm text-teal-700/70 mt-1">
                Share this QR code with {qrData.recipientName || 'your guest'}
              </p>
            </div>

            <InviteQRCode
              url={qrData.url}
              passkey={qrData.passkey}
              recipientName={qrData.recipientName}
              gifterName={qrData.gifterName}
              size="lg"
              showControls={true}
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 rounded-xl border border-teal-300/40 bg-white/30 px-4 py-2.5 text-teal-800 font-medium hover:bg-white/50 transition-colors"
              >
                Create Another
              </button>

              <button
                onClick={() => router.push('/maia')}
                className="flex-1 rounded-xl bg-teal-600 px-4 py-2.5 text-white font-medium hover:bg-teal-500 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">!</span>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-teal-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-red-600 mb-6">{error}</p>

            <button
              onClick={handleReset}
              className="rounded-xl bg-teal-600 px-6 py-2.5 text-white font-medium hover:bg-teal-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </motion.div>

      {/* Help Text */}
      <p className="mt-6 text-center text-sm text-teal-800/60 max-w-sm">
        The recipient will receive a unique passkey that lets them start their Soullab journey.
      </p>
    </div>
  );
}
