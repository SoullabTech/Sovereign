'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Video } from 'lucide-react';
import { WeekSlotGrid } from '@/components/scheduling/WeekSlotGrid';
import { BookingModal, type BookingResult } from '@/components/scheduling/BookingModal';
import { BookingConfirmation } from '@/components/scheduling/BookingConfirmation';

interface ServiceInfo {
  name: string;
  duration_minutes: number;
  price_cents: number;
  description?: string;
}

interface PractitionerInfo {
  name: string;
  slug: string;
  businessName?: string;
}

export default function BookSlotPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug ?? '') as string;
  const serviceId = (params?.serviceId ?? '') as string;

  const [service, setService] = useState<ServiceInfo | null>(null);
  const [practitioner, setPractitioner] = useState<PractitionerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Load practitioner + service
  useEffect(() => {
    async function load() {
      try {
        const [configRes, servicesRes] = await Promise.all([
          fetch(`/api/portal/${slug}/config`),
          fetch(`/api/portal/${slug}/services`),
        ]);

        if (!configRes.ok || !servicesRes.ok) {
          setError(configRes.status === 404 ? 'Practitioner not found' : 'Failed to load');
          return;
        }

        const configRaw = await configRes.json();
        const servicesData = await servicesRes.json();

        // Config may be nested under data.config or flat
        const configData = configRaw?.data?.config || configRaw;

        setPractitioner({
          name: configData.practitioner_name || configData.name,
          slug,
          businessName: configData.business_name || configData.brand?.name,
        });

        const svc = (servicesData.services || []).find(
          (s: { id: string }) => s.id === serviceId
        );
        if (svc) {
          setService(svc);
        } else {
          setError('Service not found');
        }
      } catch {
        setError('Failed to load booking page');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, serviceId]);

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedSlot({ date, time });
  };

  const handleBooked = (result: BookingResult) => {
    setSelectedSlot(null);
    setBookingResult(result);
  };

  const handleCloseConfirmation = () => {
    setBookingResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-maia-navy-900">
        <div className="w-5 h-5 border-2 border-maia-navy-700 border-t-maia-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-maia-navy-900">
        <div className="text-center">
          <p className="text-slate-400">{error}</p>
          <button
            onClick={() => router.back()}
            className="text-maia-gold hover:text-maia-gold-hover mt-4 text-sm"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-maia-navy-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/book/${slug}`)}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to services
          </button>

          <div className="flex items-start gap-4">
            {/* Avatar placeholder */}
            <div className="w-10 h-10 rounded-full bg-maia-navy-700/60 border border-maia-navy-600 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-maia-gold">
                {(practitioner?.name || '?')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-400">
                {practitioner?.businessName || practitioner?.name}
              </p>
              <h1 className="text-xl font-semibold text-white">
                {service?.name}
              </h1>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-3 flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {service?.duration_minutes} min
            </span>
            <span className="flex items-center gap-1.5">
              <Video size={14} />
              Video conference info added after booking
            </span>
          </div>
        </div>

        <div className="border-t border-maia-navy-700/40 pt-6">
          {/* Week slot grid */}
          {service && (
            <WeekSlotGrid
              slug={slug}
              serviceId={serviceId}
              serviceDuration={service.duration_minutes}
              onSlotSelect={handleSlotSelect}
              timezone={timezone}
            />
          )}
        </div>
      </div>

      {/* Booking modal */}
      {selectedSlot && service && (
        <BookingModal
          slug={slug}
          serviceId={serviceId}
          serviceName={service.name}
          serviceDuration={service.duration_minutes}
          date={selectedSlot.date}
          time={selectedSlot.time}
          timezone={timezone}
          hasVideoConference
          onClose={() => setSelectedSlot(null)}
          onBooked={handleBooked}
        />
      )}

      {/* Confirmation overlay */}
      {bookingResult && (
        <BookingConfirmation
          booking={bookingResult}
          slug={slug}
          onClose={handleCloseConfirmation}
        />
      )}
    </div>
  );
}
