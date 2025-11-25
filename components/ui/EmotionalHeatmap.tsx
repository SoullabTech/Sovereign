/**
 * EmotionalHeatmap Component - Visualize emotional patterns over time
 * Shows valence, arousal, and dominance as a heatmap grid
 */

"use client"

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface EmotionalDataPoint {
  date: string;
  valence: number; // -1 to 1
  arousal: number; // 0 to 1
  dominance: number; // 0 to 1
  hour?: number;
}

export interface EmotionalHeatmapProps extends React.HTMLAttributes<HTMLDivElement> {
  userId?: string;
  timeframe?: '7d' | '30d' | '90d';
  dimension?: 'valence' | 'arousal' | 'dominance' | 'composite';
  showLabels?: boolean;
  cellSize?: number;
}

export function EmotionalHeatmap({ 
  userId = "demo-user",
  timeframe = '7d',
  dimension = 'valence',
  showLabels = true,
  cellSize = 40,
  className,
  ...props 
}: EmotionalHeatmapProps) {
  const [data, setData] = useState<EmotionalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmotionalData();
  }, [userId, timeframe]);

  const fetchEmotionalData = async () => {
    try {
      const response = await fetch(`/api/analytics/emotional-heatmap?userId=${userId}&timeframe=${timeframe}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data || []);
      } else {
        // Generate demo data
        generateDemoData();
      }
    } catch (error) {
      console.error('Failed to fetch emotional data:', error);
      generateDemoData();
    } finally {
      setLoading(false);
    }
  };

  const generateDemoData = () => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const demoData: EmotionalDataPoint[] = [];
    
    for (let d = 0; d < days; d++) {
      for (let h = 0; h < 24; h += 3) { // Data every 3 hours
        const date = new Date();
        date.setDate(date.getDate() - (days - d - 1));
        date.setHours(h, 0, 0, 0);
        
        demoData.push({
          date: date.toISOString(),
          hour: h,
          valence: Math.sin(d * 0.5 + h * 0.1) * 0.5 + (Math.random() - 0.5) * 0.3,
          arousal: Math.abs(Math.sin(h * 0.2)) * 0.7 + Math.random() * 0.3,
          dominance: 0.5 + Math.sin(d * 0.3) * 0.3
        });
      }
    }
    
    setData(demoData);
  };

  const getColorForValue = (value: number, dim: string) => {
    if (dim === 'valence') {
      // Red to Green gradient
      if (value < 0) {
        const intensity = Math.abs(value);
        return `rgba(239, 68, 68, ${0.2 + intensity * 0.8})`;
      } else {
        return `rgba(34, 197, 94, ${0.2 + value * 0.8})`;
      }
    } else if (dim === 'arousal') {
      // Blue to Yellow gradient
      return `rgba(250, 204, 21, ${0.2 + value * 0.8})`;
    } else if (dim === 'dominance') {
      // Purple gradient
      return `rgba(168, 85, 247, ${0.2 + value * 0.8})`;
    } else {
      // Composite - use HSL
      const hue = 120 + value * 240; // 120 (green) to 360 (red)
      return `hsla(${hue}, 70%, 50%, ${0.3 + Math.abs(value) * 0.7})`;
    }
  };

  const getValue = (point: EmotionalDataPoint) => {
    if (dimension === 'composite') {
      // Weighted composite score
      return (point.valence * 0.5 + point.arousal * 0.25 + point.dominance * 0.25);
    }
    return point[dimension];
  };

  // Group data by day and hour
  const groupedData = data.reduce((acc, point) => {
    const date = new Date(point.date);
    const dayKey = date.toISOString().split('T')[0];
    const hourKey = point.hour || date.getHours();
    
    if (!acc[dayKey]) acc[dayKey] = {};
    acc[dayKey][hourKey] = point;
    
    return acc;
  }, {} as Record<string, Record<number, EmotionalDataPoint>>);

  const days = Object.keys(groupedData).sort();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-gray-400">Loading emotional data...</div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Dimension selector */}
      <div className="flex gap-2">
        {(['valence', 'arousal', 'dominance', 'composite'] as const).map((dim) => (
          <button
            key={dim}
            onClick={() => {}} // Would update dimension in parent component
            className={cn(
              "px-3 py-1 text-sm rounded-lg transition-all",
              dimension === dim 
                ? "bg-white/20 text-white" 
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            )}
          >
            {dim.charAt(0).toUpperCase() + dim.slice(1)}
          </button>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Hour labels */}
          {showLabels && (
            <div className="flex ml-20">
              {hours.map((hour) => (
                <div 
                  key={hour} 
                  className="text-xs text-gray-500 text-center"
                  style={{ width: cellSize }}
                >
                  {hour === 0 ? '12a' : hour === 12 ? '12p' : hour < 12 ? `${hour}a` : `${hour-12}p`}
                </div>
              ))}
            </div>
          )}

          {/* Grid */}
          {days.map((day) => (
            <div key={day} className="flex items-center">
              {/* Day label */}
              {showLabels && (
                <div className="w-20 text-sm text-gray-400 pr-2 text-right">
                  {new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              )}
              
              {/* Hour cells */}
              {hours.map((hour) => {
                const point = groupedData[day]?.[hour];
                const value = point ? getValue(point) : null;
                
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="border border-white/5 transition-all duration-200 hover:border-white/20"
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: value !== null ? getColorForValue(value, dimension) : 'rgba(255,255,255,0.02)'
                    }}
                    title={value !== null ? `${dimension}: ${value.toFixed(2)}` : 'No data'}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-4">
          {dimension === 'valence' && (
            <>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-500 rounded" />
                <span>Negative</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span>Positive</span>
              </div>
            </>
          )}
          {dimension === 'arousal' && (
            <>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span>Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-yellow-500 rounded" />
                <span>High</span>
              </div>
            </>
          )}
          {dimension === 'dominance' && (
            <>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-amber-300 rounded" />
                <span>Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-amber-600 rounded" />
                <span>High</span>
              </div>
            </>
          )}
        </div>
        <span className="text-gray-500">
          {data.length} data points over {timeframe}
        </span>
      </div>
    </div>
  );
}