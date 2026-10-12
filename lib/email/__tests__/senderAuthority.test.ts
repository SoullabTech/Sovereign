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
  it('all trusted purpose names retain the same authorized SMTP mailbox', () => {
    const scenarios: Array<[string, string]> = [
      ['auth:email-code', 'Soullab Account'],
      ['invite:beta', 'Soullab Invitations'],
      ['soul-portrait:delivery', 'Soullab Soul Portraits'],
      ['practitioner:scheduled-send', 'Soullab Studio'],
      ['portal:booking-confirmation', 'Soullab Bookings'],
      ['reminder:session', 'Soullab Reminders'],
      ['broadcast:update', 'Soullab Updates'],
    ];
    for (const [purpose, label] of scenarios) {
      expect(managedSender('Soullab <noreply@soullab.life>', undefined, purpose))
        .toHaveProperty('from', `${label} <noreply@soullab.life>`);
    }
  });

  it('ignores untrusted display text and never makes organization mailboxes app-sendable', () => {
    expect(managedSender('CEO Kelly <kelly@soullab.life>', undefined, 'practitioner:email'))
      .toHaveProperty('from', 'Soullab Studio <noreply@soullab.life>');
    for (const forbidden of ['support@soullab.life','problem@soullab.life']) {
      expect(managedSender(forbidden, undefined, 'portal:booking-confirmation'))
        .toMatchObject({ allowed: false, reason: 'unqualified_sender' });
    }
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
