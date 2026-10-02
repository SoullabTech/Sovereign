import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireMemberId } from '@/lib/auth/session';
import {
  deliverHumanSafetyAlert,
  type HumanSafetySource,
  type HumanSafetySeverity,
} from '@/lib/safety/humanSafetyAlert.server';

const BodySchema = z.object({
  source: z.enum(['maia_crisis', 'teen_crisis', 'teen_abuse', 'stellium_safety']),
  severity: z.enum(['high', 'crisis']),
  crisisType: z.string().max(80).optional(),
  sessionId: z.string().max(160).optional(),
  age: z.number().int().min(0).max(120).optional(),
}).strict();

export async function POST(request: NextRequest) {
  let memberId: string;
  try {
    memberId = await requireMemberId();
  } catch {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid safety alert payload' }, { status: 400 });
  }

  const result = await deliverHumanSafetyAlert({
    memberId,
    source: parsed.source as HumanSafetySource,
    severity: parsed.severity as HumanSafetySeverity,
    crisisType: parsed.crisisType,
    sessionId: parsed.sessionId,
    age: parsed.age,
  });

  if (!result.delivered) {
    return NextResponse.json(
      {
        delivered: false,
        channels: { sms: result.sms, slack: result.slack },
        error: 'No human safety channel accepted the alert',
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    delivered: true,
    channels: { sms: result.sms, slack: result.slack },
  });
}
