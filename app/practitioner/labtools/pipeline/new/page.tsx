'use client';

/**
 * New Opportunity Page
 * Create a new pipeline opportunity
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';

interface Person {
  id: string;
  displayName: string;
  company: string | null;
}

interface Venture {
  id: string;
  name: string;
}

const OPPORTUNITY_TYPES = [
  { value: 'sale', label: 'Sale' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'investment', label: 'Investment' },
  { value: 'referral', label: 'Referral' },
  { value: 'collaboration', label: 'Collaboration' },
];

const STAGES = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'nurturing', label: 'Nurturing' },
];

const SOURCES = [
  { value: 'referral', label: 'Referral' },
  { value: 'website', label: 'Website' },
  { value: 'conference', label: 'Conference' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'network', label: 'Network' },
  { value: 'other', label: 'Other' },
];

function NewOpportunityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPersonId = searchParams.get('personId');
  const preselectedVentureId = searchParams.get('ventureId');

  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [ventures, setVentures] = useState<Venture[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [opportunityType, setOpportunityType] = useState('sale');
  const [stage, setStage] = useState('lead');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [probability, setProbability] = useState('50');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [source, setSource] = useState('');
  const [personId, setPersonId] = useState(preselectedPersonId || '');
  const [ventureId, setVentureId] = useState(preselectedVentureId || '');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const practicesRes = await apiFetch('/api/practitioner/practices');
        if (!practicesRes.ok) throw new Error('Failed to load practice');
        const { practices } = await practicesRes.json();
        if (practices.length === 0) {
          router.push('/practitioner/dashboard');
          return;
        }
        setPracticeId(practices[0].id);

        // Load contacts and ventures for selection
        const [peopleRes, venturesRes] = await Promise.all([
          apiFetch(`/api/practitioner/practices/${practices[0].id}/labtools/network`),
          apiFetch(`/api/practitioner/practices/${practices[0].id}/labtools/ventures`),
        ]);

        if (peopleRes.ok) {
          const { contacts } = await peopleRes.json();
          setPeople(contacts);
        }

        if (venturesRes.ok) {
          const { ventures: v } = await venturesRes.json();
          setVentures(v);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, preselectedPersonId, preselectedVentureId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceId || !title) return;

    setIsSaving(true);
    setError(null);

    try {
      const res = await apiFetch(
        `/api/practitioner/practices/${practiceId}/labtools/pipeline`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description: description || null,
            opportunityType,
            stage,
            estimatedValueCents: estimatedValue ? Math.round(parseFloat(estimatedValue) * 100) : null,
            probability: parseInt(probability),
            expectedCloseDate: expectedCloseDate || null,
            source: source || null,
            personId: personId || null,
            ventureId: ventureId || null,
            notes: notes || null,
          }),
        }
      );

      if (!res.ok) throw new Error('Failed to create opportunity');

      const { id } = await res.json();
      router.push(`/practitioner/labtools/pipeline/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-48" />
          <div className="h-96 bg-gray-800 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <header className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/practitioner/labtools/pipeline')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-medium text-white">New Opportunity</h1>
      </header>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Enterprise partnership with Acme Corp"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Type & Stage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type</label>
              <select
                value={opportunityType}
                onChange={(e) => setOpportunityType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                {OPPORTUNITY_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                {STAGES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Value & Probability */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Estimated Value (USD)</label>
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="e.g., 10000"
                min="0"
                step="0.01"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Probability (%)</label>
              <input
                type="number"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                min="0"
                max="100"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>

          {/* Expected Close Date */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Expected Close Date</label>
            <input
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Select source...</option>
              {SOURCES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's the opportunity about?"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Relationships */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-medium text-gray-400">Relationships</h2>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Contact</label>
            <select
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Select contact...</option>
              {people.map(p => (
                <option key={p.id} value={p.id}>
                  {p.displayName}{p.company ? ` (${p.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Venture</label>
            <select
              value={ventureId}
              onChange={(e) => setVentureId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Select venture...</option>
              {ventures.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <label className="block text-sm text-gray-400 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Next steps, context, history..."
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/practitioner/labtools/pipeline')}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || !title}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg"
          >
            {isSaving ? 'Creating...' : 'Create Opportunity'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewOpportunityPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-48" />
          <div className="h-96 bg-gray-800 rounded-lg" />
        </div>
      </div>
    }>
      <NewOpportunityContent />
    </Suspense>
  );
}
