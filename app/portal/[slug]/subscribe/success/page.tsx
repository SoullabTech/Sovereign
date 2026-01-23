"use client";

/**
 * SUBSCRIPTION SUCCESS PAGE
 *
 * Shown after successful Stripe Checkout completion.
 * Session ID is available via query param for verification if needed.
 */

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function SubscribeSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const sessionId = searchParams?.get('session_id');

  // Guard: show different UX if arrived without a checkout session
  if (!sessionId) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-amber-900/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-amber-400" />
          </div>

          <h1 className="text-2xl font-medium text-gray-100 mb-3">
            No checkout session found
          </h1>

          <p className="text-gray-400 mb-8">
            It looks like you arrived here without completing a checkout.
            Use the Subscribe button to start a new subscription.
          </p>

          <Link
            href={`/portal/${slug}/subscribe`}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-amber-500 text-gray-900 font-medium hover:bg-amber-400 transition-colors"
          >
            Subscribe
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-green-900/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>

        <h1 className="text-2xl font-medium text-gray-100 mb-3">
          You're subscribed!
        </h1>

        <p className="text-gray-400 mb-8">
          Thank you for subscribing. You now have access to exclusive content and benefits.
        </p>

        <Link
          href={`/portal/${slug}`}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-amber-500 text-gray-900 font-medium hover:bg-amber-400 transition-colors"
        >
          Go to Portal
        </Link>

        <p className="mt-6 text-sm text-gray-500">
          A confirmation email has been sent to your inbox.
        </p>
      </div>
    </main>
  );
}
