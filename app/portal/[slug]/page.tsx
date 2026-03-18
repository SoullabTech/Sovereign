'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar, MessageCircle, ArrowRight, Clock,
  ChevronLeft, ChevronRight, User,
} from 'lucide-react';
import Link from 'next/link';

interface PortalProfile {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  bio: string;
  photo_url: string | null;
  specialties: string[];
  years_experience: number;
  brand: {
    name: string;
    tagline: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
  };
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_cents: number;
  featured: boolean;
}

interface Testimonial {
  id: string;
  client_name: string;
  content: string;
  rating: number;
  service_name: string | null;
}

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface PortalData {
  profile: PortalProfile;
  services: Service[];
  testimonials: Testimonial[];
  lead_magnet: { id: string; name: string; description: string; type: string } | null;
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function AvailabilityCalendar({ slug, services }: { slug: string; services: Service[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedService, setSelectedService] = useState<string>(services[0]?.id || '');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (services.length > 0 && !selectedService) {
      setSelectedService(services[0].id);
    }
  }, [services, selectedService]);

  useEffect(() => {
    if (!selectedDate || !selectedService) { setSlots([]); return; }
    setLoadingSlots(true);
    const dateStr = selectedDate.toISOString().split('T')[0];
    fetch(`/api/portal/${slug}/availability?date=${dateStr}&service=${selectedService}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setSlots(d?.slots?.filter((s: TimeSlot) => s.available) || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedService, slug]);

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

  const isSelectable = (d: Date) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return d >= today;
  };

  const serviceObj = services.find(s => s.id === selectedService);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-white mb-0.5">Available Times</h2>
        <p className="text-xs text-zinc-500">Select a date to see open slots</p>
      </div>

      {/* Service selector */}
      {services.length > 1 && (
        <div className="px-5 pt-4">
          <div className="flex gap-2 flex-wrap">
            {services.map(svc => (
              <button
                key={svc.id}
                onClick={() => { setSelectedService(svc.id); setSelectedDate(null); setSlots([]); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors
                  ${selectedService === svc.id
                    ? 'bg-white text-zinc-900 border-white'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                  }`}
              >
                {svc.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-5">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)); setSelectedDate(null); }}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-white">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)); setSelectedDate(null); }}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-center text-xs text-zinc-600 py-1">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1 mb-5">
          {getDaysInMonth(currentMonth).map((date, i) => {
            const isSelected = date && selectedDate?.toDateString() === date.toDateString();
            const sel = date && isSelectable(date);
            return (
              <button
                key={i}
                disabled={!date || !sel}
                onClick={() => date && setSelectedDate(date)}
                className={`aspect-square rounded-lg text-xs font-medium transition-colors
                  ${!date ? 'invisible' : ''}
                  ${date && !sel ? 'text-zinc-700 cursor-not-allowed' : ''}
                  ${isSelected ? 'bg-white text-zinc-900' : ''}
                  ${date && sel && !isSelected ? 'text-zinc-300 hover:bg-zinc-800' : ''}
                `}
              >
                {date?.getDate()}
              </button>
            );
          })}
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div>
            <p className="text-xs text-zinc-500 mb-3">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            {loadingSlots ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">No open times on this date.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {slots.map(slot => (
                  <Link
                    key={slot.start}
                    href={`/portal/${slug}/book?service=${selectedService}&date=${selectedDate.toISOString().split('T')[0]}&time=${slot.start}`}
                    className="py-2.5 rounded-lg text-sm font-medium text-center bg-zinc-800 text-zinc-300
                               hover:bg-white hover:text-zinc-900 transition-colors"
                  >
                    {formatTime(slot.start)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA when no date selected */}
        {!selectedDate && (
          <Link
            href={`/portal/${slug}/book${selectedService ? `?service=${selectedService}` : ''}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-zinc-700
                       text-sm text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
          >
            <Calendar size={15} />
            {serviceObj ? `Book: ${serviceObj.name}` : 'View availability'}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function PortalHomePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/portal/${slug}/home`)
      .then(r => {
        if (!r.ok) { setError('Portal not found'); return null; }
        return r.json();
      })
      .then(d => { if (d) setData(d); })
      .catch(() => setError('Failed to load portal'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090F] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#09090F] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">This portal could not be found.</p>
          <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors">
            Return to Soullab
          </Link>
        </div>
      </div>
    );
  }

  const { profile, services, testimonials } = data;
  const displayName = profile.brand?.name || profile.name;
  const firstName = profile.name.split(' ')[0];

  return (
    <div className="min-h-screen bg-[#09090F] text-white">

      {/* Nav */}
      <header className="border-b border-zinc-800/60 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-sm font-medium text-white">{displayName}</span>
          <div className="flex items-center gap-4">
            <Link href={`/portal/${slug}/services`} className="text-xs text-zinc-400 hover:text-white transition-colors hidden sm:block">
              Services
            </Link>
            <Link href={`/portal/${slug}/chat`} className="text-xs text-zinc-400 hover:text-white transition-colors hidden sm:block">
              Message
            </Link>
            <Link
              href={`/portal/${slug}/signin`}
              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 border-b border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-start">

            {/* Left: Profile */}
            <motion.div
              initial={{ y: 12 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex-1"
            >
              {profile.photo_url ? (
                <div className="w-16 h-16 rounded-full overflow-hidden ring-1 ring-zinc-700 mb-5">
                  <img src={profile.photo_url} alt={displayName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-5">
                  <User size={24} className="text-zinc-500" />
                </div>
              )}

              <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-3">
                {displayName}
              </h1>

              {profile.tagline && (
                <p className="text-base text-zinc-400 mb-6 max-w-lg leading-relaxed">
                  {profile.tagline}
                </p>
              )}

              {profile.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {profile.specialties.slice(0, 6).map((s, i) => (
                    <span key={i} className="px-3 py-1 text-xs rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/portal/${slug}/book`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors"
                >
                  <Calendar size={15} />
                  Book a session
                </Link>
                <Link
                  href={`/portal/${slug}/chat`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800 text-white text-sm font-medium border border-zinc-700 hover:bg-zinc-700 transition-colors"
                >
                  <MessageCircle size={15} />
                  Message {firstName}
                </Link>
              </div>
            </motion.div>

            {/* Right: Availability calendar */}
            {services.length > 0 && (
              <motion.div
                initial={{ y: 12 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="w-full lg:w-80 flex-shrink-0"
              >
                <AvailabilityCalendar slug={slug} services={services} />
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section className="py-14 px-6 border-b border-zinc-800/50">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-semibold text-white">Sessions</h2>
                <p className="text-sm text-zinc-500 mt-0.5">Choose the session that fits your needs</p>
              </div>
              <Link href={`/portal/${slug}/services`} className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                All services <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.slice(0, 6).map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-medium text-white leading-snug">{service.name}</h3>
                    {service.featured && (
                      <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                        Popular
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-xs text-zinc-500 mb-4 line-clamp-2 leading-relaxed">{service.description}</p>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-xs text-zinc-600">
                      <Clock size={11} />
                      {service.duration_minutes} min
                    </div>
                    <span className="text-sm font-medium text-zinc-300">
                      ${(service.price_cents / 100).toFixed(0)}
                    </span>
                  </div>
                  <Link
                    href={`/portal/${slug}/book?service=${service.id}`}
                    className="flex items-center justify-center gap-1 w-full py-2 rounded-lg text-xs font-medium
                               bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                  >
                    Book
                    <ArrowRight size={11} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-14 px-6 border-b border-zinc-800/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-white mb-8">What clients say</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {testimonials.slice(0, 4).map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-5 rounded-xl bg-zinc-900 border border-zinc-800"
                >
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className={`text-xs ${j < t.rating ? 'text-amber-400' : 'text-zinc-700'}`}>★</span>
                    ))}
                  </div>
                  <p className="text-sm text-zinc-300 mb-4 leading-relaxed">"{t.content}"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">— {t.client_name}</span>
                    {t.service_name && <span className="text-xs text-zinc-600">{t.service_name}</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      {profile.bio && (
        <section className="py-14 px-6 border-b border-zinc-800/50">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-white mb-4">About {firstName}</h2>
            <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">{profile.bio}</p>
            {profile.years_experience > 0 && (
              <p className="mt-4 text-xs text-zinc-600">{profile.years_experience}+ years of experience</p>
            )}
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="py-14 px-6 border-b border-zinc-800/50">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-lg font-semibold text-white mb-2">Ready to get started?</h2>
          <p className="text-sm text-zinc-400 mb-6">
            Book a session or send a message to learn more about working together.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/portal/${slug}/book`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white text-zinc-900 text-sm font-medium hover:bg-zinc-100 transition-colors"
            >
              <Calendar size={15} />
              Book a session
            </Link>
            <Link
              href={`/portal/${slug}/chat`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800 text-white text-sm font-medium border border-zinc-700 hover:bg-zinc-700 transition-colors"
            >
              <MessageCircle size={15} />
              Send a message
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">
            Powered by <a href="https://soullab.life" className="hover:text-zinc-400 transition-colors">Soullab</a>
          </p>
          <Link href={`/portal/${slug}/signin`} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            Client sign in
          </Link>
        </div>
      </footer>

    </div>
  );
}
