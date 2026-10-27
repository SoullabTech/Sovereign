import { describe, expect, it, jest } from '@jest/globals';
const smtp = jest.fn<(...args: unknown[]) => Promise<any>>();
jest.mock('@/lib/email/sendEmail', () => ({
  sendEmail: (...a: unknown[]) => smtp(...a),
}));
import { sendBookingConfirmation, sendCancellationNotification, sendRescheduleNotification, sendPortalClaimEmail } from '../notifications';
const booking = {
  clientName: 'Synthetic client',
  clientEmail: 'third-party@example.invalid',
  sessionType: 'Synthetic booking',
  dateTime: new Date('2026-10-18T14:00:00Z'),
  duration: 60,
  timezone: 'America/New_York',
};
const practitioner = {
  name: 'Synthetic practitioner',
  email: 'owner@example.invalid',
  portalSlug: 'synthetic-portal',
};
describe('MAIL-04 / public booking recipient verification', () => {
  it('refuses outbound confirmation to an unverified public form email', async () => {
    smtp.mockReset();
    const result = await sendBookingConfirmation(booking, practitioner);
    expect(result).toMatchObject({
      success: false,
      error: 'recipient_email_ownership_unverified',
    });
    expect(smtp).not.toHaveBeenCalled();
  });
  it('refuses client cancellation email before mailbox verification', async () => {
    smtp.mockReset();
    const result = await sendCancellationNotification(booking, practitioner, 'Synthetic cancellation');
    expect(result).toMatchObject({ success: false, error: 'recipient_email_ownership_unverified' });
    expect(smtp).not.toHaveBeenCalled();
  });
  it('refuses client reschedule email before mailbox verification', async () => {
    smtp.mockReset();
    const result = await sendRescheduleNotification(booking, practitioner,
      new Date('2026-10-18T14:00:00Z'), new Date('2026-10-19T14:00:00Z'));
    expect(result).toMatchObject({ success: false, error: 'recipient_email_ownership_unverified' });
    expect(smtp).not.toHaveBeenCalled();
  });
  it('does not disclose portal claim links to unverified client email', async () => {
    smtp.mockReset();
    const result = await sendPortalClaimEmail({
      clientName: 'Synthetic client',
      clientEmail: 'other-person@example.invalid',
      claimUrl: 'https://soullab.life/portal/demo/claim?code=synthetic-secret',
    }, practitioner);
    expect(result).toMatchObject({ success: false, error: 'recipient_email_ownership_unverified' });
    expect(smtp).not.toHaveBeenCalled();
  });
  it('does not treat a forged client address as a verified stored recipient', async () => {
    smtp.mockReset();
    const result = await sendBookingConfirmation({
      ...booking, clientEmail: 'victim+spoof@example.invalid',
    }, practitioner);
    expect(result.success).toBe(false);
    expect(smtp).not.toHaveBeenCalled();
  });
});
