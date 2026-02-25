'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ArrowLeft, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { ROLE_LABELS, type RelationshipRole } from '@/lib/studio/relationships/types';

const ROLES: RelationshipRole[] = ['child', 'partner', 'parent', 'friend', 'cofounder', 'sibling', 'other'];

export default function NewRelationshipPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showBirthData, setShowBirthData] = useState(false);

  const [personName, setPersonName] = useState('');
  const [role, setRole] = useState<RelationshipRole>('child');
  const [ageYears, setAgeYears] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocationName, setBirthLocationName] = useState('');
  const [notes, setNotes] = useState('');

  const isValid = personName.trim();

  async function handleSave() {
    if (!isValid) return;
    setSaving(true);

    try {
      const res = await apiFetch('/api/studio/relationships', {
        method: 'POST',
        body: JSON.stringify({
          personName: personName.trim(),
          role,
          ageYears: ageYears ? parseInt(ageYears) : null,
          birthDate: birthDate || null,
          birthTime: birthTime || null,
          birthLocationName: birthLocationName || null,
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to create');
        return;
      }

      const { relationship } = await res.json();
      router.push(`/studio/relationships/${relationship.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/studio/relationships" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-light text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-amber-400" />
            Add Person
          </h1>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Name</label>
            <input
              type="text"
              value={personName}
              onChange={e => setPersonName(e.target.value)}
              placeholder="Who is this person?"
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm text-slate-300 mb-3">Relationship</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`px-3 py-2 text-xs rounded-lg border text-center transition-colors ${
                    role === r
                      ? 'border-amber-500/50 bg-amber-900/20 text-amber-100'
                      : 'border-slate-800/60 bg-slate-900/30 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Age</label>
            <input
              type="number"
              value={ageYears}
              onChange={e => setAgeYears(e.target.value)}
              placeholder="Years old"
              min="0"
              max="120"
              className="w-32 px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Anything you want to remember about this relationship..."
              rows={3}
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none resize-none"
            />
          </div>

          {/* Birth Data (collapsible) */}
          <div>
            <button
              onClick={() => setShowBirthData(!showBirthData)}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showBirthData ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Add birth data (for future astrology)
            </button>

            {showBirthData && (
              <div className="mt-3 space-y-4 pl-6 border-l border-slate-800">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Birth Date</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="w-48 px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Birth Time (if known)</label>
                  <input
                    type="time"
                    value={birthTime}
                    onChange={e => setBirthTime(e.target.value)}
                    className="w-36 px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Birth Location</label>
                  <input
                    type="text"
                    value={birthLocationName}
                    onChange={e => setBirthLocationName(e.target.value)}
                    placeholder="City, State/Country"
                    className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleSave}
              disabled={!isValid || saving}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
