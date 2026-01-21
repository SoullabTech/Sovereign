"use client";

/**
 * STELLIUM MESSAGES PAGE
 *
 * Between-session messaging hub for practitioners.
 * View inbox, read/reply to client messages, manage policy.
 */

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MessageInbox from '@/components/stellium/MessageInbox';
import MessageThread from '@/components/stellium/MessageThread';
import MessagePolicyForm from '@/components/stellium/MessagePolicyForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, MessageSquare, ChevronLeft } from 'lucide-react';
import type {
  MessageInboxItem,
  ClientMessage,
  MessagePolicy,
  CreateMessagePolicyInput,
  QuickResponseType,
} from '@/lib/practitioner/messages';
import type { PractitionerClient } from '@/lib/stellium/types';

interface InboxData {
  inbox: MessageInboxItem[];
  summary: {
    total_unread: number;
    total_safety_concerns: number;
    clients_with_unread: number;
  };
  safety_concerns: Array<{
    id: string;
    client_id: string;
    client_name: string;
    body_preview: string;
    created_at: string;
  }>;
}

interface ThreadData {
  thread: {
    client: PractitionerClient;
    policy: MessagePolicy;
    unread_count: number;
  };
  messages: ClientMessage[];
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientIdParam = searchParams.get('client');

  const [activeTab, setActiveTab] = useState<'inbox' | 'settings'>(
    clientIdParam ? 'inbox' : 'inbox'
  );
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clientIdParam);

  // Inbox state
  const [inboxData, setInboxData] = useState<InboxData | null>(null);
  const [isLoadingInbox, setIsLoadingInbox] = useState(true);

  // Thread state
  const [threadData, setThreadData] = useState<ThreadData | null>(null);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Policy state
  const [policy, setPolicy] = useState<MessagePolicy | null>(null);
  const [isLoadingPolicy, setIsLoadingPolicy] = useState(true);

  // Fetch inbox
  const fetchInbox = useCallback(async () => {
    setIsLoadingInbox(true);
    try {
      const res = await fetch('/api/practitioner/messages?include_read=true');
      if (res.ok) {
        const data = await res.json();
        setInboxData(data);
      }
    } catch (error) {
      console.error('Failed to fetch inbox:', error);
    } finally {
      setIsLoadingInbox(false);
    }
  }, []);

  // Fetch thread for selected client
  const fetchThread = useCallback(async (clientId: string) => {
    setIsLoadingThread(true);
    try {
      const res = await fetch(`/api/practitioner/clients/${clientId}/messages?mark_read=true`);
      if (res.ok) {
        const data = await res.json();
        setThreadData(data);
        // Refresh inbox to update counts
        fetchInbox();
      }
    } catch (error) {
      console.error('Failed to fetch thread:', error);
    } finally {
      setIsLoadingThread(false);
    }
  }, [fetchInbox]);

  // Fetch policy
  const fetchPolicy = useCallback(async () => {
    setIsLoadingPolicy(true);
    try {
      const res = await fetch('/api/practitioner/policies');
      if (res.ok) {
        const data = await res.json();
        setPolicy(data.policy);
      }
    } catch (error) {
      console.error('Failed to fetch policy:', error);
    } finally {
      setIsLoadingPolicy(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchInbox();
    fetchPolicy();
  }, [fetchInbox, fetchPolicy]);

  // Fetch thread when client selected
  useEffect(() => {
    if (selectedClientId) {
      fetchThread(selectedClientId);
    } else {
      setThreadData(null);
    }
  }, [selectedClientId, fetchThread]);

  // Update URL when client selection changes
  useEffect(() => {
    if (selectedClientId) {
      router.replace(`/stellium/messages?client=${selectedClientId}`, { scroll: false });
    } else if (clientIdParam) {
      router.replace('/stellium/messages', { scroll: false });
    }
  }, [selectedClientId, clientIdParam, router]);

  // Handle client selection
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  // Handle back to inbox
  const handleBackToInbox = () => {
    setSelectedClientId(null);
    setThreadData(null);
  };

  // Handle send reply
  const handleSendReply = async (body: string, replyToId?: string) => {
    if (!selectedClientId || isSending) return;
    setIsSending(true);
    try {
      const res = await fetch(`/api/practitioner/clients/${selectedClientId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, reply_to_id: replyToId }),
      });
      if (res.ok) {
        await fetchThread(selectedClientId);
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle quick response
  const handleQuickResponse = async (type: QuickResponseType, replyToId?: string) => {
    if (!selectedClientId || !replyToId || isSending) return;
    setIsSending(true);
    try {
      const res = await fetch(`/api/practitioner/messages/${replyToId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quick_response: type }),
      });
      if (res.ok) {
        await fetchThread(selectedClientId);
      }
    } catch (error) {
      console.error('Failed to send quick response:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle review safety
  const handleReviewSafety = async (messageId: string) => {
    try {
      const res = await fetch(`/api/practitioner/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_safety: true }),
      });
      if (res.ok && selectedClientId) {
        await fetchThread(selectedClientId);
        await fetchInbox();
      }
    } catch (error) {
      console.error('Failed to review safety concern:', error);
    }
  };

  // Handle save policy
  const handleSavePolicy = async (input: CreateMessagePolicyInput) => {
    const res = await fetch('/api/practitioner/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to save policy');
    }
    const data = await res.json();
    setPolicy(data.policy);
  };

  // Show thread view if client selected
  if (selectedClientId && threadData) {
    return (
      <div className="h-[calc(100vh-8rem)]">
        <MessageThread
          client={threadData.thread.client}
          messages={threadData.messages}
          policy={threadData.thread.policy}
          unreadCount={threadData.thread.unread_count}
          onBack={handleBackToInbox}
          onSendReply={handleSendReply}
          onSendQuickResponse={handleQuickResponse}
          onReviewSafety={handleReviewSafety}
          isSending={isSending}
        />
      </div>
    );
  }

  // Loading thread
  if (selectedClientId && isLoadingThread) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'inbox' | 'settings')}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-100 flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-sacred-gold" />
            Messages
          </h1>
          <TabsList className="bg-gray-800/50">
            <TabsTrigger value="inbox" className="data-[state=active]:bg-sacred-gold/20">
              <MessageSquare className="w-4 h-4 mr-2" />
              Inbox
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-sacred-gold/20">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="inbox" className="mt-6">
          {isLoadingInbox ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
            </div>
          ) : inboxData ? (
            <MessageInbox
              inbox={inboxData.inbox}
              totalUnread={inboxData.summary.total_unread}
              totalSafetyConcerns={inboxData.summary.total_safety_concerns}
              onSelectClient={handleSelectClient}
              onRefresh={fetchInbox}
              isLoading={isLoadingInbox}
              safetyConcerns={inboxData.safety_concerns}
            />
          ) : (
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No messages yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  When clients send you between-session notes, they'll appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          {isLoadingPolicy ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
            </div>
          ) : (
            <div className="max-w-2xl">
              <MessagePolicyForm
                initialPolicy={policy}
                onSave={handleSavePolicy}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MessagesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1117] to-[#161B22] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesContent />
    </Suspense>
  );
}
