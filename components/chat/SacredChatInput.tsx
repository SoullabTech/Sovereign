'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Square, Sparkles, BookOpen, Upload } from 'lucide-react';
import VoiceRecorder from '../VoiceRecorder';

interface SacredChatInputProps {
  onSendMessage: (message: string, isJournal?: boolean) => void;
  onVoiceMessage?: (transcript: string, audioUrl?: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  userId?: string;
  trustLevel?: number;
  isFirstSession?: boolean;
  tone?: number; // 0-1 scale from onboarding
  style?: 'prose' | 'poetic' | 'auto'; // from onboarding
}

// Sacred animation variants
const containerVariants = {
  idle: {
    boxShadow: '0 0 0 1px rgba(255, 215, 0, 0.2)',
    transition: { duration: 0.3 }
  },
  focused: {
    boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.1)',
    transition: { duration: 0.3 }
  },
  thinking: {
    boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.2)',
    transition: { duration: 0.3 }
  }
};

const buttonVariants = {
  idle: { scale: 1, rotate: 0 },
  hover: { scale: 1.05, rotate: 5 },
  tap: { scale: 0.95, rotate: -5 }
};

const rippleVariants = {
  initial: { scale: 0, opacity: 0.6 },
  animate: {
    scale: 2,
    opacity: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

export default function SacredChatInput({
  onSendMessage,
  onVoiceMessage,
  disabled = false,
  placeholder = "Offer your reflection...",
  maxLength = 4000,
  userId = "anonymous",
  trustLevel = 0.5,
  isFirstSession = false,
  tone = 0.5,
  style = 'prose'
}: SacredChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isJournalMode, setIsJournalMode] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea with golden ratio constraints
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = Math.min(textarea.scrollHeight, 120); // Golden ratio inspired max
      textarea.style.height = `${maxHeight}px`;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const triggerRipple = () => {
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 600);
  };

  const handleSendMessage = () => {
    if (!message.trim() || disabled) return;
    
    triggerRipple();
    onSendMessage(message.trim(), isJournalMode);
    setMessage('');
    setIsJournalMode(false);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle voice recording completion
  const handleVoiceTranscription = (data: { transcript: string; audioUrl?: string }) => {
    if (data.transcript) {
      // For voice-first flow, send directly to voice handler
      if (onVoiceMessage) {
        onVoiceMessage(data.transcript, data.audioUrl);
      } else {
        // Fallback: treat as text message
        onSendMessage(data.transcript, isJournalMode);
      }
    }
    setIsRecording(false);
    setIsJournalMode(false); // Reset journal mode after voice
  };

  // Handle starting voice recording
  const handleStartVoice = () => {
    setIsRecording(true);
    triggerRipple();
  };

  // Handle stopping voice recording
  const handleStopVoice = () => {
    setIsRecording(false);
  };

  // Get sacred placeholder based on recording state and user preferences
  const getSacredPlaceholder = () => {
    if (isRecording) {
      return "Listening to your sacred offering...";
    }
    
    if (disabled) {
      return "Maia is contemplating...";
    }

    // Base message based on preferences
    let baseMessage = "";
    if (isFirstSession) {
      baseMessage = tone > 0.7 
        ? "What truth wants to emerge through you?"
        : "What&apos;s alive in you right now?";
    } else if (style === 'poetic') {
      baseMessage = "Let your soul speak...";
    } else if (style === 'prose') {
      baseMessage = "Share what&apos;s on your mind...";
    } else {
      baseMessage = "What would you like to explore?";
    }
    
    // Add mode hint for dual input
    return `${baseMessage} (type or speak)`;
  };

  const canSend = message.trim().length > 0 && !disabled;

  // Determine container animation state for dual modes
  const getContainerState = () => {
    if (disabled) return 'thinking';
    if (isRecording) return 'thinking'; // Voice recording gets sacred thinking state
    if (isFocused || message.length > 0) return 'focused';
    return 'idle';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-amber-400/20 bg-neutral-900/95 backdrop-blur-xl z-50 shadow-2xl">
      {/* Sacred Input Container - Mobile Optimized */}
      <motion.div
        ref={containerRef}
        variants={containerVariants}
        animate={getContainerState()}
        className="relative max-w-4xl mx-auto"
      >
        {/* Ripple effect overlay */}
        <AnimatePresence>
          {showRipple && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial="initial"
              animate="animate"
              exit="initial"
              variants={rippleVariants}
            >
              <div className="w-12 h-12 rounded-full border-2 border-amber-400 opacity-30" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-2 sm:gap-4">
          {/* Mode Toggle Buttons - Mobile Responsive */}
          <div className="flex flex-col sm:flex-col gap-1 sm:gap-2 self-end pb-2">
            {/* Journal Mode Toggle */}
            <motion.button
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              onClick={() => setIsJournalMode(!isJournalMode)}
              disabled={disabled}
              className={`p-2 sm:p-3 rounded-xl border transition-all min-w-[44px] min-h-[44px] ${
                isJournalMode
                  ? 'bg-amber-400/20 border-amber-400/60 text-amber-400'
                  : 'bg-neutral-800/60 border-neutral-700/50 text-neutral-400 hover:border-amber-400/30 hover:text-amber-400'
              }`}
              title={isJournalMode ? "Switch to conversation" : "Switch to journal mode"}
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            {/* File Upload */}
            <motion.button
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              disabled={disabled}
              className="p-2 sm:p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50 text-neutral-400 hover:border-amber-400/30 hover:text-amber-400 transition-all min-w-[44px] min-h-[44px]"
              title="Upload files"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>

          {/* Dual-Mode Input Area */}
          <div className="flex-1 relative">
            {/* Mode Indicator */}
            <AnimatePresence>
              {isJournalMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -top-8 left-3 flex items-center gap-2 text-xs text-amber-400"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Sacred Journal Mode</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Recording State with Sparkles */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -top-8 right-3 flex items-center gap-2 text-xs text-amber-400"
                >
                  {/* Sparkle animations */}
                  <div className="relative">
                    <motion.div
                      className="absolute -left-6 -top-1"
                      animate={{
                        scale: [0, 1, 0],
                        rotate: [0, 180, 360],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0
                      }}
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                    </motion.div>
                    <motion.div
                      className="absolute -right-4 -top-2"
                      animate={{
                        scale: [0, 1, 0],
                        rotate: [0, -180, -360],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.7
                      }}
                    >
                      <Sparkles className="w-2 h-2 text-cyan-300" />
                    </motion.div>
                    <motion.div
                      className="absolute -left-3 -bottom-1"
                      animate={{
                        scale: [0, 1, 0],
                        rotate: [0, 90, 180],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 1.3
                      }}
                    >
                      <Sparkles className="w-2 h-2 text-amber-300" />
                    </motion.div>
                  </div>

                  <motion.div
                    className="w-2 h-2 rounded-full bg-red-400"
                    animate={{
                      opacity: [1, 0.3, 1],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span>Listening...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sacred Textarea - Always present, disabled during voice recording */}
            <motion.textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={getSacredPlaceholder()}
              disabled={disabled || isRecording}
              maxLength={maxLength}
              animate={{
                opacity: isRecording ? 0.6 : 1,
                scale: isRecording ? 0.98 : 1,
                filter: isRecording ? 'blur(1px)' : 'blur(0px)'
              }}
              transition={{ duration: 0.3 }}
              className="w-full min-h-[48px] sm:min-h-[56px] max-h-[96px] sm:max-h-[120px] p-3 sm:p-4 pr-12 sm:pr-16 bg-neutral-800/60 border border-neutral-700/50 rounded-xl sm:rounded-xl resize-none focus:outline-none focus:border-amber-400/60 disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-neutral-400 font-light leading-relaxed transition-all backdrop-blur-sm text-base"
              style={{ height: 'auto' }}
            />

            {/* Enhanced Voice Recording Overlay with Cloud Pulses */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-neutral-800/90 backdrop-blur-sm rounded-xl border border-amber-400/40 flex flex-col items-center justify-center overflow-hidden"
                >
                  {/* Floating cloud pulse effects */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {/* Cloud pulse 1 */}
                    <motion.div
                      className="absolute top-2 left-4 w-8 h-4 bg-amber-400/20 rounded-full blur-sm"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.7, 0.3],
                        x: [0, 20, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    {/* Cloud pulse 2 */}
                    <motion.div
                      className="absolute top-6 right-6 w-6 h-3 bg-cyan-400/20 rounded-full blur-sm"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 0.8, 0.4],
                        x: [0, -15, 0]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.8
                      }}
                    />
                    {/* Cloud pulse 3 */}
                    <motion.div
                      className="absolute bottom-4 left-6 w-5 h-3 bg-amber-400/20 rounded-full blur-sm"
                      animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.2, 0.6, 0.2],
                        x: [0, 25, 0]
                      }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5
                      }}
                    />
                    {/* Floating sparkles */}
                    <motion.div
                      className="absolute top-8 left-8"
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 360],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="w-2 h-2 text-amber-300/60" />
                    </motion.div>
                    <motion.div
                      className="absolute bottom-6 right-4"
                      animate={{
                        y: [0, -8, 0],
                        rotate: [0, -360],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                    >
                      <Sparkles className="w-3 h-3 text-cyan-300/60" />
                    </motion.div>
                  </motion.div>

                  {/* Voice Recording UI */}
                  <VoiceRecorder
                    userId={userId}
                    onTranscribed={handleVoiceTranscription}
                    autoSend={true}
                    silenceTimeout={3000}
                    minSpeechLength={500}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Character Counter */}
            {message.length > maxLength * 0.8 && !isRecording && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-3 right-12 sm:right-16 text-xs text-amber-400/60"
              >
                {message.length}/{maxLength}
              </motion.div>
            )}
          </div>

          {/* Dual-Mode Action Button */}
          <div className="self-end pb-2">
            {message.trim().length === 0 ? (
              // Enhanced Mic button with sparkle effects
              <div className="relative">
                {/* Sparkle effects around voice button */}
                <AnimatePresence>
                  {isRecording && (
                    <>
                      <motion.div
                        className="absolute -top-2 -left-2"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 360],
                            scale: [0.8, 1.2, 0.8]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                        </motion.div>
                      </motion.div>
                      <motion.div
                        className="absolute -bottom-1 -right-1"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                      >
                        <motion.div
                          animate={{
                            rotate: [0, -360],
                            scale: [1, 1.3, 1]
                          }}
                          transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5
                          }}
                        >
                          <Sparkles className="w-2 h-2 text-cyan-300" />
                        </motion.div>
                      </motion.div>
                      <motion.div
                        className="absolute -top-1 -right-2"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 180],
                            scale: [0.9, 1.1, 0.9]
                          }}
                          transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                          }}
                        >
                          <Sparkles className="w-2 h-2 text-amber-300" />
                        </motion.div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                <motion.button
                  variants={buttonVariants}
                  initial="idle"
                  whileHover={!isRecording ? "hover" : "idle"}
                  whileTap={!isRecording ? "tap" : "idle"}
                  onClick={isRecording ? handleStopVoice : handleStartVoice}
                  disabled={disabled}
                  className={`w-12 h-12 sm:w-12 sm:h-12 min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95 relative overflow-hidden ${
                    isRecording
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-900 hover:from-amber-300 hover:to-amber-400'
                  }`}
                  title={isRecording ? "Stop recording" : "Sacred voice offering"}
                  animate={{
                    boxShadow: isRecording
                      ? [
                          '0 0 0 0 rgba(239, 68, 68, 0.4)',
                          '0 0 0 8px rgba(239, 68, 68, 0)',
                          '0 0 0 0 rgba(239, 68, 68, 0.4)'
                        ]
                      : '0 0 0 0 rgba(239, 68, 68, 0)'
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2,
                      repeat: isRecording ? Infinity : 0
                    }
                  }}
                >
                <AnimatePresence mode="wait">
                  {isRecording ? (
                    <motion.div
                      key="stop"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Square className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="mic"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
                </motion.button>
              </div>
            ) : (
              // Send button when text exists
              <motion.button
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                onClick={handleSendMessage}
                disabled={!canSend}
                className={`w-12 h-12 sm:w-12 sm:h-12 min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all shadow-lg active:scale-95 ${
                  canSend
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-900 hover:from-amber-300 hover:to-amber-400'
                    : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                }`}
                title={isJournalMode ? "Share sacred entry" : "Send offering"}
              >
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Sacred Helper Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-2 sm:mt-3 text-center text-xs text-neutral-500 font-light px-2"
        >
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.span
                key="recording"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                Listening to your sacred offering... Click to stop recording
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <span className="hidden sm:inline">Type to write • Click mic to speak • Enter to send • Shift+Enter for new line</span>
                <span className="sm:hidden">Tap mic to speak • Type to write • Tap to send</span>
                {isJournalMode && <span className="hidden sm:inline"> • Your sacred thoughts are witnessed</span>}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}