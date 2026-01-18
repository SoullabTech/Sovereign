"use client";

/**
 * PRACTITIONER SERVICES PAGE
 *
 * Cosmic, celestial aesthetic - Starlight Muse theme
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Calendar, Star, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  long_description?: string;
  duration_minutes: number;
  price_cents: number;
  featured: boolean;
  category?: string;
  includes?: string[];
}

export default function ServicesPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Cosmic Starlight Muse palette - high contrast
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
    success: '#8FB89A',
  };

  useEffect(() => {
    fetchServices();
  }, [slug]);

  const fetchServices = async () => {
    try {
      const response = await fetch(`/api/portal/${slug}/services`);
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(services.map(s => s.category).filter(Boolean))];

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

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

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Decorative Element */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
            <Star className="w-5 h-5" style={{ color: colors.gold }} />
            <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
          </div>

          <h1
            className="font-display text-4xl md:text-5xl tracking-wide mb-4"
            style={{ color: colors.starlight }}
          >
            Offerings
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: colors.muted }}
          >
            Choose the experience that resonates with where you are on your cosmic journey
          </p>
        </motion.div>
      </div>

      {/* Category Filter */}
      {categories.length > 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className="px-5 py-2 rounded-full text-sm capitalize transition-all font-medium"
              style={{
                backgroundColor: selectedCategory === category ? colors.gold : colors.stardust,
                color: selectedCategory === category ? colors.void : colors.starlight,
                border: `1px solid ${selectedCategory === category ? colors.gold : colors.border}`,
                boxShadow: selectedCategory === category ? `0 0 20px ${colors.gold}40` : 'none',
              }}
            >
              {category}
            </button>
          ))}
        </motion.div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            whileHover={{ y: -4 }}
            className="rounded-2xl p-8 transition-all backdrop-blur-xl"
            style={{
              background: service.featured
                ? `linear-gradient(135deg, rgba(229, 193, 88, 0.15), ${colors.cardBg})`
                : `linear-gradient(135deg, ${colors.cardBg}, rgba(184, 165, 217, 0.1))`,
              border: service.featured ? `2px solid ${colors.gold}` : `1px solid ${colors.border}`,
              boxShadow: service.featured
                ? `0 8px 32px rgba(229, 193, 88, 0.15)`
                : `0 4px 20px rgba(184, 165, 217, 0.1)`,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                {service.featured && (
                  <div
                    className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs uppercase tracking-wider mb-3 font-semibold"
                    style={{ backgroundColor: `${colors.gold}25`, color: colors.gold }}
                  >
                    <Star className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                )}
                <h3
                  className="font-display text-2xl font-semibold tracking-wide mb-1"
                  style={{ color: colors.starlight }}
                >
                  {service.name}
                </h3>
                {service.category && (
                  <span
                    className="text-xs uppercase tracking-widest font-medium"
                    style={{ color: colors.dim }}
                  >
                    {service.category}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p
              className="leading-relaxed mb-6"
              style={{ color: colors.muted }}
            >
              {service.long_description || service.description}
            </p>

            {/* Includes */}
            {service.includes && service.includes.length > 0 && (
              <div className="mb-6">
                <div
                  className="text-xs uppercase tracking-widest mb-3 font-semibold"
                  style={{ color: colors.dim }}
                >
                  What's Included
                </div>
                <ul className="space-y-2">
                  {service.includes.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start space-x-3 text-sm"
                      style={{ color: colors.muted }}
                    >
                      <CheckCircle2
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{ color: colors.success }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div
              className="pt-6 border-t flex items-center justify-between"
              style={{ borderColor: colors.border }}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm font-medium" style={{ color: colors.dim }}>
                  <Clock className="w-4 h-4" />
                  <span>{service.duration_minutes} min</span>
                </div>
                <div
                  className="font-display text-2xl font-semibold"
                  style={{ color: colors.gold }}
                >
                  {formatPrice(service.price_cents)}
                </div>
              </div>
              <Link
                href={`/portal/${slug}/book?service=${service.id}`}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: colors.gold,
                  color: colors.void,
                  boxShadow: `0 4px 15px ${colors.gold}40`,
                }}
              >
                <Calendar className="w-4 h-4" />
                <span>Book Now</span>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div
          className="rounded-2xl p-12 text-center backdrop-blur-xl"
          style={{
            background: `linear-gradient(135deg, ${colors.cardBg}, rgba(184, 165, 217, 0.1))`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: colors.violet }} />
          <p style={{ color: colors.muted }}>
            {selectedCategory === 'all'
              ? 'Offerings are being prepared for you'
              : `No offerings in ${selectedCategory} category`}
          </p>
        </div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center py-8"
      >
        <p className="mb-4" style={{ color: colors.muted }}>
          Not sure which offering resonates with your journey?
        </p>
        <Link
          href={`/portal/${slug}/about`}
          className="inline-flex items-center space-x-2 text-sm font-semibold transition-colors hover:opacity-80"
          style={{ color: colors.gold }}
        >
          <span>Learn more about my approach</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
