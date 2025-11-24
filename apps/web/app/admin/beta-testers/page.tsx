'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Calendar, CheckCircle, Clock, User } from 'lucide-react';

/**
 * Beta Testers Admin Page
 *
 * Manage beta tester invitations and track status
 */
export default function BetaTestersPage() {
  const [testers, setTesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTesters();
  }, []);

  async function fetchTesters() {
    try {
      const response = await fetch('/api/admin/beta-testers');
      const data = await response.json();
      setTesters(data);
    } catch (error) {
      console.error('Failed to fetch testers:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'invited':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'completed':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      default:
        return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'invited':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white/80" />
          <p className="text-sm text-white/60 mt-4">Loading beta testers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-white mb-2">Beta Testers</h1>
          <p className="text-white/60">First dreamers building with us</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              {testers.filter(t => t.status === 'invited').length}
            </div>
            <div className="text-sm text-white/50">Invited</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {testers.filter(t => t.status === 'active').length}
            </div>
            <div className="text-sm text-white/50">Active</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              {testers.length}
            </div>
            <div className="text-sm text-white/50">Total</div>
          </div>
        </div>

        {/* Testers List */}
        <div className="space-y-3">
          {testers.map((tester, index) => (
            <motion.div
              key={tester.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                    {tester.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{tester.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                      <Mail className="w-4 h-4" />
                      <span>{tester.email}</span>
                    </div>
                    {tester.notes && (
                      <p className="text-sm text-white/40 mt-2 italic">{tester.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs ${getStatusColor(tester.status)}`}>
                    {getStatusIcon(tester.status)}
                    <span className="capitalize">{tester.status}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/40">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(tester.invitedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  {tester.inviteCode && (
                    <div className="text-xs text-white/40 font-mono">
                      Code: {tester.inviteCode}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {testers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/40">No beta testers yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
