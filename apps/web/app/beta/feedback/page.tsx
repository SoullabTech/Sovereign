"use client";

import { useState } from "react";
import Link from "next/link";

interface FeedbackData {
  overallRating: number;
  features: {
    fireAgent: number;
    waterAgent: number;
    earthAgent: number;
    airAgent: number;
    interface: number;
    performance: number;
  };
  mostValuable: string;
  improvements: string;
  bugs: string;
  featureRequests: string;
  consciousnessValue: number;
  recommendLikelihood: number;
  additionalComments: string;
}

export default function BetaFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackData>({
    overallRating: 0,
    features: {
      fireAgent: 0,
      waterAgent: 0,
      earthAgent: 0,
      airAgent: 0,
      interface: 0,
      performance: 0,
    },
    mostValuable: "",
    improvements: "",
    bugs: "",
    featureRequests: "",
    consciousnessValue: 0,
    recommendLikelihood: 0,
    additionalComments: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const updateRating = (field: string, value: number) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFeedback((prev) => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFeedback((prev) => ({ ...prev, [field]: value }));
    }
  };

  const updateField = (field: string, value: string) => {
    setFeedback((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Simulate API call - in production, this would send to backend
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (error) {
      console.error("Feedback submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (value: number) => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between mb-4">
      <label className="text-sm font-medium text-yellow-400 flex-1">
        {label}
      </label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-xl transition ${
              value >= star
                ? "text-yellow-400"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            ⭐
          </button>
        ))}
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-violet-900 to-amber-900 text-yellow-400 flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          <div className="mb-6">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <span className="text-4xl">🙏</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
          <p className="text-lg opacity-80 mb-8">
            Your feedback is invaluable in shaping the future of consciousness
            technology. We&apos;re honored to have you as part of this revolutionary
            journey.
          </p>
          <div className="space-y-4">
            <Link
              href="/dashboard/oracle-beta"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition inline-block"
            >
              Continue Testing Oracle
            </Link>
            <div className="text-sm opacity-60">
              <p>
                Your feedback has been sent to our consciousness development
                team.
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
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Beta Feedback</h1>
            <p className="text-lg opacity-80 mb-6">
              Help us refine the consciousness technology platform
            </p>
            <div className="text-sm opacity-60">
              <Link
                href="/dashboard/oracle-beta"
                className="text-yellow-400 hover:text-yellow-300 underline"
              >
                ← Back to Oracle Testing
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Overall Experience */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-6">Overall Experience</h3>

              <StarRating
                value={feedback.overallRating}
                onChange={(value) => updateRating("overallRating", value)}
                label="Overall satisfaction with Soullab Oracle Beta"
              />

              <StarRating
                value={feedback.consciousnessValue}
                onChange={(value) => updateRating("consciousnessValue", value)}
                label="Value for personal consciousness development"
              />

              <StarRating
                value={feedback.recommendLikelihood}
                onChange={(value) => updateRating("recommendLikelihood", value)}
                label="Likelihood to recommend to others"
              />
            </div>

            {/* Feature Ratings */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-6">Feature Ratings</h3>

              <StarRating
                value={feedback.features.fireAgent}
                onChange={(value) => updateRating("features.fireAgent", value)}
                label="🔥 Fire Agent (Vision & Creativity)"
              />

              <StarRating
                value={feedback.features.waterAgent}
                onChange={(value) => updateRating("features.waterAgent", value)}
                label="🌊 Water Agent (Emotional Wisdom)"
              />

              <StarRating
                value={feedback.features.earthAgent}
                onChange={(value) => updateRating("features.earthAgent", value)}
                label="🌍 Earth Agent (Grounding & Practical)"
              />

              <StarRating
                value={feedback.features.airAgent}
                onChange={(value) => updateRating("features.airAgent", value)}
                label="💨 Air Agent (Mental Clarity)"
              />

              <StarRating
                value={feedback.features.interface}
                onChange={(value) => updateRating("features.interface", value)}
                label="User Interface & Experience"
              />

              <StarRating
                value={feedback.features.performance}
                onChange={(value) =>
                  updateRating("features.performance", value)
                }
                label="Performance & Response Speed"
              />
            </div>

            {/* Written Feedback */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-6">Detailed Feedback</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-yellow-400">
                    What feature or aspect do you find most valuable?
                  </label>
                  <textarea
                    value={feedback.mostValuable}
                    onChange={(e) =>
                      updateField("mostValuable", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50 resize-none"
                    placeholder="Share what resonates most with you about the oracle experience..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-yellow-400">
                    What needs improvement or feels unclear?
                  </label>
                  <textarea
                    value={feedback.improvements}
                    onChange={(e) =>
                      updateField("improvements", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50 resize-none"
                    placeholder="Areas for improvement, confusing elements, or unclear guidance..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-yellow-400">
                    Any bugs or technical issues encountered?
                  </label>
                  <textarea
                    value={feedback.bugs}
                    onChange={(e) => updateField("bugs", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50 resize-none"
                    placeholder="Errors, slow loading, broken features, or unexpected behavior..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-yellow-400">
                    Feature requests or ideas for enhancement?
                  </label>
                  <textarea
                    value={feedback.featureRequests}
                    onChange={(e) =>
                      updateField("featureRequests", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50 resize-none"
                    placeholder="New features, agent capabilities, or platform enhancements you&apos;d love to see..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-yellow-400">
                    Additional comments or insights
                  </label>
                  <textarea
                    value={feedback.additionalComments}
                    onChange={(e) =>
                      updateField("additionalComments", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50 resize-none"
                    placeholder="Share your overall experience, how the oracle has impacted your consciousness journey, or any other thoughts..."
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-12 py-4 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                    Sending Feedback...
                  </div>
                ) : (
                  "🙏 Submit Beta Feedback"
                )}
              </button>

              <div className="mt-4 text-sm opacity-60">
                <p>
                  Your feedback directly shapes the consciousness technology
                  development.
                </p>
              </div>
            </div>
          </form>

          {/* Beta Appreciation */}
          <div className="mt-12 bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-2 text-yellow-400">
              🌟 Beta Tester Appreciation
            </h3>
            <p className="opacity-80 text-sm">
              As a beta tester, you&apos;re part of a revolutionary moment in
              consciousness technology. Your insights help us create tools that
              serve the evolution of human awareness and wisdom.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
