'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ServiceCard } from '@/components/scheduling/ServiceCard';
import { ArrowLeft } from 'lucide-react';

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
}

export default function BookPractitionerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [practitioner, setPractitioner] = useState<PractitionerInfo | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch practitioner config + services in parallel
        const [configRes, servicesRes] = await Promise.all([
          fetch(`/api/portal/${slug}/config`),
          fetch(`/api/portal/${slug}/services`),
        ]);

        if (!configRes.ok || !servicesRes.ok) {
          setError(configRes.status === 404 ? 'Practitioner not found' : 'Failed to load booking page');
          return;
        }

        const configData = await configRes.json();
        const servicesData = await servicesRes.json();

        setPractitioner({
          name: configData.practitioner_name || configData.name,
          slug,
          businessName: configData.business_name,
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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="animate-pulse text-neutral-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <p className="text-neutral-500 dark:text-neutral-400">{error}</p>
          <a href="/" className="text-amber-500 hover:text-amber-600 mt-4 inline-block text-sm">
            Go home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {practitioner?.businessName || practitioner?.name}
          </h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            Choose a session to book
          </p>
        </div>

        {/* Services list */}
        {services.length === 0 ? (
          <p className="text-center text-neutral-500 dark:text-neutral-400">
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
