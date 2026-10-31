import type { Metadata } from 'next';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { resolveProStudioEntrance } from '@/lib/house/entrance';
import { learnAndTryGroups } from '@/lib/proStudio/learnAndTry';
import { LearnAndTryView } from '@/components/pro-studio/LearnAndTryView';

/**
 * HOUSE-ENTRANCE-01 Stage 1 — the limited learn-and-try Pro Studio introduction.
 *
 * Read-only. No write, no practitioner provisioning, no form, no entitlement
 * claim. It reads the session only to know whether to offer "sign in" or the MAIA
 * conversation; it reads no member data and never reads `members.tier`, a
 * practitioner row or `studioMode`. The paid entitlement source does not exist
 * yet, so every visitor is passed as 'absent' (design brief §9).
 *
 * Deliberately a SIBLING of /pro-studio/reflect: it does not link to it, share its
 * beta flag, or unlock it.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pro Studio — an introduction',
  description: 'What Pro Studio is, what the full studio holds, and what you can do today.',
};

export default async function ProStudioIntroduction() {
  const session = await getCurrentSession();
  // Stage 1 has no verified entitlement source, so the entitlement is always 'absent';
  // both reachable kinds (signed-out intro, limited try) render this page.
  const entrance = resolveProStudioEntrance({ signedIn: Boolean(session), proStudioEntitlement: 'absent' });
  return <LearnAndTryView signedIn={entrance !== 'signed_out_intro'} groups={learnAndTryGroups()} />;
}
