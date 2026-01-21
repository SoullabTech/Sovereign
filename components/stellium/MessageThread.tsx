"use client";

/**
 * MESSAGE THREAD
 *
 * Conversation view for a specific client.
 * Shows all messages and allows practitioner to reply.
 * Includes safety concern acknowledgment with review notes.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  MessageSquare,
  AlertTriangle,
  Clock,
  Send,
  ChevronLeft,
  User,
  Check,
  CheckCheck,
  Loader2,
  Shield,
  Eye,
} from 'lucide-react';
import type {
  ClientMessageWithSafety,
  MessagePolicy,
  QuickResponseType,
} from '@/lib/practitioner/messages';
import {
  getUrgencyConfig,
  getMessageTypeConfig,
  QUICK_RESPONSES,
  formatCheckDays,
} from '@/lib/practitioner/messages';
import type { PractitionerClient } from '@/lib/stellium/types';

interface MessageThreadProps {
  client: PractitionerClient;
  messages: ClientMessageWithSafety[];
  policy: MessagePolicy;
  unreadCount: number;
  onBack: () => void;
  onSendReply: (body: string, replyToId?: string) => Promise<void>;
  onSendQuickResponse: (type: QuickResponseType, replyToId?: string) => Promise<void>;
  onSafetyAcknowledged?: (messageId: string) => void;
  isSending?: boolean;
}

/**
 * SAFETY ACKNOWLEDGMENT BUTTON
 *
 * Allows practitioners to acknowledge safety concerns with an optional private note.
 * Calls POST /api/practitioner/safety/[logId] to mark as reviewed.
 */
interface SafetyAckButtonProps {
  safetyLogId: string;
  isAcknowledged: boolean;
  acknowledgedAt?: string | null;
  onAcknowledged: () => void;
}

