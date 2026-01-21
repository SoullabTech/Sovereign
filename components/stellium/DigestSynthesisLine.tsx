"use client";

/**
 * DIGEST SYNTHESIS LINE
 *
 * A prominent one-liner summary of messages since last session.
 * Rule-based synthesis: no AI dependency.
 *
 * "Since last session: 3 messages — 1 reflection, 1 safety (reviewed), 1 unanswered"
 *
 * This helps practitioners arrive oriented, not flooded.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
} from 'lucide-react';
import type { MessageDigest, MessageDigestCounts } from '@/lib/practitioner/messages';

interface DigestSynthesisLineProps {
  digest: MessageDigest;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'prominent';
}

/**
 * Get the appropriate icon and color based on digest status
 */
function getDigestStatus(counts: MessageDigestCounts): {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  priority: 'safety' | 'action' | 'info';
} {
  // Safety concerns needing review take priority
  if (counts.safety.needs_review > 0) {
    return {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      priority: 'safety',
    };
  }

  // Unanswered messages need attention
  if (counts.unanswered > 0) {
    return {
      icon: <Clock className="w-4 h-4" />,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      priority: 'action',
    };
  }

  // All reviewed safety concerns
  if (counts.safety.total > 0 && counts.safety.needs_review === 0) {
    return {
      icon: <CheckCircle2 className="w-4 h-4" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      priority: 'info',
    };
  }

  // Default: informational
  return {
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'text-sacred-gold',
    bgColor: 'bg-sacred-gold/10',
    borderColor: 'border-sacred-gold/30',
    priority: 'info',
  };
}

export default function DigestSynthesisLine({
  digest,
  onClick,
  variant = 'default',
}: DigestSynthesisLineProps) {
  const { synthesis, counts, messages_since_last_session } = digest;

  // Don't render if no messages
  if (messages_since_last_session === 0) {
    return null;
  }

  const status = getDigestStatus(counts);

  // Compact variant - just icon + count
  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-2 px-2 py-1 rounded-full cursor-pointer transition-colors ${status.bgColor} ${status.borderColor} border hover:opacity-80`}
      >
        <span className={status.color}>{status.icon}</span>
        <span className={`text-xs ${status.color}`}>
          {messages_since_last_session}
        </span>
      </div>
    );
  }

  // Prominent variant - larger, more visible
  if (variant === 'prominent') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onClick}
        className={`p-4 rounded-lg cursor-pointer transition-all ${status.bgColor} ${status.borderColor} border hover:scale-[1.01]`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${status.bgColor}`}>
            <span className={status.color}>{status.icon}</span>
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${status.color}`}>
              {synthesis}
            </p>
            {status.priority === 'safety' && (
              <p className="text-xs text-red-400/70 mt-0.5 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {counts.safety.needs_review} safety concern{counts.safety.needs_review > 1 ? 's' : ''} need review
              </p>
            )}
            {status.priority === 'action' && (
              <p className="text-xs text-amber-400/70 mt-0.5">
                {counts.unanswered} message{counts.unanswered > 1 ? 's' : ''} awaiting response
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant - balanced
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${status.bgColor} ${status.borderColor} border hover:opacity-90`}
    >
      <span className={status.color}>{status.icon}</span>
      <p className={`text-sm ${status.color} flex-1`}>
        {synthesis}
      </p>
      {status.priority !== 'info' && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${status.bgColor} ${status.color}`}>
          {status.priority === 'safety' ? 'Review' : 'Reply'}
        </span>
      )}
    </motion.div>
  );
}
