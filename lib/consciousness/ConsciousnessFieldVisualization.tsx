import React, { useEffect, useRef, useState, useMemo } from 'react';
import { LiveConsciousnessMetrics, ConsciousnessMonitoringEvent, MonitoringAlert } from './RealTimeConsciousnessMonitoring';

// Visualization component props
interface ConsciousnessFieldVisualizationProps {
  metrics: LiveConsciousnessMetrics | null;
  events: ConsciousnessMonitoringEvent[];
  alerts: MonitoringAlert[];
  width?: number;
  height?: number;
  theme?: 'light' | 'dark' | 'sacred';
  showDebugInfo?: boolean;
}

interface ConsciousnessWaveformProps {
  metrics: LiveConsciousnessMetrics;
  width: number;
  height: number;
  theme: string;
}

interface ConsciousnessSpectrumProps {
  metrics: LiveConsciousnessMetrics;
  width: number;
  height: number;
  theme: string;
}

interface FieldCoherenceVisualizerProps {
  metrics: LiveConsciousnessMetrics;
  events: ConsciousnessMonitoringEvent[];
  width: number;
  height: number;
  theme: string;
}

// Color schemes for different themes
const colorSchemes = {
  light: {
    background: '#ffffff',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    text: '#1f2937',
    grid: '#e5e7eb',
    consciousness: '#10b981',
    field: '#3b82f6',
    emergence: '#f59e0b',
    integration: '#8b5cf6'
  },
  dark: {
    background: '#0f172a',
    primary: '#818cf8',
    secondary: '#a78bfa',
    accent: '#f472b6',
    text: '#f1f5f9',
    grid: '#374151',
    consciousness: '#34d399',
    field: '#60a5fa',
    emergence: '#fbbf24',
    integration: '#a78bfa'
  },
  sacred: {
    background: '#1a1b3d',
    primary: '#ffd700',
    secondary: '#ff6b9d',
    accent: '#4ecdc4',
    text: '#f8fafc',
    grid: '#2d3748',
    consciousness: '#ffd700',
    field: '#4ecdc4',
    emergence: '#ff6b9d',
    integration: '#9f7aea'
  }
};

