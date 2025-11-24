'use client';

/**
 * Traditional Astrological Chart Wheel
 *
 * A proper astrological chart wheel showing:
 * - 12 houses with customizable house systems
 * - Planet positions and symbols
 * - Zodiac signs around the outer ring
 * - Aspect lines between planets
 * - Traditional astronomical symbols
 */

import { motion } from 'framer-motion';
import { HouseSystemCalculation } from '@/lib/astrology/houseSystems';

interface Planet {
  name: string;
  longitude: number;
  house: number;
  sign: string;
  degree: number;
  retrograde?: boolean;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx';
  orb: number;
}

interface TraditionalChartWheelProps {
  houseSystem: HouseSystemCalculation;
  planets: Planet[];
  aspects?: Aspect[];
  size?: number;
  showAspects?: boolean;
  showHouseNumbers?: boolean;
  showDegrees?: boolean;
}

// Zodiac signs (clockwise from Aries at 0°)
const zodiacSigns = [
  { name: 'Aries', symbol: '♈', element: 'fire' },
  { name: 'Taurus', symbol: '♉', element: 'earth' },
  { name: 'Gemini', symbol: '♊', element: 'air' },
  { name: 'Cancer', symbol: '♋', element: 'water' },
  { name: 'Leo', symbol: '♌', element: 'fire' },
  { name: 'Virgo', symbol: '♍', element: 'earth' },
  { name: 'Libra', symbol: '♎', element: 'air' },
  { name: 'Scorpio', symbol: '♏', element: 'water' },
  { name: 'Sagittarius', symbol: '♐', element: 'fire' },
  { name: 'Capricorn', symbol: '♑', element: 'earth' },
  { name: 'Aquarius', symbol: '♒', element: 'air' },
  { name: 'Pisces', symbol: '♓', element: 'water' }
];

// Planet symbols
const planetSymbols: { [key: string]: string } = {
  'sun': '☉',
  'moon': '☽',
  'mercury': '☿',
  'venus': '♀',
  'mars': '♂',
  'jupiter': '♃',
  'saturn': '♄',
  'uranus': '♅',
  'neptune': '♆',
  'pluto': '♇',
  'chiron': '⚷',
  'north node': '☊',
  'south node': '☋'
};

// Element colors
const elementColors = {
  fire: '#ff6b35',
  earth: '#8b7355',
  air: '#4a90a4',
  water: '#5d737e'
};

// Aspect colors
const aspectColors = {
  conjunction: '#ff4444',
  opposition: '#ff8844',
  trine: '#44ff44',
  square: '#ff4488',
  sextile: '#4488ff',
  quincunx: '#aa88ff'
};

