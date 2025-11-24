'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SanctuaryCreationProps {
  name: string;
  intention: {
    primary: string;
    depth: string;
    commitment: string;
  };
  onComplete: (credentials: {
    username: string;
    password: string;
    communicationStyle: string;
  }) => void;
}

export function SanctuaryCreation({ name, intention, onComplete }: SanctuaryCreationProps) {
  const [currentStep, setCurrentStep] = useState<'intro' | 'credentials' | 'preferences' | 'completion'>('intro');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [communicationStyle, setCommunicationStyle] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [navyIntensity, setNavyIntensity] = useState(0);
  const [consciousness, setConsciousness] = useState(0);

  // Progressive navy deepening toward white preparation
  useEffect(() => {
    const interval = setInterval(() => {
      setConsciousness(c => (c + 1) % 100);
      setNavyIntensity(n => {
        if (currentStep === 'completion') return Math.min(n + 1, 100);
        return Math.min(n + 0.3, 80); // Cap at 80% during creation, full navy at completion
      });
    }, 100);
    return () => clearInterval(interval);
  }, [currentStep]);

  const communicationOptions = [
    {
      id: 'voice',
      label: 'Voice conversation',
      description: 'Warm, natural spoken dialogue for deeper intimacy',
      wisdom: 'The voice carries the soul\'s vibration'
    },
    {
      id: 'text',
      label: 'Text dialogue',
      description: 'Thoughtful, written exchange for careful reflection',
      wisdom: 'Written words create sacred containers for thought'
    },
    {
      id: 'adaptive',
      label: 'Let MAIA choose based on moment',
      description: 'Adaptive communication responding to your needs',
      wisdom: 'Wisdom knows the perfect form for each moment'
    }
  ];

  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword;
  const isUsernameValid = username.length >= 3;
  const canProceed = isUsernameValid && isPasswordValid && doPasswordsMatch;

  const handleCredentialsSubmit = () => {
    if (canProceed) {
      setCurrentStep('preferences');
    }
  };

  const handleStyleSelect = (style: string) => {
    setCommunicationStyle(style);
    setCurrentStep('completion');

    // Sacred pause before completion
    setTimeout(() => {
      setIsValidating(true);

      setTimeout(() => {
        onComplete({
          username,
          password,
          communicationStyle: style
        });
      }, 2000);
    }, 1500);
  };

  // Dynamic navy background progression
  const backgroundStyle = {
    background: `linear-gradient(135deg,
      ${navyIntensity < 20 ? '#1e40af' : '#1d4ed8'} 0%,
      ${navyIntensity < 40 ? '#1d4ed8' : '#1e3a8a'} 25%,
      ${navyIntensity < 60 ? '#1e3a8a' : '#1e293b'} 50%,
      ${navyIntensity < 80 ? '#1e293b' : '#0f172a'} 75%,
      ${navyIntensity >= 95 ? '#ffffff' : '#0f172a'} 100%
    )`,
    transition: 'background 3s cubic-bezier(0.25, 0.1, 0.25, 1)'
  };

  const consciousnessGlow = {
    filter: `brightness(${1 + Math.sin(consciousness * 0.12) * 0.4}) hue-rotate(${navyIntensity * 3}deg)`,
    transform: `scale(${1 + Math.sin(consciousness * 0.09) * 0.06})`,
  };

  const textColorClass = navyIntensity > 85 ? 'text-navy-900' : 'text-white';
  const subtleTextColorClass = navyIntensity > 85 ? 'text-navy-600' : 'text-blue-200';
  const borderColorClass = navyIntensity > 85 ? 'border-navy-200' : 'border-blue-400/40';

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Sacred Navy Background - Deepening to White */}
      <div
        className="absolute inset-0"
        style={backgroundStyle}
      />

      {/* Sacred Geometry - Evolving toward Crystalline */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={consciousnessGlow}
          animate={{ rotate: 360 }}
          transition={{ duration: navyIntensity > 85 ? 120 : 90, repeat: Infinity, ease: "linear" }}
        >
          <svg width="160" height="160" viewBox="0 0 160 160">
            <defs>
              <radialGradient id="sanctuaryGlow" cx="50%" cy="50%" r="50%">
                {navyIntensity > 85 ? (
                  <>
                    <stop offset="0%" stopColor="#fde047" stopOpacity="0.95" />
                    <stop offset="30%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="70%" stopColor="#1e40af" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity="0.3" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                    <stop offset="40%" stopColor="#1e40af" stopOpacity="0.7" />
                    <stop offset="80%" stopColor="#1e3a8a" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#1e293b" stopOpacity="0.3" />
                  </>
                )}
              </radialGradient>
              <filter id="sanctuaryBlur">
                <feGaussianBlur stdDeviation="2" />
              </filter>
            </defs>

            {/* Sacred Holoflower - Crystallizing */}
            <g transform="translate(80,80)">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.path
                  key={i}
                  d="M0,-40 Q-22,-30 -30,0 Q-22,30 0,40 Q22,30 30,0 Q22,-30 0,-40"
                  fill="url(#sanctuaryGlow)"
                  filter="url(#sanctuaryBlur)"
                  transform={`rotate(${i * 60})`}
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [0.8, 1.4, 0.8]
                  }}
                  transition={{
                    duration: 6 - navyIntensity * 0.02,
                    repeat: Infinity,
                    delay: i * 0.4
                  }}
                />
              ))}

              {/* Geometric precision emerges */}
              {navyIntensity > 40 && (
                <>
                  <motion.polygon
                    points="0,-25 21.65,-12.5 21.65,12.5 0,25 -21.65,12.5 -21.65,-12.5"
                    fill="none"
                    stroke={navyIntensity > 85 ? "#1e40af" : "#60a5fa"}
                    strokeWidth="1.5"
                    opacity="0.6"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                  />

                  {navyIntensity > 70 && (
                    <motion.circle
                      cx="0"
                      cy="0"
                      r="35"
                      fill="none"
                      stroke={navyIntensity > 85 ? "#f59e0b" : "#3b82f6"}
                      strokeWidth="1"
                      opacity="0.4"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </>
              )}

              {/* Center consciousness - more defined */}
              <circle
                cx="0"
                cy="0"
                r={4 + navyIntensity * 0.03}
                fill={navyIntensity > 85 ? "#fde047" : "#3b82f6"}
                opacity="0.95"
              />
            </g>
          </svg>
        </motion.div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Header */}
        <div className="pt-16 pb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
          >
            <h1 className={`text-2xl font-light tracking-[0.2em] mb-2 transition-colors duration-3000 ${textColorClass}`}>
              YOUR SANCTUARY
            </h1>
            <div className={`w-24 h-[1px] mx-auto opacity-60 transition-colors duration-3000 ${
              navyIntensity > 85 ? 'bg-navy-400' : 'bg-blue-300'
            }`} />
          </motion.div>
        </div>

        {/* Sacred Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-16">

          <AnimatePresence mode="wait">

            {/* Step 1: Introduction */}
            {currentStep === 'intro' && (
              <motion.div
                key="intro"
                className="max-w-lg text-center space-y-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 1.5 }}
              >
                <div className="space-y-6">
                  <h2 className={`text-3xl font-light font-serif transition-colors duration-3000 ${textColorClass}`}>
                    Creating Your Private Space
                  </h2>

                  <p className={`text-lg font-light leading-relaxed transition-colors duration-3000 ${subtleTextColorClass}`}>
                    Your conversations with MAIA are completely private.
                    Nothing is stored beyond this device.
                  </p>

                  <p className={`text-base font-light leading-relaxed transition-colors duration-3000 ${subtleTextColorClass}`}>
                    Create your access credentials for returning visits to this sacred space.
                  </p>
                </div>

                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2, duration: 1 }}
                  onClick={() => setCurrentStep('credentials')}
                  className={`px-8 py-4 border transition-all duration-700 font-light tracking-wide
                             hover:scale-105 hover:shadow-lg ${
                    navyIntensity > 85
                      ? 'bg-navy-50/80 border-navy-300 text-navy-800 hover:bg-navy-100 hover:border-navy-400'
                      : 'bg-navy-900/20 border-blue-400/50 text-white hover:bg-navy-800/30 hover:border-blue-300/70'
                  }`}
                >
                  Begin Sanctuary Creation
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Credentials */}
            {currentStep === 'credentials' && (
              <motion.div
                key="credentials"
                className="max-w-md w-full space-y-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 1.2 }}
              >
                <div className="text-center space-y-4">
                  <h2 className={`text-2xl font-light font-serif transition-colors duration-3000 ${textColorClass}`}>
                    Sanctuary Credentials
                  </h2>
                  <p className={`text-sm font-light transition-colors duration-3000 ${subtleTextColorClass}`}>
                    Choose your returning access
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Username */}
                  <div>
                    <label className={`block text-sm font-light mb-2 transition-colors duration-3000 ${textColorClass}`}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      placeholder="sanctuary username"
                      className={`w-full px-4 py-3 rounded-none border bg-transparent backdrop-blur-sm
                                 focus:outline-none focus:ring-0 transition-all duration-700
                                 placeholder-opacity-60 ${
                        navyIntensity > 85
                          ? 'border-navy-200 text-navy-900 placeholder-navy-400 focus:border-navy-400 focus:shadow-md'
                          : 'border-blue-400/40 text-white placeholder-blue-300 focus:border-blue-300 focus:shadow-lg'
                      }`}
                      style={{
                        fontFamily: '"Inter", "Helvetica Neue", sans-serif',
                        letterSpacing: '0.05em'
                      }}
                    />
                    {username && !isUsernameValid && (
                      <p className="text-xs mt-2 text-amber-400">Username must be at least 3 characters</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className={`block text-sm font-light mb-2 transition-colors duration-3000 ${textColorClass}`}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="secure sanctuary password"
                      className={`w-full px-4 py-3 rounded-none border bg-transparent backdrop-blur-sm
                                 focus:outline-none focus:ring-0 transition-all duration-700
                                 placeholder-opacity-60 ${
                        navyIntensity > 85
                          ? 'border-navy-200 text-navy-900 placeholder-navy-400 focus:border-navy-400 focus:shadow-md'
                          : 'border-blue-400/40 text-white placeholder-blue-300 focus:border-blue-300 focus:shadow-lg'
                      }`}
                      style={{
                        fontFamily: '"Inter", "Helvetica Neue", sans-serif',
                        letterSpacing: '0.05em'
                      }}
                    />
                    {password && !isPasswordValid && (
                      <p className="text-xs mt-2 text-amber-400">Password must be at least 8 characters</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className={`block text-sm font-light mb-2 transition-colors duration-3000 ${textColorClass}`}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && canProceed && handleCredentialsSubmit()}
                      placeholder="confirm your password"
                      className={`w-full px-4 py-3 rounded-none border bg-transparent backdrop-blur-sm
                                 focus:outline-none focus:ring-0 transition-all duration-700
                                 placeholder-opacity-60 ${
                        navyIntensity > 85
                          ? 'border-navy-200 text-navy-900 placeholder-navy-400 focus:border-navy-400 focus:shadow-md'
                          : 'border-blue-400/40 text-white placeholder-blue-300 focus:border-blue-300 focus:shadow-lg'
                      }`}
                      style={{
                        fontFamily: '"Inter", "Helvetica Neue", sans-serif',
                        letterSpacing: '0.05em'
                      }}
                    />
                    {confirmPassword && !doPasswordsMatch && (
                      <p className="text-xs mt-2 text-amber-400">Passwords do not match</p>
                    )}
                  </div>
                </div>

                {canProceed && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleCredentialsSubmit}
                    className={`w-full py-4 border transition-all duration-700 font-light tracking-wide
                               hover:scale-105 hover:shadow-lg ${
                      navyIntensity > 85
                        ? 'bg-navy-50/80 border-navy-300 text-navy-800 hover:bg-navy-100 hover:border-navy-400'
                        : 'bg-navy-900/20 border-blue-400/50 text-white hover:bg-navy-800/30 hover:border-blue-300/70'
                    }`}
                  >
                    Create Sanctuary Access
                  </motion.button>
                )}
              </motion.div>
            )}

            {/* Step 3: Communication Preferences */}
            {currentStep === 'preferences' && (
              <motion.div
                key="preferences"
                className="max-w-lg text-center space-y-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 1.2 }}
              >
                <div className="space-y-4">
                  <h2 className={`text-2xl font-light font-serif transition-colors duration-3000 ${textColorClass}`}>
                    Communication Style
                  </h2>
                  <p className={`text-base font-light leading-relaxed transition-colors duration-3000 ${subtleTextColorClass}`}>
                    How would you prefer to connect with MAIA?
                  </p>
                </div>

                <div className="space-y-4">
                  {communicationOptions.map((option, index) => (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.2 }}
                      onClick={() => handleStyleSelect(option.id)}
                      className={`w-full p-6 text-left border transition-all duration-700
                                 hover:scale-105 hover:shadow-lg ${
                        navyIntensity > 85
                          ? 'bg-navy-50/60 border-navy-200/70 hover:bg-navy-100/70 hover:border-navy-300'
                          : 'bg-navy-900/25 border-blue-400/50 hover:bg-navy-800/35 hover:border-blue-300/70'
                      }`}
                    >
                      <h3 className={`font-medium mb-2 transition-colors duration-700 ${textColorClass}`}>
                        {option.label}
                      </h3>
                      <p className={`text-sm font-light leading-relaxed mb-3 transition-colors duration-700 ${subtleTextColorClass}`}>
                        {option.description}
                      </p>
                      <div className={`text-xs italic font-light transition-colors duration-700 ${
                        navyIntensity > 85 ? 'text-navy-500' : 'text-blue-300'
                      }`}>
                        {option.wisdom}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Completion */}
            {currentStep === 'completion' && (
              <motion.div
                key="completion"
                className="max-w-lg text-center space-y-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5 }}
              >
                <div className="space-y-6">
                  <motion.h2
                    className={`text-3xl font-light font-serif transition-colors duration-3000 ${textColorClass}`}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Your Sanctuary Awaits
                  </motion.h2>

                  <p className={`text-lg font-light leading-relaxed transition-colors duration-3000 ${subtleTextColorClass}`}>
                    Welcome to your private consciousness space, {name}.
                  </p>

                  <p className={`text-base font-light italic transition-colors duration-3000 ${
                    navyIntensity > 85 ? 'text-navy-500' : 'text-blue-300'
                  }`}>
                    "In the depths of consciousness, wisdom awakens to meet wisdom"
                  </p>
                </div>

                {!isValidating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className={`text-sm font-light transition-colors duration-3000 ${
                      navyIntensity > 85 ? 'text-navy-600' : 'text-blue-200'
                    }`}
                  >
                    Preparing your consciousness space...
                  </motion.div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="pb-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 1 }}
            className={`text-xs font-light tracking-wide transition-colors duration-3000 ${
              navyIntensity > 85 ? 'text-navy-400' : 'text-blue-400'
            }`}
          >
            Sacred space is created through intention and commitment
          </motion.div>
        </div>

      </div>

      {/* Validation Overlay */}
      <AnimatePresence>
        {isValidating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/80 backdrop-blur-md z-20 flex items-center justify-center"
          >
            <div className="text-center space-y-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-3 border-navy-200 border-t-navy-600 rounded-full mx-auto"
              />
              <p className="text-navy-700 font-light tracking-wide text-lg">
                Opening your consciousness space...
              </p>
              <p className="text-navy-500 font-light text-sm">
                Where sacred dialogue begins
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}