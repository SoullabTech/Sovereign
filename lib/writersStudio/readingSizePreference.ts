/**
 * Writer-controlled reading display preference only.
 *
 * Shared by the Studio Shell and the isolated editorial room. Device-local
 * storage is presentation, never evidence of account identity or permissions.
 * No Work, document content, selection coordinates or consent is persisted here.
 */
export type StudioReadingSize = 'large' | 'larger' | 'largest';

export const STUDIO_READING_SIZE_KEY = 'soullab.studio.reading-size.v1';
export const STUDIO_READING_SIZE_EVENT = 'soullab:studio-reading-size-change';
export const DEFAULT_STUDIO_READING_SIZE: StudioReadingSize = 'large';

export function isStudioReadingSize(value: unknown): value is StudioReadingSize {
  return value === 'large' || value === 'larger' || value === 'largest';
}

/** Null distinguishes an unset preference from a user's explicit Large choice. */
export function readSavedStudioReadingSize(): StudioReadingSize | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved: unknown = window.localStorage.getItem(STUDIO_READING_SIZE_KEY);
    return isStudioReadingSize(saved) ? saved : null;
  } catch {
    return null;
  }
}

export function readStudioReadingSize(): StudioReadingSize {
  return readSavedStudioReadingSize() ?? DEFAULT_STUDIO_READING_SIZE;
}

/** Local UI act, not a member-data or server mutation. */
export function setStudioReadingSize(size: StudioReadingSize): void {
  if (!isStudioReadingSize(size) || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STUDIO_READING_SIZE_KEY, size);
  } catch {
    // Private browsing may block persistence. The on-screen choice still works.
  }
  window.dispatchEvent(new CustomEvent<StudioReadingSize>(
    STUDIO_READING_SIZE_EVENT, { detail: size },
  ));
}

/**
 * The custom event synchronizes separate components in the same tab.
 * 'storage' synchronizes other tabs; both ignore malformed or unrelated data.
 */
export function subscribeStudioReadingSize(
  onChange: (size: StudioReadingSize) => void,
): () => void {
  if (typeof window === 'undefined') return () => {};
  const localChange = (event: Event) => {
    const size = (event as CustomEvent<StudioReadingSize>).detail;
    if (isStudioReadingSize(size)) onChange(size);
  };
  const remoteChange = (event: StorageEvent) => {
    if (event.key !== STUDIO_READING_SIZE_KEY) return;
    onChange(isStudioReadingSize(event.newValue)
      ? event.newValue : DEFAULT_STUDIO_READING_SIZE);
  };
  window.addEventListener(STUDIO_READING_SIZE_EVENT, localChange);
  window.addEventListener('storage', remoteChange);
  return () => {
    window.removeEventListener(STUDIO_READING_SIZE_EVENT, localChange);
    window.removeEventListener('storage', remoteChange);
  };
}