export function TraditionalChartWheel({
  houseSystem,
  planets,
  aspects = [],
  size = 400,
  showAspects = true,
  showHouseNumbers = true,
  showDegrees = false
}: TraditionalChartWheelProps) {

  const center = size / 2;
  const outerRadius = size / 2 - 20;
  const zodiacRadius = outerRadius - 30;
  const houseRadius = zodiacRadius - 40;
  const planetRadius = houseRadius - 30;
  const innerRadius = planetRadius - 50;

  // Convert longitude to SVG angle for traditional astrology layout
  // Clock-face mapping:
  // - 12 o'clock = 0° SVG (top)
  // - 3 o'clock = 90° SVG (right)
  // - 6 o'clock = 180° SVG (bottom)
  // - 9 o'clock = 270° SVG (left) ← Ascendant should be here
  const lonToSvgAngle = (longitude: number): number => {
    // Ascendant (0° astrology) should be at 9 o'clock (270° SVG)
    // Houses go counterclockwise, so we subtract longitude from 270°
    return (270 - longitude) * (Math.PI / 180);
  };

  // Get position on circle
  const getCirclePosition = (longitude: number, radius: number): { x: number; y: number } => {
    const angle = lonToSvgAngle(longitude);
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  };

  // Calculate planet positions with collision detection and multi-ring placement
  const calculatePlanetPositions = (planets: Planet[]) => {
    const positions: Array<{
      planet: Planet;
      position: { x: number; y: number };
      ring: number;
      adjustedLongitude: number;
    }> = [];

    const minAngularSeparation = 12; // Minimum degrees between planets
    const ringRadii = [planetRadius, planetRadius + 25, planetRadius + 50]; // Multiple rings

    // Sort planets by longitude for easier processing
    const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude);

    sortedPlanets.forEach((planet) => {
      let placed = false;

      // Try placing on each ring, starting with the innermost
      for (let ringIndex = 0; ringIndex < ringRadii.length && !placed; ringIndex++) {
        const currentRadius = ringRadii[ringIndex];
        let adjustedLongitude = planet.longitude;

        // Check for collisions with planets already placed on this ring
        const planetsOnThisRing = positions.filter(p => p.ring === ringIndex);
        let hasCollision = false;

        for (const placedPlanet of planetsOnThisRing) {
          const angleDiff = Math.abs(adjustedLongitude - placedPlanet.adjustedLongitude);
          const normalizedDiff = Math.min(angleDiff, 360 - angleDiff);

          if (normalizedDiff < minAngularSeparation) {
            hasCollision = true;
            break;
          }
        }

        // If no collision, place the planet on this ring
        if (!hasCollision) {
          const position = getCirclePosition(adjustedLongitude, currentRadius);
          positions.push({
            planet,
            position,
            ring: ringIndex,
            adjustedLongitude
          });
          placed = true;
        }
      }

      // If we couldn't place it on any ring due to collisions, force placement on outermost ring
      if (!placed) {
        const position = getCirclePosition(planet.longitude, ringRadii[ringRadii.length - 1]);
        positions.push({
          planet,
          position,
          ring: ringRadii.length - 1,
          adjustedLongitude: planet.longitude
        });
      }
    });

    return positions;
  };

  // Calculate optimized planet positions
  const planetPositions = calculatePlanetPositions(planets);

  return (
    <motion.div
      className="relative flex items-center justify-center w-full"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <svg width={size} height={size} className="drop-shadow-2xl">
        {/* Gradient Definitions */}
        <defs>
          {/* Radial gradient for the chart background */}
          <radialGradient id="chartBackground" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139, 69, 19, 0.1)" />
            <stop offset="50%" stopColor="rgba(30, 64, 175, 0.15)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0.9)" />
          </radialGradient>

          {/* Zodiac ring gradient */}
          <radialGradient id="zodiacGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(217, 119, 6, 0.3)" />
            <stop offset="100%" stopColor="rgba(217, 119, 6, 0.1)" />
          </radialGradient>

          {/* House ring gradient */}
          <radialGradient id="houseGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.2)" />
            <stop offset="100%" stopColor="rgba(34, 197, 94, 0.05)" />
          </radialGradient>

          {/* Glowing effect filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Planet glow filter */}
          <filter id="planetGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Subtle pulse animation */}
          <filter id="subtlePulse" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Chart background with cosmic gradient */}
        <motion.circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="url(#chartBackground)"
          stroke="rgba(217, 119, 6, 0.4)"
          strokeWidth="1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Outer circle with glowing effect */}
        <motion.circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="none"
          stroke="#d97706"
          strokeWidth="3"
          filter="url(#glow)"
          opacity="0.8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 2, delay: 0.5 }}
        />

        {/* Zodiac ring with gradient */}
        <motion.circle
          cx={center}
          cy={center}
          r={zodiacRadius}
          fill="url(#zodiacGlow)"
          stroke="#d97706"
          strokeWidth="2"
          strokeOpacity="0.6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />

        {/* Zodiac signs */}
        {zodiacSigns.map((sign, index) => {
          const longitude = index * 30 + 15; // Center of each sign
          const position = getCirclePosition(longitude, zodiacRadius + 15);

          return (
            <motion.g
              key={sign.name}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.05 }}
            >
              {/* Sign divider with glow */}
              <motion.line
                x1={getCirclePosition(index * 30, zodiacRadius - 10).x}
                y1={getCirclePosition(index * 30, zodiacRadius - 10).y}
                x2={getCirclePosition(index * 30, outerRadius).x}
                y2={getCirclePosition(index * 30, outerRadius).y}
                stroke={elementColors[sign.element]}
                strokeWidth="1"
                strokeOpacity="0.4"
                filter="url(#subtlePulse)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 1 + index * 0.03 }}
              />

              {/* Sign symbol with enhanced styling */}
              <motion.text
                x={position.x}
                y={position.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-lg font-bold cursor-pointer"
                fill={elementColors[sign.element]}
                filter="url(#subtlePulse)"
                whileHover={{ scale: 1.2 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2 + index * 0.04 }}
              >
                {sign.symbol}
              </motion.text>
            </motion.g>
          );
        })}

        {/* House lines - Equal 30° houses starting from Ascendant */}
        {Array.from({ length: 12 }, (_, index) => {
          // Each house is exactly 30°, starting from Ascendant
          // Rotate 2 houses clockwise (60°) to align ASC-DESC horizontally
          const houseStartAngle = houseSystem.angles.ascendant + (index * 30) - 60;
          const normalizedAngle = houseStartAngle < 0 ? houseStartAngle + 360 : (houseStartAngle >= 360 ? houseStartAngle - 360 : houseStartAngle);

          const innerPos = getCirclePosition(normalizedAngle, innerRadius);
          const outerPos = getCirclePosition(normalizedAngle, zodiacRadius);
          const isAngular = [0, 3, 6, 9].includes(index);

          // House mid-point is always 15° from the start of each house
          const midPoint = (normalizedAngle + 15) >= 360 ? (normalizedAngle + 15) - 360 : normalizedAngle + 15;

          return (
            <motion.g
              key={`house-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.5 + index * 0.02 }}
            >
              <motion.line
                x1={innerPos.x}
                y1={innerPos.y}
                x2={outerPos.x}
                y2={outerPos.y}
                stroke={isAngular ? "#22c55e" : "#9ca3af"}
                strokeWidth={isAngular ? "2" : "1"}
                strokeDasharray={isAngular ? "none" : "3,3"}
                strokeOpacity={isAngular ? "0.8" : "0.5"}
                filter={isAngular ? "url(#subtlePulse)" : "none"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 1.8 + index * 0.03 }}
              />

              {/* House numbers - Traditional counterclockwise from Ascendant */}
              {showHouseNumbers && (
                <motion.text
                  x={getCirclePosition(midPoint, houseRadius).x}
                  y={getCirclePosition(midPoint, houseRadius).y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-sm font-bold"
                  fill={isAngular ? "#22c55e" : "#d1d5db"}
                  filter={isAngular ? "url(#subtlePulse)" : "none"}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 2.2 + index * 0.02 }}
                  whileHover={{ scale: 1.3 }}
                >
                  {index + 1}
                </motion.text>
              )}
            </motion.g>
          );
        })}

        {/* House ring with gradient */}
        <motion.circle
          cx={center}
          cy={center}
          r={houseRadius}
          fill="url(#houseGlow)"
          stroke="#22c55e"
          strokeWidth="2"
          strokeOpacity="0.4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        />

        {/* Inner circle with cosmic glow */}
        <motion.circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="rgba(30, 64, 175, 0.1)"
          stroke="#3b82f6"
          strokeWidth="3"
          filter="url(#glow)"
          strokeOpacity="0.7"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
        />

        {/* Aspects with enhanced visuals */}
        {showAspects && aspects.map((aspect, index) => {
          const planet1Position = planetPositions.find(p => p.planet.name.toLowerCase() === aspect.planet1.toLowerCase());
          const planet2Position = planetPositions.find(p => p.planet.name.toLowerCase() === aspect.planet2.toLowerCase());

          if (!planet1Position || !planet2Position) return null;

          const pos1 = planet1Position.position;
          const pos2 = planet2Position.position;

          return (
            <motion.line
              key={`aspect-${index}`}
              x1={pos1.x}
              y1={pos1.y}
              x2={pos2.x}
              y2={pos2.y}
              stroke={aspectColors[aspect.type]}
              strokeWidth="2"
              strokeOpacity="0.7"
              strokeDasharray={aspect.type === 'quincunx' ? "4,4" : "none"}
              filter="url(#subtlePulse)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.7 }}
              transition={{ duration: 1.5, delay: 2.5 + index * 0.1 }}
            />
          );
        })}

        {/* Planets */}
        {planetPositions.map((planetData, index) => {
          const { planet, position, ring } = planetData;
          const symbol = planetSymbols[planet.name.toLowerCase()] || planet.name.charAt(0);

          // Enhanced planet colors based on traditional associations
          const getPlanetColor = (planetName: string) => {
            const colors: { [key: string]: string } = {
              'sun': '#fbbf24',
              'moon': '#e5e7eb',
              'mercury': '#22d3ee',
              'venus': '#10b981',
              'mars': '#ef4444',
              'jupiter': '#8b5cf6',
              'saturn': '#6b7280',
              'uranus': '#06b6d4',
              'neptune': '#3b82f6',
              'pluto': '#7c3aed'
            };
            return colors[planetName.toLowerCase()] || '#f59e0b';
          };

          const planetColor = getPlanetColor(planet.name);

          return (
            <motion.g
              key={planet.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.8 + index * 0.1, duration: 0.5, ease: "easeOut" }}
            >
              {/* Connection line for planets on outer rings */}
              {ring > 0 && (
                <motion.line
                  x1={getCirclePosition(planet.longitude, planetRadius).x}
                  y1={getCirclePosition(planet.longitude, planetRadius).y}
                  x2={position.x}
                  y2={position.y}
                  stroke={planetColor}
                  strokeWidth="1"
                  strokeOpacity="0.4"
                  strokeDasharray="2,2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  transition={{ delay: 2.8 + index * 0.1 + 0.3 }}
                />
              )}

              {/* Planet glow background - size varies by ring */}
              <motion.circle
                cx={position.x}
                cy={position.y}
                r={ring === 0 ? "12" : ring === 1 ? "10" : "8"}
                fill={planetColor}
                fillOpacity={ring === 0 ? "0.2" : "0.15"}
                filter="url(#planetGlow)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.8 + index * 0.1, duration: 0.8 }}
              />

              {/* Planet circle */}
              <motion.circle
                cx={position.x}
                cy={position.y}
                r="8"
                fill="rgba(0,0,0,0.8)"
                stroke={planetColor}
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.9 + index * 0.1, duration: 0.4 }}
                className="cursor-pointer"
                whileHover={{
                  scale: 1.3,
                  stroke: "#ffffff",
                  transition: { duration: 0.2 }
                }}
              />

              {/* Planet symbol */}
              <motion.text
                x={position.x}
                y={position.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-sm font-bold pointer-events-none"
                fill={planetColor}
                filter="url(#subtlePulse)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 + index * 0.1, duration: 0.4 }}
              >
                {symbol}
              </motion.text>

              {/* Retrograde indicator with pulse */}
              {planet.retrograde && (
                <motion.text
                  x={position.x + 15}
                  y={position.y - 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-xs font-bold"
                  fill="#ef4444"
                  filter="url(#glow)"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    delay: 3.2 + index * 0.1,
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  ℞
                </motion.text>
              )}

              {/* Degree marker */}
              {showDegrees && (
                <motion.text
                  x={position.x}
                  y={position.y + 25}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-xs font-medium"
                  fill="#9ca3af"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3.4 + index * 0.1, duration: 0.3 }}
                >
                  {Math.round(planet.degree)}°
                </motion.text>
              )}
            </motion.g>
          );
        })}

        {/* Angular house markers (ASC, MC, DESC, IC) */}
        <g>
          {/* Ascendant */}
          <motion.text
            x={getCirclePosition(houseSystem.angles.ascendant, outerRadius + 20).x}
            y={getCirclePosition(houseSystem.angles.ascendant, outerRadius + 20).y}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-lg font-bold cursor-pointer"
            fill="#10b981"
            filter="url(#glow)"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 3.5, duration: 0.6 }}
            whileHover={{ scale: 1.2 }}
          >
            ASC
          </motion.text>

          {/* Midheaven */}
          <motion.text
            x={getCirclePosition(houseSystem.angles.midheaven, outerRadius + 20).x}
            y={getCirclePosition(houseSystem.angles.midheaven, outerRadius + 20).y}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-lg font-bold cursor-pointer"
            fill="#3b82f6"
            filter="url(#glow)"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 3.6, duration: 0.6 }}
            whileHover={{ scale: 1.2 }}
          >
            MC
          </motion.text>

          {/* Descendant */}
          <motion.text
            x={getCirclePosition(houseSystem.angles.descendant, outerRadius + 20).x}
            y={getCirclePosition(houseSystem.angles.descendant, outerRadius + 20).y}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-lg font-bold cursor-pointer"
            fill="#f59e0b"
            filter="url(#glow)"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 3.7, duration: 0.6 }}
            whileHover={{ scale: 1.2 }}
          >
            DESC
          </motion.text>

          {/* Imum Coeli */}
          <motion.text
            x={getCirclePosition(houseSystem.angles.imumCoeli, outerRadius + 20).x}
            y={getCirclePosition(houseSystem.angles.imumCoeli, outerRadius + 20).y}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-lg font-bold cursor-pointer"
            fill="#ef4444"
            filter="url(#glow)"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 3.8, duration: 0.6 }}
            whileHover={{ scale: 1.2 }}
          >
            IC
          </motion.text>
        </g>
      </svg>

      {/* Chart info */}
      <motion.div
        className="absolute bottom-4 left-4 text-sm font-medium text-amber-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4, duration: 0.5 }}
      >
        {houseSystem.system.toUpperCase()} Houses
      </motion.div>
    </motion.div>
  );
}