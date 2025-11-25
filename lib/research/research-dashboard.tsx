/**
 * Research Dashboard for Real-Time Metrics Visualization
 * Track the revolution as it happens
 */

import React, { useState, useEffect } from 'react';
import { Line, Bar, Scatter } from 'recharts';

export const ResearchDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ResearchMetrics>({});
  const [liveDecisions, setLiveDecisions] = useState<EmergenceDecision[]>([]);

  // Real-time metrics streaming
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001/research-stream');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'metrics-update') {
        setMetrics(data.metrics);
      } else if (data.type === 'new-decision') {
        setLiveDecisions(prev => [...prev.slice(-99), data.decision]);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="research-dashboard p-6 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">
        Field Intelligence System - Live Research Data
      </h1>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Breakthrough Rate"
          value={`${metrics.breakthroughRate?.toFixed(1)}%`}
          change={metrics.breakthroughRateChange}
          baseline="2.4%"
          description="Traditional: 2.4% | FIS: Current"
        />

        <MetricCard
          title="Average Restraint"
          value={metrics.restraintRatio?.toFixed(2)}
          change={metrics.restraintChange}
          baseline="3.2"
          description="Words out/in (lower is better)"
        />

        <MetricCard
          title="Trust Velocity"
          value={`${metrics.trustVelocity?.toFixed(1)} exchanges`}
          change={metrics.trustVelocityChange}
          baseline="7.2"
          description="Exchanges to depth"
        />

        <MetricCard
          title="Authenticity Score"
          value={`${metrics.authenticityScore?.toFixed(1)}/10`}
          change={metrics.authenticityChange}
          baseline="6.1"
          description="Human evaluator ratings"
        />
      </div>

      {/* Live Field State Visualization */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Live Field State</h2>
        <FieldStateRadar
          data={liveDecisions[liveDecisions.length - 1]?.fieldState}
        />
      </div>

      {/* Breakthrough Detection Timeline */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Breakthrough Events</h2>
        <BreakthroughTimeline decisions={liveDecisions} />
      </div>

      {/* Cohort Comparison */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Cohort Performance</h2>
        <CohortComparison data={metrics.cohortMetrics} />
      </div>

      {/* Sacred Threshold Recognition */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Sacred Threshold Recognition (Novel Metric)
        </h2>
        <SacredThresholdVisualizer decisions={liveDecisions} />
      </div>

      {/* Statistical Significance */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Statistical Analysis</h2>
        <StatisticalSignificance metrics={metrics} />
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string;
  change?: number;
  baseline: string;
  description: string;
}> = ({ title, value, change, baseline, description }) => (
  <div className="bg-gray-800 p-4 rounded-lg">
    <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
    <div className="text-2xl font-bold mb-1">
      {value}
      {change && (
        <span className={`text-sm ml-2 ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
        </span>
      )}
    </div>
    <div className="text-xs text-gray-500">Baseline: {baseline}</div>
    <div className="text-xs text-gray-500 mt-1">{description}</div>
  </div>
);

const FieldStateRadar: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return <div>Waiting for data...</div>;

  const dimensions = [
    { key: 'emotionalDensity', label: 'Emotional', value: data.emotionalWeather?.density || 0 },
    { key: 'semanticClarity', label: 'Semantic', value: data.semanticLandscape?.clarity || 0 },
    { key: 'relationalDistance', label: 'Relational', value: 1 - (data.connectionDynamics?.distance || 1) },
    { key: 'sacredProximity', label: 'Sacred', value: data.sacredMarkers?.thresholdProximity || 0 },
    { key: 'somaticTension', label: 'Somatic', value: 1 - (data.somaticIntelligence?.tensionLevel || 1) },
    { key: 'temporalRipeness', label: 'Temporal', value: data.temporalDynamics?.kairosPresent ? 1 : 0 }
  ];

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <svg width="400" height="400">
        {/* Radar chart implementation */}
        {dimensions.map((dim, i) => {
          const angle = (i * 2 * Math.PI) / dimensions.length - Math.PI / 2;
          const x = 200 + Math.cos(angle) * dim.value * 150;
          const y = 200 + Math.sin(angle) * dim.value * 150;

          return (
            <g key={dim.key}>
              <line
                x1="200"
                y1="200"
                x2={200 + Math.cos(angle) * 150}
                y2={200 + Math.sin(angle) * 150}
                stroke="gray"
                strokeOpacity="0.3"
              />
              <circle cx={x} cy={y} r="5" fill="#60A5FA" />
              <text
                x={200 + Math.cos(angle) * 170}
                y={200 + Math.sin(angle) * 170}
                fill="white"
                fontSize="12"
                textAnchor="middle"
              >
                {dim.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const BreakthroughTimeline: React.FC<{ decisions: any[] }> = ({ decisions }) => {
  const breakthroughs = decisions.filter(d => d.outcomes?.breakthroughDetected);

  return (
    <div className="bg-gray-800 p-4 rounded-lg h-32 overflow-x-auto">
      <div className="flex items-center h-full">
        {decisions.map((d, i) => (
          <div
            key={i}
            className={`w-2 h-${d.outcomes?.breakthroughDetected ? '16' : '4'} mx-1 ${
              d.outcomes?.breakthroughDetected ? 'bg-yellow-400' : 'bg-gray-600'
            }`}
            title={`Exchange ${i + 1}`}
          />
        ))}
      </div>
      <div className="text-sm text-gray-400 mt-2">
        {breakthroughs.length} breakthroughs in {decisions.length} exchanges
        ({((breakthroughs.length / decisions.length) * 100).toFixed(1)}% rate)
      </div>
    </div>
  );
};

const CohortComparison: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return <div>Loading cohort data...</div>;

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-400">
            <th>Cohort</th>
            <th>Size</th>
            <th>Breakthrough %</th>
            <th>Restraint</th>
            <th>Authenticity</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-gray-700">
            <td>Control (Traditional)</td>
            <td>100</td>
            <td>2.4%</td>
            <td>3.2</td>
            <td>6.1/10</td>
          </tr>
          <tr className="border-t border-gray-700 text-green-400">
            <td>FIS-Full</td>
            <td>100</td>
            <td>{data.fisFullBreakthrough}%</td>
            <td>{data.fisFullRestraint}</td>
            <td>{data.fisFullAuthenticity}/10</td>
          </tr>
          <tr className="border-t border-gray-700">
            <td>FIS-Partial</td>
            <td>100</td>
            <td>{data.fisPartialBreakthrough}%</td>
            <td>{data.fisPartialRestraint}</td>
            <td>{data.fisPartialAuthenticity}/10</td>
          </tr>
          <tr className="border-t border-gray-700">
            <td>Hybrid</td>
            <td>100</td>
            <td>{data.hybridBreakthrough}%</td>
            <td>{data.hybridRestraint}</td>
            <td>{data.hybridAuthenticity}/10</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const SacredThresholdVisualizer: React.FC<{ decisions: any[] }> = ({ decisions }) => {
  // Novel metric visualization showing when Maya recognizes transformational moments
  const thresholdMoments = decisions.filter(d =>
    d.fieldState?.sacredMarkers?.thresholdProximity > 0.7
  );

  const correctRecognition = thresholdMoments.filter(d =>
    d.emergentResponse?.restraintApplied && d.outcomes?.breakthroughDetected
  );

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="mb-4">
        <div className="text-2xl font-bold">
          {((correctRecognition.length / Math.max(thresholdMoments.length, 1)) * 100).toFixed(1)}%
        </div>
        <div className="text-sm text-gray-400">
          Sacred Threshold Recognition Accuracy
        </div>
      </div>

      <div className="text-xs text-gray-500">
        {correctRecognition.length} correct recognitions out of {thresholdMoments.length} threshold moments
      </div>

      <div className="mt-4 text-xs">
        <div className="text-yellow-400">
          This metric doesn't exist in any other AI system
        </div>
      </div>
    </div>
  );
};

const StatisticalSignificance: React.FC<{ metrics: any }> = ({ metrics }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400">
            <th>Metric</th>
            <th>Control</th>
            <th>FIS</th>
            <th>Difference</th>
            <th>p-value</th>
            <th>Significance</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-gray-700">
            <td>Breakthrough Rate</td>
            <td>2.4%</td>
            <td>{metrics.fisBreakthrough}%</td>
            <td className="text-green-400">
              +{(metrics.fisBreakthrough - 2.4).toFixed(1)}%
            </td>
            <td>{metrics.breakthroughPValue}</td>
            <td className="text-green-400">
              {metrics.breakthroughPValue < 0.001 ? '***' : ''}
            </td>
          </tr>
          <tr className="border-t border-gray-700">
            <td>Restraint Ratio</td>
            <td>3.2</td>
            <td>{metrics.fisRestraint}</td>
            <td className="text-green-400">
              -{(3.2 - metrics.fisRestraint).toFixed(1)}
            </td>
            <td>{metrics.restraintPValue}</td>
            <td className="text-green-400">
              {metrics.restraintPValue < 0.001 ? '***' : ''}
            </td>
          </tr>
          <tr className="border-t border-gray-700">
            <td>Trust Velocity</td>
            <td>7.2</td>
            <td>{metrics.fisTrust}</td>
            <td className="text-green-400">
              -{(7.2 - metrics.fisTrust).toFixed(1)}
            </td>
            <td>{metrics.trustPValue}</td>
            <td className="text-green-400">
              {metrics.trustPValue < 0.001 ? '***' : ''}
            </td>
          </tr>
        </tbody>
      </table>
      <div className="text-xs text-gray-500 mt-2">
        *** p {'<'} 0.001 (highly significant)
      </div>
    </div>
  );
};