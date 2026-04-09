'use client';

/**
 * Idea workspace — single-idea continuity field
 *
 * This is where a member stays with one idea over time. Three block types:
 *   - note      → "Reflection"  (open notes, insights, iterations)
 *   - decision  → "Decision"    ("I'm choosing X")
 *   - change    → "Shift"       ("This evolved into...")
 *
 * Design constraints (from build approval):
 *   - No modals. Inline capture with no multi-step friction.
 *   - Decision strip at top: last 2–3 decision blocks immediately visible.
 *   - "Ask MAIA" seeds bounded context (title + framing + last 2–3 blocks +
 *     last decision), NOT the full history.
 *   - Internal block_type stays as-is. UI labels are softened.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MessageCircle,
  CheckCircle2,
  Wind,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { seedMaiaPrompt } from '@/lib/maia/seedPrompt';

// --- types -------------------------------------------------------------------

type BlockType = 'note' | 'decision' | 'change';

interface Block {
  id: string;
  block_type: BlockType;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface Idea {
  id: string;
  title: string;
  framing: string | null;
  status: 'active' | 'parked' | 'integrated';
  tags: string[];
  created_at: string;
  updated_at: string;
  last_entered_at: string;
  last_decision_at: string | null;
}

// --- UI labels (softer surface for internal block types) --------------------

const BLOCK_LABELS: Record<BlockType, string> = {
  note: 'Reflection',
  decision: 'Decision',
  change: 'Shift',
};

const BLOCK_STYLES: Record<
  BlockType,
  { icon: typeof MessageCircle; accent: string; border: string; bg: string; iconColor: string }
> = {
  note: {
    icon: MessageCircle,
    accent: 'text-amber-200/80',
    border: 'border-stone-800/60',
    bg: 'bg-stone-900/30',
    iconColor: 'text-stone-500',
  },
  decision: {
    icon: CheckCircle2,
    accent: 'text-emerald-300/90',
    border: 'border-emerald-500/25',
    bg: 'bg-emerald-500/5',
    iconColor: 'text-emerald-400/70',
  },
  change: {
    icon: Wind,
    accent: 'text-cyan-300/90',
    border: 'border-cyan-500/25',
    bg: 'bg-cyan-500/5',
    iconColor: 'text-cyan-400/70',
  },
};

// --- page -------------------------------------------------------------------

export default function IdeaWorkspacePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const ideaId = params?.id as string;

  const [idea, setIdea] = useState<Idea | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Header editing
  const [editingHeader, setEditingHeader] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftFraming, setDraftFraming] = useState('');

  // Inline block composer
  const [composing, setComposing] = useState<BlockType | null>(null);
  const [draftContent, setDraftContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load idea + blocks
  const loadIdea = useCallback(async () => {
    if (!ideaId) return;
    try {
      const res = await apiFetch(`/api/ideas/${ideaId}`);
      if (res.status === 404) {
        setError('Idea not found');
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError('Failed to load idea');
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setIdea(data.idea);
        setBlocks(data.blocks || []);
      }
    } catch (err) {
      console.error('[ideas/workspace] load failed:', err);
      setError('Failed to load idea');
    } finally {
      setLoading(false);
    }
  }, [ideaId]);

  useEffect(() => {
    loadIdea();
  }, [loadIdea]);

  // --- derived data ---------------------------------------------------------

  // Decision strip — last 2–3 decision blocks, newest first
  const recentDecisions = useMemo(
    () =>
      blocks
        .filter((b) => b.block_type === 'decision')
        .slice(-3)
        .reverse(),
    [blocks]
  );

  // Ask MAIA — bounded context. Title + framing + last 3 blocks + last decision.
  const buildAskMaiaPrompt = useCallback((): string => {
    if (!idea) return '';
    const parts: string[] = [];
    parts.push(`I'm developing an idea called "${idea.title}".`);
    if (idea.framing) {
      parts.push(idea.framing);
    }
    const lastBlocks = blocks.slice(-3);
    if (lastBlocks.length > 0) {
      parts.push('Recent entries:');
      for (const b of lastBlocks) {
        parts.push(`- [${BLOCK_LABELS[b.block_type]}] ${b.content}`);
      }
    }
    // If the most recent decision isn't already in lastBlocks, append it explicitly
    const lastDecision = blocks.filter((b) => b.block_type === 'decision').slice(-1)[0];
    if (lastDecision && !lastBlocks.some((b) => b.id === lastDecision.id)) {
      parts.push(`Most recent decision: ${lastDecision.content}`);
    }
    parts.push("Help me stay with it — I don't need you to summarize, just think alongside me.");
    return parts.join('\n\n');
  }, [idea, blocks]);

  const handleAskMaia = () => {
    if (!idea) return;
    const prompt = buildAskMaiaPrompt();
    seedMaiaPrompt({
      prompt,
      source: `ideas:workspace:${idea.id}`,
      sourceLabel: idea.title,
      returnTo: `/maia/ideas/${idea.id}`,
      tone: 'exploratory',
    });
    router.push('/maia');
  };

  // --- block composer -------------------------------------------------------

  const openComposer = (type: BlockType) => {
    setComposing(type);
    setDraftContent('');
  };

  const cancelComposer = () => {
    setComposing(null);
    setDraftContent('');
  };

  const submitBlock = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!composing || !idea) return;
    const content = draftContent.trim();
    if (!content) return;

    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/ideas/${idea.id}/blocks`, {
        method: 'POST',
        body: JSON.stringify({ block_type: composing, content }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.block) {
          setBlocks((prev) => [...prev, data.block]);
          // If it was a decision, update the idea's last_decision_at optimistically
          if (composing === 'decision') {
            setIdea((prev) =>
              prev ? { ...prev, last_decision_at: data.block.created_at } : prev
            );
          }
          setComposing(null);
          setDraftContent('');
        }
      }
    } catch (err) {
      console.error('[ideas/workspace] block submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBlock = async (blockId: string) => {
    if (!idea) return;
    try {
      const res = await apiFetch(`/api/ideas/${idea.id}/blocks/${blockId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      }
    } catch (err) {
      console.error('[ideas/workspace] delete block failed:', err);
    }
  };

  // --- header edit ----------------------------------------------------------

  const startEditHeader = () => {
    if (!idea) return;
    setDraftTitle(idea.title);
    setDraftFraming(idea.framing || '');
    setEditingHeader(true);
  };

  const cancelEditHeader = () => {
    setEditingHeader(false);
    setDraftTitle('');
    setDraftFraming('');
  };

  const saveHeader = async () => {
    if (!idea) return;
    const title = draftTitle.trim();
    if (!title) return;
    try {
      const res = await apiFetch(`/api/ideas/${idea.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title, framing: draftFraming.trim() || null }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.idea) {
          setIdea(data.idea);
          setEditingHeader(false);
        }
      }
    } catch (err) {
      console.error('[ideas/workspace] header save failed:', err);
    }
  };

  // --- render ---------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f1c] text-white flex items-center justify-center">
        <div className="w-5 h-5 border border-amber-500/30 border-t-amber-400/70 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen bg-[#0b0f1c] text-white p-6">
        <button
          onClick={() => router.push('/maia/ideas')}
          className="text-white/30 hover:text-white/60 flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} /> <span>Ideas</span>
        </button>
        <div className="max-w-2xl mx-auto text-center py-20">
          <p className="text-stone-500">{error || 'Idea not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#0b0f1c] text-white"
    >
      {/* Return threshold */}
      <div className="p-6">
        <button
          onClick={() => router.push('/maia/ideas')}
          className="text-white/30 hover:text-white/60 transition-colors duration-200 flex items-center gap-2 text-sm"
          aria-label="Back to Ideas"
        >
          <ArrowLeft size={16} />
          <span>Ideas</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-20">
        {/* Header — title + framing, inline editable */}
        {!editingHeader ? (
          <div className="group mb-6">
            <div className="flex items-start justify-between gap-4">
              <h1
                className="text-3xl text-amber-200 font-light leading-tight"
                style={{ fontFamily: 'Spectral, Georgia, serif' }}
              >
                {idea.title}
              </h1>
              <button
                onClick={startEditHeader}
                className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-amber-400/70 transition-all"
                aria-label="Edit idea"
              >
                <Edit3 size={14} />
              </button>
            </div>
            {idea.framing && (
              <p className="text-sm text-stone-400 mt-3 leading-relaxed whitespace-pre-wrap">
                {idea.framing}
              </p>
            )}
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-xl bg-stone-900/40 border border-amber-500/30">
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Idea title"
              className="w-full bg-transparent text-2xl text-amber-200 placeholder-stone-600 outline-none font-light border-b border-stone-700 pb-2 focus:border-amber-500/50 transition-colors"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
              maxLength={200}
              autoFocus
            />
            <textarea
              value={draftFraming}
              onChange={(e) => setDraftFraming(e.target.value)}
              placeholder="Short framing — what is this idea, in a few lines?"
              rows={3}
              className="w-full bg-transparent text-sm text-stone-300 placeholder-stone-600 outline-none font-light mt-3 resize-none leading-relaxed"
            />
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={saveHeader}
                disabled={!draftTitle.trim()}
                className="text-xs text-amber-300/90 hover:text-amber-300 disabled:text-stone-600 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              >
                <Check size={12} /> Save
              </button>
              <button
                onClick={cancelEditHeader}
                className="text-xs text-stone-500 hover:text-stone-400 transition-colors flex items-center gap-1.5"
              >
                <X size={12} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Decision strip — top 2–3 recent decisions, immediately visible */}
        {recentDecisions.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-[10px] uppercase tracking-wider text-emerald-500/60 font-medium mb-2">
              Recent decisions
            </p>
            <ul className="space-y-2">
              {recentDecisions.map((d) => (
                <li key={d.id} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-emerald-100/90 font-light leading-snug">
                    {d.content}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <QuickAction
            icon={MessageCircle}
            label="Reflection"
            active={composing === 'note'}
            onClick={() => openComposer('note')}
            accent="amber"
          />
          <QuickAction
            icon={CheckCircle2}
            label="Decision"
            active={composing === 'decision'}
            onClick={() => openComposer('decision')}
            accent="emerald"
          />
          <QuickAction
            icon={Wind}
            label="Shift"
            active={composing === 'change'}
            onClick={() => openComposer('change')}
            accent="cyan"
          />
          <div className="flex-1" />
          <button
            onClick={handleAskMaia}
            className="px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 transition-all text-xs text-amber-300/90 hover:text-amber-200 font-light flex items-center gap-2"
          >
            Ask MAIA
          </button>
        </div>

        {/* Inline composer */}
        <AnimatePresence>
          {composing && (
            <motion.form
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onSubmit={submitBlock}
              className={`mb-4 p-4 rounded-xl ${BLOCK_STYLES[composing].bg} border ${BLOCK_STYLES[composing].border}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const Icon = BLOCK_STYLES[composing].icon;
                  return <Icon className={`w-4 h-4 ${BLOCK_STYLES[composing].iconColor}`} />;
                })()}
                <span className={`text-[10px] uppercase tracking-wider ${BLOCK_STYLES[composing].accent} font-medium`}>
                  {BLOCK_LABELS[composing]}
                </span>
              </div>
              <textarea
                autoFocus
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder={
                  composing === 'note'
                    ? 'A note, an insight, something you want to return to...'
                    : composing === 'decision'
                    ? "I'm choosing... / I'm not doing... / I will try..."
                    : 'This changed... / This evolved into... / This didn\u2019t work...'
                }
                rows={3}
                maxLength={4000}
                className="w-full bg-transparent text-sm text-stone-200 placeholder-stone-600 outline-none font-light resize-none leading-relaxed"
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    submitBlock();
                  }
                  if (e.key === 'Escape') {
                    cancelComposer();
                  }
                }}
              />
              <div className="flex items-center gap-4 mt-2">
                <button
                  type="submit"
                  disabled={!draftContent.trim() || submitting}
                  className={`text-xs ${BLOCK_STYLES[composing].accent} hover:opacity-100 disabled:text-stone-600 disabled:cursor-not-allowed transition-colors`}
                >
                  {submitting ? 'Saving...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={cancelComposer}
                  className="text-xs text-stone-500 hover:text-stone-400 transition-colors"
                >
                  Cancel
                </button>
                <span className="text-[10px] text-stone-600 ml-auto">⌘↵ to save</span>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Thread — newest first so return-visits see the latest first */}
        {blocks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-stone-500 font-light">
              This idea is waiting for you.
            </p>
            <p className="text-xs text-stone-600 mt-1">
              Add a reflection, a decision, or a shift to begin.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {[...blocks].reverse().map((block) => {
              const style = BLOCK_STYLES[block.block_type];
              const Icon = style.icon;
              return (
                <li
                  key={block.id}
                  className={`group p-4 rounded-xl ${style.bg} border ${style.border}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 ${style.iconColor} mt-0.5 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-[10px] uppercase tracking-wider ${style.accent} font-medium`}>
                          {BLOCK_LABELS[block.block_type]}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-stone-600">
                            {formatTimeAgo(block.created_at)}
                          </span>
                          <button
                            onClick={() => deleteBlock(block.id)}
                            className="opacity-0 group-hover:opacity-100 text-stone-600 hover:text-red-400/70 transition-all"
                            aria-label="Delete block"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-stone-200 font-light leading-relaxed whitespace-pre-wrap">
                        {block.content}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

// --- quick action button ----------------------------------------------------

function QuickAction({
  icon: Icon,
  label,
  active,
  onClick,
  accent,
}: {
  icon: typeof MessageCircle;
  label: string;
  active: boolean;
  onClick: () => void;
  accent: 'amber' | 'emerald' | 'cyan';
}) {
  const colors = {
    amber: active
      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
      : 'bg-stone-900/40 border-stone-800/60 text-stone-400 hover:border-amber-500/30 hover:text-amber-300/80',
    emerald: active
      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200'
      : 'bg-stone-900/40 border-stone-800/60 text-stone-400 hover:border-emerald-500/30 hover:text-emerald-300/80',
    cyan: active
      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
      : 'bg-stone-900/40 border-stone-800/60 text-stone-400 hover:border-cyan-500/30 hover:text-cyan-300/80',
  }[accent];

  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg border transition-all text-xs font-light flex items-center gap-1.5 ${colors}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}

// --- time formatting --------------------------------------------------------

function formatTimeAgo(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString();
}
