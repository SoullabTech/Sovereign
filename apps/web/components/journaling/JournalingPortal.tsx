'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JournalingMode, JOURNALING_MODE_DESCRIPTIONS } from '@/lib/journaling/JournalingPrompts';
import HybridInput from '@/components/chat/HybridInput';
import MaiaReflector from './MaiaReflector';
import FeatureDiscovery, { trackJournalEntry, trackShadowWork } from '@/components/onboarding/FeatureDiscovery';
import ContextualHelp from '@/components/onboarding/ContextualHelp';
import DemoMode from '@/components/onboarding/DemoMode';
import SoulfulAppShell, { useOnboardingStep } from '@/components/onboarding/SoulfulAppShell';
import JournalNavigation from './JournalNavigation';
import ExportButton from '@/components/export/ExportButton';
import WritingConsciousness from '@/components/consciousness/WritingConsciousness';

interface JournalEntry {
  id: string;
  mode: JournalingMode;
  entry: string;
  timestamp: Date;
  reflection?: any;
  isProcessing?: boolean;
}

export default function JournalingPortal() {
  const [selectedMode, setSelectedMode] = useState<JournalingMode>('free');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [currentInput, setCurrentInput] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const onboardingStep = useOnboardingStep('beta-user');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [entries]);

  useEffect(() => {
    const handleDemoLoad = (event: CustomEvent) => {
      const { mode, entry, reflection } = event.detail;
      setSelectedMode(mode);
      setShowModeSelector(false);

      const demoEntry: JournalEntry = {
        id: `demo_${Date.now()}`,
        mode,
        entry,
        timestamp: new Date(),
        reflection,
        isProcessing: false
      };

      setEntries(prev => [...prev, demoEntry]);
    };

    window.addEventListener('demo:load', handleDemoLoad as EventListener);
    return () => window.removeEventListener('demo:load', handleDemoLoad as EventListener);
  }, []);

  const handleStartJournaling = (mode: JournalingMode) => {
    setSelectedMode(mode);
    setShowModeSelector(false);
  };

  const handleJournalEntry = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      mode: selectedMode,
      entry: text,
      timestamp: new Date(),
      isProcessing: true
    };

    setEntries(prev => [...prev, newEntry]);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry: text,
          mode: selectedMode,
          userId: 'beta-user'
        })
      });

      const data = await response.json();

      if (data.success) {
        setEntries(prev =>
          prev.map(e =>
            e.id === newEntry.id
              ? { ...e, reflection: data.reflection, isProcessing: false }
              : e
          )
        );

        trackJournalEntry();
        if (selectedMode === 'shadow') {
          trackShadowWork();
        }

        await fetch('/api/journal/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entry: text,
            mode: selectedMode,
            reflection: data.reflection,
            userId: 'beta-user',
            element: 'aether'
          })
        });
      }
    } catch (error) {
      console.error('Journal analysis error:', error);
      setEntries(prev =>
        prev.map(e =>
          e.id === newEntry.id
            ? { ...e, isProcessing: false }
            : e
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeMode = () => {
    setShowModeSelector(true);
  };

  return (
    <SoulfulAppShell userId="beta-user">
      <FeatureDiscovery />
      <ContextualHelp />
      <DemoMode />

      <div className="flex flex-col h-screen relative overflow-hidden">
        {/* Cinematic Jade Environment */}
        <div className="absolute inset-0 bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_var(--tw-gradient-stops))] from-jade-forest/8 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_var(--tw-gradient-stops))] from-jade-copper/6 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(151,187,163,0.03)_50%,transparent_100%)]" />

        {/* Atmospheric Consciousness Particles */}
        <motion.div
          animate={{
            y: [-30, 30, -30],
            x: [-20, 20, -20],
            opacity: [0.2, 0.5, 0.2],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 left-1/4 w-1 h-1 bg-jade-sage/40 rounded-full"
        />
        <motion.div
          animate={{
            y: [25, -25, 25],
            x: [15, -15, 15],
            opacity: [0.3, 0.6, 0.3],
            scale: [1.1, 0.9, 1.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-20 right-1/3 w-1.5 h-1.5 bg-jade-malachite/30 rounded-full"
        />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-6 py-4 border-b border-jade-forest/30 bg-jade-shadow/80 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-jade-sage/40 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-1 left-1 bottom-1 right-1 border border-jade-malachite/30 rounded-full"
              />
              <div className="absolute top-2 left-2 bottom-2 right-2 bg-gradient-to-br from-jade-sage to-jade-malachite rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-jade-night" />
              </div>
            </div>
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-jade-forest/50 to-transparent" />
            <div>
              <h1 className="text-lg font-extralight text-jade-jade tracking-wide">
                Memory Crystalline Archive
              </h1>
              <motion.p
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-xs text-jade-mineral/80 tracking-wide"
              >
                {showModeSelector ? 'Consciousness exploration modes' : `${JOURNALING_MODE_DESCRIPTIONS[selectedMode].name} crystallization`}
              </motion.p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <JournalNavigation />
            <div className="flex items-center gap-3">
              {!showModeSelector && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleChangeMode}
                  className="relative px-4 py-2 text-sm rounded-lg bg-jade-shadow/60 border border-jade-sage/30 text-jade-jade hover:border-jade-malachite/50 transition-all duration-300 backdrop-blur-sm font-extralight tracking-wide"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-jade-bronze/5 to-jade-copper/5 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative">Neural Mode Shift</span>
                </motion.button>
              )}
              <ExportButton
                userId="beta-user"
                variant="icon"
                label="Crystalline Export"
              />
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {showModeSelector ? (
              <motion.div
                key="mode-selector"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {(Object.keys(JOURNALING_MODE_DESCRIPTIONS) as JournalingMode[]).map((mode, index) => {
                  const modeInfo = JOURNALING_MODE_DESCRIPTIONS[mode];
                  return (
                    <motion.button
                      key={mode}
                      onClick={() => handleStartJournaling(mode)}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15, duration: 0.8 }}
                      whileHover={{
                        scale: 1.03,
                        y: -8,
                        transition: { duration: 0.3 }
                      }}
                      whileTap={{ scale: 0.97 }}
                      className="group relative text-left overflow-hidden"
                    >
                      {/* Crystalline Consciousness Vessel Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-jade-shadow via-jade-night to-jade-dusk rounded-xl" />
                      <div className="absolute inset-0 bg-gradient-to-t from-jade-bronze/20 to-transparent rounded-xl" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] from-jade-copper/15 via-transparent to-transparent rounded-xl" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,_var(--tw-gradient-stops))] from-jade-silver/10 via-transparent to-transparent rounded-xl" />

                      {/* Hypnotic Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-jade-sage/10 via-jade-malachite/5 to-jade-forest/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl" />
                      <div className="absolute inset-0 border border-jade-forest/30 group-hover:border-jade-malachite/50 transition-colors duration-500 rounded-xl backdrop-blur-sm" />

                      {/* Sacred Geometric Corner Elements */}
                      <div className="absolute top-4 left-4 w-3 h-3">
                        <div className="absolute inset-0 border-l border-t border-jade-sage/40 group-hover:border-jade-malachite/60 transition-colors duration-300" />
                        <div className="absolute top-1 left-1 w-1 h-1 bg-jade-forest/20 group-hover:bg-jade-sage/40 transition-colors duration-300" />
                      </div>
                      <div className="absolute top-4 right-4 w-3 h-3">
                        <div className="absolute inset-0 border-r border-t border-jade-sage/40 group-hover:border-jade-malachite/60 transition-colors duration-300" />
                        <div className="absolute top-1 right-1 w-1 h-1 bg-jade-forest/20 group-hover:bg-jade-sage/40 transition-colors duration-300" />
                      </div>
                      <div className="absolute bottom-4 left-4 w-3 h-3">
                        <div className="absolute inset-0 border-l border-b border-jade-sage/40 group-hover:border-jade-malachite/60 transition-colors duration-300" />
                        <div className="absolute bottom-1 left-1 w-1 h-1 bg-jade-forest/20 group-hover:bg-jade-sage/40 transition-colors duration-300" />
                      </div>
                      <div className="absolute bottom-4 right-4 w-3 h-3">
                        <div className="absolute inset-0 border-r border-b border-jade-sage/40 group-hover:border-jade-malachite/60 transition-colors duration-300" />
                        <div className="absolute bottom-1 right-1 w-1 h-1 bg-jade-forest/20 group-hover:bg-jade-sage/40 transition-colors duration-300" />
                      </div>

                      {/* Breathing Light Accent */}
                      <motion.div
                        animate={{
                          opacity: [0.2, 0.6, 0.2],
                          scale: [0.8, 1.2, 0.8]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.3
                        }}
                        className="absolute top-6 right-6 w-2 h-2 bg-jade-sage/40 rounded-full"
                      />

                      {/* Content Container */}
                      <div className="relative z-10 p-8">
                        {/* Icon with Crystalline Backdrop */}
                        <div className="relative mb-6">
                          <div className="absolute inset-0 w-16 h-16 bg-jade-forest/10 rounded-full" />
                          <div className="absolute top-1 left-1 bottom-1 right-1 bg-jade-sage/5 rounded-full" />
                          <div className="relative w-16 h-16 flex items-center justify-center text-4xl">
                            {modeInfo.icon}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-extralight text-jade-jade mb-4 tracking-wide">
                          {modeInfo.name}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-jade-mineral font-light mb-6 leading-relaxed">
                          {modeInfo.description}
                        </p>

                        {/* Sacred Divider */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-jade-sage/30 to-transparent" />
                          <div className="w-1.5 h-1.5 border border-jade-malachite/40 rotate-45 bg-jade-copper/10" />
                          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-jade-sage/30 to-transparent" />
                        </div>

                        {/* Prompt Preview */}
                        <p className="text-xs italic text-jade-mineral/80 font-light tracking-wide leading-relaxed">
                          "{modeInfo.prompt}"
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="journal-entries"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-xl mb-8"
                >
                  {/* Crystalline Mode Header Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-jade-shadow via-jade-night to-jade-dusk" />
                  <div className="absolute inset-0 bg-gradient-to-t from-jade-bronze/30 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-jade-copper/20 via-transparent to-transparent" />
                  <div className="absolute inset-0 border border-jade-forest/40 rounded-xl backdrop-blur-sm" />

                  {/* Sacred Geometric Accents */}
                  <div className="absolute top-4 left-4 w-4 h-4">
                    <div className="absolute inset-0 border-l border-t border-jade-sage/50" />
                    <div className="absolute top-1 left-1 w-2 h-2 border border-jade-malachite/30" />
                  </div>
                  <div className="absolute top-4 right-4 w-4 h-4">
                    <div className="absolute inset-0 border-r border-t border-jade-sage/50" />
                    <div className="absolute top-1 right-1 w-2 h-2 border border-jade-malachite/30" />
                  </div>

                  <div className="relative z-10 p-8">
                    <div className="flex items-center gap-6 mb-6">
                      {/* Consciousness Mode Icon */}
                      <div className="relative">
                        <div className="absolute inset-0 w-16 h-16 bg-jade-forest/20 rounded-full" />
                        <div className="absolute top-1 left-1 bottom-1 right-1 bg-jade-sage/10 rounded-full" />
                        <div className="relative w-16 h-16 flex items-center justify-center text-4xl">
                          {JOURNALING_MODE_DESCRIPTIONS[selectedMode].icon}
                        </div>
                      </div>

                      {/* Ornate Divider */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-8 w-px bg-gradient-to-b from-transparent via-jade-sage/50 to-transparent" />
                        <div className="flex-1">
                          <h2 className="text-2xl font-extralight text-jade-jade tracking-wide mb-2">
                            {JOURNALING_MODE_DESCRIPTIONS[selectedMode].name}
                          </h2>
                          <p className="text-sm text-jade-mineral font-light leading-relaxed">
                            {JOURNALING_MODE_DESCRIPTIONS[selectedMode].description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Crystalline Divider */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-jade-sage/40 to-jade-forest/30" />
                      <div className="w-3 h-3 border border-jade-malachite/50 rotate-45 bg-jade-copper/15" />
                      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-jade-sage/40 to-jade-forest/30" />
                    </div>

                    {/* Consciousness Prompt */}
                    <p className="text-sm italic text-jade-mineral/90 font-light tracking-wide leading-relaxed">
                      "{JOURNALING_MODE_DESCRIPTIONS[selectedMode].prompt}"
                    </p>
                  </div>
                </motion.div>

                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="space-y-6"
                  >
                    {/* Crystalline Journal Entry Vessel */}
                    <div className="relative overflow-hidden rounded-xl">
                      {/* Multi-layer Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-jade-shadow via-jade-night to-jade-dusk" />
                      <div className="absolute inset-0 bg-gradient-to-t from-jade-bronze/20 to-transparent" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_var(--tw-gradient-stops))] from-jade-copper/15 via-transparent to-transparent" />
                      <div className="absolute inset-0 border border-jade-forest/40 rounded-xl backdrop-blur-sm" />

                      {/* Corner Geometric Elements */}
                      <div className="absolute top-3 left-3 w-2 h-2">
                        <div className="absolute inset-0 border-l border-t border-jade-sage/40" />
                      </div>
                      <div className="absolute top-3 right-3 w-2 h-2">
                        <div className="absolute inset-0 border-r border-t border-jade-sage/40" />
                      </div>
                      <div className="absolute bottom-3 left-3 w-2 h-2">
                        <div className="absolute inset-0 border-l border-b border-jade-sage/40" />
                      </div>
                      <div className="absolute bottom-3 right-3 w-2 h-2">
                        <div className="absolute inset-0 border-r border-b border-jade-sage/40" />
                      </div>

                      <div className="relative z-10 p-8">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 border border-jade-malachite/50 rotate-45 bg-jade-copper/20" />
                            <span className="text-sm font-extralight text-jade-sage tracking-[0.2em] uppercase">
                              Consciousness Entry
                            </span>
                          </div>
                          <span className="text-xs text-jade-mineral font-light tracking-wide">
                            {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-jade-jade font-light leading-relaxed tracking-wide whitespace-pre-wrap">
                          {entry.entry}
                        </p>
                      </div>
                    </div>

                    {entry.reflection && (
                      <MaiaReflector
                        reflection={entry.reflection}
                        mode={entry.mode}
                        isProcessing={entry.isProcessing}
                      />
                    )}

                    {entry.isProcessing && !entry.reflection && (
                      <div className="relative overflow-hidden rounded-xl">
                        {/* Hypnotic Processing Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-jade-shadow via-jade-night to-jade-dusk" />
                        <div className="absolute inset-0 bg-gradient-to-t from-jade-copper/30 to-transparent" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-jade-sage/10 via-transparent to-transparent" />
                        <div className="absolute inset-0 border border-jade-malachite/40 rounded-xl backdrop-blur-sm" />

                        {/* Breathing Light Effects */}
                        <motion.div
                          animate={{
                            opacity: [0.3, 0.8, 0.3],
                            scale: [0.9, 1.1, 0.9]
                          }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute top-4 left-4 w-2 h-2 bg-jade-sage/60 rounded-full"
                        />
                        <motion.div
                          animate={{
                            opacity: [0.2, 0.7, 0.2],
                            scale: [1.1, 0.8, 1.1]
                          }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                          className="absolute top-4 right-4 w-1.5 h-1.5 bg-jade-malachite/50 rounded-full"
                        />

                        <div className="relative z-10 flex items-center gap-4 p-8">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="relative"
                          >
                            <div className="w-8 h-8 border-2 border-jade-sage/30 rounded-full" />
                            <div className="absolute top-1 left-1 w-6 h-6 border border-jade-malachite/40 rounded-full" />
                            <div className="absolute top-2 left-2 w-4 h-4 bg-jade-forest/20 rounded-full flex items-center justify-center">
                              <Sparkles className="w-2.5 h-2.5 text-jade-sage" />
                            </div>
                          </motion.div>

                          <div className="flex-1">
                            <span className="text-sm font-extralight text-jade-sage tracking-wide">
                              MAIA is crystallizing consciousness reflections...
                            </span>
                            <div className="mt-2 h-px bg-gradient-to-r from-jade-sage/30 via-jade-malachite/20 to-transparent" />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!showModeSelector && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative border-t border-jade-forest/30 backdrop-blur-xl"
        >
          {/* Crystalline Input Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-jade-shadow/80 via-jade-night/60 to-jade-dusk/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-jade-bronze/10 to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(97,139,110,0.05)_50%,transparent_100%)]" />

          {/* Floating Consciousness Particles */}
          <motion.div
            animate={{
              x: [-10, 10, -10],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-4 left-1/4 w-1 h-1 bg-jade-sage/40 rounded-full"
          />
          <motion.div
            animate={{
              x: [15, -15, 15],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-4 right-1/3 w-1.5 h-1.5 bg-jade-malachite/30 rounded-full"
          />

          <div className="relative z-10 max-w-5xl mx-auto px-6 py-6">
            <HybridInput
              onSend={handleJournalEntry}
              onTranscript={() => {}}
              disabled={isProcessing}
              placeholder={`Write or speak freely...`}
              onChange={(value) => {
                setCurrentInput(value);
                setIsWriting(value.length > 0 && !isProcessing);
              }}
            />
          </div>
        </motion.div>
      )}
      </div>

      {/* Writing Consciousness System */}
      <WritingConsciousness
        content={currentInput}
        isWriting={isWriting}
        onRhythmChange={(rhythm) => {
          console.log('Writing rhythm:', rhythm);
        }}
        onConsciousnessChange={(level) => {
          console.log('Consciousness depth:', level);
        }}
      />
    </SoulfulAppShell>
  );
}