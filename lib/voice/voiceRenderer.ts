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

export interface VoiceRenderInput {
  userId?: string;
  sessionId?: string;
  mode?: MaiaMode;
  contentDraft: string;
  canonSegments?: unknown;
  engine?: { kind: 'local' | 'claude'; model?: string };
  guardrails?: {
    noNewFacts?: boolean;
    preserveCanonVerbatim?: boolean;
    maxLengthMultiplier?: number;
    forbidNewNumbers?: boolean;
    forbidNewProperNouns?: boolean;
    allowGentleFraming?: boolean;
  };
  consent?: { allowRemoteRenderer?: boolean };
  rules?: unknown;
  wrapOnly?: boolean;
}

export interface VoiceRenderOutput {
  renderedText: string;
  compliance: {
    noFactsAdded: boolean;
    canonPreserved: boolean;
    lengthCompliant: boolean;
  };
  metrics: {
    inputLength: number;
    outputLength: number;
    processingTimeMs: number;
  };
}

export async function renderVoice(
  input: VoiceRenderInput | string,
  _opts?: VoiceRenderOptions
): Promise<VoiceRenderOutput | string> {
  // Handle object input (new signature used by chat route)
  if (typeof input === 'object' && input !== null) {
    const contentDraft = input.contentDraft || '';
    return {
      renderedText: contentDraft,
      compliance: {
        noFactsAdded: true,
        canonPreserved: true,
        lengthCompliant: true,
      },
      metrics: {
        inputLength: contentDraft.length,
        outputLength: contentDraft.length,
        processingTimeMs: 0,
      },
    };
  }

  // Legacy string input (backward compatibility)
  return input as string;
}
