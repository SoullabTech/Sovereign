"use client";

/**
 * BOOKING PAGE
 *
 * Warm, earthy, holistic session booking interface
 */

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
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
  Moon,
  Star,
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

  // Warm, earthy palette
  const colors = {
    ivory: '#FFFEF9',
    linen: '#F8F4EF',
    sand: '#E8E0D5',
    warmGray: '#9A938A',
    terracotta: '#B87351',
    forest: '#4A5D4A',
    text: '#3D3532',
    textLight: '#6B6460',
  };

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

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Moon className="w-8 h-8" style={{ color: colors.terracotta }} />
        </motion.div>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-10 text-center"
          style={{ backgroundColor: colors.linen }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${colors.forest}20` }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: colors.forest }} />
          </div>
          <h2
            className="font-display text-3xl font-light mb-4"
            style={{ color: colors.text }}
          >
            You're Booked!
          </h2>
          <p className="mb-8" style={{ color: colors.textLight }}>
            A confirmation has been sent to {formData.email}.<br />
            I look forward to our time together.
          </p>
          <div
            className="rounded-2xl p-6 text-left space-y-3"
            style={{ backgroundColor: colors.ivory }}
          >
            <div className="flex justify-between text-sm">
              <span style={{ color: colors.warmGray }}>Service</span>
              <span style={{ color: colors.text }}>{selectedService?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: colors.warmGray }}>Date</span>
              <span style={{ color: colors.text }}>
                {selectedDate?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: colors.warmGray }}>Time</span>
              <span style={{ color: colors.text }}>
                {selectedSlot && formatTime(selectedSlot.start)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-px w-12" style={{ backgroundColor: colors.sand }} />
            <Calendar className="w-5 h-5" style={{ color: colors.terracotta }} />
            <div className="h-px w-12" style={{ backgroundColor: colors.sand }} />
          </div>

          <h1
            className="font-display text-4xl md:text-5xl font-light mb-4"
            style={{ color: colors.text }}
          >
            Book a Reading
          </h1>
          <p style={{ color: colors.textLight }}>
            {config?.practitioner_name && `Schedule your session with ${config.practitioner_name}`}
          </p>
        </motion.div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-3">
        {['service', 'datetime', 'details', 'confirm'].map((s, i) => (
          <React.Fragment key={s}>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all"
              style={{
                backgroundColor: step === s ? colors.terracotta : ['service', 'datetime', 'details', 'confirm'].indexOf(step) > i ? colors.forest : colors.sand,
                color: step === s || ['service', 'datetime', 'details', 'confirm'].indexOf(step) > i ? colors.ivory : colors.warmGray,
              }}
            >
              {i + 1}
            </div>
            {i < 3 && <div className="w-8 h-px" style={{ backgroundColor: colors.sand }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Service Selection */}
      {step === 'service' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h2
            className="font-display text-2xl text-center"
            style={{ color: colors.text }}
          >
            Choose Your Experience
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(service => (
              <div
                key={service.id}
                className="cursor-pointer rounded-2xl p-6 transition-all hover:shadow-lg"
                style={{
                  backgroundColor: selectedService?.id === service.id ? `${colors.terracotta}10` : colors.linen,
                  border: `2px solid ${selectedService?.id === service.id ? colors.terracotta : 'transparent'}`,
                }}
                onClick={() => {
                  setSelectedService(service);
                  setStep('datetime');
                }}
              >
                <h3
                  className="font-display text-xl font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  {service.name}
                </h3>
                <p className="text-sm mb-4" style={{ color: colors.textLight }}>
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm" style={{ color: colors.warmGray }}>
                    <Clock className="w-4 h-4" />
                    <span>{service.duration_minutes} min</span>
                  </div>
                  <span
                    className="font-display text-xl font-medium"
                    style={{ color: colors.terracotta }}
                  >
                    {formatPrice(service.price_cents)}
                  </span>
                </div>
              </div>
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
              className="flex items-center transition-colors"
              style={{ color: colors.textLight }}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h2 className="font-display text-xl" style={{ color: colors.text }}>
              Select Date & Time
            </h2>
            <div className="w-16" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: colors.linen }}>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
                  }
                  className="p-2 rounded-full transition-colors"
                  style={{ color: colors.text }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="font-display text-lg" style={{ color: colors.text }}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <button
                  onClick={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
                  }
                  className="p-2 rounded-full transition-colors"
                  style={{ color: colors.text }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div
                className="grid grid-cols-7 gap-1 text-center text-xs mb-3"
                style={{ color: colors.warmGray }}
              >
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
                    className="py-2.5 rounded-lg text-sm transition-all"
                    style={{
                      backgroundColor: day && selectedDate?.toDateString() === day.toDateString()
                        ? colors.terracotta
                        : 'transparent',
                      color: !day
                        ? 'transparent'
                        : isDateDisabled(day)
                        ? colors.sand
                        : selectedDate?.toDateString() === day?.toDateString()
                        ? colors.ivory
                        : colors.text,
                      cursor: day && !isDateDisabled(day) ? 'pointer' : 'default',
                    }}
                  >
                    {day?.getDate()}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: colors.linen }}>
              <h3 className="font-display text-lg mb-4" style={{ color: colors.text }}>
                {selectedDate
                  ? selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Select a date'}
              </h3>

              {!selectedDate ? (
                <p className="text-center py-12" style={{ color: colors.warmGray }}>
                  Please select a date to see available times
                </p>
              ) : slotsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: colors.warmGray }} />
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-center py-12" style={{ color: colors.warmGray }}>
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
                      className="py-2.5 px-3 rounded-lg text-sm transition-all"
                      style={{
                        backgroundColor: selectedSlot?.start === slot.start
                          ? colors.terracotta
                          : colors.ivory,
                        color: selectedSlot?.start === slot.start
                          ? colors.ivory
                          : colors.text,
                      }}
                    >
                      {formatTime(slot.start)}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
              className="flex items-center transition-colors"
              style={{ color: colors.textLight }}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h2 className="font-display text-xl" style={{ color: colors.text }}>
              Your Details
            </h2>
            <div className="w-16" />
          </div>

          <div className="rounded-2xl p-8 space-y-5" style={{ backgroundColor: colors.linen }}>
            <div>
              <label className="block text-sm mb-2" style={{ color: colors.warmGray }}>
                Name *
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: colors.warmGray }}
                />
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-base outline-none transition-all"
                  style={{
                    backgroundColor: colors.ivory,
                    border: `1px solid ${colors.sand}`,
                    color: colors.text,
                  }}
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: colors.warmGray }}>
                Email *
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: colors.warmGray }}
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-base outline-none transition-all"
                  style={{
                    backgroundColor: colors.ivory,
                    border: `1px solid ${colors.sand}`,
                    color: colors.text,
                  }}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: colors.warmGray }}>
                Anything you'd like to share (optional)
              </label>
              <div className="relative">
                <MessageSquare
                  className="absolute left-4 top-4 w-5 h-5"
                  style={{ color: colors.warmGray }}
                />
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-base outline-none transition-all resize-none"
                  style={{
                    backgroundColor: colors.ivory,
                    border: `1px solid ${colors.sand}`,
                    color: colors.text,
                  }}
                  placeholder="Questions, intentions, or anything that feels important..."
                />
              </div>
            </div>

            <button
              onClick={() => setStep('confirm')}
              disabled={!formData.name || !formData.email}
              className="w-full py-4 rounded-xl font-medium transition-all disabled:opacity-50"
              style={{ backgroundColor: colors.terracotta, color: colors.ivory }}
            >
              Review Booking
            </button>
          </div>
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
              className="flex items-center transition-colors"
              style={{ color: colors.textLight }}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h2 className="font-display text-xl" style={{ color: colors.text }}>
              Confirm Booking
            </h2>
            <div className="w-16" />
          </div>

          <div className="rounded-2xl p-8 space-y-6" style={{ backgroundColor: colors.linen }}>
            <div className="space-y-4">
              <div
                className="flex justify-between py-3 border-b"
                style={{ borderColor: colors.sand }}
              >
                <span style={{ color: colors.warmGray }}>Service</span>
                <span style={{ color: colors.text }}>{selectedService?.name}</span>
              </div>
              <div
                className="flex justify-between py-3 border-b"
                style={{ borderColor: colors.sand }}
              >
                <span style={{ color: colors.warmGray }}>Date</span>
                <span style={{ color: colors.text }}>
                  {selectedDate?.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div
                className="flex justify-between py-3 border-b"
                style={{ borderColor: colors.sand }}
              >
                <span style={{ color: colors.warmGray }}>Time</span>
                <span style={{ color: colors.text }}>
                  {selectedSlot && formatTime(selectedSlot.start)}
                </span>
              </div>
              <div
                className="flex justify-between py-3 border-b"
                style={{ borderColor: colors.sand }}
              >
                <span style={{ color: colors.warmGray }}>Duration</span>
                <span style={{ color: colors.text }}>{selectedService?.duration_minutes} minutes</span>
              </div>
              <div className="flex justify-between py-3">
                <span style={{ color: colors.warmGray }}>Investment</span>
                <span
                  className="font-display text-2xl font-medium"
                  style={{ color: colors.terracotta }}
                >
                  {selectedService && formatPrice(selectedService.price_cents)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: colors.sand }}>
              <div className="text-sm mb-1" style={{ color: colors.warmGray }}>
                Booking for
              </div>
              <div style={{ color: colors.text }}>{formData.name}</div>
              <div className="text-sm" style={{ color: colors.textLight }}>{formData.email}</div>
            </div>

            <button
              onClick={handleBooking}
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-2 py-4 rounded-xl font-medium transition-all disabled:opacity-50"
              style={{ backgroundColor: colors.terracotta, color: colors.ivory }}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  <span>Confirm Booking</span>
                </>
              )}
            </button>

            <p className="text-xs text-center" style={{ color: colors.warmGray }}>
              You'll receive a confirmation email with all the details
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
