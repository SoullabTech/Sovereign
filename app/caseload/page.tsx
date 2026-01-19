'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CaseList } from '@/components/caseload/CaseList';
import { SacredCard } from '@/components/ui/SacredCard';
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
      <div className="min-h-screen bg-gradient-to-b from-sacred-navy to-sacred-blue p-6">
        <div className="max-w-2xl mx-auto pt-12">
          <SacredCard variant="consciousness" size="lg">
            <div className="text-center space-y-6">
              <div className="text-5xl">🔮</div>
              <h1 className="text-2xl font-light text-gold-divine">
                Practitioner Caseload
              </h1>
              <p className="text-neutral-silver/80 leading-relaxed">
                This feature allows therapists and practitioners to manage client cases
                with MAIA as a clinical consultation partner.
              </p>
              <p className="text-neutral-silver/60 text-sm">
                Create your first case to enable practitioner mode.
              </p>
              <button
                onClick={() => setShowNewCaseForm(true)}
                className="px-6 py-3 bg-gold-divine/20 hover:bg-gold-divine/30 border border-gold-divine/50 rounded-lg text-gold-divine transition-all"
              >
                Create Your First Case
              </button>
            </div>
          </SacredCard>
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
    <div className="min-h-screen bg-gradient-to-b from-sacred-navy to-sacred-blue">
      {/* Header */}
      <div className="border-b border-gold-divine/20 bg-sacred-navy/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light text-gold-divine">
                My Caseload
              </h1>
              <p className="text-sm text-neutral-silver/60">
                Manage cases with MAIA as your consultation partner
              </p>
            </div>
            <button
              onClick={() => setShowNewCaseForm(true)}
              className="px-4 py-2 bg-gold-divine/20 hover:bg-gold-divine/30 border border-gold-divine/40 hover:border-gold-divine/60 rounded-lg text-gold-divine transition-all flex items-center gap-2"
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
          <SacredCard variant="outlined" className="border-red-500/30">
            <div className="text-center py-8">
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => fetchCases()}
                className="mt-4 px-4 py-2 bg-sacred-navy/60 hover:bg-sacred-navy/80 border border-gold-divine/20 rounded-lg text-neutral-silver text-sm"
              >
                Try Again
              </button>
            </div>
          </SacredCard>
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <SacredCard variant="consciousness" size="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-gold-divine">New Case</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-neutral-silver/60 hover:text-neutral-silver text-2xl"
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
              <label className="block text-sm font-medium text-neutral-silver mb-2">
                Client Identifier *
              </label>
              <input
                type="text"
                value={formData.client_identifier}
                onChange={(e) => setFormData({ ...formData, client_identifier: e.target.value })}
                placeholder="e.g., JD-001, Client A, or initials"
                className="w-full px-4 py-2 bg-sacred-navy/60 border border-gold-divine/20 focus:border-gold-divine/50 rounded-lg text-neutral-silver placeholder-neutral-silver/50 outline-none transition-colors"
                required
              />
              <p className="mt-1 text-xs text-neutral-silver/50">
                Use a pseudonym or code to protect client privacy
              </p>
            </div>

            {/* Presenting concerns */}
            <div>
              <label className="block text-sm font-medium text-neutral-silver mb-2">
                Presenting Concerns
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={concernInput}
                  onChange={(e) => setConcernInput(e.target.value)}
                  placeholder="Add a concern"
                  className="flex-1 px-4 py-2 bg-sacred-navy/60 border border-gold-divine/20 focus:border-gold-divine/50 rounded-lg text-neutral-silver placeholder-neutral-silver/50 outline-none transition-colors"
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
                  className="px-4 py-2 bg-sacred-navy/60 hover:bg-sacred-navy/80 border border-gold-divine/20 rounded-lg text-neutral-silver"
                >
                  Add
                </button>
              </div>
              {formData.presenting_concerns && formData.presenting_concerns.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.presenting_concerns.map((concern, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-sacred-navy/60 border border-gold-divine/10 rounded text-sm text-neutral-silver flex items-center gap-2"
                    >
                      {concern}
                      <button
                        type="button"
                        onClick={() => removeConcern(i)}
                        className="text-neutral-silver/50 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Primary element */}
            <div>
              <label className="block text-sm font-medium text-neutral-silver mb-2">
                Primary Element
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'earth', icon: '🜃', label: 'Earth' },
                  { value: 'water', icon: '🜄', label: 'Water' },
                  { value: 'fire', icon: '🜂', label: 'Fire' },
                  { value: 'air', icon: '🜁', label: 'Air' },
                  { value: 'aether', icon: '✦', label: 'Aether' },
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
                    className={`flex-1 py-2 rounded-lg border transition-all ${
                      formData.primary_element === el.value
                        ? 'bg-gold-divine/20 border-gold-divine/50 text-gold-divine'
                        : 'bg-sacred-navy/60 border-gold-divine/10 text-neutral-silver/60 hover:text-neutral-silver'
                    }`}
                    title={el.label}
                  >
                    <div className="text-xl">{el.icon}</div>
                    <div className="text-xs mt-1">{el.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy mode */}
            <div>
              <label className="block text-sm font-medium text-neutral-silver mb-2">
                Privacy Mode
              </label>
              <select
                value={formData.privacy_mode}
                onChange={(e) => setFormData({ ...formData, privacy_mode: e.target.value as any })}
                className="w-full px-4 py-2 bg-sacred-navy/60 border border-gold-divine/20 focus:border-gold-divine/50 rounded-lg text-neutral-silver outline-none transition-colors"
              >
                <option value="private">Private - Your notes only</option>
                <option value="transparent">Transparent - Client can see</option>
                <option value="consent_based">Consent-based - Requires explicit consent</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gold-divine/20">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-sacred-navy/60 hover:bg-sacred-navy/80 border border-gold-divine/20 rounded-lg text-neutral-silver"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gold-divine/20 hover:bg-gold-divine/30 border border-gold-divine/50 rounded-lg text-gold-divine disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Case'}
              </button>
            </div>
          </form>
        </SacredCard>
      </div>
    </div>
  );
}
