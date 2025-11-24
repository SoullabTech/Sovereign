'use client';

import { useState, useEffect } from 'react';
import { Mic, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ConversationState = 'idle' | 'typing' | 'sending' | 'thinking' | 'responding' | 'complete';

interface Message {
  id: string;
  type: 'user' | 'maia';
  content: string;
  timestamp: number;
}

export default function SoullabMirrorStateful() {
  const [state, setState] = useState<ConversationState>('idle');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);

  // Simulate conversation flow
  const handleSendMessage = async () => {
    if (!input.trim() || state !== 'idle' && state !== 'complete') return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user', 
      content: input.trim(),
      timestamp: Date.now()
    };

    // Add user message and transition states
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // State progression: typing -> sending -> thinking -> responding -> complete
    setState('sending');
    
    setTimeout(() => setState('thinking'), 800);
    setTimeout(() => setState('responding'), 2500);
    setTimeout(() => {
      // Add Maia&apos;s response
      const maiaResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'maia',
        content: "I notice there&apos;s something tender in how you speak about uncertainty. Transitions can feel like standing at the edge of the unknown. What feels most alive in this change for you right now?",
        timestamp: Date.now() + 1
      };
      setMessages(prev => [...prev, maiaResponse]);
      setState('complete');
    }, 4000);
  };

  // Logo animation variants
  const logoVariants = {
    idle: { 
      scale: [0.95, 1.05, 0.95],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    thinking: {
      rotate: [0, 360],
      transition: { duration: 6, repeat: Infinity, ease: "linear" }
    },
    responding: {
      scale: [1, 1.1, 1],
      filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
    },
    sending: {
      scale: 1.05,
      filter: "brightness(1.2)",
      transition: { duration: 0.3 }
    }
  };

  // Status dot colors based on state
  const getStatusColor = () => {
    switch (state) {
      case 'idle': case 'complete': return '#10B981'; // Green
      case 'sending': case 'thinking': case 'responding': return '#F59E0B'; // Amber
      case 'typing': return '#6366F1'; // Blue
      default: return '#10B981';
    }
  };

  // Input placeholder based on state
  const getPlaceholder = () => {
    switch (state) {
      case 'idle': return 'Offer your reflection…';
      case 'complete': return 'Continue the conversation...';
      case 'typing': return input || 'Offer your reflection…';
      case 'sending': return 'Sending...';
      case 'thinking': return 'Maia is thinking...';
      case 'responding': return 'Maia is responding...';
      default: return 'Offer your reflection…';
    }
  };

  // Send button state
  const getSendButtonState = () => {
    if (state === 'sending') return 'loading';
    if (!input.trim()) return 'disabled';
    if (state === 'thinking' || state === 'responding') return 'disabled';
    return 'active';
  };

  return (
    <div className="w-[390px] h-[844px] bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col relative overflow-hidden">
      {/* Status Bar */}
      <div className="h-12 bg-transparent" />
      
      {/* Logo Indicator */}
      <div className="flex justify-center mt-8 relative">
        <motion.div 
          variants={logoVariants}
          animate={state === 'idle' || state === 'complete' ? 'idle' : 
                  state === 'thinking' ? 'thinking' :
                  state === 'responding' ? 'responding' : 'sending'}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-500 relative"
          style={{
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
          }}
        />
        
        {/* Status Dot */}
        <motion.div 
          className="absolute top-12 w-2 h-2 rounded-full"
          style={{ backgroundColor: getStatusColor() }}
          animate={{ 
            scale: (state === 'sending' || state === 'thinking' || state === 'responding') ? [1, 1.3, 1] : 1
          }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />

        {/* Thinking Dots */}
        <AnimatePresence>
          {state === 'thinking' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-20 flex space-x-1"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 bg-amber-500 rounded-full"
                  animate={{
                    y: [0, -4, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audio Waves (for responding state) */}
        <AnimatePresence>
          {state === 'responding' && (
            <div className="absolute inset-0 pointer-events-none">
              {[80, 100].map((radius, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 rounded-full border border-amber-400/30"
                  style={{
                    width: radius,
                    height: radius,
                    marginTop: -radius/2,
                    marginLeft: -radius/2,
                  }}
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ 
                    scale: [0, 1, 1.2],
                    opacity: [0.6, 0.3, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Message Area */}
      <div className="flex-1 px-5 pt-8 pb-4 overflow-y-auto">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[280px] px-4 py-3 rounded-2xl
                    ${message.type === 'user' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'bg-gradient-to-r from-indigo-500 to-amber-500 text-white shadow-lg'
                    }
                  `}
                  style={message.type === 'maia' ? {
                    boxShadow: '0 2px 12px rgba(99, 102, 241, 0.15), 0 0 20px rgba(139, 92, 246, 0.1)'
                  } : {}}
                >
                  <p className="text-base leading-relaxed">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Maia Typing Indicator */}
          <AnimatePresence>
            {state === 'responding' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex justify-start"
              >
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-amber-500 px-4 py-3 rounded-2xl shadow-lg"
                  style={{
                    boxShadow: '0 2px 12px rgba(99, 102, 241, 0.15), 0 0 20px rgba(139, 92, 246, 0.2)'
                  }}
                >
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-white rounded-full"
                        animate={{
                          y: [0, -4, 0],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Actions */}
      <AnimatePresence>
        {state === 'complete' && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-5 pb-2"
          >
            <div className="flex justify-center space-x-3">
              {[
                { icon: '📓', label: 'Journal', color: 'amber' },
                { icon: '🌀', label: 'Spiral', color: 'indigo' },
                { icon: '🎚', label: 'Tone', color: 'purple' }
              ].map((chip) => (
                <button
                  key={chip.label}
                  className={`
                    px-3 py-1.5 rounded-2xl text-sm font-medium border transition-colors
                    ${chip.color === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' :
                      chip.color === 'indigo' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' :
                      'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'}
                  `}
                >
                  {chip.icon} {chip.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <div className="px-5 pb-6">
        <div className="relative">
          <div 
            className={`
              flex items-center space-x-3 bg-white rounded-full px-3 py-2 shadow-sm transition-all duration-300
              ${state === 'typing' ? 'ring-2 ring-indigo-500 shadow-lg' : 'border border-gray-200'}
            `}
          >
            {/* Voice Button */}
            <button
              disabled={state === 'thinking' || state === 'responding' || state === 'sending'}
              className={`
                w-9 h-9 rounded-full flex items-center justify-center transition-all
                ${isVoiceRecording 
                  ? 'bg-blue-500 text-white' 
                  : state === 'thinking' || state === 'responding' || state === 'sending'
                  ? 'bg-gray-100 text-gray-400' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              onClick={() => setIsVoiceRecording(!isVoiceRecording)}
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={state === 'typing' ? input : ''}
              onChange={(e) => {
                setInput(e.target.value);
                setState(e.target.value ? 'typing' : state === 'typing' ? 'idle' : state);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={getPlaceholder()}
              disabled={state === 'thinking' || state === 'responding' || state === 'sending'}
              className="flex-1 outline-none text-gray-900 placeholder-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed"
            />

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={getSendButtonState() === 'disabled'}
              className={`
                w-9 h-9 rounded-full flex items-center justify-center transition-all
                ${getSendButtonState() === 'active'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md hover:scale-105' 
                  : getSendButtonState() === 'loading'
                  ? 'bg-amber-400 text-white'
                  : 'bg-amber-200 text-amber-600 cursor-not-allowed'
                }
              `}
            >
              {getSendButtonState() === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* State Debug (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-black/80 text-white text-xs px-2 py-1 rounded">
          State: {state}
        </div>
      )}
    </div>
  );
}