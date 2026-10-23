/**
 * Class A source-exact expected-RED Writer client test.
 * The author must not be told a receipt failure is their own refusal;
 * do not automatically retry after a possible provider disclosure.
 * All network calls are mocked; fictional text only.
 */
const fetchMock = jest.fn();
jest.mock('@/lib/http/apiBase', () => ({
  apiFetch: (...args: unknown[]) => fetchMock(...args),
}));
import { sendBoundEditorialTurn } from '../editorialCollaboration';

const response = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status, headers: { 'content-type': 'application/json' },
  });

beforeEach(() => fetchMock.mockReset());

describe('Class A HOLD: post-dispatch disclosure receipt client classification', () => {
  test('RED: HTTP 500 accounting failure is not author turn_refused and must not retry', async () => {
    fetchMock.mockResolvedValueOnce(response(500, {
      error: 'disclosure_confirmation_unresolved',
      dispatch: 'response_observed',
    }));
    const outcome = await sendBoundEditorialTurn(
      'fictional-thread', 'fictional-section',
      'FICTIONAL_AUTHOR_WORDS_NO_MEMBER_DATA',
      { resolved: true, sanctuary: false },
    );
    expect(outcome).toMatchObject({
      ok: false, reason: 'accountability_unresolved',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0])
      .toBe('/api/writers-studio/editorial/turn');
  });
  test('GREEN: ordinary unknown-delivery provider refusal is still turn_refused', async () => {
    fetchMock.mockResolvedValueOnce(response(502, {
      error: 'structured_refused', detail: 'provider_unavailable',
      dispatch: 'unknown',
    }));
    const outcome = await sendBoundEditorialTurn(
      'fictional-thread', 'fictional-section',
      'FICTIONAL_AUTHOR_WORDS_NO_MEMBER_DATA',
      { resolved: true, sanctuary: false },
    );
    expect(outcome).toMatchObject({ ok: false, reason: 'turn_refused' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
