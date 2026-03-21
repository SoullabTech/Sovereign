'use client';

import { useState } from 'react';
import type { MasterField } from '@/lib/masters/types';
import {
  PLATFORM_BUILDS,
  ROADMAP,
  OPEN_DECISIONS,
  RECENT_INNOVATIONS,
  type BuildStatus,
} from '@/lib/masters/nathan-platform';

interface NathanOperatorProps {
  master: MasterField;
}

type Tab = 'builds' | 'roadmap' | 'decisions' | 'innovations' | 'focus';

const STATUS_LABELS: Record<BuildStatus, string> = {
  live: 'Live',
  'in-progress': 'In Progress',
  planned: 'Planned',
  blocked: 'Blocked',
};

const STATUS_COLORS: Record<BuildStatus, string> = {
  live: '#6FCF97',
  'in-progress': '#F2C94C',
  planned: '#828282',
  blocked: '#EB5757',
};

const HORIZON_LABELS = { now: 'Now', next: 'Next', later: 'Later' };

interface FocusItem {
  id: string;
  title: string;
  note: string;
  addedAt: string;
  sent: boolean;
}

function useFocusItems() {
  const [items, setItems] = useState<FocusItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('nathan_focus_items') ?? '[]');
    } catch {
      return [];
    }
  });

  const add = (title: string, note: string) => {
    const item: FocusItem = {
      id: Date.now().toString(),
      title,
      note,
      addedAt: new Date().toISOString().slice(0, 10),
      sent: false,
    };
    const next = [item, ...items];
    setItems(next);
    localStorage.setItem('nathan_focus_items', JSON.stringify(next));
    return item;
  };

  const markSent = (id: string) => {
    const next = items.map((i) => (i.id === id ? { ...i, sent: true } : i));
    setItems(next);
    localStorage.setItem('nathan_focus_items', JSON.stringify(next));
  };

  const remove = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    localStorage.setItem('nathan_focus_items', JSON.stringify(next));
  };

  return { items, add, markSent, remove };
}

// Inline dialogue form shown per item
function DialogueForm({
  itemName,
  category,
  palette,
  onClose,
}: {
  itemName: string;
  category: string;
  palette: MasterField['palette'];
  onClose: () => void;
}) {
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const send = async () => {
    if (!body.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/fields/nathan/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          subject: `Re: ${itemName}`,
          body: body.trim(),
        }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="mt-3 p-3 rounded text-sm opacity-60" style={{ color: palette.primary }}>
        Message sent to Kelly. ✓
        <button onClick={onClose} className="ml-3 underline text-xs opacity-60">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 border-t pt-3" style={{ borderColor: `${palette.text}15` }}>
      <p className="text-xs opacity-40 mb-2">Your thoughts on this — goes directly to Kelly.</p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What's your read on this?"
        rows={3}
        className="w-full text-sm rounded p-2 resize-none outline-none"
        style={{
          backgroundColor: `${palette.text}08`,
          border: `1px solid ${palette.text}15`,
          color: palette.text,
        }}
      />
      <div className="flex gap-2 mt-2 justify-end">
        <button
          onClick={onClose}
          className="text-xs opacity-40 hover:opacity-70 transition-opacity px-3 py-1"
        >
          Cancel
        </button>
        <button
          onClick={send}
          disabled={status === 'sending' || !body.trim()}
          className="text-xs px-4 py-1.5 rounded transition-opacity"
          style={{
            backgroundColor: palette.primary,
            color: palette.background,
            opacity: !body.trim() || status === 'sending' ? 0.5 : 1,
          }}
        >
          {status === 'sending' ? 'Sending…' : status === 'error' ? 'Error — retry' : 'Send'}
        </button>
      </div>
    </div>
  );
}

