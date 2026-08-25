/**
 * MEMORY PROVIDER — deterministic transport for tests and local development.
 * =========================================================================
 *
 * Contacts no vendor. Captures every message so tests can assert on what would
 * have been sent, and so local development does not consume real quota or mail
 * real people.
 *
 * Production safety: selecting this provider in production is refused at
 * configuration time (see ./index.ts). Silently falling from a real provider to
 * a capture buffer is the failure mode this whole lane exists to prevent — mail
 * that "sends" and never leaves.
 */

import type { EmailProvider, ProviderEmailMessage, ProviderSendResult } from './types';

export interface CapturedEmail extends ProviderEmailMessage {
  providerMessageId: string;
}

export class MemoryProvider implements EmailProvider {
  readonly name = 'memory';

  private readonly outbox: CapturedEmail[] = [];
  private counter = 0;

  isConfigured(): boolean {
    return true;
  }

  async send(message: ProviderEmailMessage): Promise<ProviderSendResult> {
    this.counter += 1;
    const providerMessageId = `memory-${this.counter}`;
    this.outbox.push({ ...message, providerMessageId });
    return { accepted: true, providerMessageId };
  }

  /** Everything captured, oldest first. */
  sent(): readonly CapturedEmail[] {
    return this.outbox;
  }

  clear(): void {
    this.outbox.length = 0;
    this.counter = 0;
  }
}
