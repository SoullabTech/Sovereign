'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Save, Crown } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type { LeadershipProfile } from '@/lib/studio/leadership/types';

interface Props {
  clientId: string;
  profile: LeadershipProfile | null;
  onUpdate: (profile: LeadershipProfile) => void;
}

const ORG_SIZES = [
  { value: 'startup', label: 'Startup (<10)' },
  { value: '10-50', label: '10-50' },
  { value: '50-200', label: '50-200' },
  { value: '200-500', label: '200-500' },
  { value: '500-1000', label: '500-1000' },
  { value: '1000+', label: '1000+' },
];

const COMPLEXITY_LEVELS = ['low', 'medium', 'high'] as const;

export function LeadershipProfileSection({ clientId, profile, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(!!profile);
  const [editing, setEditing] = useState(!profile);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<LeadershipProfile>(profile || {
    role: '',
    orgName: '',
    orgSize: undefined,
    industry: '',
    decisionDomain: '',
    authorityScope: '',
    stakeholderComplexity: undefined,
    pressureLevel: undefined,
    directReports: undefined,
    boardExposure: false,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/studio/clients', {
        method: 'PATCH',
        body: JSON.stringify({
          id: clientId,
          leadershipProfile: form,
          clientTypes: ['leadership'],
        }),
      });
      if (res.ok) {
        setEditing(false);
        onUpdate(form);
      }
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof LeadershipProfile>(key: K, value: LeadershipProfile[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="border border-amber-900/30 rounded-lg bg-amber-950/20">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-200">Leadership Profile</span>
          {profile?.role && !expanded && (
            <span className="text-xs text-slate-400 ml-2">{profile.role}{profile.orgName ? ` at ${profile.orgName}` : ''}</span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Role"
                  value={form.role}
                  onChange={v => updateField('role', v)}
                  placeholder="CEO, VP Engineering, etc."
                  disabled={!editing}
                />
                <Field
                  label="Organization"
                  value={form.orgName || ''}
                  onChange={v => updateField('orgName', v)}
                  placeholder="Company name"
                  disabled={!editing}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Select
                  label="Org Size"
                  value={form.orgSize || ''}
                  onChange={v => updateField('orgSize', v as LeadershipProfile['orgSize'])}
                  options={ORG_SIZES}
                  disabled={!editing}
                />
                <Field
                  label="Industry"
                  value={form.industry || ''}
                  onChange={v => updateField('industry', v)}
                  placeholder="Tech, Healthcare..."
                  disabled={!editing}
                />
                <Field
                  label="Direct Reports"
                  value={form.directReports?.toString() || ''}
                  onChange={v => updateField('directReports', v ? parseInt(v) : undefined)}
                  placeholder="8"
                  type="number"
                  disabled={!editing}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Decision Domain"
                  value={form.decisionDomain || ''}
                  onChange={v => updateField('decisionDomain', v)}
                  placeholder="Strategy, M&A, People"
                  disabled={!editing}
                />
                <Field
                  label="Authority Scope"
                  value={form.authorityScope || ''}
                  onChange={v => updateField('authorityScope', v)}
                  placeholder="Full P&L, Division..."
                  disabled={!editing}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Stakeholder Complexity"
                  value={form.stakeholderComplexity || ''}
                  onChange={v => updateField('stakeholderComplexity', v as LeadershipProfile['stakeholderComplexity'])}
                  options={COMPLEXITY_LEVELS.map(l => ({ value: l, label: l.charAt(0).toUpperCase() + l.slice(1) }))}
                  disabled={!editing}
                />
                <Select
                  label="Pressure Level"
                  value={form.pressureLevel || ''}
                  onChange={v => updateField('pressureLevel', v as LeadershipProfile['pressureLevel'])}
                  options={COMPLEXITY_LEVELS.map(l => ({ value: l, label: l.charAt(0).toUpperCase() + l.slice(1) }))}
                  disabled={!editing}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="boardExposure"
                  checked={form.boardExposure || false}
                  onChange={e => updateField('boardExposure', e.target.checked)}
                  disabled={!editing}
                  className="rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/30"
                />
                <label htmlFor="boardExposure" className="text-xs text-slate-400">
                  Board exposure
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                {editing ? (
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.role}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1.5 text-xs font-medium rounded border border-slate-600 text-slate-300 hover:border-amber-500/50 hover:text-amber-200 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-2 py-1.5 text-sm bg-slate-800/50 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none disabled:opacity-60"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-2 py-1.5 text-sm bg-slate-800/50 border border-slate-700 rounded text-slate-200 focus:border-amber-500/50 focus:outline-none disabled:opacity-60"
      >
        <option value="">--</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
