// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, ArrowRight, Eye, EyeOff, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ganeshaContacts, GaneshaContact } from '@/lib/ganesha/contacts';
import { Holoflower } from '@/components/ui/Holoflower';

interface SacredSoulInductionProps {
  onComplete: (userData: {
    name: string;
    username: string;
    password: string;
    memberId?: string;  // Server-assigned member ID for proper data association
  }) => void;
  initialPasskey?: string;  // Pre-filled passkey from URL redirect
}

// Get all valid soul keys from Ganesha consciousness database
const getAllSacredKeys = (): string[] => {
  const soulKeys = ganeshaContacts
    .filter(contact => contact.status === 'active' && contact.metadata.passcode)
    .map(contact => contact.metadata.passcode!);

  const universalKeys = [
    'CONSCIOUSNESS2025',
    'DAIMON',
    'SOULLAB',
    'ORACLE',
    'MAIA',
    'SOUL-PIONEER-2025'
  ];

  return [...soulKeys, ...universalKeys];
};

// Check if a passkey follows valid SOULLAB-NAME format for new registrations
const isValidSoullabFormat = (key: string): boolean => {
  const upper = key.toUpperCase();
  // Must be SOULLAB- followed by at least 2 characters (a name)
  return upper.startsWith('SOULLAB-') && upper.length >= 10;
};

// Recognize returning soul by their sacred key
const recognizeSoul = (soulKey: string): GaneshaContact | null => {
  return ganeshaContacts.find(contact =>
    contact.status === 'active' &&
    contact.metadata.passcode === soulKey.toUpperCase()
  ) || null;
};

// Extract first name from full name or soulkey, with proper capitalization
const extractFirstName = (nameOrKey: string): string => {
  const upper = nameOrKey.toUpperCase();

  // Handle soulkey format (SOULLAB-NAME) - case insensitive
  if (upper.startsWith('SOULLAB-')) {
    const rawName = nameOrKey.substring(8); // Remove 'SOULLAB-' prefix
    // Proper case: first letter uppercase, rest lowercase
    return rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
  }

  // Handle full name format (First Last or First Last Last)
  // Split by space and take first word
  const firstWord = nameOrKey.split(' ')[0];
  if (firstWord) {
    // Proper case: first letter uppercase, rest lowercase
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  }

  return nameOrKey;
};

