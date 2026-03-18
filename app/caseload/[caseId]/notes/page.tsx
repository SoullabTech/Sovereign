'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Radio, Loader2 } from 'lucide-react';
import { SacredCard } from '@/components/ui/SacredCard';
import { apiFetch } from '@/lib/http/apiBase';
import type { PractitionerCase, CaseNote, NoteType, Element } from '@/lib/caseload/types';

interface ScribeSummary {
  segmentCount: number;
  durationSeconds: number | null;
  keyThemes: string[];
  transcriptPreview: string | null;
}

// Element configuration
const elementConfig: Record<Element, { color: string; icon: string; bg: string; name: string }> = {
  earth: { color: 'text-amber-400', icon: '🜃', bg: 'bg-amber-900/30', name: 'Earth' },
  water: { color: 'text-blue-400', icon: '🜄', bg: 'bg-blue-900/30', name: 'Water' },
  fire: { color: 'text-red-400', icon: '🜂', bg: 'bg-red-900/30', name: 'Fire' },
  air: { color: 'text-cyan-400', icon: '🜁', bg: 'bg-cyan-900/30', name: 'Air' },
  aether: { color: 'text-purple-400', icon: '✦', bg: 'bg-purple-900/30', name: 'Aether' },
};

const noteTypeConfig: Record<NoteType, { label: string; icon: string; color: string }> = {
  session: { label: 'Session', icon: '📝', color: 'text-gold-divine' },
  observation: { label: 'Observation', icon: '👁️', color: 'text-cyan-400' },
  consultation: { label: 'Consultation', icon: '💭', color: 'text-purple-400' },
  progress: { label: 'Progress', icon: '📈', color: 'text-green-400' },
  intake: { label: 'Intake', icon: '📋', color: 'text-blue-400' },
  discharge: { label: 'Discharge', icon: '🚪', color: 'text-amber-400' },
  supervision: { label: 'Supervision', icon: '🎓', color: 'text-pink-400' },
};

