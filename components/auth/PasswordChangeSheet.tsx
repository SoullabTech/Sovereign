'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Lock, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

type PasswordChangeSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName?: string;
};

export default function PasswordChangeSheet({
  isOpen,
  onClose,
  memberId,
  memberName = 'Friend'
}: PasswordChangeSheetProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordsMatch = newPassword === confirmPassword;
  const isValid = newPassword.length >= 6 && passwordsMatch;

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // apiFetch (not bare fetch) — the route now derives the member from the
      // verified session, so the request must carry the session credential.
      const response = await apiFetch('/api/members/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          newPassword
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update password');
      }

      setSubmitted(true);

      // Close after showing success
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-[#1a1a2e] to-black border-t border-amber-500/30 rounded-t-2xl z-[9999] p-4 pb-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-amber-500/40 rounded-full mx-auto mb-4" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-800/50 hover:bg-stone-700/50 transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5 text-stone-400" />
            </button>

            <div className="max-w-md mx-auto">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-green-400 mb-2">
                    Password Updated
                  </h3>
                  <p className="text-stone-400">
                    Your new password is now active.
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-amber-400" />
                    </div>
                    <h2 className="text-xl font-medium text-[#D4B896] mb-2">
                      Welcome back, {memberName}
                    </h2>
                    <p className="text-stone-400 text-sm leading-relaxed">
                      As we expand MAIA to new platforms including iOS and Android apps,
                      we're strengthening our security infrastructure.
                    </p>
                    <p className="text-amber-400/80 text-sm mt-2">
                      Please set a personal password to continue.
                    </p>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    {/* New Password */}
                    <div>
                      <label className="block text-sm text-stone-400 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/50 rounded-xl text-[#D4B896] placeholder:text-stone-500 focus:outline-none focus:border-amber-500/50 pr-12"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {newPassword.length > 0 && newPassword.length < 6 && (
                        <p className="text-xs text-amber-400 mt-1">
                          Password must be at least 6 characters
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm text-stone-400 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full px-4 py-3 bg-stone-800/50 border border-stone-700/50 rounded-xl text-[#D4B896] placeholder:text-stone-500 focus:outline-none focus:border-amber-500/50"
                        disabled={isSubmitting}
                      />
                      {confirmPassword.length > 0 && !passwordsMatch && (
                        <p className="text-xs text-red-400 mt-1">
                          Passwords do not match
                        </p>
                      )}
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={!isValid || isSubmitting}
                      className={`w-full py-3 rounded-xl font-medium transition-all ${
                        isValid && !isSubmitting
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500'
                          : 'bg-stone-700/50 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full"
                          />
                          Updating...
                        </span>
                      ) : (
                        'Set Password'
                      )}
                    </button>

                    {/* Beta Note */}
                    <p className="text-center text-xs text-stone-500 mt-4">
                      Thank you for being part of our beta testing community.
                      Your patience helps us build something meaningful.
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
