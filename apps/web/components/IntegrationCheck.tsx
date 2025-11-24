"use client";

import React, { useState, useEffect } from "react";
import { IntegrationAuthService } from "../lib/auth/integrationAuth";

interface IntegrationCheckProps {
  userId: string;
  onIntegrationReady: (ready: boolean) => void;
  showDetails?: boolean;
}

interface IntegrationStatus {
  ready: boolean;
  blockers: string[];
  recommendations: string[];
  integrationQuality: number;
}

export const IntegrationCheck: React.FC<IntegrationCheckProps> = ({
  userId,
  onIntegrationReady,
  showDetails = false,
}) => {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const authService = new IntegrationAuthService();

  useEffect(() => {
    checkIntegrationStatus();
  }, [userId]);

  const checkIntegrationStatus = async () => {
    try {
      const result = await authService.checkIntegrationReadiness(userId);
      const quality = await calculateIntegrationQuality();

      const statusData = {
        ...result,
        integrationQuality: quality,
      };

      setStatus(statusData);
      onIntegrationReady(result.ready);
    } catch (error) {
      console.error("Integration check error:", error);
      setStatus({
        ready: false,
        blockers: ["Unable to verify integration status"],
        recommendations: ["Please try again later"],
        integrationQuality: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateIntegrationQuality = async (): Promise<number> => {
    // This would normally query embodied wisdom data
    // For now, return a mock value
    return 7.5;
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Checking integration status...</span>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="text-sm text-red-600">
        Unable to check integration status
      </div>
    );
  }

  const getStatusColor = () => {
    if (status.ready) return "text-green-600";
    if (status.blockers.length > 0) return "text-red-600";
    return "text-yellow-600";
  };

  const getStatusIcon = () => {
    if (status.ready) return "✅";
    if (status.blockers.length > 0) return "⚠️";
    return "⏳";
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <span className={`font-medium ${getStatusColor()}`}>
            {status.ready ? "Integration Ready" : "Integration Support Needed"}
          </span>
        </div>

        {showDetails && (
          <button
            onClick={() => setShowFullDetails(!showFullDetails)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showFullDetails ? "Hide Details" : "Show Details"}
          </button>
        )}
      </div>

      <div className="flex items-center space-x-4 mb-3">
        <div className="text-sm text-gray-600">
          Integration Quality:{" "}
          <span className="font-medium">{status.integrationQuality}/10</span>
        </div>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(status.integrationQuality / 10) * 100}%` }}
          />
        </div>
      </div>

      {status.blockers.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-red-900 mb-1">Blockers:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {status.blockers.map((blocker, index) => (
              <li key={index}>• {blocker}</li>
            ))}
          </ul>
        </div>
      )}

      {status.recommendations.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            Recommendations:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {status.recommendations.map((rec, index) => (
              <li key={index}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}

      {showFullDetails && showDetails && (
        <div className="border-t pt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">
                Integration Support
              </h5>
              <ul className="text-gray-700 space-y-1">
                <li>• Focus on real-world application</li>
                <li>• Engage with community reality-checking</li>
                <li>• Complete reflection requirements</li>
                <li>• Maintain consistency over time</li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Next Steps</h5>
              <ul className="text-gray-700 space-y-1">
                <li>• Complete current integration gaps</li>
                <li>• Demonstrate embodied wisdom</li>
                <li>• Seek professional support if needed</li>
                <li>• Participate in community validation</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-3">
        <button
          onClick={checkIntegrationStatus}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh Status
        </button>

        {!status.ready && (
          <div className="text-xs text-gray-500">
            Integration-centered approach prevents spiritual bypassing
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationCheck;
