'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceMirror from '../voice/VoiceMirror';
import MirrorInterface from './MirrorInterface';
import { Mic, MessageSquare, Sparkles } from 'lucide-react';

interface EnhancedMirrorViewProps {
  userId: string;
  sessionId?: string;
  initialMode?: 'text' | 'voice' | 'hybrid';
}

export default function EnhancedMirrorView({ 
  userId, 
  sessionId,
  initialMode = 'hybrid' 
}: EnhancedMirrorViewProps) {
  const [mode, setMode] = useState<'text' | 'voice' | 'hybrid'>(initialMode);
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingState, setThinkingState] = useState<any>({ active: false });
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  // Handle mode switching with ceremonial transition
  const switchMode = (newMode: 'text' | 'voice' | 'hybrid') => {
    if (newMode === mode) return;
    
    setShowTransition(true);
    setTimeout(() => {
      setMode(newMode);
      setShowTransition(false);
    }, 500);
  };

  const handleSendMessage = async (message: string) => {
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }]);
    
    setIsTyping(true);
    setThinkingState({ active: true, phase: 'processing' });
    
    // Simulate response (replace with actual API call)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'I hear your reflection. Let me mirror back what resonates...',
        timestamp: new Date()
      }]);
      setIsTyping(false);
      setThinkingState({ active: false });
    }, 2000);
  };

  const handleStartVoice = () => {
    setIsVoiceActive(true);
    if (mode === 'text') {
      switchMode('hybrid');
    }
  };

  const handleStopVoice = () => {
    setIsVoiceActive(false);
  };

  // Render based on mode
  const renderContent = () => {
    switch (mode) {
      case 'voice':
        return (
          <VoiceMirror 
            userId={userId}
            onModeChange={(newMode) => {
              if (newMode === 'text') switchMode('hybrid');
            }}
          />
        );
      
      case 'text':
        return (
          <MirrorInterface
            messages={messages}
            isTyping={isTyping}
            thinkingState={thinkingState}
            onSendMessage={handleSendMessage}
            onStartVoice={handleStartVoice}
            onStopVoice={handleStopVoice}
            isVoiceActive={isVoiceActive}
            isMobile={false}
          />
        );
      
      case 'hybrid':
      default:
        return (
          <div className="h-full relative">
            {/* Background Layer - Always visible */}
            <MirrorInterface
              messages={messages}
              isTyping={isTyping}
              thinkingState={thinkingState}
              onSendMessage={handleSendMessage}
              onStartVoice={handleStartVoice}
              onStopVoice={handleStopVoice}
              isVoiceActive={isVoiceActive}
              isMobile={false}
            />
            
            {/* Voice Overlay - Shows when voice is active */}
            <AnimatePresence>
              {isVoiceActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl z-30"
                >
                  <VoiceMirror 
                    userId={userId}
                    onModeChange={() => setIsVoiceActive(false)}
                    autoStartWelcome={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950">
      {/* Sacred Header with Mode Switcher */}
      <motion.header
        className="relative z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: mode === 'voice' ? 360 : 0 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-amber-500" />
              </motion.div>
              <h1 className="text-xl font-light text-neutral-700 dark:text-neutral-300">
                Sacred Mirror
              </h1>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-full">
              <button
                onClick={() => switchMode('text')}
                className={`
                  px-4 py-2 rounded-full flex items-center gap-2 transition-all
                  ${mode === 'text' 
                    ? 'bg-white dark:bg-neutral-700 shadow-md text-amber-600 dark:text-amber-400' 
                    : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'
                  }
                `}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">Text</span>
              </button>
              
              <button
                onClick={() => switchMode('hybrid')}
                className={`
                  px-4 py-2 rounded-full flex items-center gap-2 transition-all
                  ${mode === 'hybrid' 
                    ? 'bg-white dark:bg-neutral-700 shadow-md text-amber-600 dark:text-amber-400' 
                    : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'
                  }
                `}
              >
                <div className="flex -space-x-1">
                  <MessageSquare className="w-4 h-4" />
                  <Mic className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Hybrid</span>
              </button>
              
              <button
                onClick={() => switchMode('voice')}
                className={`
                  px-4 py-2 rounded-full flex items-center gap-2 transition-all
                  ${mode === 'voice' 
                    ? 'bg-white dark:bg-neutral-700 shadow-md text-amber-600 dark:text-amber-400' 
                    : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'
                  }
                `}
              >
                <Mic className="w-4 h-4" />
                <span className="text-sm font-medium">Voice</span>
              </button>
            </div>

            {/* Mode Description */}
            <div className="text-sm text-neutral-500 dark:text-neutral-400 hidden lg:block">
              {mode === 'text' && "Type your reflections"}
              {mode === 'voice' && "Speak with Maia"}
              {mode === 'hybrid' && "Type or speak naturally"}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Ceremonial Transition Overlay */}
        <AnimatePresence>
          {showTransition && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-indigo-500/20 backdrop-blur-md"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'voice' ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'voice' ? -100 : 100 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sacred Footer (optional) */}
      <motion.footer
        className="relative z-40 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-t border-neutral-200 dark:border-neutral-800 py-2 px-4"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            {mode === 'voice' && "🎤 Voice recognition active • Speak naturally"}
            {mode === 'text' && "⌨️ Shift+Enter for new line • Enter to send"}
            {mode === 'hybrid' && "✨ Seamless text and voice • Your choice"}
          </p>
        </div>
      </motion.footer>
    </div>
  );
}