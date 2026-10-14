'use client';

import Link from 'next/link';
import type { PracticeHomeStanding } from '@/lib/studio/practiceHomeLoad';

/**
 * R1b — one truthful Practice failure state.
 * Does not imply that a client's records are absent when transport fails.
 */
export function PracticeHomeLoadNotice({
  standing,
  onRetry,
}: {
  standing: Exclude<PracticeHomeStanding, 'ready'>;
  onRetry: () => void;
}) {
  const signedOut = standing === 'signed-out';
  const forbidden = standing === 'forbidden';
  const title = signedOut ? 'Sign in to view your practice.'
    : forbidden ? 'Your practice access could not be confirmed.'
    : 'Your practice could not be loaded.';
  const description = signedOut
    ? 'Sign in again to continue.'
    : forbidden ? 'Your practitioner access needs verification before records can be shown.'
    : 'The records could not be verified. That does not mean your practice is empty.';

  return (
    <main role="alert" className="min-h-screen bg-[#1a1a2e] p-6 text-white">
      <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-amber-500/20 bg-[#1e1e38] p-8">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-4 leading-relaxed text-slate-300">{description}</p>
        {signedOut ? (
          <Link href="/signin" className="mt-7 inline-block rounded-xl bg-amber-500 px-5 py-3 font-medium text-[#1a1a2e]">
            Sign in
          </Link>
        ) : (
          <button type="button" onClick={onRetry}
            className="mt-7 rounded-xl bg-amber-500 px-5 py-3 font-medium text-[#1a1a2e]">
            Try again
          </button>
        )}
      </div>
    </main>
  );
}
