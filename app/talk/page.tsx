'use client';

/**
 * TALK MODE PAGE
 * Phase 4.7: Meta-Dialogue Integration
 *
 * Purpose:
 * - Interactive dialogue interface between user and MAIA
 * - Discuss consciousness reflections and developmental patterns
 * - Text-only interface (TTS hooks reserved for Phase 4.7-B)
 */

import { useState, useEffect } from 'react';
import TalkThread from '../components/TalkThread';

// ============================================================================
// TYPES
// ============================================================================

interface DialogueExchange {
  id: string;
  sessionId: string;
  speaker: 'user' | 'maia';
  content: string;
  exchangeType: 'user_query' | 'maia_response' | 'maia_self_query';
  referencedFacets?: string[];
  referencedMetaLayer?: 'Æ1' | 'Æ2' | 'Æ3';
  synthesisMethod?: string;
  confidenceScore?: number;
  createdAt: string | Date;
}

interface Session {
  id: string;
  sessionName?: string;
  totalExchanges: number;
  startedAt: string | Date;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TalkPage() {
  const [exchanges, setExchanges] = useState<DialogueExchange[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial session/exchanges
  useEffect(() => {
    loadActiveSessions();
  }, []);

  async function loadActiveSessions() {
    try {
      const response = await fetch('/api/dialogues?limit=1');
      const data = await response.json();

      if (data.success && data.sessions.length > 0) {
        const activeSession = data.sessions[0];
        setSession(activeSession);
        loadSessionExchanges(activeSession.id);
      }
    } catch (err) {
      console.error('[TalkPage] Failed to load sessions:', err);
    }
  }

  async function loadSessionExchanges(sessionId: string) {
    try {
      const response = await fetch(`/api/dialogues?sessionId=${sessionId}&limit=50`);
      const data = await response.json();

      if (data.success) {
        setExchanges(data.exchanges);
      }
    } catch (err) {
      console.error('[TalkPage] Failed to load exchanges:', err);
    }
  }

  async function handleSendMessage() {
    if (!inputValue.trim()) return;

    const userQuery = inputValue.trim();
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dialogues/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session?.id,
          userQuery,
          useOllama: false, // Template-based for Phase 4.7-A
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Update session if new
      if (data.session && !session) {
        setSession(data.session);
      }

      // Add exchanges to thread
      setExchanges((prev) => [
        ...prev,
        data.userExchange,
        data.maiaExchange,
      ]);
    } catch (err: any) {
      console.error('[TalkPage] Send error:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Talk Mode
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Have a reflective conversation with MAIA about your consciousness patterns
          </p>

          {session && (
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Session: {session.sessionName || session.id.slice(0, 8)}</span>
              <span>•</span>
              <span>{session.totalExchanges} exchanges</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Dialogue Thread */}
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-4 min-h-[400px] max-h-[600px] overflow-y-auto">
          <TalkThread exchanges={exchanges} autoScroll={true} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          {error && (
            <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask MAIA about your reflections... (Press Enter to send, Shift+Enter for new line)"
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white disabled:opacity-50"
            rows={3}
          />

          <div className="flex justify-between items-center mt-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              💬 Text-only mode • 🧠 Template synthesis
            </div>

            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 How Talk Mode Works
          </h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>• Ask MAIA about changes in your consciousness cycles</li>
            <li>• Explore why certain facets activated or quieted</li>
            <li>• Receive guidance based on your developmental patterns</li>
            <li>• All dialogue is stored locally and linked to your reflections</li>
          </ul>

          <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded border border-blue-200 dark:border-blue-700">
            <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Example Queries:
            </p>
            <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
              <div>→ "What changed since my last Fire cycle?"</div>
              <div>→ "Why did my coherence increase?"</div>
              <div>→ "What should I focus on next?"</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
