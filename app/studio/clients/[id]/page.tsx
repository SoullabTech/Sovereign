'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  MessageSquare,
  Plus,
  Edit2,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mic,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { LeadershipProfileSection } from '@/components/studio/LeadershipProfileSection';
import { CaseMemoryTimeline } from '@/components/studio/CaseMemoryTimeline';
import { PatternLedgerEvolutionPanel } from '@/components/studio/PatternLedgerEvolutionPanel';
import { ClientNotesPanel } from '@/components/studio/ClientNotesPanel';
import { ClientContinuityPanel } from '@/components/studio/ClientContinuityPanel';
import type { LeadershipProfile } from '@/lib/studio/leadership/types';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  tier: string;
  tags: string[];
  lastSessionAt: string | null;
  nextSessionAt: string | null;
  totalSessions: number;
  internalNotes: string | null;
  birthDate: string | null;
  birthTime: string | null;
  birthLocation: string | null;
  leadershipProfile: LeadershipProfile | null;
  clientTypes: string[];
  createdAt: string;
}

interface Session {
  id: string;
  sessionType: string;
  modality: string | null;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  locationType: string;
  sessionNotes: string | null;
  followUpNotes: string | null;
  themes: string[];
  insights: string[];
  fee: number | null;
  paid: boolean;
  completedAt: string | null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400',
    inactive: 'bg-slate-500/20 text-slate-400',
    archived: 'bg-slate-700/50 text-slate-500',
    waitlist: 'bg-amber-500/20 text-amber-400',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${styles[status] || styles.inactive}`}>
      {status}
    </span>
  );
}

function SessionStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    case 'cancelled':
    case 'no_show':
      return <XCircle className="w-4 h-4 text-red-400" />;
    case 'scheduled':
    case 'confirmed':
      return <Clock className="w-4 h-4 text-amber-400" />;
    default:
      return <AlertCircle className="w-4 h-4 text-slate-400" />;
  }
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  // Bumped when a session note is carried forward, so Continuity refetches.
  const [continuityVersion, setContinuityVersion] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  async function fetchClient() {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/api/studio/clients/${clientId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch client');
      }

      setClient(data.client);
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load client');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/studio/caseload"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Caseload
          </Link>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">{error || 'Client not found'}</p>
            <button
              onClick={() => router.push('/studio/caseload')}
              className="mt-4 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Return to Caseload
            </button>
          </div>
        </div>
      </div>
    );
  }

  const upcomingSessions = sessions.filter(
    s => s.status === 'scheduled' || s.status === 'confirmed'
  );
  const pastSessions = sessions.filter(
    s => s.status !== 'scheduled' && s.status !== 'confirmed'
  );

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/studio/caseload"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Caseload
        </Link>

        {/* Client Header */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-medium text-slate-300">
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-light text-white">{client.name}</h1>
                <StatusPill status={client.status} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{client.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Client since {formatDate(client.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Edit client"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-800">
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Sessions</p>
              <p className="text-lg font-medium text-white">{client.totalSessions}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Last Session</p>
              <p className="text-lg font-medium text-white">{formatDate(client.lastSessionAt)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Next Session</p>
              <p className={`text-lg font-medium ${client.nextSessionAt ? 'text-amber-400' : 'text-slate-500'}`}>
                {formatDate(client.nextSessionAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Tier</p>
              <p className="text-lg font-medium text-white capitalize">{client.tier}</p>
            </div>
          </div>
        </div>

        {/* Leadership Profile */}
        {(client.clientTypes?.includes('leadership') || client.leadershipProfile) && (
          <div className="mb-6">
            <LeadershipProfileSection
              clientId={client.id}
              profile={client.leadershipProfile}
              onUpdate={(profile) => setClient(prev => prev ? { ...prev, leadershipProfile: profile } : null)}
            />
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column - Sessions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Link
                href={`/studio/session-room?caseId=${client.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-maia-navy-700 text-white rounded-xl hover:bg-maia-navy-600 transition-colors font-medium"
              >
                <Mic className="w-4 h-4" />
                Start Session
              </Link>
              <Link
                href={`/studio/sessions/new?clientId=${client.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Schedule Session
              </Link>
              <a
                href={`mailto:${client.email}`}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </a>
            </div>

            {/* Continuity — above the chronological record by ruling: the
                historical field serves the present encounter rather than
                defining the person arriving. */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
              <ClientContinuityPanel clientId={client.id} refreshKey={continuityVersion} />
            </div>

            {/* Practitioner Notes — the chronological session record */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
              <ClientNotesPanel
                clientId={client.id}
                onPromoted={() => setContinuityVersion((v) => v + 1)}
              />
            </div>

            {/* Case Memory Timeline */}
            <div>
              <h2 className="text-sm font-medium text-slate-400 mb-3">Case Memory Timeline</h2>
              <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
                <CaseMemoryTimeline caseId={client.id} />
              </div>
            </div>

            {/* Pattern Ledger */}
            <div>
              <h2 className="text-sm font-medium text-slate-400 mb-3">Pattern Ledger</h2>
              <PatternLedgerEvolutionPanel clientId={client.id} />
            </div>

            {/* Upcoming Sessions */}
            {upcomingSessions.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-slate-400 mb-3">Upcoming Sessions</h2>
                <div className="space-y-2">
                  {upcomingSessions.map(session => (
                    <div
                      key={session.id}
                      className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <SessionStatusIcon status={session.status} />
                          <span className="font-medium text-white">{session.sessionType}</span>
                        </div>
                        <span className="text-sm text-amber-400">{formatDateTime(session.scheduledAt)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>{session.durationMinutes} min</span>
                        <span className="capitalize">{session.locationType}</span>
                        {session.modality && <span>{session.modality}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Sessions */}
            <div>
              <h2 className="text-sm font-medium text-slate-400 mb-3">Session History</h2>
              {pastSessions.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
                  <p className="text-slate-500">No sessions yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pastSessions.map(session => (
                    <div
                      key={session.id}
                      className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <SessionStatusIcon status={session.status} />
                          <span className="font-medium text-white">{session.sessionType}</span>
                          <span className="text-xs text-slate-500 capitalize">{session.status}</span>
                        </div>
                        <span className="text-sm text-slate-400">{formatDateTime(session.scheduledAt)}</span>
                      </div>

                      {session.sessionNotes && (
                        <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                          {session.sessionNotes}
                        </p>
                      )}

                      {session.themes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {session.themes.map((theme, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500">
                        <span>{session.durationMinutes} min</span>
                        <span className="capitalize">{session.locationType}</span>
                        {session.fee && (
                          <span>
                            ${session.fee} {session.paid ? '(paid)' : '(unpaid)'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Internal Notes — legacy read-only field, shown only when it holds
                content. Practitioner Notes (main column) is the authoring surface;
                an empty card here would now be misleading rather than merely idle. */}
            {client.internalNotes && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Internal Notes</h3>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{client.internalNotes}</p>
              </div>
            )}

            {/* Birth Info */}
            {(client.birthDate || client.birthLocation) && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Birth Info</h3>
                <div className="space-y-2 text-sm">
                  {client.birthDate && (
                    <div>
                      <span className="text-slate-500">Date:</span>{' '}
                      <span className="text-slate-300">{formatDate(client.birthDate)}</span>
                    </div>
                  )}
                  {client.birthTime && (
                    <div>
                      <span className="text-slate-500">Time:</span>{' '}
                      <span className="text-slate-300">{client.birthTime}</span>
                    </div>
                  )}
                  {client.birthLocation && (
                    <div>
                      <span className="text-slate-500">Location:</span>{' '}
                      <span className="text-slate-300">{client.birthLocation}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {client.tags.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {client.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
