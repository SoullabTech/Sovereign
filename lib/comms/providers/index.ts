/**
 * COMMS PROVIDERS INDEX
 *
 * Export all provider implementations
 */

export * from './types';
export { ResendProvider } from './ResendProvider';
export { TwilioProvider } from './TwilioProvider';

import type { CommsProvider, ProviderType, DeliveryChannel } from './types';
import { ResendProvider } from './ResendProvider';
import { TwilioProvider } from './TwilioProvider';

/**
 * Provider registry for dynamic instantiation
 */
const providerRegistry: Record<ProviderType, new () => CommsProvider> = {
  resend: ResendProvider,
  twilio: TwilioProvider,
  // Future providers can be added here
  sendgrid: ResendProvider, // Placeholder - would have SendGridProvider
  postmark: ResendProvider, // Placeholder - would have PostmarkProvider
};

/**
 * Get a provider instance by type
 */
export function getProvider(providerType: ProviderType): CommsProvider {
  const ProviderClass = providerRegistry[providerType];
  if (!ProviderClass) {
    throw new Error(`Unknown provider: ${providerType}`);
  }
  return new ProviderClass();
}

/**
 * Get the default provider for a channel
 */
export function getDefaultProviderForChannel(channel: DeliveryChannel): ProviderType {
  switch (channel) {
    case 'email':
      return 'resend';
    case 'sms':
      return 'twilio';
    default:
      throw new Error(`No default provider for channel: ${channel}`);
  }
}
