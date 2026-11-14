import { describe, expect, it, jest } from '@jest/globals';

jest.mock('@/lib/ops/mailTransportAlert.server', () => ({
  notifyMailTransportDown: jest.fn(async () => {}),
}));

import { sendEmail } from '../sendEmail';
import type { EmailProvider } from '../providers/types';

describe('private Soul Portrait transport boundary', () => {
  it.each(['resend', 'smtp'])('refuses an injected %s provider without invoking its send method', async (name) => {
    const send = jest.fn(async () => ({
      accepted: true, providerMessageId: 'must-never-send',
    }));
    const provider = {
      name,
      isConfigured: () => true,
      send,
    } as unknown as EmailProvider;
    const logged = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const result = await sendEmail({
        purpose: 'soul-portrait:delivery',
        from: 'Soullab <noreply@soullab.life>',
        to: 'fictional@example.com',
        subject: 'Fictional Soul Portrait',
        text: 'This is a fixture only.',
        provider,
      });
      expect(result.success).toBe(false);
      expect(result.failureKind).toBe('provider_config');
      expect(send).not.toHaveBeenCalled();
    } finally {
      logged.mockRestore();
    }
  });
});
