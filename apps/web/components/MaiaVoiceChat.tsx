'use client';

import { useMaiaVoice } from '@/lib/hooks/useMaiaVoice';
import { getMaiaSystemPrompt } from '@/lib/voice/MaiaSystemPrompt';
import { useState } from 'react';

export interface MaiaVoiceChatProps {
  userId?: string;
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  conversationStyle?: 'natural' | 'consciousness' | 'adaptive';
  journalContext?: string;
  autoConnect?: boolean;
  onClose?: () => void;
}

export default function MaiaVoiceChat({
  userId = 'anonymous',
  element = 'aether',
  conversationStyle = 'natural',
  journalContext = '',
  autoConnect = false,
  onClose,
}: MaiaVoiceChatProps) {
  const [selectedVoice, setSelectedVoice] = useState<'shimmer' | 'alloy' | 'nova' | 'echo'>('shimmer');

  const systemPrompt = getMaiaSystemPrompt({
    conversationStyle,
    element,
    journalContext,
  });

  const {
    isConnected,
    isSpeaking,
    isListening,
    messages,
    error,
    connect,
    disconnect,
    sendText,
    interrupt,
  } = useMaiaVoice({
    userId,
    element,
    conversationStyle,
    voice: selectedVoice,
    systemPrompt,
    autoConnect: false, // Never auto-connect to avoid hydration issues
  });

  const handleVoiceChange = (voice: 'shimmer' | 'alloy' | 'nova' | 'echo') => {
    setSelectedVoice(voice);
    // Note: changing voice requires reconnecting
    if (isConnected) {
      disconnect();
      setTimeout(() => connect(), 500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-purple-950/20 to-black/40 backdrop-blur-sm rounded-lg border border-gold-amber/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gold-amber/20">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'
          }`} />
          <h2 className="text-white font-semibold">Voice Chat with Maia</h2>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-gold-amber/60 hover:text-gold-amber transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Voice Selection */}
      {!isConnected && (
        <div className="p-4 border-b border-gold-amber/20">
          <label className="block text-sm text-white mb-2 font-medium">
            Select Maia's Voice:
          </label>
          <div className="flex gap-2">
            {(['shimmer', 'alloy', 'nova', 'echo'] as const).map((voice) => (
              <button
                key={voice}
                onClick={() => handleVoiceChange(voice)}
                className={`px-3 py-1.5 rounded-md text-sm capitalize transition-all font-medium ${
                  selectedVoice === voice
                    ? 'bg-gold-amber/30 text-white border border-gold-amber/60'
                    : 'bg-white/10 text-white hover:bg-white/20 hover:border hover:border-gold-amber/40'
                }`}
              >
                {voice}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-300 mt-2">
            Recommended: <span className="text-gold-divine font-medium">Shimmer</span> (warm, grounded) or <span className="text-gold-divine font-medium">Alloy</span> (calm, clear)
          </p>
        </div>
      )}

      {/* Status Indicator */}
      <div className="px-4 py-3 bg-black/40 border-b border-gold-amber/20">
        {isConnected ? (
          <div className="flex items-center gap-2 text-sm font-medium">
            {isSpeaking && (
              <div className="flex items-center gap-2 text-gold-divine">
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-gold-divine animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-4 bg-gold-divine animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-4 bg-gold-divine animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Maia is speaking...</span>
              </div>
            )}
            {isListening && !isSpeaking && (
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Listening...</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 font-medium">
            Not connected
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && isConnected && (
          <div className="text-center text-white py-8">
            <p className="text-sm font-medium">Start speaking to begin your conversation with Maia</p>
            <p className="text-xs mt-2 text-gray-400">
              Voice Activity Detection is active - just speak naturally
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.isUser
                  ? 'bg-gold-amber/20 text-gold-divine border border-gold-amber/30'
                  : 'bg-purple-900/30 text-white border border-purple-500/30'
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p className="text-xs opacity-50 mt-1">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-3 bg-red-900/20 border-t border-red-500/30">
          <p className="text-sm text-red-400">⚠️ {error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="p-4 border-t border-gold-amber/20">
        {!isConnected ? (
          <button
            onClick={connect}
            className="w-full py-3 bg-gold-amber/20 hover:bg-gold-amber/30 text-gold-divine border border-gold-amber/40 rounded-lg transition-all font-semibold"
          >
            🎙️ Start Voice Conversation
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={interrupt}
              disabled={!isSpeaking}
              className={`flex-1 py-3 rounded-lg transition-all font-semibold ${
                isSpeaking
                  ? 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/40'
                  : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
              }`}
            >
              ⏸️ Interrupt
            </button>
            <button
              onClick={disconnect}
              className="flex-1 py-3 bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-500/40 rounded-lg transition-all font-semibold"
            >
              🛑 End Conversation
            </button>
          </div>
        )}
      </div>

      {/* Debug Info (optional, remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-4 py-2 bg-black/40 border-t border-white/10 text-xs font-mono">
          <div className="flex gap-4 text-white/50">
            <span>Connected: {isConnected ? '✅' : '❌'}</span>
            <span>Speaking: {isSpeaking ? '🔊' : '🔇'}</span>
            <span>Listening: {isListening ? '👂' : '🙉'}</span>
            <span>Messages: {messages.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
