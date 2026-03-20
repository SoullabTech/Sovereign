'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import type { MasterField } from '@/lib/masters/types';

interface NathanStudioProps {
  master: MasterField;
}

type MessageStatus = 'idle' | 'sending' | 'sent' | 'error';

function useSoulComms() {
  const [isPractitioner, setIsPractitioner] = useState(false);
  const [unread, setUnread] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('practitioner_context');
    if (stored) {
      try {
        const ctx = JSON.parse(stored);
        const valid = ctx.id && ctx.slug && !ctx.id.includes('demo') && !ctx.slug.includes('demo');
        setIsPractitioner(valid);
      } catch { /* ignore */ }
    }
    setReady(true);
  }, []);

  const fetchUnread = useCallback(async () => {
    if (!isPractitioner) return;
    try {
      const res = await fetch('/api/comms/inbox?count_only=true');
      if (res.ok) {
        const data = await res.json();
        setUnread(data.unread_count || 0);
      }
    } catch { /* ignore */ }
  }, [isPractitioner]);

  useEffect(() => {
    if (!isPractitioner) return;
    fetchUnread();
    const t = setInterval(fetchUnread, 60000);
    return () => clearInterval(t);
  }, [isPractitioner, fetchUnread]);

  return { isPractitioner, unread, ready };
}

