'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  Clock,
  XCircle,
  RefreshCw,
  RotateCw,
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface Session {
  id: string;
  service_id: string;
  service_name: string;
  scheduled_start: string;
  scheduled_end: string;
  duration_minutes: number;
  practitioner_name: string;
  practitioner_slug: string;
  client_name: string;
  client_email: string;
  status: string;
  notes?: string;
  actions: {
    canCancel: boolean;
    canReschedule: boolean;
    reason?: string;
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
}

type ViewState = 'loading' | 'details' | 'cancelling' | 'cancelled' | 'rescheduling' | 'rescheduled' | 'error';

function ManageBookingContent() {
  const params = useParams();
  const token = params.token as string;

  const [viewState, setViewState] = useState<ViewState>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [cancelReason, setCancelReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Reschedule state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [previousBooking, setPreviousBooking] = useState<{ date: string; time: string } | null>(null);

  // Retry state
  const [retrying, setRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  const handleRetryCompletion = async () => {
    setRetrying(true);
    setRetryMessage(null);
    try {
      const res = await fetch(`/api/portal/manage/${token}/retry-completion`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        setRetryMessage(data.error || 'Retry failed. Please try again later.');
        return;
      }

      if (data.idempotent) {
        setRetryMessage('Confirmation emails were already sent successfully.');
      } else if (data.success) {
        setRetryMessage('Confirmation emails re-sent. Check your inbox.');
      } else {
        setRetryMessage('Some notifications could not be sent. Please contact us.');
      }
    } catch (err) {
      setRetryMessage('Network error. Please try again.');
    } finally {
      setRetrying(false);
    }
  };

  // Fetch session details on mount
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/portal/manage/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || 'Booking not found');
          setViewState('error');
          return;
        }

        // Map nested API response to flat Session shape
        const mapped: Session = {
          id: data.session.id,
          service_id: data.service?.id || '',
          service_name: data.service?.name || 'Session',
          scheduled_start: data.session.scheduledStart,
          scheduled_end: data.session.scheduledEnd,
          duration_minutes: data.service?.durationMinutes || 60,
          practitioner_name: data.practitioner?.name || '',
          practitioner_slug: data.practitioner?.slug || '',
          client_name: data.client?.name || '',
          client_email: data.client?.email || '',
          status: data.session.status,
          notes: data.session.notes,
          actions: {
            canCancel: data.actions?.canCancel || false,
            canReschedule: data.actions?.canReschedule || false,
            reason: data.actions?.cancelReason || data.actions?.rescheduleReason || undefined,
          },
        };
        setSession(mapped);
        setViewState('details');
      } catch (err) {
        setErrorMessage('Unable to load booking details');
        setViewState('error');
      }
    }

    if (token) {
      fetchSession();
    }
  }, [token]);

  // Fetch time slots when date changes (in reschedule flow)
  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedDate || !session) return;

      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const res = await fetch(
          `/api/portal/${session.practitioner_slug}/availability?date=${dateStr}&service_id=${session.service_id}`
        );
        if (res.ok) {
          const data = await res.json();
          const mappedSlots = (data.slots || []).map((s: any) => ({
            time: s.start || s.time,
            available: s.available,
          }));
          setTimeSlots(mappedSlots);
        }
      } catch (err) {
        console.error('Failed to load availability:', err);
        setTimeSlots([]);
      }
    }

    fetchAvailability();
  }, [selectedDate, session]);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isDateAvailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today && date.getDay() !== 0; // Not in past and not Sunday
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleCancelClick = () => {
    setViewState('cancelling');
  };

  const handleCancelConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/portal/manage/${token}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to cancel booking');
        setViewState('details');
        return;
      }

      // Update local session state to reflect cancellation
      if (session) {
        setSession({ ...session, status: 'cancelled' });
      }
      setViewState('cancelled');
    } catch (err) {
      setErrorMessage('Network error. Please try again.');
      setViewState('details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRescheduleClick = () => {
    if (session) {
      setPreviousBooking({
        date: formatDate(session.scheduled_start),
        time: formatTime(session.scheduled_start),
      });
    }
    setViewState('rescheduling');
  };

  const handleRescheduleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;

    setSubmitting(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await fetch(`/api/portal/manage/${token}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, time: selectedTime }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to reschedule booking');
        setViewState('details');
        return;
      }

      // Update local session with new time
      if (session && selectedDate && selectedTime) {
        const newStart = new Date(`${dateStr}T${selectedTime}`);
        const newEnd = new Date(newStart.getTime() + session.duration_minutes * 60 * 1000);
        setSession({
          ...session,
          scheduled_start: newStart.toISOString(),
          scheduled_end: newEnd.toISOString(),
        });
      }
      setViewState('rescheduled');
    } catch (err) {
      setErrorMessage('Network error. Please try again.');
      setViewState('details');
    } finally {
      setSubmitting(false);
    }
  };

  // Session summary card component
  const SessionCard = ({ showBadge = false }: { showBadge?: boolean }) => {
    if (!session) return null;

    return (
      <div className="p-6 rounded-2xl bg-[#1A1625]/80 border border-[#3A3347]">
        {showBadge && (
          <div className="mb-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-quicksand bg-red-500/10 border border-red-500/30 text-red-400">
              Cancelled
            </span>
          </div>
        )}
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-[#3A3347]/50">
            <span className="text-[#A89FC4] text-sm">Service</span>
            <span className="text-[#F5F0FF] font-quicksand text-sm">{session.service_name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#3A3347]/50">
            <span className="text-[#A89FC4] text-sm">Date</span>
            <span className="text-[#F5F0FF] font-quicksand text-sm">{formatDate(session.scheduled_start)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#3A3347]/50">
            <span className="text-[#A89FC4] text-sm">Time</span>
            <span className="text-[#F5F0FF] font-quicksand text-sm">{formatTime(session.scheduled_start)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[#A89FC4] text-sm">Duration</span>
            <span className="text-[#F5F0FF] font-quicksand text-sm">{session.duration_minutes} minutes</span>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (viewState === 'loading') {
    return (
      <div className="min-h-screen bg-[#0D0B14] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-12 h-12 text-[#D4AF37]" />
        </motion.div>
      </div>
    );
  }

  // Error state
  if (viewState === 'error') {
    return (
      <div
        className="min-h-screen py-12 px-4 flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #0D0B14 0%, #1A1625 50%, #0D0B14 100%)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="font-cinzel text-2xl text-[#F5F0FF] mb-4">Booking Not Found</h1>
          <p className="text-[#A89FC4] mb-8 font-quicksand">
            {errorMessage || 'This link may have expired or the booking may no longer exist.'}
          </p>
          {session?.practitioner_slug && (
            <Link
              href={`/portal/${session.practitioner_slug}/book`}
              className="inline-block px-8 py-3 rounded-full border border-[#D4AF37] text-[#D4AF37]
                       hover:bg-[#D4AF37]/10 transition-all font-quicksand"
            >
              Book a New Session
            </Link>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        background: 'linear-gradient(180deg, #0D0B14 0%, #1A1625 50%, #0D0B14 100%)',
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Details State */}
        {viewState === 'details' && session && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-cinzel text-3xl md:text-4xl text-[#F5F0FF] text-center mb-8">
              Your Booking
            </h1>

            <SessionCard />

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-quicksand">
                {errorMessage}
              </div>
            )}

            <div className="mt-8 space-y-4">
              {session.actions.canCancel ? (
                <button
                  onClick={handleCancelClick}
                  className="w-full py-4 rounded-full bg-[#251F33] border border-red-500/30 text-red-400
                           hover:bg-red-500/10 transition-all font-quicksand font-semibold"
                >
                  <XCircle className="w-5 h-5 inline mr-2" />
                  Cancel Booking
                </button>
              ) : (
                session.actions.reason && (
                  <p className="text-center text-[#6B6280] text-sm font-quicksand">
                    {session.actions.reason}
                  </p>
                )
              )}

              {session.actions.canReschedule ? (
                <button
                  onClick={handleRescheduleClick}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C9A962]
                           text-[#0D0B14] font-quicksand font-semibold
                           hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all"
                >
                  <RefreshCw className="w-5 h-5 inline mr-2" />
                  Reschedule
                </button>
              ) : (
                !session.actions.canCancel && session.actions.reason && (
                  <p className="text-center text-[#6B6280] text-sm font-quicksand">
                    Cannot reschedule: {session.actions.reason}
                  </p>
                )
              )}

              {/* Subtle resend link */}
              <div className="pt-4 text-center">
                {retryMessage ? (
                  <p className="text-xs text-[#A89FC4] font-quicksand">{retryMessage}</p>
                ) : (
                  <button
                    onClick={handleRetryCompletion}
                    disabled={retrying}
                    className="text-xs text-[#6B6280] hover:text-[#A89FC4] transition-colors font-quicksand
                             disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {retrying ? (
                      <>
                        <RotateCw className="w-3 h-3 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      <>Resend confirmation email</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Cancel Confirmation State */}
        {viewState === 'cancelling' && session && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-cinzel text-3xl text-[#F5F0FF] text-center mb-8">
              Cancel Your Booking?
            </h1>

            <SessionCard />

            <div className="mt-8">
              <label className="block text-sm text-[#A89FC4] mb-2 font-quicksand">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Let us know why you're cancelling..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-[#251F33] border border-[#3A3347] text-[#F5F0FF] placeholder-[#6B6280] font-quicksand focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={handleCancelConfirm}
                disabled={submitting}
                className="w-full py-4 rounded-full bg-red-500/20 border border-red-500/30 text-red-400
                         hover:bg-red-500/30 transition-all font-quicksand font-semibold
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <Sparkles className="w-5 h-5 animate-spin mr-2" />
                    Cancelling...
                  </span>
                ) : (
                  <>Yes, Cancel My Booking</>
                )}
              </button>

              <button
                onClick={() => setViewState('details')}
                disabled={submitting}
                className="w-full py-3 text-[#9D8EC7] hover:text-[#D4AF37] transition-colors disabled:opacity-50"
              >
                Go Back
              </button>
            </div>
          </motion.div>
        )}

        {/* Cancelled State */}
        {viewState === 'cancelled' && session && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-[#D4AF37]" />
            </motion.div>

            <h1 className="font-cinzel text-3xl text-[#F5F0FF] mb-4">
              Booking Cancelled
            </h1>
            <p className="text-[#A89FC4] mb-8 font-quicksand">
              Your session has been cancelled.
            </p>

            <SessionCard showBadge />

            <p className="mt-8 text-[#A89FC4] font-quicksand mb-4">
              Want to book again?
            </p>

            <Link
              href={`/portal/${session.practitioner_slug}/book`}
              className="inline-block px-8 py-3 rounded-full border border-[#D4AF37] text-[#D4AF37]
                       hover:bg-[#D4AF37]/10 transition-all font-quicksand"
            >
              Book a New Session
            </Link>

            {/* Try Again — re-send confirmation emails */}
            <div className="mt-8 pt-6 border-t border-[#3A3347]/30">
              {retryMessage ? (
                <p className="text-sm text-[#A89FC4] font-quicksand text-center">{retryMessage}</p>
              ) : (
                <button
                  onClick={handleRetryCompletion}
                  disabled={retrying}
                  className="text-sm text-[#6B6280] hover:text-[#A89FC4] transition-colors font-quicksand
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto gap-2"
                >
                  {retrying ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>Didn&apos;t receive a confirmation email? Resend</>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Reschedule State */}
        {viewState === 'rescheduling' && session && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => setViewState('details')}
              className="inline-flex items-center text-[#9D8EC7] hover:text-[#D4AF37] mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            <h1 className="font-cinzel text-3xl text-[#F5F0FF] text-center mb-8">
              Pick a New Time
            </h1>

            {previousBooking && (
              <div className="mb-8 p-4 rounded-xl bg-[#251F33]/50 border border-[#3A3347]">
                <p className="text-sm text-[#6B6280] font-quicksand">
                  Currently scheduled for{' '}
                  <span className="text-[#F5F0FF]">{previousBooking.date}</span> at{' '}
                  <span className="text-[#F5F0FF]">{previousBooking.time}</span>
                </p>
              </div>
            )}

            {/* Calendar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 text-[#9D8EC7] hover:text-[#D4AF37]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-cinzel text-lg text-[#F5F0FF]">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 text-[#9D8EC7] hover:text-[#D4AF37]"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-xs text-[#6B6280] py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((date, i) => (
                  <button
                    key={i}
                    disabled={!date || !isDateAvailable(date)}
                    onClick={() => date && setSelectedDate(date)}
                    className={`aspect-square rounded-lg text-sm font-quicksand transition-all
                              ${!date ? 'invisible' : ''}
                              ${date && !isDateAvailable(date) ? 'text-[#3A3347] cursor-not-allowed' : ''}
                              ${date && isDateAvailable(date) && selectedDate?.toDateString() === date.toDateString()
                                ? 'bg-[#D4AF37] text-[#0D0B14]'
                                : date && isDateAvailable(date)
                                ? 'text-[#F5F0FF] hover:bg-[#251F33]'
                                : ''
                              }`}
                  >
                    {date?.getDate()}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="mb-8">
                <h4 className="font-cinzel text-lg text-[#F5F0FF] mb-4">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h4>
                {timeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-3 rounded-lg font-quicksand text-sm transition-all
                                  ${!slot.available ? 'bg-[#1A1625] text-[#3A3347] cursor-not-allowed' : ''}
                                  ${slot.available && selectedTime === slot.time
                                    ? 'bg-[#D4AF37] text-[#0D0B14]'
                                    : slot.available
                                    ? 'bg-[#251F33] text-[#F5F0FF] hover:bg-[#3A3347]'
                                    : ''
                                  }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-[#6B6280] text-sm font-quicksand py-8">
                    No available time slots for this date
                  </p>
                )}
              </div>
            )}

            {/* Confirm Button */}
            {selectedDate && selectedTime && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <button
                  onClick={handleRescheduleConfirm}
                  disabled={submitting}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C9A962]
                           text-[#0D0B14] font-quicksand font-semibold
                           hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <Sparkles className="w-5 h-5 animate-spin mr-2" />
                      Confirming...
                    </span>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5 inline mr-2" />
                      Confirm New Time
                    </>
                  )}
                </button>

                <button
                  onClick={() => setViewState('details')}
                  disabled={submitting}
                  className="w-full py-3 text-[#9D8EC7] hover:text-[#D4AF37] transition-colors disabled:opacity-50"
                >
                  Go Back
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Rescheduled State */}
        {viewState === 'rescheduled' && session && previousBooking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-[#D4AF37]" />
            </motion.div>

            <h1 className="font-cinzel text-3xl text-[#F5F0FF] mb-4">
              Booking Rescheduled
            </h1>
            <p className="text-[#A89FC4] mb-8 font-quicksand">
              Your session has been moved.
            </p>

            <div className="mb-8 p-6 rounded-2xl bg-[#1A1625]/80 border border-[#3A3347]">
              <div className="mb-4 pb-4 border-b border-[#3A3347]/50">
                <p className="text-xs text-[#6B6280] mb-1">Previous</p>
                <p className="text-[#A89FC4] font-quicksand text-sm line-through">
                  {previousBooking.date} at {previousBooking.time}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6B6280] mb-1">New</p>
                <p className="text-[#D4AF37] font-quicksand font-semibold">
                  {formatDate(session.scheduled_start)} at {formatTime(session.scheduled_start)}
                </p>
              </div>
            </div>

            <SessionCard />

            <button
              onClick={() => setViewState('details')}
              className="mt-8 inline-block px-8 py-3 rounded-full border border-[#D4AF37] text-[#D4AF37]
                       hover:bg-[#D4AF37]/10 transition-all font-quicksand"
            >
              Done
            </button>

            {/* Try Again — re-send confirmation emails */}
            <div className="mt-8 pt-6 border-t border-[#3A3347]/30">
              {retryMessage ? (
                <p className="text-sm text-[#A89FC4] font-quicksand text-center">{retryMessage}</p>
              ) : (
                <button
                  onClick={handleRetryCompletion}
                  disabled={retrying}
                  className="text-sm text-[#6B6280] hover:text-[#A89FC4] transition-colors font-quicksand
                           disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto gap-2"
                >
                  {retrying ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>Didn&apos;t receive a confirmation email? Resend</>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ManageBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D0B14] flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-[#D4AF37] animate-spin" />
      </div>
    }>
      <ManageBookingContent />
    </Suspense>
  );
}
