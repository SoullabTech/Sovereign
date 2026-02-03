'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Search,
  Plus,
  User,
  Calendar,
  FileText,
  MessageSquare,
  Clock,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface Client {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'archived' | 'waitlist';
  tier: string;
  tags: string[];
  lastSessionAt: string | null;
  nextSessionAt: string | null;
  totalSessions: number;
  internalNotes: string | null;
}

type StatusFilter = 'all' | 'active' | 'archived';

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return '—';

  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Future date
    const futureDays = Math.abs(diffDays);
    if (futureDays === 0) return 'Today';
    if (futureDays === 1) return 'Tomorrow';
    if (futureDays < 7) return `In ${futureDays} days`;
    if (futureDays < 30) return `In ${Math.ceil(futureDays / 7)} weeks`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    inactive: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    archived: 'bg-slate-700/50 text-slate-500 border-slate-600/30',
    waitlist: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[status] || styles.inactive}`}>
      {status}
    </span>
  );
}

export default function CaseloadPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/studio/clients');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch clients');
      }

      setClients(data.clients || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load caseload');
    } finally {
      setLoading(false);
    }
  }

  // Filter clients
  const filteredClients = clients.filter(client => {
    // Status filter
    if (statusFilter === 'active' && client.status !== 'active') return false;
    if (statusFilter === 'archived' && client.status !== 'archived') return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Sort: active first, then by next session, then by last session
  const sortedClients = [...filteredClients].sort((a, b) => {
    // Active clients first
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;

    // Then by next session (upcoming first)
    if (a.nextSessionAt && !b.nextSessionAt) return -1;
    if (!a.nextSessionAt && b.nextSessionAt) return 1;
    if (a.nextSessionAt && b.nextSessionAt) {
      return new Date(a.nextSessionAt).getTime() - new Date(b.nextSessionAt).getTime();
    }

    // Then by last session (most recent first)
    if (a.lastSessionAt && !b.lastSessionAt) return -1;
    if (!a.lastSessionAt && b.lastSessionAt) return 1;
    if (a.lastSessionAt && b.lastSessionAt) {
      return new Date(b.lastSessionAt).getTime() - new Date(a.lastSessionAt).getTime();
    }

    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-light text-white flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-amber-400" />
              Caseload
            </h1>
            <p className="text-slate-400 mt-1">
              {clients.length} client{clients.length !== 1 ? 's' : ''} in your practice
            </p>
          </div>

          <Link
            href="/studio/clients"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['all', 'active', 'archived'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  statusFilter === status
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchClients}
              className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sortedClients.length === 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-medium text-white mb-3">
              {searchQuery || statusFilter !== 'all' ? 'No clients found' : 'No clients yet'}
            </h2>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add your first client to start building your caseload'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link
                href="/studio/clients"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Your First Client
              </Link>
            )}
          </div>
        )}

        {/* Client List */}
        {!loading && !error && sortedClients.length > 0 && (
          <div className="space-y-2">
            {sortedClients.map((client) => (
              <Link
                key={client.id}
                href={`/studio/clients/${client.id}`}
                className="block bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 hover:bg-slate-800/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-medium text-slate-300">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Client Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white truncate">{client.name}</h3>
                      <StatusPill status={client.status} />
                    </div>
                    <p className="text-sm text-slate-500 truncate">{client.email}</p>
                  </div>

                  {/* Session Info */}
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-center min-w-[80px]">
                      <p className="text-slate-500 text-xs mb-1">Last Session</p>
                      <p className="text-slate-300">{formatRelativeDate(client.lastSessionAt)}</p>
                    </div>
                    <div className="text-center min-w-[80px]">
                      <p className="text-slate-500 text-xs mb-1">Next Session</p>
                      <p className={client.nextSessionAt ? 'text-amber-400' : 'text-slate-500'}>
                        {formatRelativeDate(client.nextSessionAt)}
                      </p>
                    </div>
                    <div className="text-center min-w-[60px]">
                      <p className="text-slate-500 text-xs mb-1">Sessions</p>
                      <p className="text-slate-300">{client.totalSessions}</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Open notes modal
                      }}
                      className="p-2 text-slate-500 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Add note"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Open schedule modal
                      }}
                      className="p-2 text-slate-500 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Schedule session"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Open message modal
                      }}
                      className="p-2 text-slate-500 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Send message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </div>

                {/* Mobile Session Info */}
                <div className="md:hidden flex items-center gap-4 mt-3 pt-3 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>Last: {formatRelativeDate(client.lastSessionAt)}</span>
                  </div>
                  {client.nextSessionAt && (
                    <div className="flex items-center gap-1 text-amber-400">
                      <Calendar className="w-3 h-3" />
                      <span>Next: {formatRelativeDate(client.nextSessionAt)}</span>
                    </div>
                  )}
                  <div className="text-slate-500">
                    {client.totalSessions} session{client.totalSessions !== 1 ? 's' : ''}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
