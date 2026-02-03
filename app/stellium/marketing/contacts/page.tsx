"use client";

/**
 * MARKETING CONTACTS PAGE
 *
 * Lead and prospect management
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
  Tag,
  TrendingUp,
} from 'lucide-react';
import ContactCard from '@/components/stellium/ContactCard';
import { MarketingContact, ContactStatus, ContactSource } from '@/lib/stellium/marketing';
import { usePractitionerContext } from '@/lib/auth/practitionerAuth';

export default function ContactsPage() {
  const router = useRouter();
  const { practitionerId, isLoading: authLoading } = usePractitionerContext();

  const [contacts, setContacts] = useState<MarketingContact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<ContactSource | ''>('');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'lead_score' | 'last_email_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (practitionerId) {
      fetchContacts();
    }
  }, [practitionerId, search, statusFilter, sourceFilter, sortBy, sortOrder, page]);

  const fetchContacts = async () => {
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
      if (sourceFilter) params.set('source', sourceFilter);

      const response = await fetch(`/api/stellium/marketing/contacts/list?${params}`);
      if (!response.ok) throw new Error('Failed to fetch contacts');

      const data = await response.json();
      setContacts(data.contacts);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const statuses: { value: ContactStatus | ''; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'lead', label: 'Lead' },
    { value: 'engaged', label: 'Engaged' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'opportunity', label: 'Opportunity' },
    { value: 'converted', label: 'Converted' },
    { value: 'unsubscribed', label: 'Unsubscribed' },
  ];

  const sources: { value: ContactSource | ''; label: string }[] = [
    { value: '', label: 'All Sources' },
    { value: 'organic', label: 'Organic' },
    { value: 'referral', label: 'Referral' },
    { value: 'lead_magnet', label: 'Lead Magnet' },
    { value: 'ad', label: 'Ad' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'social', label: 'Social' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-gray-100">Contacts</h1>
          <p className="text-gray-500">
            {total} contact{total !== 1 ? 's' : ''} in your funnel
          </p>
        </div>
        <button
          onClick={() => router.push('/stellium/marketing/contacts/new')}
          className="flex items-center space-x-2 px-4 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Contact</span>
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
                showFilters || statusFilter || sourceFilter
                  ? 'bg-sacred-gold/10 border-sacred-gold/30 text-sacred-gold'
                  : 'border-gray-700 text-gray-400 hover:text-gray-200'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {(statusFilter || sourceFilter) && (
                <span className="px-2 py-0.5 bg-sacred-gold/20 rounded-full text-xs">
                  {[statusFilter, sourceFilter].filter(Boolean).length}
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
                    setStatusFilter(e.target.value as ContactStatus | '');
                    setPage(0);
                  }}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
                >
                  {statuses.map(s => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Filter */}
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Source</label>
                <select
                  value={sourceFilter}
                  onChange={e => {
                    setSourceFilter(e.target.value as ContactSource | '');
                    setPage(0);
                  }}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
                >
                  {sources.map(s => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
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
                  <option value="created_at">Date Added</option>
                  <option value="lead_score">Lead Score</option>
                  <option value="last_email_at">Last Email</option>
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
              {(statusFilter || sourceFilter) && (
                <button
                  onClick={() => {
                    setStatusFilter('');
                    setSourceFilter('');
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

      {/* Contact List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-sacred-gold/50 animate-spin" />
        </div>
      ) : error ? (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-6 text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchContacts}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      ) : contacts.length === 0 ? (
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg text-gray-300 mb-2">
              {search || statusFilter || sourceFilter ? 'No contacts found' : 'No contacts yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {search || statusFilter || sourceFilter
                ? 'Try adjusting your filters'
                : 'Create a lead magnet to start capturing leads'}
            </p>
            {!search && !statusFilter && !sourceFilter && (
              <button
                onClick={() => router.push('/stellium/marketing/lead-magnets/new')}
                className="px-4 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg"
              >
                Create Lead Magnet
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {contacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ContactCard
                  contact={contact}
                  onClick={() => router.push(`/stellium/marketing/contacts/${contact.id}`)}
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
