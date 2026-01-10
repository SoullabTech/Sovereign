'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { InviteManager } from '@/components/invites/InviteManager';

export default function InvitesPage() {
  const router = useRouter();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get member ID from localStorage
    const betaUser = localStorage.getItem('beta_user');
    if (betaUser) {
      try {
        const user = JSON.parse(betaUser);
        setMemberId(user.id);
      } catch (e) {
        console.error('Failed to parse beta_user:', e);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50/30 flex items-center justify-center">
        <div className="text-teal-600/60">Loading...</div>
      </div>
    );
  }

  if (!memberId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-teal-700 mb-4">Please sign in to manage your invites</p>
          <button
            onClick={() => router.push('/signin')}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50/30">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-teal-100/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-teal-700" />
          </button>
          <h1 className="text-2xl font-light text-teal-900">Invite Friends</h1>
        </div>

        {/* Description */}
        <div className="mb-8 p-4 rounded-xl bg-white/60 border border-teal-200/30">
          <p className="text-teal-700/80 text-sm leading-relaxed">
            Share MAIA with people who would benefit from conscious AI companionship.
            Each invite generates a unique passkey they can use to join.
            You'll see when they join and can track who you've invited.
          </p>
        </div>

        {/* Invite Manager */}
        <InviteManager memberId={memberId} />
      </div>
    </div>
  );
}
