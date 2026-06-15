'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Wind, Save, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import ChangeLandscape from '@/components/studio/changes/ChangeLandscape';
import HexagramCaster from '@/components/studio/changes/HexagramCaster';
import type { ChangeTypeName } from '@/lib/studio/changes/changeTypes';
import { getChangeTypeConfig } from '@/lib/studio/changes/changeTypes';

interface ClientOption {
  id: string;
  name: string;
}

const URGENCY_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'acute', label: 'Acute' },
];

export default function NewChangePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams?.get('parent') || null;

  // State
  const [step, setStep] = useState<'type' | 'context' | 'hexagram'>('type');
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [consulting, setConsulting] = useState(false);
  const [parentTitle, setParentTitle] = useState<string | null>(null);

  // Form data
  const [changeType, setChangeType] = useState<ChangeTypeName | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [urgency, setUrgency] = useState('none');
  const [emotionalState, setEmotionalState] = useState('');
  const [hexagramNumber, setHexagramNumber] = useState<number | null>(null);
  const [changingLines, setChangingLines] = useState<number[]>([]);
  const [relatingHexagramNumber, setRelatingHexagramNumber] = useState<number | null>(null);
  const [castingMethod, setCastingMethod] = useState<'yarrow' | 'coin' | 'browsed' | null>(null);

  const config = changeType ? getChangeTypeConfig(changeType) : null;

  useEffect(() => {
    loadClients();
    if (parentId) loadParent(parentId);
  }, [parentId]);

  async function loadParent(pid: string) {
    try {
      const res = await apiFetch(`/api/studio/changes/${pid}`);
      if (res.ok) {
        const { change } = await res.json();
        setParentTitle(change.title);
        // Pre-fill from parent
        if (change.changeType) setChangeType(change.changeType);
        if (change.clientId) setClientId(change.clientId);
        // Pre-fill description with parent's context
        if (change.councilResult?.recommendation) {
          setDescription(`Continuing from: "${change.title}"\n\nPrior guidance: ${change.councilResult.recommendation}\n\n`);
        }
      }
    } catch {
      // Parent not found, proceed as standalone
    }
  }

  async function loadClients() {
    const res = await apiFetch('/api/studio/clients?limit=200');
    if (res.ok) {
      const data = await res.json();
      setClients(
        (data.clients || []).map((c: { id: string; name: string }) => ({
          id: c.id,
          name: c.name,
        }))
      );
    }
  }

  async function handleSave(andConsult: boolean) {
    if (!changeType || !title.trim() || !description.trim()) return;

    if (andConsult) {
      setConsulting(true);
    } else {
      setSaving(true);
    }

    try {
      // Scope new changes to the active co-lab (Cut A). Source = TeamContextProvider's
      // 'studio_team_context' localStorage key; null = personal scope.
      let teamId: string | null = null;
      try { teamId = JSON.parse(localStorage.getItem('studio_team_context') || '{}')?.teamId ?? null; } catch {}
      const createRes = await apiFetch('/api/studio/changes', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          changeType,
          clientId: clientId || null,
          teamId,
          urgency: urgency !== 'none' ? urgency : null,
          emotionalState: emotionalState.trim() || null,
          hexagramNumber: hexagramNumber || null,
          changingLines: changingLines.length > 0 ? changingLines : null,
          relatingHexagramNumber: relatingHexagramNumber || null,
          castingMethod: castingMethod || null,
          parentChangeId: parentId || undefined,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        alert(err.error || 'Failed to create change');
        return;
      }

      const { change } = await createRes.json();

      if (andConsult) {
        const consultRes = await apiFetch(`/api/studio/changes/${change.id}/consult`, {
          method: 'POST',
        });

        if (!consultRes.ok) {
          router.push(`/studio/changes/${change.id}`);
          return;
        }
      }

      router.push(`/studio/changes/${change.id}`);
    } finally {
      setSaving(false);
      setConsulting(false);
    }
  }

  const isValid = changeType && title.trim() && description.trim();

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/studio/changes" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-light text-white flex items-center gap-2">
            <Wind className="w-5 h-5 text-cyan-400" />
            New Change
          </h1>
        </div>

        {/* Parent Change Banner */}
        {parentTitle && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-cyan-800/30 bg-cyan-950/10 mb-6">
            <Wind className="w-4 h-4 text-cyan-400/70 flex-shrink-0" />
            <p className="text-sm text-cyan-200/70">
              Continuing from: <Link href={`/studio/changes/${parentId}`} className="text-cyan-300 hover:underline underline-offset-2">{parentTitle}</Link>
            </p>
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {['type', 'context', 'hexagram'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (s === 'type' || (s === 'context' && changeType)) {
                    setStep(s as any);
                  }
                }}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  step === s
                    ? 'bg-amber-600/30 text-amber-200 border border-amber-500/30'
                    : changeType || s === 'type'
                    ? 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
                    : 'bg-slate-900/50 text-slate-600 border border-slate-800/30'
                }`}
                disabled={s === 'context' && !changeType}
              >
                {i + 1}. {s === 'type' ? 'Type' : s === 'context' ? 'Context' : 'I Ching (Book of Changes)'}
              </button>
              {i < 2 && <div className="w-4 h-px bg-slate-800" />}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Step 1: Change Type Selection */}
          {step === 'type' && (
            <div>
              <h2 className="text-sm text-slate-300 mb-3">What nature of change is this?</h2>
              <ChangeLandscape
                selected={changeType}
                onSelect={(type) => {
                  setChangeType(type);
                  setTimeout(() => setStep('context'), 300);
                }}
              />
            </div>
          )}

          {/* Step 2: Context Form */}
          {step === 'context' && changeType && config && (
            <>
              {/* Client */}
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Client (optional)</label>
                <select
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
                >
                  <option value="">No client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Change Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="What is the change?"
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={config.contextLabels.descriptionPlaceholder}
                  rows={5}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Urgency */}
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Urgency</label>
                  <select
                    value={urgency}
                    onChange={e => setUrgency(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
                  >
                    {URGENCY_OPTIONS.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>

                {/* Emotional State */}
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">{config.contextLabels.stateLabel}</label>
                  <input
                    type="text"
                    value={emotionalState}
                    onChange={e => setEmotionalState(e.target.value)}
                    placeholder="How does this feel?"
                    className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setStep('type')}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={!isValid || saving || consulting}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-600 text-slate-300 rounded-lg hover:border-cyan-500/50 hover:text-cyan-200 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={!isValid || saving || consulting}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {consulting ? 'Consulting...' : 'Consult Council'}
                </button>
                <button
                  onClick={() => setStep('hexagram')}
                  disabled={!isValid}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-amber-700/50 text-amber-300 rounded-lg hover:border-amber-500/60 hover:bg-amber-950/20 disabled:opacity-50 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  I Ching (Book of Changes)
                </button>
              </div>
            </>
          )}

          {/* Step 3: Optional I Ching Cast */}
          {step === 'hexagram' && changeType && config && (
            <>
              <div className="rounded-lg border border-slate-800/60 bg-slate-900/30 p-4">
                <h2 className="text-sm text-slate-300 mb-2">Cast the I Ching (optional)</h2>
                <p className="text-xs text-slate-500 mb-4">
                  The oracle can enrich your understanding. You can also skip this and cast later.
                </p>

                <HexagramCaster
                  changeId="pending"
                  onCast={(result) => {
                    setHexagramNumber(result.hexagramNumber);
                    setChangingLines(result.changingLines);
                    setRelatingHexagramNumber(result.relatingHexagramNumber);
                    setCastingMethod(result.castingMethod as any);
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => setStep('context')}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={!isValid || saving || consulting}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-600 text-slate-300 rounded-lg hover:border-cyan-500/50 hover:text-cyan-200 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={!isValid || saving || consulting}
                  className="flex items-center gap-2 px-5 py-2 text-sm bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {consulting ? 'Consulting...' : 'Consult Council'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
