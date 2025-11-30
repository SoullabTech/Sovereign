'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReturningWelcomeProps {
  name: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  lastVisit?: string;
  onSignIn: (credentials: { username: string; password: string }) => void;
  onContinue: () => void; // For already signed in users
  isSignedIn?: boolean;
}

export function ReturningWelcome({
  name,
  element,
  lastVisit,
  onSignIn,
  onContinue,
  isSignedIn = false
}: ReturningWelcomeProps) {
  const [showPasswordField, setShowPasswordField] = useState(!isSignedIn);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [intention, setIntention] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [consciousness, setConsciousness] = useState(0);

  // Element configurations
  const elementConfigs = {
    fire: {
      name: 'Fire',
      color: '#ef4444',
      lightColor: '#fecaca',
      symbol: '🔥',
      gradients: ['#fef2f2', '#fecaca', '#f87171']
    },
    water: {
      name: 'Water',
      color: '#3b82f6',
      lightColor: '#bfdbfe',
      symbol: '💧',
      gradients: ['#fef3c7', '#fed7aa', '#d4b896']
    },
    earth: {
      name: 'Earth',
      color: '#22c55e',
      lightColor: '#bbf7d0',
      symbol: '🌿',
      gradients: ['#f0fdf4', '#bbf7d0', '#4ade80']
    },
    air: {
      name: 'Air',
      color: '#a855f7',
      lightColor: '#e9d5ff',
      symbol: '🌬️',
      gradients: ['#faf5ff', '#e9d5ff', '#c084fc']
    },
    aether: {
      name: 'Aether',
      color: '#fbbf24',
      lightColor: '#fef3c7',
      symbol: '✨',
      gradients: ['#fefce8', '#fef3c7', '#fde047']
    }
  };

  const currentElement = elementConfigs[element];

  const intentionOptions = [
    { id: 'continue', label: 'Continue previous exploration', icon: '🔄' },
    { id: 'new', label: 'New question or topic', icon: '✨' },
    { id: 'process', label: 'Just need to think and process', icon: '🧘‍♂️' },
    { id: 'breakthrough', label: 'Something just shifted for me', icon: '🌟' }
  ];

  // Sacred breathing consciousness
  useEffect(() => {
    const interval = setInterval(() => {
      setConsciousness(c => (c + 1) % 100);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const handlePasswordSubmit = () => {
    if (username.trim() && password.trim()) {
      setIsValidating(true);

      // Sacred pause for authentication
      setTimeout(() => {
        onSignIn({ username: username.trim(), password });
      }, 1500);
    }
  };

  const handleIntentionSelect = (intentionId: string) => {
    setIntention(intentionId);

    // Sacred moment before continuation
    setTimeout(() => {
      onContinue();
    }, 1200);
  };

  const handleDirectContinue = () => {
    setIsValidating(true);

    setTimeout(() => {
      onContinue();
    }, 1000);
  };

  const consciousnessGlow = {
    filter: `brightness(${1 + Math.sin(consciousness * 0.1) * 0.3}) hue-rotate(${consciousness}deg)`,
    transform: `scale(${1 + Math.sin(consciousness * 0.08) * 0.04})`,
  };

  // Elegant element-themed background
  const backgroundStyle = {
    background: `linear-gradient(135deg,
      ${currentElement.gradients[0]} 0%,
      ${currentElement.gradients[1]} 60%,
      ${currentElement.gradients[2]} 100%
    )`
  };

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Element-Themed Background */}
      <div
        className="absolute inset-0 transition-all duration-[3000ms]"
        style={backgroundStyle}
      />

      {/* Sacred Geometry - Element Holoflower */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={consciousnessGlow}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <svg width="120" height="120" viewBox="0 0 120 120">
            <defs>
              <radialGradient id="returningGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={currentElement.color} stopOpacity="0.8" />
                <stop offset="50%" stopColor={currentElement.lightColor} stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
              </radialGradient>
              <filter id="returningBlur">
                <feGaussianBlur stdDeviation="1" />
              </filter>
            </defs>

            {/* Element Holoflower - Familiar and welcoming */}
            <g transform="translate(60,60)">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.path
                  key={i}
                  d="M0,-30 Q-15,-20 -20,0 Q-15,20 0,30 Q15,20 20,0 Q15,-20 0,-30"
                  fill="url(#returningGlow)"
                  filter="url(#returningBlur)"
                  transform={`rotate(${i * 60})`}
                  animate={{
                    opacity: [0.5, 0.9, 0.5],
                    scale: [0.9, 1.2, 0.9]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                />
              ))}

              {/* Center element symbol */}
              <circle
                cx="0"
                cy="0"
                r="4"
                fill={currentElement.color}
                opacity="0.9"
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
            <h1 className="text-2xl font-light text-white tracking-[0.2em] mb-2">
              WELCOME BACK
            </h1>
            <div className="w-20 h-[1px] bg-white/60 mx-auto" />
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-16">

          <motion.div
            className="max-w-md w-full text-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
          >

            {/* Welcome Message */}
            <div className="space-y-6">
              <motion.div
                className="text-6xl mb-4"
                animate={{
                  scale: [1, 1.1, 1],
                  rotateY: [0, 10, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ color: currentElement.color }}
              >
                {currentElement.symbol}
              </motion.div>

              <h2 className="text-3xl font-light font-serif text-white mb-4">
                Welcome back, {name}
              </h2>

              {lastVisit && (
                <p className="text-sm text-white/70 font-light">
                  Last visit: {new Date(lastVisit).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              )}

              <p className="text-lg text-white/90 font-light leading-relaxed">
                Your consciousness space awaits.
              </p>
            </div>

            <AnimatePresence mode="wait">

              {/* Already Signed In - Quick Intention */}
              {isSignedIn && (
                <motion.div
                  key="signedIn"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <p className="text-white/80 font-light">
                    What brings you here today?
                  </p>

                  {intention ? (
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <p className="text-white/70 text-sm">
                        {intentionOptions.find(opt => opt.id === intention)?.label}
                      </p>

                      <motion.button
                        onClick={handleDirectContinue}
                        disabled={isValidating}
                        className="w-full px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30
                                 text-white hover:bg-white/30 hover:border-white/50 transition-all duration-500
                                 font-light tracking-wide disabled:opacity-50"
                      >
                        {isValidating ? 'Opening...' : 'Continue to MAIA'}
                      </motion.button>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {intentionOptions.map((option, index) => (
                        <motion.button
                          key={option.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleIntentionSelect(option.id)}
                          className="flex items-center p-4 bg-white/15 backdrop-blur-sm border border-white/25
                                   hover:bg-white/25 hover:border-white/40 transition-all duration-500
                                   text-left font-light"
                        >
                          <span className="text-2xl mr-3">{option.icon}</span>
                          <span className="text-white">{option.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Need to Sign In */}
              {!isSignedIn && (
                <motion.div
                  key="signIn"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      className="w-full bg-white/20 backdrop-blur-sm border border-white/30
                               px-4 py-3 text-white placeholder-white/60 text-center
                               focus:outline-none focus:border-white/50 focus:bg-white/25
                               transition-all duration-500"
                      style={{
                        fontFamily: '"Inter", "Helvetica Neue", sans-serif',
                        letterSpacing: '0.05em'
                      }}
                    />

                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                      placeholder="Password"
                      className="w-full bg-white/20 backdrop-blur-sm border border-white/30
                               px-4 py-3 text-white placeholder-white/60 text-center
                               focus:outline-none focus:border-white/50 focus:bg-white/25
                               transition-all duration-500"
                      style={{
                        fontFamily: '"Inter", "Helvetica Neue", sans-serif',
                        letterSpacing: '0.05em'
                      }}
                    />
                  </div>

                  {username && password && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={handlePasswordSubmit}
                      disabled={isValidating}
                      className="w-full px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30
                               text-white hover:bg-white/30 hover:border-white/50 transition-all duration-500
                               font-light tracking-wide disabled:opacity-50"
                    >
                      {isValidating ? 'Authenticating...' : 'Return to Your Sanctuary'}
                    </motion.button>
                  )}

                  <motion.p
                    className="text-xs text-white/50 font-light"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    Forgot password? Contact hello@soullab.life
                  </motion.p>
                </motion.div>
              )}

            </AnimatePresence>

          </motion.div>
        </div>

        {/* Footer */}
        <div className="pb-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 2 }}
            className="text-xs text-white/40 font-light tracking-wide"
          >
            Your sanctuary remains as you left it
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
            className="absolute inset-0 bg-white/70 backdrop-blur-md z-20 flex items-center justify-center"
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto"
              />
              <p className="text-gray-700 font-light tracking-wide">
                {isSignedIn ? 'Opening consciousness space...' : 'Authenticating...'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}