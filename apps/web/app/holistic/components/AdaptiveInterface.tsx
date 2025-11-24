"use client";

import React, { useState, useEffect } from "react";
import {
  UserHolisticProfile,
  UserState,
  HolisticDomain,
  DevelopmentStage,
} from "../../../lib/types/holistic";

// Define missing types locally for now
interface StateResponsiveGuidance {
  userState: UserState;
  recommendations: HolisticRecommendation[];
  priorityOrder: string[];
  adaptiveMessage: string;
}

interface HolisticRecommendation {
  id: string;
  domains: HolisticDomain[];
  type: "practice" | "insight" | "integration" | "resource";
  title: string;
  description: string;
  complexity: DevelopmentStage;
  estimatedTime: number;
  benefits: string[];
  prerequisites?: string[];
}

interface AdaptiveInterfaceProps {
  userProfile: UserHolisticProfile;
  onProfileUpdate: (profile: UserHolisticProfile) => void;
}

export const AdaptiveInterface: React.FC<AdaptiveInterfaceProps> = ({
  userProfile,
  onProfileUpdate,
}) => {
  const [guidance, setGuidance] = useState<StateResponsiveGuidance | null>(
    null,
  );
  const [currentComplexity, setCurrentComplexity] = useState<DevelopmentStage>(
    DevelopmentStage.INTERMEDIATE,
  );

  useEffect(() => {
    fetchStateGuidance();
  }, [userProfile.currentState]);

  const fetchStateGuidance = async () => {
    try {
      const response = await fetch("/api/holistic/guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: userProfile }),
      });
      const guidanceData = await response.json();
      setGuidance(guidanceData);
    } catch (error) {
      console.error("Failed to fetch guidance:", error);
    }
  };

  const getStateIndicator = (state: UserState) => {
    const indicators = {
      [UserState.STRESSED]: {
        color: "text-red-600",
        icon: "⚡",
        label: "Stressed",
      },
      [UserState.SEEKING_CLARITY]: {
        color: "text-blue-600",
        icon: "🔍",
        label: "Seeking Clarity",
      },
      [UserState.DISCONNECTED]: {
        color: "text-amber-600",
        icon: "🌊",
        label: "Disconnected",
      },
      [UserState.PHYSICAL_CONCERNS]: {
        color: "text-orange-600",
        icon: "🌱",
        label: "Physical Focus",
      },
      [UserState.BALANCED]: {
        color: "text-green-600",
        icon: "⚖️",
        label: "Balanced",
      },
      [UserState.ENERGIZED]: {
        color: "text-yellow-600",
        icon: "🔥",
        label: "Energized",
      },
      [UserState.REFLECTIVE]: {
        color: "text-indigo-600",
        icon: "🪞",
        label: "Reflective",
      },
    };

    return indicators[state] || indicators[UserState.BALANCED];
  };

  const getDomainIcon = (domain: HolisticDomain) => {
    const icons = {
      [HolisticDomain.MIND]: "🧠",
      [HolisticDomain.BODY]: "🌱",
      [HolisticDomain.SPIRIT]: "✨",
      [HolisticDomain.EMOTIONS]: "💧",
    };
    return icons[domain];
  };

  const getComplexityLabel = (stage: DevelopmentStage) => {
    const labels = {
      [DevelopmentStage.BEGINNER]: "Foundation",
      [DevelopmentStage.INTERMEDIATE]: "Integration",
      [DevelopmentStage.ADVANCED]: "Mastery",
    };
    return labels[stage];
  };

  const handleComplexityChange = (stage: DevelopmentStage) => {
    setCurrentComplexity(stage);
    // Trigger re-fetch of adapted content
    fetchStateGuidance();
  };

  const stateIndicator = getStateIndicator(userProfile.currentState);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Current State Display */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{stateIndicator.icon}</span>
            <div>
              <h2 className={`text-lg font-semibold ${stateIndicator.color}`}>
                Current State: {stateIndicator.label}
              </h2>
              <p className="text-sm text-gray-600">
                {guidance?.adaptiveMessage || "Assessing your current state..."}
              </p>
            </div>
          </div>

          {/* Complexity Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Practice Level:</label>
            <select
              value={currentComplexity}
              onChange={(e) =>
                handleComplexityChange(e.target.value as DevelopmentStage)
              }
              className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(DevelopmentStage).map((stage) => (
                <option key={stage} value={stage}>
                  {getComplexityLabel(stage)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Domain Balance Visualization */}
        <div className="grid grid-cols-4 gap-4">
          {userProfile.domains.map((domain) => (
            <div key={domain.domain} className="text-center">
              <div className="flex flex-col items-center space-y-2">
                <span className="text-2xl">{getDomainIcon(domain.domain)}</span>
                <span className="text-xs font-medium capitalize">
                  {domain.domain}
                </span>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(domain.currentLevel / 10) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">
                  {domain.currentLevel.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* State-Responsive Recommendations */}
      {guidance && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">
            Personalized Recommendations
          </h3>
          <div className="grid gap-4">
            {guidance.recommendations.map((rec, index) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                priority={index + 1}
                userComplexity={currentComplexity}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick State Adjustment */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Check-In</h3>
        <QuickStateAdjustment
          currentProfile={userProfile}
          onStateUpdate={onProfileUpdate}
        />
      </div>
    </div>
  );
};

interface RecommendationCardProps {
  recommendation: HolisticRecommendation;
  priority: number;
  userComplexity: DevelopmentStage;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  priority,
  userComplexity,
}) => {
  const [expanded, setExpanded] = useState(false);

  const isAppropriateComplexity = recommendation.complexity === userComplexity;
  const cardOpacity = isAppropriateComplexity ? "opacity-100" : "opacity-60";

  return (
    <div
      className={`border rounded-lg p-4 transition-all duration-200 ${cardOpacity} ${
        isAppropriateComplexity ? "border-blue-200" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
              Priority {priority}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              {recommendation.complexity}
            </span>
            <span className="text-xs text-gray-500">
              {recommendation.estimatedTime}min
            </span>
          </div>

          <h4 className="font-medium text-gray-900 mb-1">
            {recommendation.title}
          </h4>

          <div className="flex items-center space-x-1 mb-2">
            {recommendation.domains.map((domain) => (
              <span key={domain} className="text-sm">
                {getDomainIcon(domain)}
              </span>
            ))}
            <span className="text-xs text-gray-500 ml-2">
              {recommendation.domains.join(", ")}
            </span>
          </div>

          <p className="text-sm text-gray-700 mb-2">
            {recommendation.description}
          </p>

          {expanded && (
            <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-1">
                  Benefits:
                </h5>
                <ul className="text-xs text-gray-600 list-disc list-inside">
                  {recommendation.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>

              {recommendation.prerequisites && (
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-1">
                    Prerequisites:
                  </h5>
                  <ul className="text-xs text-gray-600 list-disc list-inside">
                    {recommendation.prerequisites.map((prereq, idx) => (
                      <li key={idx}>{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600 ml-4"
        >
          {expanded ? "▼" : "▶"}
        </button>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500 capitalize">
          {recommendation.type}
        </span>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Begin Practice
        </button>
      </div>
    </div>
  );
};

interface QuickStateAdjustmentProps {
  currentProfile: UserHolisticProfile;
  onStateUpdate: (profile: UserHolisticProfile) => void;
}

const QuickStateAdjustment: React.FC<QuickStateAdjustmentProps> = ({
  currentProfile,
  onStateUpdate,
}) => {
  const [stressLevel, setStressLevel] = useState(currentProfile.stressLevel);
  const [energyLevel, setEnergyLevel] = useState(currentProfile.energyLevel);

  const handleUpdate = () => {
    const updatedProfile = {
      ...currentProfile,
      stressLevel,
      energyLevel,
      lastUpdated: new Date(),
    };
    onStateUpdate(updatedProfile);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Stress Level: {stressLevel}
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={stressLevel}
          onChange={(e) => setStressLevel(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Calm</span>
          <span>Very Stressed</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Energy Level: {energyLevel}
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={energyLevel}
          onChange={(e) => setEnergyLevel(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Exhausted</span>
          <span>Energized</span>
        </div>
      </div>

      <button
        onClick={handleUpdate}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Update Current State
      </button>
    </div>
  );
};

function getDomainIcon(domain: HolisticDomain): string {
  const icons = {
    [HolisticDomain.MIND]: "🧠",
    [HolisticDomain.BODY]: "🌱",
    [HolisticDomain.SPIRIT]: "✨",
    [HolisticDomain.EMOTIONS]: "💧",
  };
  return icons[domain];
}
