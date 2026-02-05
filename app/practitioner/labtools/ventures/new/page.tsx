'use client';

/**
 * New Venture
 * Create a new business venture/initiative
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const VENTURE_TYPES = [
  { value: 'maia_rd', label: 'MAIA R&D', description: 'MAIA research and development' },
  { value: 'soullab_rd', label: 'SoulLab R&D', description: 'SoulLab research and development' },
  { value: 'marketing', label: 'Marketing', description: 'Marketing initiatives' },
  { value: 'sales', label: 'Sales', description: 'Sales initiatives' },
  { value: 'partnerships', label: 'Partnerships', description: 'Partnership development' },
  { value: 'operations', label: 'Operations', description: 'Operational improvements' },
  { value: 'content', label: 'Content', description: 'Content creation' },
  { value: 'events', label: 'Events', description: 'Events and workshops' }
];

export default function NewVenturePage() {
  const router = useRouter();
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');

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

        setPracticeId(practices[0].id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!practiceId || !memberId) return;
    if (!name.trim() || !type) {
      setError('Name and type are required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/practitioner/practices/${practiceId}/labtools/ventures`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-member-id': memberId
          },
          body: JSON.stringify({
            name: name.trim(),
            type,
            description: description.trim() || null
          })
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create venture');
      }

      const { venture } = await res.json();
      router.push(`/practitioner/labtools/ventures/${venture.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create venture');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <div className="max-w-2xl mx-auto px-6 py-8 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
          <div className="h-64 bg-gray-800 rounded" />
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
            <Link href="/practitioner/labtools/ventures" className="hover:text-gray-400">
              Ventures
            </Link>
            <span>/</span>
            <span className="text-gray-400">New</span>
          </div>
          <h1 className="text-xl font-medium text-white">New Venture</h1>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-[#111827] rounded-xl border border-gray-700 p-6 space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Q1 Marketing Campaign"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                         text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
                Type *
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                         text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select a type...</option>
                {VENTURE_TYPES.map((vt) => (
                  <option key={vt.value} value={vt.value}>
                    {vt.label} - {vt.description}
                  </option>
                ))}
              </select>
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
                placeholder="Brief description of this venture..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg
                         text-white placeholder-gray-500 focus:outline-none focus:border-blue-500
                         resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/practitioner/labtools/ventures"
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving || !name.trim() || !type}
              className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white
                       rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Creating...' : 'Create Venture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
