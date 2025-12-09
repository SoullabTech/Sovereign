'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Crown,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Settings,
  Star,
  Award
} from 'lucide-react';

interface BetaTester {
  id: string;
  name: string;
  email: string;
  tier: 'free' | 'subscriber' | 'premium';
  status: 'active' | 'expired' | 'trial' | 'none';
  addedAt: Date;
  expiresAt?: Date;
  features: string[];
  lastActive?: Date;
  notes?: string;
}

interface BetaAccessManagerProps {
  onClose?: () => void;
}

export default function BetaAccessManager({ onClose }: BetaAccessManagerProps) {
  const [betaTesters, setBetaTesters] = useState<BetaTester[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTester, setNewTester] = useState({
    name: '',
    email: '',
    tier: 'subscriber' as 'subscriber' | 'premium',
    duration: '30', // days
    notes: ''
  });

  // Load existing beta testers
  useEffect(() => {
    loadBetaTesters();
  }, []);

  const loadBetaTesters = () => {
    const stored = localStorage.getItem('maia_beta_testers');
    if (stored) {
      const parsed = JSON.parse(stored);
      setBetaTesters(parsed.map((tester: any) => ({
        ...tester,
        addedAt: new Date(tester.addedAt),
        expiresAt: tester.expiresAt ? new Date(tester.expiresAt) : undefined,
        lastActive: tester.lastActive ? new Date(tester.lastActive) : undefined
      })));
    }
  };

  const saveBetaTesters = (testers: BetaTester[]) => {
    localStorage.setItem('maia_beta_testers', JSON.stringify(testers));
    setBetaTesters(testers);
  };

  const addBetaTester = () => {
    if (!newTester.name || !newTester.email) return;

    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + parseInt(newTester.duration));

    const tester: BetaTester = {
      id: `beta-${Date.now()}`,
      name: newTester.name,
      email: newTester.email,
      tier: newTester.tier,
      status: 'active',
      addedAt: now,
      expiresAt,
      features: getTierFeatures(newTester.tier),
      notes: newTester.notes
    };

    const updated = [...betaTesters, tester];
    saveBetaTesters(updated);

    // Generate access code for the beta tester
    const accessCode = generateAccessCode(tester);
    alert(`Beta access created! Share this code with ${newTester.name}:\n\n${accessCode}\n\nThey can enter this at: localhost:3005/beta-access`);

    setNewTester({ name: '', email: '', tier: 'subscriber', duration: '30', notes: '' });
    setShowAddModal(false);
  };

  const getTierFeatures = (tier: 'subscriber' | 'premium') => {
    if (tier === 'premium') {
      return [
        'lab_tools',
        'community_commons',
        'voice_synthesis',
        'brain_trust',
        'advanced_oracle',
        'field_protocol',
        'scribe_mode',
        'birth_chart',
        'elder_council'
      ];
    } else {
      return [
        'lab_tools',
        'community_commons',
        'voice_synthesis',
        'brain_trust'
      ];
    }
  };

  const generateAccessCode = (tester: BetaTester) => {
    const data = {
      id: tester.id,
      name: tester.name,
      email: tester.email,
      tier: tester.tier,
      expiresAt: tester.expiresAt?.getTime()
    };
    return btoa(JSON.stringify(data));
  };

  const removeBetaTester = (id: string) => {
    if (confirm('Are you sure you want to remove this beta tester?')) {
      const updated = betaTesters.filter(t => t.id !== id);
      saveBetaTesters(updated);
    }
  };

  const extendAccess = (id: string, days: number) => {
    const updated = betaTesters.map(tester => {
      if (tester.id === id) {
        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + days);
        return { ...tester, expiresAt: newExpiry, status: 'active' as const };
      }
      return tester;
    });
    saveBetaTesters(updated);
  };

  const filteredTesters = betaTesters.filter(tester => {
    const matchesSearch = tester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tester.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || tester.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-100 flex items-center gap-3">
              <Crown className="w-8 h-8 text-amber-400" />
              MAIA Beta Access Manager
            </h1>
            <p className="text-amber-300/70 mt-2">Manage professional tier access for beta testers</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-amber-50 rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Beta Tester
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 border border-amber-500/40 text-amber-300 rounded-lg hover:bg-amber-500/10"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xl font-bold text-amber-100">{betaTesters.length}</div>
                <div className="text-sm text-amber-300/70">Total Testers</div>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xl font-bold text-amber-100">
                  {betaTesters.filter(t => t.status === 'active').length}
                </div>
                <div className="text-sm text-amber-300/70">Active</div>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xl font-bold text-amber-100">
                  {betaTesters.filter(t => t.tier === 'subscriber').length}
                </div>
                <div className="text-sm text-amber-300/70">Subscribers</div>
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xl font-bold text-amber-100">
                  {betaTesters.filter(t => t.tier === 'premium').length}
                </div>
                <div className="text-sm text-amber-300/70">Premium</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="text"
                placeholder="Search testers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-amber-500/30 text-amber-100 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-amber-500/30 text-amber-100 rounded-lg focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Tiers</option>
            <option value="subscriber">Subscribers</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        {/* Beta Testers List */}
        <div className="space-y-4">
          {filteredTesters.map((tester) => (
            <motion.div
              key={tester.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    tester.tier === 'premium'
                      ? 'bg-amber-500/20 border border-amber-500/40'
                      : 'bg-blue-500/20 border border-blue-500/40'
                  }`}>
                    {tester.tier === 'premium' ? (
                      <Crown className="w-6 h-6 text-amber-400" />
                    ) : (
                      <Star className="w-6 h-6 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-100">{tester.name}</h3>
                    <p className="text-amber-300/70">{tester.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-md ${
                        tester.tier === 'premium'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {tester.tier.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-md ${
                        tester.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {tester.status.toUpperCase()}
                      </span>
                      {tester.expiresAt && (
                        <span className="text-xs text-amber-300/70">
                          Expires: {tester.expiresAt.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {tester.notes && (
                      <p className="text-sm text-amber-300/60 mt-2">{tester.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => extendAccess(tester.id, 30)}
                    className="px-3 py-1 bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-sm rounded-lg hover:bg-emerald-600/30"
                  >
                    +30 days
                  </button>
                  <button
                    onClick={() => {
                      const accessCode = generateAccessCode(tester);
                      navigator.clipboard.writeText(accessCode);
                      alert('Access code copied to clipboard!');
                    }}
                    className="px-3 py-1 bg-amber-600/20 border border-amber-500/40 text-amber-300 text-sm rounded-lg hover:bg-amber-600/30"
                  >
                    Copy Code
                  </button>
                  <button
                    onClick={() => removeBetaTester(tester.id)}
                    className="px-3 py-1 bg-red-600/20 border border-red-500/40 text-red-300 text-sm rounded-lg hover:bg-red-600/30"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTesters.length === 0 && (
          <div className="text-center py-12 text-amber-300/70">
            No beta testers found
          </div>
        )}
      </div>

      {/* Add Beta Tester Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-amber-100 mb-4">Add Beta Tester</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-300 mb-1">Name</label>
                <input
                  type="text"
                  value={newTester.name}
                  onChange={(e) => setNewTester({ ...newTester, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-amber-500/30 text-amber-100 rounded-lg focus:outline-none focus:border-amber-500"
                  placeholder="Tester name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newTester.email}
                  onChange={(e) => setNewTester({ ...newTester, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-amber-500/30 text-amber-100 rounded-lg focus:outline-none focus:border-amber-500"
                  placeholder="tester@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-300 mb-1">Access Tier</label>
                <select
                  value={newTester.tier}
                  onChange={(e) => setNewTester({ ...newTester, tier: e.target.value as 'subscriber' | 'premium' })}
                  className="w-full px-3 py-2 bg-slate-800 border border-amber-500/30 text-amber-100 rounded-lg focus:outline-none focus:border-amber-500"
                >
                  <option value="subscriber">Subscriber (Basic Pro)</option>
                  <option value="premium">Premium (Full Access)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-300 mb-1">Duration (days)</label>
                <input
                  type="number"
                  value={newTester.duration}
                  onChange={(e) => setNewTester({ ...newTester, duration: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-amber-500/30 text-amber-100 rounded-lg focus:outline-none focus:border-amber-500"
                  min="1"
                  max="365"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-300 mb-1">Notes (optional)</label>
                <textarea
                  value={newTester.notes}
                  onChange={(e) => setNewTester({ ...newTester, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-amber-500/30 text-amber-100 rounded-lg focus:outline-none focus:border-amber-500"
                  rows={2}
                  placeholder="Additional notes about this tester..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={addBetaTester}
                className="flex-1 py-2 bg-amber-600 text-amber-50 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Add Tester
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-amber-500/40 text-amber-300 rounded-lg hover:bg-amber-500/10"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}