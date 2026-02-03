'use client';

/**
 * Review Queue Page
 *
 * For Curators (Level 2+) and Pro members to review submitted contributions.
 * Actions: approve, request_revision, flag, archive.
 *
 * See /docs/COMMONS_CONTRIBUTION_SYSTEM.md for context.
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  MessageSquare,
  Flag,
  Archive,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
} from 'lucide-react';

interface Contribution {
  id: string;
  type: string;
  status: string;
  title: string;
  content: string;
  tags: { element?: string; domain?: string }[];
  attribution?: string;
  whenHelpful?: string;
  whenNot?: string;
  submittedAt?: string;
  createdBy: {
    id: string;
    name: string;
    contributorLevel?: number;
    acceptedCount?: number;
  };
}

interface MemberSession {
  id: string;
  name: string;
  preferred_name?: string;
  tier?: string;
}

type ReviewAction = 'approve' | 'request_revision' | 'flag' | 'archive';

const TYPE_LABELS: Record<string, string> = {
  prompt: 'Reflection Prompt',
  practice: 'Micro-Practice',
  agreement: 'Agreement',
  resource: 'Resource',
  story: 'Story',
};

const STATUS_COLORS: Record<string, string> = {
  submitted: 'text-amber-600 bg-amber-50',
  flagged: 'text-rose-600 bg-rose-50',
};

export default function ReviewQueuePage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberSession | null>(null);
  const [curatorLevel, setCuratorLevel] = useState<number>(0);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Get member session
      const stored = localStorage.getItem('beta_user');
      if (!stored) {
        setError('Please sign in to access the review queue');
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

      // Check curator level
      try {
        const levelResponse = await fetch(`/api/commons/contributions/my-offerings?memberId=${memberData.id}`);
        if (levelResponse.ok) {
          const levelData = await levelResponse.json();
          const level = levelData.stats?.level || 0;
          setCuratorLevel(level);

          // Pro tier gets automatic curator access
          const isPro = memberData.tier?.toLowerCase() === 'pro';
          if (level < 2 && !isPro) {
            setError('Curator level (Level 2) required to review contributions');
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error checking curator level:', err);
      }

      // Fetch review queue
      try {
        const response = await fetch(`/api/commons/contributions/review-queue?curatorId=${memberData.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch review queue');
        }
        const data = await response.json();
        setContributions(data.contributions || []);
      } catch (err) {
        console.error('Error fetching review queue:', err);
        setContributions([]);
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleAction = async (contributionId: string, action: ReviewAction) => {
    if (!member) return;

    const notes = actionNotes[contributionId];
    if (['request_revision', 'flag', 'archive'].includes(action) && !notes?.trim()) {
      alert(`Please provide notes when ${action.replace('_', ' ')}ing a contribution.`);
      return;
    }

    setProcessingId(contributionId);

    try {
      const response = await fetch(`/api/commons/contributions/${contributionId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curatorId: member.id,
          action,
          notes: notes?.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process review action');
      }

      // Remove from queue
      setContributions(prev => prev.filter(c => c.id !== contributionId));
      setActionNotes(prev => {
        const next = { ...prev };
        delete next[contributionId];
        return next;
      });
      setExpandedId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to process review action');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
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
            <h2 className="text-lg font-light text-stone-700 mb-2">Access Required</h2>
            <p className="text-[14px] text-stone-500 mb-6 max-w-sm mx-auto">
              {error || 'Please sign in to access the review queue.'}
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

          <span className="text-[11px] tracking-wider uppercase px-3 py-1.5 rounded-lg bg-[#5a7a6f]/10 text-[#5a7a6f]">
            Curator View
          </span>
        </header>

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light tracking-wide text-stone-800 mb-2">
            Review Queue
          </h1>
          <p className="text-[14px] text-stone-500">
            {contributions.length} contribution{contributions.length !== 1 ? 's' : ''} awaiting review
          </p>
        </div>

        {/* Queue */}
        {contributions.length > 0 ? (
          <div className="space-y-4">
            {contributions.map((contribution) => {
              const isExpanded = expandedId === contribution.id;
              const isProcessing = processingId === contribution.id;

              return (
                <div
                  key={contribution.id}
                  className="rounded-xl border border-stone-200/60 bg-white/80 overflow-hidden"
                >
                  {/* Header (always visible) */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : contribution.id)}
                    className="w-full p-4 text-left flex items-start gap-4 hover:bg-white/60 transition-colors"
                    disabled={isProcessing}
                  >
                    <div className="flex-1 min-w-0">
                      {/* Type & Status */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#6b5a98]/10 text-[#6b5a98]">
                          {TYPE_LABELS[contribution.type] || contribution.type}
                        </span>
                        <span className={`text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-md ${STATUS_COLORS[contribution.status] || 'bg-stone-100 text-stone-500'}`}>
                          {contribution.status}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-[14px] font-medium text-stone-700 mb-1">
                        {contribution.title}
                      </h3>

                      {/* Author & Date */}
                      <div className="flex items-center gap-3 text-[11px] text-stone-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {contribution.createdBy.name}
                        </span>
                        {contribution.submittedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(contribution.submittedAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-stone-500">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-stone-200/60">
                      {/* Content Preview */}
                      <div className="mt-4 p-4 bg-stone-50 rounded-lg">
                        <p className="text-[13px] text-stone-600 leading-relaxed whitespace-pre-line">
                          {contribution.content}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {contribution.whenHelpful && (
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-1">
                              When Helpful
                            </p>
                            <p className="text-[12px] text-stone-500">{contribution.whenHelpful}</p>
                          </div>
                        )}
                        {contribution.whenNot && (
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-1">
                              When Not Helpful
                            </p>
                            <p className="text-[12px] text-stone-500">{contribution.whenNot}</p>
                          </div>
                        )}
                        {contribution.attribution && (
                          <div className="col-span-2">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-1">
                              Attribution
                            </p>
                            <p className="text-[12px] text-stone-500 italic">{contribution.attribution}</p>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {contribution.tags && contribution.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                          {contribution.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-500"
                            >
                              {tag.element || tag.domain}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Notes Input */}
                      <div className="mt-4">
                        <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-500 mb-2">
                          Review Notes (required for revision/flag/archive)
                        </label>
                        <textarea
                          value={actionNotes[contribution.id] || ''}
                          onChange={(e) =>
                            setActionNotes(prev => ({ ...prev, [contribution.id]: e.target.value }))
                          }
                          placeholder="Feedback for the contributor..."
                          className="w-full h-20 px-3 py-2 bg-white border border-stone-200/60 rounded-lg text-[13px] text-stone-700 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#6b5a98]/20 focus:border-[#6b5a98]/40 resize-none"
                          disabled={isProcessing}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAction(contribution.id, 'archive')}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-3 py-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg text-[12px] transition-colors disabled:opacity-50"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          Archive
                        </button>
                        <button
                          onClick={() => handleAction(contribution.id, 'flag')}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-[12px] transition-colors disabled:opacity-50"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          Flag
                        </button>
                        <button
                          onClick={() => handleAction(contribution.id, 'request_revision')}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg text-[12px] transition-colors disabled:opacity-50"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Request Revision
                        </button>
                        <button
                          onClick={() => handleAction(contribution.id, 'approve')}
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#5a7a6f] hover:bg-[#4a6a5f] text-white rounded-lg text-[12px] transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve & Publish
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-lg font-light text-stone-700 mb-2">Queue Empty</h2>
            <p className="text-[14px] text-stone-500">
              All contributions have been reviewed. Check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
