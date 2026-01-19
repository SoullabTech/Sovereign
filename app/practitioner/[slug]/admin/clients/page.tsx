"use client";

/**
 * CLIENT LIST PAGE
 *
 * View and manage all clients with search, filters, and tags
 * The heart of the practitioner CRM
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Users,
  Star,
  ChevronDown,
  X,
  AlertCircle,
} from 'lucide-react';
import { usePractitionerAuth } from '@/lib/auth/practitionerAuth';
import { ClientCard } from '@/components/admin/ClientCard';
import type { PractitionerClient } from '@/lib/stellium/types';

const colors = {
  void: '#0D0B14',
  cosmos: '#1A1625',
  nebula: '#251F33',
  stardust: '#2D2640',
  gold: '#E5C158',
  violet: '#B8A5D9',
  starlight: '#FFFFFF',
  muted: '#C8BDE0',
  dim: '#9A8FB8',
  success: '#8FB89A',
  warning: '#E5A858',
  error: '#D98B8B',
};

const statusOptions = [
  { value: 'all', label: 'All Clients' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'waitlist', label: 'Waitlist' },
  { value: 'archived', label: 'Archived' },
];

export default function ClientsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { practitionerId } = usePractitionerAuth();

  const [clients, setClients] = useState<PractitionerClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // All unique tags from clients
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    clients.forEach(client => {
      client.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [clients]);

  useEffect(() => {
    if (practitionerId) {
      fetchClients();
    }
  }, [practitionerId]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/stellium/clients/list?practitionerId=${practitionerId}`);
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data.clients || []);
    } catch (err) {
      console.error('[Clients] Error:', err);
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          client.name.toLowerCase().includes(query) ||
          client.preferred_name?.toLowerCase().includes(query) ||
          client.email?.toLowerCase().includes(query) ||
          client.phone?.includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && client.status !== statusFilter) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const clientTags = client.tags || [];
        if (!selectedTags.some(tag => clientTags.includes(tag))) {
          return false;
        }
      }

      return true;
    });
  }, [clients, searchQuery, statusFilter, selectedTags]);

  const basePath = `/practitioner/${slug}/admin`;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 rounded-lg animate-pulse" style={{ backgroundColor: `${colors.nebula}50` }} />
        <div className="h-12 rounded-lg animate-pulse" style={{ backgroundColor: `${colors.nebula}50` }} />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: `${colors.nebula}50` }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ backgroundColor: `${colors.error}20`, border: `1px solid ${colors.error}40` }}
      >
        <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: colors.error }} />
        <p style={{ color: colors.error }}>{error}</p>
        <button
          onClick={fetchClients}
          className="mt-4 px-4 py-2 rounded-lg"
          style={{ backgroundColor: colors.gold, color: colors.void }}
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
          <h1
            className="text-2xl lg:text-3xl font-display flex items-center space-x-3"
            style={{ color: colors.starlight }}
          >
            <Users className="w-7 h-7" style={{ color: colors.gold }} />
            <span>Clients</span>
          </h1>
          <p className="mt-1" style={{ color: colors.muted }}>
            {clients.length} total clients · {filteredClients.length} shown
          </p>
        </div>
        <button
          onClick={() => router.push(`${basePath}/clients/new`)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-colors"
          style={{ backgroundColor: colors.gold, color: colors.void }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: colors.dim }}
            />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                backgroundColor: colors.nebula,
                color: colors.starlight,
                border: `1px solid ${colors.stardust}`,
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4" style={{ color: colors.dim }} />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 rounded-xl transition-colors"
            style={{
              backgroundColor: showFilters ? `${colors.gold}20` : colors.nebula,
              color: showFilters ? colors.gold : colors.muted,
              border: `1px solid ${showFilters ? colors.gold : colors.stardust}40`,
            }}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filters</span>
            {(statusFilter !== 'all' || selectedTags.length > 0) && (
              <span
                className="w-5 h-5 rounded-full text-xs flex items-center justify-center"
                style={{ backgroundColor: colors.gold, color: colors.void }}
              >
                {(statusFilter !== 'all' ? 1 : 0) + selectedTags.length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="p-4 rounded-xl space-y-4"
                style={{ backgroundColor: colors.nebula, border: `1px solid ${colors.stardust}` }}
              >
                {/* Status Filter */}
                <div>
                  <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: colors.dim }}>
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setStatusFilter(option.value)}
                        className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                        style={{
                          backgroundColor: statusFilter === option.value ? `${colors.gold}20` : 'transparent',
                          color: statusFilter === option.value ? colors.gold : colors.muted,
                          border: `1px solid ${statusFilter === option.value ? colors.gold : colors.stardust}40`,
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags Filter */}
                {allTags.length > 0 && (
                  <div>
                    <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: colors.dim }}>
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => {
                            setSelectedTags(prev =>
                              prev.includes(tag)
                                ? prev.filter(t => t !== tag)
                                : [...prev, tag]
                            );
                          }}
                          className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                          style={{
                            backgroundColor: selectedTags.includes(tag) ? `${colors.violet}20` : 'transparent',
                            color: selectedTags.includes(tag) ? colors.violet : colors.muted,
                            border: `1px solid ${selectedTags.includes(tag) ? colors.violet : colors.stardust}40`,
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clear Filters */}
                {(statusFilter !== 'all' || selectedTags.length > 0) && (
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setSelectedTags([]);
                    }}
                    className="text-sm"
                    style={{ color: colors.dim }}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Client List */}
      {filteredClients.length > 0 ? (
        <div className="space-y-3">
          {filteredClients.map((client, index) => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => router.push(`${basePath}/clients/${client.id}`)}
              delay={index}
            />
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl p-12 text-center"
          style={{ backgroundColor: `${colors.nebula}50`, border: `1px solid ${colors.stardust}` }}
        >
          <Users className="w-12 h-12 mx-auto mb-4" style={{ color: colors.dim }} />
          <p className="text-lg mb-2" style={{ color: colors.muted }}>
            {clients.length === 0 ? 'No clients yet' : 'No clients match your filters'}
          </p>
          <p className="text-sm mb-6" style={{ color: colors.dim }}>
            {clients.length === 0
              ? 'Add your first client to get started'
              : 'Try adjusting your search or filters'
            }
          </p>
          {clients.length === 0 && (
            <button
              onClick={() => router.push(`${basePath}/clients/new`)}
              className="px-6 py-3 rounded-lg font-medium"
              style={{ backgroundColor: colors.gold, color: colors.void }}
            >
              Add Your First Client
            </button>
          )}
        </div>
      )}
    </div>
  );
}
