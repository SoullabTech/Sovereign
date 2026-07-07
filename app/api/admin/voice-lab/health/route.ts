/**
 * Admin Voice Lab — live provider reachability probe.
 *
 * The lab forces `providerOverride`, so it does NOT depend on the global
 * MAIA_LOCAL_VOICE_ENABLED flag the way /api/health/local-voice does (that
 * endpoint returns kokoro:null when the flag is off, which is useless here).
 * This route probes each engine's own healthCheck() directly — the truthful
 * answer to "can the Lab reach this provider right now", covering PersonaPlex
 * (which /api/health/local-voice does not).
 *
 * Admin-gated. NOT member-facing. Read-only — no synthesis, no side effects.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin/requireAdmin';
import * as kokoro from '@/lib/tts/providers/kokoro';
import * as sesame from '@/lib/tts/providers/sesame';
import * as personaplex from '@/lib/tts/providers/personaplex';

export const dynamic = 'force-dynamic';

type Status = 'up' | 'down' | 'no-key';
interface ProviderHealth {
  status: Status;
  latencyMs?: number;
  error?: string;
}

async function probe(fn: () => Promise<{ healthy: boolean; error?: string; latencyMs?: number }>): Promise<ProviderHealth> {
  try {
    const r = await fn();
    return { status: r.healthy ? 'up' : 'down', ...(r.latencyMs != null && { latencyMs: r.latencyMs }), ...(r.error && { error: r.error }) };
  } catch (e: any) {
    return { status: 'down', error: e?.message ?? 'probe failed' };
  }
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [kokoroH, sesameH, pplexH] = await Promise.all([
    probe(kokoro.healthCheck),
    probe(sesame.healthCheck),
    probe(personaplex.healthCheck),
  ]);

  const openai: ProviderHealth = process.env.OPENAI_API_KEY
    ? { status: 'up' }
    : { status: 'no-key', error: 'OPENAI_API_KEY not set in this process' };

  return NextResponse.json({
    providers: { openai, kokoro: kokoroH, sesame: sesameH, pplex: pplexH },
  });
}
