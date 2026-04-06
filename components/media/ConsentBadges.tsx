'use client';

import { Shield, AlertTriangle, Lock, Eye, Unlock } from 'lucide-react';
import type { MediaProjectRow } from '@/lib/media/types';

interface ConsentBadgesProps {
  project: MediaProjectRow;
  compact?: boolean;
}

interface Badge {
  label: string;
  color: string;
  icon: React.ElementType;
}

export function deriveConsentBadges(project: MediaProjectRow): Badge[] {
  const badges: Badge[] = [];

  if (project.privacy_level === 'confidential') {
    badges.push({ label: 'Confidential', color: 'bg-red-500/20 text-red-400', icon: Lock });
  } else if (project.privacy_level === 'sensitive') {
    badges.push({ label: 'Sensitive', color: 'bg-orange-500/20 text-orange-400', icon: Shield });
  }

  if (project.contains_sensitive_content) {
    badges.push({ label: 'Sensitive Content', color: 'bg-orange-500/20 text-orange-400', icon: AlertTriangle });
  }

  if (project.client_consent_status === 'pending') {
    badges.push({ label: 'Requires Consent', color: 'bg-yellow-500/20 text-yellow-400', icon: AlertTriangle });
  }

  if (project.expansion_level === 'high') {
    badges.push({ label: 'High Expansion', color: 'bg-purple-500/20 text-purple-400', icon: Eye });
  }

  if (!project.external_editing_allowed) {
    badges.push({ label: 'No External Edit', color: 'bg-slate-500/20 text-slate-400', icon: Lock });
  }

  if (project.publishing_allowed && project.client_consent_status === 'obtained') {
    badges.push({ label: 'Publishable', color: 'bg-emerald-500/20 text-emerald-400', icon: Unlock });
  }

  return badges;
}

export function ConsentBadges({ project, compact = false }: ConsentBadgesProps) {
  const badges = deriveConsentBadges(project);

  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${compact ? '' : 'mt-2'}`}>
      {badges.map((badge) => {
        const Icon = badge.icon as React.FC<{ className?: string }>;
        return (
          <span
            key={badge.label}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.color}`}
          >
            <Icon className="w-2.5 h-2.5" />
            {!compact && badge.label}
          </span>
        );
      })}
    </div>
  );
}
