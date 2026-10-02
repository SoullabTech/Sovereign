import { deriveSafetyDeliveryStanding } from '../safetyDeliveryStanding';

describe('SAFETY-DISCLOSURE-01 R5 delivery standing', () => {
  it('never treats provider acceptance as human receipt', () => {
    expect(deriveSafetyDeliveryStanding({
      messagePersisted: true,
      safetyLogRecorded: true,
      emailAttemptState: 'accepted',
    })).toEqual({
      standing: 'provider_accepted',
      humanReceiptWitnessed: false,
      practitionerAcknowledged: false,
      providerAcceptanceOnly: true,
    });
  });

  it('distinguishes persistence, logging, refusal, and indeterminate transport', () => {
    expect(deriveSafetyDeliveryStanding({ messagePersisted: true, safetyLogRecorded: false }).standing).toBe('message_persisted');
    expect(deriveSafetyDeliveryStanding({ messagePersisted: true, safetyLogRecorded: true }).standing).toBe('safety_logged');
    expect(deriveSafetyDeliveryStanding({ messagePersisted: true, safetyLogRecorded: true, emailAttemptState: 'refused' }).standing).toBe('notification_refused');
    expect(deriveSafetyDeliveryStanding({ messagePersisted: true, safetyLogRecorded: true, emailAttemptState: 'indeterminate' }).standing).toBe('notification_indeterminate');
  });

  it('treats practitioner read as the first human-receipt witness', () => {
    const r = deriveSafetyDeliveryStanding({
      messagePersisted: true,
      safetyLogRecorded: true,
      emailAttemptState: 'accepted',
      practitionerReadAt: '2026-10-01T20:00:00Z',
    });
    expect(r.standing).toBe('practitioner_read');
    expect(r.humanReceiptWitnessed).toBe(true);
    expect(r.practitionerAcknowledged).toBe(false);
  });

  it('treats explicit safety acknowledgement as stronger than read', () => {
    const r = deriveSafetyDeliveryStanding({
      messagePersisted: true,
      safetyLogRecorded: true,
      emailAttemptState: 'accepted',
      practitionerReadAt: '2026-10-01T20:00:00Z',
      safetyAcknowledgedAt: '2026-10-01T20:01:00Z',
    });
    expect(r.standing).toBe('safety_acknowledged');
    expect(r.humanReceiptWitnessed).toBe(true);
    expect(r.practitionerAcknowledged).toBe(true);
  });
});
