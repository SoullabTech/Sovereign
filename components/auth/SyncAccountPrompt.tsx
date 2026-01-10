'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Check } from 'lucide-react';
import { betaConfig, validatePassword, validateEmail } from '@/lib/auth/betaConfig';

/**
 * SyncAccountPrompt
 *
 * Shows a gentle prompt to users who have local data but no server account,
 * allowing them to create a username/password for cross-device access.
 */

interface SyncAccountPromptProps {
  onAccountCreated?: (memberId: string) => void;
}

export function SyncAccountPrompt({ onAccountCreated }: SyncAccountPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [explorerId, setExplorerId] = useState<string | null>(null);
  const [explorerName, setExplorerName] = useState<string>('');

  useEffect(() => {
    // Check if user needs account sync prompt
    const checkSyncStatus = () => {
      if (typeof window === 'undefined') return;

      // Get current explorer ID
      const currentExplorerId = localStorage.getItem('explorerId');
      if (!currentExplorerId) return;

      // Check if they already have a proper account
      const betaUser = localStorage.getItem('beta_user');
      if (betaUser) {
        try {
          const userData = JSON.parse(betaUser);
          // If they have a proper member account (with username), don't show prompt
          if (userData.username && userData.id === currentExplorerId) {
            return;
          }
        } catch (e) {
          // Continue to show prompt
        }
      }

      // Check if they've dismissed this prompt before
      const dismissed = localStorage.getItem('sync_prompt_dismissed');
      if (dismissed) {
        const dismissedTime = parseInt(dismissed);
        // Show again after 7 days
        if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
          return;
        }
      }

      // Check if they have any meaningful data (at least used the app a bit)
      const sessionVersion = localStorage.getItem('maia_session_version');
      if (!sessionVersion) {
        // First time user, don't show yet
        return;
      }

      // Show the prompt
      setExplorerId(currentExplorerId);
      setExplorerName(localStorage.getItem('explorerName') || localStorage.getItem('explorerPreferredName') || '');

      // Delay showing to not interrupt initial experience
      setTimeout(() => setShowPrompt(true), 3000);
    };

    checkSyncStatus();
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('sync_prompt_dismissed', Date.now().toString());
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Use betaConfig for validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || 'Invalid password');
      return;
    }

    const emailValidation = validateEmail(email || undefined);
    if (!emailValidation.valid) {
      setError(emailValidation.error || 'Invalid email');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/members/register-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.toLowerCase().trim(),
          password,
          email: email.trim() || undefined,
          name: explorerName || username,
          explorerId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update localStorage with new account info
        const user = {
          id: data.member.id,
          username: data.member.username,
          name: data.member.name,
          preferredName: data.member.name,
          onboarded: true,
        };

        localStorage.setItem('beta_user', JSON.stringify(user));
        localStorage.setItem('explorerId', data.member.id);
        localStorage.setItem('explorerName', data.member.name);
        localStorage.setItem('explorerPreferredName', data.member.name);
        localStorage.setItem('maia_session_version', '2');
        localStorage.removeItem('sync_prompt_dismissed');

        setIsComplete(true);
        onAccountCreated?.(data.member.id);

        // Close after showing success
        setTimeout(() => {
          setShowModal(false);
          setShowPrompt(false);
        }, 2000);
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (err) {
      console.error('Account creation error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Subtle banner prompt */}
      <AnimatePresence>
        {!showModal && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-full px-4"
          >
            <div
              className="rounded-xl p-4 shadow-lg border flex items-center gap-3"
              style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(251, 191, 36, 0.1))',
                borderColor: 'rgba(251, 191, 36, 0.3)',
              }}
            >
              <Smartphone className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-teal-900 font-medium">
                  Access MAIA from any device
                </p>
                <p className="text-xs text-teal-700/70 mt-0.5">
                  Create a username to sync your conversations
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleDismiss}
                  className="text-xs text-teal-600/60 hover:text-teal-600 px-2 py-1"
                >
                  Later
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-xs bg-amber-500/80 hover:bg-amber-500 text-white px-3 py-1 rounded-lg transition-colors"
                >
                  Set up
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for account creation */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={() => !isLoading && !isComplete && setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl p-6 max-w-sm w-full shadow-2xl border"
              style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95))',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {isComplete ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-light text-teal-900 mb-2">You're all set!</h2>
                  <p className="text-teal-700/70 text-sm">
                    Sign in with <span className="font-medium">{username}</span> on any device.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <Smartphone className="w-6 h-6 text-amber-600" />
                    <h2 className="text-lg font-light text-teal-900">
                      Access from any device
                    </h2>
                  </div>

                  <p className="text-teal-700/70 text-sm mb-5">
                    Create a username and password to sign in on other devices and keep your conversations synced.
                  </p>

                  <form onSubmit={handleCreateAccount} className="space-y-4">
                    <div>
                      <label htmlFor="sync-username" className="block text-sm font-light text-teal-800 mb-1.5">
                        Username
                      </label>
                      <input
                        type="text"
                        id="sync-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/60 border border-teal-200/50 text-teal-900 placeholder-teal-600/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm"
                        placeholder="Choose a username"
                        required
                        autoComplete="username"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="sync-email" className="block text-sm font-light text-teal-800 mb-1.5">
                        Email {!betaConfig.requireEmail && <span className="text-teal-600/50">(optional)</span>}
                      </label>
                      <input
                        type="email"
                        id="sync-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/60 border border-teal-200/50 text-teal-900 placeholder-teal-600/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm"
                        placeholder="For account recovery"
                        required={betaConfig.requireEmail}
                        autoComplete="email"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="sync-password" className="block text-sm font-light text-teal-800 mb-1.5">
                        Password
                      </label>
                      <input
                        type="password"
                        id="sync-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/60 border border-teal-200/50 text-teal-900 placeholder-teal-600/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm"
                        placeholder="Create a password"
                        required
                        autoComplete="new-password"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="sync-confirm" className="block text-sm font-light text-teal-800 mb-1.5">
                        Confirm password
                      </label>
                      <input
                        type="password"
                        id="sync-confirm"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/60 border border-teal-200/50 text-teal-900 placeholder-teal-600/40 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm"
                        placeholder="Confirm your password"
                        required
                        autoComplete="new-password"
                        disabled={isLoading}
                      />
                    </div>

                    {error && (
                      <div className="text-red-700/80 text-sm bg-red-100/30 rounded-lg p-2.5 border border-red-200/40">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || !username.trim() || !password}
                      className="w-full py-2.5 rounded-xl font-medium bg-amber-500/80 hover:bg-amber-500 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isLoading ? 'Creating...' : 'Create Account'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      disabled={isLoading}
                      className="w-full py-2 text-teal-700/60 text-sm hover:text-teal-700 transition-colors"
                    >
                      Maybe later
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
