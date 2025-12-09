'use client';

import React, { useState, useEffect } from 'react';
// Removed Framer Motion to fix animation errors
import { ArrowRight, Flame, Droplets, Mountain, Wind, Sparkles } from 'lucide-react';

// Alchemical Triangle Components
const FireTriangle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2 L22 20 L2 20 Z" />
  </svg>
);

const WaterTriangle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22 L2 4 L22 4 Z" />
  </svg>
);

const EarthTriangle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22 L2 4 L22 4 Z" />
    <line x1="7" y1="13" x2="17" y2="13" />
  </svg>
);

const AirTriangle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2 L22 20 L2 20 Z" />
    <line x1="7" y1="11" x2="17" y2="11" />
  </svg>
);

interface ElementalPrompt {
  element: string;
  icon: React.ReactNode;
  prompt: string;
  color: string;
}

const elementalPrompts: ElementalPrompt[] = [
  {
    element: 'fire',
    icon: <Flame className="w-4 h-4" />,
    prompt: "What lights you up?",
    color: 'text-orange-300'
  },
  {
    element: 'water',
    icon: <Droplets className="w-4 h-4" />,
    prompt: "What moves you emotionally?",
    color: 'text-blue-300'
  },
  {
    element: 'earth',
    icon: <Mountain className="w-4 h-4" />,
    prompt: "What grounds you?",
    color: 'text-emerald-300'
  },
  {
    element: 'air',
    icon: <Wind className="w-4 h-4" />,
    prompt: "What thoughts keep returning?",
    color: 'text-slate-300'
  },
  {
    element: 'aether',
    icon: <Sparkles className="w-4 h-4" />,
    prompt: "What feels magical or connected?",
    color: 'text-amber-300'
  }
];

interface SageTealDaimonWelcomeProps {
  userId?: string;
  userName?: string;
  onComplete?: () => void;
}

