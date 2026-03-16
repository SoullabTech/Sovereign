'use client';

/**
 * Council Synthesis Panel
 *
 * Surfaces in the Studio session detail page for completed/in-progress sessions.
 * Practitioner manually triggers three-lens AI synthesis, edits the drafts,
 * writes a final synthesis, then saves it to the session record.
 *
 * Design principle: AI generates starting material. Practitioner judgment governs
 * what gets saved. The saved synthesis feeds longitudinal case records.
 *
 * Three lenses:
 *   psychological — defenses, affect, relational dynamics
 *   spiralogic    — element movement, phase indicators, developmental arc
 *   symbolic      — archetypal themes, recurring images, mythic resonance
 */

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  Sparkles,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';

interface SynthesisDrafts {
  psychological: string | null;
  spiralogic: string | null;
  symbolic: string | null;
}

interface SynthesisState {
  drafts: SynthesisDrafts;
  final: string | null;
  generatedAt: string | null;
  savedAt: string | null;
}

interface Props {
  sessionId: string;
  hasNotes: boolean;
}

const LENS_CONFIG: {
  key: keyof SynthesisDrafts;
  label: string;
  color: string;
  borderColor: string;
  prefix: string;
}[] = [
  {
    key: 'psychological',
    label: 'Psychological',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/20',
    prefix: 'Psychologically,',
  },
  {
    key: 'spiralogic',
    label: 'Spiralogic',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    prefix: 'Spirally,',
  },
  {
    key: 'symbolic',
    label: 'Symbolic',
    color: 'text-violet-400',
    borderColor: 'border-violet-500/20',
    prefix: 'Symbolically,',
  },
];

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function CouncilSynthesisPanel({ sessionId, hasNotes }: Props) {
  const [synthesis, setSynthesis] = useState<SynthesisState | null>(null);
  const [drafts, setDrafts] = useState<SynthesisDrafts>({
    psychological: null,
    spiralogic: null,
    symbolic: null,
  });
  const [final, setFinal] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/studio/sessions/${sessionId}/synthesis`);
      if (!res.ok) {
        if (res.status === 404) return; // session not found — no synthesis yet
        throw new Error('Failed to load synthesis');
      }
      const data: SynthesisState = await res.json();
      setSynthesis(data);
      setDrafts(data.drafts);
      if (data.final) setFinal(data.final);
      if (data.savedAt) setSavedAt(data.savedAt);
      if (data.drafts.psychological || data.drafts.spiralogic || data.drafts.symbolic) {
        setExpanded(true);
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Load failed');
    }
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  async function generate() {
    setGenerating(true);
    setGenerateError(null);
    try {
      const res = await apiFetch(`/api/studio/sessions/${sessionId}/synthesis`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }
      setDrafts(data.drafts);
      setSynthesis(prev => ({
        ...(prev ?? { final: null, savedAt: null }),
        drafts: data.drafts,
        generatedAt: data.generatedAt,
        final: prev?.final ?? null,
        savedAt: prev?.savedAt ?? null,
      }));
      // Pre-populate final textarea with the three drafts joined, if empty
      if (!final.trim()) {
        const joined = [data.drafts.psychological, data.drafts.spiralogic, data.drafts.symbolic]
          .filter(Boolean)
          .join('\n\n');
        setFinal(joined);
      }
      setExpanded(true);
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (!final.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await apiFetch(`/api/studio/sessions/${sessionId}/synthesis`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          final: final.trim(),
          psychological: drafts.psychological,
          spiralogic: drafts.spiralogic,
          symbolic: drafts.symbolic,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Save failed');
      }
      setSavedAt(data.savedAt);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const hasDrafts = drafts.psychological || drafts.spiralogic || drafts.symbolic;
  const generatedAt = synthesis?.generatedAt ?? null;

  return (
    <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="flex items-center gap-2 text-sm font-medium text-white">
          <Sparkles className="w-4 h-4 text-violet-400" />
          Council Synthesis
        </h2>
        {savedAt && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Saved {formatTimestamp(savedAt)}
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Three-lens AI analysis — psychological, Spiralogic, symbolic. Edit before saving.
      </p>

      {loadError && (
        <div className="text-xs text-red-400 mb-3">{loadError}</div>
      )}

      {/* Generate button */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={generate}
          disabled={generating || !hasNotes}
          title={!hasNotes ? 'Add session notes before generating synthesis' : undefined}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
        >
          {generating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : hasDrafts ? (
            <RefreshCw className="w-3.5 h-3.5" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {generating ? 'Generating…' : hasDrafts ? 'Regenerate' : 'Generate Synthesis'}
        </button>

        {hasDrafts && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Collapse' : 'Show drafts'}
          </button>
        )}

        {generatedAt && (
          <span className="text-xs text-slate-600 ml-auto">
            Generated {formatTimestamp(generatedAt)}
          </span>
        )}
      </div>

      {generateError && (
        <div className="flex items-center gap-2 text-xs text-red-400 mb-3">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {generateError}
        </div>
      )}

      {/* Three lens drafts (collapsible) */}
      {expanded && hasDrafts && (
        <div className="space-y-3 mb-5">
          {LENS_CONFIG.map(({ key, label, color, borderColor }) => {
            const text = drafts[key];
            if (!text) return null;
            return (
              <div
                key={key}
                className={`rounded-lg border ${borderColor} bg-slate-900/30 p-3`}
              >
                <div className={`text-[10px] font-semibold uppercase tracking-wider ${color} mb-2`}>
                  {label}
                </div>
                <textarea
                  value={text}
                  onChange={e =>
                    setDrafts(prev => ({ ...prev, [key]: e.target.value }))
                  }
                  rows={5}
                  className="w-full text-sm text-slate-300 bg-transparent resize-y focus:outline-none leading-relaxed"
                  placeholder={`${label} analysis…`}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Final synthesis — visible whenever drafts exist or final saved */}
      {(hasDrafts || savedAt) && (
        <div>
          <div className="text-xs text-slate-500 mb-2">
            Your synthesis
            <span className="ml-1 text-slate-600">— edit freely, this is what gets saved</span>
          </div>
          <textarea
            value={final}
            onChange={e => setFinal(e.target.value)}
            rows={7}
            className="w-full text-sm text-slate-200 bg-slate-900/40 border border-slate-700/40 rounded-lg p-3 resize-y focus:outline-none focus:border-violet-500/40 leading-relaxed placeholder:text-slate-600"
            placeholder="Write your synthesis here. Use the AI drafts above as starting material — your judgment governs what gets saved."
          />

          <div className="flex items-center justify-between mt-3">
            <div>
              {saveError && (
                <div className="flex items-center gap-1.5 text-xs text-red-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {saveError}
                </div>
              )}
            </div>
            <button
              onClick={save}
              disabled={saving || !final.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saving ? 'Saving…' : 'Save Synthesis'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
