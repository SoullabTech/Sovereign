import Link from 'next/link';
import { SECTIONS, type SectionKey } from '@/lib/og/ogCard';

/**
 * Shared public-section landing shell.
 * ────────────────────────────────────────────────────────────────────────
 * One layout for every PUBLIC-SECTION marketing landing (see
 * docs/ops/SHARE_CARDS.md), so the page a link opens matches the card the
 * link showed: same palette, same eyebrow/title/subtitle from `SECTIONS`
 * in lib/og/ogCard.tsx — copy lives in exactly one place.
 *
 * Server component on purpose: these pages carry outward marketing claims
 * (docs/canon/MARKETING_CLAIM_DISCIPLINE.md) and nothing else — no client
 * state, no auth, no data. Body paragraphs are passed per page and each
 * must pass the three instruments before it ships.
 */

export interface LandingCta {
  label: string;
  href: string;
  primary?: boolean;
}

export function PublicSectionLanding({
  section,
  paragraphs,
  ctas,
}: {
  section: SectionKey;
  paragraphs: string[];
  ctas: LandingCta[];
}) {
  const s = SECTIONS[section];
  return (
    <div
      className="min-h-screen flex flex-col text-[#F3EDE4]"
      style={{ background: 'linear-gradient(135deg, #1A1513 0%, #241C18 60%, #1A1513 100%)' }}
    >
      <main className="flex-1 flex flex-col justify-center px-6 py-20 sm:px-10">
        <div className="w-full max-w-2xl mx-auto">
          <div className="w-24 h-1.5 rounded-full mb-12" style={{ background: s.accent }} />

          <p
            className="text-sm sm:text-base uppercase tracking-[0.35em] mb-6"
            style={{ color: s.accent }}
          >
            {s.eyebrow}
          </p>

          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">{s.title}</h1>

          <p className="text-xl sm:text-2xl text-[#B7ADA0] leading-relaxed mb-12">{s.subtitle}</p>

          <div className="space-y-6 text-base sm:text-lg leading-relaxed text-[#D8D0C4]">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mt-14">
            {ctas.map((cta) => (
              <Link
                key={cta.href}
                href={cta.href}
                className={
                  cta.primary
                    ? 'px-7 py-3.5 rounded-full font-semibold text-[#1A1513] transition-opacity hover:opacity-90'
                    : 'px-7 py-3.5 rounded-full font-semibold border border-[#4A4238] text-[#D8D0C4] transition-colors hover:border-[#8A8177]'
                }
                style={cta.primary ? { background: s.accent } : undefined}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <footer className="px-6 py-8 sm:px-10">
        <div className="w-full max-w-2xl mx-auto flex items-center gap-3 text-sm text-[#8A8177]">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: s.accent }}
          />
          <Link href="/" className="hover:text-[#B7ADA0] transition-colors">
            soullab.life
          </Link>
        </div>
      </footer>
    </div>
  );
}
