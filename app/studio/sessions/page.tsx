'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  Plus,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Camera,
} from 'lucide-react';
import { useBookings, Booking } from '@/hooks/useStudioData';
import { useRouter } from 'next/navigation';

type FilterType = 'upcoming' | 'today' | 'all';

const statusConfig = {
  scheduled: { label: 'scheduled', color: 'blue' },
  confirmed: { label: 'confirmed', color: 'emerald' },
  in_progress: { label: 'in progress', color: 'amber' },
  completed: { label: 'completed', color: 'slate' },
  cancelled: { label: 'cancelled', color: 'red' },
  no_show: { label: 'no show', color: 'red' },
};

const syncStatusConfig = {
  synced: { icon: CheckCircle2, label: 'Calendar synced', color: 'emerald' },
  pending: { icon: RefreshCw, label: 'Syncing...', color: 'amber' },
  failed: { icon: AlertCircle, label: 'Sync failed', color: 'red' },
  not_connected: { icon: AlertCircle, label: 'Calendar not connected', color: 'slate' },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateGroup(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function SessionsPage() {
  const router = useRouter();
  const { bookings, loading, error, refetch } = useBookings();
  const [filter, setFilter] = useState<FilterType>('upcoming');

  // Start video call for a session
  const startVideoCall = (booking: Booking) => {
    // Navigate to camera page with session context
    const params = new URLSearchParams({
      sessionId: booking.id,
      client: booking.clientName || 'Client',
    });
    router.push(`/studio/camera?${params.toString()}`);
  };

  // Build API params for each filter type
  const getFilterParams = useCallback((f: FilterType) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (f) {
      case 'today':
        // Today only: from start of day to end of day (UTC)
        return {
          from: today.toISOString(),
          to: tomorrow.toISOString(),
        };
      case 'all':
        // All sessions: go back 90 days for history
        const past90Days = new Date(now);
        past90Days.setDate(past90Days.getDate() - 90);
        return {
          from: past90Days.toISOString(),
          limit: 100,
        };
      case 'upcoming':
      default:
        // Upcoming: from now (API default, no from needed)
        return {};
    }
  }, []);

  // Refetch when filter changes
  useEffect(() => {
    refetch(getFilterParams(filter));
  }, [filter, refetch, getFilterParams]);

  // Client-side filtering for finer control (e.g., excluding cancelled from 'upcoming')
  const filteredBookings = useMemo(() => {
    if (filter === 'upcoming') {
      // Exclude completed/cancelled/no_show from upcoming view
      return bookings.filter(b => !['cancelled', 'no_show', 'completed'].includes(b.status));
    }
    return bookings;
  }, [bookings, filter]);

  // Group bookings by date
  const groupedBookings = useMemo(() => {
    return filteredBookings.reduce((groups, booking) => {
      const dateKey = new Date(booking.startAt).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = {
          label: formatDateGroup(booking.startAt),
          bookings: [],
        };
      }
      groups[dateKey].bookings.push(booking);
      return groups;
    }, {} as Record<string, { label: string; bookings: Booking[] }>);
  }, [filteredBookings]);

  const upcomingCount = bookings.filter(b =>
    !['cancelled', 'no_show', 'completed'].includes(b.status)
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-400" />
            Sessions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {upcomingCount} upcoming
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch(getFilterParams(filter))}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href="/studio/sessions/new"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Book Session
          </a>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-6 mb-6 border-b border-slate-800/50">
        {(['upcoming', 'today', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              pb-3 text-sm font-medium transition-colors relative
              ${filter === f ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}
            `}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {filter === f && (
              <motion.div
                layoutId="filter-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
              />
            )}
          </button>
        ))}
      </div>

      {/* Sessions by Date Group */}
      <div className="space-y-6">
        {Object.entries(groupedBookings).map(([dateKey, { label, bookings: dateBookings }]) => (
          <div key={dateKey}>
            <h2 className="text-sm text-slate-500 mb-3">{label}</h2>
            <div className="space-y-3">
              <AnimatePresence>
                {dateBookings.map((booking) => {
                  const status = statusConfig[booking.status] || statusConfig.scheduled;
                  const syncStatus = booking.calendarSyncStatus
                    ? syncStatusConfig[booking.calendarSyncStatus]
                    : null;
                  const SyncIcon = syncStatus?.icon;

                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 hover:border-slate-700/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Client Name & Status */}
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-white font-medium">
                              {booking.clientName || 'Unknown Client'}
                            </h3>
                            <span className={`
                              px-2 py-0.5 text-xs rounded-full flex items-center gap-1
                              ${status.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                              ${status.color === 'blue' ? 'bg-blue-500/20 text-blue-400' : ''}
                              ${status.color === 'amber' ? 'bg-amber-500/20 text-amber-400' : ''}
                              ${status.color === 'slate' ? 'bg-slate-700 text-slate-400' : ''}
                              ${status.color === 'red' ? 'bg-red-500/20 text-red-400' : ''}
                            `}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current" />
                              {status.label}
                            </span>
                          </div>

                          {/* Service Name */}
                          <p className="text-slate-400 text-sm mb-2">
                            {booking.serviceName || 'Session'}
                          </p>

                          {/* Date/Time Row */}
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(booking.startAt)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTime(booking.startAt)}
                            </span>
                            {booking.durationMinutes && (
                              <span>{booking.durationMinutes} min</span>
                            )}
                          </div>

                          {/* Calendar Sync Status */}
                          {syncStatus && SyncIcon && (
                            <div className={`mt-2 flex items-center gap-1.5 text-xs ${
                              syncStatus.color === 'emerald' ? 'text-emerald-400' :
                              syncStatus.color === 'amber' ? 'text-amber-400' :
                              syncStatus.color === 'red' ? 'text-red-400' :
                              'text-slate-500'
                            }`}>
                              <SyncIcon className={`w-3 h-3 ${
                                booking.calendarSyncStatus === 'pending' ? 'animate-spin' : ''
                              }`} />
                              {syncStatus.label}
                              {booking.calendarSyncError && (
                                <span className="text-slate-600 ml-1">
                                  ({booking.calendarSyncError})
                                </span>
                              )}
                            </div>
                          )}

                          {/* Notes */}
                          {booking.notes && (
                            <div className="mt-3 p-3 bg-slate-800/30 rounded-lg">
                              <p className="text-sm text-slate-300">{booking.notes}</p>
                            </div>
                          )}

                          {/* Client Email */}
                          {booking.clientEmail && (
                            <div className="mt-2 text-xs text-slate-500">
                              {booking.clientEmail}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {/* Start Video Call - only show for active sessions */}
                          {!['completed', 'cancelled', 'no_show'].includes(booking.status) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startVideoCall(booking);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 transition-colors text-sm"
                            >
                              <Camera className="w-4 h-4" />
                              <span className="hidden sm:inline">Start Call</span>
                            </button>
                          )}
                          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && !loading && (
        <div className="text-center py-12 text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <div className="text-lg">No sessions {filter === 'today' ? 'today' : filter === 'upcoming' ? 'upcoming' : ''}</div>
          <div className="text-sm mt-1">
            {filter === 'upcoming' ? 'Book a session to get started' : 'Check other filters or book a new session'}
          </div>
        </div>
      )}
    </div>
  );
}
