'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Trash2, Shield, Database, MessageSquare, Brain, Settings, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DataSummary {
  memberId: string;
  memberSince: string | null;
  conversations: {
    totalSessions: number;
    totalMessages: number;
    oldestSession: string | null;
    newestSession: string | null;
  };
  patterns: {
    recognized: number;
    themes: string[];
  };
  settings: {
    personalPreferences: boolean;
    elementalProfile: boolean;
    journalEntries: number;
  };
  storage: {
    estimatedSizeKB: number;
  };
}

export default function YourDataPage() {
  const router = useRouter();
  const [data, setData] = useState<DataSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDataSummary();
  }, []);

  const fetchDataSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/member/data-summary');
      if (!response.ok) {
        throw new Error('Failed to fetch data summary');
      }
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'markdown') => {
    if (!data) return;
    setExporting(true);
    try {
      const response = await fetch(
        `/api/conversations/export?userId=${data.memberId}&format=${format}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `maia-data-${new Date().toISOString().split('T')[0]}.${format === 'json' ? 'json' : 'md'}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== 'DELETE ALL MY DATA') return;
    setDeleting(true);
    try {
      const response = await fetch('/api/sovereignty/delete-my-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmPhrase: 'DELETE ALL MY DATA',
          reason: 'User requested deletion from Your Data page'
        })
      });
      if (response.ok) {
        // Clear local storage and redirect
        localStorage.clear();
        router.push('/');
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition-all"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-white text-lg font-medium">Your Data</h1>
            <p className="text-white/50 text-sm">What MAIA knows about you</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Sovereignty Promise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-teal-500/10 border border-teal-500/20 rounded-2xl"
        >
          <div className="flex items-start gap-4">
            <Shield className="text-teal-400 mt-1" size={24} />
            <div>
              <h2 className="text-teal-300 font-medium mb-2">Sovereignty Promise</h2>
              <p className="text-white/70 text-sm leading-relaxed">
                You own this data. MAIA holds it to serve you, not to capture you.
                Export everything or delete it all anytime. No questions, no friction.
              </p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="text-white/40 animate-spin" size={32} />
          </div>
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchDataSummary}
              className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-white/70 hover:bg-white/20"
            >
              Try Again
            </button>
          </div>
        ) : data ? (
          <>
            {/* Data Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {/* Conversations */}
              <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="text-amber-400" size={20} />
                  <h3 className="text-white font-medium">Conversations</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/40">Sessions</p>
                    <p className="text-white text-lg">{data.conversations.totalSessions}</p>
                  </div>
                  <div>
                    <p className="text-white/40">Messages</p>
                    <p className="text-white text-lg">{data.conversations.totalMessages}</p>
                  </div>
                  <div>
                    <p className="text-white/40">First conversation</p>
                    <p className="text-white/70">{formatDate(data.conversations.oldestSession)}</p>
                  </div>
                  <div>
                    <p className="text-white/40">Latest conversation</p>
                    <p className="text-white/70">{formatDate(data.conversations.newestSession)}</p>
                  </div>
                </div>
              </div>

              {/* Patterns */}
              <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="text-purple-400" size={20} />
                  <h3 className="text-white font-medium">Patterns Recognized</h3>
                </div>
                <p className="text-white/70 text-sm">
                  {data.patterns.recognized > 0
                    ? `${data.patterns.recognized} patterns identified across your sessions`
                    : 'Patterns emerge over time as you share with MAIA'}
                </p>
                {data.patterns.themes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {data.patterns.themes.map((theme, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                        {theme}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings & Profile */}
              <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="text-blue-400" size={20} />
                  <h3 className="text-white font-medium">Profile & Settings</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/40">Personal preferences</span>
                    <span className="text-white/70">{data.settings.personalPreferences ? 'Set' : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Elemental profile</span>
                    <span className="text-white/70">{data.settings.elementalProfile ? 'Set' : 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Journal entries</span>
                    <span className="text-white/70">{data.settings.journalEntries}</span>
                  </div>
                </div>
              </div>

              {/* Storage */}
              <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="text-green-400" size={20} />
                  <h3 className="text-white font-medium">Storage</h3>
                </div>
                <div className="text-sm">
                  <p className="text-white/40">Estimated size</p>
                  <p className="text-white text-lg">
                    {data.storage.estimatedSizeKB < 1024
                      ? `${data.storage.estimatedSizeKB} KB`
                      : `${(data.storage.estimatedSizeKB / 1024).toFixed(1)} MB`}
                  </p>
                  <p className="text-white/40 mt-2">Member since</p>
                  <p className="text-white/70">{formatDate(data.memberSince)}</p>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4 pt-4"
            >
              {/* Export */}
              <div className="p-5 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Download size={18} />
                  Export Your Data
                </h3>
                <p className="text-white/50 text-sm mb-4">
                  Download everything MAIA knows about you in a readable format.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleExport('markdown')}
                    disabled={exporting}
                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-50"
                  >
                    {exporting ? 'Exporting...' : 'Export as Markdown'}
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    disabled={exporting}
                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-50"
                  >
                    {exporting ? 'Exporting...' : 'Export as JSON'}
                  </button>
                </div>
              </div>

              {/* Delete */}
              <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-xl">
                <h3 className="text-red-300 font-medium mb-3 flex items-center gap-2">
                  <Trash2 size={18} />
                  Delete All Data
                </h3>
                <p className="text-white/50 text-sm mb-4">
                  Permanently delete everything MAIA knows about you. This cannot be undone.
                </p>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all"
                  >
                    Delete My Data
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-white/60 text-sm">
                      Type <span className="text-red-300 font-mono">DELETE ALL MY DATA</span> to confirm:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE ALL MY DATA"
                      className="w-full px-4 py-2.5 bg-black/30 border border-red-500/30 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-red-500/50"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText('');
                        }}
                        className="flex-1 py-2.5 bg-white/10 text-white/70 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleteConfirmText !== 'DELETE ALL MY DATA' || deleting}
                        className="flex-1 py-2.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting ? 'Deleting...' : 'Confirm Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        ) : null}
      </main>
    </div>
  );
}
