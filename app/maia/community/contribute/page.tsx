'use client';

/**
 * Contribute Page
 *
 * "Offer to the Commons" — the gateway for member contributions.
 * Uses the ContributionForm component for the actual form flow.
 *
 * See /docs/COMMONS_CONTRIBUTION_SYSTEM.md for context.
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import ContributionForm, { ContributionFormData } from '@/components/community/ContributionForm';

interface MemberSession {
  id: string;
  name: string;
  preferred_name?: string;
  tier?: string;
}

export default function ContributePage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get member session from localStorage
    const stored = localStorage.getItem('beta_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMember({
          id: parsed.id,
          name: parsed.name,
          preferred_name: parsed.preferred_name,
          tier: parsed.tier,
        });
      } catch {
        setError('Unable to load session');
      }
    } else {
      setError('Please sign in to contribute');
    }
    setIsLoading(false);
  }, []);

  const handleSave = async (data: ContributionFormData, status: 'draft' | 'submitted') => {
    if (!member) {
      throw new Error('Not signed in');
    }

    const response = await fetch('/api/commons/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId: member.id,
        type: data.type,
        status,
        title: data.title,
        content: data.content,
        tags: data.tags,
        attribution: data.attribution,
        whenHelpful: data.whenHelpful,
        whenNot: data.whenNot,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save contribution');
    }

    return response.json();
  };

  const handleCancel = () => {
    router.push('/maia/community/commons');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}>
        <div className="w-8 h-8 border-2 border-[#6b5a98]/20 border-t-[#6b5a98] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}>
        <div className="max-w-2xl mx-auto px-6 py-8">
          <header className="mb-8">
            <button
              onClick={() => router.push('/maia/community/commons')}
              className="flex items-center gap-2 px-4 py-2 text-[13px] text-stone-500 hover:text-stone-700 transition-colors -ml-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Commons
            </button>
          </header>

          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <h2 className="text-lg font-light text-stone-700 mb-2">Sign In Required</h2>
            <p className="text-[14px] text-stone-500 mb-6 max-w-sm mx-auto">
              {error || 'You need to be signed in to contribute to the Commons.'}
            </p>
            <button
              onClick={() => router.push('/signin')}
              className="px-5 py-2.5 bg-[#6b5a98] hover:bg-[#5b4a88] text-white rounded-xl text-[13px] tracking-wide transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check tier access (Personal tier required to submit)
  const canSubmit = member.tier && ['personal', 'pro'].includes(member.tier.toLowerCase());

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/maia/community/commons')}
            className="flex items-center gap-2 px-4 py-2 text-[13px] text-stone-500 hover:text-stone-700 transition-colors -ml-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Commons
          </button>

          <button
            onClick={() => router.push('/maia/community/commons/my-offerings')}
            className="px-4 py-2 text-[13px] text-stone-500 hover:text-stone-700 transition-colors"
          >
            My Offerings
          </button>
        </header>

        {/* Tier Notice (Free tier) */}
        {!canSubmit && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200/60 rounded-xl">
            <h3 className="text-[13px] font-medium tracking-wide text-amber-700 mb-1">
              Personal Membership Required
            </h3>
            <p className="text-[13px] tracking-wide text-amber-600 leading-relaxed">
              You can browse contributions freely, but Personal or Pro membership is required to submit offerings to the Commons.
            </p>
            <button
              onClick={() => router.push('/maia/membership')}
              className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[12px] tracking-wide transition-colors"
            >
              Learn About Membership
            </button>
          </div>
        )}

        {/* Contribution Form */}
        <ContributionForm
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
