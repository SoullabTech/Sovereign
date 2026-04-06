'use client';

import Link from 'next/link';
import { Music, Video, Image, FileText, Clock } from 'lucide-react';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { ConsentBadges } from './ConsentBadges';
import type { MediaProjectRow } from '@/lib/media/types';

const TYPE_ICONS: Record<string, React.ElementType> = {
  audio: Music,
  video: Video,
  image: Image,
  document: FileText,
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffHours < 48) return 'Yesterday';
  return date.toLocaleDateString();
}

export function MediaProjectCard({ project }: { project: MediaProjectRow }) {
  const TypeIcon = (TYPE_ICONS[project.media_type] || FileText) as React.FC<{ className?: string }>;
  const duration = formatDuration(project.duration_seconds);

  return (
    <Link href={`/studio/media/${project.id}`}>
      <div className="group relative bg-[#1a1a2e] border border-white/5 rounded-lg overflow-hidden hover:border-amber-500/30 transition-all cursor-pointer">
        {/* Thumbnail area */}
        <div className="relative aspect-video bg-[#0d0d1a] flex items-center justify-center">
          <TypeIcon className="w-10 h-10 text-white/20" />
          {duration && (
            <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
              {duration}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-white/90 truncate flex-1">
              {project.title}
            </h3>
            <ProjectStatusBadge status={project.status} />
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
            <span className="capitalize">{project.source}</span>
            <span className="text-white/20">|</span>
            <Clock className="w-3 h-3" />
            <span>{formatDate(project.created_at)}</span>
          </div>

          <ConsentBadges project={project} compact />
        </div>
      </div>
    </Link>
  );
}
