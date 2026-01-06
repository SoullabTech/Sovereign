'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SacredCard } from '@/components/ui/SacredCard';
import { CaptureLinker } from '@/components/caseload/CaptureLinker';
import { CaseMemoryPanel } from '@/components/caseload/CaseMemoryPanel';
import type { CaseWithStats, CaseNote, Element, CaseStatus, UpdateCaseInput } from '@/lib/caseload/types';

// Element configuration
const elementConfig: Record<Element, { color: string; icon: string; bg: string; name: string }> = {
  earth: { color: 'text-amber-400', icon: '🜃', bg: 'bg-amber-900/30', name: 'Earth' },
  water: { color: 'text-blue-400', icon: '🜄', bg: 'bg-blue-900/30', name: 'Water' },
  fire: { color: 'text-red-400', icon: '🜂', bg: 'bg-red-900/30', name: 'Fire' },
  air: { color: 'text-cyan-400', icon: '🜁', bg: 'bg-cyan-900/30', name: 'Air' },
  aether: { color: 'text-purple-400', icon: '✦', bg: 'bg-purple-900/30', name: 'Aether' },
};

const statusConfig: Record<CaseStatus, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: 'text-green-400', bg: 'bg-green-900/30' },
  paused: { label: 'Paused', color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  completed: { label: 'Completed', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  transferred: { label: 'Transferred', color: 'text-purple-400', bg: 'bg-purple-900/30' },
  archived: { label: 'Archived', color: 'text-neutral-400', bg: 'bg-neutral-900/30' },
};

const noteTypeConfig: Record<string, { label: string; icon: string; color: string }> = {
  session: { label: 'Session', icon: '📝', color: 'text-gold-divine' },
  observation: { label: 'Observation', icon: '👁️', color: 'text-cyan-400' },
  consultation: { label: 'Consultation', icon: '💭', color: 'text-purple-400' },
  progress: { label: 'Progress', icon: '📈', color: 'text-green-400' },
  intake: { label: 'Intake', icon: '📋', color: 'text-blue-400' },
  discharge: { label: 'Discharge', icon: '🚪', color: 'text-amber-400' },
  supervision: { label: 'Supervision', icon: '🎓', color: 'text-pink-400' },
};

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.caseId as string;

  const [caseData, setCaseData] = useState<CaseWithStats | null>(null);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState(false);

  const getMemberId = () => {
    if (typeof window === 'undefined') return null;
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const parsed = JSON.parse(betaUser);
        return parsed.id || parsed.memberId;
      } catch {
        return null;
      }
    }
    return null;
  };

  const fetchCase = useCallback(async () => {
    const memberId = getMemberId();
    if (!memberId) {
      setError('Please sign in to view this case');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/caseload/${caseId}?memberId=${memberId}&includeNotes=true&notesLimit=20`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch case');
      }

      setCaseData(data.case);
      setNotes(data.recentNotes || []);
      setError(null);
    } catch (err) {
      console.error('[CASELOAD] Fetch case error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load case');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  const handleStatusChange = async (newStatus: CaseStatus) => {
    const memberId = getMemberId();
    if (!memberId || !caseData) return;

    try {
      const response = await fetch(`/api/caseload/${caseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, case_status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update status');
      }

      const data = await response.json();
      setCaseData(data.case);
      setEditingStatus(false);
    } catch (err) {
      console.error('[CASELOAD] Update status error:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateStr);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sacred-navy to-sacred-blue flex items-center justify-center">
        <div className="text-gold-divine/60 animate-pulse">Loading case...</div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sacred-navy to-sacred-blue p-6">
        <div className="max-w-2xl mx-auto pt-12">
          <SacredCard variant="outlined" className="border-red-500/30">
            <div className="text-center py-8">
              <p className="text-red-400">{error || 'Case not found'}</p>
              <button
                onClick={() => router.push('/caseload')}
                className="mt-4 px-4 py-2 bg-sacred-navy/60 hover:bg-sacred-navy/80 border border-gold-divine/20 rounded-lg text-neutral-silver text-sm"
              >
                Back to Caseload
              </button>
            </div>
          </SacredCard>
        </div>
      </div>
    );
  }

  const element = caseData.primary_element as Element | undefined;
  const elementStyle = element ? elementConfig[element] : null;
  const status = statusConfig[caseData.case_status];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sacred-navy to-sacred-blue">
      {/* Header */}
      <div className="border-b border-gold-divine/20 bg-sacred-navy/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/caseload')}
              className="text-neutral-silver/60 hover:text-neutral-silver transition-colors"
            >
              ← Back
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Element indicator */}
              {elementStyle && (
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${elementStyle.bg} ${elementStyle.color}`}>
                  {elementStyle.icon}
                </div>
              )}

              <div>
                <h1 className="text-2xl font-light text-gold-divine">
                  {caseData.client_identifier}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  {caseData.spiral_stage && (
                    <span className="text-sm text-neutral-silver/70">
                      {caseData.spiral_stage}
                    </span>
                  )}
                  {/* Status badge - clickable */}
                  <div className="relative">
                    <button
                      onClick={() => setEditingStatus(!editingStatus)}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${status.bg} ${status.color}`}
                    >
                      {status.label} ▾
                    </button>
                    {editingStatus && (
                      <div className="absolute top-full left-0 mt-1 bg-sacred-navy border border-gold-divine/20 rounded-lg shadow-lg overflow-hidden z-20">
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <button
                            key={key}
                            onClick={() => handleStatusChange(key as CaseStatus)}
                            className={`block w-full px-4 py-2 text-left text-sm hover:bg-sacred-navy/60 ${config.color}`}
                          >
                            {config.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/caseload/${caseId}/notes/new`)}
                className="px-4 py-2 bg-sacred-navy/60 hover:bg-sacred-navy/80 border border-gold-divine/20 hover:border-gold-divine/40 rounded-lg text-neutral-silver hover:text-gold-divine transition-all"
              >
                + Add Note
              </button>
              <button
                onClick={() => router.push(`/caseload/${caseId}/consult`)}
                className="px-4 py-2 bg-gold-divine/20 hover:bg-gold-divine/30 border border-gold-divine/40 hover:border-gold-divine/60 rounded-lg text-gold-divine transition-all"
              >
                Consult MAIA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Case info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats */}
            <SacredCard variant="glass" size="md">
              <h3 className="text-sm font-medium text-neutral-silver/60 mb-4">Case Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-silver/70">Intake Date</span>
                  <span className="text-neutral-silver">{formatDate(caseData.intake_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-silver/70">Session Notes</span>
                  <span className="text-gold-divine">{caseData.note_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-silver/70">Memories Formed</span>
                  <span className="text-gold-divine">{caseData.memory_count}</span>
                </div>
                {caseData.last_session_date && (
                  <div className="flex justify-between">
                    <span className="text-neutral-silver/70">Last Session</span>
                    <span className="text-neutral-silver">{formatRelativeDate(caseData.last_session_date)}</span>
                  </div>
                )}
              </div>
            </SacredCard>

            {/* Presenting concerns */}
            {caseData.presenting_concerns && caseData.presenting_concerns.length > 0 && (
              <SacredCard variant="glass" size="md">
                <h3 className="text-sm font-medium text-neutral-silver/60 mb-4">Presenting Concerns</h3>
                <div className="flex flex-wrap gap-2">
                  {caseData.presenting_concerns.map((concern, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-sacred-navy/60 border border-gold-divine/10 rounded-lg text-sm text-neutral-silver"
                    >
                      {concern}
                    </span>
                  ))}
                </div>
              </SacredCard>
            )}

            {/* Spiralogic position */}
            {(element || caseData.facet_code) && (
              <SacredCard variant="glass" size="md">
                <h3 className="text-sm font-medium text-neutral-silver/60 mb-4">Spiralogic Position</h3>
                <div className="space-y-3">
                  {element && elementStyle && (
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl ${elementStyle.color}`}>{elementStyle.icon}</span>
                      <span className="text-neutral-silver">{elementStyle.name}</span>
                    </div>
                  )}
                  {caseData.facet_code && (
                    <div className="px-3 py-2 bg-sacred-navy/60 border border-gold-divine/20 rounded-lg">
                      <span className="text-gold-divine font-mono">{caseData.facet_code}</span>
                    </div>
                  )}
                </div>
              </SacredCard>
            )}

            {/* Privacy */}
            <SacredCard variant="glass" size="sm">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-neutral-silver/60">Privacy:</span>
                <span className="text-neutral-silver capitalize">{caseData.privacy_mode.replace('_', ' ')}</span>
              </div>
            </SacredCard>

            {/* Linked Recordings */}
            <SacredCard variant="glass" size="md">
              <CaptureLinker
                caseId={caseId}
                memberId={getMemberId() || ''}
                onLinkChange={() => fetchCase()}
              />
            </SacredCard>
          </div>

          {/* Right column - Memory + Notes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Memory Panel */}
            <SacredCard variant="glass" size="md">
              <h3 className="text-sm font-medium text-neutral-silver/60 mb-4">Case Memory</h3>
              <CaseMemoryPanel caseId={caseId} memberId={getMemberId() || ''} />
            </SacredCard>

            {/* Notes timeline */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gold-divine">Session Notes</h2>
              <button
                onClick={() => router.push(`/caseload/${caseId}/notes`)}
                className="text-sm text-neutral-silver/60 hover:text-neutral-silver"
              >
                View All →
              </button>
            </div>

            {notes.length === 0 ? (
              <SacredCard variant="outlined" className="border-dashed">
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-neutral-silver mb-2">No notes yet</h3>
                  <p className="text-neutral-silver/60 text-sm mb-6">
                    Start documenting sessions to build MAIA&apos;s understanding of this case.
                  </p>
                  <button
                    onClick={() => router.push(`/caseload/${caseId}/notes/new`)}
                    className="px-4 py-2 bg-gold-divine/20 hover:bg-gold-divine/30 border border-gold-divine/50 rounded-lg text-gold-divine"
                  >
                    Add First Note
                  </button>
                </div>
              </SacredCard>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => {
                  const noteType = noteTypeConfig[note.note_type] || noteTypeConfig.session;
                  return (
                    <SacredCard key={note.id} variant="elevated" size="md" hover={false}>
                      <div className="flex items-start gap-4">
                        {/* Type indicator */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-sacred-navy/60 ${noteType.color}`}>
                          {noteType.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${noteType.color}`}>
                                {noteType.label}
                              </span>
                              {note.session_duration_minutes && (
                                <span className="text-xs text-neutral-silver/50">
                                  {note.session_duration_minutes} min
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-neutral-silver/60">
                              {formatRelativeDate(note.session_date)}
                            </span>
                          </div>

                          {/* Content preview */}
                          <p className="text-neutral-silver/90 text-sm leading-relaxed line-clamp-3 mb-3">
                            {note.content}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {note.element_focus && (
                              <span className={`px-2 py-0.5 rounded text-xs ${elementConfig[note.element_focus as Element]?.bg} ${elementConfig[note.element_focus as Element]?.color}`}>
                                {elementConfig[note.element_focus as Element]?.icon} {elementConfig[note.element_focus as Element]?.name}
                              </span>
                            )}
                            {note.themes_observed?.slice(0, 2).map((theme, i) => (
                              <span key={i} className="px-2 py-0.5 bg-sacred-navy/60 rounded text-xs text-neutral-silver/70">
                                {theme}
                              </span>
                            ))}
                            {note.interventions_used?.length > 0 && (
                              <span className="px-2 py-0.5 bg-purple-900/30 rounded text-xs text-purple-400">
                                {note.interventions_used.length} intervention{note.interventions_used.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </SacredCard>
                  );
                })}

                {caseData.note_count > notes.length && (
                  <button
                    onClick={() => router.push(`/caseload/${caseId}/notes`)}
                    className="w-full py-3 text-center text-sm text-neutral-silver/60 hover:text-gold-divine border border-gold-divine/10 hover:border-gold-divine/30 rounded-lg transition-all"
                  >
                    View {caseData.note_count - notes.length} more notes →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
