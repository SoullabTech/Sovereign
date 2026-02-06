'use client';

/**
 * New Opportunity
 * Create a new opportunity/deal
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Venture {
  id: string;
  name: string;
}

interface Person {
  id: string;
  displayName: string;
  company: string | null;
}

const STAGES = [
  { value: 'lead', label: 'Lead', description: 'Initial contact/interest' },
  { value: 'qualified', label: 'Qualified', description: 'Qualified prospect' },
  { value: 'proposal', label: 'Proposal', description: 'Proposal sent' },
  { value: 'negotiation', label: 'Negotiation', description: 'In negotiation' }
];

function NewOpportunityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedVentureId = searchParams.get('ventureId');

  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ventures, setVentures] = useState<Venture[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState('lead');
  const [valueDollars, setValueDollars] = useState('');
  const [expectedCloseAt, setExpectedCloseAt] = useState('');
  const [ventureId, setVentureId] = useState(preselectedVentureId || '');
  const [personId, setPersonId] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const memberData = localStorage.getItem('beta_user');
        if (!memberData) {
          router.push('/signin');
          return;
        }

        const member = JSON.parse(memberData);
        setMemberId(member.id);

        const practicesRes = await fetch('/api/practitioner/practices', {
          headers: { 'x-member-id': member.id }
        });

        if (!practicesRes.ok) throw new Error('Failed to load practices');

        const { practices } = await practicesRes.json();
        if (practices.length === 0) {
          router.push('/practitioner/dashboard');
          return;
        }

        const practice = practices[0];
        setPracticeId(practice.id);

        // Load ventures
        const venturesRes = await fetch(
          `/api/practitioner/practices/${practice.id}/labtools/ventures?isActive=true`,
          { headers: { 'x-member-id': member.id } }
        );
        if (venturesRes.ok) {
          const { ventures: v } = await venturesRes.json();
          setVentures(v);
        }

        // Load people
        const peopleRes = await fetch(
          `/api/practitioner/practices/${practice.id}/people`,
          { headers: { 'x-member-id': member.id } }
        );
        if (peopleRes.ok) {
          const { people: p } = await peopleRes.json();
          setPeople(p);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [router, preselectedVentureId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!practiceId || !memberId) return;
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    const valueCents = valueDollars ? Math.round(parseFloat(valueDollars) * 100) : 0;

    try {
      const res = await fetch(
        `/api/practitioner/practices/${practiceId}/labtools/opportunities`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-member-id': memberId
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || null,
            stage,
            valueCents,
            expectedCloseAt: expectedCloseAt || null,
            ventureId: ventureId || null,
            personId: personId || null
          })
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create opportunity');
      }

      const { opportunity } = await res.json();
      router.push(`/practitioner/labtools/pipeline/${opportunity.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create opportunity');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-2xl mx-auto px-6 py-8 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
          <div className="h-96 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/practitioner/labtools" className="hover:text-gray-400">
              Labtools
            </Link>
            <span>/</span>
            <Link href="/practitioner/labtools/pipeline" className="hover:text-gray-400">
              Pipeline
            </Link>
            <span>/</span>
            <span className="text-gray-400">New</span>
          </div>
          <h1 className="text-xl font-medium text-white">New Opportunity</h1>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-[#111827] rounded-xl border border-gray-700 p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Enterprise Partnership - Acme Corp"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                         text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Stage and Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-gray-300 mb-2">
                  Stage *
                </label>
                <select
                  id="stage"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                           text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  {STAGES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-300 mb-2">
                  Value ($)
                </label>
                <input
                  id="value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={valueDollars}
                  onChange={(e) => setValueDollars(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                           text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Expected Close */}
            <div>
              <label htmlFor="closeDate" className="block text-sm font-medium text-gray-300 mb-2">
                Expected Close Date
              </label>
              <input
                id="closeDate"
                type="date"
                value={expectedCloseAt}
                onChange={(e) => setExpectedCloseAt(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                         text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about this opportunity..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                         text-white placeholder-gray-500 focus:outline-none focus:border-blue-500
                         resize-none"
              />
            </div>

            {/* Link to Venture */}
            {ventures.length > 0 && (
              <div>
                <label htmlFor="venture" className="block text-sm font-medium text-gray-300 mb-2">
                  Link to Venture
                </label>
                <select
                  id="venture"
                  value={ventureId}
                  onChange={(e) => setVentureId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                           text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">None</option>
                  {ventures.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Link to Person */}
            {people.length > 0 && (
              <div>
                <label htmlFor="person" className="block text-sm font-medium text-gray-300 mb-2">
                  Contact Person
                </label>
                <select
                  id="person"
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                           text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">None</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName}{p.company ? ` (${p.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/practitioner/labtools/pipeline"
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white
                       rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Creating...' : 'Create Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-2xl mx-auto px-6 py-8 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
        <div className="h-96 bg-gray-800 rounded" />
      </div>
    </div>
  );
}

export default function NewOpportunityPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewOpportunityContent />
    </Suspense>
  );
}
