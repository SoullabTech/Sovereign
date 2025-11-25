'use client';

import React, { useState, ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type SacredButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive';
export type SacredButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface SacredButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: SacredButtonVariant;
  size?: SacredButtonSize;
  children: ReactNode;
  loading?: boolean;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  ripple?: boolean;
  className?: string;
}

const sacredButtonVariants = {
  primary: [
    'bg-gold-divine text-sacred-cosmic',
    'hover:bg-gold-amber hover:shadow-sacred',
    'active:bg-gold-amber active:scale-95',
    'focus:ring-2 focus:ring-gold-divine/50',
    'shadow-md hover:shadow-lg',
    'font-medium'
  ].join(' '),
  
  secondary: [
    'bg-sacred-navy/80 text-gold-divine border border-gold-divine/30',
    'hover:bg-sacred-navy hover:border-gold-divine/60 hover:shadow-sacred',
    'active:bg-sacred-blue active:scale-95',
    'focus:ring-2 focus:ring-gold-divine/50',
    'shadow-sm hover:shadow-md',
    'font-medium'
  ].join(' '),
  
  ghost: [
    'bg-transparent text-gold-divine',
    'hover:bg-gold-divine/10 hover:text-gold-amber',
    'active:bg-gold-divine/20 active:scale-95',
    'focus:ring-2 focus:ring-gold-divine/30',
    'font-medium'
  ].join(' '),
  
  outline: [
    'bg-transparent text-gold-divine border border-gold-divine/50',
    'hover:bg-gold-divine hover:text-sacred-cosmic hover:border-gold-divine',
    'active:bg-gold-amber active:scale-95',
    'focus:ring-2 focus:ring-gold-divine/50',
    'font-medium'
  ].join(' '),
  
  destructive: [
    'bg-red-600 text-white',
    'hover:bg-red-700 hover:shadow-lg',
    'active:bg-red-800 active:scale-95',
    'focus:ring-2 focus:ring-red-500/50',
    'shadow-md hover:shadow-lg',
    'font-medium'
  ].join(' ')
};

const sacredButtonSizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md min-h-[2rem]',
  md: 'px-4 py-2 text-sm rounded-lg min-h-[2.5rem]',
  lg: 'px-6 py-3 text-base rounded-lg min-h-[3rem]',
  xl: 'px-8 py-4 text-lg rounded-xl min-h-[3.5rem]'
};

export const SacredButton: React.FC<SacredButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  icon,
  rightIcon,
  fullWidth = false,
  ripple = true,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const [rippleEffect, setRippleEffect] = useState<{ x: number; y: number; id: number } | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && !disabled && !loading) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setRippleEffect({ x, y, id: Date.now() });
      
      setTimeout(() => {
        setRippleEffect(null);
      }, 600);
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  const baseClasses = [
    'relative overflow-hidden',
    'inline-flex items-center justify-center gap-2',
    'transition-all duration-200 ease-out',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'disabled:hover:transform-none',
    'font-sans',
    'select-none',
    'outline-none'
  ].join(' ');

  const variantClasses = sacredButtonVariants[variant];
  const sizeClasses = sacredButtonSizes[size];
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses,
        sizeClasses,
        widthClasses,
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple Effect */}
      {rippleEffect && (
        <span
          className="absolute rounded-full bg-white/30 animate-ping pointer-events-none"
          style={{
            left: rippleEffect.x - 10,
            top: rippleEffect.y - 10,
            width: 20,
            height: 20,
          }}
        />
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="animate-spin w-4 h-4">
          <div className="w-full h-full border-2 border-current border-t-transparent rounded-full" />
        </div>
      )}

      {/* Left Icon */}
      {icon && !loading && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}

      {/* Button Content */}
      <span className="flex-1 truncate">
        {children}
      </span>

      {/* Right Icon */}
      {rightIcon && !loading && (
        <span className="flex-shrink-0">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

// Specialized Sacred Button Variants
export const SacredPrimaryButton: React.FC<Omit<SacredButtonProps, 'variant'>> = (props) => (
  <SacredButton variant="primary" {...props} />
);

export const SacredSecondaryButton: React.FC<Omit<SacredButtonProps, 'variant'>> = (props) => (
  <SacredButton variant="secondary" {...props} />
);

export const SacredGhostButton: React.FC<Omit<SacredButtonProps, 'variant'>> = (props) => (
  <SacredButton variant="ghost" {...props} />
);

export const SacredOutlineButton: React.FC<Omit<SacredButtonProps, 'variant'>> = (props) => (
  <SacredButton variant="outline" {...props} />
);

// Sacred Button Group Component
interface SacredButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export const SacredButtonGroup: React.FC<SacredButtonGroupProps> = ({
  children,
  className = '',
  orientation = 'horizontal',
  spacing = 'md'
}) => {
  const orientationClasses = orientation === 'horizontal' ? 'flex-row' : 'flex-col';
  
  const spacingClasses = {
    none: 'gap-0',
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-4'
  }[spacing];

  return (
    <div className={cn(
      'inline-flex',
      orientationClasses,
      spacingClasses,
      className
    )}>
      {children}
    </div>
  );
};

// Sacred Action Button (with enhanced golden animations)
interface SacredActionButtonProps extends SacredButtonProps {
  action?: 'transform' | 'evolve' | 'transcend' | 'integrate';
}

export const SacredActionButton: React.FC<SacredActionButtonProps> = ({
  action = 'transform',
  className = '',
  children,
  ...props
}) => {
  const actionClasses = {
    transform: 'hover:animate-sacred-float hover:text-glow-gold',
    evolve: 'hover:animate-sacred-glow hover:box-glow-gold',
    transcend: 'hover:animate-sacred-rotate hover:shadow-sacred',
    integrate: 'hover:animate-pulse hover:ring-2 hover:ring-gold-divine/30'
  }[action];

  return (
    <SacredButton
      className={cn(actionClasses, className)}
      {...props}
    >
      {children}
    </SacredButton>
  );
};