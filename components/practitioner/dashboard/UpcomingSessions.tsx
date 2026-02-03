'use client';

/**
 * UpcomingSessions
 * Shows what's scheduled in the care horizon (14 days).
 * Grouped by day, no ranking or priority colors.
 */

import { useMemo } from 'react';

interface UpcomingSession {
  id: string;
  scheduledStartAt: string;
  sessionType: string;
  containerId: string;
  containerScope: string | null;
}

interface UpcomingSessionsProps {
  sessions: UpcomingSession[];
  onSessionClick?: (sessionId: string) => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).toLowerCase();
}

function formatDateGroup(date: Date, today: Date): string {
  const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

function formatSessionType(type: string): string {
  const labels: Record<string, string> = {
    session: 'Session',
    intake: 'Intake',
    check_in: 'Check-in',
    group: 'Group',
    closing: 'Closing',
    consultation: 'Consultation'
  };
  return labels[type] || type;
}

export function UpcomingSessions({ sessions, onSessionClick }: UpcomingSessionsProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const groupedSessions = useMemo(() => {
    const groups: Record<string, UpcomingSession[]> = {};

    sessions.forEach(session => {
      const date = new Date(session.scheduledStartAt);
      const key = date.toDateString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(session);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([dateStr, items]) => ({
        date: new Date(dateStr),
        label: formatDateGroup(new Date(dateStr), today),
        sessions: items.sort((a, b) =>
          new Date(a.scheduledStartAt).getTime() - new Date(b.scheduledStartAt).getTime()
        )
      }));
  }, [sessions, today]);

  return (
    <div className="bg-[#111827] rounded-xl border border-gray-700 p-6">
      <h2 className="text-xs font-medium tracking-wider text-gray-500 uppercase mb-4">
        Upcoming Sessions
      </h2>

      {groupedSessions.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No upcoming sessions</p>
      ) : (
        <div className="space-y-4">
          {groupedSessions.map(group => (
            <div key={group.label}>
              <div className="text-sm font-medium text-gray-400 mb-2">
                {group.label}
              </div>
              <div className="space-y-2 pl-2 border-l-2 border-gray-700">
                {group.sessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => onSessionClick?.(session.id)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-sm text-gray-500 tabular-nums">
                      {formatTime(new Date(session.scheduledStartAt))}
                    </span>
                    <span className="mx-2 text-gray-600">·</span>
                    <span className="text-sm text-gray-300">
                      {formatSessionType(session.sessionType)}
                    </span>
                    {session.containerScope && (
                      <>
                        <span className="mx-2 text-gray-600">·</span>
                        <span className="text-sm text-gray-500">
                          {session.containerScope}
                        </span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
