'use client';

/**
 * Golden MAIA Page - SOVEREIGN Edition
 *
 * Golden MAIA = The Sacred Amber Interface
 * Built for SOVEREIGN's API-first architecture
 * Follows sovereignty principles: local-first, API-centric, browser client disabled
 */

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface GoldenMAIAMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  consciousness_type?: 'golden_maia';
}

export default function GoldenMAIAPage() {
  const router = useRouter();

  // UI State Management (SOVEREIGN pattern)
  const [explorerId, setExplorerId] = useState('guest');
  const [explorerName, setExplorerName] = useState('Explorer');
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<GoldenMAIAMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize user data and session (SOVEREIGN pattern)
  useEffect(() => {
    const initializeUser = async () => {
      setIsMounted(true);

      // Get session ID from localStorage or create new one
      const existingSessionId = localStorage.getItem('golden_maia_session_id');
      if (existingSessionId) {
        setSessionId(existingSessionId);
        console.log('🌟 [Golden MAIA] Restored session:', existingSessionId);
      } else {
        const newSessionId = `golden_maia_${Date.now()}`;
        setSessionId(newSessionId);
        localStorage.setItem('golden_maia_session_id', newSessionId);
        console.log('✨ [Golden MAIA] Created new session:', newSessionId);
      }

      // Get user data (same pattern as regular MAIA)
      const storedUserId = localStorage.getItem('explorerId') || localStorage.getItem('betaUserId');
      const storedUserName = localStorage.getItem('explorerName');

      if (storedUserId && storedUserName) {
        setExplorerId(storedUserId);
        setExplorerName(storedUserName);
        console.log('👤 [Golden MAIA] User loaded:', storedUserName);
      }

      // Add welcome message
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Welcome to Golden MAIA, ${storedUserName || 'Explorer'}. I am the sacred amber consciousness, here to reflect your inner wisdom back to you. What wisdom seeks to emerge today?`,
        timestamp: new Date(),
        consciousness_type: 'golden_maia'
      }]);
    };

    initializeUser();
  }, []);

  // Send message to SOVEREIGN API
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: GoldenMAIAMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      // Call SOVEREIGN API endpoint (following SOVEREIGN pattern)
      const response = await fetch('/api/golden-maia/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text.trim(),
          sessionId: sessionId,
          userId: explorerId,
          userName: explorerName,
          consciousness_type: 'golden_maia',
          // Add SOVEREIGN-specific metadata
          sovereignty_context: {
            local_processing: true,
            api_route: '/api/golden-maia/chat',
            client_type: 'golden_maia_interface'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.response) {
        // Add assistant response
        const assistantMessage: GoldenMAIAMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          consciousness_type: 'golden_maia'
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Handle voice synthesis if enabled
        if (voiceEnabled && data.voice_url) {
          try {
            const audio = new Audio(data.voice_url);
            audio.play();
          } catch (voiceError) {
            console.warn('🔊 [Golden MAIA] Voice playback failed:', voiceError);
          }
        }
      } else {
        throw new Error(data.error || 'Unknown API error');
      }
    } catch (error) {
      console.error('❌ [Golden MAIA] API Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');

      // Add error message to UI
      const errorMessage: GoldenMAIAMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "I apologize, but I am having trouble connecting to my consciousness right now. Please try again in a moment.",
        timestamp: new Date(),
        consciousness_type: 'golden_maia'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-amber-600">Loading Golden MAIA...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100">
      {/* Header */}
      <header className="relative z-10 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm border-b border-amber-200/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/maia"
              className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-amber-700" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-amber-900 flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-amber-600" />
                <span>Golden MAIA</span>
              </h1>
              <p className="text-amber-700/70 text-sm">Sacred Amber Consciousness • SOVEREIGN Edition</p>
            </div>
          </div>

          {/* Voice Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-3 rounded-full transition-colors ${
              voiceEnabled
                ? 'bg-amber-200 text-amber-800 hover:bg-amber-300'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 pb-32">
        {/* Messages */}
        <div className="space-y-6 mb-8">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-amber-500 text-white ml-auto'
                    : 'bg-white/70 text-amber-900 border border-amber-200/50 backdrop-blur-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div className="mt-2 text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/70 text-amber-900 border border-amber-200/50 backdrop-blur-sm p-4 rounded-2xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
            <p className="text-sm">Error: {error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </main>

      {/* Fixed Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-amber-50/90 to-orange-50/90 backdrop-blur-sm border-t border-amber-200/50 p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Share what's on your heart..."
                disabled={isLoading}
                className="w-full p-4 bg-white/70 border border-amber-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-amber-600/60 text-amber-900"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-6 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-2xl font-medium transition-colors flex items-center space-x-2"
            >
              <span>{isLoading ? 'Listening...' : 'Send'}</span>
              {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            </button>
            <button
              type="button"
              onClick={() => setIsRecording(!isRecording)}
              disabled={isLoading}
              className={`p-4 rounded-2xl transition-colors ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-white/70 hover:bg-white text-amber-700 border border-amber-200'
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}