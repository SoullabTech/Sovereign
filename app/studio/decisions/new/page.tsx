'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Scale,
  ArrowLeft,
  Sparkles,
  Save,
  User,
  Users,
  Building,
  Crown,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { GitBranch } from 'lucide-react';
import {
  SITUATION_TYPE_LIST,
  SITUATION_CONFIGS,
  type SituationType,
} from '@/lib/studio/leadership/situationTypes';

interface ClientOption {
  id: string;
  name: string;
  clientTypes: string[];
}

const TIME_PRESSURES = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const SITUATION_ICONS: Record<string, typeof User> = {
  User, Users, Building, Crown, Eye,
};

export default function NewDecisionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams?.get('parent') || null;
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [consulting, setConsulting] = useState(false);
  const [parentTitle, setParentTitle] = useState<string | null>(null);

  const [situationType, setSituationType] = useState<SituationType>('individual');
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [clientId, setClientId] = useState('');
  const [stakes, setStakes] = useState('');
  const [timePressure, setTimePressure] = useState('none');
  const [emotionalState, setEmotionalState] = useState('');

  const config = SITUATION_CONFIGS[situationType];

  useEffect(() => {
    loadClients();
    if (parentId) loadParent(parentId);
  }, []);

  async function loadParent(pid: string) {
    try {
      const res = await apiFetch(`/api/studio/decisions/${pid}`);
      if (res.ok) {
        const { decision } = await res.json();
        setParentTitle(decision.title);
        // Pre-fill from parent
        if (decision.situationType) setSituationType(decision.situationType);
        if (decision.clientId) setClientId(decision.clientId);
        // Pre-fill context with parent's recommendation
        if (decision.councilResult?.recommendation) {
          setContext(`Continuing from: "${decision.title}"\n\nPrior recommendation: ${decision.councilResult.recommendation}\n\n`);
        }
      }
    } catch {
      // Parent not found — proceed as standalone
    }
  }

  // Auto-set situation type when a leadership client is selected
  useEffect(() => {
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client?.clientTypes.includes('leadership') && situationType === 'individual') {
        setSituationType('leadership');
      }
    }
  }, [clientId, clients, situationType]);

  async function loadClients() {
    const res = await apiFetch('/api/studio/clients?limit=200');
    if (res.ok) {
      const data = await res.json();
      setClients(
        (data.clients || []).map((c: { id: string; name: string; clientTypes?: string[] }) => ({
          id: c.id,
          name: c.name,
          clientTypes: c.clientTypes || [],
        }))
      );
    }
  }

  async function handleSave(andConsult: boolean) {
    if (!title.trim() || !context.trim()) return;

    if (andConsult) {
      setConsulting(true);
    } else {
      setSaving(true);
    }

    try {
      const createRes = await apiFetch('/api/studio/decisions', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          context: context.trim(),
          clientId: clientId || null,
          stakes: stakes.trim() || null,
          timePressure,
          emotionalState: emotionalState.trim() || null,
          situationType,
          parentDecisionId: parentId || undefined,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        alert(err.error || 'Failed to create decision');
        return;
      }

      const { decision } = await createRes.json();

      if (andConsult) {
        const consultRes = await apiFetch(`/api/studio/decisions/${decision.id}/consult`, {
          method: 'POST',
        });

        if (!consultRes.ok) {
          router.push(`/studio/decisions/${decision.id}`);
          return;
        }
      }

      router.push(`/studio/decisions/${decision.id}`);
    } finally {
      setSaving(false);
      setConsulting(false);
    }
  }

  const sortedClients = [...clients].sort((a, b) => {
    const aLeader = a.clientTypes.includes('leadership') ? 0 : 1;
    const bLeader = b.clientTypes.includes('leadership') ? 0 : 1;
    return aLeader - bLeader || a.name.localeCompare(b.name);
  });

  const isValid = title.trim() && context.trim();

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/studio/decisions" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-light text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            New Decision
          </h1>
        </div>

        <div className="space-y-6">
          {/* Parent Decision Banner */}
          {parentTitle && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-amber-800/30 bg-amber-950/10">
              <GitBranch className="w-4 h-4 text-amber-400/70 flex-shrink-0" />
              <p className="text-sm text-amber-200/70">
                Continuing from: <Link href={`/studio/decisions/${parentId}`} className="text-amber-300 hover:underline underline-offset-2">{parentTitle}</Link>
              </p>
            </div>
          )}

          {/* Situation Type — The Quiet Decision Point */}
          <div>
            <label className="block text-sm text-slate-300 mb-3">What are you working with?</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SITUATION_TYPE_LIST.map(type => {
                const cfg = SITUATION_CONFIGS[type];
                const Icon = SITUATION_ICONS[cfg.icon] || User;
                const selected = situationType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSituationType(type)}
                    className={`flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-colors ${
                      selected
                        ? 'border-amber-500/50 bg-amber-900/20 text-amber-100'
                        : 'border-slate-800/60 bg-slate-900/30 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${selected ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span className="text-xs font-medium">{cfg.label}</span>
                    </div>
                    <span className="text-[10px] leading-tight text-slate-500">{cfg.description}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-600 mt-2">This tunes the council&apos;s language and default lenses. You still decide what to keep.</p>
          </div>

          {/* Client */}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Client (optional)</label>
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-amber-500/50 focus:outline-none"
            >
              <option value="">No client</option>
              {sortedClients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.clientTypes.includes('leadership') ? ' (leadership)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Decision Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What is the decision?"
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          {/* Context */}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Context</label>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Describe the situation, background, and what is being faced..."
              rows={5}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none resize-none"
            />
          </div>

          {/* Stakes */}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">What&apos;s at stake?</label>
            <textarea
              value={stakes}
              onChange={e => setStakes(e.target.value)}
              placeholder={config.contextLabels.stakesPlaceholder}
              rows={2}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Time Pressure */}
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Time Pressure</label>
              <select
                value={timePressure}
                onChange={e => setTimePressure(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-amber-500/50 focus:outline-none"
              >
                {TIME_PRESSURES.map(tp => (
                  <option key={tp.value} value={tp.value}>{tp.label}</option>
                ))}
              </select>
            </div>

            {/* Emotional State — label shifts per situation type */}
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">{config.contextLabels.stateLabel}</label>
              <input
                type="text"
                value={emotionalState}
                onChange={e => setEmotionalState(e.target.value)}
                placeholder={situationType === 'self' ? 'Activated, avoidant, pulled to rescue...' : 'Anxious, overconfident, avoidant...'}
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => handleSave(false)}
              disabled={!isValid || saving || consulting}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-600 text-slate-300 rounded-lg hover:border-amber-500/50 hover:text-amber-200 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={!isValid || saving || consulting}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {consulting ? 'Consulting Council...' : 'Consult Council'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
