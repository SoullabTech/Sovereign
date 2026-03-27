'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar, MessageCircle, ArrowRight, Clock,
  ChevronLeft, ChevronRight, User, BookOpen, TrendingUp, Layers,
  Lock,
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
    <div className="rounded-xl border border-stone-800 bg-stone-900 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-800">
        <h2 className="text-sm font-semibold text-white mb-0.5">Available Times</h2>
        <p className="text-xs text-stone-500">Select a date to see open slots</p>
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
                    ? 'bg-white text-stone-900 border-white'
                    : 'border-stone-700 text-stone-400 hover:border-stone-500 hover:text-white'
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
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-white">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() => { setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)); setSelectedDate(null); }}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-center text-xs text-stone-600 py-1">{d}</div>
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
                  ${date && !sel ? 'text-stone-700 cursor-not-allowed' : ''}
                  ${isSelected ? 'bg-white text-stone-900' : ''}
                  ${date && sel && !isSelected ? 'text-stone-300 hover:bg-stone-800' : ''}
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
            <p className="text-xs text-stone-500 mb-3">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            {loadingSlots ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-stone-700 border-t-stone-400 rounded-full animate-spin" />
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-4">No open times on this date.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {slots.map(slot => (
                  <Link
                    key={slot.start}
                    href={`/portal/${slug}/book?service=${selectedService}&date=${selectedDate.toISOString().split('T')[0]}&time=${slot.start}`}
                    className="py-2.5 rounded-lg text-sm font-medium text-center bg-stone-800 text-stone-300
                               hover:bg-white hover:text-stone-900 transition-colors"
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
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-stone-700
                       text-sm text-stone-400 hover:border-stone-500 hover:text-white transition-colors"
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
        <div className="w-6 h-6 border-2 border-stone-600 border-t-stone-300 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#09090F] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-stone-400 mb-4">This portal could not be found.</p>
          <Link href="/" className="text-sm text-stone-500 hover:text-white transition-colors">
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
    <div className="min-h-screen bg-[#141210] text-stone-200">

      {/* Nav */}
      <header className="border-b border-stone-800/40 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/holoflower.svg" alt="" className="w-5 h-5 opacity-30" />
            <span className="text-sm text-amber-100/70">{displayName}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/portal/${slug}/services`} className="text-xs text-stone-500 hover:text-amber-200/80 transition-colors hidden sm:block">
              Work
            </Link>
            <Link href={`/portal/${slug}/chat`} className="text-xs text-stone-500 hover:text-amber-200/80 transition-colors hidden sm:block">
              Begin Here
            </Link>
            <Link
              href={`/portal/${slug}/signin`}
              className="text-xs px-3 py-1.5 rounded-lg bg-stone-800/60 text-stone-400 border border-stone-700/50 hover:border-amber-700/30 hover:text-amber-200/70 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 border-b border-stone-800/30">
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
                <div className="w-16 h-16 rounded-full overflow-hidden ring-1 ring-stone-700/50 mb-5">
                  <img src={profile.photo_url} alt={displayName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-stone-900/50 flex items-center justify-center mb-5 ring-1 ring-stone-700/30">
                  <img src="/holoflower.svg" alt="" className="w-8 h-8 opacity-30" />
                </div>
              )}

              <h1 className="text-3xl md:text-4xl font-semibold text-amber-100/90 tracking-tight mb-2">
                {displayName}
              </h1>

              <p className="text-base text-stone-400 mb-2 max-w-lg leading-relaxed">
                {profile.tagline || 'Sovereign infrastructure for the people who hold others.'}
              </p>

              <p className="text-sm text-stone-600 mb-8 max-w-md leading-relaxed">
                Reorganize how you see the problem. Not just respond to it.
              </p>

              {profile.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {profile.specialties.slice(0, 6).map((s, i) => (
                    <span key={i} className="px-3 py-1 text-xs rounded-full bg-stone-900/50 text-stone-400 border border-stone-700/40">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/portal/${slug}/chat`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-amber-700/80 text-amber-100 text-sm font-medium hover:bg-amber-600/80 transition-colors"
                >
                  Begin Here
                </Link>
                <Link
                  href={`/portal/${slug}/book`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-stone-800/60 text-stone-300 text-sm font-medium border border-stone-700/40 hover:border-amber-700/30 hover:text-amber-200/70 transition-colors"
                >
                  <Calendar size={15} />
                  Book a Session
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
        <section className="py-14 px-6 border-b border-stone-800/50">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-semibold text-white">Sessions</h2>
                <p className="text-sm text-stone-500 mt-0.5">Choose the session that fits your needs</p>
              </div>
              <Link href={`/portal/${slug}/services`} className="text-xs text-stone-500 hover:text-white transition-colors flex items-center gap-1">
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
                  className="group p-5 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-600 transition-colors"
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
                    <p className="text-xs text-stone-500 mb-4 line-clamp-2 leading-relaxed">{service.description}</p>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-xs text-stone-600">
                      <Clock size={11} />
                      {service.duration_minutes} min
                    </div>
                    <span className="text-sm font-medium text-stone-300">
                      ${(service.price_cents / 100).toFixed(0)}
                    </span>
                  </div>
                  <Link
                    href={`/portal/${slug}/book?service=${service.id}`}
                    className="flex items-center justify-center gap-1 w-full py-2 rounded-lg text-xs font-medium
                               bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white transition-colors"
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
        <section className="py-14 px-6 border-b border-stone-800/50">
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
                  className="p-5 rounded-xl bg-stone-900 border border-stone-800"
                >
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className={`text-xs ${j < t.rating ? 'text-amber-400' : 'text-stone-700'}`}>★</span>
                    ))}
                  </div>
                  <p className="text-sm text-stone-300 mb-4 leading-relaxed">"{t.content}"</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500">— {t.client_name}</span>
                    {t.service_name && <span className="text-xs text-stone-600">{t.service_name}</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      {profile.bio && (
        <section className="py-14 px-6 border-b border-stone-800/50">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-white mb-4">About {firstName}</h2>
            <p className="text-sm text-stone-400 leading-relaxed whitespace-pre-line">{profile.bio}</p>
            {profile.years_experience > 0 && (
              <p className="mt-4 text-xs text-stone-600">{profile.years_experience}+ years of experience</p>
            )}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-14 px-6 border-b border-stone-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-white mb-1">The work</h2>
            <p className="text-sm text-stone-500">A process, not a transaction. Each session builds on the last.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                step: '01',
                title: 'Enter the Work',
                desc: 'Begin with what\'s present — a pattern, pressure, or transition that\'s asking for attention.',
              },
              {
                icon: BookOpen,
                step: '02',
                title: 'Map and Transform',
                desc: 'We work through elemental dynamics — emotional, psychological, relational — to bring clarity and movement.',
              },
              {
                icon: TrendingUp,
                step: '03',
                title: 'Integrate and Track',
                desc: 'Your insights, sessions, and shifts are captured so patterns become visible and usable over time.',
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="relative pl-10">
                <span className="absolute left-0 top-0 text-xs font-mono text-stone-700">{step}</span>
                <div className="mb-3">
                  <Icon size={18} className="text-stone-400" />
                </div>
                <h3 className="text-sm font-medium text-white mb-1.5">{title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client portal access */}
      <section className="py-14 px-6 border-b border-stone-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white mb-1">Your ongoing field of work</h2>
              <p className="text-sm text-stone-500 mb-6 max-w-md">
                A living record of the work — not a dashboard. Everything that matters from your sessions, in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/portal/${slug}/signin`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-stone-800 text-white text-sm font-medium border border-stone-700 hover:bg-stone-700 transition-colors"
                >
                  <Lock size={14} />
                  Enter your space
                </Link>
                <Link
                  href={`/portal/${slug}/chat`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-stone-400 text-sm font-medium hover:text-white transition-colors"
                >
                  <MessageCircle size={14} />
                  Message between sessions
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-72 rounded-xl border border-stone-800 bg-stone-900 p-5 flex-shrink-0">
              <div className="flex items-center gap-2 mb-4">
                <Layers size={14} className="text-stone-500" />
                <span className="text-xs font-medium text-stone-400">Inside your portal</span>
              </div>
              <ul className="space-y-3">
                {[
                  'Session notes and key insights',
                  'Voice-captured reflections',
                  'Patterns tracked across time',
                  'Resources and integration prompts',
                  'Your evolving process, in one place',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-xs text-stone-400">
                    <span className="mt-0.5 w-1 h-1 rounded-full bg-stone-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-14 px-6 border-b border-stone-800/50">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-lg font-semibold text-white mb-2">Start where you are.</h2>
          <p className="text-sm text-stone-400 mb-6">
            We&apos;ll work from there.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/portal/${slug}/book`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white text-stone-900 text-sm font-medium hover:bg-stone-100 transition-colors"
            >
              <Calendar size={15} />
              Book a session
            </Link>
            <Link
              href={`/portal/${slug}/chat`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-stone-800 text-white text-sm font-medium border border-stone-700 hover:bg-stone-700 transition-colors"
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
          <p className="text-xs text-stone-600">
            Powered by <a href="https://soullab.life" className="hover:text-stone-400 transition-colors">Soullab</a>
          </p>
          <Link href={`/portal/${slug}/signin`} className="text-xs text-stone-600 hover:text-stone-400 transition-colors">
            Client sign in
          </Link>
        </div>
      </footer>

    </div>
  );
}
