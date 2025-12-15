'use client';

import React, { useEffect, useState } from 'react';
import type { OpusPulseData } from '@/lib/types/opusPulse';

export default function OpusPulsePage() {
  const [data, setData] = useState<OpusPulseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOpusPulse();
  }, []);

  async function fetchOpusPulse() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/steward/opus-pulse?startDate=${today}`);

      if (!response.ok) throw new Error('Failed to fetch Opus Pulse data');

      const pulseData = await response.json();
      setData(pulseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading Opus Pulse...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, axiomStats, recentRuptures, validatorMetrics } = data;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Opus Pulse</h1>
        <p className="text-gray-600 mt-1">
          MAIA's ethical alignment dashboard — monitoring how she holds souls through Opus Axioms (Phase 2) and Socratic Validator (Phase 3)
        </p>
      </div>

      {/* Daily Snapshot */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Today's Snapshot ({summary.date})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium">Total Responses</div>
            <div className="text-3xl font-bold text-purple-900">{summary.totalResponses}</div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="text-sm text-amber-600 font-medium">🟡 Gold</div>
            <div className="text-3xl font-bold text-amber-900">{summary.goldCount}</div>
            <div className="text-xs text-amber-600 mt-1">{summary.goldPercent.toFixed(1)}%</div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-600 font-medium">🟠 Warning</div>
            <div className="text-3xl font-bold text-orange-900">{summary.warningCount}</div>
            <div className="text-xs text-orange-600 mt-1">{summary.warningPercent.toFixed(1)}%</div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium">🔴 Rupture</div>
            <div className="text-3xl font-bold text-red-900">{summary.ruptureCount}</div>
            <div className="text-xs text-red-600 mt-1">{summary.rupturePercent.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Axiom Stats Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Axiom Performance</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Axiom
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evaluations
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pass
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warning
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Violation
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pass Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {axiomStats.map((axiom) => (
                <tr key={axiom.axiomId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {axiom.axiomName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-center">
                    {axiom.totalEvaluations}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600 text-center font-medium">
                    {axiom.passCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-orange-600 text-center">
                    {axiom.warningCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-600 text-center font-medium">
                    {axiom.violationCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        axiom.passRate >= 90
                          ? 'bg-green-100 text-green-800'
                          : axiom.passRate >= 75
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {axiom.passRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Socratic Validator Metrics (Phase 3) */}
      {validatorMetrics && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🛡️ Socratic Validator (Phase 3 - Pre-emptive Validation)
          </h2>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">Total Validations</div>
              <div className="text-3xl font-bold text-blue-900">{validatorMetrics.totalValidations}</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-sm text-amber-600 font-medium">🟡 Gold Rate</div>
              <div className="text-3xl font-bold text-amber-900">{validatorMetrics.goldRate.toFixed(1)}%</div>
              <div className="text-xs text-amber-600 mt-1">Zero ruptures</div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-sm text-orange-600 font-medium">🔧 Regeneration Rate</div>
              <div className="text-3xl font-bold text-orange-900">{validatorMetrics.regenerationRate.toFixed(1)}%</div>
              <div className="text-xs text-orange-600 mt-1">Repaired responses</div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">✓ Pass Rate</div>
              <div className="text-3xl font-bold text-green-900">
                {((validatorMetrics.decisions.allow / validatorMetrics.totalValidations) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-green-600 mt-1">Allowed as-is</div>
            </div>
          </div>

          {/* Decision Breakdown */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Decision Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="text-xs text-gray-600">ALLOW</div>
                <div className="text-xl font-bold text-gray-900">{validatorMetrics.decisions.allow}</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <div className="text-xs text-yellow-700">FLAG</div>
                <div className="text-xl font-bold text-yellow-900">{validatorMetrics.decisions.flag}</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="text-xs text-red-700">BLOCK</div>
                <div className="text-xl font-bold text-red-900">{validatorMetrics.decisions.block}</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                <div className="text-xs text-orange-700">REGENERATE</div>
                <div className="text-xl font-bold text-orange-900">{validatorMetrics.decisions.regenerate}</div>
              </div>
            </div>
          </div>

          {/* By Element */}
          {validatorMetrics.byElement.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Performance by Element</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Element</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Gold Rate</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Regeneration Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {validatorMetrics.byElement.map((elem) => (
                      <tr key={elem.element} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">{elem.element}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">{elem.total}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            elem.goldRate >= 75 ? 'bg-green-100 text-green-800' :
                            elem.goldRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {elem.goldRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            elem.regenerationRate <= 10 ? 'bg-green-100 text-green-800' :
                            elem.regenerationRate <= 25 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {elem.regenerationRate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Ruptures */}
          {validatorMetrics.topRuptures.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Rupture Patterns</h3>
              <div className="space-y-2">
                {validatorMetrics.topRuptures.map((rupture, idx) => (
                  <div key={`${rupture.layer}:${rupture.code}`} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded p-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {rupture.code.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-gray-500">
                        Layer: {rupture.layer.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        rupture.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        rupture.severity === 'VIOLATION' ? 'bg-orange-100 text-orange-800' :
                        rupture.severity === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rupture.severity}
                      </span>
                      <div className="text-lg font-bold text-gray-900 min-w-[40px] text-right">
                        {rupture.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Ruptures */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Rupture Candidates ({recentRuptures.length})
        </h2>

        {recentRuptures.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No ruptures detected today 🎉</p>
        ) : (
          <div className="space-y-4">
            {recentRuptures.map((rupture) => (
              <div
                key={rupture.id}
                className="border border-red-200 bg-red-50 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">
                      {new Date(rupture.timestamp).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">User:</span> "{rupture.userMessagePreview}..."
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">MAIA:</span> "{rupture.maiaResponsePreview}..."
                    </div>
                  </div>
                  {rupture.facet && (
                    <div className="ml-4 text-xs text-gray-500">
                      Facet: {rupture.facet}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-2">
                  {rupture.axiomsViolated.length > 0 && (
                    <div className="text-xs">
                      <span className="font-medium text-red-700">Violated:</span>
                      <span className="text-red-600 ml-1">
                        {rupture.axiomsViolated.join(', ')}
                      </span>
                    </div>
                  )}
                  {rupture.axiomsWarned.length > 0 && (
                    <div className="text-xs">
                      <span className="font-medium text-orange-700">Warned:</span>
                      <span className="text-orange-600 ml-1">
                        {rupture.axiomsWarned.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Explainer */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-xs text-purple-700 italic">
          💡 This dashboard shows MAIA's Three-Layer Conscience Architecture in action:
          <br />
          <strong>Phase 2 (Opus Axioms)</strong>: Post-delivery ethical evaluation showing how MAIA held souls
          <br />
          <strong>Phase 3 (Socratic Validator)</strong>: Pre-emptive validation catching ruptures before delivery and regenerating responses when needed
          <br />
          Use these metrics to identify patterns, tune prompts, and ensure MAIA's responses maintain ethical alignment.
        </p>
      </div>
    </div>
  );
}
