'use client';

import { useMemo } from 'react';
import type { SectionWriting } from '@/lib/writersStudio/useSectionWriting';
import type { WriteStateSection } from '@/lib/writersStudio/writeStateClient';
import type { CodePointRange } from '@/lib/manuscript/development/evidenceRef';
import {
  WholeManuscriptSurface,
  type ReadOnlyPassageAnnotation,
} from '../canvas/WholeManuscriptSurface';
import { INK, RULE, SPACE } from '../studioTheme';

function labelFor(section: WriteStateSection, index: number): string {
  const heading = section.heading?.trim();
  return heading && heading.length > 0 ? heading : `Untitled — ${index + 1}`;
}

function readOnlyWriting(
  sections: readonly WriteStateSection[],
  version: number,
): SectionWriting {
  const readOnly = sections.map((section) => ({ ...section, editable: false }));
  const byId = new Map(readOnly.map((section) => [section.id, section] as const));
  return {
    sections: readOnly,
    activeId: null,
    active: null,
    activeBody: '',
    statusOf: () => 'clean',
    edit: () => {},
    editSection: () => {},
    captureForUnmount: () => false,
    bodyOf: (sectionId) => byId.get(sectionId)?.body ?? '',
    goToSection: () => {},
    hasUnsavedWork: () => false,
    currentRevisionId: () => version,
    flushPending: () => {},
  };
}

export function DevelopManuscriptRail({
  sections, currentSectionId, onSelect,
}: {
  sections: readonly WriteStateSection[];
  currentSectionId: string | null;
  onSelect: (sectionId: string) => void;
}) {
  return (
    <aside
      data-develop-manuscript-rail
      style={{
        width: 240, flexShrink: 0, overflowY: 'auto',
        borderRight: `1px solid ${RULE.soft}`, paddingRight: SPACE.base,
      }}
    >
      <p style={{
        margin: `0 0 ${SPACE.tight}px`, color: INK.quiet,
        fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase',
      }}>
        Manuscript
      </p>
      <div style={{ display: 'grid', gap: 2 }}>
        {sections.map((section, index) => {
          const active = section.id === currentSectionId;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              aria-current={active ? 'location' : undefined}
              data-develop-section={section.id}
              style={{
                border: 0, borderRadius: 6, textAlign: 'left',
                padding: '7px 9px', cursor: 'pointer',
                background: active ? 'var(--ws-ground-active)' : 'transparent',
                color: active ? INK.primary : INK.secondary,
                font: 'inherit', fontSize: 12.5, lineHeight: 1.35,
                fontWeight: active ? 650 : 450,
              }}
            >
              {labelFor(section, index)}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export function DevelopManuscriptSurface({
  sections, version, initialOpenAt, jumpTo, onJumpHandled, onPlaceChange,
  evidenceHighlight = null, evidenceAnnotations = [], onEvidenceAnnotationSelect, manuscriptNote = null,
}: {
  sections: readonly WriteStateSection[];
  version: number;
  initialOpenAt: string | null;
  jumpTo: string | null;
  onJumpHandled: () => void;
  onPlaceChange: (sectionId: string) => void;
  evidenceHighlight?: { sectionId: string; range: CodePointRange } | null;
  evidenceAnnotations?: readonly ReadOnlyPassageAnnotation[];
  manuscriptNote?: { sectionId: string; range: CodePointRange | null; onAnchor: (node: HTMLDivElement | null) => void } | null;
  onEvidenceAnnotationSelect?: (annotation: ReadOnlyPassageAnnotation) => void;
}) {
  const writing = useMemo(() => readOnlyWriting(sections, version), [sections, version]);

  return (
    <div
      data-develop-manuscript
      style={{
        flex: 1, minWidth: 0, minHeight: 0,
        maxWidth: 820, margin: '0 auto', width: '100%',
        fontFamily: 'var(--font-spectral, Georgia, serif)',
        fontSize: 17, lineHeight: 1.72,
      }}
    >
      <WholeManuscriptSurface
        writing={writing}
        initialOpenAt={initialOpenAt}
        jumpTo={jumpTo}
        onJumpHandled={onJumpHandled}
        onPlaceChange={onPlaceChange}
        readOnlyHighlight={evidenceHighlight}
        readOnlyAnnotations={evidenceAnnotations}
        readOnlyNote={manuscriptNote}
        onReadOnlyAnnotationSelect={onEvidenceAnnotationSelect}
      />
    </div>
  );
}
