"use client";

/**
 * SLIDING SCALE REQUESTS INBOX
 *
 * View and manage sliding scale requests.
 * Practitioners can approve/decline requests from here.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Inbox,
  Clock,
  Check,
  X,
  Loader2,
  AlertCircle,
  User,
  Mail,
  DollarSign,
  ChevronRight,
} from 'lucide-react';

interface SlidingScaleRequest {
  id: string;
  client_name: string | null;
  client_email: string | null;
  requested_rate_cents: number | null;
  message: string | null;
  status: 'pending' | 'approved' | 'declined' | 'withdrawn' | 'expired';
  created_at: string;
}

interface SlidingScaleRequestsInboxProps {
  onSelectRequest?: (request: SlidingScaleRequest) => void;
  onRefresh?: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return 'Today';
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export default function SlidingScaleRequestsInbox({
  onSelectRequest,
  onRefresh,
}: SlidingScaleRequestsInboxProps) {
  const [requests, setRequests] = useState<SlidingScaleRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'declined'>('pending');

  const fetchRequests = useCallback(async (status: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/practitioner/sliding-scale/requests?status=${status}`);
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data.requests);
      setPendingCount(data.pending_count);
    } catch (err) {
      setError('Failed to load requests');
      console.error('[SlidingScaleRequestsInbox] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(activeTab);
  }, [activeTab, fetchRequests]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'pending' | 'approved' | 'declined');
  };

  const statusColors = {
    pending: 'text-amber-400 bg-amber-500/10',
    approved: 'text-green-400 bg-green-500/10',
    declined: 'text-gray-400 bg-gray-500/10',
    withdrawn: 'text-gray-400 bg-gray-500/10',
    expired: 'text-gray-400 bg-gray-500/10',
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Inbox className="w-5 h-5 text-sacred-gold" />
          Sliding Scale Requests
        </CardTitle>
        <CardDescription>
          Review and respond to sliding scale requests
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-gray-700 relative"
            >
              Pending
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="data-[state=active]:bg-gray-700"
            >
              Approved
            </TabsTrigger>
            <TabsTrigger
              value="declined"
              className="data-[state=active]:bg-gray-700"
            >
              Declined
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-red-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>
                  {activeTab === 'pending'
                    ? 'No pending requests'
                    : activeTab === 'approved'
                    ? 'No approved requests'
                    : 'No declined requests'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {requests.map((request) => (
                  <button
                    key={request.id}
                    onClick={() => onSelectRequest?.(request)}
                    className="w-full text-left p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-200 truncate">
                            {request.client_name || 'Anonymous'}
                          </span>
                          {request.client_email && (
                            <Mail className="w-3 h-3 text-gray-500" />
                          )}
                        </div>

                        {request.message && (
                          <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                            {request.message}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(request.created_at)}
                          </span>
                          {request.requested_rate_cents && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              Requested: {formatCurrency(request.requested_rate_cents)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${statusColors[request.status]}`}
                        >
                          {request.status}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Tabs>

        {/* Refresh button */}
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              fetchRequests(activeTab);
              onRefresh?.();
            }}
            className="text-gray-400 hover:text-gray-200"
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
