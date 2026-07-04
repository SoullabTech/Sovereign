import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getMemberIdFromSessionToken } from '@/lib/auth/getMemberFromRequest';
import { getPortraitById } from '@/lib/soulPortrait/portraitStore';
import { SoulPortraitRenderer } from '@/components/soulPortrait/SoulPortraitRenderer';

/**
 * Private practitioner preview — /soul-portrait/preview/[id]
 *
 * Practitioner-only surface for reviewing a generated DRAFT before an in-session
 * use. It refuses four things by construction:
 *   · no client access      — owner-only; any non-owner (or no session) → 404
 *   · no consent recording   — a preview writes nothing to the consent ledger
 *   · no publishing          — noindex; draft stays pending/unpublished
 *   · no Gate-4 reuse        — this is not a delivery link; there is no self-serve path
 *
 * Deliberately does NOT render the Mentor or any client-facing coda.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Soul Portrait — Private Preview',
};

export default async function PortraitPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Owner-only. Resolve the member from a verified session cookie; anything else → 404.
  const token = (await cookies()).get('maia_session')?.value;
  const memberId = await getMemberIdFromSessionToken(token);
  if (!memberId) notFound();

  const portrait = await getPortraitById(id);
  if (!portrait || portrait.ownerMemberId !== memberId) notFound();

  return (
    <div>
      <div
        style={{
          background: '#1A2F24',
          color: '#EAF2EC',
          padding: '10px 16px',
          fontSize: 13,
          textAlign: 'center',
          letterSpacing: '0.02em',
        }}
      >
        Private practitioner preview — draft, not published, not shared. For your preparation only.
      </div>
      <SoulPortraitRenderer portrait={portrait.immutableText} />
    </div>
  );
}
