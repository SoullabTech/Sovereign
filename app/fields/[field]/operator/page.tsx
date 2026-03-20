import { notFound } from 'next/navigation';
import { getFieldBySlug } from '@/lib/masters/registry';
import NathanOperator from '@/components/masters/NathanOperator';

export default async function OperatorPage({ params }: { params: Promise<{ field: string }> }) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);
  if (!master || slug !== 'nathan') notFound();

  return <NathanOperator master={master} />;
}
