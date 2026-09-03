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
 *   - No modals. Inline capture, no multi-step friction.
 *   - Decision strip at top: last 2–3 decisions immediately visible AND clickable.
 *     Clicking scrolls to the block in the thread and briefly highlights it.
 *   - Decisions carry a "Mark as tested" micro-action (metadata.tested).
 *   - Shift blocks carry an optional outcome (metadata.outcome) captured inline.
 *   - "Current direction" line near the top, derived from the last block.
 *   - "Return to this" button: fires a touch ping, opens composer with smart
 *     default (Shift after Decision; Reflection otherwise), scrolls to composer.
 *   - "Ask MAIA" seeds bounded context — title + framing + last decision + last
 *     2 blocks + "help me with what to do next here." Never the full history.
 *   - Internal block_type is unchanged. UI labels are softened (Reflection / Shift).
 *
 * Guardrails held: no lifecycle states, no tagging UI, no cross-idea linking,
 * no scoring, no frameworks. Everything inline and reversible.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMaiaPlace } from '@/components/maia/presence/MaiaPresence';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MessageCircle,
  CheckCircle2,
  Wind,
  Sparkles,
  Trash2,
  Edit3,
  Check,
  X,
  RotateCcw,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  IDEA_STANCES,
  STANCE_LABELS,
  STANCE_DESCRIPTIONS,
  type IdeaStance,
} from '@/lib/maia/ideaStances';

// --- types -------------------------------------------------------------------

// Member-authored block types + the server-written 'maia_reflection'.
// Only the three member types are writable via /api/ideas/[id]/blocks.
// 'maia_reflection' is written exclusively by /api/ideas/[id]/ask-maia.
type BlockType = 'note' | 'decision' | 'change' | 'maia_reflection';

type Outcome = 'worked' | 'partly' | 'didnt' | 'unsure';

// MAIA Decision/Change recognition metadata, attached to maia_reflection blocks
// when the ask-maia route detects a commitment or shift signal. Server sets
// this via process.env.FEATURE_MAIA_IDEAS_DECISION_RECOGNITION; client simply
// renders what the metadata contains. Presence = feature is active for this row.
interface RecognitionMetadata {
  kind: 'decision' | 'change';
  strength: 'medium' | 'strong';
  naming_line: string;
  offer_invitation: boolean;
  xy?: { x: string; y: string };
}

interface BlockMetadata {
  outcome?: Outcome;
  tested?: boolean;
  // Capture metadata from the conversation toast flow — see /api/ideas/capture
  source?: string;
  capture_mode?: string;
  conversationId?: string | null;
  confidence?: number | null;
  // MAIA-mediated recognition (present on maia_reflection blocks only)
  recognition?: RecognitionMetadata;
  // Room for later symbolic attachments: hexagram, toolInvocation, councilSessionId
  [key: string]: unknown;
}

interface Block {
  id: string;
  block_type: BlockType;
  content: string;
  metadata: BlockMetadata;
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
  maia_reflection: 'MAIA',
};

const OUTCOME_LABELS: Record<Outcome, string> = {
  worked: 'Worked',
  partly: 'Partly worked',
  didnt: "Didn't work",
  unsure: 'Not sure',
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
  // MAIA reflections: muted amber, lighter weight than member blocks.
  // The label renders as a small uppercase "MAIA" badge via BLOCK_LABELS.
  maia_reflection: {
    icon: Sparkles,
    accent: 'text-amber-300/70',
    border: 'border-amber-500/15',
    bg: 'bg-amber-500/[0.03]',
    iconColor: 'text-amber-400/50',
  },
};

// --- page -------------------------------------------------------------------

