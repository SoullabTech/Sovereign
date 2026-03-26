'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, ChevronLeft, ChevronRight, Check, Globe, User } from 'lucide-react';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_cents: number;
}

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface PractitionerProfile {
  name: string;
  tagline: string;
  bio: string;
  photo_url: string | null;
  brand: {
    name: string;
  };
}

interface BookingResult {
  success: boolean;
  details: {
    service_name: string;
    date: string;
    time: string;
    duration: number;
    practitioner: string;
    confirmation_instructions: string | null;
  };
  email_sent: boolean;
}

function BookingContent() {
  const params = useParams() ?? {};
  const searchParams = useSearchParams();
  const slug = (params.slug as string) || '';
  const serviceId = searchParams?.get('service') ?? null;
  const preselectedDate = searchParams?.get('date') ?? null;
  const preselectedTime = searchParams?.get('time') ?? null;

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [step, setStep] = useState<'service' | 'datetime' | 'info' | 'confirm'>('service');
  const [profile, setProfile] = useState<PractitionerProfile | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [presentingIssue, setPresentingIssue] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [desiredOutcome, setDesiredOutcome] = useState('');

  // Client timezone
  const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Fetch practitioner profile + services
  useEffect(() => {
    if (!slug) return;

    // Fetch profile
    fetch(`/api/portal/${slug}/home`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.profile) setProfile(data.profile);
      })
      .catch(() => {});

    // Fetch services
    fetch(`/api/portal/${slug}/services`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setServices(data.services || []);
        if (serviceId) {
          const svc = (data.services || []).find((s: Service) => s.id === serviceId);
          if (svc) {
            setSelectedService(svc);
            setStep('datetime');
            // If date and time are preselected from the portal calendar
            if (preselectedDate) {
              const d = new Date(preselectedDate + 'T00:00:00');
              setSelectedDate(d);
              setCurrentMonth(d);
              if (preselectedTime) {
                setSelectedTime(preselectedTime);
                setStep('info');
              }
            }
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, serviceId, preselectedDate, preselectedTime]);

  // Fetch time slots when date changes
  useEffect(() => {
    if (!selectedDate || !selectedService) { setTimeSlots([]); return; }
    setLoadingSlots(true);
    setSelectedTime(null);
    const dateStr = selectedDate.toISOString().split('T')[0];
    fetch(`/api/portal/${slug}/availability?date=${dateStr}&service=${selectedService.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setTimeSlots(data?.slots || []))
      .catch(() => setTimeSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedService, slug]);

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

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  // Reload slots (for after conflict)
  function reloadSlots() {
    if (!selectedDate || !selectedService) return;
    setLoadingSlots(true);
    setSelectedTime(null);
    const dateStr = selectedDate.toISOString().split('T')[0];
    fetch(`/api/portal/${slug}/availability?date=${dateStr}&service=${selectedService.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setTimeSlots(data?.slots || []))
      .catch(() => setTimeSlots([]))
      .finally(() => setLoadingSlots(false));
  }

  async function handleConfirm() {
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientEmail || !consentChecked) return;
    setSubmitting(true);
    setError(null);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await fetch(`/api/portal/${slug}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: selectedService.id,
          date: dateStr,
          time: selectedTime,
          name: clientName,
          email: clientEmail,
          intake_presenting_issue: presentingIssue || undefined,
          intake_focus_area: focusArea || undefined,
          intake_desired_outcome: desiredOutcome || undefined,
          timezone: clientTimezone,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBookingResult(data);
        setConfirmed(true);
      } else if (res.status === 409) {
        setError('This time slot was just booked by someone else. Refreshing available times...');
        reloadSlots();
        setTimeout(() => setStep('datetime'), 2000);
      } else {
        const d = await res.json();
        setError(d.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const STEPS = ['service', 'datetime', 'info', 'confirm'] as const;
  const stepIndex = STEPS.indexOf(step);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090F] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Confirmation view ──
  if (confirmed) {
    return (
      <div className="min-h-screen bg-[#09090F] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <Check size={24} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">Booking confirmed</h1>
          <p className="text-sm text-zinc-400 mb-1">
            {bookingResult?.details.service_name || selectedService?.name} with {bookingResult?.details.practitioner || profile?.name}
          </p>
          <p className="text-sm text-zinc-300 mb-1">
            {selectedDate && formatDate(selectedDate)} at {selectedTime && formatTime(selectedTime)}
          </p>
          <p className="text-xs text-zinc-600 mb-4">
            <Globe size={11} className="inline mr-1" />
            {clientTimezone}
          </p>

          {bookingResult?.email_sent && (
            <p className="text-sm text-zinc-500 mb-4">
              A confirmation email has been sent to {clientEmail}.
            </p>
          )}

          {/* Confirmation instructions from the service */}
          {bookingResult?.details.confirmation_instructions && (
            <div className="mt-4 mb-6 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-left">
              <p className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Before your session</p>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {bookingResult.details.confirmation_instructions}
              </p>
            </div>
          )}

          <Link
            href={`/portal/${slug}`}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to portal
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090F] text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Back */}
        <div className="mb-8">
          <Link
            href={`/portal/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
        </div>

        {/* Practitioner intro */}
        {profile && (
          <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-zinc-500" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white">{profile.name}</p>
              {profile.tagline && (
                <p className="text-xs text-zinc-500 mt-0.5">{profile.tagline}</p>
              )}
            </div>
          </div>
        )}

        <h1 className="text-2xl font-semibold text-white mb-2">Book a session</h1>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {(['Service', 'Date & Time', 'Your info', 'Review'] as const).map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                ${i <= stepIndex ? 'bg-white text-zinc-900' : 'bg-zinc-800 text-zinc-500'}`}>
                {i < stepIndex ? <Check size={12} /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i <= stepIndex ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {label}
              </span>
              {i < 3 && <div className={`flex-1 h-px w-8 ${i < stepIndex ? 'bg-zinc-500' : 'bg-zinc-800'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Service */}
        {step === 'service' && (
          <motion.div initial={{ y: 8 }} animate={{ y: 0 }}>
            <h2 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Choose a service</h2>
            <div className="space-y-3">
              {services.map(svc => (
                <button
                  key={svc.id}
                  onClick={() => { setSelectedService(svc); setStep('datetime'); }}
                  className="w-full text-left p-5 rounded-xl bg-zinc-900 border border-zinc-800
                             hover:border-zinc-500 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-zinc-100 mb-1">{svc.name}</p>
                      {svc.description && (
                        <p className="text-xs text-zinc-500 line-clamp-2 mb-2">{svc.description}</p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-zinc-600">
                        <Clock size={11} />
                        {svc.duration_minutes} min
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-white ml-4 flex-shrink-0">
                      ${(svc.price_cents / 100).toFixed(0)}
                    </span>
                  </div>
                </button>
              ))}
              {services.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-8">No services available yet.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 2: Date & Time */}
        {step === 'datetime' && selectedService && (
          <motion.div initial={{ y: 8 }} animate={{ y: 0 }}>
            {/* Service summary */}
            <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
              <div>
                <p className="text-sm font-medium text-white">{selectedService.name}</p>
                <p className="text-xs text-zinc-500">{selectedService.duration_minutes} min · ${(selectedService.price_cents / 100).toFixed(0)}</p>
              </div>
              <button onClick={() => setStep('service')} className="text-xs text-zinc-500 hover:text-white transition-colors">
                Change
              </button>
            </div>

            {/* Timezone indicator */}
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
              <div>
                <p className="text-xs text-zinc-500 mb-3">{formatDate(selectedDate)}</p>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
                  </div>
                ) : timeSlots.length === 0 ? (
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                <button
                  onClick={() => setStep('info')}
                  className="w-full py-3 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors"
                >
                  Continue
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 3: Your Info */}
        {step === 'info' && (
          <motion.div initial={{ y: 8 }} animate={{ y: 0 }} className="space-y-4">
            <h2 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Your information</h2>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Full name</label>
              <input
                type="text"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm
                           placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Email address</label>
              <input
                type="email"
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm
                           placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            {/* Structured intake */}
            <div className="border-t border-zinc-800 pt-4 mt-2">
              <p className="text-xs text-zinc-600 mb-4">Help us prepare for your session (optional)</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">What brings you here right now?</label>
                  <textarea
                    value={presentingIssue}
                    onChange={e => setPresentingIssue(e.target.value)}
                    placeholder="A few words is enough. What feels most present or important right now?"
                    rows={2}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm
                               placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">What feels most active?</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Stress or overwhelm',
                      'Transition or uncertainty',
                      'Relationship',
                      'Work or purpose',
                      'Health or energy',
                      'Emotional healing',
                      'Spiritual or existential',
                      'I\'m not sure yet',
                    ].map(area => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => setFocusArea(focusArea === area ? '' : area)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                          ${focusArea === area
                            ? 'bg-white text-zinc-900'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                          }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">What would make this session meaningful?</label>
                  <textarea
                    value={desiredOutcome}
                    onChange={e => setDesiredOutcome(e.target.value)}
                    placeholder="What would you hope to leave with, understand, or shift?"
                    rows={2}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm
                               placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => setStep('confirm')}
              disabled={!clientName || !clientEmail}
              className="w-full py-3 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100
                         transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              Review booking
            </button>
          </motion.div>
        )}

        {/* Step 4: Confirm */}
        {step === 'confirm' && selectedService && selectedDate && selectedTime && (
          <motion.div initial={{ y: 8 }} animate={{ y: 0 }}>
            <h2 className="text-sm font-medium text-zinc-400 mb-6 uppercase tracking-wider">Review & confirm</h2>
            <div className="rounded-xl border border-zinc-800 overflow-hidden mb-6">
              {[
                { label: 'Service', value: selectedService.name },
                { label: 'Date', value: formatDate(selectedDate) },
                { label: 'Time', value: `${formatTime(selectedTime)} (${clientTimezone})` },
                { label: 'Duration', value: `${selectedService.duration_minutes} min` },
                { label: 'Name', value: clientName },
                { label: 'Email', value: clientEmail },
                { label: 'Total', value: `$${(selectedService.price_cents / 100).toFixed(0)}` },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between px-5 py-3.5 ${i < arr.length - 1 ? 'border-b border-zinc-800' : ''}`}
                >
                  <span className="text-xs text-zinc-500">{row.label}</span>
                  <span className={`text-sm font-medium ${row.label === 'Total' ? 'text-white' : 'text-zinc-300'}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Intake summary */}
            {(presentingIssue || focusArea || desiredOutcome) && (
              <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-4 mb-6">
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Session context</p>
                {presentingIssue && (
                  <p className="text-sm text-zinc-400 mb-2">
                    <span className="text-zinc-600">Brings you here:</span> {presentingIssue}
                  </p>
                )}
                {focusArea && (
                  <p className="text-sm text-zinc-400 mb-2">
                    <span className="text-zinc-600">Focus:</span> {focusArea}
                  </p>
                )}
                {desiredOutcome && (
                  <p className="text-sm text-zinc-400">
                    <span className="text-zinc-600">Seeking:</span> {desiredOutcome}
                  </p>
                )}
              </div>
            )}

            {/* Consent checkbox */}
            <label className="flex items-start gap-3 mb-6 cursor-pointer group">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={e => setConsentChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-white focus:ring-zinc-500"
              />
              <span className="text-xs text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                I understand that this booking is subject to the practitioner&apos;s cancellation policy.
                I consent to being contacted at the email provided regarding this session.
              </span>
            </label>

            {error && (
              <p className="text-sm text-red-400 mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                {error}
              </p>
            )}

            <button
              onClick={handleConfirm}
              disabled={submitting || !consentChecked}
              className="w-full py-3 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100
                         transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Booking...' : 'Confirm booking'}
            </button>
            <button
              onClick={() => setStep('info')}
              className="w-full mt-3 py-2.5 text-sm text-zinc-500 hover:text-white transition-colors"
            >
              Go back
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}

export default function PortalBookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090F] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
