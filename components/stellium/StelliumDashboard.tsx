"use client";

/**
 * STELLIUM DASHBOARD
 *
 * The practitioner's sanctuary - everything at a glance
 * Built for healers, by those who understand the work
 *
 * "Not software. A sanctuary."
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Calendar,
  Brain,
  TrendingUp,
  Clock,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Heart,
  Sun,
  Shield,
  FileText,
} from 'lucide-react';
import SessionCard from './SessionCard';
import ClientCard from './ClientCard';
import SessionPrepCard from './SessionPrepCard';
import OnboardingChecklist from './OnboardingChecklist';
import type { SessionPrepData } from '@/lib/practitioner/sessionPrep';

interface DashboardData {
  today: {
    date: string;
    sessionsToday: number;
    sessionsThisWeek: number;
    pendingFollowUps: number;
  };
  clients: {
    total: number;
    active: number;
    inactive: number;
    archived: number;
    waitlist: number;
    new_this_month: number;
  };
  sessions: {
    total: number;
    this_week: number;
    this_month: number;
    completed_this_month: number;
    upcoming: number;
    revenue_this_month: number;
    average_session_duration: number;
    completion_rate: number;
  };
  upcomingSessions: Array<{
    id: string;
    client_id: string;
    session_type: string;
    scheduled_at: string;
    duration_minutes: number;
    status: string;
    maia_prep: Record<string, unknown> | null;
    client?: {
      name: string;
      preferred_name?: string;
    };
  }>;
  actionItems: Array<{
    type: 'follow_up' | 'upcoming' | 'persona_setup';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    data?: Record<string, unknown>;
  }>;
  persona: {
    name: string;
    modality: string;
    trainingTranscripts: number;
    materialsIndexed: number;
    booksReferenced: number;
    lastTrained: string | null;
    isReady: boolean;
  } | null;
  onboarding?: {
    isComplete: boolean;
    steps: {
      id: string;
      title: string;
      description: string;
      completed: boolean;
      href: string;
    }[];
  };
}

interface StelliumDashboardProps {
  practitionerId: string;
  practitionerName?: string;
  onNavigate?: (path: string, data?: Record<string, unknown>) => void;
}

export default function StelliumDashboard({
  practitionerId,
  practitionerName = 'there',
  onNavigate,
}: StelliumDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionPreps, setSessionPreps] = useState<Record<string, SessionPrepData>>({});
  const [loadingPreps, setLoadingPreps] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDashboard();
  }, [practitionerId]);

  // Fetch session prep for a specific client
  // Auth is handled via session cookie - no need to pass practitionerId
  const fetchSessionPrep = async (clientId: string) => {
    if (sessionPreps[clientId] || loadingPreps.has(clientId)) return;

    setLoadingPreps(prev => new Set([...prev, clientId]));
    try {
      const response = await fetch(
        `/api/practitioner/clients/${clientId}/prep`,
        { credentials: 'include' } // Ensure cookies are sent
      );
      if (response.ok) {
        const result = await response.json();
        setSessionPreps(prev => ({ ...prev, [clientId]: result.prep }));
      }
    } catch (err) {
      console.error('Failed to fetch session prep:', err);
    } finally {
      setLoadingPreps(prev => {
        const next = new Set(prev);
        next.delete(clientId);
        return next;
      });
    }
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/stellium/dashboard?practitionerId=${practitionerId}`
      );
      if (!response.ok) throw new Error('Failed to load dashboard');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-800/30 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-800/30 rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-gray-800/30 rounded-lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-red-900/20 border-red-500/30">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-300">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={fetchDashboard}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    );
  }

  const priorityColors = {
    high: 'border-red-500/30 bg-red-500/10',
    medium: 'border-amber-500/30 bg-amber-500/10',
    low: 'border-gray-500/30 bg-gray-500/10',
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-sacred-gold/20 p-4 sm:p-6"
      >
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-sacred-gold/70 mb-2">
            <Sun className="w-5 h-5" />
            <span className="text-sm">{getGreeting()}</span>
          </div>
          <h1 className="text-2xl font-light text-gray-100 mb-1">
            Welcome back, <span className="text-sacred-gold">{practitionerName}</span>
          </h1>
          <p className="text-gray-400">
            {data.today.sessionsToday > 0
              ? `You have ${data.today.sessionsToday} session${data.today.sessionsToday > 1 ? 's' : ''} today`
              : 'No sessions scheduled for today'}
          </p>
        </div>

        {/* Subtle glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sacred-gold/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Onboarding Checklist - shows for new practitioners */}
      {data.onboarding && !data.onboarding.isComplete && (
        <OnboardingChecklist
          steps={data.onboarding.steps}
          isComplete={data.onboarding.isComplete}
          onNavigate={onNavigate}
        />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Active Clients"
          value={data.clients.active}
          subtext={`${data.clients.new_this_month} new this month`}
          onClick={() => onNavigate?.('/stellium/clients')}
        />
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="This Week"
          value={data.sessions.this_week}
          subtext={`${data.sessions.upcoming} upcoming`}
          onClick={() => onNavigate?.('/stellium/sessions')}
        />
        <StatCard
          icon={<Heart className="w-5 h-5" />}
          label="Completion Rate"
          value={`${Math.round(data.sessions.completion_rate)}%`}
          subtext={`${data.sessions.completed_this_month} this month`}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Revenue"
          value={`$${data.sessions.revenue_this_month.toLocaleString()}`}
          subtext="This month"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Sessions with Session Prep */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Session Prep - Show prep cards for today's sessions */}
          {data.upcomingSessions.filter(s => {
            const sessionDate = new Date(s.scheduled_at);
            const today = new Date();
            return sessionDate.toDateString() === today.toDateString();
          }).length > 0 && (
            <Card className="bg-gray-900/50 backdrop-blur-xl border-sacred-gold/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sacred-gold flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Today&apos;s Session Prep
                  </div>
                  <span className="text-xs text-gray-500 font-normal">
                    Before they walk in
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.upcomingSessions
                  .filter(s => {
                    const sessionDate = new Date(s.scheduled_at);
                    const today = new Date();
                    return sessionDate.toDateString() === today.toDateString();
                  })
                  .map((session, index) => {
                    const prep = sessionPreps[session.client_id];
                    const isLoading = loadingPreps.has(session.client_id);

                    // Auto-fetch prep if not loaded
                    if (!prep && !isLoading) {
                      fetchSessionPrep(session.client_id);
                    }

                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {isLoading ? (
                          <div className="p-4 bg-gray-800/30 rounded-lg animate-pulse">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 rounded-full bg-gray-700/50" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-700/50 rounded w-1/3" />
                                <div className="h-3 bg-gray-700/50 rounded w-1/2" />
                              </div>
                            </div>
                          </div>
                        ) : prep ? (
                          <SessionPrepCard
                            prep={prep}
                            variant="dashboard"
                            onViewEmergencyKit={() => onNavigate?.(`/stellium/clients/${session.client_id}/emergency`)}
                            onViewFullHistory={() => onNavigate?.(`/stellium/clients/${session.client_id}`)}
                            onViewProgressArc={() => onNavigate?.(`/stellium/clients/${session.client_id}/arc`)}
                          />
                        ) : (
                          <div className="p-4 bg-gray-800/30 rounded-lg flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-gray-500" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-200">
                                  {session.client?.preferred_name || session.client?.name || 'Client'}
                                </p>
                                <p className="text-xs text-gray-500">{session.session_type}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => fetchSessionPrep(session.client_id)}
                              className="text-xs text-sacred-gold hover:text-sacred-gold/80"
                            >
                              Load Prep
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Sessions List */}
          <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sacred-gold flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Upcoming Sessions
                </div>
                <button
                  onClick={() => onNavigate?.('/stellium/sessions')}
                  className="text-sm text-gray-400 hover:text-sacred-gold transition-colors"
                >
                  View all
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.upcomingSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming sessions</p>
                  <button
                    onClick={() => onNavigate?.('/stellium/sessions/new')}
                    className="mt-4 text-sm text-sacred-gold hover:underline"
                  >
                    Schedule a session
                  </button>
                </div>
              ) : (
                data.upcomingSessions.slice(0, 5).map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <SessionCard
                      session={session as any}
                      variant="upcoming"
                      onClick={() => onNavigate?.('/stellium/sessions/' + session.id)}
                    />
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Items & Persona */}
        <div className="space-y-6">
          {/* Action Items */}
          {data.actionItems.length > 0 && (
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sacred-gold flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Needs Attention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.actionItems.slice(0, 4).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border ${priorityColors[item.priority]} cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => {
                      if (item.type === 'follow_up' && item.data?.sessionId) {
                        onNavigate?.('/stellium/sessions/' + item.data.sessionId);
                      } else if (item.type === 'persona_setup') {
                        onNavigate?.('/stellium/persona');
                      }
                    }}
                  >
                    <p className="text-sm text-gray-200">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Persona Status */}
          <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sacred-gold flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                MAIA Persona
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.persona ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-200">{data.persona.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      data.persona.isReady
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {data.persona.isReady ? 'Ready' : 'Training'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Training sessions</span>
                      <span>{data.persona.trainingTranscripts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Materials indexed</span>
                      <span>{data.persona.materialsIndexed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Books referenced</span>
                      <span>{data.persona.booksReferenced}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate?.('/stellium/persona')}
                    className="w-full text-sm text-center py-2 text-sacred-gold hover:bg-sacred-gold/10 rounded-lg transition-colors"
                  >
                    Continue Training
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-indigo-400/50" />
                  <p className="text-gray-400 text-sm mb-4">
                    Train MAIA to speak in your voice
                  </p>
                  <button
                    onClick={() => onNavigate?.('/stellium/persona/setup')}
                    className="px-4 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors text-sm"
                  >
                    Set Up Persona
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  subtext,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
    >
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20 hover:border-sacred-gold/20 transition-colors">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-sacred-gold/10 text-sacred-gold flex-shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-medium text-gray-100 truncate">{value}</p>
              <p className="text-xs text-gray-500 truncate">{label}</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2 truncate">{subtext}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
