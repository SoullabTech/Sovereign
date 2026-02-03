'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_cents: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

function BookingContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const serviceId = searchParams.get('service');

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [step, setStep] = useState<'service' | 'datetime' | 'confirm'>('service');

  // Fetch services
  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch(`/api/portal/${slug}/services`);
        if (res.ok) {
          const data = await res.json();
          setServices(data.services || []);

          // Pre-select service if provided in URL
          if (serviceId && data.services) {
            const service = data.services.find((s: Service) => s.id === serviceId);
            if (service) {
              setSelectedService(service);
              setStep('datetime');
            }
          }
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchServices();
    }
  }, [slug, serviceId]);

  // Fetch availability when date changes
  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedDate || !selectedService) return;

      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const res = await fetch(
          `/api/portal/${slug}/availability?date=${dateStr}&service_id=${selectedService.id}`
        );
        if (res.ok) {
          const data = await res.json();
          setTimeSlots(data.slots || []);
        }
      } catch (err) {
        console.error('Failed to load availability:', err);
        // Mock some slots for demo
        setTimeSlots([
          { time: '10:00', available: true },
          { time: '11:00', available: true },
          { time: '14:00', available: true },
          { time: '15:00', available: false },
          { time: '16:00', available: true },
        ]);
      }
    }

    fetchAvailability();
  }, [selectedDate, selectedService, slug]);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty days for padding
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add actual days
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
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

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        background: 'linear-gradient(180deg, #0D0B14 0%, #1A1625 50%, #0D0B14 100%)',
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/portal/${slug}/services`}
            className="inline-flex items-center text-[#9D8EC7] hover:text-[#D4AF37] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-cinzel text-3xl md:text-4xl text-[#F5F0FF] text-center"
          >
            Book a Reading
          </motion.h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {['service', 'datetime', 'confirm'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-quicksand
                          ${step === s || ['datetime', 'confirm'].indexOf(step) > ['datetime', 'confirm'].indexOf(s)
                            ? 'bg-[#D4AF37] text-[#0D0B14]'
                            : 'bg-[#251F33] text-[#6B6280]'
                          }`}
              >
                {i + 1}
              </div>
              {i < 2 && (
                <div
                  className={`w-12 h-0.5 ${
                    ['datetime', 'confirm'].indexOf(step) > i
                      ? 'bg-[#D4AF37]'
                      : 'bg-[#3A3347]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Service */}
        {step === 'service' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="font-cinzel text-xl text-[#F5F0FF] mb-6 text-center">
              Select a Service
            </h2>
            <div className="space-y-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service);
                    setStep('datetime');
                  }}
                  className={`w-full p-6 rounded-xl text-left transition-all duration-300
                            ${selectedService?.id === service.id
                              ? 'bg-[#251F33] border-2 border-[#D4AF37]'
                              : 'bg-[#1A1625]/80 border border-[#3A3347] hover:border-[#9D8EC7]/50'
                            }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-cinzel text-lg text-[#F5F0FF]">{service.name}</h3>
                    <span className="font-quicksand text-[#E8B4CB]">
                      ${(service.price_cents / 100).toFixed(0)}
                    </span>
                  </div>
                  <p className="font-quicksand text-sm text-[#A89FC4] mb-2">
                    {service.description}
                  </p>
                  <div className="flex items-center text-xs text-[#6B6280]">
                    <Clock className="w-3 h-3 mr-1" />
                    {service.duration_minutes} minutes
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 'datetime' && selectedService && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Selected Service Summary */}
            <div className="mb-8 p-4 rounded-xl bg-[#251F33]/50 border border-[#3A3347]">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-cinzel text-[#F5F0FF]">{selectedService.name}</p>
                  <p className="text-sm text-[#6B6280]">{selectedService.duration_minutes} min</p>
                </div>
                <button
                  onClick={() => setStep('service')}
                  className="text-sm text-[#9D8EC7] hover:text-[#D4AF37]"
                >
                  Change
                </button>
              </div>
            </div>

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
              <div>
                <h4 className="font-cinzel text-lg text-[#F5F0FF] mb-4">
                  {formatDate(selectedDate)}
                </h4>
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
              </div>
            )}

            {/* Continue Button */}
            {selectedDate && selectedTime && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <button
                  onClick={() => setStep('confirm')}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C9A962]
                           text-[#0D0B14] font-quicksand font-semibold
                           hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all"
                >
                  Continue to Confirmation
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && selectedService && selectedDate && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-8 rounded-2xl bg-[#1A1625]/80 border border-[#3A3347] mb-8">
              <h2 className="font-cinzel text-2xl text-[#F5F0FF] mb-6 text-center">
                Confirm Your Booking
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between py-3 border-b border-[#3A3347]">
                  <span className="text-[#A89FC4]">Service</span>
                  <span className="text-[#F5F0FF] font-quicksand">{selectedService.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#3A3347]">
                  <span className="text-[#A89FC4]">Date</span>
                  <span className="text-[#F5F0FF] font-quicksand">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#3A3347]">
                  <span className="text-[#A89FC4]">Time</span>
                  <span className="text-[#F5F0FF] font-quicksand">{selectedTime}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#3A3347]">
                  <span className="text-[#A89FC4]">Duration</span>
                  <span className="text-[#F5F0FF] font-quicksand">{selectedService.duration_minutes} minutes</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-[#A89FC4]">Total</span>
                  <span className="text-[#E8B4CB] font-cinzel text-xl">
                    ${(selectedService.price_cents / 100).toFixed(0)}
                  </span>
                </div>
              </div>

              <button
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C9A962]
                         text-[#0D0B14] font-quicksand font-semibold
                         hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all"
              >
                <Calendar className="w-5 h-5 inline mr-2" />
                Confirm Booking
              </button>

              <button
                onClick={() => setStep('datetime')}
                className="w-full mt-4 py-3 text-[#9D8EC7] hover:text-[#D4AF37] transition-colors"
              >
                Go Back
              </button>
            </div>

            <p className="text-center text-sm text-[#6B6280]">
              You&apos;ll receive a confirmation email with details and meeting link.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function PortalBookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D0B14] flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-[#D4AF37] animate-spin" />
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
