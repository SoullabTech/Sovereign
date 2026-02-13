'use client';

/**
 * MentorChat — Inline Streaming Conversation with MAIA Mentor
 *
 * Multi-turn dialogue scoped to a specific change.
 * Thread lives in React state (Phase 1 — no DB persistence yet).
 * Streams responses via SSE from /api/studio/changes/[id]/mentor/chat.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bookmark, Leaf } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface MentorChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface MentorChatProps {
  changeId: string;
  onSaveInsight: (text: string) => void;
  onClose: () => void;
}

export default function MentorChat({ changeId, onSaveInsight, onClose }: MentorChatProps) {
  const [messages, setMessages] = useState<MentorChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [savedIdx, setSavedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMessage: MentorChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    // Add placeholder for assistant response
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    abortRef.current = new AbortController();

    try {
      const res = await apiFetch(`/api/studio/changes/${changeId}/mentor/chat`, {
        method: 'POST',
        body: JSON.stringify({ messages: newMessages }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: err.error || 'Could not reach MAIA Mentor.',
          };
          return updated;
        });
        setStreaming(false);
        return;
      }

      // Read SSE stream
      const reader = res.body?.getReader();
      if (!reader) {
        setStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                setMessages(prev => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + parsed.text,
                  };
                  return updated;
                });
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
            updated[updated.length - 1] = {
              role: 'assistant',
              content: updated[updated.length - 1].content || 'Connection interrupted. Try again.',
            };
          }
          return updated;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }, [input, messages, streaming, changeId]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleSaveInsight(idx: number) {
    const msg = messages[idx];
    if (msg?.role === 'assistant' && msg.content) {
      onSaveInsight(msg.content);
      setSavedIdx(idx);
      setTimeout(() => setSavedIdx(null), 2000);
    }
  }

  function handleClose() {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-jade-malachite" />
          <span className="text-xs text-jade-malachite uppercase tracking-wider">Mentor Dialogue</span>
        </div>
        <button
          onClick={handleClose}
          className="text-jade-mineral hover:text-jade-sage transition-colors p-1"
          title="End conversation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="max-h-80 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-jade-forest/30"
      >
        {messages.length === 0 && (
          <p className="text-xs text-jade-mineral/60 italic text-center py-4">
            Ask anything about this change. MAIA will respond with what it sees.
          </p>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-jade-forest/20 text-jade-sage border border-jade-sage/15'
                    : 'bg-jade-shadow/60 text-jade-sage/90 border border-jade-sage/10'
                }`}
              >
                <p className="whitespace-pre-wrap font-light">
                  {msg.content}
                  {streaming && i === messages.length - 1 && msg.role === 'assistant' && (
                    <span className="inline-block w-1.5 h-4 bg-jade-malachite/60 ml-0.5 animate-pulse" />
                  )}
                </p>

                {/* Save insight button for assistant messages */}
                {msg.role === 'assistant' && msg.content && !streaming && (
                  <button
                    onClick={() => handleSaveInsight(i)}
                    className={`mt-1.5 flex items-center gap-1 text-xs transition-colors ${
                      savedIdx === i
                        ? 'text-emerald-400'
                        : 'text-jade-mineral/40 hover:text-jade-sage'
                    }`}
                    title="Save this insight to the change"
                  >
                    <Bookmark className="w-3 h-3" />
                    {savedIdx === i ? 'Saved' : 'Save insight'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={streaming ? 'MAIA is speaking...' : 'Ask the mentor...'}
          disabled={streaming}
          className="flex-1 px-3 py-2 text-sm bg-jade-shadow/60 border border-jade-sage/20 rounded-lg text-jade-sage placeholder-jade-mineral/40 focus:border-jade-malachite/50 focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={streaming || !input.trim()}
          className="px-3 py-2 bg-jade-forest/20 hover:bg-jade-forest/30 border border-jade-sage/20 hover:border-jade-malachite/40 text-jade-sage rounded-lg transition-all disabled:opacity-30"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
