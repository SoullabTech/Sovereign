"use client";

/**
 * SESSION PREP PAGE
 *
 * Preparation workspace for an upcoming session
 * Client chart + current transits + previous notes + prep checklist
 *
 * Design Philosophy:
 * - "Session notes are for your learning, not judgment"
 * - Normalize uncertainty - every session is an encounter with mystery
 * - Support the practitioner's process, don't rush it
 */

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  CheckSquare,
  Square,
  Save,
  Copy,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Cloud,
} from 'lucide-react';
import { usePractitionerAuth } from '@/lib/auth/practitionerAuth';
import { SessionNotesEditor } from '@/components/admin/stellium/SessionNotesEditor';
import { TransitHighlights } from '@/components/admin/stellium/TransitHighlights';
import { PreviousSessionsSummary } from '@/components/admin/stellium/PreviousSessionsSummary';
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
  success: '#8FB89A',
};

interface SessionContext {
  session: PractitionerSession;
  client?: PractitionerClient;
  previousSessions?: PractitionerSession[];
  currentTransits?: any;
}

// Default prep checklist items
const DEFAULT_CHECKLIST = [
  { id: 'review-chart', label: 'Review natal chart', checked: false },
  { id: 'check-transits', label: 'Check current transits', checked: false },
  { id: 'review-notes', label: 'Review previous session notes', checked: false },
  { id: 'note-dates', label: 'Note key dates ahead', checked: false },
  { id: 'center-self', label: 'Center yourself', checked: false },
];

export default function SessionPrepPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const sessionId = params?.sessionId as string;
  const basePath = `/portal/${slug}/admin/stellium`;

  const { practitionerId, isLoading: authLoading } = usePractitionerAuth();
  const [context, setContext] = useState<SessionContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Checklist state
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);

  // Notes state
  const [prepNotes, setPrepNotes] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [showPreviousSessions, setShowPreviousSessions] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!practitionerId) {
      setError('Please sign in to access session prep');
      setLoading(false);
      return;
    }
    fetchSessionContext();
  }, [practitionerId, sessionId, authLoading]);

  const fetchSessionContext = async () => {
    try {
      setLoading(true);

      // Fetch session with context
      const response = await fetch(
        `/api/stellium/sessions/${sessionId}?practitionerId=${practitionerId}&context=true`
      );
      if (!response.ok) throw new Error('Failed to fetch session');
      const data = await response.json();

      setContext(data);

      // Initialize notes from existing data
      if (data.session?.prep_notes) {
        setPrepNotes(data.session.prep_notes);
      }
      if (data.session?.session_notes) {
        setSessionNotes(data.session.session_notes);
      }
    } catch (err) {
      console.error('[SessionPrep] Error:', err);
      setError('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const toggleChecklist = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const saveNotes = async () => {
    if (!practitionerId || !context?.session) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/stellium/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          prep_notes: prepNotes,
          session_notes: sessionNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to save notes');

      // Show brief success feedback
    } catch (err) {
      console.error('[SessionPrep] Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    const text = `
Session Prep: ${context?.client?.preferred_name || context?.client?.name}
Date: ${context?.session?.scheduled_at ? new Date(context.session.scheduled_at).toLocaleDateString() : 'TBD'}

Prep Notes:
${prepNotes}

Session Notes:
${sessionNotes}
`.trim();

    navigator.clipboard.writeText(text);
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-96 rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
          <div className="h-96 rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !context?.session) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
      >
        <AlertCircle className="w-10 h-10 mx-auto mb-3" style={{ color: colors.dim }} />
        <p style={{ color: colors.muted }}>{error || 'Session not found'}</p>
        <button
          onClick={() => router.push(basePath)}
          className="mt-4 px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: colors.celestialBlue, color: colors.void }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { session, client, previousSessions } = context;
  const displayName = client?.preferred_name || client?.name || 'Client';
  const scheduledDate = session.scheduled_at
    ? new Date(session.scheduled_at)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push(basePath)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: colors.muted }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-medium" style={{ color: colors.starlight }}>
              Session Prep: {displayName}
            </h1>
            {scheduledDate && (
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" style={{ color: colors.dim }} />
                  <span className="text-sm" style={{ color: colors.muted }}>
                    {scheduledDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" style={{ color: colors.dim }} />
                  <span className="text-sm" style={{ color: colors.muted }}>
                    {scheduledDate.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                    {' · '}
                    {session.duration_minutes} min
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`${basePath}/chart/${session.client_id}`)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: `${colors.stardust}60`,
              color: colors.muted,
            }}
          >
            <User className="w-4 h-4" />
            <span>View Chart</span>
          </button>
          <button
            onClick={saveNotes}
            disabled={saving}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: colors.celestialBlue,
              color: colors.void,
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Context */}
        <div className="space-y-6">
          {/* Prep Checklist */}
          <div
            className="rounded-xl p-5"
            style={{
              backgroundColor: `${colors.nebula}50`,
              border: `1px solid ${colors.stardust}`,
            }}
          >
            <h3 className="text-sm font-medium mb-4" style={{ color: colors.muted }}>
              Prep Checklist
            </h3>
            <div className="space-y-2">
              {checklist.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className="w-full flex items-center space-x-3 p-2 rounded-lg transition-colors hover:bg-white/5 text-left"
                >
                  {item.checked ? (
                    <CheckSquare className="w-4 h-4" style={{ color: colors.success }} />
                  ) : (
                    <Square className="w-4 h-4" style={{ color: colors.dim }} />
                  )}
                  <span
                    className={`text-sm ${item.checked ? 'line-through' : ''}`}
                    style={{ color: item.checked ? colors.dim : colors.muted }}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Transits */}
          <TransitHighlights clientId={session.client_id} practitionerId={practitionerId || ''} />

          {/* Previous Sessions Summary */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: `${colors.nebula}50`,
              border: `1px solid ${colors.stardust}`,
            }}
          >
            <button
              onClick={() => setShowPreviousSessions(!showPreviousSessions)}
              className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-white/5"
            >
              <h3 className="text-sm font-medium" style={{ color: colors.muted }}>
                Previous Sessions
                {previousSessions && previousSessions.length > 0 && (
                  <span className="ml-2 text-xs" style={{ color: colors.dim }}>
                    ({previousSessions.length})
                  </span>
                )}
              </h3>
              {showPreviousSessions ? (
                <ChevronUp className="w-4 h-4" style={{ color: colors.dim }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: colors.dim }} />
              )}
            </button>

            {showPreviousSessions && (
              <div className="px-4 pb-4">
                <PreviousSessionsSummary
                  sessions={previousSessions || []}
                  basePath={basePath}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Notes */}
        <div className="space-y-6">
          {/* Session Notes Editor */}
          <SessionNotesEditor
            prepNotes={prepNotes}
            sessionNotes={sessionNotes}
            onPrepNotesChange={setPrepNotes}
            onSessionNotesChange={setSessionNotes}
            onSave={saveNotes}
            onCopy={copyToClipboard}
            saving={saving}
          />

          {/* Gentle reminder */}
          <div
            className="rounded-xl p-4 text-center"
            style={{
              backgroundColor: `${colors.stardust}30`,
              border: `1px dashed ${colors.stardust}`,
            }}
          >
            <p className="text-xs italic" style={{ color: colors.dim }}>
              "Session notes are for your learning, not judgment."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
