'use client';

import React, { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { SacredGeometry } from './SacredGeometry';

export type SacredCardVariant = 'default' | 'elevated' | 'glass' | 'outlined' | 'consciousness';
export type SacredCardSize = 'sm' | 'md' | 'lg' | 'xl';

interface SacredCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SacredCardVariant;
  size?: SacredCardSize;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  geometry?: 'vector-equilibrium' | 'metatrons-cube' | 'seed-of-life' | 'flower-of-life' | 'golden-spiral';
  geometrySize?: number;
  hover?: boolean;
  glow?: boolean;
  className?: string;
}

const sacredCardVariants = {
  default: [
    'bg-sacred-navy/80 backdrop-blur-xl',
    'border border-gold-divine/20',
    'shadow-sacred'
  ].join(' '),
  
  elevated: [
    'bg-sacred-blue/90 backdrop-blur-xl',
    'border border-gold-divine/30',
    'shadow-sacred hover:shadow-deep',
    'hover:-translate-y-1'
  ].join(' '),
  
  glass: [
    'bg-sacred-navy/40 backdrop-blur-2xl',
    'border border-gold-divine/10',
    'shadow-lg'
  ].join(' '),
  
  outlined: [
    'bg-transparent',
    'border-2 border-gold-divine/40',
    'hover:bg-sacred-navy/20',
    'hover:border-gold-divine/60'
  ].join(' '),
  
  consciousness: [
    'bg-gradient-to-br from-sacred-navy/90 to-sacred-blue/90',
    'border border-gold-divine/30',
    'shadow-sacred hover:shadow-deep',
    'relative overflow-hidden'
  ].join(' ')
};

const sacredCardSizes = {
  sm: 'p-4 rounded-lg',
  md: 'p-6 rounded-xl',
  lg: 'p-8 rounded-xl',
  xl: 'p-10 rounded-2xl'
};

export const SacredCard: React.FC<SacredCardProps> = ({
  variant = 'default',
  size = 'md',
  children,
  title,
  subtitle,
  icon,
  geometry,
  geometrySize = 80,
  hover = true,
  glow = false,
  className = '',
  ...props
}) => {
  const baseClasses = [
    'transition-all duration-300 ease-out',
    'relative'
  ].join(' ');

  const hoverClasses = hover ? 'hover:scale-[1.02] cursor-pointer' : '';
  const glowClasses = glow ? 'sacred-glow hover:sacred-glow-strong' : '';

  const variantClasses = sacredCardVariants[variant];
  const sizeClasses = sacredCardSizes[size];

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses,
        sizeClasses,
        hoverClasses,
        glowClasses,
        className
      )}
      {...props}
    >
      {/* Sacred Geometry Background */}
      {geometry && (
        <div className="absolute top-4 right-4 opacity-20 pointer-events-none">
          <SacredGeometry 
            type={geometry} 
            size={geometrySize} 
            color="rgba(255, 215, 0, 0.3)"
            animate={false}
            glow={false}
          />
        </div>
      )}

      {/* Consciousness variant energy patterns */}
      {variant === 'consciousness' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-divine/50 to-transparent" />
          <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-radial from-gold-divine/5 to-transparent" />
        </div>
      )}

      {/* Header */}
      {(title || subtitle || icon) && (
        <div className="flex items-start gap-4 mb-6">
          {icon && (
            <div className="flex-shrink-0 p-2 bg-gold-divine/10 rounded-lg text-gold-divine">
              {icon}
            </div>
          )}
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-medium text-gold-divine mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-silver/80">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Sacred Card Header Component
interface SacredCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const SacredCardHeader: React.FC<SacredCardHeaderProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={cn('mb-6', className)}>
    {children}
  </div>
);

// Sacred Card Title Component
interface SacredCardTitleProps {
  children: ReactNode;
  className?: string;
}

export const SacredCardTitle: React.FC<SacredCardTitleProps> = ({ 
  children, 
  className = '' 
}) => (
  <h3 className={cn('text-xl font-medium text-gold-divine mb-2', className)}>
    {children}
  </h3>
);

// Sacred Card Content Component
interface SacredCardContentProps {
  children: ReactNode;
  className?: string;
}

export const SacredCardContent: React.FC<SacredCardContentProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={cn('text-neutral-silver leading-relaxed', className)}>
    {children}
  </div>
);

// Sacred Card Footer Component
interface SacredCardFooterProps {
  children: ReactNode;
  className?: string;
}

export const SacredCardFooter: React.FC<SacredCardFooterProps> = ({ 
  children, 
  className = '' 
}) => (
  <div className={cn('mt-6 pt-6 border-t border-gold-divine/20', className)}>
    {children}
  </div>
);

// Sacred Metric Card (for dashboards)
interface SacredMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon?: ReactNode;
  geometry?: SacredCardProps['geometry'];
  className?: string;
}

export const SacredMetricCard: React.FC<SacredMetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  geometry = 'golden-spiral',
  className = ''
}) => {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    stable: 'text-gold-divine'
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→'
  };

  return (
    <SacredCard 
      variant="elevated" 
      geometry={geometry}
      className={className}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-neutral-silver">
            {title}
          </h4>
          {icon && (
            <div className="text-gold-divine">
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="space-y-1">
          <div className="text-3xl font-light text-gold-divine">
            {value}
          </div>
          {subtitle && (
            <div className="text-sm text-neutral-silver/60">
              {subtitle}
            </div>
          )}
        </div>

        {/* Trend */}
        {trend && trendValue && (
          <div className={cn('flex items-center gap-1 text-sm', trendColors[trend])}>
            <span>{trendIcons[trend]}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </SacredCard>
  );
};

// Sacred Progress Card
interface SacredProgressCardProps {
  title: string;
  progress: number; // 0-100
  description?: string;
  icon?: ReactNode;
  color?: string;
  className?: string;
}

export const SacredProgressCard: React.FC<SacredProgressCardProps> = ({
  title,
  progress,
  description,
  icon,
  color = '#FFD700',
  className = ''
}) => {
  return (
    <SacredCard 
      variant="consciousness" 
      geometry="seed-of-life"
      className={className}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          {icon && (
            <div className="text-gold-divine">
              {icon}
            </div>
          )}
          <div>
            <h4 className="text-lg font-medium text-gold-divine">
              {title}
            </h4>
            {description && (
              <p className="text-sm text-neutral-silver/80">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-silver">
              Progress
            </span>
            <span className="text-sm font-medium text-gold-divine">
              {Math.round(progress)}%
            </span>
          </div>
          
          <div className="h-2 bg-sacred-blue/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gold-divine transition-all duration-700 ease-out rounded-full"
              style={{ 
                width: `${Math.max(0, Math.min(100, progress))}%`,
                boxShadow: `0 0 10px ${color}40`
              }}
            />
          </div>
        </div>
      </div>
    </SacredCard>
  );
};