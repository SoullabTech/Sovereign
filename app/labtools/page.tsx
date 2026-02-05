'use client';

/**
 * My Lab - Personal Tool Dashboard
 *
 * "Soullab outfits individuals and groups with tools
 * for conscious evolution and exploration—for discoveries
 * and advancements."
 *
 * This is not a settings page. It's a workshop.
 * Each tool is an instrument. Each category is a drawer
 * you can open to find what you need.
 *
 * The vibe: serious play. Soulful exploration.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Plus, Compass } from 'lucide-react';
import { useMemberTools } from '@/hooks/useMemberTools';
import { CategorySection } from '@/components/labtools/CategorySection';
import { type ToolCategory } from '@/config/toolRegistry';

export default function MyLabPage() {
  const router = useRouter();
  const { categories, isLoading, error, toggleCategory } = useMemberTools();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBack = () => {
    router.push('/maia');
  };

  const handleDiscover = () => {
    router.push('/labtools/discover');
  };

  const handleToggleCategory = (category: string) => {
    toggleCategory(category as ToolCategory);
  };

  // Count total tools
  const totalTools = categories.reduce((sum, cat) => sum + cat.tools.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-white/[0.03] border border-white/[0.06]
                     text-white/70 hover:text-white hover:bg-white/[0.06]
                     transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">MAIA</span>
          </button>

          {/* Discover button */}
          <motion.button
            onClick={handleDiscover}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-[#D4B896]/10 border border-[#D4B896]/20
                     text-[#D4B896] hover:bg-[#D4B896]/20
                     transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Discover</span>
          </motion.button>
        </div>

        {/* Main Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          {/* Lab icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 mb-4
                     rounded-2xl bg-gradient-to-br from-[#D4B896]/20 to-[#D4B896]/5
                     border border-[#D4B896]/20"
          >
            <span className="text-3xl">🧬</span>
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            My Lab
          </h1>

          <p className="text-white/50 max-w-md mx-auto">
            Your instruments for conscious exploration.
            {totalTools > 0 && (
              <span className="text-[#D4B896]/70">
                {' '}
                {totalTools} tools ready.
              </span>
            )}
          </p>
        </motion.div>

        {/* Loading state */}
        <AnimatePresence mode="wait">
          {isLoading && !mounted ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Compass className="w-8 h-8 text-[#D4B896]/50" />
              </motion.div>
              <p className="text-white/40 mt-4 text-sm">Preparing your workshop...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-red-400/70">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:text-white"
              >
                Try again
              </button>
            </motion.div>
          ) : categories.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6
                           rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <Sparkles className="w-8 h-8 text-white/30" />
              </div>
              <h2 className="text-xl font-medium text-white/80 mb-2">
                Your workshop awaits
              </h2>
              <p className="text-white/50 mb-6 max-w-sm mx-auto">
                Discover tools for reflection, divination, training, and more.
              </p>
              <motion.button
                onClick={handleDiscover}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                         bg-[#D4B896]/10 border border-[#D4B896]/20
                         text-[#D4B896] hover:bg-[#D4B896]/20
                         transition-all font-medium"
              >
                <Plus className="w-5 h-5" />
                Discover Tools
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="categories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {categories.map((category, idx) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <CategorySection
                    category={category}
                    onToggleCollapsed={handleToggleCategory}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Discover more footer */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <button
              onClick={handleDiscover}
              className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl
                       bg-gradient-to-r from-white/[0.02] to-white/[0.04]
                       border border-white/[0.06] hover:border-[#D4B896]/20
                       text-white/60 hover:text-white/80
                       transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4B896]/10 flex items-center justify-center
                           group-hover:bg-[#D4B896]/20 transition-all">
                <Sparkles className="w-5 h-5 text-[#D4B896]" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-white/80">
                  Discover more tools
                </div>
                <div className="text-xs text-white/40">
                  Explore oracles, training protocols, and more
                </div>
              </div>
            </button>
          </motion.div>
        )}

        {/* Footer wisdom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center pb-8"
        >
          <p className="text-xs text-white/30 max-w-md mx-auto leading-relaxed">
            Tools for conscious evolution and exploration.
            For discoveries and advancements.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
