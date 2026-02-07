'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  Phone,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { VoiceNotePanel } from '@/components/studio/VoiceNotePanel';
import { SessionBriefingCard } from '@/components/studio/SessionBriefingCard';

interface SessionDetail {
  id: string;
  scheduled_start: string;
  scheduled_end: string;
  status: string;
  location_type: string;
  location_details: string | null;
  notes: string | null;
  practitioner_notes: string | null;
  price_cents: number | null;
  payment_status: string;
  client_id: string | null;
  client_name: string | null;
  client_email: string | null;
  service_name: string | null;
  google_event_id: string | null;
  calendar_sync_status: string | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Scheduled', color: 'blue' },
  confirmed: { label: 'Confirmed', color: 'emerald' },
  in_progress: { label: 'In Progress', color: 'amber' },
  completed: { label: 'Completed', color: 'slate' },
  cancelled: { label: 'Cancelled', color: 'red' },
  no_show: { label: 'No Show', color: 'red' },
};

const locationIcons: Record<string, typeof Video> = {
  video: Video,
  phone: Phone,
  in_person: MapPin,
};

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDuration(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const mins = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

export default function SessionDetailPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await apiFetch(`/api/studio/sessions/${sessionId}`);
        if (!res.ok) {
          const json = await res.json().catch(() => null);
          throw new Error(json?.error || 'Failed to load session');
        }
        const json = await res.json();
        setSession(json.session || json);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load session');
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error || 'Session not found'}
        </div>
      </div>
    );
  }

  const status = statusConfig[session.status] || statusConfig.scheduled;
  const LocationIcon = locationIcons[session.location_type] || MapPin;

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sessions
        </button>

        {session.status === 'confirmed' && session.location_type === 'video' && (
          <button
            onClick={() => router.push(`/studio/camera?sessionId=${session.id}&client=${encodeURIComponent(session.client_name || 'Client')}`)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors text-sm font-medium"
          >
            <Camera className="w-4 h-4" />
            Start Video Call
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Header Card */}
          <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-semibold text-white mb-1">
                  {session.client_name || 'Unknown Client'}
                </h1>
                <p className="text-slate-400">{session.service_name || 'Session'}</p>
              </div>
              <span className={`
                px-3 py-1 text-sm rounded-full flex items-center gap-1.5
                ${status.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                ${status.color === 'blue' ? 'bg-blue-500/20 text-blue-400' : ''}
                ${status.color === 'amber' ? 'bg-amber-500/20 text-amber-400' : ''}
                ${status.color === 'slate' ? 'bg-slate-700 text-slate-400' : ''}
                ${status.color === 'red' ? 'bg-red-500/20 text-red-400' : ''}
              `}>
                <span className="w-2 h-2 rounded-full bg-current" />
                {status.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3 text-slate-300">
                <Calendar className="w-4 h-4 text-slate-500" />
                {formatDateTime(session.scheduled_start)}
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Clock className="w-4 h-4 text-slate-500" />
                {formatTime(session.scheduled_start)} - {formatTime(session.scheduled_end)}
                <span className="text-slate-500">
                  ({formatDuration(session.scheduled_start, session.scheduled_end)})
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <LocationIcon className="w-4 h-4 text-slate-500" />
                <span className="capitalize">{session.location_type.replace('_', ' ')}</span>
                {session.location_details && (
                  <span className="text-slate-500">• {session.location_details}</span>
                )}
              </div>
              {session.client_email && (
                <div className="flex items-center gap-3 text-slate-300">
                  <User className="w-4 h-4 text-slate-500" />
                  {session.client_email}
                </div>
              )}
            </div>

            {/* Calendar Sync Status */}
            {session.calendar_sync_status && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className={`flex items-center gap-2 text-xs ${
                  session.calendar_sync_status === 'synced' ? 'text-emerald-400' :
                  session.calendar_sync_status === 'failed' ? 'text-red-400' :
                  'text-slate-500'
                }`}>
                  {session.calendar_sync_status === 'synced' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  {session.calendar_sync_status === 'synced' ? 'Synced to Google Calendar' :
                   session.calendar_sync_status === 'failed' ? 'Calendar sync failed' :
                   'Calendar sync pending'}
                </div>
              </div>
            )}
          </div>

          {/* Notes Section */}
          {(session.notes || session.practitioner_notes) && (
            <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-6">
              <h2 className="flex items-center gap-2 text-sm font-medium text-white mb-4">
                <FileText className="w-4 h-4 text-slate-400" />
                Notes
              </h2>

              {session.notes && (
                <div className="mb-4">
                  <div className="text-xs text-slate-500 mb-1">Client Notes</div>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">
                    {session.notes}
                  </p>
                </div>
              )}

              {session.practitioner_notes && (
                <div>
                  <div className="text-xs text-slate-500 mb-1">Practitioner Notes</div>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">
                    {session.practitioner_notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Voice Notes Panel — always open on detail page */}
          <VoiceNotePanel
            sessionId={sessionId}
            clientName={session.client_name || null}
            isOpen={true}
            onClose={() => {}}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pre-Session Briefing */}
          {session.client_id && (
            <SessionBriefingCard sessionId={sessionId} />
          )}

          {/* Payment Info */}
          {session.price_cents !== null && (
            <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-white mb-3">Payment</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-light text-white">
                  ${(session.price_cents / 100).toFixed(2)}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  session.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                  session.payment_status === 'waived' ? 'bg-slate-700 text-slate-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {session.payment_status}
                </span>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white mb-3">Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-sm text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors text-left">
                Edit Session
              </button>
              <button className="w-full px-4 py-2 text-sm text-slate-300 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors text-left">
                Send Reminder
              </button>
              {session.status !== 'completed' && session.status !== 'cancelled' && (
                <button className="w-full px-4 py-2 text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors text-left">
                  Cancel Session
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
