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
      <div className="relative bg-maia-navy-900 border border-maia-navy-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-maia-navy-800 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          {/* Header */}
          <h2 className="text-lg font-semibold text-white pr-8">
            {serviceName}
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            {formatDateDisplay(date)} &middot; {formatTime12(time)} &ndash; {formatTime12(endTime)}
          </p>
          <p className="text-xs text-slate-500">
            {timezone}
          </p>

          {/* Video conference note */}
          {hasVideoConference && (
            <>
              <div className="border-t border-maia-navy-700/50 my-4" />
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Video size={16} className="text-maia-gold flex-shrink-0" />
                <span>Video conference info added after booking</span>
              </div>
            </>
          )}

          <div className="border-t border-maia-navy-700/50 my-4" />

          {/* Contact form */}
          <p className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">
            Your contact info
          </p>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-maia-navy-700
                             bg-maia-navy-850 text-sm text-white
                             focus:outline-none focus:border-maia-navy-600 focus:ring-2 focus:ring-maia-gold/30
                             placeholder:text-slate-500 transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-maia-navy-700
                             bg-maia-navy-850 text-sm text-white
                             focus:outline-none focus:border-maia-navy-600 focus:ring-2 focus:ring-maia-gold/30
                             placeholder:text-slate-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-maia-navy-700
                           bg-maia-navy-850 text-sm text-white
                           focus:outline-none focus:border-maia-navy-600 focus:ring-2 focus:ring-maia-gold/30
                           placeholder:text-slate-500 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Notes <span className="text-slate-500">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-maia-navy-700
                           bg-maia-navy-850 text-sm text-white
                           focus:outline-none focus:border-maia-navy-600 focus:ring-2 focus:ring-maia-gold/30
                           placeholder:text-slate-500 resize-none transition-all"
                placeholder="Anything you'd like to share before the session"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 p-2.5 rounded-lg bg-red-900/30 border border-red-800/50 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !firstName.trim() || !email.trim()}
              className="px-6 py-2 rounded-lg bg-maia-gold text-white text-sm font-medium
                         hover:bg-maia-gold-hover disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors flex items-center gap-2 shadow-lg"
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
