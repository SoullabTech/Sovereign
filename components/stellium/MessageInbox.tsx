"use client";

/**
 * MESSAGE INBOX
 *
 * Practitioner's inbox showing clients with unread messages.
 * Safety concerns are highlighted and prioritized.
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  MessageSquare,
  AlertTriangle,
  Clock,
  Search,
  ChevronRight,
  Filter,
  RefreshCw,
  Check,
  Eye,
  Shield,
} from 'lucide-react';
import type { MessageInboxItem, MessageUrgency } from '@/lib/practitioner/messages';
import { getUrgencyConfig, getMessageTypeConfig } from '@/lib/practitioner/messages';

interface SafetyConcernPreview {
  id: string;
  client_id: string;
  client_name: string;
  body_preview: string;
  created_at: string;
  safety_log_id?: string | null;
  safety_acknowledged_at?: string | null;
}

interface MessageInboxProps {
  inbox: MessageInboxItem[];
  totalUnread: number;
  totalSafetyConcerns: number;
  totalUnacknowledgedSafety?: number;
  onSelectClient: (clientId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  safetyConcerns?: SafetyConcernPreview[];
}

export default function MessageInbox({
  inbox,
  totalUnread,
  totalSafetyConcerns,
  totalUnacknowledgedSafety = 0,
  onSelectClient,
  onRefresh,
  isLoading = false,
  safetyConcerns = [],
}: MessageInboxProps) {
  // Filter to unacknowledged safety concerns for the banner
  const unacknowledgedConcerns = safetyConcerns.filter(c => !c.safety_acknowledged_at);
  const acknowledgedConcerns = safetyConcerns.filter(c => c.safety_acknowledged_at);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'safety'>('unread');

  const filteredInbox = inbox.filter(item => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!item.client_name.toLowerCase().includes(query) &&
          !item.client_preferred_name?.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Status filter
    if (filter === 'unread' && item.unread_count === 0) return false;
    if (filter === 'safety' && item.safety_count === 0) return false;

    return true;
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* Safety Alerts Banner */}
      {totalSafetyConcerns > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-red-300">
                {unacknowledgedConcerns.length > 0 ? (
                  <>{unacknowledgedConcerns.length} Safety Concern{unacknowledgedConcerns.length > 1 ? 's' : ''} Need Review</>
                ) : (
                  <>All {totalSafetyConcerns} Safety Concern{totalSafetyConcerns > 1 ? 's' : ''} Reviewed</>
                )}
              </h3>
              <p className="text-sm text-red-400/70">
                {unacknowledgedConcerns.length > 0
                  ? 'These messages require your attention'
                  : 'All safety concerns have been acknowledged'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilter('safety')}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Quick preview of unacknowledged safety concerns first */}
          {unacknowledgedConcerns.slice(0, 2).map(concern => (
            <div
              key={concern.id}
              onClick={() => onSelectClient(concern.client_id)}
              className="mt-3 p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900/70 transition-colors border-l-2 border-red-500"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-gray-200">{concern.client_name}</span>
                <Badge className="bg-red-500/20 text-red-400 text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Needs Review
                </Badge>
                <span className="text-xs text-gray-500">{formatTimeAgo(concern.created_at)}</span>
              </div>
              <p className="text-sm text-gray-400 line-clamp-2">{concern.body_preview}</p>
            </div>
          ))}

          {/* Show recently acknowledged if space permits and no unacknowledged */}
          {unacknowledgedConcerns.length === 0 && acknowledgedConcerns.slice(0, 1).map(concern => (
            <div
              key={concern.id}
              onClick={() => onSelectClient(concern.client_id)}
              className="mt-3 p-3 bg-gray-900/30 rounded-lg cursor-pointer hover:bg-gray-900/50 transition-colors border-l-2 border-green-500/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-gray-300">{concern.client_name}</span>
                <Badge className="bg-green-500/20 text-green-400 text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  Reviewed
                </Badge>
                <span className="text-xs text-gray-500">{formatTimeAgo(concern.created_at)}</span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{concern.body_preview}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Header with Stats */}
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-100">
              <MessageSquare className="w-5 h-5 text-sacred-gold" />
              Messages
              {totalUnread > 0 && (
                <Badge variant="secondary" className="bg-sacred-gold/20 text-sacred-gold ml-2">
                  {totalUnread} unread
                </Badge>
              )}
            </CardTitle>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-200"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-800/50 border-gray-700/50 text-gray-200"
              />
            </div>
            <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
              {(['all', 'unread', 'safety'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    filter === f
                      ? 'bg-sacred-gold/20 text-sacred-gold'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : 'Safety'}
                </button>
              ))}
            </div>
          </div>

          {/* Message List */}
          <div className="space-y-2">
            {filteredInbox.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500">
                  {filter === 'unread'
                    ? 'No unread messages'
                    : filter === 'safety'
                    ? 'No safety concerns'
                    : 'No messages yet'}
                </p>
              </div>
            ) : (
              filteredInbox.map(item => (
                <InboxItem
                  key={item.client_id}
                  item={item}
                  onClick={() => onSelectClient(item.client_id)}
                  formatTimeAgo={formatTimeAgo}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface InboxItemProps {
  item: MessageInboxItem;
  onClick: () => void;
  formatTimeAgo: (date: string) => string;
}

function InboxItem({ item, onClick, formatTimeAgo }: InboxItemProps) {
  const displayName = item.client_preferred_name || item.client_name;
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const urgencyConfig = item.latest_urgency
    ? getUrgencyConfig(item.latest_urgency)
    : null;
  const typeConfig = item.latest_message_type
    ? getMessageTypeConfig(item.latest_message_type)
    : null;

  // Determine safety status for the latest safety concern
  const hasSafetyConcern = item.safety_count > 0;
  const latestSafetyAcknowledged = hasSafetyConcern && !!item.safety_acknowledged_at;
  const hasUnacknowledgedSafety = hasSafetyConcern && !latestSafetyAcknowledged;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
        hasUnacknowledgedSafety
          ? 'bg-red-500/5 border-red-500/30 hover:bg-red-500/10'
          : latestSafetyAcknowledged
          ? 'bg-gray-800/40 border-green-500/20 hover:border-green-500/30'
          : item.unread_count > 0
          ? 'bg-gray-800/50 border-gray-700/50 hover:border-sacred-gold/30'
          : 'bg-gray-800/30 border-gray-700/30 hover:border-gray-600/50'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
            hasUnacknowledgedSafety
              ? 'bg-red-500/20 border-red-500/30'
              : latestSafetyAcknowledged
              ? 'bg-green-500/10 border-green-500/20'
              : 'bg-gradient-to-br from-sacred-gold/20 to-amber-600/20 border-sacred-gold/20'
          }`}>
            <span className={`text-sm font-medium ${
              hasUnacknowledgedSafety
                ? 'text-red-400'
                : latestSafetyAcknowledged
                ? 'text-green-400'
                : 'text-sacred-gold'
            }`}>
              {initials}
            </span>
          </div>
          {item.unread_count > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-sacred-gold rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-900">{item.unread_count}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-gray-200 truncate">{displayName}</span>
            {/* Safety status pill */}
            {hasUnacknowledgedSafety && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                <Eye className="w-3 h-3 mr-1" />
                Needs Review
              </Badge>
            )}
            {latestSafetyAcknowledged && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                <Check className="w-3 h-3 mr-1" />
                Reviewed
              </Badge>
            )}
            {typeConfig && !hasSafetyConcern && (
              <Badge variant="outline" className={`${typeConfig.color} border-gray-600 text-xs`}>
                {typeConfig.label}
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-400 line-clamp-1">
            {item.latest_message_preview}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500">
              {formatTimeAgo(item.latest_message_at)}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0 self-center" />
      </div>
    </motion.div>
  );
}