export default function NotesTimelinePage() {
  const router = useRouter();
  const params = useParams();

  if (!params) return null;

  const caseIdParam = params.caseId as string | string[] | undefined;
  const caseId = Array.isArray(caseIdParam) ? caseIdParam[0] : caseIdParam;

  if (!caseId) return null;

  const [caseData, setCaseData] = useState<PractitionerCase | null>(null);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<NoteType | 'all'>('all');
  const [elementFilter, setElementFilter] = useState<Element | 'all'>('all');
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [scribeSummaries, setScribeSummaries] = useState<Record<string, ScribeSummary | null>>({});
  const [scribeLoading, setScribeLoading] = useState<Record<string, boolean>>({});

  const fetchScribeSummary = useCallback(async (noteId: string, captureSessionId: string) => {
    if (scribeSummaries[noteId] !== undefined || scribeLoading[noteId]) return;
    setScribeLoading(prev => ({ ...prev, [noteId]: true }));
    try {
      const res = await apiFetch(`/api/studio/scribe/summary?scribeSessionId=${captureSessionId}`);
      if (res.ok) {
        const data = await res.json();
        setScribeSummaries(prev => ({ ...prev, [noteId]: data.success ? data.summary : null }));
      } else {
        setScribeSummaries(prev => ({ ...prev, [noteId]: null }));
      }
    } catch {
      setScribeSummaries(prev => ({ ...prev, [noteId]: null }));
    } finally {
      setScribeLoading(prev => ({ ...prev, [noteId]: false }));
    }
  }, [scribeSummaries, scribeLoading]);

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

  const fetchData = useCallback(async () => {
    const memberId = getMemberId();
    if (!memberId) {
      setError('Please sign in to view notes');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch case and notes in parallel
      const [caseResponse, notesResponse] = await Promise.all([
        fetch(`/api/caseload/${caseId}?memberId=${memberId}&includeNotes=false`),
        fetch(`/api/caseload/${caseId}/notes?memberId=${memberId}&limit=100`),
      ]);

      const [caseResult, notesResult] = await Promise.all([
        caseResponse.json(),
        notesResponse.json(),
      ]);

      if (!caseResponse.ok) {
        throw new Error(caseResult.error || 'Failed to fetch case');
      }

      setCaseData(caseResult.case);
      setNotes(notesResult.notes || []);
      setError(null);
    } catch (err) {
      console.error('[CASELOAD] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    if (typeFilter !== 'all' && note.note_type !== typeFilter) return false;
    if (elementFilter !== 'all' && note.element_focus !== elementFilter) return false;
    return true;
  });

  // Group notes by month
  const groupedNotes = filteredNotes.reduce<Record<string, CaseNote[]>>((acc, note) => {
    const date = new Date(note.session_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(note);
    return acc;
  }, {});

  const formatMonthYear = (key: string) => {
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sacred-navy to-sacred-blue flex items-center justify-center">
        <div className="text-gold-divine/60 animate-pulse">Loading notes...</div>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-sacred-navy to-sacred-blue">
      {/* Header */}
      <div className="border-b border-gold-divine/20 bg-sacred-navy/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => router.push(`/caseload/${caseId}`)}
              className="text-neutral-silver/60 hover:text-neutral-silver transition-colors"
            >
              ← Back to Case
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-gold-divine">
                Session Notes
              </h1>
              <p className="text-sm text-neutral-silver/60">
                {caseData.client_identifier} &bull; {notes.length} notes
              </p>
            </div>
            <button
              onClick={() => router.push(`/caseload/${caseId}/notes/new`)}
              className="px-4 py-2 bg-gold-divine/20 hover:bg-gold-divine/30 border border-gold-divine/40 rounded-lg text-gold-divine"
            >
              + Add Note
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-6 py-4 border-b border-gold-divine/10">
        <div className="flex flex-wrap gap-4">
          {/* Type filter */}
          <div className="flex gap-1 p-1 bg-sacred-navy/40 border border-gold-divine/10 rounded-lg">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded text-sm transition-all ${
                typeFilter === 'all'
                  ? 'bg-gold-divine/20 text-gold-divine'
                  : 'text-neutral-silver/60 hover:text-neutral-silver'
              }`}
            >
              All Types
            </button>
            {Object.entries(noteTypeConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setTypeFilter(key as NoteType)}
                className={`px-3 py-1.5 rounded text-sm transition-all ${
                  typeFilter === key
                    ? 'bg-gold-divine/20 text-gold-divine'
                    : 'text-neutral-silver/60 hover:text-neutral-silver'
                }`}
                title={config.label}
              >
                {config.icon}
              </button>
            ))}
          </div>

          {/* Element filter */}
          <div className="flex gap-1 p-1 bg-sacred-navy/40 border border-gold-divine/10 rounded-lg">
            <button
              onClick={() => setElementFilter('all')}
              className={`px-3 py-1.5 rounded text-sm transition-all ${
                elementFilter === 'all'
                  ? 'bg-gold-divine/20 text-gold-divine'
                  : 'text-neutral-silver/60 hover:text-neutral-silver'
              }`}
            >
              All
            </button>
            {Object.entries(elementConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setElementFilter(key as Element)}
                className={`px-3 py-1.5 rounded text-sm transition-all ${
                  elementFilter === key
                    ? `${config.bg} ${config.color}`
                    : 'text-neutral-silver/60 hover:text-neutral-silver'
                }`}
                title={config.name}
              >
                {config.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {filteredNotes.length === 0 ? (
          <SacredCard variant="outlined" className="border-dashed">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-neutral-silver mb-2">
                {notes.length === 0 ? 'No notes yet' : 'No matching notes'}
              </h3>
              <p className="text-neutral-silver/60 text-sm">
                {notes.length === 0
                  ? 'Start documenting sessions to build a record.'
                  : 'Try adjusting your filters.'}
              </p>
            </div>
          </SacredCard>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedNotes)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([monthKey, monthNotes]) => (
                <div key={monthKey}>
                  {/* Month header */}
                  <h2 className="text-lg font-medium text-gold-divine mb-4 sticky top-[120px] bg-gradient-to-b from-sacred-navy to-transparent py-2 z-5">
                    {formatMonthYear(monthKey)}
                  </h2>

                  {/* Notes for this month */}
                  <div className="space-y-4 ml-4 border-l-2 border-gold-divine/20 pl-6">
                    {monthNotes.map((note) => {
                      const noteType = noteTypeConfig[note.note_type];
                      const isExpanded = expandedNote === note.id;

                      return (
                        <div key={note.id} className="relative">
                          {/* Timeline dot */}
                          <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-sacred-navy border-2 border-gold-divine/40" />

                          <SacredCard
                            variant="elevated"
                            size="md"
                            hover={true}
                            onClick={() => {
                              const next = isExpanded ? null : note.id;
                              setExpandedNote(next);
                              if (next && note.linked_capture_session_id) {
                                fetchScribeSummary(note.id, note.linked_capture_session_id);
                              }
                            }}
                          >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-sacred-navy/60 ${noteType.color}`}>
                                  {noteType.icon}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`font-medium ${noteType.color}`}>
                                      {noteType.label}
                                    </span>
                                    {note.session_duration_minutes && (
                                      <span className="text-xs text-neutral-silver/50">
                                        {note.session_duration_minutes} min
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-neutral-silver/60">
                                    {formatShortDate(note.session_date)}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Recording badge */}
                                {note.linked_capture_session_id && (
                                  <span className="flex items-center gap-1 px-2 py-1 bg-amber-900/30 rounded text-xs text-amber-400">
                                    <Radio className="w-3 h-3" />
                                    Rec
                                  </span>
                                )}
                                {/* Element badge */}
                                {note.element_focus && (
                                  <span className={`px-2 py-1 rounded text-sm ${elementConfig[note.element_focus as Element]?.bg} ${elementConfig[note.element_focus as Element]?.color}`}>
                                    {elementConfig[note.element_focus as Element]?.icon}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Content */}
                            <div className={`text-neutral-silver/90 text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
                              {note.content}
                            </div>

                            {/* Recording summary (show when expanded) */}
                            {isExpanded && note.linked_capture_session_id && (
                              <div className="mt-4 pt-4 border-t border-gold-divine/10">
                                <div className="p-3 bg-amber-900/20 border border-amber-500/20 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2 text-xs text-amber-400">
                                    <Radio className="w-3 h-3" />
                                    Session Recording
                                  </div>
                                  {scribeLoading[note.id] ? (
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                      <Loader2 className="w-3 h-3 animate-spin" /> Loading...
                                    </div>
                                  ) : scribeSummaries[note.id] ? (
                                    <div className="space-y-1 text-xs text-slate-300">
                                      {scribeSummaries[note.id]!.segmentCount > 0 && (
                                        <p>{scribeSummaries[note.id]!.segmentCount} segments
                                          {scribeSummaries[note.id]!.durationSeconds
                                            ? ` · ${Math.round(scribeSummaries[note.id]!.durationSeconds! / 60)} min`
                                            : ''}
                                        </p>
                                      )}
                                      {scribeSummaries[note.id]!.keyThemes?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {scribeSummaries[note.id]!.keyThemes.map((t, i) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-amber-900/30 rounded text-amber-300">{t}</span>
                                          ))}
                                        </div>
                                      )}
                                      {scribeSummaries[note.id]!.transcriptPreview && (
                                        <p className="text-slate-400 line-clamp-2 mt-1">{scribeSummaries[note.id]!.transcriptPreview}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-500">Recording linked · open Studio to review</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Tags (show when expanded) */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-gold-divine/10">
                                {/* Themes */}
                                {note.themes_observed && note.themes_observed.length > 0 && (
                                  <div className="mb-3">
                                    <span className="text-xs text-neutral-silver/50 block mb-1">Themes</span>
                                    <div className="flex flex-wrap gap-1">
                                      {note.themes_observed.map((theme, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-cyan-900/30 rounded text-xs text-cyan-300">
                                          {theme}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Interventions */}
                                {note.interventions_used && note.interventions_used.length > 0 && (
                                  <div className="mb-3">
                                    <span className="text-xs text-neutral-silver/50 block mb-1">Interventions</span>
                                    <div className="flex flex-wrap gap-1">
                                      {note.interventions_used.map((intervention, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-purple-900/30 rounded text-xs text-purple-300">
                                          {intervention}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Spiral movement */}
                                {note.spiral_movement && (
                                  <div>
                                    <span className="text-xs text-neutral-silver/50 block mb-1">Spiral Movement</span>
                                    <p className="text-sm text-gold-divine/80">{note.spiral_movement}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Expand indicator */}
                            <div className="mt-3 text-center">
                              <span className="text-xs text-neutral-silver/40">
                                {isExpanded ? 'Click to collapse' : 'Click to expand'}
                              </span>
                            </div>
                          </SacredCard>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
