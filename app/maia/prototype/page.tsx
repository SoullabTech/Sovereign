'use client';

/**
 * /maia/prototype — DEV-ONLY Premium Arrival prototype (Package 2).
 *
 * Access: feature flag `arrivalPrototype` (default OFF) AND (founder role OR dev build).
 * Ordinary production members can never reach it — the flag is off by default and the
 * founder role is validated server-side (HttpOnly session), so it cannot be spoofed
 * client-side. The route is also excluded from the iOS static export (web-only).
 *
 * Renders no live conversation/voice/persistence — see ArrivalPrototypeShell + the build
 * brief (docs/plans/MAIA_PREMIUM_PROTOTYPE_PACKAGE2_BUILD_BRIEF_2026-07-22.md).
 */

import ArrivalPrototypeShell from '@/components/maia/prototype/ArrivalPrototypeShell';
import { useFeatureFlags } from '@/lib/utils/feature-flags-client';
import { useSession } from '@/lib/hooks/useSession';
import { DEV_MODE } from '@/lib/constants/dev-mode';

export default function ArrivalPrototypePage() {
  const { flags, isClient } = useFeatureFlags();
  const { isAdmin, isPractitioner } = useSession();
  const isFounder = Boolean(isAdmin || isPractitioner);

  // Avoid SSR/hydration flash: gate only once the client has read flags.
  if (!isClient) return null;

  const allowed = flags.arrivalPrototype && (isFounder || DEV_MODE);
  if (!allowed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0A1628] px-6 text-center text-stone-400">
        <p className="max-w-sm text-sm">
          This surface isn&apos;t available.
        </p>
      </div>
    );
  }

  return <ArrivalPrototypeShell isFounder={isFounder} />;
}