export default function NathanOperator({ master }: NathanOperatorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('builds');
  const [openDialogue, setOpenDialogue] = useState<string | null>(null);
  const focus = useFocusItems();

  // Needs Focus form state
  const [focusTitle, setFocusTitle] = useState('');
  const [focusNote, setFocusNote] = useState('');
  const [focusSending, setFocusSending] = useState(false);
  const [focusSent, setFocusSent] = useState<string | null>(null);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'builds', label: 'Builds', count: PLATFORM_BUILDS.length },
    { id: 'roadmap', label: 'Roadmap', count: ROADMAP.length },
    { id: 'decisions', label: 'Open Decisions', count: OPEN_DECISIONS.length },
    { id: 'innovations', label: 'Innovations', count: RECENT_INNOVATIONS.length },
    { id: 'focus', label: 'Needs Focus', count: focus.items.length || undefined },
  ];

  const liveCount = PLATFORM_BUILDS.filter((b) => b.status === 'live').length;
  const inProgressCount = PLATFORM_BUILDS.filter((b) => b.status === 'in-progress').length;

  const toggleDialogue = (id: string) =>
    setOpenDialogue((prev) => (prev === id ? null : id));

  const addFocusItem = async () => {
    if (!focusTitle.trim()) return;
    setFocusSending(true);
    const item = focus.add(focusTitle.trim(), focusNote.trim());
    try {
      const res = await fetch('/api/fields/nathan/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'Concern',
          subject: `Needs Focus: ${item.title}`,
          body: item.note || '(No additional notes)',
        }),
      });
      if (res.ok) focus.markSent(item.id);
      setFocusSent(item.id);
      setFocusTitle('');
      setFocusNote('');
    } catch {
      // item still saved locally
    }
    setFocusSending(false);
  };

  const DiscussButton = ({ id, name, category }: { id: string; name: string; category: string }) => (
    <div>
      <button
        onClick={() => toggleDialogue(`${id}`)}
        className="text-xs opacity-40 hover:opacity-70 transition-opacity mt-2"
        style={{ color: master.palette.primary }}
      >
        {openDialogue === id ? '↑ Close' : '↓ Discuss'}
      </button>
      {openDialogue === id && (
        <DialogueForm
          itemName={name}
          category={category}
          palette={master.palette}
          onClose={() => setOpenDialogue(null)}
        />
      )}
    </div>
  );

  return (
    <div
      className="min-h-screen px-6 py-16"
      style={{
        backgroundColor: master.palette.background,
        color: master.palette.text,
        fontFamily: 'var(--field-font-body)',
      }}
    >
      <div className="max-w-4xl mx-auto">

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
          <a
            href={`/fields/${master.slug}`}
            className="text-xs opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: master.palette.text }}
          >
            {master.shortName}&apos;s Field
          </a>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-3xl font-light mb-3"
            style={{ fontFamily: 'var(--field-font-display)', color: master.palette.text }}
          >
            Platform View
          </h1>
          <p className="text-base opacity-60 max-w-xl leading-relaxed">
            Current build state, roadmap, open architectural decisions, and recent innovations.
            This is what is actually happening inside Soullab.
          </p>
        </div>

        {/* Status Bar */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 p-4 rounded-lg"
          style={{ backgroundColor: `${master.palette.text}06`, border: `1px solid ${master.palette.text}12` }}
        >
          <div className="text-center">
            <div className="text-2xl font-light" style={{ color: STATUS_COLORS.live }}>{liveCount}</div>
            <div className="text-xs opacity-50 mt-1">Live</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-light" style={{ color: STATUS_COLORS['in-progress'] }}>{inProgressCount}</div>
            <div className="text-xs opacity-50 mt-1">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-light" style={{ color: STATUS_COLORS.planned }}>
              {ROADMAP.filter((r) => r.status === 'planned').length}
            </div>
            <div className="text-xs opacity-50 mt-1">Planned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-light" style={{ color: master.palette.primary }}>{OPEN_DECISIONS.length}</div>
            <div className="text-xs opacity-50 mt-1">Open Decisions</div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex flex-wrap gap-1 mb-6 p-1 rounded-lg"
          style={{ backgroundColor: `${master.palette.text}08` }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2 px-3 rounded text-sm transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? master.palette.primary : 'transparent',
                color: activeTab === tab.id ? master.palette.background : master.palette.text,
                opacity: activeTab === tab.id ? 1 : 0.6,
                minWidth: '80px',
              }}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-1 opacity-60 text-xs">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* BUILDS TAB */}
        {activeTab === 'builds' && (
          <div className="space-y-3">
            {(['live', 'in-progress', 'planned', 'blocked'] as BuildStatus[]).map((status) => {
              const items = PLATFORM_BUILDS.filter((b) => b.status === status);
              if (!items.length) return null;
              return (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] }} />
                    <span className="text-xs font-medium tracking-widest uppercase opacity-50">
                      {STATUS_LABELS[status]}
                    </span>
                  </div>
                  <div className="space-y-2 ml-4">
                    {items.map((build) => (
                      <div
                        key={build.id}
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: `${master.palette.text}06`,
                          border: `1px solid ${master.palette.text}10`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <h3 className="text-sm font-medium">{build.name}</h3>
                          <span
                            className="text-xs px-2 py-0.5 rounded shrink-0"
                            style={{
                              backgroundColor: `${STATUS_COLORS[build.status]}18`,
                              color: STATUS_COLORS[build.status],
                            }}
                          >
                            {build.category}
                          </span>
                        </div>
                        <p className="text-sm opacity-55 leading-relaxed">{build.description}</p>
                        {build.shippedAt && (
                          <p className="text-xs opacity-30 mt-2">Shipped {build.shippedAt}</p>
                        )}
                        <DiscussButton id={build.id} name={build.name} category="Architecture Question" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ROADMAP TAB */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            {(['now', 'next', 'later'] as const).map((horizon) => {
              const items = ROADMAP.filter((r) => r.horizon === horizon);
              if (!items.length) return null;
              return (
                <div key={horizon}>
                  <div className="text-xs font-medium tracking-widest uppercase opacity-40 mb-3">
                    {HORIZON_LABELS[horizon]}
                  </div>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-lg"
                        style={{
                          backgroundColor: `${master.palette.text}06`,
                          border: `1px solid ${master.palette.text}10`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-sm font-medium">{item.name}</h3>
                          <span
                            className="text-xs px-2 py-0.5 rounded shrink-0"
                            style={{
                              backgroundColor: `${STATUS_COLORS[item.status]}18`,
                              color: STATUS_COLORS[item.status],
                            }}
                          >
                            {STATUS_LABELS[item.status]}
                          </span>
                        </div>
                        <p className="text-sm opacity-55 leading-relaxed mb-2">{item.description}</p>
                        <div
                          className="text-xs opacity-50 pl-3 leading-relaxed"
                          style={{ borderLeft: `2px solid ${master.palette.primary}40` }}
                        >
                          Why: {item.why}
                        </div>
                        <DiscussButton id={item.id} name={item.name} category="Architecture Question" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* OPEN DECISIONS TAB */}
        {activeTab === 'decisions' && (
          <div className="space-y-4">
            <p className="text-sm opacity-50 mb-4 leading-relaxed">
              These are real structural questions with no settled answer yet.
              Each one has options on the table. Where they land will shape the next 12 months.
            </p>
            {OPEN_DECISIONS.map((decision) => (
              <div
                key={decision.id}
                className="p-5 rounded-lg"
                style={{
                  backgroundColor: `${master.palette.text}06`,
                  border: `1px solid ${master.palette.primary}25`,
                }}
              >
                <h3 className="text-sm font-medium mb-3" style={{ color: master.palette.text }}>
                  {decision.question}
                </h3>
                <p className="text-sm opacity-55 leading-relaxed mb-3">{decision.context}</p>
                <div
                  className="text-xs opacity-50 pl-3 leading-relaxed mb-4"
                  style={{ borderLeft: `2px solid #EB575760` }}
                >
                  Constraint: {decision.constraint}
                </div>
                <div className="space-y-1 mb-2">
                  {decision.options.map((opt, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm opacity-60">
                      <span style={{ color: master.palette.primary }} className="shrink-0 mt-0.5">→</span>
                      {opt}
                    </div>
                  ))}
                </div>
                {decision.blocking && (
                  <div className="mt-3 text-xs opacity-40">Blocking: {decision.blocking}</div>
                )}
                <DiscussButton id={decision.id} name={decision.question} category="Architecture Question" />
              </div>
            ))}
          </div>
        )}

        {/* INNOVATIONS TAB */}
        {activeTab === 'innovations' && (
          <div className="space-y-3">
            {RECENT_INNOVATIONS.map((innovation) => (
              <div
                key={innovation.id}
                className="p-5 rounded-lg"
                style={{
                  backgroundColor: `${master.palette.text}06`,
                  border: `1px solid ${master.palette.text}10`,
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-sm font-medium">{innovation.name}</h3>
                  <span className="text-xs opacity-30 shrink-0">{innovation.shippedAt}</span>
                </div>
                <p className="text-sm opacity-55 leading-relaxed mb-3">{innovation.description}</p>
                <div
                  className="text-xs opacity-60 pl-3 leading-relaxed"
                  style={{ borderLeft: `2px solid ${master.palette.primary}50` }}
                >
                  Why it matters: {innovation.significance}
                </div>
                <DiscussButton id={innovation.id} name={innovation.name} category="Idea" />
              </div>
            ))}
          </div>
        )}

        {/* NEEDS FOCUS TAB */}
        {activeTab === 'focus' && (
          <div className="space-y-6">
            {/* Add new focus item */}
            <div
              className="p-5 rounded-lg"
              style={{
                backgroundColor: `${master.palette.primary}10`,
                border: `1px solid ${master.palette.primary}30`,
              }}
            >
              <h3 className="text-sm font-medium mb-1" style={{ color: master.palette.primary }}>
                Flag something for attention
              </h3>
              <p className="text-xs opacity-50 mb-4">
                Add anything that needs focus — a question, a risk, something you noticed. Goes to Kelly immediately.
              </p>
              <input
                type="text"
                value={focusTitle}
                onChange={(e) => setFocusTitle(e.target.value)}
                placeholder="What needs attention?"
                className="w-full text-sm rounded p-2 mb-2 outline-none"
                style={{
                  backgroundColor: `${master.palette.text}08`,
                  border: `1px solid ${master.palette.text}15`,
                  color: master.palette.text,
                }}
              />
              <textarea
                value={focusNote}
                onChange={(e) => setFocusNote(e.target.value)}
                placeholder="Any context or notes (optional)"
                rows={2}
                className="w-full text-sm rounded p-2 mb-3 resize-none outline-none"
                style={{
                  backgroundColor: `${master.palette.text}08`,
                  border: `1px solid ${master.palette.text}15`,
                  color: master.palette.text,
                }}
              />
              <button
                onClick={addFocusItem}
                disabled={focusSending || !focusTitle.trim()}
                className="text-sm px-5 py-2 rounded transition-opacity"
                style={{
                  backgroundColor: master.palette.primary,
                  color: master.palette.background,
                  opacity: !focusTitle.trim() || focusSending ? 0.5 : 1,
                }}
              >
                {focusSending ? 'Sending…' : 'Flag for Focus'}
              </button>
              {focusSent && (
                <p className="text-xs mt-2" style={{ color: master.palette.primary, opacity: 0.7 }}>
                  Added and sent to Kelly. ✓
                </p>
              )}
            </div>

            {/* Existing focus items */}
            {focus.items.length === 0 ? (
              <p className="text-sm opacity-40 text-center py-8">
                No focus items yet. Flag anything that needs attention above.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-xs opacity-40 uppercase tracking-widest">Your flags</p>
                {focus.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: `${master.palette.text}06`,
                      border: `1px solid ${master.palette.text}10`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        {item.note && (
                          <p className="text-sm opacity-50 mt-1 leading-relaxed">{item.note}</p>
                        )}
                        <p className="text-xs opacity-30 mt-2">
                          {item.addedAt} · {item.sent ? 'Sent to Kelly ✓' : 'Saved locally'}
                        </p>
                      </div>
                      <button
                        onClick={() => focus.remove(item.id)}
                        className="text-xs opacity-30 hover:opacity-60 transition-opacity shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer nav */}
        <div
          className="mt-12 pt-8 flex gap-6 text-sm opacity-40 border-t"
          style={{ borderColor: `${master.palette.text}15` }}
        >
          <a href={`/fields/${master.slug}/studio`} className="hover:opacity-70 transition-opacity">Studio</a>
          <a href={`/fields/${master.slug}/systems`} className="hover:opacity-70 transition-opacity">Systems Layer</a>
          <a href={`/fields/${master.slug}`} className="hover:opacity-70 transition-opacity">Field Home</a>
        </div>
      </div>
    </div>
  );
}
