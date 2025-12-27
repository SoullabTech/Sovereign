// backend
// Minimal stub to unblock compilation.
// Safe default: returns empty rules (no canon wrapping applied).

export type MaiaMode = 'talk' | 'care' | 'note' | 'scribe' | 'counsel' | string;

export type VoiceCanonLoadResult = {
  doctrine?: string | null;
  rules?: string | null;
};

export async function loadVoiceCanonRules(mode: MaiaMode): Promise<VoiceCanonLoadResult> {
  // Stub: returns no rules, so canon wrapping is a no-op
  return {
    doctrine: null,
    rules: null,
  };
}
