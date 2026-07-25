// NOTE: `export const dynamic` MUST be the first statement so Next's static
// route-config analysis detects it. If it sits after a doc comment / imports,
// Next may miss it, statically optimize this page, evaluate the env in a
// sanitized build-time worker (flag reads `undefined`), and 404 unconditionally.
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import DiagClient from './DiagClient';

/**
 * /diag — Mobile Conversation Verification Loop diagnostics surface (TEST-ONLY).
 *
 * SERVER-GATED at REQUEST time (force-dynamic). Renders ONLY when the build /
 * dev-server was started with NEXT_PUBLIC_MOBILE_FAST_LANE=1 (set by
 * scripts/mobile-fast-lane.sh). The check runs on the SERVER against the runtime
 * env — it is NOT client-inlined, so it cannot be toggled from the client and is
 * OFF by default. Without the flag the route returns the normal not-found
 * surface. The force-dynamic literal also causes scripts/capacitor-patch-routes.sh
 * to auto-exclude this route from the Capacitor static export (it greps for the
 * literal) — so it is never shipped in a production/static build, which is the
 * desired default.
 *
 * Spec: docs/engineering/MOBILE_CONVERSATION_VERIFICATION_LOOP.md §2.1, §3
 */
export default function DiagPage() {
  if (process.env.NEXT_PUBLIC_MOBILE_FAST_LANE !== '1') {
    notFound();
  }
  return <DiagClient />;
}
