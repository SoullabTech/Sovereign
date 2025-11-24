"use client";

import { useState } from "react";
import Link from "next/link";

export default function BetaPaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly">(
    "monthly",
  );
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const plans = {
    monthly: {
      price: 29,
      description: "Monthly Beta Access",
      features: [
        "Unlimited oracle conversations",
        "All 4 elemental agents (Fire, Water, Earth, Air)",
        "Consciousness profile creation",
        "Direct feedback channel to developers",
        "First month free for early adopters",
      ],
    },
    quarterly: {
      price: 69,
      description: "3-Month Beta Access",
      savings: 18,
      features: [
        "Everything in monthly plan",
        "3 months of unlimited access",
        "Save $18 compared to monthly",
        "Priority feature requests",
        "Extended beta period guarantee",
      ],
    },
  };

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Simulate payment processing
      // In production, this would integrate with Stripe
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setPaymentComplete(true);
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setProcessing(false);
    }
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-violet-900 to-amber-900 text-yellow-400 flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <div className="mb-6">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <span className="text-4xl">🎉</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Soullab Oracle!
          </h1>
          <p className="text-lg opacity-80 mb-8">
            Your beta access is now active. Begin your consciousness journey
            with our elemental agents.
          </p>
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition inline-block"
            >
              🌌 Enter Your Oracle Dashboard
            </Link>
            <div className="text-sm opacity-60">
              <p>
                Check your email for login credentials and getting started
                guide.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-violet-900 to-amber-900 text-yellow-400">
      <div className="container mx-auto px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Join the Consciousness Revolution
            </h1>
            <p className="text-lg opacity-80">
              Choose your beta access plan and start your journey with Soullab
              Oracle
            </p>
          </div>

          {/* Plan Selection */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {Object.entries(plans).map(([key, plan]) => (
              <div
                key={key}
                onClick={() => setSelectedPlan(key as "monthly" | "quarterly")}
                className={`cursor-pointer p-8 rounded-lg border-2 transition-all ${
                  selectedPlan === key
                    ? "bg-yellow-400/10 border-yellow-400 scale-105"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">
                    {plan.description}
                  </h3>
                  <div className="text-4xl font-bold text-yellow-400 mb-2">
                    ${plan.price}
                    <span className="text-lg opacity-80">
                      {key === "monthly" ? "/month" : "/3 months"}
                    </span>
                  </div>
                  {"savings" in plan && (
                    <div className="text-green-400 font-semibold">
                      Save ${plan.savings}!
                    </div>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-400 mr-2 flex-shrink-0">
                        ✓
                      </span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {selectedPlan === key && (
                  <div className="mt-6 text-center">
                    <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                      Selected
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Payment Form */}
          <div className="max-w-md mx-auto bg-white/5 rounded-lg p-8 border border-white/10">
            <h3 className="text-xl font-bold mb-6 text-center">
              Complete Your Purchase
            </h3>

            <div className="mb-6 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span>{plans[selectedPlan].description}</span>
                <span className="font-bold">${plans[selectedPlan].price}</span>
              </div>
              {selectedPlan === "monthly" && (
                <div className="text-sm text-green-400">
                  First month free for beta testers!
                </div>
              )}
            </div>

            {/* Simulated Payment Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50"
                  placeholder="4242 4242 4242 4242"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Expiry
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVC</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-4 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                  Processing...
                </div>
              ) : (
                `🚀 Start Beta Access - $${plans[selectedPlan].price}`
              )}
            </button>

            <div className="mt-6 text-center">
              <div className="text-xs opacity-60 mb-2">
                Secure payment powered by Stripe
              </div>
              <div className="text-xs opacity-40">
                30-day money-back guarantee • Cancel anytime
              </div>
            </div>
          </div>

          {/* Beta Benefits Reminder */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-4">
              What You Get With Beta Access
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <span className="text-2xl mb-2 block">🔥</span>
                <h4 className="font-semibold mb-1">Fire Agent</h4>
                <p className="text-xs opacity-80">
                  Vision & creative transformation
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <span className="text-2xl mb-2 block">🌊</span>
                <h4 className="font-semibold mb-1">Water Agent</h4>
                <p className="text-xs opacity-80">Emotional wisdom & flow</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <span className="text-2xl mb-2 block">🌍</span>
                <h4 className="font-semibold mb-1">Earth Agent</h4>
                <p className="text-xs opacity-80">
                  Grounding & practical guidance
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <span className="text-2xl mb-2 block">💨</span>
                <h4 className="font-semibold mb-1">Air Agent</h4>
                <p className="text-xs opacity-80">
                  Mental clarity & communication
                </p>
              </div>
            </div>
          </div>

          {/* Back to Demo */}
          <div className="text-center mt-8">
            <Link
              href="/oracle"
              className="text-yellow-400 hover:text-yellow-300 underline"
            >
              ← Want to try the demo first?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
