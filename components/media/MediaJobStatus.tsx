'use client';

import { CheckCircle, Loader2, AlertCircle, Circle, SkipForward } from 'lucide-react';
import type { MediaJobRow } from '@/lib/media/types';

const JOB_LABELS: Record<string, string> = {
  validate: 'Validate',
  inspect: 'Inspect',
  thumbnail: 'Thumbnail',
  waveform: 'Waveform',
  audio_extract: 'Extract Audio',
  transcribe: 'Transcribe',
  classify: 'Classify',
  summarize: 'Summarize',
};

const STATUS_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  queued: { icon: Circle, color: 'text-white/20' },
  processing: { icon: Loader2, color: 'text-amber-400' },
  done: { icon: CheckCircle, color: 'text-emerald-400' },
  failed: { icon: AlertCircle, color: 'text-red-400' },
  skipped: { icon: SkipForward, color: 'text-white/20' },
};

export function MediaJobStatus({ jobs }: { jobs: MediaJobRow[] }) {
  if (jobs.length === 0) return null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {jobs.map((job, i) => {
        const config = STATUS_ICONS[job.status] || STATUS_ICONS.queued;
        const Icon = config.icon as React.FC<{ className?: string }>;
        const label = JOB_LABELS[job.job_type] || job.job_type;

        return (
          <div key={job.id} className="flex items-center">
            {i > 0 && (
              <div className={`w-4 h-px mx-0.5 ${
                job.status === 'done' ? 'bg-emerald-400/30' :
                job.status === 'processing' ? 'bg-amber-400/30' :
                'bg-white/10'
              }`} />
            )}
            <div className="flex flex-col items-center gap-0.5 group relative">
              <Icon className={`w-4 h-4 ${config.color} ${
                job.status === 'processing' ? 'animate-spin' : ''
              }`} />
              <span className={`text-[9px] ${
                job.status === 'done' ? 'text-emerald-400/60' :
                job.status === 'processing' ? 'text-amber-400/60' :
                job.status === 'failed' ? 'text-red-400/60' :
                'text-white/20'
              }`}>
                {label}
              </span>
              {job.last_error && (
                <div className="absolute bottom-full mb-1 hidden group-hover:block bg-red-900/90 text-red-200 text-[10px] px-2 py-1 rounded whitespace-nowrap max-w-[200px] truncate z-10">
                  {job.last_error}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
