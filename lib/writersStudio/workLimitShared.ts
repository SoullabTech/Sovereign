/**
 * Free new-Work limit — the parts the browser also needs (no database imports). Server logic: ./workLimit.ts.
 * Founder rulings 2026-11-02 "ONE-WORK FREE" and 2026-11-13 "Free limits NEW Works only".
 */
export const FREE_WORK_LIMIT_CODE = 'free_work_limit';

/** What the writer reads. States the fact; promises nothing; says nothing was lost. */
export const FREE_WORK_LIMIT_MESSAGE =
  'Starting another Work is part of Writer’s Studio Pro. Nothing was changed, and every Work you already have is still yours to open, write, and export.';

/** Thrown by a client when the server refused a new Work for the Free limit (403 with code free_work_limit). */
export class FreeWorkLimitError extends Error {
  readonly code = FREE_WORK_LIMIT_CODE;
  constructor() { super(FREE_WORK_LIMIT_CODE); }
}

/** Reads a failed response: a FreeWorkLimitError when it is the Free limit, otherwise null. */
export async function freeWorkLimitFrom(response: Response): Promise<FreeWorkLimitError | null> {
  if (response.status !== 403) return null;
  const body = (await response.clone().json().catch(() => null)) as { code?: unknown } | null;
  return body?.code === FREE_WORK_LIMIT_CODE ? new FreeWorkLimitError() : null;
}

/** The writer-facing message for a failed create: the Free-limit message when that is the cause, else `fallback`. */
export function workLimitMessageOr(error: unknown, fallback: string): string {
  return error instanceof FreeWorkLimitError ? FREE_WORK_LIMIT_MESSAGE : fallback;
}
