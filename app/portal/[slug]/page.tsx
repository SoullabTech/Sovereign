'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, Sparkles, Calendar, MessageCircle, ArrowRight, ChevronDown } from 'lucide-react';
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

interface LeadMagnet {
  id: string;
  name: string;
  description: string;
  type: string;
}

interface PortalData {
  profile: PortalProfile;
  services: Service[];
  testimonials: Testimonial[];
  lead_magnet: LeadMagnet | null;
}

export default function PortalHomePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPortalData() {
      try {
        const res = await fetch(`/api/portal/${slug}/home`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Portal not found');
          } else {
            setError('Failed to load portal');
          }
          return;
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError('Failed to load portal');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchPortalData();
    }
  }, [slug]);

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

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0D0B14] flex items-center justify-center">
        <div className="text-center">
          <Star className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
          <h1 className="text-2xl font-cinzel text-[#F5F0FF] mb-2">Portal Not Found</h1>
          <p className="text-[#A89FC4]">This astrology portal doesn&apos;t exist yet.</p>
          <Link href="/" className="mt-6 inline-block text-[#D4AF37] hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const { profile, services, testimonials, lead_magnet } = data;

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #0D0B14 0%, #1A1625 50%, #0D0B14 100%)',
      }}
    >
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Starfield Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          {/* Photo */}
          {profile.photo_url && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-[#D4AF37]/30 shadow-lg shadow-[#9D8EC7]/20">
                <img
                  src={profile.photo_url}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          )}

          {/* Name & Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-cinzel text-4xl md:text-6xl text-[#F5F0FF] mb-4 tracking-wide"
          >
            {profile.brand.name || profile.name}
          </motion.h1>

          {profile.tagline && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-quicksand text-xl md:text-2xl text-[#9D8EC7] mb-8 max-w-2xl mx-auto"
            >
              {profile.tagline}
            </motion.p>
          )}

          {/* Specialties */}
          {profile.specialties && profile.specialties.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-3 mb-10"
            >
              {profile.specialties.slice(0, 4).map((specialty, i) => (
                <span
                  key={i}
                  className="px-4 py-1.5 rounded-full text-sm font-quicksand
                           bg-[#251F33] text-[#E8B4CB] border border-[#3A3347]"
                >
                  {specialty}
                </span>
              ))}
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href={`/portal/${slug}/services`}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full
                       bg-gradient-to-r from-[#D4AF37] to-[#C9A962] text-[#0D0B14]
                       font-quicksand font-semibold hover:shadow-lg hover:shadow-[#D4AF37]/20
                       transition-all duration-300 hover:scale-105"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book a Reading
            </Link>
            <Link
              href={`/portal/${slug}/chat`}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full
                       border border-[#9D8EC7] text-[#F5F0FF]
                       font-quicksand hover:bg-[#251F33] transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat with Stellium
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-8 h-8 text-[#6B6280]" />
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section */}
      {services.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-cinzel text-3xl md:text-4xl text-[#F5F0FF] mb-4">
                Services
              </h2>
              <p className="font-quicksand text-[#A89FC4] max-w-2xl mx-auto">
                Explore the cosmic wisdom through personalized readings and guidance
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-6 rounded-2xl bg-[#1A1625]/80 border border-[#3A3347]
                           hover:border-[#9D8EC7]/50 transition-all duration-300
                           hover:shadow-lg hover:shadow-[#9D8EC7]/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-cinzel text-xl text-[#F5F0FF] group-hover:text-[#D4AF37] transition-colors">
                      {service.name}
                    </h3>
                    {service.featured && (
                      <Star className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                    )}
                  </div>
                  <p className="font-quicksand text-[#A89FC4] text-sm mb-4 line-clamp-3">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[#6B6280]">
                      {service.duration_minutes} min
                    </div>
                    <div className="font-quicksand font-semibold text-[#E8B4CB]">
                      ${(service.price_cents / 100).toFixed(0)}
                    </div>
                  </div>
                  <Link
                    href={`/portal/${slug}/book?service=${service.id}`}
                    className="mt-4 flex items-center justify-center w-full py-2 rounded-lg
                             bg-[#251F33] text-[#F5F0FF] text-sm font-quicksand
                             hover:bg-[#3A3347] transition-colors group"
                  >
                    Book Now
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href={`/portal/${slug}/services`}
                className="inline-flex items-center text-[#D4AF37] font-quicksand hover:underline"
              >
                View All Services
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-20 px-4 bg-[#1A1625]/30">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-cinzel text-3xl md:text-4xl text-[#F5F0FF] mb-4">
                Client Experiences
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {testimonials.map((testimonial, i) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-[#0D0B14]/60 border border-[#3A3347]"
                >
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className={`w-4 h-4 ${
                          j < testimonial.rating
                            ? 'text-[#D4AF37] fill-[#D4AF37]'
                            : 'text-[#3A3347]'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="font-quicksand text-[#F5F0FF] mb-4 italic">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-quicksand text-sm text-[#9D8EC7]">
                      — {testimonial.client_name}
                    </span>
                    {testimonial.service_name && (
                      <span className="text-xs text-[#6B6280]">
                        {testimonial.service_name}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lead Magnet Section */}
      {lead_magnet && (
        <section className="py-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center p-8 rounded-3xl
                     bg-gradient-to-br from-[#251F33] to-[#1A1625]
                     border border-[#9D8EC7]/30"
          >
            <Sparkles className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
            <h3 className="font-cinzel text-2xl text-[#F5F0FF] mb-3">
              {lead_magnet.name}
            </h3>
            <p className="font-quicksand text-[#A89FC4] mb-6">
              {lead_magnet.description}
            </p>
            <button
              className="inline-flex items-center justify-center px-8 py-3 rounded-full
                       bg-gradient-to-r from-[#D4AF37] to-[#C9A962] text-[#0D0B14]
                       font-quicksand font-semibold hover:shadow-lg hover:shadow-[#D4AF37]/20
                       transition-all duration-300 hover:scale-105"
            >
              Get Free Access
            </button>
          </motion.div>
        </section>
      )}

      {/* About Section */}
      {profile.bio && (
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="font-cinzel text-3xl md:text-4xl text-[#F5F0FF] mb-8">
                About {profile.name}
              </h2>
              <p className="font-quicksand text-[#A89FC4] leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
              {profile.years_experience > 0 && (
                <p className="mt-6 text-sm text-[#6B6280]">
                  {profile.years_experience}+ years of experience
                </p>
              )}
              <Link
                href={`/portal/${slug}/about`}
                className="mt-6 inline-flex items-center text-[#D4AF37] font-quicksand hover:underline"
              >
                Learn More
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[#3A3347]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-cinzel text-lg text-[#F5F0FF] mb-2">
            {profile.brand.name || profile.name}
          </p>
          <p className="font-quicksand text-sm text-[#6B6280]">
            Powered by Stellium
          </p>
        </div>
      </footer>
    </div>
  );
}
