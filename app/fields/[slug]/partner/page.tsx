import { notFound } from 'next/navigation';
import { getFieldBySlug } from '@/lib/masters/registry';
import NathanPartnerPage from '@/components/masters/NathanPartnerPage';

export default async function PartnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);
  if (!master || slug !== 'nathan') notFound();

  return <NathanPartnerPage master={master} />;
}
