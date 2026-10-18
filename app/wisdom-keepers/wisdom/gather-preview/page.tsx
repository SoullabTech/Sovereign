/**
 * Wisdom Keepers → Gather Together · founder-only dormant preview.
 *
 * This page sits under the existing /wisdom-keepers/wisdom route but does NOT
 * link from, import into or change that member-facing page. It is accessible
 * only after BOTH a server-only explicit enablement and a verified founder
 * session/allowlist check. Native static export is excluded.
 *
 * No member signup, Circle access, public directory, actual video link,
 * event data, keeper authorization, provider service or source admission.
 */
import { notFound } from 'next/navigation';
import { requireFounder } from '@/lib/founder/founderAuth';
import WisdomGatherFounderPreview from '@/components/wisdom/WisdomGatherFounderPreview';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WisdomGatherPreviewPage() {
  // This is a SERVER environment switch only; it cannot be supplied in the
  // URL, browser state, member metadata or NEXT_PUBLIC_ configuration.
  // Strictly exclude the current Capacitor static export (CAPACITOR_BUILD=1).
  if (process.env.MAIA_WISDOM_GATHER_PREVIEW_ENABLED !== '1'
      || process.env.CAPACITOR_BUILD === '1'
      || process.env.CAPACITOR_BUILD === 'true') {
    notFound();
  }

  const founder = await requireFounder();
  if (!founder.ok) {
    notFound();
  }

  return <WisdomGatherFounderPreview />;
}
