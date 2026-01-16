'use client';

/**
 * AcademySheet
 * Bottom sheet for Soullab Academy - the daily companion for inner literacy
 *
 * Accessed via upper bar in MAIA. Provides quick access to:
 * - START HERE (foundational entry point)
 * - Continue (resume current sequence)
 * - Domains (6 domains of inner literacy)
 * - Paths (guided journeys)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  GraduationCap,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Compass,
  Eye,
  Heart,
  Brain,
  Sparkles,
  Users,
  Layers,
  Play,
  BookOpen,
  Map
} from 'lucide-react';
import { InnerLandsExplorer } from './InnerLandsExplorer';

interface AcademySheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSelectPrompt?: (promptId: string, domain: string) => void;
}

// Academy domains with their icons and colors
const DOMAINS = [
  {
    id: 'perception',
    name: 'Perception & Awareness',
    icon: Eye,
    color: 'sky',
    description: 'Learn to see before learning what to do'
  },
  {
    id: 'emotional',
    name: 'Emotional Intelligence',
    icon: Heart,
    color: 'rose',
    description: 'Build tolerance for feeling; allow without collapse'
  },
  {
    id: 'psychology',
    name: 'Psychology & Shadow',
    icon: Brain,
    color: 'violet',
    description: 'Pattern recognition and shadow integration'
  },
  {
    id: 'meaning',
    name: 'Meaning, Myth & Soul',
    icon: Sparkles,
    color: 'amber',
    description: 'Symbolic perception and meaning-making'
  },
  {
    id: 'relational',
    name: 'Relational Intelligence',
    icon: Users,
    color: 'emerald',
    description: 'Field awareness and resonance'
  },
  {
    id: 'integration',
    name: 'Integration & Worldcraft',
    icon: Layers,
    color: 'indigo',
    description: 'Ground wisdom in ethics; make care trustworthy'
  },
];

export function AcademySheet({
  isOpen,
  onClose,
  userId,
  onSelectPrompt,
}: AcademySheetProps) {
  const [showDomains, setShowDomains] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [showInnerLands, setShowInnerLands] = useState(false);
  const [showStartHere, setShowStartHere] = useState(false);

  // Mock progress data - would come from user's actual progress
  const hasStarted = false; // Would check localStorage/API
  const currentSequence = null; // Would show current prompt sequence

  const handleStartHere = () => {
    setShowStartHere(true);
  };

  const handleDomainSelect = (domainId: string) => {
    setSelectedDomain(domainId);
    // Could expand to show domain prompts
  };

  const handleContinue = () => {
    window.dispatchEvent(new CustomEvent('academyNavigate', {
      detail: { destination: 'continue' }
    }));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-stone-900 to-black border-t border-amber-500/30 rounded-t-3xl z-[9999] max-h-[85vh] overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-amber-500/40 rounded-full mx-auto mt-3" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white">Academy</h2>
                  <p className="text-xs text-stone-400">Inner literacy, one prompt at a time</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-6 overflow-y-auto max-h-[calc(85vh-100px)]">

              {/* Primary Action: START HERE */}
              <motion.button
                onClick={handleStartHere}
                className="w-full p-4 mb-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20
                         border border-amber-500/40 hover:border-amber-500/60
                         flex items-center gap-3 group transition-all"
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-2 rounded-lg bg-amber-500/30 group-hover:bg-amber-500/40 transition-colors">
                  <Compass className="w-5 h-5 text-amber-300" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-amber-200 font-medium">START HERE</div>
                  <div className="text-amber-400/70 text-xs">How to walk this terrain</div>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-400/50 group-hover:text-amber-400 transition-colors" />
              </motion.button>

              {/* Inner Lands - Young Explorer Entry */}
              <motion.button
                onClick={() => setShowInnerLands(true)}
                className="w-full p-4 mb-3 rounded-xl bg-gradient-to-r from-slate-800/80 to-stone-800/80
                         border border-slate-600/40 hover:border-slate-500/60
                         flex items-center gap-3 group transition-all"
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-2 rounded-lg bg-slate-700/50 group-hover:bg-slate-600/50 transition-colors">
                  <Map className="w-5 h-5 text-slate-300" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-slate-200 font-medium">The Inner Lands</div>
                  <div className="text-slate-400/70 text-xs">Six places. No tutorial.</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500/50 group-hover:text-slate-400 transition-colors" />
              </motion.button>

              {/* Continue Button - only show if user has started */}
              {hasStarted && currentSequence && (
                <motion.button
                  onClick={handleContinue}
                  className="w-full p-3 mb-3 rounded-xl bg-stone-800/50
                           border border-stone-700/50 hover:border-amber-500/30
                           flex items-center gap-3 group transition-all"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-2 rounded-lg bg-stone-700/50">
                    <Play className="w-4 h-4 text-stone-300" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-stone-200 text-sm font-medium">Continue</div>
                    <div className="text-stone-400 text-xs">{currentSequence}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-stone-300 transition-colors" />
                </motion.button>
              )}

              {/* Domains Section */}
              <div className="mt-4">
                <button
                  onClick={() => setShowDomains(!showDomains)}
                  className="w-full flex items-center justify-between p-3 rounded-xl
                           bg-stone-800/30 hover:bg-stone-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-300 text-sm font-medium">Domains</span>
                    <span className="text-stone-500 text-xs">6 territories of inner work</span>
                  </div>
                  <motion.div
                    animate={{ rotate: showDomains ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-stone-500" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showDomains && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 space-y-2">
                        {DOMAINS.map((domain) => {
                          const Icon = domain.icon;
                          const colorClasses = {
                            sky: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
                            rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
                            violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
                            amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                            emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                            indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
                          }[domain.color];

                          return (
                            <motion.button
                              key={domain.id}
                              onClick={() => handleDomainSelect(domain.id)}
                              className={`w-full p-3 rounded-xl border flex items-center gap-3
                                       hover:bg-white/5 transition-all ${colorClasses}`}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Icon className="w-4 h-4 flex-shrink-0" />
                              <div className="flex-1 text-left">
                                <div className="text-sm font-medium text-white">{domain.name}</div>
                                <div className="text-xs opacity-70">{domain.description}</div>
                              </div>
                              <ChevronRight className="w-4 h-4 opacity-50" />
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer text */}
              <p className="text-center text-xs text-stone-500 mt-6">
                You can explore on your own, or ask MAIA for guidance
              </p>
            </div>
          </motion.div>
        </>
      )}

      {/* Inner Lands Explorer - Full screen overlay */}
      <AnimatePresence>
        {showInnerLands && (
          <InnerLandsExplorer
            onClose={() => setShowInnerLands(false)}
            onAskMaia={(content) => {
              setShowInnerLands(false);
              onClose();
              // Dispatch event for MAIA to handle
              window.dispatchEvent(new CustomEvent('innerLandsAskMaia', {
                detail: { content }
              }));
            }}
          />
        )}
      </AnimatePresence>

      {/* START HERE - Full screen overlay */}
      <AnimatePresence>
        {showStartHere && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black"
          >
            <div className="h-full flex flex-col bg-gradient-to-b from-amber-950/30 via-stone-900 to-black">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-amber-500/20">
                <button
                  onClick={() => setShowStartHere(false)}
                  className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm">Back</span>
                </button>
                <button
                  onClick={() => {
                    setShowStartHere(false);
                    onClose();
                  }}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-md mx-auto">
                  <Compass className="w-10 h-10 text-amber-400 mb-4" />
                  <h1 className="text-2xl font-medium text-white mb-2">How to Walk This Terrain</h1>
                  <p className="text-amber-400/70 text-sm mb-8">Before you explore</p>

                  <div className="space-y-6 text-stone-300 text-sm leading-relaxed">
                    <p>
                      The Academy is a collection of <span className="text-amber-300">prompts</span> — questions
                      designed to help you look at something you might not usually look at.
                    </p>

                    <p>
                      Explore at your own pace. Pick a domain, pick a prompt, sit with it.
                      Or ask MAIA to guide you based on where you are right now.
                    </p>

                    <div className="p-4 rounded-lg bg-stone-800/50 border border-stone-700/50">
                      <p className="text-stone-400 text-xs mb-2">What helps most:</p>
                      <p className="text-white">
                        Be honest with yourself. Not performatively honest. Actually honest.
                      </p>
                    </div>

                    <p>
                      Some prompts will land. Some won't. Skip what doesn't fit.
                      Return to what does.
                    </p>

                    <p className="text-stone-500">
                      There's no finish line. Just clearer seeing.
                    </p>
                  </div>

                  {/* Entry points */}
                  <div className="mt-10 space-y-3">
                    <p className="text-stone-500 text-xs uppercase tracking-wider mb-3">Where to begin</p>

                    <motion.button
                      onClick={() => {
                        setShowStartHere(false);
                        setShowInnerLands(true);
                      }}
                      className="w-full p-4 rounded-xl bg-slate-800/50 border border-slate-600/40
                               hover:border-slate-500/60 flex items-center gap-3 text-left transition-all"
                      whileTap={{ scale: 0.98 }}
                    >
                      <Map className="w-5 h-5 text-slate-300" />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">The Inner Lands</div>
                        <div className="text-slate-400 text-xs">Six places to explore</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        setShowStartHere(false);
                        setShowDomains(true);
                      }}
                      className="w-full p-4 rounded-xl bg-stone-800/50 border border-stone-700/40
                               hover:border-stone-600/60 flex items-center gap-3 text-left transition-all"
                      whileTap={{ scale: 0.98 }}
                    >
                      <BookOpen className="w-5 h-5 text-stone-400" />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">Browse Domains</div>
                        <div className="text-stone-500 text-xs">Six territories of inner work</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-500" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}
