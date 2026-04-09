'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, User } from 'lucide-react';
import { useBookings, Booking } from '@/hooks/useStudioData';

function formatBookingTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return { date, time };
}

const STATUS_COLORS: Record<Booking['status'], string> = {
  scheduled: 'bg-blue-500/20 text-blue-300',
  confirmed: 'bg-emerald-500/20 text-emerald-300',
  in_progress: 'bg-amber-500/20 text-amber-300',
  completed: 'bg-slate-500/20 text-slate-300',
  cancelled: 'bg-red-500/20 text-red-300',
  no_show: 'bg-red-500/20 text-red-300',
};

export function UpcomingReservationsCard() {
  const { bookings, loading, refetch } = useBookings();

  useEffect(() => {
    const now = new Date();
    const weekFromNow = new Date(now);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    refetch({
      from: now.toISOString(),
      to: weekFromNow.toISOString(),
      limit: 10,
    });
  }, [refetch]);

  // Filter out cancelled / no-show / completed
  const upcoming = bookings
    .filter((b) => !['cancelled', 'no_show', 'completed'].includes(b.status))
    .slice(0, 6);

  return (
    <div className="rounded-xl border border-slate-800/50 bg-[#1e1e38] p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Upcoming reservations</h2>
            <p className="text-xs text-slate-500">Next 7 days</p>
          </div>
        </div>
        <Link
          href="/studio/sessions"
          className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : upcoming.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-300">No upcoming reservations</p>
          <p className="text-xs text-slate-500 mt-1">Next 7 days</p>
        </div>
      ) : (
        <div className="space-y-2">
          {upcoming.map((booking) => {
            const { date, time } = formatBookingTime(booking.startAt);
            return (
              <div
                key={booking.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 bg-slate-900/40"
              >
                <div className="flex-shrink-0 text-center w-14">
                  <p className="text-xs text-slate-500 uppercase">{date.split(',')[0]}</p>
                  <p className="text-sm font-medium text-white">{date.split(', ')[1]}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {booking.serviceName || 'Session'}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <User className="w-3 h-3" />
                    <span className="truncate">{booking.clientName || 'Client'}</span>
                    <span className="text-slate-600">·</span>
                    <span>{time}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    STATUS_COLORS[booking.status]
                  }`}
                >
                  {booking.status.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
