'use client';

/**
 * Session Detail - View a single Scribe/Witness session
 *
 * Shows summary, markers, transcript (if enabled), and "Discuss with MAIA"
 */

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Users,
  Briefcase,
  Clock,
  Hash,
  MessageCircle,
  Lock,
  Unlock,
  Trash2,
  Loader2,
  Play,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

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

// Marker type colors
const markerColors: Record<string, string> = {
  insight: 'bg-emerald-100 text-emerald-700',
  opening: 'bg-sky-100 text-sky-700',
  resistance: 'bg-amber-100 text-amber-700',
  integration: 'bg-violet-100 text-violet-700',
  turning_point: 'bg-rose-100 text-rose-700',
  breakthrough: 'bg-emerald-100 text-emerald-700',
  somatic_shift: 'bg-orange-100 text-orange-700',
  escalation: 'bg-red-100 text-red-700',
  softening: 'bg-sky-100 text-sky-700',
  repair: 'bg-green-100 text-green-700',
  need_named: 'bg-purple-100 text-purple-700',
  appreciation: 'bg-pink-100 text-pink-700',
  miss: 'bg-amber-100 text-amber-700',
};

interface Marker {
  id: string;
  type: string;
  note: string | null;
  speaker: string | null;
  markedBy: string;
  markedAt: string;
  transcriptExcerpt: string | null;
}

interface TranscriptEntry {
  speaker: string;
  participantLabel: string | null;
  content: string;
  spokenAt: string;
}

interface SessionDetail {
  id: string;
  title: string;
  container: 'solo' | 'witness' | 'practitioner';
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
  consentStatus: string;
  memoryPolicy: 'sealed' | 'learning';
  transcriptEnabled: boolean;
  participants: any[];
  summary: {
    short?: string;
    long?: string;
    themes?: string[];
    markerCounts?: Record<string, number>;
  } | null;
  duration: number;
}

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id as string;

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [transcript, setTranscript] = useState<TranscriptEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadSession() {
      if (!sessionId) return;
      try {
        const res = await apiFetch(`/api/scribe/sessions/${sessionId}`);
        const data = await res.json();
        setSession(data.session);
        setMarkers(data.markers || []);
        setTranscript(data.transcript);
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [sessionId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '--';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const containerLabel = (container: string) => {
    switch (container) {
      case 'witness': return 'Third Chair';
      case 'practitioner': return 'Practitioner';
      default: return 'Solo';
    }
  };

  const toggleMemoryPolicy = async () => {
    if (!session) return;
    const newPolicy = session.memoryPolicy === 'sealed' ? 'learning' : 'sealed';
    try {
      const res = await apiFetch(`/api/scribe/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memoryPolicy: newPolicy }),
      });
      if (res.ok) {
        setSession(prev => prev ? { ...prev, memoryPolicy: newPolicy } : null);
      }
    } catch (error) {
      console.error('Failed to update memory policy:', error);
    }
  };

  const deleteSession = async () => {
    if (!confirm('Are you sure you want to delete this session? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/scribe/sessions/${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/sessions');
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
      >
        <Loader2 className="w-6 h-6 text-stone-400 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
      >
        <p className="text-stone-500">Session not found</p>
      </div>
    );
  }

  const colors = containerColors[session.container] || containerColors.solo;

  return (
    <div
      className="min-h-screen pb-12"
      style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
    >
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/sessions')}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors text-[13px] tracking-wide"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Sessions</span>
          </button>
        </div>

        {/* Title Block */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
            <ContainerIcon container={session.container} className={`w-7 h-7 ${colors.text}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[11px] px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                {containerLabel(session.container)}
              </span>
              {session.memoryPolicy === 'sealed' && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Sealed
                </span>
              )}
            </div>
            <h1 className="text-xl font-light tracking-wide text-stone-800">{session.title}</h1>
            <p className="text-[13px] text-stone-500 mt-1">{formatDate(session.startedAt)}</p>
          </div>
        </div>

        {/* Meta Row */}
        <div className="flex items-center gap-4 mb-8 text-[13px] text-stone-500">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {formatDuration(session.duration)}
          </span>
          <span className="flex items-center gap-1.5">
            <Hash className="w-4 h-4" />
            {markers.length} markers
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => router.push(`/sessions/${sessionId}/discuss`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-800 text-white text-[13px] tracking-wide hover:bg-stone-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Discuss with MAIA
          </button>
          <button
            onClick={toggleMemoryPolicy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-stone-200 text-stone-600 text-[13px] tracking-wide hover:bg-white transition-colors"
          >
            {session.memoryPolicy === 'sealed' ? (
              <>
                <Unlock className="w-4 h-4" />
                Unseal
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Seal
              </>
            )}
          </button>
          <button
            onClick={deleteSession}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 text-[13px] tracking-wide hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>

        {/* Summary */}
        {session.summary && (
          <div className="bg-white/80 border border-stone-200/60 rounded-xl p-5 mb-6">
            <h2 className="text-[13px] font-medium text-stone-700 tracking-wide mb-3">Summary</h2>
            <p className="text-[14px] text-stone-600 leading-relaxed">
              {session.summary.short || session.summary.long || 'No summary available'}
            </p>
            {session.summary.themes && session.summary.themes.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {session.summary.themes.map((theme, i) => (
                  <span key={i} className="text-[11px] px-2 py-1 rounded-full bg-stone-100 text-stone-600">
                    {theme}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Markers */}
        <div className="bg-white/80 border border-stone-200/60 rounded-xl p-5 mb-6">
          <h2 className="text-[13px] font-medium text-stone-700 tracking-wide mb-4">
            Markers ({markers.length})
          </h2>
          {markers.length === 0 ? (
            <p className="text-[13px] text-stone-400">No markers recorded</p>
          ) : (
            <div className="space-y-3">
              {markers.filter(m => !['paused', 'resumed'].includes(m.type)).map((marker) => (
                <div key={marker.id} className="flex items-start gap-3">
                  <div className="w-16 text-[11px] text-stone-400 pt-0.5 flex-shrink-0">
                    {new Date(marker.markedAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="flex-1">
                    <span className={`inline-block text-[11px] px-2 py-0.5 rounded ${markerColors[marker.type] || 'bg-stone-100 text-stone-600'}`}>
                      {marker.type.replace(/_/g, ' ')}
                    </span>
                    {marker.note && (
                      <p className="text-[13px] text-stone-600 mt-1">{marker.note}</p>
                    )}
                    {marker.speaker && (
                      <p className="text-[11px] text-stone-400 mt-1">Speaker: {marker.speaker}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transcript */}
        {transcript && transcript.length > 0 && (
          <div className="bg-white/80 border border-stone-200/60 rounded-xl p-5">
            <h2 className="text-[13px] font-medium text-stone-700 tracking-wide mb-4">
              Transcript ({transcript.length} entries)
            </h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {transcript.map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-16 text-[11px] text-stone-400 pt-0.5 flex-shrink-0">
                    {new Date(entry.spokenAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wide">
                      {entry.speaker}
                    </span>
                    <p className="text-[13px] text-stone-600 mt-0.5">{entry.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
