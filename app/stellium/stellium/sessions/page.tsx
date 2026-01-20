"use client";

/**
 * STELLIUM SESSIONS PAGE
 *
 * Session management - containers for the ongoing work
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  Plus,
  Filter,
  ChevronDown,
  Clock,
  Loader2,
  Brain,
} from 'lucide-react';
import SessionCard from '@/components/stellium/SessionCard';
import { PractitionerSession, SessionStatus } from '@/lib/stellium/types';

type ViewMode = 'upcoming' | 'all' | 'needs_followup';

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<PractitionerSession[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('upcoming');

  // Filters (for 'all' mode)
  const [statusFilter, setStatusFilter] = useState<SessionStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const limit = 20;

  const [practitionerId, setPractitionerId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('beta_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setPractitionerId(user.id || user.memberId || 'demo-practitioner');
      } catch {
        setPractitionerId('demo-practitioner');
      }
    } else {
      setPractitionerId('demo-practitioner');
    }
  }, []);

  useEffect(() => {
    if (practitionerId) {
      fetchSessions();
    }
  }, [practitionerId, viewMode, statusFilter, page]);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        practitionerId: practitionerId!,
      });

      if (viewMode === 'upcoming') {
        params.set('upcoming', 'true');
        params.set('upcomingDays', '30');
      } else if (viewMode === 'needs_followup') {
        params.set('needsFollowUp', 'true');
      } else {
        params.set('limit', limit.toString());
        params.set('offset', (page * limit).toString());
        if (statusFilter) params.set('status', statusFilter);
      }

      const response = await fetch(`/api/stellium/sessions/list?${params}`);
      if (!response.ok) throw new Error('Failed to fetch sessions');

      const data = await response.json();
      setSessions(data.sessions);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const requestMaiaPrep = async (sessionId: string) => {
    try {
      const response = await fetch('/api/stellium/maia/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          sessionId,
        }),
      });

      if (response.ok) {
        // Refresh sessions to show prep status
        fetchSessions();
      }
    } catch (err) {
      console.error('Failed to request MAIA prep:', err);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const viewModes: Array<{ value: ViewMode; label: string; icon: React.ReactNode }> = [
    { value: 'upcoming', label: 'Upcoming', icon: <Clock className="w-4 h-4" /> },
    { value: 'all', label: 'All Sessions', icon: <Calendar className="w-4 h-4" /> },
    { value: 'needs_followup', label: 'Needs Follow-up', icon: <Brain className="w-4 h-4" /> },
  ];

  // Group upcoming sessions by date
  const groupedSessions = viewMode === 'upcoming'
    ? sessions.reduce((groups, session) => {
        if (!session.scheduled_at) return groups;
        const date = new Date(session.scheduled_at).toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });
        if (!groups[date]) groups[date] = [];
        groups[date].push(session);
        return groups;
      }, {} as Record<string, PractitionerSession[]>)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-gray-100">Sessions</h1>
          <p className="text-gray-500">
            {viewMode === 'upcoming'
              ? `${total} upcoming session${total !== 1 ? 's' : ''}`
              : viewMode === 'needs_followup'
              ? `${total} session${total !== 1 ? 's' : ''} need follow-up`
              : `${total} total session${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => router.push('/stellium/sessions/new')}
          className="flex items-center space-x-2 px-4 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Schedule Session</span>
        </button>
      </div>

      {/* View Mode Tabs */}
      <div className="flex space-x-2">
        {viewModes.map(mode => (
          <button
            key={mode.value}
            onClick={() => {
              setViewMode(mode.value);
              setPage(0);
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === mode.value
                ? 'bg-sacred-gold/20 text-sacred-gold border border-sacred-gold/30'
                : 'bg-gray-800/30 text-gray-400 hover:text-gray-200 border border-gray-700/30'
            }`}
          >
            {mode.icon}
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Filters for All mode */}
      {viewMode === 'all' && (
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  showFilters || statusFilter
                    ? 'bg-sacred-gold/10 border-sacred-gold/30 text-sacred-gold'
                    : 'border-gray-700 text-gray-400 hover:text-gray-200'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>

              {showFilters && (
                <select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value as SessionStatus | '');
                    setPage(0);
                  }}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200"
                >
                  <option value="">All statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-sacred-gold/50 animate-spin" />
        </div>
      ) : error ? (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-6 text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchSessions}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      ) : sessions.length === 0 ? (
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg text-gray-300 mb-2">
              {viewMode === 'upcoming'
                ? 'No upcoming sessions'
                : viewMode === 'needs_followup'
                ? 'All caught up!'
                : 'No sessions found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {viewMode === 'upcoming'
                ? 'Schedule your next session to get started'
                : viewMode === 'needs_followup'
                ? 'All follow-ups have been sent'
                : 'Try adjusting your filters'}
            </p>
            {viewMode === 'upcoming' && (
              <button
                onClick={() => router.push('/stellium/sessions/new')}
                className="px-4 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg"
              >
                Schedule Session
              </button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'upcoming' && groupedSessions ? (
        // Grouped view for upcoming
        <div className="space-y-6">
          {Object.entries(groupedSessions).map(([date, dateSessions]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-400 mb-3">{date}</h3>
              <div className="space-y-3">
                {dateSessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="relative">
                      <SessionCard
                        session={session}
                        variant="upcoming"
                        onClick={() => router.push(`/stellium/sessions/${session.id}`)}
                      />
                      {!session.maia_prep && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            requestMaiaPrep(session.id);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs rounded-lg transition-colors"
                        >
                          Request MAIA Prep
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List view for all/needs_followup
        <>
          <div className="space-y-3">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <SessionCard
                  session={session}
                  onClick={() => router.push(`/stellium/sessions/${session.id}`)}
                />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {viewMode === 'all' && totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:text-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:text-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
