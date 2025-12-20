'use client';

import React, { useEffect, useState } from 'react';

// Bloom Biometric Validation Dashboard
// Shows biometric progression across Bloom levels
// Validates developmental markers (HRV coherence, ASSR PLV, global synchrony)

interface BloomBiometricData {
  bloomLevel: number;
  avgHrvCoherence: number;
  maxAssrPlv: number;
  avgGlobalSynchrony: number;
  avgDefectDensity: number;
  neuropodSessionsAtLevel: number;
  vibroacousticSessionsAtLevel: number;
  safetyInterventionsCount: number;
  highRiskEventsCount: number;
  firstReachedAt: Date;
  lastUpdatedAt: Date;
}

interface CommonsGateEligibility {
  eligible: boolean;
  bloomAvg: number;
  neuropodSessions: number;
  avgHrv: number;
  maxPlv: number;
  highRiskEvents: number;
  reason: string;
}

export default function BloomBiometricDashboard({ userId }: { userId: string }) {
  const [biometricData, setBiometricData] = useState<BloomBiometricData[]>([]);
  const [commonsEligibility, setCommonsEligibility] = useState<CommonsGateEligibility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Bloom biometric validation data
        const biometricRes = await fetch(`/api/neuropod/biometric-validation?userId=${userId}`);
        const biometric = await biometricRes.json();
        setBiometricData(biometric);

        // Fetch Community Commons gate eligibility
        const commonsRes = await fetch(`/api/neuropod/commons-eligibility?userId=${userId}`);
        const commons = await commonsRes.json();
        setCommonsEligibility(commons);
      } catch (error) {
        console.error('Failed to fetch biometric data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 rounded-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/3"></div>
          <div className="h-64 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  const currentBloomLevel = biometricData.length > 0
    ? biometricData[biometricData.length - 1].bloomLevel
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 rounded-lg border border-purple-500/20">
        <h2 className="text-2xl font-bold text-purple-100 mb-2">
          Bloom Biometric Validation
        </h2>
        <p className="text-purple-300/80 text-sm">
          Your developmental progression validated through nervous system coherence markers
        </p>
      </div>

      {/* Current Bloom Level Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Current Bloom Level"
          value={currentBloomLevel.toFixed(1)}
          icon="🌸"
          color="purple"
        />
        <MetricCard
          label="Total Neuropod Sessions"
          value={biometricData.reduce((sum, d) => sum + d.neuropodSessionsAtLevel, 0)}
          icon="🧠"
          color="blue"
        />
        <MetricCard
          label="Avg HRV Coherence"
          value={currentBloomLevel > 0
            ? (biometricData[biometricData.length - 1]?.avgHrvCoherence * 100).toFixed(0) + '%'
            : 'N/A'}
          icon="💓"
          color="green"
        />
        <MetricCard
          label="Max ASSR PLV"
          value={currentBloomLevel > 0
            ? (biometricData[biometricData.length - 1]?.maxAssrPlv || 0).toFixed(2)
            : 'N/A'}
          icon="🎵"
          color="amber"
        />
      </div>

      {/* Bloom Progression Chart */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Biometric Progression Across Bloom Levels
        </h3>

        <div className="space-y-4">
          {biometricData.map((data, idx) => (
            <BloomLevelRow key={idx} data={data} />
          ))}

          {biometricData.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No biometric data yet</p>
              <p className="text-sm">Complete Neuropod sessions to see your progression</p>
            </div>
          )}
        </div>
      </div>

      {/* Community Commons Enhanced Gate */}
      {commonsEligibility && (
        <div className={`p-6 rounded-lg border ${
          commonsEligibility.eligible
            ? 'bg-green-900/20 border-green-500/30'
            : 'bg-amber-900/20 border-amber-500/30'
        }`}>
          <div className="flex items-start gap-4">
            <div className="text-4xl">
              {commonsEligibility.eligible ? '✅' : '⏳'}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">
                Community Commons Enhanced Gate
              </h3>
              <p className={`text-sm mb-4 ${
                commonsEligibility.eligible ? 'text-green-300' : 'text-amber-300'
              }`}>
                {commonsEligibility.reason}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <GateRequirement
                  label="Bloom Avg"
                  value={commonsEligibility.bloomAvg.toFixed(1)}
                  required="≥4.0"
                  met={commonsEligibility.bloomAvg >= 4.0}
                />
                <GateRequirement
                  label="Neuropod Sessions"
                  value={commonsEligibility.neuropodSessions.toString()}
                  required="≥5"
                  met={commonsEligibility.neuropodSessions >= 5}
                />
                <GateRequirement
                  label="Avg HRV"
                  value={(commonsEligibility.avgHrv * 100).toFixed(0) + '%'}
                  required=">55%"
                  met={commonsEligibility.avgHrv > 0.55}
                />
                <GateRequirement
                  label="Max ASSR PLV"
                  value={commonsEligibility.maxPlv?.toFixed(2) || 'N/A'}
                  required=">0.3"
                  met={(commonsEligibility.maxPlv || 0) > 0.3}
                />
                <GateRequirement
                  label="High-Risk Events"
                  value={commonsEligibility.highRiskEvents.toString()}
                  required="0"
                  met={commonsEligibility.highRiskEvents === 0}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Biometric Insights */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          What These Metrics Mean
        </h3>

        <div className="space-y-4 text-sm text-gray-300">
          <InsightRow
            icon="💓"
            title="HRV Coherence"
            description="Heart rate variability coherence measures nervous system regulation. Higher coherence = better stress resilience and emotional regulation. Target: >55% for stable practice."
          />
          <InsightRow
            icon="🎵"
            title="ASSR PLV (Phase-Locking Value)"
            description="Measures neural entrainment to rhythmic stimulation. PLV >0.3 = measurable brainwave synchronization. Validates that ASSR protocols are actually working."
          />
          <InsightRow
            icon="🧠"
            title="Global Synchrony"
            description="EEG coherence across brain regions. Higher synchrony = more integrated neural processing. Correlates with meditative absorption states."
          />
          <InsightRow
            icon="🌀"
            title="Defect Density"
            description="Chaos/coherence marker from DMT mathematics. Lower defect density = more coherent field state. Tracks developmental progression."
          />
        </div>
      </div>
    </div>
  );
}

// Component: Metric Card
function MetricCard({
  label,
  value,
  icon,
  color
}: {
  label: string;
  value: string | number;
  icon: string;
  color: 'purple' | 'blue' | 'green' | 'amber';
}) {
  const colorClasses = {
    purple: 'bg-purple-900/30 border-purple-500/30 text-purple-100',
    blue: 'bg-blue-900/30 border-blue-500/30 text-blue-100',
    green: 'bg-green-900/30 border-green-500/30 text-green-100',
    amber: 'bg-amber-900/30 border-amber-500/30 text-amber-100',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-gray-400 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

// Component: Bloom Level Row
function BloomLevelRow({ data }: { data: BloomBiometricData }) {
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌸</span>
          <div>
            <div className="font-semibold text-gray-100">
              Bloom Level {data.bloomLevel.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">
              {data.neuropodSessionsAtLevel} sessions at this level
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Reached {new Date(data.firstReachedAt).toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <BiometricValue
          label="HRV Coherence"
          value={(data.avgHrvCoherence * 100).toFixed(0) + '%'}
          benchmark={55}
          currentValue={data.avgHrvCoherence * 100}
        />
        <BiometricValue
          label="ASSR PLV"
          value={data.maxAssrPlv?.toFixed(2) || 'N/A'}
          benchmark={0.3}
          currentValue={data.maxAssrPlv || 0}
        />
        <BiometricValue
          label="Global Synchrony"
          value={(data.avgGlobalSynchrony * 100).toFixed(0) + '%'}
          benchmark={50}
          currentValue={data.avgGlobalSynchrony * 100}
        />
        <BiometricValue
          label="Defect Density"
          value={data.avgDefectDensity.toFixed(2)}
          benchmark={0.3}
          currentValue={data.avgDefectDensity}
          inverse={true}
        />
      </div>

      {data.highRiskEventsCount > 0 && (
        <div className="mt-3 p-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-300">
          ⚠️ {data.highRiskEventsCount} high-risk safety event(s) at this level
        </div>
      )}
    </div>
  );
}

// Component: Biometric Value
function BiometricValue({
  label,
  value,
  benchmark,
  currentValue,
  inverse = false,
}: {
  label: string;
  value: string;
  benchmark: number;
  currentValue: number;
  inverse?: boolean;
}) {
  const meetsBenchmark = inverse
    ? currentValue <= benchmark
    : currentValue >= benchmark;

  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`font-semibold ${
        meetsBenchmark ? 'text-green-400' : 'text-gray-300'
      }`}>
        {value}
        {meetsBenchmark && ' ✓'}
      </div>
    </div>
  );
}

// Component: Gate Requirement
function GateRequirement({
  label,
  value,
  required,
  met,
}: {
  label: string;
  value: string;
  required: string;
  met: boolean;
}) {
  return (
    <div className={`p-2 rounded ${met ? 'bg-green-900/20' : 'bg-gray-800/50'}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`font-semibold text-sm ${met ? 'text-green-400' : 'text-gray-400'}`}>
        {value}
      </div>
      <div className="text-xs text-gray-600">
        {met ? '✓' : ''} {required}
      </div>
    </div>
  );
}

// Component: Insight Row
function InsightRow({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="text-2xl flex-shrink-0">{icon}</div>
      <div>
        <div className="font-semibold text-gray-100 mb-1">{title}</div>
        <div className="text-gray-400 text-xs leading-relaxed">{description}</div>
      </div>
    </div>
  );
}
