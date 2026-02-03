"use client";

/**
 * CLIENT GRID
 *
 * Responsive grid layout for client cards
 * Each card shows mini chart preview, key placements, session count
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ClientCard } from './ClientCard';
import type { PractitionerClient } from '@/lib/stellium/types';

interface ClientGridProps {
  clients: PractitionerClient[];
  basePath: string;
}

export function ClientGrid({ clients, basePath }: ClientGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {clients.map((client, index) => (
        <motion.div
          key={client.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.05, 0.5) }}
        >
          <ClientCard
            client={client}
            basePath={basePath}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default ClientGrid;
