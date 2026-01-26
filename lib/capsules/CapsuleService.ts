// Stub implementations for CapsuleService
// These provide minimal functionality until full implementation is ready

export interface Capsule {
  id: string;
  memberId: string;
  sessionId: string;
  title: string;
  insight: string;
  themes: string[];
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  context?: string;
  createdAt: string;
  isFavorite: boolean;
  reflectionCount: number;
}

const STORAGE_KEY = 'maia_capsules';

function loadCapsules(): Capsule[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCapsulesToStorage(capsules: Capsule[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(capsules));
}

export function saveCapsule(data: {
  memberId: string;
  sessionId: string;
  title: string;
  insight: string;
  themes: string[];
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  context?: string;
}): Capsule {
  const capsule: Capsule = {
    id: `capsule-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    memberId: data.memberId,
    sessionId: data.sessionId,
    title: data.title,
    insight: data.insight,
    themes: data.themes,
    element: data.element,
    context: data.context,
    createdAt: new Date().toISOString(),
    isFavorite: false,
    reflectionCount: 0,
  };

  const capsules = loadCapsules();
  capsules.unshift(capsule);
  saveCapsulesToStorage(capsules);

  return capsule;
}

export function getCapsules(): Capsule[] {
  return loadCapsules();
}

export function getCapsuleById(id: string): Capsule | undefined {
  return loadCapsules().find(c => c.id === id);
}

export function toggleFavorite(id: string): Capsule | undefined {
  const capsules = loadCapsules();
  const index = capsules.findIndex(c => c.id === id);
  if (index === -1) return undefined;

  capsules[index].isFavorite = !capsules[index].isFavorite;
  saveCapsulesToStorage(capsules);

  return capsules[index];
}

export function deleteCapsule(id: string): boolean {
  const capsules = loadCapsules();
  const index = capsules.findIndex(c => c.id === id);
  if (index === -1) return false;

  capsules.splice(index, 1);
  saveCapsulesToStorage(capsules);

  return true;
}

export function recordReflection(id: string): Capsule | undefined {
  const capsules = loadCapsules();
  const index = capsules.findIndex(c => c.id === id);
  if (index === -1) return undefined;

  capsules[index].reflectionCount++;
  saveCapsulesToStorage(capsules);

  return capsules[index];
}
