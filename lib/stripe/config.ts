/**
 * Stripe Configuration
 *
 * Handles Stripe SDK initialization for server-side operations.
 * Philosophy: "Consciousness shouldn't be paywalled" - contributions are gratitude, not access control.
 */

import Stripe from 'stripe';

// Only initialize Stripe if secret key is available
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Lazy initialization to avoid errors during build
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeSecretKey || stripeSecretKey.includes('REPLACE')) {
    throw new Error('Stripe secret key not configured. Set STRIPE_SECRET_KEY in environment.');
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
    });
  }

  return stripeInstance;
}

// Check if Stripe is configured
export function isStripeConfigured(): boolean {
  return !!(stripeSecretKey && !stripeSecretKey.includes('REPLACE'));
}

// Contribution tiers with Stripe price IDs
export const CONTRIBUTION_TIERS = {
  sustainer: {
    name: 'Sustainer',
    description: 'Sliding scale monthly ($1-99)',
    mode: 'subscription' as const,
    // Uses Stripe's custom amount checkout
  },
  guardian: {
    name: 'Guardian',
    description: 'Monthly contribution ($15+)',
    mode: 'subscription' as const,
    priceId: process.env.STRIPE_PRICE_GUARDIAN,
    minimumAmount: 1500, // $15 in cents
  },
  elder: {
    name: 'Elder',
    description: 'Monthly contribution ($33+)',
    mode: 'subscription' as const,
    priceId: process.env.STRIPE_PRICE_ELDER,
    minimumAmount: 3300, // $33 in cents
  },
  founder: {
    name: 'Pioneer Founder',
    description: 'Lifetime membership ($222 one-time)',
    mode: 'payment' as const,
    priceId: process.env.STRIPE_PRICE_FOUNDER,
    amount: 22200, // $222 in cents
  },
  seva: {
    name: 'Seva',
    description: 'Service exchange (no payment)',
    mode: 'none' as const,
    // No Stripe interaction - handled differently
  },
} as const;

export type ContributionTier = keyof typeof CONTRIBUTION_TIERS;
