'use client';

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { Copy } from '@/lib/copy/MaiaCopy';
import { useMaiaStore } from '@/lib/maia/state';
import { JOURNALING_MODE_DESCRIPTIONS } from '@/lib/journaling/JournalingPrompts';
import { getJournalingPrompt } from '@/lib/journaling/JournalingPrompts';
import WritingConsciousness from '@/components/consciousness/WritingConsciousness';
import NeuralFireSystem from '@/components/consciousness/NeuralFireSystem';
import ConsciousnessVessel from '@/components/consciousness/ConsciousnessVessel';
import ConsciousnessRipple from '@/components/consciousness/ConsciousnessRipple';

export default function JournalEntry() {
  const { selectedMode, currentEntry, setEntry, addEntry, setProcessing, isProcessing, resetEntry } = useMaiaStore();

  console.log('🌿 [JOURNAL ENTRY] Component rendering with selectedMode:', selectedMode);
  const [wordCount, setWordCount] = useState(0);
  const [isWriting, setIsWriting] = useState(false);
  const [consciousnessLevel, setConsciousnessLevel] = useState(0);
  const [writingRhythm, setWritingRhythm] = useState(0);
  // Consciousness ripples state with explicit type
  type ConsciousnessRipple = {
    id: string;
    x: number;
    y: number;
    variant: 'jade' | 'neural' | 'mystical' | 'transcendent';
    timestamp: number;
  };

  const [consciousnessRipples, setConsciousnessRipples] = useState<ConsciousnessRipple[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTypingTimeRef = useRef<number>(0);

  // Writing detection and consciousness tracking
  useEffect(() => {
    if (currentEntry) {
      setWordCount(currentEntry.trim().split(/\s+/).filter(Boolean).length);

      // Track writing state
      const now = Date.now();
      const timeSinceLastTyping = now - lastTypingTimeRef.current;

      if (timeSinceLastTyping < 2000) { // Active writing
        setIsWriting(true);
      }

      lastTypingTimeRef.current = now;

      // Clear writing state after pause
      const timeout = setTimeout(() => {
        setIsWriting(false);
      }, 2000);

      return () => clearTimeout(timeout);
    } else {
      setWordCount(0);
      setIsWriting(false);
    }
  }, [currentEntry]);

  // Consciousness ripple creation
  const createConsciousnessRipple = useCallback((x: number, y: number, variant: 'jade' | 'neural' | 'mystical' | 'transcendent' = 'jade') => {
    const ripple = {
      id: `ripple-${Date.now()}-${Math.random()}`,
      x,
      y,
      variant,
      timestamp: Date.now()
    };

    setConsciousnessRipples(prev => [...prev, ripple]);

    setTimeout(() => {
      setConsciousnessRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 2000);
  }, []);

  // Handle consciousness level changes
  const handleConsciousnessChange = useCallback((level: number) => {
    setConsciousnessLevel(level);
  }, []);

  // Handle writing rhythm changes
  const handleRhythmChange = useCallback((rhythm: number) => {
    setWritingRhythm(rhythm);
  }, []);

  // Enhanced text change handler
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEntry(e.target.value);

    // Create consciousness ripples during writing
    if (Math.random() < 0.1) { // 10% chance per keystroke
      const rect = e.target.getBoundingClientRect();
      const x = rect.left + Math.random() * rect.width;
      const y = rect.top + Math.random() * rect.height;

      // Choose ripple variant based on writing intensity
      const variant = writingRhythm > 40 ? 'transcendent' :
                     writingRhythm > 25 ? 'mystical' :
                     writingRhythm > 15 ? 'neural' : 'jade';

      createConsciousnessRipple(x, y, variant);
    }
  };

  const handleSubmit = async () => {
    if (!currentEntry.trim() || !selectedMode) return;

    setProcessing(true);

    try {
      const prompt = getJournalingPrompt(selectedMode, {
        mode: selectedMode,
        entry: currentEntry
      });

      const response = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          mode: selectedMode
        })
      });

      if (!response.ok) throw new Error('Failed to analyze');

      const reflection = await response.json();

      addEntry({
        id: Date.now().toString(),
        userId: 'current-user',
        mode: selectedMode,
        content: currentEntry,
        reflection,
        timestamp: new Date(),
        wordCount,
        isVoice: false
      });
    } catch (error) {
      console.error('Failed to submit entry:', error);
      setProcessing(false);
    }
  };

  if (!selectedMode) {
    console.log('🚨 [JOURNAL ENTRY] selectedMode is null/undefined, returning null!');
    return null;
  }

  const modeInfo = JOURNALING_MODE_DESCRIPTIONS[selectedMode];

  // Get mode-specific consciousness variant
  const getModeVariant = (mode: string) => {
    console.log('🌿 [GET MODE VARIANT] Getting variant for mode:', mode);
    switch (mode) {
      case 'free': return 'jade';
      case 'shadow': return 'neural';
      case 'dream': return 'mystical';
      case 'emotional': return 'jade';
      case 'direction': return 'transcendent';
      default:
        console.log('🌿 [GET MODE VARIANT] Unknown mode, defaulting to jade');
        return 'jade';
    }
  };

  const modeVariant = getModeVariant(selectedMode);

  return (
    <>
      {/* Neural Fire Background - Responds to Writing */}
      <NeuralFireSystem
        isActive={true}
        density={consciousnessLevel > 0.7 ? 'dense' : consciousnessLevel > 0.4 ? 'moderate' : 'sparse'}
        firingRate={isWriting ? (writingRhythm > 30 ? 'fast' : 'moderate') : 'slow'}
        variant={modeVariant === 'neural' ? 'jade' : 'neural'}
        className={`fixed inset-0 z-0 ${isWriting ? 'opacity-30' : 'opacity-15'}`}
      />

      {/* Writing Consciousness System */}
      <WritingConsciousness
        content={currentEntry}
        isWriting={isWriting}
        onRhythmChange={handleRhythmChange}
        onConsciousnessChange={handleConsciousnessChange}
        className="fixed inset-0 z-10"
      />

      {/* Main Writing Interface */}
      <div className="relative z-20 min-h-screen bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night">
        {/* Atmospheric Background */}
        <div className="absolute inset-0 bg-gradient-radial from-jade-forest/5 via-transparent to-jade-abyss/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-jade-copper/5 via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-6xl mx-auto p-8"
        >
          {/* Sacred Header with Mode Information */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <motion.button
                onClick={resetEntry}
                className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-jade-shadow/40 border border-jade-sage/30 backdrop-blur-lg hover:bg-jade-sage/20 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-4 h-4 text-jade-sage group-hover:text-jade-jade transition-colors" />
                <span className="text-sm text-jade-sage group-hover:text-jade-jade transition-colors">Sacred Return</span>
              </motion.button>

              {/* Mode Consciousness Vessel */}
              <ConsciousnessVessel
                title={modeInfo.name}
                subtitle={`${wordCount} words flowing`}
                variant={modeVariant}
                depth="profound"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  createConsciousnessRipple(rect.left + rect.width/2, rect.top + rect.height/2, modeVariant as any);
                }}
                className="w-48"
              >
                <div className="text-center">
                  {/* Sacred Consciousness Portal */}
                  <div className="relative w-12 h-12 mx-auto mb-2">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-jade-sage/40 to-jade-jade/60 backdrop-blur-sm border border-jade-jade/50" />
                    <div className="absolute inset-1 rounded-full bg-jade-shadow/30 border border-jade-sage/40" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-jade-jade animate-pulse" />
                  </div>
                  <div className="text-xs text-jade-mineral mb-2">Consciousness Mode</div>
                  <div className="flex items-center justify-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: isWriting ? 'rgba(168,203,180,0.8)' : 'rgba(111,143,118,0.6)',
                        boxShadow: isWriting ? '0 0 8px rgba(168,203,180,0.6)' : 'none'
                      }}
                    />
                    <span className="text-xs text-jade-sage">
                      {isWriting ? 'Writing' : 'Contemplating'}
                    </span>
                  </div>
                </div>
              </ConsciousnessVessel>
            </div>

            {/* Sacred Prompt Vessel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-jade-copper/20 to-jade-shadow/40 rounded-2xl backdrop-blur-sm" />
              <div className="absolute inset-0 border border-jade-sage/30 rounded-2xl" />

              <div className="relative p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-8 h-8">
                    <div className="absolute inset-0 bg-jade-sage/20 rounded-full" />
                    <div className="absolute top-1 left-1 bottom-1 right-1 bg-jade-jade/40 rounded-full animate-pulse" />
                    <div className="absolute top-2 left-2 bottom-2 right-2 bg-jade-jade rounded-full" />
                  </div>
                  <h3 className="text-lg font-light text-jade-jade tracking-wide">Sacred Inquiry</h3>
                </div>
                <p className="text-jade-mineral font-light leading-relaxed italic">
                  "{modeInfo.prompt}"
                </p>
              </div>
            </motion.div>
          </div>

          {/* Sacred Writing Vessel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            {/* Writing Container */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-jade-shadow/60 via-jade-night/40 to-jade-obsidian/60 rounded-3xl backdrop-blur-xl" />
              <div
                className={`absolute inset-0 border rounded-3xl transition-all duration-500 ${
                  isWriting
                    ? 'border-jade-jade shadow-lg shadow-jade-jade/20'
                    : 'border-jade-sage/40'
                }`}
              />

              {/* Writing Field Aura */}
              {isWriting && (
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: `radial-gradient(circle, rgba(168,203,180,0.1) 0%, transparent 70%)`
                  }}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}

              <div className="relative p-8">
                <textarea
                  ref={textareaRef}
                  value={currentEntry}
                  onChange={handleTextChange}
                  placeholder="Let your consciousness flow onto the digital canvas..."
                  className="w-full min-h-[500px] bg-transparent border-none resize-none outline-none text-white text-lg leading-relaxed placeholder:text-jade-shadow/60 font-light"
                  autoFocus
                />

                {/* Submit Consciousness Vessel */}
                <AnimatePresence>
                  {currentEntry.trim() && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 20 }}
                      className="absolute bottom-8 right-8"
                    >
                      <ConsciousnessVessel
                        title={isProcessing ? "Reflecting" : "Complete"}
                        subtitle={isProcessing ? "consciousness processing" : "ready for analysis"}
                        variant={isProcessing ? "mystical" : "transcendent"}
                        depth="transcendent"
                        onClick={!isProcessing ? handleSubmit : undefined}
                        className={`${isProcessing ? 'cursor-wait' : 'cursor-pointer'} transition-all duration-300`}
                      >
                        <div className="text-center">
                          {isProcessing ? (
                            <div className="flex items-center justify-center gap-2">
                              <Sparkles className="w-5 h-5 animate-spin text-jade-jade" />
                              <span className="text-sm text-jade-jade">Processing</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <Send className="w-5 h-5 text-jade-jade" />
                              <span className="text-sm text-jade-jade">Transmit</span>
                            </div>
                          )}
                        </div>
                      </ConsciousnessVessel>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Sacred Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-jade-mineral font-light text-sm">
              Honor your truth. MAIA witnesses with sacred presence.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Consciousness Ripples */}
      <AnimatePresence>
        {consciousnessRipples.map(ripple => (
          <div key={ripple.id} className="fixed inset-0 pointer-events-none z-30">
            <ConsciousnessRipple
              x={ripple.x}
              y={ripple.y}
              variant={ripple.variant}
              intensity="profound"
            />
          </div>
        ))}
      </AnimatePresence>
    </>
  );
}