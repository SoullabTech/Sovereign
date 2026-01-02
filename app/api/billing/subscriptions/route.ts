import { NextRequest, NextResponse } from 'next/server';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

/**
 * Subscription and Billing Management API
 * Handles multi-tier subscriptions and clinical framework billing
 */

export enum SubscriptionTier {
  FREE = "free",
  PLUS = "plus", // $9.99/month
  PREMIUM = "premium", // $19.99/month
  PROFESSIONAL = "professional", // $49.99/month
  CLINICAL_IPP = "clinical_ipp", // $149.99/month
  CLINICAL_EMDR = "clinical_emdr", // $99.99/month
  CLINICAL_DBT = "clinical_dbt", // $79.99/month
  CLINICAL_IFS = "clinical_ifs" // $89.99/month
}

export enum BillingCycle {
  MONTHLY = "monthly",
  ANNUALLY = "annually"
}

export enum SubscriptionStatus {
  ACTIVE = "active",
  TRIAL = "trial",
  PAUSED = "paused",
  CANCELLED = "cancelled",
  PAST_DUE = "past_due",
  EXPIRED = "expired"
}

interface Subscription {
  subscriptionId: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;

  // Pricing
  monthlyPrice: number;
  setupFee: number;
  currentPrice: number; // Actual price including discounts

  // Billing dates
  startDate: Date;
  nextBillingDate: Date;
  trialEndDate?: Date;
  cancelledDate?: Date;
  pausedDate?: Date;

  // Trial and discounts
  trialDays: number;
  discountPercent: number;
  promoCode?: string;

  // Features and limits
  features: SubscriptionFeature[];
  usageLimits: UsageLimit[];
  currentUsage: UsageMetric[];

  // Payment information
  paymentMethod?: PaymentMethod;
  lastPayment?: Payment;
  nextPayment?: Payment;
}

interface SubscriptionFeature {
  featureId: string;
  featureName: string;
  included: boolean;
  limit?: number;
}

interface UsageLimit {
  limitId: string;
  limitName: string;
  maxUsage: number;
  resetPeriod: 'daily' | 'weekly' | 'monthly';
}

interface UsageMetric {
  metricId: string;
  metricName: string;
  currentUsage: number;
  lastReset: Date;
}

interface PaymentMethod {
  paymentMethodId: string;
  type: 'credit_card' | 'bank_account' | 'paypal';
  last4: string;
  expiryDate?: string;
  isDefault: boolean;
}

interface Payment {
  paymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: Date;
  description: string;
}

// Subscription tier configurations
const subscriptionTiers: Map<SubscriptionTier, any> = new Map([
  [SubscriptionTier.FREE, {
    monthlyPrice: 0,
    setupFee: 0,
    trialDays: 0,
    features: [
      { featureId: 'basic_ai', featureName: 'Basic AI Conversations', included: true, limit: 50 },
      { featureId: 'wellness_content', featureName: 'Wellness Content', included: true },
    ],
    usageLimits: [
      { limitId: 'daily_messages', limitName: 'Daily Messages', maxUsage: 50, resetPeriod: 'daily' }
    ]
  }],
  [SubscriptionTier.PLUS, {
    monthlyPrice: 9.99,
    setupFee: 0,
    trialDays: 7,
    features: [
      { featureId: 'unlimited_ai', featureName: 'Unlimited AI Conversations', included: true },
      { featureId: 'personalization', featureName: 'Advanced Personalization', included: true },
      { featureId: 'voice_interaction', featureName: 'Voice Interaction', included: true },
    ],
    usageLimits: []
  }],
  [SubscriptionTier.PREMIUM, {
    monthlyPrice: 19.99,
    setupFee: 0,
    trialDays: 14,
    features: [
      { featureId: 'unlimited_ai', featureName: 'Unlimited AI Conversations', included: true },
      { featureId: 'priority_support', featureName: 'Priority Support', included: true },
      { featureId: 'advanced_analytics', featureName: 'Advanced Analytics', included: true },
      { featureId: 'custom_prompts', featureName: 'Custom Prompts', included: true },
    ],
    usageLimits: []
  }],
  [SubscriptionTier.PROFESSIONAL, {
    monthlyPrice: 49.99,
    setupFee: 0,
    trialDays: 14,
    features: [
      { featureId: 'therapeutic_language', featureName: 'Therapeutic Language Model', included: true },
      { featureId: 'professional_docs', featureName: 'Professional Documentation', included: true },
      { featureId: 'outcome_tracking', featureName: 'Outcome Tracking', included: true },
      { featureId: 'client_management', featureName: 'Client Management', included: true, limit: 25 },
    ],
    usageLimits: [
      { limitId: 'monthly_clients', limitName: 'Active Clients', maxUsage: 25, resetPeriod: 'monthly' }
    ]
  }],
  [SubscriptionTier.CLINICAL_IPP, {
    monthlyPrice: 149.99,
    setupFee: 299.99,
    trialDays: 14,
    features: [
      { featureId: 'ipp_assessment', featureName: 'IPP Assessment Suite', included: true },
      { featureId: 'elemental_analysis', featureName: 'Elemental Pattern Analysis', included: true },
      { featureId: 'treatment_planning', featureName: 'AI Treatment Planning', included: true },
      { featureId: 'protocol_execution', featureName: 'Protocol Execution Engine', included: true },
      { featureId: 'supervision_tools', featureName: 'Supervision Dashboard', included: true },
      { featureId: 'research_participation', featureName: 'Research Platform Access', included: true },
    ],
    usageLimits: []
  }]
]);

