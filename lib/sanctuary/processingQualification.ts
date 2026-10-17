/**
 * RF01 S1-A — hold protected processing until independent provider, voice,
 * diagnostics, memory and erasure qualification.
 *
 * Per-turn storage exclusion (S0-B) is NOT evidence that a model or voice
 * provider will avoid recording the content of that turn.
 *
 * This is a hard, non-configurable refusal. A request flag, environment
 * toggle, local settings preference, or ordinary consent receipt cannot
 * weaken it. A future separately verified processing grant needs its own
 * scoped implementation, source custody, and release acceptance.
 */
export const SANCTUARY_PROCESSING_HOLD = 'SANCTUARY_PROCESSING_UNQUALIFIED' as const;

export class SanctuaryProcessingUnqualified extends Error {
  readonly code = SANCTUARY_PROCESSING_HOLD;

  constructor() {
    super(SANCTUARY_PROCESSING_HOLD);
    this.name = 'SanctuaryProcessingUnqualified';
  }
}

/** Content-free. The decision can be made before reading or acting on text. */
export function requireQualifiedConversationProcessing(input: {
  sanctuary: boolean;
}): void {
  if (input.sanctuary) throw new SanctuaryProcessingUnqualified();
}

/** For HTTP routes: generic refusal, no echo of member-authored content. */
export function protectedProcessingRefusal(): {
  error: typeof SANCTUARY_PROCESSING_HOLD;
  action: 'WAIT_FOR_VERIFIED_PRIVATE_PROCESSING';
  message: string;
} {
  return {
    error: SANCTUARY_PROCESSING_HOLD,
    action: 'WAIT_FOR_VERIFIED_PRIVATE_PROCESSING',
    message: 'Sanctuary conversation processing is not yet available. No message was sent to MAIA.',
  };
}
