






import { notFound } from 'next/navigation';
import { getFieldBySlug } from '@/lib/masters/registry';
import FieldMaiaCompanion from '@/components/masters/FieldMaiaCompanion';

export default async function FieldMaiaPage({ params }: { params: Promise<{ field: string }> }) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);
  if (!master) notFound();

  return <FieldMaiaCompanion master={master} />;
}
