/**
 * CLASS A EXPECTED-RED proof — editorial refusal detail provenance.
 *
 * Calls the genuine Writer's Studio HTTP POST handler with a mocked internal
 * editorial runtime. All model strings and request content are invented.
 * No SDK, database, member Work, Auth service, network, or live inference.
 *
 * The real runEditorialTurn() currently makes model_unattributable.detail
 * from requested and provider-reported model IDs; those strings may be
 * untrusted. The real HTTP handler logs and returns detail without redaction.
 */
const resolveIdentity = jest.fn();
const persistAct = jest.fn();
const runTurn = jest.fn();
const preflightRelationship = jest.fn();
const resolveCarry = jest.fn();

jest.mock('@/lib/maia/canonical-turn', () => ({
  resolveCanonicalIdentity: (...a: unknown[]) => resolveIdentity(...a),
}));
jest.mock('@/lib/manuscript/editorialRuntime/memberAct', () => ({
  persistMemberEditorialAct: (...a: unknown[]) => persistAct(...a),
}));
jest.mock('@/lib/manuscript/editorialRuntime/turn', () => ({
  runEditorialTurn: (...a: unknown[]) => runTurn(...a),
}));
jest.mock('@/lib/writers-studio/relationshipCarriage', () => ({
  preflightEditorialRelationshipCarriage: (...a: unknown[]) => preflightRelationship(...a),
  resolvePriorMaiaEditorialCarry: (...a: unknown[]) => resolveCarry(...a),
}));

import { POST } from '../route';

const PRIVATE_MARKER = 'FICTIONAL_PRIVATE_WRITER_MODEL_METADATA_NEVER_ECHO_716';
const request = (body: unknown) => ({ json: async () => body }) as never;
const ordinaryRequest = {
  threadId: 'fictional-owned-thread',
  sanctuary: false,
  act: { act: 'discourse', text: 'Completely invented author request.', refersTo: null },
};

let diagnostic: jest.SpyInstance;
const priorEnabled = process.env.WRITERS_STUDIO_EDITORIAL_ENABLED;

beforeEach(() => {
  process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = '1';
  jest.clearAllMocks();
  resolveIdentity.mockResolvedValue({status:'verified',memberId:'fictional-member'});
  persistAct.mockResolvedValue({ok:true,turnIndex:1,direction:null});
  runTurn.mockResolvedValue({
    ok:false,reason:'model_unattributable',
    detail:'requested=fictional-requested-model reported=' + PRIVATE_MARKER + ' agreement=mismatched',
  });
  diagnostic = jest.spyOn(console,'error').mockImplementation(() => {});
});
afterEach(() => {
  diagnostic.mockRestore();
  if (priorEnabled === undefined) delete process.env.WRITERS_STUDIO_EDITORIAL_ENABLED;
  else process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = priorEnabled;
});

describe('Class A editorial model attribution error: no arbitrary model text can cross into logs or HTTP', () => {
  test('EXPECTED RED: client-visible refusal must not echo untrusted reported model ID text', async () => {
    const response = await POST(request(ordinaryRequest));
    const body = await response.json();
    expect(response.status).toBe(502);
    expect(body.error).toBe('model_unattributable');
    expect(runTurn).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(body)).not.toContain(PRIVATE_MARKER);
  });

  test('EXPECTED RED: server diagnostic must not echo untrusted reported model ID text', async () => {
    const response = await POST(request(ordinaryRequest));
    expect(response.status).toBe(502);
    expect(diagnostic).toHaveBeenCalledWith(
      '[editorial/turn] refused', expect.objectContaining({reason:'model_unattributable'}),
    );
    expect(JSON.stringify(diagnostic.mock.calls)).not.toContain(PRIVATE_MARKER);
  });

  test('GREEN CONTROL: known structured refusal class remains visible as a fixed code', async () => {
    runTurn.mockResolvedValue({
      ok:false,reason:'structured_refused',detail:'provider_unavailable',dispatch:'unknown',
    });
    const response = await POST(request(ordinaryRequest));
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body).toMatchObject({
      error:'structured_refused', detail:'provider_unavailable', dispatch:'unknown',
    });
    expect(JSON.stringify([body, diagnostic.mock.calls])).not.toContain(PRIVATE_MARKER);
  });

  test('GREEN CONTROL: legitimate discussion-first safety refusal stays a 409, not a 502', async () => {
    runTurn.mockResolvedValue({
      ok:false,reason:'sequence_discussion_first',
      detail:'The writer must first discuss a change.',
    });
    const response = await POST(request(ordinaryRequest));
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      error:'sequence_discussion_first',
    });
    expect(diagnostic).not.toHaveBeenCalled();
  });
});
