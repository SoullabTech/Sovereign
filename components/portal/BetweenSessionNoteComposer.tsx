"use client";

/**
 * BETWEEN-SESSION NOTE COMPOSER
 *
 * Client-facing interface for sending between-session notes to their practitioner.
 * Includes type selection, urgency selection, and body text.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  HelpCircle,
  Star,
  Heart,
  Calendar,
  AlertTriangle,
  Clock,
  Send,
  Loader2,
} from 'lucide-react';
import type { MessageType, MessageUrgency, MessagePolicy } from '@/lib/portal/messages';
import { MESSAGE_TYPE_OPTIONS, URGENCY_OPTIONS } from '@/lib/portal/messages';

interface BetweenSessionNoteComposerProps {
  policy: MessagePolicy;
  policySummary: string;
  onSend: (data: {
    message_type: MessageType | null;
    urgency: MessageUrgency;
    body: string;
  }) => Promise<void>;
  isSending?: boolean;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  'lightbulb': <Lightbulb className="w-5 h-5" />,
  'help-circle': <HelpCircle className="w-5 h-5" />,
  'star': <Star className="w-5 h-5" />,
  'heart': <Heart className="w-5 h-5" />,
  'calendar': <Calendar className="w-5 h-5" />,
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

export default function BetweenSessionNoteComposer({
  policy,
  policySummary,
  onSend,
  isSending = false,
}: BetweenSessionNoteComposerProps) {
  const [selectedType, setSelectedType] = useState<MessageType | null>(null);
  const [selectedUrgency, setSelectedUrgency] = useState<MessageUrgency>('not_urgent');
  const [body, setBody] = useState('');
  const [showUrgencyWarning, setShowUrgencyWarning] = useState(false);

  const handleTypeSelect = (type: MessageType) => {
    setSelectedType(selectedType === type ? null : type);
  };

  const handleUrgencySelect = (urgency: MessageUrgency) => {
    setSelectedUrgency(urgency);
    if (urgency === 'safety_concern') {
      setShowUrgencyWarning(true);
    }
  };

  const handleSubmit = async () => {
    if (!body.trim() || isSending) return;

    await onSend({
      message_type: selectedType,
      urgency: selectedUrgency,
      body: body.trim(),
    });
  };

  const charCount = body.length;
  const maxChars = 10000;

  return (
    <div className="space-y-6">
      {/* Policy Summary */}
      <div
        className="rounded-xl p-4 backdrop-blur-xl"
        style={{
          background: `linear-gradient(135deg, ${colors.cardBg}, rgba(157, 142, 199, 0.1))`,
          border: `1px solid ${colors.border}`,
        }}
      >
        <p className="text-sm" style={{ color: colors.muted }}>
          {policySummary}
        </p>
      </div>

      {/* Message Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium" style={{ color: colors.starlight }}>
          What kind of note is this? (optional)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MESSAGE_TYPE_OPTIONS.map(option => (
            <motion.button
              key={option.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTypeSelect(option.value)}
              className="flex items-center gap-2 p-3 rounded-xl transition-all text-left"
              style={{
                backgroundColor: selectedType === option.value
                  ? `${colors.gold}20`
                  : colors.stardust,
                border: `1px solid ${selectedType === option.value ? colors.gold : colors.border}`,
                color: selectedType === option.value ? colors.gold : colors.muted,
              }}
            >
              <span className="flex-shrink-0">
                {TYPE_ICONS[option.icon]}
              </span>
              <div>
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-xs opacity-70 hidden sm:block">{option.description}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Message Body */}
      <div className="space-y-3">
        <label className="block text-sm font-medium" style={{ color: colors.starlight }}>
          Your note
        </label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Share what's on your mind..."
          rows={6}
          maxLength={maxChars}
          className="w-full p-4 rounded-xl text-base outline-none transition-all resize-none focus:ring-2"
          style={{
            backgroundColor: colors.void,
            border: `1px solid ${colors.border}`,
            color: colors.starlight,
          }}
          disabled={isSending}
        />
        <div className="flex justify-between text-xs" style={{ color: colors.dim }}>
          <span>{charCount.toLocaleString()} / {maxChars.toLocaleString()} characters</span>
          {charCount > maxChars * 0.9 && (
            <span style={{ color: colors.warning }}>Approaching limit</span>
          )}
        </div>
      </div>

      {/* Urgency Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium" style={{ color: colors.starlight }}>
          How urgent is this?
        </label>
        <div className="space-y-2">
          {URGENCY_OPTIONS.map(option => (
            <motion.button
              key={option.value}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => handleUrgencySelect(option.value)}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
              style={{
                backgroundColor: selectedUrgency === option.value
                  ? option.value === 'safety_concern'
                    ? `${colors.danger}15`
                    : option.value === 'time_sensitive'
                    ? `${colors.warning}15`
                    : `${colors.gold}15`
                  : colors.stardust,
                border: `1px solid ${
                  selectedUrgency === option.value
                    ? option.value === 'safety_concern'
                      ? colors.danger
                      : option.value === 'time_sensitive'
                      ? colors.warning
                      : colors.gold
                    : colors.border
                }`,
                color: selectedUrgency === option.value
                  ? option.value === 'safety_concern'
                    ? colors.danger
                    : option.value === 'time_sensitive'
                    ? colors.warning
                    : colors.gold
                  : colors.muted,
              }}
            >
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor: selectedUrgency === option.value
                    ? option.value === 'safety_concern'
                      ? colors.danger
                      : option.value === 'time_sensitive'
                      ? colors.warning
                      : colors.gold
                    : colors.border,
                }}
              >
                {selectedUrgency === option.value && (
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: option.value === 'safety_concern'
                        ? colors.danger
                        : option.value === 'time_sensitive'
                        ? colors.warning
                        : colors.gold,
                    }}
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium flex items-center gap-2">
                  {option.value === 'safety_concern' && (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {option.value === 'time_sensitive' && (
                    <Clock className="w-4 h-4" />
                  )}
                  {option.label}
                </div>
                <div className="text-xs opacity-70">{option.description}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Safety Concern Warning */}
      {selectedUrgency === 'safety_concern' && showUrgencyWarning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4"
          style={{
            backgroundColor: `${colors.danger}15`,
            border: `1px solid ${colors.danger}50`,
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.danger }} />
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: colors.danger }}>
                Important Notice
              </p>
              <p className="text-sm" style={{ color: colors.muted }}>
                {policy.crisis_copy}
              </p>
              <button
                onClick={() => setShowUrgencyWarning(false)}
                className="text-xs mt-3 underline"
                style={{ color: colors.dim }}
              >
                I understand, continue
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleSubmit}
        disabled={!body.trim() || isSending}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium transition-all disabled:opacity-50"
        style={{
          backgroundColor: colors.gold,
          color: colors.void,
          boxShadow: body.trim() ? `0 4px 20px ${colors.gold}40` : 'none',
        }}
      >
        {isSending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Sending...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Send Note</span>
          </>
        )}
      </motion.button>

      {/* Crisis Resources Footer */}
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
    </div>
  );
}
