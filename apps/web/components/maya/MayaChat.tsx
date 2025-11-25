'use client';

import { useEffect, useRef } from 'react';
import { useMayaStream } from '@/hooks/useMayaStream';
import HybridInput from '@/components/chat/HybridInput';

export default function MayaChat() {
  const { messages, isStreaming, sendMessage } = useMayaStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Track session on mount
  useEffect(() => {
    const userId = sessionStorage.getItem('explorerId') || localStorage.getItem('explorerId');
    if (userId) {
      fetch('/api/beta/track-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'start' })
      }).catch(err => console.log('Session tracking failed:', err));
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#1a1f3a] relative">
      {/* AIN Amber Sacred Geometry Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <svg viewBox="0 0 1000 1000" className="w-full h-full">
          <circle cx="500" cy="500" r="400" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="#F6AD55" strokeWidth="0.5" strokeDasharray="2 6" />
          <circle cx="500" cy="500" r="200" fill="none" stroke="#F6AD55" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-amber-500/20 px-4 py-3 backdrop-blur-sm bg-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 animate-pulse" />
              <div className="absolute inset-1 rounded-full bg-[#1a1f3a]" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-400/40 to-amber-600/40" />
            </div>
            <div>
              <h2 className="text-amber-50 font-light tracking-wider">Maya</h2>
              <p className="text-xs text-amber-200/40">
                Oracle Guide for {sessionStorage.getItem('explorerName')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 animate-pulse" />
                <div className="absolute inset-2 rounded-full bg-[#1a1f3a]" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/30" />
              </div>
            </div>
            <p className="text-amber-200/40 text-sm font-light tracking-wide">
              Welcome, {sessionStorage.getItem('explorerName')}
            </p>
            <p className="text-amber-200/70 mt-3 text-lg font-light">
              How can I support your journey today?
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] px-5 py-4 rounded-2xl backdrop-blur-sm ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-amber-500/15 to-amber-600/10 text-amber-50 border border-amber-500/30 shadow-lg shadow-amber-500/5'
                  : 'bg-gradient-to-r from-black/50 to-black/40 text-amber-100/90 border border-amber-500/20 shadow-xl shadow-black/20'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <p className="text-xs text-amber-200/40 mt-2 font-light">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex justify-start">
            <div className="px-5 py-4 rounded-2xl bg-gradient-to-r from-black/50 to-black/40 border border-amber-500/20 backdrop-blur-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-amber-400/80 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-amber-500/80 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-amber-600/80 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-amber-500/20 p-4 backdrop-blur-sm bg-black/30">
        <HybridInput
          onSend={sendMessage}
          disabled={isStreaming}
          placeholder="Share your thoughts..."
          className="w-full"
        />
      </div>
      </div>
    </div>
  );
}