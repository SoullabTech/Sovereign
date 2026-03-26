'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Check, X, Clock, Calendar, ChevronLeft, ChevronRight, Globe, AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

interface SessionData {
  id: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  serviceName: string;
  durationMinutes: number;
  practitionerName: string;
  practitionerTimezone: string;
  clientName: string;
  clientEmail: string;
  cancellationPolicy: string | null;
  cancelledAt: string | null;
  rescheduledToId: string | null;
}

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export default function ManageSessionPage() {
  const params = useParams() ?? {};
  const searchParams = useSearchParams();
  const slug = (params.slug as string) || '';
  const token = (params.token as string) || '';
  const initialAction = searchParams?.get('action') || null; // ?action=cancel or ?action=reschedule

  const [session, setSession] = useState<SessionData | null>(null);
  const [canCancel, setCanCancel] = useState(false);
  const [canReschedule, setCanReschedule] = useState(false);
  const [hoursUntil, setHoursUntil] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancel state
  const [showCancelConfirm, setShowCancelConfirm] = useState(initialAction === 'cancel');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  // Reschedule state
  const [showReschedule, setShowReschedule] = useState(initialAction === 'reschedule');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduled, setRescheduled] = useState(false);

  const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Load session details
  useEffect(() => {
    if (!slug || !token) return;
    fetch(`/api/portal/${slug}/session/${token}`)
      .then(r => {
        if (!r.ok) throw new Error('Session not found');
        return r.json();
      })
      .then(data => {
        setSession(data.session);
        setCanCancel(data.canCancel);
        setCanReschedule(data.canReschedule);
        setHoursUntil(data.hoursUntilSession);
      })
      .catch(() => setError('This session could not be found.'))
      .finally(() => setLoading(false));
  }, [slug, token]);

  // Load time slots for reschedule
  useEffect(() => {
    if (!selectedDate || !session) { setTimeSlots([]); return; }
    setLoadingSlots(true);
    setSelectedTime(null);
    const dateStr = selectedDate.toISOString().split('T')[0];
    // Use the service from the session's service_id — availability engine needs it
    fetch(`/api/portal/${slug}/availability?date=${dateStr}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setTimeSlots(data?.slots || []))
      .catch(() => setTimeSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, session, slug]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: clientTimezone });
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const formatSessionTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: clientTimezone });
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  async function handleCancel() {
    setCancelling(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/${slug}/session/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', reason: cancelReason || undefined }),
      });
      if (res.ok) {
        setCancelled(true);
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to cancel. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setCancelling(false);
    }
  }

  async function handleReschedule() {
    if (!selectedDate || !selectedTime) return;
    setRescheduling(true);
    setError(null);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await fetch(`/api/portal/${slug}/session/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reschedule', newDate: dateStr, newTime: selectedTime }),
      });
      if (res.ok) {
        setRescheduled(true);
      } else if (res.status === 409) {
        setError('That time slot was just booked. Please choose another.');
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to reschedule. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setRescheduling(false);
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090F] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error / not found ──
  if (error && !session) {
    return (
      <div className="min-h-screen bg-[#09090F] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">{error}</p>
          <Link href={`/portal/${slug}`} className="text-sm text-zinc-500 hover:text-white transition-colors">
            Back to portal
          </Link>
        </div>
      </div>
    );
  }

  if (!session) return null;

  // ── Already cancelled ──
  if (session.status === 'cancelled' || cancelled) {
    return (
      <div className="min-h-screen bg-[#09090F] flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-6">
            <X size={24} className="text-zinc-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Session cancelled</h1>
          <p className="text-sm text-zinc-400 mb-2">
            {session.serviceName} with {session.practitionerName}
          </p>
          <p className="text-sm text-zinc-500 mb-8">
            {cancelled ? 'Your session has been cancelled.' : `This session was cancelled on ${formatDate(session.cancelledAt || '')}.`}
          </p>
          <Link
            href={`/portal/${slug}/book`}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Book a new session
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Rescheduled success ──
  if (rescheduled) {
    return (
      <div className="min-h-screen bg-[#09090F] flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <Check size={24} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Session rescheduled</h1>
          <p className="text-sm text-zinc-400 mb-1">
            {session.serviceName} with {session.practitionerName}
          </p>
          {selectedDate && selectedTime && (
            <p className="text-sm text-zinc-300 mb-1">
              {formatDate(selectedDate.toISOString())} at {formatTime(selectedTime)}
            </p>
          )}
          <p className="text-xs text-zinc-600 mb-6">
            <Globe size={11} className="inline mr-1" />{clientTimezone}
          </p>
          <p className="text-sm text-zinc-500 mb-8">
            A confirmation email will be sent shortly.
          </p>
          <Link
            href={`/portal/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back to portal
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Main: session details + actions ──
  return (
    <div className="min-h-screen bg-[#09090F] text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href={`/portal/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Back
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-white mb-6">Manage your session</h1>

        {/* Session details card */}
        <div className="rounded-xl border border-zinc-800 overflow-hidden mb-8">
          {[
            { label: 'Service', value: session.serviceName },
            { label: 'Practitioner', value: session.practitionerName },
            { label: 'Date', value: formatDate(session.scheduledStart) },
            { label: 'Time', value: `${formatSessionTime(session.scheduledStart)} (${clientTimezone})` },
            { label: 'Duration', value: `${session.durationMinutes} min` },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-5 py-3.5 ${i < arr.length - 1 ? 'border-b border-zinc-800' : ''}`}
            >
              <span className="text-xs text-zinc-500">{row.label}</span>
              <span className="text-sm font-medium text-zinc-300">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Policy notice */}
        {!canCancel && !canReschedule && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-6">
            <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-200">
              This session starts in less than 24 hours and can no longer be modified.
              {session.cancellationPolicy && ` Policy: ${session.cancellationPolicy}`}
            </p>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            {error}
          </p>
        )}

        {/* ── Cancel flow ── */}
        {showCancelConfirm && canCancel && !showReschedule ? (
          <motion.div initial={{ y: 8 }} animate={{ y: 0 }} className="space-y-4">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Cancel session</h2>
            <p className="text-sm text-zinc-500">
              Are you sure you want to cancel this session?
              {session.cancellationPolicy && ` ${session.cancellationPolicy}`}
            </p>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Reason (optional)</label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Let the practitioner know why"
                rows={2}
                className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm
                           placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
              />
            </div>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full py-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium
                         hover:bg-red-500/30 transition-colors disabled:opacity-60"
            >
              {cancelling ? 'Cancelling...' : 'Confirm cancellation'}
            </button>
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="w-full py-2.5 text-sm text-zinc-500 hover:text-white transition-colors"
            >
              Keep my session
            </button>
          </motion.div>
        ) : showReschedule && canReschedule ? (
          /* ── Reschedule flow ── */
          <motion.div initial={{ y: 8 }} animate={{ y: 0 }}>
            <h2 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Choose a new time</h2>

            <div className="flex items-center gap-1.5 mb-4 text-xs text-zinc-500">
              <Globe size={12} />
              Times shown in {clientTimezone}
            </div>

            {/* Calendar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-medium text-white">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="text-center text-xs text-zinc-600 py-1.5">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((date, i) => {
                  const isSelected = date && selectedDate?.toDateString() === date.toDateString();
                  const isSelectable = date && isDateSelectable(date);
                  return (
                    <button
                      key={i}
                      disabled={!date || !isSelectable}
                      onClick={() => date && setSelectedDate(date)}
                      className={`aspect-square rounded-lg text-sm font-medium transition-colors
                        ${!date ? 'invisible' : ''}
                        ${date && !isSelectable ? 'text-zinc-700 cursor-not-allowed' : ''}
                        ${isSelected ? 'bg-white text-zinc-900' : ''}
                        ${date && isSelectable && !isSelected ? 'text-zinc-300 hover:bg-zinc-800' : ''}
                      `}
                    >
                      {date?.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="mb-6">
                <p className="text-xs text-zinc-500 mb-3">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
                  </div>
                ) : timeSlots.filter(s => s.available).length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-6">No available times on this date.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {timeSlots.filter(s => s.available).map(slot => (
                      <button
                        key={slot.start}
                        onClick={() => setSelectedTime(slot.start)}
                        className={`py-2.5 rounded-lg text-sm font-medium transition-colors
                          ${selectedTime === slot.start
                            ? 'bg-white text-zinc-900'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                          }`}
                      >
                        {formatTime(slot.start)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedDate && selectedTime && (
              <button
                onClick={handleReschedule}
                disabled={rescheduling}
                className="w-full py-3 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100
                           transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {rescheduling ? 'Rescheduling...' : 'Confirm new time'}
              </button>
            )}

            <button
              onClick={() => setShowReschedule(false)}
              className="w-full mt-3 py-2.5 text-sm text-zinc-500 hover:text-white transition-colors"
            >
              Keep current time
            </button>
          </motion.div>
        ) : (
          /* ── Action buttons ── */
          <div className="flex flex-col gap-3">
            {canReschedule && (
              <button
                onClick={() => { setShowReschedule(true); setShowCancelConfirm(false); }}
                className="w-full py-3 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors"
              >
                Reschedule
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => { setShowCancelConfirm(true); setShowReschedule(false); }}
                className="w-full py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm font-medium
                           hover:border-zinc-500 hover:text-white transition-colors"
              >
                Cancel session
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
