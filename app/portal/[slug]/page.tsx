"use client";

/**
 * Practitioner Portal Home Page
 *
 * Warm, earthy, feminine landing page for holistic practitioners
 */

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Moon, Star, Calendar, Gift, ArrowRight, Quote } from 'lucide-react';

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
  const slug = params.slug as string;

  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  // Earthy color palette
  const colors = {
    cream: '#FAF6F0',
    sand: '#F5EDE4',
    terracotta: '#C67B5C',
    text: '#4A3728',
    sage: '#9CAF88',
    gold: '#C9A962',
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
          <Moon className="w-8 h-8" style={{ color: colors.terracotta }} />
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center">
        <div>
          <Moon className="w-12 h-12 mx-auto mb-4" style={{ color: colors.terracotta }} />
          <p style={{ color: colors.text }}>Unable to load portal data.</p>
        </div>
      </div>
    );
  }

  const { profile, services, testimonials, lead_magnet } = data;

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative Element */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="h-px w-16" style={{ backgroundColor: colors.sage }} />
            <Moon className="w-6 h-6" style={{ color: colors.terracotta }} />
            <div className="h-px w-16" style={{ backgroundColor: colors.sage }} />
          </div>

          {/* Welcome Text */}
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-heading font-light mb-6 leading-tight"
            style={{ color: colors.text }}
          >
            Welcome to<br />
            <span className="font-medium">{profile.brand.name}</span>
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: `${colors.text}90` }}
          >
            {profile.tagline}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/portal/${slug}/book`}
              className="px-8 py-4 rounded-full font-medium transition-all hover:scale-105 flex items-center space-x-2"
              style={{
                backgroundColor: colors.terracotta,
                color: colors.cream,
              }}
            >
              <Calendar className="w-5 h-5" />
              <span>Book a Reading</span>
            </Link>
            <Link
              href={`/portal/${slug}/free`}
              className="px-8 py-4 rounded-full font-medium transition-all hover:scale-105 flex items-center space-x-2"
              style={{
                backgroundColor: `${colors.sage}30`,
                color: colors.text,
                border: `2px solid ${colors.sage}`,
              }}
            >
              <Gift className="w-5 h-5" />
              <span>Get Free Guide</span>
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
        {/* Photo Placeholder */}
        <div
          className="aspect-[4/5] rounded-3xl flex items-center justify-center"
          style={{ backgroundColor: colors.sand }}
        >
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.name}
              className="w-full h-full object-cover rounded-3xl"
            />
          ) : (
            <div className="text-center p-8">
              <Moon className="w-16 h-16 mx-auto mb-4" style={{ color: colors.terracotta }} />
              <p className="font-heading text-xl" style={{ color: `${colors.text}60` }}>
                {profile.name}
              </p>
            </div>
          )}
        </div>

        {/* Bio */}
        <div>
          <p
            className="text-sm uppercase tracking-widest mb-3"
            style={{ color: colors.terracotta }}
          >
            Your Guide
          </p>
          <h2
            className="text-3xl md:text-4xl font-heading font-medium mb-6"
            style={{ color: colors.text }}
          >
            Meet {profile.name}
          </h2>
          <p
            className="leading-relaxed mb-6"
            style={{ color: `${colors.text}90` }}
          >
            {profile.bio}
          </p>

          {/* Specialties */}
          {profile.specialties?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {profile.specialties.slice(0, 4).map((specialty, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: `${colors.sage}20`,
                    color: colors.text,
                  }}
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}

          <Link
            href={`/portal/${slug}/about`}
            className="inline-flex items-center space-x-2 font-medium transition-colors"
            style={{ color: colors.terracotta }}
          >
            <span>Learn more about my approach</span>
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
              className="text-sm uppercase tracking-widest mb-3"
              style={{ color: colors.terracotta }}
            >
              Offerings
            </p>
            <h2
              className="text-3xl md:text-4xl font-heading font-medium"
              style={{ color: colors.text }}
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
                className="rounded-2xl p-6 transition-all hover:shadow-lg"
                style={{
                  backgroundColor: colors.sand,
                  border: service.featured ? `2px solid ${colors.terracotta}` : 'none',
                }}
              >
                {service.featured && (
                  <div
                    className="text-xs uppercase tracking-wider mb-3 flex items-center space-x-1"
                    style={{ color: colors.terracotta }}
                  >
                    <Star className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                )}
                <h3
                  className="text-xl font-heading font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  {service.name}
                </h3>
                <p
                  className="text-sm mb-4 leading-relaxed"
                  style={{ color: `${colors.text}80` }}
                >
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: `${colors.text}60` }}>
                    {service.duration_minutes} min
                  </span>
                  <span
                    className="font-heading text-xl font-medium"
                    style={{ color: colors.terracotta }}
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
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full transition-colors"
              style={{
                backgroundColor: `${colors.terracotta}10`,
                color: colors.terracotta,
              }}
            >
              <span>View All Services</span>
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
          className="rounded-3xl p-8 md:p-12"
          style={{ backgroundColor: colors.sand }}
        >
          <div className="text-center mb-10">
            <p
              className="text-sm uppercase tracking-widest mb-3"
              style={{ color: colors.terracotta }}
            >
              Kind Words
            </p>
            <h2
              className="text-3xl md:text-4xl font-heading font-medium"
              style={{ color: colors.text }}
            >
              What Clients Say
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6"
                style={{ backgroundColor: colors.cream }}
              >
                <Quote
                  className="w-8 h-8 mb-4"
                  style={{ color: `${colors.sage}60` }}
                />
                <p
                  className="leading-relaxed mb-4 italic"
                  style={{ color: `${colors.text}90` }}
                >
                  "{testimonial.content}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-medium" style={{ color: colors.text }}>
                    — {testimonial.client_name}
                  </span>
                  {testimonial.service_name && (
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${colors.sage}20`,
                        color: `${colors.text}70`,
                      }}
                    >
                      {testimonial.service_name}
                    </span>
                  )}
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
          className="text-center rounded-3xl p-10 md:p-16"
          style={{
            background: `linear-gradient(135deg, ${colors.sage}30, ${colors.terracotta}20)`,
          }}
        >
          <Gift
            className="w-12 h-12 mx-auto mb-6"
            style={{ color: colors.terracotta }}
          />
          <h2
            className="text-3xl md:text-4xl font-heading font-medium mb-4"
            style={{ color: colors.text }}
          >
            {lead_magnet.name}
          </h2>
          <p
            className="max-w-xl mx-auto mb-8 leading-relaxed"
            style={{ color: `${colors.text}90` }}
          >
            {lead_magnet.description}
          </p>
          <Link
            href={`/portal/${slug}/free`}
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-full font-medium transition-all hover:scale-105"
            style={{
              backgroundColor: colors.terracotta,
              color: colors.cream,
            }}
          >
            <span>Get Your Free Guide</span>
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
          <div className="h-px w-16" style={{ backgroundColor: colors.sage }} />
          <Star className="w-5 h-5" style={{ color: colors.gold }} />
          <div className="h-px w-16" style={{ backgroundColor: colors.sage }} />
        </div>

        <h2
          className="text-2xl md:text-3xl font-heading font-medium mb-6"
          style={{ color: colors.text }}
        >
          Ready to explore your cosmic blueprint?
        </h2>

        <Link
          href={`/portal/${slug}/book`}
          className="inline-flex items-center space-x-2 px-10 py-5 rounded-full font-medium text-lg transition-all hover:scale-105"
          style={{
            backgroundColor: colors.terracotta,
            color: colors.cream,
          }}
        >
          <Calendar className="w-5 h-5" />
          <span>Book Your Reading</span>
        </Link>
      </motion.section>
    </div>
  );
}
