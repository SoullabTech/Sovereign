import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getMemberIdFromSessionToken } from '@/lib/auth/getMemberFromRequest';
import { getOwnedPortrait } from '@/lib/soulPortrait/portraitStore';
import { isPortraitConsentLive } from '@/lib/soulPortrait/consentAccess';
import { SoulPortraitRenderer } from '@/components/soulPortrait/SoulPortraitRenderer';
import { SendPortraitPanel } from '@/components/soulPortrait/SendPortraitPanel';
import { MinorFlagNotice } from '@/components/soulPortrait/MinorFlagNotice';

/**
 * Private practitioner preview — /soul-portrait/preview/[id]
 *
 * Practitioner-only surface for reviewing a generated DRAFT before an in-session
 * use. It refuses three things by construction:
 *   · no client access      — owner-scoped read (getOwnedPortrait); non-owner / no session → 404
 *   · no silent consent      — the send gesture below requires an explicit attestation,
 *                              which is what writes the consent ledger (Gate 4)
 *   · no drive-by publishing — this URL itself is never a delivery link; delivery is
 *                              /soul-portrait/view/[slug], minted only through the send API
 *
 * Owner-scoping is enforced in the STORE (SQL filters by owner_member_id), not by a
 * check here — a non-owner simply gets null. Deliberately does NOT render the Mentor.
 */

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const token = (await cookies()).get('maia_session')?.value;
  const memberId = await getMemberIdFromSessionToken(token);
  const portrait = memberId ? await getOwnedPortrait(id, memberId) : null;
  const name = portrait?.immutableText?.person?.name;
  return {
    robots: { index: false, follow: false },
    title: name ? `${name} — Soul Portrait Preview` : 'Soul Portrait — Private Preview',
  };
}

export default async function PortraitPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Resolve the member from a verified session cookie; no session → 404.
  const token = (await cookies()).get('maia_session')?.value;
  const memberId = await getMemberIdFromSessionToken(token);
  if (!memberId) notFound();

  // Owner-scoped: the store returns null for a portrait this member does not own.
  const portrait = await getOwnedPortrait(id, memberId);
  if (!portrait) notFound();

  const delivered = !!portrait.publishedAt && (await isPortraitConsentLive(portrait.id));
  const subjectName = portrait.immutableText?.person?.name || 'this person';
  // Same two-place check the send route's refusal uses — either marking means "minor".
  const markedMinor = portrait.subjectIsMinor || portrait.immutableText?.person?.isMinor === true;

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
        {delivered
          ? 'Practitioner view — this portrait has been sent; the recipient link is live below.'
          : 'Private practitioner preview — draft, not published, not shared. For your preparation only.'}
      </div>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '12px 16px', display: 'flex', gap: 16, fontSize: 14 }}>
        <a href="/studio/soul-portraits" style={{ color: '#2C5530' }}>← Your Soul Portraits</a>
        {portrait.subjectPersonId && (
          <a href={`/soul-portrait/generate?personId=${portrait.subjectPersonId}`} style={{ color: '#2C5530' }}>
            Regenerate for this client
          </a>
        )}
      </div>
      {markedMinor && (
        <MinorFlagNotice
          portraitSlug={portrait.slug}
          subjectName={subjectName}
          isPublished={!!portrait.publishedAt}
        />
      )}
      <SoulPortraitRenderer portrait={portrait.immutableText} />
      <SendPortraitPanel
        portraitSlug={portrait.slug}
        subjectName={subjectName}
        alreadyPublished={delivered}
        existingPath={delivered ? `/soul-portrait/view/${portrait.slug}` : null}
      />
    </div>
  );
}
