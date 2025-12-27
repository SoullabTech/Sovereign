// backend
// Minimal stub to unblock compilation.
// Safe default: returns text unchanged (no voice rendering applied).

export type MaiaMode = 'talk' | 'care' | 'note' | 'scribe' | 'counsel' | string;

export type VoiceRenderOptions = {
  mode?: MaiaMode | null;
  userId?: string | null;
  canonText?: string | null;
  voiceRules?: string | null;
};

export async function renderVoice(
  text: string,
  _opts?: VoiceRenderOptions
): Promise<string> {
  // Stub: returns text unchanged
  return text;
}
