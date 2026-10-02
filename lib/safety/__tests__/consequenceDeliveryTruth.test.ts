import {
  deliveryFailed,
  deliveryUnavailable,
  resultForDeliveryState,
  stateProvenByWitness,
  summarizeTransportAttempts,
  transportAccepted,
} from '../consequenceDeliveryTruth';

describe('consequence delivery truth', () => {
  it('does not promote producer activity beyond DELIVERY_REQUESTED', () => {
    expect(stateProvenByWitness('producer')).toBe('DELIVERY_REQUESTED');
  });

  it('does not promote provider acceptance to channel delivery', () => {
    expect(stateProvenByWitness('transport_acceptance')).toBe('TRANSPORT_ACCEPTED');
    expect(stateProvenByWitness('transport_acceptance')).not.toBe('CHANNEL_REACHED');
    expect(stateProvenByWitness('transport_acceptance')).not.toBe('HUMAN_ACKNOWLEDGED');
  });

  it('requires a delivery witness for CHANNEL_REACHED', () => {
    expect(stateProvenByWitness('transport_delivery')).toBe('CHANNEL_REACHED');
  });

  it('requires human acknowledgement witness for HUMAN_ACKNOWLEDGED', () => {
    expect(stateProvenByWitness('human_acknowledgement')).toBe('HUMAN_ACKNOWLEDGED');
  });

  it('summarizes any accepted provider/API attempt only as TRANSPORT_ACCEPTED', () => {
    expect(
      summarizeTransportAttempts(['failed', 'transport_accepted', 'not_attempted'])
    ).toEqual({
      state: 'TRANSPORT_ACCEPTED',
      witness: 'transport_acceptance',
    });
  });

  it('records attempted transport failure as DELIVERY_FAILED', () => {
    expect(summarizeTransportAttempts(['failed', 'failed']).state).toBe('DELIVERY_FAILED');
  });

  it('records no attempted transport as DELIVERY_UNAVAILABLE', () => {
    expect(summarizeTransportAttempts([]).state).toBe('DELIVERY_UNAVAILABLE');
    expect(summarizeTransportAttempts(['not_attempted']).state).toBe('DELIVERY_UNAVAILABLE');
  });

  it('keeps explicit unavailable and failed results distinct', () => {
    expect(deliveryUnavailable('no recipient').state).toBe('DELIVERY_UNAVAILABLE');
    expect(deliveryFailed('provider refused').state).toBe('DELIVERY_FAILED');
  });

  it('derives the witness from the state without mismatched standing', () => {
    expect(resultForDeliveryState('DELIVERY_REQUESTED').witness).toBe('producer');
    expect(resultForDeliveryState('DELIVERY_UNAVAILABLE').witness).toBe('failure');
    expect(resultForDeliveryState('CHANNEL_REACHED').witness).toBe('transport_delivery');
  });

  it('transportAccepted never claims human receipt', () => {
    const result = transportAccepted('provider-id');
    expect(result.state).toBe('TRANSPORT_ACCEPTED');
    expect(result.witness).toBe('transport_acceptance');
  });
});
