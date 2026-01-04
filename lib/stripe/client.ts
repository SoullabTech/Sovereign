/**
 * Stripe Client Utilities
 *
 * Client-side helpers for Stripe checkout integration.
 */

export type ContributionTier = 'sustainer' | 'guardian' | 'elder' | 'founder' | 'seva';

interface CheckoutOptions {
  tier: ContributionTier;
  amount?: number; // For sliding scale tiers (in dollars)
  memberId?: string;
}

interface CheckoutResult {
  success: boolean;
  error?: string;
}

/**
 * Redirect to Stripe checkout for contribution
 */
export async function redirectToCheckout(options: CheckoutOptions): Promise<CheckoutResult> {
  const { tier, amount, memberId } = options;

  // Seva doesn't use Stripe
  if (tier === 'seva') {
    return { success: false, error: 'Seva contributions do not use payment' };
  }

  try {
    // Create checkout session via API
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier,
        amount,
        memberId,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return { success: false, error: data.error || 'Failed to create checkout session' };
    }

    // Redirect to Stripe checkout URL
    if (data.url) {
      window.location.href = data.url;
      return { success: true };
    }

    return { success: false, error: 'No checkout URL received' };
  } catch (error) {
    console.error('[Stripe] Checkout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Checkout failed',
    };
  }
}

/**
 * Check if Stripe is configured
 */
export function isStripeAvailable(): boolean {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  return !!(key && !key.includes('REPLACE'));
}
