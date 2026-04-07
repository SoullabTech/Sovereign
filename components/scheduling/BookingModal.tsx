'use client';

import { useState, useEffect } from 'react';
import { X, Video, Loader2 } from 'lucide-react';

interface BookingModalProps {
  slug: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  date: string;          // YYYY-MM-DD
  time: string;          // HH:MM
  timezone: string;
  hasVideoConference?: boolean;
  onClose: () => void;
  onBooked: (booking: BookingResult) => void;
}

export interface BookingResult {
  sessionId?: string;
  confirmationToken?: string;
  meetLink?: string;
  email: string;
  serviceName: string;
  date: string;
  time: string;
  timezone: string;
  duration: number;
}

function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function addMinutesToTime(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function BookingModal({
  slug,
  serviceId,
  serviceName,
  serviceDuration,
  date,
  time,
  timezone,
  hasVideoConference = false,
  onClose,
  onBooked,
}: BookingModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill from localStorage for signed-in members
  useEffect(() => {
    try {
      const stored = localStorage.getItem('beta_user');
      if (!stored) return;
      const user = JSON.parse(stored);
      if (user.name) {
        const parts = user.name.split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
      }
      if (user.email) setEmail(user.email);
    } catch {
      // ignore
    }
  }, []);

  const endTime = addMinutesToTime(time, serviceDuration);

  const handleSubmit = async () => {
    if (!firstName.trim() || !email.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');

      const res = await fetch(`/api/book/${slug}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          date,
          time,
          name: fullName,
          email: email.trim(),
          timezone,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'This time may no longer be available. Please try another slot.');
        return;
      }

      onBooked({
        sessionId: data.booking?.sessionId,
        confirmationToken: data.booking?.confirmationToken,
        meetLink: data.booking?.meetLink,
        email: email.trim(),
        serviceName,
        date,
        time,
        timezone,
        duration: serviceDuration,
      });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          {/* Header */}
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 pr-8">
            {serviceName}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {formatDateDisplay(date)} &middot; {formatTime12(time)} &ndash; {formatTime12(endTime)}
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            {timezone}
          </p>

          {/* Video conference note */}
          {hasVideoConference && (
            <>
              <div className="border-t border-neutral-100 dark:border-neutral-800 my-4" />
              <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                <Video size={16} className="text-amber-500 flex-shrink-0" />
                <span>Video conference info added after booking</span>
              </div>
            </>
          )}

          <div className="border-t border-neutral-100 dark:border-neutral-800 my-4" />

          {/* Contact form */}
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3 uppercase tracking-wider">
            Your contact info
          </p>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700
                             bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100
                             focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                             placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700
                             bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100
                             focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                             placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700
                           bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100
                           focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                Notes <span className="text-neutral-400 dark:text-neutral-500">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700
                           bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100
                           focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                           placeholder:text-neutral-400 dark:placeholder:text-neutral-500 resize-none"
                placeholder="Anything you'd like to share before the session"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400
                         hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !firstName.trim() || !email.trim()}
              className="px-6 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium
                         hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors flex items-center gap-2"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? 'Booking...' : 'Book'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
