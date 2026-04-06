'use client';

import { Loader2, CheckCircle, AlertCircle, Upload, Archive } from 'lucide-react';
import type { ProjectStatus } from '@/lib/media/types';

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; icon: React.ElementType }> = {
  uploading: { label: 'Uploading', color: 'bg-blue-500/20 text-blue-400', icon: Upload },
  processing: { label: 'Processing', color: 'bg-amber-500/20 text-amber-400', icon: Loader2 },
  ready: { label: 'Ready', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle },
  error: { label: 'Error', color: 'bg-red-500/20 text-red-400', icon: AlertCircle },
  archived: { label: 'Archived', color: 'bg-slate-500/20 text-slate-400', icon: Archive },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.ready;
  const Icon = config.icon as React.FC<{ className?: string }>;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className={`w-3 h-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
      {config.label}
    </span>
  );
}
