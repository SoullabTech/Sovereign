/**
 * Stripe Connect Integration for Practitioner Portals
 *
 * Handles revenue share model:
 * - 12% to Soullab (default)
 * - 10% to Soullab (priority build)
 * - 88-90% to practitioner via Stripe Connect
 */

import Stripe from 'stripe';
import { getStripe, isStripeConfigured } from '../stripe/config';
import { getPractitionerById, updatePractitioner, recordRevenue } from './practitionerService';
import type { PractitionerProfile } from './types';

// ============== STRIPE CONNECT ACCOUNT MANAGEMENT ==============

/**
 * Create a Stripe Connect account for a practitioner.
 * Uses Express accounts for simplified onboarding.
 */
export async function createConnectAccount(
  practitionerId: string,
  email: string,
  businessName?: string
): Promise<{ accountId: string; onboardingUrl: string }> {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured');
  }

  const stripe = getStripe();

  // Create Express account
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    business_type: 'individual',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_profile: {
      name: businessName,
      mcc: '8999', // Miscellaneous professional services
      url: `https://${practitionerId}.soullab.life`,
    },
    metadata: {
      practitionerId,
      platform: 'soullab',
    },
  });

  // Update practitioner with Stripe account ID
  await updatePractitioner(practitionerId, {
    stripeAccountId: account.id,
  });

  // Create account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/practitioner/${practitionerId}/stripe/refresh`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/practitioner/${practitionerId}/stripe/complete`,
    type: 'account_onboarding',
  });

  return {
    accountId: account.id,
    onboardingUrl: accountLink.url,
  };
}

/**
 * Generate a new account onboarding link for an existing Connect account.
 */
export async function getOnboardingLink(practitionerId: string): Promise<string> {
  const practitioner = await getPractitionerById(practitionerId);
  if (!practitioner?.stripeAccountId) {
    throw new Error('No Stripe account found for this practitioner');
  }

  const stripe = getStripe();

  const accountLink = await stripe.accountLinks.create({
    account: practitioner.stripeAccountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/practitioner/${practitionerId}/stripe/refresh`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/practitioner/${practitionerId}/stripe/complete`,
    type: 'account_onboarding',
  });

  return accountLink.url;
}

/**
 * Check if a Connect account has completed onboarding.
 */
export async function isAccountOnboarded(stripeAccountId: string): Promise<boolean> {
  if (!isStripeConfigured()) return false;

  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(stripeAccountId);

  return account.charges_enabled && account.payouts_enabled;
}

/**
 * Get Connect account dashboard link for practitioners to manage their account.
 */
export async function getDashboardLink(practitionerId: string): Promise<string> {
  const practitioner = await getPractitionerById(practitionerId);
  if (!practitioner?.stripeAccountId) {
    throw new Error('No Stripe account found for this practitioner');
  }

  const stripe = getStripe();

  const loginLink = await stripe.accounts.createLoginLink(
    practitioner.stripeAccountId
  );

  return loginLink.url;
}

// ============== PAYMENT PROCESSING WITH REVENUE SHARE ==============

interface CreatePaymentOptions {
  practitionerId: string;
  amount: number; // In cents
  currency?: string;
  description: string;
  customerEmail: string;
  clientId?: string;
  type: 'session' | 'subscription' | 'package' | 'product' | 'gift';
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create a Checkout Session with automatic revenue share.
 * The platform fee (12% or 10%) is automatically deducted.
 */
export async function createCheckoutWithRevenueShare(
  options: CreatePaymentOptions
): Promise<string> {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured');
  }

  const practitioner = await getPractitionerById(options.practitionerId);
  if (!practitioner) {
    throw new Error('Practitioner not found');
  }

  if (!practitioner.stripeAccountId) {
    throw new Error('Practitioner has not connected their Stripe account');
  }

  const stripe = getStripe();

  // Calculate platform fee based on revenue share percentage
  const platformFeePercent = practitioner.revenueSharePercent;
  const applicationFeeAmount = Math.round(options.amount * (platformFeePercent / 100));

