import { historyActionFor } from '../historyActions';
import type { StudioAct } from '../studioHistory';

const act = (over: Partial<StudioAct>): StudioAct => ({
  id: 'a', kind: 'version_kept', at: '2026-09-07T18:00:00.000Z',
  workTitle: null, manuscriptTitle: null, manuscriptId: null, detail: null, note: null, ...over,
});
const ms = (id: string, title = 'T') => ({ id, title }) as any;
const work = (id: string, ids: string[]) => ({ id, expressions: ids.map((i) => ({ expressionType: 'manuscript', expressionId: i })) }) as any;

describe('what a History line may do', () => {
  it('is read-only when the act names no manuscript', () => {
    expect(historyActionFor(act({}), [ms('m1')], []).kind).toBe('none');
  });
  it('is read-only when the manuscript is no longer held (a deleted writing is not resurrected as a link)', () => {
    expect(historyActionFor(act({ manuscriptId: 'gone' }), [ms('m1')], []).kind).toBe('none');
  });
  it('offers open + delete for a held writing with no Work or a single-manuscript Work', () => {
    expect(historyActionFor(act({ manuscriptId: 'm1' }), [ms('m1')], []).kind).toBe('open_delete');
    expect(historyActionFor(act({ manuscriptId: 'm1' }), [ms('m1')], [work('w', ['m1'])]).kind).toBe('open_delete');
  });
  it('offers open only (no delete) when a Work holds more than one manuscript', () => {
    expect(historyActionFor(act({ manuscriptId: 'm1' }), [ms('m1'), ms('m2')], [work('w', ['m1', 'm2'])]).kind).toBe('open');
  });
  it('names the held title, falling back to the recorded one', () => {
    const a = historyActionFor(act({ manuscriptId: 'm1', manuscriptTitle: 'Recorded' }), [ms('m1', '  ')], []);
    expect(a.kind === 'none' ? '' : a.title).toBe('Recorded');
  });
});
