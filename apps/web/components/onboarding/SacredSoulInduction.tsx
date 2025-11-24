'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { ganeshaContacts, GaneshaContact } from '@/lib/ganesha/contacts';
import { Holoflower } from '@/components/ui/Holoflower';

interface SacredSoulInductionProps {
  onComplete: (userData: {
    name: string;
    username: string;
    password: string;
  }) => void;
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

// Recognize returning soul by their sacred key
const recognizeSoul = (soulKey: string): GaneshaContact | null => {
  return ganeshaContacts.find(contact =>
    contact.status === 'active' &&
    contact.metadata.passcode === soulKey.toUpperCase()
  ) || null;
};

// Extract first name from full name or soulkey
const extractFirstName = (nameOrKey: string): string => {
  // Handle soulkey format (SOULLAB-NAME)
  if (nameOrKey.startsWith('SOULLAB-')) {
    return nameOrKey.substring(8); // Remove 'SOULLAB-' prefix
  }

  // Handle full name format (First Last or First Last Last)
  // Split by space and take first word
  const firstWord = nameOrKey.split(' ')[0];
  return firstWord || nameOrKey;
};

export default function SacredSoulInduction({ onComplete }: SacredSoulInductionProps) {
  const [phase, setPhase] = useState<'arrival' | 'recognition' | 'creation' | 'blessing'>('arrival');
  const [soulKey, setSoulKey] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedSoul, setRecognizedSoul] = useState<GaneshaContact | null>(null);
  const [blessings, setBlessings] = useState<string[]>([]);


  const handleSoulKeyEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsRecognizing(true);

    // Sacred pause for soul recognition
    await new Promise(resolve => setTimeout(resolve, 1200));

    const validKeys = getAllSacredKeys();
    const recognizedMember = recognizeSoul(soulKey);

