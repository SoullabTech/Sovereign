"use client";

/**
 * MESSAGE POLICY FORM
 *
 * Configure between-session messaging boundaries.
 * Practitioners set when they check messages and response expectations.
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Clock,
  Calendar,
  AlertTriangle,
  MessageSquare,
  Check,
  Loader2,
} from 'lucide-react';
import type { MessagePolicy, CreateMessagePolicyInput } from '@/lib/practitioner/messages';

interface MessagePolicyFormProps {
  initialPolicy?: MessagePolicy | null;
  onSave: (input: CreateMessagePolicyInput) => Promise<void>;
  onCancel?: () => void;
  isClientOverride?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return { value: `${hour}:00`, label: `${hour}:00` };
});

const RESPONSE_HOURS_OPTIONS = [
  { value: '24', label: '24 hours' },
  { value: '48', label: '48 hours (recommended)' },
  { value: '72', label: '72 hours' },
  { value: '96', label: '4 days' },
  { value: '168', label: '1 week' },
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'America/Anchorage', label: 'Alaska (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST)' },
  { value: 'Europe/London', label: 'UK (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central Europe (CET)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
];

const DEFAULT_CRISIS_COPY = 'This is not monitored 24/7. If you are in crisis, please call 988 or text HOME to 741741.';

export default function MessagePolicyForm({
  initialPolicy,
  onSave,
  onCancel,
  isClientOverride = false,
}: MessagePolicyFormProps) {
  const [checkDays, setCheckDays] = useState<string[]>(
    initialPolicy?.check_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  );
  const [checkWindowStart, setCheckWindowStart] = useState(
    initialPolicy?.check_window_start || '09:00'
  );
  const [checkWindowEnd, setCheckWindowEnd] = useState(
    initialPolicy?.check_window_end || '17:00'
  );
  const [timezone, setTimezone] = useState(
    initialPolicy?.timezone || 'America/New_York'
  );
  const [maxResponseHours, setMaxResponseHours] = useState(
    String(initialPolicy?.max_response_hours || 48)
  );
  const [crisisCopy, setCrisisCopy] = useState(
    initialPolicy?.crisis_copy || DEFAULT_CRISIS_COPY
  );
  const [allowClientMessages, setAllowClientMessages] = useState(
    initialPolicy?.allow_client_messages ?? true
  );
  const [allowPractitionerReply, setAllowPractitionerReply] = useState(
    initialPolicy?.allow_practitioner_reply ?? true
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDay = useCallback((day: string) => {
    setCheckDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (checkDays.length === 0) {
      setError('Please select at least one day');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        check_days: checkDays,
        check_window_start: checkWindowStart,
        check_window_end: checkWindowEnd,
        timezone,
        max_response_hours: parseInt(maxResponseHours, 10),
        crisis_copy: crisisCopy,
        allow_client_messages: allowClientMessages,
        allow_practitioner_reply: allowPractitionerReply,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save policy');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-100">
          <MessageSquare className="w-5 h-5 text-sacred-gold" />
          {isClientOverride ? 'Client-Specific Settings' : 'Message Policy'}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {isClientOverride
            ? 'Override default settings for this specific client'
            : 'Configure how clients can message you between sessions'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Enable/Disable Messaging */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="space-y-0.5">
              <Label className="text-gray-200">Allow Client Messages</Label>
              <p className="text-xs text-gray-500">
                Clients can send you between-session notes
              </p>
            </div>
            <Switch
              checked={allowClientMessages}
              onCheckedChange={setAllowClientMessages}
            />
          </div>

          {allowClientMessages && (
            <>
              {/* Check Days */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-gray-200">
                  <Calendar className="w-4 h-4" />
                  Days You Check Messages
                </Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        checkDays.includes(day.value)
                          ? 'bg-sacred-gold/20 border-sacred-gold/50 text-sacred-gold'
                          : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Check Window */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-200">
                    <Clock className="w-4 h-4" />
                    Window Start
                  </Label>
                  <Select value={checkWindowStart} onValueChange={setCheckWindowStart}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {TIME_OPTIONS.map(time => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-200">Window End</Label>
                  <Select value={checkWindowEnd} onValueChange={setCheckWindowEnd}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      {TIME_OPTIONS.map(time => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label className="text-gray-200">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {TIMEZONES.map(tz => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Response Time */}
              <div className="space-y-2">
                <Label className="text-gray-200">Expected Response Time</Label>
                <Select value={maxResponseHours} onValueChange={setMaxResponseHours}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-700/50 text-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {RESPONSE_HOURS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  This is shown to clients so they know when to expect a response
                </p>
              </div>

              {/* Crisis Copy */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-200">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Crisis Message
                </Label>
                <Textarea
                  value={crisisCopy}
                  onChange={e => setCrisisCopy(e.target.value)}
                  placeholder="Crisis resources shown to clients..."
                  className="bg-gray-800/50 border-gray-700/50 text-gray-200 min-h-[80px]"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500">
                  Displayed to clients when they send a message (max 1000 chars)
                </p>
              </div>

              {/* Allow Replies */}
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="space-y-0.5">
                  <Label className="text-gray-200">Allow Your Replies</Label>
                  <p className="text-xs text-gray-500">
                    You can respond to client messages
                  </p>
                </div>
                <Switch
                  checked={allowPractitionerReply}
                  onCheckedChange={setAllowPractitionerReply}
                />
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Preview */}
          {allowClientMessages && (
            <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <p className="text-sm font-medium text-gray-300 mb-2">Client sees:</p>
              <p className="text-sm text-gray-400">
                I check messages {checkDays.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ')} between{' '}
                {checkWindowStart}-{checkWindowEnd}. I typically respond within{' '}
                {maxResponseHours} hours.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700/50">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={saving}
                className="text-gray-400 hover:text-gray-200"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={saving}
              className="bg-sacred-gold/20 text-sacred-gold hover:bg-sacred-gold/30 border border-sacred-gold/30"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Policy
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
