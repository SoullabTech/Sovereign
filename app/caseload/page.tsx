'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CaseList } from '@/components/caseload/CaseList';
import type { CaseWithStats, CaseListFilters, Element, CaseStatus, CreateCaseInput } from '@/lib/caseload/types';

export default function CaseloadPage() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseWithStats[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);

  // Get memberId from localStorage
  const getMemberId = () => {
    if (typeof window === 'undefined') return null;
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const parsed = JSON.parse(betaUser);
        return parsed.id || parsed.memberId;
      } catch {
        return null;
      }
    }
    return null;
  };

  const fetchCases = useCallback(async (filters?: CaseListFilters) => {
    const memberId = getMemberId();
    if (!memberId) {
      setError('Please sign in to access your caseload');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({ memberId });
      if (filters?.status) params.append('status', filters.status);
      if (filters?.element) params.append('element', filters.element);
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`/api/caseload/list?${params}`);
      const data = await response.json();

      if (!response.ok) {
        // If not a practitioner, show enable prompt
        if (response.status === 403) {
          setError('practitioner_required');
        } else {
          throw new Error(data.error || 'Failed to fetch cases');
        }
        return;
      }

      setCases(data.cases || []);
      setCounts(data.counts || {});
      setError(null);
    } catch (err) {
      console.error('[CASELOAD] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleFilterChange = (filters: { status?: CaseStatus; element?: Element; search?: string }) => {
    fetchCases(filters);
  };

  const handleCaseClick = (caseId: string) => {
    router.push(`/caseload/${caseId}`);
  };

  const handleAddNote = (caseId: string) => {
    router.push(`/caseload/${caseId}/notes/new`);
  };

  const handleConsult = (caseId: string) => {
    router.push(`/caseload/${caseId}/consult`);
  };

  // If practitioner mode not enabled
  if (error === 'practitioner_required') {
    return (
      <div className="min-h-screen bg-[#0a0f1a] p-6">
        <div className="max-w-2xl mx-auto pt-16">
          <div className="bg-[#111827] border border-amber-500/20 rounded-xl p-8 shadow-lg">
            <div className="text-center space-y-6">
              {/* Soullab Logo/Icon */}
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-white">
                Practitioner Caseload
              </h1>
              <p className="text-gray-400 leading-relaxed max-w-md mx-auto">
                Manage your clinical cases with MAIA as an AI consultation partner.
                Track progress, document sessions, and gain insights.
              </p>
              <button
                onClick={() => setShowNewCaseForm(true)}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors"
              >
                Create Your First Case
              </button>
            </div>
          </div>
          {showNewCaseForm && (
            <NewCaseForm
              onClose={() => setShowNewCaseForm(false)}
              onSuccess={() => {
                setShowNewCaseForm(false);
                fetchCases();
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0a0f1a]/95 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Caseload
              </h1>
              <p className="text-sm text-gray-500">
                Clinical case management with AI consultation
              </p>
            </div>
            <button
              onClick={() => setShowNewCaseForm(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <span>+</span>
              <span>New Case</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && error !== 'practitioner_required' ? (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8">
            <div className="text-center py-4">
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => fetchCases()}
                className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <CaseList
            cases={cases}
            counts={counts}
            loading={loading}
            onCaseClick={handleCaseClick}
            onAddNote={handleAddNote}
            onConsult={handleConsult}
            onFilterChange={handleFilterChange}
          />
        )}
      </div>

      {/* New Case Modal */}
      {showNewCaseForm && (
        <NewCaseForm
          onClose={() => setShowNewCaseForm(false)}
          onSuccess={() => {
            setShowNewCaseForm(false);
            fetchCases();
          }}
        />
      )}
    </div>
  );
}

// New Case Form Component
interface NewCaseFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

function NewCaseForm({ onClose, onSuccess }: NewCaseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCaseInput>({
    client_identifier: '',
    presenting_concerns: [],
    primary_element: undefined,
    privacy_mode: 'private',
  });
  const [concernInput, setConcernInput] = useState('');

  const getMemberId = () => {
    if (typeof window === 'undefined') return null;
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const parsed = JSON.parse(betaUser);
        return parsed.id || parsed.memberId;
      } catch {
        return null;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const memberId = getMemberId();
    if (!memberId) {
      setError('Please sign in first');
      return;
    }

    if (!formData.client_identifier.trim()) {
      setError('Client identifier is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/caseload/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create case');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  const addConcern = () => {
    if (concernInput.trim()) {
      setFormData({
        ...formData,
        presenting_concerns: [...(formData.presenting_concerns || []), concernInput.trim()],
      });
      setConcernInput('');
    }
  };

  const removeConcern = (index: number) => {
    setFormData({
      ...formData,
      presenting_concerns: (formData.presenting_concerns || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">New Case</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-300 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="px-4 py-2 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Client identifier */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Client Identifier *
              </label>
              <input
                type="text"
                value={formData.client_identifier}
                onChange={(e) => setFormData({ ...formData, client_identifier: e.target.value })}
                placeholder="e.g., JD-001, Client A, or initials"
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 focus:border-amber-500/50 rounded-lg text-white placeholder-gray-500 outline-none transition-colors"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Use a pseudonym or code to protect client privacy
              </p>
            </div>

            {/* Presenting concerns */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Presenting Concerns
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={concernInput}
                  onChange={(e) => setConcernInput(e.target.value)}
                  placeholder="Add a concern"
                  className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-700 focus:border-amber-500/50 rounded-lg text-white placeholder-gray-500 outline-none transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addConcern();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addConcern}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.presenting_concerns && formData.presenting_concerns.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.presenting_concerns.map((concern, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300 flex items-center gap-2"
                    >
                      {concern}
                      <button
                        type="button"
                        onClick={() => removeConcern(i)}
                        className="text-gray-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Case category (replacing mystical elements) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Case Category
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { value: 'earth', label: 'Grounding', desc: 'Stability, routine' },
                  { value: 'water', label: 'Emotional', desc: 'Feelings, relationships' },
                  { value: 'fire', label: 'Motivation', desc: 'Energy, drive' },
                  { value: 'air', label: 'Cognitive', desc: 'Thoughts, beliefs' },
                  { value: 'aether', label: 'Existential', desc: 'Meaning, purpose' },
                ].map((el) => (
                  <button
                    key={el.value}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        primary_element: formData.primary_element === el.value ? undefined : el.value as Element,
                      })
                    }
                    className={`py-2 px-1 rounded-lg border transition-all text-center ${
                      formData.primary_element === el.value
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600'
                    }`}
                    title={el.desc}
                  >
                    <div className="text-xs font-medium">{el.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy mode */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Privacy Mode
              </label>
              <select
                value={formData.privacy_mode}
                onChange={(e) => setFormData({ ...formData, privacy_mode: e.target.value as any })}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 focus:border-amber-500/50 rounded-lg text-white outline-none transition-colors"
              >
                <option value="private">Private - Your notes only</option>
                <option value="transparent">Transparent - Client can see</option>
                <option value="consent_based">Consent-based - Requires explicit consent</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Case'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
