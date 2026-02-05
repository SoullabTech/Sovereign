'use client';

/**
 * PORTAL LAYOUT COMPONENTS
 *
 * Shared UI kit for the Commons/Cathedral aesthetic.
 * Dark, breathable, amber/gold authority, clear sections.
 *
 * Components:
 * - PageShell: Full page wrapper with background
 * - SectionCard: Rounded glass card with header
 * - StatTile: Compact stat display
 * - TagPill: Small label pill
 * - EmptyState: Placeholder for empty content
 * - PortalHeader: Page header with back button
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

// ============================================
// PAGE SHELL
// ============================================

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
}

export function PageShell({ children, className = '', maxWidth = '6xl' }: PageShellProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full',
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 ${className}`}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto px-6 py-8`}>
        {children}
      </div>
    </div>
  );
}

// ============================================
// PORTAL HEADER
// ============================================

interface PortalHeaderProps {
  title: string;
  subtitle?: string;
  backPath?: string;
  backLabel?: string;
  badge?: string;
  badgeColor?: 'amber' | 'violet' | 'emerald' | 'rose' | 'blue';
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}

export function PortalHeader({
  title,
  subtitle,
  backPath,
  backLabel = 'Back',
  badge,
  badgeColor = 'amber',
  actions,
  icon,
}: PortalHeaderProps) {
  const router = useRouter();

  const badgeColors = {
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300/80',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-300/80',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300/80',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-300/80',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300/80',
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      {/* Back button row */}
      {backPath && (
        <button
          onClick={() => router.push(backPath)}
          className="flex items-center gap-2 text-amber-400/60 hover:text-amber-400 transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backLabel}</span>
        </button>
      )}

      {/* Title row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              {icon}
            </div>
          )}
          <div>
            {badge && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border mb-2 ${badgeColors[badgeColor]}`}>
                {badge}
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-light text-amber-50 tracking-wide">
              {title}
            </h1>
            {subtitle && (
              <p className="text-amber-200/50 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </motion.header>
  );
}

// ============================================
// SECTION CARD
// ============================================

interface SectionCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'amber' | 'violet' | 'emerald' | 'rose' | 'subtle';
  noPadding?: boolean;
  delay?: number;
}

export function SectionCard({
  children,
  title,
  subtitle,
  icon,
  actions,
  className = '',
  variant = 'default',
  noPadding = false,
  delay = 0,
}: SectionCardProps) {
  const variantStyles = {
    default: 'bg-white/5 border-white/10',
    amber: 'bg-amber-500/5 border-amber-500/20',
    violet: 'bg-violet-500/5 border-violet-500/20',
    emerald: 'bg-emerald-500/5 border-emerald-500/20',
    rose: 'bg-rose-500/5 border-rose-500/20',
    subtle: 'bg-white/[0.02] border-white/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-2xl border backdrop-blur-sm ${variantStyles[variant]} ${className}`}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            {icon && <span className="text-amber-400">{icon}</span>}
            <div>
              {title && <h3 className="font-medium text-amber-100">{title}</h3>}
              {subtitle && <p className="text-sm text-amber-200/50">{subtitle}</p>}
            </div>
          </div>
          {actions}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </motion.div>
  );
}

// ============================================
// STAT TILE
// ============================================

interface StatTileProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function StatTile({ label, value, icon, trend, trendValue, className = '' }: StatTileProps) {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-rose-400',
    neutral: 'text-amber-400/60',
  };

  return (
    <div className={`p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm ${className}`}>
      {icon && <div className="text-amber-400/60 mb-2">{icon}</div>}
      <div className="text-2xl font-light text-amber-100">{value}</div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-amber-300/50 uppercase tracking-wider">{label}</span>
        {trend && trendValue && (
          <span className={`text-xs ${trendColors[trend]}`}>{trendValue}</span>
        )}
      </div>
    </div>
  );
}

// ============================================
// STAT GRID
// ============================================

interface StatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatGrid({ children, columns = 4, className = '' }: StatGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
}

// ============================================
// TAG PILL
// ============================================

interface TagPillProps {
  children: React.ReactNode;
  color?: 'amber' | 'violet' | 'emerald' | 'rose' | 'blue' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export function TagPill({ children, color = 'amber', size = 'sm', className = '' }: TagPillProps) {
  const colorStyles = {
    amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    violet: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    rose: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    slate: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${colorStyles[color]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
}

// ============================================
// EMPTY STATE
// ============================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && <div className="text-amber-400/40 mb-4 flex justify-center">{icon}</div>}
      <h3 className="text-lg font-medium text-amber-100/80 mb-2">{title}</h3>
      {description && (
        <p className="text-amber-200/50 text-sm max-w-md mx-auto mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          {action.label}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ============================================
// LIST ITEM
// ============================================

interface ListItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function ListItem({
  children,
  onClick,
  icon,
  trailing,
  className = '',
  hoverable = true,
}: ListItemProps) {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      onClick={onClick}
      className={`
        w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all
        ${hoverable ? 'hover:bg-white/5' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {icon && <div className="text-amber-400/60 flex-shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">{children}</div>
      {trailing && <div className="flex-shrink-0">{trailing}</div>}
    </Component>
  );
}

// ============================================
// DIVIDER
// ============================================

interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className = '' }: DividerProps) {
  if (label) {
    return (
      <div className={`flex items-center gap-4 my-8 ${className}`}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="text-xs uppercase tracking-widest text-amber-300/40">{label}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    );
  }
  return <div className={`h-px bg-white/10 my-6 ${className}`} />;
}

// ============================================
// ACTION BUTTON
// ============================================

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function ActionButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  className = '',
  type = 'button',
}: ActionButtonProps) {
  const variantStyles = {
    primary: 'bg-amber-600 hover:bg-amber-700 text-white border-transparent',
    secondary: 'bg-white/5 hover:bg-white/10 text-amber-100 border-white/10',
    ghost: 'bg-transparent hover:bg-white/5 text-amber-300 border-transparent',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-xl border font-medium transition-all
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {icon && iconPosition === 'left' && icon}
      {children}
      {icon && iconPosition === 'right' && icon}
    </button>
  );
}

// ============================================
// TOGGLE SWITCH
// ============================================

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <label className={`flex items-center justify-between gap-4 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      {(label || description) && (
        <div>
          {label && <div className="text-sm font-medium text-amber-100">{label}</div>}
          {description && <div className="text-xs text-amber-200/50 mt-0.5">{description}</div>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${checked ? 'bg-amber-600' : 'bg-white/20'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </label>
  );
}
