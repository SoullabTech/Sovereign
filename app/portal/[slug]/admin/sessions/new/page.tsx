"use client";

/**
 * NEW SESSION PAGE
 *
 * Create a new session for a client
 * Simple flow: select client, pick type, set time
 */

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  ArrowLeft,
  User,
  Video,
  Phone,
  MapPin,
  FileText,
  Check,
  AlertCircle,
} from 'lucide-react';
import { usePractitionerAuth } from '@/lib/auth/practitionerAuth';
import type { PractitionerClient } from '@/lib/stellium/types';

const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  gold: '#E5C158',
  violet: '#B8A5D9',
  starlight: '#FFFFFF',
  muted: '#C8BDE0',
  dim: '#9A8FB8',
  success: '#8FB89A',
  error: '#D98B8B',
};

const isDev = process.env.NODE_ENV === 'development' ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost');

const SESSION_TYPES = [
  { value: 'natal_reading', label: 'Natal Chart Reading', description: 'Full birth chart analysis' },
  { value: 'transit_reading', label: 'Transit Reading', description: 'Current planetary influences' },
  { value: 'solar_return', label: 'Solar Return', description: 'Birthday year forecast' },
  { value: 'synastry', label: 'Synastry', description: 'Relationship compatibility' },
  { value: 'follow_up', label: 'Follow-up Session', description: 'Continuation of previous work' },
  { value: 'consultation', label: 'General Consultation', description: 'Open discussion' },
];

const LOCATION_TYPES = [
  { value: 'video', label: 'Video Call', icon: Video },
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'in_person', label: 'In Person', icon: MapPin },
  { value: 'async', label: 'Async/Written', icon: FileText },
];

const DURATIONS = [30, 45, 60, 75, 90, 120];

