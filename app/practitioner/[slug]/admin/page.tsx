"use client";

/**
 * PRACTITIONER ADMIN DASHBOARD
 *
 * Today's view - the sanctuary overview
 * "Ah. I know where I am."
 */

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  Clock,
  MessageSquare,
  FileText,
  ChevronRight,
  Star,
  AlertCircle,
} from 'lucide-react';
import { usePractitionerAuth } from '@/lib/auth/practitionerAuth';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { ClientCard } from '@/components/admin/ClientCard';
import type { PractitionerDashboard, PractitionerSession, PractitionerClient } from '@/lib/stellium/types';

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

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

interface SessionCardProps {
  session: PractitionerSession;
  onClick?: () => void;
}

function SessionCard({ session, onClick }: SessionCardProps) {
  const isToday = session.scheduled_at
    ? new Date(session.scheduled_at).toDateString() === new Date().toDateString()
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
      style={{
        backgroundColor: `${colors.nebula}80`,
        border: `1px solid ${isToday ? colors.gold : colors.stardust}40`,
      }}
    >
      <div className="flex items-center space-x-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${colors.gold}20 0%, ${colors.violet}20 100%)`,
          }}
        >
          <Calendar className="w-5 h-5" style={{ color: colors.gold }} />
        </div>
        <div>
          <h4 className="font-medium" style={{ color: colors.starlight }}>
            {session.client?.preferred_name || session.client?.name || 'Client'}
          </h4>
          <p className="text-sm" style={{ color: colors.muted }}>
            {session.session_type.replace(/_/g, ' ')}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <Clock className="w-3 h-3" style={{ color: colors.dim }} />
            <span className="text-xs" style={{ color: colors.dim }}>
              {session.scheduled_at ? formatTime(session.scheduled_at) : 'TBD'}
              {' · '}
              {session.duration_minutes} min
            </span>
          </div>
        </div>
      </div>
      <ChevronRight className="w-5 h-5" style={{ color: colors.dim }} />
    </motion.div>
  );
}

