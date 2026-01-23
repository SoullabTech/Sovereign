"use client";

/**
 * PREVIOUS SESSIONS SUMMARY
 *
 * Quick overview of past sessions with this client
 * For session prep context
 *
 * Design: Minimal, scannable, respects privacy
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, FileText, ChevronRight } from 'lucide-react';
import type { PractitionerSession } from '@/lib/stellium/types';

interface PreviousSessionsSummaryProps {
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
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function PreviousSessionsSummary({ sessions, basePath }: PreviousSessionsSummaryProps) {
  const router = useRouter();

  // Filter to completed sessions and sort by date (most recent first)
  const completedSessions = sessions
    .filter(s => s.status === 'completed' && s.scheduled_at)
    .sort((a, b) => new Date(b.scheduled_at!).getTime() - new Date(a.scheduled_at!).getTime());

  if (completedSessions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-xs" style={{ color: colors.dim }}>
          First session with this client
        </p>
      </div>
    );
  }

  // Get the most recent session for highlight
  const mostRecent = completedSessions[0];

  // Extract themes from all sessions
  const allThemes = completedSessions
    .flatMap(s => s.themes || [])
    .reduce((acc, theme) => {
      acc[theme] = (acc[theme] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topThemes = Object.entries(allThemes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme);

  return (
    <div className="space-y-4">
      {/* Most Recent Session */}
      <div>
        <p className="text-xs mb-2" style={{ color: colors.dim }}>
          Last Session
        </p>
        <div
          className="p-3 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
          style={{ backgroundColor: `${colors.stardust}30` }}
          onClick={() => router.push(`${basePath}/session/${mostRecent.id}`)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-3 h-3" style={{ color: colors.dim }} />
              <span className="text-xs" style={{ color: colors.muted }}>
                {formatDate(mostRecent.scheduled_at!)}
              </span>
            </div>
            <ChevronRight className="w-3 h-3" style={{ color: colors.dim }} />
          </div>

          {/* Session notes preview */}
          {mostRecent.session_notes && (
            <p
              className="text-xs line-clamp-2"
              style={{ color: colors.dim }}
            >
              {mostRecent.session_notes.slice(0, 150)}
              {mostRecent.session_notes.length > 150 && '...'}
            </p>
          )}

          {/* Themes */}
          {mostRecent.themes && mostRecent.themes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {mostRecent.themes.slice(0, 3).map(theme => (
                <span
                  key={theme}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${colors.violet}20`,
                    color: colors.violet,
                  }}
                >
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Session History */}
      {completedSessions.length > 1 && (
        <div>
          <p className="text-xs mb-2" style={{ color: colors.dim }}>
            History ({completedSessions.length} sessions)
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {completedSessions.slice(1, 6).map(session => (
              <div
                key={session.id}
                onClick={() => router.push(`${basePath}/session/${session.id}`)}
                className="flex items-center justify-between p-2 rounded cursor-pointer transition-colors hover:bg-white/5"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xs" style={{ color: colors.dim }}>
                    {formatDate(session.scheduled_at!)}
                  </span>
                  {session.session_notes && (
                    <FileText className="w-3 h-3" style={{ color: colors.dim }} />
                  )}
                </div>
                <span className="text-xs" style={{ color: colors.dim }}>
                  {session.session_type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recurring Themes */}
      {topThemes.length > 0 && (
        <div>
          <p className="text-xs mb-2" style={{ color: colors.dim }}>
            Recurring Themes
          </p>
          <div className="flex flex-wrap gap-1">
            {topThemes.map(theme => (
              <span
                key={theme}
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: `${colors.stardust}60`,
                  color: colors.muted,
                }}
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PreviousSessionsSummary;