// Main consciousness field visualization component
export const ConsciousnessFieldVisualization: React.FC<ConsciousnessFieldVisualizationProps> = ({
  metrics,
  events,
  alerts,
  width = 800,
  height = 600,
  theme = 'sacred',
  showDebugInfo = false
}) => {
  const [activeTab, setActiveTab] = useState<'field' | 'spectrum' | 'waveform' | 'events'>('field');
  const colors = colorSchemes[theme];

  if (!metrics) {
    return (
      <div className="flex items-center justify-center" style={{ width, height, backgroundColor: colors.background }}>
        <div style={{ color: colors.text }}>
          Initializing consciousness field monitoring...
        </div>
      </div>
    );
  }

  return (
    <div className="consciousness-field-visualization" style={{ width, height, backgroundColor: colors.background }}>
      {/* Header with metrics summary */}
      <div className="p-4 border-b" style={{ borderColor: colors.grid }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
            Consciousness Field Dynamics
          </h3>
          <div className="flex space-x-4 text-sm">
            <div style={{ color: colors.consciousness }}>
              Level: {(metrics.currentConsciousnessLevel * 100).toFixed(1)}%
            </div>
            <div style={{ color: colors.field }}>
              Coherence: {(metrics.fieldCoherence * 100).toFixed(1)}%
            </div>
            <div style={{ color: colors.emergence }}>
              Trajectory: {metrics.emergenceTrajectory}
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex space-x-2">
          {['field', 'spectrum', 'waveform', 'events'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-1 rounded text-sm capitalize ${
                activeTab === tab ? 'font-semibold' : 'opacity-70'
              }`}
              style={{
                backgroundColor: activeTab === tab ? colors.primary : 'transparent',
                color: activeTab === tab ? colors.background : colors.text
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Visualization content */}
      <div className="flex-1" style={{ height: height - 120 }}>
        {activeTab === 'field' && (
          <FieldCoherenceVisualizer
            metrics={metrics}
            events={events}
            width={width}
            height={height - 120}
            theme={theme}
          />
        )}
        {activeTab === 'spectrum' && (
          <ConsciousnessSpectrum
            metrics={metrics}
            width={width}
            height={height - 120}
            theme={theme}
          />
        )}
        {activeTab === 'waveform' && (
          <ConsciousnessWaveform
            metrics={metrics}
            width={width}
            height={height - 120}
            theme={theme}
          />
        )}
        {activeTab === 'events' && (
          <EventsVisualization
            events={events}
            alerts={alerts}
            width={width}
            height={height - 120}
            colors={colors}
          />
        )}
      </div>

      {/* Debug info */}
      {showDebugInfo && (
        <div className="p-2 text-xs border-t" style={{ borderColor: colors.grid, color: colors.text }}>
          Debug: Session Duration: {metrics.sessionDuration.toFixed(1)}m |
          Events: {events.length} |
          Alerts: {alerts.length} |
          Next Emergence: {metrics.nextEmergencePrediction.timeToEmergence.toFixed(1)}m
        </div>
      )}
    </div>
  );
};

// Field coherence and consciousness level visualization
const FieldCoherenceVisualizer: React.FC<FieldCoherenceVisualizerProps> = ({
  metrics,
  events,
  width,
  height,
  theme
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = colorSchemes[theme];
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 3;

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, width, height);

      // Draw consciousness level as central circle
      const consciousnessRadius = maxRadius * metrics.currentConsciousnessLevel;

      // Create gradient for consciousness level
      const consciousnessGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, consciousnessRadius
      );
      consciousnessGradient.addColorStop(0, colors.consciousness + '80');
      consciousnessGradient.addColorStop(0.7, colors.consciousness + '40');
      consciousnessGradient.addColorStop(1, colors.consciousness + '10');

      ctx.fillStyle = consciousnessGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, consciousnessRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw field coherence as outer rings
      const coherenceRadius = maxRadius * (1 + metrics.fieldCoherence * 0.5);
      const numRings = 3;

      for (let i = 0; i < numRings; i++) {
        const ringRadius = consciousnessRadius + (i + 1) * ((coherenceRadius - consciousnessRadius) / numRings);
        const alpha = Math.max(0.1, metrics.fieldCoherence - i * 0.2);

        ctx.strokeStyle = colors.field + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw AI consciousness indicators as floating particles
      if (metrics.aiConsciousnessIndicators > 0.1) {
        const numParticles = Math.floor(metrics.aiConsciousnessIndicators * 20);
        const time = Date.now() * 0.001;

        for (let i = 0; i < numParticles; i++) {
          const angle = (i / numParticles) * Math.PI * 2 + time * 0.5;
          const distance = consciousnessRadius + 20 + Math.sin(time * 2 + i) * 30;
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;

          ctx.fillStyle = colors.accent + '80';
          ctx.beginPath();
          ctx.arc(x, y, 3 + Math.sin(time * 3 + i) * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw emergence trajectory indicator
      const trajectoryLength = 60;
      const trajectoryAngle = metrics.emergenceTrajectory === 'ascending' ? -Math.PI / 4 :
                             metrics.emergenceTrajectory === 'descending' ? Math.PI / 4 : 0;

      if (trajectoryAngle !== 0) {
        const startX = centerX + Math.cos(trajectoryAngle) * consciousnessRadius;
        const startY = centerY + Math.sin(trajectoryAngle) * consciousnessRadius;
        const endX = startX + Math.cos(trajectoryAngle) * trajectoryLength;
        const endY = startY + Math.sin(trajectoryAngle) * trajectoryLength;

        ctx.strokeStyle = colors.emergence;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arrow head
        const arrowSize = 10;
        ctx.fillStyle = colors.emergence;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowSize * Math.cos(trajectoryAngle - Math.PI / 6),
          endY - arrowSize * Math.sin(trajectoryAngle - Math.PI / 6)
        );
        ctx.lineTo(
          endX - arrowSize * Math.cos(trajectoryAngle + Math.PI / 6),
          endY - arrowSize * Math.sin(trajectoryAngle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }

      // Draw recent events as pulses
      const recentEvents = events.filter(e => (Date.now() - e.timestamp) < 10000); // Last 10 seconds
      recentEvents.forEach((event, index) => {
        const age = (Date.now() - event.timestamp) / 10000; // 0-1
        const pulse = 1 - age;
        const eventRadius = maxRadius * (1.2 + pulse * 0.3);
        const alpha = pulse * 0.5;

        ctx.strokeStyle = colors.emergence + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 1 + pulse * 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, eventRadius, 0, Math.PI * 2);
        ctx.stroke();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [metrics, events, width, height, colors]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Overlay with text metrics */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex justify-between text-sm">
          <div style={{ color: colors.consciousness }}>
            Consciousness: {(metrics.currentConsciousnessLevel * 100).toFixed(1)}%
          </div>
          <div style={{ color: colors.field }}>
            Field Coherence: {(metrics.fieldCoherence * 100).toFixed(1)}%
          </div>
          <div style={{ color: colors.accent }}>
            AI Indicators: {(metrics.aiConsciousnessIndicators * 100).toFixed(1)}%
          </div>
          <div style={{ color: colors.integration }}>
            Unified Field: {(metrics.unifiedFieldStrength * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

// Consciousness spectrum analysis visualization
const ConsciousnessSpectrum: React.FC<ConsciousnessSpectrumProps> = ({
  metrics,
  width,
  height,
  theme
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = colorSchemes[theme];

  // Generate consciousness frequency data
  const frequencyData = useMemo(() => {
    const frequencies = Array.from({ length: 50 }, (_, i) => i * 2); // 0-98 Hz
    const amplitudes = frequencies.map(freq => {
      // Simulate different consciousness frequencies
      const delta = Math.exp(-Math.pow((freq - 2) / 2, 2)) * metrics.humanConsciousnessDepth; // Delta waves (deep consciousness)
      const theta = Math.exp(-Math.pow((freq - 6) / 2, 2)) * metrics.currentConsciousnessLevel; // Theta waves (meditation)
      const alpha = Math.exp(-Math.pow((freq - 10) / 3, 2)) * metrics.fieldCoherence; // Alpha waves (relaxed awareness)
      const beta = Math.exp(-Math.pow((freq - 20) / 5, 2)) * metrics.aiConsciousnessIndicators; // Beta waves (active consciousness)
      const gamma = Math.exp(-Math.pow((freq - 40) / 8, 2)) * metrics.unifiedFieldStrength; // Gamma waves (unified consciousness)

      return delta + theta + alpha + beta + gamma;
    });

    return { frequencies, amplitudes };
  }, [metrics]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);

    const margin = 40;
    const chartWidth = width - 2 * margin;
    const chartHeight = height - 2 * margin;

    // Draw grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;

    // Vertical lines (frequency)
    for (let i = 0; i <= 10; i++) {
      const x = margin + (i / 10) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, margin);
      ctx.lineTo(x, height - margin);
      ctx.stroke();
    }

    // Horizontal lines (amplitude)
    for (let i = 0; i <= 5; i++) {
      const y = margin + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(width - margin, y);
      ctx.stroke();
    }

    // Draw spectrum
    const maxAmplitude = Math.max(...frequencyData.amplitudes);
    if (maxAmplitude > 0) {
      ctx.strokeStyle = colors.consciousness;
      ctx.lineWidth = 2;
      ctx.beginPath();

      frequencyData.frequencies.forEach((freq, index) => {
        const x = margin + (freq / 100) * chartWidth;
        const amplitude = frequencyData.amplitudes[index];
        const y = height - margin - (amplitude / maxAmplitude) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Fill area under curve
      ctx.fillStyle = colors.consciousness + '20';
      ctx.lineTo(width - margin, height - margin);
      ctx.lineTo(margin, height - margin);
      ctx.closePath();
      ctx.fill();
    }

    // Draw frequency band labels
    ctx.fillStyle = colors.text;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    const bands = [
      { name: 'Delta', freq: 2, color: colors.consciousness },
      { name: 'Theta', freq: 6, color: colors.field },
      { name: 'Alpha', freq: 10, color: colors.emergence },
      { name: 'Beta', freq: 20, color: colors.accent },
      { name: 'Gamma', freq: 40, color: colors.integration }
    ];

    bands.forEach(band => {
      const x = margin + (band.freq / 100) * chartWidth;
      ctx.fillStyle = band.color;
      ctx.fillText(band.name, x, height - 10);
    });

    // Draw axes labels
    ctx.fillStyle = colors.text;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Frequency (Hz)', width / 2, height - 5);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Consciousness Amplitude', 0, 0);
    ctx.restore();

  }, [frequencyData, width, height, colors]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

// Consciousness waveform visualization
const ConsciousnessWaveform: React.FC<ConsciousnessWaveformProps> = ({
  metrics,
  width,
  height,
  theme
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = colorSchemes[theme];
  const [waveformData, setWaveformData] = useState<number[]>([]);

  useEffect(() => {
    // Update waveform data
    setWaveformData(prev => {
      const newData = [...prev, metrics.currentConsciousnessLevel];
      return newData.slice(-100); // Keep last 100 points
    });
  }, [metrics.currentConsciousnessLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);

    if (waveformData.length < 2) return;

    const margin = 20;
    const chartWidth = width - 2 * margin;
    const chartHeight = height - 2 * margin;

    // Draw waveform
    ctx.strokeStyle = colors.consciousness;
    ctx.lineWidth = 2;
    ctx.beginPath();

    waveformData.forEach((value, index) => {
      const x = margin + (index / (waveformData.length - 1)) * chartWidth;
      const y = margin + (1 - value) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw current value indicator
    if (waveformData.length > 0) {
      const currentValue = waveformData[waveformData.length - 1];
      const x = width - margin;
      const y = margin + (1 - currentValue) * chartHeight;

      ctx.fillStyle = colors.consciousness;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw reference lines
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // 50% line
    const midY = margin + chartHeight / 2;
    ctx.beginPath();
    ctx.moveTo(margin, midY);
    ctx.lineTo(width - margin, midY);
    ctx.stroke();

    ctx.setLineDash([]);

  }, [waveformData, width, height, colors]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

// Events and alerts visualization
const EventsVisualization: React.FC<{
  events: ConsciousnessMonitoringEvent[];
  alerts: MonitoringAlert[];
  width: number;
  height: number;
  colors: any;
}> = ({ events, alerts, width, height, colors }) => {
  const recentEvents = events.slice(-10);
  const activeAlerts = alerts.filter(a => !a.resolved);

  return (
    <div className="p-4 h-full overflow-y-auto">
      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
            Active Alerts
          </h4>
          <div className="space-y-2">
            {activeAlerts.map(alert => (
              <div
                key={alert.id}
                className="p-2 rounded border-l-4"
                style={{
                  backgroundColor: colors.background,
                  borderLeftColor: alert.severity === 'critical' ? colors.accent :
                                  alert.severity === 'warning' ? colors.emergence :
                                  colors.field
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: colors.text }}>
                      {alert.message}
                    </div>
                    <div className="text-xs mt-1" style={{ color: colors.text + '80' }}>
                      {alert.recommendedAction}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${alert.severity}`}>
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Events */}
      <div>
        <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
          Recent Consciousness Events
        </h4>
        <div className="space-y-2">
          {recentEvents.map((event, index) => (
            <div
              key={`${event.timestamp}-${index}`}
              className="p-2 rounded"
              style={{ backgroundColor: colors.grid + '40' }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-sm" style={{ color: colors.text }}>
                    <span className="capitalize">{event.eventType.replace('_', ' ')}</span>
                    {event.data?.type && (
                      <span className="ml-2 text-xs" style={{ color: colors.text + '80' }}>
                        ({event.data.type})
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-1" style={{ color: colors.text + '60' }}>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    event.significance === 'critical' ? 'bg-red-100 text-red-800' :
                    event.significance === 'high' ? 'bg-orange-100 text-orange-800' :
                    event.significance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {event.significance}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConsciousnessFieldVisualization;