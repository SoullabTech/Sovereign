// app/astrology/synastry/[analysisId]/page.tsx

import { notFound } from 'next/navigation';
import SynastryViewerClient from '@/components/astrology/synastry/SynastryViewerClient';
import { getSynastryAnalysisById } from '@/lib/astrology/synastry/synastryStore';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ analysisId: string }>;
};

export default async function SynastryAnalysisPage({ params }: PageProps) {
  const { analysisId } = await params;

  const row = await getSynastryAnalysisById(analysisId);
  if (!row) return notFound();

  // Stored result is the persisted API payload
  const payload = row.result as Record<string, unknown>;

  return (
    <SynastryViewerClient
      analysisId={row.id}
      persistedAt={row.created_at}
      updatedAt={row.updated_at}
      initialPayload={payload}
    />
  );
}
