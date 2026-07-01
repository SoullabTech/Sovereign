import { NextRequest, NextResponse } from 'next/server';
import { recordObservation, listObservations, ObservationContextType, ObservationHorizon } from '@/lib/observation/observationService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.witness_text || !body.observation_context_type) {
      return NextResponse.json(
        { error: 'witness_text and observation_context_type required' },
        { status: 400 }
      );
    }
    const id = await recordObservation(body);
    return NextResponse.json({ id });
  } catch (err) {
    console.error('[observation] record failed:', err);
    return NextResponse.json({ error: 'failed to record observation' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rows = await listObservations({
    context_type: (searchParams.get('context_type') as ObservationContextType) ?? undefined,
    context_id: searchParams.get('context_id') ?? undefined,
    horizon: (searchParams.get('horizon') as ObservationHorizon) ?? undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 50,
    offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
  });
  return NextResponse.json({ observations: rows });
}
