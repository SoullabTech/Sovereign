/**
 * Disclosure Text Generator
 *
 * Generates disclosure text when meaning crosses boundaries:
 * - AI is assisting with composition
 * - Relational/session-derived material is included
 * - Meaning moves from private context to outward communication
 *
 * This is shared infrastructure — no route-local or component-local
 * disclosure strings. All disclosure text flows through here.
 */

import type { TrustChannel } from './types';

export interface DisclosureContext {
  aiAssisted: boolean;
  relationalContext: boolean;
  sessionDerived: boolean;
  channel: TrustChannel;
}

/**
 * Generate disclosure text for the given context.
 * Returns empty string if no disclosure is needed.
 *
 * Tone: neutral, concise, explicit.
 * Suitable for UI preview and insertion into outgoing message flows.
 */
export function getDisclosureText(context: DisclosureContext): string {
  const parts: string[] = [];

  if (context.aiAssisted) {
    parts.push('This message was composed with AI assistance.');
  }

  if (context.sessionDerived) {
    parts.push('Content draws from session material.');
  } else if (context.relationalContext) {
    parts.push('Content informed by relational context.');
  }

  if (parts.length === 0) return '';

  return parts.join(' ');
}

/**
 * Determine whether disclosure is required for a given context.
 */
export function isDisclosureRequired(context: DisclosureContext): boolean {
  return context.aiAssisted || context.sessionDerived || context.relationalContext;
}
