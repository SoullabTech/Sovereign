import { notFound } from 'next/navigation';
import { getFieldBySlug } from '@/lib/masters/registry';
import PartnerWorkspace from '@/components/masters/PartnerWorkspace';

export const dynamic = 'force-dynamic';

export default async function PartnerViewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);

  // Only available to fields that have partnerSlugs configured
  if (!master || !master.partnerSlugs?.length) notFound();

  return <PartnerWorkspace viewerSlug={slug} />;
}
