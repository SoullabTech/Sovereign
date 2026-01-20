'use client';

/**
 * My Offerings Page
 *
 * Shows member's own contributions: drafts, submitted, published.
 * Allows editing drafts and viewing status of submitted items.
 *
 * See /docs/COMMONS_CONTRIBUTION_SYSTEM.md for context.
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Edit3, Eye, Clock, CheckCircle, AlertCircle, Archive } from 'lucide-react';

interface Contribution {
  id: string;
  type: string;
  status: string;
  title: string;
  content: string;
  createdAt: string;
  submittedAt?: string;
  publishedAt?: string;
  reviewNotes?: string;
  usageCount?: number;
  saveCount?: number;
}

interface ContributorStats {
  level: number;
  acceptedCount: number;
  orientationCompleted: boolean;
  endorsedBy?: string;
}

interface MemberSession {
  id: string;
  name: string;
  preferred_name?: string;
  tier?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Draft', color: 'text-stone-500 bg-stone-100', icon: Edit3 },
  submitted: { label: 'In Review', color: 'text-amber-600 bg-amber-50', icon: Clock },
  needs_revision: { label: 'Needs Revision', color: 'text-rose-600 bg-rose-50', icon: AlertCircle },
  published: { label: 'Published', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  flagged: { label: 'Flagged', color: 'text-rose-600 bg-rose-50', icon: AlertCircle },
  archived: { label: 'Archived', color: 'text-stone-500 bg-stone-50', icon: Archive },
};

const TYPE_LABELS: Record<string, string> = {
  prompt: 'Reflection Prompt',
  practice: 'Micro-Practice',
  agreement: 'Agreement',
  resource: 'Resource',
  story: 'Story',
};

const LEVEL_NAMES = ['Newcomer', 'Contributor', 'Curator', 'Elder'];

export default function MyOfferingsPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberSession | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [stats, setStats] = useState<ContributorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Get member session
      const stored = localStorage.getItem('beta_user');
      if (!stored) {
        setError('Please sign in to view your offerings');
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

      // Fetch contributions
      try {
        const response = await fetch(`/api/commons/contributions/my-offerings?memberId=${memberData.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch contributions');
        }
        const data = await response.json();
        setContributions(data.contributions || []);
        setStats(data.stats || { level: 0, acceptedCount: 0, orientationCompleted: false });
      } catch (err) {
        console.error('Error fetching offerings:', err);
        setContributions([]);
        setStats({ level: 0, acceptedCount: 0, orientationCompleted: false });
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
            <p className="text-[14px] text-stone-500 mb-6">
              {error || 'Please sign in to view your offerings.'}
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

  const needsRevision = contributions.filter(c => c.status === 'needs_revision');
  const drafts = contributions.filter(c => c.status === 'draft');
  const inReview = contributions.filter(c => c.status === 'submitted' || c.status === 'flagged');
  const published = contributions.filter(c => c.status === 'published');

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}>
      <div className="max-w-3xl mx-auto px-6 py-8">
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
            onClick={() => router.push('/maia/community/contribute')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#5a7a6f] hover:bg-[#4a6a5f] text-white rounded-lg text-[13px] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Offering
          </button>
        </header>

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light tracking-wide text-stone-800 mb-2">
            My Offerings
          </h1>
          <p className="text-[14px] text-stone-500">
            Your contributions to the Commons
          </p>
        </div>

        {/* Stats Card */}
        {stats && (
          <div className="p-5 rounded-xl border border-stone-200/60 bg-white/60 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-1">
                  Contributor Level
                </p>
                <p className="text-lg font-medium text-stone-700">
                  {LEVEL_NAMES[stats.level] || 'Newcomer'}
                </p>
                {stats.endorsedBy && (
                  <p className="text-[12px] text-stone-500 mt-1">
                    Endorsed by {stats.endorsedBy}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-3xl font-light text-[#5a7a6f]">
                  {stats.acceptedCount}
                </p>
                <p className="text-[11px] text-stone-500">
                  accepted
                </p>
              </div>
            </div>
            {stats.level < 2 && (
              <div className="mt-4 pt-4 border-t border-stone-200/60">
                <p className="text-[12px] text-stone-500">
                  {stats.level === 0 && stats.acceptedCount === 0 && 'Submit your first offering to become a Contributor'}
                  {stats.level === 0 && stats.acceptedCount > 0 && `${3 - stats.acceptedCount} more accepted to reach Contributor level`}
                  {stats.level === 1 && `${10 - stats.acceptedCount} more accepted to reach Curator level`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Needs Revision (highest priority) */}
        {needsRevision.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-rose-600 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Needs Revision ({needsRevision.length})
            </h2>
            <div className="space-y-3">
              {needsRevision.map((contribution) => (
                <ContributionCard
                  key={contribution.id}
                  contribution={contribution}
                  onEdit={() => router.push(`/maia/community/contribute?edit=${contribution.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Drafts */}
        {drafts.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-4">
              Drafts ({drafts.length})
            </h2>
            <div className="space-y-3">
              {drafts.map((contribution) => (
                <ContributionCard
                  key={contribution.id}
                  contribution={contribution}
                  onEdit={() => router.push(`/maia/community/contribute?edit=${contribution.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* In Review */}
        {inReview.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-4">
              In Review ({inReview.length})
            </h2>
            <div className="space-y-3">
              {inReview.map((contribution) => (
                <ContributionCard
                  key={contribution.id}
                  contribution={contribution}
                  onView={() => router.push(`/maia/community/commons/${contribution.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Published */}
        {published.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-stone-500 mb-4">
              Published ({published.length})
            </h2>
            <div className="space-y-3">
              {published.map((contribution) => (
                <ContributionCard
                  key={contribution.id}
                  contribution={contribution}
                  onView={() => router.push(`/maia/community/commons/${contribution.id}`)}
                  showStats
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {contributions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#6b5a98]/10 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-8 h-8 text-[#6b5a98]" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="20" cy="20" r="14" />
                <path d="M20 12v16M12 20h16" />
              </svg>
            </div>
            <h2 className="text-lg font-light text-stone-700 mb-2">No offerings yet</h2>
            <p className="text-[14px] text-stone-500 mb-6 max-w-sm mx-auto">
              Share something that has helped you with the community.
            </p>
            <button
              onClick={() => router.push('/maia/community/contribute')}
              className="px-5 py-2.5 bg-[#6b5a98] hover:bg-[#5b4a88] text-white rounded-xl text-[13px] tracking-wide transition-colors"
            >
              Create Your First Offering
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Contribution Card Component
function ContributionCard({
  contribution,
  onEdit,
  onView,
  showStats,
}: {
  contribution: Contribution;
  onEdit?: () => void;
  onView?: () => void;
  showStats?: boolean;
}) {
  const statusConfig = STATUS_CONFIG[contribution.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 rounded-xl border border-stone-200/60 bg-white/60 hover:bg-white transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Type & Status */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#6b5a98]/10 text-[#6b5a98]">
              {TYPE_LABELS[contribution.type] || contribution.type}
            </span>
            <span className={`text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${statusConfig.color}`}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-[14px] font-medium text-stone-700 mb-1 truncate">
            {contribution.title}
          </h3>

          {/* Date */}
          <p className="text-[11px] text-stone-500">
            {contribution.publishedAt
              ? `Published ${formatDate(contribution.publishedAt)}`
              : contribution.submittedAt
              ? `Submitted ${formatDate(contribution.submittedAt)}`
              : `Created ${formatDate(contribution.createdAt)}`}
          </p>

          {/* Review notes (for needs_revision) */}
          {contribution.status === 'needs_revision' && contribution.reviewNotes && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200/60 rounded-lg">
              <p className="text-[12px] text-rose-600 leading-relaxed">
                {contribution.reviewNotes}
              </p>
            </div>
          )}

          {/* Stats (for published) */}
          {showStats && (
            <div className="mt-3 flex items-center gap-4 text-[11px] text-stone-500">
              <span>{contribution.usageCount || 0} uses</span>
              <span>{contribution.saveCount || 0} saves</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          {onEdit && (contribution.status === 'draft' || contribution.status === 'needs_revision') && (
            <button
              onClick={onEdit}
              className="p-2 text-stone-500 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {onView && (
            <button
              onClick={onView}
              className="p-2 text-stone-500 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
