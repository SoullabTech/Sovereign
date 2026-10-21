'use client';
import type { TeamChannel } from '@/lib/team/types';
import { ChannelVisibilityToggle } from './ChannelVisibilityToggle';

const ARCHETYPE_CONFIG = {
  checkin:    { label: 'Check-In',   color: 'bg-amber-500/15 text-amber-400/80',     hint: 'This is a witnessing space — hold what is shared without rushing to fix or advise.' },
  field_note: { label: 'Field Note', color: 'bg-violet-500/15 text-violet-400/80',   hint: 'Bring observations, patterns, and subtle material. Less discussion, more noticing.' },
  practice:   { label: 'Practice',   color: 'bg-emerald-500/15 text-emerald-400/80', hint: 'Track effort, report results, and hold each other in the work.' },
  cohort:     { label: 'Circle',     color: 'bg-sky-500/15 text-sky-400/80',         hint: 'A small-group depth container. Trust what arises here.' },
  venture:    { label: 'Venture',    color: 'bg-orange-500/15 text-orange-400/80',   hint: 'Where inner impulse meets outer form. Bring both the vision and the block.' },
  general:    { label: 'General',    color: 'bg-zinc-500/15 text-zinc-400/80',       hint: null },
};

const RESPONSE_MODE_TEXT = {
  witnessing: 'Witnessing space — hold what is shared without rushing to fix or advise.',
  reflection: 'Reflection invited — offer what you genuinely notice, not what you think they should do.',
  advice:     'Practical exchange — direct feedback and suggestions welcome.',
  open:       null,
};

interface ChannelPurposeHeaderProps {
  channel: TeamChannel;
  currentMemberId?: string;
  memberCount?: number;
  onOpenMembers?: () => void;
  onVisibilityChanged?: (newIsPrivate: boolean) => void;
}

export function ChannelPurposeHeader({
  channel,
  currentMemberId: _currentMemberId,
  memberCount,
  onOpenMembers,
  onVisibilityChanged,
}: ChannelPurposeHeaderProps) {
  const archetype = channel.archetype ?? 'general';
  const config = ARCHETYPE_CONFIG[archetype] ?? ARCHETYPE_CONFIG.general;
  const responseHint = RESPONSE_MODE_TEXT[channel.responseMode ?? 'open'];
  const hint = responseHint ?? config.hint;

  return (
    <div className="px-5 py-3 border-b border-white/8 flex-shrink-0">
      <div className="flex items-start gap-3">
        {channel.isPrivate ? (
          <svg className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ) : (
          <span className="text-white/40 text-lg font-light mt-0.5">#</span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-semibold text-white/90">{channel.name}</h2>
            {archetype !== 'general' && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>
                {config.label}
              </span>
            )}
            {onOpenMembers && (
              <button
                onClick={onOpenMembers}
                title="View and add members"
                className="text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-2 py-0.5 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Members{memberCount !== undefined ? ` (${memberCount})` : ''}
              </button>
            )}
            <ChannelVisibilityToggle
              channelId={channel.id}
              channelName={channel.slug}
              currentIsPrivate={channel.isPrivate}
              onChanged={(newIsPrivate) => onVisibilityChanged?.(newIsPrivate)}
            />
          </div>
          {channel.purposeBlock ? (
            <p className="text-xs text-white/45 mt-0.5 leading-relaxed">{channel.purposeBlock}</p>
          ) : channel.description ? (
            <p className="text-xs text-white/35 mt-0.5">{channel.description}</p>
          ) : null}
          {hint && archetype !== 'general' && (
            <p className="text-xs text-white/25 mt-1 italic">{hint}</p>
          )}
        </div>
      </div>
    </div>
  );
}
