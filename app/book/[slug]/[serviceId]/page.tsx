'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { DatePicker } from '@/components/scheduling/DatePicker';
import { TimeSlotGrid } from '@/components/scheduling/TimeSlotGrid';
import { BookingForm, type BookingFormData } from '@/components/scheduling/BookingForm';

interface TimeSlot {
  start: string;
  end: string;
}

interface ServiceInfo {
  name: string;
  duration_minutes: number;
  price_cents: number;
  description?: string;
}

export default function BookSlotPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const serviceId = params.serviceId as string;

  const [service, setService] = useState<ServiceInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load service info
  useEffect(() => {
    async function loadService() {
      try {
        const res = await fetch(`/api/portal/${slug}/services`);
        if (!res.ok) return;
        const data = await res.json();
        const svc = data.services?.find((s: { id: string }) => s.id === serviceId);
        if (svc) setService(svc);
        else setError('Service not found');
      } catch {
        setError('Failed to load service');
      }
    }
    loadService();
  }, [slug, serviceId]);

  // Load slots when date changes
  const loadSlots = useCallback(async (date: Date) => {
    setLoadingSlots(true);
    setSelectedTime(null);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await fetch(`/api/portal/${slug}/availability?date=${dateStr}&service=${serviceId}`);
      if (!res.ok) {
        setSlots([]);
        return;
      }
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [slug, serviceId]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    loadSlots(date);
  };

  const handleSubmit = async (formData: BookingFormData) => {
    if (!selectedDate || !selectedTime || !service) return;

    setSubmitting(true);
    setError(null);

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await fetch(`/api/book/${slug}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          date: dateStr,
          time: selectedTime,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          timezone: formData.timezone,
          notes: formData.notes || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create booking');
        return;
      }

      // Redirect to confirmation page
      const token = data.booking?.confirmationToken;
      if (token) {
        router.push(`/book/${slug}/confirmation?token=${token}`);
      } else {
        router.push(`/book/${slug}/confirmation?session=${data.booking?.sessionId}`);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <p className="text-neutral-500">{error}</p>
          <button onClick={() => router.back()} className="text-amber-500 hover:text-amber-600 mt-4 text-sm">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.push(`/book/${slug}`)}
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to services
        </button>

        {/* Service header */}
        {service && (
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {service.name}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {service.duration_minutes} min
              {service.price_cents > 0 && ` \u00b7 $${(service.price_cents / 100).toFixed(0)}`}
            </p>
            {service.description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{service.description}</p>
            )}
          </div>
        )}

        {/* Step 1: Pick a date */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Select a date
          </h2>
          <DatePicker selectedDate={selectedDate} onSelect={handleDateSelect} />
        </div>

        {/* Step 2: Pick a time */}
        {selectedDate && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Select a time — {format(selectedDate, 'EEEE, MMMM d')}
            </h2>
            <TimeSlotGrid
              slots={slots}
              selectedSlot={selectedTime}
              onSelect={setSelectedTime}
              loading={loadingSlots}
            />
          </div>
        )}

        {/* Step 3: Fill in details */}
        {selectedTime && service && selectedDate && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Your details
            </h2>
            <BookingForm
              onSubmit={handleSubmit}
              loading={submitting}
              serviceName={service.name}
              date={format(selectedDate, 'yyyy-MM-dd')}
              time={selectedTime}
              durationMinutes={service.duration_minutes}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
