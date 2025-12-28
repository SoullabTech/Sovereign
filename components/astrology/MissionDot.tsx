/**
 * Mission Dot - Pulsing indicator on Consciousness Field Map
 *
 * Shows creative manifestations throughout the evolutionary process.
 * Appears in the relevant house with color-coded status:
 *
 * 🔵 Blue = Emerging (vision not yet crystallized)
 * 🟢 Green = Active (mission in progress)
 * 🟡 Gold = Completed (manifested/achieved)
 * 🔴 Red = Urgent (Saturn transit or time-sensitive)
 */

'use client';

import { motion } from 'framer-motion';
import { Mission } from '@/lib/story/types';

interface MissionDotProps {
  mission: Mission;
  x: number; // Position in SVG coordinate space
  y: number;
  size?: number; // Dot size
  onClick?: () => void;
}

const missionColors = {
  emerging: {
    core: '#60A5FA', // blue-400
    glow: '#3B82F6', // blue-500
    ring: '#93C5FD', // blue-300
  },
  active: {
    core: '#34D399', // green-400
    glow: '#10B981', // green-500
    ring: '#6EE7B7', // green-300
  },
  completed: {
    core: '#FBBF24', // amber-400
    glow: '#F59E0B', // amber-500
    ring: '#FCD34D', // amber-300
  },
  urgent: {
    core: '#F87171', // red-400
    glow: '#EF4444', // red-500
    ring: '#FCA5A5', // red-300
  },
};

export function MissionDot({ mission, x, y, size = 8, onClick }: MissionDotProps) {
  const colors = missionColors[mission.status];

  return (
    <g
      onClick={onClick}
      className="cursor-pointer"
      style={{ pointerEvents: 'all' }}
    >
      {/* Outer pulsing ring - more subtle to match planet nodes */}
      <motion.circle
        cx={x}
        cy={y}
        r={size * 3}
        fill={colors.ring}
        opacity={0.15}
        animate={{
          r: [size * 2.5, size * 3.5, size * 2.5],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: mission.status === 'urgent' ? 1.5 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Middle glow */}
      <motion.circle
        cx={x}
        cy={y}
        r={size * 2}
        fill={colors.glow}
        opacity={0.4}
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: mission.status === 'urgent' ? 1 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Core dot */}
      <motion.circle
        cx={x}
        cy={y}
        r={size}
        fill={colors.core}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: mission.status === 'urgent' ? 0.8 : 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Progress ring for active missions */}
      {mission.status === 'active' && mission.progress > 0 && (
        <motion.circle
          cx={x}
          cy={y}
          r={size * 2}
          fill="none"
          stroke={colors.core}
          strokeWidth="2"
          strokeDasharray={`${(mission.progress / 100) * (2 * Math.PI * size * 2)} ${2 * Math.PI * size * 2}`}
          strokeDashoffset={-Math.PI * size * 2 / 2} // Start at top
          opacity={0.8}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: mission.progress / 100 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      )}

      {/* Completion sparkle for completed missions */}
      {mission.status === 'completed' && (
        <>
          <motion.line
            x1={x - size * 1.5}
            y1={y}
            x2={x + size * 1.5}
            y2={y}
            stroke={colors.core}
            strokeWidth="1.5"
            opacity={0.8}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.line
            x1={x}
            y1={y - size * 1.5}
            x2={x}
            y2={y + size * 1.5}
            stroke={colors.core}
            strokeWidth="1.5"
            opacity={0.8}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.3,
            }}
          />
        </>
      )}
    </g>
  );
}

/**
 * Mission Dot Popup - Shows mission details on hover/click
 * Intelligently positions in the opposite quadrant from the mission's house
 */
interface MissionPopupProps {
  mission: Mission;
  onClose?: () => void;
}

// Map houses to elements/quadrants and their opposites
const getOppositeQuadrantPosition = (house: number) => {
  // FIRE houses (1, 5, 9) - Right/Top-Right → Position in EARTH (Left/Bottom-Left)
  if ([1, 5, 9].includes(house)) {
    return { horizontal: '25%', vertical: '65%' }; // Bottom-left
  }
  // WATER houses (4, 8, 12) - Bottom-Right → Position in AIR (Top-Left)
  if ([4, 8, 12].includes(house)) {
    return { horizontal: '25%', vertical: '25%' }; // Top-left
  }
  // EARTH houses (2, 6, 10) - Bottom-Left → Position in FIRE (Top-Right)
  if ([2, 6, 10].includes(house)) {
    return { horizontal: '75%', vertical: '25%' }; // Top-right
  }
  // AIR houses (3, 7, 11) - Left/Top-Left → Position in WATER (Bottom-Right)
  if ([3, 7, 11].includes(house)) {
    return { horizontal: '75%', vertical: '65%' }; // Bottom-right
  }
  // Default center
  return { horizontal: '50%', vertical: '50%' };
};

export function MissionPopup({ mission, onClose }: MissionPopupProps) {
  const statusLabels = {
    emerging: 'Emerging Vision',
    active: 'In Progress',
    completed: 'Manifested',
    urgent: 'Urgent Calling',
  };

  const statusColors = {
    emerging: 'bg-blue-500/20 border-blue-500/40 text-blue-200',
    active: 'bg-green-500/20 border-green-500/40 text-green-200',
    completed: 'bg-amber-500/20 border-amber-500/40 text-amber-200',
    urgent: 'bg-red-500/20 border-red-500/40 text-red-200',
  };

  const position = getOppositeQuadrantPosition(mission.house);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={onClose}
      className="absolute max-w-md z-50 cursor-pointer"
      style={{
        left: position.horizontal,
        top: position.vertical,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto'
      }}
    >
      <div
        className="bg-black/90 backdrop-blur-xl rounded-2xl border border-stone-700/60 shadow-2xl overflow-hidden"
        style={{ pointerEvents: 'all' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-700/40">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-xl font-serif" style={{ color: '#F5F5F4' }}>{mission.title}</h3>
            <span className={`px-3 py-1 rounded-full border text-xs ${statusColors[mission.status]}`}>
              {statusLabels[mission.status]}
            </span>
          </div>
          <p className="text-sm" style={{ color: '#A8A29E' }}>{mission.description}</p>
        </div>

        {/* Progress (if active) */}
        {mission.status === 'active' && (
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between text-sm text-stone-400 mb-2">
              <span>Progress</span>
              <span>{mission.progress}%</span>
            </div>
            <div className="h-2 bg-stone-800/60 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${mission.progress}%` }}
                className="h-full bg-green-500"
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Chart Context */}
        <div className="p-6">
          <div className="text-xs text-stone-500 mb-2">Placed in {mission.house}th House</div>
          {mission.transitContext && (
            <div className="text-sm text-purple-300">
              Transit: {mission.transitContext.transitDescription}
            </div>
          )}
        </div>

        {/* Milestones */}
        {mission.milestones.length > 0 && (
          <div className="px-6 pb-6">
            <div className="text-sm text-stone-400 mb-2">Milestones:</div>
            <div className="space-y-1">
              {mission.milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    milestone.completed ? 'bg-green-500' : 'bg-stone-600'
                  }`} />
                  <span className={milestone.completed ? 'text-stone-300' : 'text-stone-500'}>
                    {milestone.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
