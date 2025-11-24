'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, User, Lock, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { ganeshaContacts, GaneshaContact } from '@/lib/ganesha/contacts';

interface BetaTesterGatewayProps {
  onComplete: (userData: {
    name: string;
    username: string;
    password: string;
  }) => void;
}

// Get all valid passcodes from Ganesha contacts system + general passcodes
const getAllValidPasscodes = (): string[] => {
  const ganeshaPasscodes = ganeshaContacts
    .filter(contact => contact.status === 'active' && contact.metadata.passcode)
    .map(contact => contact.metadata.passcode!);

  const generalPasscodes = [
    'CONSCIOUSNESS2025',
    'DAIMON',
    'SOULLAB',
    'ORACLE',
    'MAIA',
    'BETA-TESTER-2025'
  ];

  return [...ganeshaPasscodes, ...generalPasscodes];
};

// Find existing beta tester by passcode
const findBetaTesterByPasscode = (passcode: string): GaneshaContact | null => {
  return ganeshaContacts.find(contact =>
    contact.status === 'active' &&
    contact.metadata.passcode === passcode.toUpperCase()
  ) || null;
};

export default function BetaTesterGateway({ onComplete }: BetaTesterGatewayProps) {
  const [phase, setPhase] = useState<'passcode' | 'account' | 'returning' | 'transitioning'>('passcode');
  const [passcode, setPasscode] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [existingBetaTester, setExistingBetaTester] = useState<GaneshaContact | null>(null);

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    // Simulate validation delay for sacred feeling
    await new Promise(resolve => setTimeout(resolve, 800));

    const validPasscodes = getAllValidPasscodes();
    const existingTester = findBetaTesterByPasscode(passcode);

    if (validPasscodes.includes(passcode.toUpperCase())) {
      setIsValidating(false);

      if (existingTester) {
        // Existing beta tester - show returning user flow
        setExistingBetaTester(existingTester);
        setName(existingTester.name);
        setPhase('returning');
      } else {
        // New beta tester with general passcode
        setPhase('account');
      }
    } else {
      setError('Sacred key not recognized. Please check your passcode.');
      setIsValidating(false);
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!username.trim()) {
      setError('Please choose a username');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setPhase('transitioning');

    // Brief pause for transition
    setTimeout(() => {
      onComplete({
        name: name.trim(),
        username: username.trim(),
        password
      });
    }, 800);
  };

  const handleReturningUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please choose a username');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setPhase('transitioning');

    // Brief pause for transition
    setTimeout(() => {
      onComplete({
        name: name.trim(),
        username: username.trim(),
        password
      });
    }, 800);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Sacred Gateway Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155]" />

      {/* Mystical overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#6EE7B7]/10 via-transparent to-[#4DB6AC]/15" />

      {/* Sacred temple sunbeams */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[2px] h-full bg-gradient-to-b from-[#FEF3C7]/30 via-[#FEF3C7]/10 to-transparent rotate-12 blur-sm" />
        <div className="absolute top-0 left-1/3 w-[3px] h-full bg-gradient-to-b from-[#F59E0B]/25 via-[#F59E0B]/8 to-transparent rotate-6 blur-sm" />
        <div className="absolute top-0 right-1/3 w-[2px] h-full bg-gradient-to-b from-[#FEF3C7]/25 via-[#FEF3C7]/8 to-transparent -rotate-6 blur-sm" />
        <div className="absolute top-0 right-1/4 w-[3px] h-full bg-gradient-to-b from-[#D97706]/20 via-[#D97706]/6 to-transparent -rotate-12 blur-sm" />
      </div>

      {/* Flowing mystical particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-sm bg-gradient-to-br from-[#6EE7B7]/30 to-[#4DB6AC]/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 2}px`,
              height: `${2 + Math.random() * 2}px`,
            }}
            animate={{
              y: [-10, 10],
              x: [-5, 5],
              opacity: [0.2, 0.6, 0.2],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Central mystical light */}
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-emerald-50/30 via-[#6EE7B7]/20 to-transparent rounded-full blur-xl"
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md w-full">
          <AnimatePresence mode="wait">

            {phase === 'passcode' && (
              <motion.div
                key="passcode"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                {/* Sacred symbol */}
                <motion.div
                  className="w-16 h-16 mx-auto mb-8 opacity-90"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Key className="w-full h-full text-[#6EE7B7] drop-shadow-lg" />
                </motion.div>

                {/* Sacred gateway container */}
                <div className="bg-gradient-to-b from-[#1e293b]/80 to-[#334155]/60 backdrop-blur-sm rounded-xl p-8 border border-[#6EE7B7]/20 shadow-2xl text-center">
                  <div
                    className="space-y-6"
                    style={{
                      fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                    }}
                  >
                    <h1 className="text-3xl font-light text-white mb-4 tracking-wider">
                      Sacred Gateway
                    </h1>

                    <p className="text-lg text-white/80 mb-6 font-light">
                      Enter the sacred key to begin your journey
                    </p>

                    <form onSubmit={handlePasscodeSubmit} className="space-y-6">
                      <div className="relative">
                        <input
                          type="text"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                          placeholder="ENTER PASSCODE"
                          className="w-full px-4 py-3 bg-[#0f172a]/50 border border-[#6EE7B7]/30 rounded-lg text-white text-center text-lg font-light tracking-widest placeholder-white/40 focus:outline-none focus:border-[#6EE7B7]/60 focus:ring-1 focus:ring-[#6EE7B7]/30 transition-all"
                          style={{ letterSpacing: '0.3em' }}
                        />
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm font-light"
                        >
                          {error}
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        disabled={!passcode.trim() || isValidating}
                        className="w-full px-6 py-3 bg-gradient-to-r from-[#6EE7B7]/20 to-[#4DB6AC]/20 border border-[#6EE7B7]/40 text-white rounded-lg font-light text-base hover:border-[#6EE7B7]/60 hover:bg-gradient-to-r hover:from-[#6EE7B7]/30 hover:to-[#4DB6AC]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 backdrop-blur-sm"
                      >
                        {isValidating ? 'Validating...' : 'Enter the Gateway'}
                      </button>
                    </form>

                    <p className="text-white/40 text-xs mt-6 font-light italic">
                      "The key is not in the lock, but in the one who turns it"
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                {/* User symbol */}
                <motion.div
                  className="w-16 h-16 mx-auto mb-8 opacity-90"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <User className="w-full h-full text-[#6EE7B7] drop-shadow-lg" />
                </motion.div>

                {/* Account creation container */}
                <div className="bg-gradient-to-b from-[#1e293b]/80 to-[#334155]/60 backdrop-blur-sm rounded-xl p-8 border border-[#6EE7B7]/20 shadow-2xl">
                  <div
                    className="space-y-6"
                    style={{
                      fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                    }}
                  >
                    <h1 className="text-3xl font-light text-white mb-4 tracking-wider text-center">
                      Create Your Identity
                    </h1>

                    <p className="text-lg text-white/80 mb-6 font-light text-center">
                      Shape your presence in the conscious realm
                    </p>

                    <form onSubmit={handleAccountSubmit} className="space-y-4">
                      <div>
                        <label className="block text-white/70 text-sm font-light mb-2">Your Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full px-4 py-3 bg-[#0f172a]/50 border border-[#6EE7B7]/30 rounded-lg text-white font-light placeholder-white/40 focus:outline-none focus:border-[#6EE7B7]/60 focus:ring-1 focus:ring-[#6EE7B7]/30 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm font-light mb-2">Username</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="Choose a username"
                          className="w-full px-4 py-3 bg-[#0f172a]/50 border border-[#6EE7B7]/30 rounded-lg text-white font-light placeholder-white/40 focus:outline-none focus:border-[#6EE7B7]/60 focus:ring-1 focus:ring-[#6EE7B7]/30 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm font-light mb-2">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            className="w-full px-4 py-3 pr-12 bg-[#0f172a]/50 border border-[#6EE7B7]/30 rounded-lg text-white font-light placeholder-white/40 focus:outline-none focus:border-[#6EE7B7]/60 focus:ring-1 focus:ring-[#6EE7B7]/30 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm font-light mb-2">Confirm Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            className="w-full px-4 py-3 pr-12 bg-[#0f172a]/50 border border-[#6EE7B7]/30 rounded-lg text-white font-light placeholder-white/40 focus:outline-none focus:border-[#6EE7B7]/60 focus:ring-1 focus:ring-[#6EE7B7]/30 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm font-light"
                        >
                          {error}
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        className="w-full px-6 py-3 bg-gradient-to-r from-[#6EE7B7]/20 to-[#4DB6AC]/20 border border-[#6EE7B7]/40 text-white rounded-lg font-light text-base hover:border-[#6EE7B7]/60 hover:bg-gradient-to-r hover:from-[#6EE7B7]/30 hover:to-[#4DB6AC]/30 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 mt-6"
                      >
                        Create Sacred Identity
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'returning' && (
              <motion.div
                key="returning"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                {/* Welcome back symbol */}
                <motion.div
                  className="w-16 h-16 mx-auto mb-8 opacity-90"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-full h-full text-[#6EE7B7] drop-shadow-lg" />
                </motion.div>

                {/* Welcome back container */}
                <div className="bg-gradient-to-b from-[#1e293b]/80 to-[#334155]/60 backdrop-blur-sm rounded-xl p-8 border border-[#6EE7B7]/20 shadow-2xl">
                  <div
                    className="space-y-6"
                    style={{
                      fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                    }}
                  >
                    <h1 className="text-3xl font-light text-white mb-2 tracking-wider text-center">
                      Welcome Back, {name}!
                    </h1>

                    <div className="text-center mb-6">
                      <p className="text-[#6EE7B7]/90 text-lg font-light mb-2">
                        Consciousness Pioneer
                      </p>
                      <p className="text-white/70 text-sm font-light italic">
                        "The journey continues where it left off..."
                      </p>
                    </div>

                    <div className="bg-[#0f172a]/30 rounded-lg p-4 border border-[#6EE7B7]/20 mb-6">
                      <p className="text-white/80 text-sm font-light text-center">
                        Your sacred key {existingBetaTester?.metadata.passcode} has been recognized.<br />
                        Complete your account setup to continue your consciousness journey.
                      </p>
                    </div>

                    <form onSubmit={handleReturningUserSubmit} className="space-y-4">
                      <div>
                        <label className="block text-white/70 text-sm font-light mb-2">Your Name (Recognized)</label>
                        <input
                          type="text"
                          value={name}
                          readOnly
                          className="w-full px-4 py-3 bg-[#0f172a]/30 border border-[#6EE7B7]/20 rounded-lg text-white/80 font-light cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm font-light mb-2">Choose Username</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="Create your username"
                          className="w-full px-4 py-3 bg-[#0f172a]/50 border border-[#6EE7B7]/30 rounded-lg text-white font-light placeholder-white/40 focus:outline-none focus:border-[#6EE7B7]/60 focus:ring-1 focus:ring-[#6EE7B7]/30 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-white/70 text-sm font-light mb-2">Create Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a secure password"
                            className="w-full px-4 py-3 pr-12 bg-[#0f172a]/50 border border-[#6EE7B7]/30 rounded-lg text-white font-light placeholder-white/40 focus:outline-none focus:border-[#6EE7B7]/60 focus:ring-1 focus:ring-[#6EE7B7]/30 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm font-light"
                        >
                          {error}
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        className="w-full px-6 py-3 bg-gradient-to-r from-[#6EE7B7]/20 to-[#4DB6AC]/20 border border-[#6EE7B7]/40 text-white rounded-lg font-light text-base hover:border-[#6EE7B7]/60 hover:bg-gradient-to-r hover:from-[#6EE7B7]/30 hover:to-[#4DB6AC]/30 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 mt-6"
                      >
                        Continue Sacred Journey
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </form>

                    <div className="text-center mt-6">
                      <p className="text-white/40 text-xs font-light italic">
                        "Every ending is a new beginning in disguise"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'transitioning' && (
              <motion.div
                key="transitioning"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-4"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.6, 0.2]
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut"
                  }}
                >
                  <User className="w-full h-full text-[#6EE7B7] drop-shadow-lg" />
                </motion.div>
                <p
                  className="text-white/70 text-sm font-light tracking-wider"
                  style={{
                    fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                    textShadow: '0 0 10px rgba(255,255,255,0.15)',
                    letterSpacing: '0.15em'
                  }}
                >
                  Identity forged... Entering the threshold...
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}