'use client';

import { motion } from 'framer-motion';

interface HoloflowerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  glowIntensity?: 'low' | 'medium' | 'high';
  variant?: 'single' | 'spectrum';
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-12 h-12', image: 'w-8 h-8', glow: 'w-10 h-10', blur: '10px' },
  md: { container: 'w-16 h-16', image: 'w-12 h-12', glow: 'w-14 h-14', blur: '12px' },
  lg: { container: 'w-24 h-24', image: 'w-16 h-16', glow: 'w-20 h-20', blur: '15px' },
  xl: { container: 'w-32 h-32', image: 'w-24 h-24', glow: 'w-28 h-28', blur: '20px' }
};

const glowMap = {
  low: { opacity: [0.3, 0.5, 0.3], color: 'rgba(212, 184, 150, 0.3)' },
  medium: { opacity: [0.4, 0.6, 0.4], color: 'rgba(212, 184, 150, 0.5)' },
  high: { opacity: [0.5, 0.7, 0.5], color: 'rgba(212, 184, 150, 0.6)' }
};

export function Holoflower({
  size = 'md',
  animate = true,
  glowIntensity = 'medium',
  variant = 'single',
  className = ''
}: HoloflowerProps) {
  const sizes = sizeMap[size];
  const glow = glowMap[glowIntensity];
  const svgPath = variant === 'spectrum' ? '/elementalHoloflower.svg' : '/holoflower.svg';

  return (
    <div className={`${sizes.container} relative flex items-center justify-center ${className}`} style={{ background: 'transparent', boxShadow: 'none', border: 'none', outline: 'none', overflow: 'visible' }}>
      {/* Radiant glow */}
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
              background: `radial-gradient(circle, ${glow.color} 0%, rgba(212, 184, 150, 0.2) 50%, transparent 80%)`,
              filter: `blur(${sizes.blur})`,
            }}
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`${sizes.glow} rounded-full`}
            style={{
              background: `radial-gradient(circle, ${glow.color} 0%, rgba(212, 184, 150, 0.2) 50%, transparent 80%)`,
              filter: `blur(${sizes.blur})`,
              opacity: glow.opacity[1]
            }}
          />
        </div>
      )}

      {/* Holoflower SVG */}
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
          <img
            src={svgPath}
            alt="Soullab"
            className={`${sizes.image} object-contain`}
            style={{
              filter: `drop-shadow(0 0 ${parseInt(sizes.blur) * 0.75}px ${glow.color})`,
              background: 'transparent',
              mixBlendMode: 'normal',
              WebkitMaskImage: '-webkit-radial-gradient(white, white)',
              boxShadow: 'none',
              border: 'none',
              outline: 'none'
            }}
          />
        </motion.div>
      ) : (
        <div className="relative z-10">
          <img
            src={svgPath}
            alt="Soullab"
            className={`${sizes.image} object-contain`}
            style={{
              filter: `drop-shadow(0 0 ${parseInt(sizes.blur) * 0.75}px ${glow.color})`,
              background: 'transparent',
              mixBlendMode: 'normal',
              WebkitMaskImage: '-webkit-radial-gradient(white, white)',
              boxShadow: 'none',
              border: 'none',
              outline: 'none'
            }}
          />
        </div>
      )}
    </div>
  );
}