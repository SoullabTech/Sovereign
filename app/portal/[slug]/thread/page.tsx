'use client';

/**
 * PORTAL THREAD PAGE
 * ==================
 * The ONE page clients see. No dashboard, no tabs, no navigation.
 * Just the conversation thread with their practitioner.
 *
 * Feels like entering an ongoing relationship, not opening software.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, AlertTriangle, ArrowLeft, Shield } from 'lucide-react';

interface ThreadMessage {
  id: string;
  sender_type: 'client' | 'practitioner' | 'system' | 'maia';
  channel_type: string;
  body: string;
  message_type: string | null;
  urgency: string;
  created_at: string;
}

export default function PortalThreadPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [practitionerName, setPractitionerName] = useState('');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch thread
  const fetchThread = useCallback(async () => {
    try {
      const res = await fetch(`/api/portal/${slug}/thread`, { credentials: 'include' });

      if (res.status === 401) {
        router.push(`/portal/${slug}/signin`);
        return;
      }

      if (!res.ok) {
        setError('Unable to load messages');
        return;
      }

      const data = await res.json();
      setThreadId(data.thread_id);
      setMessages(data.messages || []);
      setPractitionerName(data.practitioner_name || '');
      setError(null);
    } catch {
      setError('Connection issue — please try again');
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  // Initial load
  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  // Poll for new messages every 30s
  useEffect(() => {
    const interval = setInterval(fetchThread, 30000);
    return () => clearInterval(interval);
  }, [fetchThread]);

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Send message
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput('');

    // Optimistic update
    const optimistic: ThreadMessage = {
      id: `temp-${Date.now()}`,
      sender_type: 'client',
      channel_type: 'in_app',
      body: text,
      message_type: null,
      urgency: 'normal',
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const res = await fetch(`/api/portal/${slug}/thread`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ body: text }),
      });

      if (res.status === 401) {
        router.push(`/portal/${slug}/signin`);
        return;
      }

      if (!res.ok) {
        // Remove optimistic message on failure
        setMessages(prev => prev.filter(m => m.id !== optimistic.id));
        setInput(text); // Restore input
        return;
      }

      const data = await res.json();
      // Replace optimistic with real message
      setMessages(prev =>
        prev.map(m => m.id === optimistic.id ? { ...optimistic, id: data.message.id } : m)
      );
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setInput(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Handle Enter to send (Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format timestamp
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    if (isToday) return time;
    if (isYesterday) return `Yesterday ${time}`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` ${time}`;
  };

  // Channel label for non-portal messages
  const channelLabel = (msg: ThreadMessage) => {
    if (msg.channel_type === 'sms') return 'via SMS';
    if (msg.channel_type === 'email') return 'via email';
    if (msg.channel_type === 'voice') return 'call';
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: 'linear-gradient(180deg, #0D0B14 0%, #1A1625 50%, #0D0B14 100%)' }}>
        <div className="w-6 h-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-quicksand"
         style={{ background: 'linear-gradient(180deg, #0D0B14 0%, #1A1625 50%, #0D0B14 100%)' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[#3A3347]/50">
        <button
          onClick={() => router.push(`/portal/${slug}`)}
          className="p-1.5 rounded-lg text-[#9D8EC7] hover:bg-[#251F33] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-cinzel text-[#D4AF37]">
            {practitionerName}
          </h1>
          <p className="text-xs text-[#9D8EC7]">Secure message thread</p>
        </div>
        <Shield className="w-4 h-4 text-[#9D8EC7]/40" />
      </header>

      {/* ── Messages ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {error && (
          <div className="text-center py-8 text-[#9D8EC7]">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!error && messages.length === 0 && (
          <div className="text-center py-12 text-[#9D8EC7]/60">
            <p className="text-sm">This is your private space.</p>
            <p className="text-xs mt-1">Messages here are between you and {practitionerName || 'your practitioner'}.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isClient = msg.sender_type === 'client';
          const isSystem = msg.sender_type === 'system' || msg.sender_type === 'maia';
          const channel = channelLabel(msg);

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center">
                <span className="text-xs text-[#9D8EC7]/50 italic">{msg.body}</span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                isClient
                  ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/25'
                  : 'bg-[#1A1625] border border-[#3A3347]/50'
              }`}>
                <p className="text-sm text-[#F5F0FF] whitespace-pre-wrap leading-relaxed">
                  {msg.body}
                </p>
                <div className={`flex items-center gap-1.5 mt-1 ${isClient ? 'justify-end' : 'justify-start'}`}>
                  {channel && (
                    <span className="text-[10px] text-[#9D8EC7]/40">{channel}</span>
                  )}
                  <span className="text-[10px] text-[#9D8EC7]/30">
                    {formatTime(msg.created_at)}
                  </span>
                  {msg.urgency === 'safety_concern' && (
                    <AlertTriangle className="w-3 h-3 text-amber-400/60" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ──────────────────────────────────────────────── */}
      {threadId && (
        <div className="px-4 py-3 border-t border-[#3A3347]/50">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a message..."
              rows={1}
              className="flex-1 resize-none bg-[#251F33] text-[#F5F0FF] text-sm placeholder-[#9D8EC7]/40
                         border border-[#3A3347] rounded-xl px-4 py-2.5
                         focus:outline-none focus:border-[#D4AF37]/40
                         max-h-32 overflow-y-auto"
              style={{ minHeight: '42px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="p-2.5 rounded-xl transition-all disabled:opacity-30
                         bg-gradient-to-r from-[#D4AF37] to-[#C9A962]
                         hover:from-[#C9A962] hover:to-[#D4AF37]
                         text-[#0D0B14] font-medium"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-[#9D8EC7]/25 mt-1.5 text-center">
            Messages are private and encrypted. Not monitored 24/7.
          </p>
        </div>
      )}
    </div>
  );
}
