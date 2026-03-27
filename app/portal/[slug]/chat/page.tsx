'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
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
        background: 'linear-gradient(180deg, #1A1510 0%, #1E1914 50%, #1A1510 100%)',
      }}
    >
      {/* Header */}
      <header className="border-b border-stone-800/50 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href={`/portal/${slug}`}
            className="flex items-center gap-2 text-stone-500 hover:text-amber-200/80 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <span className="text-amber-200/60 text-sm tracking-wider uppercase">{aiName}</span>
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
              {/* Holoflower */}
              <img src="/holoflower.svg" alt="" className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <h2 className="text-xl text-amber-100/80 mb-2 tracking-wide">
                {aiName}
              </h2>
              <p className="text-sm text-stone-500 max-w-md mx-auto">
                Start with what is actually going on. This is not intake — this is where we begin.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {[
                  'Something feels off but I can\'t name it.',
                  'I keep starting things and not finishing them.',
                  'I need to make a decision and I\'m stuck.',
                  'I know what to do but I\'m not doing it.',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      setTimeout(() => sendMessage(), 0);
                    }}
                    className="px-4 py-2 rounded-full text-xs
                             bg-stone-900/50 text-amber-200/60 border border-stone-700/40
                             hover:border-amber-600/30 hover:bg-stone-800/50 transition-all"
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
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-amber-900/20 text-amber-100/90 border border-amber-700/30'
                    : 'bg-stone-900/50 text-stone-200 border border-stone-700/30'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <img src="/holoflower.svg" alt="" className="w-3 h-3 opacity-40" />
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider">
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
              <div className="bg-stone-900/50 border border-stone-700/30 rounded-2xl px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((j) => (
                    <motion.div
                      key={j}
                      className="w-2 h-2 rounded-full bg-amber-600/50"
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
              <p className="text-xs text-red-400/70">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-stone-800/50 px-4 py-4">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What is actually going on..."
            rows={1}
            className="flex-1 resize-none rounded-xl px-4 py-3 text-sm
                     bg-stone-900/60 text-stone-200 border border-stone-700/40
                     placeholder:text-stone-600
                     focus:outline-none focus:border-amber-700/40 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl bg-amber-700/80
                     text-amber-100 disabled:opacity-30 disabled:cursor-not-allowed
                     hover:bg-amber-600/80 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="max-w-3xl mx-auto mt-3 text-center">
          <p className="text-[10px] text-stone-700">
            Powered by AIN — Private Intelligence Infrastructure.{' '}
            <a
              href="https://soullab.life/powered-by"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-stone-500 transition-colors"
            >
              Your data stays here.
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
