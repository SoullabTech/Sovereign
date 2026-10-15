/** Regression: EmailRouter preserves typed transport refusals for scheduled-send quarantine. */
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EmailRouter } from '../../comms/emailRouter';
import { sendEmail } from '../sendEmail';

jest.mock('../sendEmail', () => ({ sendEmail: jest.fn() }));
const mockedSend = sendEmail as jest.MockedFunction<typeof sendEmail>;

const payload = {
  purpose: 'soul-portrait:delivery' as const,
  admission: { authority: { kind: 'member' as const, memberId: 'synthetic-member' }, destination: 'actor-supplied' as const },
  to: 'recipient@example.test',
  subject: 'Synthetic portrait notice',
  bodyText: 'Synthetic test only',
};
const sender = { fromEmail: 'noreply@soullab.life', fromName: 'Soullab' };

beforeEach(() => mockedSend.mockReset());
afterEach(() => jest.restoreAllMocks());

describe('EmailRouter managed SMTP results', () => {
  it('propagates a classified failure rather than losing the failureKind', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedSend.mockResolvedValueOnce({
      success: false, status: 'error', provider: 'smtp',
      error: 'SMTP authentication refused', failureKind: 'provider_auth',
      retryable: false, ourFault: true,
    });
    const result = await new EmailRouter('synthetic-member').send(payload, sender);
    expect(result).toMatchObject({ success: false, failureKind: 'provider_auth', provider: 'managed' });
    expect(mockedSend).toHaveBeenCalledWith(expect.objectContaining({
      admission: payload.admission,
      purpose: 'soul-portrait:delivery',
      to: payload.to,
    }));
  });

  it('returns acceptance ID without implying inbox delivery', async () => {
    mockedSend.mockResolvedValueOnce({
      success: true, id: 'synthetic-smtp-id', status: 'sent', provider: 'smtp', priority: 'P2',
    });
    const result = await new EmailRouter('synthetic-member').send(payload, sender);
    expect(result).toEqual({ success: true, id: 'synthetic-smtp-id', provider: 'managed' });
  });
});
