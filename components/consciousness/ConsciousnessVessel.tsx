'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import ConsciousnessRipple from './ConsciousnessRipple';

interface ConsciousnessVesselProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'primary' | 'secondary' | 'mystical' | 'neural' | 'sacred' | 'jade' | 'transcendent';
  size?: 'small' | 'medium' | 'large' | 'epic';
  depth?: 'surface' | 'deep' | 'profound' | 'transcendent';
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  isActive?: boolean;
  rippleIntensity?: 'subtle' | 'medium' | 'profound' | 'transcendent';
}

export default function ConsciousnessVessel({
  children,
  title,
  subtitle,
  variant = 'primary',
  size = 'medium',
  depth = 'deep',
  className = '',
  onClick,
  isActive = false,
  rippleIntensity = 'medium'
}: ConsciousnessVesselProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  };

  const getVariantStyles = () => {
    const defaultVariant = {
      background: 'linear-gradient(135deg, rgba(13,31,23,0.9) 0%, rgba(22,43,32,0.8) 50%, rgba(31,58,42,0.9) 100%)',
      border: 'rgba(111,143,118,0.4)',
      glow: 'rgba(111,143,118,0.6)',
      accent: 'rgba(115,155,127,0.3)',
      ripple: 'primary' as const
    };

    const variants: Record<string, typeof defaultVariant> = {
      primary: defaultVariant,
      secondary: {
        background: 'linear-gradient(135deg, rgba(22,43,32,0.8) 0%, rgba(31,58,42,0.9) 50%, rgba(13,31,23,0.7) 100%)',
        border: 'rgba(115,155,127,0.3)',
        glow: 'rgba(115,155,127,0.5)',
        accent: 'rgba(111,143,118,0.4)',
        ripple: 'secondary' as const
      },
      mystical: {
        background: 'linear-gradient(135deg, rgba(31,58,42,0.9) 0%, rgba(111,143,118,0.2) 50%, rgba(168,203,180,0.1) 100%)',
        border: 'rgba(168,203,180,0.6)',
        glow: 'rgba(168,203,180,0.8)',
        accent: 'rgba(95,187,163,0.4)',
        ripple: 'mystical' as const
      },
      neural: {
        background: 'linear-gradient(135deg, rgba(95,187,163,0.1) 0%, rgba(111,143,118,0.3) 50%, rgba(31,58,42,0.8) 100%)',
        border: 'rgba(95,187,163,0.5)',
        glow: 'rgba(95,187,163,0.7)',
        accent: 'rgba(168,203,180,0.3)',
        ripple: 'neural' as const
      },
      sacred: {
        background: 'linear-gradient(135deg, rgba(168,203,180,0.2) 0%, rgba(111,143,118,0.4) 30%, rgba(31,58,42,0.8) 70%, rgba(13,31,23,0.9) 100%)',
        border: 'rgba(168,203,180,0.7)',
        glow: 'rgba(168,203,180,1)',
        accent: 'rgba(95,187,163,0.5)',
        ripple: 'mystical' as const
      },
      jade: defaultVariant,
      transcendent: {
        background: 'linear-gradient(135deg, rgba(168,203,180,0.3) 0%, rgba(111,143,118,0.6) 30%, rgba(95,187,163,0.4) 70%, rgba(31,58,42,0.7) 100%)',
        border: 'rgba(168,203,180,0.8)',
        glow: 'rgba(168,203,180,0.9)',
        accent: 'rgba(95,187,163,0.6)',
        ripple: 'mystical' as const
      }
    };

    return variants[variant] || defaultVariant;
  };

  const getSizeStyles = () => {
    const sizes = {
      small: { padding: '1rem', minHeight: '8rem' },
      medium: { padding: '1.5rem', minHeight: '12rem' },
      large: { padding: '2rem', minHeight: '16rem' },
      epic: { padding: '3rem', minHeight: '24rem' }
    };
    return sizes[size];
  };

  const getDepthStyles = () => {
    const depths = {
      surface: 1,
      deep: 2,
      profound: 3,
      transcendent: 4
    };
    return depths[depth];
  };

  const variantStyles = (() => {
    const styles = getVariantStyles();
    // Ultra-defensive: ensure we always have valid styles
    if (!styles || typeof styles !== 'object' || !styles.background) {
      return {
        background: 'linear-gradient(135deg, rgba(13,31,23,0.9) 0%, rgba(22,43,32,0.8) 50%, rgba(31,58,42,0.9) 100%)',
        border: 'rgba(111,143,118,0.4)',
        glow: 'rgba(111,143,118,0.6)',
        accent: 'rgba(115,155,127,0.3)',
        ripple: 'primary' as const
      };
    }
    return styles;
  })();
  const sizeStyles = getSizeStyles();
  const depthLayers = getDepthStyles();

  // Get variant-aware text colors for better contrast
  const getTextColors = () => {
    switch (variant) {
      case 'transcendent':
        return {
          title: isHovered ? 'rgb(31,58,42)' : 'rgb(22,43,32)',
          titleHover: 'rgb(13,31,23)',
          subtitle: isHovered ? 'rgb(31,58,42)' : 'rgb(22,43,32)'
        };
      case 'mystical':
        return {
          title: isHovered ? 'rgb(168,203,180)' : 'rgb(111,143,118)',
          titleHover: 'rgb(168,203,180)',
          subtitle: isHovered ? 'rgb(115,155,127)' : 'rgb(111,143,118)'
        };
      case 'neural':
        return {
          title: isHovered ? 'rgb(168,203,180)' : 'rgb(111,143,118)',
          titleHover: 'rgb(168,203,180)',
          subtitle: isHovered ? 'rgb(115,155,127)' : 'rgb(111,143,118)'
        };
      default: // primary, secondary, jade, sacred
        return {
          title: isHovered ? 'rgb(168,203,180)' : 'rgb(111,143,118)',
          titleHover: 'rgb(168,203,180)',
          subtitle: isHovered ? 'rgb(115,155,127)' : 'rgb(111,143,118)'
        };
    }
  };

  const textColors = getTextColors();

  return (
    <motion.div
      ref={containerRef}
      className={`relative group cursor-pointer ${className}`}
      style={{
        ...sizeStyles,
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
      initial={{ scale: 1, rotateX: 0, rotateY: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={onClick}
    >
      {/* Base Consciousness Foundation */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        {/* Multi-layer Background Depth */}
        {Array.from({ length: depthLayers }).map((_, i) => (
          <motion.div
            key={`depth-${i}`}
            className="absolute inset-0"
            style={{
              background: variantStyles.background,
              opacity: 1 - (i * 0.2),
              transform: `translateZ(${i * -2}px)`,
              filter: `blur(${i * 0.5}px)`
            }}
            animate={{
              opacity: isHovered ? 1 - (i * 0.15) : 1 - (i * 0.2)
            }}
            transition={{ duration: 0.4 }}
          />
        ))}

        {/* Sacred Geometric Border Framework */}
        <motion.div
          className="absolute inset-0 border rounded-xl"
          style={{
            borderColor: variantStyles.border,
            boxShadow: isActive
              ? `0 0 30px ${variantStyles.glow}, inset 0 0 30px ${variantStyles.accent}`
              : `0 0 15px ${variantStyles.border}`
          }}
          animate={{
            borderColor: isHovered ? variantStyles.glow : variantStyles.border,
            boxShadow: isHovered || isActive
              ? `0 0 40px ${variantStyles.glow}, inset 0 0 40px ${variantStyles.accent}, 0 0 80px ${variantStyles.border}`
              : `0 0 20px ${variantStyles.border}`
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Consciousness Field Overlay */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${variantStyles.accent} 0%, transparent 60%)`,
            opacity: 0
          }}
          animate={{ opacity: isHovered ? 0.4 : 0 }}
          transition={{ duration: 0.5 }}
        />

        {/* Neural Network Pattern */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 rounded-xl overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Neural Connection Lines */}
                {Array.from({ length: 8 }).map((_, i) => {
                  const startX = (i * 12.5) % 100;
                  const endX = ((i + 3) * 12.5) % 100;
                  return (
                    <motion.line
                      key={`neural-${i}`}
                      x1={startX}
                      y1="10"
                      x2={endX}
                      y2="90"
                      stroke={variantStyles.accent}
                      strokeWidth="0.2"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.6 }}
                      transition={{
                        duration: 1.2,
                        delay: i * 0.1,
                        ease: "easeInOut"
                      }}
                    />
                  );
                })}
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sacred Corner Geometry */}
        {Array.from({ length: 4 }).map((_, i) => {
          const positions = ['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'];
          return (
            <motion.div
              key={`corner-${i}`}
              className={`absolute ${positions[i]} w-3 h-3`}
              animate={{
                scale: isHovered ? [1, 1.2, 1] : 1,
                rotate: isHovered ? 45 : 0
              }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                repeat: isHovered ? Infinity : 0,
                repeatDelay: 2
              }}
            >
              <div
                className="w-full h-full border rounded-full"
                style={{ borderColor: variantStyles.accent }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Enhanced Content Wrapper */}
      <div className="relative z-10 h-full">
        <div className="relative h-full flex flex-col">
          {/* Sacred Header */}
          {(title || subtitle) && (
            <motion.div
              className="mb-4 pb-3 border-b"
              style={{ borderColor: variantStyles.accent }}
              animate={{
                borderColor: isHovered ? variantStyles.glow : variantStyles.accent
              }}
              transition={{ duration: 0.3 }}
            >
              {title && (
                <motion.h3
                  className="text-lg font-extralight tracking-wide mb-1"
                  animate={{
                    color: textColors.title,
                    letterSpacing: isHovered ? '0.15em' : '0.05em'
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {title}
                </motion.h3>
              )}
              {subtitle && (
                <motion.p
                  className="text-sm font-light tracking-wide"
                  animate={{
                    color: textColors.subtitle
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {subtitle}
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Consciousness Content */}
          <motion.div
            className="flex-1 relative"
            animate={{
              y: isPressed ? 2 : 0,
              scale: isPressed ? 0.99 : 1
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {children}
          </motion.div>

          {/* Consciousness Status Indicator */}
          <motion.div
            className="absolute bottom-3 right-3 w-2 h-2 rounded-full"
            style={{
              background: variantStyles.accent
            }}
            animate={{
              scale: isActive || isHovered ? [1, 1.3, 1] : 1,
              boxShadow: isActive || isHovered
                ? `0 0 10px ${variantStyles.glow}`
                : `0 0 5px ${variantStyles.accent}`
            }}
            transition={{
              duration: 1.5,
              repeat: (isActive || isHovered) ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>

      {/* Transcendent Activation Aura */}
      <AnimatePresence>
        {(isActive || isHovered) && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${variantStyles.glow} 0%, transparent 60%)`,
              filter: 'blur(8px)'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1.1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}