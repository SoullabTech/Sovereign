'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface PasscodeEntryProps {
  onSuccess: (passcode: string) => void;
  onSkip?: () => void;
}

// Valid beta access codes (you can modify these)
const VALID_PASSCODES = [
  'MAIA-BETA-2025',
  'DAIMON-ACCESS',
  'SOULLAB-PIONEER',
  'SOULLAB-KELLY',
  'CONSCIOUSNESS-LAB',
  'BETA-EXPLORER'
];

export function PasscodeEntry({ onSuccess, onSkip }: PasscodeEntryProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsValidating(true);
    setError('');

    // Simulate validation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const normalizedCode = passcode.trim().toUpperCase();

    if (VALID_PASSCODES.includes(normalizedCode)) {
      // Store the valid passcode
      localStorage.setItem('betaAccessCode', normalizedCode);
      sessionStorage.setItem('betaAccessCode', normalizedCode);
      onSuccess(normalizedCode);
    } else {
      setError('Invalid invitation code. Please check your code and try again.');
      setIsValidating(false);
    }
  };

  const renderSacredHoloflower = () => (
    <motion.div
      className="relative w-24 h-24 mx-auto mb-8"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      {/* Diffused sunlight emanating from behind - Layer 1 (innermost) */}
      <motion.div
        className="absolute inset-0 w-32 h-32 -m-4"
        animate={{
          opacity: [0.15, 0.35, 0.15],
          scale: [1.3, 1.7, 1.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          background: 'radial-gradient(circle, rgba(251, 211, 156, 0.25) 0%, rgba(252, 211, 77, 0.18) 20%, rgba(251, 191, 36, 0.12) 40%, rgba(251, 191, 36, 0.06) 70%, transparent 100%)',
          borderRadius: '50%',
          filter: 'blur(12px)',
          transform: 'translateY(2px)',
        }}
      />

      {/* Diffused sunlight emanating from behind - Layer 2 (middle) */}
      <motion.div
        className="absolute inset-0 w-40 h-40 -m-8"
        animate={{
          opacity: [0.08, 0.2, 0.08],
          scale: [1.8, 2.4, 1.8],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        style={{
          background: 'radial-gradient(circle, rgba(251, 211, 156, 0.18) 0%, rgba(252, 211, 77, 0.12) 25%, rgba(251, 191, 36, 0.08) 50%, rgba(245, 158, 11, 0.04) 80%, transparent 100%)',
          borderRadius: '50%',
          filter: 'blur(18px)',
          transform: 'translateY(4px)',
        }}
      />

      {/* Diffused sunlight emanating from behind - Layer 3 (outermost) */}
      <motion.div
        className="absolute inset-0 w-48 h-48 -m-12"
        animate={{
          opacity: [0.05, 0.15, 0.05],
          scale: [2.2, 3, 2.2],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        style={{
          background: 'radial-gradient(circle, rgba(251, 211, 156, 0.12) 0%, rgba(252, 211, 77, 0.08) 30%, rgba(251, 191, 36, 0.05) 60%, rgba(217, 119, 6, 0.02) 85%, transparent 100%)',
          borderRadius: '50%',
          filter: 'blur(25px)',
          transform: 'translateY(6px)',
        }}
      />

      {/* Sacred teal light field (over the amber sunlight) */}
      <motion.div
        className="absolute inset-0 w-32 h-32 -m-4"
        animate={{
          opacity: [0.15, 0.4, 0.15],
          scale: [1.2, 1.6, 1.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          background: 'radial-gradient(circle, rgba(167, 216, 209, 0.3) 0%, rgba(128, 203, 196, 0.2) 50%, rgba(77, 182, 172, 0.1) 80%, transparent 100%)',
          borderRadius: '50%',
          filter: 'blur(10px)'
        }}
      />

      {/* Signature Holoflower */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.05, 1],
        }}
        transition={{
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="relative z-10 w-full h-full"
      >
        <img
          src="/holoflower-sacred.svg"
          alt="Sacred Holoflower"
          className="w-full h-full object-contain opacity-90"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(167, 216, 209, 0.6)) drop-shadow(0 0 10px rgba(251, 191, 36, 0.3)) drop-shadow(0 0 5px rgba(128, 203, 196, 0.4))'
          }}
        />
      </motion.div>

      {/* Sacred emanation particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#A7D8D1]/60 rounded-full"
          style={{
            left: `${50 + 45 * Math.cos(i * Math.PI / 4)}%`,
            top: `${50 + 45 * Math.sin(i * Math.PI / 4)}%`,
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.5, 0.8],
            rotate: [0, 360],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
        />
      ))}
    </motion.div>
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#A7D8D1] via-[#80CBC4] to-[#4DB6AC] flex items-center justify-center px-4 relative overflow-hidden"
      style={{
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(251, 191, 36, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.12) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.08) 0%, transparent 70%)
        `
      }}
    >
      {/* Ancient temple atmosphere with amber energy flows */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Flowing amber energy bursts */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`amber-burst-${i}`}
            className="absolute"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              opacity: [0, 0.4, 0],
              scale: [0.5, 2.5, 0.5],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: "easeInOut"
            }}
          >
            <div
              className="w-32 h-32 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.2) 30%, rgba(217, 119, 6, 0.1) 60%, transparent 100%)',
                filter: 'blur(20px)'
              }}
            />
          </motion.div>
        ))}

        {/* Mystical temple particles */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={`temple-particle-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              background: Math.random() > 0.5
                ? 'rgba(251, 191, 36, 0.6)'
                : 'rgba(167, 216, 209, 0.4)'
            }}
            animate={{
              y: [0, -40 - Math.random() * 20, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: 10 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Sacred geometry emanations */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`sacred-geo-${i}`}
            className="absolute"
            style={{
              left: `${25 + i * 15}%`,
              top: `${25 + i * 15}%`,
            }}
            animate={{
              rotate: 360,
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              rotate: { duration: 20 + i * 5, repeat: Infinity, ease: "linear" },
              opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <div
              className="w-24 h-24 border border-amber-300/20 rounded-full"
              style={{
                boxShadow: '0 0 20px rgba(251, 191, 36, 0.1), inset 0 0 20px rgba(251, 191, 36, 0.05)'
              }}
            />
          </motion.div>
        ))}
      </div>



      {/* Soullab branding - Upper 1/8th of screen */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="absolute top-0 left-0 right-0 text-center"
        style={{ top: '12.5%' }}
      >
        <h2 className="text-3xl font-medium text-white tracking-widest uppercase" style={{
          fontFamily: 'Georgia, "Times New Roman", Times, serif',
          textShadow: '0 0 30px rgba(255, 255, 255, 0.8), 0 0 15px rgba(167, 216, 209, 0.6), 0 0 5px rgba(255, 255, 255, 1)',
          color: '#ffffff'
        }}>
          Soullab
        </h2>
      </motion.div>

      {/* Main content */}
      <div className="w-full max-w-md mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-12 shadow-2xl text-center"
        >
          {renderSacredHoloflower()}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="space-y-6"
          >

            <div className="space-y-2">
              <h1 className="text-2xl font-light text-white tracking-wide" style={{
                fontFamily: 'Georgia, "Times New Roman", Times, serif',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                Welcome, we've been expecting you!
              </h1>
              <p className="text-white/90 text-sm font-light" style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
              }}>
                Enter your invitation code to begin
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setError('');
                  }}
                  placeholder="INVITATION-CODE"
                  className="w-full px-4 py-3 text-[#004D40] placeholder-[#004D40]/50 text-center font-mono text-sm focus:outline-none transition-colors uppercase"
                  style={{
                    background: 'linear-gradient(135deg, rgba(167, 216, 209, 0.25) 0%, rgba(128, 203, 196, 0.3) 50%, rgba(77, 182, 172, 0.35) 100%)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(167, 216, 209, 0.4)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(167, 216, 209, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                  }}
                  disabled={isValidating}
                  autoFocus
                />

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                type="submit"
                disabled={!passcode.trim() || isValidating}
                className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white rounded-xl font-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: !isValidating ? 1.02 : 1 }}
                whileTap={{ scale: !isValidating ? 0.98 : 1 }}
              >
                {isValidating ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    Enter
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="pt-4">
              <p className="text-white/40 text-xs">
                Need an invitation? Contact hello@soullab.life
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}