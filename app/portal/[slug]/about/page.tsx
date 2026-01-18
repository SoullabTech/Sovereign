"use client";

/**
 * ABOUT PAGE
 *
 * Warm, earthy, holistic practitioner bio and background
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  Award,
  Heart,
  Sparkles,
  MapPin,
  Star,
  ArrowRight,
  Moon,
  Quote,
} from 'lucide-react';

interface PractitionerProfile {
  id: string;
  name: string;
  tagline: string;
  bio: string;
  long_bio?: string;
  photo_url?: string;
  specialties: string[];
  certifications?: string[];
  years_experience: number;
  location?: string;
  approach?: string;
  values?: string[];
}

interface Testimonial {
  id: string;
  client_name: string;
  content: string;
  rating: number;
}

export default function AboutPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [profile, setProfile] = useState<PractitionerProfile | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/portal/${slug}/about`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setTestimonials(data.testimonials || []);
      }
    } catch (err) {
      console.error('Failed to load about data:', err);
    } finally {
      setLoading(false);
    }
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

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center">
        <div>
          <Moon className="w-12 h-12 mx-auto mb-4" style={{ color: colors.terracotta }} />
          <p style={{ color: colors.text }}>This story is still being written.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Photo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          {profile.photo_url ? (
            <div className="relative">
              <div
                className="absolute inset-0 rounded-3xl -rotate-3"
                style={{ backgroundColor: colors.sand }}
              />
              <img
                src={profile.photo_url}
                alt={profile.name}
                className="relative rounded-3xl w-full max-w-md mx-auto lg:mx-0 shadow-xl"
              />
            </div>
          ) : (
            <div
              className="aspect-[4/5] rounded-3xl flex items-center justify-center"
              style={{ backgroundColor: colors.linen }}
            >
              <div className="text-center p-8">
                <Moon className="w-16 h-16 mx-auto mb-4" style={{ color: colors.terracotta }} />
                <p className="font-display text-xl" style={{ color: colors.warmGray }}>
                  {profile.name}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <p
              className="text-sm uppercase tracking-widest mb-2"
              style={{ color: colors.terracotta }}
            >
              Your Guide
            </p>
            <h1
              className="font-display text-4xl md:text-5xl font-light mb-3"
              style={{ color: colors.text }}
            >
              {profile.name}
            </h1>
            {profile.tagline && (
              <p
                className="font-display text-xl italic"
                style={{ color: colors.textLight }}
              >
                {profile.tagline}
              </p>
            )}
          </div>

          <p className="leading-relaxed text-lg" style={{ color: colors.textLight }}>
            {profile.long_bio || profile.bio}
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6">
            {profile.years_experience > 0 && (
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" style={{ color: colors.terracotta }} />
                <span style={{ color: colors.text }}>
                  {profile.years_experience}+ years guiding souls
                </span>
              </div>
            )}
            {profile.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" style={{ color: colors.terracotta }} />
                <span style={{ color: colors.text }}>{profile.location}</span>
              </div>
            )}
          </div>

          <Link
            href={`/portal/${slug}/book`}
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-full font-medium transition-all hover:scale-105"
            style={{ backgroundColor: colors.terracotta, color: colors.ivory }}
          >
            <Calendar className="w-5 h-5" />
            <span>Book a Reading</span>
          </Link>
        </motion.div>
      </section>

      {/* Specialties */}
      {profile.specialties?.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <p
              className="text-sm uppercase tracking-widest mb-2"
              style={{ color: colors.terracotta }}
            >
              Areas of Focus
            </p>
            <h2
              className="font-display text-3xl font-light"
              style={{ color: colors.text }}
            >
              What I Specialize In
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {profile.specialties.map((specialty, i) => (
              <div
                key={i}
                className="flex items-center space-x-2 px-5 py-3 rounded-full"
                style={{ backgroundColor: colors.linen }}
              >
                <Sparkles className="w-4 h-4" style={{ color: colors.forest }} />
                <span style={{ color: colors.text }}>{specialty}</span>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Approach */}
      {profile.approach && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl p-10 md:p-12"
          style={{ backgroundColor: colors.linen }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <p
              className="text-sm uppercase tracking-widest mb-4"
              style={{ color: colors.terracotta }}
            >
              My Philosophy
            </p>
            <h2
              className="font-display text-3xl font-light mb-6"
              style={{ color: colors.text }}
            >
              How I Work
            </h2>
            <p
              className="text-lg leading-relaxed"
              style={{ color: colors.textLight }}
            >
              {profile.approach}
            </p>
          </div>
        </motion.section>
      )}

      {/* Values */}
      {profile.values && profile.values.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-10">
            <p
              className="text-sm uppercase tracking-widest mb-2"
              style={{ color: colors.terracotta }}
            >
              Core Beliefs
            </p>
            <h2
              className="font-display text-3xl font-light"
              style={{ color: colors.text }}
            >
              What I Hold Sacred
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6"
                style={{ backgroundColor: colors.linen }}
              >
                <div className="flex items-start space-x-4">
                  <Heart className="w-6 h-6 flex-shrink-0" style={{ color: colors.terracotta }} />
                  <span className="text-lg" style={{ color: colors.text }}>{value}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Certifications */}
      {profile.certifications && profile.certifications.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <p
              className="text-sm uppercase tracking-widest mb-2"
              style={{ color: colors.terracotta }}
            >
              Training & Background
            </p>
            <h2
              className="font-display text-3xl font-light"
              style={{ color: colors.text }}
            >
              Certifications
            </h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-4">
            {profile.certifications.map((cert, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-4 rounded-xl"
                style={{ backgroundColor: colors.linen }}
              >
                <Award className="w-6 h-6" style={{ color: colors.forest }} />
                <span style={{ color: colors.text }}>{cert}</span>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Featured Testimonials */}
      {testimonials.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl p-10 md:p-12"
          style={{ backgroundColor: colors.sand }}
        >
          <div className="text-center mb-10">
            <p
              className="text-sm uppercase tracking-widest mb-2"
              style={{ color: colors.terracotta }}
            >
              Kind Words
            </p>
            <h2
              className="font-display text-3xl font-light"
              style={{ color: colors.text }}
            >
              What Clients Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.slice(0, 2).map((testimonial, i) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl p-6"
                style={{ backgroundColor: colors.ivory }}
              >
                <Quote
                  className="w-8 h-8 mb-4"
                  style={{ color: `${colors.forest}40` }}
                />
                <div className="flex mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4"
                      style={{ color: colors.terracotta }}
                      fill={colors.terracotta}
                    />
                  ))}
                </div>
                <p
                  className="italic leading-relaxed mb-4"
                  style={{ color: colors.textLight }}
                >
                  "{testimonial.content}"
                </p>
                <div className="font-medium" style={{ color: colors.text }}>
                  — {testimonial.client_name}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center py-12"
      >
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="h-px w-16" style={{ backgroundColor: colors.sand }} />
          <Star className="w-5 h-5" style={{ color: colors.terracotta }} />
          <div className="h-px w-16" style={{ backgroundColor: colors.sand }} />
        </div>

        <h2
          className="font-display text-3xl font-light mb-4"
          style={{ color: colors.text }}
        >
          Ready to Explore Together?
        </h2>
        <p className="mb-8 max-w-xl mx-auto" style={{ color: colors.textLight }}>
          I'd be honored to guide you on your journey of cosmic discovery and soul-level transformation.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/portal/${slug}/book`}
            className="flex items-center space-x-2 px-8 py-4 rounded-full font-medium transition-all hover:scale-105"
            style={{ backgroundColor: colors.terracotta, color: colors.ivory }}
          >
            <Calendar className="w-5 h-5" />
            <span>Book a Reading</span>
          </Link>
          <Link
            href={`/portal/${slug}/services`}
            className="flex items-center space-x-2 px-8 py-4 rounded-full font-medium transition-all"
            style={{
              backgroundColor: `${colors.forest}15`,
              color: colors.text,
              border: `1px solid ${colors.forest}`,
            }}
          >
            <span>View Offerings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
