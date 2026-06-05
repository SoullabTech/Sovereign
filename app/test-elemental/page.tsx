// Legacy route only. Do not rebuild the passkey induction / "We've Been
// Expecting You" teal surface here.
//
// /test-elemental was deprecated 2026-06-04. It rendered the teal
// SacredSoulInduction passkey page ("SOULLAB-YOURNAME") + ElementalOrientation,
// which predated the canonical navy auth surface. New-user registration now
// lives on /signup and authentication on /signin (the canonical entry/auth
// surface, per CLAUDE.md). The teal induction page should never appear in the
// Enter MAIA / sign-in / start-fresh flow.
//
// Keep this redirect so the remaining internal callers — onboarding poisoned-ID
// and session-expired fallbacks, /onboarding/youth no-auth bounces, and the
// oauth-success step map — all funnel unauthenticated users to /signin instead
// of the retired teal page. Mirrors the /begin -> /signin deprecation.

import { redirect } from 'next/navigation';

// Force dynamic so redirect() executes at request time instead of being
// captured by Next.js static prerender. /test-elemental is already listed in
// EXCLUDED_DYNAMIC_ROUTES in scripts/capacitor-patch-routes.sh, so this is safe
// for CAPACITOR_BUILD / iOS static export.
export const dynamic = 'force-dynamic';

export default function TestElementalPage() {
  redirect('/signin');
}
