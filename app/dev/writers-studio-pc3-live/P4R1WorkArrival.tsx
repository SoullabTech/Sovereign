'use client';

import { useState, type ReactNode } from 'react';
import type { StudioArrival } from '@/app/writers-studio/situatedWork';

/**
 * HOUSE-STUDIO-CIRCULATION-01R1 · H1-3 — arriving in the Studio through a Work.
 *
 * The House witnessed a threshold: "you were becoming something here — would
 * you like to continue becoming it there?" This panel is the far side of it.
 *
 *   one        name the Work and its manuscript; the member opens it.
 *   several    list them in declaration order; NOTHING is pre-selected, and
 *              the Enter action stays unavailable until the member chooses.
 *   none       say so. Nothing is created until the member asks for it.
 *
 * ⛔ No recency. ⛔ No preview of manuscript content. ⛔ No interpretation of
 * the Work — only the member's own title and words appear here.
 */

type Settled = Exclude<StudioArrival, { kind: 'fallback' } | { kind: 'unknown' }>;

function workTitle(title: string | null): string {
  return title?.trim() || 'An unnamed Work';
}

function manuscriptTitle(title: string | null): string {
  return title?.trim() || 'Untitled writing';
}

export default function P4R1WorkArrival({
  arrival,
  busy,
  error,
  onOpen,
  onBegin,
  onReturn,
  onStudioHome,
}: {
  arrival: Settled;
  busy: boolean;
  error: string | null;
  onOpen: (manuscriptId: string) => void;
  onBegin: (workId: string) => void;
  onReturn: () => void;
  onStudioHome: () => void;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const title = workTitle(arrival.work.title);

  let body: ReactNode;
  if (arrival.kind === 'one') {
    body = (
      <>
        <p className="fr-home-eyebrow">Continue</p>
        <h1 className="fr-home-greeting">{title}</h1>
        <p className="fr-home-place">{manuscriptTitle(arrival.manuscript.title)}</p>
        <div className="fr-home-actions">
          <button
            type="button"
            className="fr-home-primary"
            disabled={busy}
            onClick={() => onOpen(arrival.manuscript.id)}
          >
            Open Writing Studio
          </button>
        </div>
      </>
    );
  } else if (arrival.kind === 'several') {
    body = (
      <>
        <p className="fr-home-eyebrow">Continue this Work</p>
        <h1 className="fr-home-greeting">{title} contains:</h1>
        <fieldset className="p4r1-arrival-choices" data-arrival-choices="">
          <legend className="fr-home-place">Which thread would you like to enter?</legend>
          {arrival.manuscripts.map((m) => (
            <label key={m.id} className="p4r1-arrival-choice">
              <input
                type="radio"
                name="arrival-manuscript"
                value={m.id}
                checked={chosen === m.id}
                onChange={() => setChosen(m.id)}
              />
              <span>{manuscriptTitle(m.title)}</span>
            </label>
          ))}
        </fieldset>
        <div className="fr-home-actions">
          <button
            type="button"
            className="fr-home-primary"
            disabled={busy || chosen === null}
            onClick={() => { if (chosen) onOpen(chosen); }}
          >
            Enter
          </button>
        </div>
      </>
    );
  } else {
    body = (
      <>
        <p className="fr-home-eyebrow">{title}</p>
        <h1 className="fr-home-greeting">This Work has no manuscript yet.</h1>
        <p className="fr-home-place">Would you like to:</p>
        <div className="fr-home-actions">
          <button
            type="button"
            className="fr-home-primary"
            disabled={busy}
            onClick={() => onBegin(arrival.work.id)}
          >
            Begin this Work
          </button>
          <button type="button" className="fr-home-quiet" onClick={onReturn}>
            Return
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="fr-home fr-home-arrival" data-arrival={arrival.kind}>
      <div className="fr-home-field" data-field="room">
        <section className="fr-home-anchor p4r1-home-anchor" aria-label="Arriving with a Work">
          <header className="fr-home-arrive">{body}</header>
          {error ? <p className="p4r1-arrival-error" role="alert">{error}</p> : null}
          <p className="p4r1-arrival-elsewhere">
            <button type="button" className="fr-home-link" onClick={onStudioHome}>
              Writer’s Studio home
            </button>
          </p>
        </section>
      </div>
    </div>
  );
}
