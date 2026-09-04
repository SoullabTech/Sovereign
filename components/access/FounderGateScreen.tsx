/**
 * FounderGateScreen — the generic server-rendered refusal panel.
 *
 * WHY THIS EXISTS (founder ruling 2026-09-04): the only refusal screen in the
 * codebase was components/book-studio/FounderGateScreen, written for Soullab
 * Press editorial surfaces — "This surface is part of Soullab Press's private
 * editorial environment", with "Read the manuscript →" and "Back to Book Studio
 * index" as its exits. Three layouts outside Book Studio had adopted it
 * (/labtools, /commons/circles, /voice-controller-test), so a person refused at
 * Lab Tools was told they had reached a book's editorial workspace and offered
 * manuscript navigation.
 *
 * That is a category error, not a copy nit: a refusal is often the only thing a
 * person ever sees of a surface, so it is the one moment the system must name
 * the place correctly. THE CRITERION: someone refused at a surface should
 * understand what that surface is.
 *
 * So identity is a REQUIRED input here. There is no default eyebrow, title or
 * description to fall back on — a caller cannot accidentally inherit somebody
 * else's identity, which is precisely how the Book Studio copy spread.
 *
 * ⛔ Do NOT add surface-specific copy or links to this component. Exits belong
 * to the caller: Book Studio's manuscript links live in its own wrapper
 * (components/book-studio/FounderGateScreen), which passes them in.
 *
 * This changes what a refusal SAYS. It changes no authorization: every caller
 * still decides who is refused, and requireFounder() is untouched.
 */

import Link from 'next/link';

export interface GateExit {
  href: string;
  label: string;
  /** 'primary' is the emphasised way onward; 'secondary' is quieter. */
  emphasis?: 'primary' | 'secondary';
}

export interface FounderGateScreenProps {
  /** Small-caps label naming the surface, e.g. 'Soullab Lab Tools'. */
  eyebrow: string;
  /** What this place is, in one phrase. */
  title: string;
  /** One sentence describing the environment being refused. */
  description: string;
  /** Why access is refused. Keep it factual. */
  reason?: string;
  /** Ways onward that belong to THIS surface. Defaults to a single way back. */
  exits?: GateExit[];
}

const DEFAULT_EXITS: GateExit[] = [
  { href: '/maia', label: 'Back to MAIA', emphasis: 'primary' },
];

export default function FounderGateScreen({
  eyebrow,
  title,
  description,
  reason = 'Founder access is required.',
  exits = DEFAULT_EXITS,
}: FounderGateScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1c20] text-amber-100/90">
      <div className="max-w-md text-center px-6">
        <p className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase mb-3">
          {eyebrow}
        </p>
        <h1 className="text-amber-100/95 text-2xl font-light tracking-wide mb-4">{title}</h1>
        <p className="text-amber-200/55 text-sm font-light italic leading-relaxed mb-8">
          {description} {reason}
        </p>
        <div className="flex flex-col items-center gap-3">
          {exits.map((exit) =>
            exit.emphasis === 'secondary' ? (
              <Link
                key={exit.href}
                href={exit.href}
                className="text-amber-200/55 hover:text-amber-200/85 text-xs tracking-wide transition-colors duration-300"
              >
                {exit.label}
              </Link>
            ) : (
              <Link
                key={exit.href}
                href={exit.href}
                className="text-amber-200/85 hover:text-amber-100 text-sm tracking-wide underline decoration-amber-300/30 hover:decoration-amber-300/70 underline-offset-4 transition-colors duration-300"
              >
                {exit.label}
              </Link>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
