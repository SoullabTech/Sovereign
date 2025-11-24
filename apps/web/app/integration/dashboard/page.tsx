"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IntegrationArchitecture,
  IntegrationStage,
  SpiralProgressPoint,
} from "../../../lib/types/integration";
import { IntegrationAuthService } from "../../../lib/auth/integrationAuth";

export default function IntegrationDashboard() {
  const router = useRouter();
  const authService = new IntegrationAuthService();

  const [architecture, setArchitecture] =
    useState<IntegrationArchitecture | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "journey" | "community" | "insights"
  >("overview");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push("/auth/signin");
        return;
      }

      // Load integration architecture and dashboard data
      const [architectureResponse, dashboardResponse] = await Promise.all([
        fetch(`/api/integration/architecture/${user.id}`),
        fetch(`/api/integration/dashboard/${user.id}`),
      ]);

      if (architectureResponse.ok && dashboardResponse.ok) {
        const architectureData = await architectureResponse.json();
        const dashboardData = await dashboardResponse.json();

        setArchitecture(architectureData);
        setDashboardData(dashboardData);
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!architecture || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">
            Integration Architecture Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Let&apos;s initialize your integration-centered development journey.
          </p>
          <button
            onClick={() => router.push("/auth/onboarding")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Start Integration Journey
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Integration Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Phase: {dashboardData.integrationProgress.currentPhase}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <IntegrationStatusIndicator stage={architecture.currentStage} />
              <button
                onClick={() => router.push("/profile/settings")}
                className="text-gray-500 hover:text-gray-700"
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: "overview", label: "Overview" },
              { id: "journey", label: "Integration Journey" },
              { id: "community", label: "Community" },
              { id: "insights", label: "Spiral Insights" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "overview" && (
          <OverviewTab
            architecture={architecture}
            dashboardData={dashboardData}
            onRefresh={loadDashboardData}
          />
        )}

        {activeTab === "journey" && (
          <JourneyTab
            architecture={architecture}
            onUpdate={loadDashboardData}
          />
        )}

        {activeTab === "community" && (
          <CommunityTab
            architecture={architecture}
            onUpdate={loadDashboardData}
          />
        )}

        {activeTab === "insights" && (
          <InsightsTab
            spiralProgress={architecture.spiralProgress}
            spiralInsights={dashboardData.spiralInsights}
          />
        )}
      </main>
    </div>
  );
}

const IntegrationStatusIndicator: React.FC<{ stage: IntegrationStage }> = ({
  stage,
}) => {
  const getStatusInfo = (stage: IntegrationStage) => {
    switch (stage) {
      case "initial_insight":
        return { color: "bg-blue-100 text-blue-800", label: "Exploring" };
      case "reflection_gap":
        return { color: "bg-yellow-100 text-yellow-800", label: "Reflecting" };
      case "reality_application":
        return { color: "bg-orange-100 text-orange-800", label: "Applying" };
      case "daily_integration":
        return { color: "bg-green-100 text-green-800", label: "Integrating" };
      case "embodied_wisdom":
        return { color: "bg-amber-100 text-amber-800", label: "Embodying" };
      case "spiral_revisit":
        return { color: "bg-indigo-100 text-indigo-800", label: "Deepening" };
      default:
        return { color: "bg-gray-100 text-gray-800", label: "Unknown" };
    }
  };

  const statusInfo = getStatusInfo(stage);

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
    >
      {statusInfo.label}
    </span>
  );
};

