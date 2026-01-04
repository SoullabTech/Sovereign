'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const calendar = searchParams.get('calendar');
    const error = searchParams.get('error');

    if (calendar === 'connected') {
      setStatus('success');
      setMessage('Google account connected successfully!');

      // Redirect to /maia after showing success
      setTimeout(() => {
        router.push('/maia?openSettings=true');
      }, 2000);
    } else if (error) {
      setStatus('error');
      setMessage(error === 'auth_failed'
        ? 'Failed to connect Google account. Please try again.'
        : `Connection error: ${error}`
      );

      // Redirect to /maia after showing error
      setTimeout(() => {
        router.push('/maia?openSettings=true');
      }, 3000);
    } else {
      // No special params, just redirect to maia with settings open
      router.push('/maia?openSettings=true');
    }
  }, [searchParams, router]);

  return (
    <motion.div
      className="text-center p-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {status === 'loading' && (
        <>
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-amber-200/80">Processing...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-xl font-medium text-emerald-300 mb-2">Connected!</h1>
          <p className="text-amber-200/60">{message}</p>
          <p className="text-amber-200/40 text-sm mt-4">Redirecting to MAIA...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-xl font-medium text-red-300 mb-2">Connection Failed</h1>
          <p className="text-amber-200/60">{message}</p>
          <p className="text-amber-200/40 text-sm mt-4">Redirecting...</p>
        </>
      )}
    </motion.div>
  );
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] flex items-center justify-center">
      <Suspense fallback={
        <div className="text-center p-8">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-amber-200/80">Loading...</p>
        </div>
      }>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
