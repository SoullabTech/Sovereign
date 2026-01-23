"use client";

/**
 * TODAY'S SESSION QUEUE
 *
 * The heart of the session cockpit - today's clients at a glance
 * Quick access to charts and session prep
 *
 * Design Philosophy:
 * - Calm, unhurried - these are people, not tasks
 * - Prep links go to session prep page, not just the session
 * - Show key placements as gentle context
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, FileText, Circle, ChevronRight } from 'lucide-react';
import type { PractitionerSession } from '@/lib/stellium/types';

interface TodaysSessionQueueProps {
  sessions: PractitionerSession[];
  basePath: string;
}

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
  success: '#8FB89A',
};

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function TodaysSessionQueue({ sessions, basePath }: TodaysSessionQueueProps) {
  const router = useRouter();

  // Filter to today's sessions only
  const todaySessions = sessions.filter(s => {
    if (!s.scheduled_at) return false;
    return new Date(s.scheduled_at).toDateString() === new Date().toDateString();
  }).sort((a, b) => {
    if (!a.scheduled_at || !b.scheduled_at) return 0;
    return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
  });

  if (todaySessions.length === 0) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{
          backgroundColor: `${colors.nebula}30`,
          border: `1px solid ${colors.stardust}`,
        }}
      >
        <Circle className="w-10 h-10 mx-auto mb-3" style={{ color: colors.dim }} />
        <p className="text-sm" style={{ color: colors.muted }}>
          No sessions scheduled for today
        </p>
        <p className="text-xs mt-2" style={{ color: colors.dim }}>
          Time to prepare, reflect, or rest
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todaySessions.map((session, index) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="rounded-xl p-4"
          style={{
            backgroundColor: `${colors.nebula}60`,
            border: `1px solid ${colors.stardust}`,
          }}
        >
          {/* Session Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              {/* Client Avatar/Initial */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium"
                style={{
                  background: `linear-gradient(135deg, ${colors.celestialBlue}30 0%, ${colors.violet}30 100%)`,
                  color: colors.celestialBlue,
                }}
              >
                {(session.client?.preferred_name || session.client?.name || 'C')[0].toUpperCase()}
              </div>

              <div>
                <h4 className="font-medium" style={{ color: colors.starlight }}>
                  {session.client?.preferred_name || session.client?.name || 'Client'}
                </h4>
                <div className="flex items-center space-x-2 mt-0.5">
                  <Clock className="w-3 h-3" style={{ color: colors.dim }} />
                  <span className="text-xs" style={{ color: colors.dim }}>
                    {session.scheduled_at ? formatTime(session.scheduled_at) : 'TBD'}
                    {' · '}
                    {session.duration_minutes} min
                  </span>
                </div>
              </div>
            </div>

            {/* Status indicator */}
            {session.status === 'confirmed' && (
              <span
                className="px-2 py-0.5 text-xs rounded-full"
                style={{
                  backgroundColor: `${colors.success}20`,
                  color: colors.success,
                }}
              >
                Confirmed
              </span>
            )}
          </div>

          {/* Key Placements (if available) */}
          {session.client?.key_placements && (
            <div className="flex items-center space-x-3 mb-3 pl-13">
              {session.client.key_placements.sun_sign && (
                <span className="text-xs" style={{ color: colors.muted }}>
                  ☉ {session.client.key_placements.sun_sign}
                </span>
              )}
              {session.client.key_placements.moon_sign && (
                <span className="text-xs" style={{ color: colors.muted }}>
                  ☽ {session.client.key_placements.moon_sign}
                </span>
              )}
              {session.client.key_placements.rising_sign && (
                <span className="text-xs" style={{ color: colors.muted }}>
                  ↑ {session.client.key_placements.rising_sign}
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pt-3 border-t" style={{ borderColor: `${colors.stardust}60` }}>
            <button
              onClick={() => router.push(`${basePath}/session/${session.id}`)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs transition-colors"
              style={{
                backgroundColor: `${colors.celestialBlue}20`,
                color: colors.celestialBlue,
                border: `1px solid ${colors.celestialBlue}30`,
              }}
            >
              <FileText className="w-3 h-3" />
              <span>Prep</span>
            </button>

            <button
              onClick={() => router.push(`${basePath}/chart/${session.client_id}`)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs transition-colors"
              style={{
                backgroundColor: `${colors.stardust}60`,
                color: colors.muted,
              }}
            >
              <span>Chart</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default TodaysSessionQueue;
