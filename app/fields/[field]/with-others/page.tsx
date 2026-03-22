import { notFound } from 'next/navigation';
import { getFieldBySlug } from '@/lib/masters/registry';
import FieldPathwayPage from '@/components/masters/FieldPathwayPage';

export default async function WithOthersPage({ params }: { params: Promise<{ field: string }> }) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);
  if (!master) notFound();
  return <FieldPathwayPage master={master} portalSlug="with-others" />;
}
