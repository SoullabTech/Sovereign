import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getDeliveredPortraitBySlug } from '@/lib/soulPortrait/portraitStore';
import { isPortraitConsentLive } from '@/lib/soulPortrait/consentAccess';
import { SoulPortraitRenderer } from '@/components/soulPortrait/SoulPortraitRenderer';
import { SoulPortraitColophon } from '@/components/soulPortrait/SoulPortraitColophon';

export const dynamic = 'force-dynamic';

/**
 * Delivered Soul Portrait — /soul-portrait/view/[slug]  (Path B Gate 4)
 *
 * The recipient-facing surface: readable by a NON-MEMBER holding the link.
 * Two structural gates, both of which must pass, or 404:
 *   1. published_at IS NOT NULL   (the store's delivery read refuses drafts)
 *   2. ledger consent-liveness    (revoke in the ledger kills the page instantly)
 * The un-guessable slug is defense-in-depth, never the gate.
 *
 * The gift stays finished: no Mentor, no MAIA, no memory, no signup funnel, no capture.
 * Unlisted + noindex — a hand-delivered door, not a marketing page.
 *
 * After the portrait is unquestionably complete, this surface — never the renderer —
 * appends a quiet colophon (SoulPortraitColophon) that names its origin and offers one
 * door onward, the way a printed book closes on a plain imprint page. A second gift,
 * not the tail of the first: no "sign up", no "unlock", nothing implying the portrait
 * was incomplete without joining. The portrait reads whole even if the reader never
 * clicks. (Founder ruling — Kelly, 2026-07-24.)
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // SAME gates as the page: published AND consent-live. A revoked portrait must
  // not leak even its subject's NAME through the title tag.
  const portrait = await getDeliveredPortraitBySlug(slug);
  const live = portrait ? await isPortraitConsentLive(portrait.id) : false;
  const name = live ? portrait?.immutableText?.person?.name : null;
  return {
    title: name ? `${name} — A Spiralogic Soul Portrait` : 'Soul Portrait',
    description: 'A human-centered, symbolic soul portrait — patterns to work with, never a prediction.',
    robots: { index: false, follow: false },
  };
}

export default async function DeliveredSoulPortraitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const portrait = await getDeliveredPortraitBySlug(slug);
  if (!portrait) notFound();

  // The gate: consent must be live in the ledger, right now. Fails closed.
  const live = await isPortraitConsentLive(portrait.id);
  if (!live) notFound();

  return (
    <>
      <SoulPortraitRenderer portrait={portrait.immutableText} />
      <SoulPortraitColophon />
    </>
  );
}
