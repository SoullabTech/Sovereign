'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Mail,
  Send,
  Download,
  FileText,
  TrendingUp,
  Calendar,
  Heart,
  Star,
  Globe,
  Zap
} from 'lucide-react';
import { GaneshaContactManager, type ContactGroup, campaignTemplates } from '@/lib/ganesha/contacts';

interface ContactStats {
  totalActive: number;
  betaTesters: number;
  newsletterSubscribers: number;
  recentJoins: number;
}

export default function GaneshaPage() {
  const [stats, setStats] = useState<ContactStats>({
    totalActive: 0,
    betaTesters: 0,
    newsletterSubscribers: 0,
    recentJoins: 0
  });
  const [selectedGroup, setSelectedGroup] = useState<ContactGroup>('beta-testers');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Load Ganesha contact stats
    const contactStats = GaneshaContactManager.getStats();
    setStats(contactStats);
  }, []);

  const handleExportContacts = async (group?: ContactGroup) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ganesha/export-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ganesha-contacts-${group || 'all'}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
    setIsLoading(false);
  };

  const handleSendCampaign = async (campaignId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ganesha/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          templateId: campaignTemplates[campaignId as keyof typeof campaignTemplates]?.templateId || 'consciousness-revolution'
        })
      });

      if (response.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
      }
    } catch (error) {
      console.error('Campaign send failed:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F9F9] via-[#E0F2F1] to-[#B2DFDB]">
      {/* Spa-like ambient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-teal-100/30 via-transparent to-teal-200/20 pointer-events-none"></div>

      <div className="relative container mx-auto px-8 py-16">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-none bg-slate-700/80 border border-teal-400/50 backdrop-blur-sm shadow-lg">
            <Users className="w-10 h-10 text-teal-200" />
          </div>
          <h1 className="text-5xl md:text-7xl font-light text-slate-800 mb-6 tracking-wide">
            Ganesha Contact Hub
          </h1>
          <p className="text-lg text-slate-700/80 max-w-2xl mx-auto leading-relaxed font-light">
            Organized community management. Email campaigns, contact export, and growth tracking.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-teal-600/40 backdrop-blur-sm border border-teal-500/50 p-6 text-center shadow-lg rounded-lg">
            <Globe className="w-8 h-8 text-slate-700 mx-auto mb-3" />
            <div className="text-3xl font-light text-slate-800 mb-1">{stats.totalActive}</div>
            <div className="text-slate-700/80 text-sm tracking-wide uppercase">Total Active</div>
          </div>
          <div className="bg-teal-600/40 backdrop-blur-sm border border-teal-500/50 p-6 text-center shadow-lg rounded-lg">
            <Star className="w-8 h-8 text-slate-700 mx-auto mb-3" />
            <div className="text-3xl font-light text-slate-800 mb-1">{stats.betaTesters}</div>
            <div className="text-slate-700/80 text-sm tracking-wide uppercase">Beta Testers</div>
          </div>
          <div className="bg-teal-600/40 backdrop-blur-sm border border-teal-500/50 p-6 text-center shadow-lg rounded-lg">
            <Mail className="w-8 h-8 text-slate-700 mx-auto mb-3" />
            <div className="text-3xl font-light text-slate-800 mb-1">{stats.newsletterSubscribers}</div>
            <div className="text-slate-700/80 text-sm tracking-wide uppercase">Newsletter</div>
          </div>
          <div className="bg-teal-600/40 backdrop-blur-sm border border-teal-500/50 p-6 text-center shadow-lg rounded-lg">
            <TrendingUp className="w-8 h-8 text-slate-700 mx-auto mb-3" />
            <div className="text-3xl font-light text-slate-800 mb-1">{stats.recentJoins}</div>
            <div className="text-slate-700/80 text-sm tracking-wide uppercase">Recent</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-teal-600/40 backdrop-blur-sm border border-teal-500/50 p-8 shadow-lg rounded-lg"
          >
            <h2 className="text-2xl font-light text-slate-800 mb-8 flex items-center tracking-wide">
              <Zap className="w-6 h-6 mr-3 text-slate-700" />
              Operations
            </h2>

            {/* Export Contacts */}
            <div className="space-y-6 mb-10">
              <h3 className="text-lg font-light text-slate-700 tracking-wide uppercase text-sm">Data Export</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleExportContacts('beta-testers')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-3 py-4 bg-teal-500/30 hover:bg-teal-500/40 text-slate-800 border border-teal-600/50 hover:border-teal-600/70 transition-all disabled:opacity-50 font-light rounded-lg"
                >
                  <Download className="w-4 h-4" />
                  Beta Testers
                </button>
                <button
                  onClick={() => handleExportContacts('newsletter')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-3 py-4 bg-teal-500/30 hover:bg-teal-500/40 text-slate-800 border border-teal-600/50 hover:border-teal-600/70 transition-all disabled:opacity-50 font-light rounded-lg"
                >
                  <Download className="w-4 h-4" />
                  Newsletter
                </button>
              </div>
              <button
                onClick={() => handleExportContacts()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-teal-500/40 hover:bg-teal-500/50 text-slate-800 border border-teal-600/60 hover:border-teal-600/80 transition-all disabled:opacity-50 font-light rounded-lg"
              >
                <Download className="w-4 h-4" />
                Complete Archive
              </button>
            </div>

            {/* Send Test Email */}
            <div className="space-y-6">
              <h3 className="text-lg font-light text-slate-700 tracking-wide uppercase text-sm">Communications</h3>
              <button
                onClick={() => handleSendCampaign('consciousness-revolution')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-teal-500/40 to-teal-600/40 hover:from-teal-500/50 hover:to-teal-600/50 text-slate-800 border border-teal-600/60 hover:border-teal-600/80 transition-all disabled:opacity-50 font-light rounded-lg"
              >
                <Send className="w-4 h-4" />
                {isLoading ? 'Transmitting...' : 'Send System Update'}
              </button>
              {emailSent && (
                <div className="text-slate-700 text-sm text-center font-light tracking-wide">
                  Transmission successful
                </div>
              )}
            </div>
          </motion.div>

          {/* Contact Groups */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-teal-600/40 backdrop-blur-sm border border-teal-500/50 p-8 shadow-lg rounded-lg"
          >
            <h2 className="text-2xl font-light text-slate-800 mb-8 flex items-center tracking-wide">
              <Users className="w-6 h-6 mr-3 text-slate-700" />
              Contact Registry
            </h2>

            <div className="space-y-3">
              {[
                { group: 'beta-testers', name: 'Beta Testers', count: stats.betaTesters },
                { group: 'newsletter', name: 'Newsletter', count: stats.newsletterSubscribers },
                { group: 'consciousness-pioneers', name: 'System Pioneers', count: stats.betaTesters },
                { group: 'founders', name: 'Founders', count: 1 }
              ].map(({ group, name, count }) => (
                <div
                  key={group}
                  className="flex items-center justify-between p-4 bg-teal-500/30 border border-teal-600/40 hover:border-teal-600/60 transition-all rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                    <span className="text-slate-800 font-light tracking-wide">{name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-800 font-light text-lg">{count}</span>
                    <button
                      onClick={() => handleExportContacts(group as ContactGroup)}
                      className="text-slate-700 hover:text-slate-900 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Campaign Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 bg-teal-600/40 backdrop-blur-sm border border-teal-500/50 p-8 shadow-lg rounded-lg"
        >
          <h2 className="text-2xl font-light text-slate-800 mb-8 flex items-center tracking-wide">
            <FileText className="w-6 h-6 mr-3 text-slate-700" />
            Communication Protocols
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(campaignTemplates).map(([id, template]) => (
              <div
                key={id}
                className="p-6 bg-teal-500/30 border border-teal-600/40 hover:border-teal-600/60 transition-all rounded-lg"
              >
                <h3 className="text-lg font-light text-slate-800 mb-3 tracking-wide">{template.name}</h3>
                <p className="text-slate-700/90 text-sm mb-6 leading-relaxed font-light">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600/80 uppercase tracking-widest">
                    {template.targetGroups.length} targets
                  </span>
                  <button
                    onClick={() => handleSendCampaign(id)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-teal-500/40 hover:bg-teal-500/50 text-slate-800 border border-teal-600/50 hover:border-teal-600/70 transition-all disabled:opacity-50 font-light rounded-lg"
                  >
                    <Send className="w-3 h-3" />
                    Execute
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-16"
        >
          <p className="text-slate-600/80 text-sm font-light tracking-widest uppercase">
            Contact hub systems • Organized communications • Operational efficiency
          </p>
        </motion.div>

      </div>
    </div>
  );
}