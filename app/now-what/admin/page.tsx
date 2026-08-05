'use client';

/**
 * Now What? — The Practitioner's Field (admin), behind the quiet door at the
 * bottom of the client Home.
 *
 * Kelly's one-page, two-clearances direction (2026-07-13, re-asserted
 * 2026-08-05): member environment above, holder's field below — reached from
 * the bottom of /now-what, gated at the server. The gate lives in
 * /api/now-what/admin (getAuthoredField): a member who holds no practice
 * field receives 404 and this page renders nothing of the field.
 *
 * Four quadrants per PRACTITIONER_FIELD_ADMIN_SPEC_2026-07-10 §3, each
 * labelled honestly (claim discipline — Live / Designed):
 *   Develop   — author the field (existing editor, reused not forked) +
 *               field history (the append-only revision spine, PR #586).
 *   Explore   — the composed-field view (exactly what the room receives) +
 *               "Enter as a member".
 *   Monitor   — the field's health and expression as it translates into
 *               client environments (coherence, resources, expressions in
 *               use, revision history). §9 fence intact: no member positions,
 *               counts, activity, or aggregates — the terrain is visible
 *               here, the client's journey through it never is.
 *   Imagineer — draft → rehearse → promote. Designed, not yet built; the
 *               chip says so.
 */

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { NowWhatThreshold, useMemberSession } from '@/components/now-what/NowWhatShell';
import { PracticeFieldEditor } from '@/components/maia/practice-field/PracticeFieldEditor';
import { NW_PALETTE_CSS, NW_PALETTE_DARK_CSS } from '@/components/now-what/PaperRoom';

const SERIF = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif";
const INK = 'var(--nw-ink)';
const INK_SOFT = 'var(--nw-ink-soft)';
const INK_FAINT = 'var(--nw-ink-faint)';
const BRONZE = 'var(--nw-bronze)';
const RULE = 'var(--nw-rule)';

interface AdminPayload {
  fieldSlug: string;
  status: string;
  statusReason: string | null;
  readiness: { is_live: boolean; missing: string[] };
  revisions: {
    revisionNumber: number; savedBy: string; note: string | null;
    promotedFromDraft: boolean; createdAt: string;
  }[];
  composedPreview: string;
  expressions: { key: string; label: string; authored: boolean; composed: boolean }[];
  materialsCount: number;
  programsCount: number;
  activeFieldChars: number;
  activeFieldUpdatedAt: string | null;
}

function dateLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function Panel({
  name, meaning, chip, chipLive, children,
}: {
  name: string; meaning: string; chip: string; chipLive: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="nwa-panel">
      <div className="nwa-phead">
        <div>
          <h2 className="nwa-pname">{name}</h2>
          <p className="nwa-pmean">{meaning}</p>
        </div>
        <span className={`nwa-chip${chipLive ? ' nwa-chip-live' : ''}`}>{chip}</span>
      </div>
      {children}
    </section>
  );
}

