'use client';

/**
 * AcademySheet
 * Bottom sheet for Soullab Academy - the daily companion for inner literacy
 *
 * Accessed via upper bar in MAIA. Provides quick access to:
 * - START HERE (foundational entry point)
 * - Continue (resume current sequence)
 * - Domains (6 domains of inner literacy with flat prompt lists)
 * - The Inner Lands (immersive exploration)
 */

import { useState, useEffect, useRef } from 'react';
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
  Map,
  MessageCircle,
  Send,
  Loader2
} from 'lucide-react';
import { InnerLandsExplorer } from './InnerLandsExplorer';
import { DOMAINS as DOMAIN_DATA, getDomainById, type Domain, type DomainPrompt } from '@/lib/academy/domainPrompts';
import { handleNameChangeResponse } from '@/lib/services/greetingService';
import {
  getDomainTraceStore,
  hasDomainTrace,
  recordDomainEntry,
  recordPromptOpen,
  recordDomainMaiaContact,
  type DomainTraceStore
} from '@/lib/academy/domainTrace';

interface AcademySheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSelectPrompt?: (promptId: string, domain: string) => void;
}

// Color mapping for domain styles - Tailwind needs static classes
const DOMAIN_COLORS: Record<string, {
  icon: string;
  text: string;
  textMuted: string;
  bgButton: string;
  borderButton: string;
  borderButtonHover: string;
  markRing: string;
  markGlow: string;
}> = {
  sky: {
    icon: 'text-sky-400',
    text: 'text-sky-200',
    textMuted: 'text-sky-400/70',
    bgButton: 'bg-sky-500/20',
    borderButton: 'border-sky-500/40',
    borderButtonHover: 'hover:border-sky-500/60',
    markRing: 'border-sky-400/50',
    markGlow: 'rgba(56, 189, 248, 0.2)',
  },
  rose: {
    icon: 'text-rose-400',
    text: 'text-rose-200',
    textMuted: 'text-rose-400/70',
    bgButton: 'bg-rose-500/20',
    borderButton: 'border-rose-500/40',
    borderButtonHover: 'hover:border-rose-500/60',
    markRing: 'border-rose-400/50',
    markGlow: 'rgba(251, 113, 133, 0.2)',
  },
  violet: {
    icon: 'text-violet-400',
    text: 'text-violet-200',
    textMuted: 'text-violet-400/70',
    bgButton: 'bg-violet-500/20',
    borderButton: 'border-violet-500/40',
    borderButtonHover: 'hover:border-violet-500/60',
    markRing: 'border-violet-400/50',
    markGlow: 'rgba(167, 139, 250, 0.2)',
  },
  amber: {
    icon: 'text-amber-400',
    text: 'text-amber-200',
    textMuted: 'text-amber-400/70',
    bgButton: 'bg-amber-500/20',
    borderButton: 'border-amber-500/40',
    borderButtonHover: 'hover:border-amber-500/60',
    markRing: 'border-amber-400/50',
    markGlow: 'rgba(251, 191, 36, 0.2)',
  },
  emerald: {
    icon: 'text-emerald-400',
    text: 'text-emerald-200',
    textMuted: 'text-emerald-400/70',
    bgButton: 'bg-emerald-500/20',
    borderButton: 'border-emerald-500/40',
    borderButtonHover: 'hover:border-emerald-500/60',
    markRing: 'border-emerald-400/50',
    markGlow: 'rgba(52, 211, 153, 0.2)',
  },
  indigo: {
    icon: 'text-indigo-400',
    text: 'text-indigo-200',
    textMuted: 'text-indigo-400/70',
    bgButton: 'bg-indigo-500/20',
    borderButton: 'border-indigo-500/40',
    borderButtonHover: 'hover:border-indigo-500/60',
    markRing: 'border-indigo-400/50',
    markGlow: 'rgba(129, 140, 248, 0.2)',
  },
};

// The Mark component - hollow ring with domain-colored inner glow
// Shows binary "you were here" indicator
function TraceMark({ color }: { color: string }) {
  const colorConfig = DOMAIN_COLORS[color] || DOMAIN_COLORS.amber;

  return (
    <div
      className={`w-2 h-2 rounded-full border ${colorConfig.markRing}`}
      style={{
        width: '8px',
        height: '8px',
        boxShadow: `inset 0 0 3px ${colorConfig.markGlow}`,
      }}
    />
  );
}

