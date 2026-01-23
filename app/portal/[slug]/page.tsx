"use client";

/**
 * Practitioner Portal Home Page
 *
 * Elegant cosmic aesthetic - sophisticated, high-end design
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, Calendar, Gift, ArrowRight, Quote, Sparkles, Clock } from 'lucide-react';

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
  service_name?: string;
}

interface LeadMagnet {
  id: string;
  name: string;
  description: string;
  type: string;
}

interface Profile {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  bio: string;
  photo_url?: string;
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

interface HomeData {
  profile: Profile;
  services: Service[];
  testimonials: Testimonial[];
  lead_magnet: LeadMagnet | null;
}

export default function PortalHomePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  // Elegant cosmic palette
  const colors = {
    void: '#0D0B14',
    cosmos: '#1A1625',
    nebula: '#251F33',
    stardust: '#2D2640',
    cardBg: 'rgba(45, 38, 64, 0.6)',
    gold: '#E5C158',
    violet: '#B8A5D9',
    starlight: '#FFFFFF',
    muted: '#D0C5E8',
    dim: '#A99DC4',
    border: '#4A3D5C',
  };

  useEffect(() => {
    fetchHomeData();
  }, [slug]);

  const fetchHomeData = async () => {
    try {
      const response = await fetch(`/api/portal/${slug}/home`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8" style={{ color: colors.gold }} />
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center">
        <div>
          <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: colors.gold }} />
          <p style={{ color: colors.starlight }}>Unable to load portal data.</p>
        </div>
      </div>
    );
  }

  const { profile, services, testimonials, lead_magnet } = data;

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="text-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative Element */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="h-px w-16" style={{ backgroundColor: colors.border }} />
            <Star className="w-5 h-5" style={{ color: colors.gold }} />
            <div className="h-px w-16" style={{ backgroundColor: colors.border }} />
          </div>

          {/* Welcome Text */}
          <h1
            className="font-display text-4xl md:text-5xl lg:text-6xl tracking-wide mb-6 leading-tight"
            style={{ color: colors.starlight }}
          >
            Welcome to<br />
            <span className="font-semibold">{profile.brand.name}</span>
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
            style={{ color: colors.muted }}
          >
            {profile.tagline}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/portal/${slug}/book`}
              className="px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 flex items-center space-x-2"
              style={{
                backgroundColor: colors.gold,
                color: colors.void,
                boxShadow: `0 4px 20px ${colors.gold}40`,
              }}
            >
              <Calendar className="w-5 h-5" />
              <span>Book a Session</span>
            </Link>
            <Link
              href={`/portal/${slug}/free`}
              className="px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 flex items-center space-x-2 backdrop-blur-xl"
              style={{
                background: colors.cardBg,
                color: colors.starlight,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Gift className="w-5 h-5" />
              <span>Free Resource</span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* About Preview */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid md:grid-cols-2 gap-12 items-center"
      >
        {/* Photo */}
        <div
          className="aspect-[4/5] rounded-3xl flex items-center justify-center backdrop-blur-xl"
          style={{
            background: `linear-gradient(135deg, ${colors.cardBg}, rgba(184, 165, 217, 0.15))`,
            border: `1px solid ${colors.border}`,
          }}
        >
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.name}
              className="w-full h-full object-cover rounded-3xl"
            />
          ) : (
            <div className="text-center p-8">
              <Star className="w-16 h-16 mx-auto mb-4" style={{ color: colors.gold }} />
              <p className="font-display text-xl font-semibold" style={{ color: colors.starlight }}>
                {profile.name}
              </p>
            </div>
          )}
        </div>

        {/* Bio */}
        <div>
          <p
            className="text-xs uppercase tracking-widest mb-3 font-semibold"
            style={{ color: colors.gold }}
          >
            Your Guide
          </p>
          <h2
            className="font-display text-3xl md:text-4xl tracking-wide mb-6"
            style={{ color: colors.starlight }}
          >
            Meet {profile.name}
          </h2>
          <p
            className="leading-relaxed mb-6 font-medium"
            style={{ color: colors.muted }}
          >
            {profile.bio}
          </p>

          {/* Specialties */}
          {profile.specialties?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {profile.specialties.slice(0, 4).map((specialty, i) => (
                <span
                  key={i}
                  className="px-4 py-2 rounded-full text-sm font-medium backdrop-blur-xl"
                  style={{
                    background: colors.cardBg,
                    color: colors.starlight,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}

          <Link
            href={`/portal/${slug}/about`}
            className="inline-flex items-center space-x-2 font-semibold transition-colors hover:opacity-80"
            style={{ color: colors.gold }}
          >
            <span>Learn more</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.section>

      {/* Services */}
      {services.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <p
              className="text-xs uppercase tracking-widest mb-3 font-semibold"
              style={{ color: colors.gold }}
            >
              Offerings
            </p>
            <h2
              className="font-display text-3xl md:text-4xl tracking-wide"
              style={{ color: colors.starlight }}
            >
              Ways We Can Work Together
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6 transition-all hover:scale-[1.02] backdrop-blur-xl"
                style={{
                  background: service.featured
                    ? `linear-gradient(135deg, rgba(229, 193, 88, 0.15), ${colors.cardBg})`
                    : `linear-gradient(135deg, ${colors.cardBg}, rgba(184, 165, 217, 0.1))`,
                  border: service.featured ? `2px solid ${colors.gold}` : `1px solid ${colors.border}`,
                }}
              >
                {service.featured && (
                  <div
                    className="text-xs uppercase tracking-widest mb-3 flex items-center space-x-1 font-semibold"
                    style={{ color: colors.gold }}
                  >
                    <Star className="w-3 h-3" />
                    <span>Popular</span>
                  </div>
                )}
                <h3
                  className="font-display text-xl font-semibold tracking-wide mb-2"
                  style={{ color: colors.starlight }}
                >
                  {service.name}
                </h3>
                <p
                  className="text-sm mb-4 leading-relaxed"
                  style={{ color: colors.muted }}
                >
                  {service.description}
                </p>
                <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
                  <span className="text-sm flex items-center gap-1 font-medium" style={{ color: colors.dim }}>
                    <Clock className="w-4 h-4" />
                    {service.duration_minutes} min
                  </span>
                  <span
                    className="font-display text-xl font-semibold"
                    style={{ color: colors.gold }}
                  >
                    {formatPrice(service.price_cents)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href={`/portal/${slug}/services`}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full transition-all hover:scale-105 backdrop-blur-xl font-semibold"
              style={{
                background: colors.cardBg,
                color: colors.starlight,
                border: `1px solid ${colors.border}`,
              }}
            >
              <span>View All Offerings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl p-8 md:p-12 backdrop-blur-xl"
          style={{
            background: `linear-gradient(135deg, rgba(229, 193, 88, 0.08), ${colors.cardBg})`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="text-center mb-10">
            <p
              className="text-xs uppercase tracking-widest mb-3 font-semibold"
              style={{ color: colors.gold }}
            >
              Testimonials
            </p>
            <h2
              className="font-display text-3xl md:text-4xl tracking-wide"
              style={{ color: colors.starlight }}
            >
              Client Experiences
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.slice(0, 4).map((testimonial, i) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6 backdrop-blur-xl"
                style={{
                  background: `linear-gradient(135deg, ${colors.stardust}, rgba(184, 165, 217, 0.1))`,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <Quote
                  className="w-8 h-8 mb-4"
                  style={{ color: colors.violet }}
                />
                <div className="flex mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4"
                      style={{ color: colors.gold }}
                      fill={colors.gold}
                    />
                  ))}
                </div>
                <p
                  className="leading-relaxed mb-4 italic"
                  style={{ color: colors.muted }}
                >
                  "{testimonial.content}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{ color: colors.starlight }}>
                    — {testimonial.client_name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Lead Magnet CTA */}
      {lead_magnet && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center rounded-3xl p-10 md:p-16 backdrop-blur-xl"
          style={{
            background: `linear-gradient(135deg, ${colors.cardBg}, rgba(229, 193, 88, 0.1))`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <Gift
            className="w-12 h-12 mx-auto mb-6"
            style={{ color: colors.gold }}
          />
          <h2
            className="font-display text-3xl md:text-4xl tracking-wide mb-4"
            style={{ color: colors.starlight }}
          >
            {lead_magnet.name}
          </h2>
          <p
            className="max-w-xl mx-auto mb-8 leading-relaxed font-medium"
            style={{ color: colors.muted }}
          >
            {lead_magnet.description}
          </p>
          <Link
            href={`/portal/${slug}/free`}
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
            style={{
              backgroundColor: colors.gold,
              color: colors.void,
              boxShadow: `0 4px 20px ${colors.gold}40`,
            }}
          >
            <span>Get Free Access</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.section>
      )}

      {/* Final CTA */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center py-12"
      >
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="h-px w-16" style={{ backgroundColor: colors.border }} />
          <Star className="w-5 h-5" style={{ color: colors.gold }} />
          <div className="h-px w-16" style={{ backgroundColor: colors.border }} />
        </div>

        <h2
          className="font-display text-2xl md:text-3xl tracking-wide mb-6"
          style={{ color: colors.starlight }}
        >
          Ready to Begin?
        </h2>

        <Link
          href={`/portal/${slug}/book`}
          className="inline-flex items-center space-x-2 px-10 py-5 rounded-full font-semibold text-lg transition-all hover:scale-105"
          style={{
            backgroundColor: colors.gold,
            color: colors.void,
            boxShadow: `0 4px 20px ${colors.gold}40`,
          }}
        >
          <Calendar className="w-5 h-5" />
          <span>Book a Session</span>
        </Link>
      </motion.section>
    </div>
  );
}
