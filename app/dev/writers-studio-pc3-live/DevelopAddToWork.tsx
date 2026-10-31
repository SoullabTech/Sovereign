'use client';

import { useState } from 'react';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';

/**
 * Develop's way out of "this writing is not part of a Work".
 *
 * MAIA talks with the author inside a Work, and the Studio never guesses which Work a manuscript belongs to
 * (app/writers-studio/workContext.ts). So when no Work declares this writing the author is asked, plainly, where it
 * belongs. Both gestures are the author's own declaration and use the routes the Studio Home already uses:
 *   - "Add to a Work": POST /api/sovereign/living-works/:id/expressions
 *   - "Make this a Work": the author NAMES the Work (the create route never invents a title), then the same declaration.
 * Nothing is read or changed in the writing itself.
 */
export interface DevelopAddToWorkProps {
  works: readonly LivingWork[];
  busy: boolean;
  error: string | null;
  onAddToWork: (workId: string) => void;
  onMakeWork: (title: string) => void;
}

export function DevelopAddToWork({ works, busy, error, onAddToWork, onMakeWork }: DevelopAddToWorkProps) {
  const [mode, setMode] = useState<'choose' | 'add' | 'make'>('choose');
  const [title, setTitle] = useState('');
  const named = title.trim().length > 0;

  return (
    <section className="p4r1-develop-attach" aria-label="Add this writing to a Work">
      <h3>This writing isn’t part of a Work yet.</h3>
      <p>
        MAIA talks with you inside a Work, so she knows which one she is in. Tell us where this writing belongs.
        Nothing is read or changed.
      </p>
      <div className="p4r1-develop-attach-actions">
        <button type="button" disabled={busy} aria-expanded={mode === 'make'} onClick={() => setMode(mode === 'make' ? 'choose' : 'make')}>
          Make this a Work
        </button>
        {works.length > 0 ? (
          <button type="button" disabled={busy} aria-expanded={mode === 'add'} onClick={() => setMode(mode === 'add' ? 'choose' : 'add')}>
            Add to a Work
          </button>
        ) : null}
      </div>
      {mode === 'make' ? (
        <form
          className="p4r1-develop-attach-make"
          onSubmit={(event) => {
            event.preventDefault();
            if (named && !busy) onMakeWork(title.trim());
          }}
        >
          <label>
            Name this Work
            <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} disabled={busy} />
          </label>
          <button type="submit" disabled={!named || busy}>{busy ? 'Adding…' : 'Create this Work'}</button>
        </form>
      ) : null}
      {mode === 'add' ? (
        <ul className="p4r1-develop-attach-list">
          {works.map((work) => (
            <li key={work.id}>
              <button type="button" disabled={busy} onClick={() => onAddToWork(work.id)}>{work.title || 'Untitled Work'}</button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <p role="alert" className="p4r1-develop-attach-error">{error}</p> : null}
    </section>
  );
}
