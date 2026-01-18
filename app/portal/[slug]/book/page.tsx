"use client";

/**
 * BOOKING PAGE
 *
 * Session booking interface for practitioners
 */

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  User,
  Mail,
  MessageSquare,
} from 'lucide-react';

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

interface PortalConfig {
  practitioner_name: string;
  brand: {
    accent_color: string;
  };
}

export default function BookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const preselectedService = searchParams.get('service');

  const [step, setStep] = useState<'service' | 'datetime' | 'details' | 'confirm'>('service');
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<PortalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Selected values
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookingComplete, setBookingComplete] = useState(false);

  useEffect(() => {
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (preselectedService && services.length > 0) {
      const service = services.find(s => s.id === preselectedService);
      if (service) {
        setSelectedService(service);
        setStep('datetime');
      }
    }
  }, [preselectedService, services]);

  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedService]);

  const fetchData = async () => {
    try {
      const [servicesRes, configRes] = await Promise.all([
        fetch(`/api/portal/${slug}/services`),
        fetch(`/api/portal/${slug}/config`),
      ]);

      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data.services || []);
      }

      if (configRes.ok) {
        const data = await configRes.json();
        setConfig(data.config);
      }
    } catch (err) {
      console.error('Failed to load booking data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !selectedService) return;

    setSlotsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(
        `/api/portal/${slug}/availability?date=${dateStr}&service=${selectedService.id}`
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots || []);
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/portal/${slug}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: selectedService.id,
          date: selectedDate.toISOString().split('T')[0],
          time: selectedSlot.start,
          ...formData,
        }),
      });

      if (response.ok) {
        setBookingComplete(true);
      }
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const accentColor = config?.brand?.accent_color || '#D4AF37';

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

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
            <CardContent className="p-8 text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <CheckCircle2 className="w-10 h-10" style={{ color: accentColor }} />
              </div>
              <h2 className="text-2xl text-gray-100 font-light mb-4">
                Booking Confirmed!
              </h2>
              <p className="text-gray-400 mb-6">
                A confirmation email has been sent to {formData.email}.
                We look forward to seeing you!
              </p>
              <div className="p-4 bg-gray-800/50 rounded-lg text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service:</span>
                  <span className="text-gray-200">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date:</span>
                  <span className="text-gray-200">
                    {selectedDate?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Time:</span>
                  <span className="text-gray-200">
                    {selectedSlot && formatTime(selectedSlot.start)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-light text-gray-100 mb-4"
        >
          Book a Session
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400"
        >
          {config?.practitioner_name && `Schedule your session with ${config.practitioner_name}`}
        </motion.p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        {['service', 'datetime', 'details', 'confirm'].map((s, i) => (
          <React.Fragment key={s}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step === s
                  ? 'text-gray-900'
                  : ['service', 'datetime', 'details', 'confirm'].indexOf(step) > i
                  ? 'bg-gray-700 text-gray-300'
                  : 'bg-gray-800 text-gray-500'
              }`}
              style={step === s ? { backgroundColor: accentColor } : undefined}
            >
              {i + 1}
            </div>
            {i < 3 && <div className="w-8 h-px bg-gray-700" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Service Selection */}
      {step === 'service' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h2 className="text-lg text-gray-200 text-center">Select a Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(service => (
              <Card
                key={service.id}
                className={`cursor-pointer transition-all ${
                  selectedService?.id === service.id
                    ? 'border-2'
                    : 'bg-gray-900/50 border-gray-700/20 hover:border-gray-600/50'
                }`}
                style={
                  selectedService?.id === service.id
                    ? { borderColor: accentColor }
                    : undefined
                }
                onClick={() => {
                  setSelectedService(service);
                  setStep('datetime');
                }}
              >
                <CardContent className="p-4">
                  <h3 className="text-gray-200 font-medium mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{service.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration_minutes} min</span>
                    </div>
                    <span style={{ color: accentColor }}>
                      ${(service.price_cents / 100).toFixed(0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 2: Date & Time */}
      {step === 'datetime' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep('service')}
              className="flex items-center text-gray-400 hover:text-gray-200"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h2 className="text-lg text-gray-200">Select Date & Time</h2>
            <div className="w-16" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() =>
                      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                    }
                    className="p-2 text-gray-400 hover:text-gray-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="text-gray-200 font-medium">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                    }
                    className="p-2 text-gray-400 hover:text-gray-200"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((day, i) => (
                    <button
                      key={i}
                      disabled={!day || isDateDisabled(day)}
                      onClick={() => day && setSelectedDate(day)}
                      className={`py-2 rounded-lg text-sm transition-colors ${
                        !day
                          ? ''
                          : isDateDisabled(day)
                          ? 'text-gray-700 cursor-not-allowed'
                          : selectedDate?.toDateString() === day.toDateString()
                          ? 'text-gray-900'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                      style={
                        day && selectedDate?.toDateString() === day.toDateString()
                          ? { backgroundColor: accentColor }
                          : undefined
                      }
                    >
                      {day?.getDate()}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Slots */}
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
              <CardContent className="p-4">
                <h3 className="text-gray-200 font-medium mb-4">
                  {selectedDate
                    ? selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Select a date'}
                </h3>

                {!selectedDate ? (
                  <p className="text-gray-500 text-center py-8">
                    Please select a date to see available times
                  </p>
                ) : slotsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No available times for this date
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map(slot => (
                      <button
                        key={slot.start}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setStep('details');
                        }}
                        className={`py-2 px-3 rounded-lg text-sm transition-colors ${
                          selectedSlot?.start === slot.start
                            ? 'text-gray-900'
                            : 'text-gray-300 bg-gray-800 hover:bg-gray-700'
                        }`}
                        style={
                          selectedSlot?.start === slot.start
                            ? { backgroundColor: accentColor }
                            : undefined
                        }
                      >
                        {formatTime(slot.start)}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Step 3: Details */}
      {step === 'details' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md mx-auto space-y-6"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep('datetime')}
              className="flex items-center text-gray-400 hover:text-gray-200"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h2 className="text-lg text-gray-200">Your Details</h2>
            <div className="w-16" />
          </div>

          <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Notes (optional)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none resize-none"
                    placeholder="Anything you'd like me to know..."
                  />
                </div>
              </div>

              <button
                onClick={() => setStep('confirm')}
                disabled={!formData.name || !formData.email}
                className="w-full py-3 rounded-lg text-gray-900 font-medium transition-all disabled:opacity-50"
                style={{ backgroundColor: accentColor }}
              >
                Review Booking
              </button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step 4: Confirm */}
      {step === 'confirm' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md mx-auto space-y-6"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep('details')}
              className="flex items-center text-gray-400 hover:text-gray-200"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h2 className="text-lg text-gray-200">Confirm Booking</h2>
            <div className="w-16" />
          </div>

          <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-500">Service</span>
                  <span className="text-gray-200">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-500">Date</span>
                  <span className="text-gray-200">
                    {selectedDate?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-500">Time</span>
                  <span className="text-gray-200">
                    {selectedSlot && formatTime(selectedSlot.start)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-500">Duration</span>
                  <span className="text-gray-200">{selectedService?.duration_minutes} minutes</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Total</span>
                  <span className="text-xl" style={{ color: accentColor }}>
                    ${selectedService && (selectedService.price_cents / 100).toFixed(0)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <div className="text-sm text-gray-500 mb-1">Booking for</div>
                <div className="text-gray-200">{formData.name}</div>
                <div className="text-sm text-gray-400">{formData.email}</div>
              </div>

              <button
                onClick={handleBooking}
                disabled={submitting}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg text-gray-900 font-medium transition-all disabled:opacity-50"
                style={{ backgroundColor: accentColor }}
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                You'll receive a confirmation email with all the details
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
