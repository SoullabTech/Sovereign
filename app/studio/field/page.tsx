'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Wind,
  Scale,
  Zap,
  HelpCircle,
  Compass,
  Plus,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';

// Types

type ProcessItemType = 'challenge' | 'change' | 'decision' | 'breakthrough' | 'question' | 'next_edge';
type ProcessItemStatus = 'alive' | 'resolved' | 'released' | 'archived';
type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

interface ProcessItem {
  id: string;
  type: ProcessItemType;
  title: string;
  body?: string;
  element?: Element;
  status: ProcessItemStatus;
  urgency?: string;
  tags: string[];
  createdAt: string;
  occurredAt?: string;
  resolvedAt?: string;
}

interface ActiveChange {
  id: string;
  title: string;
  status: string;
  urgency?: string;
  createdAt: string;
}

interface ActiveDecision {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface FieldData {
  items: ProcessItem[];
  changes: ActiveChange[];
  decisions: ActiveDecision[];
}

// Helper functions

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Still night';
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 21) return 'Evening';
  return 'Night';
}

function getRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function getTypeIcon(type: ProcessItemType) {
  switch (type) {
    case 'challenge':
      return Shield;
    case 'change':
      return Wind;
    case 'decision':
      return Scale;
    case 'breakthrough':
      return Zap;
    case 'question':
      return HelpCircle;
    case 'next_edge':
      return Compass;
  }
}

const elementColors: Record<Element, string> = {
  fire: 'text-red-400 bg-red-950/30 border-red-900/50',
  water: 'text-blue-400 bg-blue-950/30 border-blue-900/50',
  earth: 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50',
  air: 'text-sky-400 bg-sky-950/30 border-sky-900/50',
  aether: 'text-purple-400 bg-purple-950/30 border-purple-900/50',
};

const typeColors: Record<ProcessItemType, string> = {
  challenge: 'text-orange-400 bg-orange-950/30 border-orange-900/50',
  change: 'text-cyan-400 bg-cyan-950/30 border-cyan-900/50',
  decision: 'text-amber-400 bg-amber-950/30 border-amber-900/50',
  breakthrough: 'text-purple-400 bg-purple-950/30 border-purple-900/50',
  question: 'text-sky-400 bg-sky-950/30 border-sky-900/50',
  next_edge: 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50',
};

// Main component

