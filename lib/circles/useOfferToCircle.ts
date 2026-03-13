'use client';

import { useState } from 'react';

interface OfferArtifact {
  type: string;
  ref: string;
  title: string;
  summary: string;
}

/**
 * Hook for "Offer to Circle" — manages modal state and artifact data.
 * Used across Studio surfaces (Decisions, Changes, Session Room, MAIA).
 */
export function useOfferToCircle() {
  const [open, setOpen] = useState(false);
  const [artifact, setArtifact] = useState<OfferArtifact>({
    type: '',
    ref: '',
    title: '',
    summary: '',
  });

  function offerToCircle(type: string, ref: string, title: string, summary: string) {
    setArtifact({ type, ref, title, summary });
    setOpen(true);
  }

  return { open, setOpen, artifact, offerToCircle };
}
