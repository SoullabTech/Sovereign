"use client";

/**
 * PRACTITIONER SESSIONS PAGE
 *
 * The session ledger - past and upcoming appointments
 * Each session is a container for the ongoing work
 *
 * Features:
 * - Calendar view (month/week/list)
 * - Send reminders via SMS and Email
 * - Quick status updates
 * - Session prep links
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  Plus,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Grid3X3,
  List,
  Mail,
  MessageSquare,
  Phone,
  Video,
  MapPin,
  Send,
  Bell,
  MoreVertical,
  X,
  Check,
} from 'lucide-react';
import { usePractitionerAuth } from '@/lib/auth/practitionerAuth';
import type { PractitionerSession, SessionStatus } from '@/lib/stellium/types';

const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  gold: '#E5C158',
  violet: '#B8A5D9',
  starlight: '#FFFFFF',
  muted: '#C8BDE0',
  dim: '#9A8FB8',
  success: '#8FB89A',
  warning: '#E5A858',
  error: '#D98B8B',
};

const isDev = process.env.NODE_ENV === 'development' ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost');

// Mock sessions for development
const DEV_MOCK_SESSIONS: PractitionerSession[] = [
  {
    id: 'session-1',
    practitioner_id: 'dev-practitioner',
    client_id: 'client-1',
    session_type: 'natal_reading',
    status: 'scheduled',
    scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 60,
    location_type: 'video',
    follow_up_sent: false,
    paid: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client: {
      id: 'client-1',
      practitioner_id: 'dev-practitioner',
      name: 'Sarah Martinez',
      preferred_name: 'Sarah',
      status: 'active',
      total_sessions: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'session-2',
    practitioner_id: 'dev-practitioner',
    client_id: 'client-2',
    session_type: 'transit_reading',
    status: 'scheduled',
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 45,
    location_type: 'video',
    follow_up_sent: false,
    paid: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client: {
      id: 'client-2',
      practitioner_id: 'dev-practitioner',
      name: 'James Kendrick',
      preferred_name: 'James',
      status: 'active',
      total_sessions: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'session-3',
    practitioner_id: 'dev-practitioner',
    client_id: 'client-3',
    session_type: 'solar_return',
    status: 'completed',
    scheduled_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 90,
    location_type: 'video',
    follow_up_sent: true,
    paid: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client: {
      id: 'client-3',
      practitioner_id: 'dev-practitioner',
      name: 'Lisa Park',
      preferred_name: 'Lisa',
      status: 'active',
      total_sessions: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

type FilterStatus = 'all' | 'upcoming' | 'completed' | 'cancelled';
type ViewMode = 'list' | 'month' | 'week';

// Calendar helpers
function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

function getWeekDays(date: Date): Date[] {
  const days: Date[] = [];
  const dayOfWeek = date.getDay();
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - dayOfWeek);

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }

  return days;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

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

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4" style={{ color: colors.success }} />;
    case 'cancelled':
    case 'no_show':
      return <XCircle className="w-4 h-4" style={{ color: colors.error }} />;
    case 'scheduled':
    case 'confirmed':
      return <Clock className="w-4 h-4" style={{ color: colors.gold }} />;
    default:
      return <AlertCircle className="w-4 h-4" style={{ color: colors.warning }} />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return colors.success;
    case 'cancelled':
    case 'no_show':
      return colors.error;
    case 'scheduled':
    case 'confirmed':
      return colors.gold;
    default:
      return colors.warning;
  }
}

// Send Reminder Modal
interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: PractitionerSession;
  onSend: (method: 'email' | 'sms' | 'both') => Promise<void>;
}

function ReminderModal({ isOpen, onClose, session, onSend }: ReminderModalProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const clientName = session.client?.preferred_name || session.client?.name || 'Client';
  const hasEmail = !!session.client?.email;
  const hasPhone = !!session.client?.phone;

  const handleSend = async (method: 'email' | 'sms' | 'both') => {
    setSending(true);
    try {
      await onSend(method);
      setSent(method);
      setTimeout(() => {
        onClose();
        setSent(null);
      }, 1500);
    } catch (err) {
      console.error('Failed to send reminder:', err);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-xl p-6"
        style={{ backgroundColor: colors.nebula, border: `1px solid ${colors.stardust}` }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${colors.gold}20` }}
            >
              <Bell className="w-5 h-5" style={{ color: colors.gold }} />
            </div>
            <div>
              <h3 className="font-medium" style={{ color: colors.starlight }}>Send Reminder</h3>
              <p className="text-sm" style={{ color: colors.dim }}>to {clientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
            <X className="w-5 h-5" style={{ color: colors.dim }} />
          </button>
        </div>

        {/* Session Summary */}
        <div
          className="rounded-lg p-3 mb-4"
          style={{ backgroundColor: `${colors.stardust}60` }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4" style={{ color: colors.dim }} />
            <span className="text-sm" style={{ color: colors.muted }}>
              {session.scheduled_at && new Date(session.scheduled_at).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" style={{ color: colors.dim }} />
            <span className="text-sm" style={{ color: colors.muted }}>
              {session.scheduled_at && formatTime(session.scheduled_at)} · {session.duration_minutes} min
            </span>
          </div>
        </div>

        {sent ? (
          <div className="flex items-center justify-center space-x-2 py-4">
            <Check className="w-5 h-5" style={{ color: colors.success }} />
            <span style={{ color: colors.success }}>Reminder sent!</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Email Option */}
            <button
              onClick={() => handleSend('email')}
              disabled={!hasEmail || sending}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
              style={{
                backgroundColor: hasEmail ? `${colors.gold}15` : colors.stardust,
                border: `1px solid ${hasEmail ? colors.gold : colors.dim}40`,
              }}
            >
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5" style={{ color: hasEmail ? colors.gold : colors.dim }} />
                <div className="text-left">
                  <p className="text-sm font-medium" style={{ color: hasEmail ? colors.starlight : colors.dim }}>
                    Send Email
                  </p>
                  <p className="text-xs" style={{ color: colors.dim }}>
                    {hasEmail ? session.client?.email : 'No email on file'}
                  </p>
                </div>
              </div>
              {hasEmail && <Send className="w-4 h-4" style={{ color: colors.gold }} />}
            </button>

            {/* SMS Option */}
            <button
              onClick={() => handleSend('sms')}
              disabled={!hasPhone || sending}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
              style={{
                backgroundColor: hasPhone ? `${colors.violet}15` : colors.stardust,
                border: `1px solid ${hasPhone ? colors.violet : colors.dim}40`,
              }}
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5" style={{ color: hasPhone ? colors.violet : colors.dim }} />
                <div className="text-left">
                  <p className="text-sm font-medium" style={{ color: hasPhone ? colors.starlight : colors.dim }}>
                    Send SMS
                  </p>
                  <p className="text-xs" style={{ color: colors.dim }}>
                    {hasPhone ? session.client?.phone : 'No phone on file'}
                  </p>
                </div>
              </div>
              {hasPhone && <Send className="w-4 h-4" style={{ color: colors.violet }} />}
            </button>

            {/* Both Option */}
            {hasEmail && hasPhone && (
              <button
                onClick={() => handleSend('both')}
                disabled={sending}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors"
                style={{ backgroundColor: colors.gold, color: colors.void }}
              >
                <Send className="w-4 h-4" />
                <span className="font-medium">Send Both</span>
              </button>
            )}
          </div>
        )}

        {sending && (
          <div className="flex items-center justify-center mt-4">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: colors.gold }} />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

interface SessionRowProps {
  session: PractitionerSession;
  onClick: () => void;
  onSendReminder: () => void;
}

function SessionRow({ session, onClick, onSendReminder }: SessionRowProps) {
  const isUpcoming = session.scheduled_at && new Date(session.scheduled_at) > new Date();
  const clientName = session.client?.preferred_name || session.client?.name || 'Client';
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="transition-colors hover:bg-white/5"
      style={{ borderBottom: `1px solid ${colors.stardust}` }}
    >
      <td className="px-4 py-4 cursor-pointer" onClick={onClick}>
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
            style={{
              background: `linear-gradient(135deg, ${colors.gold}30 0%, ${colors.violet}30 100%)`,
              color: colors.gold,
            }}
          >
            {clientName[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium" style={{ color: colors.starlight }}>
              {clientName}
            </p>
            <p className="text-sm" style={{ color: colors.dim }}>
              {session.session_type.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 cursor-pointer" onClick={onClick}>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" style={{ color: colors.dim }} />
          <span style={{ color: colors.muted }}>
            {session.scheduled_at ? formatDate(session.scheduled_at) : 'Not scheduled'}
          </span>
        </div>
        {session.scheduled_at && (
          <div className="flex items-center space-x-2 mt-1">
            <Clock className="w-4 h-4" style={{ color: colors.dim }} />
            <span className="text-sm" style={{ color: colors.dim }}>
              {formatTime(session.scheduled_at)} · {session.duration_minutes} min
            </span>
          </div>
        )}
      </td>
      <td className="px-4 py-4 cursor-pointer" onClick={onClick}>
        <div className="flex items-center space-x-2">
          {getStatusIcon(session.status)}
          <span
            className="text-sm capitalize"
            style={{ color: getStatusColor(session.status) }}
          >
            {session.status.replace(/_/g, ' ')}
          </span>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end space-x-2">
          {/* Send Reminder Button */}
          {isUpcoming && ['scheduled', 'confirmed'].includes(session.status) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSendReminder();
              }}
              className="flex items-center space-x-1 px-2 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/10"
              style={{ color: colors.gold }}
              title="Send Reminder"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Remind</span>
            </button>
          )}
          <button
            onClick={onClick}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5" style={{ color: colors.dim }} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

export default function SessionsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { practitionerId, isLoading: authLoading } = usePractitionerAuth();

  const [sessions, setSessions] = useState<PractitionerSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reminderSession, setReminderSession] = useState<PractitionerSession | null>(null);

  const basePath = `/portal/${slug}/admin`;

  useEffect(() => {
    if (authLoading) return;

    if (!practitionerId) {
      setError('Session not found. Please sign in again.');
      setLoading(false);
      return;
    }

    fetchSessions();
  }, [practitionerId, authLoading]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stellium/sessions/list?practitionerId=${practitionerId}`);
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('[Sessions] Error:', err);
      if (isDev) {
        console.log('[Sessions] Using mock data for development');
        setSessions(DEV_MOCK_SESSIONS);
      } else {
        setError('Failed to load sessions');
      }
    } finally {
      setLoading(false);
    }
  };

  // Send reminder function
  const sendReminder = async (session: PractitionerSession, method: 'email' | 'sms' | 'both') => {
    const clientName = session.client?.preferred_name || session.client?.name || 'Client';
    const sessionDate = session.scheduled_at
      ? new Date(session.scheduled_at).toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric'
        })
      : 'your upcoming session';
    const sessionTime = session.scheduled_at ? formatTime(session.scheduled_at) : '';

    const message = `Hi ${clientName}, this is a reminder for your ${session.session_type.replace(/_/g, ' ')} session on ${sessionDate} at ${sessionTime}. Looking forward to seeing you!`;

    try {
      if (method === 'email' || method === 'both') {
        await fetch('/api/notifications/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: session.client?.email,
            subject: `Session Reminder - ${sessionDate}`,
            body: message,
            practitionerId,
          }),
        });
      }

      if (method === 'sms' || method === 'both') {
        await fetch('/api/notifications/sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: session.client?.phone,
            message,
            practitionerId,
          }),
        });
      }

      // In dev mode, just log
      if (isDev) {
        console.log(`[Sessions] Reminder sent via ${method}:`, message);
      }
    } catch (err) {
      console.error('[Sessions] Failed to send reminder:', err);
      throw err;
    }
  };

  // Calendar navigation
  const navigateMonth = (delta: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const navigateWeek = (delta: number) => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + delta * 7);
      return next;
    });
  };

  // Get sessions for a specific day
  const getSessionsForDay = (date: Date) => {
    return filteredSessions.filter(s => {
      if (!s.scheduled_at) return false;
      return isSameDay(new Date(s.scheduled_at), date);
    });
  };

  // Filter and search sessions
  const filteredSessions = sessions.filter(session => {
    // Status filter
    if (filter === 'upcoming') {
      if (!['scheduled', 'confirmed'].includes(session.status)) return false;
      if (session.scheduled_at && new Date(session.scheduled_at) < new Date()) return false;
    }
    if (filter === 'completed' && session.status !== 'completed') return false;
    if (filter === 'cancelled' && !['cancelled', 'no_show'].includes(session.status)) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const clientName = (session.client?.preferred_name || session.client?.name || '').toLowerCase();
      const sessionType = session.session_type.toLowerCase();
      if (!clientName.includes(query) && !sessionType.includes(query)) return false;
    }

    return true;
  });

  // Group sessions by date
  const groupedSessions: Record<string, PractitionerSession[]> = {};
  for (const session of filteredSessions) {
    const dateKey = session.scheduled_at
      ? new Date(session.scheduled_at).toDateString()
      : 'Unscheduled';
    if (!groupedSessions[dateKey]) {
      groupedSessions[dateKey] = [];
    }
    groupedSessions[dateKey].push(session);
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: `${colors.nebula}50` }} />
        <div className="h-12 rounded-lg" style={{ backgroundColor: `${colors.nebula}50` }} />
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 rounded-lg" style={{ backgroundColor: `${colors.nebula}50` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ backgroundColor: `${colors.error}20`, border: `1px solid ${colors.error}40` }}
      >
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: colors.error }} />
        <p style={{ color: colors.error }}>{error}</p>
        <button
          onClick={fetchSessions}
          className="mt-4 px-4 py-2 rounded-lg"
          style={{ backgroundColor: colors.gold, color: colors.void }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1
            className="text-2xl lg:text-3xl font-display"
            style={{ color: colors.starlight }}
          >
            Sessions
          </h1>
          <p className="mt-1" style={{ color: colors.muted }}>
            Manage your client sessions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg" style={{ backgroundColor: colors.stardust }}>
            <button
              onClick={() => setViewMode('list')}
              className="px-3 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: viewMode === 'list' ? colors.gold : 'transparent',
                color: viewMode === 'list' ? colors.void : colors.muted,
              }}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('month')}
              className="px-3 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: viewMode === 'month' ? colors.gold : 'transparent',
                color: viewMode === 'month' ? colors.void : colors.muted,
              }}
              title="Month View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('week')}
              className="px-3 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: viewMode === 'week' ? colors.gold : 'transparent',
                color: viewMode === 'week' ? colors.void : colors.muted,
              }}
              title="Week View"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => router.push(`${basePath}/sessions/new`)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: colors.gold, color: colors.void }}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Session</span>
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: colors.dim }}
          />
          <input
            type="text"
            placeholder="Search by client or session type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none transition-colors"
            style={{
              backgroundColor: `${colors.nebula}80`,
              borderColor: colors.stardust,
              color: colors.starlight,
            }}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5" style={{ color: colors.dim }} />
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: colors.stardust }}>
            {(['all', 'upcoming', 'completed', 'cancelled'] as FilterStatus[]).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className="px-3 py-2 text-sm capitalize transition-colors"
                style={{
                  backgroundColor: filter === status ? `${colors.gold}20` : 'transparent',
                  color: filter === status ? colors.gold : colors.muted,
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Calendar Navigation (for month/week views) */}
      {(viewMode === 'month' || viewMode === 'week') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between"
        >
          <button
            onClick={() => viewMode === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: colors.muted }} />
          </button>
          <h2 className="text-lg font-medium" style={{ color: colors.starlight }}>
            {viewMode === 'month'
              ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              : `Week of ${getWeekDays(currentDate)[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            }
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/10"
              style={{ color: colors.muted }}
            >
              Today
            </button>
            <button
              onClick={() => viewMode === 'month' ? navigateMonth(1) : navigateWeek(1)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5" style={{ color: colors.muted }} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
        >
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b" style={{ borderColor: colors.stardust }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-medium" style={{ color: colors.dim }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth()).map((date, i) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(date, new Date());
              const daySessions = getSessionsForDay(date);

              return (
                <div
                  key={i}
                  onClick={() => router.push(`${basePath}/sessions/new?date=${date.toISOString().split('T')[0]}`)}
                  className="min-h-[100px] p-2 border-b border-r cursor-pointer transition-colors hover:bg-white/5"
                  style={{
                    borderColor: `${colors.stardust}60`,
                    backgroundColor: isToday ? `${colors.gold}10` : undefined,
                  }}
                >
                  <div
                    className={`text-sm mb-1 ${isToday ? 'w-6 h-6 rounded-full flex items-center justify-center' : ''}`}
                    style={{
                      color: isCurrentMonth ? colors.starlight : colors.dim,
                      backgroundColor: isToday ? colors.gold : undefined,
                    }}
                  >
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {daySessions.slice(0, 3).map(session => (
                      <div
                        key={session.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`${basePath}/stellium/session/${session.id}`);
                        }}
                        className="px-1.5 py-0.5 rounded text-xs truncate cursor-pointer"
                        style={{
                          backgroundColor: `${getStatusColor(session.status)}20`,
                          borderLeft: `2px solid ${getStatusColor(session.status)}`,
                          color: colors.starlight,
                        }}
                      >
                        {session.scheduled_at && formatTime(session.scheduled_at)} {session.client?.preferred_name || session.client?.name}
                      </div>
                    ))}
                    {daySessions.length > 3 && (
                      <div className="text-xs px-1.5" style={{ color: colors.dim }}>
                        +{daySessions.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
        >
          <div className="grid grid-cols-7">
            {getWeekDays(currentDate).map((date, i) => {
              const isToday = isSameDay(date, new Date());
              const daySessions = getSessionsForDay(date);

              return (
                <div
                  key={i}
                  className="min-h-[300px] border-r last:border-r-0"
                  style={{ borderColor: `${colors.stardust}60` }}
                >
                  {/* Day Header */}
                  <div
                    className="p-3 text-center border-b"
                    style={{
                      borderColor: `${colors.stardust}60`,
                      backgroundColor: isToday ? `${colors.gold}10` : undefined,
                    }}
                  >
                    <div className="text-xs" style={{ color: colors.dim }}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div
                      className={`text-lg font-medium ${isToday ? 'w-8 h-8 rounded-full flex items-center justify-center mx-auto' : ''}`}
                      style={{
                        color: colors.starlight,
                        backgroundColor: isToday ? colors.gold : undefined,
                      }}
                    >
                      {date.getDate()}
                    </div>
                  </div>

                  {/* Sessions */}
                  <div className="p-2 space-y-2">
                    {daySessions.map(session => (
                      <div
                        key={session.id}
                        onClick={() => router.push(`${basePath}/stellium/session/${session.id}`)}
                        className="p-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
                        style={{
                          backgroundColor: `${getStatusColor(session.status)}15`,
                          borderLeft: `2px solid ${getStatusColor(session.status)}`,
                        }}
                      >
                        <div className="text-xs font-medium" style={{ color: colors.starlight }}>
                          {session.scheduled_at && formatTime(session.scheduled_at)}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: colors.muted }}>
                          {session.client?.preferred_name || session.client?.name}
                        </div>
                        <div className="text-xs mt-1" style={{ color: colors.dim }}>
                          {session.duration_minutes} min
                        </div>
                        {/* Quick Reminder Button */}
                        {['scheduled', 'confirmed'].includes(session.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReminderSession(session);
                            }}
                            className="mt-2 flex items-center space-x-1 text-xs px-2 py-1 rounded transition-colors hover:bg-white/10"
                            style={{ color: colors.gold }}
                          >
                            <Bell className="w-3 h-3" />
                            <span>Remind</span>
                          </button>
                        )}
                      </div>
                    ))}
                    {daySessions.length === 0 && (
                      <button
                        onClick={() => router.push(`${basePath}/sessions/new?date=${date.toISOString().split('T')[0]}`)}
                        className="w-full py-4 text-xs rounded-lg transition-colors hover:bg-white/5"
                        style={{ color: colors.dim }}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* List View (Table) */}
      {viewMode === 'list' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: `${colors.nebula}50`, borderColor: colors.stardust }}
        >
          {filteredSessions.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: colors.dim }} />
              <p className="text-lg font-medium" style={{ color: colors.starlight }}>
                No sessions found
              </p>
              <p className="mt-1" style={{ color: colors.muted }}>
                {searchQuery || filter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first session to get started'}
              </p>
              {!searchQuery && filter === 'all' && (
                <button
                  onClick={() => router.push(`${basePath}/sessions/new`)}
                  className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-lg"
                  style={{ backgroundColor: `${colors.gold}20`, color: colors.gold }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Schedule a Session</span>
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: `${colors.cosmos}80`, borderBottom: `1px solid ${colors.stardust}` }}>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: colors.muted }}>
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: colors.muted }}>
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: colors.muted }}>
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: colors.muted }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map(session => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    onClick={() => router.push(`${basePath}/stellium/session/${session.id}`)}
                    onSendReminder={() => setReminderSession(session)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      )}

      {/* Stats Footer */}
      <div className="flex items-center justify-between text-sm" style={{ color: colors.dim }}>
        <span>
          Showing {filteredSessions.length} of {sessions.length} sessions
        </span>
        {sessions.length > 0 && (
          <span>
            {sessions.filter(s => ['scheduled', 'confirmed'].includes(s.status)).length} upcoming
          </span>
        )}
      </div>

      {/* Reminder Modal */}
      <AnimatePresence>
        {reminderSession && (
          <ReminderModal
            isOpen={!!reminderSession}
            onClose={() => setReminderSession(null)}
            session={reminderSession}
            onSend={(method) => sendReminder(reminderSession, method)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
