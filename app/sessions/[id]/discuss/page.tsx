'use client';

/**
 * Session Discussion - Discuss a Scribe/Witness session with MAIA
 *
 * Opens OracleConversation scoped to the specific session context,
 * so MAIA has access to the session summary, markers, and themes.
 */

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { apiFetch } from '@/lib/http/apiBase';

// Dynamic import to avoid SSR issues with voice components
const OracleConversation = dynamic(
  () => import('@/components/OracleConversation'),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div> }
);

interface SessionContext {
  id: string;
  title: string;
  container: 'solo' | 'witness' | 'practitioner';
  summary: {
    short?: string;
    long?: string;
    themes?: string[];
  } | null;
  duration: number;
  markerCount: number;
}

export default function SessionDiscussPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id as string;

  const [sessionContext, setSessionContext] = useState<SessionContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSessionContext() {
      if (!sessionId) return;
      try {
        const res = await apiFetch(`/api/scribe/sessions/${sessionId}`);
        if (!res.ok) {
          setError('Session not found');
          return;
        }
        const data = await res.json();
        setSessionContext({
          id: data.session.id,
          title: data.session.title,
          container: data.session.container,
          summary: data.session.summary,
          duration: data.session.duration,
          markerCount: data.markers?.length || 0,
        });
      } catch (err) {
        console.error('Failed to load session:', err);
        setError('Failed to load session');
      } finally {
        setLoading(false);
      }
    }
    loadSessionContext();
  }, [sessionId]);

  const containerLabel = (container: string) => {
    switch (container) {
      case 'witness': return 'Third Chair';
      case 'practitioner': return 'Practitioner';
      default: return 'Solo';
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
      >
        <Loader2 className="w-6 h-6 text-stone-400 animate-spin" />
      </div>
    );
  }

  if (error || !sessionContext) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
      >
        <p className="text-stone-500">{error || 'Session not found'}</p>
        <button
          onClick={() => router.push('/sessions')}
          className="text-[13px] text-stone-400 hover:text-stone-600 transition-colors"
        >
          Back to Sessions
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-stone-200/60 bg-white/60 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <button
            onClick={() => router.push(`/sessions/${sessionId}`)}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors text-[13px] tracking-wide mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Session</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-medium text-stone-800 truncate">
              Discussing: {sessionContext.title}
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-500">
              {containerLabel(sessionContext.container)}
            </span>
          </div>
          {sessionContext.summary?.short && (
            <p className="text-[12px] text-stone-500 mt-1 line-clamp-1">
              {sessionContext.summary.short}
            </p>
          )}
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 min-h-0">
        <OracleConversation
          scribeSessionId={sessionId}
          scribeSessionContext={sessionContext}
        />
      </div>
    </div>
  );
}
