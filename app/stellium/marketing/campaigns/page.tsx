"use client";

/**
 * MARKETING CAMPAIGNS PAGE
 *
 * Email sequences and broadcasts
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Mail,
  Plus,
  Filter,
  Loader2,
  Play,
  Pause,
  BarChart3,
  Clock,
  Send,
  Zap,
  Star,
} from 'lucide-react';
import { MarketingCampaign, CampaignType, CampaignStatus } from '@/lib/stellium/marketing';

const typeIcons: Record<CampaignType, React.ReactNode> = {
  sequence: <Mail className="w-4 h-4" />,
  broadcast: <Send className="w-4 h-4" />,
  automation: <Zap className="w-4 h-4" />,
  transit_alert: <Star className="w-4 h-4" />,
};

const statusColors: Record<CampaignStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
  scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  active: { bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
  paused: { bg: 'bg-amber-500/20', text: 'text-amber-300' },
  completed: { bg: 'bg-purple-500/20', text: 'text-purple-300' },
};

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<CampaignType | ''>('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('');

  // Pagination
  const [page, setPage] = useState(0);
  const limit = 20;

  const [practitionerId, setPractitionerId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('beta_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setPractitionerId(user.id || user.memberId || 'demo-practitioner');
      } catch {
        setPractitionerId('demo-practitioner');
      }
    } else {
      setPractitionerId('demo-practitioner');
    }
  }, []);

  useEffect(() => {
    if (practitionerId) {
      fetchCampaigns();
    }
  }, [practitionerId, typeFilter, statusFilter, page]);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        practitionerId: practitionerId!,
        limit: limit.toString(),
        offset: (page * limit).toString(),
      });

      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/stellium/marketing/campaigns/list?${params}`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');

      const data = await response.json();
      setCampaigns(data.campaigns);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: CampaignStatus) => {
    try {
      const response = await fetch(`/api/stellium/marketing/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', status }),
      });

      if (response.ok) {
        fetchCampaigns();
      }
    } catch (err) {
      console.error('Failed to update campaign:', err);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const types: { value: CampaignType | ''; label: string }[] = [
    { value: '', label: 'All Types' },
    { value: 'sequence', label: 'Sequence' },
    { value: 'broadcast', label: 'Broadcast' },
    { value: 'automation', label: 'Automation' },
    { value: 'transit_alert', label: 'Transit Alert' },
  ];

  const statuses: { value: CampaignStatus | ''; label: string }[] = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-gray-100">Campaigns</h1>
          <p className="text-gray-500">
            {total} campaign{total !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => router.push('/stellium/marketing/campaigns/new')}
          className="flex items-center space-x-2 px-4 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={e => {
            setTypeFilter(e.target.value as CampaignType | '');
            setPage(0);
          }}
          className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 focus:border-sacred-gold/50 focus:outline-none"
        >
          {types.map(t => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => {
            setStatusFilter(e.target.value as CampaignStatus | '');
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

      {/* Campaign List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-sacred-gold/50 animate-spin" />
        </div>
      ) : error ? (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-6 text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchCampaigns}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      ) : campaigns.length === 0 ? (
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
          <CardContent className="p-12 text-center">
            <Mail className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg text-gray-300 mb-2">
              {typeFilter || statusFilter ? 'No campaigns found' : 'No campaigns yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {typeFilter || statusFilter
                ? 'Try adjusting your filters'
                : 'Create your first email campaign'}
            </p>
            {!typeFilter && !statusFilter && (
              <button
                onClick={() => router.push('/stellium/marketing/campaigns/new')}
                className="px-4 py-2 bg-sacred-gold/20 hover:bg-sacred-gold/30 text-sacred-gold rounded-lg"
              >
                Create Campaign
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {campaigns.map((campaign, index) => {
              const status = statusColors[campaign.status];
              const openRate = campaign.emails_sent > 0
                ? ((campaign.emails_opened / campaign.emails_sent) * 100).toFixed(1)
                : '0';
              const clickRate = campaign.emails_sent > 0
                ? ((campaign.emails_clicked / campaign.emails_sent) * 100).toFixed(1)
                : '0';

              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20 hover:border-gray-600/50 transition-all cursor-pointer"
                    onClick={() => router.push(`/stellium/marketing/campaigns/${campaign.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-gray-800/50 rounded-lg">
                            {typeIcons[campaign.type]}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-gray-200 font-medium">{campaign.name}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${status.bg} ${status.text}`}>
                                {campaign.status}
                              </span>
                            </div>
                            {campaign.description && (
                              <p className="text-sm text-gray-500 mt-1">{campaign.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span className="capitalize">{campaign.type.replace('_', ' ')}</span>
                              {campaign.started_at && (
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Started {new Date(campaign.started_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center space-x-2">
                          {campaign.status === 'active' && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                updateCampaignStatus(campaign.id, 'paused');
                              }}
                              className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-lg"
                              title="Pause"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          )}
                          {campaign.status === 'paused' && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                updateCampaignStatus(campaign.id, 'active');
                              }}
                              className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg"
                              title="Resume"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          {campaign.status === 'draft' && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                updateCampaignStatus(campaign.id, 'active');
                              }}
                              className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg"
                              title="Start"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      {campaign.emails_sent > 0 && (
                        <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-800">
                          <div>
                            <div className="text-lg font-light text-gray-200">{campaign.emails_sent}</div>
                            <div className="text-xs text-gray-500">Sent</div>
                          </div>
                          <div>
                            <div className="text-lg font-light text-emerald-400">{openRate}%</div>
                            <div className="text-xs text-gray-500">Open Rate</div>
                          </div>
                          <div>
                            <div className="text-lg font-light text-blue-400">{clickRate}%</div>
                            <div className="text-xs text-gray-500">Click Rate</div>
                          </div>
                          {campaign.conversions > 0 && (
                            <div>
                              <div className="text-lg font-light text-sacred-gold">{campaign.conversions}</div>
                              <div className="text-xs text-gray-500">Conversions</div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:text-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 hover:text-gray-200 disabled:opacity-50"
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
