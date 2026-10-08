import { deriveSourcePostureDisplay, readSourcePostureDisplay } from '../sourcePostureDisplay';
import { apiFetch } from '@/lib/http/apiBase';
jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
const fetchMock = apiFetch as jest.Mock;
beforeEach(() => jest.clearAllMocks());
test.each([
  [null, 'unavailable'], [{ posture: 'unresolved' }, 'unavailable'],
  [{ posture: 'sanctuary' }, 'sanctuary'], [{ posture: 'ordinary' }, 'ordinary-unverified'],
  [{ posture: false }, 'unavailable'],
])('never derives writable permissions from posture display', (input, expected) => {
  expect(deriveSourcePostureDisplay(input)).toBe(expected);
});
test('GET reads uncached and interprets acknowledged state', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ posture: 'sanctuary', revision: '3' }) });
  expect(await readSourcePostureDisplay()).toBe('sanctuary');
  expect(fetchMock).toHaveBeenCalledWith('/api/writers-studio/source-posture', { method: 'GET', cache: 'no-store' });
});
test('network refusal remains unavailable', async () => {
  fetchMock.mockRejectedValue(new Error('offline'));
  expect(await readSourcePostureDisplay()).toBe('unavailable');
});
