/** @jest-environment node */
const query = jest.fn();
const loadReading = jest.fn();
const loadLiveWork = jest.fn();
const assessReading = jest.fn();
const readingView = jest.fn();

jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => query(...a) }));
jest.mock('@/lib/manuscript/developmentalReading/store', () => ({ loadReading: (...a: unknown[]) => loadReading(...a) }));
jest.mock('@/lib/manuscript/development/capture', () => ({ loadLiveWork: (...a: unknown[]) => loadLiveWork(...a) }));
jest.mock('@/lib/manuscript/developmentalReading/assess', () => ({ assessReading: (...a: unknown[]) => assessReading(...a) }));
jest.mock('../developPresentation', () => ({ readingView: (...a: unknown[]) => readingView(...a) }));

import fs from 'node:fs';
import path from 'node:path';
import { arrivalOriginFromReading, arrivalOriginInstruction, isArrivalOriginRef } from '../arrivalOrigin';
import { resolveArrivalOrigin } from '../arrivalOriginServer';

const READING_ID = '6f1c2c1e-0b7a-4d2e-9a51-3f0e8a1b2c3d';
const ref = { source: 'develop' as const, readingId: READING_ID, observationKey: 'o2' };
const reading = { id: READING_ID, manuscriptId: 'ms-1', outcome: 'reading' } as never;
const view = {
  coverage: { sentence: 'MAIA read 3 of 4 sections in full; 1 by position only.' },
  observations: [
    { key: 'o1', observation: 'First.', stateLabel: 'Still current', phenomenonLabel: 'Pacing' },
    { key: 'o2', observation: 'The ending arrives before the turn is earned.', stateLabel: 'Text has changed' },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  // First query: the thread's Work. Later queries: section labels.
  query.mockImplementation(async (sql: string) =>
    /FROM ask_threads/.test(sql) ? { rows: [{ manuscript_id: 'ms-1' }] } : { rows: [] });
  loadReading.mockResolvedValue(reading);
  loadLiveWork.mockResolvedValue({ sections: [] });
  assessReading.mockReturnValue({ observations: [] });
  readingView.mockReturnValue(view);
});

describe('the reference is a closed shape of identities', () => {
  it('accepts exactly source, readingId and observationKey', () => {
    expect(isArrivalOriginRef(ref)).toBe(true);
    expect(isArrivalOriginRef({ ...ref, source: 'review' })).toBe(true);
  });

  it('refuses text, extra keys and malformed identities', () => {
    for (const bad of [
      { ...ref, observation: 'x' }, { source: 'develop', readingId: READING_ID }, { ...ref, readingId: 'abc' },
      { ...ref, observationKey: 'Rewrite it all' }, { ...ref, source: 'lineage' }, null, 'develop', [ref],
    ]) expect(isArrivalOriginRef(bad)).toBe(false);
  });
});

describe('the saved observation, as the writer saw it', () => {
  it('takes label, state, observation and coverage from the reading view', () => {
    expect(arrivalOriginFromReading('review', reading, {} as never, [], 'o2')).toEqual({
      source: 'review', label: 'Observation', state: 'Text has changed',
      observation: 'The ending arrives before the turn is earned.',
      coverage: 'MAIA read 3 of 4 sections in full; 1 by position only.',
    });
  });

  it('is null for an unknown key or a reading with no observations', () => {
    expect(arrivalOriginFromReading('develop', reading, {} as never, [], 'o9')).toBeNull();
    expect(arrivalOriginFromReading('develop', { ...(reading as object), outcome: 'none' } as never, {} as never, [], 'o2')).toBeNull();
  });

  it('frames it for MAIA as history, with the current passage as the authority', () => {
    const t = arrivalOriginInstruction({ source: 'develop', label: 'Pacing', state: 'Still current', observation: 'Obs.', coverage: 'Cov.' });
    expect(t).toContain('We arrived at this exact passage from a prior frozen developmental reading.');
    expect(t).toContain('Observed then · Pacing · Still current');
    expect(t).toContain('Reading coverage: Cov.');
    expect(t).toContain('not a verdict and not an edit instruction');
    expect(t).toContain('Use the current passage as the authority');
    expect(t).toContain('Do not silently convert the prior observation into a revision recommendation.');
    expect(arrivalOriginInstruction({ source: 'review', label: 'a', state: 'b', observation: 'c', coverage: 'd' }))
      .toContain('from a prior frozen Review finding.');
  });
});

describe('the server resolves only the member’s own reading of this thread’s Work', () => {
  it('resolves through the member-scoped thread and reading', async () => {
    const origin = await resolveArrivalOrigin({ memberId: 'm-1', threadId: 'th-1', ref });
    expect(query.mock.calls[0][1]).toEqual(['th-1', 'm-1']);
    expect(loadReading).toHaveBeenCalledWith(READING_ID, 'm-1');
    expect(origin?.observation).toBe('The ending arrives before the turn is earned.');
  });

  it('is null when the thread is not the member’s, without reading anything', async () => {
    query.mockImplementation(async () => ({ rows: [] }));
    expect(await resolveArrivalOrigin({ memberId: 'm-1', threadId: 'th-1', ref })).toBeNull();
    expect(loadReading).not.toHaveBeenCalled();
  });

  it('is null when the reading is not the member’s', async () => {
    loadReading.mockResolvedValue(null);
    expect(await resolveArrivalOrigin({ memberId: 'm-1', threadId: 'th-1', ref })).toBeNull();
  });

  it('defeat candidate: a reading of a different Work does not resolve', async () => {
    loadReading.mockResolvedValue({ ...(reading as object), manuscriptId: 'ms-OTHER' });
    expect(await resolveArrivalOrigin({ memberId: 'm-1', threadId: 'th-1', ref })).toBeNull();
    expect(loadLiveWork).not.toHaveBeenCalled();
  });
});

describe('wiring: the panel sends the reference, never the framing', () => {
  const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
  const OLD_FRAMING = /We arrived at this exact passage|attributed historical context|Reading coverage:/;

  it('no client source composes the arrival framing', () => {
    for (const p of [
      'app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx',
      'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx',
      'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx',
      'lib/writersStudio/rebuild/editorialCollaboration.ts',
    ]) expect(read(p)).not.toMatch(OLD_FRAMING);
  });

  it('defeat candidate: the guard catches the old composed framing', () => {
    expect("return ['We arrived at this exact passage from a prior frozen ' + source, prompt].join('\\n');").toMatch(OLD_FRAMING);
  });

  it('the view passes identities and the request carries them', () => {
    const view = read('app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx');
    expect(view).toContain('readingId: props.carriedInsight.readingId,');
    expect(view).toContain('observationKey: props.carriedInsight.observation.key,');
    expect(view).not.toContain('observation: props.carriedInsight.observation.observation');
    expect(read('lib/writersStudio/rebuild/editorialCollaboration.ts')).toContain('...(origin ? { origin } : {})');
  });

  it('the route resolves it before the writer’s act is stored, and the runtime frames it', () => {
    const route = read('app/api/writers-studio/editorial/turn/route.ts');
    expect(route).toContain('isArrivalOriginRef(b.origin)');
    expect(route.indexOf('resolveArrivalOrigin({')).toBeGreaterThan(-1);
    expect(route.indexOf('resolveArrivalOrigin({')).toBeLessThan(route.indexOf('persistMemberEditorialAct({'));
    expect(read('lib/manuscript/editorialRuntime/turn.ts')).toContain('arrivalOriginInstruction(input.arrivalOrigin)');
  });
});
