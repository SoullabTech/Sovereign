/**
 * WS2-04B — the section-writing session owner.
 *
 * Exists for one reason: useSectionWriting takes its version and its first
 * active section AT MOUNT and resets only on draftKey. Mounting it with empty
 * sections while write-state loads, then filling it for the same manuscript,
 * would build a session against the loading state — a queue at version 0 with
 * no active section, which never resets because the draft never changed.
 *
 * So the section decision is a MOUNT boundary. This component is rendered only
 * once `mode === 'section_aware'` data is in hand, owns the one session, and
 * hands the same `writing` object to both the outline and the surface. Two
 * sessions would mean clicking a row navigates a hook the canvas is not
 * rendering from.
 */
'use client';

import { useMemo } from 'react';
import { useSectionWriting } from '@/lib/writersStudio/useSectionWriting';
import type { WriteStateSection } from '@/lib/writersStudio/writeStateClient';
import { makeSectionSave } from './SectionWritingSurface';

export default function SectionWritingSession({
  manuscriptId,
  sections,
  version,
  witnessDelayMs,
  children,
}: {
  manuscriptId: string;
  sections: WriteStateSection[];
  version: number;
  witnessDelayMs?: number;
  children: (writing: ReturnType<typeof useSectionWriting>) => React.ReactNode;
}) {
  const save = useMemo(
    () => makeSectionSave(manuscriptId, witnessDelayMs),
    [manuscriptId, witnessDelayMs],
  );
  /* draftKey is the manuscript id: manuscript_working_drafts.manuscript_id is
     UNIQUE, so one manuscript has exactly one working draft for its lifetime. */
  const writing = useSectionWriting(sections, version, save, manuscriptId);
  return <>{children(writing)}</>;
}
