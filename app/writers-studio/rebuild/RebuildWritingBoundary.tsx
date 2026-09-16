'use client';

import { useMemo, type ReactNode } from 'react';
import { useSectionWriting, type SectionWriting } from '@/lib/writersStudio/useSectionWriting';
import { makeSectionSave } from '@/lib/writersStudio/sectionSaveClient';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';

export interface RebuildWritingBoundaryProps {
  manuscriptId: string;
  version: number;
  sections: readonly RebuildSection[];
  initialSectionId: string | null;
  epoch: number;
  children: (writing: SectionWriting) => ReactNode;
}

/**
 * Mount the proven section-native writing session only once the rebuild has a
 * real manuscript snapshot. The experience may change; the save law does not.
 */
export default function RebuildWritingBoundary({
  manuscriptId, version, sections, initialSectionId, epoch, children,
}: RebuildWritingBoundaryProps) {
  const writingSections = useMemo(() => sections.map((section) => ({
    id: section.draftSectionId,
    position: section.position,
    heading: section.heading,
    body: section.body,
    editable: section.editable,
  })), [sections]);
  const save = useMemo(() => makeSectionSave(manuscriptId), [manuscriptId]);

  const writing = useSectionWriting(
    writingSections,
    version,
    save,
    `${manuscriptId}:rebuild:${epoch}`,
    initialSectionId,
  );

  return <>{children(writing)}</>;
}
