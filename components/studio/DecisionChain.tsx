'use client';

/**
 * DecisionChain — Spiral Path Navigation
 *
 * Shows the decision chain: breadcrumb trail from root → parent → current,
 * plus child decisions below. "Spawn Next Question" creates a child decision.
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, GitBranch, Plus, CheckCircle2 } from 'lucide-react';
import type { DecisionChainNode, DecisionStatus } from '@/lib/studio/leadership/types';

interface DecisionChainProps {
  decisionId: string;
  decisionTitle: string;
  parentDecision: DecisionChainNode | null;
  childDecisions: DecisionChainNode[];
}

const STATUS_DOTS: Record<DecisionStatus, string> = {
  draft: 'bg-slate-500',
  consulting: 'bg-amber-400 animate-pulse',
  active: 'bg-amber-400',
  complete: 'bg-emerald-400',
  archived: 'bg-slate-600',
};

function ChainNode({ node, isCurrent = false }: { node: { id: string; title: string; status?: DecisionStatus }; isCurrent?: boolean }) {
  if (isCurrent) {
    return (
      <span className="text-sm font-medium text-white">
        {node.title}
      </span>
    );
  }
  return (
    <Link
      href={`/studio/decisions/${node.id}`}
      className="text-sm text-amber-300/70 hover:text-amber-200 transition-colors"
    >
      {node.title}
    </Link>
  );
}

export default function DecisionChain({
  decisionId,
  decisionTitle,
  parentDecision,
  childDecisions,
}: DecisionChainProps) {
  const router = useRouter();
  const hasChain = parentDecision || childDecisions.length > 0;

  if (!hasChain) {
    // Show just the spawn button for standalone decisions
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push(`/studio/decisions/new?parent=${decisionId}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-amber-300 border border-slate-700/50 hover:border-amber-700/50 rounded-lg transition-colors"
        >
          <GitBranch className="w-3.5 h-3.5" />
          Spawn Next Question
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-800/60 bg-slate-900/30 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-amber-400/70" />
        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Spiral Path</h3>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {parentDecision && (
          <>
            <ChainNode node={parentDecision} />
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          </>
        )}
        <ChainNode node={{ id: decisionId, title: decisionTitle }} isCurrent />
      </div>

      {/* Children */}
      {childDecisions.length > 0 && (
        <div className="space-y-2 ml-4 border-l border-slate-800/40 pl-3">
          <p className="text-xs text-slate-500">Spawned questions:</p>
          {childDecisions.map(child => (
            <Link
              key={child.id}
              href={`/studio/decisions/${child.id}`}
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-amber-200 transition-colors group"
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOTS[child.status] || 'bg-slate-500'}`} />
              <span className="group-hover:underline underline-offset-2">{child.title}</span>
              {child.status === 'complete' && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              )}
              {child.iterationCount > 1 && (
                <span className="text-xs text-slate-500">{child.iterationCount} rounds</span>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Spawn button */}
      <button
        onClick={() => router.push(`/studio/decisions/new?parent=${decisionId}`)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-300/70 hover:text-amber-200 border border-amber-800/30 hover:border-amber-700/50 rounded-lg transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Spawn Next Question
      </button>
    </div>
  );
}
