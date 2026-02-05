'use client';

/**
 * Session Detail Page
 * View and manage a single session
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';

interface Session {
  id: string;
  containerId: string;
  containerScope: string | null;
  containerType: string;
  sessionType: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  status: string;
  location: string;
  createdAt: string;
}

interface Note {
  id: string;
  visibility: string;
  content: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-300 border-green-500/30',
  cancelled: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  no_show: 'bg-red-500/20 text-red-300 border-red-500/30',
};

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return {
    date: date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    time: date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  };
}

function formatDuration(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const minutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  return `${minutes} minutes`;
}

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await apiFetch(`/api/practitioner/sessions/${sessionId}`);
        if (!res.ok) {
          if (res.status === 404) {
            router.push('/practitioner/dashboard');
            return;
          }
          throw new Error('Failed to load session');
        }
        const data = await res.json();
        setSession(data.session);
        setNotes(data.notes || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session');
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, [sessionId, router]);

  const updateStatus = async (newStatus: string) => {
    if (!session) return;
    setIsUpdating(true);
    try {
      const res = await apiFetch(`/api/practitioner/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setSession({ ...session, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
            <div className="h-32 bg-gray-800 rounded mb-6" />
            <div className="h-64 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error || 'Session not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { date, time } = formatDateTime(session.scheduledStartAt);
  const endTime = formatDateTime(session.scheduledEndAt).time;
  const isPast = new Date(session.scheduledEndAt) < new Date();

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-medium text-white">
              {session.containerScope || 'Session'}
            </h1>
            <p className="text-sm text-gray-500">{session.sessionType} session</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm border ${STATUS_COLORS[session.status] || STATUS_COLORS.scheduled}`}>
            {STATUS_LABELS[session.status] || session.status}
          </span>
        </header>

        {/* Session Details Card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Date</p>
              <p className="text-white">{date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Time</p>
              <p className="text-white">{time} - {endTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Duration</p>
              <p className="text-white">{formatDuration(session.scheduledStartAt, session.scheduledEndAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Location</p>
              <p className="text-white capitalize">{session.location.replace('_', ' ')}</p>
            </div>
          </div>

          {/* Container Link */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <button
              onClick={() => router.push(`/practitioner/containers/${session.containerId}`)}
              className="text-amber-500 hover:text-amber-400 text-sm flex items-center gap-2"
            >
              View Container
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status Actions */}
        {session.status === 'scheduled' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">
              Update Status
            </h2>
            <div className="flex flex-wrap gap-3">
              {isPast && (
                <>
                  <button
                    onClick={() => updateStatus('completed')}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700
                             text-white rounded-lg transition-colors"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => updateStatus('no_show')}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-700
                             text-white rounded-lg transition-colors"
                  >
                    No Show
                  </button>
                </>
              )}
              <button
                onClick={() => updateStatus('cancelled')}
                disabled={isUpdating}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800
                         text-gray-300 rounded-lg transition-colors"
              >
                Cancel Session
              </button>
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
              Session Notes
            </h2>
            <button
              className="text-amber-500 hover:text-amber-400 text-sm"
              onClick={() => {/* TODO: Add note modal */}}
            >
              + Add Note
            </button>
          </div>

          {notes.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No notes yet</p>
          ) : (
            <div className="space-y-4">
              {notes.map(note => (
                <div key={note.id} className="border-l-2 border-gray-600 pl-4">
                  <p className="text-gray-300 whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(note.createdAt).toLocaleString()} - {note.visibility}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
