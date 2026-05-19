





import { notFound } from 'next/navigation';
import { getFieldBySlug } from '@/lib/masters/registry';
import NathanSystemsPage from '@/components/masters/NathanSystemsPage';

export default async function SystemsPage({ params }: { params: Promise<{ field: string }> }) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);
  if (!master || slug !== 'nathan') notFound();

  return <NathanSystemsPage master={master} />;
}
