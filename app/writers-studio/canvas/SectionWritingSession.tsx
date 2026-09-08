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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSectionWriting } from '@/lib/writersStudio/useSectionWriting';
import type { WriteStateSection } from '@/lib/writersStudio/writeStateClient';
import { locationForSection, readSectionParam } from '@/lib/writersStudio/placeInWork';
import {
  DEFAULT_MANUSCRIPT_VIEW, readManuscriptView, writeManuscriptView,
} from '@/lib/writersStudio/manuscriptViewPreference';
import {
  openingWholeSection, placeForMode, returningSection,
  type ManuscriptViewMode,
} from '@/lib/writersStudio/manuscriptViewPlace';
import { makeSectionSave } from './SectionWritingSurface';

/**
 * WS-WHOLE-MANUSCRIPT-01 — what the session hands its children.
 *
 * The session owns the MODE and the PLACE because both must be single-valued:
 * two owners of "where the writer is" is how a gold row and an address bar end
 * up disagreeing.
 */
export interface ManuscriptSession {
  writing: ReturnType<typeof useSectionWriting>;
  view: ManuscriptViewMode;
  /**
   * Change view. `captureWhole` is the mounted Whole surface's
   * `captureMountedBeforeLeave` when one is mounted.
   *
   * ⛔ The capture happens INSIDE this function, before the view state moves,
   * so the ordering is a property of the seam rather than a discipline every
   * call site has to remember.
   */
  changeView: (next: ManuscriptViewMode, captureWhole?: () => void) => void;
  /** What Whole Manuscript has observed. Null until it observes something. */
  wholePlaceId: string | null;
  onWholePlace: (sectionId: string) => void;
  /** Where Whole should open, when entering it from Section view. */
  wholeOpensAt: string | null;
  /**
   * The place a representational surface may assert, for the view in force.
   * `null` means no place is known — which renderers must not smooth away.
   */
  place: string | null;
}

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
  children: (session: ManuscriptSession) => React.ReactNode;
}) {
  const save = useMemo(
    () => makeSectionSave(manuscriptId, witnessDelayMs),
    [manuscriptId, witnessDelayMs],
  );
  /* draftKey is the manuscript id: manuscript_working_drafts.manuscript_id is
     UNIQUE, so one manuscript has exactly one working draft for its lifetime. */
  /* WS2-05A — the place the URL asked for, read ONCE at mount. Reading it on
     every render would make the address bar fight the member's next click. */
  const requested = useRef<string | null>(
    typeof window === 'undefined' ? null : readSectionParam(window.location.search),
  ).current;

  const writing = useSectionWriting(sections, version, save, manuscriptId, requested);

  /* F-3 bridge — device-local x Work, default Section, read once at mount.
     Reading it on every render would fight the writer's own switch. */
  const [view, setView] = useState<ManuscriptViewMode>(
    () => (typeof window === 'undefined' ? DEFAULT_MANUSCRIPT_VIEW : readManuscriptView(manuscriptId)),
  );
  const [wholePlaceId, setWholePlaceId] = useState<string | null>(null);
  const [wholeOpensAt, setWholeOpensAt] = useState<string | null>(null);

  const changeView = useCallback((next: ManuscriptViewMode, captureWhole?: () => void) => {
    if (next === view) return;
    /* ⭐ CAPTURE FIRST, ALWAYS — the surface about to disappear is read while
       it is still on screen. Leaving Whole unmounts every mounted editor at
       once, with no scroll and no blur to catch it; leaving Section takes the
       one mounted editor with it. Neither may rely on an unmount cleanup. */
    if (view === 'whole') captureWhole?.();
    else writing.flushPending();

    if (next === 'whole') {
      /* Section view's place is unambiguous — one editor is mounted — so it
         transfers as an opening position. */
      setWholeOpensAt(openingWholeSection(writing.activeId));
    } else {
      /* TRANSFER, NEVER INFER. `returningSection` is null when Whole observed
         nothing, and null means "nothing to transfer" — Section stays where it
         was rather than moving the writer somewhere no one observed. */
      const back = returningSection(wholePlaceId);
      if (back && back !== writing.activeId) writing.goToSection(back);
      setWholePlaceId(null);
      setWholeOpensAt(null);
    }
    setView(next);
    /* Best-effort: the view still changes if this fails, because the writer's
       immediate intent outranks whether we could remember it. */
    writeManuscriptView(manuscriptId, next);
  }, [manuscriptId, view, wholePlaceId, writing]);

  const place = placeForMode(view, { sectionActiveId: writing.activeId, wholePlaceId });

  /* Keep the location saying where the member is standing.
     REPLACE, never push: a section click changes place within the Work, not
     browser-level destination, and pushing would turn Back into a walk
     backwards through every section they happened to inspect. This also
     rewrites a stale `s` on first paint, so the URL stops asserting a place
     this draft does not have. */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    /* The URL asserts the MODE-APPROPRIATE place. In Whole view that is what
       Whole observed — never `writing.activeId`, which names the section the
       writer arrived from and would keep `s=` pointing at a place they left. */
    if (place === null) return;
    const next = locationForSection(
      window.location.pathname, window.location.search, place,
    );
    if (next !== window.location.pathname + window.location.search) {
      window.history.replaceState(window.history.state, '', next);
    }
  }, [place]);

  return <>{children({
    writing, view, changeView, wholePlaceId, onWholePlace: setWholePlaceId,
    wholeOpensAt, place,
  })}</>;
}
