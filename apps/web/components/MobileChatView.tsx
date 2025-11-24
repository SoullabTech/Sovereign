'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface MobileChatViewProps {
  userId: string;
  onSendMessage: (text: string) => void;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    audioUrl?: string;
  }>;
  isLoading?: boolean;
}

export default function MobileChatView({
  userId,
  onSendMessage,
  messages,
  isLoading = false
}: MobileChatViewProps) {
  const [inputText, setInputText] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-neutral-900 via-neutral-800 to-orange-900/20">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[85%] px-4 py-3 rounded-2xl
                ${message.role === 'user'
                  ? 'bg-gradient-to-r from-orange-600 to-red-500 text-white'
                  : 'bg-white/15 text-white border border-emerald-500/20'}
              `}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 text-emerald-300">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-xs font-medium">Maya</span>
                </div>
              )}

              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>

              {message.audioUrl && audioEnabled && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <audio
                    src={message.audioUrl}
                    controls
                    className="w-full h-8"
                    style={{ maxWidth: '100%' }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/15 px-4 py-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-end gap-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-3 rounded-full bg-white/10 text-white/60 hover:bg-white/20 active:opacity-75 transition-all min-w-[48px] min-h-[48px]"
            aria-label={audioEnabled ? 'Disable audio' : 'Enable audio'}
            type="button"
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's present..."
              className="w-full px-4 py-3 bg-white/15 rounded-2xl text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[48px] max-h-[120px]"
              rows={1}
              style={{ fontSize: '16px' }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="p-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg active:opacity-75 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[56px] min-h-[56px] shadow-lg"
            aria-label="Send message"
            type="button"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>

        {inputText.length > 200 && (
          <div className="mt-2 text-right">
            <span className={`text-xs ${inputText.length > 500 ? 'text-orange-400' : 'text-white/40'}`}>
              {inputText.length} / 500
            </span>
          </div>
        )}

        <div className="mt-2 text-center">
          <span className="text-xs text-emerald-400/60">
            Type to write • Tap send when ready
          </span>
        </div>
      </div>
    </div>
  );
}