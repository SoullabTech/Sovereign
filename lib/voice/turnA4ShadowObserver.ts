import { CONVERSATIONAL_SPACE_CONFIG, type ConversationalSpace } from './turnTaking';
import { decideTurnOwnershipCandidate03 } from './turnOwnershipCandidate03';

export type A4ShadowContext = {
  source: string;
  conversationalSpace: ConversationalSpace;
  floorMs: number;
  semanticIncomplete?: number | null;
  semanticYield?: number | null;
  semanticCueCount: number;
  semanticTopCue: string;
};

export type A4ShadowEvent =
  | { type: 'checkpoint'; checkpoint: 'floor' | 'ceiling'; silenceMs: number; floorMs: number; ceilingMs: number; candidateDecision: 'wait' | 'yield_candidate'; source: string; conversationalSpace: ConversationalSpace; semanticCueCount: number; semanticTopCue: string }
  | { type: 'continued'; pauseMs: number; source: string; conversationalSpace: ConversationalSpace }
  | { type: 'explicit_yield'; pauseMs: number | null; floorMs: number; ceilingMs: number; source: string; conversationalSpace: ConversationalSpace; semanticCueCount: number; semanticTopCue: string };

type Timer = ReturnType<typeof setTimeout>;

export class TurnA4ShadowObserver {
  private pauseStartedAt = 0;
  private floorTimer: Timer | null = null;
  private ceilingTimer: Timer | null = null;

  constructor(private readonly emit: (event: A4ShadowEvent) => void) {}

  private clearTimers(): void {
    if (this.floorTimer) clearTimeout(this.floorTimer);
    if (this.ceilingTimer) clearTimeout(this.ceilingTimer);
    this.floorTimer = null;
    this.ceilingTimer = null;
  }

  private window(ctx: A4ShadowContext): { floorMs: number; ceilingMs: number } {
    const floorMs = Math.max(0, ctx.floorMs);
    const ceilingMs = Math.max(floorMs, CONVERSATIONAL_SPACE_CONFIG[ctx.conversationalSpace].adaptiveCeilingMs);
    return { floorMs, ceilingMs };
  }

  notePauseStarted(ctx: A4ShadowContext, now = Date.now()): void {
    this.clearTimers();
    this.pauseStartedAt = now;
    const { floorMs, ceilingMs } = this.window(ctx);
    const checkpoint = (kind: 'floor' | 'ceiling', silenceMs: number) => {
      const result = decideTurnOwnershipCandidate03({
        explicitFloorHeld: false,
        speechActive: false,
        silenceMs,
        selectedSilenceMs: floorMs,
        conversationalSpace: ctx.conversationalSpace,
        semanticIncomplete: ctx.semanticIncomplete,
        semanticYield: ctx.semanticYield,
      });
      this.emit({
        type: 'checkpoint', checkpoint: kind, silenceMs, floorMs, ceilingMs,
        candidateDecision: result.decision, source: ctx.source,
        conversationalSpace: ctx.conversationalSpace,
        semanticCueCount: ctx.semanticCueCount, semanticTopCue: ctx.semanticTopCue,
      });
    };
    this.floorTimer = setTimeout(() => checkpoint('floor', floorMs), floorMs);
    if (ceilingMs > floorMs) this.ceilingTimer = setTimeout(() => checkpoint('ceiling', ceilingMs), ceilingMs);
  }

  noteSpeechResumed(ctx: A4ShadowContext, now = Date.now()): void {
    if (this.pauseStartedAt <= 0) return;
    const pauseMs = Math.max(0, now - this.pauseStartedAt);
    if (pauseMs >= 250) this.emit({ type: 'continued', pauseMs, source: ctx.source, conversationalSpace: ctx.conversationalSpace });
    this.cancel();
  }

  noteExplicitYield(ctx: A4ShadowContext, now = Date.now()): void {
    const { floorMs, ceilingMs } = this.window(ctx);
    const pauseMs = this.pauseStartedAt > 0 ? Math.max(0, now - this.pauseStartedAt) : null;
    this.emit({
      type: 'explicit_yield', pauseMs, floorMs, ceilingMs, source: ctx.source,
      conversationalSpace: ctx.conversationalSpace,
      semanticCueCount: ctx.semanticCueCount, semanticTopCue: ctx.semanticTopCue,
    });
    this.cancel();
  }

  cancel(): void {
    this.clearTimers();
    this.pauseStartedAt = 0;
  }
}
