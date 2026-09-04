/**
 * Book Studio's founder gate — Soullab Press editorial identity.
 *
 * Now a thin wrapper over the generic components/access/FounderGateScreen. The
 * Book Studio copy and its manuscript exits are unchanged; what changed is that
 * they are no longer the only refusal screen in the codebase, so surfaces that
 * are NOT Book Studio can stop borrowing this one's identity (founder ruling
 * 2026-09-04 — /labtools, /commons/circles and /voice-controller-test had all
 * adopted it).
 *
 * ⛔ Use this ONLY from app/book-studio/**. Anywhere else, call the generic
 * screen with your own surface's identity — enforced by
 * components/access/__tests__/gateIdentity.test.ts.
 *
 * Distinguishes "not signed in" (401 → /signin, handled by the caller) from
 * "signed in but not founder" (403 → this screen).
 */

import GateScreen from '@/components/access/FounderGateScreen';

export interface FounderGateScreenProps {
  reason?: string;
}

export default function FounderGateScreen({ reason }: FounderGateScreenProps) {
  return (
    <GateScreen
      eyebrow="Book Studio"
      title="Editorial workspace"
      description="This surface is part of Soullab Press's private editorial environment."
      reason={reason}
      exits={[
        { href: '/book-studio/read', label: 'Read the manuscript →', emphasis: 'primary' },
        { href: '/book-studio', label: 'Back to Book Studio index', emphasis: 'secondary' },
      ]}
    />
  );
}
