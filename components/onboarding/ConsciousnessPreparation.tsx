'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Heart, ChevronRight } from 'lucide-react';

interface ConsciousnessPreparationProps {
  userName?: string;
  onComplete: (data: {
    wisdomFacets?: string[];
    focusAreas?: string[];
    explorationIntent?: string;
  }) => void;
}

export function ConsciousnessPreparation({ userName = "Explorer", onComplete }: ConsciousnessPreparationProps) {
  const [wisdomFacets, setWisdomFacets] = useState<string[]>([]);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [explorationIntent, setExplorationIntent] = useState<string>('');

  const handleComplete = () => {
    // In disposable pixel philosophy, we gather just enough to serve the moment
    // and let the interaction teach us more than any form could predict
    onComplete({
      wisdomFacets: wisdomFacets.length > 0 ? wisdomFacets : undefined,
      focusAreas: focusAreas.length > 0 ? focusAreas : undefined,
      explorationIntent: explorationIntent.trim() || undefined
    });
  };

  return (
    <div className="min-h-screen bg-[#1a1f3a] flex items-center justify-center px-4 py-8">
      {/* Background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#F6AD55" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-black/30 backdrop-blur-md border border-amber-500/20 rounded-2xl p-8"
        >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-light text-amber-50">Understanding Your Perspective</h2>
              </div>
              <p className="text-amber-200/50 text-sm">
                Help us understand how you think, {userName}. These preferences guide the initial conversation style.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-amber-200/70 mb-3">
                  Which approaches resonate with you? (optional)
                </label>
                <p className="text-xs text-amber-200/40 mb-4">
                  Select the perspectives that interest you. This helps tailor the initial conversation style.
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {[
                    { id: 'maslow', emoji: '🏔️', label: 'Conditions & Capacity', desc: 'Building foundations, meeting needs' },
                    { id: 'frankl', emoji: '✨', label: 'Meaning & Purpose', desc: 'What calls you forward, soul work' },
                    { id: 'jung', emoji: '🌙', label: 'Psyche & Shadow', desc: 'Unconscious patterns, integration' },
                    { id: 'nietzsche', emoji: '⚡', label: 'Will & Transformation', desc: 'Creative destruction, becoming' },
                    { id: 'hesse', emoji: '🎭', label: 'Inner Pilgrimage', desc: 'Soul journey, spiritual quest' },
                    { id: 'tolstoy', emoji: '🌾', label: 'Moral Conscience', desc: 'Living your values, integrity' },
                    { id: 'brown', emoji: '💛', label: 'Courage & Vulnerability', desc: 'Shame work, authentic connection' },
                    { id: 'somatic', emoji: '🌿', label: 'Body Wisdom', desc: 'Embodiment, somatic knowing' },
                    { id: 'buddhist', emoji: '🧘', label: 'Mindfulness & Impermanence', desc: 'Letting go, present awareness' },
                    { id: 'integral', emoji: '🌐', label: 'Integral Synthesis', desc: 'Multiple perspectives, wholeness' }
                  ].map(facet => (
                    <label key={facet.id} className="flex items-start group cursor-pointer p-2 rounded-lg hover:bg-amber-500/5 transition-colors">
                      <input
                        type="checkbox"
                        checked={wisdomFacets.includes(facet.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWisdomFacets([...wisdomFacets, facet.id]);
                          } else {
                            setWisdomFacets(wisdomFacets.filter(f => f !== facet.id));
                          }
                        }}
                        className="mr-3 mt-1 rounded border-amber-500/30 bg-black/30 text-amber-500 focus:ring-amber-500/50"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{facet.emoji}</span>
                          <span className="text-sm text-amber-200/70 group-hover:text-amber-200/90 transition-colors font-medium">
                            {facet.label}
                          </span>
                        </div>
                        <p className="text-xs text-amber-200/40 mt-0.5">{facet.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-amber-200/30 mt-3">
                  Don't worry - you can explore all perspectives over time.
                </p>
              </div>

              <div>
                <label className="block text-sm text-amber-200/70 mb-3">
                  What brings you here? (optional)
                </label>
                <div className="space-y-2">
                  {[
                    'Self-discovery',
                    'Life transitions',
                    'Creative exploration',
                    'Spiritual growth',
                    'Personal healing',
                    'Relationship insights',
                    'Purpose & meaning',
                    'Just curious'
                  ].map(area => (
                    <label key={area} className="flex items-center group cursor-pointer">
                      <input
                        type="checkbox"
                        checked={focusAreas.includes(area)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFocusAreas([...focusAreas, area]);
                          } else {
                            setFocusAreas(focusAreas.filter(a => a !== area));
                          }
                        }}
                        className="mr-3 rounded border-amber-500/30 bg-black/30 text-amber-500 focus:ring-amber-500/50"
                      />
                      <span className="text-sm text-amber-200/60 group-hover:text-amber-200/80 transition-colors">
                        {area}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-amber-200/70 mb-3">
                  Share what's relevant about your current situation (optional)
                </label>
                <textarea
                  value={explorationIntent}
                  onChange={(e) => setExplorationIntent(e.target.value)}
                  placeholder="Your work, interests, what you're exploring, what brought you here..."
                  rows={4}
                  className="w-full px-4 py-3 bg-black/30 border border-amber-500/20 rounded-lg text-amber-50 placeholder-amber-200/30 focus:outline-none focus:border-amber-500/40 resize-none"
                />
                <p className="text-xs text-amber-200/30 mt-2">
                  This helps Maia understand your context and provide more relevant insights.
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center pt-6 border-t border-amber-500/20"
            >
              <button
                onClick={handleComplete}
                className="px-8 py-3 bg-gradient-to-r from-amber-500/80 to-amber-600/80 text-white rounded-lg hover:from-amber-500 hover:to-amber-600 transition-all flex items-center gap-2"
              >
                Continue to Maia
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default ConsciousnessPreparation;