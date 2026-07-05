'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Radio,
  Clock,
  Users,
  Sparkles,
  Loader2,
  ChevronRight,
  Plus,
  FileText,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface EncounterSummary {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'complete';
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  transcription_status: string;
  participant_count: number;
  created_at: string;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusColors: Record<string, string> = {
  draft: 'bg-slate-700 text-slate-400',
  active: 'bg-amber-500/20 text-amber-300',
  complete: 'bg-emerald-500/20 text-emerald-300',
};

const transcriptionColors: Record<string, string> = {
  pending: 'text-slate-500',
  processing: 'text-amber-400',
  complete: 'text-emerald-400',
  failed: 'text-red-400',
};

export default function EncountersPage() {
  const router = useRouter();
  const [encounters, setEncounters] = useState<EncounterSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/studio/encounters')
      .then(r => r.json())
      .then(data => { if (data.encounters) setEncounters(data.encounters); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-white">Encounters</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Each encounter holds its transcript, moments, and your reflections in one place.
            </p>
          </div>
          <button
            onClick={() => router.push('/studio/session-room')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm hover:bg-amber-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            New encounter
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
          </div>
        ) : encounters.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-10 text-center">
            <Radio className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-300 font-medium">No encounters yet</p>
            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
              Encounters are created when you finish a session recording. Start a session in the Session Room to begin.
            </p>
            <button
              onClick={() => router.push('/studio/session-room')}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm hover:bg-amber-500/25 transition-all"
            >
              <Radio className="w-4 h-4" />
              Go to Session Room
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {encounters.map(enc => (
              <button
                key={enc.id}
                onClick={() => router.push(`/studio/encounters/${enc.id}`)}
                className="w-full text-left bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-white font-medium truncate">{enc.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[enc.status] ?? 'bg-slate-700 text-slate-400'}`}>
                        {enc.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{formatDate(enc.started_at ?? enc.created_at)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(enc.duration_seconds)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {enc.participant_count} participant{enc.participant_count !== 1 ? 's' : ''}
                      </span>
                      <span className={`flex items-center gap-1 ${transcriptionColors[enc.transcription_status] ?? 'text-slate-500'}`}>
                        <FileText className="w-3 h-3" />
                        {enc.transcription_status}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
