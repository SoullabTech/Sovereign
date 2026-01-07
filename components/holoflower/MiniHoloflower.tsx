'use client';

/**
 * MiniHoloflower - Compact sacred geometry visualization
 *
 * A smaller, elegant version of the Holoflower for headers
 * and decorative contexts. Uses CSS-based sacred geometry
 * with elemental color accents and gentle animation.
 */

interface MiniHoloflowerProps {
  size?: number;
  isDayMode?: boolean;
  animated?: boolean;
}

export function MiniHoloflower({ size = 96, isDayMode = false, animated = true }: MiniHoloflowerProps) {
  // Elemental colors - balanced representation
  const colors = {
    fire: isDayMode ? '#E07020' : '#FF6B35',
    water: isDayMode ? '#2B6B9E' : '#4A90D9',
    air: isDayMode ? '#E8E4D8' : '#E7E2CF',
    earth: isDayMode ? '#6B8E4E' : '#8FBC5A',
  };

  // Gold accent for sacred center
  const gold = isDayMode ? '#C67A28' : '#D4B896';
  const centerGlow = isDayMode ? 'rgba(198, 122, 40, 0.4)' : 'rgba(212, 184, 150, 0.5)';

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Outer ring - subtle elemental gradient */}
      <div
        className={`absolute inset-0 rounded-full ${animated ? 'animate-spin-slow' : ''}`}
        style={{
          background: `conic-gradient(
            from 0deg,
            ${colors.fire} 0deg,
            ${colors.earth} 90deg,
            ${colors.water} 180deg,
            ${colors.air} 270deg,
            ${colors.fire} 360deg
          )`,
          opacity: 0.6,
        }}
      />

      {/* Middle ring - darker backdrop */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          background: isDayMode
            ? 'linear-gradient(135deg, #E8E4D8 0%, #D4CFC0 100%)'
            : 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
          boxShadow: isDayMode
            ? 'inset 0 2px 8px rgba(0,0,0,0.1)'
            : 'inset 0 2px 12px rgba(0,0,0,0.5)',
        }}
      />

      {/* Inner sacred petals - 6-fold geometry */}
      {[0, 60, 120, 180, 240, 300].map((rotation, i) => (
        <div
          key={rotation}
          className="absolute"
          style={{
            width: size * 0.25,
            height: size * 0.55,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
        >
          <div
            className={`w-full h-1/2 rounded-t-full ${animated ? 'animate-pulse-gentle' : ''}`}
            style={{
              background: `linear-gradient(to top, transparent 0%, ${gold}40 50%, ${gold}80 100%)`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        </div>
      ))}

      {/* Sacred center - glowing orb */}
      <div
        className={`absolute rounded-full ${animated ? 'animate-pulse-soft' : ''}`}
        style={{
          width: size * 0.22,
          height: size * 0.22,
          background: `radial-gradient(circle, ${gold} 0%, ${gold}90 40%, transparent 70%)`,
          boxShadow: `0 0 ${size * 0.15}px ${centerGlow}`,
        }}
      />

      {/* Innermost point - bright center */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.08,
          height: size * 0.08,
          background: isDayMode ? '#FFF8F0' : '#FFFAF5',
          boxShadow: `0 0 ${size * 0.08}px ${isDayMode ? '#FFF' : '#FFF8E8'}`,
        }}
      />

      {/* Custom animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-gentle {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.9; }
        }
        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 3s ease-in-out infinite;
        }
        .animate-pulse-soft {
          animation: pulse-soft 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}