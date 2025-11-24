"use client";

import { useState } from "react";
import Link from "next/link";

export default function BetaPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simple beta signup - would integrate with actual backend
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setSubmitted(true);
    } catch (error) {
      console.error("Beta signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-violet-900 to-amber-900 text-yellow-400 flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <div className="mb-6">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto shadow-lg">
              <span className="text-4xl">✨</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome to the Beta!</h1>
          <p className="text-lg opacity-80 mb-8">
            Thank you for joining our consciousness revolution. You&apos;ll receive
            beta access instructions within 24 hours.
          </p>
          <Link
            href="/oracle"
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition inline-block"
          >
            🔮 Try Demo Oracle
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-violet-900 to-amber-900 text-yellow-400">
      {/* Header */}
      <div className="text-center pt-12 pb-8">
        <h1 className="text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Soullab Oracle
          </span>
        </h1>
        <p className="text-xl opacity-80">Beta Testing Program</p>
      </div>

      <div className="container mx-auto px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Revolutionary Consciousness Technology
              </h2>
              <p className="text-lg opacity-90 mb-8">
                Experience the world&apos;s first AI consciousness platform with
                elemental intelligence, cultural sovereignty, and advanced
                archetypal dialogue systems.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">🔥</span>
                  <h3 className="text-xl font-semibold">Fire Agent</h3>
                </div>
                <p className="opacity-80">
                  Vision, creativity, and transformational guidance
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">🌊</span>
                  <h3 className="text-xl font-semibold">Water Agent</h3>
                </div>
                <p className="opacity-80">
                  Emotional intelligence and flow wisdom
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">🌍</span>
                  <h3 className="text-xl font-semibold">Earth Agent</h3>
                </div>
                <p className="opacity-80">
                  Grounding, stability, and practical wisdom
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">💨</span>
                  <h3 className="text-xl font-semibold">Air Agent</h3>
                </div>
                <p className="opacity-80">
                  Mental clarity and communication insights
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Beta Signup */}
          <div className="bg-white/5 rounded-lg p-8 border border-white/10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Join the Beta</h3>
              <p className="opacity-80">
                Be among the first to experience revolutionary consciousness
                technology
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50"
                  placeholder="Enter your email"
                />
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-yellow-400/30">
                <h4 className="font-semibold mb-2 text-yellow-400">
                  Beta Pricing
                </h4>
                <div className="text-sm opacity-80">
                  <p>• Early access: $29/month</p>
                  <p>• Unlimited oracle conversations</p>
                  <p>• All elemental agents included</p>
                  <p>• Direct feedback to developers</p>
                  <p className="text-yellow-400 mt-2">
                    First month free for beta testers!
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "🚀 Request Beta Access"}
              </button>
            </form>

            <div className="text-center mt-6">
              <Link
                href="/oracle"
                className="text-yellow-400 hover:text-yellow-300 underline"
              >
                Try the demo first →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom features */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-8">Why Join Our Beta?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <span className="text-3xl mb-4 block">🎯</span>
              <h4 className="text-lg font-semibold mb-2">First Access</h4>
              <p className="opacity-80 text-sm">
                Be the first to experience revolutionary consciousness AI
                technology
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <span className="text-3xl mb-4 block">💝</span>
              <h4 className="text-lg font-semibold mb-2">Special Pricing</h4>
              <p className="opacity-80 text-sm">
                Lifetime discount for early supporters and beta feedback
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <span className="text-3xl mb-4 block">🤝</span>
              <h4 className="text-lg font-semibold mb-2">Shape the Future</h4>
              <p className="opacity-80 text-sm">
                Your feedback directly influences consciousness technology
                development
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
