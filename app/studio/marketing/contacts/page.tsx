'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Filter,
  X,
  Tag,
  TrendingUp,
  Mail,
  Phone,
  Calendar,
  Star,
  UserCheck,
} from 'lucide-react';

type ContactStatus = 'lead' | 'engaged' | 'qualified' | 'opportunity' | 'converted' | 'unsubscribed';
type ContactSource = 'organic' | 'referral' | 'lead_magnet' | 'ad' | 'webinar' | 'social';

interface Contact {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  status: ContactStatus;
  source: ContactSource;
  lead_score: number;
  tags: string[];
  emails_received: number;
  emails_opened: number;
  last_email_at?: string;
  created_at: string;
}

// Mock contacts data
const mockContacts: Contact[] = [
  {
    id: '1',
    email: 'sarah.chen@example.com',
    first_name: 'Sarah',
    last_name: 'Chen',
    status: 'qualified',
    source: 'lead_magnet',
    lead_score: 85,
    tags: ['birth chart', 'coaching interested'],
    emails_received: 12,
    emails_opened: 9,
    last_email_at: '2026-01-30',
    created_at: '2025-12-15',
  },
  {
    id: '2',
    email: 'marcus.johnson@example.com',
    first_name: 'Marcus',
    last_name: 'Johnson',
    phone: '+1 (555) 234-5678',
    status: 'engaged',
    source: 'referral',
    lead_score: 72,
    tags: ['transits', 'newsletter'],
    emails_received: 8,
    emails_opened: 6,
    last_email_at: '2026-01-28',
    created_at: '2026-01-05',
  },
  {
    id: '3',
    email: 'emma.wilson@example.com',
    first_name: 'Emma',
    status: 'lead',
    source: 'organic',
    lead_score: 45,
    tags: ['new'],
    emails_received: 3,
    emails_opened: 2,
    last_email_at: '2026-01-25',
    created_at: '2026-01-20',
  },
  {
    id: '4',
    email: 'james.miller@example.com',
    first_name: 'James',
    last_name: 'Miller',
    status: 'opportunity',
    source: 'webinar',
    lead_score: 92,
    tags: ['high intent', 'session booked'],
    emails_received: 15,
    emails_opened: 14,
    last_email_at: '2026-02-01',
    created_at: '2025-11-10',
  },
  {
    id: '5',
    email: 'lisa.davis@example.com',
    first_name: 'Lisa',
    last_name: 'Davis',
    status: 'converted',
    source: 'lead_magnet',
    lead_score: 100,
    tags: ['client', 'returning'],
    emails_received: 20,
    emails_opened: 18,
    last_email_at: '2026-01-31',
    created_at: '2025-09-01',
  },
];

const statusColors: Record<ContactStatus, { bg: string; text: string }> = {
  lead: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  engaged: { bg: 'bg-purple-500/20', text: 'text-purple-300' },
  qualified: { bg: 'bg-amber-500/20', text: 'text-amber-300' },
  opportunity: { bg: 'bg-orange-500/20', text: 'text-orange-300' },
  converted: { bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
  unsubscribed: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
};

const sourceIcons: Record<ContactSource, React.ReactNode> = {
  lead_magnet: <Star className="w-3 h-3" />,
  referral: <UserCheck className="w-3 h-3" />,
  organic: <TrendingUp className="w-3 h-3" />,
  ad: <TrendingUp className="w-3 h-3" />,
  webinar: <TrendingUp className="w-3 h-3" />,
  social: <TrendingUp className="w-3 h-3" />,
};

export default function ContactsPage() {
  const router = useRouter();
  const [contacts] = useState<Contact[]>(mockContacts);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContactStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<ContactSource | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !search ||
      contact.email.toLowerCase().includes(search.toLowerCase()) ||
      contact.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      contact.last_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || contact.status === statusFilter;
    const matchesSource = !sourceFilter || contact.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

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

  const formatDate = (date?: string) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            Contacts
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} in your funnel
          </p>
        </div>
        <button
          onClick={() => router.push('/studio/marketing/contacts/new')}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters || statusFilter || sourceFilter
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {(statusFilter || sourceFilter) && (
              <span className="px-2 py-0.5 bg-amber-500/20 rounded-full text-xs">
                {[statusFilter, sourceFilter].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-800"
            >
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Status</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as ContactStatus | '')}
                  className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 focus:border-amber-500/50 focus:outline-none"
                >
                  {statuses.map(s => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500">Source</label>
                <select
                  value={sourceFilter}
                  onChange={e => setSourceFilter(e.target.value as ContactSource | '')}
                  className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 focus:border-amber-500/50 focus:outline-none"
                >
                  {sources.map(s => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {(statusFilter || sourceFilter) && (
                <button
                  onClick={() => {
                    setStatusFilter('');
                    setSourceFilter('');
                  }}
                  className="self-end px-3 py-2 text-sm text-slate-400 hover:text-slate-200"
                >
                  Clear filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contact Grid */}
      {filteredContacts.length === 0 ? (
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-12 text-center">
          <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg text-slate-300 mb-2">
            {search || statusFilter || sourceFilter ? 'No contacts found' : 'No contacts yet'}
          </h3>
          <p className="text-slate-500 mb-6">
            {search || statusFilter || sourceFilter
              ? 'Try adjusting your filters'
              : 'Create a lead magnet to start capturing leads'}
          </p>
          {!search && !statusFilter && !sourceFilter && (
            <button
              onClick={() => router.push('/studio/marketing/lead-magnets/new')}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg"
            >
              Create Lead Magnet
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredContacts.map((contact, index) => {
            const status = statusColors[contact.status];
            const name = contact.first_name
              ? `${contact.first_name}${contact.last_name ? ' ' + contact.last_name : ''}`
              : contact.email.split('@')[0];

            return (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(`/studio/marketing/contacts/${contact.id}`)}
                className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 cursor-pointer hover:border-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-slate-200 font-medium truncate">{name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${status.bg} ${status.text}`}>
                        {contact.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-1 text-sm text-slate-400">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{contact.email}</span>
                    </div>

                    {contact.phone && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-slate-500">
                        <Phone className="w-3 h-3" />
                        <span>{contact.phone}</span>
                      </div>
                    )}

                    {contact.tags.length > 0 && (
                      <div className="flex items-center flex-wrap gap-1 mt-2">
                        <Tag className="w-3 h-3 text-slate-600" />
                        {contact.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 bg-slate-800/50 text-slate-400 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {contact.tags.length > 3 && (
                          <span className="text-xs text-slate-600">
                            +{contact.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-400 font-medium">{contact.lead_score}</span>
                    </div>
                    <span className="text-xs text-slate-600">score</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      {sourceIcons[contact.source]}
                      <span className="capitalize">{contact.source.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span>{contact.emails_received} sent</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <Calendar className="w-3 h-3" />
                    <span>Last: {formatDate(contact.last_email_at)}</span>
                  </div>
                </div>

                {contact.emails_received > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500/60 rounded-full"
                        style={{
                          width: `${Math.min((contact.emails_opened / contact.emails_received) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">
                      {Math.round((contact.emails_opened / contact.emails_received) * 100)}% open
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
