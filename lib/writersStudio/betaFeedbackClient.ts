import { apiFetch } from '@/lib/http/apiBase';
import type { BetaFeedbackSignal, BetaOrientationContext } from './betaFeedback';

export async function sendBetaFeedback(input: {
  manuscriptId?: string;
  signal: BetaFeedbackSignal;
  studioMode?: 'home' | 'write' | 'develop' | 'review';
  orientationContext: BetaOrientationContext;
  note?: string;
}): Promise<{ ok: true } | { ok: false; refusal: string }> {
  try {
    const response = await apiFetch('/api/sovereign/writers-studio/beta-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { ok: false, refusal: String(body?.refusal ?? `http_${response.status}`) };
    }
    return { ok: true };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}
