'use client';

import { motion } from 'framer-motion';

interface HoloflowerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  glowIntensity?: 'low' | 'medium' | 'high';
  variant?: 'single' | 'spectrum';
  theme?: 'light' | 'dark'; // for light or dark backgrounds
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-12 h-12', image: 'w-8 h-8', glow: 'w-10 h-10', blur: '10px' },
  md: { container: 'w-16 h-16', image: 'w-12 h-12', glow: 'w-14 h-14', blur: '12px' },
  lg: { container: 'w-24 h-24', image: 'w-16 h-16', glow: 'w-20 h-20', blur: '15px' },
  xl: { container: 'w-32 h-32', image: 'w-24 h-24', glow: 'w-28 h-28', blur: '20px' }
};

const glowMap = {
  low: { opacity: [0.15, 0.2, 0.15], color: 'rgba(212, 184, 150, 0.2)' },
  medium: { opacity: [0.2, 0.25, 0.2], color: 'rgba(212, 184, 150, 0.25)' },
  high: { opacity: [0.25, 0.3, 0.25], color: 'rgba(212, 184, 150, 0.3)' }
};

export function Holoflower({
  size = 'md',
  animate = true,
  glowIntensity = 'medium',
  variant = 'single',
  theme = 'dark',
  className = ''
}: HoloflowerProps) {
  const sizes = sizeMap[size];
  const glow = glowMap[glowIntensity];
  const svgPath = variant === 'spectrum' ? '/elementalHoloflower.svg' : '/holoflower.svg';

  return (
    <div className={`${sizes.container} relative flex items-center justify-center ${className}`} style={{ background: 'transparent', boxShadow: 'none', border: 'none', outline: 'none', overflow: 'visible' }}>

      {/* Very subtle background for contrast - more diffused */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`${sizes.glow} rounded-full bg-gradient-to-br from-gray-800/10 to-gray-700/15`}
          style={{
            filter: `blur(${parseInt(sizes.blur) * 3}px)`,
            opacity: 0.15
          }}
        />
      </div>

      {/* Radiant glow - enhanced */}
      {animate ? (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.2, 1],
            opacity: glow.opacity
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div
            className={`${sizes.glow} rounded-full`}
            style={{
              background: `radial-gradient(circle, ${glow.color} 0%, rgba(212, 184, 150, 0.15) 30%, rgba(212, 184, 150, 0.1) 60%, rgba(212, 184, 150, 0.05) 80%, transparent 95%)`,
              filter: `blur(${sizes.blur})`,
            }}
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`${sizes.glow} rounded-full`}
            style={{
              background: `radial-gradient(circle, ${glow.color} 0%, rgba(212, 184, 150, 0.15) 30%, rgba(212, 184, 150, 0.1) 60%, rgba(212, 184, 150, 0.05) 80%, transparent 95%)`,
              filter: `blur(${sizes.blur})`,
              opacity: glow.opacity[1]
            }}
          />
        </div>
      )}

      {/* Holoflower SVG - enhanced visibility */}
      {animate ? (
        <motion.div
          className="relative z-10"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 3, 0, -3, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Subtle dark background to make white pattern visible */}
          <div
            className={`${sizes.image} absolute inset-0 bg-gradient-to-br from-gray-800/20 via-gray-700/25 to-gray-600/30 rounded-full opacity-60`}
            style={{ zIndex: 1 }}
          />

          {/* Subtle white overlay layer */}
          <img
            src={svgPath}
            alt=""
            aria-hidden="true"
            className={`${sizes.image} object-contain absolute inset-0`}
            style={{
              filter: `brightness(1.5) contrast(80) drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))`,
              background: 'transparent',
              zIndex: 2,
              mixBlendMode: 'screen',
              opacity: 0.3
            }}
          />
          {/* Main SVG with luminous white pattern */}
          <img
            src={svgPath}
            alt="Soullab"
            className={`${sizes.image} object-contain relative z-10`}
            style={{
              filter: `brightness(2) contrast(120) drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))`,
              background: 'transparent',
              mixBlendMode: 'screen',
              opacity: 0.8,
              zIndex: 4
            }}
          />
        </motion.div>
      ) : (
        <div className="relative z-10">
          {/* Subtle dark background to make white pattern visible */}
          <div
            className={`${sizes.image} absolute inset-0 bg-gradient-to-br from-gray-800/20 via-gray-700/25 to-gray-600/30 rounded-full opacity-60`}
            style={{ zIndex: 1 }}
          />

          {/* Subtle white overlay layer */}
          <img
            src={svgPath}
            alt=""
            aria-hidden="true"
            className={`${sizes.image} object-contain absolute inset-0`}
            style={{
              filter: `brightness(1.5) contrast(80) drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))`,
              background: 'transparent',
              zIndex: 2,
              mixBlendMode: 'screen',
              opacity: 0.3
            }}
          />
          {/* Main SVG with luminous white pattern */}
          <img
            src={svgPath}
            alt="Soullab"
            className={`${sizes.image} object-contain relative z-10`}
            style={{
              filter: `brightness(2) contrast(120) drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))`,
              background: 'transparent',
              mixBlendMode: 'screen',
              opacity: 0.8,
              zIndex: 4
            }}
          />
        </div>
      )}
    </div>
  );
}