/**
 * 🌀 Maya Stream Hook with Spiralogic Integration
 *
 * Wraps the existing useMaiaStream with message management and
 * integrates the new 12-Phase Spiralogic consciousness system.
 */

import { useState, useCallback, useEffect } from 'react';
import { useMaiaStream } from './useMaiaStream';
import { useMaiaSpiralogic } from './useMaiaSpiralogic';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  spiralogicData?: any;
}

export interface UseMayaStreamReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  spiralogicResponse: any;
  currentPhase: any;
}

export function useMayaStream(): UseMayaStreamReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { stream, isStreaming } = useMaiaStream();

  // Get user ID for Spiralogic
  const userId = typeof sessionStorage !== 'undefined'
    ? sessionStorage.getItem('explorerId') || 'anonymous'
    : 'anonymous';

  // Integrate Spiralogic consciousness system
  const {
    response: spiralogicResponse,
    currentPhase,
    sendInput: sendSpiralogicInput,
    loading: spiralogicLoading
  } = useMaiaSpiralogic(userId);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Send to both systems in parallel
      const [maiaResponse] = await Promise.all([
        // Existing MAIA stream system
        stream({
          userText: content,
          element: currentPhase?.element || 'Fire', // Use detected element or default
          userId,
          lang: 'en-US'
        }),
        // New Spiralogic system (runs in background)
        sendSpiralogicInput(content)
      ]);

      // Create assistant message with MAIA response
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: maiaResponse || 'I appreciate you sharing that with me.',
        timestamp: new Date(),
        spiralogicData: spiralogicResponse
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Maya stream error:', error);

      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I am having trouble responding right now. Please try again in a moment.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  }, [stream, isStreaming, sendSpiralogicInput, spiralogicResponse, currentPhase, userId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Enhanced loading state that considers both systems
  const combinedLoading = isStreaming || spiralogicLoading;

  return {
    messages,
    isStreaming: combinedLoading,
    sendMessage,
    clearMessages,
    spiralogicResponse,
    currentPhase
  };
}