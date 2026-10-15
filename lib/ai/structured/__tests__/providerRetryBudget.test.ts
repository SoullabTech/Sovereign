import { resolveProviderMaxRetries } from '../anthropicStructuredAdapter';

describe('structured provider retry budget', () => {
  it('preserves the SDK-equivalent default of two retries when unset', () => {
    expect(resolveProviderMaxRetries(undefined)).toBe(2);
  });

  it('allows the beta lane to disable automatic retries explicitly', () => {
    expect(resolveProviderMaxRetries('0')).toBe(0);
  });

  it.each(['', '-1', '1.5', 'eleven', '11'])('refuses malformed or excessive retry values: %s', (raw) => {
    expect(() => resolveProviderMaxRetries(raw)).toThrow('invalid MAIA_PROVIDER_MAX_RETRIES');
  });
});
