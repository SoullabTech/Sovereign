/**
 * WS2-03B — the manuscript outline column, from the member's own sections.
 *
 * 04 draws this column with part headings, numbered chapters and a current
 * chapter marked in gold. Three of those four are reference content, and only
 * what the substrate really holds is drawn here:
 *
 *   position + heading   REAL. manuscript_sections carries both, ordered, and
 *                        GET /api/sovereign/manuscripts/[id] returns them.
 *   chars per section    REAL, and shown as an extent, never as a judgement.
 *   part headings        NOT DRAWN. Nothing groups sections into parts. 04's
 *                        "Part I — Remembering" is the reference author's
 *                        structure; inventing a grouping for a real member's
 *                        174 sections would be the system authoring their book.
 *   the current chapter  NOT DRAWN. The Worktable edits one continuous draft;
 *                        there is no cursor-to-section relation to read. A
 *                        gold marker on an arbitrary row would be a guess in
 *                        the most confident colour the room has.
 *
 * So the column is denser and plainer than 04 and it is the member's actual
 * book. That difference is the point of the whole programme.
 */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { GROUND, RADIUS, SPACE } from '../studioTheme';
import { StudioText } from '../studio/StudioType';
import { SOURCE_HREF } from '../studioMap';
import { canvasForManuscript } from '../canvasIdentity';

export interface ManuscriptSection {
  id: string;
  position: number;
  heading: string | null;
  chars: number;
}

type Phase = 'loading' | 'ready' | 'error';

export function useManuscriptSections(manuscriptId: string | null) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [sections, setSections] = useState<ManuscriptSection[]>([]);

  useEffect(() => {
    if (!manuscriptId) {
      setSections([]);
      setPhase('ready');
      return;
    }
    let cancelled = false;
    setPhase('loading');
    (async () => {
      try {
        const res = await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}`, {
          method: 'GET',
        });
        if (cancelled) return;
        if (!res.ok) return setPhase('error');
        const data = await res.json();
        if (cancelled) return;
        setSections(Array.isArray(data.sections) ? data.sections : []);
        setPhase('ready');
      } catch {
        if (!cancelled) setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [manuscriptId]);

  return { phase, sections };
}

export default function ManuscriptOutline({
  manuscriptId,
  phase,
  sections,
}: {
  manuscriptId: string | null;
  phase: Phase;
  sections: ManuscriptSection[];
}) {
  if (phase === 'loading') {
    return <StudioText role="metadata">reading the structure…</StudioText>;
  }
  if (phase === 'error') {
    return (
      <StudioText role="metadata">
        The structure could not be read just now. Your work is not affected.
      </StudioText>
    );
  }
  if (sections.length === 0) {
    return (
      <StudioText role="metadata">
        This draft has no sections yet — it is one continuous piece.
      </StudioText>
    );
  }

  return (
    <>
      <StudioText role="metadata" style={{ marginBottom: SPACE.base }}>
        {sections.length} section{sections.length === 1 ? '' : 's'}
      </StudioText>
      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.hairline }}>
        {sections.map((s) => (
          <div
            key={s.id}
            data-section={s.position}
            style={{
              display: 'flex',
              gap: SPACE.snug,
              alignItems: 'baseline',
              padding: `${SPACE.tight}px ${SPACE.snug}px`,
              borderRadius: RADIUS.sm,
              background: 'transparent',
            }}
          >
            <StudioText role="navItem" tone="quiet" as="span">
              {s.position}.
            </StudioText>
            <StudioText role="navItem" tone="secondary" as="span" style={{ flex: 1 }}>
              {s.heading ?? 'Untitled section'}
            </StudioText>
          </div>
        ))}
      </div>
      {manuscriptId && (
        <Link
          href={canvasForManuscript(SOURCE_HREF, manuscriptId)}
          style={{
            display: 'inline-block',
            marginTop: SPACE.comfortable,
            padding: `${SPACE.tight}px ${SPACE.snug}px`,
            borderRadius: RADIUS.sm,
            background: GROUND.active,
            textDecoration: 'none',
          }}
        >
          <StudioText role="metadata" as="span">
            Read them in the Source →
          </StudioText>
        </Link>
      )}
    </>
  );
}
