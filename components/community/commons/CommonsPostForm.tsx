'use client';

/**
 * COMMUNITY COMMONS POST FORM
 *
 * Allows Level 4+ users to contribute wisdom to the Community Commons.
 * Handles cognitive gate with mythic MAIA-voice messaging.
 */

import { useState } from 'react';

interface CognitiveGateError {
  type: 'cognitive';
  message: string;
  mythicMessage: string;
  minLevel: number;
  averageLevel?: number;
}

interface GenericError {
  type: 'generic' | 'network' | 'auth';
  message: string;
}

type FormError = CognitiveGateError | GenericError | null;

export default function CommonsPostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<FormError>(null);
  const [success, setSuccess] = useState(false);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/community/commons/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, tags }),
      });

      const data = await res.json();

      // ============================================================================
      // 🧠 COGNITIVE GATE HANDLING
      // ============================================================================
      if (res.status === 403 && data.reason === 'cognitive_threshold_not_met') {
        setError({
          type: 'cognitive',
          message: data.message,
          mythicMessage: data.mythicMessage,
          minLevel: data.minLevel,
          averageLevel: data.averageLevel,
        });
        setSubmitting(false);
        return;
      }

      // ============================================================================
      // OTHER ERROR HANDLING
      // ============================================================================
      if (res.status === 401) {
        setError({
          type: 'auth',
          message: data.message || 'Please sign in to post to the Commons.',
        });
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        setError({
          type: 'generic',
          message: data.message || 'Something went wrong. Please try again.',
        });
        setSubmitting(false);
        return;
      }

      // ============================================================================
      // SUCCESS
      // ============================================================================
      console.log('✅ [Commons] Post created:', data.post);
      setSuccess(true);

      // Clear form
      setTitle('');
      setContent('');
      setTags([]);

      // Reset success after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (e) {
      console.error('[Commons] Network error:', e);
      setError({
        type: 'network',
        message: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold text-stone-900">
          Share to the Commons
        </h2>

        {/* ====================================================================== */}
        {/* SUCCESS MESSAGE */}
        {/* ====================================================================== */}
        {success && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="font-semibold text-green-900">
              ✅ Your wisdom has been shared to the Commons.
            </p>
            <p className="mt-1 text-sm text-green-700">
              Thank you for contributing to the collective field.
            </p>
          </div>
        )}

        {/* ====================================================================== */}
        {/* COGNITIVE GATE ERROR (MYTHIC MESSAGING) */}
        {/* ====================================================================== */}
        {error?.type === 'cognitive' && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="text-2xl">🌱</div>
              <p className="font-semibold text-amber-900">The Gate Awaits</p>
            </div>

            {/* Parse mythicMessage as markdown-like text */}
            <div className="prose prose-sm text-amber-800">
              {error.mythicMessage.split('\n\n').map((paragraph, i) => {
                // Bold first line if it starts with **
                if (paragraph.startsWith('**') && paragraph.includes('**')) {
                  const [boldPart, ...rest] = paragraph.split('**').filter(Boolean);
                  return (
                    <p key={i} className="mb-3">
                      <strong className="text-amber-900">{boldPart}</strong>
                      {rest.join('').trim()}
                    </p>
                  );
                }
                return (
                  <p key={i} className="mb-3">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Cognitive level indicator */}
            {error.averageLevel !== undefined && (
              <div className="mt-4 flex items-center gap-4 border-t border-amber-200 pt-4 text-sm text-amber-700">
                <div>
                  <span className="font-medium">Your current level:</span>{' '}
                  {error.averageLevel.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Required:</span> {error.minLevel}+
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================== */}
        {/* OTHER ERRORS */}
        {/* ====================================================================== */}
        {error && error.type !== 'cognitive' && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-900">Error</p>
            <p className="mt-1 text-sm text-red-700">{error.message}</p>
          </div>
        )}

        {/* ====================================================================== */}
        {/* FORM */}
        {/* ====================================================================== */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-stone-700">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A clear, inviting title..."
              className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
              disabled={submitting}
              required
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="mb-1 block text-sm font-medium text-stone-700">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your patterns, insights, and wisdom..."
              rows={8}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
              disabled={submitting}
              required
            />
            <p className="mt-1 text-xs text-stone-500">
              Speak from lived experience. The Commons is a place for pattern-weaving, not content
              regurgitation.
            </p>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="mb-1 block text-sm font-medium text-stone-700">
              Tags (optional)
            </label>
            <div className="flex gap-2">
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag..."
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200"
                disabled={submitting}
              >
                Add
              </button>
            </div>

            {/* Tag list */}
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-stone-400 hover:text-stone-600"
                      disabled={submitting}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            className="w-full rounded-lg bg-stone-900 px-4 py-3 font-medium text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Sharing...' : 'Share to the Commons'}
          </button>
        </form>
      </div>
    </div>
  );
}
