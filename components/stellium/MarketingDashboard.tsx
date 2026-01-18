"use client";

/**
 * MARKETING DASHBOARD COMPONENT
 *
 * Overview of marketing metrics and quick actions
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Mail,
  TrendingUp,
  Sparkles,
  Calendar,
  PenTool,
  Target,
  BarChart3,
  Loader2,
  ArrowUpRight,
  FileText,
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

interface MarketingDashboardProps {
  practitionerId: string;
  onNavigate: (path: string) => void;
}

export default function MarketingDashboard({
  practitionerId,
  onNavigate,
}: MarketingDashboardProps) {
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [practitionerId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `/api/stellium/marketing/dashboard?practitionerId=${practitionerId}`
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data.dashboard);
      }
    } catch (err) {
      console.error('Failed to fetch marketing stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-sacred-gold/50 animate-spin" />
      </div>
    );
  }

  const quickActions = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      label: 'Generate Content',
      description: 'Create posts in your voice',
      path: '/stellium/marketing/generate',
      color: 'bg-purple-500/20 text-purple-300',
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: 'New Campaign',
      description: 'Start an email sequence',
      path: '/stellium/marketing/campaigns/new',
      color: 'bg-blue-500/20 text-blue-300',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Lead Magnet',
      description: 'Create a free offering',
      path: '/stellium/marketing/lead-magnets/new',
      color: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Content Calendar',
      description: 'Plan your content',
      path: '/stellium/marketing/calendar',
      color: 'bg-amber-500/20 text-amber-300',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-light text-gray-100">Marketing</h2>
        <p className="text-gray-500">Your voice, amplified</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card
            className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20 cursor-pointer hover:border-gray-600/50 transition-colors"
            onClick={() => onNavigate('/stellium/marketing/contacts')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-300" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-600" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-light text-gray-100">
                  {stats?.contacts.total || 0}
                </div>
                <div className="text-sm text-gray-500">Total Contacts</div>
                {stats?.contacts.recent ? (
                  <div className="text-xs text-emerald-400 mt-1">
                    +{stats.contacts.recent} this week
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card
            className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20 cursor-pointer hover:border-gray-600/50 transition-colors"
            onClick={() => onNavigate('/stellium/marketing/campaigns')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Mail className="w-5 h-5 text-purple-300" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-600" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-light text-gray-100">
                  {stats?.campaigns.active || 0}
                </div>
                <div className="text-sm text-gray-500">Active Campaigns</div>
                <div className="text-xs text-gray-600 mt-1">
                  {stats?.campaigns.total_sent || 0} emails sent
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-300" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-light text-gray-100">
                  {stats?.email_metrics.open_rate.toFixed(1) || 0}%
                </div>
                <div className="text-sm text-gray-500">Open Rate</div>
                <div className="text-xs text-gray-600 mt-1">
                  {stats?.email_metrics.click_rate.toFixed(1) || 0}% click rate
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card
            className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20 cursor-pointer hover:border-gray-600/50 transition-colors"
            onClick={() => onNavigate('/stellium/marketing/lead-magnets')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-amber-300" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-600" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-light text-gray-100">
                  {stats?.lead_magnets.total_submissions || 0}
                </div>
                <div className="text-sm text-gray-500">Lead Magnet Signups</div>
                <div className="text-xs text-gray-600 mt-1">
                  {stats?.lead_magnets.active || 0} active magnets
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
        <CardHeader>
          <CardTitle className="text-gray-300 text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onNavigate(action.path)}
                className="flex flex-col items-start p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl transition-colors text-left"
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  {action.icon}
                </div>
                <div className="mt-3">
                  <div className="text-sm text-gray-200">{action.label}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Content */}
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
          <CardHeader>
            <CardTitle className="text-gray-300 text-base flex items-center">
              <PenTool className="w-4 h-4 mr-2" />
              Content Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Scheduled</span>
                <span className="text-gray-200">{stats?.content.scheduled || 0} posts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Published this month</span>
                <span className="text-gray-200">{stats?.content.published_this_month || 0} posts</span>
              </div>
              <div className="pt-4 border-t border-gray-800">
                <button
                  onClick={() => onNavigate('/stellium/marketing/content')}
                  className="text-sm text-sacred-gold hover:text-sacred-gold/80 flex items-center"
                >
                  View all content
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Funnel */}
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/20">
          <CardHeader>
            <CardTitle className="text-gray-300 text-base flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Contact Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['lead', 'engaged', 'qualified', 'opportunity', 'converted'].map(status => {
                const count = stats?.contacts.byStatus[status] || 0;
                const total = stats?.contacts.total || 1;
                const percentage = (count / total) * 100;

                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 capitalize">{status}</span>
                      <span className="text-gray-300">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sacred-gold/60 to-sacred-gold rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