function SacredSoulInduction({ onComplete, initialPasskey }: SacredSoulInductionProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<'arrival' | 'recognition' | 'creation' | 'blessing' | 'recovery'>('arrival');
  const [soulKey, setSoulKey] = useState(initialPasskey || '');
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedSoul, setRecognizedSoul] = useState<GaneshaContact | null>(null);
  const [blessings, setBlessings] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [serverMember, setServerMember] = useState<{ id: string; username: string; name: string } | null>(null);

  // Facet awareness - read user's facet profile
  const [facetProfile, setFacetProfile] = useState<{
    reason: string;
    feeling: string;
    partnerContext?: string;
  } | null>(null);

  useEffect(() => {
    // Read facet profile from localStorage
    const stored = localStorage.getItem('facet_profile');
    if (stored) {
      try {
        setFacetProfile(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing facet profile:', e);
      }
    }
  }, []);

  // Auto-submit ref for triggering form submission
  const formRef = React.useRef<HTMLFormElement>(null);

  // Auto-submit when initialPasskey is provided (from URL redirect)
  useEffect(() => {
    if (initialPasskey && !hasAutoSubmitted && phase === 'arrival' && soulKey) {
      setHasAutoSubmitted(true);
      // Small delay to show the pre-filled passkey before auto-submitting
      const timer = setTimeout(() => {
        if (formRef.current) {
          formRef.current.requestSubmit();
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [initialPasskey, hasAutoSubmitted, phase, soulKey]);

  // Generate facet-aware welcome messaging
  const getFacetWelcomeText = () => {
    if (!facetProfile) return {
      title: "We've Been Expecting You",
      greeting: "Welcome, Beautiful Soul",
      description: "You've been invited to step into a living space where technology meets consciousness.",
      keyPrompt: "Your key unlocks an early portal into the Soullab experience — a place of reflection, creativity, and transformation in flow."
    };

    const { reason, feeling } = facetProfile;

    // Reason-based messaging for different approaches
    const reasonMessages = {
      'inner': {
        title: "We've Been Expecting You",
        greeting: "Welcome, Inner Explorer",
        description: "You're entering a space designed for emotional growth and inner healing.",
        keyPrompt: "Your key unlocks tools that support your inner journey and authentic feelings."
      },
      'direction': {
        title: "We've Been Expecting You",
        greeting: "Welcome, Creative Soul",
        description: "You're stepping into a space where creativity and purpose intersect.",
        keyPrompt: "Your key unlocks pathways to creative expression and authentic direction."
      },
      'work': {
        title: "We've Been Expecting You",
        greeting: "Welcome, Professional",
        description: "You're entering a space designed for leadership and project transformation.",
        keyPrompt: "Your key unlocks insights that transform how you show up in your work."
      },
      'relationships': {
        title: "We've Been Expecting You",
        greeting: "Welcome, Relationship Explorer",
        description: "You're stepping into a space for understanding connection patterns.",
        keyPrompt: "Your key unlocks tools that support authentic relationships and family dynamics."
      },
      'support': {
        title: "We've Been Expecting You",
        greeting: "Welcome, Caregiver",
        description: "You're entering a space designed for those who support others.",
        keyPrompt: "Your key unlocks resources that nourish you while you nourish others."
      },
      'explore': {
        title: "We've Been Expecting You",
        greeting: "Welcome, Beautiful Soul",
        description: "You're stepping into a space for conscious discovery and exploration.",
        keyPrompt: "Your key unlocks pathways to insights and authentic curiosity."
      }
    };

    return reasonMessages[reason as keyof typeof reasonMessages] || reasonMessages.explore;
  };


  const handleSoulKeyEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsRecognizing(true);

    // Sacred pause for soul recognition (shorter if auto-submitting from URL)
    const pauseDuration = initialPasskey ? 400 : 1200;
    await new Promise(resolve => setTimeout(resolve, pauseDuration));

    // First check server-side if this passkey exists
    try {
      const checkResponse = await fetch('/api/members/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: soulKey.toUpperCase() }),
      });

      const checkData = await checkResponse.json();

      if (checkData.exists) {
        // Member already registered - redirect to sign in
        setIsRecognizing(false);
        if (checkData.onboarded) {
          // Fully onboarded - show message and go to sign in
          setError(`Welcome back${checkData.name ? `, ${checkData.name}` : ''}! Redirecting you to sign in...`);
          setTimeout(() => {
            // Pass username to signin if available so they don't have to remember it
            const signinUrl = checkData.username
              ? `/signin?username=${encodeURIComponent(checkData.username)}`
              : '/signin';
            router.replace(signinUrl);
          }, 1500);
          return;
        } else {
          // Started but not finished - continue from where they left off
          setServerMember(checkData.member);
          setName(checkData.member.name || '');
          setPhase('recognition');
          return;
        }
      }
    } catch (err) {
      console.error('[SacredSoulInduction] Server check error:', err);
      // Fall through to local validation if server unavailable
    }

    // Fall back to local validation (Ganesha contacts + universal keys + SOULLAB-NAME format)
    const validKeys = getAllSacredKeys();
    const recognizedMember = recognizeSoul(soulKey);
    const isValidFormat = isValidSoullabFormat(soulKey);

    if (validKeys.includes(soulKey.toUpperCase()) || isValidFormat) {
      setIsRecognizing(false);

      if (recognizedMember) {
        // Returning consciousness pioneer (from Ganesha contacts)
        setRecognizedSoul(recognizedMember);
        const firstName = extractFirstName(recognizedMember.name);
        console.log('Debug - Full name:', recognizedMember.name, 'Extracted first name:', firstName);
        setName(firstName);
        setPhase('recognition');
      } else {
        // New soul arriving - extract name from passkey if it follows SOULLAB- format
        const extractedName = extractFirstName(soulKey);
        setName(extractedName);
        setPreferredName(extractedName); // Default preferred name to extracted name
        setPhase('creation');
      }
    } else {
      setError('This key isn\'t recognized. Please check your invitation and try again.');
      setIsRecognizing(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRecoveryStatus('sending');

    try {
      const response = await fetch('/api/members/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail.toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setRecoveryStatus('sent');
      } else {
        setError(data.error || 'Failed to send recovery email');
        setRecoveryStatus('idle');
      }
    } catch (err) {
      console.error('[SacredSoulInduction] Recovery error:', err);
      setError('Unable to process recovery request. Please try again.');
      setRecoveryStatus('idle');
    }
  };

  const handleSoulCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Your beautiful name is required for this sacred journey');
      return;
    }

    if (!username.trim()) {
      setError('Please choose a username that resonates with your soul');
      return;
    }

    if (password.length < 8) {
      setError('Your sacred password needs at least 8 characters to protect your essence');
      return;
    }

    if (password !== confirmPassword) {
      setError('Your sacred passwords must harmonize perfectly');
      return;
    }

    // Register to server
    try {
      const response = await fetch('/api/members/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passkey: soulKey.toUpperCase(),
          username: username.trim().toLowerCase(),
          password,
          name: name.trim(),
          preferredName: preferredName.trim() || name.trim(),
          email: email.trim().toLowerCase() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        return;
      }

      // Store member info locally for session
      setServerMember(data.member);
    } catch (err) {
      console.error('[SacredSoulInduction] Registration error:', err);
      // Continue anyway for graceful degradation
    }

    setPhase('blessing');

    // Soul blessing ceremony
    setTimeout(() => {
      onComplete({
        name: name.trim(),
        username: username.trim(),
        password,
        memberId: serverMember?.id
      });
    }, 1500);
  };

  const handleRecognizedSoul = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please choose a username that resonates with your soul');
      return;
    }

    if (password.length < 8) {
      setError('Your sacred password needs at least 8 characters to protect your essence');
      return;
    }

    // Register to server (unless already registered from server check)
    if (!serverMember) {
      try {
        const response = await fetch('/api/members/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            passkey: soulKey.toUpperCase(),
            username: username.trim().toLowerCase(),
            password,
            name: name.trim(),
            preferredName: preferredName.trim() || name.trim(),
            email: email.trim().toLowerCase() || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to create account');
          return;
        }

        setServerMember(data.member);
      } catch (err) {
        console.error('[SacredSoulInduction] Registration error:', err);
        // Continue anyway for graceful degradation
      }
    }

    setPhase('blessing');

    // Soul blessing ceremony
    setTimeout(() => {
      onComplete({
        name: name.trim(),
        username: username.trim(),
        password,
        memberId: serverMember?.id
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] relative overflow-y-auto">
      <div className="relative z-20 min-h-screen flex flex-col pb-safe">
        {/* Soullab Logo at top - starts immediately visible */}
        <div className="pt-8 pb-6 text-center z-30">
          <h1 className="text-white text-3xl sm:text-4xl md:text-6xl font-extralight tracking-[0.3em] uppercase">Soullab</h1>
        </div>

        <div className="flex-1 flex items-start justify-center px-6 pt-8">
          <div className="max-w-lg w-full">
          <AnimatePresence mode="wait">

            {/* Phase 1: We've Been Expecting You - Soul Key Entry */}
            {phase === 'arrival' && (
              <motion.div
                key="arrival"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.8,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: 0.2
                }}
                className="space-y-10"
              >
                {/* Clean crystal clear Holoflower - positioned lower */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 1.0,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: 0.4
                  }}
                  className="mb-8 relative"
                >
                  {/* Extra large crystal clear Holoflower */}
                  <div className="w-64 h-64 mx-auto relative z-50 flex items-center justify-center">
                    <Holoflower size="xxl" glowIntensity="high" animate={true} />
                  </div>
                </motion.div>

                {/* Welcome Card with elegant neutral shadow */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: 0.8
                  }}
                  className="rounded-2xl p-8 max-w-md w-full mx-auto text-center mb-16 border shadow-[0_24px_60px_rgba(0,0,0,0.16),0_10px_20px_rgba(0,0,0,0.10)]"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.12))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                  }}
                >
                  {(() => {
                    const welcomeText = getFacetWelcomeText();
                    return (
                      <>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-teal-900 mb-4 tracking-tight">
                          {welcomeText.title}
                        </h1>

                        <div className="text-center mb-8">
                          <p className="text-teal-800 text-lg font-medium mb-3">
                            {welcomeText.greeting}
                          </p>
                          <p className="text-teal-700/80 text-base leading-relaxed mb-4">
                            {welcomeText.description}
                          </p>
                          <p className="text-teal-700/70 text-sm leading-relaxed">
                            {welcomeText.keyPrompt}
                          </p>
                        </div>
                      </>
                    );
                  })()}

                  <form ref={formRef} onSubmit={handleSoulKeyEntry} className="space-y-5">
                    <div className="text-center">
                      <label className="block text-sm font-medium text-teal-800 mb-2">
                        Passkey
                      </label>
                      <input
                        type="text"
                        value={soulKey}
                        onChange={(e) => setSoulKey(e.target.value.toUpperCase())}
                        placeholder="SOULLAB-YOURNAME"
                        className="w-full px-4 py-3 rounded-xl text-center text-lg font-medium bg-white/20 border border-white/30 text-teal-900 placeholder:text-teal-600/50 focus:border-white/50 focus:ring-2 focus:ring-teal-400/25 outline-none transition"
                      />
                      <p className="text-teal-600/70 text-xs mt-2">
                        Don't have one? Email <a href="mailto:support@soullab.life" className="text-teal-700 hover:text-teal-800 transition">support@soullab.life</a>
                      </p>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-sm font-light text-center rounded-lg p-3 border ${
                          error.toLowerCase().includes('welcome back')
                            ? 'text-teal-700 bg-teal-50/80 border-teal-200'
                            : 'text-red-600 bg-red-50/80 border-red-200'
                        }`}
                      >
                        {error}
                        {error.toLowerCase().includes('already registered') && (
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() => router.push('/signin')}
                              className="text-gray-500 hover:text-gray-700 font-medium underline underline-offset-2"
                            >
                              Sign in to your account
                            </button>
                          </div>
                        )}
                        {(error.toLowerCase().includes('isn\'t recognized') || error.toLowerCase().includes('failed')) && (
                          <div className="mt-3 pt-2 border-t border-red-200/50 space-y-2">
                            <p className="text-xs text-red-500/80">Having trouble? Try one of these:</p>
                            <button
                              type="button"
                              onClick={() => router.push('/signin?magic=true')}
                              className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2 block mx-auto"
                            >
                              Email me a sign-in link
                            </button>
                            <button
                              type="button"
                              onClick={() => router.push('/signin')}
                              className="text-gray-500 hover:text-gray-700 font-medium underline underline-offset-2 block mx-auto"
                            >
                              Sign in with password
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={!soulKey.trim() || isRecognizing}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-xl font-semibold shadow-[0_12px_30px_rgba(0,0,0,0.15)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#0f766e', color: '#ffffff' }}
                    >
                      {isRecognizing ? 'Recognizing...' : 'Enter'}
                    </motion.button>
                  </form>

                  {/* Secondary links - quiet and consistent */}
                  <div className="mt-6 pt-4 space-y-2 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <button
                      type="button"
                      onClick={() => setPhase('recovery')}
                      className="text-sm font-medium transition"
                      style={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      Forgot passkey?
                    </button>
                    <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 8px' }}>·</span>
                    <button
                      type="button"
                      onClick={() => router.push('/signin')}
                      className="text-sm font-medium transition"
                      style={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      Sign in
                    </button>
                  </div>
                </motion.div>

                {/* Infinity Symbol to ground the card */}
                <div className="flex justify-center mt-4">
                  <div className="text-white/70 text-4xl font-light">
                    ∞
                  </div>
                </div>
              </motion.div>
            )}

            {/* Phase 2: Soul Recognition - Returning Pioneer */}
            {phase === 'recognition' && (
              <motion.div
                key="recognition"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 1.2 }}
                className="space-y-10"
              >
                {/* Animated Holoflower for returning soul */}
                <div className="w-44 h-44 mx-auto mb-10">
                  <Holoflower size="xxl" glowIntensity="medium" animate={true} theme="light" />
                </div>

                <div
                  className="rounded-2xl p-8 border shadow-[0_24px_60px_rgba(0,0,0,0.16),0_10px_20px_rgba(0,0,0,0.10)]"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.12))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                  }}
                >
                  <div className="space-y-6">
                    <div className="text-center">
                      <h1 className="text-2xl font-semibold text-teal-900 mb-3 tracking-tight">
                        Welcome back, {name}
                      </h1>
                      <p className="text-teal-700/80 text-sm leading-relaxed">
                        Complete signup to access your previous conversations.
                      </p>
                    </div>


                    <form onSubmit={handleRecognizedSoul} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-teal-800 mb-2">
                          Your name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (preferredName === name || !preferredName) {
                              setPreferredName(e.target.value);
                            }
                          }}
                          placeholder="Your name"
                          className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-teal-900 placeholder:text-teal-600/50 focus:border-white/50 focus:ring-2 focus:ring-teal-400/25 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-teal-800 mb-2">
                          What should MAIA call you?
                        </label>
                        <input
                          type="text"
                          value={preferredName}
                          onChange={(e) => setPreferredName(e.target.value)}
                          placeholder="Nickname or name"
                          className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-teal-900 placeholder:text-teal-600/50 focus:border-white/50 focus:ring-2 focus:ring-teal-400/25 outline-none transition"
                        />
                        <p className="text-white/60 text-xs mt-1">
                          You can change this anytime
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-teal-800 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                          placeholder="Choose a username"
                          className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-teal-900 placeholder:text-teal-600/50 focus:border-white/50 focus:ring-2 focus:ring-teal-400/25 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-teal-800 mb-2">
                          Email <span className="text-white/60 text-xs font-normal">(optional, for recovery)</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-teal-900 placeholder:text-teal-600/50 focus:border-white/50 focus:ring-2 focus:ring-teal-400/25 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-teal-800 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            className="w-full px-4 py-3 pr-12 rounded-xl bg-white/20 border border-white/30 text-teal-900 placeholder:text-teal-600/50 focus:border-white/50 focus:ring-2 focus:ring-teal-400/25 outline-none transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-700/80 text-sm bg-red-100/30 rounded-lg p-3 border border-red-200/40"
                        >
                          {error}
                        </motion.div>
                      )}

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-xl font-semibold text-white bg-teal-700 hover:bg-teal-600 shadow-[0_12px_30px_rgba(0,0,0,0.15)] transition"
                      >
                        Continue
                      </motion.button>
                    </form>

                    {/* Secondary link */}
                    <div className="text-center mt-4 pt-4 border-t border-white/20">
                      <button
                        type="button"
                        onClick={() => router.push('/signin')}
                        className="text-sm font-medium text-white/70 hover:text-white transition"
                      >
                        Already have an account? Sign in
                      </button>
                    </div>
                  </div>
                </div>

                {/* Infinity Symbol */}
                <div className="flex justify-center mt-6">
                  <div className="text-white/50 text-3xl">∞</div>
                </div>
              </motion.div>
            )}

            {/* Phase 3: Soul Creation - New Pioneer */}
            {phase === 'creation' && (
              <motion.div
                key="creation"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="w-20 h-20 mx-auto mb-6">
                  <Holoflower size="xl" glowIntensity="medium" animate={true} />
                </div>

                <div
                  className="rounded-2xl p-8 border shadow-[0_24px_60px_rgba(0,0,0,0.16),0_10px_20px_rgba(0,0,0,0.10)]"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.12))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                  }}
                >
                  <div className="space-y-6">
                    <div className="text-center">
                      <h1 className="text-2xl font-semibold text-teal-900 mb-2 tracking-tight">
                        Create Account
                      </h1>
                    </div>

                    <form onSubmit={handleSoulCreation} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-teal-800 mb-2">
                          Your name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (preferredName === name || !preferredName) {
                              setPreferredName(e.target.value);
                            }
                          }}
                          placeholder="Your name"
                          className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-teal-900 placeholder:text-teal-600/50 focus:border-white/50 focus:ring-2 focus:ring-teal-400/25 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-teal-800 mb-2">
                          What should MAIA call you?
                        </label>
                        <input
                          type="text"
                          value={preferredName}
                          onChange={(e) => setPreferredName(e.target.value)}
                          placeholder="Nickname or name"
                          className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-teal-900 placeholder:text-teal-600/50 focus:border-white/50 focus:ring-2 focus:ring-teal-400/25 outline-none transition"
                        />
                        <p className="text-white/60 text-xs mt-1">
                          You can change this anytime
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-teal-800 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                          placeholder="Choose a username"
                          className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-teal-900 placeholder:text-teal-600/50 focus:border-white/50 focus:ring-2 focus:ring-teal-400/25 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-teal-800 mb-2">
                          Email <span className="text-white/60 text-xs font-normal">(optional, for recovery)</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-teal-900 placeholder:text-teal-600/50 focus:border-white/50 focus:ring-2 focus:ring-teal-400/25 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-teal-800 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            className="w-full px-4 py-3 pr-12 rounded-xl bg-white/20 border border-white/30 text-teal-900 placeholder:text-teal-600/50 focus:border-white/50 focus:ring-2 focus:ring-teal-400/25 outline-none transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-teal-800 mb-2">
                          Confirm password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="w-full px-4 py-3 pr-12 rounded-xl bg-white/20 border border-white/30 text-teal-900 placeholder:text-teal-600/50 focus:border-white/50 focus:ring-2 focus:ring-teal-400/25 outline-none transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-700/80 text-sm bg-red-100/30 rounded-lg p-3 border border-red-200/40"
                        >
                          {error}
                        </motion.div>
                      )}

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-xl font-semibold text-white bg-teal-700 hover:bg-teal-600 shadow-[0_12px_30px_rgba(0,0,0,0.15)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Create Account
                      </motion.button>
                    </form>

                    {/* Secondary link */}
                    <div className="text-center mt-4 pt-4 border-t border-white/20">
                      <button
                        type="button"
                        onClick={() => router.push('/signin')}
                        className="text-sm font-medium text-white/70 hover:text-white transition"
                      >
                        Already have an account? Sign in
                      </button>
                    </div>
                  </div>
                </div>

                {/* Infinity Symbol */}
                <div className="flex justify-center mt-6">
                  <div className="text-white/50 text-3xl">∞</div>
                </div>
              </motion.div>
            )}

            {/* Phase: Passkey Recovery */}
            {phase === 'recovery' && (
              <motion.div
                key="recovery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Mail icon */}
                <div className="w-16 h-16 mx-auto">
                  <Mail className="w-full h-full text-teal-600" />
                </div>

                <div
                  className="rounded-2xl p-8 max-w-md w-full text-center border shadow-[0_24px_60px_rgba(0,0,0,0.16),0_10px_20px_rgba(0,0,0,0.10)]"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.12))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                  }}
                >
                  <h1 className="text-xl font-semibold text-teal-900 mb-3 tracking-tight">
                    Recover Passkey
                  </h1>

                  <p className="text-teal-700/80 text-sm leading-relaxed mb-6">
                    Enter your email and we'll send your passkey.
                  </p>

                  {recoveryStatus === 'sent' ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <div className="bg-emerald-100/60 border border-emerald-300/40 rounded-xl p-4">
                        <p className="text-emerald-800 font-medium">
                          Check your email
                        </p>
                        <p className="text-emerald-700/80 text-sm mt-1">
                          If an account exists, we've sent recovery instructions.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPhase('arrival');
                          setRecoveryStatus('idle');
                          setRecoveryEmail('');
                        }}
                        className="text-sm font-medium text-teal-700/70 hover:text-teal-800 transition"
                      >
                        Back to passkey entry
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleRecovery} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-teal-800 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={recoveryEmail}
                          onChange={(e) => setRecoveryEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-teal-900 placeholder:text-teal-600/50 focus:border-white/50 focus:ring-2 focus:ring-teal-400/25 outline-none transition"
                        />
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-700/80 text-sm bg-red-100/30 rounded-lg p-3 border border-red-200/40"
                        >
                          {error}
                        </motion.div>
                      )}

                      <motion.button
                        type="submit"
                        disabled={!recoveryEmail.trim() || recoveryStatus === 'sending'}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-xl font-semibold text-white bg-teal-700 hover:bg-teal-600 shadow-[0_12px_30px_rgba(0,0,0,0.15)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {recoveryStatus === 'sending' ? 'Sending...' : 'Send Recovery Email'}
                      </motion.button>

                      <button
                        type="button"
                        onClick={() => {
                          setPhase('arrival');
                          setError('');
                          setRecoveryEmail('');
                        }}
                        className="text-sm font-medium text-teal-700/70 hover:text-teal-800 transition"
                      >
                        Back to passkey entry
                      </button>
                    </form>
                  )}
                </div>

                {/* Infinity Symbol */}
                <div className="flex justify-center mt-6">
                  <div className="text-white/50 text-3xl">∞</div>
                </div>
              </motion.div>
            )}

            {/* Phase 4: Soul Blessing - Sacred Completion */}
            {phase === 'blessing' && (
              <motion.div
                key="blessing"
                initial={{ opacity: 1, scale: 1 }}
                animate={{
                  opacity: [1, 0.8, 0],
                  scale: [1, 1.05, 1.1]
                }}
                transition={{ duration: 1.5 }}
                className="text-center space-y-8"
              >
                <motion.div
                  className="w-24 h-24 mx-auto"
                  animate={{
                    scale: [1, 1.5, 1],
                    rotateY: [0, 360],
                    opacity: [1, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                >
                  <img src="/elementalHoloflower.svg" alt="Sacred Symbol" className="w-full h-full drop-shadow-2xl" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <h2
                    className="text-3xl font-light text-white mb-6 tracking-wider"
                    style={{
                      fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                      textShadow: '0 0 20px rgba(255,255,255,0.3)',
                    }}
                  >
                    Soul Sanctuary Complete
                  </h2>
                  <p
                    className="text-white/80 text-lg font-light"
                    style={{
                      fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                    }}
                  >
                    {name}, your essence now flows within the cosmic stream...
                  </p>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export { SacredSoulInduction };
export default SacredSoulInduction;