'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ServiceCard } from '@/components/scheduling/ServiceCard';

interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_cents: number;
  category: string;
}

interface PractitionerInfo {
  name: string;
  slug: string;
  businessName?: string;
  tagline?: string;
  bio?: string;
  photoUrl?: string;
}

export default function BookPractitionerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug ?? '') as string;

  const [practitioner, setPractitioner] = useState<PractitionerInfo | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [configRes, servicesRes] = await Promise.all([
          fetch(`/api/portal/${slug}/config`),
          fetch(`/api/portal/${slug}/services`),
        ]);

        if (!configRes.ok || !servicesRes.ok) {
          setError(configRes.status === 404 ? 'Practitioner not found' : 'Failed to load booking page');
          return;
        }

        const configRaw = await configRes.json();
        const servicesData = await servicesRes.json();

        const configData = configRaw?.data?.config || configRaw;

        setPractitioner({
          name: configData.practitioner_name || configData.name,
          slug,
          businessName: configData.business_name || configData.brand?.name,
          tagline: configData.tagline || configData.brand?.tagline,
          bio: configData.bio,
          photoUrl: configData.photo_url,
        });
        setServices(servicesData.services || []);
      } catch {
        setError('Failed to load booking page');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleSelectService = (serviceId: string) => {
    router.push(`/book/${slug}/${serviceId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="w-5 h-5 border-2 border-neutral-200 dark:border-neutral-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-center">
          <p className="text-neutral-500 dark:text-neutral-400">{error}</p>
          <a href="/" className="text-amber-500 hover:text-amber-600 mt-4 inline-block text-sm">
            Go home
          </a>
        </div>
      </div>
    );
  }

  const displayName = practitioner?.businessName || practitioner?.name;
  const initial = (practitioner?.name || '?')[0].toUpperCase();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Practitioner header */}
        <div className="text-center mb-10">
          {/* Avatar */}
          {practitioner?.photoUrl ? (
            <img
              src={practitioner.photoUrl}
              alt={practitioner.name}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-semibold text-amber-700 dark:text-amber-300">
                {initial}
              </span>
            </div>
          )}

          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {displayName}
          </h1>

          {practitioner?.tagline && (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {practitioner.tagline}
            </p>
          )}

          {practitioner?.bio && (
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
              {practitioner.bio}
            </p>
          )}
        </div>

        {/* Section label */}
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-4 uppercase tracking-wider">
          Choose a session to book
        </p>

        {/* Services list */}
        {services.length === 0 ? (
          <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">
            No sessions are currently available for booking.
          </p>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onSelect={handleSelectService}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
