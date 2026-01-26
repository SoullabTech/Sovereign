'use client';

/**
 * Spiral Page - Across-Time Memory Dashboard
 *
 * View and explore spiral patterns:
 * - Active threads (storylines in motion)
 * - Current cycle position
 * - Recurring motifs (beads)
 * - Effective stabilizers
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SpiralDashboard } from '@/components/spiral';

export default function SpiralPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user ID from localStorage
    if (typeof window !== 'undefined') {
      let storedUserId = localStorage.getItem('explorerId');

      // Try beta_user if explorerId not found
      if (!storedUserId) {
        const betaUser = localStorage.getItem('beta_user');
        if (betaUser) {
          try {
            const userData = JSON.parse(betaUser);
            storedUserId = userData.id;
          } catch { /* ignore */ }
        }
      }

      if (storedUserId && !storedUserId.startsWith('local_') && storedUserId !== 'guest') {
        setUserId(storedUserId);
      } else {
        // Redirect to sign in if no valid user
        router.push('/signin');
        return;
      }

      setLoading(false);
    }
  }, [router]);

  const handleThreadSelect = (threadId: string) => {
    // For now, just log - could navigate to thread detail view
    console.log('Thread selected:', threadId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center">
        <div className="text-white/50 animate-pulse">Loading spiral patterns...</div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-stone-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/maia"
              className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white/90"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-light text-white/90">Spiral Patterns</h1>
              <p className="text-sm text-white/40">Your across-time memory landscape</p>
            </div>
          </div>

          {/* Placeholder for future actions */}
          <div className="flex items-center gap-2">
            {/* Could add: Export, Settings, etc. */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        <SpiralDashboard
          userId={userId}
          onThreadSelect={handleThreadSelect}
        />
      </main>

      {/* Footer note */}
      <footer className="max-w-6xl mx-auto px-6 py-8 text-center">
        <p className="text-xs text-white/30">
          MAIA learns your patterns over time. The more you journal, the richer this view becomes.
        </p>
      </footer>
    </div>
  );
}
