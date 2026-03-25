'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Member {
  id: string;
  username: string;
  name: string;
  preferredName?: string;
  onboarded: boolean;
}

interface QRLoginDisplayProps {
  onSuccess: (member: Member) => void;
  onClose: () => void;
}

/**
 * QR Login Display Component
 * Placeholder for QR-based cross-device authentication
 */
export function QRLoginDisplay({ onSuccess, onClose }: QRLoginDisplayProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    // Stub - would normally generate and poll a QR session
    const timer = setTimeout(() => {
      setStatus('ready');
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-maia-navy-850 border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-serif text-maia-ink-100 text-center mb-4">
          QR Login
        </h2>

        <div className="aspect-square bg-white/10 rounded-xl flex items-center justify-center mb-4">
          {status === 'loading' && (
            <div className="w-8 h-8 border-2 border-maia-spice-400 border-t-transparent rounded-full animate-spin" />
          )}
          {status === 'ready' && (
            <p className="text-maia-ink-60 text-sm text-center px-4">
              QR login coming soon
            </p>
          )}
          {status === 'error' && (
            <p className="text-red-400 text-sm">Failed to generate QR code</p>
          )}
        </div>

        <p className="text-sm text-maia-ink-60 text-center mb-6">
          Scan with your phone to sign in on this device
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl border border-white/15 text-maia-ink-80 hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}
