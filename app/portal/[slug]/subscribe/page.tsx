"use client";

/**
 * PORTAL SUBSCRIBE PAGE
 *
 * Client-facing page to subscribe to practitioner tiers.
 * Shows available pricing and redirects to Stripe Checkout.
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Check, ArrowLeft, Star } from 'lucide-react';

interface TierPricing {
  tier: 'subscriber' | 'vip';
  name: string;
  description: string | null;
  features: string[];
  monthly_price_cents: number;
  annual_price_cents: number | null;
}

interface ClientInfo {
  id: string;
  email: string;
}

type PageStatus = 'loading' | 'ready' | 'no-pricing' | 'no-payments' | 'error' | 'redirecting';

export default function SubscribePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [status, setStatus] = useState<PageStatus>('loading');
  const [pricing, setPricing] = useState<TierPricing[]>([]);
  const [practitionerName, setPractitionerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);

  // Check if user is signed in and get their client status
  useEffect(() => {
    checkClientStatus();
    fetchPricing();
  }, [slug]);

  async function checkClientStatus() {
    // Check localStorage for beta_user (member session)
    const betaUser = localStorage.getItem('beta_user');
    if (!betaUser) {
      setClientInfo(null);
      return;
    }

    try {
      const user = JSON.parse(betaUser);
      if (!user.id) {
        setClientInfo(null);
        return;
      }

      // Check if this member is a client of this practitioner
      const res = await fetch(`/api/portal/${slug}/client/status`, {
        headers: { 'x-member-id': user.id },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isClient) {
          setClientInfo({ id: data.clientId, email: user.email || '' });
        }
      }
    } catch (err) {
      console.error('Failed to check client status:', err);
    }
  }

  async function fetchPricing() {
    try {
      const res = await fetch(`/api/portal/${slug}/pricing`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load pricing');
        setStatus('error');
        return;
      }

      setPractitionerName(data.practitionerName || '');

      if (!data.paymentsEnabled) {
        setStatus('no-payments');
        return;
      }

      if (!data.pricing || data.pricing.length === 0) {
        setStatus('no-pricing');
        return;
      }

      setPricing(data.pricing);
      setStatus('ready');
    } catch (err) {
      setError('Failed to load pricing');
      setStatus('error');
    }
  }

  async function startCheckout(tier: 'subscriber' | 'vip') {
    if (!clientInfo) {
      // Not signed in or not a client - redirect to signin
      router.push(`/signin?return=/portal/${slug}/subscribe`);
      return;
    }

    setSelectedTier(tier);
    setStatus('redirecting');
    setError(null);

    try {
      const res = await fetch(`/api/practitioner/${slug}/client/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientInfo.id,
          tier,
          billingInterval: 'monthly',
          clientEmail: clientInfo.email,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setStatus('ready');
      setSelectedTier(null);
    }
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  // Loading state
  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500/50 animate-spin" />
      </main>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">!</span>
          </div>
          <h1 className="text-xl font-medium text-gray-100 mb-2">Something went wrong</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href={`/portal/${slug}`}
            className="inline-flex items-center space-x-2 text-amber-500 hover:text-amber-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to portal</span>
          </Link>
        </div>
      </main>
    );
  }

  // No payments enabled
  if (status === 'no-payments') {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-medium text-gray-100 mb-2">Subscriptions not available</h1>
          <p className="text-gray-400 mb-6">
            {practitionerName} has not enabled subscriptions yet.
          </p>
          <Link
            href={`/portal/${slug}`}
            className="inline-flex items-center space-x-2 text-amber-500 hover:text-amber-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to portal</span>
          </Link>
        </div>
      </main>
    );
  }

  // No pricing configured
  if (status === 'no-pricing') {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-medium text-gray-100 mb-2">No subscription tiers available</h1>
          <p className="text-gray-400 mb-6">
            {practitionerName} has not set up subscription tiers yet.
          </p>
          <Link
            href={`/portal/${slug}`}
            className="inline-flex items-center space-x-2 text-amber-500 hover:text-amber-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to portal</span>
          </Link>
        </div>
      </main>
    );
  }

  // Main subscribe page
  return (
    <main className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link
            href={`/portal/${slug}`}
            className="inline-flex items-center space-x-2 text-gray-500 hover:text-gray-300 text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {practitionerName}</span>
          </Link>
          <h1 className="text-3xl font-light text-gray-100">Subscribe</h1>
          <p className="mt-3 text-gray-400">
            Choose a plan to unlock exclusive content and benefits.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-700/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Not signed in banner */}
        {!clientInfo && (
          <div className="mb-6 p-4 rounded-xl bg-amber-900/20 border border-amber-700/30 text-amber-200 text-sm">
            <p className="font-medium mb-1">Sign in to subscribe</p>
            <p className="text-amber-300/80">
              You need to be signed in to subscribe. Click any plan to continue.
            </p>
          </div>
        )}

        {/* Pricing cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {pricing.map((tier) => (
            <div
              key={tier.tier}
              className={`relative rounded-2xl border p-6 transition-all ${
                tier.tier === 'vip'
                  ? 'bg-gradient-to-b from-amber-900/20 to-gray-900/50 border-amber-700/30'
                  : 'bg-gray-900/50 border-gray-700/30'
              }`}
            >
              {tier.tier === 'vip' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500 text-gray-900 text-xs font-medium">
                    <Star className="w-3 h-3" />
                    <span>Popular</span>
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h2 className="text-xl font-medium text-gray-100">{tier.name}</h2>
                {tier.description && (
                  <p className="mt-1 text-sm text-gray-400">{tier.description}</p>
                )}
              </div>

              <div className="mb-6">
                <span className="text-4xl font-light text-gray-100">
                  {formatPrice(tier.monthly_price_cents)}
                </span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>

              {tier.features.length > 0 && (
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start space-x-3 text-sm">
                      <Check className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => startCheckout(tier.tier)}
                disabled={status === 'redirecting'}
                className={`w-full py-3 px-6 rounded-xl font-medium transition-colors disabled:opacity-50 ${
                  tier.tier === 'vip'
                    ? 'bg-amber-500 text-gray-900 hover:bg-amber-400'
                    : 'bg-gray-800 text-gray-100 hover:bg-gray-700'
                }`}
              >
                {status === 'redirecting' && selectedTier === tier.tier ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Redirecting...</span>
                  </span>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Secure payment powered by Stripe. Cancel anytime.
        </p>
      </div>
    </main>
  );
}
