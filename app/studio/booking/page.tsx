'use client';

import { Calendar } from 'lucide-react';
import { BookingHubHeader } from '@/components/studio/booking/BookingHubHeader';
import { ProfileCard } from '@/components/studio/booking/ProfileCard';
import { ServicesCard } from '@/components/studio/booking/ServicesCard';
import { AvailabilityCard } from '@/components/studio/booking/AvailabilityCard';
import { UpcomingReservationsCard } from '@/components/studio/booking/UpcomingReservationsCard';

export default function BookingHubPage() {
  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
          <Calendar className="w-7 h-7 text-amber-400" />
          Booking & Reservations
        </h1>
        <p className="text-slate-400 mt-1">
          Your public booking page, services, hours, and upcoming sessions — all in one place.
        </p>
      </div>

      <BookingHubHeader />

      <div className="grid gap-6 md:grid-cols-2">
        <ProfileCard />
        <ServicesCard />
        <AvailabilityCard />
        <UpcomingReservationsCard />
      </div>
    </div>
  );
}
