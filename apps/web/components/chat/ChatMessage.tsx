"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';
import { CitationList, CitationData } from './CitationBadge';

export interface ChatMessageData {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  audioUrl?: string;
  citations?: CitationData[];
  metadata?: {
    element?: string;
    confidence?: number;
    sessionId?: string;
  };
}

interface ChatMessageProps {
  message: ChatMessageData;
  isLatest?: boolean;
  onPlayAudio?: (audioUrl: string) => void;
}

export function ChatMessage({ message, isLatest = false, onPlayAudio }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const hasAudio = message.audioUrl && message.role === 'assistant';
  const hasCitations = message.citations && message.citations.length > 0;
  
  const getElementColor = (element?: string) => {
    const colors = {
      fire: 'text-red-400',
      water: 'text-blue-400', 
      earth: 'text-green-400',
      air: 'text-amber-400',
      aether: 'text-gold-divine'
    };
    return element ? colors[element as keyof typeof colors] || 'text-gold-divine' : 'text-gold-divine';
  };

  const getElementEmoji = (element?: string) => {
    const emojis = {
      fire: '🔥',
      water: '💧',
      earth: '🌱', 
      air: '💨',
      aether: '✨'
    };
    return element ? emojis[element as keyof typeof emojis] || '✨' : '✨';
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} ${isLatest ? 'mb-6' : 'mb-4'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-blue-500/20 border border-blue-500/30' 
          : 'bg-gold-divine/20 border border-gold-divine/30'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-blue-400" />
        ) : (
          <Sparkles className={`w-4 h-4 ${getElementColor(message.metadata?.element)}`} />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'} max-w-[80%]`}>
        {/* Message Header */}
        <div className={`flex items-center gap-2 mb-1 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className={isUser ? 'text-soul-textSecondary' : 'text-soul-textSecondary'}>
            {isUser ? 'You' : 'Maya'}
          </span>
          {message.metadata?.element && !isUser && (
            <>
              <span>·</span>
              <span className={getElementColor(message.metadata.element)}>
                {getElementEmoji(message.metadata.element)} {message.metadata.element}
              </span>
            </>
          )}
          {message.metadata?.confidence && !isUser && (
            <>
              <span>·</span>
              <span className="text-gray-500">
                {Math.round(message.metadata.confidence * 100)}%
              </span>
            </>
          )}
          <time className="text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </time>
        </div>

        {/* Message Bubble */}
        <motion.div 
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            ...(message.role === 'assistant' && {
              boxShadow: [
                "0 0 0px rgba(139, 92, 246, 0.3)", 
                "0 0 16px rgba(139, 92, 246, 0.6)", 
                "0 0 0px rgba(139, 92, 246, 0.3)"
              ]
            })
          }}
          transition={{ 
            duration: 0.4, 
            ease: "easeOut",
            boxShadow: {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className={`relative p-4 rounded-2xl ${
            isUser
              ? 'bg-soul-surface/40 border border-soul-accent/30'
              : 'bg-soul-surface/60 border border-soul-accent/20'
          }`}>

          {/* Audio Play Button */}
          {hasAudio && (
            <button
              onClick={() => onPlayAudio?.(message.audioUrl!)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-soul-accent/20 hover:bg-soul-accentGlow/30 border border-soul-accent/40 rounded-full flex items-center justify-center transition-colors"
              title="Play Maya&apos;s voice"
            >
              <div className="w-0 h-0 border-l-[6px] border-l-soul-accentGlow border-y-[3px] border-y-transparent ml-0.5" />
            </button>
          )}

          {/* Message Text */}
          <div className="max-w-none">
            <p className={`whitespace-pre-wrap leading-relaxed mb-0 ${
              isUser ? 'text-soul-textSecondary' : 'text-soul-textSecondary'
            }`}>
              {message.content}
            </p>
          </div>

          {/* Citations - only show if memory references are enabled */}
          {hasCitations && process.env.NEXT_PUBLIC_MEMORY_REFERENCES_ENABLED === 'true' && (
            <div className="mt-3 pt-3 border-t border-gold-divine/10">
              <div className="text-xs text-gold-amber/60 mb-2 font-medium">
                Referenced from your library:
              </div>
              <CitationList citations={message.citations!} />
            </div>
          )}
        </motion.div>

        {/* Citation Summary (for messages with many citations) */}
        {hasCitations && message.citations!.length > 3 && process.env.NEXT_PUBLIC_MEMORY_REFERENCES_ENABLED === 'true' && (
          <div className="mt-2 text-xs text-gray-400">
            <span>Referenced {message.citations!.length} sources from </span>
            <span className="text-gold-divine">
              {[...new Set(message.citations!.map(c => c.fileName))].length}
            </span>
            <span> files</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface ChatThreadProps {
  messages: ChatMessageData[];
  onPlayAudio?: (audioUrl: string) => void;
  className?: string;
}

export function ChatThread({ messages, onPlayAudio, className = '' }: ChatThreadProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {messages.map((message, index) => (
        <ChatMessage 
          key={`${message.timestamp}-${index}`}
          message={message}
          isLatest={index === messages.length - 1}
          onPlayAudio={onPlayAudio}
        />
      ))}
    </div>
  );
}