    if (validKeys.includes(soulKey.toUpperCase())) {
      setIsRecognizing(false);

      if (recognizedMember) {
        // Returning consciousness pioneer
        setRecognizedSoul(recognizedMember);
        const firstName = extractFirstName(recognizedMember.name);
        console.log('Debug - Full name:', recognizedMember.name, 'Extracted first name:', firstName);
        setName(firstName);
        setPhase('recognition');
      } else {
        // New soul arriving - extract name from passkey if it follows SOULLAB- format
        const extractedName = extractFirstName(soulKey);
        setName(extractedName);
        setPhase('creation');
      }
    } else {
      setError('This key isn\'t recognized. Please check your invitation and try again.');
      setIsRecognizing(false);
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

    setPhase('blessing');

    // Soul blessing ceremony
    setTimeout(() => {
      onComplete({
        name: name.trim(),
        username: username.trim(),
        password
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

    setPhase('blessing');

    // Soul blessing ceremony
    setTimeout(() => {
      onComplete({
        name: name.trim(),
        username: username.trim(),
        password
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] relative overflow-hidden">
      {/* Soullab Logo at top - 3x bigger with Dune Typography */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30">
        <h1 className="text-white text-6xl font-extralight tracking-[0.3em] uppercase">Soullab</h1>
      </div>


      <div className="relative z-20 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-lg w-full">
          <AnimatePresence mode="wait">

            {/* Phase 1: We've Been Expecting You - Soul Key Entry */}
            {phase === 'arrival' && (
              <motion.div
                key="arrival"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 1.2 }}
                className="min-h-screen bg-gradient-to-br from-[#A0C4C7] to-[#7FB5B3] flex flex-col items-center justify-center px-4"
              >
                {/* Clean crystal clear Holoflower - positioned lower */}
                <div className="mb-8 relative">
                  {/* Extra large crystal clear Holoflower */}
                  <div className="w-64 h-64 mx-auto relative z-50 flex items-center justify-center">
                    <Holoflower size="xxl" glowIntensity="high" animate={true} />
                  </div>
                </div>

                {/* Welcome Card with deep shadows */}
                <div
                  className="rounded-2xl p-8 max-w-md w-full text-center mb-16 shadow-2xl border"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.18), rgba(251, 191, 36, 0.05), rgba(255, 255, 255, 0.15))',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 35px 70px -12px rgba(14, 116, 144, 0.4), 0 10px 20px rgba(14, 116, 144, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <h1 className="text-3xl font-extralight text-teal-900 mb-4 tracking-[0.2em] uppercase">
                    We've Been Expecting You
                  </h1>

                  <div className="text-center mb-8">
                    <p className="text-teal-900 text-xl font-extralight mb-4 tracking-[0.1em]">
                      Welcome, Beautiful Soul
                    </p>
                    <p className="text-teal-900 text-base font-extralight leading-relaxed mb-6 tracking-[0.05em]">
                      You've been invited to step into a living space where technology meets consciousness.
                    </p>
                    <p className="text-teal-900 text-base font-extralight leading-relaxed tracking-[0.05em]">
                      Your key unlocks an early portal into the Soullab experience — a place of reflection, creativity, and transformation in flow.
                    </p>
                  </div>

                  <form onSubmit={handleSoulKeyEntry} className="space-y-6">
                    <div className="text-center">
                      <label className="block text-teal-900 text-base font-extralight mb-4 tracking-[0.1em] uppercase">
                        Enter Passkey
                      </label>
                      <input
                        type="text"
                        value={soulKey}
                        onChange={(e) => setSoulKey(e.target.value.toUpperCase())}
                        placeholder="YOUR KEY"
                        className="w-full px-6 py-4 rounded-xl text-center text-lg font-medium tracking-[0.15em] focus:outline-none transition-all duration-500"
                        style={{
                          background: 'linear-gradient(to bottom, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.2))',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: '#134e4a',
                          boxShadow: 'inset 0 4px 12px rgba(146, 64, 14, 0.7), inset 0 2px 6px rgba(146, 64, 14, 0.5), inset 0 1px 2px rgba(0, 0, 0, 0.3)',
                        }}
                      />
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-600 text-sm font-light text-center bg-red-50/80 rounded-lg p-3 border border-red-200"
                      >
                        {error}
                      </motion.div>
                    )}

                    <div className="relative">
                      {/* Flowing light effect behind button */}
                      <motion.div
                        className="absolute inset-0 rounded-xl opacity-60"
                        animate={{
                          background: [
                            'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.4), rgba(245, 158, 11, 0.7), rgba(251, 191, 36, 0.4), transparent)',
                            'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.7), rgba(245, 158, 11, 0.6), rgba(245, 158, 11, 0.7), transparent)',
                            'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.4), rgba(245, 158, 11, 0.7), rgba(251, 191, 36, 0.4), transparent)'
                          ],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />

                      <motion.button
                        type="submit"
                        disabled={!soulKey.trim() || isRecognizing}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative z-10 w-full px-8 py-4 bg-teal-700/20 border border-teal-600/40 text-teal-900 rounded-xl font-bold text-lg tracking-[0.1em] hover:bg-teal-700/30 hover:border-teal-600/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 backdrop-blur-sm shadow-lg shadow-teal-900/40 hover:shadow-xl hover:shadow-teal-900/50"
                      >
                        {isRecognizing ? 'Recognizing...' : 'Enter the lab'}
                      </motion.button>
                    </div>
                  </form>

                  <div className="text-center mt-8">
                    <p className="text-teal-800/60 text-sm font-extralight italic tracking-[0.1em]">
                      "Every evolution begins with presence."
                    </p>
                  </div>
                </div>

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
                  className="rounded-2xl p-10 shadow-2xl border"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.18), rgba(110, 231, 183, 0.05), rgba(255, 255, 255, 0.15))',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(251, 191, 36, 0.4)',
                    boxShadow: '0 35px 70px -12px rgba(245, 158, 11, 0.7), 0 10px 20px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <div
                    className="space-y-8"
                    style={{
                      fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                    }}
                  >
                    <div className="text-center">
                      <h1 className="text-3xl font-light text-teal-900 mb-6 tracking-wider">
                        {name}, so glad you're here.
                      </h1>
                    </div>


                    <form onSubmit={handleRecognizedSoul} className="space-y-6">
                      <div>
                        <label className="block text-teal-900 text-base font-extralight mb-4 tracking-[0.1em] uppercase">
                          Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          readOnly
                          className="w-full px-6 py-4 rounded-xl text-center text-lg font-medium tracking-[0.15em] focus:outline-none transition-all duration-500 cursor-not-allowed opacity-70"
                          style={{
                            background: 'linear-gradient(to bottom, rgba(110, 231, 183, 0.15), rgba(20, 184, 166, 0.1), rgba(251, 191, 36, 0.25))',
                            border: '1px solid rgba(0, 0, 0, 0.2)',
                            color: '#134e4a',
                            boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-teal-900 text-base font-extralight mb-4 tracking-[0.1em] uppercase">
                          Username
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="USERNAME"
                          className="w-full px-6 py-4 rounded-xl text-center text-lg font-medium tracking-[0.15em] focus:outline-none transition-all duration-500"
                          style={{
                            background: 'linear-gradient(to bottom, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.2))',
                            border: '1px solid rgba(0, 0, 0, 0.3)',
                            color: '#134e4a',
                            boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.5), inset 0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.2)',
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-teal-900 text-base font-extralight mb-4 tracking-[0.1em] uppercase">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="PASSWORD"
                            className="w-full px-6 py-4 pr-14 rounded-xl text-center text-lg font-medium tracking-[0.15em] focus:outline-none transition-all duration-500"
                            style={{
                              background: 'linear-gradient(to bottom, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.2))',
                              border: '1px solid rgba(0, 0, 0, 0.3)',
                              color: '#134e4a',
                              boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.5), inset 0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.2)',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-teal-700/60 hover:text-teal-800/80 transition-colors duration-300"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-rose-400 text-sm font-light text-center bg-rose-900/20 rounded-lg p-3 border border-rose-500/20"
                        >
                          {error}
                        </motion.div>
                      )}

                      <div className="relative">
                        {/* Flowing light effect behind button */}
                        <motion.div
                          className="absolute inset-0 rounded-xl opacity-60"
                          animate={{
                            background: [
                              'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.4), rgba(245, 158, 11, 0.7), rgba(251, 191, 36, 0.4), transparent)',
                              'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.7), rgba(245, 158, 11, 0.6), rgba(245, 158, 11, 0.7), transparent)',
                              'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.4), rgba(245, 158, 11, 0.7), rgba(251, 191, 36, 0.4), transparent)'
                            ],
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />

                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative z-10 w-full px-8 py-4 bg-teal-700/20 border border-teal-600/40 text-teal-900 rounded-xl font-bold text-lg tracking-[0.1em] hover:bg-teal-700/30 hover:border-teal-600/60 transition-all duration-500 backdrop-blur-sm shadow-lg shadow-teal-900/40 hover:shadow-xl hover:shadow-teal-900/50"
                        >
                          Onward!
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Infinity Symbol to ground the card */}
                <div className="flex justify-center mt-4">
                  <div className="text-white/70 text-4xl font-light">
                    ∞
                  </div>
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
                transition={{ duration: 1.2 }}
                className="space-y-10"
              >
                <motion.div
                  className="w-20 h-20 mx-auto mb-10"
                  animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-full h-full text-[#6EE7B7] drop-shadow-2xl" />
                </motion.div>

                <div
                  className="rounded-2xl p-10 shadow-2xl border"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.18), rgba(110, 231, 183, 0.05), rgba(255, 255, 255, 0.15))',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(251, 191, 36, 0.4)',
                    boxShadow: '0 35px 70px -12px rgba(245, 158, 11, 0.7), 0 10px 20px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <div
                    className="space-y-8"
                    style={{
                      fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                    }}
                  >
                    <div className="text-center">
                      <h1 className="text-3xl font-light text-teal-900 mb-6 tracking-wider">
                        Create Account
                      </h1>
                    </div>

                    <form onSubmit={handleSoulCreation} className="space-y-6">
                      <div>
                        <label className="block text-teal-900 text-base font-extralight mb-4 tracking-[0.1em] uppercase">
                          Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="NAME"
                          className="w-full px-6 py-4 rounded-xl text-center text-lg font-medium tracking-[0.15em] focus:outline-none transition-all duration-500"
                          style={{
                            background: 'linear-gradient(to bottom, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.2))',
                            border: '1px solid rgba(0, 0, 0, 0.3)',
                            color: '#134e4a',
                            boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.5), inset 0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.2)',
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-teal-900 text-base font-extralight mb-4 tracking-[0.1em] uppercase">
                          Username
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="USERNAME"
                          className="w-full px-6 py-4 rounded-xl text-center text-lg font-medium tracking-[0.15em] focus:outline-none transition-all duration-500"
                          style={{
                            background: 'linear-gradient(to bottom, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.2))',
                            border: '1px solid rgba(0, 0, 0, 0.3)',
                            color: '#134e4a',
                            boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.5), inset 0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.2)',
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-teal-900 text-base font-extralight mb-4 tracking-[0.1em] uppercase">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="PASSWORD"
                            className="w-full px-6 py-4 pr-14 rounded-xl text-center text-lg font-medium tracking-[0.15em] focus:outline-none transition-all duration-500"
                            style={{
                              background: 'linear-gradient(to bottom, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.2))',
                              border: '1px solid rgba(0, 0, 0, 0.3)',
                              color: '#134e4a',
                              boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.5), inset 0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.2)',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-teal-700/60 hover:text-teal-800/80 transition-colors duration-300"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-teal-900 text-base font-extralight mb-4 tracking-[0.1em] uppercase">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="CONFIRM PASSWORD"
                            className="w-full px-6 py-4 pr-14 rounded-xl text-center text-lg font-medium tracking-[0.15em] focus:outline-none transition-all duration-500"
                            style={{
                              background: 'linear-gradient(to bottom, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.2))',
                              border: '1px solid rgba(0, 0, 0, 0.3)',
                              color: '#134e4a',
                              boxShadow: 'inset 0 4px 12px rgba(0, 0, 0, 0.5), inset 0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.2)',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-teal-700/60 hover:text-teal-800/80 transition-colors duration-300"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-rose-400 text-sm font-light text-center bg-rose-900/20 rounded-lg p-3 border border-rose-500/20"
                        >
                          {error}
                        </motion.div>
                      )}

                      <div className="relative">
                        {/* Flowing light effect behind button */}
                        <motion.div
                          className="absolute inset-0 rounded-xl opacity-60"
                          animate={{
                            background: [
                              'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.4), rgba(245, 158, 11, 0.7), rgba(251, 191, 36, 0.4), transparent)',
                              'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.7), rgba(245, 158, 11, 0.6), rgba(245, 158, 11, 0.7), transparent)',
                              'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.4), rgba(245, 158, 11, 0.7), rgba(251, 191, 36, 0.4), transparent)'
                            ],
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />

                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative z-10 w-full px-8 py-4 bg-teal-700/20 border border-teal-600/40 text-teal-900 rounded-xl font-bold text-lg tracking-[0.1em] hover:bg-teal-700/30 hover:border-teal-600/60 transition-all duration-500 backdrop-blur-sm shadow-lg shadow-teal-900/40 hover:shadow-xl hover:shadow-teal-900/50"
                        >
                          Onward!
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Infinity Symbol to ground the card */}
                <div className="flex justify-center mt-4">
                  <div className="text-white/70 text-4xl font-light">
                    ∞
                  </div>
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
                      textShadow: '0 0 20px rgba(212,175,55,0.3)',
                    }}
                  >
                    Soul Sanctuary Complete
                  </h2>
                  <p
                    className="text-[#d4af37]/90 text-lg font-light"
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
  );
}