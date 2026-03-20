import { notFound } from 'next/navigation';
import { getFieldBySlug } from '@/lib/masters/registry';
import FieldThreshold from '@/components/masters/FieldThreshold';

export async function generateMetadata({ params }: { params: Promise<{ field: string }> }) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);
  if (!master) return {};
  return {
    title: `${master.name}`,
    description: master.presence.openingLine,
  };
}

export default async function FieldPage({ params }: { params: Promise<{ field: string }> }) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);
  if (!master) notFound();

  return <FieldThreshold master={master} />;
}
