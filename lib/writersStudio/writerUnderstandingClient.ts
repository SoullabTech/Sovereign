import { apiFetch } from '@/lib/http/apiBase';
import type { WriterUnderstanding, WriterUnderstandingDraft } from './writerUnderstanding';

export async function fetchWriterUnderstanding(workId: string): Promise<
  { ok: true; understanding: WriterUnderstanding } | { ok: false; refusal: string }
> {
  try {
    const res = await apiFetch(
      `/api/sovereign/living-works/${encodeURIComponent(workId)}/writer-understanding`,
      { method: 'GET' },
    );
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.understanding) {
      return { ok: false, refusal: typeof body?.error === 'string' ? body.error : `http_${res.status}` };
    }
    return { ok: true, understanding: body.understanding as WriterUnderstanding };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}

export async function saveWriterUnderstanding(
  workId: string,
  draft: WriterUnderstandingDraft,
): Promise<
  { ok: true; understanding: WriterUnderstanding } | { ok: false; refusal: string }
> {
  try {
    const res = await apiFetch(
      `/api/sovereign/living-works/${encodeURIComponent(workId)}/writer-understanding`,
      {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(draft),
      },
    );
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.understanding) {
      return { ok: false, refusal: typeof body?.error === 'string' ? body.error : `http_${res.status}` };
    }
    return { ok: true, understanding: body.understanding as WriterUnderstanding };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}
