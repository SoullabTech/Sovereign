'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Calendar,
  Clock,
  Mail,
  Phone,
  MoreHorizontal,
  MessageSquare,
  Download,
  X,
  Loader2,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';

interface Client {
  id: string;
  practitionerId: string;
  email: string;
  name: string;
  birthData?: {
    date?: string;
    time?: string;
    location?: string;
  };
  status: 'invited' | 'active' | 'paused' | 'archived';
  tier: 'free' | 'subscriber' | 'vip';
  tags: string[];
  firstSessionAt?: string;
  lastSessionAt?: string;
  totalSessions: number;
  totalAiConversations: number;
  keyPlacements?: Record<string, string>;
  totalRevenue?: number;
  nextSession?: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  invited: { label: 'Invited', color: 'blue' },
  active: { label: 'Active', color: 'emerald' },
  paused: { label: 'Paused', color: 'amber' },
  archived: { label: 'Archived', color: 'slate' },
};

const tierConfig = {
  free: { label: 'Free', color: 'slate' },
  subscriber: { label: 'Subscriber', color: 'purple' },
  vip: { label: 'VIP', color: 'amber' },
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch clients
  useEffect(() => {
    async function fetchClients() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (searchQuery) params.set('search', searchQuery);

        const res = await apiFetch(`/api/studio/clients?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients || []);
        }
      } catch (err) {
        console.error('Failed to fetch clients:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, [statusFilter, searchQuery]);

  const activeCount = clients.filter(c => c.status === 'active').length;

  const createClient = async (clientData: Partial<Client>) => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/studio/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });

      if (res.ok) {
        const data = await res.json();
        setClients([data.client, ...clients]);
        setShowNewClientModal(false);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create client');
      }
    } catch (err) {
      console.error('Failed to create client:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatLastSession = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const formatNextSession = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-purple-400" />
            Clients
          </h1>
          <p className="text-slate-400 mt-1">
            {activeCount} active relationships
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/studio/clients/import"
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Import
          </Link>
          <button
            onClick={() => setShowNewClientModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-maia-navy-700 text-white rounded-lg hover:bg-maia-navy-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 mb-6">
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-maia-navy-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {['all', 'active', 'invited', 'paused', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg text-sm transition-colors ${
                statusFilter === status
                  ? 'bg-maia-navy-700/20 text-maia-gold'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Client Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {clients.map((client) => {
                const status = statusConfig[client.status];
                const tier = tierConfig[client.tier];

                return (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors cursor-pointer group focus-within:ring-2 focus-within:ring-amber-400/60"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                          {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          {/* Stretched link: the anchor lives on the name (so it is
                              keyboard-focusable and activates with Enter) while its
                              ::after overlays the whole card as the click target.
                              A wrapping <Link> is not usable here — the card already
                              contains a mailto <a> and the Schedule <Link>, and nesting
                              anchors is invalid. Interactive children are raised above
                              the overlay with relative z-10. */}
                          <h3 className="text-white font-medium">
                            <Link
                              href={`/studio/clients/${client.id}`}
                              className="rounded after:absolute after:inset-0 after:content-[''] hover:text-amber-300 transition-colors focus:outline-none"
                            >
                              {client.name}
                            </Link>
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`
                              px-2 py-0.5 text-xs rounded-full
                              ${status.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                              ${status.color === 'amber' ? 'bg-amber-500/20 text-amber-400' : ''}
                              ${status.color === 'blue' ? 'bg-blue-500/20 text-blue-400' : ''}
                              ${status.color === 'slate' ? 'bg-slate-700 text-slate-400' : ''}
                            `}>
                              {status.label}
                            </span>
                            {client.tier !== 'free' && (
                              <span className={`
                                px-2 py-0.5 text-xs rounded-full
                                ${tier.color === 'purple' ? 'bg-purple-500/20 text-purple-400' : ''}
                                ${tier.color === 'amber' ? 'bg-amber-500/20 text-amber-400' : ''}
                              `}>
                                {tier.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-800 text-slate-400 transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      {client.birthData?.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span className="truncate">{client.birthData.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Session Info */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{client.totalSessions} sessions</span>
                      </div>
                      {client.lastSessionAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Last: {formatLastSession(client.lastSessionAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Revenue */}
                    {client.totalRevenue !== undefined && client.totalRevenue > 0 && (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 mb-4">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>${(client.totalRevenue / 100).toFixed(2)} total</span>
                      </div>
                    )}

                    {/* Next Session */}
                    {client.nextSession && (
                      <div className="p-2 bg-maia-navy-700/10 border border-maia-navy-700/20 rounded-lg mb-4">
                        <div className="flex items-center gap-2 text-sm text-maia-gold">
                          <Calendar className="w-4 h-4" />
                          <span>Next: {formatNextSession(client.nextSession)}</span>
                        </div>
                      </div>
                    )}

                    {/* Key Placements */}
                    {client.keyPlacements && Object.keys(client.keyPlacements).length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        {client.keyPlacements.sun_sign && (
                          <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded">
                            ☀️ {client.keyPlacements.sun_sign}
                          </span>
                        )}
                        {client.keyPlacements.moon_sign && (
                          <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded">
                            🌙 {client.keyPlacements.moon_sign}
                          </span>
                        )}
                        {client.keyPlacements.rising_sign && (
                          <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">
                            ⬆️ {client.keyPlacements.rising_sign}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {client.tags && client.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        {client.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
                      <a
                        href={`mailto:${client.email}`}
                        className="relative z-10 flex-1 flex items-center justify-center gap-2 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </a>
                      <Link
                        href={`/studio/sessions/new?clientId=${client.id}`}
                        className="relative z-10 flex-1 flex items-center justify-center gap-2 py-2 bg-maia-navy-700/20 text-maia-gold rounded-lg hover:bg-maia-navy-700/30 transition-colors text-sm"
                      >
                        <Calendar className="w-4 h-4" />
                        Schedule
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {clients.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <div className="text-lg">No clients found</div>
              <div className="text-sm mt-1">Add a client or import from your contacts</div>
            </div>
          )}
        </>
      )}

      {/* New Client Modal */}
      <AnimatePresence>
        {showNewClientModal && (
          <NewClientModal
            onClose={() => setShowNewClientModal(false)}
            onSubmit={createClient}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface NewClientModalProps {
  onClose: () => void;
  onSubmit: (client: Partial<Client>) => void;
  saving: boolean;
}

function NewClientModal({ onClose, onSubmit, saving }: NewClientModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthLocation, setBirthLocation] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<Client['status']>('invited');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const birthData = birthDate || birthTime || birthLocation
      ? {
          date: birthDate || undefined,
          time: birthTime || undefined,
          location: birthLocation.trim() || undefined,
        }
      : undefined;

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      status,
      tags,
      birthData,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg max-h-[90dvh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 shrink-0">
          <h2 className="text-lg font-semibold text-white">Add Client</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Client's full name"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-maia-navy-600"
              autoFocus
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="client@example.com"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-maia-navy-600"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-maia-navy-600"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as Client['status'])}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-maia-navy-600"
            >
              <option value="invited">Invited</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          {/* Birth Data Section */}
          <div className="pt-2 border-t border-slate-800">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Birth Data (Optional)</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Birth Date</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-maia-navy-600 input-dark-native"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Birth Time</label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={e => setBirthTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-maia-navy-600 input-dark-native"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Birth Location</label>
              <input
                type="text"
                value={birthLocation}
                onChange={e => setBirthLocation(e.target.value)}
                placeholder="City, State, Country"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-maia-navy-600"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="e.g., founder, weekly, VIP"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-maia-navy-600"
            />
          </div>

          </div>

          {/* Actions — pinned footer, always reachable above the bottom nav + safe area */}
          <div
            className="flex justify-end gap-3 p-4 border-t border-slate-800 bg-slate-900 shrink-0"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !email.trim() || saving}
              className="flex items-center gap-2 px-4 py-2 bg-maia-navy-700 text-white rounded-lg hover:bg-maia-navy-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Client
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
