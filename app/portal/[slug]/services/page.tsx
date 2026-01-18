"use client";

/**
 * PRACTITIONER SERVICES PAGE
 *
 * Warm, earthy, holistic aesthetic for service offerings
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Calendar, Star, CheckCircle2, ArrowRight, Moon } from 'lucide-react';

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
          <Moon className="w-8 h-8" style={{ color: colors.terracotta }} />
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
            <div className="h-px w-12" style={{ backgroundColor: colors.sand }} />
            <Star className="w-5 h-5" style={{ color: colors.terracotta }} />
            <div className="h-px w-12" style={{ backgroundColor: colors.sand }} />
          </div>

          <h1
            className="font-display text-4xl md:text-5xl font-light mb-4"
            style={{ color: colors.text }}
          >
            Offerings
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: colors.textLight }}
          >
            Choose the experience that resonates with where you are on your journey
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
              className="px-5 py-2 rounded-full text-sm capitalize transition-all"
              style={{
                backgroundColor: selectedCategory === category ? colors.terracotta : colors.linen,
                color: selectedCategory === category ? colors.ivory : colors.text,
                border: `1px solid ${selectedCategory === category ? colors.terracotta : colors.sand}`,
              }}
            >
              {category}
            </button>
          ))}
        </motion.div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="rounded-2xl p-8 transition-all hover:shadow-lg"
            style={{
              backgroundColor: colors.linen,
              border: service.featured ? `2px solid ${colors.terracotta}` : `1px solid ${colors.sand}`,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                {service.featured && (
                  <div
                    className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs uppercase tracking-wider mb-3"
                    style={{ backgroundColor: `${colors.terracotta}20`, color: colors.terracotta }}
                  >
                    <Star className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                )}
                <h3
                  className="font-display text-2xl font-medium mb-1"
                  style={{ color: colors.text }}
                >
                  {service.name}
                </h3>
                {service.category && (
                  <span
                    className="text-xs uppercase tracking-widest"
                    style={{ color: colors.warmGray }}
                  >
                    {service.category}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p
              className="leading-relaxed mb-6"
              style={{ color: colors.textLight }}
            >
              {service.long_description || service.description}
            </p>

            {/* Includes */}
            {service.includes && service.includes.length > 0 && (
              <div className="mb-6">
                <div
                  className="text-xs uppercase tracking-widest mb-3"
                  style={{ color: colors.warmGray }}
                >
                  What's Included
                </div>
                <ul className="space-y-2">
                  {service.includes.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start space-x-3 text-sm"
                      style={{ color: colors.textLight }}
                    >
                      <CheckCircle2
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{ color: colors.forest }}
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
              style={{ borderColor: colors.sand }}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm" style={{ color: colors.warmGray }}>
                  <Clock className="w-4 h-4" />
                  <span>{service.duration_minutes} min</span>
                </div>
                <div
                  className="font-display text-2xl font-medium"
                  style={{ color: colors.terracotta }}
                >
                  {formatPrice(service.price_cents)}
                </div>
              </div>
              <Link
                href={`/portal/${slug}/book?service=${service.id}`}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                style={{ backgroundColor: colors.terracotta, color: colors.ivory }}
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
          className="rounded-2xl p-12 text-center"
          style={{ backgroundColor: colors.linen }}
        >
          <Moon className="w-12 h-12 mx-auto mb-4" style={{ color: colors.warmGray }} />
          <p style={{ color: colors.textLight }}>
            {selectedCategory === 'all'
              ? 'Services are being prepared for you'
              : `No services in ${selectedCategory} category`}
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
        <p className="mb-4" style={{ color: colors.textLight }}>
          Not sure which offering is right for you?
        </p>
        <Link
          href={`/portal/${slug}/about`}
          className="inline-flex items-center space-x-2 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: colors.terracotta }}
        >
          <span>Learn more about my approach</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
