'use client';

import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { MiniSparkline } from './MiniSparkline';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'stable';
  trendLabel?: string;
  sparkline?: number[];
  color?: 'amber' | 'emerald' | 'red' | 'blue' | 'purple';
  icon?: React.ReactNode;
}

const colorClasses = {
  amber: 'border-l-amber-500',
  emerald: 'border-l-emerald-500',
  red: 'border-l-red-500',
  blue: 'border-l-blue-500',
  purple: 'border-l-purple-500',
};

const trendColors = {
  up: 'text-emerald-500',
  down: 'text-red-500',
  stable: 'text-gray-500',
};

const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'stable' }) => {
  if (!trend) return null;

  const iconProps = { size: 16, className: trendColors[trend] };

  if (trend === 'up') return <ArrowUp {...iconProps} />;
  if (trend === 'down') return <ArrowDown {...iconProps} />;
  return <Minus {...iconProps} />;
};

export function StatCard({
  label,
  value,
  subValue,
  trend,
  trendLabel,
  sparkline,
  color = 'amber',
  icon,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        bg-zinc-900 rounded-xl p-6 border border-zinc-800 border-l-4
        ${colorClasses[color]}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="text-gray-400 text-sm font-medium mb-2">{label}</div>
          <div className="text-gray-100 text-3xl font-bold">{value}</div>
          {subValue && (
            <div className="text-gray-500 text-sm mt-1">{subValue}</div>
          )}
        </div>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>

      {(trend || trendLabel) && (
        <div className="flex items-center gap-2 mb-3">
          <TrendIcon trend={trend} />
          {trendLabel && (
            <span className={`text-sm ${trend ? trendColors[trend] : 'text-gray-400'}`}>
              {trendLabel}
            </span>
          )}
        </div>
      )}

      {sparkline && sparkline.length > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <MiniSparkline
            data={sparkline}
            color={color === 'amber' ? '#f59e0b' : undefined}
            fill
          />
        </div>
      )}
    </motion.div>
  );
}
