// frontend

'use client';

import { AwarenessLevel, AwarenessState, getAwarenessLevelDescription } from '@/lib/ain/awareness-levels';

interface AwarenessIndicatorProps {
  awarenessState: AwarenessState;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  showDescription?: boolean;
}

/**
 * Vertical Awareness Indicator
 *
 * Displays the five levels of MAIA's awareness as a vertical stack with glow effects.
 * Complements the horizontal SourceHalo to create the full 5×5 mandala visualization.
 */
export function AwarenessIndicator({
  awarenessState,
  size = 'md',
  showLabels = false,
  showDescription = false
}: AwarenessIndicatorProps) {
  const sizeClasses = {
    sm: {
      container: 'w-8 h-32',
      dot: 'w-4 h-4',
      spacing: 'space-y-1',
      text: 'text-xs'
    },
    md: {
      container: 'w-12 h-48',
      dot: 'w-6 h-6',
      spacing: 'space-y-2',
      text: 'text-sm'
    },
    lg: {
      container: 'w-16 h-64',
      dot: 'w-8 h-8',
      spacing: 'space-y-3',
      text: 'text-base'
    }
  };

  const classes = sizeClasses[size];

  const getAwarenessColors = (level: AwarenessLevel, current: AwarenessLevel, confidence: number) => {
    const isActive = level <= current;
    const intensity = isActive ? Math.min(0.5 + confidence * 0.5, 1) : 0.1;

    const colors = {
      [AwarenessLevel.UNCONSCIOUS]: {
        bg: isActive ? 'bg-gray-600' : 'bg-gray-300',
        glow: isActive ? 'shadow-gray-500/50' : 'shadow-gray-300/20',
        text: 'text-gray-600'
      },
      [AwarenessLevel.PARTIAL]: {
        bg: isActive ? 'bg-amber-500' : 'bg-amber-200',
        glow: isActive ? 'shadow-amber-500/50' : 'shadow-amber-200/20',
        text: 'text-amber-600'
      },
      [AwarenessLevel.RELATIONAL]: {
        bg: isActive ? 'bg-emerald-500' : 'bg-emerald-200',
        glow: isActive ? 'shadow-emerald-500/50' : 'shadow-emerald-200/20',
        text: 'text-emerald-600'
      },
      [AwarenessLevel.INTEGRATED]: {
        bg: isActive ? 'bg-blue-500' : 'bg-blue-200',
        glow: isActive ? 'shadow-blue-500/50' : 'shadow-blue-200/20',
        text: 'text-blue-600'
      },
      [AwarenessLevel.MASTER]: {
        bg: isActive ? 'bg-purple-500' : 'bg-purple-200',
        glow: isActive ? 'shadow-purple-500/50' : 'shadow-purple-200/20',
        text: 'text-purple-600'
      }
    };

    return colors[level];
  };

  const getLevelIcon = (level: AwarenessLevel) => {
    const icons = {
      [AwarenessLevel.UNCONSCIOUS]: '🌑',
      [AwarenessLevel.PARTIAL]: '🌒',
      [AwarenessLevel.RELATIONAL]: '🌓',
      [AwarenessLevel.INTEGRATED]: '🌔',
      [AwarenessLevel.MASTER]: '🌕'
    };
    return icons[level];
  };

  const getLevelName = (level: AwarenessLevel) => {
    const names = {
      [AwarenessLevel.UNCONSCIOUS]: 'Unconscious',
      [AwarenessLevel.PARTIAL]: 'Partial',
      [AwarenessLevel.RELATIONAL]: 'Relational',
      [AwarenessLevel.INTEGRATED]: 'Integrated',
      [AwarenessLevel.MASTER]: 'Master'
    };
    return names[level];
  };

  return (
    <div className="flex flex-col items-center">
      {/* Vertical awareness stack */}
      <div className={`${classes.container} flex flex-col justify-between items-center py-2`}>
        {[5, 4, 3, 2, 1].map((levelNum) => {
          const level = levelNum as AwarenessLevel;
          const colors = getAwarenessColors(level, awarenessState.level, awarenessState.confidence);
          const isCurrentLevel = level === awarenessState.level;

          return (
            <div
              key={level}
              className={`
                ${classes.dot} rounded-full flex items-center justify-center transition-all duration-300
                ${colors.bg}
                ${isCurrentLevel ? `shadow-lg ${colors.glow} scale-110` : 'shadow-sm'}
                ${isCurrentLevel ? 'animate-pulse' : ''}
              `}
              title={`Level ${level}: ${getLevelName(level)}`}
            >
              <span className="text-white text-xs font-bold">
                {getLevelIcon(level)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Labels and description */}
      {showLabels && (
        <div className={`mt-2 text-center ${classes.text}`}>
          <div className="font-medium text-soul-textPrimary">
            Level {awarenessState.level}
          </div>
          <div className="text-soul-textSecondary text-xs">
            {getLevelName(awarenessState.level)}
          </div>
          {awarenessState.confidence > 0 && (
            <div className="text-soul-textSecondary text-xs">
              {(awarenessState.confidence * 100).toFixed(0)}% confidence
            </div>
          )}
        </div>
      )}

      {/* Full description */}
      {showDescription && (
        <div className="mt-3 max-w-xs text-center">
          <div className="text-sm text-soul-textPrimary font-medium mb-1">
            {getAwarenessLevelDescription(awarenessState.level)}
          </div>

          {/* Depth markers indicators */}
          {Object.entries(awarenessState.depth_markers).some(([_, value]) => value > 0.3) && (
            <div className="text-xs text-soul-textSecondary mt-2">
              <div className="font-medium mb-1">Depth Markers:</div>
              <div className="flex flex-wrap gap-1 justify-center">
                {Object.entries(awarenessState.depth_markers)
                  .filter(([_, value]) => value > 0.3)
                  .map(([marker, value]) => (
                    <span
                      key={marker}
                      className="px-2 py-1 bg-soul-surface/20 rounded text-xs"
                      title={`${marker.replace('_', ' ')}: ${(value * 100).toFixed(0)}%`}
                    >
                      {marker.replace('_', ' ')}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Indicators */}
          {awarenessState.indicators.length > 0 && (
            <div className="text-xs text-soul-textSecondary mt-2">
              <div className="font-medium mb-1">Indicators:</div>
              <div className="text-xs">
                {awarenessState.indicators.join(', ')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact horizontal awareness bar for inline display
 */
export function AwarenessBar({ awarenessState, showLabel = true }: {
  awarenessState: AwarenessState;
  showLabel?: boolean;
}) {
  const getBarColor = (level: AwarenessLevel) => {
    const colors = {
      [AwarenessLevel.UNCONSCIOUS]: 'bg-gray-400',
      [AwarenessLevel.PARTIAL]: 'bg-amber-400',
      [AwarenessLevel.RELATIONAL]: 'bg-emerald-400',
      [AwarenessLevel.INTEGRATED]: 'bg-blue-400',
      [AwarenessLevel.MASTER]: 'bg-purple-400'
    };
    return colors[level];
  };

  const fillPercentage = (awarenessState.level / 5) * 100;

  return (
    <div className="flex items-center space-x-2">
      {showLabel && (
        <span className="text-xs text-soul-textSecondary whitespace-nowrap">
          Awareness L{awarenessState.level}
        </span>
      )}
      <div className="flex-1 h-2 bg-soul-surface/20 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getBarColor(awarenessState.level)}`}
          style={{ width: `${fillPercentage}%` }}
        />
      </div>
      <span className="text-xs text-soul-textSecondary">
        {(awarenessState.confidence * 100).toFixed(0)}%
      </span>
    </div>
  );
}