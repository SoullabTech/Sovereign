import { NextRequest, NextResponse } from 'next/server';
import { recordObservation, listObservations, ObservationContextType, ObservationHorizon } from '@/lib/observation/observationService';
import { requireFounder } from '@/lib/founder/founderAuth';

export const dynamic = 'force-dynamic';

const CONTEXT_TYPES: ReadonlySet<string> = new Set([
  'practitioner', 'member', 'encounter', 'offering',
  'invitation', 'relationship', 'organization', 'community_event',
]);
const HORIZONS: ReadonlySet<string> = new Set(['operational', 'developmental', 'ecological']);

// Build #2A — Witness Surface. Founder-authored witnessing only.
// witnessed_by is derived from the authenticated session, never the body.
// No inferred metadata: every persisted field is human-entered or NULL.
export async function POST(req: NextRequest) {
  const auth = await requireFounder();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();

    const witness_text = typeof body.witness_text === 'string' ? body.witness_text.trim() : '';
    const observation_context_type = body.observation_context_type;

    if (!witness_text || !CONTEXT_TYPES.has(observation_context_type)) {
      return NextResponse.json(
        { error: 'witness_text and a valid observation_context_type are required' },
        { status: 400 }
      );
    }

    const horizon =
      body.horizon && HORIZONS.has(body.horizon) ? (body.horizon as ObservationHorizon) : undefined;
    const observation_context_id =
      typeof body.observation_context_id === 'string' && body.observation_context_id.trim()
        ? body.observation_context_id.trim()
        : undefined;

    const id = await recordObservation({
      witnessed_by: auth.memberId, // server-derived; body.witnessed_by is ignored
      observation_context_type: observation_context_type as ObservationContextType,
      observation_context_id,
      witness_text,
      horizon,
      surface: 'witness',
    });

    return NextResponse.json({ id });
  } catch (err) {
    console.error('[observation] record failed:', err);
    return NextResponse.json({ error: 'failed to record observation' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireFounder();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

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
