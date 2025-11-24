"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IntegrationAuthService } from "../../../lib/auth/integrationAuth";
import {
  ContentRecommendation,
  ElementalArchetype,
  ContentType,
  ContentComplexity,
  ContentAdaptationSettings,
} from "../../../lib/types/elemental";

export default function ElementalContentPage() {
  const router = useRouter();
  const authService = new IntegrationAuthService();

  const [recommendations, setRecommendations] = useState<
    ContentRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showSettings, setShowSettings] = useState(false);
  const [adaptationSettings, setAdaptationSettings] =
    useState<ContentAdaptationSettings>({
      emphasizeMetaphorical: true,
      includeDisclaimers: true,
      requireCommunityValidation: false,
      enableCrossDomainIntegration: true,
      preventConsumptionBehavior: true,
      minimumIntegrationGaps: 3,
    });
  const [engagingContent, setEngagingContent] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [activeFilter, adaptationSettings]);

  const loadRecommendations = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push("/auth/signin");
        return;
      }

      setCurrentUser(user);

      // Build query parameters from settings
      const params = new URLSearchParams({
        metaphorical: adaptationSettings.emphasizeMetaphorical.toString(),
        disclaimers: adaptationSettings.includeDisclaimers.toString(),
        community: adaptationSettings.requireCommunityValidation.toString(),
        crossDomain: adaptationSettings.enableCrossDomainIntegration.toString(),
        preventConsumption:
          adaptationSettings.preventConsumptionBehavior.toString(),
        integrationGaps: adaptationSettings.minimumIntegrationGaps.toString(),
      });

      const response = await fetch(`/api/elemental/recommendations?${params}`);

      if (response.status === 429) {
        const errorData = await response.json();
        // Handle pacing limits
        setRecommendations([]);
        // Show pacing message
        return;
      }

      if (response.ok) {
        const data = await response.json();
        let filtered = data.recommendations;

        // Apply archetype filter
        if (activeFilter !== "all") {
          filtered = filtered.filter(
            (rec: ContentRecommendation) =>
              rec.content.archetype === activeFilter,
          );
        }

        setRecommendations(filtered);
      }
    } catch (error) {
      console.error("Recommendations loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const engageWithContent = async (contentId: string, engagement: any) => {
    setEngagingContent(contentId);

    try {
      const response = await fetch("/api/elemental/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId,
          engagement: {
            ...engagement,
            accessedAt: new Date().toISOString(),
            integrationStarted: true,
          },
        }),
      });

      if (response.status === 423) {
        const errorData = await response.json();
        // Handle content locked by integration gate
        alert(`Content Access Restricted: ${errorData.error}`);
        return;
      }

      if (response.ok) {
        // Refresh recommendations to reflect new state
        await loadRecommendations();
      }
    } catch (error) {
      console.error("Content engagement error:", error);
    } finally {
      setEngagingContent(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Elemental Content
              </h1>
              <p className="text-sm text-gray-600">
                Integration-centered development through elemental wisdom
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-500 hover:text-gray-700"
              >
                Settings
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-500 hover:text-gray-700"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white border-b p-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-lg font-medium mb-4">
              Content Adaptation Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={adaptationSettings.emphasizeMetaphorical}
                  onChange={(e) =>
                    setAdaptationSettings((prev) => ({
                      ...prev,
                      emphasizeMetaphorical: e.target.checked,
                    }))
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Emphasize Metaphorical Language</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={adaptationSettings.includeDisclaimers}
                  onChange={(e) =>
                    setAdaptationSettings((prev) => ({
                      ...prev,
                      includeDisclaimers: e.target.checked,
                    }))
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Include Reality Disclaimers</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={adaptationSettings.enableCrossDomainIntegration}
                  onChange={(e) =>
                    setAdaptationSettings((prev) => ({
                      ...prev,
                      enableCrossDomainIntegration: e.target.checked,
                    }))
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Enable Cross-Domain Integration</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: "all", label: "All Elements", icon: "🌀" },
              { id: ElementalArchetype.FIRE, label: "Fire", icon: "🔥" },
              { id: ElementalArchetype.WATER, label: "Water", icon: "🌊" },
              { id: ElementalArchetype.EARTH, label: "Earth", icon: "🌍" },
              { id: ElementalArchetype.AIR, label: "Air", icon: "💨" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeFilter === filter.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Integration Reminder */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">
            Integration-Centered Approach
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Content is adapted to your current integration capacity and
              state
            </li>
            <li>
              • New content may be gated behind completion of integration
              requirements
            </li>
            <li>
              • Focus on embodying insights in daily life rather than
              accumulating knowledge
            </li>
            <li>
              • Reality-grounding prompts help prevent spiritual bypassing
            </li>
          </ul>
        </div>

        {/* Content Recommendations */}
        <div className="space-y-6">
          {recommendations.length > 0 ? (
            recommendations.map((recommendation) => (
              <ContentRecommendationCard
                key={recommendation.content.id}
                recommendation={recommendation}
                onEngage={engageWithContent}
                isEngaging={engagingContent === recommendation.content.id}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeFilter === "all"
                  ? "No content recommendations available"
                  : `No ${activeFilter} content available right now`}
              </h3>
              <p className="text-gray-600 mb-4">
                This might be due to pacing algorithms, integration
                requirements, or your current capacity.
              </p>
              <button
                onClick={() => router.push("/integration/dashboard")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Check Integration Status
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const ContentRecommendationCard: React.FC<{
  recommendation: ContentRecommendation;
  onEngage: (contentId: string, engagement: any) => void;
  isEngaging: boolean;
}> = ({ recommendation, onEngage, isEngaging }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [engagementTime, setEngagementTime] = useState(0);

  const getArchetypeColor = (archetype: ElementalArchetype) => {
    switch (archetype) {
      case ElementalArchetype.FIRE:
        return "bg-red-100 text-red-800 border-red-200";
      case ElementalArchetype.WATER:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case ElementalArchetype.EARTH:
        return "bg-green-100 text-green-800 border-green-200";
      case ElementalArchetype.AIR:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getArchetypeIcon = (archetype: ElementalArchetype) => {
    switch (archetype) {
      case ElementalArchetype.FIRE:
        return "🔥";
      case ElementalArchetype.WATER:
        return "🌊";
      case ElementalArchetype.EARTH:
        return "🌍";
      case ElementalArchetype.AIR:
        return "💨";
    }
  };

  const getComplexityLabel = (complexity: ContentComplexity) => {
    switch (complexity) {
      case ContentComplexity.FOUNDATIONAL:
        return "Foundational";
      case ContentComplexity.INTERMEDIATE:
        return "Intermediate";
      case ContentComplexity.ADVANCED:
        return "Advanced";
      case ContentComplexity.INTEGRATION_FOCUSED:
        return "Integration Focus";
    }
  };

  const getContentTypeLabel = (type: ContentType) => {
    switch (type) {
      case ContentType.INSIGHT:
        return "Insight";
      case ContentType.PRACTICE:
        return "Practice";
      case ContentType.REFLECTION:
        return "Reflection";
      case ContentType.INTEGRATION_EXERCISE:
        return "Integration Exercise";
      case ContentType.REALITY_CHECK:
        return "Reality Check";
      case ContentType.COMMUNITY_PROMPT:
        return "Community Prompt";
    }
  };

  const handleEngagement = () => {
    const startTime = Date.now();
    setShowDetails(true);

    // Simple engagement tracking - in real app this would be more sophisticated
    const interval = setInterval(() => {
      setEngagementTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Auto-clear after viewing
    setTimeout(() => {
      clearInterval(interval);
      onEngage(recommendation.content.id, {
        engagementDuration: Math.floor((Date.now() - startTime) / 1000),
        integrationPeriod: recommendation.content.integrationPeriod,
      });
    }, 5000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">
            {getArchetypeIcon(recommendation.content.archetype)}
          </span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {recommendation.content.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`text-xs px-2 py-1 rounded border ${getArchetypeColor(recommendation.content.archetype)}`}
              >
                {recommendation.content.archetype.toUpperCase()}
              </span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {getComplexityLabel(recommendation.content.complexity)}
              </span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {getContentTypeLabel(recommendation.content.contentType)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            Readiness: {recommendation.integrationReadiness}/10
          </div>
          <div className="text-xs text-gray-600">
            ~{recommendation.content.estimatedEngagementTime} min
          </div>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{recommendation.content.description}</p>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-amber-800">
          <strong>Adaptation:</strong> {recommendation.adaptationReason}
        </p>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">
          Recommended Approach:
        </h4>
        <p className="text-sm text-gray-700">
          {recommendation.recommendedApproach}
        </p>
      </div>

      {showDetails && (
        <div className="border-t pt-4 mb-4">
          <div className="prose max-w-none mb-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <p className="text-sm text-blue-800 italic">
                {recommendation.content.metaphoricalFraming}
              </p>
            </div>

            <div className="text-gray-700">
              {recommendation.content.content}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">
                Real-World Applications:
              </h5>
              <ul className="text-sm text-gray-700 space-y-1">
                {recommendation.content.realWorldApplications.map(
                  (app, index) => (
                    <li key={index}>• {app}</li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">
                Reality-Grounding Prompts:
              </h5>
              <ul className="text-sm text-gray-700 space-y-1">
                {recommendation.realityGroundingPrompts.map((prompt, index) => (
                  <li key={index}>• {prompt}</li>
                ))}
              </ul>
            </div>
          </div>

          {recommendation.content.disclaimers.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4">
              <h5 className="font-medium text-gray-900 mb-2">
                Important Reminders:
              </h5>
              <ul className="text-xs text-gray-600 space-y-1">
                {recommendation.content.disclaimers.map((disclaimer, index) => (
                  <li key={index}>• {disclaimer}</li>
                ))}
              </ul>
            </div>
          )}

          {engagementTime > 0 && (
            <div className="text-center text-sm text-gray-600 mb-4">
              Engagement time: {engagementTime} seconds
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Integration period: {recommendation.content.integrationPeriod} days
        </div>

        {!showDetails ? (
          <button
            onClick={handleEngagement}
            disabled={isEngaging}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isEngaging ? "Processing..." : "Engage with Content"}
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => window.open("/community/reality-check", "_blank")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Share for Reality-Check
            </button>
            <span className="text-green-600 text-sm font-medium">
              ✓ Integration Started
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
