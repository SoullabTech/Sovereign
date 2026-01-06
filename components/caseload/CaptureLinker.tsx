'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { CaseCaptureLink } from '@/lib/caseload/types';

interface CaptureSession {
  id: string;
  started_at: string;
  ended_at: string | null;
  title: string | null;
  auto_started: boolean;
}

interface CaptureLinkerProps {
  caseId: string;
  memberId: string;
  onLinkChange?: () => void;
  className?: string;
}

export const CaptureLinker: React.FC<CaptureLinkerProps> = ({
  caseId,
  memberId,
  onLinkChange,
  className,
}) => {
  const [linkedSessions, setLinkedSessions] = useState<(CaseCaptureLink & { session?: CaptureSession })[]>([]);
  const [unlinkedSessions, setUnlinkedSessions] = useState<CaptureSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [linkedRes, unlinkedRes] = await Promise.all([
        fetch(`/api/caseload/${caseId}/captures?memberId=${memberId}`),
        fetch(`/api/caseload/${caseId}/captures?memberId=${memberId}&unlinked=true`),
      ]);

      const [linkedData, unlinkedData] = await Promise.all([
        linkedRes.json(),
        unlinkedRes.json(),
      ]);

      setLinkedSessions(linkedData.links || []);
      setUnlinkedSessions(unlinkedData.sessions || []);
      setError(null);
    } catch (err) {
      console.error('[CaptureLinker] Fetch error:', err);
      setError('Failed to load capture sessions');
    } finally {
      setLoading(false);
    }
  }, [caseId, memberId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLink = async (captureSessionId: string) => {
    try {
      setLinking(captureSessionId);
      const response = await fetch(`/api/caseload/${caseId}/captures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, captureSessionId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to link session');
      }

      await fetchData();
      setShowSelector(false);
      onLinkChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link session');
    } finally {
      setLinking(null);
    }
  };

  const handleUnlink = async (captureSessionId: string) => {
    if (!confirm('Unlink this recording from the case?')) return;

    try {
      setLinking(captureSessionId);
      const response = await fetch(`/api/caseload/${caseId}/captures`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, captureSessionId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to unlink session');
      }

      await fetchData();
      onLinkChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlink session');
    } finally {
      setLinking(null);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return 'In progress';
    const durationMs = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.round(durationMs / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className={cn('text-neutral-silver/60 text-sm animate-pulse', className)}>
        Loading recordings...
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-silver">
          Linked Recordings
        </h3>
        {unlinkedSessions.length > 0 && (
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="text-sm text-gold-divine hover:text-gold-divine/80 transition-colors"
          >
            {showSelector ? 'Cancel' : '+ Link Recording'}
          </button>
        )}
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Session selector */}
      {showSelector && unlinkedSessions.length > 0 && (
        <div className="p-4 bg-sacred-navy/60 border border-gold-divine/20 rounded-lg space-y-3">
          <p className="text-xs text-neutral-silver/60">
            Select a Note mode recording to link to this case:
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {unlinkedSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => handleLink(session.id)}
                disabled={linking === session.id}
                className={cn(
                  'w-full p-3 bg-sacred-navy/40 hover:bg-sacred-navy/80 border border-gold-divine/10 rounded-lg text-left transition-colors',
                  linking === session.id && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-neutral-silver">
                      {session.title || formatDateTime(session.started_at)}
                    </div>
                    <div className="text-xs text-neutral-silver/50">
                      {formatDuration(session.started_at, session.ended_at)}
                      {session.auto_started && ' • Auto-started'}
                    </div>
                  </div>
                  <div className="text-gold-divine/60">
                    {linking === session.id ? '...' : '→'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Linked sessions */}
      {linkedSessions.length === 0 ? (
        <div className="text-sm text-neutral-silver/50 italic">
          No recordings linked yet.
          {unlinkedSessions.length > 0 && ' Click "Link Recording" to add one.'}
        </div>
      ) : (
        <div className="space-y-2">
          {linkedSessions.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between p-3 bg-sacred-navy/40 border border-gold-divine/10 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-900/30 flex items-center justify-center text-purple-400">
                  🎙️
                </div>
                <div>
                  <div className="text-sm text-neutral-silver">
                    {link.session?.title || formatDateTime(link.session?.started_at || link.linked_at)}
                  </div>
                  <div className="text-xs text-neutral-silver/50">
                    {link.session && formatDuration(link.session.started_at, link.session.ended_at)}
                    {' • Linked '}
                    {formatDateTime(link.linked_at)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleUnlink(link.capture_session_id)}
                disabled={linking === link.capture_session_id}
                className="text-neutral-silver/40 hover:text-red-400 transition-colors text-sm"
                title="Unlink recording"
              >
                {linking === link.capture_session_id ? '...' : '×'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {unlinkedSessions.length === 0 && linkedSessions.length === 0 && (
        <div className="text-sm text-neutral-silver/50 italic">
          No Note mode recordings available. Start a recording during a session to link it here.
        </div>
      )}
    </div>
  );
};

export default CaptureLinker;