export default function IdeaWorkspacePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const ideaId = params?.id as string;
  // 🚪 House Presence: declarative place facts (id only — never contents).
  useMaiaPlace({
    placeId: 'ideas',
    placeName: 'Ideas',
    purpose: 'A room for capturing and developing emerging thoughts.',
    objectType: 'idea',
    objectId: ideaId,
  });

  const [idea, setIdea] = useState<Idea | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Header editing
  const [editingHeader, setEditingHeader] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftFraming, setDraftFraming] = useState('');

  // Persistent composer — always visible at the bottom of the thread.
  // Default save type is 'note'; conversion to decision/shift happens
  // post-hoc via the Convert actions on the just-saved block.
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  // Transient highlight on a block (triggered by decision-strip click)
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null);

  // Tracks the most recent user-authored note so Convert actions render on it.
  // Not updated when MAIA reflections arrive — MAIA blocks don't carry conversion.
  // The `block_type === 'note'` render guard cleans up implicitly after conversion.
  const [lastCreatedBlockId, setLastCreatedBlockId] = useState<string | null>(null);

  // Composer focus target. Ask MAIA and Save both refocus after success so
  // the page reads as 'thought continues here', not 'choose your next operation'.
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  // --- load ----------------------------------------------------------------

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

  // --- derived data --------------------------------------------------------

  // Decision strip — last 2–3 decision blocks, newest first
  const recentDecisions = useMemo(
    () =>
      blocks
        .filter((b) => b.block_type === 'decision')
        .slice(-3)
        .reverse(),
    [blocks]
  );

  // Current direction line — derived from the MOST RECENT member-authored
  // block. MAIA reflections are skipped (a reflection is not a direction).
  //   last = Decision → show the decision as the current direction
  //   last = Shift    → show the shift content with its outcome (if set)
  //   else            → don't show
  const currentDirection = useMemo(() => {
    const memberBlocks = blocks.filter((b) => b.block_type !== 'maia_reflection');
    if (memberBlocks.length === 0) return null;
    const last = memberBlocks[memberBlocks.length - 1];
    if (last.block_type === 'decision') {
      return { content: last.content, outcome: null as string | null };
    }
    if (last.block_type === 'change') {
      const outcome = last.metadata?.outcome;
      return {
        content: last.content,
        outcome: outcome ? OUTCOME_LABELS[outcome] : null,
      };
    }
    return null;
  }, [blocks]);

  // Ask MAIA — in-thread, single-shot. The server composes the context
  // (title + framing + last decision + last 3–4 blocks), calls the
  // Haiku-backed primitive, and persists a `maia_reflection` block.
  // The member does not author the prompt.
  const [askingMaia, setAskingMaia] = useState(false);
  // Relational stance for the NEXT Ask MAIA only. Cleared after every response —
  // there is no sticky mode.
  const [stance, setStance] = useState<IdeaStance | null>(null);

  const handleAskMaia = useCallback(async () => {
    if (!idea || askingMaia || saving) return;
    setAskingMaia(true);
    try {
      // Autosave-on-Ask-MAIA (2026-04-22):
      // If the composer has pending draft text, save it as a note first so
      // MAIA reflects on the just-written thought. This matches user
      // expectation ("Ask MAIA = respond to what I just wrote") while
      // preserving the block model — MAIA still reads saved notes only,
      // never raw draft state. If the save fails, abort Ask MAIA so the
      // user's thought stays in the composer and they can retry.
      const pendingDraft = draft.trim();
      if (pendingDraft) {
        const saveRes = await apiFetch(`/api/ideas/${idea.id}/blocks`, {
          method: 'POST',
          body: JSON.stringify({
            block_type: 'note',
            content: pendingDraft,
            metadata: {},
          }),
        });
        if (!saveRes.ok) {
          console.error(
            '[ideas/workspace] autosave before ask-maia failed:',
            saveRes.status
          );
          return;
        }
        const saveData = await saveRes.json();
        if (saveData.success && saveData.block) {
          setBlocks((prev) => [...prev, saveData.block]);
          setLastCreatedBlockId(saveData.block.id);
          setDraft('');
        } else {
          // Unexpected success=false; abort rather than proceeding on stale state
          return;
        }
      }

      const res = await apiFetch(`/api/ideas/${idea.id}/ask-maia`, {
        method: 'POST',
        // Stance is sent for this turn only. Plain Ask MAIA sends none and
        // behaves exactly as it did before stances existed.
        body: JSON.stringify(stance ? { stance } : {}),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.block) {
          setBlocks((prev) => [...prev, data.block]);
          // lastCreatedBlockId is intentionally NOT updated — MAIA blocks
          // don't carry Convert actions, and the prior note's Convert
          // actions should remain visible so the thought can still be
          // structured after MAIA responds.
        }
      }
    } catch (err) {
      console.error('[ideas/workspace] ask-maia failed:', err);
    } finally {
      setAskingMaia(false);
      // The stance governed one response. It clears — no sticky mode, hidden
      // or otherwise. The next Ask MAIA starts from no stance again.
      setStance(null);
      // Refocus the composer so the user continues naturally after MAIA.
      window.setTimeout(() => composerRef.current?.focus(), 0);
    }
  }, [idea, askingMaia, saving, draft, stance]);

  // --- block composer -------------------------------------------------------

  // Save the current draft as a default 'note' block. Structuring
  // (decision/shift) happens post-hoc via Convert actions on the
  // just-saved block, so the user never classifies before thinking.
  const handleSaveNote = useCallback(async () => {
    if (!idea || saving) return;
    const content = draft.trim();
    if (!content) return;

    setSaving(true);
    try {
      const res = await apiFetch(`/api/ideas/${idea.id}/blocks`, {
        method: 'POST',
        body: JSON.stringify({ block_type: 'note', content, metadata: {} }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.block) {
          setBlocks((prev) => [...prev, data.block]);
          setLastCreatedBlockId(data.block.id);
          setDraft('');
          // Refocus so the cursor stays in the flow
          window.setTimeout(() => composerRef.current?.focus(), 0);
        }
      }
    } catch (err) {
      console.error('[ideas/workspace] save note failed:', err);
    } finally {
      setSaving(false);
    }
  }, [idea, saving, draft]);

  // Convert a note block in place → decision or shift. The PATCH endpoint
  // enforces that only 'note' blocks may be converted, and only to
  // 'decision' or 'change'. MAIA reflections are never convertible.
  const convertBlock = useCallback(
    async (blockId: string, toType: 'decision' | 'change') => {
      if (!idea) return;
      try {
        const res = await apiFetch(`/api/ideas/${idea.id}/blocks/${blockId}`, {
          method: 'PATCH',
          body: JSON.stringify({ block_type: toType }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.block) {
            setBlocks((prev) =>
              prev.map((b) =>
                b.id === blockId
                  ? { ...b, block_type: data.block.block_type, metadata: data.block.metadata }
                  : b
              )
            );
            if (toType === 'decision') {
              setIdea((prev) =>
                prev ? { ...prev, last_decision_at: data.block.created_at } : prev
              );
            }
          }
        }
      } catch (err) {
        console.error('[ideas/workspace] convert block failed:', err);
      }
    },
    [idea]
  );

  // Tracks which maia_reflection block's accept is in-flight (for button
  // disabled state + preventing double-click duplicates).
  const [acceptingRecognitionFor, setAcceptingRecognitionFor] = useState<string | null>(null);

  // MAIA recognition acceptance — member clicked "Save as Decision" or
  // "Mark as Change" on a MAIA reflection.
  //
  // Extraction rule (v1, locked): use the full most-recent member block
  // (before the triggering maia_reflection) as the created object's body.
  // No trimming, no rewriting, no sentence extraction. The member's text
  // passes through unchanged. For Change, xy stays in metadata only.
  //
  // Authorship: the member's click is the closure. No MAIA text enters
  // the created object's content.
  const handleAcceptRecognition = useCallback(
    async (maiaBlock: Block) => {
      if (!idea || acceptingRecognitionFor) return;
      const recognition = maiaBlock.metadata?.recognition;
      if (!recognition || !recognition.offer_invitation) return;

      // Find the most recent member-authored block before this maia_reflection.
      // blocks is chronological; walk back from maiaBlock's position.
      const maiaIdx = blocks.findIndex((b) => b.id === maiaBlock.id);
      if (maiaIdx === -1) return;
      const sourceBlock = [...blocks.slice(0, maiaIdx)]
        .reverse()
        .find((b) => b.block_type !== 'maia_reflection');
      if (!sourceBlock) return;

      const newBlockType: 'decision' | 'change' =
        recognition.kind === 'change' ? 'change' : 'decision';

      const createMetadata: Record<string, unknown> = {
        source: 'maia_recognition',
        source_block_id: sourceBlock.id,
        maia_reflection_block_id: maiaBlock.id,
        recognition_kind: recognition.kind,
        recognition_strength: recognition.strength,
      };
      if (recognition.kind === 'change' && recognition.xy) {
        createMetadata.xy = recognition.xy;
      }

      setAcceptingRecognitionFor(maiaBlock.id);
      try {
        const res = await apiFetch(`/api/ideas/${idea.id}/blocks`, {
          method: 'POST',
          body: JSON.stringify({
            block_type: newBlockType,
            content: sourceBlock.content, // full block body, unchanged
            metadata: createMetadata,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.block) {
            setBlocks((prev) => {
              const withNewBlock = [...prev, data.block];
              // Clear offer_invitation on the source maia_reflection so the
              // button doesn't re-render; the object has been created.
              return withNewBlock.map((b) =>
                b.id === maiaBlock.id && b.metadata?.recognition
                  ? {
                      ...b,
                      metadata: {
                        ...b.metadata,
                        recognition: {
                          ...b.metadata.recognition,
                          offer_invitation: false,
                        },
                      },
                    }
                  : b
              );
            });
            if (newBlockType === 'decision') {
              setIdea((prev) =>
                prev ? { ...prev, last_decision_at: data.block.created_at } : prev
              );
            }
          }
        }
      } catch (err) {
        console.error('[recognition] accept failed:', err);
      } finally {
        setAcceptingRecognitionFor(null);
      }
    },
    [idea, blocks, acceptingRecognitionFor]
  );

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

  // Mark a decision block as "tested" — PATCH metadata.tested = true
  const markAsTested = async (blockId: string) => {
    if (!idea) return;
    try {
      const res = await apiFetch(`/api/ideas/${idea.id}/blocks/${blockId}`, {
        method: 'PATCH',
        body: JSON.stringify({ metadata: { tested: true } }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.block) {
          setBlocks((prev) =>
            prev.map((b) => (b.id === blockId ? { ...b, metadata: data.block.metadata } : b))
          );
        }
      }
    } catch (err) {
      console.error('[ideas/workspace] mark tested failed:', err);
    }
  };

  // Click-to-scroll from decision strip → thread block
  const scrollToBlock = useCallback((blockId: string) => {
    const el = document.getElementById(`idea-block-${blockId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedBlockId(blockId);
      window.setTimeout(() => {
        setHighlightedBlockId((curr) => (curr === blockId ? null : curr));
      }, 1600);
    }
  }, []);

  // Return to this — touch ping + focus the persistent composer. No type
  // selection: the composer is always a freeform note; structuring happens
  // post-hoc via Convert actions on the saved block.
  const handleReturnToThis = useCallback(() => {
    if (!idea) return;

    // Fire-and-forget touch — updates last_entered_at even though we're
    // already on the page. This is the engagement signal we care about.
    apiFetch(`/api/ideas/${idea.id}/touch`, { method: 'POST' }).catch(() => {});

    // Scroll composer into view, then focus it.
    window.setTimeout(() => {
      composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      composerRef.current?.focus();
    }, 80);
  }, [idea]);

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

        {/* Current direction — derived from the last block, no persistence */}
        {currentDirection && (
          <div className="mb-6 flex items-baseline gap-2 text-xs">
            <span className="uppercase tracking-wider text-stone-600 font-medium">
              Current direction
            </span>
            <span className="text-stone-300 font-light line-clamp-2 flex-1">
              {currentDirection.content}
              {currentDirection.outcome && (
                <span className="text-stone-500 ml-1.5 italic">
                  ({currentDirection.outcome.toLowerCase()})
                </span>
              )}
            </span>
          </div>
        )}

        {/* Return to this — engagement signal + smart composer default */}
        <div className="mb-6">
          <button
            onClick={handleReturnToThis}
            className="text-xs text-stone-500 hover:text-amber-400/80 transition-colors flex items-center gap-1.5 font-light"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Return to this</span>
          </button>
        </div>

        {/* Decision strip — last 2–3 decisions, clickable */}
        {recentDecisions.length > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-[10px] uppercase tracking-wider text-emerald-500/60 font-medium mb-2">
              Recent decisions
            </p>
            <ul className="space-y-2">
              {recentDecisions.map((d) => {
                const tested = d.metadata?.tested === true;
                return (
                  <li key={d.id} className="flex items-start gap-2 group/row">
                    <button
                      onClick={() => scrollToBlock(d.id)}
                      className="flex items-start gap-2 text-left min-w-0 flex-1 hover:text-emerald-200 transition-colors"
                      aria-label="Scroll to this decision"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-emerald-100/90 font-light leading-snug">
                        {d.content}
                      </span>
                    </button>
                    {tested ? (
                      <span className="text-[10px] uppercase tracking-wider text-emerald-500/70 bg-emerald-500/10 border border-emerald-500/25 rounded px-1.5 py-0.5 flex-shrink-0 mt-0.5">
                        Tested
                      </span>
                    ) : (
                      <button
                        onClick={() => markAsTested(d.id)}
                        className="text-[10px] text-stone-500 hover:text-emerald-400/80 transition-colors flex-shrink-0 mt-0.5 opacity-0 group-hover/row:opacity-100"
                      >
                        Mark as tested
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Thread — newest first so return-visits see the latest first */}
        {blocks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-stone-500 font-light">This idea is waiting for you.</p>
            <p className="text-xs text-stone-600 mt-1">
              Use the composer below to continue thinking.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {[...blocks].reverse().map((block) => {
              const style = BLOCK_STYLES[block.block_type];
              const Icon = style.icon;
              const highlighted = highlightedBlockId === block.id;
              const tested = block.block_type === 'decision' && block.metadata?.tested === true;
              const outcome =
                block.block_type === 'change' ? block.metadata?.outcome : undefined;

              return (
                <li
                  key={block.id}
                  id={`idea-block-${block.id}`}
                  className={`group p-4 rounded-xl ${style.bg} border ${style.border} transition-shadow duration-500 ${
                    highlighted ? 'ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/10' : ''
                  }`}
                  style={{ scrollMarginTop: '6rem' }}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 ${style.iconColor} mt-0.5 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] uppercase tracking-wider ${style.accent} font-medium`}
                          >
                            {BLOCK_LABELS[block.block_type]}
                          </span>
                          {tested && (
                            <span className="text-[10px] uppercase tracking-wider text-emerald-500/70 bg-emerald-500/10 border border-emerald-500/25 rounded px-1.5 py-0.5">
                              Tested
                            </span>
                          )}
                          {outcome && (
                            <span className="text-[10px] uppercase tracking-wider text-cyan-300/80 bg-cyan-500/10 border border-cyan-500/25 rounded px-1.5 py-0.5">
                              {OUTCOME_LABELS[outcome]}
                            </span>
                          )}
                        </div>
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
                      {/* MAIA recognition naming line — structurally distinct
                          from the reflection body. Reads as "MAIA recognized
                          something here" rather than as part of the prose.
                          Only renders when recognition metadata is present
                          (server-gated by FEATURE_MAIA_IDEAS_DECISION_RECOGNITION). */}
                      {block.block_type === 'maia_reflection' &&
                        block.metadata?.recognition?.naming_line && (
                          <p className="mb-3 pb-3 border-b border-amber-500/10 text-sm italic font-light leading-relaxed text-amber-200/70">
                            {block.metadata.recognition.naming_line}
                          </p>
                        )}

                      <p className="text-sm text-stone-200 font-light leading-relaxed whitespace-pre-wrap">
                        {block.content}
                      </p>

                      {/* MAIA-mediated invitation affordance — appears only
                          when detection offered invitation AND the member has
                          not yet accepted (server clears offer_invitation on
                          accept; local state mirrors this immediately). */}
                      {block.block_type === 'maia_reflection' &&
                        block.metadata?.recognition?.offer_invitation === true && (
                          <div className="mt-3 pt-3 border-t border-amber-500/10">
                            <button
                              onClick={() => handleAcceptRecognition(block)}
                              disabled={acceptingRecognitionFor === block.id}
                              className={`text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                block.metadata.recognition.kind === 'decision'
                                  ? 'text-emerald-300/90 hover:text-emerald-300'
                                  : 'text-cyan-300/90 hover:text-cyan-300'
                              }`}
                            >
                              {acceptingRecognitionFor === block.id
                                ? 'Saving...'
                                : block.metadata.recognition.kind === 'decision'
                                ? 'Save as Decision'
                                : 'Mark as Change'}
                            </button>
                          </div>
                        )}

                      {/* Convert-to-Decision / Convert-to-Shift buttons
                          removed 2026-04-22 — MAIA-mediated recognition is
                          now the intended creation path (naming line +
                          inline affordance on the MAIA response). The
                          underlying convertBlock() handler and
                          lastCreatedBlockId state are preserved so this
                          can be restored with a single JSX reinsert if
                          needed. */}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Persistent composer — always visible, below the thread.
            This is the live place where thought continues. Ask MAIA is
            a secondary action inside the composer, not a separate button. */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <textarea
            ref={composerRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Continue thinking..."
            maxLength={4000}
            className="min-h-[88px] w-full resize-none bg-transparent text-stone-100 placeholder-stone-500 outline-none font-light leading-relaxed"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                handleSaveNote();
              }
            }}
          />

          {/* Relational stances — five verbs, each governing ONE turn.
              None is selected by default: plain Ask MAIA still works and
              behaves exactly as before. The stance clears after the response,
              so there is no sticky mode to get lost in. These belong to Ask
              MAIA alone — Save stays MAIA-silent. */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {IDEA_STANCES.map((option) => {
              const selected = stance === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStance(selected ? null : option)}
                  disabled={askingMaia}
                  title={STANCE_DESCRIPTIONS[option]}
                  aria-pressed={selected}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    selected
                      ? 'text-amber-200 ring-1 ring-amber-400/40 bg-amber-400/5'
                      : 'text-stone-500 ring-1 ring-white/[0.06] hover:text-stone-300 hover:ring-white/15'
                  }`}
                >
                  {STANCE_LABELS[option]}
                </button>
              );
            })}
            {stance && (
              <span className="ml-1 text-[11px] text-stone-500 font-light">
                {STANCE_DESCRIPTIONS[stance]}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleAskMaia}
              disabled={askingMaia}
              className="text-sm text-stone-400 hover:text-stone-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              aria-label="Ask MAIA for a reflection on this thread"
            >
              {askingMaia ? (
                <>
                  <span className="w-3 h-3 border border-stone-400/40 border-t-stone-200 rounded-full animate-spin" />
                  <span>Listening...</span>
                </>
              ) : (
                'Ask MAIA'
              )}
            </button>

            <button
              type="button"
              onClick={handleSaveNote}
              disabled={!draft.trim() || saving}
              className="rounded-full px-4 py-2 text-sm text-amber-300 ring-1 ring-amber-400/30 hover:bg-amber-400/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
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
