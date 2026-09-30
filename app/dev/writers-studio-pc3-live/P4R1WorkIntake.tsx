'use client';

import type { CSSProperties } from 'react';

/**
 * H1-R1 — the member is inside the Work they chose at the House threshold,
 * and it is theirs to say what happens next. Two states only:
 *
 *   choose      the Work holds several pieces of writing. They are listed in
 *               the order the member declared them — no recency, no
 *               "recommended", no first-one-by-default (HS-F3).
 *   no-writing  the Work has no writing artifact yet. Said plainly; the
 *               member may begin one. The system creates nothing on its own
 *               (founder ruling D-03).
 */

interface Props {
  workTitle: string | null;
  /** Empty means the Work has no writing yet. */
  manuscripts: readonly { id: string; title: string | null }[];
  busy: boolean;
  error: string | null;
  onOpen: (manuscriptId: string) => void;
  onBeginManuscript: () => void;
  onStudioHome: () => void;
}

const button: CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '12px 16px',
  marginTop: 8,
  border: '1px solid currentColor',
  borderRadius: 8,
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
};

export default function P4R1WorkIntake({
  workTitle,
  manuscripts,
  busy,
  error,
  onOpen,
  onBeginManuscript,
  onStudioHome,
}: Props) {
  const title = workTitle?.trim() || 'An unnamed living work';
  const empty = manuscripts.length === 0;

  return (
    <main className="fr-root">
      <section style={{ padding: 32, maxWidth: 560 }} aria-labelledby="work-intake-title">
        <p style={{ letterSpacing: '0.12em', fontSize: 12, opacity: 0.7 }}>FROM THE HOUSE</p>
        <h1 id="work-intake-title" style={{ fontFamily: 'var(--fr-serif)', fontWeight: 500 }}>{title}</h1>

        {empty ? (
          <>
            <p>This Work has no writing yet.</p>
            <button type="button" style={button} disabled={busy} onClick={onBeginManuscript}>
              {busy ? 'Beginning…' : 'Begin manuscript'}
            </button>
          </>
        ) : (
          <>
            <p>This Work holds more than one piece of writing. Which would you like to open?</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {manuscripts.map((m) => (
                <li key={m.id}>
                  <button type="button" style={button} disabled={busy} onClick={() => onOpen(m.id)}>
                    {m.title?.trim() || 'Untitled writing'}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {error ? <p role="alert" style={{ marginTop: 16 }}>{error}</p> : null}

        <p style={{ marginTop: 24 }}>
          <button type="button" onClick={onStudioHome} style={{ ...button, border: 'none', padding: 0, opacity: 0.75 }}>
            Go to Studio home
          </button>
        </p>
      </section>
    </main>
  );
}
