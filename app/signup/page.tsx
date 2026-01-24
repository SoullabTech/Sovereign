/**
 * 2-Step Signup Page
 *
 * Step 1: Create account + add passkey
 * Step 2: Quick personalization (skippable)
 */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Holoflower } from '@/components/ui/Holoflower';
import { biometricAuth } from '@/lib/auth/biometricAuth';
import { deviceTrust } from '@/lib/auth/deviceTrust';
import { betaSession } from '@/lib/auth/betaSession';
import { apiUrl } from '@/lib/http/apiBase';
import { Capacitor } from '@capacitor/core';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioPlatformAvailable, setBioPlatformAvailable] = useState(false);

  // Step 1: Account creation
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Personalization
  const [preferredName, setPreferredName] = useState('');
  const [createdMember, setCreatedMember] = useState<{ id: string; onboarded: boolean } | null>(null);

  const biometricLabel = useMemo(() => biometricAuth.getBiometricName(), []);

  // Check biometric availability
  useEffect(() => {
    (async () => {
      const avail = await biometricAuth.getAvailability();
      setBioAvailable(avail.available);
      setBioPlatformAvailable(avail.platformAvailable);
    })();
  }, []);

  // Check if already authenticated
  useEffect(() => {
    const sessionState = betaSession.restoreSession();
    if (sessionState.isAuthenticated && sessionState.user) {
      router.replace('/maia');
    }
  }, [router]);

  // Store session helper
  function storeSession(user: { id: string; username: string; name: string; preferredName?: string; onboarded: boolean }) {
    const displayName = user.preferredName || user.name || 'Friend';
    localStorage.setItem('beta_user', JSON.stringify(user));
    localStorage.setItem('explorerId', user.id);
    localStorage.setItem('explorerName', displayName);
    localStorage.setItem('explorerPreferredName', displayName);
    localStorage.setItem('betaOnboardingComplete', user.onboarded ? 'true' : 'false');
    localStorage.setItem('maia_session_version', '2');
    localStorage.setItem('signup_completed', 'true');
  }

  // Trust device helper
  async function trustThisDevice() {
    try {
      await deviceTrust.trustDevice(undefined, 'standard');
    } catch {
      // non-blocking
    }
  }

  // Native OAuth handlers for Capacitor iOS
  const handleGoogleNative = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const { GoogleAuth } = await import('@southdevs/capacitor-google-auth');
        await GoogleAuth.initialize({
          clientId: process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
        const result = await GoogleAuth.signIn({ scopes: ['profile', 'email'] });
        const idToken = result.authentication?.idToken;

        if (!idToken) {
          throw new Error('Missing Google idToken');
        }

        const res = await fetch(apiUrl('/api/auth/google/native-callback'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            idToken,
            email: result.email,
            name: result.name,
            imageUrl: result.imageUrl,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Google sign-up failed');
        }

        if (data.member) {
          storeSession(data.member);
          await trustThisDevice();

          // Try to add passkey after OAuth signup
          if (bioAvailable && bioPlatformAvailable) {
            try {
              await biometricAuth.register();
            } catch {
              // Non-blocking - passkey registration is optional
            }
          }

          setCreatedMember(data.member);
          setStep(2);
        }
        return;
      }

      window.location.href = '/api/auth/google/list';
    } catch (e) {
      setError('Google sign-up failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const handleAppleNative = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
        const result = await SignInWithApple.authorize({
          clientId: 'life.soullab.maia',
          scopes: 'email name',
          redirectURI: '',
        });

        const identityToken = result?.response?.identityToken;
        if (!identityToken) {
          throw new Error('Missing Apple identityToken');
        }

        const res = await fetch(apiUrl('/api/auth/apple/native-callback'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            identityToken,
            authorizationCode: result.response?.authorizationCode,
            email: result.response?.email,
            givenName: result.response?.givenName,
            familyName: result.response?.familyName,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Apple sign-up failed');
        }

        if (data.member) {
          storeSession(data.member);
          await trustThisDevice();

          // Try to add passkey after OAuth signup
          if (bioAvailable && bioPlatformAvailable) {
            try {
              await biometricAuth.register();
            } catch {
              // Non-blocking
            }
          }

          setCreatedMember(data.member);
          setStep(2);
        }
        return;
      }

      window.location.href = '/api/auth/apple/list';
    } catch (e) {
      setError('Apple sign-up failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  // Create account with password, then add passkey
  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1) Create account via register endpoint
      const response = await fetch(apiUrl('/api/members/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: username.toLowerCase(),
          password,
          name,
          email: email.toLowerCase(),
          preferredName: name,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || 'Signup failed');
        setIsLoading(false);
        return;
      }

      // Store session
      storeSession({
        id: data.member.id,
        username: data.member.username,
        name: data.member.name || name,
        preferredName: data.member.preferredName || name,
        onboarded: data.member.onboarded || false,
      });

      // 2) Trust device
      await trustThisDevice();

      // 3) Try to add passkey (now we have a session cookie)
      if (bioAvailable && bioPlatformAvailable) {
        try {
          await biometricAuth.register();
        } catch (passkeyError) {
          console.log('[Signup] Passkey registration optional:', passkeyError);
          // Non-blocking - passkey is optional
        }
      }

      // Move to personalization step
      setCreatedMember({
        id: data.member.id,
        onboarded: data.member.onboarded || false,
      });
      setPreferredName(name);
      setStep(2);

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  }

  // Save personalization and continue
  async function handleSavePersonalization() {
    if (!createdMember) {
      router.push('/maia');
      return;
    }

    setIsLoading(true);

    try {
      // Update preferred name if changed
      if (preferredName && preferredName !== name) {
        await fetch(apiUrl('/api/members/progress'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            memberId: createdMember.id,
            preferredName,
          }),
        });

        // Update local storage
        localStorage.setItem('explorerName', preferredName);
        localStorage.setItem('explorerPreferredName', preferredName);
      }

      // Navigate to appropriate destination
      if (createdMember.onboarded) {
        router.push('/maia');
      } else {
        router.push('/begin');
      }
    } catch {
      // Non-blocking, just continue
      router.push(createdMember.onboarded ? '/maia' : '/begin');
    }
  }

  // Skip personalization
  function handleSkip() {
    if (createdMember?.onboarded) {
      router.push('/maia');
    } else {
      router.push('/begin');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-4 py-8">
      {/* Sacred Holoflower */}
      <div className="mb-4 z-10 relative w-full flex justify-center">
        <div className="w-28 h-28 flex items-center justify-center">
          <Holoflower size="md" glowIntensity="low" animate={true} />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-xs text-teal-700/60 tracking-wider">MAIA • SOVEREIGN</div>
        <h1 className="text-2xl font-semibold text-teal-900 tracking-tight mt-1">Create your account</h1>
        <p className="text-sm text-teal-800/70 mt-1">
          Step {step} of 2 {step === 2 && '— Personalization is skippable'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-4">
        <div className={`w-12 h-1 rounded-full ${step >= 1 ? 'bg-teal-600' : 'bg-teal-300/40'}`} />
        <div className={`w-12 h-1 rounded-full ${step >= 2 ? 'bg-teal-600' : 'bg-teal-300/40'}`} />
      </div>

      {/* Main Card */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl p-6 border max-w-md w-full shadow-xl"
        style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.12))',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-100/40 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {step === 1 ? (
          <>
            {/* OAuth Options */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={handleGoogleNative}
                className="px-4 py-3 rounded-xl text-sm font-medium transition-all hover:shadow-md bg-white/70 hover:bg-white/90 border border-gray-200/60 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-gray-700">Google</span>
              </button>

              <button
                type="button"
                onClick={handleAppleNative}
                className="px-4 py-3 rounded-xl text-sm font-medium transition-all hover:shadow-md bg-black/90 hover:bg-black border border-gray-800 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className="text-white">Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-teal-300/40" />
              <span className="text-xs text-teal-600/60">or create with email</span>
              <div className="flex-1 h-px bg-teal-300/40" />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div>
                <label className="block text-xs text-teal-700/80 mb-1">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="w-full rounded-xl bg-white/40 border border-teal-200/40 px-3 py-2.5 text-sm text-teal-900 placeholder:text-teal-600/50 outline-none focus:border-teal-400/60"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs text-teal-700/80 mb-1">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full rounded-xl bg-white/40 border border-teal-200/40 px-3 py-2.5 text-sm text-teal-900 placeholder:text-teal-600/50 outline-none focus:border-teal-400/60"
                  placeholder="yourname"
                />
              </div>

              <div>
                <label className="block text-xs text-teal-700/80 mb-1">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl bg-white/40 border border-teal-200/40 px-3 py-2.5 text-sm text-teal-900 placeholder:text-teal-600/50 outline-none focus:border-teal-400/60"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-xs text-teal-700/80 mb-1">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  minLength={8}
                  className="w-full rounded-xl bg-white/40 border border-teal-200/40 px-3 py-2.5 text-sm text-teal-900 placeholder:text-teal-600/50 outline-none focus:border-teal-400/60"
                  placeholder="At least 8 characters"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full rounded-2xl border border-teal-400/40 bg-teal-600/90 px-4 py-3 text-white font-medium hover:bg-teal-500/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isLoading ? (
                  'Creating account...'
                ) : bioAvailable ? (
                  `Create account + add ${biometricLabel}`
                ) : (
                  'Create account'
                )}
              </motion.button>
            </form>

            {bioAvailable && (
              <p className="mt-3 text-xs text-teal-700/60 text-center">
                We'll add {biometricLabel} for faster sign-in next time
              </p>
            )}

            {/* Sign in link */}
            <div className="mt-4 pt-4 border-t border-teal-200/30 text-center">
              <button
                onClick={() => router.push('/signin')}
                className="text-sm text-teal-700/80 hover:text-teal-800"
              >
                Already have an account? Sign in
              </button>
            </div>
          </>
        ) : (
          /* Step 2: Personalization */
          <>
            <h2 className="text-lg font-semibold text-teal-900 mb-1">Quick personalization</h2>
            <p className="text-sm text-teal-800/70 mb-4">
              You can skip this for now.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-teal-700/80 mb-1">Preferred name</label>
                <input
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  className="w-full rounded-xl bg-white/40 border border-teal-200/40 px-3 py-2.5 text-sm text-teal-900 placeholder:text-teal-600/50 outline-none focus:border-teal-400/60"
                  placeholder="What should MAIA call you?"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={handleSavePersonalization}
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 rounded-xl bg-teal-600 hover:bg-teal-500 text-white px-4 py-3 font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Start'}
                </motion.button>

                <button
                  onClick={handleSkip}
                  className="flex-1 rounded-xl border border-teal-300/40 bg-white/20 hover:bg-white/30 text-teal-800 px-4 py-3 font-medium"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Footer */}
      <div className="mt-4 text-xs text-teal-700/50 text-center max-w-md">
        By creating an account, you agree to our terms of service and privacy policy.
      </div>
    </div>
  );
}
