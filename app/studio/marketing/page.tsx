'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  Mail,
  TrendingUp,
  Sparkles,
  Calendar,
  PenTool,
  Target,
  BarChart3,
  ArrowUpRight,
  FileText,
  Megaphone,
} from 'lucide-react';

interface MarketingStats {
  contacts: {
    total: number;
    byStatus: Record<string, number>;
    recent: number;
  };
  campaigns: {
    active: number;
    paused: number;
    total_sent: number;
  };
  email_metrics: {
    open_rate: number;
    click_rate: number;
  };
  content: {
    scheduled: number;
    published_this_month: number;
  };
  lead_magnets: {
    active: number;
    total_submissions: number;
  };
}

// Mock stats for development
const mockStats: MarketingStats = {
  contacts: {
    total: 247,
    byStatus: {
      lead: 89,
      engaged: 72,
      qualified: 45,
      opportunity: 28,
      converted: 13,
    },
    recent: 12,
  },
  campaigns: {
    active: 3,
    paused: 1,
    total_sent: 1842,
  },
  email_metrics: {
    open_rate: 42.3,
    click_rate: 8.7,
  },
  content: {
    scheduled: 8,
    published_this_month: 14,
  },
  lead_magnets: {
    active: 2,
    total_submissions: 156,
  },
};

export default function MarketingPage() {
  const router = useRouter();
  const [stats] = useState<MarketingStats>(mockStats);

  const quickActions = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      label: 'Generate Content',
      description: 'Create posts in your voice',
      path: '/studio/marketing/generate',
      color: 'bg-purple-500/20 text-purple-300',
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: 'New Campaign',
      description: 'Start an email sequence',
      path: '/studio/marketing/campaigns/new',
      color: 'bg-blue-500/20 text-blue-300',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Lead Magnet',
      description: 'Create a free offering',
      path: '/studio/marketing/lead-magnets/new',
      color: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Content Calendar',
      description: 'Plan your content',
      path: '/studio/marketing/calendar',
      color: 'bg-amber-500/20 text-amber-300',
    },
  ];

  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-slate-400" />
          Marketing
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Your voice, amplified</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/studio/marketing/contacts')}
          className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 cursor-pointer hover:border-slate-700/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-300" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-light text-white">
              {stats.contacts.total}
            </div>
            <div className="text-sm text-slate-500">Total Contacts</div>
            {stats.contacts.recent > 0 && (
              <div className="text-xs text-emerald-400 mt-1">
                +{stats.contacts.recent} this week
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => navigate('/studio/marketing/campaigns')}
          className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 cursor-pointer hover:border-slate-700/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Mail className="w-5 h-5 text-purple-300" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-light text-white">
              {stats.campaigns.active}
            </div>
            <div className="text-sm text-slate-500">Active Campaigns</div>
            <div className="text-xs text-slate-600 mt-1">
              {stats.campaigns.total_sent} emails sent
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-300" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-light text-white">
              {stats.email_metrics.open_rate.toFixed(1)}%
            </div>
            <div className="text-sm text-slate-500">Open Rate</div>
            <div className="text-xs text-slate-600 mt-1">
              {stats.email_metrics.click_rate.toFixed(1)}% click rate
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onClick={() => navigate('/studio/marketing/lead-magnets')}
          className="bg-[#1e1e38] border border-slate-800/50 rounded-xl p-4 cursor-pointer hover:border-slate-700/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Target className="w-5 h-5 text-amber-300" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-light text-white">
              {stats.lead_magnets.total_submissions}
            </div>
            <div className="text-sm text-slate-500">Lead Magnet Signups</div>
            <div className="text-xs text-slate-600 mt-1">
              {stats.lead_magnets.active} active magnets
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl mb-6">
        <div className="p-4 border-b border-slate-800/50">
          <h2 className="text-sm font-medium text-slate-300">Quick Actions</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-start p-4 bg-slate-900/30 hover:bg-slate-800/50 rounded-xl transition-colors text-left"
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  {action.icon}
                </div>
                <div className="mt-3">
                  <div className="text-sm text-slate-200">{action.label}</div>
                  <div className="text-xs text-slate-500">{action.description}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Pipeline */}
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl">
          <div className="p-4 border-b border-slate-800/50">
            <h2 className="text-sm font-medium text-slate-300 flex items-center">
              <PenTool className="w-4 h-4 mr-2" />
              Content Pipeline
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Scheduled</span>
              <span className="text-slate-200">{stats.content.scheduled} posts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Published this month</span>
              <span className="text-slate-200">{stats.content.published_this_month} posts</span>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => navigate('/studio/marketing/content')}
                className="text-sm text-amber-400 hover:text-amber-300 flex items-center"
              >
                View all content
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Contact Funnel */}
        <div className="bg-[#1e1e38] border border-slate-800/50 rounded-xl">
          <div className="p-4 border-b border-slate-800/50">
            <h2 className="text-sm font-medium text-slate-300 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Contact Funnel
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {['lead', 'engaged', 'qualified', 'opportunity', 'converted'].map(status => {
              const count = stats.contacts.byStatus[status] || 0;
              const total = stats.contacts.total || 1;
              const percentage = (count / total) * 100;

              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 capitalize">{status}</span>
                    <span className="text-slate-300">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500/60 to-amber-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
