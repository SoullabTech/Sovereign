import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDoorway, getDoorwayAudience } from '@/lib/constellation/doorways';
import { AstrologyDoorway } from '../AstrologyDoorway';

const doorway = getDoorway('astrology');

export function generateStaticParams() {
  return doorway.audiences.map((audience) => ({ audience: audience.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ audience: string }>;
}): Promise<Metadata> {
  const { audience: audienceId } = await params;
  const audience = getDoorwayAudience('astrology', audienceId);
  if (!audience) return {};

  return {
    title: `Astrology for ${audience.label} · Soullab`,
    description: audience.invitation,
  };
}

export default async function AstrologyAudienceDoorway({
  params,
}: {
  params: Promise<{ audience: string }>;
}) {
  const { audience: audienceId } = await params;
  const audience = getDoorwayAudience('astrology', audienceId);
  if (!audience) notFound();

  return <AstrologyDoorway audienceId={audience.id} />;
}