export default function FieldPage() {
  const [data, setData] = useState<FieldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [captureRecordId, setCaptureRecordId] = useState<string | null>(null);

  useEffect(() => {
    loadField();
  }, []);

  async function loadField() {
    try {
      setLoading(true);
      const response = await apiFetch('/api/studio/field');
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error('Failed to load field:', error);
    } finally {
      setLoading(false);
    }
  }

  const greeting = getGreeting();

  // Separate items by band
  const stillAlive = data?.items.filter(
    (item) =>
      item.status === 'alive' &&
      (item.type === 'question' || item.type === 'next_edge')
  ) || [];

  const whatMoved = data?.items.filter(
    (item) =>
      item.type === 'challenge' ||
      item.type === 'change' ||
      item.type === 'decision' ||
      item.type === 'breakthrough'
  ) || [];

  const hasActiveItems = (data?.changes?.length ?? 0) > 0 || (data?.decisions?.length ?? 0) > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-slate-400">Loading field...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-slate-500 text-xs tracking-widest uppercase mb-2">{greeting}</p>
          <h1 className="text-4xl font-light text-white mb-3">Field</h1>
          <p className="text-slate-400 text-lg">What wants attention?</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-12">
          <button
            onClick={() => setShowCaptureModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium">Capture</span>
          </button>
          <button
            onClick={() => setShowNameModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium">Name</span>
          </button>
        </div>

        {/* Band 1: Still Alive */}
        {stillAlive.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-light text-white mb-6">Still Alive</h2>
            <div className="space-y-3">
              {stillAlive.map((item) => (
                <ProcessItemCard
                  key={item.id}
                  item={item}
                  expanded={expandedItem === item.id}
                  onToggle={() =>
                    setExpandedItem(expandedItem === item.id ? null : item.id)
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Band 3: Active (Changes & Decisions) */}
        {hasActiveItems && (
          <div className="mb-16">
            <h2 className="text-xl font-light text-white mb-6">Active</h2>
            <div className="space-y-3">
              {data?.changes?.map((change) => (
                <ActiveChangeCard key={change.id} change={change} />
              ))}
              {data?.decisions?.map((decision) => (
                <ActiveDecisionCard key={decision.id} decision={decision} />
              ))}
            </div>
          </div>
        )}

        {/* Band 2: What Moved */}
        {whatMoved.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-light text-white mb-6">What Moved</h2>
            <div className="space-y-3">
              {whatMoved.map((item) => (
                <WhatMovedCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading &&
          stillAlive.length === 0 &&
          whatMoved.length === 0 &&
          !hasActiveItems && (
            <div className="text-center py-16">
              <p className="text-slate-400 text-lg mb-4">
                Your field is quiet.
              </p>
              <p className="text-slate-500 text-sm">
                Capture something, or name what&apos;s alive.
              </p>
            </div>
          )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCaptureModal && (
          <CaptureModal
            onClose={() => {
              setShowCaptureModal(false);
              setCaptureRecordId(null);
            }}
            onSaved={(recordId) => {
              setCaptureRecordId(recordId);
              setShowCaptureModal(false);
              setShowNameModal(true);
            }}
          />
        )}
        {showNameModal && (
          <NameModal
            onClose={() => {
              setShowNameModal(false);
              setCaptureRecordId(null);
            }}
            onSaved={() => {
              setShowNameModal(false);
              setCaptureRecordId(null);
              loadField();
            }}
            captureRecordId={captureRecordId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components

function ProcessItemCard({
  item,
  expanded,
  onToggle,
}: {
  item: ProcessItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = getTypeIcon(item.type);
  return (
    <motion.div
      layout
      className="rounded-lg bg-slate-900/50 border border-slate-800/60 overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/5 transition"
      >
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${typeColors[item.type]}`} />
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-medium mb-1">{item.title}</div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {item.element && (
              <span
                className={`px-2 py-0.5 rounded-full border ${elementColors[item.element]}`}
              >
                {item.element}
              </span>
            )}
            <span>{getRelativeTime(item.createdAt)}</span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {expanded && item.body && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-800/60"
          >
            <div className="p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {item.body}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WhatMovedCard({ item }: { item: ProcessItem }) {
  const Icon = getTypeIcon(item.type);
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/50 border border-slate-800/60">
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${typeColors[item.type]}`} />
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium mb-1">{item.title}</div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className={`px-2 py-0.5 rounded-full border ${typeColors[item.type]}`}>
            {item.type}
          </span>
          {item.element && (
            <span
              className={`px-2 py-0.5 rounded-full border ${elementColors[item.element]}`}
            >
              {item.element}
            </span>
          )}
          <span>{getRelativeTime(item.occurredAt || item.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

function ActiveChangeCard({ change }: { change: ActiveChange }) {
  return (
    <Link
      href={`/studio/changes/${change.id}`}
      className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/50 border border-slate-800/60 hover:bg-white/5 hover:border-white/10 transition group"
    >
      <Wind className="w-4 h-4 mt-0.5 flex-shrink-0 text-cyan-400" />
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium mb-1 group-hover:text-cyan-400 transition">
          {change.title}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-0.5 rounded-full border text-cyan-400 bg-cyan-950/30 border-cyan-900/50">
            Change
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/5">{change.status}</span>
          <span>{getRelativeTime(change.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

function ActiveDecisionCard({ decision }: { decision: ActiveDecision }) {
  return (
    <Link
      href={`/studio/decisions/${decision.id}`}
      className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/50 border border-slate-800/60 hover:bg-white/5 hover:border-white/10 transition group"
    >
      <Scale className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium mb-1 group-hover:text-amber-400 transition">
          {decision.title}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-0.5 rounded-full border text-amber-400 bg-amber-950/30 border-amber-900/50">
            Decision
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/5">{decision.status}</span>
          <span>{getRelativeTime(decision.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

// Modals

function CaptureModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (recordId: string) => void;
}) {
  const [observation, setObservation] = useState('');
  const [element, setElement] = useState<Element | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!observation.trim()) return;

    try {
      setSaving(true);
      const response = await apiFetch('/api/studio/field/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observation, element }),
      });
      const json = await response.json();
      if (json.record?.id) {
        onSaved(json.record.id);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to capture:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-light text-white">Capture</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <textarea
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          placeholder="What wants to be noticed?"
          className="w-full h-40 px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 resize-none"
          autoFocus
        />
        <div className="mt-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
            Element (optional)
          </p>
          <div className="flex gap-2">
            {(['fire', 'water', 'earth', 'air', 'aether'] as Element[]).map((el) => (
              <button
                key={el}
                onClick={() => setElement(element === el ? null : el)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                  element === el
                    ? elementColors[el]
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                {el}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={!observation.trim() || saving}
            className="flex-1 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function NameModal({
  onClose,
  onSaved,
  captureRecordId,
}: {
  onClose: () => void;
  onSaved: () => void;
  captureRecordId?: string | null;
}) {
  const [type, setType] = useState<ProcessItemType | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [element, setElement] = useState<Element | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!type || !title.trim()) return;

    try {
      setSaving(true);
      const response = await apiFetch('/api/studio/field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, body, element }),
      });
      if (response.ok) {
        onSaved();
      } else {
        alert('Failed to save. Please try again.');
      }
    } catch (error) {
      console.error('Failed to name:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const typeOptions: { type: ProcessItemType; label: string; icon: any }[] = [
    { type: 'challenge', label: 'Challenge', icon: Shield },
    { type: 'change', label: 'Change', icon: Wind },
    { type: 'decision', label: 'Decision', icon: Scale },
    { type: 'breakthrough', label: 'Breakthrough', icon: Zap },
    { type: 'question', label: 'Question', icon: HelpCircle },
    { type: 'next_edge', label: 'Next Edge', icon: Compass },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-light text-white">Name</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {captureRecordId && (
          <p className="text-sm text-slate-400 mb-4">Name this offering?</p>
        )}

        {/* Type selector */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Type</p>
          <div className="grid grid-cols-3 gap-2">
            {typeOptions.map(({ type: t, label, icon: Icon }) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition ${
                  type === t
                    ? typeColors[t]
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Title</p>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What is this?"
            className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
          />
        </div>

        {/* Body */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
            Body (optional)
          </p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Additional context..."
            className="w-full h-24 px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 resize-none"
          />
        </div>

        {/* Element */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
            Element (optional)
          </p>
          <div className="flex gap-2">
            {(['fire', 'water', 'earth', 'air', 'aether'] as Element[]).map((el) => (
              <button
                key={el}
                onClick={() => setElement(element === el ? null : el)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                  element === el
                    ? elementColors[el]
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                }`}
              >
                {el}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={!type || !title.trim() || saving}
            className="flex-1 px-4 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
