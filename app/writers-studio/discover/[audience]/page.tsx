import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDoorway, getDoorwayAudience } from '@/lib/constellation/doorways';
import { WriterDoorway } from '../WriterDoorway';

const doorway = getDoorway('writers-studio');

export function generateStaticParams() {
  return doorway.audiences.map((audience) => ({ audience: audience.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ audience: string }>;
}): Promise<Metadata> {
  const { audience: audienceId } = await params;
  const audience = getDoorwayAudience('writers-studio', audienceId);

  if (!audience) return {};

  return {
    title: `Writer’s Studio for ${audience.label} · Soullab`,
    description: audience.invitation,
  };
}

export default async function WritersStudioAudienceDoorway({
  params,
}: {
  params: Promise<{ audience: string }>;
}) {
  const { audience: audienceId } = await params;
  const audience = getDoorwayAudience('writers-studio', audienceId);

  if (!audience) notFound();

  return <WriterDoorway audienceId={audience.id} />;
}
