import { assertR4gOrdinarySession, R4gSessionHeld } from '../r4gOrdinarySessionGate';
import { isR4fProtectedSessionById } from '../r4fGrantStore';

jest.mock('../r4fGrantStore', () => ({
  isR4fProtectedSessionById: jest.fn(),
}));
const protectedCheck = isR4fProtectedSessionById as jest.Mock;

beforeEach(() => { protectedCheck.mockReset(); });

describe('R4G server-owned ordinary MAIA session quarantine', () => {
  it('denies legacy R4e Astro preview before touching the registry', async () => {
    await expect(assertR4gOrdinarySession('astrology-pro-preview-fictional')).rejects.toBeInstanceOf(R4gSessionHeld);
    await expect(assertR4gOrdinarySession('ordinary', 'astrology-pro-preview-fictional')).rejects.toBeInstanceOf(R4gSessionHeld);
    expect(protectedCheck).not.toHaveBeenCalled();
  });
  it('denies registered sessions even when another member requests them', async () => {
    protectedCheck.mockResolvedValue(true);
    await expect(assertR4gOrdinarySession('fictional-private-chart-session')).rejects.toBeInstanceOf(R4gSessionHeld);
    expect(protectedCheck).toHaveBeenCalledWith('fictional-private-chart-session');
  });
  it('permits unrelated MAIA conversations without disabling continuity', async () => {
    protectedCheck.mockResolvedValue(false);
    await expect(assertR4gOrdinarySession('fictional-ordinary-session')).resolves.toBeUndefined();
  });
  it('propagates privacy-registry failure rather than interpreting it as absence', async () => {
    protectedCheck.mockRejectedValue(new Error('fixture registry unavailable'));
    await expect(assertR4gOrdinarySession('fictional-ordinary-session')).rejects.toThrow('fixture registry unavailable');
  });
});
