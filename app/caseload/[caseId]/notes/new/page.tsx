'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SacredCard } from '@/components/ui/SacredCard';
import { NoteEditor } from '@/components/caseload/NoteEditor';
import type { PractitionerCase, CreateNoteInput } from '@/lib/caseload/types';

export default function NewNotePage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.caseId as string;

  const [caseData, setCaseData] = useState<PractitionerCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchCase = useCallback(async () => {
    const memberId = getMemberId();
    if (!memberId) {
      setError('Please sign in to add notes');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/caseload/${caseId}?memberId=${memberId}&includeNotes=false`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch case');
      }

      setCaseData(data.case);
    } catch (err) {
      console.error('[CASELOAD] Fetch case error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load case');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  const handleSave = async (noteData: CreateNoteInput) => {
    const memberId = getMemberId();
    if (!memberId) {
      throw new Error('Please sign in to add notes');
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/caseload/${caseId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          ...noteData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save note');
      }

      // Navigate back to case detail
      router.push(`/caseload/${caseId}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/caseload/${caseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sacred-navy to-sacred-blue flex items-center justify-center">
        <div className="text-gold-divine/60 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sacred-navy to-sacred-blue p-6">
        <div className="max-w-2xl mx-auto pt-12">
          <SacredCard variant="outlined" className="border-red-500/30">
            <div className="text-center py-8">
              <p className="text-red-400">{error || 'Case not found'}</p>
              <button
                onClick={() => router.push('/caseload')}
                className="mt-4 px-4 py-2 bg-sacred-navy/60 hover:bg-sacred-navy/80 border border-gold-divine/20 rounded-lg text-neutral-silver text-sm"
              >
                Back to Caseload
              </button>
            </div>
          </SacredCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sacred-navy to-sacred-blue">
      {/* Header */}
      <div className="border-b border-gold-divine/20 bg-sacred-navy/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={handleCancel}
              className="text-neutral-silver/60 hover:text-neutral-silver transition-colors"
            >
              ← Back to Case
            </button>
          </div>
          <h1 className="text-2xl font-light text-gold-divine">
            New Session Note
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <SacredCard variant="consciousness" size="lg">
          <NoteEditor
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving}
            clientIdentifier={caseData.client_identifier}
            initialData={{
              element_focus: caseData.primary_element,
            }}
          />
        </SacredCard>
      </div>
    </div>
  );
}
