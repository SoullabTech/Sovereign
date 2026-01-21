"use client";

/**
 * COMMS SPINE: Thread View
 *
 * Displays a conversation thread with messages.
 * Shows client context, policy info, and safety flags.
 *
 * Design principles:
 * - Context panel (client info, spiral stage, policy)
 * - Message list with clear sender indication
 * - Safety flags highlighted with action buttons
 * - Compose box at bottom
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  User,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Shield,
  Brain,
  Eye,
  ThumbsUp,
  ThumbsDown,
  X,
  MessageSquareText,
  Sparkles,
  PenLine,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ComposeBox, type QuickResponseType, type ComposeBoxRef } from './ComposeBox';
import { SafetyAcknowledgeModal } from './SafetyAcknowledgeModal';
import type { CommsDomain, CommsSafetySeverity } from '@/lib/comms/types';

// ─────────────────────────────────────────────────────────────────────────────
// SUGGESTION TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ReplySuggestion {
  id: string;
  thread_id: string;
  message_id: string;
  kind: 'reply' | 'follow_up' | 'boundary' | 'safety';
  title: string | null;
  suggested_text: string;
  confidence: number;
  rationale: string | null;
  status: 'draft' | 'dismissed' | 'sent' | 'superseded';
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ThreadMessage {
  id: string;
  sender_type: 'client' | 'practitioner' | 'maia' | 'system';
  sender_id: string | null;
  body: string;
  message_type: string | null;
  urgency: string;
  delivery_status: string;
  read_at: string | null;
  created_at: string;
  is_quick_response: boolean;
  quick_response_type: string | null;
  maia_analysis: {
    classification?: {
      inferred_type: string;
      inferred_urgency: string;
      confidence: number;
      safety_cues: string[];
    };
    safety?: {
      detected: boolean;
      severity?: CommsSafetySeverity;
      cues: string[];
      recommended_action?: string;
    };
  } | null;
  safety_flags: Array<{
    id: string;
    severity: CommsSafetySeverity;
    cues: string[];
    acknowledged_at: string | null;
    recommended_action: string | null;
  }>;
}

export interface ThreadContext {
  thread_id: string;
  domain: CommsDomain;
  thread_type: string;
  client: {
    id: string;
    name: string;
    email?: string;
    spiral_stage?: string;
    last_session?: string;
  } | null;
  policy: {
    check_days: string[];
    check_window_start: string;
    check_window_end: string;
    timezone: string;
    max_response_hours: number;
    crisis_copy: string;
    allow_outbound: boolean;
  } | null;
}

interface ThreadViewProps {
  context: ThreadContext;
  messages: ThreadMessage[];
  onBack: () => void;
  onSendMessage: (body: string) => Promise<void>;
  onQuickResponse: (type: QuickResponseType) => Promise<void>;
  onAcknowledgeSafetyFlag: (flagId: string, reviewNote?: string) => Promise<void>;
  isLoading?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

// Type for modal context
interface ModalFlagContext {
  id: string;
  severity: CommsSafetySeverity;
  cues: string[];
  message_preview: string;
  client_name: string;
  recommended_action?: string;
  created_at: string;
}

export function ThreadView({
  context,
  messages,
  onBack,
  onSendMessage,
  onQuickResponse,
  onAcknowledgeSafetyFlag,
  isLoading = false,
}: ThreadViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composeBoxRef = useRef<ComposeBoxRef>(null);
  const [selectedFlag, setSelectedFlag] = useState<ModalFlagContext | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<ReplySuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Fetch existing suggestions when thread loads
  useEffect(() => {
    if (context.thread_id) {
      fetchSuggestions();
    }
  }, [context.thread_id]);

  // Fetch suggestions from API
  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`/api/comms/threads/${context.thread_id}/suggested-replies?status=draft`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        if (data.suggestions?.length > 0) {
          setShowSuggestions(true);
        }
      }
    } catch (err) {
      console.error('[ThreadView] Failed to fetch suggestions:', err);
    }
  };

  // Generate new suggestions
  const generateSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const res = await fetch(`/api/comms/threads/${context.thread_id}/suggested-replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerate: true }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error('[ThreadView] Failed to generate suggestions:', err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Insert suggestion into compose box
  const insertSuggestion = (suggestion: ReplySuggestion) => {
    composeBoxRef.current?.insertText(suggestion.suggested_text);
  };

  // Dismiss a suggestion
  const dismissSuggestion = async (suggestionId: string) => {
    try {
      const res = await fetch(`/api/comms/replies/suggestions/${suggestionId}/dismiss`, {
        method: 'POST',
      });

      if (res.ok) {
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      }
    } catch (err) {
      console.error('[ThreadView] Failed to dismiss suggestion:', err);
    }
  };

  const unacknowledgedFlags = messages
    .flatMap(m => m.safety_flags)
    .filter(f => !f.acknowledged_at);

  const hasPendingSafetyFlags = unacknowledgedFlags.length > 0;

  // Find the first unacked flag with its message context (for clickable gate)
  const getFirstUnackedFlagWithContext = () => {
    for (const message of messages) {
      const unacked = message.safety_flags.find(f => !f.acknowledged_at);
      if (unacked) {
        return { flag: unacked, message };
      }
    }
    return null;
  };

  // Open the modal for the first unacked flag (used by clickable gate)
  const openFirstSafetyFlag = () => {
    const found = getFirstUnackedFlagWithContext();
    if (found) {
      openAcknowledgeModal(found.flag, found.message.body, found.message.created_at);
    }
  };

  // Open the acknowledgment modal for a specific flag
  const openAcknowledgeModal = (flag: {
    id: string;
    severity: CommsSafetySeverity;
    cues: string[];
    recommended_action: string | null;
  }, messageBody: string, messageCreatedAt: string) => {
    setSelectedFlag({
      id: flag.id,
      severity: flag.severity,
      cues: flag.cues,
      message_preview: messageBody.length > 200 ? messageBody.slice(0, 200) + '...' : messageBody,
      client_name: context.client?.name || 'Client',
      recommended_action: flag.recommended_action || undefined,
      created_at: messageCreatedAt,
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFlag(null);
  };

  const handleModalAcknowledge = async (flagId: string, reviewNote?: string) => {
    await onAcknowledgeSafetyFlag(flagId, reviewNote);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/30 rounded-lg border border-gray-800/50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h2 className="font-medium text-gray-100">
                {context.client?.name || 'Unknown Client'}
              </h2>
              <p className="text-sm text-gray-500">
                {context.domain} / {context.thread_type.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Context indicators */}
        <div className="flex items-center space-x-3">
          {context.client?.spiral_stage && (
            <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded">
              {context.client.spiral_stage}
            </span>
          )}
          {hasPendingSafetyFlags && (
            <span className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Safety Review Needed
            </span>
          )}
        </div>
      </div>

      {/* Policy notice */}
      {context.policy && (
        <div className="px-4 py-2 bg-gray-800/30 border-b border-gray-800/50 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>
              Response window: {context.policy.check_days.slice(0, 3).join(', ')}
              {context.policy.check_days.length > 3 && '...'}, {' '}
              {context.policy.check_window_start}–{context.policy.check_window_end}
            </span>
            <span>Max response: {context.policy.max_response_hours}h</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <MessageIcon className="w-12 h-12 mb-4 opacity-50" />
            <p>No messages yet</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              onOpenAcknowledgeModal={(flag) => openAcknowledgeModal(flag, message.body, message.created_at)}
              index={index}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions Panel */}
      {context.policy?.allow_outbound !== false && (
        <SuggestionsPanel
          suggestions={suggestions}
          isLoading={isLoadingSuggestions}
          isVisible={showSuggestions}
          isBlocked={hasPendingSafetyFlags}
          onToggle={() => setShowSuggestions(!showSuggestions)}
          onGenerate={generateSuggestions}
          onInsert={insertSuggestion}
          onDismiss={dismissSuggestion}
          onOpenSafetyModal={openFirstSafetyFlag}
        />
      )}

      {/* Compose */}
      <div className="p-4 border-t border-gray-800/50">
        {context.policy?.allow_outbound === false ? (
          <div className="text-center py-4 text-gray-500">
            <Shield className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Outbound messages disabled for this thread</p>
          </div>
        ) : (
          <ComposeBox
            ref={composeBoxRef}
            onSend={onSendMessage}
            onQuickResponse={onQuickResponse}
            placeholder="Write a reply..."
          />
        )}
      </div>

      {/* Safety Acknowledgment Modal */}
      {selectedFlag && (
        <SafetyAcknowledgeModal
          flag={selectedFlag}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onAcknowledge={handleModalAcknowledge}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE BUBBLE
// ─────────────────────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: ThreadMessage;
  onOpenAcknowledgeModal: (flag: {
    id: string;
    severity: CommsSafetySeverity;
    cues: string[];
    recommended_action: string | null;
  }) => void;
  index: number;
}

function MessageBubble({ message, onOpenAcknowledgeModal, index }: MessageBubbleProps) {
  const isClient = message.sender_type === 'client';
  const isPractitioner = message.sender_type === 'practitioner';
  const isMaia = message.sender_type === 'maia';

  const unacknowledgedFlags = message.safety_flags.filter(f => !f.acknowledged_at);
  const hasUnacknowledgedFlag = unacknowledgedFlags.length > 0;
  const highestSeverity = unacknowledgedFlags
    .map(f => f.severity)
    .sort((a, b) => {
      const order = { crisis: 0, red: 1, yellow: 2 };
      return order[a] - order[b];
    })[0];

  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  const fullTime = format(new Date(message.created_at), 'PPpp');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={`flex ${isPractitioner ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] ${isPractitioner ? 'items-end' : 'items-start'}`}>
        {/* Safety flag alert */}
        {hasUnacknowledgedFlag && (
          <SafetyFlagAlert
            flags={unacknowledgedFlags}
            onOpenModal={onOpenAcknowledgeModal}
          />
        )}

        {/* Message bubble */}
        <div
          className={`rounded-lg p-3 ${
            isPractitioner
              ? 'bg-sacred-gold/20 text-gray-100'
              : isMaia
              ? 'bg-purple-900/30 text-gray-200 border border-purple-700/30'
              : hasUnacknowledgedFlag && highestSeverity === 'crisis'
              ? 'bg-red-900/40 text-gray-100 border border-red-500/50'
              : hasUnacknowledgedFlag && highestSeverity === 'red'
              ? 'bg-red-900/30 text-gray-100 border border-red-400/30'
              : hasUnacknowledgedFlag
              ? 'bg-amber-900/30 text-gray-100 border border-amber-400/30'
              : 'bg-gray-800/50 text-gray-200'
          }`}
        >
          {/* MAIA indicator */}
          {isMaia && (
            <div className="flex items-center space-x-1 text-xs text-purple-400 mb-2">
              <Brain className="w-3 h-3" />
              <span>MAIA Analysis</span>
            </div>
          )}

          {/* Quick response indicator */}
          {message.is_quick_response && (
            <div className="flex items-center space-x-1 text-xs text-sacred-gold/70 mb-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Quick response</span>
            </div>
          )}

          {/* Message body */}
          <p className="whitespace-pre-wrap">{message.body}</p>

          {/* Message type tag */}
          {message.message_type && isClient && (
            <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-gray-700/50 text-gray-400 rounded">
              {message.message_type}
            </span>
          )}
        </div>

        {/* Timestamp and status */}
        <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${
          isPractitioner ? 'justify-end' : 'justify-start'
        }`}>
          <span title={fullTime}>{timeAgo}</span>
          {isPractitioner && message.delivery_status === 'read' && (
            <CheckCircle2 className="w-3 h-3 text-green-500" />
          )}
        </div>

        {/* MAIA analysis indicator */}
        {message.maia_analysis?.classification && (
          <div className={`mt-1 ${isPractitioner ? 'text-right' : 'text-left'}`}>
            <div className={`flex items-center space-x-2 text-xs text-gray-500 ${
              isPractitioner ? 'justify-end' : 'justify-start'
            }`}>
              <Brain className="w-3 h-3 text-purple-400" />
              <span>
                MAIA: {message.maia_analysis.classification.inferred_type}
                {message.maia_analysis.classification.confidence > 0.7 && ' (high confidence)'}
              </span>
            </div>

            {/* MAIA Feedback buttons */}
            <MAIAFeedback messageId={message.id} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIA FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────

const FEEDBACK_REASONS = [
  { value: 'wrong_type', label: 'Wrong message type' },
  { value: 'wrong_urgency', label: 'Wrong urgency level' },
  { value: 'missed_safety', label: 'Missed safety cues' },
  { value: 'too_alarmist', label: 'Too alarmist' },
  { value: 'other', label: 'Other' },
];

interface MAIAFeedbackProps {
  messageId: string;
}

function MAIAFeedback({ messageId }: MAIAFeedbackProps) {
  const [feedback, setFeedback] = useState<1 | -1 | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  // Submit feedback (positive or negative with optional reason/note)
  const submitFeedback = async (signal: 1 | -1, feedbackReason?: string, feedbackNote?: string) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/comms/messages/${messageId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signal,
          reason: feedbackReason || undefined,
          note: feedbackNote || undefined,
        }),
      });

      if (res.ok) {
        setFeedback(signal);
        setShowModal(false);
        setReason('');
        setNote('');
      }
    } catch (err) {
      console.error('[MAIA Feedback] Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle thumbs up (one-tap)
  const handleThumbsUp = () => submitFeedback(1);

  // Handle thumbs down (opens modal)
  const handleThumbsDown = () => setShowModal(true);

  // Handle modal submit
  const handleModalSubmit = () => submitFeedback(-1, reason, note);

  return (
    <>
      <div className="flex items-center gap-2 mt-1.5">
        <button
          type="button"
          onClick={handleThumbsUp}
          disabled={isSubmitting || feedback !== null}
          className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors ${
            feedback === 1
              ? 'bg-green-500/20 text-green-400 border border-green-500/40'
              : 'bg-white/5 hover:bg-white/10 border border-gray-700/60 text-gray-400 hover:text-gray-300'
          }`}
          title="MAIA got this right"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Helpful</span>
        </button>

        <button
          type="button"
          onClick={handleThumbsDown}
          disabled={isSubmitting || feedback !== null}
          className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors ${
            feedback === -1
              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
              : 'bg-white/5 hover:bg-white/10 border border-gray-700/60 text-gray-400 hover:text-gray-300'
          }`}
          title="MAIA got this wrong"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          <span>Off</span>
        </button>

        {feedback === null && (
          <span className="text-[11px] text-gray-500 ml-1">
            (trains your practice)
          </span>
        )}

        {feedback !== null && (
          <span className="text-[11px] text-gray-500 ml-1">
            Feedback recorded
          </span>
        )}
      </div>

      {/* Feedback Modal (for negative feedback) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
              <div className="flex items-center gap-2">
                <MessageSquareText className="w-5 h-5 text-purple-400" />
                <h3 className="font-medium text-gray-100">Help MAIA Learn</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-200 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-400">
                What did MAIA get wrong? This trains your practice's clinical culture.
              </p>

              {/* Reason dropdown */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Category (optional)
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select a reason...</option>
                  {FEEDBACK_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note textarea */}
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  Additional context (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What would have been more accurate?"
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-700/50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Submit Feedback'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SAFETY FLAG ALERT
// ─────────────────────────────────────────────────────────────────────────────

interface SafetyFlagAlertProps {
  flags: Array<{
    id: string;
    severity: CommsSafetySeverity;
    cues: string[];
    recommended_action: string | null;
  }>;
  onOpenModal: (flag: {
    id: string;
    severity: CommsSafetySeverity;
    cues: string[];
    recommended_action: string | null;
  }) => void;
}

function SafetyFlagAlert({ flags, onOpenModal }: SafetyFlagAlertProps) {
  const highestSeverity = flags
    .map(f => f.severity)
    .sort((a, b) => {
      const order = { crisis: 0, red: 1, yellow: 2 };
      return order[a] - order[b];
    })[0];

  // Find the flag with highest severity to open in modal
  const primaryFlag = flags.find(f => f.severity === highestSeverity) || flags[0];

  const config = {
    crisis: {
      bg: 'bg-red-900/80',
      border: 'border-red-500',
      icon: AlertTriangle,
      label: 'CRISIS FLAG',
      accent: 'text-red-200',
    },
    red: {
      bg: 'bg-red-800/60',
      border: 'border-red-400',
      icon: AlertTriangle,
      label: 'URGENT SAFETY FLAG',
      accent: 'text-red-200',
    },
    yellow: {
      bg: 'bg-amber-800/60',
      border: 'border-amber-400',
      icon: AlertCircle,
      label: 'SAFETY FLAG',
      accent: 'text-amber-200',
    },
  }[highestSeverity];

  const Icon = config.icon;

  return (
    <div className={`${config.bg} ${config.border} border rounded-lg p-3 mb-2`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          <Icon className={`w-5 h-5 ${config.accent} mt-0.5`} />
          <div>
            <div className={`font-medium ${config.accent}`}>{config.label}</div>
            {primaryFlag.recommended_action && (
              <p className={`text-sm ${config.accent} opacity-80 mt-1`}>
                {primaryFlag.recommended_action}
              </p>
            )}
            <div className="flex flex-wrap gap-1 mt-2">
              {flags.flatMap(f => f.cues).map((cue, i) => (
                <span key={i} className={`px-2 py-0.5 text-xs ${config.bg} border ${config.border} ${config.accent} rounded`}>
                  {cue.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenModal(primaryFlag)}
          className="px-3 py-1.5 text-sm font-medium bg-white/10 hover:bg-white/20 text-white rounded transition-colors flex items-center space-x-1.5"
        >
          <Eye className="w-4 h-4" />
          <span>Review</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUGGESTIONS PANEL
// ─────────────────────────────────────────────────────────────────────────────

interface SuggestionsPanelProps {
  suggestions: ReplySuggestion[];
  isLoading: boolean;
  isVisible: boolean;
  isBlocked: boolean; // True when unacknowledged safety flags exist
  onToggle: () => void;
  onGenerate: () => void;
  onInsert: (suggestion: ReplySuggestion) => void;
  onDismiss: (suggestionId: string) => void;
  onOpenSafetyModal?: () => void; // Opens the first unacked safety flag modal
}

function SuggestionsPanel({
  suggestions,
  isLoading,
  isVisible,
  isBlocked,
  onToggle,
  onGenerate,
  onInsert,
  onDismiss,
  onOpenSafetyModal,
}: SuggestionsPanelProps) {
  const hasSuggestions = suggestions.length > 0;

  return (
    <div className="border-t border-gray-800/50">
      {/* Header / Toggle */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/30">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Suggested Drafts</span>
          {hasSuggestions && (
            <span className="px-1.5 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded">
              {suggestions.length}
            </span>
          )}
        </button>

        {isBlocked ? (
          <button
            onClick={onOpenSafetyModal}
            disabled={!onOpenSafetyModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Acknowledge safety flag to unlock</span>
          </button>
        ) : (
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Generating...' : 'Generate'}</span>
          </button>
        )}
      </div>

      {/* Suggestions List */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2 bg-gray-900/30">
              {!hasSuggestions ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No suggestions yet. Click "Generate" to create drafts.
                </p>
              ) : (
                suggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onInsert={() => onInsert(suggestion)}
                    onDismiss={() => onDismiss(suggestion.id)}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUGGESTION CARD
// ─────────────────────────────────────────────────────────────────────────────

interface SuggestionCardProps {
  suggestion: ReplySuggestion;
  onInsert: () => void;
  onDismiss: () => void;
}

function SuggestionCard({ suggestion, onInsert, onDismiss }: SuggestionCardProps) {
  const kindColors = {
    reply: 'border-purple-500/30 bg-purple-900/20',
    follow_up: 'border-blue-500/30 bg-blue-900/20',
    boundary: 'border-amber-500/30 bg-amber-900/20',
    safety: 'border-red-500/30 bg-red-900/20',
  };

  const kindLabels = {
    reply: 'Reply',
    follow_up: 'Follow-up',
    boundary: 'Boundary',
    safety: 'Safety',
  };

  return (
    <div className={`rounded-lg border p-3 ${kindColors[suggestion.kind]}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs px-1.5 py-0.5 bg-white/5 text-gray-400 rounded">
            {kindLabels[suggestion.kind]}
          </span>
          {suggestion.title && (
            <span className="text-sm text-gray-300">{suggestion.title}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {suggestion.confidence >= 0.7 && (
            <span className="text-[10px] text-green-400/70">High confidence</span>
          )}
        </div>
      </div>

      {/* Body */}
      <p className="text-sm text-gray-300 whitespace-pre-wrap mb-3">
        {suggestion.suggested_text}
      </p>

      {/* Rationale */}
      {suggestion.rationale && (
        <p className="text-xs text-gray-500 italic mb-3">
          {suggestion.rationale}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onInsert}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors"
        >
          <PenLine className="w-3.5 h-3.5" />
          <span>Insert into compose</span>
        </button>
        <button
          onClick={onDismiss}
          className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded transition-colors"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Dismiss</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

export default ThreadView;
