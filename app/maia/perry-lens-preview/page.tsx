/**
 * Glenn Perry founder-only choice preview (WEB-ONLY, not member-facing).
 *
 * Two SERVER gates are required:
 *   1. MAIA_PERRY_FOUNDER_PREVIEW_ENABLED=1 (unset/off by default)
 *   2. requireFounder() — verified server session + FOUNDER_MEMBER_IDS allowlist
 *
 * Neither an admin/practitioner client role nor a query parameter grants entry.
 * The mounted component uses fixed fictional messages and no MAIA network calls.
 *
 * A native static export does not get an operable preview route. No runtime
 * source, member, birth-chart, inference, or copyright permission is granted.
 */
import { notFound } from 'next/navigation';
import { requireFounder } from '@/lib/founder/founderAuth';
import PerryLensFounderPreview from '@/components/maia/knowledge/PerryLensFounderPreview';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PerryLensPreviewPage() {
  // The flag is read exclusively on the server. Never use
  // NEXT_PUBLIC_, browser localStorage, or a caller-supplied preview token.
  if (process.env.MAIA_PERRY_FOUNDER_PREVIEW_ENABLED !== '1'
      || process.env.CAPACITOR_BUILD === '1'
      || process.env.CAPACITOR_BUILD === 'true') {
    notFound();
  }

  const founder = await requireFounder();
  if (!founder.ok) {
    notFound();
  }

  return <PerryLensFounderPreview />;
}