function QuickActionCard({
  icon,
  label,
  onClick,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-3 p-4 rounded-xl transition-all hover:scale-[1.02]"
      style={{
        backgroundColor: `${colors.nebula}80`,
        border: `1px solid ${colors.stardust}`,
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${colors.gold}20 0%, ${colors.violet}20 100%)`,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium" style={{ color: colors.starlight }}>
          {label}
        </p>
      </div>
      {count !== undefined && count > 0 && (
        <span
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${colors.gold}30`, color: colors.gold }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default function AdminDashboard() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { practitioner, practitionerId } = usePractitionerAuth();

  const [dashboard, setDashboard] = useState<PractitionerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (practitionerId) {
      fetchDashboard();
    }
  }, [practitionerId]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stellium/dashboard?practitionerId=${practitionerId}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      const data = await response.json();
      setDashboard(data.dashboard);
    } catch (err) {
      console.error('[Dashboard] Error:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const basePath = `/practitioner/${slug}/admin`;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: `${colors.nebula}50` }} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
          ))}
        </div>
        <div className="h-64 rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
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
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 rounded-lg"
          style={{ backgroundColor: colors.gold, color: colors.void }}
        >
          Try Again
        </button>
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todaysSessions = dashboard?.upcoming_sessions?.filter(s => {
    if (!s.scheduled_at) return false;
    return new Date(s.scheduled_at).toDateString() === new Date().toDateString();
  }) || [];

  const upcomingSessions = dashboard?.upcoming_sessions?.filter(s => {
    if (!s.scheduled_at) return false;
    return new Date(s.scheduled_at).toDateString() !== new Date().toDateString();
  }) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-2xl lg:text-3xl font-display"
          style={{ color: colors.starlight }}
        >
          {greeting()}, {practitioner?.name?.split(' ')[0] || 'Practitioner'}
        </h1>
        <p className="mt-1" style={{ color: colors.muted }}>
          Here's your sanctuary overview for today
        </p>
      </motion.div>

      {/* Stats */}
      <DashboardStats
        totalClients={dashboard?.total_clients || 0}
        activeClients={dashboard?.active_clients || 0}
        sessionsThisWeek={dashboard?.sessions_this_week || 0}
        sessionsThisMonth={dashboard?.sessions_this_month || 0}
        revenueThisMonth={dashboard?.revenue_this_month}
        upcomingSessionsCount={dashboard?.upcoming_sessions?.length || 0}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2
              className="text-lg font-medium flex items-center space-x-2"
              style={{ color: colors.starlight }}
            >
              <Star className="w-5 h-5" style={{ color: colors.gold }} />
              <span>Today's Sessions</span>
            </h2>
            <button
              onClick={() => router.push(`${basePath}/sessions`)}
              className="text-sm flex items-center space-x-1 transition-colors"
              style={{ color: colors.gold }}
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {todaysSessions.length > 0 ? (
            <div className="space-y-3">
              {todaysSessions.map((session, index) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onClick={() => router.push(`${basePath}/sessions/${session.id}`)}
                />
              ))}
            </div>
          ) : (
            <div
              className="rounded-xl p-8 text-center"
              style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
            >
              <Calendar className="w-10 h-10 mx-auto mb-3" style={{ color: colors.dim }} />
              <p style={{ color: colors.muted }}>No sessions scheduled for today</p>
              <button
                onClick={() => router.push(`${basePath}/sessions`)}
                className="mt-4 px-4 py-2 rounded-lg text-sm"
                style={{ backgroundColor: `${colors.gold}20`, color: colors.gold }}
              >
                Schedule a Session
              </button>
            </div>
          )}

          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <>
              <h3 className="text-sm font-medium mt-6" style={{ color: colors.muted }}>
                Coming Up
              </h3>
              <div className="space-y-2">
                {upcomingSessions.slice(0, 3).map(session => (
                  <div
                    key={session.id}
                    onClick={() => router.push(`${basePath}/sessions/${session.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:bg-white/5"
                    style={{ backgroundColor: `${colors.nebula}40` }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm" style={{ color: colors.dim }}>
                        {session.scheduled_at && formatDate(session.scheduled_at)}
                      </span>
                      <span className="text-sm" style={{ color: colors.starlight }}>
                        {session.client?.preferred_name || session.client?.name}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: colors.muted }}>
                      {session.session_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium" style={{ color: colors.muted }}>
              Quick Actions
            </h3>
            <QuickActionCard
              icon={<Users className="w-5 h-5" style={{ color: colors.gold }} />}
              label="View Clients"
              onClick={() => router.push(`${basePath}/clients`)}
              count={dashboard?.total_clients}
            />
            <QuickActionCard
              icon={<MessageSquare className="w-5 h-5" style={{ color: colors.violet }} />}
              label="Messages"
              onClick={() => router.push(`${basePath}/messages`)}
            />
            <QuickActionCard
              icon={<FileText className="w-5 h-5" style={{ color: colors.gold }} />}
              label="Content"
              onClick={() => router.push(`${basePath}/content`)}
            />
          </div>

          {/* Clients Needing Follow-up */}
          {dashboard?.clients_needing_follow_up && dashboard.clients_needing_follow_up.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium" style={{ color: colors.muted }}>
                Needs Follow-up
              </h3>
              <div
                className="rounded-xl p-4 space-y-3"
                style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.warning}30` }}
              >
                {dashboard.clients_needing_follow_up.slice(0, 3).map(client => (
                  <div
                    key={client.id}
                    onClick={() => router.push(`${basePath}/clients/${client.id}`)}
                    className="flex items-center justify-between cursor-pointer transition-all hover:opacity-80"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{
                          background: `linear-gradient(135deg, ${colors.gold}30 0%, ${colors.violet}30 100%)`,
                          color: colors.gold,
                        }}
                      >
                        {client.name[0]}
                      </div>
                      <span className="text-sm" style={{ color: colors.starlight }}>
                        {client.preferred_name || client.name}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: colors.dim }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {dashboard?.recent_sessions && dashboard.recent_sessions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium" style={{ color: colors.muted }}>
                Recent Sessions
              </h3>
              <div className="space-y-2">
                {dashboard.recent_sessions.slice(0, 3).map(session => (
                  <div
                    key={session.id}
                    onClick={() => router.push(`${basePath}/sessions/${session.id}`)}
                    className="p-3 rounded-lg cursor-pointer transition-all hover:bg-white/5"
                    style={{ backgroundColor: `${colors.nebula}40` }}
                  >
                    <p className="text-sm" style={{ color: colors.starlight }}>
                      {session.client?.preferred_name || session.client?.name}
                    </p>
                    <p className="text-xs" style={{ color: colors.dim }}>
                      {session.scheduled_at && formatDate(session.scheduled_at)}
                      {' · '}
                      {session.session_type.replace(/_/g, ' ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
