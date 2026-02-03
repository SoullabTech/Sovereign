"use client";

/**
 * COMMS SPINE: Inbox List
 *
 * Displays practitioner's unified inbox across all domains.
 * Sorted by safety priority > unread > recency.
 *
 * Design principles:
 * - Safety-first sorting (crisis > red > yellow > unread > read)
 * - Domain tabs for filtering
 * - Preview of last message
 * - Clear visual hierarchy
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  AlertTriangle,
  AlertCircle,
  Clock,
  User,
  ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { CommsDomain } from '@/lib/comms/types';

export interface InboxThread {
  thread_id: string;
  domain: CommsDomain;
  thread_type: string;
  client_id: string | null;
  client_name: string | null;
  last_message_preview: string;
  last_message_at: string;
  last_message_sender: string;
  unread_count: number;
  has_safety_flag: boolean;
  highest_safety_severity: 'yellow' | 'red' | 'crisis' | null;
}

interface InboxListProps {
  threads: InboxThread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  activeFilter: CommsDomain | 'all';
  onFilterChange: (filter: CommsDomain | 'all') => void;
  isLoading?: boolean;
}

const domainConfig: Record<CommsDomain, { label: string; color: string }> = {
  clinical: { label: 'Clinical', color: 'text-blue-400 bg-blue-400/10' },
  ops: { label: 'Operations', color: 'text-purple-400 bg-purple-400/10' },
  community: { label: 'Community', color: 'text-green-400 bg-green-400/10' },
};

const severityIndicator = {
  crisis: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/20' },
  red: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/20' },
  yellow: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/20' },
};

export function InboxList({
  threads,
  selectedThreadId,
  onSelectThread,
  activeFilter,
  onFilterChange,
  isLoading = false,
}: InboxListProps) {
  const filters: Array<{ key: CommsDomain | 'all'; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'clinical', label: 'Clinical' },
    { key: 'ops', label: 'Operations' },
    { key: 'community', label: 'Community' },
  ];

  const filteredThreads = activeFilter === 'all'
    ? threads
    : threads.filter(t => t.domain === activeFilter);

  return (
    <div className="flex flex-col h-full">
      {/* Domain filter tabs */}
      <div className="flex items-center space-x-1 p-2 border-b border-gray-800/50">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeFilter === filter.key
                ? 'bg-sacred-gold/20 text-sacred-gold'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p>No messages</p>
            <p className="text-sm mt-1">
              {activeFilter === 'all' ? 'Your inbox is empty' : `No ${activeFilter} messages`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/30">
            {filteredThreads.map((thread, index) => (
              <ThreadRow
                key={thread.thread_id}
                thread={thread}
                isSelected={selectedThreadId === thread.thread_id}
                onClick={() => onSelectThread(thread.thread_id)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ThreadRowProps {
  thread: InboxThread;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

function ThreadRow({ thread, isSelected, onClick, index }: ThreadRowProps) {
  const severity = thread.highest_safety_severity;
  const severityConfig = severity ? severityIndicator[severity] : null;
  const SeverityIcon = severityConfig?.icon;
  const domain = domainConfig[thread.domain];

  const timeAgo = formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true });

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      onClick={onClick}
      className={`w-full text-left p-4 transition-colors ${
        isSelected
          ? 'bg-sacred-gold/10 border-l-2 border-sacred-gold'
          : 'hover:bg-gray-800/30 border-l-2 border-transparent'
      } ${thread.unread_count > 0 ? 'bg-gray-800/20' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Avatar / Safety indicator */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            severityConfig ? severityConfig.bg : 'bg-gray-700/50'
          }`}>
            {SeverityIcon ? (
              <SeverityIcon className={`w-5 h-5 ${severityConfig?.color}`} />
            ) : (
              <User className="w-5 h-5 text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className={`font-medium ${thread.unread_count > 0 ? 'text-gray-100' : 'text-gray-300'}`}>
                  {thread.client_name || 'Unknown'}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${domain.color}`}>
                  {domain.label}
                </span>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="text-xs text-gray-500">{timeAgo}</span>
                {thread.unread_count > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-medium bg-sacred-gold/20 text-sacred-gold rounded-full">
                    {thread.unread_count}
                  </span>
                )}
              </div>
            </div>

            {/* Preview */}
            <p className={`text-sm truncate ${
              thread.unread_count > 0 ? 'text-gray-300' : 'text-gray-500'
            }`}>
              {thread.last_message_sender === 'client' && <span className="text-gray-400">Client: </span>}
              {thread.last_message_sender === 'practitioner' && <span className="text-sacred-gold/70">You: </span>}
              {thread.last_message_preview}
            </p>

            {/* Safety flag indicator */}
            {thread.has_safety_flag && severity && (
              <div className={`flex items-center space-x-1 mt-1 text-xs ${severityConfig?.color}`}>
                <AlertTriangle className="w-3 h-3" />
                <span>
                  {severity === 'crisis' ? 'CRISIS - Needs immediate review' :
                   severity === 'red' ? 'Urgent safety concern' :
                   'Safety flag for review'}
                </span>
              </div>
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-gray-600 flex-shrink-0 ml-2" />
      </div>
    </motion.button>
  );
}

export default InboxList;
