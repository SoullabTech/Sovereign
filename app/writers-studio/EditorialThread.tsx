'use client';

/**
 * W1 — the editorial thread. ⛔ READ-ONLY, and deliberately so.
 *
 * ⭐⭐ IT RENDERS SUCCESSION, WHICH IS THE WHOLE POINT. The retired card could
 * show one change and no history, so the writer met a verdict. Here they meet
 * an exchange that already has two authors in it.
 *
 * ⛔ NO GESTURE OF ANY KIND. No accept, no keep, no compose — W2 brings the
 * composer and W6 the decision. A control that did nothing would be the
 * `KEEP UNCHANGED` non-act returning under a better font.
 *
 * ⛔ AND NO SOVEREIGNTY WALL. The retired panel spent three sentences
 * explaining what it could not do. The membrane executes now; the one true
 * line is enough, and it says what W6 will honour rather than apologising for
 * W1's silence.
 */

import { editorialThread, authorLabel, type ThreadInput } from '@/lib/writersStudio/editorialThread';

const RULE = 'rgba(255,255,255,0.10)';
const DIM = 'rgba(255,255,255,0.52)';

export function EditorialThread({ chain }: { chain: ThreadInput }) {
  const t = editorialThread(chain);

  /* ⛔ A refusal is not rendered as an empty thread. A surface that showed
     nothing would read as "no conversation here", when what happened is that we
     could not read the one that exists. */
  if (!t.ok) {
    return (
      <div style={{ padding: '20px 0', color: DIM, fontSize: 14, lineHeight: 1.6 }}>
        {t.reason === 'focus_unknown'
          ? 'This link points at a version this exchange does not contain.'
          : 'This exchange could not be read in the order it was written.'}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {t.rows.map((row) => {
        if (row.kind === 'original') {
          return (
            /* ⭐ A DIFFERENT KIND, RENDERED AS ONE. Nobody authored this in the
               exchange — it is the writer's own manuscript wording, and giving
               it a byline would credit their prose to a turn in a conversation
               that had not started. */
            <section key="original">
              <h3 style={{ ...LABEL, color: DIM }}>Original</h3>
              <p style={{ ...PROSE, color: DIM }}>{row.text}</p>
            </section>
          );
        }
        return (
          <section
            key={row.id}
            aria-current={row.focused ? 'true' : undefined}
            style={{
              /* ⭐ The focused version is the one the room named — marked, not
                 isolated: the lineage around it stays legible. */
              borderLeft: row.focused ? '2px solid rgba(255,255,255,0.45)' : `2px solid ${RULE}`,
              paddingLeft: 16,
            }}
          >
            <h3 style={LABEL}>
              {authorLabel(row.author)}
              <span style={{ color: DIM, fontWeight: 400 }}>{` · Version ${row.ordinal}`}</span>
            </h3>
            <p style={PROSE}>{row.text}</p>
            {/* ⛔ Rendered only where its author supplied one. Absent is absent:
                no "Why:" with nothing after it, and nothing manufactured. */}
            {row.rationale !== null && (
              <p style={{ ...PROSE, fontSize: 14, color: DIM, marginTop: 8 }}>
                <span style={{ letterSpacing: '0.06em', textTransform: 'uppercase',
                  fontSize: 11, marginRight: 8 }}>Why</span>
                {row.rationale}
              </p>
            )}
          </section>
        );
      })}

      {/* ⭐ Sovereignty as one quiet true sentence, structurally enforced —
          which is exactly why it no longer has to shout. */}
      <p style={{ borderTop: `1px solid ${RULE}`, paddingTop: 16, margin: 0,
        fontSize: 13, color: DIM, lineHeight: 1.6 }}>
        Nothing changes until you explicitly adopt a version.
      </p>
    </div>
  );
}

const LABEL: React.CSSProperties = {
  margin: '0 0 8px', fontSize: 11, fontWeight: 600,
  letterSpacing: '0.10em', textTransform: 'uppercase',
};
const PROSE: React.CSSProperties = {
  margin: 0, fontSize: 16, lineHeight: 1.65,
};
