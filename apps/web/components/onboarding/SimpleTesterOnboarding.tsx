'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, User, Key, Eye, EyeOff } from 'lucide-react';

interface SimpleTesterOnboardingProps {
  onComplete?: (data: { name: string; password: string }) => void;
}

// Tester passcodes for validation
const VALID_PASSCODES = [
  'MAIA2024',
  'SOULLAB',
  'DAIMON',
  'TESTER',
  'ORACLE'
];

export function SimpleTesterOnboarding({ onComplete }: SimpleTesterOnboardingProps) {
  const [step, setStep] = useState<'passcode' | 'credentials'>('passcode');
  const [passcode, setPasscode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passcode.trim()) {
      setError('Please enter your passcode');
      return;
    }

    if (!VALID_PASSCODES.includes(passcode.toUpperCase())) {
      setError('Invalid passcode. Please check with your administrator.');
      return;
    }

    setStep('credentials');
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!password) {
      setError('Please enter a password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    // Simulate brief loading
    setTimeout(() => {
      onComplete?.({ name: username, password });
    }, 500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Clean background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />

      {/* Subtle particle effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-violet-200/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
            }}
            animate={{
              y: [-10, 10],
              x: [-5, 5],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md w-full">

          {/* SOULLAB Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-light text-slate-800 mb-2 tracking-wide">
              SOULLAB
            </h1>
            <p className="text-sm text-slate-600">
              MAIA Testing Access
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-slate-200 shadow-lg">

            {step === 'passcode' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Key className="w-6 h-6 text-violet-600" />
                  </div>
                  <h2 className="text-xl font-medium text-slate-800 mb-2">
                    Enter Tester Passcode
                  </h2>
                  <p className="text-sm text-slate-600">
                    Please enter your provided testing passcode
                  </p>
                </div>

                <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Passcode
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-center tracking-widest font-mono"
                        placeholder="ENTER PASSCODE"
                        autoFocus
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-600 text-center"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'credentials' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-medium text-slate-800 mb-2">
                    Create Your Account
                  </h2>
                  <p className="text-sm text-slate-600">
                    Set up your testing credentials
                  </p>
                </div>

                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Choose a username"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-600"
                    >
                      {error}
                    </motion.p>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('passcode')}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-lg font-medium transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        <>
                          Enter MAIA
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Valid Passcodes Hint */}
            <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                Valid test passcodes: MAIA2024, SOULLAB, DAIMON, TESTER, ORACLE
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}