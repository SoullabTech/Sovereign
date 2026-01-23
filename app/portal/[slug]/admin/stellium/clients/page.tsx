"use client";

/**
 * CLIENT LIBRARY
 *
 * A calm, searchable view of all clients with charts
 * Filter by tags, sun signs, elements - find the client you need
 *
 * Design Philosophy:
 * - These are people, not data points
 * - Mini chart previews as visual anchors
 * - Quick access to full chart or session prep
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Plus, Users, Filter, X } from 'lucide-react';
import { usePractitionerAuth } from '@/lib/auth/practitionerAuth';
import { ClientGrid } from '@/components/admin/stellium/ClientGrid';
import { ClientFilters, type FilterState } from '@/components/admin/stellium/ClientFilters';
import type { PractitionerClient } from '@/lib/stellium/types';

const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  gold: '#E5C158',
  violet: '#B8A5D9',
  celestialBlue: '#79c0ff',
  starlight: '#FFFFFF',
  muted: '#C8BDE0',
  dim: '#9A8FB8',
};

// Elements mapping
const SIGN_ELEMENTS: Record<string, string> = {
  'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
  'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
  'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
  'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water',
};

export default function ClientLibraryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const basePath = `/portal/${slug}/admin/stellium`;

  const { practitionerId, isLoading: authLoading } = usePractitionerAuth();
  const [clients, setClients] = useState<PractitionerClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tags: [],
    sunSigns: [],
    elements: [],
    status: 'active',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!practitionerId) {
      setError('Please sign in to access client library');
      setLoading(false);
      return;
    }
    fetchClients();
  }, [practitionerId, authLoading]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/stellium/clients/list?practitionerId=${practitionerId}&limit=500&sortBy=name&sortOrder=asc`
      );
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data.clients || []);
    } catch (err) {
      console.error('[ClientLibrary] Error:', err);
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters client-side
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Status filter
      if (filters.status && filters.status !== 'all') {
        if (client.status !== filters.status) return false;
      }

      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const name = (client.preferred_name || client.name || '').toLowerCase();
        const email = (client.email || '').toLowerCase();
        if (!name.includes(search) && !email.includes(search)) return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const clientTags = client.tags || [];
        if (!filters.tags.some(tag => clientTags.includes(tag))) return false;
      }

      // Sun sign filter
      if (filters.sunSigns.length > 0) {
        const sunSign = client.key_placements?.sun_sign;
        if (!sunSign || !filters.sunSigns.includes(sunSign)) return false;
      }

      // Element filter
      if (filters.elements.length > 0) {
        const sunSign = client.key_placements?.sun_sign;
        const element = sunSign ? SIGN_ELEMENTS[sunSign] : null;
        if (!element || !filters.elements.includes(element)) return false;
      }

      return true;
    });
  }, [clients, filters]);

  // Extract available tags from clients
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    clients.forEach(c => {
      (c.tags || []).forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [clients]);

  // Extract available sun signs from clients
  const availableSunSigns = useMemo(() => {
    const signSet = new Set<string>();
    clients.forEach(c => {
      if (c.key_placements?.sun_sign) {
        signSet.add(c.key_placements.sun_sign);
      }
    });
    return Array.from(signSet).sort();
  }, [clients]);

  const hasActiveFilters = filters.tags.length > 0 ||
    filters.sunSigns.length > 0 ||
    filters.elements.length > 0 ||
    (filters.status && filters.status !== 'active');

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-48 rounded-xl" style={{ backgroundColor: `${colors.nebula}50` }} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
      >
        <Users className="w-10 h-10 mx-auto mb-3" style={{ color: colors.dim }} />
        <p style={{ color: colors.muted }}>{error}</p>
        <button
          onClick={fetchClients}
          className="mt-4 px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: colors.celestialBlue, color: colors.void }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium" style={{ color: colors.starlight }}>
            Client Library
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.dim }}>
            {filteredClients.length} of {clients.length} clients
          </p>
        </div>
        <button
          onClick={() => router.push(`${basePath}/clients/new`)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors"
          style={{
            backgroundColor: colors.celestialBlue,
            color: colors.void,
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex items-center space-x-3">
        {/* Search Input */}
        <div
          className="flex-1 flex items-center space-x-3 px-4 py-3 rounded-xl"
          style={{
            backgroundColor: `${colors.nebula}50`,
            border: `1px solid ${colors.stardust}`,
          }}
        >
          <Search className="w-4 h-4" style={{ color: colors.dim }} />
          <input
            type="text"
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search clients by name or email..."
            className="flex-1 bg-transparent text-sm outline-none placeholder-gray-500"
            style={{ color: colors.starlight }}
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: '' })}
              className="p-1 rounded hover:bg-white/5"
              style={{ color: colors.dim }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-3 rounded-xl transition-colors"
          style={{
            backgroundColor: showFilters || hasActiveFilters ? `${colors.celestialBlue}20` : `${colors.nebula}50`,
            border: `1px solid ${showFilters || hasActiveFilters ? colors.celestialBlue : colors.stardust}`,
            color: showFilters || hasActiveFilters ? colors.celestialBlue : colors.muted,
          }}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filters</span>
          {hasActiveFilters && (
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: colors.celestialBlue }}
            />
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <ClientFilters
            filters={filters}
            onChange={setFilters}
            availableTags={availableTags}
            availableSunSigns={availableSunSigns}
          />
        </motion.div>
      )}

      {/* Client Grid */}
      {filteredClients.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            backgroundColor: `${colors.nebula}30`,
            border: `1px solid ${colors.stardust}`,
          }}
        >
          <Users className="w-12 h-12 mx-auto mb-4" style={{ color: colors.dim }} />
          {clients.length === 0 ? (
            <>
              <p className="text-lg mb-2" style={{ color: colors.muted }}>
                No clients yet
              </p>
              <p className="text-sm mb-4" style={{ color: colors.dim }}>
                Add your first client to begin building your practice
              </p>
              <button
                onClick={() => router.push(`${basePath}/clients/new`)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ backgroundColor: colors.celestialBlue, color: colors.void }}
              >
                Add First Client
              </button>
            </>
          ) : (
            <>
              <p className="text-lg mb-2" style={{ color: colors.muted }}>
                No clients match your filters
              </p>
              <button
                onClick={() => setFilters({
                  search: '',
                  tags: [],
                  sunSigns: [],
                  elements: [],
                  status: 'active',
                })}
                className="text-sm"
                style={{ color: colors.celestialBlue }}
              >
                Clear all filters
              </button>
            </>
          )}
        </div>
      ) : (
        <ClientGrid
          clients={filteredClients}
          basePath={basePath}
        />
      )}
    </div>
  );
}
