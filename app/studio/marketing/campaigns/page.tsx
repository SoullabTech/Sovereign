'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mail,
  Plus,
  Play,
  Pause,
  Clock,
  Send,
  Zap,
  Star,
} from 'lucide-react';

type CampaignType = 'sequence' | 'broadcast' | 'automation' | 'transit_alert';
type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  emails_sent: number;
  emails_opened: number;
  emails_clicked: number;
  conversions: number;
  started_at?: string;
  created_at: string;
}

// Mock campaigns
const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'New Year Transit Series',
    description: 'Weekly transit updates for the new year',
    type: 'sequence',
    status: 'active',
    emails_sent: 342,
    emails_opened: 156,
    emails_clicked: 48,
    conversions: 8,
    started_at: '2026-01-01',
    created_at: '2025-12-15',
  },
  {
    id: '2',
    name: 'Birth Chart Offer',
    description: 'Limited time discount on readings',
    type: 'broadcast',
    status: 'scheduled',
    emails_sent: 0,
    emails_opened: 0,
    emails_clicked: 0,
    conversions: 0,
    created_at: '2026-01-28',
  },
  {
    id: '3',
    name: 'Welcome Sequence',
    description: 'Onboarding emails for new subscribers',
    type: 'automation',
    status: 'active',
    emails_sent: 1245,
    emails_opened: 892,
    emails_clicked: 234,
    conversions: 45,
    started_at: '2025-06-01',
    created_at: '2025-05-15',
  },
  {
    id: '4',
    name: 'Mercury Retrograde Alert',
    description: 'Transit notification campaign',
    type: 'transit_alert',
    status: 'paused',
    emails_sent: 189,
    emails_opened: 145,
    emails_clicked: 67,
    conversions: 12,
    started_at: '2026-01-15',
    created_at: '2026-01-10',
  },
  {
    id: '5',
    name: 'Spring Equinox Series',
    description: 'Seasonal energy guidance',
    type: 'sequence',
    status: 'draft',
    emails_sent: 0,
    emails_opened: 0,
    emails_clicked: 0,
    conversions: 0,
    created_at: '2026-01-30',
  },
];

const typeIcons: Record<CampaignType, React.ReactNode> = {
  sequence: <Mail className="w-4 h-4" />,
  broadcast: <Send className="w-4 h-4" />,
  automation: <Zap className="w-4 h-4" />,
  transit_alert: <Star className="w-4 h-4" />,
};

const statusColors: Record<CampaignStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
  scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  active: { bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
  paused: { bg: 'bg-amber-500/20', text: 'text-amber-300' },
  completed: { bg: 'bg-purple-500/20', text: 'text-purple-300' },
};

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);

  // Filters
  const [typeFilter, setTypeFilter] = useState<CampaignType | ''>('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesType = !typeFilter || campaign.type === typeFilter;
    const matchesStatus = !statusFilter || campaign.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const updateCampaignStatus = (campaignId: string, status: CampaignStatus) => {
    setCampaigns(prev =>
      prev.map(c => (c.id === campaignId ? { ...c, status } : c))
    );
  };

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
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-slate-400" />
            Campaigns
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => router.push('/studio/marketing/campaigns/new')}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as CampaignType | '')}
          className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 focus:border-amber-500/50 focus:outline-none"
        >
          {types.map(t => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as CampaignStatus | '')}
          className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 focus:border-amber-500/50 focus:outline-none"
        >
          {statuses.map(s => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Campaign List */}
      {filteredCampaigns.length === 0 ? (
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-12 text-center">
          <Mail className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg text-slate-300 mb-2">
            {typeFilter || statusFilter ? 'No campaigns found' : 'No campaigns yet'}
          </h3>
          <p className="text-slate-500 mb-6">
            {typeFilter || statusFilter
              ? 'Try adjusting your filters'
              : 'Create your first email campaign'}
          </p>
          {!typeFilter && !statusFilter && (
            <button
              onClick={() => router.push('/studio/marketing/campaigns/new')}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg"
            >
              Create Campaign
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign, index) => {
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
                onClick={() => router.push(`/studio/marketing/campaigns/${campaign.id}`)}
                className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 cursor-pointer hover:border-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-800/50 rounded-lg text-slate-400">
                      {typeIcons[campaign.type]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-slate-200 font-medium">{campaign.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${status.bg} ${status.text}`}>
                          {campaign.status}
                        </span>
                      </div>
                      {campaign.description && (
                        <p className="text-sm text-slate-500 mt-1">{campaign.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="capitalize">{campaign.type.replace('_', ' ')}</span>
                        {campaign.started_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Started {new Date(campaign.started_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
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
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-800">
                    <div>
                      <div className="text-lg font-light text-slate-200">{campaign.emails_sent}</div>
                      <div className="text-xs text-slate-500">Sent</div>
                    </div>
                    <div>
                      <div className="text-lg font-light text-emerald-400">{openRate}%</div>
                      <div className="text-xs text-slate-500">Open Rate</div>
                    </div>
                    <div>
                      <div className="text-lg font-light text-blue-400">{clickRate}%</div>
                      <div className="text-xs text-slate-500">Click Rate</div>
                    </div>
                    {campaign.conversions > 0 && (
                      <div>
                        <div className="text-lg font-light text-amber-400">{campaign.conversions}</div>
                        <div className="text-xs text-slate-500">Conversions</div>
                      </div>
                    )}
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
