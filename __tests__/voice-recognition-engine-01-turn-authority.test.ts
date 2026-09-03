/**
 * VOICE-RECOGNITION-ENGINE-01 · M6 — behavioural proof that recognizer
 * finality does not close the human turn, across both composition models.
 */

import { HumanTurnAssembler } from '@/lib/voice/recognition/humanTurnAuthority';
import type { VoiceTranscript } from '@/lib/voice/contract/MAIAVoiceProvider';

const sid = 'ab12cd34';

function seg(over: Partial<VoiceTranscript> & { text: string }): VoiceTranscript {
  return {
    confidence: 0,
    isFinal: false,
    sessionId: sid,
    ...over,
  };
}

function make() {
  let t = 1000;
  let n = 0;
  return new HumanTurnAssembler({ now: () => (t += 10), idFactory: () => `utt_${++n}` });
}

describe('finalized transcript never completes the turn', () => {
  it('legacy cumulative engine: isFinal keeps the turn open', () => {
    const a = make();
    a.admit(seg({ text: 'I think', stability: 'volatile', composition: 'cumulative', engine: 'legacy_sfspeech', segmentId: 1 }));
    const r = a.admit(seg({ text: 'I think I need to sit with this', isFinal: true, stability: 'finalized', composition: 'cumulative', engine: 'legacy_sfspeech', segmentId: 2 }));
    expect(r.outcome).toBe('admitted');
    expect(r.view.turn).toBe('open');
    expect(r.view.committed).toBe('I think I need to sit with this');
    expect(r.view.pending).toBe('');
  });

  it('SpeechAnalyzer incremental engine: multiple finalized chunks, turn still open', () => {
    const a = make();
    a.admit(seg({ text: 'I think', stability: 'finalized', isFinal: true, composition: 'incremental', engine: 'speech_analyzer_transcriber', segmentId: 1 }));
    a.admit(seg({ text: ' I need', stability: 'volatile', composition: 'incremental', engine: 'speech_analyzer_transcriber', segmentId: 2 }));
    const r = a.admit(seg({ text: ' I need to sit with this', stability: 'finalized', isFinal: true, composition: 'incremental', engine: 'speech_analyzer_transcriber', segmentId: 3 }));
    expect(r.view.turn).toBe('open');
    expect(r.view.text).toBe('I think I need to sit with this');
    expect(r.view.pending).toBe('');
    expect(r.view.engine).toBe('speech_analyzer_transcriber');
  });

  it('the contemplative pause: words arrive after finalization and still belong to the same utterance', () => {
    const a = make();
    a.admit(seg({ text: 'What I keep coming back to', stability: 'finalized', isFinal: true, composition: 'incremental', segmentId: 1 }));
    // three seconds later, the thought continues — no close happened in between
    const r = a.admit(seg({ text: ' is that I was never asked', stability: 'finalized', isFinal: true, composition: 'incremental', segmentId: 2 }));
    expect(r.view.utteranceId).toBe('utt_1');
    expect(r.view.text).toBe('What I keep coming back to is that I was never asked');
  });

  it('a provider without the new fields (isFinal only) is treated as cumulative + stability from isFinal', () => {
    const a = make();
    a.admit(seg({ text: 'hello there' }));
    const r = a.admit(seg({ text: 'hello there friend', isFinal: true }));
    expect(r.view.committed).toBe('hello there friend');
    expect(r.view.turn).toBe('open');
  });
});

describe('only MAIA authority closes the turn', () => {
  it('closeTurn returns the assembled text, records the reason, and rotates the utterance', () => {
    const a = make();
    a.admit(seg({ text: 'I was', stability: 'finalized', isFinal: true, composition: 'incremental', segmentId: 1 }));
    a.admit(seg({ text: ' about to', stability: 'volatile', composition: 'incremental', segmentId: 2 }));
    const closed = a.closeTurn('silence');
    expect(closed).toEqual(expect.objectContaining({
      utteranceId: 'utt_1',
      text: 'I was about to',
      reason: 'silence',
      hadPendingVolatile: true,
    }));
    expect(a.view.utteranceId).toBe('utt_2');
    expect(a.view.text).toBe('');
    expect(a.view.admitted).toBe(0);
  });

  it('closing an empty utterance yields null (no phantom turn)', () => {
    const a = make();
    expect(a.closeTurn('silence')).toBeNull();
    a.admit(seg({ text: '   ', stability: 'finalized', isFinal: true, composition: 'incremental', segmentId: 1 }));
    expect(a.closeTurn('explicit')).toBeNull();
  });

  it('reset discards without producing a turn', () => {
    const a = make();
    a.admit(seg({ text: 'never mind', stability: 'finalized', isFinal: true, segmentId: 1 }));
    a.reset();
    expect(a.view.text).toBe('');
    expect(a.closeTurn('explicit')).toBeNull();
  });
});

describe('admission protections carried over from the repairs', () => {
  it('duplicate admission of the same segment is a no-op', () => {
    const a = make();
    const s = seg({ text: 'again', stability: 'finalized', isFinal: true, composition: 'incremental', segmentId: 1 });
    expect(a.admit(s).outcome).toBe('admitted');
    expect(a.admit(s).outcome).toBe('duplicate');
    expect(a.view.text).toBe('again');
    expect(a.view.admitted).toBe(1);
  });

  it('a late volatile segment behind a finalized higher segmentId is stale', () => {
    const a = make();
    a.admit(seg({ text: 'stable words', stability: 'finalized', isFinal: true, composition: 'incremental', segmentId: 5 }));
    const r = a.admit(seg({ text: 'stale hypothesis', stability: 'volatile', composition: 'incremental', segmentId: 3 }));
    expect(r.outcome).toBe('stale');
    expect(r.view.pending).toBe('');
  });

  it('staleness survives a turn close (segment ids are per session, not per utterance)', () => {
    const a = make();
    a.admit(seg({ text: 'first', stability: 'finalized', isFinal: true, composition: 'incremental', segmentId: 7 }));
    a.closeTurn('silence');
    expect(a.admit(seg({ text: 'ghost', stability: 'volatile', composition: 'incremental', segmentId: 2 })).outcome).toBe('stale');
  });

  it('empty volatile segments are ignored; volatile tail is replaced not appended', () => {
    const a = make();
    expect(a.admit(seg({ text: '', stability: 'volatile', composition: 'incremental', segmentId: 1 })).outcome).toBe('empty');
    a.admit(seg({ text: 'I', stability: 'volatile', composition: 'incremental', segmentId: 2 }));
    a.admit(seg({ text: 'I wonder', stability: 'volatile', composition: 'incremental', segmentId: 3 }));
    expect(a.view.text).toBe('I wonder');
  });
});
