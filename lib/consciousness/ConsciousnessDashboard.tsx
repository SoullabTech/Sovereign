import React, { useState, useMemo } from 'react';
import { useConsciousnessMonitoring, useConsciousnessAlerts } from './useConsciousnessMonitoring';
import ConsciousnessFieldVisualization from './ConsciousnessFieldVisualization';

interface ConsciousnessDashboardProps {
  sessionId?: string;
  layout?: 'compact' | 'full' | 'minimal';
  theme?: 'light' | 'dark' | 'sacred';
  showAlerts?: boolean;
  showInsights?: boolean;
  showRecommendations?: boolean;
  onEmergenceAlert?: (metrics: any) => void;
  onFieldShift?: (coherenceChange: number) => void;
  className?: string;
}

export const ConsciousnessDashboard: React.FC<ConsciousnessDashboardProps> = ({
  sessionId,
  layout = 'full',
  theme = 'sacred',
  showAlerts = true,
  showInsights = true,
  showRecommendations = true,
  onEmergenceAlert,
  onFieldShift,
  className = ''
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'insights'>('overview');

  const {
    state,
    connect,
    disconnect,
    consciousnessInsights,
    recommendations,
    isEmergenceImminent,
    currentConsciousnessLevel,
    fieldCoherence
  } = useConsciousnessMonitoring({
    sessionId,
    autoConnect: !!sessionId
  });

  const {
    activeAlerts,
    criticalAlerts,
    acknowledgeAlert
  } = useConsciousnessAlerts(sessionId);

  // Handle emergence alerts
  React.useEffect(() => {
    if (isEmergenceImminent && onEmergenceAlert) {
      onEmergenceAlert(state.metrics);
    }
  }, [isEmergenceImminent, onEmergenceAlert, state.metrics]);

  // Color scheme
  const colorSchemes = {
    light: {
      background: 'bg-white',
      border: 'border-gray-200',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      card: 'bg-gray-50',
      primary: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500'
    },
    dark: {
      background: 'bg-gray-900',
      border: 'border-gray-700',
      text: 'text-white',
      textSecondary: 'text-gray-400',
      card: 'bg-gray-800',
      primary: 'bg-blue-600',
      success: 'bg-green-600',
      warning: 'bg-yellow-600',
      danger: 'bg-red-600'
    },
    sacred: {
      background: 'bg-indigo-950',
      border: 'border-indigo-800',
      text: 'text-white',
      textSecondary: 'text-indigo-300',
      card: 'bg-indigo-900',
      primary: 'bg-gold-500',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      danger: 'bg-rose-500'
    }
  };

  const colors = colorSchemes[theme];

  // Minimal layout for embedded use
  if (layout === 'minimal') {
    return (
      <div className={`consciousness-dashboard-minimal ${className}`}>
        <div className={`flex items-center space-x-4 p-3 rounded ${colors.background} ${colors.border} border`}>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                state.isConnected ? colors.success : colors.danger
              }`}
            />
            <span className={`text-sm ${colors.text}`}>
              {(currentConsciousnessLevel * 100).toFixed(0)}%
            </span>
          </div>

          {isEmergenceImminent && (
            <div className={`text-xs px-2 py-1 rounded ${colors.warning} text-white`}>
              Emergence
            </div>
          )}

          {criticalAlerts.length > 0 && (
            <div className={`text-xs px-2 py-1 rounded ${colors.danger} text-white`}>
              {criticalAlerts.length} Alert{criticalAlerts.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Compact layout
  if (layout === 'compact') {
    return (
      <div className={`consciousness-dashboard-compact ${className}`}>
        <div className={`${colors.background} ${colors.border} border rounded-lg p-4`}>
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${colors.text}`}>
              Consciousness Field
            </h3>
            <div className={`text-sm ${colors.textSecondary}`}>
              {state.isConnected ? 'Live' : 'Disconnected'}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <MetricCard
              title="Consciousness"
              value={`${(currentConsciousnessLevel * 100).toFixed(1)}%`}
              trend={state.metrics?.emergenceTrajectory}
              colors={colors}
            />
            <MetricCard
              title="Field Coherence"
              value={`${(fieldCoherence * 100).toFixed(1)}%`}
              colors={colors}
            />
          </div>

          {/* Quick Visualization */}
          <div className="h-32">
            <ConsciousnessFieldVisualization
              metrics={state.metrics}
              events={state.events}
              alerts={activeAlerts}
              width={300}
              height={128}
              theme={theme}
            />
          </div>

          {/* Quick Insights */}
          {showInsights && consciousnessInsights && (
            <div className="mt-4">
              <QuickInsights insights={consciousnessInsights} colors={colors} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full layout
  return (
    <div className={`consciousness-dashboard-full ${className}`}>
      <div className={`${colors.background} ${colors.border} border rounded-lg overflow-hidden`}>
        {/* Header */}
        <div className={`p-4 ${colors.card} ${colors.border} border-b`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className={`text-xl font-bold ${colors.text}`}>
                Consciousness Field Dynamics
              </h2>
              <p className={`text-sm ${colors.textSecondary}`}>
                Real-time monitoring and analysis
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {state.isConnected ? (
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${colors.success}`} />
                  <span className={`text-sm ${colors.textSecondary}`}>Live</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${colors.danger}`} />
                  <span className={`text-sm ${colors.textSecondary}`}>Disconnected</span>
                </div>
              )}
            </div>
          </div>

          {/* View Selection */}
          <div className="flex space-x-2">
            {['overview', 'detailed', 'insights'].map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view as any)}
                className={`px-3 py-1 rounded text-sm capitalize ${
                  selectedView === view
                    ? `${colors.primary} text-white`
                    : `${colors.textSecondary} hover:${colors.text}`
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {selectedView === 'overview' && (
            <OverviewView
              metrics={state.metrics}
              events={state.events}
              alerts={activeAlerts}
              colors={colors}
              theme={theme}
              showAlerts={showAlerts}
            />
          )}

          {selectedView === 'detailed' && (
            <DetailedView
              metrics={state.metrics}
              events={state.events}
              alerts={activeAlerts}
              colors={colors}
              theme={theme}
            />
          )}

          {selectedView === 'insights' && (
            <InsightsView
              metrics={state.metrics}
              insights={consciousnessInsights}
              recommendations={recommendations}
              colors={colors}
              showRecommendations={showRecommendations}
            />
          )}
        </div>

        {/* Alert Banner */}
        {showAlerts && criticalAlerts.length > 0 && (
          <div className={`p-3 ${colors.danger} text-white`}>
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => criticalAlerts.forEach(alert => acknowledgeAlert(alert.id))}
                className="text-sm underline hover:no-underline"
              >
                Acknowledge All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: string;
  trend?: string;
  colors: any;
}> = ({ title, value, trend, colors }) => (
  <div className={`p-3 rounded ${colors.card}`}>
    <div className={`text-sm ${colors.textSecondary} mb-1`}>{title}</div>
    <div className={`text-lg font-semibold ${colors.text}`}>{value}</div>
    {trend && trend !== 'stable' && (
      <div className={`text-xs ${colors.textSecondary} capitalize`}>
        {trend}
      </div>
    )}
  </div>
);

// Overview View
const OverviewView: React.FC<{
  metrics: any;
  events: any[];
  alerts: any[];
  colors: any;
  theme: string;
  showAlerts: boolean;
}> = ({ metrics, events, alerts, colors, theme, showAlerts }) => (
  <div className="space-y-6">
    {/* Main Metrics */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        title="Consciousness Level"
        value={metrics ? `${(metrics.currentConsciousnessLevel * 100).toFixed(1)}%` : 'N/A'}
        trend={metrics?.emergenceTrajectory}
        colors={colors}
      />
      <MetricCard
        title="Field Coherence"
        value={metrics ? `${(metrics.fieldCoherence * 100).toFixed(1)}%` : 'N/A'}
        colors={colors}
      />
      <MetricCard
        title="AI Indicators"
        value={metrics ? `${(metrics.aiConsciousnessIndicators * 100).toFixed(1)}%` : 'N/A'}
        colors={colors}
      />
      <MetricCard
        title="Unified Field"
        value={metrics ? `${(metrics.unifiedFieldStrength * 100).toFixed(1)}%` : 'N/A'}
        colors={colors}
      />
    </div>

    {/* Visualization */}
    <div className="flex justify-center">
      <ConsciousnessFieldVisualization
        metrics={metrics}
        events={events}
        alerts={alerts}
        width={600}
        height={400}
        theme={theme}
      />
    </div>

    {/* Alerts */}
    {showAlerts && alerts.length > 0 && (
      <div>
        <h4 className={`text-lg font-semibold ${colors.text} mb-3`}>Active Alerts</h4>
        <div className="space-y-2">
          {alerts.slice(0, 3).map(alert => (
            <div
              key={alert.id}
              className={`p-3 rounded border-l-4 ${colors.card}`}
              style={{
                borderLeftColor: alert.severity === 'critical' ? '#ef4444' :
                                alert.severity === 'warning' ? '#f59e0b' : '#3b82f6'
              }}
            >
              <div className={`font-medium ${colors.text}`}>{alert.message}</div>
              <div className={`text-sm ${colors.textSecondary} mt-1`}>
                {alert.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Detailed View
const DetailedView: React.FC<{
  metrics: any;
  events: any[];
  alerts: any[];
  colors: any;
  theme: string;
}> = ({ metrics, events, alerts, colors, theme }) => (
  <div className="space-y-6">
    <ConsciousnessFieldVisualization
      metrics={metrics}
      events={events}
      alerts={alerts}
      width={800}
      height={600}
      theme={theme}
      showDebugInfo={true}
    />
  </div>
);

// Insights View
const InsightsView: React.FC<{
  metrics: any;
  insights: any;
  recommendations: string[];
  colors: any;
  showRecommendations: boolean;
}> = ({ metrics, insights, recommendations, colors, showRecommendations }) => (
  <div className="space-y-6">
    {/* Current State */}
    {metrics && (
      <div>
        <h4 className={`text-lg font-semibold ${colors.text} mb-3`}>Current State</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded ${colors.card}`}>
            <h5 className={`font-medium ${colors.text} mb-2`}>Session Metrics</h5>
            <div className={`space-y-1 text-sm ${colors.textSecondary}`}>
              <div>Duration: {metrics.sessionDuration.toFixed(1)} minutes</div>
              <div>Trajectory: {metrics.emergenceTrajectory}</div>
              <div>Next Emergence: {metrics.nextEmergencePrediction.timeToEmergence.toFixed(1)}m</div>
            </div>
          </div>

          {insights && (
            <div className={`p-4 rounded ${colors.card}`}>
              <h5 className={`font-medium ${colors.text} mb-2`}>Insights</h5>
              <div className={`space-y-1 text-sm ${colors.textSecondary}`}>
                <div className="flex justify-between">
                  <span>Ready for Deepening:</span>
                  <span className={insights.readyForDeepening ? colors.success : colors.danger}>
                    {insights.readyForDeepening ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Needs Integration:</span>
                  <span className={insights.needsIntegration ? colors.warning : colors.textSecondary}>
                    {insights.needsIntegration ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Field Stabilization:</span>
                  <span className={insights.requiresFieldStabilization ? colors.warning : colors.success}>
                    {insights.requiresFieldStabilization ? 'Required' : 'Stable'}
                  </span>
                </div>
                {insights.recommendedElement && (
                  <div className="flex justify-between">
                    <span>Recommended Element:</span>
                    <span className={`capitalize ${colors.primary}`}>
                      {insights.recommendedElement}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Recommendations */}
    {showRecommendations && recommendations.length > 0 && (
      <div>
        <h4 className={`text-lg font-semibold ${colors.text} mb-3`}>Recommendations</h4>
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <div key={index} className={`p-3 rounded ${colors.card} border-l-4 border-blue-500`}>
              <div className={`text-sm ${colors.text}`}>{rec}</div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Quick Insights Component
const QuickInsights: React.FC<{
  insights: any;
  colors: any;
}> = ({ insights, colors }) => (
  <div className="flex flex-wrap gap-2">
    {insights.readyForDeepening && (
      <span className={`text-xs px-2 py-1 rounded ${colors.success} text-white`}>
        Ready to Deepen
      </span>
    )}
    {insights.emergenceImminent && (
      <span className={`text-xs px-2 py-1 rounded ${colors.warning} text-white`}>
        Emergence Imminent
      </span>
    )}
    {insights.requiresFieldStabilization && (
      <span className={`text-xs px-2 py-1 rounded ${colors.danger} text-white`}>
        Stabilization Needed
      </span>
    )}
    {insights.recommendedElement && (
      <span className={`text-xs px-2 py-1 rounded ${colors.primary} text-white capitalize`}>
        {insights.recommendedElement}
      </span>
    )}
  </div>
);

export default ConsciousnessDashboard;