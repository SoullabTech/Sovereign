'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, Loader2, Check } from 'lucide-react';

interface EventDetail {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  location_type: 'in_person' | 'virtual' | 'hybrid';
  location_details: string | null;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  timezone: string;
  capacity: number | null;
  price_cents: number | null;
  currency: string;
  requires_application: boolean;
}

interface Practitioner {
  name: string;
  business_name: string | null;
  tagline: string | null;
  photo_url: string | null;
  slug: string;
}

function formatDateRange(startDate: string, endDate: string): string {
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const [ey, em, ed] = endDate.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
  const yearOpts: Intl.DateTimeFormatOptions = { year: 'numeric' };

  if (start.toDateString() === end.toDateString()) {
    return `${start.toLocaleDateString('en-US', { ...opts, ...yearOpts })}`;
  }

  const sameMonth = sy === ey && sm === em;
  const sameYear = sy === ey;

  if (sameMonth) {
    return `${start.toLocaleDateString('en-US', { month: 'long' })} ${sd}–${ed}, ${sy}`;
  }
  if (sameYear) {
    return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}, ${sy}`;
  }
  return `${start.toLocaleDateString('en-US', { ...opts, ...yearOpts })} – ${end.toLocaleDateString('en-US', { ...opts, ...yearOpts })}`;
}

export default function EventLandingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug ?? '') as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [needsAccount, setNeedsAccount] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/events/${slug}`);
        if (!res.ok) {
          setError(res.status === 404 ? 'Event not found' : 'Failed to load event');
          return;
        }
        const data = await res.json();
        setEvent(data.event);
        setPractitioner(data.practitioner);

        // Pre-fill from localStorage if signed in
        try {
          const stored = localStorage.getItem('beta_user');
          if (stored) {
            const user = JSON.parse(stored);
            if (user.email) setEmail(user.email);
            if (user.name) setFullName(user.name);
          }
        } catch {
          // ignore
        }
      } catch {
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleRegister = async () => {
    if (!email.trim() || !email.includes('@')) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to register');
        return;
      }
      setRegistered(true);
      setNeedsAccount(data.needsAccount);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0] dark:bg-neutral-950">
        <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0] dark:bg-neutral-950">
        <div className="text-center">
          <p className="text-neutral-500 dark:text-neutral-400">{error || 'Event not found'}</p>
          <a href="/" className="text-amber-500 hover:text-amber-600 mt-4 inline-block text-sm">
            Go home
          </a>
        </div>
      </div>
    );
  }

  const displayName = practitioner?.business_name || practitioner?.name || 'Facilitator';
  const locationLabel =
    event.location_type === 'virtual'
      ? 'Virtual'
      : event.location_type === 'in_person'
        ? 'In person'
        : 'Hybrid';

  // Confirmation view
  if (registered) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] dark:bg-neutral-950">
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <div className="w-14 h-14 rounded-full border-2 border-amber-200 dark:border-amber-700 flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-amber-500 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            You&rsquo;re in the Arc
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {event.title}
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {formatDateRange(event.start_date, event.end_date)}
          </p>

          <div className="mt-8 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left">
            {needsAccount ? (
              <>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  Your seat is held. To enter the Arc and begin your preparation with MAIA,
                  you&rsquo;ll need a MAIA account.
                </p>
                <button
                  onClick={() => router.push('/signin')}
                  className="mt-4 w-full py-3 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
                >
                  Create your MAIA account
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  MAIA will be with you through preparation, into the field, and through
                  integration. Begin when you&rsquo;re ready.
                </p>
                <button
                  onClick={() => router.push('/maia')}
                  className="mt-4 w-full py-3 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
                >
                  Begin your arrival reflection
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0] dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Facilitator */}
        {practitioner && (
          <div className="flex items-center gap-3 mb-10">
            {practitioner.photo_url ? (
              <img
                src={practitioner.photo_url}
                alt={practitioner.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  {practitioner.name[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Held by</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {displayName}
              </p>
            </div>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          {event.title}
        </h1>
        {event.subtitle && (
          <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
            {event.subtitle}
          </p>
        )}

        {/* Meta */}
        <div className="mt-6 flex flex-wrap gap-5 text-sm text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-2">
            <Calendar size={15} className="text-amber-500" />
            {formatDateRange(event.start_date, event.end_date)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={15} className="text-amber-500" />
            {locationLabel}
          </span>
          {event.capacity && (
            <span className="flex items-center gap-2">
              <Users size={15} className="text-amber-500" />
              {event.capacity} seats
            </span>
          )}
        </div>

        {event.location_details && (
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
            {event.location_details}
          </p>
        )}

        {/* Description */}
        {event.description && (
          <div className="mt-8 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {event.description}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 my-10" />

        {/* Arc explanation */}
        <div className="mb-8">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
            What to expect
          </p>
          <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <p>
              <span className="font-medium">Preparation.</span> Before the event begins,
              MAIA will help you orient, set intentions, and arrive whole.
            </p>
            <p>
              <span className="font-medium">In the field.</span> During the container,
              MAIA is with you between sessions &mdash; for reflection, journaling, and
              integration of live material.
            </p>
            <p>
              <span className="font-medium">Integration.</span> After the event closes,
              MAIA continues to hold the thread, helping insight become practice.
            </p>
          </div>
        </div>

        {/* Register */}
        {!showRegister ? (
          <button
            onClick={() => setShowRegister(true)}
            className="w-full py-4 rounded-2xl bg-amber-500 text-white text-base font-medium hover:bg-amber-600 transition-colors"
          >
            Enter the Arc
          </button>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-4">
              Enter the Arc
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            {error && (
              <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>
            )}
            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                onClick={() => setShowRegister(false)}
                className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRegister}
                disabled={submitting || !email.trim() || !email.includes('@')}
                className="px-6 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? 'Entering…' : 'Enter the Arc'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
