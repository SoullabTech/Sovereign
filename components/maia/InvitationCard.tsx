'use client';

import { useState } from 'react';
import { StillAlivePanel } from './StillAlivePanel';

export interface RepresentationOption {
  id: string;
  componentId: string;
  questionAnswered: string;
  invitationText: string;
  evidenceSource: string;
  confidence: number;
}

interface InvitationCardProps {
  representations: RepresentationOption[];
}

export function InvitationCard({ representations }: InvitationCardProps) {
  const [accepted, setAccepted] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || representations.length === 0) return null;

  // Only offer the first representation for now (still-alive panel)
  const offer = representations[0];
  if (!offer) return null;

  if (accepted === offer.id) {
    return (
      <StillAlivePanel onDismiss={() => setAccepted(null)} />
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
      <p className="text-sm text-white/50 mb-2.5 leading-relaxed">
        {offer.invitationText}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setAccepted(offer.id)}
          className="text-xs text-white/60 hover:text-white/90 transition-colors underline underline-offset-2"
        >
          Yes
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
