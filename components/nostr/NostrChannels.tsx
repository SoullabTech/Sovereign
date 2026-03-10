'use client';

/**
 * NostrChannels
 *
 * Channel list view — shows all Soullab channels the member can access.
 * Handles join and navigation to individual channel threads.
 */

import { useState, useEffect } from 'react';
import { Hash, Users, Loader2, ShieldCheck, Lock, ChevronRight, TreePine, GraduationCap } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type { SoullabChannel } from '@/lib/nostr/channels';

interface Props {
  memberId: string;
  myPubkey: string;
  onOpenChannel: (channel: SoullabChannel) => void;
}

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  cohort: Hash,
  practitioners: ShieldCheck,
  retreat: TreePine,
  alumni: GraduationCap,
};

const CHANNEL_COLORS: Record<string, string> = {
  cohort: 'text-violet-400',
  practitioners: 'text-emerald-400',
  retreat: 'text-amber-400',
  alumni: 'text-sky-400',
};

export function NostrChannels({ memberId, myPubkey, onOpenChannel }: Props) {
  const [channels, setChannels] = useState<SoullabChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  async function loadChannels() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/nostr/channels');
      if (res.ok) {
        const data: SoullabChannel[] = await res.json();
        setChannels(data);
      }
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadChannels(); }, []);

  async function handleJoin(channelId: string) {
    setJoining(channelId);
    try {
      const res = await apiFetch(`/api/nostr/channels/${channelId}/join`, { method: 'POST' });
      if (res.ok) {
        setChannels(prev =>
          prev.map(c => c.id === channelId ? { ...c, joined: true } : c)
        );
      }
    } catch {
      // Silent fail — user can retry
    } finally {
      setJoining(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-stone-500 animate-spin" />
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="py-8 text-center">
        <Hash className="w-8 h-8 mx-auto mb-3 text-stone-600" />
        <p className="text-sm text-stone-500">No channels available</p>
        <p className="text-xs text-stone-600 mt-1">
          Set up sovereign messaging to access community channels.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-stone-500 uppercase tracking-wider">Channels</span>
      </div>

      {channels.map(channel => {
        const Icon = CHANNEL_ICONS[channel.channelType] ?? Hash;
        const color = CHANNEL_COLORS[channel.channelType] ?? 'text-stone-400';
        const isJoining = joining === channel.id;

        return (
          <div key={channel.id} className="group">
            {channel.joined ? (
              <button
                onClick={() => onOpenChannel(channel)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-stone-800/60 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-stone-700/60 flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{channel.name}</span>
                    {!channel.isOpen && (
                      <Lock className="w-3 h-3 text-stone-500 flex-shrink-0" />
                    )}
                  </div>
                  {channel.about && (
                    <p className="text-xs text-stone-500 truncate">{channel.about}</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-stone-400 transition-colors flex-shrink-0" />
              </button>
            ) : (
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-stone-800/60 flex items-center justify-center flex-shrink-0 opacity-60">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-stone-400">{channel.name}</span>
                    {!channel.isOpen && (
                      <Lock className="w-3 h-3 text-stone-600 flex-shrink-0" />
                    )}
                  </div>
                  {channel.about && (
                    <p className="text-xs text-stone-600 truncate">{channel.about}</p>
                  )}
                </div>
                {channel.isOpen ? (
                  <button
                    onClick={() => handleJoin(channel.id)}
                    disabled={isJoining}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-xs text-white font-medium transition-colors"
                  >
                    {isJoining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Join'}
                  </button>
                ) : (
                  <span className="text-xs text-stone-600 flex-shrink-0">Invite only</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
