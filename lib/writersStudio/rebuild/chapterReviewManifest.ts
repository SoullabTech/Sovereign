import { apiFetch } from '@/lib/http/apiBase';
import type { ReviewFailure } from './chapterReview';

export interface ChapterReviewManifest {
  id: string;
  manuscriptId: string;
  chapterRootSectionId: string;
  sectionIds: string[];
  draftRevision: number;
  readingIds: string[];
  failures: ReviewFailure[];
  createdAt: string;
}

export interface ChapterReviewManifestInput {
  chapterRootSectionId: string;
  sectionIds: string[];
  draftRevision: number;
  readingIds: string[];
  failures: ReviewFailure[];
}

export type ManifestSaveOutcome =
  | { ok: true; run: ChapterReviewManifest }
  | { ok: false; refusal: string };
export type ManifestLoadOutcome =
  | { ok: true; run: ChapterReviewManifest | null }
  | { ok: false; refusal: string };
export async function saveChapterReviewManifest(
  manuscriptId: string,
  input: ChapterReviewManifestInput,
): Promise<ManifestSaveOutcome> {
  try {
    const res = await apiFetch(`/api/sovereign/manuscripts/${manuscriptId}/chapter-reviews`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body?.run) return { ok: false, refusal: String(body?.refusal ?? `http_${res.status}`) };
    return { ok: true, run: body.run as ChapterReviewManifest };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}

export async function loadChapterReviewManifest(
  manuscriptId: string,
  chapterRootSectionId: string,
): Promise<ManifestLoadOutcome> {
  try {
    const q = encodeURIComponent(chapterRootSectionId);
    const res = await apiFetch(
      `/api/sovereign/manuscripts/${manuscriptId}/chapter-reviews?chapterRootSectionId=${q}`,
      { method: 'GET' },
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, refusal: String(body?.refusal ?? `http_${res.status}`) };
    return { ok: true, run: (body?.run ?? null) as ChapterReviewManifest | null };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}
