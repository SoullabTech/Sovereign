'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, Sparkles, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_cents: number;
  is_featured: boolean;
}

interface PortalConfig {
  profile: {
    name: string;
    slug: string;
    brand: {
      name: string;
    };
  };
}

export default function PortalServicesPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<PortalConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [servicesRes, configRes] = await Promise.all([
          fetch(`/api/portal/${slug}/services`),
          fetch(`/api/portal/${slug}/home`),
        ]);

        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServices(servicesData.services || []);
        }

        if (configRes.ok) {
          const configData = await configRes.json();
          setConfig(configData);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchData();
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

  const brandName = config?.profile?.brand?.name || config?.profile?.name || 'Portal';

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        background: 'linear-gradient(180deg, #0D0B14 0%, #1A1625 50%, #0D0B14 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href={`/portal/${slug}`}
            className="inline-flex items-center text-[#9D8EC7] hover:text-[#D4AF37] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {brandName}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-cinzel text-4xl md:text-5xl text-[#F5F0FF] mb-4">
              Services
            </h1>
            <p className="font-quicksand text-[#A89FC4] max-w-2xl mx-auto">
              Choose the reading that resonates with your journey. Each session is a sacred space
              for cosmic wisdom and personal growth.
            </p>
          </motion.div>
        </div>

        {/* Services List */}
        {services.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Star className="w-12 h-12 text-[#6B6280] mx-auto mb-4" />
            <p className="text-[#A89FC4]">No services available yet.</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 md:p-8 rounded-2xl bg-[#1A1625]/80 border border-[#3A3347]
                         hover:border-[#9D8EC7]/50 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="font-cinzel text-2xl text-[#F5F0FF] group-hover:text-[#D4AF37] transition-colors">
                        {service.name}
                      </h2>
                      {service.is_featured && (
                        <span className="px-3 py-1 rounded-full text-xs font-quicksand
                                       bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="font-quicksand text-[#A89FC4] mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[#6B6280]">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.duration_minutes} minutes
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <span className="font-cinzel text-3xl text-[#E8B4CB]">
                        ${(service.price_cents / 100).toFixed(0)}
                      </span>
                    </div>
                    <Link
                      href={`/portal/${slug}/book?service=${service.id}`}
                      className="inline-flex items-center px-6 py-2.5 rounded-full
                               bg-gradient-to-r from-[#D4AF37] to-[#C9A962] text-[#0D0B14]
                               font-quicksand font-semibold hover:shadow-lg hover:shadow-[#D4AF37]/20
                               transition-all duration-300 hover:scale-105"
                    >
                      Book Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center p-8 rounded-2xl bg-[#251F33]/50 border border-[#3A3347]"
        >
          <h3 className="font-cinzel text-xl text-[#F5F0FF] mb-3">
            Not sure which reading is right for you?
          </h3>
          <p className="font-quicksand text-[#A89FC4] mb-6">
            Send a message and I&apos;ll help you find the perfect fit for your cosmic journey.
          </p>
          <Link
            href={`/portal/${slug}/chat`}
            className="inline-flex items-center px-6 py-3 rounded-full
                     border border-[#9D8EC7] text-[#F5F0FF]
                     font-quicksand hover:bg-[#251F33] transition-all duration-300"
          >
            Ask a Question
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
