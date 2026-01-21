"use client";

/**
 * SLIDING SCALE REQUEST DETAIL
 *
 * View and decide on a sliding scale request.
 * Approve with rate selection or decline with optional note.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  ArrowLeft,
  User,
  Mail,
  Clock,
  DollarSign,
  Check,
  X,
  Loader2,
  AlertCircle,
  MessageSquare,
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

interface SlidingScaleRequestDetailProps {
  request: SlidingScaleRequest;
  onBack: () => void;
  onDecided: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function SlidingScaleRequestDetail({
  request,
  onBack,
  onDecided,
}: SlidingScaleRequestDetailProps) {
  const [policyBounds, setPolicyBounds] = useState({ min: 0, max: 15000 });
  const [approvedRate, setApprovedRate] = useState(
    request.requested_rate_cents || 5000
  );
  const [decisionNote, setDecisionNote] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch policy bounds on mount
  useEffect(() => {
    fetchPolicyBounds();
  }, []);

  const fetchPolicyBounds = async () => {
    try {
      const response = await fetch('/api/practitioner/sliding-scale/policy');
      if (response.ok) {
        const data = await response.json();
        if (data.policy) {
          setPolicyBounds({
            min: data.policy.min_rate_cents,
            max: data.policy.max_rate_cents,
          });
          // Set approved rate to requested or middle of range
          const requestedOrDefault =
            request.requested_rate_cents ||
            Math.round((data.policy.min_rate_cents + data.policy.max_rate_cents) / 2);
          setApprovedRate(
            Math.max(
              data.policy.min_rate_cents,
              Math.min(data.policy.max_rate_cents, requestedOrDefault)
            )
          );
        }
      }
    } catch (err) {
      console.error('[SlidingScaleRequestDetail] Error fetching policy:', err);
    }
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      setError(null);

      const response = await fetch(
        `/api/practitioner/sliding-scale/requests/${request.id}/decide`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decision: 'approve',
            approved_rate_cents: approvedRate,
            decision_note: decisionNote || undefined,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve');
      }

      onDecided();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setIsApproving(false);
    }
  };

  const handleDecline = async () => {
    try {
      setIsDeclining(true);
      setError(null);

      const response = await fetch(
        `/api/practitioner/sliding-scale/requests/${request.id}/decide`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decision: 'decline',
            decision_note: decisionNote || undefined,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to decline');
      }

      onDecided();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline request');
    } finally {
      setIsDeclining(false);
    }
  };

  const isDecided = request.status !== 'pending';

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-gray-400 hover:text-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <CardTitle className="text-lg">
            Sliding Scale Request
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Request info */}
        <div className="space-y-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-200">
                {request.client_name || 'Anonymous'}
              </p>
              {request.client_email && (
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {request.client_email}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDate(request.created_at)}
            </span>
            {request.requested_rate_cents && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Requested: ${(request.requested_rate_cents / 100).toFixed(0)}
              </span>
            )}
          </div>

          {request.message && (
            <div className="pt-3 border-t border-gray-700">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                <p className="text-gray-300 whitespace-pre-wrap">
                  {request.message}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Already decided notice */}
        {isDecided && (
          <div
            className={`p-4 rounded-lg border ${
              request.status === 'approved'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-gray-500/10 border-gray-500/30 text-gray-400'
            }`}
          >
            <p className="font-medium">
              {request.status === 'approved'
                ? 'This request has been approved'
                : `This request has been ${request.status}`}
            </p>
          </div>
        )}

        {/* Decision form (only for pending) */}
        {!isDecided && (
          <>
            {/* Rate selection */}
            <div className="space-y-4">
              <Label className="text-gray-300">Approved Rate</Label>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-sacred-gold">
                  ${(approvedRate / 100).toFixed(0)}
                </span>
                <span className="text-gray-500">per session</span>
              </div>
              <Slider
                value={[approvedRate]}
                onValueChange={([value]) => setApprovedRate(value)}
                min={policyBounds.min}
                max={policyBounds.max}
                step={500}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>${(policyBounds.min / 100).toFixed(0)}</span>
                <span>${(policyBounds.max / 100).toFixed(0)}</span>
              </div>
            </div>

            {/* Decision note */}
            <div className="space-y-2">
              <Label htmlFor="decisionNote" className="text-gray-300">
                Private Note (optional)
              </Label>
              <Textarea
                id="decisionNote"
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                className="bg-gray-800 border-gray-700 text-gray-100 resize-none"
                placeholder="Add a private note about this decision..."
                rows={2}
              />
              <p className="text-xs text-gray-500">
                Keep notes de-identified (no names, employers, or exact dates).
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleApprove}
                disabled={isApproving || isDeclining}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Approve at ${(approvedRate / 100).toFixed(0)}
                  </>
                )}
              </Button>
              <Button
                onClick={handleDecline}
                disabled={isApproving || isDeclining}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                {isDeclining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Declining...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
