'use client';

/**
 * Network Page
 * Business contacts list
 */

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';

interface Contact {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  personType: string;
  company: string | null;
  roleTitle: string | null;
  meetingCount: number;
  opportunityCount: number;
}

const PERSON_TYPES = [
  { value: 'partner', label: 'Partner' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'investor', label: 'Investor' },
  { value: 'team', label: 'Team' },
  { value: 'contact', label: 'Contact' },
];

const TYPE_COLORS: Record<string, string> = {
  partner: 'bg-purple-500/20 text-purple-300',
  prospect: 'bg-amber-500/20 text-amber-300',
  vendor: 'bg-blue-500/20 text-blue-300',
  investor: 'bg-green-500/20 text-green-300',
  team: 'bg-cyan-500/20 text-cyan-300',
  contact: 'bg-gray-500/20 text-gray-300',
};

function NetworkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get('type') || '';
  const searchQuery = searchParams.get('q') || '';

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(searchQuery);

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

        let url = `/api/practitioner/practices/${practices[0].id}/labtools/network`;
        const params = new URLSearchParams();
        if (typeFilter) params.set('type', typeFilter);
        if (searchQuery) params.set('q', searchQuery);
        if (params.toString()) url += `?${params.toString()}`;

        const contactsRes = await apiFetch(url);
        if (!contactsRes.ok) throw new Error('Failed to load contacts');
        const { contacts: contactList } = await contactsRes.json();
        setContacts(contactList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, typeFilter, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('q', search);
    } else {
      params.delete('q');
    }
    router.push(`/practitioner/labtools/network?${params.toString()}`);
  };

  const updateTypeFilter = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type) {
      params.set('type', type);
    } else {
      params.delete('type');
    }
    router.push(`/practitioner/labtools/network?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-48" />
          <div className="h-12 bg-gray-800 rounded" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-white">Network</h1>
        <Link
          href="/practitioner/labtools/network/new"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm transition-colors"
        >
          + Add Contact
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
          />
        </form>
        <select
          value={typeFilter}
          onChange={(e) => updateTypeFilter(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
        >
          <option value="">All Types</option>
          {PERSON_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Contacts Grid */}
      {contacts.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-500">No contacts found</p>
          <Link
            href="/practitioner/labtools/network/new"
            className="text-sm text-amber-400 hover:underline mt-2 inline-block"
          >
            Add your first contact
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {contacts.map(contact => (
            <Link
              key={contact.id}
              href={`/practitioner/labtools/network/${contact.id}`}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-amber-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-medium">{contact.displayName}</h3>
                  {(contact.roleTitle || contact.company) && (
                    <p className="text-sm text-gray-400 mt-0.5">
                      {contact.roleTitle}{contact.roleTitle && contact.company && ' at '}{contact.company}
                    </p>
                  )}
                  {contact.email && (
                    <p className="text-sm text-gray-500 mt-1">{contact.email}</p>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded text-xs ${TYPE_COLORS[contact.personType] || TYPE_COLORS.contact}`}>
                  {contact.personType}
                </span>
              </div>
              {(contact.meetingCount > 0 || contact.opportunityCount > 0) && (
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  {contact.meetingCount > 0 && (
                    <span>{contact.meetingCount} meetings</span>
                  )}
                  {contact.opportunityCount > 0 && (
                    <span>{contact.opportunityCount} opportunities</span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NetworkPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-48" />
          <div className="h-12 bg-gray-800 rounded" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    }>
      <NetworkContent />
    </Suspense>
  );
}
