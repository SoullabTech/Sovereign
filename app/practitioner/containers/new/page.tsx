'use client';

/**
 * New Container Page
 * Create a new relational commitment.
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDevMemberId } from '@/lib/practitioner/memberClient';
import { practitionerFetch } from '@/lib/practitioner/memberClient';

type Person = {
  id: string;
  displayName: string;
  email: string | null;
};

const CONTAINER_TYPES = [
  { value: '1:1', label: '1:1', description: 'Individual work' },
  { value: 'couple', label: 'Couple', description: 'Two people in relationship' },
  { value: 'family', label: 'Family', description: 'Family system' },
  { value: 'group', label: 'Group', description: 'Multiple unrelated participants' },
  { value: 'supervision', label: 'Supervision', description: 'Professional oversight' },
  { value: 'consultation', label: 'Consultation', description: 'One-time or brief engagement' },
];

const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Private', description: 'Only you can see' },
  { value: 'shared', label: 'Shared', description: 'Visible to participants' },
];

function NewContainerContent() {
  const router = useRouter();
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [type, setType] = useState('1:1');
  const [scope, setScope] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);

  useEffect(() => {
    const id = getDevMemberId();
    if (!id) {
      router.push('/signin');
      return;
    }

    // Load practice and people
    (async () => {
      try {
        const practicesRes = await practitionerFetch<{ practices: { id: string }[] }>(
          '/api/practitioner/practices'
        );
        const pid = practicesRes.practices?.[0]?.id;
        if (!pid) {
          setError('No practice found');
          setLoading(false);
          return;
        }
        setPracticeId(pid);

        const peopleRes = await practitionerFetch<{ people: Person[] }>(
          `/api/practitioner/practices/${pid}/people`
        );
        setPeople(peopleRes.people || []);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
        setLoading(false);
      }
    })();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceId) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await practitionerFetch<{ success: boolean; container: { id: string } }>(
        `/api/practitioner/practices/${practiceId}/containers`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            scope: scope.trim() || null,
            visibility,
            participants: selectedPeople.map(personId => ({ personId, role: 'client' })),
          }),
        }
      );

      if (res.success && res.container?.id) {
        router.push(`/practitioner/containers/${res.container.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create container');
      setSubmitting(false);
    }
  };

  const togglePerson = (personId: string) => {
    setSelectedPeople(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/practitioner/containers')}
            className="text-sm text-gray-500 hover:text-gray-300 mb-2"
          >
            ← Containers
          </button>
          <h1 className="text-2xl font-medium text-white">New Container</h1>
          <p className="text-sm text-gray-500">Create a relational commitment.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Container Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CONTAINER_TYPES.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    type === opt.value
                      ? 'border-amber-500/50 bg-amber-500/10'
                      : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className={`font-medium ${type === opt.value ? 'text-amber-400' : 'text-white'}`}>
                    {opt.label}
                  </div>
                  <div className={`text-xs ${type === opt.value ? 'text-amber-400/70' : 'text-gray-500'}`}>
                    {opt.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scope */}
          <div>
            <label htmlFor="scope" className="block text-sm font-medium text-gray-300 mb-2">
              Scope <span className="text-gray-500">(optional)</span>
            </label>
            <input
              id="scope"
              type="text"
              value={scope}
              onChange={e => setScope(e.target.value)}
              placeholder="e.g., Career Transition, Grief Processing..."
              className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-900
                       text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
            />
            <p className="mt-1 text-xs text-gray-500">
              A brief description of the work focus
            </p>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Visibility
            </label>
            <div className="flex gap-3">
              {VISIBILITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVisibility(opt.value)}
                  className={`flex-1 p-3 rounded-lg border text-left transition-colors ${
                    visibility === opt.value
                      ? 'border-amber-500/50 bg-amber-500/10'
                      : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className={`font-medium ${visibility === opt.value ? 'text-amber-400' : 'text-white'}`}>
                    {opt.label}
                  </div>
                  <div className={`text-xs ${visibility === opt.value ? 'text-amber-400/70' : 'text-gray-500'}`}>
                    {opt.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Participants <span className="text-gray-500">(optional)</span>
            </label>
            {people.length === 0 ? (
              <div className="p-4 bg-gray-800/50 rounded-lg text-gray-500 text-sm">
                No people in your practice yet.
                <button
                  type="button"
                  onClick={() => router.push('/practitioner/people/new')}
                  className="ml-2 text-amber-400 hover:underline"
                >
                  Add someone?
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {people.map(person => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => togglePerson(person.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors flex items-center gap-3 ${
                      selectedPeople.includes(person.id)
                        ? 'border-amber-500/50 bg-amber-500/10'
                        : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      selectedPeople.includes(person.id)
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-gray-600'
                    }`}>
                      {selectedPeople.includes(person.id) && (
                        <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className={`font-medium ${selectedPeople.includes(person.id) ? 'text-amber-400' : 'text-white'}`}>
                        {person.displayName}
                      </div>
                      {person.email && (
                        <div className="text-xs text-gray-500">{person.email}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push('/practitioner/containers')}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-700 bg-gray-800
                       text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-3 rounded-lg bg-amber-500 text-black font-medium
                       hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Creating...' : 'Create container'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewContainerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    }>
      <NewContainerContent />
    </Suspense>
  );
}
