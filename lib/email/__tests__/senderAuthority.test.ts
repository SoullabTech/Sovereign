import { describe, expect, it } from '@jest/globals';
import { managedSender } from '../senderAuthority';

describe('Proton submission identity — confirmed no silent From impersonation', () => {
  it('preserves qualified noreply as the sole authenticated sender', () => {
    expect(managedSender('Soullab <noreply@soullab.life>')).toEqual({
      allowed: true,
      from: 'Soullab <noreply@soullab.life>',
      recast: false,
    });
  });
  it('converges audited role identities onto the one qualified address', () => {
    expect(managedSender('Soullab Reminders <reminders@soullab.life>')).toMatchObject({
      allowed: true,
      from: 'Soullab <noreply@soullab.life>',
      recast: true,
    });
  });
  it('keeps replies to Kelly pointed at Kelly, but does not forge From', () => {
    expect(managedSender('Kelly <kelly@soullab.life>')).toEqual({
      allowed: true,
      from: 'Soullab <noreply@soullab.life>',
      replyTo: 'kelly@soullab.life',
      recast: true,
    });
  });
  it('never invents a role mailbox Reply-To or overrides explicit reply targets', () => {
    expect(managedSender('Bookings <bookings@soullab.life>')).toMatchObject({
      allowed: true, recast: true,
    });
    expect(managedSender('Bookings <bookings@soullab.life>')).not.toHaveProperty('replyTo');
    expect(managedSender('Bookings <bookings@soullab.life>', 'kelly@soullab.life'))
      .toHaveProperty('replyTo', 'kelly@soullab.life');
  });
  it('refuses unknown domain/identity, and header injection', () => {
    for (const sender of [
      'External <other@example.com>',
      'Random <anything@soullab.life>',
      'Noreply <noreply@soullab.life>\r\nBcc: evil@example.com',
    ]) {
      expect(managedSender(sender)).toMatchObject({ allowed: false });
    }
  });
});
