/**
 * Biometric Enrollment Step
 *
 * Dedicated UI component for Face ID / Touch ID enrollment during signup.
 * Makes biometric setup a prominent, dedicated step rather than a silent attempt.
 */
'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Fingerprint, Sparkles, X } from 'lucide-react';
import { biometricAuth } from '@/lib/auth/biometricAuth';

interface BiometricEnrollmentStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

type EnrollmentStatus = 'idle' | 'enrolling' | 'success' | 'error';

/**
 * Map technical error codes to user-friendly messages
 */
function getErrorMessage(error: string, code?: string): string {
  // Handle specific error codes
  if (code === 'CREDENTIAL_EXISTS') {
    return 'You already have biometric login set up on this device.';
  }
  if (code === 'USER_CANCELLED' || code === 'BIOMETRY_FAILED') {
    return 'Setup was cancelled. Tap to try again when ready.';
  }
  if (code === 'NOT_SUPPORTED') {
    return 'Biometric authentication is not available on this device.';
  }
  if (code === 'UNKNOWN' || code === 'UNKNOWN_ERROR') {
    return 'Something went wrong. You can set this up later in Settings.';
  }

  // Generic fallback
  if (error.toLowerCase().includes('cancel')) {
    return 'Setup was cancelled. Tap to try again when ready.';
  }
  if (error.toLowerCase().includes('not allowed')) {
    return 'Permission was denied. Check your browser or device settings.';
  }

  return 'Setup didn\'t complete. You can try again or skip for now.';
}

export function BiometricEnrollmentStep({
  onComplete,
  onSkip,
}: BiometricEnrollmentStepProps) {
  const [status, setStatus] = useState<EnrollmentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const biometricLabel = useMemo(() => biometricAuth.getBiometricName(), []);

  const handleEnroll = async () => {
    setStatus('enrolling');
    setErrorMessage('');

    try {
      const result = await biometricAuth.register();

      if (result.success) {
        setStatus('success');
        // Brief pause to show success, then continue
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        setStatus('error');
        setErrorMessage(getErrorMessage(result.error || 'Unknown error', result.code));
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(getErrorMessage(
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-teal-900 mb-2">
          Enable {biometricLabel}
        </h2>
        <p className="text-sm text-teal-800/70">
          Sign in with just a glance or touch
        </p>
      </div>

      {/* Icon */}
      <motion.div
        className="flex justify-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
          {status === 'success' ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
            >
              <Sparkles className="w-12 h-12 text-emerald-600" />
            </motion.div>
          ) : status === 'error' ? (
            <X className="w-12 h-12 text-red-500" />
          ) : (
            <Fingerprint className="w-12 h-12 text-teal-700" />
          )}
        </div>
      </motion.div>

      {/* Benefits */}
      {status === 'idle' && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start gap-3 text-sm">
            <Shield className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-teal-900">Phishing-resistant</span>
              <p className="text-teal-700/70 text-xs mt-0.5">
                Works only on genuine Soullab — can't be faked
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Sparkles className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-teal-900">One-tap sign in</span>
              <p className="text-teal-700/70 text-xs mt-0.5">
                No passwords to remember or type
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success state */}
      {status === 'success' && (
        <motion.div
          className="text-center py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-emerald-700 font-medium">
            {biometricLabel} enabled!
          </p>
          <p className="text-sm text-emerald-600/70 mt-1">
            You can now sign in with one tap
          </p>
        </motion.div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <motion.div
          className="text-center py-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-red-700 text-sm mb-3">{errorMessage}</p>
        </motion.div>
      )}

      {/* Enrolling state */}
      {status === 'enrolling' && (
        <motion.div
          className="text-center py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-teal-700 font-medium">Setting up {biometricLabel}...</p>
          <p className="text-sm text-teal-600/70 mt-1">Follow the prompts on your device</p>
        </motion.div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {status === 'idle' && (
          <>
            <motion.button
              onClick={handleEnroll}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full rounded-2xl bg-teal-700 hover:bg-teal-600 text-white px-4 py-4 font-medium transition-all shadow-lg"
            >
              Enable {biometricLabel}
            </motion.button>
            <button
              onClick={onSkip}
              className="w-full text-sm text-teal-700/60 hover:text-teal-800 py-2"
            >
              Maybe later
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.button
              onClick={handleRetry}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full rounded-xl bg-teal-600 hover:bg-teal-500 text-white px-4 py-3 font-medium transition-all"
            >
              Try again
            </motion.button>
            <button
              onClick={onSkip}
              className="w-full text-sm text-teal-700/60 hover:text-teal-800 py-2"
            >
              Skip for now
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default BiometricEnrollmentStep;
