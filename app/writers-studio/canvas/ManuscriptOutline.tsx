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
 *   the current chapter  DRAWN ONLY WHEN IT IS REAL — WS2-04B. While a draft
 *                        is one continuous string there is no
 *                        cursor-to-section relation to read, and a gold marker
 *                        on an arbitrary row would be a guess in the most
 *                        confident colour the room has. Once the draft is
 *                        section-addressable there IS an active section, named
 *                        by its own row id, and the marker states a fact. The
 *                        caller passes `activeId` only in that case; without
 *                        it this column draws no current row, exactly as
 *                        before.
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

/**
 * A row's save state, when the draft is section-addressable.
 *
 * These belong in the OUTLINE, not the canvas: once the writer has moved to
 * Chapter 18, the canvas should say nothing about Chapter 17, and a toast or
 * modal for a background save would interrupt writing to report routine
 * success. A section that becomes conflicted while another is open is marked
 * here and left alone — never yanked back into view. Their text is preserved;
 * they decide when to return to it.
 */
export type OutlineSectionStatus = 'clean' | 'dirty' | 'saving' | 'error' | 'conflict';

/** The quiet marker for each state. Only `conflict` asks for anything. */
const STATUS_MARK: Record<OutlineSectionStatus, { glyph: string; label: string } | null> = {
  clean: null,
  dirty: { glyph: '·', label: 'unsaved' },
  saving: { glyph: '∙', label: 'saving' },
  error: { glyph: '⚠', label: 'not confirmed' },
  conflict: { glyph: '!', label: 'needs attention' },
};

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
  activeId,
  statusOf,
  onSelect,
}: {
  manuscriptId: string | null;
  phase: Phase;
  sections: ManuscriptSection[];
  /**
   * The section being written, when the draft is section-addressable. Omitted
   * for a continuous draft — and its absence is what keeps this column honest
   * there: no current row, because there is no current section to name.
   */
  activeId?: string | null;
  /** Per-row save state. Omitted when there is nothing to report. */
  statusOf?: (sectionId: string) => OutlineSectionStatus;
  /**
   * Navigate to a section. Omitted for a continuous or unprovable draft, which
   * is what makes those outlines INERT rather than merely unresponsive: no
   * click target, no tab stop, no pointer cursor. A row that cannot navigate
   * must not look like one that can.
   */
  onSelect?: (sectionId: string) => void;
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
        {sections.map((s) => {
          const isActive = activeId === s.id;
          const mark = STATUS_MARK[statusOf?.(s.id) ?? 'clean'];
          const navigable = Boolean(onSelect);
          return (
            <div
              key={s.id}
              data-section={s.position}
              data-active={isActive || undefined}
              role={navigable ? 'button' : undefined}
              tabIndex={navigable ? 0 : undefined}
              aria-current={isActive ? 'true' : undefined}
              onClick={navigable ? () => onSelect!(s.id) : undefined}
              onKeyDown={
                navigable
                  ? (e) => {
                      /* Enter and Space, the two keys a role="button" owes. The
                         outline is navigation, so it must be reachable without
                         a pointer. */
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect!(s.id);
                      }
                    }
                  : undefined
              }
              style={{
                display: 'flex',
                gap: SPACE.snug,
                alignItems: 'baseline',
                padding: `${SPACE.tight}px ${SPACE.snug}px`,
                borderRadius: RADIUS.sm,
                background: isActive ? GROUND.active : 'transparent',
                cursor: navigable ? 'pointer' : 'default',
              }}
            >
              <StudioText role="navItem" tone="quiet" as="span">
                {s.position}.
              </StudioText>
              <StudioText
                role="navItem"
                tone={isActive ? 'primary' : 'secondary'}
                as="span"
                style={{ flex: 1 }}
              >
                {s.heading ?? 'Untitled section'}
              </StudioText>
              {mark && (
                <span title={mark.label} style={{ lineHeight: 1 }}>
                  <StudioText role="metadata" tone="quiet" as="span">
                    <span aria-hidden>{mark.glyph}</span>
                  </StudioText>
                  <span className="sr-only"> {mark.label}</span>
                </span>
              )}
            </div>
          );
        })}
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
