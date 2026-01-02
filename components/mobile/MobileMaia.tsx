// @ts-nocheck
'use client';

/**
 * Mobile-Optimized MAIA Experience
 *
 * Designed for phone usage patterns:
 * - Quick voice conversations
 * - Easy one-handed use
 * - Minimal cognitive load
 * - Instant wisdom access
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, MessageCircle, Heart, Brain, Compass, Menu, X } from 'lucide-react';

interface MobileMaiaProps {
  userId: string;
  userName: string;
  onConversationStart?: () => void;
  className?: string;
}

export function MobileMaia({ userId, userName, onConversationStart, className = '' }: MobileMaiaProps) {
  const [isListening, setIsListening] = useState(false);
  const [quickMode, setQuickMode] = useState<'voice' | 'text' | 'touch'>('voice');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [currentVibe, setCurrentVibe] = useState<'support' | 'exploration' | 'growth' | 'healing'>('support');

  // Mobile-specific quick actions
  const quickActions = [
    {
      id: 'check-in',
      icon: Heart,
      label: 'Quick Check-in',
      prompt: "Hey MAIA, I have 2 minutes - how am I doing right now?",
      vibe: 'support',
      duration: 'brief'
    },
    {
      id: 'clarity',
      icon: Brain,
      label: 'Need Clarity',
      prompt: "I'm feeling confused about something. Can you help me see it clearly?",
      vibe: 'exploration',
      duration: 'focused'
    },
    {
      id: 'guidance',
      icon: Compass,
      label: 'Quick Guidance',
      prompt: "I need some wisdom for what I'm facing today.",
      vibe: 'growth',
      duration: 'insight'
    },
    {
      id: 'presence',
      icon: Heart,
      label: 'Ground Me',
      prompt: "Help me come back to the present moment and feel centered.",
      vibe: 'healing',
      duration: 'immediate'
    }
  ];

  // Voice button - center of mobile experience
  const VoiceButton = () => (
    <motion.button
      onTouchStart={() => setIsListening(true)}
      onTouchEnd={() => setIsListening(false)}
      className={`w-24 h-24 rounded-full flex items-center justify-center relative ${
        isListening
          ? 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-400/40'
          : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30'
      }`}
      whilePressed={{ scale: 0.95 }}
      whileTap={{ scale: 0.95 }}
    >
      {isListening ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Mic className="w-10 h-10 text-white" />
        </motion.div>
      ) : (
        <Mic className="w-10 h-10 text-amber-400" />
      )}

      {/* Listening indicator */}
      {isListening && (
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-green-400/60"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
      )}
    </motion.button>
  );

  // Quick action tiles
  const QuickActionTile = ({ action }: { action: typeof quickActions[0] }) => {
    const Icon = action.icon;

    return (
      <motion.button
        onTap={() => {
          onConversationStart?.();
          // Trigger conversation with preset prompt
          console.log('Quick action:', action.prompt);
        }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20
                   active:bg-white/20 transition-colors min-h-[80px] flex flex-col justify-center"
        whileTap={{ scale: 0.95 }}
      >
        <Icon className="w-6 h-6 text-amber-400 mb-2 mx-auto" />
        <span className="text-white text-sm font-light text-center">{action.label}</span>
      </motion.button>
    );
  };

  return (
    <div className={`mobile-maia h-screen flex flex-col ${className}`}>
      {/* Mobile Header - Minimal */}
      <div className="flex-shrink-0 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/holoflower-amber.png"
            alt="MAIA"
            className="w-8 h-8 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]"
          />
          <span className="text-white text-lg font-light">MAIA</span>
        </div>

        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="p-2 bg-white/10 rounded-lg"
        >
          <Menu className="w-5 h-5 text-amber-400" />
        </button>
      </div>

      {/* Main Interaction Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        {/* Central Voice Button */}
        <div className="flex flex-col items-center space-y-4">
          <VoiceButton />

          <div className="text-center">
            <p className="text-white/80 text-sm">
              {isListening ? 'Listening...' : 'Hold to speak with MAIA'}
            </p>
            <p className="text-amber-400/60 text-xs mt-1">
              Your consciousness companion
            </p>
          </div>
        </div>

        {/* Quick Mode Toggle */}
        <div className="flex bg-black/20 rounded-full p-1">
          {['voice', 'text', 'touch'].map((mode) => (
            <button
              key={mode}
              onClick={() => setQuickMode(mode as any)}
              className={`px-4 py-2 rounded-full text-xs font-light transition-all ${
                quickMode === mode
                  ? 'bg-amber-500/30 text-amber-200'
                  : 'text-amber-400/60'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Quick Actions */}
      <div className="flex-shrink-0 p-4">
        <div className="grid grid-cols-2 gap-3">
          {quickActions.slice(0, 4).map((action) => (
            <QuickActionTile key={action.id} action={action} />
          ))}
        </div>
      </div>

      {/* Quick Actions Overlay */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="absolute inset-0 bg-black/80 backdrop-blur-lg z-50"
          >
            <div className="h-full flex flex-col p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-light text-white">Quick Actions</h2>
                <button
                  onClick={() => setShowQuickActions(false)}
                  className="p-2 bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Extended Actions Grid */}
              <div className="flex-1 space-y-4">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.id}
                    onTap={() => {
                      setShowQuickActions(false);
                      onConversationStart?.();
                    }}
                    className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20
                               active:bg-white/20 transition-colors text-left"
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <action.icon className="w-6 h-6 text-amber-400" />
                      <span className="text-white font-medium">{action.label}</span>
                    </div>
                    <p className="text-white/70 text-sm">{action.prompt}</p>
                    <div className="mt-3 flex gap-2">
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded">
                        {action.vibe}
                      </span>
                      <span className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded">
                        {action.duration}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Status - Bottom indicator */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2
                      bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-white/70 text-xs">Connected</span>
      </div>
    </div>
  );
}

// Mobile-specific conversation optimizations
export function getMobileConversationConfig() {
  return {
    maxResponseLength: 150, // Shorter responses for mobile
    preferVoice: true,
    quickResponses: [
      "Tell me more",
      "That helps",
      "What should I do?",
      "I need to think about this"
    ],
    autoSummarize: true, // Summarize long conversations
    pauseDetection: 3000, // 3 second pause detection
    gestureControls: {
      swipeUp: 'show_actions',
      swipeDown: 'minimize',
      longPress: 'voice_mode',
      doubleTap: 'quick_response'
    }
  };
}