export default function NowWhatAdminPage() {
  const session = useMemberSession();
  const [data, setData] = useState<AdminPayload | null>(null);
  const [absent, setAbsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session !== 'in') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch('/api/now-what/admin');
        if (res.status === 404) {
          if (!cancelled) setAbsent(true);
          return;
        }
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || 'Could not open the field right now.');
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [session]);

  if (session === 'unknown') return null;
  if (session === 'out') {
    return (
      <NowWhatThreshold
        roomName="The practitioner's field"
        line="The holder's side of this environment."
      />
    );
  }

  /* Non-holders: the surface is absent, plainly. Nothing of the field renders. */
  if (absent) {
    return (
      <div className="nwa-root">
        <div className="nwa-frame">
          <p className="nwa-absent">
            This page is part of the practitioner&rsquo;s side of the environment.{' '}
            <a href="/now-what">Return home &rarr;</a>
          </p>
        </div>
        <style>{`
          .nwa-root { ${NW_PALETTE_CSS} min-height: 100vh; background: linear-gradient(var(--nw-bg-1), var(--nw-bg-2)); }
          @media (prefers-color-scheme: dark) { .nwa-root { ${NW_PALETTE_DARK_CSS} } }
          .nwa-frame { max-width: 74rem; margin: 0 auto; padding: 60px 40px; }
          .nwa-absent { font-size: 14px; font-weight: 300; color: ${INK_SOFT}; }
          .nwa-absent a { color: ${BRONZE}; text-decoration: none; }
        `}</style>
      </div>
    );
  }

  /*
   * The API is the authority: nothing of the field — including the editor,
   * which talks to its own gated data routes — mounts until the gated payload
   * has actually arrived. Component visibility is convenience; authorization
   * happened at the server.
   */
  if (!data) {
    return (
      <div className="nwa-root">
        <div className="nwa-frame">
          {error
            ? <p role="alert" className="nwa-error">{error}</p>
            : <p className="nwa-absent">Opening your field&hellip;</p>}
        </div>
        <style>{`
          .nwa-root { ${NW_PALETTE_CSS} min-height: 100vh; background: linear-gradient(var(--nw-bg-1), var(--nw-bg-2)); }
          @media (prefers-color-scheme: dark) { .nwa-root { ${NW_PALETTE_DARK_CSS} } }
          .nwa-frame { max-width: 74rem; margin: 0 auto; padding: 60px 40px; }
          .nwa-absent { font-size: 14px; font-weight: 300; color: ${INK_SOFT}; }
          .nwa-error { color: #8c2f22; font-size: 14px; font-weight: 300; }
        `}</style>
      </div>
    );
  }

  const memberHref = data.fieldSlug
    ? `/now-what?fieldContext=${encodeURIComponent(data.fieldSlug)}`
    : '/now-what';

  return (
    <div className="nwa-root">
      <div className="nwa-frame">
        <div className="nwa-top">
          <a className="nwa-wordmark" href="/now-what">
            Now What<span className="nwa-wordmark-q">?</span>
          </a>
          <span className="nwa-loc">The Practitioner&rsquo;s Field</span>
        </div>

        {error && <p role="alert" className="nwa-error">{error}</p>}

        <div className="nwa-arrive">
          <h1 className="nwa-h1">Your field</h1>
          <p className="nwa-subtitle">
            The holder&rsquo;s side of this environment — what you author here
            becomes the terrain your clients enter; the journey through it
            remains theirs. Nothing you change erases what came before: your
            work stays versioned, and you remain in control of it.
          </p>
          {data && (
            <p className="nwa-factline">
              {data.fieldSlug} · {data.readiness.is_live ? 'live' : 'pending'}
              {!data.readiness.is_live && data.readiness.missing.length > 0 &&
                ` — still needed: ${data.readiness.missing.join(', ')}`}
            </p>
          )}
        </div>

        {/* ── Develop — author the field ── */}
        <Panel
          name="Develop"
          meaning="Author your field — your answers become the environment"
          chip="Live"
          chipLive
        >
          <div className="nwa-editor">
            <PracticeFieldEditor />
          </div>

          {data && data.revisions.length > 0 && (
            <div className="nwa-history">
              <p className="nwa-hlabel">Field history</p>
              <ul className="nwa-hlist">
                {data.revisions.map((r) => (
                  <li key={r.revisionNumber}>
                    <b>Revision {r.revisionNumber}</b>
                    {' · '}{r.savedBy}
                    {' · '}{dateLabel(r.createdAt)}
                    {r.promotedFromDraft ? ' · promoted from draft' : ''}
                    {r.note ? <span className="nwa-hnote"> — {r.note}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>

        {/* ── Explore — see what the room receives ── */}
        <Panel
          name="Explore"
          meaning="What the room actually receives, and the room itself"
          chip="Live"
          chipLive
        >
          <p className="nwa-plain">
            This is the composed field — exactly the text your environment
            draws on when a client is in the room: the translation moment where
            your authored field becomes their terrain. Reading it changes
            nothing.
          </p>
          <pre className="nwa-composed">{data ? (data.composedPreview || '— The composed field is currently empty. —') : '…'}</pre>
          <a className="nwa-amber" href={memberHref}>Enter as a member &rarr;</a>
        </Panel>

        {/* ── Monitor — the field's health and expression, never its clients ── */}
        <Panel
          name="Monitor"
          meaning="The health of your field as it becomes client environments"
          chip="Live"
          chipLive
        >
          {data ? (
            <>
              <ul className="nwa-facts">
                <li><b>Coherence</b> — {data.readiness.is_live ? 'complete: every required expression is authored' : `pending — still needed: ${data.readiness.missing.join(', ')}`}{data.statusReason ? ` (${data.statusReason})` : ''}</li>
                <li><b>Current revision</b> — {data.revisions[0] ? `#${data.revisions[0].revisionNumber}, saved by ${data.revisions[0].savedBy}, ${dateLabel(data.revisions[0].createdAt)}` : 'none yet'}</li>
                <li><b>Resources</b> — {data.materialsCount === 0 ? 'no materials yet' : `${data.materialsCount} material${data.materialsCount === 1 ? '' : 's'}`} · {data.programsCount === 0 ? 'no programs yet' : `${data.programsCount} program${data.programsCount === 1 ? '' : 's'}`}</li>
                <li><b>Field material</b> — {data.activeFieldChars === 0 ? 'empty' : `${data.activeFieldChars.toLocaleString()} characters`}{data.activeFieldUpdatedAt ? `, last changed ${dateLabel(data.activeFieldUpdatedAt)}` : ''}</li>
              </ul>
              <p className="nwa-hlabel nwa-exlabel">Expressions in use</p>
              <ul className="nwa-facts">
                {data.expressions.map((x) => (
                  <li key={x.key}>
                    <b>{x.label}</b> — {!x.authored
                      ? 'not yet authored'
                      : x.composed
                        ? 'authored · reaches the room'
                        : 'authored · arrival copy only, not composed into the room'}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="nwa-plain">…</p>
          )}
          <p className="nwa-fence">
            This panel monitors your field&rsquo;s expression — never your
            clients. Their thoughts, reflections, progress, and activity do not
            appear here, and nothing on this page can reach them. You provide
            the terrain; the journey through it is theirs.
          </p>
        </Panel>

        {/* ── Imagineer — designed, not yet built ── */}
        <Panel
          name="Imagineer"
          meaning="Draft privately, rehearse against the draft, promote deliberately"
          chip="Designed · not yet built"
          chipLive={false}
        >
          <p className="nwa-plain">
            A draft state of the field, a rehearsal room where you converse as
            a client against the draft without writing anything real, and an
            explicit Promote gesture. Designed in the field admin spec; it is
            not built yet, and this page will say so until it is.
          </p>
        </Panel>
      </div>

      <style>{`
        .nwa-root { ${NW_PALETTE_CSS} }
        @media (prefers-color-scheme: dark) { .nwa-root { ${NW_PALETTE_DARK_CSS} } }
        .nwa-root {
          min-height: 100vh;
          font-family: -apple-system, 'Helvetica Neue', 'Segoe UI', sans-serif;
          color: ${INK};
          background:
            radial-gradient(ellipse 90% 45% at 50% -5%, var(--nw-wash-a), transparent 60%),
            linear-gradient(var(--nw-bg-1), var(--nw-bg-2));
          -webkit-font-smoothing: antialiased;
        }
        .nwa-frame { max-width: 74rem; margin: 0 auto; padding: 26px 40px 80px; }
        .nwa-top { display: flex; justify-content: space-between; align-items: baseline; }
        .nwa-wordmark {
          font-size: 13px; letter-spacing: 0.35em; text-transform: uppercase;
          color: ${INK}; text-decoration: none;
        }
        .nwa-wordmark-q { color: ${BRONZE}; }
        .nwa-loc { font-size: 12px; color: ${INK_FAINT}; font-weight: 300; }
        .nwa-error { margin-top: 24px; color: #8c2f22; font-size: 14px; font-weight: 300; }

        .nwa-arrive { margin-top: 40px; }
        .nwa-h1 { font-family: ${SERIF}; font-size: clamp(28px, 3.5vw, 34px); font-weight: 400; }
        .nwa-subtitle { font-size: 15px; font-weight: 300; color: ${INK_SOFT}; margin-top: 8px; max-width: 46rem; line-height: 1.6; }
        .nwa-factline { font-size: 12.5px; font-weight: 300; color: ${INK_FAINT}; margin-top: 12px; }

        .nwa-panel {
          margin-top: 32px; border: 1px solid ${RULE}; background: var(--nw-box);
          border-radius: 16px; padding: 26px 28px;
        }
        .nwa-phead { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
        .nwa-pname { font-family: ${SERIF}; font-size: 21px; font-weight: 400; }
        .nwa-pmean { font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: ${INK_FAINT}; margin-top: 6px; }
        .nwa-chip {
          flex-shrink: 0; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
          border: 1px solid ${RULE}; border-radius: 999px; padding: 4px 12px; color: ${INK_FAINT};
        }
        .nwa-chip-live { color: ${BRONZE}; border-color: var(--nw-bronze); }

        .nwa-plain { font-size: 13.5px; font-weight: 300; color: ${INK_SOFT}; line-height: 1.6; margin-top: 14px; max-width: 46rem; }
        .nwa-fence { font-size: 12.5px; font-weight: 300; color: ${INK_FAINT}; line-height: 1.6; margin-top: 16px; font-style: italic; }

        /* The reused editor authored its own dark idiom — give it its own ground. */
        .nwa-editor {
          margin-top: 18px; border-radius: 12px; overflow: hidden;
          background: #1c1917; padding: 8px 4px;
        }

        .nwa-exlabel { margin-top: 20px; }
        .nwa-history { margin-top: 20px; }
        .nwa-hlabel { font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: ${INK_FAINT}; }
        .nwa-hlist { list-style: none; margin-top: 10px; padding: 0; }
        .nwa-hlist li { font-size: 13px; font-weight: 300; color: ${INK_SOFT}; padding: 6px 0; border-top: 1px solid ${RULE}; }
        .nwa-hlist li b { font-family: ${SERIF}; font-weight: 400; color: ${INK}; }
        .nwa-hnote { font-style: italic; }

        .nwa-composed {
          margin-top: 14px; padding: 16px 18px; border: 1px dashed ${RULE}; border-radius: 12px;
          font-size: 12.5px; line-height: 1.6; color: ${INK_SOFT};
          white-space: pre-wrap; word-break: break-word; max-height: 340px; overflow-y: auto;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }
        .nwa-amber { display: inline-block; margin-top: 16px; font-size: 13.5px; color: ${BRONZE}; text-decoration: none; }

        .nwa-facts { list-style: none; margin-top: 14px; padding: 0; }
        .nwa-facts li { font-size: 13.5px; font-weight: 300; color: ${INK_SOFT}; padding: 6px 0; border-top: 1px solid ${RULE}; }
        .nwa-facts li b { font-family: ${SERIF}; font-weight: 400; color: ${INK}; }
      `}</style>
    </div>
  );
}