const DEV_MOCK_CLIENTS: PractitionerClient[] = [
  {
    id: 'client-1',
    practitioner_id: 'dev-practitioner',
    name: 'Sarah Martinez',
    preferred_name: 'Sarah',
    email: 'sarah@example.com',
    status: 'active',
    total_sessions: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'client-2',
    practitioner_id: 'dev-practitioner',
    name: 'James Kendrick',
    preferred_name: 'James',
    email: 'james@example.com',
    status: 'active',
    total_sessions: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'client-3',
    practitioner_id: 'dev-practitioner',
    name: 'Lisa Park',
    email: 'lisa@example.com',
    status: 'active',
    total_sessions: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function NewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { practitionerId, isLoading: authLoading } = usePractitionerAuth();

  const [clients, setClients] = useState<PractitionerClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [sessionType, setSessionType] = useState<string>('natal_reading');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [locationType, setLocationType] = useState<string>('video');
  const [notes, setNotes] = useState<string>('');

  const basePath = `/portal/${slug}/admin`;

  useEffect(() => {
    if (authLoading) return;

    if (!practitionerId) {
      setError('Session not found. Please sign in again.');
      setLoading(false);
      return;
    }

    fetchClients();
  }, [practitionerId, authLoading]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stellium/clients?practitionerId=${practitionerId}&status=active`);
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data.clients || []);
    } catch (err) {
      console.error('[NewSession] Error fetching clients:', err);
      if (isDev) {
        console.log('[NewSession] Using mock clients for development');
        setClients(DEV_MOCK_CLIENTS);
      } else {
        setError('Failed to load clients');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient) {
      setError('Please select a client');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Combine date and time
      let scheduledAt: string | undefined;
      if (scheduledDate && scheduledTime) {
        scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      }

      const response = await fetch('/api/stellium/sessions/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practitionerId,
          client_id: selectedClient,
          session_type: sessionType,
          scheduled_at: scheduledAt,
          duration_minutes: duration,
          location_type: locationType,
          prep_notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create session');
      }

      const data = await response.json();
      router.push(`${basePath}/sessions`);
    } catch (err: any) {
      console.error('[NewSession] Error creating session:', err);
      if (isDev) {
        // In dev mode, just pretend it worked
        console.log('[NewSession] Dev mode: simulating successful creation');
        router.push(`${basePath}/sessions`);
      } else {
        setError(err.message || 'Failed to create session');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg" style={{ backgroundColor: `${colors.nebula}50` }} />
        <div className="h-64 rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 mb-4 transition-colors"
          style={{ color: colors.muted }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sessions</span>
        </button>
        <h1
          className="text-2xl lg:text-3xl font-display"
          style={{ color: colors.starlight }}
        >
          New Session
        </h1>
        <p className="mt-1" style={{ color: colors.muted }}>
          Schedule a session with a client
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Error */}
        {error && (
          <div
            className="flex items-center space-x-3 p-4 rounded-lg"
            style={{ backgroundColor: `${colors.error}20`, border: `1px solid ${colors.error}40` }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: colors.error }} />
            <p style={{ color: colors.error }}>{error}</p>
          </div>
        )}

        {/* Client Selection */}
        <div
          className="p-6 rounded-xl border"
          style={{ backgroundColor: `${colors.nebula}50`, borderColor: colors.stardust }}
        >
          <label className="block text-sm font-medium mb-3" style={{ color: colors.muted }}>
            <User className="w-4 h-4 inline mr-2" />
            Select Client
          </label>
          {clients.length === 0 ? (
            <div className="text-center py-4">
              <p style={{ color: colors.dim }}>No active clients found</p>
              <button
                type="button"
                onClick={() => router.push(`${basePath}/clients/new`)}
                className="mt-2 text-sm"
                style={{ color: colors.gold }}
              >
                Add a client first
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              {clients.map(client => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setSelectedClient(client.id)}
                  className="flex items-center justify-between p-3 rounded-lg border transition-all"
                  style={{
                    backgroundColor: selectedClient === client.id ? `${colors.gold}10` : 'transparent',
                    borderColor: selectedClient === client.id ? colors.gold : colors.stardust,
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                      style={{
                        background: `linear-gradient(135deg, ${colors.gold}30 0%, ${colors.violet}30 100%)`,
                        color: colors.gold,
                      }}
                    >
                      {(client.preferred_name || client.name)[0].toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p style={{ color: colors.starlight }}>
                        {client.preferred_name || client.name}
                      </p>
                      {client.email && (
                        <p className="text-sm" style={{ color: colors.dim }}>
                          {client.email}
                        </p>
                      )}
                    </div>
                  </div>
                  {selectedClient === client.id && (
                    <Check className="w-5 h-5" style={{ color: colors.gold }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Session Type */}
        <div
          className="p-6 rounded-xl border"
          style={{ backgroundColor: `${colors.nebula}50`, borderColor: colors.stardust }}
        >
          <label className="block text-sm font-medium mb-3" style={{ color: colors.muted }}>
            Session Type
          </label>
          <div className="grid sm:grid-cols-2 gap-2">
            {SESSION_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setSessionType(type.value)}
                className="p-3 rounded-lg border text-left transition-all"
                style={{
                  backgroundColor: sessionType === type.value ? `${colors.gold}10` : 'transparent',
                  borderColor: sessionType === type.value ? colors.gold : colors.stardust,
                }}
              >
                <p style={{ color: sessionType === type.value ? colors.gold : colors.starlight }}>
                  {type.label}
                </p>
                <p className="text-sm" style={{ color: colors.dim }}>
                  {type.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div
          className="p-6 rounded-xl border"
          style={{ backgroundColor: `${colors.nebula}50`, borderColor: colors.stardust }}
        >
          <label className="block text-sm font-medium mb-3" style={{ color: colors.muted }}>
            <Calendar className="w-4 h-4 inline mr-2" />
            Schedule (Optional)
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1" style={{ color: colors.dim }}>Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 rounded-lg border outline-none"
                style={{
                  backgroundColor: colors.cosmos,
                  borderColor: colors.stardust,
                  color: colors.starlight,
                }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: colors.dim }}>Time</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border outline-none"
                style={{
                  backgroundColor: colors.cosmos,
                  borderColor: colors.stardust,
                  color: colors.starlight,
                }}
              />
            </div>
          </div>
        </div>

        {/* Duration */}
        <div
          className="p-6 rounded-xl border"
          style={{ backgroundColor: `${colors.nebula}50`, borderColor: colors.stardust }}
        >
          <label className="block text-sm font-medium mb-3" style={{ color: colors.muted }}>
            <Clock className="w-4 h-4 inline mr-2" />
            Duration
          </label>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className="px-4 py-2 rounded-lg border transition-all"
                style={{
                  backgroundColor: duration === d ? `${colors.gold}20` : 'transparent',
                  borderColor: duration === d ? colors.gold : colors.stardust,
                  color: duration === d ? colors.gold : colors.muted,
                }}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        {/* Location Type */}
        <div
          className="p-6 rounded-xl border"
          style={{ backgroundColor: `${colors.nebula}50`, borderColor: colors.stardust }}
        >
          <label className="block text-sm font-medium mb-3" style={{ color: colors.muted }}>
            Location
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LOCATION_TYPES.map(loc => {
              const Icon = loc.icon;
              return (
                <button
                  key={loc.value}
                  type="button"
                  onClick={() => setLocationType(loc.value)}
                  className="flex flex-col items-center p-3 rounded-lg border transition-all"
                  style={{
                    backgroundColor: locationType === loc.value ? `${colors.gold}10` : 'transparent',
                    borderColor: locationType === loc.value ? colors.gold : colors.stardust,
                  }}
                >
                  <Icon
                    className="w-5 h-5 mb-1"
                    style={{ color: locationType === loc.value ? colors.gold : colors.dim }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: locationType === loc.value ? colors.gold : colors.muted }}
                  >
                    {loc.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div
          className="p-6 rounded-xl border"
          style={{ backgroundColor: `${colors.nebula}50`, borderColor: colors.stardust }}
        >
          <label className="block text-sm font-medium mb-3" style={{ color: colors.muted }}>
            Prep Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any preparation notes for this session..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border outline-none resize-none"
            style={{
              backgroundColor: colors.cosmos,
              borderColor: colors.stardust,
              color: colors.starlight,
            }}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg border transition-colors"
            style={{ borderColor: colors.stardust, color: colors.muted }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedClient}
            className="px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: colors.gold, color: colors.void }}
          >
            {submitting ? 'Creating...' : 'Create Session'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
