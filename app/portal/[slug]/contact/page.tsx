"use client";

/**
 * CONTACT PAGE - BETWEEN-SESSION MESSAGING
 *
 * Client-facing page for sending between-session notes to their practitioner.
 * Requires token-based authentication via URL parameter.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Sparkles,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Plus,
  Heart,
} from 'lucide-react';
import {
  BetweenSessionNoteComposer,
  NoteConfirmation,
  ClientMessageHistory,
  SlidingScaleRequestForm,
} from '@/components/portal';
import type { MessagePolicy, MessageType, MessageUrgency } from '@/lib/portal/messages';

interface ClientMessageView {
  id: string;
  direction: 'client_to_practitioner' | 'practitioner_to_client';
  message_type: MessageType | null;
  urgency: MessageUrgency;
  body: string;
  created_at: string;
  read_at: string | null;
  is_from_me: boolean;
}

interface MessagingContext {
  policy: MessagePolicy;
  policy_summary: string;
  crisis_copy: string;
  messaging_enabled: boolean;
  messages: ClientMessageView[];
  practitioner_name: string;
}

type ViewMode = 'compose' | 'confirmation' | 'history';

// Cosmic Starlight Muse palette (matching portal theme)
const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  cardBg: 'rgba(45, 38, 64, 0.6)',
  gold: '#E5C158',
  violet: '#B8A5D9',
  rose: '#E8B4CB',
  starlight: '#FFFFFF',
  muted: '#D0C5E8',
  dim: '#A99DC4',
  border: '#4A3D5C',
  borderGold: 'rgba(229, 193, 88, 0.5)',
  success: '#8FB89A',
  error: '#D48B8B',
  warning: '#E5C158',
  danger: '#D48B8B',
};

export default function ContactPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<MessagingContext | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('compose');
  const [isSending, setIsSending] = useState(false);
  const [lastSentUrgency, setLastSentUrgency] = useState<MessageUrgency>('not_urgent');
  const [slidingScaleAvailable, setSlidingScaleAvailable] = useState(false);

  // Fetch messaging context
  const fetchContext = useCallback(async () => {
    if (!token) {
      setError('No access token provided');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/portal/${slug}/messages?token=${encodeURIComponent(token)}`);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to load messaging');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setContext(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch messaging context:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [slug, token]);

  // Fetch sliding scale availability
  const fetchSlidingScale = useCallback(async () => {
    try {
      const response = await fetch(`/api/portal/${slug}/sliding-scale`);
      if (response.ok) {
        const data = await response.json();
        setSlidingScaleAvailable(data.available === true);
      }
    } catch {
      // Silently fail - sliding scale is optional
    }
  }, [slug]);

  useEffect(() => {
    fetchContext();
    fetchSlidingScale();
  }, [fetchContext, fetchSlidingScale]);

  // Handle sending a note
  const handleSendNote = async (data: {
    message_type: MessageType | null;
    urgency: MessageUrgency;
    body: string;
  }) => {
    if (!token || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/portal/${slug}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      // Success - show confirmation
      setLastSentUrgency(data.urgency);
      setViewMode('confirmation');

      // Refresh context to get updated messages
      await fetchContext();
    } catch (err) {
      console.error('Failed to send note:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-8 h-8" style={{ color: colors.gold }} />
        </motion.div>
      </div>
    );
  }

  // Error state - no token or invalid
  if (error || !context) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div
          className="rounded-2xl p-8 backdrop-blur-xl"
          style={{
            background: `linear-gradient(135deg, ${colors.cardBg}, rgba(157, 142, 199, 0.15))`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <AlertTriangle
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: colors.warning }}
          />
          <h2
            className="font-display text-2xl mb-4"
            style={{ color: colors.starlight }}
          >
            {error === 'No access token provided'
              ? 'Access Required'
              : 'Unable to Load'}
          </h2>
          <p className="mb-6" style={{ color: colors.muted }}>
            {error === 'No access token provided'
              ? "To send a between-session note, please use the link from your confirmation email."
              : error || 'Something went wrong. Please try again later.'}
          </p>
          <Link
            href={`/portal/${slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors"
            style={{
              backgroundColor: colors.stardust,
              color: colors.muted,
              border: `1px solid ${colors.border}`,
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Messaging disabled
  if (!context.messaging_enabled) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div
          className="rounded-2xl p-8 backdrop-blur-xl"
          style={{
            background: `linear-gradient(135deg, ${colors.cardBg}, rgba(157, 142, 199, 0.15))`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <MessageSquare
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: colors.dim }}
          />
          <h2
            className="font-display text-2xl mb-4"
            style={{ color: colors.starlight }}
          >
            Messaging Not Available
          </h2>
          <p className="mb-6" style={{ color: colors.muted }}>
            {context.practitioner_name} hasn't enabled between-session messaging at this time.
          </p>
          <Link
            href={`/portal/${slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors"
            style={{
              backgroundColor: colors.stardust,
              color: colors.muted,
              border: `1px solid ${colors.border}`,
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
            <MessageSquare className="w-5 h-5" style={{ color: colors.gold }} />
            <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
          </div>

          <h1
            className="font-display text-3xl md:text-4xl font-light mb-3 tracking-wide"
            style={{ color: colors.starlight }}
          >
            {viewMode === 'history' ? 'Your Messages' : 'Between-Session Note'}
          </h1>
          <p style={{ color: colors.muted }}>
            {viewMode === 'history'
              ? `Your conversation with ${context.practitioner_name}`
              : `Send a note to ${context.practitioner_name}`}
          </p>
        </motion.div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setViewMode('compose')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: viewMode === 'compose' ? `${colors.gold}20` : 'transparent',
            color: viewMode === 'compose' ? colors.gold : colors.muted,
            border: `1px solid ${viewMode === 'compose' ? colors.gold : colors.border}`,
          }}
        >
          <Plus className="w-4 h-4 inline-block mr-1" />
          New Note
        </button>
        <button
          onClick={() => setViewMode('history')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: viewMode === 'history' ? `${colors.gold}20` : 'transparent',
            color: viewMode === 'history' ? colors.gold : colors.muted,
            border: `1px solid ${viewMode === 'history' ? colors.gold : colors.border}`,
          }}
        >
          <MessageSquare className="w-4 h-4 inline-block mr-1" />
          History ({context.messages.length})
        </button>
      </div>

      {/* Main Content */}
      <div
        className="rounded-2xl p-6 md:p-8 backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, ${colors.cardBg}, rgba(157, 142, 199, 0.15))`,
          border: `1px solid ${colors.border}`,
        }}
      >
        {viewMode === 'compose' && (
          <BetweenSessionNoteComposer
            policy={context.policy}
            policySummary={context.policy_summary}
            onSend={handleSendNote}
            isSending={isSending}
          />
        )}

        {viewMode === 'confirmation' && (
          <NoteConfirmation
            policy={context.policy}
            urgency={lastSentUrgency}
            practitionerName={context.practitioner_name}
            onClose={() => setViewMode('compose')}
            onViewHistory={() => setViewMode('history')}
          />
        )}

        {viewMode === 'history' && (
          <>
            {/* Refresh button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={fetchContext}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors"
                style={{
                  backgroundColor: colors.stardust,
                  color: colors.muted,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>
            <ClientMessageHistory
              messages={context.messages}
              practitionerName={context.practitioner_name}
            />
          </>
        )}
      </div>

      {/* Sliding Scale Section */}
      {slidingScaleAvailable && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
            <Heart className="w-5 h-5" style={{ color: colors.rose }} />
            <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
          </div>

          <p
            className="text-center text-sm mb-6"
            style={{ color: colors.muted }}
          >
            If cost is a barrier, let's find what works.
          </p>

          <SlidingScaleRequestForm
            slug={slug}
            token={token || undefined}
          />
        </motion.div>
      )}

      {/* Back Link */}
      <div className="text-center">
        <Link
          href={`/portal/${slug}`}
          className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
          style={{ color: colors.muted }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {context.practitioner_name}'s Portal
        </Link>
      </div>
    </div>
  );
}
