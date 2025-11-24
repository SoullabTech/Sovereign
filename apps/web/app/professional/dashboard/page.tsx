"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IntegrationAuthService } from "../../../lib/auth/integrationAuth";

interface ProfessionalConnection {
  id: string;
  user_id: string;
  professional_id: string;
  connection_type:
    | "therapy"
    | "coaching"
    | "spiritual_direction"
    | "somatic_work"
    | "mentorship";
  status: "pending" | "active" | "paused" | "completed" | "declined";
  data_sharing_level: "minimal" | "summary" | "detailed";
  platform_integration_consent: boolean;
  start_date?: string;
  user?: {
    display_name: string;
    current_state: string;
    stress_level: number;
    energy_level: number;
  };
}

interface ClientOverview {
  id: string;
  display_name: string;
  connection_type: string;
  current_state: string;
  integration_progress: number;
  last_active: string;
  recent_alerts: any[];
  data_sharing_level: string;
}

export default function ProfessionalDashboard() {
  const router = useRouter();
  const authService = new IntegrationAuthService();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [connections, setConnections] = useState<ProfessionalConnection[]>([]);
  const [clientOverviews, setClientOverviews] = useState<ClientOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "clients" | "insights" | "resources"
  >("overview");

  useEffect(() => {
    loadProfessionalData();
  }, []);

  const loadProfessionalData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        router.push("/auth/signin");
        return;
      }

      const profile = await authService.getUserProfile(user.id);
      if (profile?.account_type !== "professional") {
        router.push("/professional/verification");
        return;
      }

      setCurrentUser({ ...user, profile });

      // Load professional connections
      const connectionsResponse = await fetch(
        `/api/professional/connections/${user.id}`,
      );
      if (connectionsResponse.ok) {
        const connectionsData = await connectionsResponse.json();
        setConnections(connectionsData);

        // Generate client overviews
        const overviews = await generateClientOverviews(connectionsData);
        setClientOverviews(overviews);
      }
    } catch (error) {
      console.error("Professional dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateClientOverviews = async (
    connections: ProfessionalConnection[],
  ): Promise<ClientOverview[]> => {
    const overviews: ClientOverview[] = [];

    for (const connection of connections.filter((c) => c.status === "active")) {
      try {
        const clientDataResponse = await fetch(
          `/api/professional/client-overview/${connection.user_id}?sharing_level=${connection.data_sharing_level}`,
        );
        if (clientDataResponse.ok) {
          const clientData = await clientDataResponse.json();
          overviews.push({
            id: connection.user_id,
            display_name: connection.user?.display_name || "Anonymous Client",
            connection_type: connection.connection_type,
            current_state: connection.user?.current_state || "unknown",
            integration_progress: clientData.integration_progress || 0,
            last_active: clientData.last_active || connection.start_date || "",
            recent_alerts: clientData.recent_alerts || [],
            data_sharing_level: connection.data_sharing_level,
          });
        }
      } catch (error) {
        console.error("Client overview loading error:", error);
      }
    }

    return overviews;
  };

  const updateConnectionStatus = async (
    connectionId: string,
    status: string,
  ) => {
    try {
      const response = await fetch(
        `/api/professional/connections/${connectionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      if (response.ok) {
        loadProfessionalData();
      }
    } catch (error) {
      console.error("Connection update error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser?.profile?.verified_professional) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-4">
            Professional Verification Required
          </h2>
          <p className="text-gray-600 mb-6">
            Your professional credentials are being reviewed. You&apos;ll receive
            access to the professional dashboard once verification is complete.
          </p>
          <button
            onClick={() => router.push("/professional/verification/status")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Check Verification Status
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
                Professional Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                {currentUser.profile.professional_type} •{" "}
                {connections.filter((c) => c.status === "active").length} active
                clients
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Verified Professional
              </span>
              <button
                onClick={() => router.push("/professional/settings")}
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
              { id: "clients", label: "Client Management" },
              { id: "insights", label: "Integration Insights" },
              { id: "resources", label: "Professional Resources" },
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
            clientOverviews={clientOverviews}
            connections={connections}
            professionalType={currentUser.profile.professional_type}
          />
        )}

        {activeTab === "clients" && (
          <ClientManagementTab
            connections={connections}
            onUpdateConnection={updateConnectionStatus}
          />
        )}

        {activeTab === "insights" && (
          <IntegrationInsightsTab clientOverviews={clientOverviews} />
        )}

        {activeTab === "resources" && (
          <ProfessionalResourcesTab
            professionalType={currentUser.profile.professional_type}
          />
        )}
      </main>
    </div>
  );
}

const OverviewTab: React.FC<{
  clientOverviews: ClientOverview[];
  connections: ProfessionalConnection[];
  professionalType: string;
}> = ({ clientOverviews, connections, professionalType }) => {
  const activeClients = clientOverviews.length;
  const pendingConnections = connections.filter(
    (c) => c.status === "pending",
  ).length;
  const clientsNeedingAttention = clientOverviews.filter(
    (c) => c.recent_alerts.length > 0,
  ).length;

  return (
    <div className="space-y-6">
      {/* Professional Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">
          Integration-Centered Professional Collaboration
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Platform data supplements but never replaces direct professional
            assessment
          </li>
          <li>
            • Focus on supporting clients' integration of insights into daily
            life
          </li>
          <li>
            • Watch for spiritual bypassing patterns and gently redirect to
            embodied work
          </li>
          <li>
            • Encourage consistency over intensity in development practices
          </li>
          <li>
            • Validate struggles and ordinary moments as sources of wisdom
          </li>
        </ul>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {activeClients}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">
                Active Clients
              </h3>
              <p className="text-xs text-gray-600">
                Platform integration enabled
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">
                  {pendingConnections}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">
                Pending Connections
              </h3>
              <p className="text-xs text-gray-600">Awaiting client approval</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-semibold">
                  {clientsNeedingAttention}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">
                Need Attention
              </h3>
              <p className="text-xs text-gray-600">Recent integration alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold">
                  {Math.round(
                    clientOverviews.reduce(
                      (sum, c) => sum + c.integration_progress,
                      0,
                    ) / Math.max(clientOverviews.length, 1),
                  )}
                  %
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">
                Avg Integration
              </h3>
              <p className="text-xs text-gray-600">Client progress metric</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      {clientsNeedingAttention > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">
            Clients Needing Attention
          </h3>
          <div className="space-y-4">
            {clientOverviews
              .filter((c) => c.recent_alerts.length > 0)
              .map((client) => (
                <ClientAlertCard key={client.id} client={client} />
              ))}
          </div>
        </div>
      )}

      {/* Client Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Client Overview</h3>
        {clientOverviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientOverviews.map((client) => (
              <ClientOverviewCard key={client.id} client={client} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">
            No active client connections yet. Clients can request professional
            connections through their platform settings.
          </p>
        )}
      </div>
    </div>
  );
};

const ClientAlertCard: React.FC<{ client: ClientOverview }> = ({ client }) => (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
    <div className="flex items-start justify-between">
      <div>
        <h4 className="font-medium text-amber-900">{client.display_name}</h4>
        <p className="text-sm text-amber-800">
          {client.recent_alerts.length} integration alert
          {client.recent_alerts.length !== 1 ? "s" : ""}
        </p>
      </div>
      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
        {client.connection_type}
      </span>
    </div>
    <div className="mt-2 space-y-1">
      {client.recent_alerts.slice(0, 2).map((alert: any, index: number) => (
        <p key={index} className="text-xs text-amber-700">
          • {alert.pattern?.replace("_", " ") || "Integration support needed"}
        </p>
      ))}
    </div>
  </div>
);

const ClientOverviewCard: React.FC<{ client: ClientOverview }> = ({
  client,
}) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h4 className="font-medium text-gray-900">{client.display_name}</h4>
        <p className="text-sm text-gray-600 capitalize">
          {client.current_state}
        </p>
      </div>
      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
        {client.connection_type}
      </span>
    </div>

    <div className="space-y-2">
      <div>
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Integration Progress</span>
          <span>{client.integration_progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full"
            style={{ width: `${client.integration_progress}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-600">
        <span>Last Active</span>
        <span>{new Date(client.last_active).toLocaleDateString()}</span>
      </div>

      <div className="flex justify-between text-xs text-gray-600">
        <span>Data Sharing</span>
        <span className="capitalize">{client.data_sharing_level}</span>
      </div>
    </div>

    {client.recent_alerts.length > 0 && (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
          {client.recent_alerts.length} alert
          {client.recent_alerts.length !== 1 ? "s" : ""}
        </span>
      </div>
    )}
  </div>
);

// Placeholder components for other tabs
const ClientManagementTab: React.FC<{
  connections: ProfessionalConnection[];
  onUpdateConnection: (id: string, status: string) => void;
}> = ({ connections, onUpdateConnection }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Client Connections</h3>
      {connections.length > 0 ? (
        <div className="space-y-4">
          {connections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              onUpdate={onUpdateConnection}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center py-8">
          No client connections yet. Clients can initiate professional
          connections through their settings.
        </p>
      )}
    </div>
  </div>
);

const ConnectionCard: React.FC<{
  connection: ProfessionalConnection;
  onUpdate: (id: string, status: string) => void;
}> = ({ connection, onUpdate }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex items-start justify-between">
      <div>
        <h4 className="font-medium text-gray-900">
          {connection.user?.display_name || "Anonymous Client"}
        </h4>
        <p className="text-sm text-gray-600 capitalize">
          {connection.connection_type} • {connection.status}
        </p>
        <p className="text-xs text-gray-500">
          Data Sharing: {connection.data_sharing_level}
        </p>
      </div>

      <div className="flex space-x-2">
        {connection.status === "pending" && (
          <>
            <button
              onClick={() => onUpdate(connection.id, "active")}
              className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Accept
            </button>
            <button
              onClick={() => onUpdate(connection.id, "declined")}
              className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Decline
            </button>
          </>
        )}

        {connection.status === "active" && (
          <button
            onClick={() => onUpdate(connection.id, "paused")}
            className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
          >
            Pause
          </button>
        )}
      </div>
    </div>
  </div>
);

const IntegrationInsightsTab: React.FC<{
  clientOverviews: ClientOverview[];
}> = ({ clientOverviews }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4">Integration Pattern Insights</h3>
    <p className="text-gray-600">
      Integration analytics and insights coming soon...
    </p>
  </div>
);

const ProfessionalResourcesTab: React.FC<{
  professionalType: string;
}> = ({ professionalType }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <h3 className="text-lg font-semibold mb-4">Professional Resources</h3>
    <p className="text-gray-600">
      Professional development resources coming soon...
    </p>
  </div>
);
