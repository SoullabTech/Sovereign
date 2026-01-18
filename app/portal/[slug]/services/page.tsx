"use client";

/**
 * PRACTITIONER SERVICES PAGE
 *
 * Full list of services/offerings
 */

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Clock,
  Calendar,
  Star,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

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

interface PortalConfig {
  brand: {
    accent_color: string;
  };
}

export default function ServicesPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<PortalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchServices();
  }, [slug]);

  const fetchServices = async () => {
    try {
      const [servicesRes, configRes] = await Promise.all([
        fetch(`/api/portal/${slug}/services`),
        fetch(`/api/portal/${slug}/config`),
      ]);

      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data.services || []);
      }

      if (configRes.ok) {
        const data = await configRes.json();
        setConfig(data.config);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  const accentColor = config?.brand?.accent_color || '#D4AF37';

  const categories = ['all', ...new Set(services.map(s => s.category).filter(Boolean))];

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-sacred-gold/30 border-t-sacred-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-light text-gray-100 mb-4"
        >
          Services & Offerings
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 max-w-2xl mx-auto"
        >
          Choose the experience that resonates with where you are on your journey
        </motion.p>
      </div>

      {/* Category Filter */}
      {categories.length > 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                selectedCategory === category
                  ? 'text-gray-900'
                  : 'text-gray-400 hover:text-gray-200 border border-gray-700'
              }`}
              style={
                selectedCategory === category
                  ? { backgroundColor: accentColor }
                  : undefined
              }
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
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20 hover:border-gray-600/50 transition-all h-full">
              <CardContent className="p-6 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl text-gray-200 font-medium mb-1">
                      {service.name}
                    </h3>
                    {service.category && (
                      <span className="text-xs text-gray-500 capitalize">
                        {service.category}
                      </span>
                    )}
                  </div>
                  {service.featured && (
                    <span
                      className="flex items-center space-x-1 px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: `${accentColor}20`,
                        color: accentColor,
                      }}
                    >
                      <Star className="w-3 h-3" />
                      <span>Popular</span>
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4">
                  {service.long_description || service.description}
                </p>

                {/* Includes */}
                {service.includes && service.includes.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      Includes
                    </div>
                    <ul className="space-y-1">
                      {service.includes.map((item, i) => (
                        <li key={i} className="flex items-start space-x-2 text-sm text-gray-400">
                          <CheckCircle2
                            className="w-4 h-4 mt-0.5 flex-shrink-0"
                            style={{ color: accentColor }}
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-gray-800 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration_minutes} min</span>
                    </div>
                    <div className="text-xl font-light" style={{ color: accentColor }}>
                      ${(service.price_cents / 100).toFixed(0)}
                    </div>
                  </div>
                  <Link
                    href={`/portal/${slug}/book?service=${service.id}`}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm text-gray-900 font-medium transition-all hover:scale-105"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Now</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">
              {selectedCategory === 'all'
                ? 'No services available yet'
                : `No services in ${selectedCategory} category`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center py-8"
      >
        <p className="text-gray-400 mb-4">
          Not sure which service is right for you?
        </p>
        <Link
          href={`/portal/${slug}/about`}
          className="inline-flex items-center space-x-2 text-sm hover:text-white transition-colors"
          style={{ color: accentColor }}
        >
          <span>Learn more about my approach</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}
