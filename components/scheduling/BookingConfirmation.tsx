'use client';

import { Check, Video, X } from 'lucide-react';
import type { BookingResult } from './BookingModal';

interface BookingConfirmationProps {
  booking: BookingResult;
  slug: string;
  onClose: () => void;
}

const MONTH_ABBRS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

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

function formatDayOfWeek(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function BookingConfirmation({ booking, slug, onClose }: BookingConfirmationProps) {
  const [, monthStr, dayStr] = booking.date.split('-');
  const monthIndex = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const endTime = addMinutesToTime(booking.time, booking.duration);
  const confirmationUrl = booking.confirmationToken
    ? `/book/${slug}/confirmation?token=${booking.confirmationToken}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-maia-navy-900 border border-maia-navy-700 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-maia-navy-800 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-6 text-center">
          {/* Checkmark */}
          <div className="w-14 h-14 rounded-full border-2 border-maia-gold/40 bg-maia-navy-800 flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-maia-gold" />
          </div>

          <h2 className="text-xl font-semibold text-white">
            Booking confirmed
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Email sent to {booking.email}
          </p>

          <div className="border-t border-maia-navy-700/50 my-5" />

          {/* Appointment details */}
          <div className="flex items-start gap-4 text-left">
            {/* Date block */}
            <div className="flex-shrink-0 text-center">
              <div className="text-2xl font-semibold text-white">
                {day}
              </div>
              <div className="text-xs font-medium text-maia-gold uppercase">
                {MONTH_ABBRS[monthIndex]}
              </div>
            </div>

            {/* Details */}
            <div>
              <p className="text-sm font-medium text-white">
                {booking.serviceName}
              </p>
              <p className="text-sm text-slate-300">
                {formatDayOfWeek(booking.date)} &middot; {formatTime12(booking.time)} &ndash; {formatTime12(endTime)}
              </p>
              <p className="text-xs text-slate-500">
                {booking.timezone}
              </p>
            </div>
          </div>

          {/* Meet link */}
          {booking.meetLink && (
            <>
              <div className="border-t border-maia-navy-700/50 my-4" />
              <div className="flex items-center gap-2 text-left">
                <Video size={16} className="text-maia-gold flex-shrink-0" />
                <div>
                  <a
                    href={booking.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-maia-gold hover:text-maia-gold-hover hover:underline"
                  >
                    Join video call
                  </a>
                </div>
              </div>
            </>
          )}

          <div className="border-t border-maia-navy-700/50 my-4" />

          {/* Cancel / manage */}
          <p className="text-xs text-slate-500">
            Need to change?
          </p>
          {confirmationUrl && (
            <a
              href={confirmationUrl}
              className="text-sm text-maia-gold hover:text-maia-gold-hover hover:underline"
            >
              Manage your appointment
            </a>
          )}

          <div className="mt-5">
            <button
              onClick={onClose}
              className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
