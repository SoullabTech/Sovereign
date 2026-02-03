"use client";

/**
 * STELLIUM CLIENTS PAGE
 *
 * Client management - the heart of the relational practice
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users,
  Plus,
  Search,
  Filter,
  X,
  Loader2,
} from 'lucide-react';
import ClientCard from '@/components/stellium/ClientCard';
import { PractitionerClient } from '@/lib/stellium/types';
import { usePractitionerContext } from '@/lib/auth/practitionerAuth';

export default function ClientsPage() {
  const router = useRouter();
  const { practitionerId, isLoading: authLoading } = usePractitionerContext();

  const [clients, setClients] = useState<PractitionerClient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'last_session' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (practitionerId) {
      fetchClients();
    }
  }, [practitionerId, search, statusFilter, sortBy, sortOrder, page]);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        practitionerId: practitionerId!,
        limit: limit.toString(),
        offset: (page * limit).toString(),
        sortBy,
        sortOrder,
      });

      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/stellium/clients/list?${params}`);
      if (!response.ok) throw new Error('Failed to fetch clients');

      const data = await response.json();
      setClients(data.clients);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-gray-100">Clients</h1>
          <p className="text-gray-500">
            {total} client{total !== 1 ? 's' : ''} in your practice
          </p>
        </div>
        <button
          onClick={() => router.push('/stellium/clients/new')}
          className="flex items-center space-x-2 px-4 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search & Filters */}
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:border-sacred-gold/50 focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters || statusFilter
                  ? 'bg-sacred-gold/10 border-sacred-gold/30 text-sacred-gold'
                  : 'border-gray-700 text-gray-400 hover:text-gray-200'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {statusFilter && (
                <span className="px-2 py-0.5 bg-sacred-gold/20 rounded-full text-xs">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-800"
            >
              {/* Status Filter */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Status</label>
                <select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="waitlist">Waitlist</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Sort By</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
                >
                  <option value="name">Name</option>
                  <option value="last_session">Last Session</option>
                  <option value="created_at">Date Added</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Order</label>
                <select
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value as typeof sortOrder)}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              {/* Clear Filters */}
              {statusFilter && (
                <button
                  onClick={() => {
                    setStatusFilter('');
                    setPage(0);
                  }}
                  className="self-end px-3 py-2 text-sm text-gray-400 hover:text-gray-200"
                >
                  Clear filters
                </button>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Client List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-sacred-gold/50 animate-spin" />
        </div>
      ) : error ? (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-6 text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchClients}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      ) : clients.length === 0 ? (
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg text-gray-300 mb-2">
              {search || statusFilter ? 'No clients found' : 'No clients yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {search || statusFilter
                ? 'Try adjusting your filters'
                : 'Add your first client to get started'}
            </p>
            {!search && !statusFilter && (
              <button
                onClick={() => router.push('/stellium/clients/new')}
                className="px-4 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg"
              >
                Add Client
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {clients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ClientCard
                  client={client}
                  onClick={() => router.push(`/stellium/clients/${client.id}`)}
                />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
