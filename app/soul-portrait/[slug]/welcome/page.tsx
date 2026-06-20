import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPortrait, listPortraitSlugs } from '@/lib/soulPortrait/registry';

/**
 * Gift Portrait — opening threshold  (/soul-portrait/[slug]/welcome)
 *
 * The hand-delivered reception page a gift recipient meets FIRST: who this is
 * for, who offers it and in what spirit, a brief non-deterministic framing, and
 * a single door into the portrait itself. Only gift portraits (those with an
 * `offeredBy`) have a threshold; everything else 404s.
 *
 * Posture: noindex + unlisted, like the portrait it opens. The link is handed
 * over personally, never a public opening. No Mentor, no MAIA, no memory — a
 * finished gift with a natural end (it does not invite continuation). Access is
 * granted per-slug by an explicit exact public rule in config/accessMatrix.ts;
 * the general `/soul-portrait/*` gate (login required) stays intact for all else.
 */

export function generateStaticParams() {
  return listPortraitSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const portrait = getPortrait(slug);
  return {
    title: portrait ? `A Soul Portrait — for ${portrait.person.name}` : 'A Soul Portrait',
    description: 'A hand-delivered gift — patterns to recognize, never a forecast.',
    robots: { index: false, follow: false },
  };
}

export default async function GiftThresholdPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portrait = getPortrait(slug);
  // A threshold exists only for an *offered* portrait (gift / parent / legacy).
  if (!portrait || !portrait.offeredBy) notFound();

  const t = portrait.offeredBy.threshold;
  const eyebrow = t?.eyebrow ?? 'A Soul Portrait';
  const forLine = t?.forLine ?? `For ${portrait.person.name}`;
  const attribution =
    t?.attribution ??
    `Offered with love${portrait.offeredBy.giverName ? ` by ${portrait.offeredBy.giverName}` : ''}`;
  const framing =
    t?.framing ??
    'A reflection, not a forecast — patterns to recognize, never a verdict. Keep what rings true; ignore the rest.';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-maia-navy-950 via-maia-navy-900 to-maia-navy-950 px-6 py-24 text-center text-maia-ink-80">
      <div className="w-full max-w-xl">
        <p className="font-raleway text-xs uppercase tracking-[0.3em] text-maia-gold">{eyebrow}</p>
        <h1 className="mt-6 font-cinzel text-3xl text-maia-ink-100 sm:text-4xl">{forLine}</h1>
        <p className="mt-4 font-cormorant text-lg italic text-maia-ink-60">{attribution}</p>
        <p className="mx-auto mt-10 max-w-md font-cormorant text-[1.05rem] leading-relaxed text-maia-ink-80">
          {framing}
        </p>
        <div className="mt-12">
          <Link
            href={`/soul-portrait/${slug}`}
            className="inline-block rounded-full border border-maia-gold/40 bg-maia-navy-850/60 px-8 py-3 font-raleway text-sm uppercase tracking-[0.2em] text-maia-gold shadow-maia-spice-glow transition-colors hover:bg-maia-navy-850"
          >
            Open My Portrait
          </Link>
        </div>
      </div>
    </main>
  );
}
