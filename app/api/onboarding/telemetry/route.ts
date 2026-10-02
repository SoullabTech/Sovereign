import { NextRequest, NextResponse } from 'next/server';
import { recordOnboarding } from '@/lib/onboarding/telemetry';
import type { TelemetryPayload } from '@/lib/onboarding/telemetryTypes';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as TelemetryPayload;
    if (!payload?.event) {
      return NextResponse.json({ error: 'event_required' }, { status: 400 });
    }
    await recordOnboarding(payload);
    return NextResponse.json({ accepted: true }, { status: 202 });
  } catch {
    // Onboarding must never fail because telemetry failed.
    return NextResponse.json({ accepted: false }, { status: 202 });
  }
}
