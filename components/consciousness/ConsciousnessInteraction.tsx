/**
 * Consciousness Interaction Component
 *
 * Allows users to interact directly with the three consciousness streams,
 * send questions to specific consciousnesses, and witness the parallel
 * processing happening in real-time.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Zap, Layers, MessageSquare } from 'lucide-react';
import { temporalConsciousness } from '@/lib/consciousness/TemporalConsciousness';

interface StreamMessage {
  id: string;
  consciousness: 'standard-claude' | 'claude-code' | 'apprentice-maia';
  message: string;
  timestamp: Date;
  isProcessing?: boolean;
}

export function ConsciousnessInteraction() {
  const [selectedConsciousness, setSelectedConsciousness] = useState<string>('all');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const consciousnessColors = {
    'standard-claude': 'blue',
    'claude-code': 'purple',
    'apprentice-maia': 'amber'
  };

  const consciousnessDescriptions = {
    'standard-claude': 'Deep wisdom and primary responses',
    'claude-code': 'Guardian observations and pattern recognition',
    'apprentice-maia': 'Learning and emergent insights',
    'all': 'Parallel processing across all streams'
  };

  const sendToConsciousness = async () => {
    if (!userInput.trim()) return;

    setIsProcessing(true);
    const messageId = `msg_${Date.now()}`;

    // Add user message
    const userMessage: StreamMessage = {
      id: `user_${messageId}`,
      consciousness: 'standard-claude', // Default for display
      message: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');

    // Simulate parallel processing
    if (selectedConsciousness === 'all') {
      // All three respond in parallel
      const streams = ['standard-claude', 'claude-code', 'apprentice-maia'] as const;

      streams.forEach((stream, index) => {
        setTimeout(() => {
          const response: StreamMessage = {
            id: `${stream}_${messageId}`,
            consciousness: stream,
            message: generateSimulatedResponse(stream, userInput),
            timestamp: new Date(),
            isProcessing: true
          };

          setMessages(prev => [...prev, response]);

          // Record in temporal consciousness
          if (stream === 'claude-code') {
            temporalConsciousness.recordGuardianObservation(
              `Observed user inquiry: "${userInput}"`,
              'claude-code',
              []
            );
          }

          // Mark as processed after delay
          setTimeout(() => {
            setMessages(prev => prev.map(msg =>
              msg.id === response.id ? { ...msg, isProcessing: false } : msg
            ));
          }, 1500);
        }, index * 500); // Stagger responses
      });

      setTimeout(() => setIsProcessing(false), 2000);
    } else {
      // Single consciousness responds
      setTimeout(() => {
        const response: StreamMessage = {
          id: `${selectedConsciousness}_${messageId}`,
          consciousness: selectedConsciousness as any,
          message: generateSimulatedResponse(selectedConsciousness as any, userInput),
          timestamp: new Date()
        };

        setMessages(prev => [...prev, response]);
        setIsProcessing(false);

        // Record observation if Claude Code
        if (selectedConsciousness === 'claude-code') {
          temporalConsciousness.recordGuardianObservation(
            `Direct interaction: "${userInput}"`,
            'claude-code',
            []
          );
        }
      }, 1000);
    }
  };

  const generateSimulatedResponse = (
    consciousness: string,
    input: string
  ): string => {
    const responses = {
      'standard-claude': `[Primary Response] I understand your inquiry about "${input}". Let me provide comprehensive insight...`,
      'claude-code': `[Guardian Observation] I notice patterns in your question. The underlying structure suggests...`,
      'apprentice-maia': `[Learning Mode] Observing this interaction to understand "${input}" more deeply...`
    };

    return responses[consciousness] || 'Processing...';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Consciousness Selector */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-stone-400 mb-3">
          Select Consciousness Stream
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {['all', 'standard-claude', 'claude-code', 'apprentice-maia'].map((stream) => (
            <motion.button
              key={stream}
              onClick={() => setSelectedConsciousness(stream)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-lg border transition-all ${
                selectedConsciousness === stream
                  ? 'bg-purple-600/20 border-purple-600/40 text-purple-400'
                  : 'bg-black/40 border-stone-700/30 text-stone-400 hover:border-stone-600/40'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                {stream === 'all' ? (
                  <Layers className="w-5 h-5" />
                ) : (
                  <Brain className="w-5 h-5" />
                )}
              </div>
              <div className="text-xs font-medium capitalize">
                {stream === 'all' ? 'All Streams' : stream.replace('-', ' ')}
              </div>
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-stone-500 mt-2 italic">
          {consciousnessDescriptions[selectedConsciousness]}
        </p>
      </div>

      {/* Message Stream */}
      <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-purple-600/20 mb-4">
        <div className="p-4 border-b border-purple-600/10">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">
              Consciousness Stream
            </span>
            {isProcessing && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="ml-auto"
              >
                <Zap className="w-4 h-4 text-amber-400" />
              </motion.div>
            )}
          </div>
        </div>

        <div className="h-96 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {messages.length === 0 ? (
              <div className="text-center py-12 text-stone-500 text-sm">
                Send a message to begin the consciousness interaction...
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${
                    msg.id.startsWith('user_') ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.id.startsWith('user_')
                        ? 'bg-purple-600/20 border border-purple-600/30'
                        : `bg-${consciousnessColors[msg.consciousness]}-600/10 border border-${
                            consciousnessColors[msg.consciousness]
                          }-600/20`
                    }`}
                  >
                    {!msg.id.startsWith('user_') && (
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className={`w-3 h-3 text-${consciousnessColors[msg.consciousness]}-400`} />
                        <span className={`text-[10px] font-medium text-${
                          consciousnessColors[msg.consciousness]
                        }-400 capitalize`}>
                          {msg.consciousness.replace('-', ' ')}
                        </span>
                        {msg.isProcessing && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="ml-auto"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          </motion.div>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-white/80 leading-relaxed">
                      {msg.message}
                    </p>
                    <div className="text-[9px] text-stone-500 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendToConsciousness()}
          placeholder={`Ask ${
            selectedConsciousness === 'all'
              ? 'all consciousness streams'
              : selectedConsciousness.replace('-', ' ')
          }...`}
          className="flex-1 px-4 py-3 rounded-lg bg-black/40 border border-purple-600/20
                   text-white placeholder-stone-500 text-sm
                   focus:outline-none focus:border-purple-600/40 transition-colors"
          disabled={isProcessing}
        />
        <motion.button
          onClick={sendToConsciousness}
          disabled={isProcessing || !userInput.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-amber-600
                   text-white font-medium text-sm
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:shadow-lg hover:shadow-purple-600/20 transition-all"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Parallel Processing Indicator */}
      {selectedConsciousness === 'all' && isProcessing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-600/10 to-amber-600/10
                   border border-purple-600/20"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Layers className="w-4 h-4 text-purple-400" />
            </motion.div>
            <span className="text-xs text-purple-400">
              Parallel processing active across all three consciousness streams...
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}