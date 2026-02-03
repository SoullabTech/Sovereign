'use client';

/**
 * Safety & Boundaries Orientation Page
 *
 * Required for Level 0 members before their first contribution can be approved.
 * Can be accessed directly or via redirect from contribute page.
 *
 * See /docs/COMMONS_CONTRIBUTION_SYSTEM.md for context.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import SafetyOrientation from '@/components/community/SafetyOrientation';

interface MemberSession {
  id: string;
  name: string;
  preferred_name?: string;
  tier?: string;
}

function OrientationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('returnTo');
  const [member, setMember] = useState<MemberSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlreadyComplete, setIsAlreadyComplete] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      // Get member session from localStorage
      const stored = localStorage.getItem('beta_user');
      if (!stored) {
        setError('Please sign in to complete the orientation');
        setIsLoading(false);
        return;
      }

      let memberData: MemberSession;
      try {
        memberData = JSON.parse(stored);
        setMember(memberData);
      } catch {
        setError('Unable to load session');
        setIsLoading(false);
        return;
      }

      // Check if orientation is already complete
      try {
        const response = await fetch(`/api/commons/contributions/orientation?memberId=${memberData.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.orientationCompleted) {
            setIsAlreadyComplete(true);
          }
        }
      } catch (err) {
        console.error('Error checking orientation status:', err);
      }

      setIsLoading(false);
    };

    checkStatus();
  }, []);

  const handleComplete = async () => {
    if (!member) return;

    try {
      const response = await fetch('/api/commons/contributions/orientation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to save orientation completion');
      }

      // Redirect to return path or contribute page
      router.push(returnTo || '/maia/community/contribute');
    } catch (err) {
      console.error('Error completing orientation:', err);
      alert('Failed to save orientation. Please try again.');
    }
  };

  const handleSkip = () => {
    router.push(returnTo || '/maia/community/commons');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}>
        <div className="w-8 h-8 border-2 border-[#5a7a6f]/20 border-t-[#5a7a6f] rounded-full animate-spin" />
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
              {error || 'Please sign in to complete the orientation.'}
            </p>
            <button
              onClick={() => router.push('/signin')}
              className="px-5 py-2.5 bg-[#5a7a6f] hover:bg-[#4a6a5f] text-white rounded-xl text-[13px] tracking-wide transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isAlreadyComplete) {
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12l3 3 5-5" />
              </svg>
            </div>
            <h2 className="text-lg font-light text-stone-700 mb-2">Orientation Complete</h2>
            <p className="text-[14px] text-stone-500 mb-6 max-w-sm mx-auto">
              You&apos;ve already completed the Safety & Boundaries orientation. You&apos;re ready to contribute!
            </p>
            <button
              onClick={() => router.push('/maia/community/contribute')}
              className="px-5 py-2.5 bg-[#5a7a6f] hover:bg-[#4a6a5f] text-white rounded-xl text-[13px] tracking-wide transition-colors"
            >
              Create a Contribution
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => router.push('/maia/community/commons')}
            className="flex items-center gap-2 px-4 py-2 text-[13px] text-stone-500 hover:text-stone-700 transition-colors -ml-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Commons
          </button>
        </header>

        {/* Orientation Component */}
        <SafetyOrientation
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
}

export default function OrientationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}>
        <div className="w-8 h-8 border-2 border-[#5a7a6f]/20 border-t-[#5a7a6f] rounded-full animate-spin" />
      </div>
    }>
      <OrientationContent />
    </Suspense>
  );
}
