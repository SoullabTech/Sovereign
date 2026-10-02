/**
 * Consequence-delivery truth contract.
 *
 * These states describe what the runtime can actually prove.  In particular:
 * - logging/persistence are not delivery
 * - provider/API acceptance is not channel delivery
 * - channel delivery is not human acknowledgement
 */
export type ConsequenceDeliveryState =
  | 'DETECTED'
  | 'DELIVERY_REQUESTED'
  | 'TRANSPORT_ACCEPTED'
  | 'CHANNEL_REACHED'
  | 'HUMAN_ACKNOWLEDGED'
  | 'DELIVERY_FAILED'
  | 'DELIVERY_UNAVAILABLE'
  | 'DELIVERY_UNCONFIRMED';

export type DeliveryWitnessKind =
  | 'condition'
  | 'producer'
  | 'transport_acceptance'
  | 'transport_delivery'
  | 'human_acknowledgement'
  | 'failure';

export interface ConsequenceDeliveryResult {
  state: ConsequenceDeliveryState;
  witness: DeliveryWitnessKind;
  reference?: string;
  reason?: string;
}

export type TransportAttemptState =
  | 'transport_accepted'
  | 'failed'
  | 'not_attempted';

const SUCCESS_STANDING: Record<DeliveryWitnessKind, ConsequenceDeliveryState> = {
  condition: 'DETECTED',
  producer: 'DELIVERY_REQUESTED',
  transport_acceptance: 'TRANSPORT_ACCEPTED',
  transport_delivery: 'CHANNEL_REACHED',
  human_acknowledgement: 'HUMAN_ACKNOWLEDGED',
  failure: 'DELIVERY_FAILED',
};

export function stateProvenByWitness(
  witness: DeliveryWitnessKind
): ConsequenceDeliveryState {
  return SUCCESS_STANDING[witness];
}

export function summarizeTransportAttempts(
  attempts: Array<TransportAttemptState | undefined>
): ConsequenceDeliveryResult {
  const concrete = attempts.filter(
    (attempt): attempt is TransportAttemptState => Boolean(attempt)
  );

  if (concrete.some((attempt) => attempt === 'transport_accepted')) {
    return {
      state: 'TRANSPORT_ACCEPTED',
      witness: 'transport_acceptance',
    };
  }

  if (concrete.some((attempt) => attempt === 'failed')) {
    return {
      state: 'DELIVERY_FAILED',
      witness: 'failure',
      reason: 'All attempted delivery transports failed',
    };
  }

  return {
    state: 'DELIVERY_UNAVAILABLE',
    witness: 'failure',
    reason: 'No delivery transport was attempted',
  };
}

export function deliveryUnavailable(reason: string): ConsequenceDeliveryResult {
  return {
    state: 'DELIVERY_UNAVAILABLE',
    witness: 'failure',
    reason,
  };
}

export function deliveryFailed(reason: string): ConsequenceDeliveryResult {
  return {
    state: 'DELIVERY_FAILED',
    witness: 'failure',
    reason,
  };
}

export function resultForDeliveryState(
  state: ConsequenceDeliveryState,
  reference?: string,
  reason?: string
): ConsequenceDeliveryResult {
  const witness: DeliveryWitnessKind =
    state === 'DETECTED' ? 'condition' :
    state === 'DELIVERY_REQUESTED' ? 'producer' :
    state === 'TRANSPORT_ACCEPTED' ? 'transport_acceptance' :
    state === 'CHANNEL_REACHED' ? 'transport_delivery' :
    state === 'HUMAN_ACKNOWLEDGED' ? 'human_acknowledgement' :
    'failure';

  return { state, witness, reference, reason };
}

export function transportAccepted(reference?: string): ConsequenceDeliveryResult {
  return {
    state: 'TRANSPORT_ACCEPTED',
    witness: 'transport_acceptance',
    reference,
  };
}
