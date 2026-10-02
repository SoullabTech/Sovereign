import { apiFetch } from '@/lib/http/apiBase';
import type { WriterCorrection, WriterCorrectionKind } from './writerCorrections';

export type CreateWriterCorrectionResult =
  | { ok: true; correction: WriterCorrection }
  | { ok: false; refusal: string };

export async function createWriterCorrection(input: {
  workId: string;
  threadId: string;
  maiaTurnIndex: number;
  kind: WriterCorrectionKind;
  correction: string;
}): Promise<CreateWriterCorrectionResult> {
  try {
    const response = await apiFetch(
      `/api/sovereign/living-works/${encodeURIComponent(input.workId)}/corrections`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: input.threadId,
          maiaTurnIndex: input.maiaTurnIndex,
          kind: input.kind,
          correction: input.correction,
        }),
      },
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body?.correction) {
      return { ok: false, refusal: String(body?.refusal ?? `http_${response.status}`) };
    }
    return { ok: true, correction: body.correction as WriterCorrection };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}
