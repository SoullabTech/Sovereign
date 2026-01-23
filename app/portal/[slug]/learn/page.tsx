"use client";

/**
 * LEARN / EDUCATION PAGE
 *
 * Cosmic, celestial aesthetic - Starlight Muse theme
 * Articles, guides, and educational content
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  ArrowRight,
  Sparkles,
  Star,
  Search,
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url?: string;
  category?: string;
  tags?: string[];
  reading_time_minutes?: number;
  featured?: boolean;
  published_at: string;
}

export default function LearnPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Cosmic Starlight Muse palette - high contrast
  const colors = {
    void: '#0D0B14',
    cosmos: '#1A1625',
    nebula: '#251F33',
    stardust: '#2D2640',
    cardBg: 'rgba(45, 38, 64, 0.6)',
    gold: '#E5C158',
    violet: '#B8A5D9',
    starlight: '#FFFFFF',
    muted: '#D0C5E8',
    dim: '#A99DC4',
    border: '#4A3D5C',
  };

  useEffect(() => {
    fetchArticles();
  }, [slug]);

  const fetchArticles = async () => {
    try {
      const response = await fetch(`/api/portal/${slug}/articles`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticles = filteredArticles.filter(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8" style={{ color: colors.gold }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
            <BookOpen className="w-6 h-6" style={{ color: colors.gold }} />
            <div className="h-px w-12" style={{ backgroundColor: colors.border }} />
          </div>

          <h1
            className="font-display text-4xl md:text-5xl tracking-wide mb-4"
            style={{ color: colors.starlight }}
          >
            Learn
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: colors.muted }}
          >
            Explore the mysteries of the cosmos through articles, guides, and celestial wisdom
          </p>
        </motion.div>
      </div>

      {/* Search & Filters */}
      {articles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: colors.dim }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-12 pr-5 py-3.5 rounded-xl text-base outline-none transition-all font-medium"
              style={{
                backgroundColor: colors.stardust,
                border: `1px solid ${colors.border}`,
                color: colors.starlight,
              }}
            />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={{
                  backgroundColor: !selectedCategory ? colors.gold : 'transparent',
                  color: !selectedCategory ? colors.void : colors.muted,
                  border: `1px solid ${!selectedCategory ? colors.gold : colors.border}`,
                }}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category || null)}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all capitalize"
                  style={{
                    backgroundColor: selectedCategory === category ? colors.gold : 'transparent',
                    color: selectedCategory === category ? colors.void : colors.muted,
                    border: `1px solid ${selectedCategory === category ? colors.gold : colors.border}`,
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Star className="w-5 h-5" style={{ color: colors.gold }} />
            <span
              className="text-xs uppercase tracking-widest font-semibold"
              style={{ color: colors.gold }}
            >
              Featured
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {featuredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Link href={`/portal/${slug}/learn/${article.slug}`}>
                  <div
                    className="group rounded-3xl overflow-hidden backdrop-blur-xl transition-all hover:scale-[1.02]"
                    style={{
                      background: `linear-gradient(135deg, rgba(229, 193, 88, 0.15), ${colors.cardBg})`,
                      border: `2px solid ${colors.gold}`,
                    }}
                  >
                    {article.cover_image_url && (
                      <div
                        className="h-48 bg-cover bg-center"
                        style={{ backgroundImage: `url(${article.cover_image_url})` }}
                      />
                    )}
                    <div className="p-6">
                      {article.category && (
                        <span
                          className="text-xs uppercase tracking-widest font-semibold"
                          style={{ color: colors.gold }}
                        >
                          {article.category}
                        </span>
                      )}
                      <h3
                        className="font-display text-xl mt-2 mb-3 group-hover:text-white transition-colors"
                        style={{ color: colors.starlight }}
                      >
                        {article.title}
                      </h3>
                      <p className="text-sm leading-relaxed line-clamp-2" style={{ color: colors.muted }}>
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
                        <div className="flex items-center space-x-4 text-xs" style={{ color: colors.dim }}>
                          {article.reading_time_minutes && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{article.reading_time_minutes} min read</span>
                            </div>
                          )}
                          <span>{formatDate(article.published_at)}</span>
                        </div>
                        <ArrowRight
                          className="w-5 h-5 transition-transform group-hover:translate-x-1"
                          style={{ color: colors.gold }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Articles */}
      {regularArticles.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularArticles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Link href={`/portal/${slug}/learn/${article.slug}`}>
                <div
                  className="group h-full rounded-2xl overflow-hidden backdrop-blur-xl transition-all hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${colors.cardBg}, rgba(184, 165, 217, 0.1))`,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {article.cover_image_url && (
                    <div
                      className="h-40 bg-cover bg-center"
                      style={{ backgroundImage: `url(${article.cover_image_url})` }}
                    />
                  )}
                  <div className="p-5">
                    {article.category && (
                      <span
                        className="text-xs uppercase tracking-widest font-semibold"
                        style={{ color: colors.violet }}
                      >
                        {article.category}
                      </span>
                    )}
                    <h3
                      className="font-display text-lg mt-2 mb-2 group-hover:text-white transition-colors"
                      style={{ color: colors.starlight }}
                    >
                      {article.title}
                    </h3>
                    <p className="text-sm leading-relaxed line-clamp-2" style={{ color: colors.muted }}>
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: `1px solid ${colors.border}` }}>
                      <div className="flex items-center space-x-1 text-xs" style={{ color: colors.dim }}>
                        <Clock className="w-4 h-4" />
                        <span>{article.reading_time_minutes || 5} min</span>
                      </div>
                      <ArrowRight
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                        style={{ color: colors.violet }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredArticles.length === 0 && (
        <div
          className="rounded-3xl p-16 text-center backdrop-blur-xl"
          style={{
            background: `linear-gradient(135deg, ${colors.cardBg}, rgba(184, 165, 217, 0.1))`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <BookOpen className="w-16 h-16 mx-auto mb-6" style={{ color: colors.violet }} />
          <h3
            className="font-display text-2xl tracking-wide mb-3"
            style={{ color: colors.starlight }}
          >
            {searchQuery || selectedCategory ? 'No Articles Found' : 'Wisdom Coming Soon'}
          </h3>
          <p style={{ color: colors.muted }}>
            {searchQuery || selectedCategory
              ? 'Try adjusting your search or filters.'
              : 'Educational content is being written under the stars. Check back soon.'}
          </p>
        </div>
      )}

      {/* Cosmic Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center py-8"
      >
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="h-px w-16" style={{ backgroundColor: colors.border }} />
          <Sparkles className="w-5 h-5" style={{ color: colors.gold }} />
          <div className="h-px w-16" style={{ backgroundColor: colors.border }} />
        </div>
        <p className="italic font-medium" style={{ color: colors.muted }}>
          "Knowledge is starlight — the more you gather, the brighter your path becomes."
        </p>
      </motion.div>
    </div>
  );
}
