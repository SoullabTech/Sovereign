'use client';

/**
 * Traditional House Wheel - Standard Astrological Format
 *
 * Classic natal chart layout:
 * - Ascendant (House 1) at 9 o'clock (left horizon)
 * - Houses numbered 1-12 counterclockwise
 * - MC (House 10) at 12 o'clock (zenith)
 * - Descendant (House 7) at 3 o'clock (right horizon)
 * - IC (House 4) at 6 o'clock (nadir)
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Planet {
  name: string;
  sign: string;
  house: number;
  degree: number;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  orb: number;
}

interface TraditionalHouseWheelProps {
  planets?: Planet[];
  aspects?: Aspect[];
  ascendantSign?: string;
  isDayMode?: boolean;
  size?: number;
  showAspects?: boolean;
  className?: string;
}

// Planet glyphs
const planetGlyphs: Record<string, string> = {
  'Sun': '☉',
  'Moon': '☽',
  'Mercury': '☿',
  'Venus': '♀',
  'Mars': '♂',
  'Jupiter': '♃',
  'Saturn': '♄',
  'Uranus': '♅',
  'Neptune': '♆',
  'Pluto': '♇',
  'Chiron': '⚷',
  'North Node': '☊',
  'South Node': '☋',
};

// Zodiac signs with glyphs
const zodiacSigns = [
  { name: 'Aries', glyph: '♈', element: 'fire' },
  { name: 'Taurus', glyph: '♉', element: 'earth' },
  { name: 'Gemini', glyph: '♊', element: 'air' },
  { name: 'Cancer', glyph: '♋', element: 'water' },
  { name: 'Leo', glyph: '♌', element: 'fire' },
  { name: 'Virgo', glyph: '♍', element: 'earth' },
  { name: 'Libra', glyph: '♎', element: 'air' },
  { name: 'Scorpio', glyph: '♏', element: 'water' },
  { name: 'Sagittarius', glyph: '♐', element: 'fire' },
  { name: 'Capricorn', glyph: '♑', element: 'earth' },
  { name: 'Aquarius', glyph: '♒', element: 'air' },
  { name: 'Pisces', glyph: '♓', element: 'water' },
];

// Element colors
const elementColors: Record<string, string> = {
  fire: '#ef4444',
  earth: '#22c55e',
  air: '#eab308',
  water: '#3b82f6',
};

// Aspect colors and styles
const aspectStyles: Record<string, { color: string; dash?: string }> = {
  conjunction: { color: '#a855f7' },
  sextile: { color: '#3b82f6', dash: '4,4' },
  square: { color: '#ef4444' },
  trine: { color: '#22c55e' },
  opposition: { color: '#f97316', dash: '8,4' },
};

// House meanings for tooltip
const houseMeanings: Record<number, string> = {
  1: 'Self & Identity',
  2: 'Values & Resources',
  3: 'Communication & Learning',
  4: 'Home & Roots',
  5: 'Creativity & Joy',
  6: 'Health & Service',
  7: 'Partnerships',
  8: 'Transformation',
  9: 'Philosophy & Travel',
  10: 'Career & Legacy',
  11: 'Community & Vision',
  12: 'Spirituality & Dreams',
};

export function TraditionalHouseWheel({
  planets = [],
  aspects = [],
  ascendantSign = 'Aries',
  isDayMode = false,
  size = 400,
  showAspects = true,
  className = '',
}: TraditionalHouseWheelProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.45;
  const zodiacRadius = size * 0.38;
  const houseRadius = size * 0.30;
  const planetRadius = size * 0.22;
  const innerRadius = size * 0.12;

  // Get ascendant sign index for rotation
  const ascendantIndex = zodiacSigns.findIndex(s => s.name === ascendantSign);

  // Calculate angle for a house (counterclockwise from 9 o'clock)
  // House 1 starts at 180° (9 o'clock), each house is 30° counterclockwise
  const getHouseAngle = (house: number) => {
    // Start at 180° for house 1, go counterclockwise
    return 180 - (house - 1) * 30;
  };

  // Calculate angle for zodiac sign
  const getZodiacAngle = (signIndex: number) => {
    // Rotate based on ascendant
    const adjustedIndex = (signIndex - ascendantIndex + 12) % 12;
    return 180 - adjustedIndex * 30;
  };

  // Convert angle to x,y coordinates
  const polarToCartesian = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy - radius * Math.sin(rad),
    };
  };

  // Draw arc path
  const describeArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(startAngle, radius);
    const end = polarToCartesian(endAngle, radius);
    const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
    const sweepFlag = endAngle > startAngle ? 0 : 1;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
  };

  // Get planet position in the wheel
  const getPlanetPosition = (planet: Planet) => {
    // Place planet based on house, offset within house based on degree
    const houseAngle = getHouseAngle(planet.house);
    const degreeOffset = (planet.degree / 30) * 30; // Offset within 30° house segment
    const angle = houseAngle - degreeOffset / 2;
    return polarToCartesian(angle, planetRadius);
  };

  // Colors based on mode
  const colors = isDayMode
    ? {
        bg: '#f5f0e8',
        ring: '#d4b896',
        text: '#3d2e1f',
        line: '#d4b896',
        house: '#e8e0d4',
      }
    : {
        bg: '#0a0d12',
        ring: '#d4b896',
        text: '#e5d4c0',
        line: '#d4b89640',
        house: '#1a1f2e',
      };

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background */}
        <circle cx={cx} cy={cy} r={outerRadius} fill={colors.bg} />

        {/* Outer zodiac ring */}
        <circle
          cx={cx}
          cy={cy}
          r={outerRadius}
          fill="none"
          stroke={colors.ring}
          strokeWidth="1"
          opacity={0.6}
        />

        {/* House dividing lines and numbers */}
        {Array.from({ length: 12 }, (_, i) => {
          const house = i + 1;
          const angle = getHouseAngle(house);
          const inner = polarToCartesian(angle, innerRadius);
          const outer = polarToCartesian(angle, outerRadius);
          const midAngle = angle - 15; // Center of house
          const labelPos = polarToCartesian(midAngle, houseRadius);

          return (
            <g key={house}>
              {/* House line */}
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={colors.line}
                strokeWidth={house === 1 || house === 4 || house === 7 || house === 10 ? 2 : 1}
              />
              {/* House number */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={colors.text}
                fontSize={size * 0.028}
                opacity={0.5}
              >
                {house}
              </text>
            </g>
          );
        })}

        {/* Zodiac signs on outer ring */}
        {zodiacSigns.map((sign, i) => {
          const angle = getZodiacAngle(i);
          const midAngle = angle - 15;
          const pos = polarToCartesian(midAngle, zodiacRadius);

          return (
            <text
              key={sign.name}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={elementColors[sign.element]}
              fontSize={size * 0.045}
              style={{ fontFamily: 'serif' }}
            >
              {sign.glyph}
            </text>
          );
        })}

        {/* Inner circle */}
        <circle
          cx={cx}
          cy={cy}
          r={innerRadius}
          fill={isDayMode ? '#fff' : '#111'}
          stroke={colors.ring}
          strokeWidth="1"
          opacity={0.8}
        />

        {/* Aspect lines */}
        {showAspects && aspects.map((aspect, i) => {
          const planet1 = planets.find(p => p.name === aspect.planet1);
          const planet2 = planets.find(p => p.name === aspect.planet2);
          if (!planet1 || !planet2) return null;

          const pos1 = getPlanetPosition(planet1);
          const pos2 = getPlanetPosition(planet2);
          const style = aspectStyles[aspect.type] || { color: '#888' };

          return (
            <line
              key={i}
              x1={pos1.x}
              y1={pos1.y}
              x2={pos2.x}
              y2={pos2.y}
              stroke={style.color}
              strokeWidth={1.5}
              strokeDasharray={style.dash}
              opacity={0.4}
            />
          );
        })}

        {/* Planets */}
        {planets.map((planet) => {
          const pos = getPlanetPosition(planet);
          const glyph = planetGlyphs[planet.name] || '●';
          const isSelected = selectedPlanet?.name === planet.name;

          return (
            <g
              key={planet.name}
              onClick={() => setSelectedPlanet(isSelected ? null : planet)}
              style={{ cursor: 'pointer' }}
            >
              {/* Planet background circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={size * 0.035}
                fill={isSelected ? colors.ring : (isDayMode ? '#fff' : '#1a1f2e')}
                stroke={colors.ring}
                strokeWidth={isSelected ? 2 : 1}
              />
              {/* Planet glyph */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isSelected ? (isDayMode ? '#1a1f2e' : '#0a0d12') : colors.text}
                fontSize={size * 0.04}
                style={{ fontFamily: 'serif' }}
              >
                {glyph}
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text
          x={cx - outerRadius - 10}
          y={cy}
          textAnchor="end"
          dominantBaseline="middle"
          fill={colors.ring}
          fontSize={size * 0.025}
          opacity={0.7}
        >
          ASC
        </text>
        <text
          x={cx + outerRadius + 10}
          y={cy}
          textAnchor="start"
          dominantBaseline="middle"
          fill={colors.ring}
          fontSize={size * 0.025}
          opacity={0.7}
        >
          DSC
        </text>
        <text
          x={cx}
          y={cy - outerRadius - 10}
          textAnchor="middle"
          fill={colors.ring}
          fontSize={size * 0.025}
          opacity={0.7}
        >
          MC
        </text>
        <text
          x={cx}
          y={cy + outerRadius + 15}
          textAnchor="middle"
          fill={colors.ring}
          fontSize={size * 0.025}
          opacity={0.7}
        >
          IC
        </text>
      </svg>

      {/* Planet info popup */}
      <AnimatePresence>
        {selectedPlanet && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 right-4 p-4 rounded-lg border"
            style={{
              backgroundColor: isDayMode ? 'rgba(255,255,255,0.95)' : 'rgba(26,31,46,0.95)',
              borderColor: colors.ring,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium" style={{ color: colors.ring }}>
                  {planetGlyphs[selectedPlanet.name]} {selectedPlanet.name}
                </h4>
                <p className="text-sm mt-1" style={{ color: colors.text }}>
                  {selectedPlanet.sign} {selectedPlanet.degree.toFixed(1)}° · House {selectedPlanet.house}
                </p>
                <p className="text-xs mt-1 opacity-60" style={{ color: colors.text }}>
                  {houseMeanings[selectedPlanet.house]}
                </p>
              </div>
              <button
                onClick={() => setSelectedPlanet(null)}
                className="text-sm opacity-60 hover:opacity-100"
                style={{ color: colors.text }}
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
