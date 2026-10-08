import { notifySourcePersistenceSanctuary } from '../sourcePostureClient';
import { apiFetch } from '@/lib/http/apiBase';
jest.mock('@/lib/http/apiBase', () => ({ apiFetch: jest.fn() }));
const fetchMock = apiFetch as jest.Mock;
beforeEach(() => jest.clearAllMocks());
test('switching off Sanctuary never requests ordinary source persistence', async () => {
  expect(await notifySourcePersistenceSanctuary(false)).toBe('held');
  expect(fetchMock).not.toHaveBeenCalled();
});
test('switching on Sanctuary signals the separate server-owned source posture', async () => {
  fetchMock.mockResolvedValue({ ok: true });
  expect(await notifySourcePersistenceSanctuary(true)).toBe('acknowledged');
  expect(fetchMock).toHaveBeenCalledWith('/api/writers-studio/source-posture', expect.objectContaining({
    method: 'POST', body: JSON.stringify({ posture: 'sanctuary' }),
  }));
});
test('failed notification never claims server confirmation', async () => {
  fetchMock.mockRejectedValue(new Error('offline'));
  expect(await notifySourcePersistenceSanctuary(true)).toBe('unavailable');
});
