"use client";

/**
 * MESSAGE DIGEST CARD
 *
 * Summary of messages since last session.
 * Used in session prep view.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  AlertTriangle,
  Clock,
  ChevronRight,
  Lightbulb,
  HelpCircle,
  Star,
  Heart,
  Calendar,
} from 'lucide-react';
import type { MessageDigest, MessageType, MessageUrgency } from '@/lib/practitioner/messages';

interface MessageDigestCardProps {
  digest: MessageDigest;
  onViewAll: () => void;
  variant?: 'full' | 'compact';
}

const TYPE_ICONS: Record<MessageType, React.ReactNode> = {
  reflection: <Lightbulb className="w-3.5 h-3.5" />,
  question: <HelpCircle className="w-3.5 h-3.5" />,
  win: <Star className="w-3.5 h-3.5" />,
  struggle: <Heart className="w-3.5 h-3.5" />,
  logistics: <Calendar className="w-3.5 h-3.5" />,
  reply: <MessageSquare className="w-3.5 h-3.5" />,
};

export default function MessageDigestCard({
  digest,
  onViewAll,
  variant = 'full',
}: MessageDigestCardProps) {
  const { client_name, messages_since_last_session, has_safety_concerns, has_time_sensitive, messages } = digest;

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Compact variant for dashboard
  if (variant === 'compact') {
    if (messages_since_last_session === 0) {
      return null;
    }

    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="cursor-pointer"
        onClick={onViewAll}
      >
        <div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
          has_safety_concerns
            ? 'bg-red-500/5 border-red-500/30 hover:bg-red-500/10'
            : has_time_sensitive
            ? 'bg-amber-500/5 border-amber-500/30 hover:bg-amber-500/10'
            : 'bg-gray-800/30 border-gray-700/30 hover:border-sacred-gold/30'
        }`}>
          <div className={`p-2 rounded-full ${
            has_safety_concerns
              ? 'bg-red-500/20'
              : has_time_sensitive
              ? 'bg-amber-500/20'
              : 'bg-sacred-gold/20'
          }`}>
            <MessageSquare className={`w-4 h-4 ${
              has_safety_concerns
                ? 'text-red-400'
                : has_time_sensitive
                ? 'text-amber-400'
                : 'text-sacred-gold'
            }`} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200">
              {messages_since_last_session} message{messages_since_last_session > 1 ? 's' : ''} since last session
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {has_safety_concerns && (
                <Badge className="bg-red-500/20 text-red-400 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Safety
                </Badge>
              )}
              {has_time_sensitive && !has_safety_concerns && (
                <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Time-sensitive
                </Badge>
              )}
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-gray-500" />
        </div>
      </motion.div>
    );
  }

  // Full variant
  return (
    <Card className={`bg-gray-900/50 border ${
      has_safety_concerns
        ? 'border-red-500/30'
        : has_time_sensitive
        ? 'border-amber-500/30'
        : 'border-gray-700/50'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-100 text-base">
            <MessageSquare className={`w-4 h-4 ${
              has_safety_concerns
                ? 'text-red-400'
                : has_time_sensitive
                ? 'text-amber-400'
                : 'text-sacred-gold'
            }`} />
            Between-Session Messages
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-gray-400 hover:text-gray-200"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-400">
            {messages_since_last_session} message{messages_since_last_session > 1 ? 's' : ''} from {client_name}
          </span>
          {has_safety_concerns && (
            <Badge className="bg-red-500/20 text-red-400 text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Safety Concern
            </Badge>
          )}
          {has_time_sensitive && !has_safety_concerns && (
            <Badge className="bg-amber-500/20 text-amber-400 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Time-sensitive
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            No messages since last session
          </p>
        ) : (
          messages.slice(0, 3).map((msg, idx) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.urgency === 'safety_concern'
                  ? 'bg-red-500/5 border border-red-500/30'
                  : msg.urgency === 'time_sensitive'
                  ? 'bg-amber-500/5 border border-amber-500/30'
                  : 'bg-gray-800/30 border border-gray-700/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.message_type && (
                  <span className={`flex items-center gap-1 text-xs ${
                    msg.message_type === 'win' ? 'text-green-400' :
                    msg.message_type === 'struggle' ? 'text-orange-400' :
                    msg.message_type === 'question' ? 'text-blue-400' :
                    'text-gray-400'
                  }`}>
                    {TYPE_ICONS[msg.message_type]}
                    {msg.message_type.charAt(0).toUpperCase() + msg.message_type.slice(1)}
                  </span>
                )}
                <span className="text-xs text-gray-500">{formatDate(msg.created_at)}</span>
              </div>
              <p className="text-sm text-gray-300 line-clamp-2">{msg.body}</p>
            </div>
          ))
        )}

        {messages.length > 3 && (
          <button
            onClick={onViewAll}
            className="w-full py-2 text-sm text-sacred-gold hover:text-sacred-gold/80 transition-colors"
          >
            +{messages.length - 3} more message{messages.length - 3 > 1 ? 's' : ''}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
