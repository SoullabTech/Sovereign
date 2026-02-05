'use client';

/**
 * New Contact Page
 * Add a business contact
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/http/apiBase';

const PERSON_TYPES = [
  { value: 'partner', label: 'Partner' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'investor', label: 'Investor' },
  { value: 'team', label: 'Team Member' },
  { value: 'contact', label: 'General Contact' },
];

const SOURCES = [
  { value: 'referral', label: 'Referral' },
  { value: 'conference', label: 'Conference' },
  { value: 'website', label: 'Website' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'existing_network', label: 'Existing Network' },
  { value: 'other', label: 'Other' },
];

export default function NewContactPage() {
  const router = useRouter();
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [personType, setPersonType] = useState('contact');
  const [company, setCompany] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadPractice() {
      try {
        const res = await apiFetch('/api/practitioner/practices');
        if (!res.ok) throw new Error('Failed to load practice');
        const { practices } = await res.json();
        if (practices.length === 0) {
          router.push('/practitioner/dashboard');
          return;
        }
        setPracticeId(practices[0].id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }
    loadPractice();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceId || !displayName.trim()) {
      setError('Name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await apiFetch(`/api/practitioner/practices/${practiceId}/labtools/network`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          personType,
          company: company.trim() || null,
          roleTitle: roleTitle.trim() || null,
          linkedinUrl: linkedinUrl.trim() || null,
          source: source || null,
          notesPrivate: notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create contact');
      }

      const { contact } = await res.json();
      router.push(`/practitioner/labtools/network/${contact.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contact');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-8" />
          <div className="space-y-4">
            <div className="h-12 bg-gray-800 rounded" />
            <div className="h-12 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-medium text-white">Add Contact</h1>
      </header>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name & Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Full name"
              required
              autoFocus
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <select
              value={personType}
              onChange={(e) => setPersonType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              {PERSON_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Company & Role */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Organization"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role / Title
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="Their role"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* LinkedIn & Source */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                       text-white placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              How did you meet?
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="">Select...</option>
              {SOURCES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Context, how you met, what to remember..."
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                     text-white placeholder-gray-500"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                     text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || !displayName.trim()}
            className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700
                     disabled:text-gray-500 text-white rounded-lg transition-colors"
          >
            {isSaving ? 'Adding...' : 'Add Contact'}
          </button>
        </div>
      </form>
    </div>
  );
}
