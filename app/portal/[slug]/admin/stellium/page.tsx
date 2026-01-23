"use client";

/**
 * STELLIUM PRO - SESSION COCKPIT
 *
 * The practitioner's daily companion for chart work
 *
 * Design Philosophy:
 * - Today's view - calm, focused, unhurried
 * - "Apprenticeship energy" - reflection, preparation, learning
 * - Cosmic weather as gentle context, not prescription
 * - Quick access to charts and session prep
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ Today's Queue                               Quick Stats     │
 * ├─────────────────────────────────────────────────────────────┤
 * │ ┌───────────────────┐ ┌─────────────────────────────────┐   │
 * │ │ Session 1         │ │ Current Cosmic Weather          │   │
 * │ │ Sarah M. · 10am   │ │ ☉ Aquarius 3°  ☽ Libra 17°    │   │
 * │ │ [Prep] [Chart]    │ │ Mercury ℞ · Mars □ Pluto       │   │
 * │ ├───────────────────┤ └─────────────────────────────────┘   │
 * │ │ Session 2         │                                       │
 * │ │ James K. · 2pm    │ ┌─────────────────────────────────┐   │
 * │ │ [Prep] [Chart]    │ │ Quick Client Search              │  │
 * │ └───────────────────┘ └─────────────────────────────────┘   │
 * └─────────────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, ChevronRight, Star } from 'lucide-react';
import { usePractitionerAuth } from '@/lib/auth/practitionerAuth';
import { CosmicWeatherWidget } from '@/components/admin/stellium/CosmicWeatherWidget';
import { TodaysSessionQueue } from '@/components/admin/stellium/TodaysSessionQueue';
import { QuickClientSearch } from '@/components/admin/stellium/QuickClientSearch';
import type { PractitionerSession, PractitionerClient } from '@/lib/stellium/types';

const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  gold: '#E5C158',
  violet: '#B8A5D9',
  celestialBlue: '#79c0ff',
  starlight: '#FFFFFF',
  muted: '#C8BDE0',
  dim: '#9A8FB8',
};

interface DashboardData {
  upcoming_sessions: PractitionerSession[];
  recent_clients: PractitionerClient[];
  total_clients: number;
  sessions_this_week: number;
}

export default function StelliumProDashboard() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const basePath = `/portal/${slug}/admin/stellium`;

  const { practitioner, practitionerId, isLoading: authLoading } = usePractitionerAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!practitionerId) {
      setError('Please sign in to access Stellium Pro');
      setLoading(false);
      return;
    }
    fetchDashboard();
  }, [practitionerId, authLoading]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stellium/dashboard?practitionerId=${practitionerId}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      const data = await response.json();
      setDashboard(data);
    } catch (err) {
      console.error('[StelliumPro] Error:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
          <div className="h-64 rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
      >
        <Star className="w-10 h-10 mx-auto mb-3" style={{ color: colors.dim }} />
        <p style={{ color: colors.muted }}>{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: colors.celestialBlue, color: colors.void }}
        >
          Try Again
        </button>
      </div>
    );
  }

  const todaySessions = dashboard?.upcoming_sessions?.filter(s => {
    if (!s.scheduled_at) return false;
    return new Date(s.scheduled_at).toDateString() === new Date().toDateString();
  }) || [];

  const upcomingSessions = dashboard?.upcoming_sessions?.filter(s => {
    if (!s.scheduled_at) return false;
    const sessionDate = new Date(s.scheduled_at);
    const today = new Date();
    return sessionDate.toDateString() !== today.toDateString() && sessionDate > today;
  }).slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Welcome Message - gentle, not performative */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-6"
      >
        <p className="text-sm" style={{ color: colors.dim }}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        {todaySessions.length > 0 ? (
          <p className="mt-1" style={{ color: colors.muted }}>
            {todaySessions.length} session{todaySessions.length !== 1 ? 's' : ''} today
          </p>
        ) : (
          <p className="mt-1" style={{ color: colors.muted }}>
            A day for preparation or rest
          </p>
        )}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Today's Sessions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Queue */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-medium flex items-center space-x-2"
                style={{ color: colors.starlight }}
              >
                <Calendar className="w-5 h-5" style={{ color: colors.celestialBlue }} />
                <span>Today's Sessions</span>
              </h2>
              <button
                onClick={() => router.push(`/portal/${slug}/admin/sessions`)}
                className="text-sm flex items-center space-x-1"
                style={{ color: colors.celestialBlue }}
              >
                <span>All Sessions</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <TodaysSessionQueue
              sessions={dashboard?.upcoming_sessions || []}
              basePath={basePath}
            />
          </div>

          {/* Coming Up */}
          {upcomingSessions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3" style={{ color: colors.muted }}>
                Coming Up
              </h3>
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  backgroundColor: `${colors.nebula}30`,
                  border: `1px solid ${colors.stardust}60`,
                }}
              >
                {upcomingSessions.map(session => (
                  <div
                    key={session.id}
                    onClick={() => router.push(`${basePath}/session/${session.id}`)}
                    className="flex items-center justify-between cursor-pointer transition-all hover:bg-white/5 p-2 rounded-lg -mx-2"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xs" style={{ color: colors.dim }}>
                        {session.scheduled_at && new Date(session.scheduled_at).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="text-sm" style={{ color: colors.starlight }}>
                        {session.client?.preferred_name || session.client?.name}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: colors.dim }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Client Search */}
          <div>
            <h3 className="text-sm font-medium mb-3" style={{ color: colors.muted }}>
              Find Client
            </h3>
            {practitionerId && (
              <QuickClientSearch
                practitionerId={practitionerId}
                basePath={basePath}
              />
            )}
          </div>

          {/* Cosmic Weather */}
          <div>
            <h3 className="text-sm font-medium mb-3" style={{ color: colors.muted }}>
              Today's Sky
            </h3>
            <CosmicWeatherWidget />
          </div>

          {/* Quick Stats */}
          <div
            className="rounded-xl p-5"
            style={{
              backgroundColor: `${colors.nebula}50`,
              border: `1px solid ${colors.stardust}`,
            }}
          >
            <h3 className="text-sm font-medium mb-4" style={{ color: colors.muted }}>
              Practice
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" style={{ color: colors.celestialBlue }} />
                  <span className="text-sm" style={{ color: colors.muted }}>
                    Clients
                  </span>
                </div>
                <span className="text-sm font-medium" style={{ color: colors.starlight }}>
                  {dashboard?.total_clients || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" style={{ color: colors.violet }} />
                  <span className="text-sm" style={{ color: colors.muted }}>
                    This week
                  </span>
                </div>
                <span className="text-sm font-medium" style={{ color: colors.starlight }}>
                  {dashboard?.sessions_this_week || 0} sessions
                </span>
              </div>
            </div>

            {/* View All Clients Link */}
            <button
              onClick={() => router.push(`${basePath}/clients`)}
              className="w-full mt-4 py-2 text-sm rounded-lg transition-colors"
              style={{
                backgroundColor: `${colors.stardust}60`,
                color: colors.muted,
              }}
            >
              Client Library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
