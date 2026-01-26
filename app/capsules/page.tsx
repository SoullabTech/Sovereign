'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Trash2, Clock, Sparkles, Filter, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  getCapsules,
  toggleFavorite,
  deleteCapsule,
  recordReflection,
  type Capsule
} from '@/lib/capsules/CapsuleService';

export default function CapsulesPage() {
  const router = useRouter();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setCapsules(getCapsules());
  }, []);

  const filteredCapsules = capsules
    .filter(c => filter === 'all' || c.isFavorite)
    .filter(c =>
      searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.insight.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.themes.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavorite(id);
    if (updated) {
      setCapsules(getCapsules());
    }
  };

  const handleDelete = (id: string) => {
    if (deleteCapsule(id)) {
      setCapsules(getCapsules());
      setDeleteConfirm(null);
    }
  };

  const handleExpand = (id: string) => {
    if (expandedId !== id) {
      recordReflection(id);
    }
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const elementColors: Record<string, string> = {
    fire: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
    water: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    earth: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    air: 'from-purple-500/20 to-violet-500/20 border-purple-500/30',
    aether: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
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
            <h1 className="text-white text-lg font-medium flex items-center gap-2">
              <Sparkles size={20} className="text-amber-400" />
              Wisdom Capsules
            </h1>
            <p className="text-white/50 text-sm">Conversations become wisdom</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              type="text"
              placeholder="Search capsules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20"
            />
          </div>
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
                filter === 'all'
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('favorites')}
              className={`px-4 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 ${
                filter === 'favorites'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              <Star size={14} />
              Favorites
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredCapsules.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Sparkles className="mx-auto text-amber-400/50 mb-4" size={48} />
            <h2 className="text-white/80 text-lg mb-2">
              {filter === 'favorites' ? 'No favorite capsules yet' : 'No capsules yet'}
            </h2>
            <p className="text-white/40 text-sm max-w-xs mx-auto">
              {filter === 'favorites'
                ? 'Star capsules to add them to your favorites'
                : 'Capsules are created from meaningful moments in your conversations with MAIA'}
            </p>
          </motion.div>
        )}

        {/* Capsules List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredCapsules.map((capsule, index) => (
              <motion.div
                key={capsule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className={`relative rounded-2xl border overflow-hidden cursor-pointer bg-gradient-to-br ${
                  capsule.element
                    ? elementColors[capsule.element]
                    : 'from-white/5 to-white/[0.02] border-white/10'
                }`}
                onClick={() => handleExpand(capsule.id)}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-medium pr-8">{capsule.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                        <Clock size={12} />
                        {formatDate(capsule.createdAt)}
                        {capsule.reflectionCount > 0 && (
                          <span className="text-white/30">
                            · Reflected {capsule.reflectionCount}x
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(capsule.id);
                      }}
                      className="p-1.5 -m-1.5 hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Star
                        size={18}
                        className={capsule.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-white/30'}
                      />
                    </button>
                  </div>

                  {/* Insight */}
                  <p className={`text-white/80 text-sm leading-relaxed ${
                    expandedId !== capsule.id ? 'line-clamp-2' : ''
                  }`}>
                    {capsule.insight}
                  </p>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedId === capsule.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-white/10"
                      >
                        {capsule.context && (
                          <p className="text-white/50 text-xs mb-3 italic">
                            {capsule.context}
                          </p>
                        )}

                        {/* Themes */}
                        {capsule.themes.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {capsule.themes.map((theme) => (
                              <span
                                key={theme}
                                className="px-2.5 py-1 bg-white/10 text-white/60 text-xs rounded-full"
                              >
                                {theme}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Delete */}
                        {deleteConfirm === capsule.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-white/50 text-xs">Delete this capsule?</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(capsule.id);
                              }}
                              className="px-3 py-1 bg-red-500/20 text-red-300 text-xs rounded-lg"
                            >
                              Yes, delete
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(null);
                              }}
                              className="px-3 py-1 bg-white/10 text-white/50 text-xs rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(capsule.id);
                            }}
                            className="flex items-center gap-1.5 text-white/30 hover:text-red-300 text-xs transition-all"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Stats */}
        {capsules.length > 0 && (
          <div className="pt-8 text-center">
            <p className="text-white/30 text-sm">
              {capsules.length} capsule{capsules.length !== 1 ? 's' : ''} ·{' '}
              {capsules.filter(c => c.isFavorite).length} favorite{capsules.filter(c => c.isFavorite).length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
