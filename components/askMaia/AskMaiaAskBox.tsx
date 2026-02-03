'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Send,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  BookOpen,
  MessageCircle,
} from 'lucide-react';
import { AskMaiaCard as CardType } from '@/lib/askMaia/types';
import { AskMaiaCard } from './AskMaiaCard';

interface AskMaiaAskBoxProps {
  onAsk?: (question: string) => Promise<AskMaiaResponse>;
  suggestedQuestions?: string[];
  onCardClick?: (card: CardType) => void;
  className?: string;
}

interface AskMaiaResponse {
  answer: string;
  relatedCards?: CardType[];
  sources?: string[];
}

export function AskMaiaAskBox({
  onAsk,
  suggestedQuestions = [
    'What is shadow work?',
    'How do I regulate my nervous system?',
    'Explain the hero\'s journey',
    'What are attachment styles?',
  ],
  onCardClick,
  className,
}: AskMaiaAskBoxProps) {
  const [question, setQuestion] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AskMaiaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle asking a question
  const handleAsk = useCallback(async () => {
    if (!question.trim() || !onAsk || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await onAsk(question.trim());
      setResponse(result);
      setIsExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get answer');
    } finally {
      setIsLoading(false);
    }
  }, [question, onAsk, isLoading]);

  // Handle suggested question click
  const handleSuggestedQuestion = useCallback((q: string) => {
    setQuestion(q);
    inputRef.current?.focus();
  }, []);

  // Clear response
  const clearResponse = useCallback(() => {
    setResponse(null);
    setQuestion('');
    setError(null);
  }, []);

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAsk();
      }
    },
    [handleAsk]
  );

  return (
    <div className={cn('relative', className)}>
      {/* Main Ask Box */}
      <motion.div
        layout
        className={cn(
          'rounded-xl overflow-hidden',
          'bg-gradient-to-br from-maia-navy-850 to-maia-navy-900',
          'border border-maia-spice-500/20',
          'transition-shadow duration-300',
          isExpanded && 'shadow-lg shadow-maia-spice-500/10'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center justify-between px-4 py-3',
            'border-b border-white/5'
          )}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-maia-spice-500/20">
              <Sparkles className="w-4 h-4 text-maia-spice-500" />
            </div>
            <span className="text-sm font-medium text-maia-ink-100">
              Ask MAIA
            </span>
          </div>

          {response && (
            <button
              onClick={clearResponse}
              className="p-1 rounded-full hover:bg-white/10 text-maia-ink-40 hover:text-maia-ink-80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about consciousness, psychology, archetypes..."
              rows={isExpanded ? 3 : 1}
              className={cn(
                'w-full px-4 py-3 pr-12 rounded-lg resize-none',
                'bg-white/5 border border-white/10',
                'text-maia-ink-100 placeholder:text-maia-ink-40',
                'focus:outline-none focus:border-maia-spice-500/50',
                'transition-all duration-200'
              )}
            />
            <button
              onClick={handleAsk}
              disabled={!question.trim() || isLoading}
              className={cn(
                'absolute right-3 bottom-3 p-2 rounded-lg',
                'transition-all duration-200',
                question.trim() && !isLoading
                  ? 'bg-maia-spice-500 text-white hover:bg-maia-spice-600'
                  : 'bg-white/5 text-maia-ink-40'
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Suggested Questions */}
          {!response && !isLoading && (
            <div className="mt-3">
              <p className="text-xs text-maia-ink-40 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.slice(0, 4).map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSuggestedQuestion(q)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs',
                      'bg-white/5 text-maia-ink-60',
                      'hover:bg-white/10 hover:text-maia-ink-80',
                      'transition-colors duration-200'
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Response Area */}
        <AnimatePresence>
          {(response || error) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 border-t border-white/5">
                {error ? (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                ) : response ? (
                  <div className="space-y-4">
                    {/* Answer */}
                    <div className="prose prose-invert prose-sm max-w-none">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-maia-spice-500/20 flex-shrink-0 mt-1">
                          <MessageCircle className="w-4 h-4 text-maia-spice-500" />
                        </div>
                        <div className="text-maia-ink-80 leading-relaxed whitespace-pre-wrap">
                          {response.answer}
                        </div>
                      </div>
                    </div>

                    {/* Related Cards */}
                    {response.relatedCards && response.relatedCards.length > 0 && (
                      <div className="pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-4 h-4 text-maia-ink-40" />
                          <span className="text-sm text-maia-ink-60">
                            Related insights
                          </span>
                        </div>
                        <div className="space-y-2">
                          {response.relatedCards.slice(0, 3).map((card) => (
                            <AskMaiaCard
                              key={card.id}
                              card={card}
                              variant="compact"
                              onClick={() => onCardClick?.(card)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sources */}
                    {response.sources && response.sources.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs text-maia-ink-40">
                          Sources: {response.sources.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Collapsible version for inline use
export function AskMaiaCollapsibleAskBox({
  onAsk,
  onCardClick,
  className,
}: {
  onAsk?: (question: string) => Promise<AskMaiaResponse>;
  onCardClick?: (card: CardType) => void;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn('relative', className)}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 rounded-xl',
          'bg-maia-navy-850 border border-maia-spice-500/20',
          'hover:border-maia-spice-500/40',
          'transition-all duration-200',
          isExpanded && 'rounded-b-none'
        )}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-maia-spice-500" />
          <span className="text-sm text-maia-ink-100">Ask MAIA a question</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-maia-ink-40" />
        ) : (
          <ChevronDown className="w-4 h-4 text-maia-ink-40" />
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                'px-4 pb-4 rounded-b-xl',
                'bg-maia-navy-850 border border-t-0 border-maia-spice-500/20'
              )}
            >
              <AskMaiaAskBox onAsk={onAsk} onCardClick={onCardClick} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AskMaiaAskBox;
