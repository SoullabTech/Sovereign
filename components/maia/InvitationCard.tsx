'use client';

import { useState } from 'react';
import { StillAlivePanel } from './StillAlivePanel';
import { OrganizingPrincipleCard } from './OrganizingPrincipleCard';
import type { RepresentationOption } from '@/lib/sovereign/maiaService';

export type { RepresentationOption };

interface InvitationCardProps {
  representations: RepresentationOption[];
  conversationId?: string;
}

export function InvitationCard({ representations, conversationId }: InvitationCardProps) {
  const [accepted, setAccepted] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = representations.filter(r => !dismissed.has(r.id));
  if (visible.length === 0) return null;

  const offer = visible[0];
  if (!offer) return null;

  function dismiss(id: string) {
    setDismissed(prev => new Set(prev).add(id));
    if (accepted === id) setAccepted(null);
  }

  // --- Accepted: render the panel/card for this representation ---
  if (accepted === offer.id) {
    if (offer.type === 'still_alive') {
      return <StillAlivePanel onDismiss={() => setAccepted(null)} />;
    }
    if (offer.type === 'organizing_principle') {
      return (
        <OrganizingPrincipleCard
          representation={offer}
          conversationId={conversationId}
          onDismiss={() => dismiss(offer.id)}
        />
      );
    }
  }

  // --- Invitation prompt ---
  const invitationText =
    offer.type === 'still_alive'
      ? offer.invitationText
      : offer.invitation;

  return (
    <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
      {offer.type === 'organizing_principle' && (
        <p className="text-xs text-white/30 uppercase tracking-widest mb-1.5">
          {offer.title}
        </p>
      )}
      <p className="text-sm text-white/50 mb-2.5 leading-relaxed">
        {invitationText}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setAccepted(offer.id)}
          className="text-xs text-white/60 hover:text-white/90 transition-colors underline underline-offset-2"
        >
          Yes
        </button>
        <button
          onClick={() => dismiss(offer.id)}
          className="text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
