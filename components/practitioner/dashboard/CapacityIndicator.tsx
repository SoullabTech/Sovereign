'use client';

/**
 * CapacityIndicator
 * Shows felt capacity reality, not optimization metrics.
 * Neutral bar - no green/red based on fullness.
 */

interface CapacityIndicatorProps {
  sessionsThisWeek: number;
  maxSessionsPerWeek: number | null;
  bufferIntegrity: 'ok' | 'tight' | 'none';
  recoveryBlocksPresent: boolean;
}

export function CapacityIndicator({
  sessionsThisWeek,
  maxSessionsPerWeek,
  bufferIntegrity,
  recoveryBlocksPresent
}: CapacityIndicatorProps) {
  const percentage = maxSessionsPerWeek
    ? Math.min((sessionsThisWeek / maxSessionsPerWeek) * 100, 100)
    : 0;

  const bufferLabels = {
    ok: 'OK',
    tight: 'Tight',
    none: 'None'
  };

  return (
    <div className="bg-[#111827] rounded-xl border border-gray-700 p-6">
      <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase mb-4">
        Capacity
      </h2>

      <div className="space-y-4">
        {/* Sessions this week */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm text-gray-400">Sessions this week</span>
            <span className="text-sm text-white tabular-nums">
              {sessionsThisWeek}
              {maxSessionsPerWeek && (
                <span className="text-gray-500"> / {maxSessionsPerWeek}</span>
              )}
            </span>
          </div>

          {maxSessionsPerWeek && (
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Buffer integrity */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Buffer integrity</span>
          <span className={`text-sm ${
            bufferIntegrity === 'ok' ? 'text-green-400' :
            bufferIntegrity === 'tight' ? 'text-amber-400' :
            'text-gray-500'
          }`}>
            {bufferLabels[bufferIntegrity]}
          </span>
        </div>

        {/* Recovery blocks */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Recovery blocks</span>
          <span className="text-sm text-gray-300">
            {recoveryBlocksPresent ? 'Present' : 'Not scheduled'}
          </span>
        </div>
      </div>
    </div>
  );
}
