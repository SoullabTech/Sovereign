'use client';

/**
 * Contribute Page
 *
 * "Offer to the Commons" — the gateway for member contributions.
 * Uses the ContributionForm component for the actual form flow.
 * Checks orientation status and prompts newcomers to complete it.
 *
 * See /docs/COMMONS_CONTRIBUTION_SYSTEM.md for context.
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import ContributionForm, { ContributionFormData } from '@/components/community/ContributionForm';

interface MemberSession {
  id: string;
  name: string;
  preferred_name?: string;
  tier?: string;
}

interface ContributorStatus {
  orientationCompleted: boolean;
  level: number;
  acceptedCount: number;
}

export default function ContributePage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberSession | null>(null);
  const [contributorStatus, setContributorStatus] = useState<ContributorStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // Get member session from localStorage
      const stored = localStorage.getItem('beta_user');
      if (!stored) {
        setError('Please sign in to contribute');
        setIsLoading(false);
        return;
      }

      let memberData;
      try {
        memberData = JSON.parse(stored);
        setMember({
          id: memberData.id,
          name: memberData.name,
          preferred_name: memberData.preferred_name,
          tier: memberData.tier,
        });
      } catch {
        setError('Unable to load session');
        setIsLoading(false);
        return;
      }

      // Check contributor status (orientation, level)
      try {
        const response = await fetch(`/api/commons/contributions/orientation?memberId=${memberData.id}`);
        if (response.ok) {
          const data = await response.json();
          setContributorStatus({
            orientationCompleted: data.orientationCompleted || false,
            level: data.level || 0,
            acceptedCount: data.acceptedCount || 0,
          });
        }
      } catch (err) {
        console.error('Error checking contributor status:', err);
        // Default to allowing contribution but showing orientation prompt
        setContributorStatus({
          orientationCompleted: false,
          level: 0,
          acceptedCount: 0,
        });
      }

      setIsLoading(false);
    };

    loadData();
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
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-stone-500" fill="none" stroke="currentColor" strokeWidth="1.5">
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
              className="px-5 py-2.5 rounded-xl text-[13px] tracking-wide transition-colors"
              style={{ backgroundColor: '#6b5a98', color: 'white' }}
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
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] tracking-wide text-stone-600 hover:text-stone-800 hover:bg-white/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Commons
          </button>

          <button
            onClick={() => router.push('/maia/community/commons/my-offerings')}
            className="px-3 py-2 rounded-lg text-[13px] tracking-wide text-stone-600 hover:text-stone-800 hover:bg-white/60 transition-colors"
          >
            My Offerings
          </button>
        </header>

        {/* Orientation Notice (for newcomers) */}
        {contributorStatus && !contributorStatus.orientationCompleted && contributorStatus.level === 0 && (
          <div className="mb-6 p-5 bg-white/60 border border-[#5a7a6f]/30 rounded-xl">
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(90, 122, 111, 0.15)' }}
              >
                <Shield className="w-5 h-5" style={{ color: '#5a7a6f' }} />
              </div>
              <div className="flex-1">
                <h3 className="text-[14px] font-medium tracking-wide mb-1" style={{ color: '#5a7a6f' }}>
                  Safety & Boundaries Orientation
                </h3>
                <p className="text-[13px] tracking-wide text-stone-600 leading-relaxed mb-4">
                  Before your first contribution can be approved, we ask that you complete a brief orientation
                  on safety guidelines and community boundaries. This helps ensure the Commons remains a safe
                  space for everyone.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push('/maia/community/commons/orientation?returnTo=/maia/community/contribute')}
                    className="px-4 py-2.5 rounded-lg text-[13px] tracking-wide transition-colors"
                    style={{ backgroundColor: '#5a7a6f', color: 'white' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4a6a5f'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#5a7a6f'}
                  >
                    Complete Orientation
                  </button>
                  <span className="text-[11px] tracking-wide text-stone-500">~3 minutes</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tier Notice (Free tier) */}
        {!canSubmit && (
          <div className="mb-6 p-5 bg-white/60 border border-[#8a7a5a]/30 rounded-xl">
            <h3 className="text-[14px] font-medium tracking-wide mb-1" style={{ color: '#8a7a5a' }}>
              Personal Membership Required
            </h3>
            <p className="text-[13px] tracking-wide text-stone-600 leading-relaxed mb-4">
              You can browse contributions freely, but Personal or Pro membership is required to submit offerings to the Commons.
            </p>
            <button
              onClick={() => router.push('/maia/membership')}
              className="px-4 py-2.5 rounded-lg text-[13px] tracking-wide transition-colors"
              style={{ backgroundColor: '#8a7a5a', color: 'white' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7a6a4a'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8a7a5a'}
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
