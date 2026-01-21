"use client";

/**
 * CLIENT MESSAGE HISTORY
 *
 * Shows the client their sent notes and practitioner replies.
 * Displayed in the portal messages section.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Lightbulb,
  HelpCircle,
  Star,
  Heart,
  Calendar,
  AlertTriangle,
  Clock,
  Check,
  CheckCheck,
  User,
} from 'lucide-react';
import type { MessageType, MessageUrgency } from '@/lib/portal/messages';

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

interface ClientMessageHistoryProps {
  messages: ClientMessageView[];
  practitionerName: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const TYPE_ICONS: Record<MessageType, React.ReactNode> = {
  reflection: <Lightbulb className="w-3.5 h-3.5" />,
  question: <HelpCircle className="w-3.5 h-3.5" />,
  win: <Star className="w-3.5 h-3.5" />,
  struggle: <Heart className="w-3.5 h-3.5" />,
  logistics: <Calendar className="w-3.5 h-3.5" />,
  reply: <MessageSquare className="w-3.5 h-3.5" />,
};

const TYPE_LABELS: Record<MessageType, string> = {
  reflection: 'Reflection',
  question: 'Question',
  win: 'Win',
  struggle: 'Struggle',
  logistics: 'Logistics',
  reply: 'Reply',
};

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

export default function ClientMessageHistory({
  messages,
  practitionerName,
  onRefresh,
  isLoading = false,
}: ClientMessageHistoryProps) {
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return d.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      });
    }

    if (diffDays === 1) {
      return `Yesterday at ${d.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      })}`;
    }

    if (diffDays < 7) {
      return d.toLocaleDateString(undefined, {
        weekday: 'long',
        hour: 'numeric',
        minute: '2-digit',
      });
    }

    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <MessageSquare className="w-8 h-8" style={{ color: colors.gold }} />
        </motion.div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: colors.dim }} />
        <h3 className="font-medium mb-2" style={{ color: colors.muted }}>
          No messages yet
        </h3>
        <p className="text-sm" style={{ color: colors.dim }}>
          When you send a note, it will appear here
        </p>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { [key: string]: ClientMessageView[] } = {};
  messages.forEach(msg => {
    const dateKey = new Date(msg.created_at).toLocaleDateString();
    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = [];
    }
    groupedMessages[dateKey].push(msg);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groupedMessages).map(([dateKey, dayMessages]) => (
        <div key={dateKey} className="space-y-3">
          {/* Date Header */}
          <div className="flex items-center gap-3 py-2">
            <div className="h-px flex-1" style={{ backgroundColor: colors.border }} />
            <span className="text-xs font-medium" style={{ color: colors.dim }}>
              {new Date(dateKey).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: colors.border }} />
          </div>

          {/* Messages for this day */}
          {dayMessages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              practitionerName={practitionerName}
              formatDate={formatDate}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface MessageBubbleProps {
  message: ClientMessageView;
  practitionerName: string;
  formatDate: (date: string) => string;
}

function MessageBubble({ message, practitionerName, formatDate }: MessageBubbleProps) {
  const isFromMe = message.is_from_me;
  const isSafetyConcern = message.urgency === 'safety_concern';
  const isTimeSensitive = message.urgency === 'time_sensitive';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className="max-w-[85%] rounded-2xl p-4"
        style={{
          background: isFromMe
            ? `linear-gradient(135deg, ${colors.gold}15, ${colors.gold}08)`
            : `linear-gradient(135deg, ${colors.cardBg}, rgba(157, 142, 199, 0.15))`,
          border: `1px solid ${
            isFromMe
              ? `${colors.gold}40`
              : isSafetyConcern
              ? `${colors.danger}40`
              : colors.border
          }`,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          {/* Sender indicator */}
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: isFromMe ? `${colors.gold}20` : colors.stardust,
            }}
          >
            {isFromMe ? (
              <User className="w-3 h-3" style={{ color: colors.gold }} />
            ) : (
              <span className="text-xs font-medium" style={{ color: colors.violet }}>
                {practitionerName.charAt(0)}
              </span>
            )}
          </div>

          <span className="text-xs font-medium" style={{ color: colors.muted }}>
            {isFromMe ? 'You' : practitionerName}
          </span>

          {/* Message type badge */}
          {isFromMe && message.message_type && (
            <span
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: colors.stardust,
                color: colors.dim,
              }}
            >
              {TYPE_ICONS[message.message_type]}
              {TYPE_LABELS[message.message_type]}
            </span>
          )}

          {/* Urgency badges */}
          {isSafetyConcern && (
            <span
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${colors.danger}20`,
                color: colors.danger,
              }}
            >
              <AlertTriangle className="w-3 h-3" />
              Safety
            </span>
          )}
          {isTimeSensitive && !isSafetyConcern && (
            <span
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${colors.warning}20`,
                color: colors.warning,
              }}
            >
              <Clock className="w-3 h-3" />
              Time-sensitive
            </span>
          )}
        </div>

        {/* Body */}
        <p
          className="text-sm whitespace-pre-wrap"
          style={{ color: colors.starlight }}
        >
          {message.body}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor: `${colors.border}50` }}>
          <span className="text-xs" style={{ color: colors.dim }}>
            {formatDate(message.created_at)}
          </span>

          {/* Read status for messages I sent */}
          {isFromMe && (
            <div className="flex items-center gap-1">
              {message.read_at ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5" style={{ color: colors.gold }} />
                  <span className="text-xs" style={{ color: colors.dim }}>Read</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" style={{ color: colors.dim }} />
                  <span className="text-xs" style={{ color: colors.dim }}>Delivered</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
