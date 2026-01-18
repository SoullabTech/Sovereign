"use client";

/**
 * INDIVIDUAL ARTICLE PAGE
 *
 * Cosmic, celestial aesthetic - Starlight Muse theme
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Tag,
  Sparkles,
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url?: string;
  category?: string;
  tags?: string[];
  reading_time_minutes?: number;
  published_at: string;
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const articleSlug = params.articleSlug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
    fetchArticle();
  }, [slug, articleSlug]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/portal/${slug}/articles/${articleSlug}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data.article);
      } else if (response.status === 404) {
        setNotFound(true);
      }
    } catch (err) {
      console.error('Failed to load article:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Simple markdown-like rendering for content
  const renderContent = (content: string) => {
    // Split by double newlines for paragraphs
    const paragraphs = content.split(/\n\n+/);

    return paragraphs.map((para, i) => {
      // Check for headers
      if (para.startsWith('## ')) {
        return (
          <h2
            key={i}
            className="font-display text-2xl tracking-wide mt-10 mb-4"
            style={{ color: colors.starlight }}
          >
            {para.replace('## ', '')}
          </h2>
        );
      }
      if (para.startsWith('### ')) {
        return (
          <h3
            key={i}
            className="font-display text-xl tracking-wide mt-8 mb-3"
            style={{ color: colors.starlight }}
          >
            {para.replace('### ', '')}
          </h3>
        );
      }

      // Check for bullet lists
      if (para.includes('\n- ')) {
        const lines = para.split('\n');
        return (
          <ul key={i} className="list-none space-y-2 my-6">
            {lines.map((line, j) => {
              if (line.startsWith('- ')) {
                return (
                  <li key={j} className="flex items-start space-x-3">
                    <span style={{ color: colors.gold }}>✦</span>
                    <span style={{ color: colors.muted }}>{line.replace('- ', '')}</span>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        );
      }

      // Regular paragraph
      return (
        <p
          key={i}
          className="leading-relaxed mb-6"
          style={{ color: colors.muted }}
        >
          {para}
        </p>
      );
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

  if (notFound || !article) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl mb-4" style={{ color: colors.starlight }}>
            Article Not Found
          </h2>
          <Link
            href={`/portal/${slug}/learn`}
            className="inline-flex items-center space-x-2 transition-colors hover:text-white"
            style={{ color: colors.gold }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Learn</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Link */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          href={`/portal/${slug}/learn`}
          className="inline-flex items-center space-x-2 text-sm font-medium transition-colors hover:text-white"
          style={{ color: colors.violet }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Learn</span>
        </Link>
      </motion.div>

      {/* Article Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        {article.category && (
          <span
            className="text-xs uppercase tracking-widest font-semibold"
            style={{ color: colors.gold }}
          >
            {article.category}
          </span>
        )}

        <h1
          className="font-display text-3xl md:text-4xl lg:text-5xl tracking-wide mt-3 mb-6"
          style={{ color: colors.starlight }}
        >
          {article.title}
        </h1>

        <p className="text-lg leading-relaxed mb-6" style={{ color: colors.muted }}>
          {article.excerpt}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: colors.dim }}>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(article.published_at)}</span>
          </div>
          {article.reading_time_minutes && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{article.reading_time_minutes} min read</span>
            </div>
          )}
        </div>
      </motion.header>

      {/* Cover Image */}
      {article.cover_image_url && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 rounded-2xl overflow-hidden"
        >
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="w-full h-auto"
          />
        </motion.div>
      )}

      {/* Article Content */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="prose prose-invert max-w-none"
      >
        {renderContent(article.content)}
      </motion.article>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 pt-8"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="w-4 h-4" style={{ color: colors.dim }} />
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: colors.dim }}>
              Topics
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: colors.stardust,
                  color: colors.muted,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Cosmic Quote Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center py-12 mt-12"
      >
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="h-px w-16" style={{ backgroundColor: colors.border }} />
          <Sparkles className="w-5 h-5" style={{ color: colors.gold }} />
          <div className="h-px w-16" style={{ backgroundColor: colors.border }} />
        </div>
        <Link
          href={`/portal/${slug}/learn`}
          className="inline-flex items-center space-x-2 font-medium transition-colors hover:text-white"
          style={{ color: colors.gold }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore More Wisdom</span>
        </Link>
      </motion.div>
    </div>
  );
}