export default function NathanStudio({ master }: NathanStudioProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<string>('idea');
  const [status, setStatus] = useState<MessageStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { isPractitioner, unread, ready } = useSoulComms();

  const categories = [
    { value: 'idea', label: 'Idea' },
    { value: 'architecture', label: 'Architecture Question' },
    { value: 'concern', label: 'Concern' },
    { value: 'insight', label: 'Insight' },
    { value: 'resource', label: 'Resource / Connection' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/fields/nathan/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), body: body.trim(), category }),
      });

      if (!res.ok) throw new Error('Send failed');

      setStatus('sent');
      setSubject('');
      setBody('');
      setCategory('idea');
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Try again or email directly.');
    }
  }

  return (
    <div
      className="min-h-screen px-6 py-16"
      style={{
        backgroundColor: master.palette.background,
        color: master.palette.text,
        fontFamily: 'var(--field-font-body)',
      }}
    >
      <div className="max-w-3xl mx-auto">

        {/* Soullab Branding Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/holoflower-amber.png"
              alt="Soullab"
              className="w-8 h-8 object-contain opacity-80"
            />
            <span
              className="text-xs tracking-widest uppercase opacity-50"
              style={{ color: master.palette.primary, letterSpacing: '0.2em' }}
            >
              Soullab
            </span>
          </div>
          <div className="flex items-center gap-3">
            {ready && isPractitioner && (
              <a
                href="/stellium/comms"
                className="relative flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: `${master.palette.primary}20`,
                  border: `1px solid ${master.palette.primary}40`,
                  color: master.palette.primary,
                }}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>SoulComms</span>
                {unread > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-semibold"
                    style={{ backgroundColor: master.palette.primary, color: master.palette.background }}
                  >
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </a>
            )}
            <a
              href={`/fields/${master.slug}`}
              className="text-xs opacity-40 hover:opacity-70 transition-opacity"
              style={{ color: master.palette.text }}
            >
              {master.shortName}&apos;s Field
            </a>
          </div>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1
            className="text-3xl font-light mb-3"
            style={{ fontFamily: 'var(--field-font-display)', color: master.palette.text }}
          >
            Studio
          </h1>
          <p className="text-base opacity-70 max-w-xl leading-relaxed">
            Your working space inside Soullab. Ask MAIA what is being built, where things stand,
            and how the system works. Send ideas, insights, and questions directly to the founder.
          </p>
        </div>

        {/* Two-column layout: MAIA + Founder Messaging */}
        <div className="grid gap-8 md:grid-cols-2">

          {/* MAIA Panel */}
          <div
            className="rounded-lg p-6 flex flex-col"
            style={{
              backgroundColor: `${master.palette.primary}12`,
              border: `1px solid ${master.palette.primary}30`,
            }}
          >
            <div className="mb-4">
              <div
                className="text-xs font-medium tracking-widest uppercase mb-2 opacity-60"
                style={{ color: master.palette.primary }}
              >
                MAIA
              </div>
              <h2 className="text-lg font-light" style={{ color: master.palette.text }}>
                Ask about the build
              </h2>
            </div>
            <p className="text-sm opacity-60 leading-relaxed mb-6">
              MAIA knows the current architecture, what features are live, what is in progress,
              and what the open design problems are. Ask directly — no curated summary.
            </p>
            <div className="mt-auto space-y-2">
              <p className="text-xs opacity-40 mb-3">Try asking:</p>
              {[
                'What is the current architecture of the oracle pipeline?',
                'What is the multi-tenancy decision we haven\'t made yet?',
                'How does Sanctuary mode actually work at the data layer?',
              ].map((prompt) => (
                <div
                  key={prompt}
                  className="text-xs opacity-50 pl-3 leading-relaxed"
                  style={{ borderLeft: `2px solid ${master.palette.primary}40` }}
                >
                  &ldquo;{prompt}&rdquo;
                </div>
              ))}
            </div>
            <a
              href={`/fields/${master.slug}/maia`}
              className="mt-6 inline-block text-center py-3 px-6 rounded text-sm font-medium transition-opacity hover:opacity-80"
              style={{
                backgroundColor: master.palette.primary,
                color: master.palette.background,
              }}
            >
              Open MAIA
            </a>
          </div>

          {/* Founder Messaging Panel */}
          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: `${master.palette.text}06`,
              border: `1px solid ${master.palette.text}15`,
            }}
          >
            <div className="mb-4">
              <div
                className="text-xs font-medium tracking-widest uppercase mb-2 opacity-60"
                style={{ color: master.palette.primary }}
              >
                Founder
              </div>
              <h2 className="text-lg font-light" style={{ color: master.palette.text }}>
                Send a message
              </h2>
            </div>
            <p className="text-sm opacity-60 leading-relaxed mb-5">
              Ideas, concerns, architectural questions, resources, connections. Direct line.
              Everything gets read.
            </p>

            {status === 'sent' ? (
              <div className="py-8 text-center">
                <div
                  className="text-sm font-medium mb-2"
                  style={{ color: master.palette.primary }}
                >
                  Sent.
                </div>
                <p className="text-xs opacity-50">Your message is in the founder&apos;s inbox.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-xs opacity-50 hover:opacity-80 underline"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category */}
                <div>
                  <label className="text-xs opacity-50 block mb-1">Type</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded outline-none"
                    style={{
                      backgroundColor: `${master.palette.text}08`,
                      border: `1px solid ${master.palette.text}20`,
                      color: master.palette.text,
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-xs opacity-50 block mb-1">Subject (optional)</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="One line"
                    className="w-full text-sm px-3 py-2 rounded outline-none"
                    style={{
                      backgroundColor: `${master.palette.text}08`,
                      border: `1px solid ${master.palette.text}20`,
                      color: master.palette.text,
                    }}
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="text-xs opacity-50 block mb-1">Message</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={5}
                    placeholder="What's on your mind?"
                    required
                    className="w-full text-sm px-3 py-2 rounded outline-none resize-none leading-relaxed"
                    style={{
                      backgroundColor: `${master.palette.text}08`,
                      border: `1px solid ${master.palette.text}20`,
                      color: master.palette.text,
                    }}
                  />
                </div>

                {status === 'error' && (
                  <p className="text-xs" style={{ color: '#E07070' }}>
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending' || !body.trim()}
                  className="w-full py-3 px-6 rounded text-sm font-medium transition-opacity disabled:opacity-40"
                  style={{
                    backgroundColor: master.palette.primary,
                    color: master.palette.background,
                  }}
                >
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* SoulComms Panel */}
        {ready && (
          <div
            className="mt-8 rounded-lg p-6"
            style={{
              backgroundColor: `${master.palette.primary}08`,
              border: `1px solid ${master.palette.primary}20`,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="w-4 h-4 opacity-60" style={{ color: master.palette.primary }} />
                <span
                  className="text-xs font-medium tracking-widest uppercase opacity-60"
                  style={{ color: master.palette.primary }}
                >
                  SoulComms
                </span>
              </div>
              {isPractitioner && unread > 0 && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: master.palette.primary, color: master.palette.background }}
                >
                  {unread} unread
                </span>
              )}
            </div>

            {isPractitioner ? (
              <div>
                <p className="text-sm opacity-60 leading-relaxed mb-4">
                  Threaded conversations with the team. Full context, reply history, and MAIA analysis — all in one place.
                </p>
                <a
                  href="/stellium/comms"
                  className="inline-flex items-center gap-2 text-sm py-2.5 px-5 rounded transition-opacity hover:opacity-80"
                  style={{ backgroundColor: master.palette.primary, color: master.palette.background }}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Open SoulComms
                </a>
              </div>
            ) : (
              <div>
                <p className="text-sm opacity-60 leading-relaxed mb-1">
                  Threaded platform communications — direct line to the founder and team, with full message history and MAIA context.
                </p>
                <p className="text-xs opacity-40 mt-3">
                  SoulComms access is enabled when your partner account is activated.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation footer */}
        <div className="mt-12 pt-8 flex gap-6 text-sm opacity-40 border-t" style={{ borderColor: `${master.palette.text}15` }}>
          <a href={`/fields/${master.slug}/systems`} className="hover:opacity-70 transition-opacity">
            Systems Layer
          </a>
          <a href={`/fields/${master.slug}/operator`} className="hover:opacity-70 transition-opacity">
            Platform View
          </a>
          <a href={`/fields/${master.slug}`} className="hover:opacity-70 transition-opacity">
            Field Home
          </a>
        </div>
      </div>
    </div>
  );
}
