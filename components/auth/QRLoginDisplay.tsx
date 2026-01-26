'use client';

/**
 * QR Login Display Component
 *
 * Shows a QR code for cross-device login.
 * Polls for approval status and auto-consumes when approved.
 *
 * Usage:
 * <QRLoginDisplay onSuccess={(member) => router.push('/maia')} />
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Smartphone, CheckCircle } from 'lucide-react';
import { apiUrl } from '@/lib/http/apiBase';
import {
  QR_STATUS_POLL_INTERVAL_MS,
  formatRemainingTime
} from '@/lib/qr/qrLoginService';

interface QRLoginDisplayProps {
  onSuccess: (member: {
    id: string;
    username: string;
    name: string;
    preferredName: string;
    onboarded: boolean;
  }) => void;
  onClose?: () => void;
}

type QRState = 'loading' | 'ready' | 'polling' | 'approved' | 'expired' | 'error';

export function QRLoginDisplay({ onSuccess, onClose }: QRLoginDisplayProps) {
  const [state, setState] = useState<QRState>('loading');
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Create a new QR request
  const createRequest = useCallback(async () => {
    setState('loading');
    setError(null);

    try {
      const response = await fetch(apiUrl('/api/auth/qr/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create QR code');
      }

      const data = await response.json();
      setQrPayload(data.qrPayload);
      setRequestId(data.requestId);
      setExpiresAt(new Date(data.expiresAt));
      setState('ready');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create QR code');
      setState('error');
    }
  }, []);

  // Poll for status
  const pollStatus = useCallback(async () => {
    if (!requestId) return;

    try {
      const response = await fetch(apiUrl(`/api/auth/qr/status?requestId=${requestId}`), {
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.code === 'NOT_FOUND') {
          setState('expired');
          return;
        }
        throw new Error(data.error || 'Failed to check status');
      }

      const data = await response.json();

      if (data.status === 'approved') {
        setState('approved');
        // Consume the approval
        await consumeApproval();
      } else if (data.status === 'expired') {
        setState('expired');
      }
      // 'pending' - keep polling

    } catch (err) {
      console.error('[QRLogin] Poll error:', err);
      // Don't show error for poll failures, just keep trying
    }
  }, [requestId]);

  // Consume the approval and get session
  const consumeApproval = async () => {
    if (!requestId) return;

    try {
      const response = await fetch(apiUrl('/api/auth/qr/consume'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ requestId })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to complete login');
      }

      const data = await response.json();

      if (data.success && data.member) {
        onSuccess(data.member);
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete login');
      setState('error');
    }
  };

  // Update countdown timer
  const updateCountdown = useCallback(() => {
    if (!expiresAt) return;

    const now = new Date();
    if (now >= expiresAt) {
      setState('expired');
      setRemainingTime('Expired');
      return;
    }

    setRemainingTime(formatRemainingTime(expiresAt));
  }, [expiresAt]);

  // Initialize on mount
  useEffect(() => {
    createRequest();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [createRequest]);

  // Start polling when ready
  useEffect(() => {
    if (state === 'ready' && requestId) {
      setState('polling');

      // Start polling
      pollIntervalRef.current = setInterval(pollStatus, QR_STATUS_POLL_INTERVAL_MS);

      // Start countdown
      updateCountdown();
      countdownIntervalRef.current = setInterval(updateCountdown, 1000);
    }

    return () => {
      if (state !== 'ready') {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      }
    };
  }, [state, requestId, pollStatus, updateCountdown]);

  // Cleanup on unmount or state change
  useEffect(() => {
    if (state === 'approved' || state === 'expired' || state === 'error') {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }
  }, [state]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative rounded-2xl p-6 max-w-sm w-full shadow-2xl bg-white/95 border border-white/30"
      >
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-teal-600" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-teal-900">
            {state === 'approved' ? 'Login Approved!' : 'Scan to Sign In'}
          </h2>
          {state !== 'approved' && state !== 'expired' && state !== 'error' && (
            <p className="text-sm text-teal-700/70 mt-1">
              Use your phone to scan this QR code
            </p>
          )}
        </div>

        {/* QR Code */}
        <AnimatePresence mode="wait">
          {(state === 'loading') && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="aspect-square flex items-center justify-center bg-gray-50 rounded-xl"
            >
              <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
            </motion.div>
          )}

          {(state === 'ready' || state === 'polling') && qrPayload && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="aspect-square p-4 bg-white rounded-xl border border-gray-100"
            >
              <QRCode
                value={qrPayload}
                size={200}
                level="M"
                className="w-full h-full"
              />
            </motion.div>
          )}

          {state === 'approved' && (
            <motion.div
              key="approved"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square flex flex-col items-center justify-center bg-emerald-50 rounded-xl"
            >
              <CheckCircle className="w-16 h-16 text-emerald-500 mb-3" />
              <p className="text-emerald-800 font-medium">Signing you in...</p>
            </motion.div>
          )}

          {state === 'expired' && (
            <motion.div
              key="expired"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square flex flex-col items-center justify-center bg-amber-50 rounded-xl"
            >
              <p className="text-amber-800 mb-4">QR code expired</p>
              <button
                onClick={createRequest}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Get new code
              </button>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square flex flex-col items-center justify-center bg-red-50 rounded-xl p-4"
            >
              <p className="text-red-800 text-center mb-4">{error}</p>
              <button
                onClick={createRequest}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Countdown */}
        {(state === 'polling' || state === 'ready') && remainingTime && (
          <div className="mt-4 text-center">
            <span className="text-sm text-teal-600/70">
              Expires in {remainingTime}
            </span>
          </div>
        )}

        {/* Instructions */}
        {(state === 'polling' || state === 'ready') && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <ol className="text-xs text-gray-600 space-y-1">
              <li>1. Open MAIA on your phone (must be signed in)</li>
              <li>2. Scan this QR code with your camera</li>
              <li>3. Confirm with Face ID or Touch ID</li>
            </ol>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
