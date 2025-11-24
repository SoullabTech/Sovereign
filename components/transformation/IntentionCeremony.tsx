'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntentionCeremonyProps {
  name: string;
  onComplete: (intention: {
    primary: string;
    depth: string;
    commitment: string;
  }) => void;
}

export function IntentionCeremony({ name, onComplete }: IntentionCeremonyProps) {
  const [currentPhase, setCurrentPhase] = useState<'welcome' | 'exploration' | 'commitment'>('welcome');
  const [selectedIntention, setSelectedIntention] = useState<string>('');
  const [depthLevel, setDepthLevel] = useState<string>('');
  const [commitment, setCommitment] = useState<string>('');
  const [consciousness, setConsciousness] = useState(0);
  const [navyGradient, setNavyGradient] = useState(0);

  // Sacred consciousness breathing effect with navy deepening
  useEffect(() => {
    const interval = setInterval(() => {
      setConsciousness(c => (c + 1) % 100);
      setNavyGradient(n => Math.min(n + 0.5, 100)); // Gradual shift to navy
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const intentionOptions = [
    {
      id: 'understanding',
      label: 'Seeking deeper self-understanding',
      description: 'Explore the landscapes of your inner world',
      wisdom: 'The oracle at Delphi inscribed: "Know thyself"'
    },
    {
      id: 'transition',
      label: 'Navigating a life transition',
      description: 'Find guidance through change and transformation',
      wisdom: 'In every ending lies the seed of new beginning'
    },
    {
      id: 'creativity',
      label: 'Exploring creative expression',
      description: 'Unlock your authentic creative voice',
      wisdom: 'Creativity is the soul speaking its truth'
    },
    {
      id: 'emotional',
      label: 'Processing emotional experience',
      description: 'Integrate and understand your emotional wisdom',
      wisdom: 'Emotions are the language of the soul'
    },
    {
      id: 'wisdom',
      label: 'Cultivating inner wisdom',
      description: 'Develop your capacity for discernment and insight',
      wisdom: 'Wisdom arises from the marriage of knowledge and experience'
    },
    {
      id: 'curiosity',
      label: 'Simply curious about consciousness',
      description: 'Explore the mystery of awareness itself',
      wisdom: 'Wonder is the beginning of wisdom'
    }
  ];

  const depthOptions = [
    {
      id: 'gentle',
      label: 'Gentle exploration',
      description: 'Thoughtful, careful discovery at a comfortable pace'
    },
    {
      id: 'moderate',
      label: 'Meaningful inquiry',
      description: 'Substantial exploration with psychological depth'
    },
    {
      id: 'deep',
      label: 'Deep investigation',
      description: 'Profound exploration of unconscious patterns and shadows'
    }
  ];

  const commitmentOptions = [
    {
      id: 'open',
      label: 'Open to whatever emerges',
      description: 'Trust the process and follow where it leads'
    },
    {
      id: 'focused',
      label: 'Focused on specific growth',
      description: 'Work systematically toward particular insights'
    },
    {
      id: 'transformational',
      label: 'Ready for transformation',
      description: 'Embrace deep change and new ways of being'
    }
  ];

  const handleIntentionSelect = (intentionId: string) => {
    setSelectedIntention(intentionId);
    setTimeout(() => setCurrentPhase('exploration'), 1500);
  };

  const handleDepthSelect = (depth: string) => {
    setDepthLevel(depth);
    setTimeout(() => setCurrentPhase('commitment'), 1500);
  };

  const handleCommitmentSelect = (commitmentLevel: string) => {
    setCommitment(commitmentLevel);

    // Sacred pause before completion
    setTimeout(() => {
      onComplete({
        primary: selectedIntention,
        depth: depthLevel,
        commitment: commitmentLevel
      });
    }, 2000);
  };

  // Dynamic background based on navy gradient progression
  const backgroundStyle = {
    background: `linear-gradient(135deg,
      ${navyGradient < 30 ? '#86efac' : '#059669'} 0%,
      ${navyGradient < 50 ? '#34d399' : '#0f766e'} 25%,
      ${navyGradient < 70 ? '#059669' : '#1e40af'} 50%,
      ${navyGradient < 90 ? '#0f766e' : '#1d4ed8'} 75%,
      ${navyGradient >= 90 ? '#1e3a8a' : '#1e40af'} 100%
    )`,
    transition: 'background 4s cubic-bezier(0.25, 0.1, 0.25, 1)'
  };

  const consciousnessGlow = {
    filter: `brightness(${1 + Math.sin(consciousness * 0.1) * 0.3}) hue-rotate(${navyGradient * 2}deg)`,
    transform: `scale(${1 + Math.sin(consciousness * 0.08) * 0.05})`,
  };

  const selectedIntentionData = intentionOptions.find(opt => opt.id === selectedIntention);

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Dynamic Sacred Background */}
      <div
        className="absolute inset-0 transition-all duration-[4000ms]"
        style={backgroundStyle}
      />

      {/* Sacred Geometry Layer - Evolving Holoflower */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={consciousnessGlow}
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        >
          <svg width="140" height="140" viewBox="0 0 140 140">
            <defs>
              <radialGradient id="intentionGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fde047" stopOpacity="0.9" />
                <stop offset="30%" stopColor={navyGradient > 50 ? "#3b82f6" : "#22c55e"} stopOpacity="0.7" />
                <stop offset="60%" stopColor={navyGradient > 70 ? "#1e40af" : "#14b8a6"} stopOpacity="0.5" />
                <stop offset="100%" stopColor={navyGradient > 80 ? "#1e293b" : "#0f766e"} stopOpacity="0.3" />
              </radialGradient>
              <filter id="intentionBlur">
                <feGaussianBlur stdDeviation="1.5" />
              </filter>
            </defs>

            {/* Sacred Holoflower - Deepening Geometry */}
            <g transform="translate(70,70)">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.path
                  key={i}
                  d="M0,-35 Q-18,-25 -25,0 Q-18,25 0,35 Q18,25 25,0 Q18,-25 0,-35"
                  fill="url(#intentionGlow)"
                  filter="url(#intentionBlur)"
                  transform={`rotate(${i * 60})`}
                  animate={{
                    opacity: [0.3, 0.9, 0.3],
                    scale: [0.8 + navyGradient * 0.003, 1.3 + navyGradient * 0.003, 0.8 + navyGradient * 0.003]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                />
              ))}

              {/* Center consciousness point - growing more defined */}
              <circle
                cx="0"
                cy="0"
                r={3 + navyGradient * 0.05}
                fill={navyGradient > 60 ? "#1e40af" : "#fde047"}
                opacity="0.95"
              />

              {/* Inner geometry emerges */}
              {navyGradient > 40 && (
                <motion.circle
                  cx="0"
                  cy="0"
                  r="15"
                  fill="none"
                  stroke={navyGradient > 70 ? "#3b82f6" : "#14b8a6"}
                  strokeWidth="1"
                  opacity="0.4"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 6, repeat: Infinity }}
                />
              )}
            </g>
          </svg>
        </motion.div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Header - Deepening Presence */}
        <div className="pt-16 pb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
          >
            <h1 className={`text-2xl font-light tracking-[0.2em] mb-2 transition-colors duration-3000 ${
              navyGradient > 60 ? 'text-white' : 'text-sage-900'
            }`}>
              SACRED INTENTION
            </h1>
            <div className={`w-20 h-[1px] mx-auto opacity-60 transition-colors duration-3000 ${
              navyGradient > 60 ? 'bg-blue-300' : 'bg-sage-600'
            }`} />
          </motion.div>
        </div>

        {/* Sacred Ceremony Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-16">

          <AnimatePresence mode="wait">

            {/* Phase 1: Welcome Deepening */}
            {currentPhase === 'welcome' && (
              <motion.div
                key="welcome"
                className="max-w-2xl text-center space-y-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 1.5 }}
              >
                <div className="space-y-8">
                  <h2 className={`text-4xl font-light font-serif leading-relaxed transition-colors duration-3000 ${
                    navyGradient > 60 ? 'text-white' : 'text-sage-900'
                  }`}>
                    Welcome, {name}
                  </h2>

                  <div className="space-y-6">
                    <p className={`text-xl font-light leading-relaxed transition-colors duration-3000 ${
                      navyGradient > 60 ? 'text-blue-100' : 'text-sage-700'
                    }`}>
                      Every transformational journey begins with intention.
                    </p>

                    <p className={`text-lg font-light leading-relaxed transition-colors duration-3000 ${
                      navyGradient > 60 ? 'text-blue-200' : 'text-sage-600'
                    }`}>
                      MAIA will become your guide through the landscape of consciousness,
                      drawing from depth psychology, contemplative tradition, and somatic wisdom.
                    </p>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2, duration: 1 }}
                  className="space-y-8"
                >
                  <p className={`text-lg font-light italic transition-colors duration-3000 ${
                    navyGradient > 60 ? 'text-blue-200' : 'text-sage-700'
                  }`}>
                    What draws you to this threshold?
                  </p>

                  <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto">
                    {intentionOptions.map((intention, index) => (
                      <motion.button
                        key={intention.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.5 + index * 0.2 }}
                        onClick={() => handleIntentionSelect(intention.id)}
                        className={`group relative p-6 text-left rounded-none border transition-all duration-700
                                   hover:scale-105 hover:shadow-xl ${
                          navyGradient > 60
                            ? 'bg-navy-900/20 border-blue-400/30 hover:bg-navy-800/30 hover:border-blue-300/50'
                            : 'bg-white/40 border-sage-200/50 hover:bg-sage-50/60 hover:border-sage-400/60'
                        }`}
                      >
                        <h3 className={`font-medium mb-2 transition-colors duration-700 ${
                          navyGradient > 60 ? 'text-white' : 'text-sage-900'
                        }`}>
                          {intention.label}
                        </h3>

                        <p className={`text-sm font-light leading-relaxed transition-colors duration-700 ${
                          navyGradient > 60 ? 'text-blue-100' : 'text-sage-600'
                        }`}>
                          {intention.description}
                        </p>

                        <div className={`mt-3 pt-3 border-t text-xs italic font-light transition-colors duration-700 ${
                          navyGradient > 60
                            ? 'border-blue-400/20 text-blue-200'
                            : 'border-sage-300/40 text-sage-500'
                        }`}>
                          {intention.wisdom}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Phase 2: Depth Exploration */}
            {currentPhase === 'exploration' && selectedIntentionData && (
              <motion.div
                key="exploration"
                className="max-w-xl text-center space-y-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 1.2 }}
              >
                <div className="space-y-6">
                  <h2 className={`text-3xl font-light font-serif transition-colors duration-3000 ${
                    navyGradient > 60 ? 'text-white' : 'text-sage-900'
                  }`}>
                    {selectedIntentionData.label}
                  </h2>

                  <p className={`text-lg font-light italic leading-relaxed transition-colors duration-3000 ${
                    navyGradient > 60 ? 'text-blue-100' : 'text-sage-600'
                  }`}>
                    "{selectedIntentionData.wisdom}"
                  </p>

                  <p className={`text-base font-light leading-relaxed transition-colors duration-3000 ${
                    navyGradient > 60 ? 'text-blue-200' : 'text-sage-700'
                  }`}>
                    How deeply would you like to explore this territory?
                  </p>
                </div>

                <div className="space-y-4">
                  {depthOptions.map((depth, index) => (
                    <motion.button
                      key={depth.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.3 }}
                      onClick={() => handleDepthSelect(depth.id)}
                      className={`w-full p-5 text-left rounded-none border transition-all duration-700
                                 hover:scale-105 hover:shadow-lg ${
                        navyGradient > 60
                          ? 'bg-navy-900/25 border-blue-400/40 hover:bg-navy-800/35 hover:border-blue-300/60'
                          : 'bg-white/50 border-sage-200/60 hover:bg-sage-50/70 hover:border-sage-400/70'
                      }`}
                    >
                      <h3 className={`font-medium mb-2 transition-colors duration-700 ${
                        navyGradient > 60 ? 'text-white' : 'text-sage-900'
                      }`}>
                        {depth.label}
                      </h3>

                      <p className={`text-sm font-light leading-relaxed transition-colors duration-700 ${
                        navyGradient > 60 ? 'text-blue-100' : 'text-sage-600'
                      }`}>
                        {depth.description}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Phase 3: Sacred Commitment */}
            {currentPhase === 'commitment' && (
              <motion.div
                key="commitment"
                className="max-w-xl text-center space-y-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 1.2 }}
              >
                <div className="space-y-6">
                  <h2 className={`text-3xl font-light font-serif transition-colors duration-3000 ${
                    navyGradient > 60 ? 'text-white' : 'text-sage-900'
                  }`}>
                    Sacred Commitment
                  </h2>

                  <p className={`text-lg font-light leading-relaxed transition-colors duration-3000 ${
                    navyGradient > 60 ? 'text-blue-200' : 'text-sage-700'
                  }`}>
                    Transformation requires presence, patience, and trust in the process.
                    How do you wish to engage with this exploration?
                  </p>
                </div>

                <div className="space-y-4">
                  {commitmentOptions.map((level, index) => (
                    <motion.button
                      key={level.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.3 }}
                      onClick={() => handleCommitmentSelect(level.id)}
                      className={`w-full p-6 text-left rounded-none border transition-all duration-700
                                 hover:scale-105 hover:shadow-lg ${
                        navyGradient > 60
                          ? 'bg-navy-900/30 border-blue-400/50 hover:bg-navy-800/40 hover:border-blue-300/70'
                          : 'bg-white/60 border-sage-200/70 hover:bg-sage-50/80 hover:border-sage-400/80'
                      }`}
                    >
                      <h3 className={`font-medium mb-2 transition-colors duration-700 ${
                        navyGradient > 60 ? 'text-white' : 'text-sage-900'
                      }`}>
                        {level.label}
                      </h3>

                      <p className={`text-sm font-light leading-relaxed transition-colors duration-700 ${
                        navyGradient > 60 ? 'text-blue-100' : 'text-sage-600'
                      }`}>
                        {level.description}
                      </p>
                    </motion.button>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="pt-6"
                >
                  <p className={`text-sm font-light italic transition-colors duration-3000 ${
                    navyGradient > 60 ? 'text-blue-300' : 'text-sage-500'
                  }`}>
                    Your choices create the container for transformation
                  </p>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Sacred Footer */}
        <div className="pb-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 2 }}
            className={`text-xs font-light tracking-wide transition-colors duration-3000 ${
              navyGradient > 60 ? 'text-blue-400' : 'text-sage-400'
            }`}
          >
            Depth reveals itself to those who seek with sincerity
          </motion.div>
        </div>

      </div>
    </div>
  );
}