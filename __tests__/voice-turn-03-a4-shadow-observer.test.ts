import { TurnA4ShadowObserver, type A4ShadowEvent } from '@/lib/voice/turnA4ShadowObserver';

describe('TURN-03 A4 explicit-floor shadow observer', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());
  const ctx = { source:'test', conversationalSpace:'natural' as const, floorMs:3500, semanticIncomplete:null, semanticYield:null, semanticCueCount:0, semanticTopCue:'none' };

  it('observes the Natural floor and existing ceiling without any send authority', () => {
    const events:A4ShadowEvent[]=[]; const o=new TurnA4ShadowObserver(e=>events.push(e));
    o.notePauseStarted(ctx, 1000);
    jest.advanceTimersByTime(3499); expect(events).toHaveLength(0);
    jest.advanceTimersByTime(1); expect(events[0]).toMatchObject({type:'checkpoint',checkpoint:'floor',candidateDecision:'wait',floorMs:3500,ceilingMs:6000});
    jest.advanceTimersByTime(2500); expect(events[1]).toMatchObject({type:'checkpoint',checkpoint:'ceiling',candidateDecision:'yield_candidate',silenceMs:6000});
  });

  it('records continuation and cancels old checkpoints when speech resumes', () => {
    const events:A4ShadowEvent[]=[]; const o=new TurnA4ShadowObserver(e=>events.push(e));
    o.notePauseStarted(ctx,1000); o.noteSpeechResumed(ctx,5000);
    expect(events[0]).toMatchObject({type:'continued',pauseMs:4000});
    jest.advanceTimersByTime(3500); expect(events.filter(e=>e.type==='checkpoint')).toHaveLength(0);
  });

  it('records explicit yield as ground truth and stops observation', () => {
    const events:A4ShadowEvent[]=[]; const o=new TurnA4ShadowObserver(e=>events.push(e));
    o.notePauseStarted(ctx,1000); o.noteExplicitYield(ctx,5200);
    expect(events[0]).toMatchObject({type:'explicit_yield',pauseMs:4200,floorMs:3500,ceilingMs:6000});
    jest.advanceTimersByTime(10000); expect(events).toHaveLength(1);
  });

  it('lets semantic continuation keep the member floor at the ceiling', () => {
    const events:A4ShadowEvent[]=[]; const o=new TurnA4ShadowObserver(e=>events.push(e));
    o.notePauseStarted({...ctx,semanticIncomplete:.9,semanticCueCount:1,semanticTopCue:'dangling_syntax'},1000);
    jest.advanceTimersByTime(6000);
    expect(events.at(-1)).toMatchObject({type:'checkpoint',checkpoint:'ceiling',candidateDecision:'wait',semanticTopCue:'dangling_syntax'});
  });
});
