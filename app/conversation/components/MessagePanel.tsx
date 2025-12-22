'use client';

import { useEffect, useRef } from 'react';

type VoiceMode = 'talk' | 'care' | 'note';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: VoiceMode;
  timestamp: string;
  metadata?: {
    processingTime?: number;
    error?: boolean;
  };
}

interface MessagePanelProps {
  messages: Message[];
  isLoading: boolean;
  onClear: () => void;
}

const MODE_COLORS: Record<VoiceMode, string> = {
  talk: 'violet',
  care: 'emerald',
  note: 'amber',
};

export function MessagePanel({ messages, isLoading, onClear }: MessagePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="bg-slate-900/50 border border-violet-500/30 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-violet-500/30 bg-slate-800/50">
        <h2 className="text-white text-sm font-semibold">Conversation</h2>
        {messages.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="h-[400px] overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-violet-600 text-white'
                    : message.mode
                    ? `bg-${MODE_COLORS[message.mode]}-900/30 border border-${MODE_COLORS[message.mode]}-500/30 text-white`
                    : 'bg-slate-800 text-white'
                }`}
              >
                {message.role === 'assistant' && message.mode && (
                  <div className={`text-xs text-${MODE_COLORS[message.mode]}-400 mb-1 font-medium`}>
                    {message.mode.toUpperCase()} MODE
                  </div>
                )}

                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>

                {message.metadata && (
                  <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center gap-3 text-xs text-slate-400">
                    {message.metadata.processingTime && (
                      <span>{message.metadata.processingTime}ms</span>
                    )}
                    {message.metadata.error && (
                      <span className="text-red-400">⚠️ Fallback response</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-slate-400">MAIA is responding...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
