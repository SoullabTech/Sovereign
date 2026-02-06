'use client';

/**
 * Network Page
 * View people with business context
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Person {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  relationshipType: string | null;
  tags: string[];
  createdAt: string;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  client: 'Client',
  prospect: 'Prospect',
  partner: 'Partner',
  vendor: 'Vendor',
  team_member: 'Team Member',
  advisor: 'Advisor',
  investor: 'Investor',
  other: 'Other'
};

function PersonCard({ person, onClick }: { person: Person; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#111827] rounded-xl border border-gray-700 p-5
                 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-white font-medium">{person.displayName}</h3>
        {person.relationshipType && (
          <span className="text-xs px-2 py-1 bg-gray-700 text-gray-400 rounded">
            {RELATIONSHIP_LABELS[person.relationshipType] || person.relationshipType}
          </span>
        )}
      </div>

      {(person.company || person.role) && (
        <p className="text-sm text-gray-400 mb-2">
          {person.role}
          {person.role && person.company && ' at '}
          {person.company}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500">
        {person.email && (
          <span className="truncate max-w-[200px]">{person.email}</span>
        )}
        {person.phone && <span>{person.phone}</span>}
      </div>

      {person.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {person.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded"
            >
              {tag}
            </span>
          ))}
          {person.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{person.tags.length - 3}</span>
          )}
        </div>
      )}
    </button>
  );
}

export default function NetworkPage() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadPeople() {
      try {
        const memberData = localStorage.getItem('beta_user');
        if (!memberData) {
          router.push('/signin');
          return;
        }

        const member = JSON.parse(memberData);

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

        // Load people
        const peopleRes = await fetch(
          `/api/practitioner/practices/${practice.id}/people`,
          { headers: { 'x-member-id': member.id } }
        );

        if (!peopleRes.ok) throw new Error('Failed to load people');

        const { people: peopleData } = await peopleRes.json();
        setPeople(peopleData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load network');
      } finally {
        setIsLoading(false);
      }
    }

    loadPeople();
  }, [router]);

  // Filter and search
  const filteredPeople = people.filter(p => {
    if (filter !== 'all' && p.relationshipType !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        p.displayName.toLowerCase().includes(s) ||
        p.company?.toLowerCase().includes(s) ||
        p.email?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  // Get unique relationship types for filter
  const relationshipTypes = [...new Set(people.map(p => p.relationshipType).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
          <div className="space-y-4">
            <div className="h-24 bg-gray-800 rounded" />
            <div className="h-24 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/practitioner/labtools" className="hover:text-gray-400">
              Labtools
            </Link>
            <span>/</span>
            <span className="text-gray-400">Network</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium text-white">Network</h1>
              <p className="text-sm text-gray-500 mt-1">
                {people.length} people in your network
              </p>
            </div>
            <Link
              href="/practitioner/people/new"
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white
                       rounded-lg transition-colors"
            >
              + Add Person
            </Link>
          </div>
        </header>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, company, or email..."
            className="w-full px-4 py-3 bg-[#111827] border border-gray-700 rounded-lg
                     text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            All
          </button>
          {relationshipTypes.map((rt) => (
            <button
              key={rt}
              onClick={() => setFilter(rt!)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === rt
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {RELATIONSHIP_LABELS[rt!] || rt}
            </button>
          ))}
        </div>

        {/* People Grid */}
        {filteredPeople.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {search ? 'No people match your search' :
               filter !== 'all' ? `No ${RELATIONSHIP_LABELS[filter] || filter} contacts` :
               'No people in your network yet'}
            </p>
            {!search && filter === 'all' && (
              <Link
                href="/practitioner/people/new"
                className="text-blue-400 hover:text-blue-300"
              >
                Add your first contact
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPeople.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onClick={() => router.push(`/practitioner/labtools/network/${person.id}`)}
              />
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <Link
            href="/practitioner/labtools"
            className="text-sm text-gray-500 hover:text-gray-400"
          >
            ← Back to Labtools
          </Link>
        </div>
      </div>
    </div>
  );
}
