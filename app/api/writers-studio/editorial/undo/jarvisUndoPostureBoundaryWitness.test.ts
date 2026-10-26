/**
 * JARVIS Class A stop witness: current Undo route does not establish
 * an authenticated member's per-request Sanctuary posture.
 *
 * Passing tests document CURRENT behavior, not desired acceptance.
 * No real DB, member, Source, request, or production write is permitted.
 */
const identity = jest.fn();
const undo = jest.fn();

jest.mock('@/lib/maia/canonical-turn', () => ({
  resolveCanonicalIdentity: (...args: unknown[]) => identity(...args),
}));
jest.mock('@/lib/manuscript/editorialRuntime/recovery', () => ({
  undoApplication: (...args: unknown[]) => undo(...args),
}));
import { POST } from './route';

const authorizationId = '11111111-1111-4111-8111-111111111111';
const req = (body: unknown) => ({ json: async () => body }) as never;
const original = process.env.WRITERS_STUDIO_EDITORIAL_ENABLED;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = '1';
  identity.mockResolvedValue({ status: 'verified', memberId: 'fiction-member-a' });
  undo.mockResolvedValue({ kind: 'undone' });
});
afterAll(() => {
  if (original === undefined) delete process.env.WRITERS_STUDIO_EDITORIAL_ENABLED;
  else process.env.WRITERS_STUDIO_EDITORIAL_ENABLED = original;
});

describe('JARVIS Class A acceptance STOP — current Undo posture boundary', () => {
  it('characterizes the gap: verified Undo reaches a write helper with no posture', async () => {
    const response = await POST(req({ authorizationId }));
    expect(response.status).toBe(200);
    expect(undo).toHaveBeenCalledTimes(1);
    expect(undo).toHaveBeenCalledWith('fiction-member-a', authorizationId);
    // Passing = a source behavior GAP; this is not approval to undo in Sanctuary.
  });

  it('rejects a client Sanctuary field only because it is an unknown key', async () => {
    const response = await POST(req({ authorizationId, sanctuary: true }));
    expect(response.status).toBe(400);
    expect(undo).not.toHaveBeenCalled();
  });

  it('does not admit an anonymous request', async () => {
    identity.mockResolvedValue({ status: 'unverified' });
    const response = await POST(req({ authorizationId }));
    expect(response.status).toBe(401);
    expect(undo).not.toHaveBeenCalled();
  });

  it('holds the route when the global editorial feature flag is disabled', async () => {
    delete process.env.WRITERS_STUDIO_EDITORIAL_ENABLED;
    const response = await POST(req({ authorizationId }));
    expect(response.status).toBe(404);
    expect(undo).not.toHaveBeenCalled();
  });

  it('refuses malformed authorization identifiers before the underlying write', async () => {
    const response = await POST(req({ authorizationId: 'foreign-or-made-up' }));
    expect(response.status).toBe(400);
    expect(undo).not.toHaveBeenCalled();
  });

  it('reports a recovery refusal rather than manufacturing an Undo success', async () => {
    undo.mockResolvedValue({ kind: 'refused' });
    const response = await POST(req({ authorizationId }));
    expect(response.status).toBe(409);
    expect(undo).toHaveBeenCalledTimes(1);
  });
});