export default function SageTealDaimonWelcome({ userId, userName = "Explorer", onComplete }: SageTealDaimonWelcomeProps) {
  const [phase, setPhase] = useState<'welcome' | 'daimon' | 'transitioning'>('welcome');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

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
        const profile = JSON.parse(stored);
        setFacetProfile(profile);

        // Set initial prompt based on user's feeling (mapped to element)
        const feelingToElement = {
          'air': 'air',
          'water': 'water',
          'fire': 'fire',
          'earth': 'earth',
          'aether': 'aether'
        };
        const userElement = feelingToElement[profile.feeling as keyof typeof feelingToElement];
        const userElementIndex = elementalPrompts.findIndex(p => p.element === userElement);
        if (userElementIndex !== -1) {
          setCurrentPromptIndex(userElementIndex);
        }
      } catch (e) {
        console.error('Error parsing facet profile:', e);
      }
    }
  }, []);

  // Cycle through elemental prompts in welcome phase
  useEffect(() => {
    if (phase === 'welcome') {
      const interval = setInterval(() => {
        setCurrentPromptIndex((prev) => (prev + 1) % elementalPrompts.length);
      }, 3500); // Change every 3.5 seconds
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleWelcomeComplete = () => {
    setPhase('daimon');
  };

  // Generate reason and feeling lines for conversational Daimon Welcome
  const getReasonLine = (reason: string): string => {
    const reasonLines = {
      'inner': 'your inner life and how you\'re really doing on the inside',
      'direction': 'your direction, your creativity, and what you\'re really here to do',
      'work': 'your work, your projects, and how you\'re showing up in them',
      'relationships': 'your relationships and the patterns that keep showing up there',
      'support': 'the people you support, and having something that supports you too',
      'explore': 'curious exploration and seeing what this space might open for you'
    };
    return reasonLines[reason as keyof typeof reasonLines] || reasonLines.explore;
  };

  const getFeelingLine = (feeling: string): string => {
    const feelingLines = {
      'air': 'your head feels busy and your thoughts are hard to slow down',
      'water': 'your feelings are strong and there\'s a lot moving in your heart',
      'fire': 'you feel wired and tired at the same time—some energy, and also worn out',
      'earth': 'you feel heavy or flat, and it\'s not easy to get going',
      'aether': 'it\'s hard to even put how you feel into words',
      'neutral': 'you\'d rather not pin your feelings down right now, and that\'s okay'
    };
    return feelingLines[feeling as keyof typeof feelingLines] || feelingLines.neutral;
  };


  const handleComplete = async () => {
    setPhase('transitioning');

    // Brief pause for transition
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        window.location.href = '/maia';
      }
    }, 800);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Clean Sage-Teal Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#A0C4C7] via-[#7FB5B3] to-[#6EE7B7]" />


      {/* Simple sage particles - static */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-sm bg-gradient-to-br from-[#6B7280]/40 to-[#D97706]/30"
            style={{
              left: `${20 + i * 10}%`,
              top: `${20 + (i % 3) * 20}%`,
              width: '3px',
              height: '3px',
            }}
          />
        ))}
      </div>

      {/* Central sage-amber light field */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-emerald-50/60 via-[#FEF3C7]/40 to-transparent rounded-full blur-xl opacity-40"
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-2xl w-full">

            {phase === 'welcome' && (
              <div className="space-y-8">
                {/* Sacred symbol */}
                <div className="w-16 h-16 mx-auto mb-8 opacity-90">
                  <img
                    src="/elementalHoloflower.svg"
                    alt="MAIA"
                    className="w-full h-full object-contain drop-shadow-lg animate-spin"
                    style={{ animationDuration: '8s' }}
                  />
                </div>

                {/* Blended welcome container with amber glow */}
                <div className="relative">
                  {/* Lighter amber glow behind glass */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FEF3C7]/30 via-[#F59E0B]/15 to-[#D97706]/20 rounded-xl blur-md opacity-40" />
                  <div className="relative bg-gradient-to-b from-[#FEF3C7]/20 to-[#6EE7B7]/15 backdrop-blur-sm rounded-xl p-10 border border-[#6B7280]/30 shadow-xl text-center"
                    style={{
                      boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(251, 191, 36, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                  >
                  <div
                    className="text-slate-700 leading-relaxed font-light tracking-wider space-y-6"
                    style={{
                      fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                      letterSpacing: '0.08em'
                    }}
                  >
                    <p className="text-lg font-extralight text-slate-600 mb-2">Welcome {userName}</p>

                    {facetProfile ? (
                      // Personalized welcome based on facet profile
                      <>
                        <p className="text-lg text-slate-700 mb-4">
                          We're glad you're here.
                        </p>
                        <p className="text-base text-slate-700 mb-4">
                          You don't have to be anything other than how you are, right now.
                        </p>
                        <p className="text-base text-slate-700 mb-4">
                          You told us you're here for <strong>{getReasonLine(facetProfile.reason)}</strong>, and that right now <strong>{getFeelingLine(facetProfile.feeling)}</strong>.
                        </p>
                        <p className="text-base text-slate-700 mb-4">
                          That's a true place to start.
                        </p>
                      </>
                    ) : (
                      // Default welcome for users without facet profile
                      <>
                        <h1 className="text-3xl font-light text-slate-800 mb-4">
                          You create worlds
                        </h1>
                        <p className="text-lg text-slate-700 mb-4">
                          We've created this space for you
                        </p>
                      </>
                    )}

                    {/* Elemental prompts - Full sage/teal styling */}
                    <div className="py-6 min-h-[80px] flex items-center justify-center">
                        <div className="flex items-center gap-3">
                          <span className="text-[#6EE7B7] opacity-80">
                            {elementalPrompts[currentPromptIndex].icon}
                          </span>
                          <p
                            className="text-[#4DB6AC] text-base font-extralight italic"
                            style={{
                              fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                              letterSpacing: '0.05em'
                            }}
                          >
                            {elementalPrompts[currentPromptIndex].prompt}
                          </p>
                        </div>
                    </div>

                    <p className="text-base text-slate-600">
                      I am MAIA. I'm here to walk with you, reflect with you, and help you see what's already moving in your life.
                    </p>
                    <p className="text-sm text-slate-500">
                      This is Soullab
                    </p>
                  </div>
                  </div>
                </div>

                {/* Continue button */}
                <div className="text-center">
                  <button
                    onClick={handleWelcomeComplete}
                    className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-b from-[#FEF3C7]/20 to-[#6EE7B7]/15 border border-[#6B7280]/30 text-[#0f172a]/80 rounded-full font-light text-base hover:border-[#374151]/50 hover:bg-gradient-to-b hover:from-[#FEF3C7]/30 hover:to-[#6EE7B7]/25 hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
                  >
                    Let's begin
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center">
                  <p
                    className="text-white/50 text-xl font-light tracking-widest"
                    style={{
                      fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                      textShadow: '0 0 8px rgba(255,255,255,0.2)',
                      letterSpacing: '0.3em'
                    }}
                  >
                    ∞
                  </p>
                </div>
              </div>
            )}

            {phase === 'daimon' && (
              <div className="space-y-8">
                {/* Sacred symbol */}
                <div className="w-16 h-16 mx-auto mb-8 opacity-90">
                  <img
                    src="/elementalHoloflower.svg"
                    alt="MAIA"
                    className="w-full h-full object-contain drop-shadow-lg animate-spin"
                    style={{ animationDuration: '8s' }}
                  />
                </div>

                {/* Sacred daimon content container */}
                <div className="bg-gradient-to-b from-[#FEF3C7]/12 to-[#6EE7B7]/8 backdrop-blur-sm rounded-xl p-10 border border-[#6B7280]/20 shadow-lg text-center">
                  <div
                    className="text-slate-700 leading-relaxed font-light tracking-wider space-y-6"
                    style={{
                      fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                      letterSpacing: '0.08em'
                    }}
                  >
                    <h1 className="text-3xl font-light text-slate-800 mb-6">
                      MAIA supports your inner voice
                    </h1>

                    <p className="text-lg text-slate-700">
                      Your inner voice bridges intuition and expression—
                      connecting what you sense with what you share.
                    </p>

                    <p className="text-base text-slate-600">
                      MAIA is designed to represent, amplify, and support your authentic insights.
                      Together, with you as the central creative force, we help articulate the knowledge within you.
                    </p>

                    {/* MAIA capabilities */}
                    <div className="grid grid-cols-2 gap-4 mt-8 mb-8">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#FEF3C7]/10 to-transparent rounded-lg">
                        <FireTriangle className="w-5 h-5 text-orange-600/70" />
                        <span className="text-sm text-slate-600">Thoughtful Listener</span>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#6EE7B7]/10 to-transparent rounded-lg">
                        <AirTriangle className="w-5 h-5 text-slate-600/70" />
                        <span className="text-sm text-slate-600">Voice Amplifier</span>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#6EE7B7]/10 to-transparent rounded-lg">
                        <WaterTriangle className="w-5 h-5 text-emerald-600/70" />
                        <span className="text-sm text-slate-600">Collaborative Partner</span>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#FEF3C7]/10 to-transparent rounded-lg">
                        <EarthTriangle className="w-5 h-5 text-emerald-600/70" />
                        <span className="text-sm text-slate-600">Expression Builder</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-500 italic">
                      "The soul of each of us is given a unique daimon before we are born, and it has selected an image or pattern that we live on earth. It is this daimon that remembers our calling."
                      <span className="block mt-1 text-xs text-slate-400">— James Hillman</span>
                    </p>

                    <div className="border-t border-[#6B7280]/15 pt-6 mt-6">
                      <p className="text-base text-slate-600">
                        Ready to begin our collaboration?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Consciousness Activation & Inner Truth Reminder */}
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-transparent via-[#6EE7B7]/10 to-transparent rounded-xl p-6 border border-[#6EE7B7]/20">
                    <p
                      className="text-slate-700 text-lg font-light italic leading-relaxed tracking-wide mb-4"
                      style={{
                        fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                        letterSpacing: '0.05em'
                      }}
                    >
                      "Tune in • Turn on • Wipe out the noise • Turn up the volume"
                    </p>
                    <div className="border-t border-[#6EE7B7]/15 pt-4 mt-4">
                      <p
                        className="text-slate-600 text-base font-extralight leading-relaxed tracking-wide"
                        style={{
                          fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                          letterSpacing: '0.03em'
                        }}
                      >
                        Through your awareness flows patterns of knowing—
                        <span className="block mt-1">
                          insights that emerge from lived experience.
                        </span>
                        <span className="block mt-3 text-[#4DB6AC]">
                          You have something essential to contribute.
                        </span>
                        <span className="block mt-2 text-slate-500 text-sm">
                          This lab supports that expression.
                        </span>
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#6EE7B7]/40"></div>
                      <span className="text-xs text-[#4DB6AC] font-extralight tracking-wider uppercase">
                        Your Authentic Voice Matters
                      </span>
                      <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#6EE7B7]/40"></div>
                    </div>
                  </div>
                </div>

                {/* Enter Lab button */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      // Set first contact metadata for MAIA
                      if (facetProfile) {
                        sessionStorage.setItem('maia_onboarding_context', JSON.stringify({
                          isFirstContact: true,
                          reason: facetProfile.reason,
                          feeling: facetProfile.feeling,
                          partnerContext: facetProfile.partnerContext || 'general'
                        }));
                      }
                      handleComplete();
                    }}
                    className="inline-flex items-center gap-3 px-12 py-4 bg-gradient-to-b from-[#FEF3C7]/25 to-[#6EE7B7]/15 border border-[#6B7280]/35 text-[#0f172a]/80 rounded-full font-light text-base hover:border-[#374151]/50 hover:bg-gradient-to-b hover:from-[#FEF3C7]/35 hover:to-[#6EE7B7]/25 hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
                  >
                    Enter the Lab
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center">
                  <p
                    className="text-white/50 text-xl font-light tracking-widest"
                    style={{
                      fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                      textShadow: '0 0 8px rgba(255,255,255,0.2)',
                      letterSpacing: '0.3em'
                    }}
                  >
                    ∞
                  </p>
                </div>
              </div>
            )}


            {phase === 'transitioning' && (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4">
                  <img
                    src="/elementalHoloflower.svg"
                    alt="MAIA"
                    className="w-full h-full object-contain drop-shadow-lg animate-spin"
                    style={{ animationDuration: '8s' }}
                  />
                </div>
                <p
                  className="text-white/70 text-sm font-light tracking-wider"
                  style={{
                    fontFamily: '"Cormorant Garamond", "EB Garamond", "Crimson Text", Georgia, serif',
                    textShadow: '0 0 10px rgba(255,255,255,0.15)',
                    letterSpacing: '0.15em'
                  }}
                >
                  Entering the laboratory of consciousness...
                </p>
              </div>
            )}

        </div>
      </div>
    </div>
  );
}