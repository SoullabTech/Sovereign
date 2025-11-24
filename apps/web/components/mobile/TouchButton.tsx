'use client';

import React, { ReactNode, useRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface TouchButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'sacred';
  haptic?: 'light' | 'medium' | 'heavy';
  className?: string;
}

export default function TouchButton({
  children,
  size = 'md',
  variant = 'primary',
  haptic = 'light',
  className = '',
  disabled,
  onClick,
  ...props
}: TouchButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Size configurations optimized for touch
  const sizeClasses = {
    sm: 'min-w-[44px] min-h-[44px] px-3 py-2 text-sm',
    md: 'min-w-[48px] min-h-[48px] px-4 py-3 text-base',
    lg: 'min-w-[56px] min-h-[56px] px-6 py-4 text-lg'
  };

  // Sacred color variants (no purple per user request)
  const variantClasses = {
    primary: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl',
    ghost: 'bg-white/10 text-white border border-white/20 backdrop-blur-sm',
    sacred: 'bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 text-white shadow-xl hover:shadow-2xl'
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    // Add haptic feedback
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[haptic]);
    }

    // Visual touch feedback (iOS-style)
    if (buttonRef.current) {
      buttonRef.current.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.style.transform = '';
        }
      }, 150);
    }

    // Call original onClick
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-full font-medium
        transition-all duration-150 ease-out
        active:scale-95 
        disabled:opacity-50 disabled:cursor-not-allowed
        touch-none select-none
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500/50
        ${className}
      `}
      whileTap={{ 
        scale: disabled ? 1 : 0.95,
        transition: { duration: 0.1 }
      }}
      whileHover={disabled ? {} : { 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      {...props}
    >
      <span className="flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}