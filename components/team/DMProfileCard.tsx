'use client';

import { useState, useEffect } from 'react';

function stringToColor(str: string): string {
  const colors = ['#7c5cbf','#4f8fcc','#3fa88a','#c05c7e','#c08c3f','#5c8fcc','#8f5ccc','#3f9c7a'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString([], { month: 'long', year: 'numeric' });
}

interface MemberProfile {
  id: string;
  name: string | null;
  preferred_name: string | null;
  username: string;
  bio: string | null;
  timezone: string | null;
  avatar_url: string | null;
  roles: string[] | null;
  tier: string | null;
  is_practitioner: boolean | null;
  created_at: string;
  status: 'online' | 'away' | 'offline';
}

interface DMProfileCardProps {
  memberId: string;
  currentMemberId: string;
}

export function DMProfileCard({ memberId, currentMemberId: _currentMemberId }: DMProfileCardProps) {
  const [profile, setProfile] = useState<MemberProfile | null>(null);

  useEffect(() => {
    fetch(`/api/team/members/${memberId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.member) setProfile(d.member); })
      .catch(() => undefined);
  }, [memberId]);

  if (!profile) return null;

  const displayName = profile.preferred_name || profile.name || profile.username;
  const initials = displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="flex items-start gap-3 px-5 py-3 border-b border-white/6 flex-shrink-0 bg-zinc-900/40">
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
        style={{ background: stringToColor(memberId) }}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-white/90">{displayName}</span>
          <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
            profile.status === 'online' ? 'bg-emerald-400' :
            profile.status === 'away'   ? 'bg-amber-400' :
                                          'bg-white/20'
          }`} />
          {profile.is_practitioner && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400/80">
              Practitioner
            </span>
          )}
        </div>

        {profile.username !== displayName && (
          <p className="text-xs text-white/30">@{profile.username}</p>
        )}

        {profile.bio && (
          <p className="text-xs text-white/50 mt-0.5 leading-relaxed line-clamp-3">{profile.bio}</p>
        )}

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {profile.timezone && (
            <span className="text-xs text-white/25">{profile.timezone}</span>
          )}
          <span className="text-xs text-white/20">Member since {formatMemberSince(profile.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
