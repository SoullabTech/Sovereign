'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { VoiceModeSelector } from './components/VoiceModeSelector';
import { MessagePanel } from './components/MessagePanel';
import { InputArea } from './components/InputArea';

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

async function sendMessage(mode: VoiceMode, message: string, userName: string) {
  const response = await fetch(`/api/conversation/${mode}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      userName,
      context: {} // Can be expanded with conversation history
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export default function ConversationClient() {
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('talk');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userName, setUserName] = useState('friend');

  const mutation = useMutation({
    mutationFn: ({ mode, message }: { mode: VoiceMode; message: string }) =>
      sendMessage(mode, message, userName),
    onSuccess: (data, variables) => {
      // Add assistant response
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        mode: variables.mode,
        timestamp: data.metadata?.timestamp || new Date().toISOString(),
        metadata: {
          processingTime: data.metadata?.processingTime,
          error: data.metadata?.error,
        },
      }]);
    },
  });

  const handleSendMessage = (message: string) => {
    // Add user message
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }]);

    // Send to API
    mutation.mutate({ mode: voiceMode, message });
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className="space-y-6">
      {/* Voice Mode Selector */}
      <VoiceModeSelector
        currentMode={voiceMode}
        onModeChange={setVoiceMode}
        disabled={mutation.isPending}
      />

      {/* User Name Input */}
      <div className="flex items-center gap-3 px-4">
        <label htmlFor="userName" className="text-violet-300 text-sm font-medium">
          Your name:
        </label>
        <input
          id="userName"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="bg-slate-800/50 border border-violet-500/30 rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          placeholder="friend"
        />
      </div>

      {/* Message Panel */}
      <MessagePanel
        messages={messages}
        isLoading={mutation.isPending}
        onClear={handleClear}
      />

      {/* Input Area */}
      <InputArea
        onSendMessage={handleSendMessage}
        disabled={mutation.isPending}
        currentMode={voiceMode}
      />

      {/* Error Display */}
      {mutation.isError && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm">
          <strong>Error:</strong> {mutation.error instanceof Error ? mutation.error.message : 'Failed to send message'}
        </div>
      )}
    </div>
  );
}
