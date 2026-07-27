'use client';

/**
 * /open-in-web
 *
 * Universal fallback page for mobile routes that are web-only.
 * Shown when a user deep-links to a page not shipped in the iOS build.
 *
 * Accepts optional query params:
 *   ?path=/studio/marketing   → deep-link to specific web Studio page
 *   ?label=Marketing          → human-readable section name in the message
 *
 * Also used directly by MobileRouteGuard's <OpenInWebScreen> inline component.
 * This standalone page handles the case where someone navigates to /open-in-web
 * explicitly (e.g. from a native share sheet or push notification fallback).
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { WEB_STUDIO_BASE_URL } from '@/lib/mobile/mobileAllowlist';
import { capacitorHref } from '@/lib/navigation/capacitorNavigate';

function OpenInWebContent() {
  const params = useSearchParams();
  const router = useRouter();

  const path = params.get('path') ?? '';
  const label = params.get('label') ?? 'this tool';
  const webUrl = path ? `${WEB_STUDIO_BASE_URL}${path}` : `${WEB_STUDIO_BASE_URL}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-8 text-center gap-8">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20
                      flex items-center justify-center text-3xl">
        🌐
      </div>

      {/* Message */}
      <div className="flex flex-col gap-3 max-w-xs">
        <h1 className="text-xl font-semibold text-amber-100">
          Available in Web Studio
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {label !== 'this tool'
            ? `${label} is part of the full Studio experience and isn't available in the mobile app.`
            : "This tool is part of the full Studio experience and isn't available in the mobile app."}
        </p>
        <p className="text-xs text-zinc-500">
          Open it in your browser to continue.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a
          href={webUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-6 rounded-xl bg-amber-500/15 border border-amber-500/30
                     text-amber-200 text-sm font-medium text-center
                     hover:bg-amber-500/25 transition-colors active:scale-95"
        >
          Open in Web Studio
        </a>

        <button
          onClick={() => {
            // Native shell: router.push hangs (see lib/navigation/capacitorNavigate.ts)
            const nativeHref = capacitorHref('/maia');
            if (nativeHref) {
              window.location.assign(nativeHref);
              return;
            }
            router.push('/maia');
          }}
          className="w-full py-3 px-6 rounded-xl bg-zinc-900 border border-zinc-800
                     text-zinc-400 text-sm font-medium
                     hover:bg-zinc-800 transition-colors active:scale-95"
        >
          Back to MAIA
        </button>
      </div>
    </div>
  );
}

export default function OpenInWebPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-zinc-950" />
    }>
      <OpenInWebContent />
    </Suspense>
  );
}
