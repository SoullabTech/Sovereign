'use client';

/**
 * CommsThreadDetail — READ-ONLY thread view for the Comms Studio.
 *
 * Renders a live conversation (messages) plus any existing MAIA reply
 * suggestions for the thread. Display-only by design: there are no
 * reply / send / acknowledge affordances. Enabling outbound messaging
 * is a separate, explicitly-authorized capability.
 */

import { useEffect, useState } from 'react';
import {
  Loader2,
  ShieldAlert,
  Sparkles,
  Lock,
  Activity,
  Briefcase,
  Users,
} from 'lucide-react';
import {
  fetchThread,
  fetchSuggestions,
  formatRelativeTime,
  threadTitle,
  DOMAIN_LABEL,
  SENDER_LABEL,
  CommsApiError,
  type ThreadDetail,
  type ThreadMessage,
  type ReplySuggestion,
  type CommsDomain,
  type CommsSeverity,
} from '@/lib/studio/commsApi';

const DOMAIN_ICON: Record<CommsDomain, typeof Activity> = {
  clinical: Activity,
  ops: Briefcase,
  community: Users,
};

const SEVERITY_STYLE: Record<CommsSeverity, string> = {
  yellow: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  red: 'bg-red-500/15 text-red-300 border-red-500/30',
  crisis: 'bg-red-600/25 text-red-200 border-red-500/50',
};

interface Props {
  threadId: string | null;
}

export function CommsThreadDetail({ threadId }: Props) {
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [suggestions, setSuggestions] = useState<ReplySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!threadId) {
      setThread(null);
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchThread(threadId),
      // Suggestions are best-effort; never block the thread on them.
      fetchSuggestions(threadId).catch(() => [] as ReplySuggestion[]),
    ])
      .then(([t, s]) => {
        if (cancelled) return;
        setThread(t);
        setSuggestions(s);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (e instanceof CommsApiError && e.status === 401) {
          setError('Sign in as a practitioner to view this conversation.');
        } else if (e instanceof CommsApiError && e.status === 404) {
          setError('Conversation not found.');
        } else {
          setError(e instanceof Error ? e.message : 'Failed to load conversation.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [threadId]);

  if (!threadId) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <div>Select a conversation to view</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-sm text-center text-sm text-slate-400">
          <ShieldAlert className="w-8 h-8 mx-auto mb-3 text-slate-600" />
          {error}
        </div>
      </div>
    );
  }

  if (!thread) return null;

  const DomainIcon = DOMAIN_ICON[thread.thread.domain] ?? Activity;
  const title = threadTitle({
    client_name: thread.thread.client?.name ?? null,
    domain: thread.thread.domain,
    thread_type: thread.thread.thread_type,
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <DomainIcon className="w-4 h-4 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            {DOMAIN_LABEL[thread.thread.domain]}
          </span>
          {thread.thread.thread_type && (
            <span>{thread.thread.thread_type.replace(/_/g, ' ')}</span>
          )}
        </div>
      </div>

      {/* Read-only notice */}
      <div className="px-4 py-2 border-b border-slate-800/60 bg-slate-900/40">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Lock className="w-3 h-3" />
          Read-only view — sending is disabled.
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {thread.messages.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-8">
            No messages in this conversation yet.
          </div>
        ) : (
          thread.messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>

      {/* AI reply suggestions (read-only) */}
      {suggestions.length > 0 && (
        <div className="border-t border-slate-800 p-4 max-h-[40%] overflow-y-auto">
          <div className="flex items-center gap-1.5 mb-3 text-xs font-medium text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            MAIA reply suggestions
            <span className="text-slate-600">· read-only</span>
          </div>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <SuggestionCard key={s.id} suggestion={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ThreadMessage }) {
  const isPractitioner = message.sender_type === 'practitioner';
  const senderLabel = SENDER_LABEL[message.sender_type] ?? message.sender_type;

  return (
    <div className={`flex flex-col ${isPractitioner ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] rounded-xl px-4 py-3 ${
          isPractitioner
            ? 'bg-teal-500/15 border border-teal-500/20'
            : message.sender_type === 'maia'
            ? 'bg-indigo-500/10 border border-indigo-500/20'
            : 'bg-slate-900 border border-slate-800'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-slate-300">{senderLabel}</span>
          {message.urgency === 'time_sensitive' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">
              time-sensitive
            </span>
          )}
          {message.urgency === 'safety_concern' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-300">
              safety
            </span>
          )}
        </div>
        <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
          {message.body}
        </p>

        {message.safety_flags.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.safety_flags.map((f) => (
              <div
                key={f.id}
                className={`text-[11px] px-2 py-1 rounded border ${SEVERITY_STYLE[f.severity]}`}
              >
                <span className="font-medium uppercase">{f.severity}</span>
                {f.cues.length > 0 && <span className="opacity-80"> · {f.cues.join(', ')}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      <span className="text-[10px] text-slate-600 mt-1 px-1">
        {formatRelativeTime(message.created_at)}
      </span>
    </div>
  );
}

function SuggestionCard({ suggestion }: { suggestion: ReplySuggestion }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-300">
          {suggestion.title || 'Suggestion'}
        </span>
        <span className="text-[10px] text-slate-500">
          {suggestion.kind} · {Math.round(suggestion.confidence * 100)}%
        </span>
      </div>
      <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">
        {suggestion.suggested_text}
      </p>
      {suggestion.rationale && (
        <p className="text-[10px] text-slate-600 mt-1.5 italic">{suggestion.rationale}</p>
      )}
    </div>
  );
}
