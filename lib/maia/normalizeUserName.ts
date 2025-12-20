// backend: lib/maia/normalizeUserName.ts
export function normalizeUserName(input?: string | null): string | null {
  const name = (input ?? '').trim();
  if (!name) return null;

  const lower = name.toLowerCase();
  const blocked = new Set([
    'guest',
    'explorer',
    'anonymous',
    'visitor',
    'user',
    'friend',
    'buddy',
  ]);

  if (blocked.has(lower)) return null;
  return name;
}
