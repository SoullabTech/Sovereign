'use client';

/**
 * Sessions Library - Scribe/Witness session history
 *
 * Lists all saved sessions (Solo, Practitioner, Third Chair)
 * with filtering by container type
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Users, Briefcase, Clock, Hash, ChevronRight, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

// Geometric symbol for sessions (witness eye)
const SessionsSymbol = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    {/* Eye / witness symbol */}
    <ellipse cx="20" cy="20" rx="14" ry="8" />
    <circle cx="20" cy="20" r="4" />
    <circle cx="20" cy="20" r="1.5" fill="currentColor" />
  </svg>
);

// Container icons
const ContainerIcon = ({ container, className }: { container: string; className?: string }) => {
  switch (container) {
    case 'witness':
      return <Users className={className} />;
    case 'practitioner':
      return <Briefcase className={className} />;
    default:
      return <BookOpen className={className} />;
  }
};

// Container colors
const containerColors: Record<string, { bg: string; text: string; border: string }> = {
  solo: { bg: 'bg-[#5a7a6f]/10', text: 'text-[#5a7a6f]', border: 'border-[#5a7a6f]/20' },
  witness: { bg: 'bg-[#7a5a6f]/10', text: 'text-[#7a5a6f]', border: 'border-[#7a5a6f]/20' },
  practitioner: { bg: 'bg-[#5a6f7a]/10', text: 'text-[#5a6f7a]', border: 'border-[#5a6f7a]/20' },
};

interface Session {
  id: string;
  title: string;
  container: 'solo' | 'witness' | 'practitioner';
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
  memoryPolicy: 'sealed' | 'learning';
  markerCount: number;
  duration: number | null;
  summary?: {
    short?: string;
    themes?: string[];
  };
}

export default function SessionsLibraryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'solo' | 'witness' | 'practitioner'>('all');

  useEffect(() => {
    async function loadSessions() {
      try {
        const url = filter === 'all'
          ? '/api/scribe/sessions'
          : `/api/scribe/sessions?container=${filter}`;
        const res = await apiFetch(url);
        const data = await res.json();
        setSessions(data.sessions || []);
      } catch (error) {
        console.error('Failed to load sessions:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, [filter]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '--';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const containerLabel = (container: string) => {
    switch (container) {
      case 'witness': return 'Third Chair';
      case 'practitioner': return 'Practitioner';
      default: return 'Solo';
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
    >
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/maia')}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors text-[13px] tracking-wide"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to MAIA</span>
          </button>
        </div>

        {/* Title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#5a7a6f]/10 flex items-center justify-center">
            <SessionsSymbol className="w-6 h-6 text-[#5a7a6f]" />
          </div>
          <div>
            <h1 className="text-xl font-light tracking-wide text-stone-800">Sessions</h1>
            <p className="text-stone-500 text-[13px] tracking-wide">Your Scribe and Witness recordings</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'solo', 'witness', 'practitioner'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-[13px] tracking-wide transition-all whitespace-nowrap ${
                filter === tab
                  ? 'bg-stone-800 text-white'
                  : 'bg-white/60 text-stone-600 hover:bg-white border border-stone-200/60'
              }`}
            >
              {tab === 'all' ? 'All' : tab === 'witness' ? 'Third Chair' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-stone-400 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <SessionsSymbol className="w-8 h-8 text-stone-300" />
            </div>
            <p className="text-stone-500 text-[14px] tracking-wide mb-2">No sessions yet</p>
            <p className="text-stone-400 text-[13px] tracking-wide">
              Say "MAIA, start scribe session" to begin
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const colors = containerColors[session.container] || containerColors.solo;
              return (
                <button
                  key={session.id}
                  onClick={() => router.push(`/sessions/${session.id}`)}
                  className="w-full bg-white/80 border border-stone-200/60 rounded-xl p-4 hover:bg-white hover:border-stone-300/60 transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    {/* Container Icon */}
                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <ContainerIcon container={session.container} className={`w-5 h-5 ${colors.text}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[14px] font-medium text-stone-800 truncate">
                          {session.title}
                        </h3>
                        {session.memoryPolicy === 'sealed' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">
                            Sealed
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[12px] text-stone-500">
                        <span className={`px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                          {containerLabel(session.container)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(session.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {session.markerCount} markers
                        </span>
                      </div>

                      {session.summary?.short && (
                        <p className="text-[12px] text-stone-400 mt-2 line-clamp-1">
                          {session.summary.short}
                        </p>
                      )}
                    </div>

                    {/* Date & Arrow */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[12px] text-stone-400">
                        {formatDate(session.startedAt)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
