"use client";

/**
 * NOTE CONFIRMATION
 *
 * Displayed after client sends a between-session note.
 * Shows "what happens now" and crisis resources.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Calendar,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import type { MessagePolicy, MessageUrgency } from '@/lib/portal/messages';
import { getWhatHappensNow, getConfirmationMessage } from '@/lib/portal/messages';

interface NoteConfirmationProps {
  policy: MessagePolicy;
  urgency: MessageUrgency;
  practitionerName: string;
  onClose: () => void;
  onViewHistory: () => void;
}

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

export default function NoteConfirmation({
  policy,
  urgency,
  practitionerName,
  onClose,
  onViewHistory,
}: NoteConfirmationProps) {
  const whatHappensNow = getWhatHappensNow(policy);
  const isSafetyConcern = urgency === 'safety_concern';
  const isTimeSensitive = urgency === 'time_sensitive';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Success Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            backgroundColor: isSafetyConcern
              ? `${colors.danger}20`
              : `${colors.success}20`,
          }}
        >
          {isSafetyConcern ? (
            <AlertTriangle
              className="w-10 h-10"
              style={{ color: colors.danger }}
            />
          ) : (
            <CheckCircle2
              className="w-10 h-10"
              style={{ color: colors.success }}
            />
          )}
        </motion.div>
        <h2
          className="font-display text-2xl font-light mb-2"
          style={{ color: colors.starlight }}
        >
          {isSafetyConcern ? 'Note Sent – Safety Flagged' : 'Note Sent'}
        </h2>
        <p style={{ color: colors.muted }}>
          Your message has been delivered to {practitionerName}
        </p>
      </div>

      {/* Safety Concern Alert */}
      {isSafetyConcern && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-4"
          style={{
            backgroundColor: `${colors.danger}15`,
            border: `1px solid ${colors.danger}50`,
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: colors.danger }}
            />
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: colors.danger }}>
                Your practitioner has been notified
              </p>
              <p className="text-sm" style={{ color: colors.muted }}>
                {policy.crisis_copy}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Time Sensitive Note */}
      {isTimeSensitive && !isSafetyConcern && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-4"
          style={{
            backgroundColor: `${colors.warning}15`,
            border: `1px solid ${colors.warning}50`,
          }}
        >
          <div className="flex items-start gap-3">
            <Clock
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: colors.warning }}
            />
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: colors.warning }}>
                Marked as time-sensitive
              </p>
              <p className="text-sm" style={{ color: colors.muted }}>
                Your practitioner will see this flag and respond when they check messages.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* What Happens Now */}
      <div
        className="rounded-xl p-6 backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, ${colors.cardBg}, rgba(157, 142, 199, 0.15))`,
          border: `1px solid ${colors.border}`,
        }}
      >
        <h3
          className="font-medium mb-4 flex items-center gap-2"
          style={{ color: colors.starlight }}
        >
          <MessageSquare className="w-4 h-4" style={{ color: colors.gold }} />
          {whatHappensNow.title}
        </h3>
        <ul className="space-y-3">
          {whatHappensNow.items.map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-start gap-3"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                style={{
                  backgroundColor: `${colors.gold}20`,
                  color: colors.gold,
                }}
              >
                {index + 1}
              </div>
              <span className="text-sm pt-0.5" style={{ color: colors.muted }}>
                {item}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Response Time Info */}
      <div
        className="rounded-xl p-4 text-center"
        style={{
          backgroundColor: colors.stardust,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Clock className="w-4 h-4" style={{ color: colors.dim }} />
          <span className="text-sm font-medium" style={{ color: colors.muted }}>
            Typical response time
          </span>
        </div>
        <p className="text-lg font-medium" style={{ color: colors.gold }}>
          Within {policy.max_response_hours} hours
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onViewHistory}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium transition-all"
          style={{
            backgroundColor: colors.gold,
            color: colors.void,
            boxShadow: `0 4px 20px ${colors.gold}40`,
          }}
        >
          View Your Messages
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        <button
          onClick={onClose}
          className="w-full py-3 text-sm rounded-xl transition-colors hover:opacity-80"
          style={{ color: colors.muted }}
        >
          Send another note
        </button>
      </div>

      {/* Crisis Resources Footer */}
      {!isSafetyConcern && (
        <div
          className="text-center p-4 rounded-xl"
          style={{
            backgroundColor: colors.stardust,
            border: `1px solid ${colors.border}`,
          }}
        >
          <p className="text-xs" style={{ color: colors.dim }}>
            {policy.crisis_copy}
          </p>
        </div>
      )}
    </motion.div>
  );
}
