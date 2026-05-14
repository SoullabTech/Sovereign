'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';

interface Contribution {
  id: string;
  memberName?: string;
  contributionType: 'reflection' | 'question' | 'integration' | 'application';
  title?: string | null;
  body: string;
  replyCount: number;
  createdAt: string;
}

interface ReflectionsFeedProps {
  fieldSlug: string;
  contributions: Contribution[];
  isMember: boolean;
  onContributionPosted: () => void;
}

const typeLabel: Record<string, string> = {
  reflection: 'Reflection',
  question: 'Question',
  integration: 'Integration',
  application: 'Application',
};

const typeColor: Record<string, string> = {
  reflection: 'text-maia-ink-60 border-maia-navy-600',
  question: 'text-maia-spice-400 border-maia-spice-500/30',
  integration: 'text-jade-400 border-jade-500/30',
  application: 'text-maia-ink-60 border-maia-navy-600',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ReflectionsFeed({
  fieldSlug,
  contributions,
  isMember,
  onContributionPosted,
}: ReflectionsFeedProps) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<'reflection' | 'question' | 'integration' | 'application'>('reflection');
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePost() {
    if (!body.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/wisdom-fields/${fieldSlug}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contributionType: type, body: body.trim() }),
      });
      if (!res.ok) throw new Error('Failed to post');
      setBody('');
      setShowForm(false);
      onContributionPosted();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Post form trigger */}
      {isMember && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-xl border border-dashed border-maia-navy-600 px-5 py-4 text-sm text-maia-ink-40 hover:border-maia-navy-500 hover:text-maia-ink-60 transition-colors text-left"
        >
          Bring a reflection, question, or integration…
        </button>
      )}

      {/* Post form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-maia-navy-700 bg-maia-navy-850 p-5 space-y-4"
        >
          {/* Type selector */}
          <div className="flex gap-2 flex-wrap">
            {(['reflection', 'question', 'integration', 'application'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  type === t
                    ? 'border-maia-spice-500/50 bg-maia-spice-500/10 text-maia-spice-400'
                    : 'border-maia-navy-600 text-maia-ink-40 hover:text-maia-ink-60'
                }`}
              >
                {typeLabel[t]}
              </button>
            ))}
          </div>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              type === 'question'
                ? 'A question this work raises — not seeking an answer, holding the inquiry…'
                : type === 'integration'
                ? 'How this work has entered your lived experience…'
                : type === 'application'
                ? 'How you have used this in practice…'
                : 'Something in this work opened, disturbed, or confirmed something for you…'
            }
            rows={5}
            className="w-full rounded-xl border border-maia-navy-700 bg-maia-navy-900 px-4 py-3 text-sm text-maia-ink-80 placeholder-maia-ink-40 focus:border-maia-navy-600 focus:outline-none resize-none"
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={handlePost}
              disabled={posting || !body.trim()}
              className="rounded-xl border border-maia-spice-500/30 bg-maia-spice-500/10 px-4 py-2 text-sm text-maia-spice-400 hover:bg-maia-spice-500/20 disabled:opacity-40 transition-colors"
            >
              {posting ? 'Posting…' : 'Offer this'}
            </button>
            <button
              onClick={() => { setShowForm(false); setBody(''); setError(null); }}
              className="px-4 py-2 text-sm text-maia-ink-40 hover:text-maia-ink-60 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Contributions list */}
      {contributions.length === 0 ? (
        <p className="py-6 text-center text-sm text-maia-ink-40">
          No reflections yet. Be the first to bring something.
        </p>
      ) : (
        contributions.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-maia-navy-700 bg-maia-navy-850 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`rounded-full border px-2 py-0.5 text-xs ${typeColor[c.contributionType]}`}>
                {typeLabel[c.contributionType]}
              </span>
              <span className="text-xs text-maia-ink-40">
                {c.memberName ?? 'A member'} · {formatDate(c.createdAt)}
              </span>
            </div>
            {c.title && (
              <p className="mb-2 font-medium text-maia-ink-80">{c.title}</p>
            )}
            <p className="text-sm text-maia-ink-60 leading-relaxed">{c.body}</p>
            {c.replyCount > 0 && (
              <p className="mt-3 text-xs text-maia-ink-40">
                {c.replyCount} {c.replyCount === 1 ? 'reply' : 'replies'}
              </p>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
}
