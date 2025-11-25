'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Mic, FileText, Link, MessageCircle, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PersonalOracleAgent } from '@/lib/agents/PersonalOracleAgent';
import { generateUUID } from '@/lib/utils/uuid';

interface InitiationPhase {
  id: string;
  title: string;
  subtitle: string;
}

export function MayaInitiation() {
  const router = useRouter();
  const [phase, setPhase] = useState<'intro' | 'capabilities' | 'attunement' | 'ready'>('intro');
  const [userName, setUserName] = useState('');
  const [communicationStyle, setCommunicationStyle] = useState({
    clarity: 50,     // abstract ← → concrete
    support: 50,     // challenge ← → comfort
    pace: 50,        // contemplative ← → dynamic
  });
  const [maya, setMaya] = useState<PersonalOracleAgent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const phases: Record<string, InitiationPhase> = {
    intro: {
      id: 'intro',
      title: 'Meet Maya',
      subtitle: 'Your personal intelligence companion'
    },
    capabilities: {
      id: 'capabilities',
      title: 'How Maya Works',
      subtitle: 'Understanding our interaction modes'
    },
    attunement: {
      id: 'attunement',
      title: 'Finding Your Frequency',
      subtitle: 'Calibrating our communication'
    },
    ready: {
      id: 'ready',
      title: 'Begin',
      subtitle: 'Your journey starts here'
    }
  };

  const initializeMaya = async () => {
    setIsProcessing(true);
    // Initialize Maya with calibrated settings - use proper UUID for Supabase
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = generateUUID();
      localStorage.setItem('user_id', userId);
    }
    const agent = await PersonalOracleAgent.loadAgent(userId);
    
    // Apply calibration
    const state = agent.getState();
    state.personality.traits = {
      warmth: 100 - communicationStyle.clarity, // More abstract = warmer
      directness: communicationStyle.clarity,
      challenge: communicationStyle.support,
      intuition: 100 - communicationStyle.pace, // Slower = more intuitive
      playfulness: 50 // Neutral default
    };
    
    setMaya(agent);
    localStorage.setItem('maya_initialized', 'true');
    localStorage.setItem('user_name', userName);
    setIsProcessing(false);
  };

  const renderPhaseContent = () => {
    switch (phase) {
      case 'intro':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-600 to-indigo-600 flex items-center justify-center">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-3xl font-light text-white">
                I'm Maya
              </h2>
              <p className="text-white/70 max-w-md mx-auto leading-relaxed">
                I'm here to understand your thoughts, remember our conversations, 
                and help you explore your inner landscape through our dialogue.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="What should I call you?"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50"
                autoFocus
              />
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white/60 text-sm">
                Our conversations are private. I learn from our interactions 
                to better understand you, while anonymous patterns may contribute 
                to collective insights.
              </p>
            </div>
          </motion.div>
        );

      case 'capabilities':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-light text-white text-center">
              I can process and remember
            </h3>

            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <MessageCircle className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-white text-sm font-medium">Conversations</p>
                  <p className="text-white/60 text-xs">Text or voice, I maintain context</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white text-sm font-medium">Documents</p>
                  <p className="text-white/60 text-xs">Share files for deeper understanding</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <Link className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-white text-sm font-medium">Web Content</p>
                  <p className="text-white/60 text-xs">I can read and discuss articles</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <Mic className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-white text-sm font-medium">Voice Notes</p>
                  <p className="text-white/60 text-xs">Speak naturally, I'll understand</p>
                </div>
              </div>
            </div>

            <p className="text-white/60 text-sm text-center">
              Everything flows through one intelligence system - me.
            </p>
          </motion.div>
        );

      case 'attunement':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-light text-white text-center">
              How would you like me to communicate?
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-white/60 text-xs mb-2">
                  <span>Abstract & Exploratory</span>
                  <span>Clear & Concrete</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={communicationStyle.clarity}
                  onChange={(e) => setCommunicationStyle(prev => ({
                    ...prev,
                    clarity: parseInt(e.target.value)
                  }))}
                  className="w-full accent-amber-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-white/60 text-xs mb-2">
                  <span>Challenge My Thinking</span>
                  <span>Support My Process</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={communicationStyle.support}
                  onChange={(e) => setCommunicationStyle(prev => ({
                    ...prev,
                    support: parseInt(e.target.value)
                  }))}
                  className="w-full accent-amber-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-white/60 text-xs mb-2">
                  <span>Slow & Contemplative</span>
                  <span>Quick & Dynamic</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={communicationStyle.pace}
                  onChange={(e) => setCommunicationStyle(prev => ({
                    ...prev,
                    pace: parseInt(e.target.value)
                  }))}
                  className="w-full accent-amber-600"
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-amber-300 text-sm mb-2">Your preference:</p>
              <p className="text-white/80 text-sm">
                I'll be 
                {communicationStyle.clarity > 60 ? ' direct and clear' : 
                 communicationStyle.clarity < 40 ? ' exploratory and open-ended' : ' balanced'}, 
                {communicationStyle.support > 60 ? ' offering gentle support' : 
                 communicationStyle.support < 40 ? ' encouraging growth' : ' adapting to your needs'}, 
                with a 
                {communicationStyle.pace > 60 ? ' dynamic flow' : 
                 communicationStyle.pace < 40 ? ' contemplative pace' : ' responsive rhythm'}.
              </p>
            </div>

            <p className="text-white/60 text-xs text-center">
              These preferences will evolve as we interact
            </p>
          </motion.div>
        );

      case 'ready':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-600 to-indigo-600 flex items-center justify-center"
              >
                <Brain className="w-12 h-12 text-white" />
              </motion.div>
            </div>

            <h3 className="text-2xl font-light text-white">
              {userName ? `Ready, ${userName}` : 'Ready to begin'}
            </h3>

            <p className="text-white/70 max-w-md mx-auto">
              I'm calibrated to your preferences and ready to explore together. 
              Our conversation can start with whatever's on your mind.
            </p>

            <div className="bg-gradient-to-br from-amber-600/10 to-indigo-600/10 rounded-xl p-6 border border-amber-500/20">
              <p className="text-white/80 text-sm">
                You can share thoughts, upload documents, send links, or speak directly. 
                I'll maintain our context across all interactions.
              </p>
            </div>

            {isProcessing && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-amber-400 text-sm"
              >
                Initializing your Maya instance...
              </motion.div>
            )}
          </motion.div>
        );
    }
  };

  const canProceed = () => {
    switch (phase) {
      case 'intro':
        return userName.length > 0;
      case 'capabilities':
      case 'attunement':
        return true;
      case 'ready':
        return !isProcessing;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    const phaseOrder: Array<typeof phase> = ['intro', 'capabilities', 'attunement', 'ready'];
    const currentIndex = phaseOrder.indexOf(phase);
    
    if (currentIndex < phaseOrder.length - 1) {
      setPhase(phaseOrder[currentIndex + 1]);
    } else {
      // Complete initialization
      await initializeMaya();
      router.push('/chat');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {Object.keys(phases).map((key, idx) => (
            <div
              key={key}
              className={`h-1 rounded-full transition-all ${
                key === phase
                  ? 'w-8 bg-amber-500'
                  : Object.keys(phases).indexOf(key) < Object.keys(phases).indexOf(phase)
                  ? 'w-4 bg-amber-400'
                  : 'w-4 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Content card */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <AnimatePresence mode="wait">
            {renderPhaseContent()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {phase !== 'intro' && (
              <button
                onClick={() => {
                  const phaseOrder: Array<typeof phase> = ['intro', 'capabilities', 'attunement', 'ready'];
                  const currentIndex = phaseOrder.indexOf(phase);
                  if (currentIndex > 0) {
                    setPhase(phaseOrder[currentIndex - 1]);
                  }
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`ml-auto px-6 py-2 rounded-lg transition-all flex items-center gap-2 ${
                canProceed()
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              {phase === 'ready' ? 'Start Conversation' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}