'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Loader2,
  ChevronRight,
  Check,
  Circle,
  Minus,
  Calendar,
  Video,
  Save,
  FileDown,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

// ─── Types ─────────────────────────────────────────────────────────────

interface ThresholdPassage {
  id: string;
  currentWeek: string;
  reflections: Record<string, { text: string; saved_at: string }>;
  accountabilityStatement?: string;
  consentGivenAt?: string;
  completedAt?: string;
  withdrewAt?: string;
  startedAt?: string;
}

interface WeekMeta {
  title: string;
  description: string;
  practicePrompt: string;
  circleTheme: string;
}

interface NextCircle {
  id: string;
  title?: string;
  scheduledStart: string;
  scheduledEnd: string;
  locationType: string;
  locationDetails?: string;
  sessionNumber?: number;
}

// ─── Week status helpers ───────────────────────────────────────────────

const WEEK_ORDER = ['week_0', 'week_1', 'week_2', 'week_3', 'week_4', 'week_5', 'week_6'];

function weekIndex(week: string): number {
  return WEEK_ORDER.indexOf(week);
}

function getWeekStatus(week: string, currentWeek: string): 'completed' | 'current' | 'upcoming' {
  if (currentWeek === 'completed') return 'completed';
  if (currentWeek === 'withdrew') return 'completed'; // show all as past
  const wi = weekIndex(week);
  const ci = weekIndex(currentWeek);
  if (wi < ci) return 'completed';
  if (wi === ci) return 'current';
  return 'upcoming';
}

// ─── Main Component ────────────────────────────────────────────────────

