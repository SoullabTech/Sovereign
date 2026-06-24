






import { notFound } from 'next/navigation';
import { getFieldBySlug } from '@/lib/masters/registry';
import FieldBeginThreshold from '@/components/masters/FieldBeginThreshold';

/**
 * /fields/[field]/begin
 *
 * The sendable threshold. This is what a master receives —
 * the invitation into their field authoring process.
 *
 * Not an intake form. Not a dashboard. A beginning.
 *
 * Send: jondi.soullab.life/begin
 * Or:   soullab.life/fields/jondi/begin
 */
export default async function FieldBeginPage({
  params,
}: {
  params: Promise<{ field: string }>;
}) {
  const { field: slug } = await params;
  const master = getFieldBySlug(slug);

  if (!master) notFound();

  return <FieldBeginThreshold master={master} />;
}
