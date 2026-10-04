/**
 * SAFETY-DISCLOSURE-01 R5 — pure notification-result standing.
 *
 * This projector does not send, persist, query, or authorize disclosure.
 * It translates existing evidence into the strongest truthful claim available.
 */

export type SafetyEmailAttemptState =
  | 'not_attempted'
  | 'attempting'
  | 'accepted'
  | 'indeterminate'
  | 'refused';

export type SafetyDeliveryStanding =
  | 'none'
  | 'message_persisted'
  | 'safety_logged'
  | 'notification_attempting'
  | 'provider_accepted'
  | 'notification_indeterminate'
  | 'notification_refused'
  | 'practitioner_read'
  | 'safety_acknowledged';

export interface SafetyDeliveryEvidence {
  messagePersisted: boolean;
  safetyLogRecorded: boolean;
  emailAttemptState?: SafetyEmailAttemptState;
  practitionerReadAt?: string | null;
  safetyAcknowledgedAt?: string | null;
}

export interface SafetyDeliveryResult {
  standing: SafetyDeliveryStanding;
  humanReceiptWitnessed: boolean;
  practitionerAcknowledged: boolean;
  providerAcceptanceOnly: boolean;
}

export function deriveSafetyDeliveryStanding(
  evidence: SafetyDeliveryEvidence,
): SafetyDeliveryResult {
  if (evidence.safetyAcknowledgedAt) {
    return {
      standing: 'safety_acknowledged',
      humanReceiptWitnessed: true,
      practitionerAcknowledged: true,
      providerAcceptanceOnly: false,
    };
  }

  if (evidence.practitionerReadAt) {
    return {
      standing: 'practitioner_read',
      humanReceiptWitnessed: true,
      practitionerAcknowledged: false,
      providerAcceptanceOnly: false,
    };
  }

  switch (evidence.emailAttemptState) {
    case 'accepted':
      return {
        standing: 'provider_accepted',
        humanReceiptWitnessed: false,
        practitionerAcknowledged: false,
        providerAcceptanceOnly: true,
      };
    case 'attempting':
      return { standing: 'notification_attempting', humanReceiptWitnessed: false, practitionerAcknowledged: false, providerAcceptanceOnly: false };
    case 'indeterminate':
      return { standing: 'notification_indeterminate', humanReceiptWitnessed: false, practitionerAcknowledged: false, providerAcceptanceOnly: false };
    case 'refused':
      return { standing: 'notification_refused', humanReceiptWitnessed: false, practitionerAcknowledged: false, providerAcceptanceOnly: false };
  }

  if (evidence.safetyLogRecorded) {
    return { standing: 'safety_logged', humanReceiptWitnessed: false, practitionerAcknowledged: false, providerAcceptanceOnly: false };
  }

  if (evidence.messagePersisted) {
    return { standing: 'message_persisted', humanReceiptWitnessed: false, practitionerAcknowledged: false, providerAcceptanceOnly: false };
  }

  return { standing: 'none', humanReceiptWitnessed: false, practitionerAcknowledged: false, providerAcceptanceOnly: false };
}
