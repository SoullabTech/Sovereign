import { notFound } from 'next/navigation';
import { getFieldBySlug } from '@/lib/masters/registry';
import FieldPresencePage from '@/components/masters/FieldPresencePage';

export default async function PresencePage({ params }: { params: Promise<{ field: string }> }) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);
  if (!master) notFound();
  return <FieldPresencePage master={master} />;
}
