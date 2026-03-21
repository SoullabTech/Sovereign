import { notFound } from 'next/navigation';
import { getFieldBySlug } from '@/lib/masters/registry';
import PartnerWorkspace from '@/components/masters/PartnerWorkspace';

export const dynamic = 'force-dynamic';

export default async function PartnerViewPage({ params }: { params: Promise<{ field: string }> }) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);
  // Partner workspace currently available only on Kelly's field
  if (!master || slug !== 'kelly') notFound();

  return <PartnerWorkspace />;
}
