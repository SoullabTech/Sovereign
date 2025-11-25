'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, MessageCircle, Sparkles, StopCircle } from 'lucide-react';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { useMayaStream } from '@/hooks/useMayaStream';

export default function MayaVoiceInterface() {
  const { messages, isStreaming, sendMessage } = useMayaStream();
  const [mode, setMode] = useState<'voice' | 'chat'>('voice');
  const [textInput, setTextInput] = useState('');
  const [conversationDepth, setConversationDepth] = useState<'quick' | 'normal' | 'deep'>('normal');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    volume,
    error,
    toggleListening,
    speak,
    manualStop
  } = useVoiceChat({
    onMessage: (message) => {
      sendMessage(message);
    },
    autoListen: true, // Auto-resume listening after Maya speaks
    conversationDepth, // NEW: Adaptive silence threshold
    onManualStop: () => console.log('User manually stopped speaking')
  });

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speak Maya's responses
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !isStreaming) {
        // Speak Maya's response
        speak(lastMessage.content);
      }
    }
  }, [messages, isStreaming, speak]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && !isStreaming) {
      sendMessage(textInput.trim());
      setTextInput('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-amber-900/20 to-gray-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#F6AD55" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-amber-500/20 px-4 py-4 backdrop-blur-sm bg-black/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 animate-pulse" />
                <div className="absolute inset-1 rounded-full bg-slate-900" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-400/40 to-amber-600/40" />
              </div>
              <div>
                <h2 className="text-amber-50 font-light tracking-wider text-lg">Maya-ARIA-1</h2>
                <p className="text-xs text-amber-200/40">
                  {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready for sacred exchange'}
                </p>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 bg-black/30 rounded-lg">
              <button
                onClick={() => setMode('voice')}
                className={`px-3 py-1.5 rounded transition-all ${
                  mode === 'voice'
                    ? 'bg-amber-500 text-black'
                    : 'text-gray-400 hover:text-amber-200'
                }`}
              >
                Voice
              </button>
              <button
                onClick={() => setMode('chat')}
                className={`px-3 py-1.5 rounded transition-all ${
                  mode === 'chat'
                    ? 'bg-amber-500 text-black'
                    : 'text-gray-400 hover:text-amber-200'
                }`}
              >
                Chat
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Sparkles className="w-12 h-12 text-amber-400 mx-auto opacity-60" />
                <p className="text-amber-200/60 text-sm font-light tracking-wide">
                  In this space between us, something sacred waits to emerge
                </p>
                <p className="text-amber-200/80 text-lg font-light">
                  {mode === 'voice' ? 'Say "Hi Maya" to begin' : 'Share your thoughts below'}
                </p>
              </motion.div>
            </div>
          )}

          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] px-5 py-4 rounded-2xl backdrop-blur-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-amber-500/15 to-amber-600/10 text-amber-50 border border-amber-500/30'
                    : 'bg-gradient-to-r from-black/50 to-black/40 text-amber-100/90 border border-amber-500/20'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p className="text-xs text-amber-200/40 mt-2 font-light">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}

          {isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="px-5 py-4 rounded-2xl bg-gradient-to-r from-black/50 to-black/40 border border-amber-500/20">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-amber-400/80 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-amber-500/80 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-amber-600/80 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {mode === 'voice' ? (
          <div className="border-t border-amber-500/20 p-6 backdrop-blur-sm bg-black/30">
            {/* Voice Visualizer */}
            <div className="flex flex-col items-center space-y-4">
              {/* Conversation Depth Selector */}
              <div className="flex gap-2 mb-2">
                {(['quick', 'normal', 'deep'] as const).map((depth) => (
                  <button
                    key={depth}
                    onClick={() => setConversationDepth(depth)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                      conversationDepth === depth
                        ? 'bg-amber-500 text-black'
                        : 'bg-black/40 text-amber-400/70 border border-amber-500/20 hover:border-amber-500/40'
                    }`}
                  >
                    {depth}
                  </button>
                ))}
              </div>

              {/* Transcript Display */}
              <AnimatePresence>
                {(transcript || interimTranscript) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full max-w-lg"
                  >
                    <div className="bg-black/40 rounded-lg p-4 border border-amber-500/20">
                      <p className="text-amber-100">
                        {transcript || <span className="opacity-60">{interimTranscript}</span>}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Voice Button */}
              <div className="relative">
                {/* Volume rings */}
                {isListening && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border border-amber-400/30"
                        animate={{
                          scale: 1 + volume * i * 0.5,
                          opacity: 0.6 - i * 0.2
                        }}
                        transition={{ duration: 0.1 }}
                      />
                    ))}
                  </>
                )}

                <button
                  onClick={toggleListening}
                  disabled={isSpeaking}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-amber-500 shadow-lg shadow-amber-500/50'
                      : isSpeaking
                      ? 'bg-amber-500 shadow-lg shadow-amber-500/50'
                      : 'bg-gray-700 hover:bg-gray-600'
                  } ${isSpeaking ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  {isSpeaking ? (
                    <Volume2 className="w-8 h-8 text-white" />
                  ) : isListening ? (
                    <Mic className="w-8 h-8 text-white" />
                  ) : (
                    <MicOff className="w-8 h-8 text-white" />
                  )}
                </button>
              </div>

              {/* Manual Stop Button - appears when user is speaking */}
              <AnimatePresence>
                {isListening && (transcript || interimTranscript) && !isSpeaking && (
                  <motion.button
                    onClick={manualStop}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="px-6 py-3 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <StopCircle className="w-5 h-5" />
                    Done Speaking
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Status */}
              <p className="text-xs text-amber-200/60">
                {isSpeaking ? 'Maya is speaking' : isListening ? 'Listening...' : 'Click to start'}
                {isListening && (
                  <span className="ml-2 opacity-60">
                    ({conversationDepth === 'quick' ? '3s' : conversationDepth === 'deep' ? '8s' : '6s'} pause)
                  </span>
                )}
              </p>

              {/* Error Display */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm"
                >
                  {error}
                </motion.p>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleTextSubmit} className="border-t border-amber-500/20 p-4 backdrop-blur-sm bg-black/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Share your thoughts with Maya..."
                disabled={isStreaming}
                className="flex-1 px-4 py-3 bg-black/40 border border-amber-500/30 rounded-lg text-amber-100 placeholder-amber-200/40 focus:outline-none focus:border-amber-400/50"
              />
              <button
                type="submit"
                disabled={isStreaming || !textInput.trim()}
                className="px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Send
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}