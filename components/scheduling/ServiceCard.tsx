'use client';

import { Clock, MapPin, DollarSign } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price_cents: number;
  category?: string;
}

interface ServiceCardProps {
  service: Service;
  onSelect: (serviceId: string) => void;
}

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  const priceDisplay = service.price_cents > 0
    ? `$${(service.price_cents / 100).toFixed(0)}`
    : 'Free';

  return (
    <button
      onClick={() => onSelect(service.id)}
      className="w-full text-left p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-amber-400 dark:hover:border-amber-500 bg-white dark:bg-neutral-900 transition-colors group"
    >
      <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400">
        {service.name}
      </h3>

      {service.description && (
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
          {service.description}
        </p>
      )}

      <div className="mt-4 flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {service.duration_minutes} min
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          {priceDisplay}
        </span>
        {service.category && (
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {service.category}
          </span>
        )}
      </div>
    </button>
  );
}
