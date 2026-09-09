/**
 * WRITER'S STUDIO — WHOLE-ORGANISM MAIA COGNITION HARNESS · route gate
 *
 * Founder ruling 2026-09-09 (D9 record §30):
 *
 *   If either gate fails, return 404 — not a nice "experimental feature
 *   disabled" page. There is no reason ordinary members need to know the
 *   harness exists yet.
 *
 * ⚠️ Deliberately unlike app/book-studio/workbench/layout.tsx, which redirects
 * 401 → /signin and renders a FounderGateScreen on 403. Both of those disclose
 * that the surface exists. See lib/writers-studio/harnessAccess.ts.
 *
 * The experimental status is in the URL on purpose: /writers-studio/lab/maia
 * sits inside the Writer's Studio namespace — same origin, same authenticated
 * member session, same real MAIA memory, same Work identity — but is not the
 * member-facing production surface, and must not become it from this lane.
 */

import { notFound } from 'next/navigation';
import { requireHarnessAccess } from '@/lib/writers-studio/harnessAccess';

export const dynamic = 'force-dynamic';

export default async function WritersStudioMaiaLabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await requireHarnessAccess();
  if (!access.ok) notFound();
  return <>{children}</>;
}
