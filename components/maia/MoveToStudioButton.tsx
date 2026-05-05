'use client';

/**
 * MoveToStudioButton
 *
 * Secondary action on a MAIA Idea — moves a captured idea to the
 * Book Studio as a draft. The default state is quiet; this is not
 * the foregrounded action.
 *
 * Principle:
 *   MAIA Ideas    = quick capture + live thinking
 *   Book Studio   = intentional writing + editorial form
 *   Move only when this wants form.
 *
 * Usage:
 *   <MoveToStudioButton ideaId={idea.id} title={idea.title} content={idea.body} />
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface MoveToStudioButtonProps {
  ideaId: string;
  title: string;
  content: string;
  /** Visual variant. `quiet` is the default — secondary, not foregrounded. */
  variant?: 'quiet' | 'standard';
  className?: string;
}

export function MoveToStudioButton({
  ideaId,
  title,
  content,
  variant = 'quiet',
  className,
}: MoveToStudioButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/book-studio/drafts/from-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId, title, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not move idea to Studio');
        return;
      }
      router.push(data.studioUrl);
    } catch (err) {
      setError('Network error moving idea to Studio');
    } finally {
      setLoading(false);
    }
  };

  const baseClasses =
    variant === 'quiet'
      ? 'text-amber-200/55 hover:text-amber-100 text-xs tracking-wide transition-colors duration-300'
      : 'text-amber-200/80 hover:text-amber-100 text-sm tracking-wide border border-amber-200/20 hover:border-amber-200/40 px-4 py-2 rounded-md transition-colors duration-300';

  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={[baseClasses, 'disabled:opacity-40', className ?? ''].join(' ')}
      >
        {loading ? 'Moving…' : 'Move to Studio'}
      </button>
      {error && (
        <span className="text-amber-300/60 text-xs italic" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}

export default MoveToStudioButton;
