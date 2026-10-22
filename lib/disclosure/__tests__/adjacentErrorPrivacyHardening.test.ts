/**
 * CLASS A independent, fictional hardening tests for candidate source ONLY.
 * Original six negative privacy assertions in draft #1925 remain unchanged.
 * This supplement checks hostile error objects and refusal-code stability.
 * No real database, provider, member, Writer Source, or network.
 */
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
import { query } from '@/lib/db/postgres';
import {
  mintDisclosureAttempt, confirmDisclosureCrossed, mayCross,
  type ContextDisclosureAttempt,
} from '../contextDisclosureReceipt';
import { resolveStructuredMode } from '../../ai/structured/policy';
import { runStructured } from '../../ai/structured/router';
import type { StructuredRequest } from '../../ai/structured/types';

const sql = query as jest.Mock;
const MARKER = 'FICTIONAL_PRIVATE_WRITER_NEVER_IN_ERRORS_712';
const attempt: ContextDisclosureAttempt = {
  disclosureId: 'fictional-attempt-712', memberId: 'fictional-member-712',
  requestRef: 'fictional-request-712',
  boundary: 'writers_studio.focus->maia_cognition',
  sourceClass: 'work', participationBasis: 'member_invoked',
  sourceRef: 'fictional-work-712', scopeKind: 'passage', gesture: 'ask_maia',
};
const req: StructuredRequest = {
  model: 'fictional-no-network', system: 'fictional',
  messages: [{ role: 'user', content: 'fictional' }], maxTokens: 8,
};
let beforeMode: string | undefined;

beforeEach(() => {
  beforeMode = process.env.MAIA_INFERENCE_MODE;
  sql.mockReset();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  if (beforeMode === undefined) delete process.env.MAIA_INFERENCE_MODE;
  else process.env.MAIA_INFERENCE_MODE = beforeMode;
  jest.restoreAllMocks();
});

describe('Class A candidate — error-shaped hostile objects never enter disclosure diagnostics', () => {
  test('mint refuses a throwing-proxy error without invoking any proxy trap', async () => {
    const trap = jest.fn(() => { throw new Error(MARKER); });
    const hostile = new Proxy(Object.create(null), {
      get: trap, getPrototypeOf: trap, ownKeys: trap,
    });
    sql.mockRejectedValueOnce(hostile);
    const result = await mintDisclosureAttempt(attempt);
    expect(result).toEqual({ kind: 'unavailable' });
    expect(mayCross(result)).toBe(false);
    expect(trap).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      '[DISCLOSURE] mint failed — disclosure refused',
      expect.objectContaining({ error: 'disclosure_mint_store_unavailable' }),
    );
    expect(JSON.stringify((console.error as jest.Mock).mock.calls)).not.toContain(MARKER);
  });

  test('post-crossing confirm returns unresolved on a poisoned Error.message getter', async () => {
    const messageTrap = jest.fn(() => { throw new Error(MARKER); });
    const hostile = Object.defineProperty(new Error('fictional'), 'message', {
      get: messageTrap,
    });
    sql.mockRejectedValueOnce(hostile);
    expect(await confirmDisclosureCrossed(attempt.disclosureId)).toBe(false);
    expect(messageTrap).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      '[DISCLOSURE] ⛔ UNRESOLVED CROSSING — confirm failed after the boundary was crossed',
      expect.objectContaining({ error: 'disclosure_crossing_confirmation_unresolved' }),
    );
    expect(JSON.stringify((console.error as jest.Mock).mock.calls)).not.toContain(MARKER);
  });
});

describe('Class A candidate — structured invalid inference mode is content-free', () => {
  test('multiline private-looking configuration is refused with stable code', () => {
    const raw = 'not_an_authorized_mode_' + MARKER + '\nfictional second line';
    expect(resolveStructuredMode(raw)).toEqual({
      ok: false, refusal: 'invalid_inference_mode',
      detail: 'structured_inference_configuration_invalid',
    });
  });

  test('invalid mode refuses in router without dispatch, logging, or provider', async () => {
    process.env.MAIA_INFERENCE_MODE = 'fictional_invalid_' + MARKER;
    const result = await runStructured(req);
    expect(result).toEqual({
      ok: false, refusal: 'invalid_inference_mode',
      detail: 'structured_inference_configuration_invalid',
    });
    expect('dispatch' in result).toBe(false);
    expect(console.error).not.toHaveBeenCalled();
  });
});
