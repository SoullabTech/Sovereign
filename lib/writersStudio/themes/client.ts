import { apiFetch } from '@/lib/http/apiBase';
import type { LiveThemesPayload, ThemeMutation } from './liveTypes';

export type ThemesFetchOutcome =
  | { ok: true; payload: LiveThemesPayload }
  | { ok: false; refusal: string };

export async function fetchLiveThemes(manuscriptId: string): Promise<ThemesFetchOutcome> {
  try {
    const res = await apiFetch(
      `/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/themes`,
      { method: 'GET' },
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, refusal: String(body?.refusal ?? body?.error ?? `http_${res.status}`) };
    }
    const payload = await res.json() as LiveThemesPayload;
    if (!payload || payload.manuscriptId !== manuscriptId) {
      return { ok: false, refusal: 'malformed' };
    }
    return { ok: true, payload };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}
export type ThemeMutationOutcome =
  | { ok: true; themeId?: string }
  | { ok: false; refusal: string };

export async function mutateTheme(
  manuscriptId: string,
  mutation: ThemeMutation,
): Promise<ThemeMutationOutcome> {
  try {
    const res = await apiFetch(
      `/api/sovereign/manuscripts/${encodeURIComponent(manuscriptId)}/themes`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(mutation),
      },
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, refusal: String(body?.refusal ?? `http_${res.status}`) };
    return {
      ok: true,
      ...(typeof body?.themeId === 'string' ? { themeId: body.themeId } : {}),
    };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}
