'use client';

/**
 * MODEL STUDIO - Marketing Page
 *
 * Demo marketing tools and lead management
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone,
  Plus,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Mail,
  Globe,
  Instagram,
  Linkedin,
  Calendar,
  ExternalLink,
  BarChart3,
  Target,
  Sparkles,
} from 'lucide-react';

const demoCampaigns = [
  {
    id: '1',
    name: 'Anxiety Workshop Launch',
    status: 'active',
    type: 'email',
    sent: 156,
    opened: 89,
    clicked: 34,
    conversions: 8,
    startDate: 'Jan 28',
  },
  {
    id: '2',
    name: 'New Year Resolution Special',
    status: 'completed',
    type: 'social',
    sent: 0,
    opened: 0,
    clicked: 245,
    conversions: 12,
    startDate: 'Jan 1',
  },
  {
    id: '3',
    name: 'Mindfulness Group Promo',
    status: 'active',
    type: 'email',
    sent: 89,
    opened: 52,
    clicked: 18,
    conversions: 4,
    startDate: 'Feb 1',
  },
  {
    id: '4',
    name: 'Valentine\'s Couples Therapy',
    status: 'scheduled',
    type: 'email',
    sent: 0,
    opened: 0,
    clicked: 0,
    conversions: 0,
    startDate: 'Feb 10',
  },
];

const demoLeads = [
  { id: '1', name: 'Amanda K.', source: 'Website', status: 'new', date: 'Today', interest: 'Individual Therapy' },
  { id: '2', name: 'Robert M.', source: 'Instagram', status: 'contacted', date: 'Yesterday', interest: 'Anxiety Workshop' },
  { id: '3', name: 'Jennifer L.', source: 'Referral', status: 'scheduled', date: '2 days ago', interest: 'Couples Therapy' },
  { id: '4', name: 'David W.', source: 'LinkedIn', status: 'new', date: '3 days ago', interest: 'EMDR' },
  { id: '5', name: 'Michelle T.', source: 'Website', status: 'lost', date: '1 week ago', interest: 'Group Therapy' },
];

const statusColors = {
  active: 'bg-emerald-500/20 text-emerald-400',
  completed: 'bg-slate-500/20 text-slate-400',
  scheduled: 'bg-amber-500/20 text-amber-400',
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-violet-500/20 text-violet-400',
  lost: 'bg-red-500/20 text-red-400',
};

export default function ModelMarketingPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'leads'>('overview');

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 rounded-xl">
            <Megaphone className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Marketing</h1>
            <p className="text-slate-500 mt-1">Grow your practice</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors">
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {(['overview', 'campaigns', 'leads'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
              activeTab === tab
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
              <Eye className="w-5 h-5 text-blue-400 mb-2" />
              <div className="text-2xl font-bold text-white">1,234</div>
              <div className="text-sm text-slate-400">Website Visits</div>
              <div className="text-xs text-emerald-400 mt-1">↑ 12% this month</div>
            </div>
            <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
              <Users className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="text-2xl font-bold text-white">28</div>
              <div className="text-sm text-slate-400">New Leads</div>
              <div className="text-xs text-emerald-400 mt-1">↑ 8% this month</div>
            </div>
            <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
              <Target className="w-5 h-5 text-amber-400 mb-2" />
              <div className="text-2xl font-bold text-white">24</div>
              <div className="text-sm text-slate-400">Conversions</div>
              <div className="text-xs text-emerald-400 mt-1">↑ 15% this month</div>
            </div>
            <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4">
              <MousePointer className="w-5 h-5 text-violet-400 mb-2" />
              <div className="text-2xl font-bold text-white">3.2%</div>
              <div className="text-sm text-slate-400">Conversion Rate</div>
              <div className="text-xs text-red-400 mt-1">↓ 2% this month</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5 text-left hover:border-amber-500/30 transition-all"
            >
              <Mail className="w-6 h-6 text-amber-400 mb-3" />
              <h3 className="font-medium text-white mb-1">Email Campaign</h3>
              <p className="text-sm text-slate-400">Send newsletters and promotions</p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5 text-left hover:border-amber-500/30 transition-all"
            >
              <Globe className="w-6 h-6 text-blue-400 mb-3" />
              <h3 className="font-medium text-white mb-1">Website Editor</h3>
              <p className="text-sm text-slate-400">Update your practice page</p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5 text-left hover:border-amber-500/30 transition-all"
            >
              <Sparkles className="w-6 h-6 text-violet-400 mb-3" />
              <h3 className="font-medium text-white mb-1">AI Content</h3>
              <p className="text-sm text-slate-400">Generate marketing copy with MAIA</p>
            </motion.button>
          </div>

          {/* Social Channels */}
          <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Connected Channels</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 text-pink-400" />
                  <span className="text-white">Instagram</span>
                </div>
                <span className="text-xs text-emerald-400">Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Linkedin className="w-5 h-5 text-blue-400" />
                  <span className="text-white">LinkedIn</span>
                </div>
                <span className="text-xs text-emerald-400">Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-slate-400" />
                  <span className="text-white">Website</span>
                </div>
                <span className="text-xs text-emerald-400">Active</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {demoCampaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              whileHover={{ scale: 1.01 }}
              className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {campaign.type === 'email' ? (
                    <Mail className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Globe className="w-5 h-5 text-blue-400" />
                  )}
                  <div>
                    <h3 className="font-medium text-white">{campaign.name}</h3>
                    <span className="text-sm text-slate-400">Started {campaign.startDate}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded capitalize ${statusColors[campaign.status as keyof typeof statusColors]}`}>
                  {campaign.status}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-white">{campaign.sent || '-'}</div>
                  <div className="text-xs text-slate-400">Sent</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{campaign.opened || '-'}</div>
                  <div className="text-xs text-slate-400">Opened</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{campaign.clicked || '-'}</div>
                  <div className="text-xs text-slate-400">Clicked</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-emerald-400">{campaign.conversions || '-'}</div>
                  <div className="text-xs text-slate-400">Conversions</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Leads Tab */}
      {activeTab === 'leads' && (
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-slate-800/50 text-sm text-slate-500">
            <div className="col-span-3">Name</div>
            <div className="col-span-2">Source</div>
            <div className="col-span-3">Interest</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Date</div>
          </div>
          {demoLeads.map((lead) => (
            <motion.div
              key={lead.id}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-slate-800/30 items-center"
            >
              <div className="col-span-3 text-white">{lead.name}</div>
              <div className="col-span-2 text-slate-400">{lead.source}</div>
              <div className="col-span-3 text-slate-400">{lead.interest}</div>
              <div className="col-span-2">
                <span className={`text-xs px-2 py-1 rounded capitalize ${statusColors[lead.status as keyof typeof statusColors]}`}>
                  {lead.status}
                </span>
              </div>
              <div className="col-span-2 text-slate-400 text-sm">{lead.date}</div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
