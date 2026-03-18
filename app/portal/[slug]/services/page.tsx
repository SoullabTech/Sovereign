'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_cents: number;
  is_featured: boolean;
  featured: boolean;
}

export default function PortalServicesPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [services, setServices] = useState<Service[]>([]);
  const [practitionerName, setPractitionerName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      fetch(`/api/portal/${slug}/services`),
      fetch(`/api/portal/${slug}/home`),
    ])
      .then(async ([sRes, hRes]) => {
        if (sRes.ok) {
          const d = await sRes.json();
          setServices(d.services || []);
        }
        if (hRes.ok) {
          const d = await hRes.json();
          const name = d.profile?.brand?.name || d.profile?.name || '';
          setPractitionerName(name);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090F] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090F] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Back */}
        <div className="mb-10">
          <Link
            href={`/portal/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={15} />
            {practitionerName || 'Back'}
          </Link>
        </div>

        {/* Header */}
        <motion.div
          initial={{ y: 12 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <h1 className="text-2xl font-semibold text-white mb-1">Sessions & Services</h1>
          <p className="text-sm text-zinc-500">Select a session to see availability and book.</p>
        </motion.div>

        {/* Services */}
        {services.length === 0 ? (
          <div className="text-center py-20">
            <Package size={32} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No services listed yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="group flex flex-col sm:flex-row sm:items-center gap-5 p-6 rounded-xl
                           bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h2 className="text-base font-medium text-white">{service.name}</h2>
                    {(service.featured || service.is_featured) && (
                      <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-zinc-400 leading-relaxed mb-3">{service.description}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-zinc-600">
                    <Clock size={12} />
                    {service.duration_minutes} min
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2 flex-shrink-0">
                  <span className="text-lg font-semibold text-white">
                    ${(service.price_cents / 100).toFixed(0)}
                  </span>
                  <Link
                    href={`/portal/${slug}/book?service=${service.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-zinc-900
                               text-sm font-medium hover:bg-zinc-100 transition-colors"
                  >
                    Book
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-12 p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 text-center">
          <h3 className="text-sm font-medium text-white mb-1">Not sure where to start?</h3>
          <p className="text-sm text-zinc-500 mb-4">Send a message and get help choosing the right session.</p>
          <Link
            href={`/portal/${slug}/chat`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800 text-zinc-300
                       text-sm font-medium hover:bg-zinc-700 hover:text-white transition-colors border border-zinc-700"
          >
            Send a message
          </Link>
        </div>

      </div>
    </div>
  );
}
