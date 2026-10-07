jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
jest.mock('@/lib/sanctuary/currentClientPosture', () => ({ readCurrentSanctuaryPosture: jest.fn() }));
jest.mock('../rebuild/editorialCollaboration', () => ({ readBoundEditorialThread: jest.fn() }));
import { apiFetch } from '@/lib/http/apiBase';
import { readCurrentSanctuaryPosture } from '@/lib/sanctuary/currentClientPosture';
import { readBoundEditorialThread } from '../rebuild/editorialCollaboration';
import { saveCraftWorkingCopy, listSavedCraftVersions } from '../craftSaveR1';
import { parseCraftSaveRequest } from '../craftSaveContractR1';

const id = '11111111-1111-4111-8111-111111111111';
const draft = { held: { draftSectionId: id, start: 0, end: 9, text: 'Original.', revisionNumber: 2 },
  threadId: null, supersedes: null, text: '🜂 My wording.\n\n  ' };
const v = { id: 'v', author: 'member', wording: draft.text, supersedes: null };
const thread = { threadId: 't', targetSectionId: id, locusText: draft.held.text, versions: [v] };
const fetcher = apiFetch as jest.Mock;
const posture = readCurrentSanctuaryPosture as jest.Mock;
const read = readBoundEditorialThread as jest.Mock;
beforeEach(() => {
  jest.resetAllMocks(); posture.mockReturnValue({ resolved: true, sanctuary: false });
  fetcher.mockResolvedValue({ ok: true, json: async () => ({ threadId: 't', versionId: 'v' }) });
  read.mockResolvedValue({ ok: true, thread });
});

describe('Save is a verified writer act, never a model or manuscript operation', () => {
  it('sends the exact null predecessor and whitespace then verifies storage', async () => {
    expect((await saveCraftWorkingCopy(draft)).ok).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, request] = fetcher.mock.calls[0];
    expect(url).toBe('/api/writers-studio/rebuild/editorial/version');
    expect(JSON.parse(request.body)).toMatchObject({ replacementText: draft.text, supersedes: null, sanctuary: false });
  });
  it.each([{ resolved: false }, { resolved: true, sanctuary: true }])('refuses posture before any write', choice => {
    posture.mockReturnValue(choice);
    return saveCraftWorkingCopy(draft).then(r => { expect(r.ok).toBe(false); expect(fetcher).not.toHaveBeenCalled(); });
  });
  it.each([
    { ...thread, locusText: 'Different.' },
    { ...thread, versions: [{ ...v, author: 'maia' }] },
    { ...thread, versions: [{ ...v, wording: 'Wrong text' }] },
    { ...thread, versions: [{ ...v, supersedes: 'unseen' }] },
    { ...thread, threadId: 'other' },
  ])('never reports a mismatched readback as saved', bad => {
    read.mockResolvedValue({ ok: true, thread: bad });
    return saveCraftWorkingCopy(draft).then(r => expect(r.ok).toBe(false));
  });
  it('a 409 keeps the exact predecessor and is not retried', async () => {
    fetcher.mockResolvedValue({ ok: false, status: 409, json: async () => ({ error: 'not_successor_of_head' }) });
    expect((await saveCraftWorkingCopy(draft)).ok).toBe(false); expect(fetcher).toHaveBeenCalledTimes(1); expect(read).not.toHaveBeenCalled();
  });
  it('a lost response is uncertain, not retried or claimed saved', async () => {
    fetcher.mockRejectedValue(new Error('network'));
    const r = await saveCraftWorkingCopy(draft); expect(r.ok).toBe(false); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('discovery failure is not an empty list', async () => {
    fetcher.mockRejectedValue(new Error('offline')); expect(await listSavedCraftVersions(id)).toEqual({ ok: false });
  });
});

describe('Closed first-save wire contract', () => {
  const wire = { sectionId: id, range: { start: 0, end: 9 }, revisionNumber: 2,
    threadId: null, supersedes: null, replacementText: '', sanctuary: false };
  it('permits an exact empty writer draft', () => expect(parseCraftSaveRequest(wire)).toEqual({ ok: true, value: wire }));
  it.each([
    { author: 'maia' }, { sanctuary: undefined }, { sanctuary: true }, { range: { start: -1, end: 9 } },
    { range: { start: 0, end: 9, manuscriptId: id } }, { supersedes: id }, { revisionNumber: -1 },
  ])('refuses forged, ambiguous or unauthorized inputs', patch => expect(parseCraftSaveRequest({ ...wire, ...patch }).ok).toBe(false));
});
