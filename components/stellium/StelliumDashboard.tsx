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
} from 'lucide-react';
import SessionCard from './SessionCard';
import ClientCard from './ClientCard';

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

  useEffect(() => {
    fetchDashboard();
  }, [practitionerId]);

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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-sacred-gold/20 p-6"
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
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2">
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
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sacred-gold/10 text-sacred-gold">
              {icon}
            </div>
            <div>
              <p className="text-2xl font-medium text-gray-100">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2">{subtext}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