const OverviewTab: React.FC<{
  architecture: IntegrationArchitecture;
  dashboardData: any;
  onRefresh: () => void;
}> = ({ architecture, dashboardData, onRefresh }) => (
  <div className="space-y-6">
    {/* Bypassing Alerts */}
    {dashboardData.bypassingAlerts.length > 0 && (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-amber-900 mb-2">
          Integration Support Needed
        </h3>
        <div className="space-y-2">
          {dashboardData.bypassingAlerts.map((alert: any, index: number) => (
            <div key={index} className="text-sm text-amber-800">
              <strong>{alert.pattern.replace("_", " ")}</strong>:{" "}
              {alert.interventionRecommended}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Integration Progress */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <IntegrationProgressCard
          progress={dashboardData.integrationProgress}
          consistencyMetrics={dashboardData.consistencyMetrics}
        />
      </div>

      <div>
        <NextActionsCard
          actions={dashboardData.nextActions}
          onRefresh={onRefresh}
        />
      </div>
    </div>

    {/* Recent Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RecentSpiralProgress
        spiralProgress={architecture.spiralProgress.slice(0, 3)}
      />

      <EmbodiedWisdomSummary embodiedWisdom={architecture.embodiedWisdom} />
    </div>
  </div>
);

const IntegrationProgressCard: React.FC<{
  progress: any;
  consistencyMetrics: any;
}> = ({ progress, consistencyMetrics }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4">Integration Progress</h3>

    <div className="space-y-4">
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Integration Gates</span>
          <span>
            {progress.gatesUnlocked} / {progress.totalGates}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentComplete}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-semibold text-gray-900">
            {consistencyMetrics.celebrations.length}
          </div>
          <div className="text-xs text-gray-600">Consistency Celebrations</div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-semibold text-gray-900">
            {progress.currentPhase}
          </div>
          <div className="text-xs text-gray-600">Current Phase</div>
        </div>
      </div>

      {/* Consistency Celebrations */}
      {consistencyMetrics.celebrations.length > 0 && (
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">
            🌱 Celebrating Your Consistency
          </h4>
          <div className="space-y-1">
            {consistencyMetrics.celebrations
              .slice(0, 2)
              .map((celebration: string, index: number) => (
                <p key={index} className="text-sm text-green-800">
                  {celebration}
                </p>
              ))}
          </div>
        </div>
      )}

      {/* Reality Checks */}
      {consistencyMetrics.realityChecks.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            💫 Gentle Reminders
          </h4>
          <div className="space-y-1">
            {consistencyMetrics.realityChecks
              .slice(0, 1)
              .map((check: string, index: number) => (
                <p key={index} className="text-sm text-blue-800">
                  {check}
                </p>
              ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

const NextActionsCard: React.FC<{
  actions: string[];
  onRefresh: () => void;
}> = ({ actions, onRefresh }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4">Next Steps</h3>

    <div className="space-y-3">
      {actions.map((action, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-medium text-blue-600">
              {index + 1}
            </span>
          </div>
          <p className="text-sm text-gray-700">{action}</p>
        </div>
      ))}
    </div>

    <button
      onClick={onRefresh}
      className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors"
    >
      Check Progress
    </button>
  </div>
);

const RecentSpiralProgress: React.FC<{
  spiralProgress: SpiralProgressPoint[];
}> = ({ spiralProgress }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4">Recent Spiral Progress</h3>

    {spiralProgress.length > 0 ? (
      <div className="space-y-4">
        {spiralProgress.map((progress, index) => (
          <div key={progress.id} className="border-l-4 border-blue-200 pl-4">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900">{progress.theme}</h4>
              <span className="text-xs text-gray-500">
                Depth {progress.depth}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{progress.phase}</p>
            {progress.realWorldApplication.length > 0 && (
              <p className="text-xs text-gray-500">
                Applications:{" "}
                {progress.realWorldApplication.slice(0, 2).join(", ")}
                {progress.realWorldApplication.length > 2 && "..."}
              </p>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-sm">
        No spiral progress recorded yet. Start by reflecting on a recent insight
        or challenge.
      </p>
    )}
  </div>
);

const EmbodiedWisdomSummary: React.FC<{
  embodiedWisdom: any;
}> = ({ embodiedWisdom }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4">Embodied Wisdom</h3>

    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="text-xl font-semibold text-gray-900">
          {embodiedWisdom.livedExperiences.length}
        </div>
        <div className="text-xs text-gray-600">Lived Experiences</div>
      </div>

      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="text-xl font-semibold text-gray-900">
          {embodiedWisdom.mistakesAndStruggles.length}
        </div>
        <div className="text-xs text-gray-600">Wisdom from Struggles</div>
      </div>

      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="text-xl font-semibold text-gray-900">
          {embodiedWisdom.ordinaryMomentAwareness.length}
        </div>
        <div className="text-xs text-gray-600">Ordinary Moments</div>
      </div>

      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <div className="text-xl font-semibold text-gray-900">
          {embodiedWisdom.consistencyMetrics.length}
        </div>
        <div className="text-xs text-gray-600">Consistent Practices</div>
      </div>
    </div>

    <div className="mt-4">
      <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
        Add Embodied Wisdom
      </button>
    </div>
  </div>
);

// Placeholder components for other tabs
const JourneyTab: React.FC<{
  architecture: IntegrationArchitecture;
  onUpdate: () => void;
}> = ({ architecture, onUpdate }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4">Integration Journey Tracking</h3>
    <p className="text-gray-600">Journey tracking interface coming soon...</p>
  </div>
);

const CommunityTab: React.FC<{
  architecture: IntegrationArchitecture;
  onUpdate: () => void;
}> = ({ architecture, onUpdate }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4">Community Reality-Checking</h3>
    <p className="text-gray-600">Community features coming soon...</p>
  </div>
);

const InsightsTab: React.FC<{
  spiralProgress: SpiralProgressPoint[];
  spiralInsights: any;
}> = ({ spiralProgress, spiralInsights }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4">Spiral Growth Insights</h3>
    <p className="text-gray-600">Insights visualization coming soon...</p>
  </div>
);
