'use client';

import React from 'react';
import { Clock, Sparkles, AlertCircle, Upload, CheckCircle2 } from 'lucide-react';

export type FileStatus = 'uploading' | 'processing' | 'ready' | 'completed' | 'failed' | 'error';

interface LibraryStatusBadgeProps {
  status: FileStatus;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG = {
  uploading: {
    icon: Upload,
    label: 'Uploading',
    description: 'File is being uploaded...',
    colors: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    iconClasses: 'animate-pulse'
  },
  processing: {
    icon: Clock,
    label: 'Studying',
    description: 'Maya is studying this file...',
    colors: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    iconClasses: 'animate-pulse'
  },
  ready: {
    icon: Sparkles,
    label: 'Absorbed',
    description: 'Woven into memory',
    colors: 'bg-green-500/20 text-green-400 border-green-500/40',
    iconClasses: 'animate-pulse'
  },
  completed: {
    icon: CheckCircle2,
    label: 'Absorbed',
    description: 'Woven into memory',
    colors: 'bg-green-500/20 text-green-400 border-green-500/40',
    iconClasses: ''
  },
  failed: {
    icon: AlertCircle,
    label: 'Failed',
    description: 'Processing failed',
    colors: 'bg-red-500/20 text-red-400 border-red-500/40',
    iconClasses: 'animate-bounce'
  },
  error: {
    icon: AlertCircle,
    label: 'Error',
    description: 'Something went wrong',
    colors: 'bg-red-500/20 text-red-400 border-red-500/40',
    iconClasses: ''
  }
} as const;

export function LibraryStatusBadge({ 
  status, 
  className = '', 
  showLabel = true, 
  size = 'md' 
}: LibraryStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.error;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full border font-medium
        ${config.colors}
        ${sizeClasses[size]}
        ${className}
      `}
      title={config.description}
    >
      <Icon 
        className={`${iconSizes[size]} ${config.iconClasses}`}
      />
      {showLabel && (
        <span className="whitespace-nowrap">
          {config.label}
        </span>
      )}
    </div>
  );
}

export function StatusIndicator({ status, className = '' }: { status: FileStatus; className?: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.error;
  const Icon = config.icon;
  
  return (
    <div className={`relative ${className}`}>
      <Icon 
        className={`w-5 h-5 ${config.colors.split(' ')[1]} ${config.iconClasses}`}
        title={config.description}
      />
      
      {/* Pulsing ring for active states */}
      {(status === 'processing' || status === 'uploading') && (
        <div className={`
          absolute inset-0 rounded-full animate-ping
          ${status === 'processing' ? 'bg-yellow-400/75' : 'bg-blue-400/75'}
        `} />
      )}
    </div>
  );
}