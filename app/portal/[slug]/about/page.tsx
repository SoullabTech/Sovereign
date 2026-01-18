"use client";

/**
 * ABOUT PAGE
 *
 * Practitioner bio and background
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Calendar,
  Award,
  Heart,
  Sparkles,
  MapPin,
  Star,
  ArrowRight,
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
  brand: {
    accent_color: string;
  };
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

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
      </div>
    );
  }

  const accentColor = profile.brand?.accent_color || '#D4AF37';

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Photo */}
        {profile.photo_url && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${accentColor}20, transparent)`,
                transform: 'rotate(3deg)',
              }}
            />
            <img
              src={profile.photo_url}
              alt={profile.name}
              className="relative rounded-2xl w-full max-w-md mx-auto lg:mx-0 shadow-2xl"
            />
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-light text-gray-100 mb-2">
              {profile.name}
            </h1>
            {profile.tagline && (
              <p className="text-lg" style={{ color: accentColor }}>
                {profile.tagline}
              </p>
            )}
          </div>

          <p className="text-gray-400 leading-relaxed">
            {profile.long_bio || profile.bio}
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6">
            {profile.years_experience > 0 && (
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" style={{ color: accentColor }} />
                <span className="text-gray-300">
                  {profile.years_experience}+ years experience
                </span>
              </div>
            )}
            {profile.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" style={{ color: accentColor }} />
                <span className="text-gray-300">{profile.location}</span>
              </div>
            )}
          </div>

          <Link
            href={`/portal/${slug}/book`}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg text-gray-900 font-medium"
            style={{ backgroundColor: accentColor }}
          >
            <Calendar className="w-5 h-5" />
            <span>Book a Session</span>
          </Link>
        </motion.div>
      </section>

      {/* Specialties */}
      {profile.specialties?.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-light text-gray-100 mb-6">Specialties</h2>
          <div className="flex flex-wrap gap-3">
            {profile.specialties.map((specialty, i) => (
              <div
                key={i}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
                <span className="text-gray-300">{specialty}</span>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Approach */}
      {profile.approach && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-900/30 backdrop-blur-xl border-gray-800/50">
            <CardContent className="p-8">
              <h2 className="text-xl font-light text-gray-100 mb-4">My Approach</h2>
              <p className="text-gray-400 leading-relaxed">{profile.approach}</p>
            </CardContent>
          </Card>
        </motion.section>
      )}

      {/* Values */}
      {profile.values && profile.values.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-light text-gray-100 mb-6">What I Believe In</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.values.map((value, i) => (
              <Card key={i} className="bg-gray-900/30 backdrop-blur-xl border-gray-800/50">
                <CardContent className="p-4 flex items-start space-x-3">
                  <Heart className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
                  <span className="text-gray-300">{value}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>
      )}

      {/* Certifications */}
      {profile.certifications && profile.certifications.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-light text-gray-100 mb-6">Certifications & Training</h2>
          <div className="space-y-3">
            {profile.certifications.map((cert, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Award className="w-5 h-5" style={{ color: accentColor }} />
                <span className="text-gray-300">{cert}</span>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Featured Testimonials */}
      {testimonials.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-light text-gray-100 mb-6">What Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.slice(0, 2).map(testimonial => (
              <Card key={testimonial.id} className="bg-gray-900/30 backdrop-blur-xl border-gray-800/50">
                <CardContent className="p-6">
                  <div className="flex mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4"
                        style={{ color: accentColor }}
                        fill={accentColor}
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 italic mb-4">"{testimonial.content}"</p>
                  <div className="text-gray-200 font-medium">{testimonial.client_name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>
      )}

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center py-8"
      >
        <Card className="bg-gray-900/30 backdrop-blur-xl border-gray-800/50">
          <CardContent className="p-8">
            <h2 className="text-2xl font-light text-gray-100 mb-4">
              Ready to Work Together?
            </h2>
            <p className="text-gray-400 mb-6">
              I'd love to connect and explore how I can support you on your journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/portal/${slug}/book`}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg text-gray-900 font-medium"
                style={{ backgroundColor: accentColor }}
              >
                <Calendar className="w-5 h-5" />
                <span>Book a Session</span>
              </Link>
              <Link
                href={`/portal/${slug}/services`}
                className="flex items-center space-x-2 text-gray-400 hover:text-gray-200"
              >
                <span>View Services</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
