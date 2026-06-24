import { notFound } from 'next/navigation';
import { getFieldBySlug } from '@/lib/masters/registry';
import FieldSessionListener from '@/components/masters/FieldSessionListener';

export default async function SessionViewPage({ params }: { params: Promise<{ field: string }> }) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);
  if (!master) notFound();

  return <FieldSessionListener palette={master.palette} />;
}
