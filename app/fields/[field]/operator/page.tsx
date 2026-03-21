import { notFound } from 'next/navigation';
import { getFieldBySlug } from '@/lib/masters/registry';
import NathanOperatorWithKanban from '@/components/masters/NathanOperatorWithKanban';

export default async function OperatorPage({ params }: { params: Promise<{ field: string }> }) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);
  if (!master || slug !== 'nathan') notFound();

  return <NathanOperatorWithKanban master={master} />;
}
