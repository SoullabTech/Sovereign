"use client";

/**
 * SUBSCRIPTION CANCEL PAGE
 *
 * Shown when user cancels Stripe Checkout.
 */

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function SubscribeCancelPage() {
  const params = useParams();
  const slug = params?.slug as string;

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-gray-400" />
        </div>

        <h1 className="text-2xl font-medium text-gray-100 mb-3">
          Checkout cancelled
        </h1>

        <p className="text-gray-400 mb-8">
          No worries — you weren't charged. You can try again whenever you're ready.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/portal/${slug}/subscribe`}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-amber-500 text-gray-900 font-medium hover:bg-amber-400 transition-colors"
          >
            Try Again
          </Link>

          <Link
            href={`/portal/${slug}`}
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