function SafetyAckButton({
  safetyLogId,
  isAcknowledged,
  acknowledgedAt,
  onAcknowledged,
}: SafetyAckButtonProps) {
  const [isAcking, setIsAcking] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAcknowledge = async () => {
    if (isAcking) return;
    setIsAcking(true);
    setError(null);

    try {
      const res = await fetch(`/api/practitioner/safety/${safetyLogId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNote: reviewNote.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to acknowledge');
      }

      onAcknowledged();
      setShowNoteInput(false);
      setReviewNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge');
    } finally {
      setIsAcking(false);
    }
  };

  if (isAcknowledged) {
    return (
      <Badge className="bg-green-500/20 text-green-400 text-xs">
        <Check className="w-3 h-3 mr-1" />
        Reviewed {acknowledgedAt && `· ${new Date(acknowledgedAt).toLocaleDateString()}`}
      </Badge>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNoteInput(!showNoteInput)}
          className="h-auto py-1 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <Eye className="w-3 h-3 mr-1" />
          I've seen this
        </Button>
      </div>

      {showNoteInput && (
        <div className="flex flex-col gap-2 p-2 bg-gray-800/50 rounded-lg">
          <Input
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="Private note (optional, de-identified)"
            className="text-xs bg-gray-900/50 border-gray-700/50 text-gray-200"
            maxLength={2000}
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleAcknowledge}
              disabled={isAcking}
              className="text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
            >
              {isAcking ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <Shield className="w-3 h-3 mr-1" />
              )}
              Acknowledge
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowNoteInput(false);
                setReviewNote('');
              }}
              className="text-xs text-gray-400 hover:text-gray-200"
            >
              Cancel
            </Button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default function MessageThread({
  client,
  messages,
  policy,
  unreadCount,
  onBack,
  onSendReply,
  onSendQuickResponse,
  onSafetyAcknowledged,
  isSending = false,
}: MessageThreadProps) {
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const displayName = client.preferred_name || client.name;
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendReply = async () => {
    if (!replyText.trim() || isSending) return;
    await onSendReply(replyText.trim(), replyingTo || undefined);
    setReplyText('');
    setReplyingTo(null);
  };

  const handleQuickResponse = async (type: QuickResponseType) => {
    if (isSending) return;
    await onSendQuickResponse(type, replyingTo || undefined);
    setReplyingTo(null);
  };

  const handleSafetyAcknowledged = (messageId: string, safetyLogId: string) => {
    setAcknowledgedIds(prev => new Set([...prev, safetyLogId]));
    onSafetyAcknowledged?.(messageId);
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Check if a safety concern is acknowledged (from server or local state)
  const isAcknowledged = (msg: ClientMessageWithSafety) => {
    if (!msg.safety_log_id) return false;
    return !!msg.safety_log_acknowledged_at || acknowledgedIds.has(msg.safety_log_id);
  };

  // Find unreviewed safety concerns
  const unreviewedSafety = messages.filter(
    m => m.urgency === 'safety_concern' && m.safety_log_id && !isAcknowledged(m)
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Card className="bg-gray-900/50 border-gray-700/50 rounded-b-none">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-400 hover:text-gray-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sacred-gold/20 to-amber-600/20 flex items-center justify-center border border-sacred-gold/20">
                <span className="text-sm font-medium text-sacred-gold">{initials}</span>
              </div>
              <div>
                <h2 className="font-medium text-gray-100">{displayName}</h2>
                <p className="text-xs text-gray-500">
                  {messages.length} messages
                  {unreadCount > 0 && ` · ${unreadCount} unread`}
                </p>
              </div>
            </div>

            {/* Policy info */}
            <div className="text-right text-xs text-gray-500">
              <p>You check: {formatCheckDays(policy.check_days)}</p>
              <p>Response: {policy.max_response_hours}h</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Safety Alert Banner */}
      {unreviewedSafety.length > 0 && (
        <div className="bg-red-500/10 border-x border-red-500/30 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-300">
              {unreviewedSafety.length} safety concern{unreviewedSafety.length > 1 ? 's' : ''} need review
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-950/50 border-x border-gray-700/50 p-4 space-y-4">
        {messages.slice().reverse().map(message => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.direction === 'practitioner_to_client'}
            isAcknowledged={isAcknowledged(message)}
            onReply={() => setReplyingTo(message.id)}
            onSafetyAcknowledged={() => {
              if (message.safety_log_id) {
                handleSafetyAcknowledged(message.id, message.safety_log_id);
              }
            }}
            formatTime={formatTime}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Area */}
      <Card className="bg-gray-900/50 border-gray-700/50 rounded-t-none">
        <CardContent className="p-4 space-y-3">
          {/* Replying To Indicator */}
          {replyingTo && (
            <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg text-sm">
              <span className="text-gray-500">Replying to message</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
                className="text-gray-400 hover:text-gray-200 h-auto py-0 px-1"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Quick Responses */}
          <div className="flex flex-wrap gap-2">
            {(Object.entries(QUICK_RESPONSES) as [QuickResponseType, { label: string; body: string }][]).map(
              ([type, { label }]) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickResponse(type)}
                  disabled={isSending}
                  className="text-xs bg-gray-800/50 border-gray-700/50 text-gray-300 hover:text-gray-100 hover:border-sacred-gold/30"
                >
                  {label}
                </Button>
              )
            )}
          </div>

          {/* Custom Reply */}
          <div className="flex gap-2">
            <Textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="bg-gray-800/50 border-gray-700/50 text-gray-200 min-h-[80px] resize-none"
              disabled={isSending}
            />
            <Button
              onClick={handleSendReply}
              disabled={!replyText.trim() || isSending}
              className="bg-sacred-gold/20 text-sacred-gold hover:bg-sacred-gold/30 border border-sacred-gold/30 self-end"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MessageBubbleProps {
  message: ClientMessageWithSafety;
  isOwn: boolean;
  isAcknowledged: boolean;
  onReply: () => void;
  onSafetyAcknowledged: () => void;
  formatTime: (date: string) => string;
}

function MessageBubble({
  message,
  isOwn,
  isAcknowledged,
  onReply,
  onSafetyAcknowledged,
  formatTime,
}: MessageBubbleProps) {
  const urgencyConfig = getUrgencyConfig(message.urgency);
  const typeConfig = message.message_type
    ? getMessageTypeConfig(message.message_type)
    : null;

  const isSafetyConcern = message.urgency === 'safety_concern';
  const hasSafetyLog = !!message.safety_log_id;
  const needsReview = isSafetyConcern && hasSafetyLog && !isAcknowledged;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isOwn
            ? 'bg-sacred-gold/10 border border-sacred-gold/20'
            : isSafetyConcern
            ? 'bg-red-500/10 border border-red-500/30'
            : 'bg-gray-800/50 border border-gray-700/50'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          {!isOwn && typeConfig && (
            <Badge variant="outline" className={`${typeConfig.color} border-gray-600 text-xs`}>
              {typeConfig.label}
            </Badge>
          )}
          {!isOwn && message.urgency !== 'not_urgent' && (
            <Badge className={`${urgencyConfig.bgColor} ${urgencyConfig.color} text-xs`}>
              {urgencyConfig.label}
            </Badge>
          )}
          {isOwn && message.is_quick_response && (
            <Badge variant="outline" className="text-xs border-sacred-gold/30 text-sacred-gold/70">
              Quick Response
            </Badge>
          )}
        </div>

        {/* Body */}
        <p className="text-sm text-gray-200 whitespace-pre-wrap">{message.body}</p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700/30">
          <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>

          <div className="flex items-center gap-2">
            {/* Read status for own messages */}
            {isOwn && (
              message.status === 'read' ? (
                <CheckCheck className="w-3.5 h-3.5 text-sacred-gold" />
              ) : (
                <Check className="w-3.5 h-3.5 text-gray-500" />
              )
            )}

            {/* Reply button for client messages */}
            {!isOwn && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReply}
                className="h-auto py-1 px-2 text-xs text-gray-400 hover:text-gray-200"
              >
                Reply
              </Button>
            )}
          </div>
        </div>

        {/* Safety acknowledgment - separate row for better UX */}
        {isSafetyConcern && hasSafetyLog && (
          <div className="mt-2 pt-2 border-t border-gray-700/30">
            <SafetyAckButton
              safetyLogId={message.safety_log_id!}
              isAcknowledged={isAcknowledged}
              acknowledgedAt={message.safety_log_acknowledged_at}
              onAcknowledged={onSafetyAcknowledged}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
