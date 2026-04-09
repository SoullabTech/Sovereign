'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle, Calendar, Clock, User, XCircle } from 'lucide-react';

interface BookingDetails {
  sessionId: string;
  status: string;
  serviceName: string;
  durationMinutes: number;
  scheduledStart: string;
  scheduledEnd: string;
  clientName: string;
  clientEmail: string;
  practitionerName: string;
  practitionerSlug: string;
  bookerTimezone?: string;
}

function formatDateTime(iso: string, timezone?: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone || undefined,
  });
}

export default function BookingConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const token = searchParams.get('token');

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) {
        setError('No confirmation token provided');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/book/${slug}/manage?token=${token}`);
        if (!res.ok) {
          setError('Booking not found');
          return;
        }
        const data = await res.json();
        setBooking(data.booking);
        if (data.booking?.status === 'cancelled') {
          setCancelled(true);
        }
      } catch {
        setError('Failed to load booking');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, token]);

  const handleCancel = async () => {
    if (!token || !confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/book/${slug}/manage?token=${token}&action=cancel`, {
        method: 'POST',
      });
      if (res.ok) {
        setCancelled(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to cancel');
      }
    } catch {
      setError('Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-maia-navy-900">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-maia-navy-900">
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-maia-navy-900">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Status icon */}
        <div className="text-center mb-8">
          {cancelled ? (
            <>
              <XCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-white">
                Booking Cancelled
              </h1>
              <p className="text-slate-400 mt-2">
                This session has been cancelled.
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="w-16 h-16 text-maia-gold mx-auto mb-4" />
              <h1 className="text-2xl font-semibold text-white">
                Booking Confirmed
              </h1>
              <p className="text-slate-400 mt-2">
                Your session has been booked with {booking.practitionerName}.
              </p>
            </>
          )}
        </div>

        {/* Details card */}
        <div className="bg-maia-navy-850 rounded-lg border border-maia-navy-700 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-maia-gold mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">
                {booking.serviceName}
              </p>
              <p className="text-sm text-slate-300">
                {formatDateTime(booking.scheduledStart, booking.bookerTimezone)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-maia-gold mt-0.5 shrink-0" />
            <p className="text-sm text-slate-300">
              {booking.durationMinutes} minutes
            </p>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-maia-gold mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-slate-300">
                {booking.clientName} ({booking.clientEmail})
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {!cancelled && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-sm text-red-400 hover:text-red-300 disabled:text-slate-500 transition-colors"
            >
              {cancelling ? 'Cancelling...' : 'Cancel this booking'}
            </button>
          </div>
        )}

        {/* Book another */}
        <div className="mt-8 text-center">
          <a
            href={`/book/${slug}`}
            className="text-sm text-maia-gold hover:text-maia-gold-hover transition-colors"
          >
            Book another session
          </a>
        </div>
      </div>
    </div>
  );
}
