'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Crown, Shield, Star, Trash2, Users, Plus, Search, Download, ArrowLeft } from 'lucide-react';

interface BetaTester {
  id: string;
  name: string;
  subscription: {
    status: 'active' | 'expired';
    tier: 'premium';
    expiresAt: string;
    features: string[];
    planId: string;
    customerId: string;
  };
  createdAt: string;
  lastActive: string;
  addedAt: string;
  notes: string;
}

export default function BetaTestersAdminLabTools() {
  const router = useRouter();
  const [betaTesters, setBetaTesters] = useState<BetaTester[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBetaTesters();
  }, []);

  const loadBetaTesters = () => {
    try {
      const storedTesters = localStorage.getItem('maia_beta_testers');
      if (storedTesters) {
        const testers = JSON.parse(storedTesters);
        setBetaTesters(testers);
      }
    } catch (error) {
      console.error('Failed to load beta testers:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBetaTester = (testerId: string) => {
    const updatedTesters = betaTesters.filter(tester => tester.id !== testerId);
    setBetaTesters(updatedTesters);
    localStorage.setItem('maia_beta_testers', JSON.stringify(updatedTesters));
  };

  const extendAccess = (testerId: string, days: number) => {
    const updatedTesters = betaTesters.map(tester => {
      if (tester.id === testerId) {
        const newExpiryDate = new Date(tester.subscription.expiresAt);
        newExpiryDate.setDate(newExpiryDate.getDate() + days);
        return {
          ...tester,
          subscription: {
            ...tester.subscription,
            expiresAt: newExpiryDate.toISOString()
          }
        };
      }
      return tester;
    });

    setBetaTesters(updatedTesters);
    localStorage.setItem('maia_beta_testers', JSON.stringify(updatedTesters));
  };

  const clearAllTesters = () => {
    if (confirm('Are you sure you want to remove all beta testers? This action cannot be undone.')) {
      setBetaTesters([]);
      localStorage.removeItem('maia_beta_testers');
      localStorage.removeItem('maia_user_subscription');
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(betaTesters, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `maia-beta-testers-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const filteredTesters = betaTesters.filter(tester =>
    tester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tester.subscription.customerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4B896] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e] p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 backdrop-blur-md border border-[#D4B896]/30 rounded-xl p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/labtools')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4B896]/10
                       border border-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/20 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Lab Tools
            </button>
            <div className="w-px h-6 bg-[#D4B896]/30" />
            <div className="w-12 h-12 bg-[#D4B896]/20 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#D4B896]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#D4B896]">Beta Testers Admin</h1>
              <p className="text-[#D4B896]/70">Manage SOULLAB-[name] passcode access</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#D4B896]" />
                <div>
                  <p className="text-[#D4B896]/70 text-sm">Total Beta Testers</p>
                  <p className="text-[#D4B896] font-semibold">{betaTesters.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-[#D4B896]/70 text-sm">Active Access</p>
                  <p className="text-[#D4B896] font-semibold">
                    {betaTesters.filter(t => !isExpired(t.subscription.expiresAt)).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-[#D4B896]/70 text-sm">Expired Access</p>
                  <p className="text-[#D4B896] font-semibold">
                    {betaTesters.filter(t => isExpired(t.subscription.expiresAt)).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#D4B896]/50" />
                <input
                  type="text"
                  placeholder="Search beta testers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-[#D4B896]/30 text-[#D4B896] rounded-lg focus:outline-none focus:border-[#D4B896] transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportData}
                className="px-4 py-2 bg-[#D4B896]/20 hover:bg-[#D4B896]/30 text-[#D4B896] rounded-lg transition-colors flex items-center gap-2 border border-[#D4B896]/30"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={clearAllTesters}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors flex items-center gap-2 border border-red-500/30"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>
        </motion.div>

        {/* Beta Access Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/80 backdrop-blur-md border border-[#D4B896]/30 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-[#D4B896]" />
            <div>
              <p className="text-[#D4B896] font-medium">Beta Access Page</p>
              <p className="text-[#D4B896]/70 text-sm">Share this link with new beta testers:</p>
              <a
                href="/beta-access"
                target="_blank"
                className="text-[#D4B896] hover:text-[#D4B896]/80 underline text-sm"
              >
                {typeof window !== 'undefined' ? `${window.location.origin}/beta-access` : '/beta-access'}
              </a>
            </div>
          </div>
        </motion.div>

        {/* Beta Testers List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/80 backdrop-blur-md border border-[#D4B896]/30 rounded-xl overflow-hidden"
        >
          {filteredTesters.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-[#D4B896]/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#D4B896] mb-2">
                {betaTesters.length === 0 ? 'No Beta Testers Yet' : 'No Matching Testers'}
              </h3>
              <p className="text-[#D4B896]/70">
                {betaTesters.length === 0
                  ? 'Share the beta access link to get started.'
                  : 'Try adjusting your search terms.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50 border-b border-[#D4B896]/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-[#D4B896] font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-[#D4B896] font-medium">Customer ID</th>
                    <th className="px-4 py-3 text-left text-[#D4B896] font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-[#D4B896] font-medium">Expires</th>
                    <th className="px-4 py-3 text-left text-[#D4B896] font-medium">Added</th>
                    <th className="px-4 py-3 text-left text-[#D4B896] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTesters.map((tester) => {
                    const expired = isExpired(tester.subscription.expiresAt);
                    return (
                      <tr key={tester.id} className="border-b border-[#D4B896]/10 hover:bg-slate-800/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-[#D4B896]" />
                            <span className="text-[#D4B896] font-medium">{tester.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#D4B896]/70 font-mono text-sm">
                          {tester.subscription.customerId}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            expired
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                            {expired ? 'Expired' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#D4B896]/70 text-sm">
                          {new Date(tester.subscription.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-[#D4B896]/70 text-sm">
                          {new Date(tester.addedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => extendAccess(tester.id, 30)}
                              className="px-2 py-1 bg-[#D4B896]/20 hover:bg-[#D4B896]/30 text-[#D4B896] text-xs rounded border border-[#D4B896]/30 transition-colors"
                            >
                              +30d
                            </button>
                            <button
                              onClick={() => extendAccess(tester.id, 90)}
                              className="px-2 py-1 bg-[#D4B896]/20 hover:bg-[#D4B896]/30 text-[#D4B896] text-xs rounded border border-[#D4B896]/30 transition-colors"
                            >
                              +90d
                            </button>
                            <button
                              onClick={() => removeBetaTester(tester.id)}
                              className="px-2 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs rounded border border-red-500/30 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}