'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FieldToneIndicator from '@/components/relationships/FieldToneIndicator';
import CheckInFlow from '@/components/relationships/CheckInFlow';
import RelationshipTimeline, { type TimelineEntry } from '@/components/relationships/RelationshipTimeline';
import { seedFromSource } from '@/lib/maia/seedPrompt';

interface RelationshipDetail {
  id: string;
  name: string;
  realm: string;
  bondType: string | null;
  note: string | null;
  createdAt: string;
}

interface FieldState {
  fieldTone: string | null;
  activeSignals: string[] | null;
  dominantPattern: string | null;
  developmentalTheme: string | null;
  lastCheckinAt: string | null;
}

export default function RelationshipDetailPage() {
  const params = useParams() ?? {};
  const router = useRouter();
  const id = params.id as string;

  interface UnresolvedThread {
    type: string;
    description: string;
  }

  const [relationship, setRelationship] = useState<RelationshipDetail | null>(null);
  const [fieldState, setFieldState] = useState<FieldState | null>(null);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [unresolvedThreads, setUnresolvedThreads] = useState<UnresolvedThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCheckin, setShowCheckin] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteKind, setNoteKind] = useState<'note' | 'reflection' | 'threshold'>('note');
  const [savingNote, setSavingNote] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState('');

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/relationships/${id}`);
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Not found');
        return;
      }
      setRelationship(data.relationship);
      setFieldState(data.fieldState);
      setEntries(data.entries || []);
      setUnresolvedThreads(data.unresolvedThreads || []);
    } catch {
      setError('Could not load relationship.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleCheckinComplete = () => {
    setShowCheckin(false);
    fetchDetail(); // Refresh to show new entry + updated field state
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/relationships/${id}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: noteKind, content: noteContent.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNoteContent('');
        setShowAddNote(false);
        fetchDetail();
      }
    } catch {
      // silent
    } finally {
      setSavingNote(false);
    }
  };

  const saveName = async () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === relationship?.name) {
      setEditingName(false);
      return;
    }
    try {
      const res = await fetch(`/api/relationships/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        fetchDetail();
      }
    } catch {
      // silent
    }
    setEditingName(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border border-jade-sage/30 rounded-full animate-spin" style={{ borderTopColor: 'var(--jade-jade, #a8c7a0)' }} />
      </div>
    );
  }

  if (error || !relationship) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-jade-mineral mb-4">{error || 'Not found'}</p>
          <button onClick={() => router.push('/relationships')} className="text-sm text-jade-sage hover:text-jade-jade transition-colors">
            Back to field
          </button>
        </div>
      </div>
    );
  }

  const latestMovement = entries.find(e => e.suggestedMovement)?.suggestedMovement;

  return (
    <div className="min-h-screen relative">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Back link */}
        <button
          onClick={() => router.push('/relationships')}
          className="text-xs text-jade-mineral hover:text-jade-sage transition-colors mb-6 block"
        >
          &larr; Relational Field
        </button>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            {editingName ? (
              <input
                autoFocus
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={saveName}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                className="text-3xl font-extralight text-jade-jade tracking-wide bg-transparent border-b border-jade-sage/30 outline-none w-full"
              />
            ) : (
              <h1
                onClick={() => { setEditName(relationship.name); setEditingName(true); }}
                className="text-3xl font-extralight text-jade-jade tracking-wide cursor-pointer hover:text-jade-sage transition-colors"
                title="Click to rename"
              >
                {relationship.name}
              </h1>
            )}
            {relationship.realm !== 'outer' && (
              <span className="text-xs text-jade-copper capitalize">{relationship.realm}</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-jade-mineral">
            {relationship.bondType && (
              <span className="capitalize">{relationship.bondType.replace(/_/g, ' ')}</span>
            )}
            <FieldToneIndicator tone={fieldState?.fieldTone} size="md" />
          </div>
          {relationship.note && (
            <p className="text-sm text-jade-mineral/80 font-light mt-3 italic">{relationship.note}</p>
          )}

          {/* Take this to MAIA — explicit handoff to relational context bridge */}
          <button
            onClick={() => {
              seedFromSource(
                'relationships:thread',
                'I want to bring this into our conversation.',
                { contextId: id, tone: 'supportive' }
              );
              router.push('/maia');
            }}
            className="mt-6 px-4 py-2 rounded-lg bg-jade-forest/30 border border-jade-sage/25 text-jade-jade text-sm font-light hover:bg-jade-forest/45 transition-all"
          >
            Take this to MAIA
          </button>
        </div>

        {/* Section 1: Current Field */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs text-jade-sage uppercase tracking-wider">Current Field</h2>
          </div>

          {fieldState ? (
            <div className="p-4 rounded-lg border border-jade-sage/15 bg-jade-forest/8">
              <div className="flex items-center gap-4 mb-3">
                <FieldToneIndicator tone={fieldState.fieldTone} size="md" />
                {fieldState.dominantPattern && (
                  <span className="text-xs text-jade-mineral">Pattern: {fieldState.dominantPattern}</span>
                )}
              </div>
              {fieldState.activeSignals && fieldState.activeSignals.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {fieldState.activeSignals.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-jade-forest/20 border border-jade-sage/15 text-jade-mineral">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {fieldState.developmentalTheme && (
                <p className="text-xs text-jade-copper font-light">{fieldState.developmentalTheme}</p>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-jade-forest/20 bg-jade-shadow/20">
              <p className="text-sm text-jade-mineral font-light">
                No field state yet. Check in to begin sensing the field.
              </p>
            </div>
          )}

          <button
            onClick={() => setShowCheckin(!showCheckin)}
            className="mt-3 px-4 py-2 rounded-lg bg-jade-forest/30 border border-jade-sage/25 text-jade-jade text-sm font-light hover:bg-jade-forest/45 transition-all"
          >
            {showCheckin ? 'Close' : 'Check in'}
          </button>

          {showCheckin && (
            <div className="mt-4 p-4 rounded-lg border border-jade-sage/15 bg-jade-forest/5">
              <CheckInFlow
                relationshipId={id}
                relationshipName={relationship.name}
                onComplete={handleCheckinComplete}
              />
            </div>
          )}
        </section>

        {/* Unresolved threads — subtle, between field and timeline */}
        {unresolvedThreads.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs text-jade-copper uppercase tracking-wider mb-3">Something remains open</h2>
            <div className="space-y-2">
              {unresolvedThreads.map((thread, i) => (
                <div key={i} className="px-4 py-3 rounded-lg border border-jade-copper/20 bg-jade-forest/5">
                  <p className="text-sm text-jade-mineral font-light">{thread.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 2: Timeline */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs text-jade-sage uppercase tracking-wider">Timeline</h2>
            <button
              onClick={() => setShowAddNote(!showAddNote)}
              className="text-xs text-jade-mineral hover:text-jade-sage transition-colors"
            >
              {showAddNote ? 'Cancel' : '+ Add entry'}
            </button>
          </div>

          {showAddNote && (
            <div className="mb-6 p-4 rounded-lg border border-jade-sage/15 bg-jade-forest/5">
              <div className="flex gap-2 mb-3">
                {(['note', 'reflection', 'threshold'] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setNoteKind(k)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                      noteKind === k
                        ? 'bg-jade-forest/40 text-jade-jade border border-jade-sage/40'
                        : 'bg-jade-shadow/40 text-jade-mineral border border-jade-forest/30'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={3}
                placeholder={noteKind === 'threshold' ? 'What shifted?' : noteKind === 'reflection' ? 'What are you noticing?' : 'What happened?'}
                className="w-full px-3 py-2 rounded-lg bg-jade-shadow border border-jade-sage/20 text-jade-jade placeholder:text-jade-mineral/40 focus:outline-none focus:border-jade-sage/50 text-sm resize-none mb-3"
              />
              <button
                onClick={handleSaveNote}
                disabled={savingNote || !noteContent.trim()}
                className="px-4 py-1.5 rounded-lg bg-jade-forest/30 border border-jade-sage/25 text-jade-jade text-xs font-light hover:bg-jade-forest/45 transition-all disabled:opacity-40"
              >
                {savingNote ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}

          <RelationshipTimeline entries={entries} />
        </section>

        {/* Section 3: Next Movement */}
        <section className="mb-10">
          <h2 className="text-xs text-jade-sage uppercase tracking-wider mb-4">Next Movement</h2>
          {latestMovement ? (
            <div className="p-4 rounded-lg border border-jade-sage/15 bg-jade-forest/8">
              <p className="text-sm text-jade-jade font-light italic">{latestMovement}</p>
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-jade-forest/20 bg-jade-shadow/20">
              <p className="text-sm text-jade-mineral font-light">
                Check in to receive a grounded next step.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