// In-memory storage for subscriptions (will be replaced with database)
const userSubscriptions: Map<string, Subscription[]> = new Map();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const subscriptionId = searchParams.get('subscriptionId');

    if (!userId || userId === 'guest') {
      return NextResponse.json({
        success: true,
        subscriptions: [{
          subscriptionId: 'free_guest',
          userId: 'guest',
          tier: SubscriptionTier.FREE,
          status: SubscriptionStatus.ACTIVE,
          billingCycle: BillingCycle.MONTHLY,
          monthlyPrice: 0,
          setupFee: 0,
          currentPrice: 0,
          startDate: new Date(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          trialDays: 0,
          discountPercent: 0,
          features: subscriptionTiers.get(SubscriptionTier.FREE)?.features || [],
          usageLimits: subscriptionTiers.get(SubscriptionTier.FREE)?.usageLimits || [],
          currentUsage: []
        }]
      });
    }

    if (subscriptionId) {
      // Get specific subscription
      const userSubs = userSubscriptions.get(userId) || [];
      const subscription = userSubs.find(sub => sub.subscriptionId === subscriptionId);

      if (!subscription) {
        return NextResponse.json(
          { success: false, error: 'Subscription not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        subscription
      });
    }

    // Get all user subscriptions
    const userSubs = userSubscriptions.get(userId) || [];

    // If no subscriptions, create default free subscription
    if (userSubs.length === 0) {
      const freeSubscription = createDefaultSubscription(userId);
      userSubscriptions.set(userId, [freeSubscription]);
      userSubs.push(freeSubscription);
    }

    return NextResponse.json({
      success: true,
      subscriptions: userSubs,
      totalActive: userSubs.filter(sub => sub.status === SubscriptionStatus.ACTIVE).length,
      totalMonthlyCost: userSubs
        .filter(sub => sub.status === SubscriptionStatus.ACTIVE)
        .reduce((total, sub) => total + sub.currentPrice, 0)
    });

  } catch (error) {
    console.error('❌ [BILLING] Error fetching subscriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, data } = body;

    if (!userId || userId === 'guest') {
      return NextResponse.json(
        { success: false, error: 'Authentication required for subscription actions' },
        { status: 401 }
      );
    }

    switch (action) {
      case 'create_subscription':
        return await createSubscription(userId, data);

      case 'upgrade_subscription':
        return await upgradeSubscription(userId, data);

      case 'cancel_subscription':
        return await cancelSubscription(userId, data.subscriptionId);

      case 'pause_subscription':
        return await pauseSubscription(userId, data.subscriptionId);

      case 'resume_subscription':
        return await resumeSubscription(userId, data.subscriptionId);

      case 'apply_promo':
        return await applyPromoCode(userId, data.subscriptionId, data.promoCode);

      case 'update_payment_method':
        return await updatePaymentMethod(userId, data.subscriptionId, data.paymentMethod);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ [BILLING] Error processing subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process subscription request' },
      { status: 500 }
    );
  }
}

function createDefaultSubscription(userId: string): Subscription {
  const tierConfig = subscriptionTiers.get(SubscriptionTier.FREE)!;

  return {
    subscriptionId: `sub_${userId}_${Date.now()}`,
    userId,
    tier: SubscriptionTier.FREE,
    status: SubscriptionStatus.ACTIVE,
    billingCycle: BillingCycle.MONTHLY,
    monthlyPrice: tierConfig.monthlyPrice,
    setupFee: tierConfig.setupFee,
    currentPrice: tierConfig.monthlyPrice,
    startDate: new Date(),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    trialDays: tierConfig.trialDays,
    discountPercent: 0,
    features: tierConfig.features,
    usageLimits: tierConfig.usageLimits,
    currentUsage: tierConfig.usageLimits.map((limit: any) => ({
      metricId: limit.limitId,
      metricName: limit.limitName,
      currentUsage: 0,
      lastReset: new Date()
    }))
  };
}

async function createSubscription(userId: string, data: any) {
  const { tier, billingCycle = BillingCycle.MONTHLY, paymentMethod } = data;

  const tierConfig = subscriptionTiers.get(tier);
  if (!tierConfig) {
    return NextResponse.json(
      { success: false, error: 'Invalid subscription tier' },
      { status: 400 }
    );
  }

  // Check if user already has this subscription
  const userSubs = userSubscriptions.get(userId) || [];
  const existingSub = userSubs.find(sub => sub.tier === tier && sub.status === SubscriptionStatus.ACTIVE);

  if (existingSub) {
    return NextResponse.json(
      { success: false, error: 'User already has an active subscription for this tier' },
      { status: 400 }
    );
  }

  const subscription: Subscription = {
    subscriptionId: `sub_${userId}_${tier}_${Date.now()}`,
    userId,
    tier,
    status: tierConfig.trialDays > 0 ? SubscriptionStatus.TRIAL : SubscriptionStatus.ACTIVE,
    billingCycle,
    monthlyPrice: tierConfig.monthlyPrice,
    setupFee: tierConfig.setupFee,
    currentPrice: tierConfig.monthlyPrice,
    startDate: new Date(),
    nextBillingDate: new Date(Date.now() + (tierConfig.trialDays || 30) * 24 * 60 * 60 * 1000),
    trialEndDate: tierConfig.trialDays > 0 ? new Date(Date.now() + tierConfig.trialDays * 24 * 60 * 60 * 1000) : undefined,
    trialDays: tierConfig.trialDays,
    discountPercent: 0,
    features: tierConfig.features,
    usageLimits: tierConfig.usageLimits,
    currentUsage: tierConfig.usageLimits.map((limit: any) => ({
      metricId: limit.limitId,
      metricName: limit.limitName,
      currentUsage: 0,
      lastReset: new Date()
    })),
    paymentMethod
  };

  // Store subscription
  if (!userSubscriptions.has(userId)) {
    userSubscriptions.set(userId, []);
  }
  userSubscriptions.get(userId)!.push(subscription);

  // Update user roles
  await updateUserRolesForSubscription(userId, subscription);

  return NextResponse.json({
    success: true,
    message: `Successfully created ${tier} subscription`,
    subscription,
    setupRequired: tierConfig.setupFee > 0,
    trialPeriod: tierConfig.trialDays
  });
}

async function upgradeSubscription(userId: string, data: any) {
  const { currentSubscriptionId, newTier } = data;

  const userSubs = userSubscriptions.get(userId) || [];
  const currentSub = userSubs.find(sub => sub.subscriptionId === currentSubscriptionId);

  if (!currentSub) {
    return NextResponse.json(
      { success: false, error: 'Current subscription not found' },
      { status: 404 }
    );
  }

  const newTierConfig = subscriptionTiers.get(newTier);
  if (!newTierConfig) {
    return NextResponse.json(
      { success: false, error: 'Invalid new tier' },
      { status: 400 }
    );
  }

  // Calculate prorated amounts
  const daysRemaining = Math.ceil((currentSub.nextBillingDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  const proratedCredit = (currentSub.currentPrice * daysRemaining) / 30;
  const newMonthlyCharge = newTierConfig.monthlyPrice;
  const upgradeAmount = Math.max(0, newMonthlyCharge - proratedCredit);

  // Update subscription
  currentSub.tier = newTier;
  currentSub.monthlyPrice = newTierConfig.monthlyPrice;
  currentSub.currentPrice = newTierConfig.monthlyPrice;
  currentSub.features = newTierConfig.features;
  currentSub.usageLimits = newTierConfig.usageLimits;

  return NextResponse.json({
    success: true,
    message: `Successfully upgraded to ${newTier}`,
    subscription: currentSub,
    upgradeAmount,
    proratedCredit,
    effectiveDate: new Date()
  });
}

async function cancelSubscription(userId: string, subscriptionId: string) {
  const userSubs = userSubscriptions.get(userId) || [];
  const subscription = userSubs.find(sub => sub.subscriptionId === subscriptionId);

  if (!subscription) {
    return NextResponse.json(
      { success: false, error: 'Subscription not found' },
      { status: 404 }
    );
  }

  subscription.status = SubscriptionStatus.CANCELLED;
  subscription.cancelledDate = new Date();

  return NextResponse.json({
    success: true,
    message: 'Subscription cancelled successfully',
    subscription,
    accessExpiryDate: subscription.nextBillingDate
  });
}

async function pauseSubscription(userId: string, subscriptionId: string) {
  const userSubs = userSubscriptions.get(userId) || [];
  const subscription = userSubs.find(sub => sub.subscriptionId === subscriptionId);

  if (!subscription) {
    return NextResponse.json(
      { success: false, error: 'Subscription not found' },
      { status: 404 }
    );
  }

  subscription.status = SubscriptionStatus.PAUSED;
  subscription.pausedDate = new Date();

  return NextResponse.json({
    success: true,
    message: 'Subscription paused successfully',
    subscription
  });
}

async function resumeSubscription(userId: string, subscriptionId: string) {
  const userSubs = userSubscriptions.get(userId) || [];
  const subscription = userSubs.find(sub => sub.subscriptionId === subscriptionId);

  if (!subscription) {
    return NextResponse.json(
      { success: false, error: 'Subscription not found' },
      { status: 404 }
    );
  }

  subscription.status = SubscriptionStatus.ACTIVE;
  subscription.pausedDate = undefined;

  return NextResponse.json({
    success: true,
    message: 'Subscription resumed successfully',
    subscription
  });
}

async function applyPromoCode(userId: string, subscriptionId: string, promoCode: string) {
  // Mock promo codes for demonstration
  const promoCodes: { [key: string]: { discount: number; description: string } } = {
    'BETA50': { discount: 50, description: '50% off for beta users' },
    'LAUNCH25': { discount: 25, description: '25% off launch promotion' },
    'STUDENT': { discount: 30, description: '30% student discount' }
  };

  const promo = promoCodes[promoCode.toUpperCase()];
  if (!promo) {
    return NextResponse.json(
      { success: false, error: 'Invalid promo code' },
      { status: 400 }
    );
  }

  const userSubs = userSubscriptions.get(userId) || [];
  const subscription = userSubs.find(sub => sub.subscriptionId === subscriptionId);

  if (!subscription) {
    return NextResponse.json(
      { success: false, error: 'Subscription not found' },
      { status: 404 }
    );
  }

  subscription.discountPercent = promo.discount;
  subscription.currentPrice = subscription.monthlyPrice * (1 - promo.discount / 100);
  subscription.promoCode = promoCode;

  return NextResponse.json({
    success: true,
    message: `Promo code applied: ${promo.description}`,
    subscription,
    savings: subscription.monthlyPrice - subscription.currentPrice
  });
}

async function updatePaymentMethod(userId: string, subscriptionId: string, paymentMethod: PaymentMethod) {
  const userSubs = userSubscriptions.get(userId) || [];
  const subscription = userSubs.find(sub => sub.subscriptionId === subscriptionId);

  if (!subscription) {
    return NextResponse.json(
      { success: false, error: 'Subscription not found' },
      { status: 404 }
    );
  }

  subscription.paymentMethod = paymentMethod;

  return NextResponse.json({
    success: true,
    message: 'Payment method updated successfully',
    subscription
  });
}

async function updateUserRolesForSubscription(userId: string, subscription: Subscription) {
  try {
    // Update user roles based on subscription
    const roleUpdate = {
      userId,
      action: 'upgrade_subscription',
      data: { tier: subscription.tier }
    };

    const response = await fetch(`/api/auth/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleUpdate)
    });

    if (!response.ok) {
      console.error('Failed to update user roles for subscription');
    }
  } catch (error) {
    console.error('Error updating user roles for subscription:', error);
  }
}