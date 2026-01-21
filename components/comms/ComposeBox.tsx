"use client";

/**
 * COMMS SPINE: Compose Box
 *
 * Message composition component for practitioner replies.
 * Supports:
 * - Quick response templates
 * - Custom message composition
 * - Character count
 * - Send on Enter (with Shift+Enter for newline)
 */

import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Send, Zap, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type QuickResponseType = 'noted' | 'discuss_next_session' | 'acknowledged';

interface ComposeBoxProps {
  onSend: (body: string) => Promise<void>;
  onQuickResponse: (type: QuickResponseType) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

const QUICK_RESPONSES: Array<{
  type: QuickResponseType;
  label: string;
  icon: React.ReactNode;
  body: string;
}> = [
  {
    type: 'noted',
    label: 'Noted',
    icon: <CheckCircle className="w-4 h-4" />,
    body: "Thank you for sharing. I've noted this and will keep it in mind.",
  },
  {
    type: 'discuss_next_session',
    label: 'Discuss Next Session',
    icon: <Clock className="w-4 h-4" />,
    body: "Thank you for sharing this. Let's discuss this in our next session together.",
  },
  {
    type: 'acknowledged',
    label: 'Acknowledged',
    icon: <CheckCircle className="w-4 h-4" />,
    body: "I've received your message and acknowledge what you've shared.",
  },
];

/** Methods exposed via ref */
export interface ComposeBoxRef {
  insertText: (text: string) => void;
  getText: () => string;
  focus: () => void;
}

export const ComposeBox = forwardRef<ComposeBoxRef, ComposeBoxProps>(function ComposeBox({
  onSend,
  onQuickResponse,
  disabled = false,
  placeholder = "Write a reply...",
  maxLength = 10000,
}, ref) {
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    insertText: (text: string) => {
      setBody(text);
      // Focus the textarea after inserting
      setTimeout(() => textareaRef.current?.focus(), 0);
    },
    getText: () => body,
    focus: () => textareaRef.current?.focus(),
  }), [body]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [body]);

  const handleSend = async () => {
    if (!body.trim() || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(body.trim());
      setBody('');
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickResponse = async (type: QuickResponseType) => {
    if (isSending || disabled) return;

    setIsSending(true);
    setShowQuickResponses(false);
    try {
      await onQuickResponse(type);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const characterCount = body.length;
  const isOverLimit = characterCount > maxLength;

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-3">
      {/* Quick responses toggle */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setShowQuickResponses(!showQuickResponses)}
          disabled={disabled || isSending}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 transition-colors disabled:opacity-50"
        >
          <Zap className="w-4 h-4" />
          <span>Quick Responses</span>
        </button>

        <span className={`text-xs ${isOverLimit ? 'text-red-400' : 'text-gray-500'}`}>
          {characterCount.toLocaleString()}/{maxLength.toLocaleString()}
        </span>
      </div>

      {/* Quick responses panel */}
      <AnimatePresence>
        {showQuickResponses && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 space-y-2"
          >
            {QUICK_RESPONSES.map((qr) => (
              <button
                key={qr.type}
                onClick={() => handleQuickResponse(qr.type)}
                disabled={disabled || isSending}
                className="w-full flex items-start space-x-3 p-3 rounded-md bg-gray-700/30 hover:bg-gray-700/50 transition-colors text-left disabled:opacity-50"
              >
                <span className="text-sacred-gold mt-0.5">{qr.icon}</span>
                <div>
                  <div className="text-sm font-medium text-gray-200">{qr.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{qr.body}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message input */}
      <div className="flex items-end space-x-3">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          rows={1}
          className="flex-1 bg-gray-900/50 rounded-md px-4 py-3 text-gray-200 placeholder-gray-500 border border-gray-700/50 focus:border-sacred-gold/50 focus:outline-none resize-none disabled:opacity-50"
        />

        <button
          onClick={handleSend}
          disabled={!body.trim() || isOverLimit || disabled || isSending}
          className="p-3 rounded-md bg-sacred-gold/20 text-sacred-gold hover:bg-sacred-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
});

export default ComposeBox;
