'use client';

/**
 * Comms Studio — unified practitioner inbox (READ-ONLY).
 *
 * Displays live conversations from the Comms Spine (`/api/comms/inbox`)
 * across clinical / ops / community domains. Selecting a thread opens a
 * read-only detail view (messages + MAIA reply suggestions). There is no
 * compose / reply / send here — outbound messaging is a separate,
 * explicitly-authorized capability.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Search,
  Loader2,
  ShieldAlert,
  GripVertical,
  Activity,
  Briefcase,
  Users,
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { CommsThreadDetail } from '@/components/studio/CommsThreadDetail';
import {
  fetchInbox,
  formatRelativeTime,
  threadTitle,
  DOMAIN_LABEL,
  CommsApiError,
  type InboxThread,
  type InboxResponse,
  type CommsDomain,
} from '@/lib/studio/commsApi';

type FilterKey = 'all' | 'unread' | 'safety' | CommsDomain;

const FILTERS: FilterKey[] = ['all', 'unread', 'safety', 'clinical', 'ops', 'community'];

const DOMAIN_ICON: Record<CommsDomain, typeof Activity> = {
  clinical: Activity,
  ops: Briefcase,
  community: Users,
};

const DOMAIN_COLOR: Record<CommsDomain, string> = {
  clinical: 'bg-blue-500/20 text-blue-400',
  ops: 'bg-amber-500/20 text-amber-400',
  community: 'bg-purple-500/20 text-purple-400',
};

function filterLabel(f: FilterKey): string {
  if (f === 'all') return 'All';
  if (f === 'unread') return 'Unread';
  if (f === 'safety') return 'Safety';
  return DOMAIN_LABEL[f];
}

export default function CommsPage() {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const [inbox, setInbox] = useState<InboxResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  // Resizable panel state (desktop only)
  const [panelWidth, setPanelWidth] = useState(420);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load the live inbox once on mount.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchInbox()
      .then((data) => {
        if (cancelled) return;
        setInbox(data);
        // Auto-select the first thread on desktop for a populated initial view.
        if (data.threads.length > 0) {
          setSelectedThread((cur) => cur ?? data.threads[0].thread_id);
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (e instanceof CommsApiError && e.status === 401) {
          setError('Sign in as a practitioner to view your inbox.');
        } else {
          setError(e instanceof Error ? e.message : 'Failed to load inbox.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      setPanelWidth(Math.min(600, Math.max(280, newWidth)));
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const threads = inbox?.threads ?? [];

  const filteredThreads = threads.filter((t) => {
    const title = threadTitle(t).toLowerCase();
    const matchesSearch =
      title.includes(searchQuery.toLowerCase()) ||
      t.last_message_preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'unread' && t.unread_count > 0) ||
      (filter === 'safety' && t.has_safety_flag) ||
      filter === t.domain;
    return matchesSearch && matchesFilter;
  });

  const onSelectThread = (thread: InboxThread) => {
    if (isMobile) {
      router.push(`/studio/comms/${thread.thread_id}`);
      return;
    }
    setSelectedThread(thread.thread_id);
  };

  // ─── Message List Item ─────────────────────────────────────
  const renderThreadItem = (thread: InboxThread) => {
    const DomainIcon = DOMAIN_ICON[thread.domain] ?? Activity;
    const isSelected = !isMobile && selectedThread === thread.thread_id;
    const isUnread = thread.unread_count > 0;
    const title = threadTitle(thread);
    const senderPrefix =
      thread.last_message_sender === 'practitioner' ? 'You: ' : '';

    return (
      <button
        key={thread.thread_id}
        onClick={() => onSelectThread(thread)}
        className={`
          w-full p-3 border-b border-slate-800/50 text-left transition-colors
          ${isSelected ? 'bg-slate-800' : 'hover:bg-slate-900'}
          ${isUnread ? 'bg-slate-900/50' : ''}
        `}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              DOMAIN_COLOR[thread.domain]
            }`}
          >
            <DomainIcon className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span
                className={`text-sm truncate ${
                  isUnread ? 'font-semibold text-white' : 'text-slate-300'
                }`}
              >
                {title}
              </span>
              <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                {formatRelativeTime(thread.last_message_at)}
              </span>
            </div>
            <div className={`text-xs truncate ${isUnread ? 'text-slate-300' : 'text-slate-500'}`}>
              {senderPrefix}
              {thread.last_message_preview || 'No messages yet'}
            </div>
          </div>

          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            {thread.has_safety_flag && (
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            )}
            {isUnread && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-teal-500 text-[10px] font-semibold text-white flex items-center justify-center">
                {thread.unread_count}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  // ─── List Header + Search + Filters ────────────────────────
  const renderListHeader = () => {
    const summary = inbox?.summary;
    const ribbon = inbox?.safety_ribbon;
    return (
      <>
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Comms
          </h1>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span>{summary?.total_threads ?? 0} conversations</span>
            <span>•</span>
            <span>{summary?.total_unread ?? 0} unread</span>
            {ribbon?.has_unacknowledged && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-red-400">
                  <ShieldAlert className="w-3 h-3" />
                  {ribbon.total_unacknowledged} safety
                </span>
              </>
            )}
          </div>
        </div>

        <div className="p-3 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
            />
          </div>
        </div>

        <div className="p-2 border-b border-slate-800 flex items-center gap-1 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                filter === f ? 'bg-teal-500/20 text-teal-400' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {filterLabel(f)}
            </button>
          ))}
        </div>
      </>
    );
  };

  // ─── List body (loading / error / empty / list) ────────────
  const renderListBody = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center p-6 text-center text-sm text-slate-400">
          <div>
            <ShieldAlert className="w-8 h-8 mx-auto mb-3 text-slate-600" />
            {error}
          </div>
        </div>
      );
    }
    if (filteredThreads.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center p-6 text-center text-sm text-slate-500">
          {threads.length === 0 ? 'No conversations yet.' : 'No conversations match this filter.'}
        </div>
      );
    }
    return (
      <div className="flex-1 overflow-y-auto">{filteredThreads.map(renderThreadItem)}</div>
    );
  };

  // ─── MOBILE: list only (detail is a separate route) ────────
  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {renderListHeader()}
        {renderListBody()}
      </div>
    );
  }

  // ─── DESKTOP: split pane ───────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen bg-slate-950 flex">
      <div
        className="flex-shrink-0 border-r border-slate-800 flex flex-col overflow-hidden"
        style={{ width: panelWidth }}
      >
        {renderListHeader()}
        {renderListBody()}
      </div>

      <div
        onMouseDown={handleMouseDown}
        className={`w-2 flex-shrink-0 cursor-col-resize flex items-center justify-center transition-colors ${
          isDragging ? 'bg-teal-500' : 'bg-slate-800 hover:bg-teal-500/50'
        }`}
      >
        <GripVertical className={`w-3 h-3 ${isDragging ? 'text-white' : 'text-slate-600'}`} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <CommsThreadDetail threadId={selectedThread} />
      </div>
    </div>
  );
}
