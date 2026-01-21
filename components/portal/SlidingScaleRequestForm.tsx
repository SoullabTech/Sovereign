"use client";

/**
 * SLIDING SCALE REQUEST FORM
 *
 * Client-facing form for requesting a sliding scale spot.
 * "No proof required. We'll find what's sustainable."
 *
 * Designed to feel dignified, not humiliating.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Heart,
  Loader2,
  Check,
  AlertCircle,
  DollarSign,
} from 'lucide-react';

interface SlidingScalePolicy {
  public_label: string | null;
  public_description: string | null;
  min_rate_cents: number;
  max_rate_cents: number;
  currency: string;
  spots_available: number;
  intake_prompt: string | null;
  request_form_enabled: boolean;
}

interface SlidingScaleRequestFormProps {
  slug: string;
  token?: string;
  onSuccess?: () => void;
}

function formatCurrency(cents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function SlidingScaleRequestForm({
  slug,
  token,
  onSuccess,
}: SlidingScaleRequestFormProps) {
  const [policy, setPolicy] = useState<SlidingScalePolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [message, setMessage] = useState('');

  // Fetch policy on mount
  useEffect(() => {
    fetchPolicy();
  }, [slug]);

  const fetchPolicy = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/portal/${slug}/sliding-scale`);
      if (!response.ok) {
        throw new Error('Failed to load');
      }

      const data = await response.json();

      if (!data.available) {
        setError(data.message || 'Sliding scale is not currently available.');
        return;
      }

      setPolicy(data.policy);
    } catch (err) {
      setError('Unable to load sliding scale information.');
      console.error('[SlidingScaleRequestForm] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token && !clientName.trim()) {
      setError('Please provide your name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/portal/${slug}/sliding-scale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          client_name: clientName.trim() || undefined,
          client_email: clientEmail.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error || 'Failed to submit');
      }

      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (error && !policy) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="py-12 text-center">
          <p className="text-gray-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-200 mb-2">
            Request Received
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Your sliding scale request has been submitted. You'll be contacted
            with a response.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!policy) {
    return null;
  }

  // No spots available
  if (policy.spots_available === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="w-5 h-5 text-sacred-gold" />
            {policy.public_label || 'Sliding Scale'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 text-center">
            <p className="text-gray-300">
              All sliding scale spots are currently filled.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Please check back later or reach out directly.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="w-5 h-5 text-sacred-gold" />
          {policy.public_label || 'Sliding Scale'}
        </CardTitle>
        {policy.public_description && (
          <CardDescription className="text-gray-400">
            {policy.public_description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rate range display */}
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
            <div className="flex items-center gap-2 text-gray-300 mb-1">
              <DollarSign className="w-4 h-4 text-sacred-gold" />
              <span>Rate range:</span>
              <span className="font-medium">
                {formatCurrency(policy.min_rate_cents, policy.currency)} –{' '}
                {formatCurrency(policy.max_rate_cents, policy.currency)}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {policy.spots_available} spot{policy.spots_available !== 1 ? 's' : ''} currently available
            </p>
          </div>

          {/* Name (only if no token) */}
          {!token && (
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-gray-300">
                Your Name
              </Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="bg-gray-800 border-gray-700 text-gray-100"
                placeholder="How you'd like to be addressed"
                required={!token}
              />
            </div>
          )}

          {/* Email (always optional) */}
          <div className="space-y-2">
            <Label htmlFor="clientEmail" className="text-gray-300">
              Email <span className="text-gray-500">(optional)</span>
            </Label>
            <Input
              id="clientEmail"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100"
              placeholder="For receiving a response"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-300">
              {policy.intake_prompt || 'What feels sustainable for you right now?'}
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100 resize-none"
              placeholder="Briefly is fine..."
              rows={3}
            />
            <p className="text-xs text-gray-500">
              No proof or explanation required. Share as much or as little as feels right.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-sacred-gold text-gray-900 hover:bg-sacred-gold/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
