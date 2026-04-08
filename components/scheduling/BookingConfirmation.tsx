'use client';

import { Check, Video, X } from 'lucide-react';
import type { BookingResult } from './BookingModal';
import { getBusinessTimezoneLabel } from '@/lib/scheduling/timezoneParsing';

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
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="p-6 text-center">
          {/* Checkmark */}
          <div className="w-14 h-14 rounded-full border-2 border-amber-200 dark:border-amber-700 flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-amber-500 dark:text-amber-400" />
          </div>

          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Booking confirmed
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Email sent to {booking.email}
          </p>

          <div className="border-t border-neutral-100 dark:border-neutral-800 my-5" />

          {/* Appointment details */}
          <div className="flex items-start gap-4 text-left">
            {/* Date block */}
            <div className="flex-shrink-0 text-center">
              <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                {day}
              </div>
              <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                {MONTH_ABBRS[monthIndex]}
              </div>
            </div>

            {/* Details */}
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {booking.serviceName}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {formatDayOfWeek(booking.date)} &middot; {formatTime12(booking.time)} &ndash; {formatTime12(endTime)} {getBusinessTimezoneLabel()}
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                Eastern Time (Connecticut)
              </p>
            </div>
          </div>

          {/* Meet link */}
          {booking.meetLink && (
            <>
              <div className="border-t border-neutral-100 dark:border-neutral-800 my-4" />
              <div className="flex items-center gap-2 text-left">
                <Video size={16} className="text-amber-500 flex-shrink-0" />
                <div>
                  <a
                    href={booking.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-amber-500 dark:text-amber-400 hover:underline"
                  >
                    Join video call
                  </a>
                </div>
              </div>
            </>
          )}

          <div className="border-t border-neutral-100 dark:border-neutral-800 my-4" />

          {/* Cancel / manage */}
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Need to change?
          </p>
          {confirmationUrl && (
            <a
              href={confirmationUrl}
              className="text-sm text-amber-500 dark:text-amber-400 hover:underline"
            >
              Manage your appointment
            </a>
          )}

          <div className="mt-5">
            <button
              onClick={onClose}
              className="text-sm font-medium text-amber-500 dark:text-amber-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
