"use client";

/**
 * COMMS SPINE: Thread Page
 *
 * View and interact with a specific conversation thread.
 *
 * Route: /stellium/comms/[threadId]
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ThreadView,
  type ThreadMessage,
  type ThreadContext,
  type QuickResponseType,
} from '@/components/comms';

interface ThreadResponse {
  thread: ThreadContext;
  messages: ThreadMessage[];
  unread_count: number;
}

export default function CommsThreadPage() {
  const router = useRouter();
  const params = useParams();
  const threadId = params?.threadId as string;

  const [threadData, setThreadData] = useState<ThreadResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch thread
  const fetchThread = useCallback(async () => {
    if (!threadId) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/comms/threads/${threadId}?mark_read=true`);
      if (res.ok) {
        const data = await res.json();
        setThreadData(data);
      } else if (res.status === 404) {
        setError('Thread not found');
      } else {
        setError('Failed to load thread');
      }
    } catch (err) {
      console.error('[Comms Thread] Fetch error:', err);
      setError('Failed to load thread');
    } finally {
      setIsLoading(false);
    }
  }, [threadId]);

  // Initial fetch
  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  // Handle back navigation
  const handleBack = () => {
    router.push('/stellium/comms');
  };

  // Handle send message (Phase 4: accepts optional suggestionId for sent tracking)
  const handleSendMessage = async (body: string, suggestionId?: string) => {
    try {
      const res = await fetch(`/api/comms/threads/${threadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body,
          ...(suggestionId ? { suggestion_id: suggestionId } : {}),
        }),
      });

      if (res.ok) {
        // Refresh thread to show new message
        await fetchThread();
      } else {
        const data = await res.json();
        console.error('[Comms Thread] Send failed:', data.error);
      }
    } catch (err) {
      console.error('[Comms Thread] Send error:', err);
    }
  };

  // Handle quick response
  const handleQuickResponse = async (type: QuickResponseType) => {
    try {
      const res = await fetch(`/api/comms/threads/${threadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quick_response_type: type,
          is_quick_response: true,
        }),
      });

      if (res.ok) {
        await fetchThread();
      } else {
        const data = await res.json();
        console.error('[Comms Thread] Quick response failed:', data.error);
      }
    } catch (err) {
      console.error('[Comms Thread] Quick response error:', err);
    }
  };

  // Handle acknowledge safety flag
  const handleAcknowledgeSafetyFlag = async (flagId: string, reviewNote?: string) => {
    try {
      const res = await fetch(`/api/comms/safety/${flagId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_note: reviewNote }),
      });

      if (res.ok) {
        await fetchThread();
      } else {
        const data = await res.json();
        console.error('[Comms Thread] Acknowledge failed:', data.error);
      }
    } catch (err) {
      console.error('[Comms Thread] Acknowledge error:', err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
        >
          Back to Inbox
        </button>
      </div>
    );
  }

  // No data
  if (!threadData) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <p className="text-gray-400 mb-4">Thread not found</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors"
        >
          Back to Inbox
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <ThreadView
        context={threadData.thread}
        messages={threadData.messages}
        onBack={handleBack}
        onSendMessage={handleSendMessage}
        onQuickResponse={handleQuickResponse}
        onAcknowledgeSafetyFlag={handleAcknowledgeSafetyFlag}
        isLoading={isLoading}
      />
    </div>
  );
}
