'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Flame,
  GitBranch,
  Package,
  Target,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useDailyLog, useProofSignals, DailyLog } from '@/hooks/useStudioData';

const targetHours = 8;

// Day name helper
function getDayName(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export default function MetricsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const { logs, loading: logsLoading, refetch: refetchLogs } = useDailyLog();
  const { current: proofSignals, loading: signalsLoading, refetch: refetchSignals } = useProofSignals();

  const loading = logsLoading || signalsLoading;

  // Refetch when time range changes
  const handleTimeRangeChange = (range: 'week' | 'month') => {
    setTimeRange(range);
    refetchLogs(range);
    refetchSignals(range);
  };

  // Use proof signals if available, otherwise compute from logs
  const avgHours = proofSignals?.avg_hours_per_day ?? 0;
  const totalFires = proofSignals?.total_fires_fought ?? 0;
  const totalDelegated = proofSignals?.total_delegated ?? 0;
  const totalShipped = proofSignals?.total_shipped ?? 0;
  const zeroFireDays = proofSignals?.zero_debugging_days ?? 0;
  const daysLogged = proofSignals?.days_logged ?? 0;
  const delegationRatio = proofSignals?.delegation_ratio ?? 0;
  const targetMet = proofSignals?.target_hours_met ?? false;

  // Build chart data from logs
  const chartData = logs.slice(0, 7).reverse().map(log => ({
    day: getDayName(log.log_date),
    hours: log.hours_at_computer ?? 0,
    fires: log.fires_fought ?? 0,
    delegated: log.tasks_delegated ?? 0,
    shipped: log.shipments ?? 0,
  }));

  const underTargetDays = chartData.filter(d => d.hours < targetHours && d.hours > 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-amber-400" />
            Proof Signals
          </h1>
          <p className="text-slate-500 mt-1">
            Track your progress toward &lt;8 hours/day
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTimeRangeChange('week')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === 'week'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => handleTimeRangeChange('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === 'month'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {/* Avg Hours */}
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-5 h-5 text-amber-400" />
            {targetMet ? (
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <TrendingDown className="w-3 h-3" />
                On target
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-red-400">
                <TrendingUp className="w-3 h-3" />
                Over target
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {avgHours.toFixed(1)}h
          </div>
          <div className="text-sm text-slate-400">Avg hours/day</div>
          <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                targetMet ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, (avgHours / 12) * 100)}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-slate-500">Target: &lt;{targetHours}h</div>
        </div>

        {/* Fires Fought */}
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Flame className="w-5 h-5 text-red-400" />
            {totalFires < 10 ? (
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <TrendingDown className="w-3 h-3" />
                Low
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-red-400">
                <TrendingUp className="w-3 h-3" />
                High
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {totalFires}
          </div>
          <div className="text-sm text-slate-400">Fires fought</div>
          <div className="mt-3 text-xs text-slate-500">
            {zeroFireDays} zero-fire day{zeroFireDays !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Delegated */}
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <GitBranch className="w-5 h-5 text-blue-400" />
            {delegationRatio > 0.5 ? (
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <TrendingUp className="w-3 h-3" />
                Good
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <TrendingUp className="w-3 h-3" />
                Building
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {totalDelegated}
          </div>
          <div className="text-sm text-slate-400">Tasks delegated</div>
          <div className="mt-3 text-xs text-slate-500">
            {(delegationRatio * 100).toFixed(0)}% delegation ratio
          </div>
        </div>

        {/* Shipped */}
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <Package className="w-5 h-5 text-amber-400" />
            <span className="flex items-center gap-1 text-xs text-amber-400">
              <CheckCircle2 className="w-3 h-3" />
              {totalShipped > 0 ? 'Productive' : 'Building'}
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {totalShipped}
          </div>
          <div className="text-sm text-slate-400">Shipments</div>
          <div className="mt-3 text-xs text-slate-500">
            Without your direct coding
          </div>
        </div>
      </div>

      {/* Daily Breakdown Chart */}
      <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-white mb-6">Daily Hours</h2>
        {chartData.length > 0 ? (
          <>
            <div className="flex items-end gap-2 h-48">
              {chartData.map((day, idx) => {
                const heightPercent = day.hours > 0 ? (day.hours / 12) * 100 : 5;
                const isUnderTarget = day.hours < targetHours;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full h-40 flex items-end">
                      {/* Target line */}
                      <div
                        className="absolute w-full border-t border-dashed border-slate-600"
                        style={{ bottom: `${(targetHours / 12) * 100}%` }}
                      />
                      {/* Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ delay: idx * 0.1 }}
                        className={`w-full rounded-t-lg ${
                          day.hours === 0 ? 'bg-slate-700' :
                          isUnderTarget ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                    <div className="text-xs text-slate-400">{day.day}</div>
                    <div className="text-xs text-slate-500">{day.hours}h</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500" />
                <span>Under target (&lt;{targetHours}h)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span>Over target</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 border-t border-dashed border-slate-600" />
                <span>Target line ({targetHours}h)</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <div>No data logged yet</div>
            <div className="text-sm mt-1">Start tracking your daily hours</div>
          </div>
        )}
      </div>

      {/* Proof Summary */}
      <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          {timeRange === 'week' ? 'Weekly' : 'Monthly'} Proof Summary
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-800/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Hours under target?</span>
              {targetMet ? (
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
              ) : (
                <span className="text-red-400 text-sm">Not yet</span>
              )}
            </div>
            <div className="text-2xl font-bold text-white">
              {underTargetDays}/{daysLogged || chartData.length} days
            </div>
          </div>

          <div className="p-4 bg-slate-800/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Zero-fire days?</span>
              {zeroFireDays > 0 ? (
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
              ) : (
                <span className="text-slate-400 text-sm">Working on it</span>
              )}
            </div>
            <div className="text-2xl font-bold text-white">
              {zeroFireDays} day{zeroFireDays !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="p-4 bg-slate-800/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Delegation ratio</span>
              {delegationRatio > 0.7 ? (
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
              ) : delegationRatio > 0.5 ? (
                <span className="text-amber-400 text-sm">Good</span>
              ) : (
                <span className="text-slate-400 text-sm">Building</span>
              )}
            </div>
            <div className="text-2xl font-bold text-white">
              {(delegationRatio * 100).toFixed(0)}%
            </div>
          </div>

          <div className="p-4 bg-slate-800/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Shipped without coding</span>
              {totalShipped > 0 && (
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div className="text-2xl font-bold text-white">
              {totalShipped} items
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
