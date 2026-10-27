/**
 * COMMS PROVIDERS INDEX
 *
 * Credential-backed provider registry. Email is managed by Soullab's sovereign
 * SMTP transport and therefore is not a practitioner credential provider here.
 */

export * from './types';
export { TwilioProvider } from './TwilioProvider';

import type { CommsProvider, ProviderType, DeliveryChannel } from './types';
import { TwilioProvider } from './TwilioProvider';

const providerRegistry: Partial<Record<ProviderType, new () => CommsProvider>> = {
  twilio: TwilioProvider,
};

export function getProvider(providerType: ProviderType): CommsProvider {
  const ProviderClass = providerRegistry[providerType];
  if (!ProviderClass) {
    throw new Error(
      `Provider ${providerType} is managed outside the credential registry`
    );
  }
  return new ProviderClass();
}

export function getDefaultProviderForChannel(channel: DeliveryChannel): ProviderType {
  switch (channel) {
    case 'email':
      return 'smtp';
    case 'sms':
      return 'twilio';
  }
}
