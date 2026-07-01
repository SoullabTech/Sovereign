import { NextRequest, NextResponse } from 'next/server';
import { emitSignal, SignalPayload } from '@/lib/observation/observationService';

export async function POST(req: NextRequest) {
  try {
    const body: SignalPayload = await req.json();
    if (!body.signal_type || !body.context_type) {
      return NextResponse.json({ error: 'signal_type and context_type required' }, { status: 400 });
    }
    emitSignal(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
