'use client';

import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useSectionWriting, type SectionWriting } from '@/lib/writersStudio/useSectionWriting';
import { makeSectionSave } from '@/lib/writersStudio/sectionSaveClient';
import type { SaveFn } from '@/lib/writersStudio/sectionSaveQueue';
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
/** Lowercase-hex SHA-256 of the exact UTF-8 bytes of a body; null if unavailable. */
async function sha256Hex(body: string): Promise<string | null> {
  try {
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
    return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return null;
  }
}

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
  /* A1-LS1 · R3 — THE OBSERVED-BODY DIGESTS. For each section, SHA-256 of the
     body exactly as the context route delivered it, advanced to the exact body
     this session last saved successfully. Computed ahead of time so a save
     reads it synchronously (the page-hide save must dispatch at once). A
     section whose digest is not ready sends none, and the server then applies
     the stricter draft-version rule: a missing digest can only make a save
     MORE cautious, never less. Held in memory only; never stored, never shown. */
  const observed = useRef(new Map<string, string>());
  /* Sections whose observed state a successful save has already advanced: the
     mount-time digest of the delivered body resolves asynchronously and must
     never land on top of them, however late it resolves. */
  const advanced = useRef(new Set<string>());
  useEffect(() => {
    let cancelled = false;
    const map = observed.current;
    map.clear();
    for (const s of sections) {
      void sha256Hex(s.body).then((digest) => { if (!cancelled && digest && !advanced.current.has(s.draftSectionId)) map.set(s.draftSectionId, digest); });
    }
    return () => { cancelled = true; };
    // The boundary is remounted per draft/epoch; the initial bodies are the observed state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* A1-LS1 · R4 — saves that fit the request budget ride `keepalive`, so the
     save the page-hide flush dispatches can outlive the page. */
  const save = useMemo<SaveFn>(() => {
    const send = makeSectionSave(manuscriptId, undefined, { keepalive: true });
    return async (sectionId, body, baseVersion) => {
      const outcome = await send(sectionId, body, baseVersion, observed.current.get(sectionId) ?? null);
      if (outcome.ok) {
        /* The observed state is now exactly the body just saved. Its digest
           comes back with the acknowledgement and is set synchronously, so
           acknowledgements — which the queue serializes — decide the observed
           state in the order they happened; no computation left to resolve
           can reorder them. Without a returned digest the old one is dropped
           and this section falls back to the version rule: never a stale
           observation asserted. */
        advanced.current.add(sectionId);
        if (outcome.observedBodySha256) observed.current.set(sectionId, outcome.observedBodySha256);
        else observed.current.delete(sectionId);
      }
      return outcome;
    };
  }, [manuscriptId]);

  const writing = useSectionWriting(
    writingSections,
    version,
    save,
    `${manuscriptId}:rebuild:${epoch}`,
    initialSectionId,
  );

  /* A1-LS1 · R4 — GUARDED DEPARTURE. While any text in this draft is not yet
     acknowledged by the server — staged, queued, in flight, or held in a
     conflict — leaving the page asks first. The guard lifts only when every
     change has been acknowledged; a save merely attempted does not lift it.
     No copy of the writer's prose is kept anywhere in the browser: the only
     places it may live are the page itself and the server. */
  const writingRef = useRef(writing);
  writingRef.current = writing;
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => {
      if (!writingRef.current.hasUnsavedWork()) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, []);

  return <>{children(writing)}</>;
}
