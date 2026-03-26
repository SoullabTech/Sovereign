import { notFound } from 'next/navigation';
import { getFieldBySlug } from '@/lib/masters/registry';
import NathanStudio from '@/components/masters/NathanStudio';

export default async function StudioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);
  if (!master || slug !== 'nathan') notFound();

  return <NathanStudio master={master} />;
}