export default function ThresholdPage() {
  const [passage, setPassage] = useState<ThresholdPassage | null>(null);
  const [weekMeta, setWeekMeta] = useState<Record<string, WeekMeta>>({});
  const [nextCircle, setNextCircle] = useState<NextCircle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reflection editing
  const [editingWeek, setEditingWeek] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [statementText, setStatementText] = useState('');

  // ── Fetch passage state ──────────────────────────────────────────

  const fetchPassage = useCallback(async () => {
    try {
      const res = await apiFetch('/api/studio/threshold');
      if (res.ok) {
        const data = await res.json();
        setPassage(data.passage);
        setWeekMeta(data.weekMeta || {});
        setNextCircle(data.nextCircle);
        if (data.passage?.accountabilityStatement) {
          setStatementText(data.passage.accountabilityStatement);
        }
      }
    } catch (err) {
      console.error('Failed to fetch threshold:', err);
      setError('Could not load your passage.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPassage(); }, [fetchPassage]);

  // ── Actions ──────────────────────────────────────────────────────

  const beginPassage = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/studio/threshold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await fetchPassage();
      } else {
        const data = await res.json();
        setError(data.error || 'Could not begin passage.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const saveReflection = async (week: string) => {
    if (!reflectionText.trim()) return;
    setSaving(true);
    try {
      const res = await apiFetch('/api/studio/threshold', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_reflection',
          week,
          text: reflectionText.trim(),
        }),
      });
      if (res.ok) {
        await fetchPassage();
        setEditingWeek(null);
        setReflectionText('');
      }
    } catch {
      setError('Could not save reflection.');
    } finally {
      setSaving(false);
    }
  };

  const saveStatement = async () => {
    if (!statementText.trim()) return;
    setSaving(true);
    try {
      await apiFetch('/api/studio/threshold', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_statement',
          statement: statementText.trim(),
        }),
      });
      await fetchPassage();
    } catch {
      setError('Could not save statement.');
    } finally {
      setSaving(false);
    }
  };

  const exportReflections = () => {
    if (!passage) return;
    const lines: string[] = [
      'Soullab Threshold — My Reflections',
      `Started: ${passage.startedAt ? new Date(passage.startedAt).toLocaleDateString() : 'Unknown'}`,
      '',
    ];

    for (const week of WEEK_ORDER) {
      const meta = weekMeta[week];
      const reflection = passage.reflections[week];
      if (meta) {
        lines.push(`## ${meta.title}`);
        if (reflection) {
          lines.push(reflection.text);
          lines.push(`(Saved: ${new Date(reflection.saved_at).toLocaleDateString()})`);
        } else {
          lines.push('(No reflection saved)');
        }
        lines.push('');
      }
    }

    if (passage.accountabilityStatement) {
      lines.push('## My Statement');
      lines.push(passage.accountabilityStatement);
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'threshold-reflections.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Loading state ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  // ── No passage yet: invitation ───────────────────────────────────

  if (!passage) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl font-light text-white mb-6">
              The Threshold
            </h1>
            <p className="text-slate-400 leading-relaxed mb-4">
              A six-week passage of honest reflection about your relationship to helping.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              Nothing to pass or fail. No credential at the end.
              You may discover this isn&apos;t for you, and that would be a good outcome.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed mb-10">
              Each week has a theme, a practice for your real life,
              and a live circle with other helpers. MAIA will be here
              between circles for reflection.
            </p>

            <button
              onClick={beginPassage}
              disabled={saving}
              className="px-6 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              ) : null}
              I want to begin
            </button>

            {error && (
              <p className="text-red-400 text-sm mt-4 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Passage complete ─────────────────────────────────────────────

  if (passage.completedAt) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-2xl mx-auto mt-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h1 className="text-2xl font-light text-white mb-3">
              The Threshold
            </h1>
            <p className="text-slate-400 mb-8">
              Completed {new Date(passage.completedAt).toLocaleDateString()}
            </p>

            {passage.accountabilityStatement && (
              <div className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-5 mb-6">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">
                  Your statement
                </p>
                <p className="text-slate-300 leading-relaxed italic">
                  &ldquo;{passage.accountabilityStatement}&rdquo;
                </p>
              </div>
            )}

            <div className="flex gap-3 mb-10">
              <button
                onClick={exportReflections}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
              >
                <FileDown className="w-4 h-4" />
                Export reflections
              </button>
              <Link
                href="/maia"
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Talk to MAIA
              </Link>
            </div>

            <WeekList
              passage={passage}
              weekMeta={weekMeta}
              editingWeek={editingWeek}
              reflectionText={reflectionText}
              onEdit={(week, text) => {
                setEditingWeek(week);
                setReflectionText(text);
              }}
              onCancelEdit={() => { setEditingWeek(null); setReflectionText(''); }}
              onSave={saveReflection}
              saving={saving}
              readOnly
            />
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Active passage ───────────────────────────────────────────────

  const currentMeta = weekMeta[passage.currentWeek];
  const currentWeekNum = weekIndex(passage.currentWeek);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-2xl font-light text-white mb-1">
            The Threshold
          </h1>
          <p className="text-slate-500 text-sm">
            Week {currentWeekNum} of 6
          </p>
        </motion.div>

        {/* Current week card */}
        {currentMeta && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-6 mb-6"
          >
            <h2 className="text-lg text-amber-400 font-medium mb-2">
              {currentMeta.title}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              {currentMeta.description}
            </p>

            {/* Practice */}
            <div className="bg-slate-800/40 rounded-lg p-4 mb-4">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1.5">
                This week&apos;s practice
              </p>
              <p className="text-slate-300 text-sm leading-relaxed">
                {currentMeta.practicePrompt}
              </p>
            </div>

            {/* Circle info */}
            {currentMeta.circleTheme !== 'No circle this week.' && (
              <div className="bg-slate-800/40 rounded-lg p-4 mb-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1.5">
                  Circle theme
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {currentMeta.circleTheme}
                </p>
              </div>
            )}

            {/* Next circle session */}
            {nextCircle && (
              <div className="flex items-center gap-3 text-sm text-slate-400 mt-3">
                <Calendar className="w-4 h-4" />
                <span>
                  Next circle: {new Date(nextCircle.scheduledStart).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })} at {new Date(nextCircle.scheduledStart).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
                {nextCircle.locationType === 'video' && (
                  <Video className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>
            )}

            {/* MAIA link */}
            <div className="mt-5 pt-4 border-t border-slate-800/50">
              <Link
                href="/maia"
                className="flex items-center gap-2 text-sm text-amber-400/80 hover:text-amber-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Reflect with MAIA
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Reflection editor for current week */}
        {passage.currentWeek !== 'week_0' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <ReflectionEditor
              week={passage.currentWeek}
              existing={passage.reflections[passage.currentWeek]?.text || ''}
              value={editingWeek === passage.currentWeek ? reflectionText : (passage.reflections[passage.currentWeek]?.text || '')}
              isEditing={editingWeek === passage.currentWeek}
              saving={saving}
              onStartEdit={() => {
                setEditingWeek(passage.currentWeek);
                setReflectionText(passage.reflections[passage.currentWeek]?.text || '');
              }}
              onCancel={() => { setEditingWeek(null); setReflectionText(''); }}
              onChange={setReflectionText}
              onSave={() => saveReflection(passage.currentWeek)}
            />
          </motion.div>
        )}

        {/* Week 6: accountability statement */}
        {passage.currentWeek === 'week_6' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="bg-slate-900/40 border border-slate-800/50 rounded-lg p-5">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">
                Your statement
              </p>
              <textarea
                value={statementText}
                onChange={e => setStatementText(e.target.value)}
                placeholder="In your own words. As short as possible."
                className="w-full bg-transparent text-slate-300 text-sm leading-relaxed resize-none min-h-[80px] outline-none placeholder:text-slate-600"
                rows={3}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={saveStatement}
                  disabled={saving || !statementText.trim()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-md text-sm hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* All weeks */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <WeekList
            passage={passage}
            weekMeta={weekMeta}
            editingWeek={editingWeek}
            reflectionText={reflectionText}
            onEdit={(week, text) => {
              setEditingWeek(week);
              setReflectionText(text);
            }}
            onCancelEdit={() => { setEditingWeek(null); setReflectionText(''); }}
            onSave={saveReflection}
            saving={saving}
          />
        </motion.div>

        {/* Export */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={exportReflections}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-400 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Export my reflections
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-6 text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────

function WeekList({
  passage,
  weekMeta,
  editingWeek,
  reflectionText,
  onEdit,
  onCancelEdit,
  onSave,
  saving,
  readOnly = false,
}: {
  passage: ThresholdPassage;
  weekMeta: Record<string, WeekMeta>;
  editingWeek: string | null;
  reflectionText: string;
  onEdit: (week: string, text: string) => void;
  onCancelEdit: () => void;
  onSave: (week: string) => void;
  saving: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-slate-600 text-xs uppercase tracking-wider mb-3">
        Passage
      </p>
      {WEEK_ORDER.map((week) => {
        const meta = weekMeta[week];
        if (!meta) return null;

        const status = getWeekStatus(week, passage.currentWeek);
        const reflection = passage.reflections[week];

        return (
          <div
            key={week}
            className={`
              flex items-start gap-3 py-3 px-4 rounded-lg
              ${status === 'current' ? 'bg-slate-900/40 border border-slate-800/50' : ''}
              ${status === 'upcoming' ? 'opacity-40' : ''}
            `}
          >
            {/* Status icon */}
            <div className="mt-0.5">
              {status === 'completed' ? (
                <Check className="w-4 h-4 text-amber-500/60" />
              ) : status === 'current' ? (
                <Circle className="w-4 h-4 text-amber-400" />
              ) : (
                <Minus className="w-4 h-4 text-slate-700" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${status === 'current' ? 'text-white' : 'text-slate-400'}`}>
                {meta.title}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {meta.description}
              </p>

              {/* Show saved reflection */}
              {reflection && status === 'completed' && !readOnly && (
                <p className="text-xs text-slate-500 mt-2 italic line-clamp-2">
                  &ldquo;{reflection.text.substring(0, 120)}{reflection.text.length > 120 ? '...' : ''}&rdquo;
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReflectionEditor({
  week,
  existing,
  value,
  isEditing,
  saving,
  onStartEdit,
  onCancel,
  onChange,
  onSave,
}: {
  week: string;
  existing: string;
  value: string;
  isEditing: boolean;
  saving: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onChange: (v: string) => void;
  onSave: () => void;
}) {
  if (!isEditing && !existing) {
    return (
      <button
        onClick={onStartEdit}
        className="w-full text-left bg-slate-900/30 border border-dashed border-slate-800/50 rounded-lg p-4 text-sm text-slate-500 hover:border-slate-700 hover:text-slate-400 transition-colors"
      >
        Write your reflection for this week...
      </button>
    );
  }

  if (!isEditing && existing) {
    return (
      <div className="bg-slate-900/30 border border-slate-800/30 rounded-lg p-4">
        <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">
          Your reflection
        </p>
        <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
          {existing}
        </p>
        <button
          onClick={onStartEdit}
          className="text-xs text-slate-600 hover:text-slate-400 mt-3 transition-colors"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800/50 rounded-lg p-4">
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Your words. No one sees this unless you choose to share."
        className="w-full bg-transparent text-slate-300 text-sm leading-relaxed resize-none min-h-[120px] outline-none placeholder:text-slate-600"
        rows={5}
        autoFocus
      />
      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-400 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving || !value.trim()}
          className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-md text-sm hover:bg-amber-500/20 transition-colors disabled:opacity-50"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <Save className="w-3.5 h-3.5" />
          Save
        </button>
      </div>
    </div>
  );
}
