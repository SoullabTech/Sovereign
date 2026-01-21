"use client";

/**
 * SLIDING SCALE POLICY CARD
 *
 * Configure sliding scale availability, rate bounds, and capacity.
 * "Dignified affordability—no power games."
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  DollarSign,
  Users,
  Settings,
  Check,
  Loader2,
  AlertCircle,
  Inbox,
  Award,
} from 'lucide-react';

interface SlidingScalePolicy {
  id: string;
  is_enabled: boolean;
  public_label: string | null;
  public_description: string | null;
  min_rate_cents: number;
  max_rate_cents: number;
  session_length_minutes: number;
  currency: string;
  spots_total: number;
  spots_filled: number;
  request_form_enabled: boolean;
  auto_close_when_full: boolean;
  intake_prompt: string | null;
}

interface PolicyCounts {
  pending_requests: number;
  active_awards: number;
  spots_available: number;
}

interface SlidingScalePolicyCardProps {
  practitionerId: string;
  onViewRequests?: () => void;
}

export default function SlidingScalePolicyCard({
  practitionerId,
  onViewRequests,
}: SlidingScalePolicyCardProps) {
  const [policy, setPolicy] = useState<SlidingScalePolicy | null>(null);
  const [counts, setCounts] = useState<PolicyCounts>({
    pending_requests: 0,
    active_awards: 0,
    spots_available: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [isEnabled, setIsEnabled] = useState(false);
  const [publicLabel, setPublicLabel] = useState('Sliding scale availability');
  const [publicDescription, setPublicDescription] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [spotsTotal, setSpotsTotal] = useState('');
  const [intakePrompt, setIntakePrompt] = useState(
    'If cost is a barrier, share what feels sustainable right now—briefly is fine.'
  );
  const [requestFormEnabled, setRequestFormEnabled] = useState(true);
  const [autoCloseWhenFull, setAutoCloseWhenFull] = useState(true);

  // Fetch policy on mount
  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/practitioner/sliding-scale/policy');
      if (!response.ok) {
        throw new Error('Failed to fetch policy');
      }

      const data = await response.json();

      if (data.policy) {
        setPolicy(data.policy);
        setIsEnabled(data.policy.is_enabled);
        setPublicLabel(data.policy.public_label || '');
        setPublicDescription(data.policy.public_description || '');
        setMinRate(String(data.policy.min_rate_cents / 100));
        setMaxRate(String(data.policy.max_rate_cents / 100));
        setSpotsTotal(String(data.policy.spots_total));
        setIntakePrompt(data.policy.intake_prompt || '');
        setRequestFormEnabled(data.policy.request_form_enabled);
        setAutoCloseWhenFull(data.policy.auto_close_when_full);
      } else if (data.defaults) {
        // Use defaults
        setMinRate(String(data.defaults.min_rate_cents / 100));
        setMaxRate(String(data.defaults.max_rate_cents / 100));
        setSpotsTotal(String(data.defaults.spots_total));
        setIntakePrompt(data.defaults.intake_prompt);
      }

      if (data.counts) {
        setCounts(data.counts);
      }
    } catch (err) {
      setError('Failed to load sliding scale settings');
      console.error('[SlidingScalePolicyCard] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      const minCents = Math.round(parseFloat(minRate || '0') * 100);
      const maxCents = Math.round(parseFloat(maxRate || '0') * 100);

      if (isEnabled && minCents > maxCents) {
        setError('Minimum rate cannot exceed maximum rate');
        return;
      }

      const response = await fetch('/api/practitioner/sliding-scale/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_enabled: isEnabled,
          public_label: publicLabel || undefined,
          public_description: publicDescription || undefined,
          min_rate_cents: minCents,
          max_rate_cents: maxCents,
          spots_total: parseInt(spotsTotal || '0', 10),
          intake_prompt: intakePrompt || undefined,
          request_form_enabled: requestFormEnabled,
          auto_close_when_full: autoCloseWhenFull,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      const data = await response.json();
      setPolicy(data.policy);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
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

  const spotsFilled = policy?.spots_filled || 0;
  const spotsAvailable = Math.max(0, parseInt(spotsTotal || '0', 10) - spotsFilled);

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-sacred-gold" />
              Sliding Scale
            </CardTitle>
            <CardDescription className="mt-1">
              Make your practice accessible without compromising sustainability
            </CardDescription>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status badges */}
        {isEnabled && (
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={onViewRequests}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm hover:bg-amber-500/20 transition-colors"
            >
              <Inbox className="w-4 h-4" />
              <span>{counts.pending_requests} pending</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              <Award className="w-4 h-4" />
              <span>{counts.active_awards} active</span>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                spotsAvailable === 0 && parseInt(spotsTotal || '0', 10) > 0
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  : 'bg-gray-500/10 border border-gray-500/30 text-gray-400'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>
                {spotsAvailable === 0 && parseInt(spotsTotal || '0', 10) > 0
                  ? 'At capacity'
                  : `${spotsAvailable} spots available`}
              </span>
            </div>
          </div>
        )}

        {/* Capacity full notice */}
        {isEnabled && spotsAvailable === 0 && parseInt(spotsTotal || '0', 10) > 0 && (
          <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20">
            <p className="text-sm text-rose-300">
              All sliding scale spots are currently filled. New requests will be held until a spot opens.
            </p>
          </div>
        )}

        {/* Rate range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minRate" className="text-gray-300 text-sm">
              Minimum Rate
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="minRate"
                type="number"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
                className="pl-7 bg-gray-800 border-gray-700 text-gray-100"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxRate" className="text-gray-300 text-sm">
              Maximum Rate
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="maxRate"
                type="number"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                className="pl-7 bg-gray-800 border-gray-700 text-gray-100"
                placeholder="150"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <Label htmlFor="spotsTotal" className="text-gray-300 text-sm">
            Total Sliding Scale Spots
          </Label>
          <Input
            id="spotsTotal"
            type="number"
            value={spotsTotal}
            onChange={(e) => setSpotsTotal(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100"
            placeholder="0"
            min="0"
          />
          <p className="text-xs text-gray-500">
            {spotsFilled > 0 && `${spotsFilled} currently filled. `}
            Set to 0 to accept requests without a cap.
          </p>
        </div>

        {/* Public copy */}
        <div className="space-y-2">
          <Label htmlFor="publicLabel" className="text-gray-300 text-sm">
            Public Label
          </Label>
          <Input
            id="publicLabel"
            value={publicLabel}
            onChange={(e) => setPublicLabel(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100"
            placeholder="Sliding scale availability"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="publicDescription" className="text-gray-300 text-sm">
            Public Description
          </Label>
          <Textarea
            id="publicDescription"
            value={publicDescription}
            onChange={(e) => setPublicDescription(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100 resize-none"
            placeholder="Brief description shown on your portal..."
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="intakePrompt" className="text-gray-300 text-sm">
            Request Form Prompt
          </Label>
          <Textarea
            id="intakePrompt"
            value={intakePrompt}
            onChange={(e) => setIntakePrompt(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100 resize-none"
            placeholder="What you ask clients submitting a request..."
            rows={2}
          />
          <p className="text-xs text-gray-500">
            This appears above the message field on the request form.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 pt-2 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300 text-sm">Accept new requests</Label>
              <p className="text-xs text-gray-500">Show request form on portal</p>
            </div>
            <Switch
              checked={requestFormEnabled}
              onCheckedChange={setRequestFormEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300 text-sm">Auto-close when full</Label>
              <p className="text-xs text-gray-500">Hide form when no spots available</p>
            </div>
            <Switch
              checked={autoCloseWhenFull}
              onCheckedChange={setAutoCloseWhenFull}
            />
          </div>
        </div>

        {/* Error/Success */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <Check className="w-4 h-4" />
            <span>Settings saved</span>
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-sacred-gold text-gray-900 hover:bg-sacred-gold/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