  // Create checkout session with Connect destination
  const session = await stripe.checkout.sessions.create({
    mode: options.type === 'subscription' ? 'subscription' : 'payment',
    line_items: [
      {
        price_data: {
          currency: options.currency || 'usd',
          product_data: {
            name: options.description,
          },
          unit_amount: options.amount,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: options.type !== 'subscription' ? {
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: practitioner.stripeAccountId,
      },
    } : undefined,
    subscription_data: options.type === 'subscription' ? {
      application_fee_percent: platformFeePercent,
      transfer_data: {
        destination: practitioner.stripeAccountId,
      },
    } : undefined,
    customer_email: options.customerEmail,
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    metadata: {
      practitionerId: options.practitionerId,
      clientId: options.clientId || '',
      type: options.type,
      platformFeePercent: platformFeePercent.toString(),
    },
  });

  return session.url || '';
}

/**
 * Create a Payment Intent with revenue share (for embedded checkout).
 */
export async function createPaymentIntentWithRevenueShare(
  practitionerId: string,
  amount: number,
  currency: string = 'usd',
  metadata?: Record<string, string>
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured');
  }

  const practitioner = await getPractitionerById(practitionerId);
  if (!practitioner?.stripeAccountId) {
    throw new Error('Practitioner has not connected their Stripe account');
  }

  const stripe = getStripe();

  // Calculate platform fee
  const platformFeePercent = practitioner.revenueSharePercent;
  const applicationFeeAmount = Math.round(amount * (platformFeePercent / 100));

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    application_fee_amount: applicationFeeAmount,
    transfer_data: {
      destination: practitioner.stripeAccountId,
    },
    metadata: {
      practitionerId,
      platformFeePercent: platformFeePercent.toString(),
      ...metadata,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret || '',
    paymentIntentId: paymentIntent.id,
  };
}

// ============== WEBHOOK HANDLING ==============

/**
 * Handle Stripe webhook events for practitioner payments.
 */
export async function handlePractitionerWebhook(
  event: Stripe.Event
): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSucceeded(paymentIntent);
      break;
    }

    case 'account.updated': {
      const account = event.data.object as Stripe.Account;
      await handleAccountUpdated(account);
      break;
    }

    default:
      // Ignore other events
      break;
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const practitionerId = session.metadata?.practitionerId;
  if (!practitionerId) return;

  const type = session.metadata?.type as 'session' | 'subscription' | 'package' | 'product' | 'gift' | undefined;
  if (!type) return;

  const amount = session.amount_total || 0;
  const currency = session.currency || 'usd';

  // Record the revenue
  await recordRevenue(practitionerId, {
    type,
    amount,
    currency,
    stripePaymentId: session.payment_intent as string || session.id,
    clientId: session.metadata?.clientId,
    clientEmail: session.customer_email || undefined,
  });

  console.log(`[PRACTITIONER] Revenue recorded: ${amount} ${currency} for ${practitionerId}`);
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const practitionerId = paymentIntent.metadata?.practitionerId;
  if (!practitionerId) return;

  // Update revenue record status
  // (In production, you'd update the existing record based on the payment ID)
  console.log(`[PRACTITIONER] Payment succeeded: ${paymentIntent.id} for ${practitionerId}`);
}

async function handleAccountUpdated(account: Stripe.Account): Promise<void> {
  const practitionerId = account.metadata?.practitionerId;
  if (!practitionerId) return;

  // Check if account is now fully onboarded
  if (account.charges_enabled && account.payouts_enabled) {
    console.log(`[PRACTITIONER] Stripe Connect account onboarded: ${practitionerId}`);
    // Could update practitioner status or send notification
  }
}

// ============== REPORTING ==============

/**
 * Get revenue report for a practitioner.
 */
export async function getRevenueReport(
  practitionerId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalRevenue: number;
  platformFees: number;
  practitionerEarnings: number;
  transactions: Array<{
    date: Date;
    amount: number;
    type: string;
    clientEmail?: string;
  }>;
}> {
  // This would query the revenue_records table
  // For now, return placeholder data
  return {
    totalRevenue: 0,
    platformFees: 0,
    practitionerEarnings: 0,
    transactions: [],
  };
}

/**
 * Get balance for a Connect account.
 */
export async function getConnectBalance(
  practitionerId: string
): Promise<{ available: number; pending: number }> {
  const practitioner = await getPractitionerById(practitionerId);
  if (!practitioner?.stripeAccountId) {
    return { available: 0, pending: 0 };
  }

  if (!isStripeConfigured()) {
    return { available: 0, pending: 0 };
  }

  const stripe = getStripe();

  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: practitioner.stripeAccountId,
    });

    // Get USD balance (or first available currency)
    const usdAvailable = balance.available.find(b => b.currency === 'usd');
    const usdPending = balance.pending.find(b => b.currency === 'usd');

    return {
      available: usdAvailable?.amount || 0,
      pending: usdPending?.amount || 0,
    };
  } catch (error) {
    console.error('[PRACTITIONER] Failed to get Connect balance:', error);
    return { available: 0, pending: 0 };
  }
}
