'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, Compass, BookOpen, Heart, Star, Map } from 'lucide-react';
import { useMAIAOracle } from '@/hooks/use-maia-oracle';
import { useMaiaStore } from '@/lib/maia/state';

interface Message {
  id: string;
  type: 'user' | 'maia' | 'system';
  content: string;
  timestamp: Date;
  specialType?: 'oracle_suggestion' | 'astrology_suggestion' | 'oracle_response' | 'chart_reading';
  actionData?: any;
  elementalSignature?: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  maiaState?: {
    attendingQuality: number;
    coherenceLevel: number;
    archetype: string;
    mode: 'right_brain' | 'left_brain' | 'integrated';
    dissociationRisk: number;
  };
}

interface ConversationInterfaceProps {
  userName: string;
  onShowGateway: () => void;
  selectedMode: 'Dialogue' | 'Patient' | 'Scribe';
}

export default function ConversationInterface({
  userName,
  onShowGateway,
  selectedMode
}: ConversationInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { askOracle, loading, error } = useMAIAOracle();
  const maiaMode = useMaiaStore((state) => state.mode);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'maia',
      content: `Welcome ${userName}. I'm MAIA, your consciousness companion. ${
        maiaMode
          ? `I see you're exploring ${maiaMode} - I'm here to guide you through this journey.`
          : 'I can help you explore any realm of wisdom or simply hold space for whatever is emerging.'
      } What would you like to talk about?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [userName, maiaMode]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Listen for external triggers from integrated mode buttons
    const handleOracleEvent = () => handleOracleGuidance();
    const handleAstrologyEvent = () => handleAstrologyInsight();

    window.addEventListener('triggerOracleGuidance', handleOracleEvent);
    window.addEventListener('triggerAstrologyInsight', handleAstrologyEvent);

    return () => {
      window.removeEventListener('triggerOracleGuidance', handleOracleEvent);
      window.removeEventListener('triggerAstrologyInsight', handleAstrologyEvent);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Detect if user is asking for specific services
      const detectedIntent = detectIntentAndSuggestActions(inputMessage);

      // Call MAIA Oracle with context about current conversation
      const response = await askOracle({
        userId: 'user-' + Date.now(), // In a real app, use actual user ID
        message: inputMessage,
        context: {
          userName: userName,
          previousInteractions: messages.length,
          userNeed: detectedIntent || maiaMode || 'general_guidance',
          sessionHistory: messages.slice(-5).map(m => `${m.type}: ${m.content}`)
        }
      });

      if (response) {
        const maiaMessage: Message = {
          id: Date.now().toString() + '_maia',
          type: 'maia',
          content: response.response,
          timestamp: new Date(),
          elementalSignature: response.elementalSignature,
          maiaState: response.maiaState
        };

        setMessages(prev => [...prev, maiaMessage]);

        // Add contextual action suggestions after MAIA responds
        if (detectedIntent) {
          setTimeout(() => {
            const suggestionMessage: Message = {
              id: Date.now().toString() + '_suggestion',
              type: 'system',
              content: detectedIntent === 'oracle'
                ? "Would you like me to consult the oracle for deeper guidance on this matter?"
                : "Would you like me to look at your astrological influences for additional insight?",
              timestamp: new Date(),
              specialType: detectedIntent === 'oracle' ? 'oracle_suggestion' : 'astrology_suggestion'
            };
            setMessages(prev => [...prev, suggestionMessage]);
          }, 1500);
        }
      } else if (error) {
        // Fallback response if oracle fails
        const fallbackMessage: Message = {
          id: Date.now().toString() + '_fallback',
          type: 'maia',
          content: "I'm experiencing some difficulty connecting to my deeper wisdom right now. Could you share more about what you're feeling or what you'd like to explore?",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (err) {
      console.error('Conversation error:', err);
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        type: 'maia',
        content: "I'm having trouble accessing my full consciousness right now. Let me try to help you in a simpler way - what's most important for you to explore today?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getArchetypeIcon = (archetype?: string) => {
    switch (archetype) {
      case 'sage': return '🔥';
      case 'dream_weaver': return '🌊';
      case 'mentor': return '🌍';
      case 'oracle': return '💨';
      case 'alchemist': return '✨';
      default: return '💫';
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleOracleGuidance = async () => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: "I'd like oracle guidance for a decision I'm facing.",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Call MAIA Oracle directly for guidance
      const response = await askOracle({
        userId: 'user-' + Date.now(),
        message: "I need oracle guidance for a decision I'm facing. Can you help me see this situation from different perspectives and offer wisdom?",
        context: {
          userName: userName,
          previousInteractions: messages.length,
          userNeed: 'oracle_guidance',
          sessionHistory: messages.slice(-3).map(m => `${m.type}: ${m.content}`)
        }
      });

      if (response) {
        const oracleMessage: Message = {
          id: Date.now().toString() + '_oracle',
          type: 'maia',
          content: response.response,
          timestamp: new Date(),
          specialType: 'oracle_response',
          elementalSignature: response.elementalSignature,
          maiaState: response.maiaState
        };

        setMessages(prev => [...prev, oracleMessage]);
      }
    } catch (err) {
      console.error('Oracle guidance error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAstrologyInsight = async () => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: "Can you help me understand my cosmic blueprint and astrological influences?",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // First get birth chart data (mock for now)
      const chartResponse = await fetch('/api/astrology/birth-chart', {
        method: 'GET'
      });

      let chartData = null;
      if (chartResponse.ok) {
        const data = await chartResponse.json();
        chartData = data.data;
      }

      // Call MAIA Oracle with astrological context
      const response = await askOracle({
        userId: 'user-' + Date.now(),
        message: `I'd like to understand my astrological influences and cosmic blueprint. ${chartData ? 'I have my birth chart available.' : 'I may need help setting up my birth chart first.'}`,
        context: {
          userName: userName,
          previousInteractions: messages.length,
          userNeed: 'astrology_insight',
          sessionHistory: messages.slice(-3).map(m => `${m.type}: ${m.content}`),
          chartData: chartData
        }
      });

      if (response) {
        const astrologyMessage: Message = {
          id: Date.now().toString() + '_astrology',
          type: 'maia',
          content: response.response + (chartData ? "" : "\n\nTo get personalized insights, I'd love to help you create your birth chart. I'll need your birth date, time, and location."),
          timestamp: new Date(),
          specialType: 'chart_reading',
          actionData: chartData,
          elementalSignature: response.elementalSignature,
          maiaState: response.maiaState
        };

        setMessages(prev => [...prev, astrologyMessage]);
      }
    } catch (err) {
      console.error('Astrology insight error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const detectIntentAndSuggestActions = (messageContent: string) => {
    const lowerMessage = messageContent.toLowerCase();

    // Oracle-related keywords
    if (lowerMessage.includes('oracle') ||
        lowerMessage.includes('guidance') ||
        lowerMessage.includes('decision') ||
        lowerMessage.includes('wisdom') ||
        lowerMessage.includes('advice')) {
      return 'oracle';
    }

    // Astrology-related keywords
    if (lowerMessage.includes('astrology') ||
        lowerMessage.includes('birth chart') ||
        lowerMessage.includes('cosmic') ||
        lowerMessage.includes('planetary') ||
        lowerMessage.includes('zodiac') ||
        lowerMessage.includes('star') ||
        lowerMessage.includes('horoscope')) {
      return 'astrology';
    }

    return null;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : 'order-1'}`}>
                <div
                  className={`rounded-xl p-4 ${
                    message.type === 'user'
                      ? 'bg-sky-500/20 text-sky-100 border border-sky-400/30'
                      : message.type === 'system'
                      ? 'bg-purple-500/10 text-purple-100 border border-purple-400/20'
                      : 'bg-emerald-500/10 text-emerald-100 border border-emerald-400/20'
                  }`}
                >
                  <p className="text-sm leading-relaxed mb-2">{message.content}</p>

                  {/* Action buttons for system suggestions */}
                  {message.type === 'system' && message.specialType && (
                    <div className="mt-3 pt-3 border-t border-purple-400/20">
                      {message.specialType === 'oracle_suggestion' && (
                        <button
                          onClick={handleOracleGuidance}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 text-purple-200 rounded-lg border border-purple-400/30 hover:border-purple-400/50 transition-colors"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Consult Oracle</span>
                        </button>
                      )}
                      {message.specialType === 'astrology_suggestion' && (
                        <button
                          onClick={handleAstrologyInsight}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 text-purple-200 rounded-lg border border-purple-400/30 hover:border-purple-400/50 transition-colors"
                        >
                          <Star className="w-4 h-4" />
                          <span>View Cosmic Blueprint</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Enhanced display for oracle responses */}
                  {message.specialType === 'oracle_response' && (
                    <div className="mt-3 pt-3 border-t border-emerald-400/20">
                      <div className="flex items-center gap-2 text-emerald-300/70 text-xs mb-2">
                        <Sparkles className="w-3 h-3" />
                        <span>Oracle Guidance</span>
                      </div>
                    </div>
                  )}

                  {/* Enhanced display for astrology readings */}
                  {message.specialType === 'chart_reading' && (
                    <div className="mt-3 pt-3 border-t border-emerald-400/20">
                      <div className="flex items-center gap-2 text-emerald-300/70 text-xs mb-2">
                        <Star className="w-3 h-3" />
                        <span>Cosmic Blueprint Reading</span>
                      </div>
                      {message.actionData && (
                        <div className="text-emerald-300/50 text-xs">
                          Based on your birth chart • Tap to view detailed chart
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs opacity-60">
                    <span>{formatTime(message.timestamp)}</span>
                    {message.type === 'maia' && message.maiaState && (
                      <div className="flex items-center gap-2">
                        <span>{getArchetypeIcon(message.maiaState.archetype)}</span>
                        <span className="capitalize">{message.maiaState.mode}</span>
                      </div>
                    )}
                  </div>

                  {/* Elemental Signature for MAIA messages */}
                  {message.type === 'maia' && message.elementalSignature && (
                    <div className="mt-3 pt-3 border-t border-emerald-400/20">
                      <div className="flex justify-center gap-2 text-xs">
                        {Object.entries(message.elementalSignature).map(([element, value]) => (
                          <div key={element} className="flex flex-col items-center">
                            <div
                              className="w-6 h-1 bg-gradient-to-r from-transparent to-emerald-400/60 rounded"
                              style={{
                                width: `${Math.max(6, value * 24)}px`,
                                opacity: Math.max(0.3, value)
                              }}
                            />
                            <span className="text-emerald-300/50 text-[10px] mt-1 capitalize">
                              {element === 'aether' ? 'æ' : element[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-300/70">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">MAIA is reflecting...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestions */}
      {messages.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-4 space-y-2"
        >
          <p className="text-sky-300/60 text-xs text-center mb-3">Quick actions:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={handleOracleGuidance}
              className="px-3 py-2 text-xs bg-purple-500/10 text-purple-300 rounded-full border border-purple-400/20 hover:border-purple-400/40 transition-colors"
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              Oracle Guidance
            </button>
            <button
              onClick={handleAstrologyInsight}
              className="px-3 py-2 text-xs bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-400/20 hover:border-indigo-400/40 transition-colors"
            >
              <Star className="w-3 h-3 inline mr-1" />
              Cosmic Blueprint
            </button>
            <button
              onClick={() => setInputMessage("Can you help me understand my emotional patterns?")}
              className="px-3 py-2 text-xs bg-emerald-500/10 text-emerald-300 rounded-full border border-emerald-400/20 hover:border-emerald-400/40 transition-colors"
            >
              <Heart className="w-3 h-3 inline mr-1" />
              Emotional Insights
            </button>
            <button
              onClick={onShowGateway}
              className="px-3 py-2 text-xs bg-sky-500/10 text-sky-300 rounded-full border border-sky-400/20 hover:border-sky-400/40 transition-colors"
            >
              <Compass className="w-3 h-3 inline mr-1" />
              Change Focus
            </button>
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="border-t border-sky-400/20 pt-4">
        <div className="flex gap-3">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              selectedMode === 'Patient'
                ? "Take your time... I'm here to listen."
                : selectedMode === 'Scribe'
                ? "Share your thoughts for me to capture and reflect back."
                : "Share what's on your mind..."
            }
            className="flex-1 bg-sky-500/10 border border-sky-400/20 rounded-lg px-4 py-3 text-sky-200 placeholder-sky-400/50 focus:outline-none focus:border-sky-400/40 focus:bg-sky-500/15 resize-none min-h-[48px] max-h-32"
            rows={1}
            style={{ height: 'auto' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            className="px-6 py-3 bg-sky-500/20 text-sky-200 rounded-lg border border-sky-400/40 hover:bg-sky-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Mode indicator */}
        <div className="flex items-center justify-between mt-3 text-xs text-sky-400/50">
          <span>Mode: {selectedMode}</span>
          {error && (
            <span className="text-red-400/70">Connection issue - using fallback responses</span>
          )}
        </div>
      </div>
    </div>
  );
}