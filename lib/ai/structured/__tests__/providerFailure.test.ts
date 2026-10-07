import { StructuredDispatchError } from '../dispatch';
import { originalStructuredError, structuredProviderRefusal } from '../providerFailure';
const balance = '400 {"error":{"message":"Your credit balance is too low to access the Anthropic API."}}';
const http = (status: number, message: string) => Object.assign(new Error(message), { status });
describe('Known provider billing rejection, not a fallback cue', () => {
  it('recognizes the wrapped live HTTP balance failure without importing a vendor SDK', () => {
    const original = http(400, balance);
    const wrapped = new StructuredDispatchError('response_observed', original);
    expect(originalStructuredError(wrapped)).toBe(original);
    expect(structuredProviderRefusal(wrapped)).toBe('provider_billing_required');
  });
  it('also recognizes a direct HTTP billing error', () => {
    expect(structuredProviderRefusal(http(400, balance))).toBe('provider_billing_required');
  });
  it.each([new Error(balance), http(429, 'rate limit exceeded'), http(500, balance),
    http(400, 'invalid tool schema'), null, 'credit balance is too low'])('does not label unrelated or unconfirmed errors as billing', error => {
    expect(structuredProviderRefusal(error)).toBe('provider_unavailable');
  });
});
