// Legacy route only. Do not rebuild auth or threshold UI here.
// Canonical entry/auth surface is /signin.
//
// /begin was deprecated 2026-05-16 after the salvage check determined
// /signin already carries the canonical threshold function (navy
// palette, holoflower, "Your space is waiting." subtitle, EthosFooter
// copy, biometric register, password reset). Keep this redirect so
// legacy bookmarks and any not-yet-updated callers continue to resolve.

import { redirect } from 'next/navigation';

export default function BeginPage() {
  redirect('/signin');
}
