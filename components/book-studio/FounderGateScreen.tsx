/**
 * Founder Gate Screen — server-rendered access denied panel.
 *
 * Shown when a non-founder member tries to access a Book Studio
 * editorial surface (canvas / render / drafts). Distinguishes
 * between "not signed in" (401, sends to /signin) and "signed in
 * but not founder" (403, displays this screen).
 */

import Link from 'next/link';

export interface FounderGateScreenProps {
  reason?: string;
}

export default function FounderGateScreen({ reason }: FounderGateScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1c20] text-amber-100/90">
      <div className="max-w-md text-center px-6">
        <p className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase mb-3">
          Book Studio
        </p>
        <h1 className="text-amber-100/95 text-2xl font-light tracking-wide mb-4">
          Editorial workspace
        </h1>
        <p className="text-amber-200/55 text-sm font-light italic leading-relaxed mb-8">
          This surface is part of Soullab Press's private editorial
          environment. {reason ?? 'Founder access is required.'}
        </p>
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/book-studio/read"
            className="text-amber-200/85 hover:text-amber-100 text-sm tracking-wide underline decoration-amber-300/30 hover:decoration-amber-300/70 underline-offset-4 transition-colors duration-300"
          >
            Read the manuscript →
          </Link>
          <Link
            href="/book-studio"
            className="text-amber-200/55 hover:text-amber-200/85 text-xs tracking-wide transition-colors duration-300"
          >
            Back to Book Studio index
          </Link>
        </div>
      </div>
    </div>
  );
}