export function AcademySheet({
  isOpen,
  onClose,
  userId,
  onSelectPrompt,
}: AcademySheetProps) {
  const [showDomains, setShowDomains] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<DomainPrompt | null>(null);
  const [showInnerLands, setShowInnerLands] = useState(false);
  const [showStartHere, setShowStartHere] = useState(false);
  const [traceStore, setTraceStore] = useState<DomainTraceStore>({ version: 1, entries: {} });

  // Inline chat state
  type ChatMessage = { role: 'user' | 'maia'; content: string; timestamp: string };
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId] = useState(() => `soullab-${Date.now()}`);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Mock progress data - would come from user's actual progress
  const hasStarted = false; // Would check localStorage/API
  const currentSequence = null; // Would show current prompt sequence

  // Read developmental tier for Inner Lands gating
  const [developmentalTier, setDevelopmentalTier] = useState<'under13' | 'tier2' | 'tier3' | 'adult' | undefined>();
  useEffect(() => {
    try {
      const betaUser = localStorage.getItem('beta_user');
      if (betaUser) {
        const parsed = JSON.parse(betaUser);
        if (parsed.developmentalTier) {
          setDevelopmentalTier(parsed.developmentalTier);
        }
      }
    } catch (e) { /* ignore */ }
  }, []);

  // Load trace store on mount and when domain/prompt changes
  useEffect(() => {
    setTraceStore(getDomainTraceStore());
  }, [selectedDomain, selectedPrompt]);

  // Record domain entry when viewing a domain
  useEffect(() => {
    if (selectedDomain) {
      recordDomainEntry(selectedDomain.id);
      setTraceStore(getDomainTraceStore());
    }
  }, [selectedDomain]);

  // Record prompt open when viewing a prompt
  useEffect(() => {
    if (selectedDomain && selectedPrompt) {
      recordPromptOpen(selectedDomain.id, selectedPrompt.id);
      setTraceStore(getDomainTraceStore());
    }
  }, [selectedDomain, selectedPrompt]);

  // Clear chat when prompt changes
  useEffect(() => {
    setChatMessages([]);
    setChatInput('');
  }, [selectedPrompt?.id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Send message to MAIA inline
  const sendChatMessage = async () => {
    if (!chatInput.trim() || !selectedDomain || !selectedPrompt || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatLoading(true);

    // Add user message
    setChatMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    // Record MAIA contact
    recordDomainMaiaContact(selectedDomain.id, selectedPrompt.id);

    try {
      // Build context with prompt
      const contextMessage = chatMessages.length === 0
        ? `[Soullab - ${selectedDomain.name}]\n\nI'm reflecting on this prompt:\n"${selectedPrompt.prompt}"\n\nMy response: ${userMessage}`
        : userMessage;

      const res = await fetch('/api/sovereign/app/maia/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: contextMessage,
          sessionId,
          userId,
          conversationHistory: chatMessages.map(m => ({
            role: m.role === 'maia' ? 'assistant' : 'user',
            content: m.content
          })),
          consciousnessContext: {
            source: 'soullab',
            domain: selectedDomain.name,
            promptId: selectedPrompt.id,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (res.ok) {
        const data = await res.json();

        // Handle name change if user said "call me X"
        handleNameChangeResponse(data.metadata);

        setChatMessages(prev => [...prev, {
          role: 'maia',
          content: data.message || "I'm here with you.",
          timestamp: new Date().toISOString()
        }]);
      } else {
        setChatMessages(prev => [...prev, {
          role: 'maia',
          content: "I'm here, though the connection feels distant. Take your time.",
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => [...prev, {
        role: 'maia',
        content: "I'm here, though the connection feels distant. Take your time.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleStartHere = () => {
    setShowStartHere(true);
  };

  const handleDomainSelect = (domainId: string) => {
    const domain = getDomainById(domainId);
    if (domain) {
      setSelectedDomain(domain);
    }
  };

  const handlePromptSelect = (prompt: DomainPrompt) => {
    setSelectedPrompt(prompt);
  };

  const handleAskMaia = () => {
    if (!selectedDomain || !selectedPrompt) return;

    // Record MAIA contact
    recordDomainMaiaContact(selectedDomain.id, selectedPrompt.id);

    // Build context for MAIA
    const content = `I'm exploring ${selectedDomain.name}. This prompt resonated:\n\n"${selectedPrompt.prompt}"`;

    // Close views and dispatch to MAIA
    setSelectedPrompt(null);
    setSelectedDomain(null);
    onClose();

    window.dispatchEvent(new CustomEvent('domainAskMaia', {
      detail: { content }
    }));
  };

  const handleContinue = () => {
    window.dispatchEvent(new CustomEvent('academyNavigate', {
      detail: { destination: 'continue' }
    }));
    onClose();
  };

  // Check if a prompt has been touched
  const hasPromptTrace = (domainId: string, promptId: string): boolean => {
    return hasDomainTrace(traceStore, `prompt:${domainId}:${promptId}`);
  };

  return (
    <>
      {/* Each overlay below owns its own AnimatePresence. They must be siblings,
          not children of one — AnimatePresence keys children by `child.key || ""`,
          so unkeyed sibling overlays would all collapse to the same "" key. */}
      <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="academy-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            key="academy-sheet"
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
                  <h2 className="text-lg font-medium text-white">Soullab</h2>
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
                        {DOMAIN_DATA.map((domain) => {
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
      </AnimatePresence>

      {/* Inner Lands Explorer - Full screen overlay */}
      <AnimatePresence>
        {showInnerLands && (
          <InnerLandsExplorer
            onClose={() => setShowInnerLands(false)}
            developmentalTier={developmentalTier}
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
                      This is a collection of <span className="text-amber-300">prompts</span> — questions
                      designed to help you look at something you might not usually look at.
                    </p>

                    <p>
                      Explore at your own pace. Pick a domain, pick a prompt, sit with it.
                      Or ask MAIA to guide you based on where you are right now.
                    </p>

                    <div className="p-4 rounded-lg bg-stone-800/50 border border-stone-700/50">
                      <p className="text-stone-400 text-xs mb-2">At the heart of this:</p>
                      <p className="text-white">
                        Honesty with yourself. Not the performative kind — the quiet, private kind.
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

      {/* Domain Prompts View - Full screen overlay */}
      <AnimatePresence>
        {selectedDomain && !selectedPrompt && (() => {
          const colors = DOMAIN_COLORS[selectedDomain.color] || DOMAIN_COLORS.amber;
          const DomainIcon = selectedDomain.icon;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black"
            >
              <div className={`h-full flex flex-col bg-gradient-to-b ${selectedDomain.bgGradient} via-stone-900 to-black`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <button
                    onClick={() => setSelectedDomain(null)}
                    className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm">Back</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDomain(null);
                      onClose();
                    }}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-stone-400" />
                  </button>
                </div>

                {/* Domain Header */}
                <div className="px-6 py-6">
                  <div className="flex items-center gap-3 mb-2">
                    <DomainIcon className={`w-6 h-6 ${colors.icon}`} />
                    <h1 className="text-xl font-medium text-white">{selectedDomain.name}</h1>
                  </div>
                  <p className={`${colors.textMuted} text-sm`}>{selectedDomain.description}</p>
                </div>

                {/* Prompts List */}
                <div className="flex-1 overflow-y-auto px-4 pb-6">
                  <div className="space-y-2">
                    {selectedDomain.prompts.map((prompt) => {
                      const hasTouched = hasPromptTrace(selectedDomain.id, prompt.id);
                      return (
                        <motion.button
                          key={prompt.id}
                          onClick={() => handlePromptSelect(prompt)}
                          className="w-full p-4 rounded-xl bg-stone-800/50 border border-stone-700/40
                                   hover:border-stone-600/60 flex items-start gap-3 text-left transition-all"
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {hasTouched && <TraceMark color={selectedDomain.color} />}
                              <div className="text-white text-sm font-medium">{prompt.title}</div>
                            </div>
                            <div className="text-stone-400 text-xs line-clamp-2">{prompt.prompt}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-stone-500 mt-1" />
                        </motion.button>
                      );
                    })}
                  </div>

                  <p className="text-center text-xs text-stone-500 mt-6">
                    Take what you need. Leave the rest.
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Single Prompt View - Full screen overlay with inline chat */}
      <AnimatePresence>
        {selectedDomain && selectedPrompt && (() => {
          const colors = DOMAIN_COLORS[selectedDomain.color] || DOMAIN_COLORS.amber;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black"
            >
              <div className={`h-full flex flex-col bg-gradient-to-b ${selectedDomain.bgGradient} via-stone-900 to-black`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <button
                    onClick={() => setSelectedPrompt(null)}
                    className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm">Back</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPrompt(null);
                      setSelectedDomain(null);
                      onClose();
                    }}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-stone-400" />
                  </button>
                </div>

                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto">
                  <div className="max-w-md mx-auto px-6 py-6">
                    {/* Prompt Card - Compact */}
                    <div className={`${colors.textMuted} text-xs uppercase tracking-wider mb-2`}>
                      {selectedDomain.name}
                    </div>
                    <h1 className="text-xl font-medium text-white mb-4">{selectedPrompt.title}</h1>

                    <div className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/40 mb-6">
                      <p className="text-white text-base leading-relaxed">
                        {selectedPrompt.prompt}
                      </p>
                    </div>

                    {/* Chat Messages */}
                    {chatMessages.length === 0 ? (
                      <p className="text-stone-500 text-sm text-center mb-4">
                        Sit with it. When you're ready, share what comes up.
                      </p>
                    ) : (
                      <div className="space-y-4 mb-4">
                        {chatMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] p-3 rounded-xl text-sm ${
                                msg.role === 'user'
                                  ? `${colors.bgButton} border ${colors.borderButton} text-white`
                                  : 'bg-stone-800/70 border border-stone-700/50 text-stone-200'
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {chatLoading && (
                          <div className="flex justify-start">
                            <div className="p-3 rounded-xl bg-stone-800/70 border border-stone-700/50">
                              <Loader2 className="w-4 h-4 text-stone-400 animate-spin" />
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="max-w-md mx-auto flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                      placeholder="Share what comes up..."
                      className="flex-1 px-4 py-3 rounded-xl bg-stone-800/50 border border-stone-700/40
                               text-white placeholder-stone-500 text-sm focus:outline-none
                               focus:border-stone-600 transition-colors"
                      disabled={chatLoading}
                    />
                    <motion.button
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim() || chatLoading}
                      className={`p-3 rounded-xl ${colors.bgButton} border ${colors.borderButton}
                               disabled:opacity-40 transition-all`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Send className={`w-5 h-5 ${colors.icon}`} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </>
  );
}
