'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function PortalChatPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiName, setAiName] = useState('Guide');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError(null);

    const userMessage: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch(`/api/portal/${slug}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
        }),
      });

      if (!res.ok) {
        throw new Error(res.status === 404 ? 'Portal not found' : 'Failed to get response');
      }

      const data = await res.json();
      if (data.ai_name) setAiName(data.ai_name);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ]);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #0D0B14 0%, #1A1625 50%, #0D0B14 100%)',
      }}
    >
      {/* Header */}
      <header className="border-b border-[#3A3347] px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href={`/portal/${slug}`}
            className="flex items-center gap-2 text-[#9D8EC7] hover:text-[#F5F0FF] transition-colors font-quicksand text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portal
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span className="font-cinzel text-[#F5F0FF] text-sm">{aiName}</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Sparkles className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />
              <h2 className="font-cinzel text-xl text-[#F5F0FF] mb-2">
                Chat with {aiName}
              </h2>
              <p className="font-quicksand text-sm text-[#9D8EC7] max-w-md mx-auto">
                Ask about astrology, book a reading, or explore what the stars have to say.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {[
                  'What can you help me with?',
                  'Tell me about natal charts',
                  "I'd like to book a reading",
                  "What's happening in the sky right now?",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      setTimeout(() => sendMessage(), 0);
                    }}
                    className="px-4 py-2 rounded-full text-xs font-quicksand
                             bg-[#251F33] text-[#E8B4CB] border border-[#3A3347]
                             hover:border-[#9D8EC7]/50 hover:bg-[#3A3347] transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 font-quicksand text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#D4AF37]/20 text-[#F5F0FF] border border-[#D4AF37]/30'
                    : 'bg-[#1A1625] text-[#F5F0FF] border border-[#3A3347]'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    <span className="text-[10px] font-cinzel text-[#9D8EC7] uppercase tracking-wider">
                      {aiName}
                    </span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-[#1A1625] border border-[#3A3347] rounded-2xl px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((j) => (
                    <motion.div
                      key={j}
                      className="w-2 h-2 rounded-full bg-[#9D8EC7]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: j * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <div className="text-center py-2">
              <p className="text-xs text-red-400 font-quicksand">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[#3A3347] px-4 py-4">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 resize-none rounded-xl px-4 py-3 text-sm font-quicksand
                     bg-[#251F33] text-[#F5F0FF] border border-[#3A3347]
                     placeholder:text-[#6B6280]
                     focus:outline-none focus:border-[#9D8EC7]/50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C9A962]
                     text-[#0D0B14] disabled:opacity-40 disabled:cursor-not-allowed
                     hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* AIN Platform Signature */}
        <div className="max-w-3xl mx-auto mt-3 text-center">
          <p className="font-quicksand text-[10px] text-[#6B6280]">
            Powered by AIN — Private Intelligence Infrastructure.{' '}
            <a
              href="https://soullab.life/powered-by"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-[#9D8EC7] transition-colors"
            >
              Your data stays here.
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
